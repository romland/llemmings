"use strict";
var LlemmingsScore = (function () {
    // >>> Prompt: instructions/score.0001.txt
    class ScoreKeeper {
        constructor(canvas, initialLemmingsToSave = 0, initialScore = 0, hidden = false) {
            this.hidden = hidden;
            this.lemmingsSaved = 0;
            this.targetLemmingsToSave = initialLemmingsToSave;
            this.score = initialScore;
            this.canvas = canvas;
            this.scoreElement = document.getElementById("goalTrackerDiv");
            this.scoreInfo = {};
            
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
            amount = Math.round(amount);

            if(!this.scoreInfo[label]) {
                this.scoreInfo[label] = 0;
            }
            this.scoreInfo[label] += amount;

            this.score += amount;
        }

        getLabelledScore()
        {
            return this.scoreInfo;
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
    
    return {
        ScoreKeeper : ScoreKeeper,
    };
})();
