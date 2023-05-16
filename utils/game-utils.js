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

        data[i] = rgb[0];
        data[i + 1] = rgb[1];
        data[i + 2] = rgb[2];
        data[i + 3] = alpha;
        
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
  
      // Update the score UI element with the current score
      updateUI() {
        if(!this.hidden) {
          this.scoreElement.innerHTML = `${this.lemmingsSaved}/${this.targetLemmingsToSave}`;
        }
      }
    }

    return {
      ScoreKeeper : ScoreKeeper,
      matchesCondition : matchesCondition,
      renderBitmap : renderBitmap,
    }
})();
