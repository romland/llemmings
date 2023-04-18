"use strict";
var Llemmings = (function () {
    // Get debug DOM elements
    const coordinatesDiv = document.getElementById("coordinatesDiv");
    const infoDiv = document.getElementById("infoDiv");
  
    // Colors
    const blackColorBytes = [0x0, 0x0, 0x0];
    const waterColorBytes = [0x00, 0x77, 0xbe]; // [0, 119, 190];
    const rockColorBytes  = [0x88, 0x88, 0x88]; // [136, 136, 136];
    const dirtColorBytes  = [0x4a, 0x2e, 0x00]; // [74, 46, 0];
    const lemmingBodyColor = [0x00, 0x00, 0xff];
    const lemmingHairColor = [0x00, 0xff, 0x00];
    const terrainColorBytes = [ rockColorBytes, dirtColorBytes ];
  
    // Set up canvas (+related)
    let canvas, ctx;        // set by init().
    let background; // global variable to store canvas image data (restored in main loop below somewhere)
    let oldImgData; // check collisions against this (array of 4 bytes / pixel)

    // Kept around for clean-up reasons
    let reqAnimFrameId = null;
    let canvasEventsListening = false;
    const gameIntervals = {};

    // World settings
    const GRAVITY = 0.03; // Adjust this until falling looks good
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
    const BUILDER_LOOK_AHEAD = 1;
    const BUILD_MATERIAL_CARRIED = 120;
    const BUILD_PER_FRAME_MAX = 10;
    const DIGGER_LOOK_AHEAD = 4;
    const DIGGER_SPEED_FACTOR = 0.4;    // HUMAN: Changed my mind; changed from 0.2
  
    // Debug
    let __DEBUG__ = false;
  
    // Game-play related
    let isPaused = false;
    const lemmings = [];
    let levelData;

    // Create a new lemming and add it to the array of lemmings
    // HUMAN: This is just for easy testing for now.
    function spawnLemming() {
      if(isPaused)
        return;

      if(lastLemmingId >= levelData.resources.lemmings) {
        return;
      }
  
      const newLemming = new Lemming();
      newLemming.id = ++lastLemmingId;

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

      newLemming.velX = newLemming.maxVelX; // Walk to the right by default
  
      if(newLemming.id === 1) {
        // Builder building leftwards
        newLemming.velX = -newLemming.maxVelX;
        newLemming.action = "Builder";
      }
  
      //if(newLemming.id % 2) {
      if(newLemming.id === 7 || newLemming.id === 5) {
        newLemming.action = "Climber";
      }
  
      if(newLemming.id === 2) {
        newLemming.action = "Miner";
      }
  
      if(newLemming.id === 3) {
        newLemming.action = "Miner";
      }
  
      if(newLemming.id === 4) {
        newLemming.actions = [
          { action: "Builder", x : 727, y : 175, rad : 5, },
          { action: "Builder", x : 675, y : 158, rad : 3, },
          // { action: "Builder", x : 727, y : 175, rad : 5, },
          // { action: "Builder", x : 727, y : 175, rad : 5, },
        ];
      }
  
      if(newLemming.id === 12) {
        newLemming.action = "Digger";
      }
  
      if(newLemming.id === 10) {
        newLemming.action = "Blocker";
      }
      
      if(newLemming.id === 11) {
        // Builder building rightwards
        newLemming.action = "Builder";
        newLemming.isSelected = true;
      }
      
      if(newLemming.id === 13) {
        // Test left-walking Basher
        newLemming.action = "Basher";
        newLemming.velX = -newLemming.maxVelX;
      }
  
      if(newLemming.id === 14) {
        newLemming.action = "Floater";
      }
  
      if(newLemming.id === 21) {
        newLemming.actions = [
          { action: "Builder", x : 210, y : 169, rad : 10, },
          { action: "Builder", x : 277, y : 149, rad : 5,  },
          { action: "Builder", x : 347, y : 137, rad : 5,  },
          { action: "Builder", x : 414, y : 121, rad : 5,  }
        ];
      }
  
      if(newLemming.id === 18) {
        newLemming.action = "Climber";
      }
  
      console.log("Making new lemming a", newLemming.action, newLemming);
  
      lemmings.push(newLemming);
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
                    // background
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
          if(!isColorOneOf(getPixelColor(oldImgData, x, y), dirtColorBytes)) {
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
          if(!isColorOneOf(getPixelColor(oldImgData, x, y), waterColorBytes)) continue;
          
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
          if(!isColorOneOf(getPixelColor(oldImgData, x, y), rockColorBytes)) {
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
        }
      }
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
        this.maxVelX = 0.2;
        this.deadlyVelY = 3;
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.isSelected = false;
        this.onGround = false;
        this.isClimbing = false;
        this.isDead = false;
        this.action = null;
        this.actionStarted = false;
  
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
            ctx.font = "7px Arial";
            ctx.strokeText(this.action, this.x - 5, this.y - 5);
            }
        }
      }
  
      update() {
        doProgrammedActions(this);
  
        if (this.y >= canvas.height - (this.height + this.velY + 1)) {
            this.isDead = true;
            return;
        }
  
        if (this.standStillUntil && this.standStillUntil < this.age) {
          this.standStillUntil = null;
          this.velX = -this.standStillDirection;
        }
  
        // Check if ground is under us or not
        let isGroundUnderneath = isPixelOneOf(oldImgData, this.x + this.width / 2, this.y + this.height + 1, terrainColorBytes);
  
        let heightAdjustment = 0;
  
        if (isGroundUnderneath) {
            heightAdjustment = 0;
            for(let i = 0; i < 6; i++) {
              if(isPixelOneOf(oldImgData, this.x + this.width / 2, this.y + this.height - i, terrainColorBytes)) {
                heightAdjustment--;
              } else {
                break;
              }
            }
        }
  
        // Check if we hit a wall on the x axis
        // >>> Prompt: instructions/wall-hit-fix.0001.txt
        let hitWallOnLeft = this.velX < 0 && isPixelOneOf(oldImgData, this.x - 1, this.y + this.height / 2, terrainColorBytes);
        let hitWallOnRight = this.velX > 0 && isPixelOneOf(oldImgData, this.x + this.width + 1, this.y + this.height / 2, terrainColorBytes);
        let blockedByBlocker = false;
  
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
        const isWaterBelow = pixelIsColor(oldImgData, this.x + this.width / 2, this.y + this.height + 1, waterColorBytes);
  
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
  
        if (this.action === "Builder") {
          // HUMAN: TODO: Just use 'digging' for now -- same concept
          digging = build(this);
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
            if (!digging && this.velY === 0 && (hitWallOnLeft || hitWallOnRight || this.x <= this.width || this.x >= canvas.width - this.width)) {
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
                    console.log("Death by heigthAdjustment")
                    this.isDead = true;
                    return;
                }
            }
  
            // Check if this is a Bomber, and if so create a hole
            // TODO: Need to make nearby aliens die...
            if (this.action === "Bomber") {
                createHole(this.x, this.y + this.height);
                this.isDead = true;
                return;
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
            this.age++;
        }
      }
    }
  
  
    // =========================================================================
    // Builder
    // >>> Prompt: instructions/builder.0001.txt
    // >>> Prompt: instructions/builder.0002.txt
  
    function build(lemming)
    {
        if (!lemming.onGround) {
            return false;
        }
  
        const startX = Math.floor(
          lemming.velX < 0
            ? lemming.x - BUILDER_LOOK_AHEAD
            : lemming.x + lemming.width + BUILDER_LOOK_AHEAD
        );
  
        const startY = Math.floor(lemming.y + lemming.height) + 1;
  
        if (startX >= canvas.width || startY >= canvas.height) {
            return false;
        }
  
        let pixelsBuilt = 0;
        if(!lemming.totalPixelsBuilt) {
          lemming.totalPixelsBuilt = 0;
        }
  
        let y = startY
        // HUMAN: TODO: This should check end of the bridge, not where lemming is?
        const obstacleOnLeft = lemming.velX < 0 && isPixelOneOf(oldImgData, startX - 1, y - lemming.height / 2, terrainColorBytes);
        const obstacleOnRight = lemming.velX > 0 && isPixelOneOf(oldImgData, startX + 1, y - lemming.height / 2, terrainColorBytes);
        
        if (obstacleOnLeft || obstacleOnRight) {
          // Do nothing
        } else {
          if(!lemming.actionStarted) {
            // Find ground within 5 pixels of feet
            let addY = 0;
            for(let i = 0; i < 5; i++) {
              if(!isPixelOneOf(oldImgData, startX, startY + addY, terrainColorBytes)) {
                addY += 1;
              } else {
                break;
              }
            }
  
            if(addY) {
              // Create a (free) platform straight under the feet since we are on a slope
              const offset = lemming.velX < 0 ? -1 : 0;
              for(let i = (lemming.velX < 0 ? -BUILDER_LOOK_AHEAD : 0); i < lemming.width + BUILDER_LOOK_AHEAD; i++) {
                setPixel(Math.floor(lemming.x) + i, startY + offset, dirtColorBytes);
                setPixel(Math.floor(lemming.x) + i, startY + (offset+1), dirtColorBytes);
              }
              lemming.actionStarted = true;
            }
          }
  
          for (let x = startX; x < canvas.width && x < startX + 4 && pixelsBuilt <= BUILD_PER_FRAME_MAX; x++) {
            // HUMAN: TODO: This will allow for a lemming to build more than totalPixelsBuilt by at most BUILD_PER_FRAME -- need check
            if (isPixelOneOf(oldImgData, x, y, blackColorBytes)) {
              setPixel(x, y, dirtColorBytes);
              pixelsBuilt++;
              lemming.actionStarted = true;
            }
          }
          lemming.totalPixelsBuilt += pixelsBuilt;
        }
  
        if (obstacleOnLeft || obstacleOnRight || lemming.totalPixelsBuilt >= BUILD_MATERIAL_CARRIED) {
            lemming.totalPixelsBuilt = 0;
            lemming.standStillUntil = lemming.age + 120;
            lemming.standStillDirection = lemming.velX;
            lemming.action = null;
            lemming.actionStarted = false;
            return false;
        }
  
        return pixelsBuilt > 0;
    }
  
  
    // =========================================================================
    // Digger/Basher/Miner code
    // >>> Prompt: /instructions/digger-miner-basher.0001.txt
  
    function startDigging(lemming)
    {
      switch(lemming.action) {
        case "Basher":
          return bash(lemming);
        case "Digger":
          return dig(lemming);
        case "Miner":
          return mine(lemming);
      }
  
      return false;
    }
  
    // >>> Prompt: ./instructions/digger-miner-basher.0001.txt
    function bash(lemming)
    {
      if(!lemming.onGround) {
        return false;
      }
  
      const x = Math.round(lemming.x);
      const y = Math.round(lemming.y);
      const vx = Math.round(lemming.velX);
      const vy = Math.round(lemming.velY);
  
      let pixelsDug = 0, startX, facingX, facingY, prevDugX, prevDugY;
  
      // HUMAN: Cheat. I tried conveying the entire concept that it might not have moved, but came up short.
      //        The easy way out here would be to ask for a very narrow prompt to write the 'previouslyDug'
      //        code below, but that felt like a cheat too. One day all cheats will llemmingd. One day.
      if(!lemming.previouslyDugAt) {
        lemming.totalDug = 0;
        lemming.previouslyDugAt = {
          x : null,
          y : null,
          dug : null,
          ts : null,
        }
      }
  
      prevDugX = lemming.previouslyDugAt.x;
      prevDugY = lemming.previouslyDugAt.y;
  
      if(lemming.velX > 0) {
        facingX = x + lemming.width + vx + DIGGER_LOOK_AHEAD;
        facingY = y + (lemming.height/2);
        startX = x;
      } else if(lemming.velX < 0) {
        // facing and start are reversed
        facingX = x + 4;
        facingY = y + (lemming.height/2);
        startX = x - vx - DIGGER_LOOK_AHEAD;
      }
  
      if(isColorOneOf(getPixelColor(oldImgData, (lemming.velX < 0 ? startX : facingX), facingY), dirtColorBytes)) {
        for(let i = 0; i < lemming.height + 1; i++) {
          for(let j = startX; j < facingX; j++) {
            if(isColorOneOf(getPixelColor(oldImgData, j, y + i), dirtColorBytes)) {
              clearPixel(j, y + i);
              pixelsDug++;
              lemming.actionStarted = true;
            }
          }
        }
  
        if(pixelsDug > 0) {
          prevDugX = x;
          prevDugY = y;
          lemming.previouslyDugAt.x = x;
          lemming.previouslyDugAt.y = y;
          lemming.previouslyDugAt.dug = pixelsDug;
          lemming.previouslyDugAt.ts = lemming.age;
          lemming.totalDug += pixelsDug;
        }
      }
  
      // If lemming has not moved to a new location, recall how much was dug originally.
      // HUMAN: Try to dig in the same spot at most 20 frames 
      //        (Note: If it moves really slow, the check will not work as it should take velocity into account)
      if(lemming.totalDug > 0 && prevDugX === x && prevDugY === y && lemming.previouslyDugAt.ts > (lemming.age-20)) {
        pixelsDug = lemming.previouslyDugAt.dug;
      }
  
      if(lemming.actionStarted && !pixelsDug) {
        console.log(lemming.action, lemming.id, "done after removing", lemming.totalDug, "pixels");    // HUMAN
        lemming.action = null;
        lemming.actionStarted = false;
        lemming.previouslyDugAt = null;
      }
      
      return pixelsDug > 0;
    }
  
  
    // >>> Prompt: instructions/digger.0001.txt
    // HUMAN: Cheat. A lot of the logic in here was largely hand-written. :/
    function dig(lemming)
    {
      const x = Math.round(lemming.x);
      const y = Math.round(lemming.y);
      const vx = Math.round(lemming.velX);
      const vy = Math.round(lemming.velY);
  
      if(!lemming.actionStarted && !lemming.onGround) {
        return false;
      }
  
      let pixelsDug = 0, startY, facingX, facingY, prevDugX, prevDugY;
  
      // initialize previously dug values if not present already
      if (!lemming.previouslyDugAt) {
        lemming.totalDug = 0;
        lemming.previouslyDugAt = { x: null, y: null, dug: null };
      }
  
      prevDugX = lemming.previouslyDugAt.x;
      prevDugY = lemming.previouslyDugAt.y;
  
      facingY = y + lemming.height + Math.ceil(DIGGER_LOOK_AHEAD/2);
      facingX = x + (lemming.width / 2);
      startY = y + lemming.height - vy - DIGGER_LOOK_AHEAD;
  
      for (let i = -3; i < lemming.width + 3; i++) {
        for (let j = startY - 1; j < facingY; j++) {
          if (isColorOneOf(getPixelColor(oldImgData, x + i, j), dirtColorBytes)) {
            clearPixel(x + i, j);
            pixelsDug++;
            lemming.actionStarted = true;
          }
        }
      }
  
      if (pixelsDug > 0) {
        lemming.velX = 0;
        prevDugX = x;
        prevDugY = y;
        lemming.previouslyDugAt.x = x;
        lemming.previouslyDugAt.y = y;
        lemming.previouslyDugAt.dug = pixelsDug;
        lemming.totalDug += pixelsDug;
      }
  
      // If lemming has not moved to a new location, recall how much was dug originally.
      if (prevDugX === x && prevDugY === y) {
        pixelsDug = lemming.previouslyDugAt.dug;
      }
  
      if (lemming.actionStarted && !pixelsDug) {
        console.log(lemming.action, lemming.id, "done after removing", lemming.totalDug, "pixels");  // HUMAN
        lemming.action = null;
        lemming.actionStarted = false;
        lemming.previouslyDugAt = null;
        return false;
      }
  
      return pixelsDug > 0;
    }
  
  
    // HUMAN: Copy of bash with minor human tweaks below
    function mine(lemming)
    {
      if(!lemming.onGround) {
        return false;
      }
  
      const x = Math.round(lemming.x);
      const y = Math.round(lemming.y);
      const vx = Math.round(lemming.velX);
      const vy = Math.round(lemming.velY);
  
      let pixelsDug = 0, startX, facingX, facingY, prevDugX, prevDugY;
  
      if(!lemming.previouslyDugAt) {
        lemming.totalDug = 0;
        lemming.previouslyDugAt = {
          x : null,
          y : null,
          dug : null
        }
      }
  
      prevDugX = lemming.previouslyDugAt.x;
      prevDugY = lemming.previouslyDugAt.y;
  
      if(lemming.velX > 0) {
        facingX = x + lemming.width + vx + DIGGER_LOOK_AHEAD;
        facingY = y + lemming.height + 1;
        startX = x;
      } else if(lemming.velX < 0) {
        facingX = x;
        facingY = y + lemming.height + 1;
        startX = x - vx - DIGGER_LOOK_AHEAD;
      }
  
      if(isColorOneOf(getPixelColor(oldImgData, facingX, facingY), dirtColorBytes)) {
        for(let i = 0; i < lemming.height + 2; i++) {
          for(let j = startX - 1; j < facingX; j++) {
            if(isColorOneOf(getPixelColor(oldImgData, j, y + i), dirtColorBytes)) {
              clearPixel(j, y + i);
              pixelsDug++;
              lemming.actionStarted = true;
            }
          }
        }
  
        if(pixelsDug > 0) {
          prevDugX = x;
          prevDugY = y;
          lemming.previouslyDugAt.x = x;
          lemming.previouslyDugAt.y = y;
          lemming.previouslyDugAt.dug = pixelsDug;
          lemming.totalDug += pixelsDug;
        }
      }
  
      // If lemming has not moved to a new location, recall how much was dug originally.
      if(prevDugX === x && prevDugY === y) {
        pixelsDug = lemming.previouslyDugAt.dug;
      }
  
      if(lemming.actionStarted && !pixelsDug) {
        // HUMAN: Dirty hack. Clear a few pixels under the lemming when done.
        for(let i = -1; i < DIGGER_LOOK_AHEAD; i++) {
          for(let j = -2; j < lemming.width + 2; j++) {
            if(isColorOneOf(getPixelColor(oldImgData, x + j, y + lemming.height + i), dirtColorBytes)) {
              clearPixel(x + j, y + lemming.height + i);
            }
          }
        }
        console.log(lemming.action, lemming.id, "done after removing", lemming.totalDug, "pixels");    // HUMAN
        lemming.action = null;
        lemming.actionStarted = false;
      }
      
      return pixelsDug > 0;
    }
  
    // === /Digger/Basher/Miner code
    // =========================================================================
  
  
  
    // >>> Prompt: instructions/bomber.0002.txt
    // HUMAN: This hole sucks, but well, at least it's a hole. And well, there's a lot of things going wrong here. It's a bad prompt apparently.
    function createHole(x, y) {
      var holeSize = 50;
      var rands = [];
  
      x = Math.floor(x);
      y = Math.floor(y);
            
      
      // Clear pixels in background and oldImgData arrays
      for (var yOffset = -holeSize/2; yOffset < holeSize/2; yOffset++) {
        for (var xOffset = -holeSize/2; xOffset < holeSize/2; xOffset++) {
          var xCoord = x + xOffset;
          var yCoord = y + yOffset
          
          if (xCoord >= 0 && xCoord < canvas.width && yCoord >= 0 && yCoord < canvas.height) {
            var noiseValue = 255;
            var alpha = Math.round(noiseValue * 255);
            
            // Set r, g, b, and a channels of pixel
            background.data[(yCoord * canvas.width + xCoord) * 4] = 0;
            background.data[(yCoord * canvas.width + xCoord) * 4 + 1] = 0;
            background.data[(yCoord * canvas.width + xCoord) * 4 + 2] = 0;
            background.data[(yCoord * canvas.width + xCoord) * 4 + 3] = alpha;
  
            oldImgData.data[(yCoord * canvas.width + xCoord) * 4] = 0;
            oldImgData.data[(yCoord * canvas.width + xCoord) * 4 + 1] = 0;
            oldImgData.data[(yCoord * canvas.width + xCoord) * 4 + 2] = 0;
            oldImgData.data[(yCoord * canvas.width + xCoord) * 4 + 3] = alpha;
          }
        }
      }
    }
  
  
    /**
     * Trigger action at position.
     * HUMAN: For easier debugging and demo-purposes.
     */
    function doProgrammedActions(lemming)
    {
      if (!lemming.actions || lemming.action) {
        return false;
      }
  
      const lx = lemming.x + (lemming.width/2);
      const ly = lemming.y + lemming.height;
  
      for(let i = 0; i < lemming.actions.length; i++) {
        if(lemming.actions[i].ran) {
          continue;
        }
  
        if(isPointWithinCircle(lx, ly, lemming.actions[i].x, lemming.actions[i].y, lemming.actions[i].rad)) {
          lemming.action = lemming.actions[i].action;
          lemming.actions[i].ran = true;
          return true;
        }
      }
  
      return false;
    }
  
    // >>> Prompt: instructions/actions-programmed.0001.txt
    function isPointWithinCircle(x,y,a,b,radius) {
      // calculate the distance between the point (x,y) and the center point (a,b) using Pythagorean theorem
      let distance = Math.abs(x - a) + Math.abs(y - b); 
      
      // compare the distance with the radius of the circle
      return distance <= radius;
    }
  
  
    // >>> Prompt: instructions/main-loop.0002.txt
    function togglePause()
    {
      isPaused = !isPaused;
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
  
  
    // >>> Prompt: instructions/actions.0001.txt
    function applyAction(action)
    {
      const selectedLemming = lemmings.find((lemming) => lemming.isSelected);
  
      // HUMAN: I had to add this myself
      if(!selectedLemming) {
        console.log("no selected lemming");
        return;
      }
  
      // HUMAN: I had to add this myself
      if(action !== "Bomber" && selectedLemming.action) {
        console.log("lemming already had an action");
        return;
      }
  
      // Get the button element that was clicked
      // >>> Prompt: instructions/actions-resource-counter.0001.txt
      const btn = document.activeElement;
      const countSpan = btn.querySelector('.count');

      if(levelData.resources[action] <= 0) {
        console.log("out of resource", action);
        return;
      }

      // Consume resource, update UI
      levelData.resources[action]--;
      countSpan.innerText = levelData.resources[action];

      switch (action) {
        case 'Climber':
          // >>> Prompt: instructions/climber.0001.txt
          selectedLemming.action = "Climber";
          selectedLemming.isSelected = false;
          break;
  
        case 'Floater':
          // >>> Prompt: instructions/floater.0001.txt
          selectedLemming.action = "Floater";
          selectedLemming.isSelected = false;
          break;
  
        case 'Bomber':
          // >>> Prompt: instructions/bomber.0001.txt
          selectedLemming.action = "Bomber";
          selectedLemming.isSelected = false;
          break;
  
        case 'Blocker':
          // >>> Prompt: instructions/blocker.0001.txt
          // >>> Prompt: instructions/blocker.0002.txt
          selectedLemming.action = "Blocker";
          selectedLemming.velX = 0;
          moveOverlappingLemmingsToRandomSideOfBlocker(selectedLemming);
          selectedLemming.isSelected = false;
          break;
  
        case 'Builder':
          selectedLemming.standStillUntil = 0;
          selectedLemming.standStillDirection = undefined;
  
          selectedLemming.action = "Builder";     // HUMAN: Added this.
          // selectedLemming.isSelected = false;  // HUMAN: Let builders remain selected for now
          break;
  
        case 'Basher':
          // >>> Prompt: ./instructions/digger-miner-basher.0001.txt
          selectedLemming.action = "Basher";     // HUMAN: Added this.
          selectedLemming.isSelected = false;
          console.log("Assigned basher to", selectedLemming.id);  // HUMAN: debug
          break;
  
        case 'Miner':
          // >>> Prompt: ./instructions/digger-miner-basher.0001.txt
          selectedLemming.action = "Miner";     // HUMAN: Added this.
          selectedLemming.isSelected = false;
          break;
  
        case 'Digger':
          // >>> Prompt: ./instructions/digger-miner-basher.0001.txt
          selectedLemming.action = "Digger";     // HUMAN: Added this.
          selectedLemming.isSelected = false;
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
        `;
    }
  
  
    // HUMAN: Added this to make it easier for the LLM (copy of clearPixel)
    function setPixel(x, y, colorBytes)
    {
      if (x >= canvas.width || y >= canvas.height || x < 0 || y < 0) {
        return;
      }
      
      const pixelIndex = getPixelIndex(x, y, canvas.width);
      oldImgData.data[pixelIndex] = colorBytes[0];
      oldImgData.data[pixelIndex + 1] = colorBytes[1];
      oldImgData.data[pixelIndex + 2] = colorBytes[2];
      oldImgData.data[pixelIndex + 3] = 255;
  
      background.data[pixelIndex] = colorBytes[0];
      background.data[pixelIndex + 1] = colorBytes[1];
      background.data[pixelIndex + 2] = colorBytes[2];
      background.data[pixelIndex + 3] = 255;
    }
  
    // HUMAN: this came from _one_ of the discarded Digger/Miner/Basher implementations.
    // The LLM kept getting tiny parts of this wrong over and over, so I lifted this implementation
    // to make it a bit easier to get something useful.
    // >>> Prompt: digger-miner-basher.0001.txt
    function clearPixel(x, y, col = 0) {
      if (x >= canvas.width || y >= canvas.height || x < 0 || y < 0) {
        return;
      }
      
      const pixelIndex = getPixelIndex(x, y, canvas.width);
      oldImgData.data[pixelIndex] = 0;
      oldImgData.data[pixelIndex + 1] = 0;
      oldImgData.data[pixelIndex + 2] = 0;
      oldImgData.data[pixelIndex + 3] = 255;

      if(background) {
        background.data[pixelIndex] = col;
        background.data[pixelIndex + 1] = col;
        background.data[pixelIndex + 2] = col;
        background.data[pixelIndex + 3] = (col ? 64 : 0);
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
  
        if(!r && !g && !b) continue;  // skip background color.
        
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
  
    function setBackgroundBuffer() {
      background = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
 
    function setupUI()
    {
      // Update resource-count on the HTML buttons
      let spans = document.querySelectorAll('#lemming-actions .count');
      if(!spans) {
        return;
      }
      for(let span of spans) {
        span.innerHTML = levelData.resources[span.parentElement.getAttribute("data-resource")]
      }
    }

    // >>> Prompt: instructions/main-loop.0001.txt
    function update() {
      if (isPaused) {
        reqAnimFrameId = requestAnimationFrame(update);
        return;
      }
      // Restore the background
      ctx.putImageData(background, 0, 0);
  
      // Update and draw each lemming
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
          console.log("removing dead lemming");
          for(let i = 0; i < 50; i++) {
            // I cheated and added this color variation myself. :/ 
            const p = new Particle(lemming.x + Math.random() * 20 - 10, lemming.y + Math.random() * 20 - 10);
            p.color = i < 20 ? "#55ff55" : "#5555ff";
            particles.push(p);
          }
        }
      });
  
      particles.forEach((particle) => {
          particle.update();
          particle.draw();
  
          // Remove dead particles from the array
          if (particle.life <= 0) {
            const index = particles.indexOf(particle);
            particles.splice(index, 1);
          }
        });
  
      // Schedule the next frame
      reqAnimFrameId = requestAnimationFrame(update);
    }

    function startCanvasEventListeners()
    {
      // >>> Prompt: instructions/selectable.0001.txt
      // add this after declaring canvas and ctx
      canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
  
        lemmings.forEach((lemming) => {
          if (mouseX >= lemming.x && mouseX <= lemming.x + lemming.width && mouseY >= lemming.y && mouseY <= lemming.y + lemming.height) {
            lemming.isSelected = true;
          } else {
            lemming.isSelected = false;
          }
        });
      });
  
      if (__DEBUG__) {
        // >>> Prompt: instructions/coordinates-div.0001.txt
        canvas.addEventListener("mousemove", function(event) {
          const x = event.offsetX;
          const y = event.offsetY;
  
          const imageData = ctx.getImageData(x, y, 1, 1);
          const pixel = imageData.data;
  
          const color = "#" + ("000000" + rgbToHex(pixel[0], pixel[1], pixel[2])).slice(-6);
  
          coordinatesDiv.innerHTML = "X: " + x + ", Y: " + y + " | Color: " + color;
        });
      }

      canvasEventsListening = true;
    }


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

    function setupStartFinish()
    {
      const clrRad = 80;

      if(levelData.start.x === null || !levelData.start.clear) {
        // debug: random on x axis -- clear entire upper clrRad/2
        for(let x = 0; x < canvas.width; x++) {
          for(let y = 0; y < (clrRad/2); y++) {
            clearPixel(x, y);
          }
        }
  
      } else if(levelData.start.clear) {
        // clear start zone
        clearSquare(levelData.start.x, levelData.start.y, clrRad);
      }

      if(levelData.finish.clear) {
        clearSquare(levelData.finish.x, levelData.finish.y, clrRad);
      }
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

    function reset()
    {
        // Stop requestAnimationFrame
        cancelAnimationFrame(reqAnimFrameId);
        reqAnimFrameId = null;

        // Clear all intervals.
        const intervals = Object.values(gameIntervals);
        for(let i = 0; i < intervals.length; i++) {
            clearInterval(intervals[i]);
        }

        // clear particles
        particles = [];

        // remove all lemmings
        lemmings.length = 0;
        lastLemmingId = 0;

        // clear map noise
        mapNoiseHash.length = 0;
        
        // clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Unpause
        isPaused = false;

        // Clear some debug divs
        if(coordinatesDiv) {
          coordinatesDiv.innerHTML = "";
        }
        if(infoDiv) {
          infoDiv.innerHTML = "";
        }
              
        // for clarity
        background = undefined;
        oldImgData = undefined;
        console.log("Reset done.");
    }
    
    
    function init(canvasElt, givenLevel = {}, debug = false)
    {
      __DEBUG__ = debug;
    
      /* Some seeds used in the past:
        1680878681505;  // slow
        1680905320764;  // action
        1680983904827;  // builder test
        1681139505452;  // llemmings.com
      */

      // levelData defaults
      levelData = {
        level : givenLevel.level || -1,
        name : givenLevel.name || "Noname",
        seed : givenLevel.seed || Date.now(),
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
            "y1": 600 - WATER_HEIGHT,
            "x2": 800,
            "y2": 600 
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

            Climber : givenLevel.resources?.Climber || 0,
            Floater : givenLevel.resources?.Floater || 0,
            Bomber : givenLevel.resources?.Bomber || 0,
            Blocker : givenLevel.resources?.Blocker || 0,
            Builder : givenLevel.resources?.Builder || 0,
            Basher : givenLevel.resources?.Basher || 0,
            Miner : givenLevel.resources?.Miner || 0,
            Digger : givenLevel.resources?.Digger || 0,
        },
        goal : { survivors : givenLevel.goal?.survivors || 30 },
        objects : givenLevel.objects || [],
        start : givenLevel.start || { x : null, y : -20, clear: false },
        finish : givenLevel.finish || { x : 750, y : 500, clear: true },
      }

      setupUI();

      console.log("Current seed: ", levelData.seed);
      Math.random = RNG(levelData.seed);
  
      if(!canvas && !canvasElt) {
        throw "no existing canvas and no element given";
      } else if(canvasElt) {
        canvas = canvasElt;
        canvas.width = 800;
        canvas.height = 600;

        /*
        Human note: TOOD: Map-generation on mobile devices
        const dpr = window.devicePixelRatio;
        canvas.width = Math.floor(canvas.width * dpr);
        canvas.height = Math.floor(canvas.height * dpr);
        ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.scale(dpr, dpr);
        */
      }
      ctx = canvas.getContext('2d', { willReadFrequently: true });

      generateMapNoiseHash();
      generateMap(canvas.width, canvas.height);

      if (levelData.shapes) {
        drawShapes(ctx, levelData.shapes);
      }

      clearSmoothingOfTerrain(canvas, [...terrainColorBytes, waterColorBytes]);
      // console.log("Unique colors:", getUniqueColors(canvas));

      // Human notes:
      // 1. Everything that is collidable terrain should be above this
      // 2. oldImgData will be used for collision checking
      // 3. This should be renamed, but I don't want to do it now since it would make some 
      //    prompts invalid (for demonstration purposes). It does nicely to illustrate the 
      //    example of the need to keep track of these things.
      oldImgData = ctx.getImageData(0,0,canvas.width,canvas.height);

      setupStartFinish();

      setGradients(ctx, levelData.gradients);

      renderDecorations();

      renderDirtTexture();
      renderRockTexture();
      renderWaterTexture();

      setBackgroundBuffer();

      if(!canvasEventsListening) {
        startCanvasEventListeners();
      }
    }
  
    function start()
    {
      // Start the update loop
      reqAnimFrameId = update();
  
      // Spawn a new lemming every interval
      gameIntervals["debugLemmingSpawner"] = setInterval(spawnLemming, levelData.spawnInterval);
    }

    return {
      getSeed : () => { return levelData.seed; },
      init : init,
      start : start,
      togglePause : togglePause,
      applyAction : applyAction,
      reset : reset,
      restart : (canvasElt) => { reset(); init(canvasElt, levelData, true); start(); },
      drawShapes : drawShapes,
    }
  })();
  