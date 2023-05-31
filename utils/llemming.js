"use strict";
var Llemming = (() => {
    const lemmingBodyColor = [0x00, 0x00, 0xff];
    const lemmingHairColor = [0x00, 0xff, 0x00];
    const GRAVITY = 0.08; // Adjust this until falling looks good
    const VEL_CLIMB = 1;    // Cheat. HUMAN added this undeclared variable.
    const BUILDER_LOOK_AHEAD = 10;
    const DIGGER_LOOK_AHEAD = 4;
    const DIGGER_SPEED_FACTOR = 0.4;    // HUMAN: Changed my mind; changed from 0.2

    let __DEBUG__, autoPlaying, canvas, collisionLayer, levelData, lemmings, ctx, background;

    function init(sharedVars)
    {
      __DEBUG__ = sharedVars.__DEBUG__;
      autoPlaying = sharedVars.autoPlaying;
      canvas = sharedVars.canvas;
      levelData = sharedVars.levelData;
      lemmings = sharedVars.lemmings;
      ctx = sharedVars.ctx;
      background = sharedVars.background;

      collisionLayer = World.getCollisionLayer();
    }

    // Returns an array containing all the color bytes for the terrain colors
    function getTerrainColors() {
        return [ World.rockColorBytes, World.dirtColorBytes ];
    }
  
    // Check if given position contains any of the colors in the "haystack" array
    function isPixelOneOf(imageData, x, y, haystack) {
        const needle = GameUtils.getPixelColor(imageData, x, y);
        return GameUtils.isColorOneOf(needle, haystack);
    }
  
    // >>> a helper function some implementation of Climber added
    function bound(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }
  

    // HUMAN: Added this to make it easier for the LLM (copy of clearPixel)
    // >>> Prompt: instructions/optimization-putImageData-prune.0001.txt
    function setPixel(x, y, colorBytes) {
      if (x >= canvas.width || y >= canvas.height || x < 0 || y < 0) {
        return;
      }

      background.fillStyle = `rgba(${colorBytes.join(',')},1)`;
      background.fillRect(x, y, 1, 1);

      if(collisionLayer) {
        const pixelIndex = GameUtils.getPixelIndex(x, y, canvas.width);
        collisionLayer.data[pixelIndex] = colorBytes[0];
        collisionLayer.data[pixelIndex + 1] = colorBytes[1];
        collisionLayer.data[pixelIndex + 2] = colorBytes[2];
        collisionLayer.data[pixelIndex + 3] = 255;
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


    function getHeightAdjustment(lem)
    {
      let heightAdjustment = 0;
      for(let i = 0; i < 6; i++) {
        if(isPixelOneOf(collisionLayer, lem.x + lem.width / 2, lem.y + lem.height - i, World.terrainColorBytes)) {
          heightAdjustment--;
        } else {
          break;
        }
      }

      return heightAdjustment;
    }
   

    // >>> Prompt: instructions/pixel-is-color.0001
    // >>> HUMAN CHEAT: Arrrgh. After 5-6 attempts, I give up. I rewrote the function myself! It kept omitting, 
    //     e.g.: if(!Array.isArray(color[0])) { color = [ color ]; }
    function pixelIsColor(imageData, x, y, color, debug) {
        x = Math.round(x);
        y = Math.round(y);
        
        const [r, g, b, alpha] = GameUtils.getPixelColor(imageData, x, y);
    
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

          if(isPixelOneOf(collisionLayer, lemming.x + (lemming.width / 2), lemming.y + (lemming.height / 2), [World.rockColorBytes])) {
            console.log("Skipping dig due to rock in the center");
            break;
          }

          let startX = (lemming.velX > 0 ? lemming.width - 2 : - 2);
          let endX = lemming.velX > 0 ? lemming.width + 2 : 2;
          for(let offsetX = startX; offsetX < endX; offsetX++) {
            if(isPixelOneOf(collisionLayer, Math.round(lemming.x + offsetX), Math.round(lemming.y + offsetY), [World.rockColorBytes, World.blackColorBytes])) {
              // setPixel((lemming.x + offsetX), (lemming.y + offsetY), [255, 255, 255]);
              continue;
            }
            World.clearPixel((lemming.x + offsetX), (lemming.y + offsetY));
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
            lemming.velX = lemming.velX < 0 ? -lemming.maxVelX : lemming.maxVelX;
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

        for(let offsetY = -2; offsetY < 2; offsetY++) {
          if(lemming.y <= 0 || lemming.y >= canvas.height) {
            break;
          }

          if(isPixelOneOf(collisionLayer, lemming.x + (lemming.width / 2), lemming.y + lemming.height, [World.rockColorBytes])) {
            console.log("Skipping dig due to rock in the center");
            break;
          }

          for(let offsetX = -2; offsetX < lemming.width + 2; offsetX++) {
            if(isPixelOneOf(collisionLayer, Math.round(lemming.x + offsetX), Math.round(lemming.y + lemming.height + offsetY), [World.rockColorBytes, World.blackColorBytes])) {
              continue;
            }
            World.clearPixel(Math.round(lemming.x + offsetX), Math.round(lemming.y + lemming.height + offsetY));
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
            lemming.velX = lemming.velX < 0 ? -lemming.maxVelX : lemming.maxVelX;
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
          lemming.bridgePixels = getRectanglePoints(lemming, 25, 80, 2, World.terrainColorBytes, -lemming.velX * 10);
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
              setPixel(pixelX, pixelY, World.dirtColorBytes);
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
            lemming.velX = lemming.velX < 0 ? -lemming.maxVelX : lemming.maxVelX;
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
            World.clearPixel(xCoord, yCoord);
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
          Actions.deselectLemmings();
          lemming.isSelected = true;
          Actions.applyAction(act.action)
          lemming.isSelected = false;
          lemming.executedActions.push(i);
          return true;
        }
      }
  
      return false;
    }
  

    // lemming object
    // >>> Prompt: instructions/movement-collisions.0001.txt
    // >>> Prompt: instructions/movement-collisions.0002.txt
    // >>> Prompt: instructions/movement-collisions.0003.txt
    // >>> Prompt: instructions/lemming.update.0001.txt
    // >>> Prompt: instructions/lemming.update.0002.txt
    class Lemming
    {
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

        const handAngle = (Math.PI/4) * Math.sin(this.age/10); // adjust the divisor to change speed

        // back hand
        ctx.fillStyle = "#d0d0d0";
        ctx.beginPath();
        ctx.arc(
          this.x + this.width / 2 + 10 * Math.cos(-handAngle + 1.3),
          this.y + this.height / 2 + 5 * Math.sin(-handAngle + 1.3),
          2,
          0,
          2 * Math.PI
        );
        ctx.fill();

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
  
        // front hand (back hand is behind lemming)
        ctx.fillStyle = "#d0d0d0";
        ctx.beginPath();
        ctx.arc(
          this.x + this.width / 2 + 10 * Math.cos(handAngle + 1.3),
          this.y + this.height / 2 + 5 * Math.sin(handAngle + 1.3),
          2,
          0,
          2 * Math.PI
        );
        ctx.fill();

        // is selected
        if (this.isSelected) {
          // >>> Prompt: instructions/lemming-selected.0001.txt
          const maxRadius = 20;
          const minRadius = 10;
          const deltaRadius = maxRadius - minRadius;
          const pulseSpeed = 0.05;
          const ageMod = this.age % (deltaRadius / pulseSpeed) + 1;
          const currentRadius = minRadius + deltaRadius / 2 + deltaRadius / 2 * Math.sin(pulseSpeed * ageMod);

          ctx.save();
          ctx.lineWidth = 4;
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 / (currentRadius/8)})`;
          ctx.beginPath();
          ctx.arc(this.x + this.width / 2, this.y + this.height / 2, currentRadius, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.restore();
        }
  
        // debug
        if (false && __DEBUG__) {
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
        let isGroundUnderneath = isPixelOneOf(collisionLayer, this.x + this.width / 2, this.y + this.height + 1, World.terrainColorBytes);
  
        // Check if we hit a wall on the x axis
        // >>> Prompt: instructions/wall-hit-fix.0001.txt
        let hitWallOnLeft = this.velX < 0 && isPixelOneOf(collisionLayer, this.x - 1, this.y + this.height / 2, World.terrainColorBytes);
        let hitWallOnRight = this.velX > 0 && isPixelOneOf(collisionLayer, this.x + this.width + 1, this.y + this.height / 2, World.terrainColorBytes);
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
        const isWaterBelow = pixelIsColor(collisionLayer, this.x + this.width / 2, this.y + this.height + 1, World.waterColorBytes);
  
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
            if (!digging 
                && !building
                && this.velY === 0
                && (hitWallOnLeft 
                    || hitWallOnRight 
                    || (this.velX < 0 && this.x <= this.width) 
                    || (this.velX > 0 && this.x >= canvas.width - this.width)
                  )
                ) {
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
                // this.velX = (this.velX > 0 ? this.maxVelX : -this.maxVelX);
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
  
            this.x = Math.min(this.x, canvas.width - this.width);
            this.x = Math.max(this.x, 0);
            this.y += this.velY;
        }
        this.age++;

        // HUMAN: Testing "beating level"
        if(false && this.age === 1) {
          this.x = 700;
          this.y = 466;
          // this.velX = -this.velX;
        }

      }
    }

    return {
      init : init,
      Lemming : Lemming
    }
})();
