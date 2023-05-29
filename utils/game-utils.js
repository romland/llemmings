var GameUtils = (function () {
  /**
   * >>> Prompt: instructions/solutions.0001.txt
   * 
   * Checks if the given lemming object matches the provided conditions.
   * @param {Array} conditions An array of strings representing the conditions to check, e.g. ["velX > 0", "age < 100"].
   * @param {Object} lemming The object to be checked against the conditions.
   * @returns {boolean} Whether the lemming object matches the conditions.
   */
  function matchesCondition(conditions, lemming) {
      // Loop through each condition in the array.
      if(!conditions) {
        return true;
      }
      
      for (let i = 0; i < conditions.length; i++) {
        const condition = conditions[i];
        // Split the condition string into individual tokens.
        const tokens = condition.split(" ");
        // Extract the key (property name) and operator from the tokens.
        const key = tokens[0];
        const operator = tokens[1];
        // Extract the expected value from the tokens.
        const expectedValue = parseInt(tokens[2]);
    
        // Retrieve the actual value of the property from the lemming object.
        const actualValue = lemming[key];
    
        // Compare the actual value against the expected value using the operator.
        switch (operator) {
          case ">":
            if (actualValue <= expectedValue) {
              return false;
            }
            break;
          case "<":
            if (actualValue >= expectedValue) {
              return false;
            }
            break;
          case ">=":
            if (actualValue < expectedValue) {
              return false;
            }
            break;
          case "<=":
            if (actualValue > expectedValue) {
              return false;
            }
            break;
          case "==":
            if (actualValue !== expectedValue) {
              return false;
            }
            break;
          default:
            // Invalid operator.
            return false;
        }
      }
    
      // If all conditions pass, return true.
      return true;
    }

    // >>> Prompt: editor/instructions/shapes-bitmap.0001.txt
    // HUMAN TODO: Cache imageData for use in editor (so we don't have to go from b64 to bitmap all the time)
    function renderBitmap(bitmap, context, x, y) {
      let rgb;
      if(bitmap.color && bitmap.color.includes("rgb")) {
        rgb = bitmap.color.replace("rgb(", "").replace(")", "").split(",");
      } else {
        console.warn("no color for bitmap, using white -- might mean that it's not visible")
        rgb = [255,255,255];
      }

      const bytes = atob(bitmap.data).split('').map(char => char.charCodeAt(0));
      const imageData = context.createImageData(bitmap.width, Math.ceil(bytes.length*8 / bitmap.width));

      const data = imageData.data;
      let byteIndex = 0;
      let bitIndex = 0;
      for (let i = 0; i < data.length; i += 4) {
        const byte = bytes[byteIndex];
        const bit = (byte >> bitIndex) & 1;
        const alpha = bit * 255;

        if(alpha) {
          data[i] = rgb[0];
          data[i + 1] = rgb[1];
          data[i + 2] = rgb[2];
          data[i + 3] = alpha;
        } else {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 0;
        }

        bitIndex += 1;
        if (bitIndex === 8) {
          byteIndex += 1;
          bitIndex = 0;
        }
      }

      // Human note: This will overwrite any data that is already at this location of context.
      //             Which is fine. For now. As it is only used on intro screen.
      context.putImageData(imageData, x, y);
    }

    // >>> Prompt: instructions/svg-to-canvas.0001.txt
    function drawSvgOnCanvas(svgString, x, y, width, height, context)
    {
        const dataUrl = 'data:image/svg+xml;base64,' + btoa(svgString);
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          context.drawImage(img, x, y, width, height);
        };
    }


    // >>> Prompt: instructions/score.0001.txt
    class ScoreKeeper {
      constructor(canvas, initialLemmingsToSave = 0, initialScore = 0, hidden = false) {
        this.hidden = hidden;
        this.lemmingsSaved = 0;
        this.targetLemmingsToSave = initialLemmingsToSave;
        this.score = initialScore;
        this.canvas = canvas;
        this.scoreElement = document.getElementById("goalTrackerDiv");

        if(this.scoreElement) {
          if(!this.hidden) {
            this.updateUI();
          }
        } else {
          // Create the UI element to display the score
          this.scoreElement = document.createElement('div');
          this.scoreElement.id = "goalTrackerDiv";
          this.scoreElement.style.position = 'absolute';
          this.scoreElement.style.top = '10px';
          this.scoreElement.style.left = '20px';
          this.scoreElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          this.scoreElement.style.borderRadius = '50%';
          this.scoreElement.style.width = '75px';
          this.scoreElement.style.height = '50px';
          this.scoreElement.style.display = 'flex';
          this.scoreElement.style.alignItems = 'center';
          this.scoreElement.style.justifyContent = 'center';
          this.scoreElement.style.textShadow = "#FC0 10px 0 10px";
          this.scoreElement.style.color = 'white';
          this.scoreElement.style.fontFamily = 'Comic Sans MS';
          this.scoreElement.style.fontSize = '15px';
          this.scoreElement.style.textTransform = 'uppercase'; 
          this.scoreElement.style.letterSpacing = '0.1em';

          if(!this.hidden) {
            canvas.parentNode.appendChild(this.scoreElement);
            this.updateUI();
          }
        }
      }
    
      // Increment the score by a specified amount
      addSavedLemmings(amount) {
        this.lemmingsSaved += amount;
        this.updateUI();
      }

      getSavedLemmings()
      {
        return this.lemmingsSaved;
      }

      addScore(amount, label)
      {
        console.log("Adding score", label, Math.round(amount));
        this.score += Math.round(amount);
      }

      getScore()
      {
        return this.score;
      }

      getSavedLemmingsCount()
      {
        return this.lemmingsSaved;
      }

      setLemmingsToSave(amount) {
        this.targetLemmingsToSave = amount;
      }

      cleanUp()
      {
        if(this.scoreElement && this.scoreElement.parentElement) {
          this.scoreElement.parentElement.removeChild(this.scoreElement);
          this.scoreElement = null;
        }
      }
  
      // Update the score UI element with the current score
      updateUI() {
        if(!this.hidden) {
          this.scoreElement.innerHTML = `${this.lemmingsSaved}/${this.targetLemmingsToSave}`;
        }
      }
    }

    // >>> Prompt: instructions/art-animation.0001.txt
    // >>> Prompt: instructions/art-animation.0002.txt
    // >>> Prompt: instructions/art-animation.0003.txt
    async function generateAnimationFrames(width, height, frameCount = 90, drawFunc)
    {
        const frameImages = [];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        
        const framePromises = [];
        
        for (let i = 0; i <= frameCount; i++) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            drawFunc(context, width, height, i, frameCount);
            
            const frame = new Image();
            frame.src = canvas.toDataURL();
            framePromises.push(
                frame.decode().then(() => {
                    return createImageBitmap(frame, 0, 0, canvas.width, canvas.height).then((bmp) => {
                        frameImages.push(bmp);
                    });
                })
            );
        }
        
        await Promise.all(framePromises);
        
        return frameImages;
    }

    // >>> Prompt: editor/instructions/flood-fill.0001.txt
    function floodFill(x, y, targetColor, fillColor, ctx) {
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      const pixelStack = [(y * imageData.width + x) * 4];
    
      function matchesTargetColor(pixelIndex) {
        return imageData.data[pixelIndex] === targetColor[0]
          && imageData.data[pixelIndex + 1] === targetColor[1]
          && imageData.data[pixelIndex + 2] === targetColor[2]
          && imageData.data[pixelIndex + 3] === targetColor[3];
      }
    
      function fillColorAtPixel(pixelIndex) {
        imageData.data[pixelIndex + 0] = fillColor[0];
        imageData.data[pixelIndex + 1] = fillColor[1];
        imageData.data[pixelIndex + 2] = fillColor[2];
        imageData.data[pixelIndex + 3] = fillColor[3];
        pixelsFilled++;
      }
      
      if(!targetColor) {
        targetColor = [
          imageData.data[pixelStack[0] + 0],
          imageData.data[pixelStack[0] + 1],
          imageData.data[pixelStack[0] + 2],
          imageData.data[pixelStack[0] + 3]
        ];
      }

      let pixelsFilled = 0;
      console.log("x/y/target/fill/stack: ", x, y, targetColor, fillColor, pixelStack);

      if (matchesTargetColor(pixelStack[0])) {
        fillColorAtPixel(pixelStack[0]);
      }
    
      while (pixelStack.length) {
        let pixelIndex = pixelStack.pop();
        let x = Math.floor(pixelIndex / 4) % imageData.width;
        let y = Math.floor(Math.floor(pixelIndex / 4) / imageData.width);
    
        while (y-- >= 0 && matchesTargetColor(pixelIndex)) {
          pixelIndex -= imageData.width * 4;
        }
        pixelIndex += imageData.width * 4;
        ++y;
    
        let reachLeft = false;
        let reachRight = false;
    
        while (y++ < imageData.height - 1 && matchesTargetColor(pixelIndex)) {
          fillColorAtPixel(pixelIndex);
    
          if (x > 0) {
            if (matchesTargetColor(pixelIndex - 4)) {
              if (!reachLeft) {
                pixelStack.push(pixelIndex - 4);
                reachLeft = true;
              }
            } else if (reachLeft) {
              reachLeft = false;
            }
          }
    
          if (x < imageData.width - 1) {
            if (matchesTargetColor(pixelIndex + 4)) {
              if (!reachRight) {
                pixelStack.push(pixelIndex + 4);
                reachRight = true;
              }
            } else if (reachRight) {
              reachRight = false;
            }
          }
    
          pixelIndex += imageData.width * 4;
        }
      }
    
      ctx.putImageData(imageData, 0, 0);
      console.log("Pixels filled:", pixelsFilled);
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
  
    // >>> Prompt: instructions/get-pixel-index.0001.txt
    function getPixelIndex(x, y, width) {
      x = Math.round(x);
      y = Math.round(y);
  
      return ((y * width) + x) * 4;
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



    return {
      ScoreKeeper : ScoreKeeper,
      matchesCondition : matchesCondition,
      renderBitmap : renderBitmap,
      drawSvgOnCanvas : drawSvgOnCanvas,
      generateAnimationFrames : generateAnimationFrames,
      floodFill : floodFill,
      getUniqueColors : getUniqueColors,
      getPixelColor : getPixelColor,
      isColorOneOf : isColorOneOf,
      getPixelIndex : getPixelIndex,

      rgbToHex : rgbToHex,
      RNG : RNG,
      saveToLocalStorage : saveToLocalStorage,
      getFromLocalStorage : getFromLocalStorage,
      capitalize : capitalize,
      adjustCanvasHeight : adjustCanvasHeight,
    }
})();
