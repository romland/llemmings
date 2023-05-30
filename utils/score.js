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
        container = null;
        age = 0;
        elts = [];

        constructor(scoreKeeper)
        {
            this.scoreKeeper = scoreKeeper;
        }

        formatScore(val)
        {
            return val;
        }

        show()
        {
            console.log("Show scoreScreen");

            let html = `
                <h1>Well done!</h1>
                <div id="score-details">
                </div>
                <button class="game-button">Replay level</button>
                <button class="game-button">Continue</button>
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
                    <div class="score-detail">
                        <label>${lbl}</label> <span>${this.formatScore(scores[lbl])}</span>
                    </div>
                `;
                this.elts.push(elt);
            }

            const elt = document.createElement("div");
            elt.setAttribute("class", "score-detail score-total");
            elt.innerHTML = `
                <div class="score-detail">
                    <label>TOTAL</label> <span>${this.formatScore(this.scoreKeeper.getScore())}</span>
                </div>
            `;
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
            console.log("Cleaning up scoreScreen");
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
