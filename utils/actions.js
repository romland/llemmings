"use strict";
var Actions = (function ()
{
    let lemmings, levelData, levelDataResources;

    function init(sharedVars)
    {
        lemmings = sharedVars.lemmings;
        levelData = sharedVars.levelData;
        levelDataResources = sharedVars.levelDataResources;
    }


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

    
    function keyBindPressed(action)
    {
      // Global actions
      switch(action) {
        case "toggle-pause":
          Llemmings.togglePause();
          return;
          
        case "restart-level":
          Llemmings.restartLevel();
          return;

        case "exit-game":
          Llemmings.exitGame();
          return;
      }

      if(Llemmings.isPlaying() && !Llemmings.isAutoPlaying() && !levelData.disableGame) {
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
          let actName = GameUtils.capitalize(action.split("-")[1]);
          Actions.applyAction(actName);
        }
      } else {
        console.warn("In-game keybinds momentarily disabled");
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
    

    return {
        init : init,
        applyAction : applyAction,
        keyBindPressed : keyBindPressed,
        deselectLemmings : deselectLemmings,
    }
})();
