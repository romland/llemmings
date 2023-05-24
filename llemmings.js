"use strict";
var Llemmings = (function () {
    // Get debug DOM elements
    const coordinatesDiv = document.getElementById("coordinatesDiv");
    const infoDiv = document.getElementById("infoDiv");
  
    let EDITOR_MODE = false;

    // Debug
    let __DEBUG__ = false;
  
    // Colors
    const blackColorBytes = [0x0, 0x0, 0x0];
    const waterColorBytes = [0x00, 0x77, 0xbe]; // [0, 119, 190];
    const rockColorBytes  = [0x88, 0x88, 0x88]; // [136, 136, 136];
    const dirtColorBytes  = [0x4a, 0x2e, 0x00]; // [74, 46, 0];
    const lemmingBodyColor = [0x00, 0x00, 0xff];
    const lemmingHairColor = [0x00, 0xff, 0x00];
    const terrainColorBytes = [ rockColorBytes, dirtColorBytes ];
  
    const RESOLUTION_X = 800;
    const RESOLUTION_Y = 600;

    // Set up canvas (+related)
    let canvas, ctx;        // set by init().
    const offScreenCanvas = document.createElement('canvas');
    let background;         // background offscreen canvas context
    let collisionLayer;     // check collisions against this (array of 4 bytes / pixel)
    let gradientsData;      // contains a backup of the gradients for when we blow stuff up

    // Kept around for clean-up reasons
    let reqAnimFrameId = null;
    let canvasEventsListening = false;
    const gameIntervals = {};

    // World settings
    const GRAVITY = 0.08; // Adjust this until falling looks good
    let particles = [];
    let lastLemmingId = 0;
  
    // Map variables and settings (noise and otherwise)
    const MAP_TILE_SIZE = 1;
    const MAP_OCTAVES = 5;
    const MAP_PERSISTENCE = 0.5;
    const MAP_LACUNARITY = 2.25;
    const MAP_AMPLITUDE = 2.0;
    const WATER_HEIGHT = 70;
    const mapNoiseHash = [];
  
    // constants for tunnel/cave generation
    const TUNNEL_SIZE = 40;
    const TUNNEL_MIN_LENGTH = 150;
    const TUNNEL_MAX_LENGTH = 400;
  
    // Lemming settings
    const VEL_CLIMB = 1;    // Cheat. HUMAN added this undeclared variable.
    const BUILDER_LOOK_AHEAD = 10;
    const DIGGER_LOOK_AHEAD = 4;
    const DIGGER_SPEED_FACTOR = 0.4;    // HUMAN: Changed my mind; changed from 0.2
  
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
    const animationFrames = {};   // kept intact between levels so we don't have to re-generate all the time
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

    function getDefaultLevelData(givenLevel = {})
    {
      /*
        Some seeds used in the past:
        1681139505452;  // llemmings.com
      */
      // levelData defaults
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
            "color": `rgb(${waterColorBytes.join(",")})`,
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
        start : givenLevel.start || { x : null, y : -20, radius : 50, clear: false },
        finish : givenLevel.finish || { x : 750, y : RESOLUTION_Y - WATER_HEIGHT - 50 - 10, radius : 50, clear: true },
      };      
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
 
    // isSpawned
    function createLemmings(amount)
    {
      for(let i = 0; i < amount; i++) {
        const newLemming = new Lemming();
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

  
    // >>> Prompt: instructions/map-generation.0003.txt (0001-0002 are now obsolete)
    function generateMapNoiseHash()
    {
      for (let i = 0; i < 256; i++) {
          mapNoiseHash[i] = Math.floor(Math.random() * 256);
      }
    }
  
    function generateMap(canvasWidth, canvasHeight)
    {
        // create empty map
        const map = [];
        for (let y = 0; y < canvasHeight; y++) {
            map[y] = [];
            for (let x = 0; x < canvasWidth; x++) {
                map[y][x] = 0;
            }
        }
  
        // create height map using Perlin noise
        for (let y = 0; y < canvasHeight; y++) {
            for (let x = 0; x < canvasWidth; x++) {
                let amplitude = MAP_AMPLITUDE;
                let frequency = 1.0 / canvasWidth;
                let noiseHeight = 0;
  
                for (let i = 0; i < MAP_OCTAVES; i++) {
                    let sampleX = x * frequency;
                    let sampleY = y * frequency;
                    let noiseValue = PerlinNoise2D(sampleX, sampleY);
                    noiseHeight += noiseValue * amplitude;
  
                    amplitude *= MAP_PERSISTENCE;
                    frequency *= MAP_LACUNARITY;
                }
  
                map[y][x] = noiseHeight;
            }
        }
  
        // ====================== tunnels ======================
        // carve out tunnels
        for (let y = 0; y < canvasHeight; y += TUNNEL_SIZE) {
          let x = 0;
          while (x < canvasWidth - TUNNEL_SIZE) {
            if(Math.random() < 0.8) {
              break;
            }
  
            if (map[y][x] > 0.4) {
              const tunnelLength = Math.floor(Math.random() * (TUNNEL_MAX_LENGTH - TUNNEL_MIN_LENGTH + 1)) + TUNNEL_MIN_LENGTH;
              let curve = Math.floor(Math.random() * TUNNEL_SIZE) - TUNNEL_SIZE / 2;
              for (let i = 0; i < tunnelLength && x < canvasWidth - TUNNEL_SIZE; i++) {
                  const startY = Math.max(0, y + curve);
                  const endY = Math.min(canvasHeight, y + TUNNEL_SIZE + curve);
                  for (let j = startY; j < endY; j++) {
                    if (map[j][x] > 0.4) {
                        map[j][x] = 0;
                    }
                  }
                  x++;
                  curve += Math.floor(Math.random() * 3) - 1;
                  curve = Math.max(-TUNNEL_SIZE / 2, Math.min(curve, TUNNEL_SIZE / 2));
              }
            }
            else {
              x++;
            }
          }
        }
  
        for (let x = 0; x < canvasWidth; x += TUNNEL_SIZE) {
          let y = 0;
          while (y < canvasHeight - TUNNEL_SIZE) {
              if(Math.random() < 0.8) {
                  break;
              }
  
              if (map[y][x] > 0.4) {
                const tunnelLength = Math.floor(Math.random() * (TUNNEL_MAX_LENGTH - TUNNEL_MIN_LENGTH + 1)) + TUNNEL_MIN_LENGTH;
                let curve = Math.floor(Math.random() * TUNNEL_SIZE) - TUNNEL_SIZE / 2;
                for (let i = 0; i < tunnelLength && y < canvasHeight - TUNNEL_SIZE; i++) {
                    const startX = Math.max(0, x + curve);
                    const endX = Math.min(canvasWidth, x + TUNNEL_SIZE + curve);
                    for (let j = startX; j < endX; j++) {
                      if (map[y][j] > 0.4) {
                          map[y][j] = 0;
                      }
                    }
                    y++;
                    curve += Math.floor(Math.random() * 3) - 1;
                    curve = Math.max(-TUNNEL_SIZE / 2, Math.min(curve, TUNNEL_SIZE / 2));
                }
              }
              else {
                y++;
              }
          }
        }
        // ====================== /tunnels ======================
  
        for (let y = 0; y < canvasHeight; y += MAP_TILE_SIZE) {
            for (let x = 0; x < canvasWidth; x += MAP_TILE_SIZE) {
                const height = map[y][x];
                let color;
  
                if (height >= 0.7) {
                    // rock
                    color = rockColorBytes;
                } else if (height >= 0.4) {
                    // dirt
                    color = dirtColorBytes;
                } else {
                    // void
                    color = blackColorBytes;
                }
  
                ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                ctx.fillRect(x, y, MAP_TILE_SIZE, MAP_TILE_SIZE);
            }
        }
    }
  
  
    function PerlinNoise2D(x, y) {
        const xInt = Math.floor(x);
        const yInt = Math.floor(y);
  
        const X = xInt & 255;
        const Y = yInt & 255;
  
        x -= xInt;
        y -= yInt;
  
        const u = fade(x);
        const v = fade(y);
  
        const A = mapNoiseHash[X] + Y;
        const AA = mapNoiseHash[A];
        const AB = mapNoiseHash[A + 1];
        const B = mapNoiseHash[X + 1] + Y;
        const BA = mapNoiseHash[B];
        const BB = mapNoiseHash[B + 1];
  
        return lerp(v, lerp(u, grad(mapNoiseHash[AA], x, y), grad(mapNoiseHash[BA], x - 1, y)),
                      lerp(u, grad(mapNoiseHash[AB], x, y - 1), grad(mapNoiseHash[BB], x - 1, y - 1)));
    }
  
    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
  
    function lerp(t, a, b) {
        return a + t * (b - a);
    }
  
    function grad(hash, x, y) {
        const h = hash & 3;
        const u = h === 0 ? x : h === 1 ? y : x + y;
        const v = h < 2 ? y : x;
        return ((hash & 4) === 0 ? 1 : -1) * u + ((hash & 8) === 0 ? 1 : -1) * v;
    }
    // ============== /map
  
  
    // ======================== textures
  
    function renderDirtTexture()
    {
      const dirtGrainSize = 10;
      // generate dirt texture
      for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
          if(!isColorOneOf(getPixelColor(collisionLayer, x, y), dirtColorBytes)) {
            continue;
          }
          let noiseValue = PerlinNoise2D(x / dirtGrainSize, y / dirtGrainSize);
          
          // darken color according to noise value
          let shade = Math.floor(noiseValue * 40);
          ctx.fillStyle = `rgb(${120 - shade}, ${80 - shade}, ${50 - shade})`;
          
          // draw pixel
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // >>> Prompt: instructions/water-texture.0001.txt
    function renderWaterTexture()
    {
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          if(!isColorOneOf(getPixelColor(collisionLayer, x, y), waterColorBytes)) continue;
          
          let noiseValue = PerlinNoise2D(x / 100, y / 100);
          let blue = Math.floor(200 + noiseValue * 55);
          ctx.fillStyle = `rgb(0, 0, ${blue})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    function renderRockTexture() {
      const rockGrainSize = 24;
      const cliffColorBytes = [
        [50, 60, 70], // dark rocks
        [100, 110, 120], // medium rocks
        [185, 200, 210], // light colored rocks
        [215, 225, 235] // very light colored rocks 
      ];
      
      for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
          if(!isColorOneOf(getPixelColor(collisionLayer, x, y), rockColorBytes)) {
            continue;
          }
  
          let noiseValue = PerlinNoise2D(x / rockGrainSize, y / rockGrainSize);
          
          if (noiseValue < 0.1) {
            let shade = Math.floor(noiseValue * 80);
            ctx.fillStyle = `rgb(${cliffColorBytes[0][0] - shade}, ${cliffColorBytes[0][1] - shade}, ${cliffColorBytes[0][2] - shade})`;
          } else if (noiseValue < 0.3) {
            ctx.fillStyle = `rgb(${cliffColorBytes[0][0]}, ${cliffColorBytes[0][1]}, ${cliffColorBytes[0][2]})`;
          } else if (noiseValue < 0.5) {
            ctx.fillStyle = `rgb(${cliffColorBytes[1][0]}, ${cliffColorBytes[1][1]}, ${cliffColorBytes[1][2]})`;
          } else if (noiseValue < 0.7) {
            ctx.fillStyle = `rgb(${cliffColorBytes[2][0]}, ${cliffColorBytes[2][1]}, ${cliffColorBytes[2][2]})`;
          } else {
            ctx.fillStyle = `rgb(${cliffColorBytes[3][0]}, ${cliffColorBytes[3][1]}, ${cliffColorBytes[3][2]})`;
          }
          
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  
    // This method originally comes from the level editor
    // >>> Prompt: editor/instructions/shapes-drawing.0001.txt
    // >>> Prompt: editor/instructions/shapes-drawing.0002.txt
    // and most likely: etc.
    function drawShapes(context, shapesArr)
    {
      // Draw existing shapes
      for (let i = 0; i < shapesArr.length; i++) {
        const shape = shapesArr[i];

        context.lineWidth = shape.lineWidth || 1;

        if(shape.filled) {
          context.fillStyle = shape.color;
        }
        context.strokeStyle = shape.color;
        
        context.beginPath();

        switch (shape.type) {
          case "rectangle":
            if (shape.filled) {
              context.fillRect(shape.x1, shape.y1, shape.x2 - shape.x1, shape.y2 - shape.y1);
            } else {
              context.strokeRect(shape.x1, shape.y1, shape.x2 - shape.x1, shape.y2 - shape.y1);
            }
            break;
            
          case "ellipse":
            context.ellipse((shape.x1 + shape.x2) / 2, (shape.y1 + shape.y2) / 2, Math.abs(shape.x2 - shape.x1) / 2, Math.abs(shape.y2 - shape.y1) / 2, 0, 0, 2 * Math.PI);
            if (shape.filled) {
              context.fill();
            } else {
              context.stroke();
            }
            break;
            
          case "line":
            context.moveTo(shape.x1, shape.y1);
            context.lineTo(shape.x2, shape.y2);
            context.stroke();
            break;

          case "draw":
            if(!shape.points) {
              break;
            }
            if (shape.filled) {
              context.beginPath();
            }
            context.moveTo(shape.points[0].x, shape.points[0].y);
            for (let j = 1; j < shape.points.length; j++) {
              context.lineTo(shape.points[j].x, shape.points[j].y);
            }

            if (shape.filled) {
              context.closePath();
              context.fill();
            } else {
              context.stroke();
            }
            break;

          case "triangle":
            if (shape.filled) {
              context.beginPath();
              context.moveTo(shape.x1, shape.y1);
              context.lineTo(shape.x2, shape.y2);
              context.lineTo(shape.x3, shape.y3);
              context.closePath();
              context.fill();
            } else {
              context.beginPath();
              context.moveTo(shape.x1, shape.y1);
              context.lineTo(shape.x2, shape.y2);
              context.lineTo(shape.x3, shape.y3);
              context.closePath();
              context.stroke();
            }
            break;

          case "text":
            context.save();
            context.font = shape.fontSize + "px " + shape.fontName;
            context.fillStyle = shape.color;
            context.textBaseline = shape.textBaseline;
            context.fillText(shape.string, shape.x, shape.y);
            context.restore();
            break;

          case "bitmap":
            if(shape.x === undefined || shape.y === undefined) {
              console.warn("no position for bitmap?")
              break;
            }
            GameUtils.renderBitmap(shape, context, shape.x, shape.y);
            break;
        }
      }
    }


    /**
     * >>> Prompt: instructions/gradients-backup.0001.txt
     * Creates a temporary 2d HTML canvas using same size as global variable 'canvas',
     * calls the function setGradients on it, takes a byte-array backup of it to return,
     * destroy the temporary canvas.
     * @param {Array} gradients - array of gradient objects
     * @returns {Uint8ClampedArray} - byte-array backup of the gradient
     */
    function backupGradients(gradients) {
      // create temporary canvas with same size as global variable 'canvas'
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = canvas.width;
      tmpCanvas.height = canvas.height;
      const tmpCtx = tmpCanvas.getContext('2d');

      // call setGradients function on the temporary canvas
      setGradients(tmpCtx, gradients);

      // take backup of temporary canvas as byte-array
      const imageData = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
      const backup = new Uint8ClampedArray(imageData.data);

      // destroy temporary canvas
      tmpCanvas.remove();

      return backup;
    }

    // >>> Prompt: editor/instructions/gradient-serialize.0001.txt
    // HUMAN: Crivens, I forgot I had an LLM to ask to implement this function,
    //        despite asking it to generate a serialization structure for me.
    //        slap->forehead
    function setGradients(context, gradients)
    {
      if(!context || !gradients) {
        return;
      }
      
      for(let g of gradients) {
        switch(g.type) {
          case "linear" :
            let grd = context.createLinearGradient(g.x0, g.y0, g.x1, g.y1);
            for(let i = 0; i < g.stops.length; i++) {
              grd.addColorStop(g.stops[i].offset, g.stops[i].color);
            }
            context.fillStyle = grd;
            context.fillRect(0, 0, canvas.width, canvas.height);
            break;
          default :
            console.warn("unknown gradient", g.type);
            break;
        }
      }
    }


    function getHeightAdjustment(lem)
    {
      let heightAdjustment = 0;
      for(let i = 0; i < 6; i++) {
        if(isPixelOneOf(collisionLayer, lem.x + lem.width / 2, lem.y + lem.height - i, terrainColorBytes)) {
          heightAdjustment--;
        } else {
          break;
        }
      }

      return heightAdjustment;
    }
   
    // ============== lemming sprite
    // >>> Prompt: instructions/movement-collisions.0001.txt
    // >>> Prompt: instructions/movement-collisions.0002.txt
    // >>> Prompt: instructions/movement-collisions.0003.txt
    // >>> Prompt: instructions/lemming.update.0001.txt
    // >>> Prompt: instructions/lemming.update.0002.txt
    class Lemming {
      constructor(x, y) {
        this.id = -49152;
        this.age = 0;
        this.width = 10;
        this.height = 20;
        this.maxVelX = 0.4;
        this.deadlyVelY = 4.5;
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.isSpawned = false;
        this.isSelected = false;
        this.onGround = false;
        this.isClimbing = false;
        this.isDead = false;
        this.rescued = false;
        this.action = null;
        this.actionStarted = false;
        this.executedActions = [];    // for pre-programmed actions (i.e. solutions to level)
        this.standStillUntil = 0;
        this.standStillDirection = undefined;
        this.bridgePixels = undefined;
  
        // Initialize these variables in the constructor or wherever appropriate
        this.legColor = "green";
        this.footColor = "#666666";
        this.legAngle = 0;
        this.legWidth = this.width * 0.4;
        this.legHeight = this.height * 0.35;
        this.footWidth = this.legWidth * 1.8;
        this.footHeight = this.legHeight * 0.4;
      }
  
      // >>> Prompt: instructions/lemming-legs.draw.0001.txt
      draw() {
        if(!this.isSpawned) {
          return;
        }

        // draw body
        ctx.fillStyle = "rgb(" + lemmingBodyColor.join(",") + ")";
        ctx.fillRect (this.x, this.y, this.width, this.height * 0.75);
  
        let legMoveSpeed = this.age * (this.velX/3.0);
  
        // calculate leg positions based on velocity and direction
        let leftLegX, leftFootX, rightLegX, rightFootX;
        if (this.velX > 0) {
          this.legAngle = Math.sin(legMoveSpeed) * Math.PI / 4;
          leftLegX = this.x + this.width * 0.2;
          rightLegX = this.x + this.width * 0.4;
  
          leftFootX = -(this.legWidth/2);
          rightFootX = -(this.legWidth/2);
        } else if (this.velX < 0) {
          this.legAngle = -Math.sin(legMoveSpeed) * Math.PI / 4;
          leftLegX = this.x + this.width * 0.5;
          rightLegX = this.x + this.width * 0.8 - this.legWidth;
  
          leftFootX = -this.legWidth - 1;
          rightFootX = -this.legWidth - 1;
        } else {
          this.legAngle = 0;
          leftLegX = this.x + this.width * 0.1;
          rightLegX = this.x + this.width * 0.9 - this.legWidth;
  
          leftFootX = -this.legWidth + 2;
          rightFootX = -this.legWidth - 1;
        }
  
        ctx.fillStyle = this.legColor;
        ctx.save();
        // left leg
        ctx.translate(leftLegX + this.legWidth / 2, this.y + this.height * 0.75);
        ctx.rotate(this.legAngle);
        ctx.fillRect(-this.legWidth / 2, 0, this.legWidth, this.legHeight);
  
        // left foot
        ctx.fillStyle = this.footColor;
        ctx.fillRect(leftFootX, this.legHeight - this.footHeight, this.footWidth, this.footHeight);
        ctx.restore();
  
        ctx.save();
        // right leg
        ctx.translate(rightLegX + this.legWidth / 2, this.y + this.height * 0.75)
        ctx.rotate(-this.legAngle);
        ctx.fillRect(-this.legWidth / 2, 0, this.legWidth, this.legHeight);
  
        // right foot
        ctx.fillStyle = this.footColor;
        ctx.fillRect(rightFootX, this.legHeight - this.footHeight, this.footWidth, this.footHeight);
        ctx.restore();
  
        // // hair
        ctx.fillStyle = "rgb(" + lemmingHairColor.join(",") + ")";
        ctx.fillRect(this.x, this.y, this.width, this.height / 4);
  
        // is selected
        if (this.isSelected) {
          ctx.strokeStyle = "red";
          ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
  
        // debug
        if (__DEBUG__) {
            ctx.strokeStyle = "white";
            ctx.strokeText(this.id, this.x + 1, this.y + 13);
            if (this.action) {
              ctx.save();
              ctx.font = "7px Arial";
              ctx.strokeText(this.action, this.x - 5, this.y - 5);
              ctx.restore();
            }
        }
      }
  
      update() {
        if(!this.isSpawned) {
          return;
        }

        if(autoPlaying) {
          doProgrammedActions(this);
        }
  
        if (this.y >= canvas.height - (this.height + this.velY + 1)) {
            this.isDead = true;
            return;
        }

        // >>> Prompt: instructions/score.0001.txt
        if (checkLemmingFinish(this, levelData.finish)) {
          this.rescued = true;
          return;
        }

        if (this.standStillUntil && this.standStillUntil < this.age) {
          this.standStillUntil = null;
          this.velX = -this.standStillDirection;
        }
  
        // Check if ground is under us or not
        let isGroundUnderneath = isPixelOneOf(collisionLayer, this.x + this.width / 2, this.y + this.height + 1, terrainColorBytes);
  
        // Check if we hit a wall on the x axis
        // >>> Prompt: instructions/wall-hit-fix.0001.txt
        let hitWallOnLeft = this.velX < 0 && isPixelOneOf(collisionLayer, this.x - 1, this.y + this.height / 2, terrainColorBytes);
        let hitWallOnRight = this.velX > 0 && isPixelOneOf(collisionLayer, this.x + this.width + 1, this.y + this.height / 2, terrainColorBytes);
        let blockedByBlocker = false;

        let heightAdjustment = 0;
        if (isGroundUnderneath) {
          heightAdjustment = getHeightAdjustment(this);
        }
        
        // Check if there are other lemmings that are blockers
        for (let i = 0; i < lemmings.length; i++) {
            const otherLemming = lemmings[i];
  
            if (otherLemming !== this && !otherLemming.isDead && otherLemming.action === "Blocker" &&
                  otherLemming.onGround && 
                  this.x + this.width > otherLemming.x && this.x < otherLemming.x + otherLemming.width &&
                  this.y + this.height > otherLemming.y && this.y < otherLemming.y + otherLemming.height) {
  
                if(this.velX > 0) {
                  hitWallOnRight = true
                  this.x = otherLemming.x - otherLemming.width;
                } else {
                  hitWallOnLeft = true;
                  this.x = otherLemming.x + otherLemming.width + 1;
                }
                blockedByBlocker = true;
            }
        }
  
        // Check if we've fallen in water
        const isWaterBelow = pixelIsColor(collisionLayer, this.x + this.width / 2, this.y + this.height + 1, waterColorBytes);
  
        // Determine if the lemming should climb
        let shouldClimb = false;
  
        if (this.action === "Climber" && blockedByBlocker === false) {
            if ((hitWallOnLeft && this.velX < 0) || (hitWallOnRight && this.velX > 0)) {
                shouldClimb = true;
            } else {
                this.isClimbing = false; // Reset climbing flag
            }
        }
  
        // Update velocity according to the collision rules
        if (!this.onGround) {
            if (this.action === "Floater") {
                this.velY += GRAVITY * 0.1;
            } else {
                this.velY += GRAVITY;
            }
  
            if (isGroundUnderneath) {
                if (this.velY > this.deadlyVelY) {
                    // splat
                    this.isDead = true;
                    return;
                }
                this.onGround = true;
                this.velY = 0;
            }
        } else if (this.onGround && !isGroundUnderneath) {
            // Start falling if there's no ground
            this.onGround = false;
        }
  
        // ============ Digger/Basher/Miner code
        let digging = false;
  
        if (this.action === "Digger" || this.action === "Miner" || this.action === "Basher") {
            digging = startDigging(this);
        }
        // ============ /Digger/Basher/Miner code

        let building = false;
        if (this.action === "Builder") {
          // HUMAN: TODO: Just use 'digging' for now -- same concept
          building = build(this);
        }

        // Check if this is a Bomber, and if so create a hole
        // TODO: Need to make nearby aliens die...
        if (this.action === "Bomber") {
          createHole(this.x, this.y + this.height);
          this.isDead = true;
          return;
        }
      
        // Handle climbing
        if (shouldClimb) {
            this.isClimbing = true;
            let climbDirection = hitWallOnLeft ? 1 : -1;
            this.x += climbDirection * this.maxVelX;
            this.y -= 1;
  
            this.velY = -VEL_CLIMB*0.05; // Start going up at climbing velocity
            this.onGround = false; // We've left the ground
        } else {
            // Not climbing, normal movement applies
            // HUMAN: added check for 'this.velY === 0' here so that we don't turn when we are falling
            // HUMAN: don't turn if digging
            if (!digging && !building && this.velY === 0 && (hitWallOnLeft || hitWallOnRight || this.x <= this.width || this.x >= canvas.width - this.width)) {
                this.velX *= -1;
            }
  
            if (isWaterBelow || this.y >= canvas.height - this.height) {
                this.isDead = true;
            }
  
            // Apply height adjustment
            if (heightAdjustment !== 0 && !this.isClimbing && !digging) { // only adjust if not climbing
                if (this.y - heightAdjustment >= 0) {
                    this.y += heightAdjustment; // move sprite up (HUMAN comment: gravity takes care of down)
                } else {
                    console.log("Death by heightAdjustment");
                    this.isDead = true;
                    return;
                }
            }
  
            // HUMAN: this if block to slow down when digging
            // HUMAN: tweaked to include basher here
            if (this.actionStarted && (this.action === "Basher" || this.action === "Miner" || this.action === "Builder")) {
                this.velX = (this.velX > 0 ? this.maxVelX * DIGGER_SPEED_FACTOR : -this.maxVelX * DIGGER_SPEED_FACTOR);
            } else if (this.actionStarted && this.action === "Digger") {
                this.velX = 0;
                this.velY = this.maxVelX * DIGGER_SPEED_FACTOR;
            } else {
                this.velX = (this.velX > 0 ? this.maxVelX : -this.maxVelX);
            }
  
            // Move the lemming
            if(this.action === "Blocker") {
              this.velX = 0;
            } else if (this.standStillUntil && this.standStillUntil > this.age) {
              // Pause a builder for a little while after it finished building
              this.velX = 0;
            } else {
              this.x += this.velX;
            }
  
            this.x = Math.min(this.x, canvas.width - this.width - 2);
            this.x = Math.max(this.x, 2);
            this.y += this.velY;
        }
        this.age++;

        // HUMAN: Testing "beating level"
        if(false && this.age === 1) {
          this.x = 650;
          this.y = 455;
        }

      }
    }

    
    // >>> Prompt: instructions/builder.0004.txt
    function getRectanglePoints(lemming, angle, length, height, collisionColors, offsetX = 0, offsetFromFeetY = 0, debugDraw = false) {
      const points = {};
      const radians = (Math.PI / 180) * angle;
      let rectX = lemming.velX >= 0 ? lemming.x + lemming.width : lemming.x - length;
      const rectY = lemming.y + lemming.height + offsetFromFeetY;
      let offsetY = 0;

      rectX += offsetX;

      // Find offsetY for initial obstruction forgiveness
      for (let i = 0; i <= 4; i++) {
        if (isPixelOneOf(collisionLayer, rectX, rectY - i, collisionColors)) {
          offsetY = i;
          break;
        }
      }

      // Iterate through each point of the rectangle and check for obstructions or canvas boundaries
      for (let x = 0; x < length; x++) {
        for (let y = 0; y < height; y++) {
          const newX = rectX + x * Math.cos(radians) - y * Math.sin(radians);
          const newY = rectY - x * Math.sin(radians) - y * Math.cos(radians) - offsetY;

          if (
            newX >= 0 &&
            newX < canvas.width &&
            newY >= 0 &&
            newY < canvas.height &&
            !isPixelOneOf(collisionLayer, newX, newY, collisionColors)
          ) {
            // points.push({ x: Math.round(newX), y: Math.round(newY) });
            points[Math.round(newX) +"|"+ Math.round(newY)] = true;
            if(debugDraw) {
              setPixel(Math.round(newX), Math.round(newY), collisionColors[0]);
            }

            // Cover gaps by adding up to 1 pixel on each side of the current point
            const surroundingPixels = [
              { x: newX + 1, y: newY },
              { x: newX - 1, y: newY },
              { x: newX, y: newY + 1 },
              { x: newX, y: newY - 1 },
            ];

            surroundingPixels.forEach((pixel) => {
              if (
                pixel.x >= 0 &&
                pixel.x < canvas.width &&
                pixel.y >= 0 &&
                pixel.y < canvas.height &&
                !isPixelOneOf(collisionLayer, pixel.x, pixel.y, collisionColors)
              ) {
                // points.push({ x: Math.round(pixel.x), y: Math.round(pixel.y) });
                points[Math.round(pixel.x) +"|"+ Math.round(pixel.y)] = true;
                if(debugDraw) {
                  setPixel(Math.round(pixel.x), Math.round(pixel.y), collisionColors[0]);
                }
              }
            });
          }
        }
      }

      return Object.keys(points);
    }

    
    // =========================================================================
    // Digger/Basher/Miner code
    // >>> Prompt: /instructions/digger-miner-basher.0001.txt
    function startDigging(lemming)
    {
      switch(lemming.action) {
        case "Basher":
          // >>> Prompt: ./instructions/digger-miner-basher.0001.txt
          // >>> Prompt: instructions/builder.0004.txt (new implementation)
          return bash(lemming, 0);

        case "Digger":
          // >>> Prompt: instructions/digger.0001.txt
          return dig(lemming);

        case "Miner":
          // >>> Prompt: instructions/builder.0004.txt (new implementation)
          throw "TODO: new version needed -- use builder's rectangle"
          return dig(lemming, );
      }
  
      return false;
    }

    function bash(lemming)
    {
        if (!lemming.actionStarted && !lemming.onGround) {
            return false;
        }

        if(!lemming.actionStarted) {
          lemming.framesNotDug = 0;
        }

        let pixelsDug = 0;

        for(let offsetY = -2; offsetY < lemming.height + 1; offsetY++) {
          if(lemming.y <= 0 || lemming.y >= canvas.height) {
            break;
          }

          if(isPixelOneOf(collisionLayer, lemming.x + (lemming.width / 2), lemming.y + (lemming.height / 2), [rockColorBytes])) {
            console.log("Skipping dig due to rock in the center");
            break;
          }

          let startX = (lemming.velX > 0 ? lemming.width - 2 : - 2);
          let endX = lemming.velX > 0 ? lemming.width + 2 : 2;
          for(let offsetX = startX; offsetX < endX; offsetX++) {
            if(isPixelOneOf(collisionLayer, Math.round(lemming.x + offsetX), Math.round(lemming.y + offsetY), [rockColorBytes, blackColorBytes])) {
              // setPixel((lemming.x + offsetX), (lemming.y + offsetY), [255, 255, 255]);
              continue;
            }
            clearPixel((lemming.x + offsetX), (lemming.y + offsetY));
            pixelsDug++;
            lemming.actionStarted = true;
          }
        }

        if(lemming.actionStarted && pixelsDug === 0) {
          lemming.framesNotDug++;
        } else {
          lemming.framesNotDug = 0;
        }

        if (lemming.actionStarted && lemming.framesNotDug > (3 / (Math.abs(lemming.velX) + Math.abs(lemming.velY)))) {
            console.log("basher done. not dug", lemming.framesNotDug);
            lemming.action = null;
            lemming.actionStarted = false;
            return false;
        }
  
        return pixelsDug > 0;
    }

    function dig(lemming)
    {
        if (!lemming.actionStarted && !lemming.onGround) {
            return false;
        }

        if(!lemming.actionStarted) {
          lemming.framesNotDug = 0;
        }

        let pixelsDug = 0;

        for(let offsetY = 0; offsetY < 2; offsetY++) {
          if(lemming.y <= 0 || lemming.y >= canvas.height) {
            break;
          }

          if(isPixelOneOf(collisionLayer, lemming.x + (lemming.width / 2), lemming.y + lemming.height, [rockColorBytes])) {
            console.log("Skipping dig due to rock in the center");
            break;
          }

          for(let offsetX = -2; offsetX < lemming.width + 2; offsetX++) {
            if(isPixelOneOf(collisionLayer, Math.round(lemming.x + offsetX), Math.round(lemming.y + lemming.height + offsetY), [rockColorBytes, blackColorBytes])) {
              continue;
            }
            clearPixel(Math.round(lemming.x + offsetX), Math.round(lemming.y + lemming.height + offsetY));
            pixelsDug++;
            lemming.actionStarted = true;
          }
        }

        if(lemming.actionStarted && pixelsDug === 0) {
          lemming.framesNotDug++;
        } else {
          lemming.framesNotDug = 0;
        }

        if (lemming.actionStarted && lemming.framesNotDug > (2 / Math.abs(lemming.velX + lemming.velY))) {
            lemming.action = null;
            lemming.actionStarted = false;
            return false;
        }
  
        return pixelsDug > 0;
    }    

    // === /Digger/Basher/Miner code
    // =========================================================================
  
    // Builder
    // >>> Prompt: instructions/builder.0001.txt
    // >>> Prompt: instructions/builder.0002.txt
    // >>> Prompt: instructions/builder.0003.txt
    // >>> Prompt: instructions/builder.0004.txt (new implementation)
    function build(lemming)
    {
        if (!lemming.onGround) {
            return false;
        }

        if(!lemming.bridgePixels) {
          lemming.bridgePixels = getRectanglePoints(lemming, 25, 80, 2, terrainColorBytes);
          lemming.framesNotBuilt = 0;
        }
  
        let pixelsBuilt = 0;
        let remove = [];

        for(let i = 0; i < lemming.bridgePixels.length; i++) {
          let [pixelX, pixelY] = lemming.bridgePixels[i].split("|");
          if(isPointWithinCircle(
              lemming.x + (lemming.width / 2), lemming.y + lemming.height,
              pixelX, pixelY,
              BUILDER_LOOK_AHEAD * 2)
            ) {
              setPixel(pixelX, pixelY, dirtColorBytes);
              pixelsBuilt++;
              remove.push(i);
              lemming.actionStarted = true;
            }
        }

        if(lemming.actionStarted && pixelsBuilt === 0) {
          lemming.framesNotBuilt++;
        } else {
          lemming.framesNotBuilt = 0;
        }

        for(let i = remove.length-1; i > 0; i--) {
          lemming.bridgePixels.splice(remove[i], 1);
        }

        if(lemming.framesNotBuilt > (2 / Math.abs(lemming.velX))) {
          console.log("Did not build for", lemming.framesNotBuilt, "frames, calling it done")
          lemming.bridgePixels.length = 0;
        }
  
        if (lemming.bridgePixels.length === 0) {
            lemming.bridgePixels = null;
            lemming.standStillUntil = lemming.age + 60;
            lemming.standStillDirection = lemming.velX;
            lemming.action = null;
            lemming.actionStarted = false;
            return false;
        }
  
        return pixelsBuilt > 0;
    }
  
    // >>> Prompt: instructions/bomber.0002.txt
    // HUMAN: This hole sucks, but well, at least it's a hole. And well, there's a lot of things going wrong here. It's a bad prompt apparently.
    function createHole(x, y) {
      var holeSize = 50;
  
      x = Math.floor(x);
      y = Math.floor(y);

      // Clear pixels in background and collision arrays
      for (var yOffset = -holeSize/2; yOffset < holeSize/2; yOffset++) {
        for (var xOffset = -holeSize/2; xOffset < holeSize/2; xOffset++) {
          var xCoord = x + xOffset;
          var yCoord = y + yOffset
          
          if (xCoord >= 0 && xCoord < canvas.width && yCoord >= 0 && yCoord < canvas.height) {
            clearPixel(xCoord, yCoord);
          }
        }
      }
    }
  
  
    /**
     * Trigger action at position + other conditions.
     * HUMAN: For easier debugging and demo-purposes.
     * HUMAN: it is now also a way to provide hints/solutions
     */
    function doProgrammedActions(lemming)
    {
      if (!levelData.solution[lemming.id]) {
        return false;
      }

      let actions = levelData.solution[lemming.id];

      const lx = lemming.x + (lemming.width/2);
      const ly = lemming.y + lemming.height;
      
      let act;
      for(let i = 0; i < actions.length; i++) {
        act = actions[i];

        if(lemming.action && act.action !== "Bomber") {
          // Only a bomber can replace another action (I think?)
          continue;
        }

        if(lemming.executedActions.includes(i)) {
          continue;
        }
  
        if(isPointWithinCircle(lx, ly, act.x, act.y, act.r) && GameUtils.matchesCondition(act.conditions, lemming)) {
          lemming.isSelected = true;
          applyAction(act.action)
          lemming.isSelected = false;
          lemming.executedActions.push(i);
          return true;
        }
      }
  
      return false;
    }
  
    // >>> Prompt: instructions/actions-programmed.0001.txt
    function isPointWithinCircle(x,y,a,b,radius) {
      // calculate the distance between the point (x,y) and the center point (a,b) using Pythagorean theorem
      let distance = Math.abs(x - a) + Math.abs(y - b); 
      if(isNaN(distance)) {
        console.warn("vals:", x, y, a, b, radius);
        throw "not a number";
      }
      // compare the distance with the radius of the circle
      return distance <= radius;
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
  
    // >>> Prompt: instructions/particle-explosion.0001.txt
    function Particle(x, y) {
      this.x = x;
      this.y = y;
      this.velX = (Math.random() - 0.5) * 4; // Random horizontal velocity
      this.velY = -Math.random() * 6; // Random upward velocity
      this.life = 60; // Number of frames this particle should exist for
      this.color = "#FFA500"; // Orange color
    }
  
    Particle.prototype.update = function() {
      // Update position based on velocity
      this.x += this.velX;
      this.y += this.velY;
  
      // Apply gravity
      this.velY += 0.15;
  
      // Decrease life counter
      this.life--;
  
      // Fade out as life approaches zero
      if (this.life <= 0) {
        this.color = "#00000000"; // Transparent color
      }
    };
  
    Particle.prototype.draw = function() {
      // Draw a small rectangle at the particle's location
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, 2, 2);
    };
  
    function spawnCombatText(text)
    {
      if(levelData.ui.showFCT === false) {
        return;
      }
      LlemmingsFCT.spawnCombatText(text);
    }
  
    // >>> Prompt: instructions/actions.0001.txt
    function applyAction(action)
    {
      const selectedLemming = lemmings.find((lemming) => lemming.isSelected);
  
      // HUMAN: I had to add this myself
      if(!selectedLemming) {
        spawnCombatText("You have no target");
        return;
      }
  
      // HUMAN: I had to add this myself
      if(action !== "Bomber" && selectedLemming.action) {
        spawnCombatText("Lemming is busy");
        return;
      }

      if(levelData.unlimitedResources === true) {
        levelDataResources[action] = 99;
      }
  
      // Get the button element that was clicked
      // >>> Prompt: instructions/actions-resource-counter.0001.txt
      const btn = document.querySelector(`[data-resource="${action}"]`);
      const countSpan = btn?.querySelector('.count');

      if(levelDataResources[action] <= 0) {
        spawnCombatText("Out of " + action + "s");
        return;
      }

      // Consume resource, update UI
      levelDataResources[action]--;

      if(countSpan) {
        countSpan.innerText = levelDataResources[action];
      }

      switch (action) {
        case 'Climber':
          // >>> Prompt: instructions/climber.0001.txt
          selectedLemming.action = "Climber";
          selectedLemming.isSelected = false;
          spawnCombatText("Climbing!");
          break;
  
        case 'Floater':
          // >>> Prompt: instructions/floater.0001.txt
          selectedLemming.action = "Floater";
          selectedLemming.isSelected = false;
          spawnCombatText("Whee. Floating!");
          break;
  
        case 'Bomber':
          // >>> Prompt: instructions/bomber.0001.txt
          selectedLemming.action = "Bomber";
          selectedLemming.isSelected = false;
          spawnCombatText("Oh no! BOOM!");
          break;
  
        case 'Blocker':
          // >>> Prompt: instructions/blocker.0001.txt
          // >>> Prompt: instructions/blocker.0002.txt
          selectedLemming.action = "Blocker";
          selectedLemming.velX = 0;
          moveOverlappingLemmingsToRandomSideOfBlocker(selectedLemming);
          selectedLemming.isSelected = false;
          spawnCombatText("Halt!");
          break;
  
        case 'Builder':
          selectedLemming.standStillUntil = 0;
          selectedLemming.standStillDirection = undefined;
  
          selectedLemming.action = "Builder";     // HUMAN: Added this.
          // selectedLemming.isSelected = false;  // HUMAN: Let builders remain selected for now
          spawnCombatText("Everything's a nail!");
          break;
  
        case 'Basher':
          // >>> Prompt: ./instructions/digger-miner-basher.0001.txt
          selectedLemming.action = "Basher";     // HUMAN: Added this.
          selectedLemming.isSelected = false;
          console.log("Assigned basher to", selectedLemming.id);  // HUMAN: debug
          spawnCombatText("Ugh ugh. Bashing!");
          break;
  
        case 'Miner':
          // >>> Prompt: ./instructions/digger-miner-basher.0001.txt
          selectedLemming.action = "Miner";     // HUMAN: Added this.
          selectedLemming.isSelected = false;
          spawnCombatText("Hey ho, hey ho!");
          break;
  
        case 'Digger':
          // >>> Prompt: ./instructions/digger-miner-basher.0001.txt
          selectedLemming.action = "Digger";     // HUMAN: Added this.
          selectedLemming.isSelected = false;
          spawnCombatText("Digging!");
          break;
  
        default:
          console.log(`Invalid action: ${action}`);
          break;
      }
    }
  
    // HUMAN: TODO: This is untested...
    // >>> Prompt: instructions/blocker.0003.txt
    function moveOverlappingLemmingsToRandomSideOfBlocker(blocker) {
      lemmings.forEach((lemming) => {
        if (lemming === blocker || !isColliding(lemming, blocker)) {
          return;
        }
  
        // determine which side of the blocker the other lemming should be on
        const side = Math.random() < 0.5 ? -1 : 1; // -1 for left side, 1 for right side
  
        // move the other lemming away from the blocker
        lemming.x += blocker.width / 2 * side;
      });
    }
  
    // HUMAN: helper function to check for collisions between two objects. Not entirely sure which prompt generated it.
    function isColliding(obj1, obj2) {
      return obj1.x + obj1.width > obj2.x &&
            obj1.x < obj2.x + obj2.width &&
            obj1.y + obj1.height > obj2.y &&
            obj1.y < obj2.y + obj2.height;
    }
  
  
    function stopAction() {
      const selectedLemming = lemmings.find((lemming) => lemming.isSelected);
      if (selectedLemming) {
        selectedLemming.action = null;
        selectedLemming.isSelected = false;
      }
    }
  
  
    function updateInfoDiv(lem)
    {
      infoDiv.innerHTML = `ID: ${lem.id} 
        Act: ${lem.action} 
        X: ${lem.x.toFixed(1)}
        Y: ${lem.y.toFixed(1)}
        velX: ${lem.velX.toFixed(2)} 
        velY: ${lem.velY.toFixed(2)} 
        Started: ${lem.actionStarted}
        Age: ${lem.age}
        `;
    }
  
  
    // HUMAN: Added this to make it easier for the LLM (copy of clearPixel)
    // >>> Prompt: instructions/optimization-putImageData-prune.0001.txt
    function setPixel(x, y, colorBytes) {
      if (x >= offScreenCanvas.width || y >= offScreenCanvas.height || x < 0 || y < 0) {
        return;
      }

      background.fillStyle = `rgba(${colorBytes.join(',')},1)`;
      background.fillRect(x, y, 1, 1);

      if(collisionLayer) {
        const pixelIndex = getPixelIndex(x, y, canvas.width);
        collisionLayer.data[pixelIndex] = colorBytes[0];
        collisionLayer.data[pixelIndex + 1] = colorBytes[1];
        collisionLayer.data[pixelIndex + 2] = colorBytes[2];
        collisionLayer.data[pixelIndex + 3] = 255;
      }
    }

    // HUMAN: this came from _one_ of the discarded Digger/Miner/Basher implementations.
    // The LLM kept getting tiny parts of this wrong over and over, so I lifted this implementation
    // to make it a bit easier to get something useful.
    // >>> Prompt: digger-miner-basher.0001.txt
    // >>> Prompt: instructions/optimization-putImageData-prune.0001.txt
    function clearPixel(x, y, grayScale = 0) {
      if (x >= offScreenCanvas.width || y >= offScreenCanvas.height || x < 0 || y < 0) {
        return;
      }

      const pixelIndex = getPixelIndex(x, y, canvas.width);
      let col;
      if(gradientsData) {
        col = `rgb(${gradientsData[pixelIndex]},${gradientsData[pixelIndex+1]},${gradientsData[pixelIndex+2]},${gradientsData[pixelIndex+3]})`;
      } else {
        col = "black";
      }

      background.fillStyle = grayScale ? `rgba(${[grayScale, grayScale, grayScale, 1].join(',')})` : col;
      background.fillRect(x, y, 1, 1);

      if(collisionLayer) {
        collisionLayer.data[pixelIndex] = 0;
        collisionLayer.data[pixelIndex + 1] = 0;
        collisionLayer.data[pixelIndex + 2] = 0;
        collisionLayer.data[pixelIndex + 3] = 255;
      }
    }

    // >>> Prompt: instructions/unique-colors.0001.txt
    function getUniqueColors(canvas) {
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      
      const uniqueColors = {};
      
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
  
        if(!r && !g && !b) continue;  // skip 'void' color.
        
        const colorKey = `${r},${g},${b}`;
        
        if (!uniqueColors[colorKey]) {
          uniqueColors[colorKey] = [r, g, b];
        }
      }
      
      return Object.values(uniqueColors);
    }
  
  
    function getPixelColor(imageData, x, y) {
        x = Math.round(x);
        y = Math.round(y);
      const index = ((y * canvas.width) + x) * 4;
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];
      const a = imageData.data[index + 3];
  
      return [r, g, b, a];
    }
  
  
    // >>> Prompt: instructions/pixel-is-color.0001
    // >>> HUMAN CHEAT: Arrrgh. After 5-6 attempts, I give up. I rewrote the function myself! It kept omitting, 
    //     e.g.: if(!Array.isArray(color[0])) { color = [ color ]; }
    function pixelIsColor(imageData, x, y, color, debug) {
      x = Math.round(x);
      y = Math.round(y);
      
      const [r, g, b, alpha] = getPixelColor(imageData, x, y);
  
      if(r === undefined) {
        console.warn("Should not happen:", "lemming:", debug, "len:", lemmings.length, "image:", imageData, r, g, b, alpha, "x:"+x, "y:"+y, "comparing:"+color, "index:"+Math.floor((y * canvas.width + x) * 4));
        throw "This should not happen";
      }
  
      if(!Array.isArray(color[0])) {
        color = [ color ];
      }
  
      for(let i = 0; i < color.length; i++) {
        if(r === color[i][0] && g === color[i][1] && b === color[i][2]) {
          return true;
        }
      }
  
      return false;  
    }
  
    // >>> Prompt: instructions/get-pixel-index.0001.txt
    function getPixelIndex(x, y, width) {
      x = Math.round(x);
      y = Math.round(y);
  
      return ((y * width) + x) * 4;
    }
  
    function isColorOneOf(needle, haystack) {
      if(!Array.isArray(haystack[0])) {       // HUMAN: Cheat. This if-block.
        return (haystack[0] === needle[0] &&
          haystack[1] === needle[1] &&
          haystack[2] === needle[2]);
      }
  
      for (let i = 0; i < haystack.length; i++) {
        const color = haystack[i];
        
        if (color[0] === needle[0] &&
            color[1] === needle[1] &&
            color[2] === needle[2]) {
          return true;
        }
      }
      
      return false;
    }
  
    // Returns an array containing all the color bytes for the terrain colors
    function getTerrainColors() {
        return [ rockColorBytes, dirtColorBytes ];
    }
  
    // Check if given position contains any of the colors in the "haystack" array
    function isPixelOneOf(imageData, x, y, haystack) {
        const needle = getPixelColor(imageData, x, y);
        return isColorOneOf(needle, haystack);
    }
  
    // >>> a helper function some implementation of Climber added
    function bound(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }
  
    // Remove all antialiasing so that we can easily check collisions.
    // >>> Prompt: instructions/remove-terrain-smoothing.0001.txt
    function clearSmoothingOfTerrain(canvas, keepColors) {
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Loop through every pixel
      for (let i = 0; i < imageData.data.length; i += 4) {
        let r = imageData.data[i];
        let g = imageData.data[i + 1];
        let b = imageData.data[i + 2];
        
        // Check if the pixel is not one of the terrain colors
        if (!keepColors.some(color => r === color[0] && g === color[1] && b === color[2])) {
          // If the pixel is not already black, set it to black
          if (r !== 0 || g !== 0 || b !== 0) {
            imageData.data[i] = 0;
            imageData.data[i + 1] = 0;
            imageData.data[i + 2] = 0;
            imageData.data[i + 3] = 255;
          }
        }
      }
  
      ctx.putImageData(imageData, 0, 0);
    }
  
    // >>> Prompt: instructions/coordinates-div.0001.txt
    function rgbToHex(r, g, b) {
      if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
      return ((r << 16) | (g << 8) | b).toString(16);
    }
  
    // HUMAN: cheat, I needed a seedable RNG
    function RNG(seed) {
        var m = 2**35 - 31
        var a = 185852
        var s = seed % m
        return function () {
            return (s = s * a % m) / m
        }
    }
  
    // update the background buffer function 
    function setBackgroundBuffer() {
      background.drawImage(canvas, 0, 0);
    }

    // >>> Prompt: instructions/serialization-localstorage.0001.txt
    function serialize(data) {
      return JSON.stringify(data);
    }
    
    // >>> Prompt: instructions/serialization-localstorage.0001.txt
    function deserialize(data) {
      return JSON.parse(data);
    }
    
    // >>> Prompt: instructions/serialization-localstorage.0001.txt
    function saveToLocalStorage(key, data) {
      const serializedData = serialize(data);
      localStorage.setItem(key, serializedData);
    }
    
    // >>> Prompt: instructions/serialization-localstorage.0001.txt
    function getFromLocalStorage(key) {
      const data = localStorage.getItem(key);
      return deserialize(data);
    }

    function fadeInCanvas() {
      if(canvasOpacity >= 1) {
        canvasOpacity = 1;
        canvas.style.opacity = canvasOpacity;
        canvasFadeDirection = null;
        return;        
      }
      canvasOpacity += 0.02;
      canvas.style.opacity = canvasOpacity;
    }
    
    function fadeOutCanvas() {
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

      canvasFadeDirection = "out";

      //
      // Completion bonuses
      //

      // ...extra lemmings
      const extraLemmings = scoreKeeper.getSavedLemmings() - levelData.goal.survivors;
      if(extraLemmings > 0) {
        scoreKeeper.addScore( extraLemmings * 100, "More lemmings" );
      }

      // ...extra resources
      scoreKeeper.addScore(levelDataResources["Climber"] * 50, "Climbing");
      scoreKeeper.addScore(levelDataResources["Floater"] * 50, "Floating");
      scoreKeeper.addScore(levelDataResources["Bomber"] * 50, "Bombing");
      scoreKeeper.addScore(levelDataResources["Blocker"] * 50, "Blocking");
      scoreKeeper.addScore(levelDataResources["Builder"] * 50, "Building");
      scoreKeeper.addScore(levelDataResources["Basher"] * 50, "Bashing");
      scoreKeeper.addScore(levelDataResources["Miner"] * 50, "Mining");
      scoreKeeper.addScore(levelDataResources["Digger"] * 50, "Digging");

      // ...number of attempts needed
      switch(persisted.currentLevelAttempts) {
        case 3 : scoreKeeper.addScore(125, "Attempts 1"); break;
        case 2 : scoreKeeper.addScore(250, "Attempts 2"); break;
        case 1 : scoreKeeper.addScore(500, "Attempts 3"); break;
      }

      // ...time bonus (seconds remaining * 10)
      scoreKeeper.addScore((levelData.resources.time - elapsedLevelTime) / 100, "Time");

      // Store the score for the level (so that it can be improved at a later date)
      persisted.levelScores[levelData.level] = scoreKeeper.getScore();

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
      saveToLocalStorage('persisted', persisted);

      TextEffectMorph.init({
        text : "SUCCESS!",
        placeOverCanvas:canvas,
        onAnimationDone: () => effectsToUpdate.delete("TextEffectMorph")
      });
      effectsToUpdate.set("TextEffectMorph", TextEffectMorph);
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

    function setupUI()
    {
      const actions = document.getElementById('lemming-actions');
      if(actions) {
        if(levelData.ui.showActions === false) {
          actions.style.display = "none";
        } else {
          actions.style.display = "table";
        }
      }

      const startElt = document.getElementById("start-game");
      if(startElt) {
        if(levelData.ui.showStartGame === true) {
          startElt.style.display = "block";
        } else {
          startElt.style.display = "none";
        }
      }

      const settingsElt = document.getElementById("settings");
      if(settingsElt) {
        if(levelData.ui.showSettings === true) {
          settingsElt.style.display = "block";
          const rect = canvas.getBoundingClientRect();
          settingsElt.style.position = "absolute";
          settingsElt.style.top = (rect.bottom - 120) + "px";
          settingsElt.style.left = (rect.right - 180) + "px";
        } else {
          settingsElt.style.display = "none";
        }
      }

      // Update resource-count on the HTML buttons
      let spans = document.querySelectorAll('#lemming-actions .count');
      if(spans) {
        for(let span of spans) {
          span.innerHTML = levelDataResources[span.parentElement.getAttribute("data-resource")]
        }
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
        // Update and draw each lemming
        perfMonitor.start("lemmings-update");
        lemmings.forEach((lemming) => {
          lemming.update();
          lemming.draw();
          
          // HUMAN: There can be multiple lemmings selected, only the last one will be visible to us
          if (__DEBUG__) {
            if(lemming.isSelected) {
              updateInfoDiv(lemming);
            }
          }
    
          if (lemming.isDead) {
            // Remove dead lemmings from the array as optimization
            const index = lemmings.indexOf(lemming);
            lemmings.splice(index, 1);

            for(let i = 0; i < 50; i++) {
              // Human: I cheated and added this color variation myself. :/ 
              const p = new Particle(lemming.x + Math.random() * 20 - 10, lemming.y + Math.random() * 20 - 10);
              p.color = i < 20 ? "#55ff55" : "#5555ff";
              particles.push(p);
            }
          }

          // >>> Prompt: instructions/score.0001.txt
          if (lemming.rescued) {
            const index = lemmings.indexOf(lemming);
            lemmings.splice(index, 1);
            scoreKeeper.addSavedLemmings(1);
            scoreKeeper.addScore(100, "Saved lemming");
            console.log(`Lemming ${lemming.id} reached the finish! Saved: ${scoreKeeper.getSavedLemmingsCount()} lemmings`);
            // HUMAN TODO: Do some effect here (also sound?)
          }
        });
        perfMonitor.end("lemmings-update");
      }

      perfMonitor.start("sprites-update");
      for(let i = 0; i < sprites.length; i++) {
        sprites[i].update();
      }
      perfMonitor.end("sprites-update");

      perfMonitor.start("particles-update");
      particles.forEach((particle) => {
          particle.update();
          particle.draw();
  
          // Remove dead particles from the array
          if (particle.life <= 0) {
            const index = particles.indexOf(particle);
            particles.splice(index, 1);
          }
      });
      perfMonitor.end("particles-update");

      perfMonitor.start("effects-update");
      for(let fx of effectsToUpdate) {
        // HUMAN TODO: implement time-delta all over the place
        fx[1].update(1000/60);
      }
      perfMonitor.end("effects-update");

      // Game over / success check
      if(levelData.disableGame === false && playing && ((levelDataResources.time - elapsedLevelTime) <= 0 || getLemmingsRemaining() === 0)) {
        playing = false;
        if(scoreKeeper.getSavedLemmingsCount() >= levelData.goal.survivors) {
          levelCompleted();
        } else {
          levelFailed();
        }
      }

      // Schedule the next frame
      reqAnimFrameId = requestAnimationFrame(update);

      perfMonitor.end("all-of-update");
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
        adjustCanvasHeight();
        setupUI();        
      });
 
      if (__DEBUG__ && coordinatesDiv) {
        // >>> Prompt: instructions/coordinates-div.0001.txt
        canvas.addEventListener("mousemove", function(event) {
          const rect = canvas.getBoundingClientRect();

          // >>> Prompt: instructions/screen-coord-to-canvas.0001.txt
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
        
          const x = Math.floor((event.clientX - rect.left) * scaleX);
          const y = Math.floor((event.clientY - rect.top) * scaleY);

          const imageData = ctx.getImageData(x, y, 1, 1);
          const pixel = imageData.data;
  
          const color = "#" + ("000000" + rgbToHex(pixel[0], pixel[1], pixel[2])).slice(-6);
  
          coordinatesDiv.innerHTML = "X: " + x + ", Y: " + y + " | Color: " + color;
        });
      }

      canvasEventsListening = true;
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
          clearPixel(x, y);
        }
      }
    }

    // >>> Prompt: score.0001.txt
    function checkLemmingFinish(lemming, finish) {
      // Human: hardcoded stuff, it should be around where the door is on the house
      const isReached = isPointWithinCircle(
        lemming.x + lemming.width / 2,
        lemming.y + lemming.height,
        finish.x + finish.radius - 20,
        finish.y + finish.radius - 20,
        20
      );

      return isReached;
    }

    function setupStartFinish()
    {
      if(levelData.start.x === null || !levelData.start.clear) {
        // debug: random on x axis -- clear upper levelData.start.radius/2
        for(let x = 0; x < canvas.width; x++) {
          for(let y = 0; y < (levelData.start.radius/2); y++) {
            clearPixel(x, y);
          }
        }
  
      } else if(levelData.start.clear) {
        // clear start zone
        clearSquare(levelData.start.x, levelData.start.y, levelData.start.radius);

        sprites.push(
          new AnimatedSprite(ctx, levelData.start.x - 30, Math.max(0, levelData.start.y), animationFrames["hatch"], { speed : 1, /* default settings */ })
        );
      }

      if(levelData.finish.clear) {
        clearSquare(levelData.finish.x, levelData.finish.y, levelData.finish.radius);
      }

      // Draw platform underneath finish area
      ctx.save();
      ctx.fillStyle = `rgb(${rockColorBytes.join(",")})`;
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

    function renderDecorations()
    {
      for(let i = 0; i < levelData.decorations.length; i++) {
        for(let j = 0; j < levelData.decorations[i].location.length; j++) {
          switch(levelData.decorations[i].type) {
            case "organics" :
              LlemmingsOrganics.drawEdgeVegetation(ctx, levelData.decorations[i].location[j]);
              break;
            default :
              throw "unknown decoration " + levelData.decorations[i].type;
          }
        }
      }
    }

    function capitalize(str)
    {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Human: Adjust height depending on aspect ratio. There's still more to do here.
    //        And frankly, I don't think this is best or even good practice today.
    function adjustCanvasHeight()
    {
      const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

      const canvases = document.getElementsByTagName("CANVAS");
      for(let c of canvases) {
        if(w/c.width > h/c.height){
          c.style.width = "calc("+c.width+" / "+c.height+" * 100vh)";
          c.style.height = "calc(100vh)";
        } else {
          c.style.width = "calc(100vw)";
          c.style.height = "calc("+c.height+" / "+c.width+" * 100vw)";
        }
      }
    }

    function keyBindPressed(action)
    {
      // Global actions
      switch(action) {
        case "toggle-pause":  togglePause();  return;
        case "restart-level": restartLevel(); return;
        case "exit-game": exitGame(); return;
      }

      if(playing && !autoPlaying && !levelData.disableGame) {
        switch(action) {
          case "select-next-creature":
            selectNextLemming();
            return;
          case "select-previous-creature":
            selectPreviousLemming();
            return;
          case "deselect-creature":
            deselectLemmings();
            return;
        }

        if(action.startsWith("apply-")) {
          let actName = capitalize(action.split("-")[1]);
          applyAction(actName);
        }
      }
    }

    // >>> Prompt: instructions/select-lemming.0001.txt
    function selectNextLemming() {
      const index = lemmings.findIndex(lemming => lemming.isSelected);
      let nextIndex = index === -1 ? 0 : index + 1;
      if (nextIndex >= lemmings.length) {
        nextIndex = 0;
      }
      deselectLemmings();
      while (nextIndex !== index) {
        if (lemmings[nextIndex].isSpawned && !lemmings[nextIndex].isDead && !lemmings[nextIndex].rescued) {
          lemmings[nextIndex].isSelected = true;
          return;
        }
        nextIndex = (nextIndex + 1) % lemmings.length;
      }
    }
    
    // >>> Prompt: instructions/select-lemming.0001.txt
    function selectPreviousLemming() {
      const index = lemmings.findIndex(lemming => lemming.isSelected);
      let previousIndex = index === -1 ? lemmings.length - 1 : index - 1;
      if (previousIndex < 0) {
        previousIndex = lemmings.length - 1;
      }
      deselectLemmings();
      while (previousIndex !== index) {
        if (lemmings[previousIndex].isSpawned && !lemmings[previousIndex].isDead && !lemmings[previousIndex].rescued) {
          lemmings[previousIndex].isSelected = true;
          return;
        }
        previousIndex = (previousIndex - 1 + lemmings.length) % lemmings.length;
      }
    }
    
    // >>> Prompt: instructions/select-lemming.0001.txt
    function deselectLemmings() {
      lemmings.forEach(lemming => {
        if (lemming.isSelected) {
          lemming.isSelected = false;
        }
      });
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

    function reset()
    {
        console.log("Resetting");
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

        for(let i = 0; i < sprites.length; i++) {
          sprites[i].cleanUp();
        }
        // clear sprites array
        sprites.length = 0;

        perfMonitor.cleanUp();

        // clear particles
        particles = [];

        // remove all lemmings
        lemmings.length = 0;
        lastLemmingId = 0;
        doneSpawning = false;

        // clear map noise
        mapNoiseHash.length = 0;

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
        if(coordinatesDiv) {
          coordinatesDiv.innerHTML = "";
        }
        if(infoDiv) {
          infoDiv.innerHTML = "";
        }

        // for clarity
        background = undefined;
        collisionLayer = undefined;
        console.log("Reset done.");
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

    function init(canvasElt, givenLevel = {}, debug = false)
    {
      __DEBUG__ = debug;
  
      // Override by givenLevel if it specifies it
      if(givenLevel.__DEBUG__ !== undefined && givenLevel.__DEBUG__ !== null) {
        __DEBUG__ = givenLevel.__DEBUG__;
      }

      // Override always.
      if(document.location.search.includes("?DEBUG")) {
        console.warn("Forcing debug due to location")
        __DEBUG__ = true;
      }

      if(!EDITOR_MODE) {
        perfMonitor.init(__DEBUG__);
      }

      levelData = getDefaultLevelData(givenLevel);

      if(false) {
        // lots of lemmings test (lemmings-update is at around 11-13ms at peak; 9-10ms without draw (!?))
        levelData.spawnInterval = 17;
        levelData.resources.lemmings = 6000;
      }

      levelDataResources = { ...levelData.resources };

      autoPlaying = levelData.autoPlay;

      console.log("Current seed: ", levelData.seed);
      Math.random = RNG(levelData.seed);
  
      if(!canvas && !canvasElt) {
        throw "no existing canvas and no element given";
      } else if(canvasElt) {
        canvas = canvasElt;
        canvas.width = RESOLUTION_X;
        canvas.height = RESOLUTION_Y;

        /*
        Human note: TOOD: Map-generation on mobile devices
        const dpr = window.devicePixelRatio;
        canvas.width = Math.floor(canvas.width * dpr);
        canvas.height = Math.floor(canvas.height * dpr);
        ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.scale(dpr, dpr);
        */
      }
      ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false });

      if(!EDITOR_MODE) {
        adjustCanvasHeight();
      }
      setupUI();

      initBackground();

      generateMapNoiseHash();
      generateMap(canvas.width, canvas.height);

      if (levelData.shapes) {
        drawShapes(ctx, levelData.shapes);
        ctx.lineWidth = 1;
      }

      setupStartFinish();

      clearSmoothingOfTerrain(canvas, [...terrainColorBytes, waterColorBytes]);
      // console.log("Unique colors:", getUniqueColors(canvas));

      // Human notes:
      // collisionLayer will be used for collision checking.
      // Everything that is collidable terrain should be above this
      //
      collisionLayer = ctx.getImageData(0,0,canvas.width,canvas.height);

      setGradients(ctx, levelData.gradients);
      gradientsData = backupGradients(levelData.gradients);     // needed for when we blow stuff up or dig

      renderDecorations();
      renderDirtTexture();
      renderRockTexture();
      renderWaterTexture();

      if(!canvasEventsListening) {
        startCanvasEventListeners();
      }

      LlemmingsFCT.init(canvas);
      effectsToUpdate.set("FloatingCombatText", LlemmingsFCT);

      // Create sound effects
      AudioSamples.createSamples(["BD-0.25"]);

      // Create an instance of the ScoreKeeper class
      scoreKeeper = new GameUtils.ScoreKeeper(canvas, levelData.goal.survivors, 0, !levelData.ui.showScore || EDITOR_MODE);

      // HUMAN: Pre-create lemmings -- we need this early to determine level failure/success
      createLemmings(levelDataResources.lemmings);

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

    
    function _start()
    {
      if(!EDITOR_MODE) {
        if(persisted.currentLevel === levelData.level) {
          persisted.currentLevelAttempts++;
        }
        saveToLocalStorage('persisted', persisted);
      }

      // Spawn a new lemming every interval
      gameIntervals["lemmingSpawner"] = setInterval(spawnLemming, levelData.spawnInterval);
      
      playing = true;
      console.log("Starting level", levelData.level);
    }

    async function generateSprites()
    {
      // Create sprites (for now just one!)
      if(!animationFrames["hatch"]) {
        animationFrames["hatch"] = await GameUtils.generateAnimationFrames(96, 32, 90, LlemmingsArt.drawHatch);
        console.log("Created animation for hatch");
      }
    }

    /**
     * Human: This is the entry point when page is loaded/refreshed.
     * Human: Note that it is NOT run if in level editor.
     * Human: It starts the intro screen of the game.
     */
    async function _runOnce(resetLocalStorage = false)
    {
      // Retrieve from local storage
      let tmpPersisted = getFromLocalStorage('persisted');

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

      await generateSprites();

      LlemmingsKeyBindings.startKeyBinds(keyBindPressed);

      // Test inits
      // init(document.getElementById('canvas'), { seed : null, resources : { lemmings : 150, Bomber : 99 } }, true);
      // init(document.getElementById('canvas'), { seed : 1682936781219 }, true);

      // This is the init with level progression
      // init(document.getElementById('canvas'), LlemmingsLevels[persisted.currentLevel], true);

      // This is the real init for the intro
      init(document.getElementById('canvas'), LlemmingsLevels[0], true);

      // console.warn("DEBUG: Pausing intro by default!"); togglePause();

      // start();
      preStart();
    }

    function startGame()
    {
      // "Start game" button on intro screen
      if(isPaused) {
        togglePause();
      }

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
     * Statements below this are to be run when this file is included.
     * Keep at a minimum.
     */

    // Don't run when in level editor
    if(document.location.href.includes("/editor/")) {
      EDITOR_MODE = true;
    }

    if(!EDITOR_MODE) {
      document.fonts.ready.then(function () {
        _runOnce(false);
      });
    }

    return {
      getSeed : () => { return levelData.seed; },
      init : init,
      start : _start,
      startGame : startGame,          // call when "Start game" is clicked on intro screen
      toggleSetting : toggleSetting,
      togglePause : togglePause,
      applyAction : applyAction,
      reset : reset,
      restart : restartLevel,
      getDefaultLevelData : getDefaultLevelData,
      drawShapes : drawShapes,
      generateSprites : generateSprites,
    }
  })();
