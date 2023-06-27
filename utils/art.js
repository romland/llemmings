"use strict";
var LlemmingsArt = (function ()
{
    const bitmaps = {};   // kept intact between levels so we don't have to re-generate all the time

    /**
     * Prompt? See getChatGPTHouse() :/
     * Oh. Which I apparently removed. Well, it was a shit house. It's comforting to know
     * that even I can draw better than an LLM. That said, this is actually stolen from
     * https://brandeps.com/icon/H/House-01 :(
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

    // >>> Prompt: instructions/art-waterbubble.0001.txt
    let bubblePopParticles = [];
    function drawBubblePop(context, width, height, currentFrameNum, totalFrameCount) {
      const center = [width / 2, height / 2];
      const maxRadius = Math.min(center[0], center[1]) - 10;
      
      const radius = maxRadius * currentFrameNum / totalFrameCount;
      const bubbleColor = 'rgba(255, 255, 255, 0.4)';
      const particleColor = 'rgba(255, 255, 255, 0.7)';
      
      // Draw bubble
      if(bubblePopParticles.length === 0) {
        context.save();
        context.beginPath();
        context.strokeStyle = bubbleColor;
        context.arc(center[0], center[1], radius, 0, 2 * Math.PI);
        context.stroke();
        context.restore();
      }
      
      // Generate particles
      if(currentFrameNum === Math.floor(totalFrameCount * 0.7)){
        bubblePopParticles = [];
        const numParticles = 15;
        const particleRadius = maxRadius / 20;
        for(let i = 0; i < numParticles; i++){
          const angle = Math.random() * 2 * Math.PI;
          const speed = Math.random() * 10;
          bubblePopParticles.push({
            x: center[0],
            y: center[1],
            vx: Math.cos(angle) * speed * 5,
            vy: Math.sin(angle) * speed * 5,
            radius: particleRadius,
            life: totalFrameCount * 0.3,
            color: particleColor
          });
        }
      }
      
      // Draw particles
      bubblePopParticles.forEach( (particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        // particle.vy += 0.1;
        particle.life--;
        
        context.save();
        context.beginPath();
        context.fillStyle = particle.color;
        context.arc(particle.x, particle.y, particle.radius, 0, 2 * Math.PI);
        context.fill();
        context.restore();
        
        if(particle.life <= 0){
          bubblePopParticles.splice(index, 1);
        }
      });
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

    function drawOwl(context, width, height, currentFrameNum, totalFrameCount)
    {
        context.save();

        // Draw the owl body
        context.beginPath();
        context.fillStyle = '#FFFFFF';
        context.arc(100, 100, 50, 0, 2 * Math.PI);
        context.fill();
      
        // Draw the owl eyes
        context.beginPath();
        context.fillStyle = '#000000';
        context.arc(80, 80, 10, 0, 2 * Math.PI);
        context.arc(120, 80, 10, 0, 2 * Math.PI);
        context.fill();

        // Draw the owl beak
        context.beginPath();
        context.fillStyle = '#FFA500';
        context.moveTo(100, 100);
        context.lineTo(110, 110);
        context.lineTo(90, 110);
        context.fill();

        context.restore();

        const angle = (currentFrameNum / totalFrameCount) * Math.PI / 2;

        // Left wing
        context.save();
        // ... animate it
        context.translate(70, 115);
        context.rotate(angle - 0.5);
        
        context.beginPath();
        context.fillStyle = '#909090';
        context.moveTo(0, -15);
        context.lineTo(-30, 5);
        context.lineTo(0, 5);
        context.lineTo(0, 0);
        context.lineTo(-10, 0);
        context.fill();
        context.restore();

        // Right wing
        context.save();
        // ... animate it
        context.translate(130, 115);
        context.scale(-1, 1);
        context.rotate(angle - 0.5);
        
        context.beginPath();
        context.fillStyle = '#909090';
        context.moveTo(0, -15);
        context.lineTo(-30, 5);
        context.lineTo(0, 5);
        context.lineTo(0, 0);
        context.lineTo(-10, 0);
        context.fill();
        context.restore();
        

        // Left Foot (Human: was misplaced)
        context.beginPath();
        context.moveTo(100-20, 280-120);
        context.lineTo(115-20, 260-120);
        context.lineTo(80- 20, 260-120);
        context.lineTo(100-20, 280-120);
        context.fillStyle = "#FFC300";
        context.fill();

        // Right Foot (Human: was misplaced)
        context.beginPath();
        context.moveTo(200-77, 280-120);
        context.lineTo(215-77, 260-120);
        context.lineTo(180-77, 260-120);
        context.lineTo(200-77, 280-120);
        context.fillStyle = "#FFC300";
        context.fill();

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

    function renderDecorations(ctx, levelData, ecs)
    {
      for(let i = 0; i < levelData.decorations.length; i++) {
        for(let j = 0; j < levelData.decorations[i].location.length; j++) {
          switch(levelData.decorations[i].type) {
            case "organics" :
              drawEdgeVegetation(ctx, levelData.decorations[i].location[j]);
              break;
            case "water" :
//TODO: need ecs!
              Water.init(ecs);
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
        for(let i = 0; i < numSpikes; i++) {
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

    
    // >>> Prompt: instructions/svg-to-canvas.0001.txt
    async function drawSvgOnCanvas(svgString, x, y, width, height, context) {
      const dataUrl = 'data:image/svg+xml;base64,' + btoa(svgString);
    
      const img = await loadImage(dataUrl);
    
      context.drawImage(img, x, y, width, height);
    }
    
    function loadImage(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
      });
    }

    /**
     * Create bitmap sprites
     * 
     * Entries in 'bitmaps' can either be a single bitmap or an array (for animations),
     * all generators are async; hence the blob of code to wait for all generators
     * simultaneously.
     */
    async function generateBitmaps()
    {
      // NOTE: no await for generators!

      if(!getBitmap("hatch")) {
        console.log("Creating hatch (animation)");
        bitmaps["hatch"] = GameUtils.generateAnimationFrames(96, 32, 90, drawHatch);
      }

      if(!getBitmap("snowyowl")) {
        console.log("Creating snowy owl (animation)");
        bitmaps["snowyowl"] = GameUtils.generateAnimationFrames(32*6, 32*6, 90, drawOwl, false);
      }

      if(!getBitmap("bubblepop")) {
        console.log("Creating bubble pop (animation)");
        bitmaps["bubblepop"] = GameUtils.generateAnimationFrames(32*2, 32*2, 60, drawBubblePop, false);
      }

      if(!getBitmap("16-spiked-star")) {
        console.log("Creating 16-spiked-star (single frame)");
        const width = 100;
        const height = 100;

        const tempContext = document.createElement('canvas').getContext('2d');
        tempContext.filter = "blur(2px)";
        drawSpikes(tempContext, width / 2, height / 2, 16, 60, 6, `rgba(255, 255,255, 0.9)`, true, false);
        bitmaps["16-spiked-star"] =  extractBitmapFromContext(tempContext, 0, 0, width, height);
      }

      if(!getBitmap("8-spiked-star")) {
        console.log("Creating 8-spiked-star (single frame)");
        const width = 100;
        const height = 100;

        const tempContext = document.createElement('canvas').getContext('2d');
        tempContext.filter = "blur(2px)";
        drawSpikes(tempContext, width / 2, height / 2, 8, 45, 8, `rgba(255, 255, 0, 1)`, true, true);
        bitmaps["8-spiked-star"] = extractBitmapFromContext(tempContext, 0, 0, width, height);
      }

      if(!getBitmap("house")) {
        console.log("Creating house (from SVG)");

        const width = 50;
        const height = 50;

        const tempContext = document.createElement('canvas').getContext('2d');

        await LlemmingsArt.drawSvgOnCanvas(getHouse(width, height), 0, 0, width, height, tempContext);
        bitmaps["house"] = extractBitmapFromContext(tempContext, 0, 0, width, height);
      }



      // ------
      // Wait for generators to do their thang.
      // >>> Prompt: instructions/art-async-generation.0001.txt
      
      // map over each array and create a Promise for each bitmap
      const promises = Object.values(bitmaps).flatMap(bitmap => {
        if (Array.isArray(bitmap)) {
          return bitmap.map(bmp => Promise.resolve(bmp));
        }
        return [Promise.resolve(bitmap)];
      });
      
      // await all bitmap promises in parallel
      await Promise.all(promises)
        .then(resolvedBitmaps => {
          // update bitmaps object with resolved data
          const keys = Object.keys(bitmaps);
          keys.forEach((key, i) => {
            if (Array.isArray(bitmaps[key])) {
              bitmaps[key] = resolvedBitmaps.slice(i, i + bitmaps[key].length);
            } else {
              bitmaps[key] = resolvedBitmaps[i];
            }
          });
        })
        .catch(error => {
          console.error(error); // handle error
        });
    }

    function getBitmap(name)
    {
      return bitmaps[name];
    }

    
    return {
      getHouse : getHouse,
      drawHatch : drawHatch,
      renderDecorations : renderDecorations,
      drawSpikes : drawSpikes,
      drawSvgOnCanvas : drawSvgOnCanvas,
      extractBitmapFromContext : extractBitmapFromContext,    /* WARNING: Async! */
      generateBitmaps : generateBitmaps, /* WARNING: Async! */
      getBitmap : getBitmap,
    }
})();
