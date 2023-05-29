var LlemmingsDebug = (function () {
    let coordinatesDiv, infoDiv, ctx;

    function init(sharedVars)
    {
        // Get debug DOM elements
        coordinatesDiv = document.getElementById("coordinatesDiv");
        infoDiv = document.getElementById("infoDiv");
        ctx = sharedVars.ctx;
    }

    function cleanUp()
    {
        if(coordinatesDiv) {
          coordinatesDiv.innerHTML = "";
        }

        if(infoDiv) {
          infoDiv.innerHTML = "";
        }
    }

    function updateInfoDiv(lem)
    {
        infoDiv.innerHTML = `ID: ${lem.id} 
            Act: ${lem.action} 
            X: ${lem.x.toFixed(1)}
            Y: ${lem.y.toFixed(1)}
            velX: ${lem.velX.toFixed(2)} 
            velY: ${lem.velY.toFixed(2)} 
            Started: ${lem.actionStarted}
            Age: ${lem.age}
            `;
    }

    function addEventListeners(canvas)
    {
        // >>> Prompt: instructions/coordinates-div.0001.txt
        canvas.addEventListener("mousemove", function(event) {
            const rect = canvas.getBoundingClientRect();
  
            // >>> Prompt: instructions/screen-coord-to-canvas.0001.txt
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
          
            const x = Math.floor((event.clientX - rect.left) * scaleX);
            const y = Math.floor((event.clientY - rect.top) * scaleY);
  
            const imageData = ctx.getImageData(x, y, 1, 1);
            const pixel = imageData.data;
    
            const color = "#" + ("000000" + GameUtils.rgbToHex(pixel[0], pixel[1], pixel[2])).slice(-6);
    
            coordinatesDiv.innerHTML = "X: " + x + ", Y: " + y + " | Color: " + color;
        });
    }


    return {
        init : init,
        cleanUp : cleanUp,
        updateInfoDiv : updateInfoDiv,
        addEventListeners : addEventListeners,
    }
})();
