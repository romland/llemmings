"use strict";
const World = (function () {
  const blackColorBytes = [0x0, 0x0, 0x0];
  const waterColorBytes = [0x00, 0x77, 0xbe]; // [0, 119, 190];
  const rockColorBytes = [0x88, 0x88, 0x88]; // [136, 136, 136];
  const dirtColorBytes = [0x4a, 0x2e, 0x00]; // [74, 46, 0];

    // Map variables and settings (noise and otherwise)
    const MAP_TILE_SIZE = 1;
    const MAP_OCTAVES = 5;
    const MAP_PERSISTENCE = 0.5;
    const MAP_LACUNARITY = 2.25;
    const MAP_AMPLITUDE = 2.0;
    const mapNoiseHash = [];
  
    // constants for tunnel/cave generation
    const TUNNEL_SIZE = 40;
    const TUNNEL_MIN_LENGTH = 150;
    const TUNNEL_MAX_LENGTH = 400;

    let ctx;

    function init(sharedVars)
    {
      ctx = sharedVars.ctx;
    }
    
    function cleanUp()
    {
      mapNoiseHash.length = 0;
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
                    color = World.rockColorBytes;
                } else if (height >= 0.4) {
                    // dirt
                    color = World.dirtColorBytes;
                } else {
                    // void
                    color = World.blackColorBytes;
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
  
    function renderDirtTexture(collisionLayer)
    {
      const dirtGrainSize = 10;
      // generate dirt texture
      for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
          if(!GameUtils.isColorOneOf(GameUtils.getPixelColor(collisionLayer, x, y), World.dirtColorBytes)) {
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
    function renderWaterTexture(collisionLayer)
    {
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          if(!GameUtils.isColorOneOf(GameUtils.getPixelColor(collisionLayer, x, y), World.waterColorBytes)) continue;
          
          let noiseValue = PerlinNoise2D(x / 100, y / 100);
          let blue = Math.floor(200 + noiseValue * 55);
          ctx.fillStyle = `rgb(0, 0, ${blue})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    function renderRockTexture(collisionLayer) {
      const rockGrainSize = 24;
      const cliffColorBytes = [
        [50, 60, 70], // dark rocks
        [100, 110, 120], // medium rocks
        [185, 200, 210], // light colored rocks
        [215, 225, 235] // very light colored rocks 
      ];
      
      for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
          if(!GameUtils.isColorOneOf(GameUtils.getPixelColor(collisionLayer, x, y), World.rockColorBytes)) {
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
          
          case "fill":
            console.log("Drawing fill", shape);
            GameUtils.floodFill(shape.x, shape.y, shape.targetColor, shape.fillColor, context);
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
  
  return {
    blackColorBytes : blackColorBytes,
    waterColorBytes : waterColorBytes,
    rockColorBytes : rockColorBytes,
    dirtColorBytes : dirtColorBytes,
    terrainColorBytes : [ rockColorBytes, dirtColorBytes ],

    init : init,
    cleanUp : cleanUp,

    generateMapNoiseHash : generateMapNoiseHash,
    generateMap : generateMap,

    renderDirtTexture : renderDirtTexture,
    renderWaterTexture : renderWaterTexture,
    renderRockTexture : renderRockTexture,
    drawShapes : drawShapes,
    backupGradients : backupGradients,
    setGradients : setGradients,
    clearSmoothingOfTerrain : clearSmoothingOfTerrain,
  };
})();
