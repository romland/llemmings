var LlemmingsFCT = (function () {

    let canvas, ctx;
    let combatTexts = [];
    let calculatedWidths = {};
  
    const init = (cv) => {
      canvas = cv;
      ctx = canvas.getContext('2d');
    }

    // >>> Prompt: editor/instructions/shapes-text-dimension-0001.txt
    function getTextDimensions(text, font, fontSize, prefix = "")
    {
        ctx.font = `${prefix}${fontSize}px ${font}`;
        const w = ctx.measureText(text).width;
        const h = ctx.measureText(text).actualBoundingBoxAscent +
                  ctx.measureText(text).actualBoundingBoxDescent;
        return { w, h };
    }
    
    // Future prompt: This update loop uses linear interpolation for size, position, alpha and size, make is use cubic interpolation instead
    const update = (deltaTime) => {
      ctx.save();
      ctx.font = 'Bold 20px Arial';
      for(let i = 0; i < combatTexts.length; i++) {
        let ct = combatTexts[i];
        ct.timeLeft -= deltaTime;
        ct.y -= 0.1 * deltaTime;
        ct.size -= 0.01 * deltaTime;
        ct.alpha = ct.timeLeft / ct.maxTime;
        if(ct.alpha <= 0) {
          combatTexts.splice(i, 1);
          i--;
          continue;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${ct.alpha})`;
        ctx.fillText(ct.text, ct.x, ct.y);
      }
      ctx.restore();
    }
  
    const cleanUp = () => {
      combatTexts = [];
      calculatedWidths = {};
    }
  
    const spawnCombatText = (text, x = 200, y = 350, size, maxTime) => {
      ctx.save();
      let ct = {
        text,
        x,
        y,
        size: size || 20,
        maxTime: maxTime || 1000,
        timeLeft: maxTime || 1000,
        alpha: 1
      }

      const textId = size + "|" + text;
      if(!calculatedWidths[textId]) {
        calculatedWidths[textId] = getTextDimensions(text, "Arial", ct.size, "Bold ").w;
      }
      ct.x = (canvas.width / 2) - (calculatedWidths[textId] / 2);

      for(let i = 0; i < combatTexts.length; i++) {
        if(ct.y < combatTexts[i].y) {
          combatTexts.splice(i, 0, ct);
          return;
        }
      }
      combatTexts.push(ct);
      ctx.restore();
    }
  
    return {
      init,
      update,
      cleanUp,
      spawnCombatText
    }
  })();