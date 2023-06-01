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

        getScoreInfo()
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

    class Screen
    {
        scoreKeeper = null;
        levelData = null;
        container = null;
        age = 0;
        elts = [];

        constructor(scoreKeeper, levelData)
        {
            this.scoreKeeper = scoreKeeper;
            this.levelData = levelData;
        }

        // >>> Prompt: instructions/format-score.0001.txt
        formatScore(number)
        {
            // Convert number to string
            const numberString = number.toString();

            // If number has 3 or fewer digits, return it as is
            if (numberString.length <= 3) {
                return numberString;
            }

            // Otherwise, add spaces every three digits, starting from the end of the string
            let result = "";
            let count = 0;
            for (let i = numberString.length - 1; i >= 0; i--) {
                result = numberString.charAt(i) + result;
                count++;
                if (count === 3 && i !== 0) {
                    result = " " + result;
                    count = 0;
                }
            }
            return result;
        }

        show()
        {
            let html = `
                <div class="score-detail" style="text-align: left;">
                    <h1>Well done, human!</h1>
                </div>
            `;

            const scores = this.scoreKeeper.getScoreInfo();
            const labels = Object.keys(scores);
            for(let i = 0; i < labels.length; i++) {
                const lbl = labels[i];

                if(scores[lbl] === 0) {
                    continue;
                }

                const elt = document.createElement("div");
                elt.setAttribute("class", "score-detail");
                elt.innerHTML = `
                    <label>${lbl}</label> <span>${this.formatScore(scores[lbl])}</span>
                `;
                this.elts.push(elt);
            }

            const elt = document.createElement("div");
            elt.setAttribute("class", "score-detail score-total");
            elt.innerHTML = `
                <label>YOUR SCORE</label> <span>${this.formatScore(this.scoreKeeper.getScore())}</span>
            `;

            if(LlemmingsLevels.length < this.levelData.level) {
                elt.innerHTML += `
                    <div style="text-align: center; margin-top: 3rem;">
                        <button class="game-button" onclick="">Continue to level ${this.levelData.level + 1}</button>
                    </div>
                `;
            } else {
                elt.innerHTML += `
                    <div style="text-align: center; margin-top: 3rem;">
                        Alas!<br/>
                        You also completed all levels!
                    </div>
                `;
            }

            this.elts.push(elt);

            this.container = document.createElement("DIV");
            this.container.setAttribute("id", "scoreScreen");
            document.body.appendChild(this.container);
            this.container.innerHTML = html;

            this.scoreKeeper.cleanUp();
        }

        update()
        {
            this.age++;
            if(this.age % 40 === 0 && this.elts.length > 0) {
                this.container.appendChild(this.elts[0]);
                this.elts.splice(0, 1);
            }
        }

        cleanUp()
        {
            if(this.container) {
                document.body.removeChild(this.container);
                this.container = null;
            }
            this.age = 0;
            this.scoreKeeper = null;
            this.elts = [];
        }
    }
    
    return {
        ScoreKeeper : ScoreKeeper,
        Screen : Screen,
    };
})();
