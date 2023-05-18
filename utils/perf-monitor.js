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
  };

  function updateDisplay()
  {
    containerEl.textContent = Object.entries(labels)
      .map(([label, { time, unit }]) => `${label}: ${time.toFixed(2)}${unit}`)
      .join("\n");
    requestAnimationFrame(updateDisplay);
  }

  function start(label)
  {
    if(!enabled) return;

    if (!labels[label]) {
      labels[label] = {
        time: 0,
        unit: "ms",
      };
    }
    labels[label].start = performance.now();
  }

  function end(label)
  {
    if(!enabled) return;

    const { start } = labels[label];
    if (!start) {
      return;
    }
    const end = performance.now();
    const duration = end - start;

    labels[label].time = duration;
    labels[label].start = undefined;
  }

  function setLabel(label, val, avgLen = null)
  {
    if(!enabled) return;

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
      if(labels[label].lastVals.length > avgLen) {
        labels[label].lastVals.splice(0, 1);
      }
      labels[label].time = Math.round(labels[label].lastVals.reduce((a, b) => a + b, 0) / labels[label].lastVals.length);
    } else {
      labels[label].time = val;
    }
  }

  return {
    init : init,
    setLabel: setLabel,
    start: start,
    end: end,
  };
})();
