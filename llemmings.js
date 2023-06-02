"use strict";
var Llemmings = (function () {
    let EDITOR_MODE = false;

    // Debug
    let __DEBUG__ = false;
  
    const RESOLUTION_X = 800;
    const RESOLUTION_Y = 600;

    // Set up canvas (+related)
    let canvas, ctx;        // set by init().
    const offScreenCanvas = document.createElement('canvas');
    let background;         // background offscreen canvas context

    // Kept around for clean-up reasons
    let reqAnimFrameId = null;
    let canvasEventsListening = false;
    const gameIntervals = {};
    const gameTimeouts = {};
    const openScreens = new Map();

    // World settings
    let lastLemmingId = 0;

    const WATER_HEIGHT = 70;

    // Human: Added this to call dynamic things from update() loop.
    const effectsToUpdate = new Map();

    // Game-play related
    let isPaused = false;
    const lemmings = [];
    let levelData;
    let scoreKeeper = null;
    let doneSpawning = false;
    let playing = false;
    let autoPlaying = null;  // set to true to automatically use a provided solution (if it exists)
    let levelDataResources = null;

    // Sprites
    const bitmaps = {};   // kept intact between levels so we don't have to re-generate all the time
    const sprites = [];           // cleared between levels

    // Game settings
    // TODO: Store in local storage (like keybindings)
    let settings = {
      soundEffects : false
    }

    // Human: scoreKeeper keeps track of score for current level, this will keep
    //        track of it between levels -- it gets updated only on completion or 
    //        failure of a level.
    // >>> Prompt: instructions/serialization-localstorage.0001.txt
    let persisted = null;
    const persistedDefaults = {
      currentLevel : 1,
      currentLevelAttempts : 0,
      levelScores : [ 0 ],
    };

    // FPS related
    const FPS = 60; // Set the desired FPS
    let frameInterval = 1000 / FPS; // Calculate the interval in milliseconds
    let lastFrameUpdate = 0;
    let lastFrameUpdateReal = 0;    // Without subtracting modulo-time
    let elapsedLevelTime = 0;

    // Fade
    let canvasOpacity = 0;  // Initialize the opacity to 0
    let canvasFadeDirection = null;

    // ECS (for enemies + other objects)
    let ecs;

    function getDefaultLevelData(givenLevel = {})
    {
      return {
        level : givenLevel.level ?? -1,
        name : givenLevel.name || "Noname",
        seed : givenLevel.seed || Date.now(),
        disableGame : givenLevel.disableGame ?? false,
        autoPlay : givenLevel.autoPlay ?? false,
        unlimitedResources : givenLevel.unlimitedResources ?? false,
        gradients : givenLevel.gradients || [
          {
            type: 'linear',
            x0: 0,
            y0: 0,
            x1: 0,
            y1: 600,
            stops: [
              { offset: 0, color: 'black' },
              { offset: 1, color: '#000066' }
            ]
          }
        ],
        shapes : givenLevel.shapes || [
          {
            "type": "rectangle",
            "filled": true,
            "color": `rgb(${World.waterColorBytes.join(",")})`,
            "lineWidth": 1,
            "x1": 0,
            "y1": RESOLUTION_Y - WATER_HEIGHT,
            "x2": RESOLUTION_X,
            "y2": RESOLUTION_Y 
          }
        ],
        decorations : givenLevel.decorations || [
          {
            type: "organics",
            location: ["top"],
          }
        ],
        spawnInterval : givenLevel.spawnInterval || 100,
        resources : {
            lemmings : givenLevel.resources?.lemmings || 5,
            time : givenLevel.resources?.time || 120 * 1000,

            Climber : givenLevel.resources?.Climber || 0,
            Floater : givenLevel.resources?.Floater || 0,
            Bomber : givenLevel.resources?.Bomber || 0,
            Blocker : givenLevel.resources?.Blocker || 0,
            Builder : givenLevel.resources?.Builder || 0,
            Basher : givenLevel.resources?.Basher || 0,
            Miner : givenLevel.resources?.Miner || 0,
            Digger : givenLevel.resources?.Digger || 0,
        },
        ui : {
          showScore : givenLevel.ui?.showScore ?? true,
          showActions : givenLevel.ui?.showActions ?? true,
          showObjective : givenLevel.ui?.showObjective ?? true,
          showStartGame : givenLevel.ui?.showStartGame ?? false,
          showSettings : givenLevel.ui?.showSettings ?? false,
          showFCT :  givenLevel.ui?.showFCT ?? true,
        },
        solution : givenLevel.solution || { },
        goal : {
          survivors : givenLevel.goal?.survivors || 5
        },
        objects : givenLevel.objects || [],
        start : givenLevel.start || { x : 60, y : -20, radius : 50, clear: false },
        finish : givenLevel.finish || { x : RESOLUTION_X - 50, y : RESOLUTION_Y - WATER_HEIGHT - 50 - 10, radius : 50, clear: true },
      };      
    }
    

    function isPlaying()
    {
      return playing;
    }

    function isAutoPlaying()
    {
      return autoPlaying;
    }

    // Create a new lemming and add it to the array of lemmings
    // HUMAN: This is just for easy testing for now.
    // HUMAN: This could be used to 'cheat' as this method will only be called
    //        at a fixed interval, so you could probably delay spawns by repeatedly
    //        toggling pause. Spawning should be done in the update(). For now, I
    //        don't care.
    function spawnLemming()
    {
      if(isPaused || doneSpawning) {
        return;
      }

      let spawned = false;
      for(let i = 0; i < lemmings.length; i++) {
        if(!lemmings[i].isSpawned) {
          lemmings[i].isSpawned = true;
          spawned = true;
          playSoundEffect("BD-0.25");
          break;
        }
      }

      if(!spawned) {
        doneSpawning = true;
        console.log("Done spawning lemmings");
      }
    }

    function playSoundEffect(name)
    {
      if(!settings.soundEffects) {
        return;
      }

      AudioSamples.playSample(name);
    }

    function getBitmap(name)
    {
      return bitmaps[name];
    }

    function createLemmings(amount)
    {
      for(let i = 0; i < amount; i++) {
        const newLemming = new Llemming.Lemming();
        newLemming.id = ++lastLemmingId;
        newLemming.velX = newLemming.maxVelX; // Walk to the right by default
  
        if (levelData.start.x === null) {
          newLemming.x = Math.random() * canvas.width; // Start at a random x location
        } else {
          newLemming.x = levelData.start.x;
        }
  
        if (levelData.start.y === null) {
          newLemming.y = Math.random() * (canvas.height - 100);
        } else {
          newLemming.y = levelData.start.y;
        }
  
        lemmings.push(newLemming);
      }
    }

  
    // >>> Prompt: instructions/main-loop.0002.txt
    function togglePause()
    {
      isPaused = !isPaused;
    }

    function toggleSetting(setting)
    {
      settings[setting] = !settings[setting];
      LlemmingsFCT.spawnCombatText("Sound effects " + (settings[setting] ? "on" : "off") );
    }
  
    function setBackgroundBuffer()
    {
      background.drawImage(canvas, 0, 0);
    }

    function fadeInCanvas()
    {
      if(canvasOpacity >= 1) {
        canvasOpacity = 1;
        canvas.style.opacity = canvasOpacity;
        canvasFadeDirection = null;
        return;        
      }
      canvasOpacity += 0.02;
      canvas.style.opacity = canvasOpacity;
    }
    
    function fadeOutCanvas()
    {
      if(canvasOpacity <= 0) {
        canvasOpacity = 0;
        canvas.style.opacity = canvasOpacity;
        canvasFadeDirection = null;
        return;        
      }
      canvasOpacity -= 0.02;
      canvas.style.opacity = canvasOpacity;
    }    
    
    function getOverallScore()
    {
      return persisted.levelScores.reduce((partialSum, a) => partialSum + a, 0);
    }

    function levelCompleted()
    {
      console.log("Success! You beat the level");

      // If we're in editor don't do this stuff
      if(EDITOR_MODE) {
        return;
      }

      // Completion bonuses below.

      // ...extra lemmings
      const extraLemmings = scoreKeeper.getSavedLemmings() - levelData.goal.survivors;
      if(extraLemmings > 0) {
        scoreKeeper.addScore( extraLemmings * 100, "More lemmings" );
      }

      // ...extra resources
      scoreKeeper.addScore(levelDataResources["Climber"] * 50, "Climbing bonus");
      scoreKeeper.addScore(levelDataResources["Floater"] * 50, "Floating bonus");
      scoreKeeper.addScore(levelDataResources["Bomber"] * 50, "Bombing bonus");
      scoreKeeper.addScore(levelDataResources["Blocker"] * 50, "Blocking bonus");
      scoreKeeper.addScore(levelDataResources["Builder"] * 50, "Building bonus");
      scoreKeeper.addScore(levelDataResources["Basher"] * 50, "Bashing bonus");
      scoreKeeper.addScore(levelDataResources["Miner"] * 50, "Mining bonus");
      scoreKeeper.addScore(levelDataResources["Digger"] * 50, "Digging bonus");

      // ...number of attempts needed
      switch(persisted.currentLevelAttempts) {
        case 3 : scoreKeeper.addScore(125, "Attempts 1 bonus"); break;
        case 2 : scoreKeeper.addScore(250, "Attempts 2 bonus"); break;
        case 1 : scoreKeeper.addScore(500, "Attempts 3 bonus"); break;
      }

      // ...time bonus (seconds remaining * 10)
      scoreKeeper.addScore((levelData.resources.time - elapsedLevelTime) / 100, "Time bonus");

      // Store the score for the level (so that it can be improved at a later date)
      persisted.levelScores[levelData.level] = scoreKeeper.getScore();

      console.log("Score details:", scoreKeeper.getScoreInfo());
      console.log("Level score:", scoreKeeper.getScore());
      console.log("Overall score:", getOverallScore());

      if(levelData.level === persisted.currentLevel) {
        if(LlemmingsLevels.length <= (levelData.level + 1)) {
          // We also completed the entire game
          console.log("Winner! You finished the game too!");
        } else {
          // Progress to next level
          persisted.currentLevel++;
        }
      } else {
        console.warn("Not adding to currentLevel as levelData.level does not match persisted.currentLevel (probably dev-mode)");
      }

      // Save to local storage
      GameUtils.saveToLocalStorage('persisted', persisted);

      TextEffectMorph.init({
        text : "SUCCESS!",
        placeOverCanvas:canvas,
        onAnimationDone: () => effectsToUpdate.delete("TextEffectMorph")
      });
      effectsToUpdate.set("TextEffectMorph", TextEffectMorph);

      openScreens.set("scoreScreen", new LlemmingsScore.Screen(scoreKeeper, levelData));
      gameTimeouts["successFadeout"] = setTimeout(() => {
        canvasFadeDirection = "out";
        openScreens.get("scoreScreen").show();
      }, 5000);
    }

    function levelFailed()
    {
      console.log("Aww. Game over");

      if(!EDITOR_MODE) {
        canvasFadeDirection = "out";

        TextEffectMorph.cleanUp();
        TextEffectMorph.init({
          text : "GAME OVER",
          placeOverCanvas:canvas,
          onAnimationDone: () => effectsToUpdate.delete("TextEffectMorph")
        });
        effectsToUpdate.set("TextEffectMorph", TextEffectMorph);
      }
    }

    function getLemmingsRemaining()
    {
      let remaining = 0;
      for(let i = 0; i < lemmings.length; i++) {
        if(lemmings[i].action !== "Blocker" && lemmings[i].isDead === false) {
            remaining++;
        }
      }

      return remaining;
    }

    // Human: This is very inefficient, but it is used rarely and only in init().
    function clearSquare(x, y, radius)
    {
      const clrHalfRad = radius / 2;

      let mix = Math.max(0, x - clrHalfRad);
      let max = Math.min(canvas.width, x + clrHalfRad);
      let miy = Math.max(0, y - clrHalfRad);
      let may = Math.min(canvas.height, y + clrHalfRad);

      for(let x = mix; x < max; x++) {
        for(let y = miy; y < may; y++) {
          World.clearPixel(x, y);
        }
      }
    }

    function setupStartFinish()
    {
      if(levelData.start.x === null || !levelData.start.clear) {
        // debug: random on x axis -- clear upper levelData.start.radius/2
        for(let x = 0; x < canvas.width; x++) {
          for(let y = 0; y < (levelData.start.radius/2); y++) {
            World.clearPixel(x, y);
          }
        }
  
      } else if(levelData.start.clear) {
        // clear start zone
        clearSquare(levelData.start.x, levelData.start.y, levelData.start.radius);

        sprites.push(
          new AnimatedSprite(ctx, levelData.start.x - 30, Math.max(0, levelData.start.y), getBitmap("hatch"), { speed : 1, /* default settings */ })
        );
      }

      if(levelData.finish.clear) {
        clearSquare(levelData.finish.x, levelData.finish.y, levelData.finish.radius);
      }

      // Draw platform underneath finish area
      ctx.save();
      ctx.fillStyle = `rgb(${World.rockColorBytes.join(",")})`;
      ctx.fillRect(
          levelData.finish.x - levelData.finish.radius,
          levelData.finish.y + levelData.finish.radius,
          levelData.finish.radius*2,
          10
      );
      ctx.restore();

      // Draw house on top and left side of finish area's platform
      const houseWidth = levelData.finish.radius;
      const houseHeight = levelData.finish.radius;
      // Human: Bug. Why is it drawn slightly above the platform? (added + 3)
      GameUtils.drawSvgOnCanvas(
        LlemmingsArt.getHouse(houseWidth, houseHeight),
        levelData.finish.x + levelData.finish.radius - houseWidth,
        levelData.finish.y + levelData.finish.radius - houseHeight + 3,
        houseWidth,
        houseHeight,
        ctx
      );
    }

    function restartLevel(canvasElt)
    {
      const remember = {
        __DEBUG__ : __DEBUG__
      }

      reset();
      init(canvasElt, levelData, remember.__DEBUG__);
      preStart();
    }

    function exitGame()
    {
      reset();
      init(document.getElementById('canvas'), LlemmingsLevels[0], true);
      preStart();
    }

    async function generateBitmaps()
    {
      // Create bitmap sprites (for now just one!)
      if(!getBitmap("hatch")) {
        bitmaps["hatch"] = await GameUtils.generateAnimationFrames(96, 32, 90, LlemmingsArt.drawHatch);
        console.log("Created animation for hatch");
      }

      if(!getBitmap("6-spiked-star")) {
        const width = 100;
        const height = 100;
        const hw = width / 2;
        const hh = height / 2;
        ctx.filter = "blur(2px)";
        // ctx.filter = "contrast(1.4) sepia(1) drop-shadow(-2px 2px 3px #e81)";    
        // ctx.globalCompositeOperation = "lighten";
        // ctx.shadowBlur = 15;
        // ctx.shadowColor = "white";

        const tempContext = document.createElement('canvas').getContext('2d');

        drawSpikes(tempContext, hw, hh, 22, 60, 6, `rgba(255, 255,255, 1)`, true, false);
        bitmaps["6-spiked-star"] = await extractBitmapFromContext(tempContext, 0, 0, width, height);
        console.log("Created 6-spiked-star");
      }
    }

    function forceDebugIfSet()
    {
      if(document.location.search.includes("?DEBUG")) {
        console.warn("Forcing debug due to location")
        __DEBUG__ = true;
      }
    }

    // >>> Prompt: instructions/optimization-putImageData-prune.0001.txt
    function initBackground()
    {
      // create an offscreen canvas as the buffer for the background
      offScreenCanvas.width = canvas.width;
      offScreenCanvas.height = canvas.height;
      background = offScreenCanvas.getContext('2d');

      // set the buffer with a background color
      background.fillStyle = 'black';
      background.fillRect(0, 0, offScreenCanvas.width, offScreenCanvas.height);      
    }


    function startCanvasEventListeners()
    {
      // >>> Prompt: instructions/selectable.0001.txt
      // add this after declaring canvas and ctx
      canvas.addEventListener('click', (event) => {
        if(levelData.disableGame) {
          return;
        }

        const rect = canvas.getBoundingClientRect();

        // >>> Prompt: instructions/screen-coord-to-canvas.0001.txt
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
      
        const mouseX = (event.clientX - rect.left) * scaleX;
        const mouseY = (event.clientY - rect.top) * scaleY;
  
        let gotOne = false;
        lemmings.forEach((lemming) => {
          if(!gotOne 
              && mouseX >= lemming.x 
              && mouseX <= lemming.x + lemming.width 
              && mouseY >= lemming.y 
              && mouseY <= lemming.y + lemming.height)
          {
            lemming.isSelected = true;
            gotOne = true;
          } else {
            lemming.isSelected = false;
          }
        });
      });

      addEventListener("resize", (event) => {
        if(EDITOR_MODE) {
          return;
        }
        GameUtils.adjustCanvasHeight();
        UI.positionElements(levelData, levelDataResources);
      });
 
      if (__DEBUG__) {
        LlemmingsDebug.addEventListeners(canvas);
      }

      canvasEventsListening = true;
    }

    
    function reset()
    {
        // Stop requestAnimationFrame
        cancelAnimationFrame(reqAnimFrameId);
        reqAnimFrameId = null;

        // TextEffectMorph.cleanUp();
        for(let fx of effectsToUpdate) {
          // HUMAN TODO: implement time-delta all over the place
          fx[1].cleanUp();
        }

        // Clear all intervals.
        const intervals = Object.values(gameIntervals);
        for(let i = 0; i < intervals.length; i++) {
            clearInterval(intervals[i]);
        }

        // Clear all timeouts.
        const timeouts = Object.values(gameTimeouts);
        for(let i = 0; i < timeouts.length; i++) {
            clearTimeout(timeouts[i]);
        }

        // clean up/remove all open screens
        // const screens = Object.keys(openScreens);
        // for(let i = 0; i < screens.length; i++) {
        for(const screen of openScreens) {
            if(!screen[1]) {
              continue;
            }
            screen[1].cleanUp();
            screen[1] = null;
        }

        for(let i = 0; i < sprites.length; i++) {
          sprites[i].cleanUp();
        }
        // clear sprites array
        sprites.length = 0;

        perfMonitor.cleanUp();

        // clear particles
        Particles.cleanUp();

        // remove all lemmings
        lemmings.length = 0;
        lastLemmingId = 0;
        doneSpawning = false;

        // clear map noise
        World.cleanUp();

        // clear canvas
        if(ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        if(scoreKeeper) {
          scoreKeeper.cleanUp();
          scoreKeeper = null;
        }

        // Unpause
        isPaused = false;

        elapsedLevelTime = 0;
        playing = false;

        canvasFadeDirection = null;

        levelDataResources = null;

        // Clear some debug divs
        LlemmingsDebug.cleanUp();

        // for clarity
        background = undefined;
        console.log("Reset done.");
    }
    

    // >>> Prompt: instructions/main-loop.0001.txt
    // >>> Prompt: instructions/main-loop.0002.txt
    // >>> Prompt: instructions/main-loop.0003.txt (throttling)
    // >>> Prompt: instructions/optimization-putImageData-prune.0001.txt
    function update() {
      if(!background) {
        return;
      }
      
      if (isPaused) {
        reqAnimFrameId = requestAnimationFrame(update);
        return;
      }

      let currentTime = performance.now();

      if (currentTime - lastFrameUpdate < frameInterval) {
        reqAnimFrameId = requestAnimationFrame(update);
        return;
      }

      perfMonitor.setLabel("FPS", 1000/(currentTime - lastFrameUpdateReal), 30);
      perfMonitor.start("all-of-update");

      lastFrameUpdate = currentTime - (currentTime % frameInterval);
      lastFrameUpdateReal = currentTime;
      elapsedLevelTime += frameInterval;

      // Restore the background
      ctx.drawImage(offScreenCanvas, 0, 0);

      // Handle fading
      if (canvasFadeDirection === "in") {
        fadeInCanvas();
      } else if (canvasFadeDirection === "out") {
        fadeOutCanvas();
      }

      if(playing) {
        perfMonitor.start("ecs-update");
        ecs.update(ecs.components);
        perfMonitor.end("ecs-update");

        // Update and draw each lemming
        perfMonitor.start("lemmings-update");
        for(let i = 0; i < lemmings.length; i++) {
          const lemming = lemmings[i];
          lemming.update();
          lemming.draw();
          
          // HUMAN: There can be multiple lemmings selected, only the last one will be visible to us
          if (__DEBUG__) {
            if(lemming.isSelected) {
              LlemmingsDebug.updateInfoDiv(lemming);
            }
          }
    
          if (lemming.isDead) {
            // Remove dead lemmings from the array as optimization
            const index = lemmings.indexOf(lemming);
            lemmings.splice(index, 1);
            Particles.createExplosion(lemming.x, lemming.y)
          }

          // >>> Prompt: instructions/score.0001.txt
          if (lemming.rescued) {
            const index = lemmings.indexOf(lemming);
            lemmings.splice(index, 1);
            scoreKeeper.addSavedLemmings(1);
            scoreKeeper.addScore(100, "Saved lemming");
            console.log(
              `Lemming ${lemming.id} reached the finish! Saved: ${scoreKeeper.getSavedLemmingsCount()} lemmings`
            );

            // HUMAN TODO: Do some effect here (also sound?)
            Particles.createFirework(lemming.x, lemming.y);
          }
        }
        perfMonitor.end("lemmings-update");
      }

      perfMonitor.start("sprites-update");
      for(let i = 0; i < sprites.length; i++) {
        sprites[i].update();
      }
      perfMonitor.end("sprites-update");

      perfMonitor.start("particles-update");
      Particles.update();
      perfMonitor.end("particles-update");

      perfMonitor.start("effects-update");
      for(let fx of effectsToUpdate) {
        // HUMAN TODO: implement time-delta all over the place
        fx[1].update(1000/60);
      }
      perfMonitor.end("effects-update");

      // Game over / success check
      if(levelData.disableGame === false 
          && playing 
          && ((levelDataResources.time - elapsedLevelTime) <= 0 || getLemmingsRemaining() === 0)
      ) {
        playing = false;
        if(scoreKeeper.getSavedLemmingsCount() >= levelData.goal.survivors) {
          levelCompleted();
        } else {
          levelFailed();
        }
      }

      perfMonitor.start("screens-update");
      for(const screen of openScreens) {
        screen[1].update();
      }
      perfMonitor.end("screens-update");

      // Schedule the next frame
      reqAnimFrameId = requestAnimationFrame(update);

      perfMonitor.end("all-of-update");
    }


    function init(canvasElt, givenLevel = {}, debug = false)
    {
      __DEBUG__ = debug;
  
      // Override by givenLevel if it specifies it
      if(givenLevel.__DEBUG__ !== undefined && givenLevel.__DEBUG__ !== null) {
        __DEBUG__ = givenLevel.__DEBUG__;
      }

      forceDebugIfSet();

      if(!EDITOR_MODE) {
        perfMonitor.init(__DEBUG__);
      }

      levelData = getDefaultLevelData(givenLevel);
      levelDataResources = { ...levelData.resources };

      autoPlaying = levelData.autoPlay;

      console.log("Current seed: ", levelData.seed);
      Math.random = GameUtils.RNG(levelData.seed);
  
      if(!canvas && !canvasElt) {
        throw "no existing canvas and no element given";
      } else if(canvasElt) {
        canvas = canvasElt;
        canvas.width = RESOLUTION_X;
        canvas.height = RESOLUTION_Y;
      }
      ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false });

      LlemmingsDebug.init({ctx});

      if(!EDITOR_MODE) {
        GameUtils.adjustCanvasHeight();
      }
      UI.positionElements(levelData, levelDataResources);

      initBackground();

      World.init({
        ctx,
        levelData,
        background,
      });

      World.generateMapNoiseHash();
      World.generateMap(canvas.width, canvas.height);

      if (levelData.shapes) {
        World.drawShapes(ctx, levelData.shapes);
        ctx.lineWidth = 1;
      }

      setupStartFinish();

      World.clearSmoothingOfTerrain(canvas, [...World.terrainColorBytes, World.waterColorBytes]);
      // console.log("Unique colors:", GameUtils.getUniqueColors(canvas));

      // Human notes:
      // collisionLayer will be used for collision checking.
      // Everything that is collidable terrain should be above this
      //
      World.setCollisionLayer(ctx.getImageData(0,0,canvas.width,canvas.height))

      World.setGradients(ctx, levelData.gradients);
      World.backupGradients(levelData.gradients);     // needed for when we blow stuff up or dig

      LlemmingsArt.renderDecorations(ctx, levelData);
      World.renderDirtTexture();
      World.renderRockTexture();
      World.renderWaterTexture();

      if(!canvasEventsListening) {
        startCanvasEventListeners();
      }

      LlemmingsFCT.init(canvas);
      effectsToUpdate.set("FloatingCombatText", LlemmingsFCT);

      // Create sound effects
      AudioSamples.createSamples(["BD-0.25"]);

      // Create an instance of the ScoreKeeper class
      scoreKeeper = new LlemmingsScore.ScoreKeeper(canvas, levelData.goal.survivors, 0, !levelData.ui.showScore || EDITOR_MODE);

      Llemming.init({ __DEBUG__, autoPlaying, canvas, levelData, lemmings, ctx, background });
      Actions.init({ lemmings, levelData, levelDataResources });
      Particles.init({ ctx });

      // HUMAN: Pre-create lemmings -- we need this early to determine level failure/success
      createLemmings(levelDataResources.lemmings);

      ecs = ECS.setup(levelData, ctx);


      // Human HACK: Wait a little for any images to be drawn before we set background buffer.
      //             The _proper_ way to do this is set something up that actually waits
      //             for all possible images to be drawn before setting the background and
      //             after that start the update loop.
      setTimeout( () => {
        setBackgroundBuffer();

        // Start the update loop
        reqAnimFrameId = update();
      }, 60);
    }
 
    function preStart()
    {
      canvasOpacity = 0;
      canvas.style.opacity = canvasOpacity;
      canvasFadeDirection = "in";

      if (levelData.ui.showObjective === false) {
        // Skip showing objective animation
        _start();
      } else {
        // Show objective for level
        TextEffectMorph.init({
          text : "RESCUE " + levelData.goal.survivors,
          placeOverCanvas:canvas,
          onAnimationDone: () => {
            effectsToUpdate.delete("TextEffectMorph");
            _start();
          }
        });
        effectsToUpdate.set("TextEffectMorph", TextEffectMorph);
      }
    }

    /**
     * Actually starts the current loaded level without any 
     * frills. You'd normally not use this one as you want
     * to show objectives and fade in: preStart() does this.
     */
    function _start()
    {
      if(!EDITOR_MODE) {
        if(persisted.currentLevel === levelData.level) {
          persisted.currentLevelAttempts++;
        }
        GameUtils.saveToLocalStorage('persisted', persisted);
      }

      // Spawn a new lemming every interval
      gameIntervals["lemmingSpawner"] = setInterval(spawnLemming, levelData.spawnInterval);
      
      playing = true;
      console.log("Starting level", levelData.level);
    }

    /**
     * From intro screen, this starts level progression
     */
    function startGame()
    {
      if(isPaused) {
        togglePause();
      }

      // "Start game" button on intro screen
      let btn = document.getElementById("start-game");
      if(btn) {
        btn.style.display = "none";
      }

      let settings = document.getElementById("settings");
      if(settings) {
        settings.style.display = "none";
      }

      canvasFadeDirection = "out";

      // Wait a little to fade out the intro screen
      setTimeout(() => {
        reset();
        init(document.getElementById('canvas'), LlemmingsLevels[persisted.currentLevel], false);
        preStart();
      }, 1000);
    }


    /**
     * Human: This is the entry point when page is loaded/refreshed.
     * Human: Note that it is NOT run if in level editor.
     * Human: It starts the intro screen of the game.
     */
    async function _runOnce(resetLocalStorage = false)
    {
      // Retrieve from local storage
      let tmpPersisted = GameUtils.getFromLocalStorage('persisted');

      if(resetLocalStorage || !tmpPersisted || !tmpPersisted.levelScores) {
        console.warn("Resetting local storage. It was: ", tmpPersisted);
        tmpPersisted = null;
      }

      if(!tmpPersisted) {
        console.log("No persisted data, setting to default");
        persisted = { ...persistedDefaults };
      } else {
        persisted = tmpPersisted;
      }
      console.log("Loaded persisted data...", persisted);

      // NOTE: This line needs to be run by editor too, make sure it calls it somehow.
      await generateBitmaps();

      LlemmingsKeyBindings.startKeyBinds(Actions.keyBindPressed);

      if(__DEBUG__) {
        let ld = null;

        if(true) {
          console.warn("Overriding level to modify settings due to __DEBUG__");

          // THIS IS WHERE YOU SET HARDCODED LEVEL TO TEST!
          ld = LlemmingsLevels[1];
          /*
          ld.autoPlay = true;
  
          ld.spawnInterval = 17;
          ld.start.x = 760;
          ld.start.y = 466;
          ld.solution[1] = [
            {
                x: 362, y: 230, r: 13,
                action : "Builder"
            }
          ];
          */
  
          if(false) {
            // lots of lemmings test (lemmings-update is at around 11-13ms at peak; 9-10ms without draw (!?))
            ld.spawnInterval = 17;
            ld.resources.lemmings = 6000;
          }
    
          ld.ui.showObjective = false;
        } else {
          /*
           * 0 = intro
           * num = any level
           * persisted.currentLevel = level progression
           */
          // ld = LlemmingsLevels[persisted.currentLevel];
          ld = LlemmingsLevels[0];
        }

        // Init for hardcoded level (above)
        init(document.getElementById('canvas'), ld, true);
      } else {
        // This is the real init for the intro
        init(document.getElementById('canvas'), LlemmingsLevels[0], false);
      }

      preStart();
    }

    /**
     * Statements below this are to be run when this file is included.
     * Keep at a minimum.
     */

    // Override always (we do it here as well as in init so that we know about it in _runOnce()).
    forceDebugIfSet();

    // Don't run when in level editor
    if(document.location.href.includes("/editor/")) {
      EDITOR_MODE = true;
    }

    // Start once we've loaded the font we depend on
    if(!EDITOR_MODE) {
      document.fonts.ready.then(function () {
        _runOnce(false);
      });
    }

    return {
      getSeed : () => { return levelData.seed; },
      init : init,
      start : _start,                     // used by level editor's preview
      startGame : startGame,              // call when "Start game" is clicked on intro screen
      toggleSetting : toggleSetting,
      togglePause : togglePause,
      reset : reset,
      restart : restartLevel,
      getDefaultLevelData : getDefaultLevelData,
      drawShapes : World.drawShapes,      // TODO: Remove this and make caller (Editor) use World directly
      isPlaying : isPlaying,
      isAutoPlaying : isAutoPlaying,
      exitGame : exitGame,
      restartLevel : restartLevel,

      generateSprites : generateBitmaps,  // TODO: Rename to bitmaps for external references (Editor)
      getBitmap : getBitmap,
    }
})();
