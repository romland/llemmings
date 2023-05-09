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

      addScore(amount)
      {
        this.score += amount;
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
      matchesCondition : matchesCondition
    }
})();
