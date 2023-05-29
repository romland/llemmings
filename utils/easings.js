"use strict";
// >>> Prompt: instructions/art-animation.0003.txt
var Easings = (function () {

  function easeInOutSine(t) {
    return -0.5 * (Math.cos(Math.PI * t) - 1);
  }
  
  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 0.5 * Math.pow(2 * t - 2, 3) + 1;
  }
  
  function easeInOutBounce(t) {
    return t < 0.5
      ? 0.5 * (1 - easeOutBounce(1 - 2 * t))
      : 0.5 * easeOutBounce(2 * t - 1) + 0.5;
  }
  
  function easeOutBounce(t) {
    const n1 = 7.5625;
    const d1 = 2.75;
  
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
  
  function easeInBack(t) {
    const s = 1.70158;
    return t * t * ((s + 1) * t - s);
  }
  
  function easeOutBack(t) {
    const s = 1.70158;
    return --t * t * ((s + 1) * t + s) + 1;
  }
  
  function easeInOutBack(t) {
    const s = 1.70158 * 1.525;
    return t < 0.5
      ? 2 * t * t * ((s + 1) * 2 * t - s)
      : 0.5 * ((2 * t - 2) * (2 * t - 2) * ((s + 1) * (t * 2 - 2) + s) + 2);
  }
  
  function easeInElastic(t) {
    const c4 = ((2 * Math.PI) / 3);
    return t === 0
      ? 0
      : t === 1
      ? 1
      : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  }
  
  function easeOutElastic(t) {
    const c4 = ((2 * Math.PI) / 3);
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }

  return {
    easeInOutSine : easeInOutSine,
    easeInOutCubic : easeInOutCubic,
    easeInOutBounce : easeInOutBounce,
    easeOutBounce : easeOutBounce,
    easeInBack : easeInBack,
    easeOutBack : easeOutBack,
    easeInOutBack : easeInOutBack,
    easeInElastic : easeInElastic,
    easeOutElastic : easeOutElastic,
}
})();
