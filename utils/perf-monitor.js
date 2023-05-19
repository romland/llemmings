"use strict";
/*
>>> Prompt: instructions/performance-monitor.0001.txt

// Example usage
perfMonitor.start("bkg-rest");
// Code you want to measure performance of
setTimeout(() => {
  perfMonitor.end("bkg-rest");
}, 1000);
*/
const perfMonitor = (() => {
  let labels = {};
  let containerEl;
  let enabled = false;

  function init(enable)
  {
    enabled = enable;

    if(!enabled) {
      return;
    }

    labels = {};
    containerEl = document.createElement("pre");
    containerEl.style.position = "fixed";
    containerEl.style.bottom = "15px";
    containerEl.style.left = "0";
    containerEl.style.background = "#333";
    containerEl.style.color = "#fff";
    containerEl.style.padding = "5px";
    containerEl.style.textAlign = "right";
  
    document.body.appendChild(containerEl);
  
    requestAnimationFrame(updateDisplay);
  }

  function cleanUp()
  {
    if(containerEl) {
      document.body.removeChild(containerEl);
      containerEl = null;
    }

    labels = {};
    enabled = false;
  }

  function updateDisplay()
  {
    if(!enabled) {
      return;
    }
    
    // to output latest value (no avg): ${lastVals[lastVals.length-1].toFixed(2)}
    containerEl.textContent = Object.entries(labels)
      .map(([label, { time, unit, lastVals }]) => `${label}: ${time.toFixed(2)}${unit}`)
      .join("\n");
    requestAnimationFrame(updateDisplay);
  }

  function start(label)
  {
    if(!enabled) {
      return;
    }

    if (!labels[label]) {
      labels[label] = {
        time: 0,
        count: 1,
        lastVals: [],
        unit: "ms",
      };
    }
    labels[label].start = performance.now();
  }

  function end(label, avgLen = 30)
  {
    if(!enabled) {
      return;
    }

    const { start } = labels[label];
    if (!start) {
      return;
    }
    const duration = performance.now() - start;

    if(avgLen) {
      labels[label].lastVals.push(duration);
      labels[label].time = getAndAdjustAverage(label, avgLen);
    } else {
      labels[label].time = duration;
    }

    labels[label].start = undefined;
  }

  function getAndAdjustAverage(label, avgLen)
  {
    if(labels[label].lastVals.length > avgLen) {
      labels[label].lastVals.splice(0, 1);
    }
    return (labels[label].lastVals.reduce((a, b) => a + b, 0) / labels[label].lastVals.length);
  }

  function setLabel(label, val, avgLen = null, round = true)
  {
    if(!enabled) {
      return;
    }

    if (!labels[label]) {
      labels[label] = {
        time: 0,
        count: 1,
        lastVals: [],
        unit: "",
      };
    }

    if(avgLen) {
      labels[label].lastVals.push(val);
      labels[label].time = getAndAdjustAverage(label, avgLen);
    } else {
      labels[label].time = val;
    }

    if(round) {
      labels[label].time = Math.round(labels[label].time);
    }
  }

  return {
    init : init,
    setLabel: setLabel,
    start: start,
    end: end,
    cleanUp : cleanUp,
  };
})();
