"use strict";
/**
 * >>> Prompt: instructions/dialog.0001.txt
 * 
 * Usage: <button onclick='openDialog("Test", "<h1>FNurtiblam</h1>")'>test</button>
 */
var LlemmingsDialog = (function ()
{
    // Human: Added functionality for onBeforeClose and ability to add DOM node
    function openDialog(title, htmlContent, onBeforeClose = null) {
        // Update modal with new content
        document.getElementById("modalTitle").innerHTML = title;

        if(typeof htmlContent === "string") {
            // Can be a string
            document.getElementById("modalContent").innerHTML = htmlContent;
        } else {
            // Or an HTML DOM element
            document.getElementById("modalContent").append(htmlContent);
        }
        
        // Show modal
        var modal = document.getElementById("myModal");
        modal.style.display = "block";
        
        // Add click listener to close button
        var closeButton = document.getElementsByClassName("modal-close")[0];
        closeButton.onclick = function() {
            closeDialog(onBeforeClose);
        }
        
        // Center modal
        window.onresize = function() {
            var modalContent = document.getElementsByClassName("modal-content")[0];
            var windowHeight = window.innerHeight;
            var modalHeight = modalContent.offsetHeight;
            modalContent.style.top = Math.max(0, (windowHeight - modalHeight) / 2) + "px";
        }
        window.onresize();
    }
    
    function closeDialog(onBeforeClose)
    {
        if(onBeforeClose) {
            onBeforeClose();
        }

        document.getElementById("myModal").style.display = "none";
    }
    
    return {
        openDialog : openDialog,
        closeDialog : closeDialog
    }
})();
