"use strict";
var LlemmingsArt = (function ()
{
    /**
     * Prompt? See getChatGPTHouse() :/
     * @returns svg
     */
    function getHouse(width = 75, height = 75)
    {
        return `<svg id="house-svg" width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg"  xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
        <!-- Source: https://brandeps.com/icon/H/House-01 -->
        <style type="text/css">
          .st0{fill:#C0392B;}
          .st1{fill:#BDC3C7;}
          .st2{fill:#95A5A6;}
          .st3{fill:#E74C3C;}
          .st4{fill:#3498DB;}
          .st5{fill:#E67E22;}
          .st6{fill:#D35400;}
          .st7{fill:#2980B9;}
          .st8{fill:#F1C40F;}
        </style>
        <g>
          <!-- chimney -->
          <rect class="st0" x="369.4" y="74.8" width="67.7" height="135.5"/>
          <!-- body -->
          <polygon class="st1" points="256,75.6 52,278.8 52,319.8 52,441.1 52,482.1 74.8,482.1 256,482.1 437.2,482.1 
            460,482.1 460,441.1 460,319.8 460,278.8"/>
          <!-- roof depth -->
          <polygon class="st2" points="256,88.2 52,289.9 52,333.2 52,335.6 256,131.5 460,335.6 460,333.2 460,289.9"/>
          <!-- roof -->
          <polygon class="st3" points="256,29.9 0,285.1 32.3,317.4 256,92.9 479.7,317.4 512,285.1"/>
          <!-- window -->
          <circle class="st4" cx="256" cy="233.2" r="44.9"/>
          <!-- door -->
          <rect class="st5" x="211.1" y="346.6" width="90.6" height="135.5"/>
          <!-- door knob depth -->
          <circle class="st6" cx="278.8" cy="425.4" r="11"/>
          <!-- window depth -->
          <path class="st7" d="M256,188.3c-25.2,0-44.9,20.5-44.9,44.9c0,2.4,0.8,7.1,1.6,11c4.7-20.5,22.8-33.9,44.1-33.9
            s38.6,13.4,44.1,33.9c0.8-4.7,1.6-8.7,1.6-11C300.9,208.7,281.2,188.3,256,188.3z"/>
          <!-- door knob -->
          <circle class="st8" cx="278.8" cy="414.3" r="11"/>
          <!-- door depth -->
          <rect class="st6" x="211.1" y="323.7" width="90.6" height="22.8"/>
        </g>
      </svg>`;
    }

    // >>> Prompt: art-hatch.0001.txt
    // >>> Prompt: art-hatch.0002.txt
    function drawHatch(context, width, height, currentFrameNum, totalFrameCount)
    {
        // calculate angle of rotation for each door (Human: 1.34 is just because i want it slightly more than 90 degrees)
        const angle = (currentFrameNum / totalFrameCount * 1.34) * Math.PI / 2;
    
        context.save();
        context.translate(16, 5);
        context.rotate(angle);
        context.fillRect(0, -5, 30, 5);
        context.restore();
    
        context.save();
        context.translate(76, 5);
        context.scale(-1, 1);   // mirror
        context.rotate(angle);
        context.fillRect(0, -5, 30, 5);
        context.restore();
    }
    
    // >>> Prompt: instructions/organics-bushes-grass-moss.0001.txt
    const leafColors = ["#8B4513", "#228B22", "#aabb00", "#ee7777"]; // Brown, Green, Yellow, Red

    /**
     * Organical growth helpers.
     * >>> Prompt: instructions/organics-bushes-grass-moss.0001.txt
     */
    function drawLeaves(ctx, startX, startY, len, angle, branchWidth, color1, color2)
    {
      ctx.beginPath();
      ctx.save();
      ctx.strokeStyle = leafColors[Math.floor(Math.random()*leafColors.length)];//color2;
      ctx.fillStyle = leafColors[Math.floor(Math.random()*leafColors.length)]; //color2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.lineWidth = branchWidth;
      ctx.translate(startX, startY);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.moveTo(0, 0);
    
      if (len < 17) {
        ctx.beginPath();
        ctx.arc(0, -len, 10, 0, Math.PI / 2);
        ctx.fill();
        ctx.restore();
        return;
      }
      
      // Recursive
      drawLeaves(ctx, 0, len, len * 0.75, angle + Math.random() * 20 - 10, branchWidth * 0.6, color1, color2);
      drawLeaves(ctx, 0, len, len * 0.75, angle - Math.random() * 20 - 10, branchWidth * 0.6, color1, color2);
      
      ctx.restore();
    }
    
    // >>> Prompt: instructions/organics-bushes-grass-moss.0001.txt
    function rand(min, max)
    {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
    
    // >>> Prompt: instructions/organics-bushes-grass-moss.0001.txt
    function drawMoss(ctx, x, y, size)
    {
      ctx.fillStyle = 'rgb(' + rand(0, 50) + ', ' + rand(100, 150) + ', ' + rand(0, 50) + ')';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // >>> Prompt: instructions/organics-bushes-grass-moss.0001.txt
    function drawGrass(ctx, x, y, size)
    {
      ctx.fillStyle = 'rgb(' + rand(0, 50) + ', ' + rand(100, 150) + ', ' + rand(0, 50) + ')';
      ctx.fillRect(x - size / 2, y, size, -size);
    }
    
    // >>> Prompt: instructions/organics-bushes-grass-moss.0001.txt
    function drawGround(ctx, x, y)
    {
      for (let i = 0; i < rand(500, 1000); i++) {
        drawMoss(ctx, x + rand(0, canvas.width), y + rand(0, 50), rand(10, 20));
      }
    
      for (let i = 0; i < rand(500, 1000); i++) {
        drawGrass(ctx, x + rand(0, canvas.width), y + rand(0, 50), rand(10, 20));
      }
    }
    
    // >>> Prompt: instructions/organics-bushes-grass-moss.0001.txt
    function drawTree(ctx, x, y)
    {
      const treeWidth = Math.random() * 40 + 20;
      let len = 127;
      drawLeaves(ctx, x + 0, y + len, len, -90, treeWidth, leafColors[Math.floor(Math.random() * leafColors.length)], "#000");
    }

    // >>> Prompt: instructions/organics-bushes-grass-moss.0001.txt
    function drawEdgeVegetation(ctx, edge = "top")
    {
      switch(edge) {
        case "top" :
          drawGround(ctx, 0, 0);
          for(let x = -50; x < canvas.width; x += 50) {
            drawTree(ctx, x, -25);
          }
          break;
        case "bottom" :
          drawGround(ctx, 0, canvas.height - 40);
          for(let x = -50; x < canvas.width; x += 50) {
            drawTree(ctx, x, canvas.height - 110);
          }
          break;
        default :
          throw "unknown edge " + edge;
      }
    }

    function renderDecorations(ctx, levelData)
    {
      for(let i = 0; i < levelData.decorations.length; i++) {
        for(let j = 0; j < levelData.decorations[i].location.length; j++) {
          switch(levelData.decorations[i].type) {
            case "organics" :
              drawEdgeVegetation(ctx, levelData.decorations[i].location[j]);
              break;
            default :
              throw "unknown decoration " + levelData.decorations[i].type;
          }
        }
      }
    }

    // >>> Prompt: instructions/art-star.0001.txt
    // >>> Prompt: instructions/art-star.0002.txt
    function drawSpikes(tempCtx, cx, cy, numSpikes, outerRad, innerRad, color = "white", randomness = false, alphaRing = false)
    {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let circleStep = Math.PI / numSpikes;

        tempCtx.beginPath();
        tempCtx.moveTo(cx, cy - outerRad)
        for(i = 0; i < numSpikes; i++) {
            let rand = (randomness ? -(outerRad/4) + Math.random() * (outerRad/2) : 0);
            x = cx + Math.cos(rot) * (outerRad + rand);
            y = cy + Math.sin(rot) * (outerRad + rand);
            tempCtx.lineTo(x, y)
            rot += circleStep

            x = cx + Math.cos(rot) * innerRad;
            y = cy + Math.sin(rot) * innerRad;
            tempCtx.lineTo(x, y)
            rot += circleStep
        }
        tempCtx.lineTo(cx, cy - outerRad)
        tempCtx.closePath();
        tempCtx.fillStyle = color;
        tempCtx.fill();

        if(alphaRing) {
            // Create a radial gradient that starts from the center and ends at the outer radius
            const gradient = tempCtx.createRadialGradient(cx, cy, 0, cx, cy, outerRad*1.5);
            // Add color stops that start from white and end at transparent
            for (let i = 0; i <= 10; i++) {
                gradient.addColorStop(i / 10, `rgba(255, 255, 255, ${(10 - i) / 10})`);
            }
            // Set the fill style to the gradient
            tempCtx.fillStyle = gradient;
            tempCtx.fill();
        }
    }

    // >>> Prompt: instructions/art-star.0003.txt
    async function extractBitmapFromContext(ctx, x, y, width, height)
    {
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;

      return await createImageBitmap(await ctx.getImageData(x, y, width, height));
    }

    return {
      getHouse : getHouse,
      drawHatch : drawHatch,
      renderDecorations : renderDecorations,
      drawSpikes : drawSpikes,
      extractBitmapFromContext : extractBitmapFromContext,    /* WARNING: Async! */
    }
})();
