"use strict";
/**
 * Organical growth helpers.
 * >>> Prompt: instructions/organics-bushes-grass-moss.0001.txt
 */
var LlemmingsOrganics = (function () {

    const leafColors = ["#8B4513", "#228B22", "#aabb00", "#ee7777"]; // Brown, Green, Yellow, Red

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
    
    
    function rand(min, max)
    {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
    
    function drawMoss(ctx, x, y, size)
    {
      ctx.fillStyle = 'rgb(' + rand(0, 50) + ', ' + rand(100, 150) + ', ' + rand(0, 50) + ')';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    function drawGrass(ctx, x, y, size)
    {
      ctx.fillStyle = 'rgb(' + rand(0, 50) + ', ' + rand(100, 150) + ', ' + rand(0, 50) + ')';
      ctx.fillRect(x - size / 2, y, size, -size);
    }
    
    function drawGround(ctx, x, y)
    {
      for (let i = 0; i < rand(500, 1000); i++) {
        drawMoss(ctx, x + rand(0, canvas.width), y + rand(0, 50), rand(10, 20));
      }
    
      for (let i = 0; i < rand(500, 1000); i++) {
        drawGrass(ctx, x + rand(0, canvas.width), y + rand(0, 50), rand(10, 20));
      }
    }
    
    function drawTree(ctx, x, y)
    {
      const treeWidth = Math.random() * 40 + 20;
      let len = 127;
      drawLeaves(ctx, x + 0, y + len, len, -90, treeWidth, leafColors[Math.floor(Math.random() * leafColors.length)], "#000");
    }
    
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

    return {
        drawEdgeVegetation : drawEdgeVegetation
    }
})();
