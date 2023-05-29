"use strict";
const UI = (function () {

    function positionElements(levelData, levelDataResources)
    {
      const actions = document.getElementById('lemming-actions');
      if(actions) {
        if(levelData.ui.showActions === false) {
          actions.style.display = "none";
        } else {
          actions.style.display = "table";
        }
      }

      const startElt = document.getElementById("start-game");
      if(startElt) {
        if(levelData.ui.showStartGame === true) {
          startElt.style.display = "block";
        } else {
          startElt.style.display = "none";
        }
      }

      const settingsElt = document.getElementById("settings");
      if(settingsElt) {
        if(levelData.ui.showSettings === true) {
          settingsElt.style.display = "block";
          const rect = canvas.getBoundingClientRect();
          settingsElt.style.position = "absolute";
          settingsElt.style.top = (rect.bottom - 120) + "px";
          settingsElt.style.left = (rect.right - 180) + "px";
        } else {
          settingsElt.style.display = "none";
        }
      }

      // Update resource-count on the HTML buttons
      let spans = document.querySelectorAll('#lemming-actions .count');
      if(spans) {
        for(let span of spans) {
          span.innerHTML = levelDataResources[span.parentElement.getAttribute("data-resource")]
        }
      }
    }


    return {
        positionElements : positionElements,
    }
})();
