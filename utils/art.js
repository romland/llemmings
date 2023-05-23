"use strict";
var LlemmingsArt = (function ()
{
    /**
     * >>> Prompt: instructions/art-house.0001.txt
     * I... sadly do not use this house. I stole a house. See below.
     */
    function getChatGPTHouse()
    {
        return `<svg width="100" height="100" viewBox="0 0 100 100">
        <!-- House body -->
        <rect x="10" y="30" width="80" height="50" fill="#FFB6C1" />
      
        <!-- House roof -->
        <polygon points="10,30 50,10 90,30" fill="#FFDAB9" />
      
        <!-- Door -->
        <rect x="40" y="60" width="20" height="20" fill="#00FFFF" />
      
        <!-- Door handle -->
        <circle cx="58" cy="70" r="2" fill="#000" />
      
        <!-- Window 1 -->
        <rect x="18" y="38" width="15" height="15" fill="#ADD8E6" />
      
        <!-- Window 2 -->
        <rect x="67" y="38" width="15" height="15" fill="#ADD8E6" />
      </svg>
      `
    }

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
    

    return {
        getHouse : getHouse,
        drawHatch : drawHatch,
    }
})();
