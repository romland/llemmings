"use strict";
/**
 * Morphing text effect
 * 
 * >>> Human notes:
 * - I believe this effect is very expensive so will need to play around
 *   a bit with, for example, font-size, resolution and 'pixel size'.
 * - only one of these can run at any given time
 * - update() must be called by main loop (use onAnimationDone to get notice)
 * - init() expects a settings object looking something like this:
 *       settings = {
 *           text : "GAME OVER",
 *           placeOverCanvas : a DOM element (typically a canvas) which will remain untouched,
 *                             but its geometry will form the canvas holding the text effect
 *           offsetX : (canvas.width / 2) - 100,
 *           offsetY : (canvas.height / 2) - (fontSize / 2),
 *           font : Arial,
 *           fontSize : 40,
 *           speed : 1.7,
 *           pause : 120,               // num frames
 *           morphOut : true,
 *           destroy : true,
 *           onAnimationDone : null,    // called when animation is done
 *           onAnimationSceneChange : null
 *       }
 * 
 * >>> Prompt: ChatGPT - instructions/texteffect-morph.0001.txt
 */
var TextEffectMorph = (function () {

    let canvas, ctx, particles = [], settings;
    const pixelPositions = [];
    let initialized = false;

    // >>> Human: Added things around `scenesDone` and `activeParticles`, MAX_SCENES
    //     in update() so that we stop redrawing when things are in place.
    let waitFrames = 0;
    let scenesDone = 0;
    let maxScenes = 2;       // 2 = let it animate away too

    function init(givenSettings)
    {
        if(initialized) {
            throw "an instance of TextEffectMorph is already running"
        }

        if(!givenSettings.placeOverCanvas) {
            throw "missing mandatory placeOverCanvas";
        }

        settings = {
            text : givenSettings.text || "GAME OVER",
            placeOverCanvas : givenSettings.placeOverCanvas,
            offsetX : givenSettings.offsetX || (givenSettings.placeOverCanvas.width / 2) - 100,
            offsetY : givenSettings.offsetY || (givenSettings.placeOverCanvas.height / 2) - (40 / 2),
            font : givenSettings.font || "Henny Penny",
            fontSize : givenSettings.fontSize || 40,
            speed : givenSettings.speed || 4,
            pause : givenSettings.pause || 40,               // num frames
            morphOut : givenSettings.morphOut || true,
            onAnimationDone : givenSettings.onAnimationDone || null,    // called when animation is done
        }

        maxScenes = settings.morphOut ? 2 : 1;

        setupCanvas();
        renderStringPixels();
        clearCanvas();
        initializePixels();

        initialized = true;
    }


    // Human: Added when glueing things together.
    function cleanUp()
    {
        console.log("Cleaning up morph");
        waitFrames = 0;
        scenesDone = 0;
        initialized = false;
        ctx = null;
        if(canvas) {
            canvas.remove();
        }
        canvas = null;
        pixelPositions.length = 0;
        particles.length = 0;
    }


    function setupCanvas()
    {
        canvas = document.createElement('canvas');
        canvas.width = settings.placeOverCanvas.width;
        canvas.height = settings.placeOverCanvas.height;

        // Human: Added this "copy geometry" stuff
        const rect = settings.placeOverCanvas.getBoundingClientRect();
        canvas.style.position = "absolute";
        canvas.style.top = rect.top + "px";
        canvas.style.left = rect.left + "px";

        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
    }


    function renderStringPixels()
    {
        ctx.font = `bold ${settings.fontSize}px ${settings.font}`;
        ctx.fillText(settings.text,
            settings.offsetX || (canvas.width / 2) - 100,
            settings.offsetY || (canvas.height / 2) - (settings.fontSize/2)
        );

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < imageData.data.length; i += 4) {
            // Only get the position of pixels that are not transparent
            if (imageData.data[i + 3] !== 0) {
                const x = (i / 4) % canvas.width;
                const y = Math.floor(i / 4 / canvas.width);
                pixelPositions.push({ x, y });
            }
        }
    }


    function clearCanvas()
    {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }


    function initializePixels()
    {
        // Create a new image data object
        const newImageData = ctx.createImageData(canvas.width, canvas.height);

        // Set the pixels at random locations along the border
        for (let i = 0; i < newImageData.data.length; i += 4) {
            const x = (i / 4) % canvas.width;
            const y = Math.floor(i / 4 / canvas.width);
            if (x === 0 || y === 0 || x === canvas.width - 1 || y === canvas.height - 1) {
                newImageData.data[i] = 255;
                newImageData.data[i + 1] = 255;
                newImageData.data[i + 2] = 255;
                newImageData.data[i + 3] = 255;
            }
        }

        ctx.putImageData(newImageData, 0, 0);

        // Initialize the pixels
        particles = pixelPositions.map(position => {
            const particle = {
                x: Math.random() * canvas.width,
                y: Math.random() >= 0.5 ? canvas.height : -2,
                destX: position.x,
                destY: position.y,
                speed: Math.random() * 1.0 + settings.speed,
                size: 2,
            };
            const dx = particle.destX - particle.x;
            const dy = particle.destY - particle.y;
            particle.angle = Math.atan2(dy, dx);
            particle.vx = particle.speed * Math.cos(particle.angle);
            particle.vy = particle.speed * Math.sin(particle.angle);
            return particle;
        });
    }


    function drawParticle(particle)
    {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }


    function update()
    {
        if(!initialized) {
            return;
        }

        if(scenesDone >= maxScenes) {
            console.log("Stopping animation")
            if(settings.onAnimationDone) {
                settings.onAnimationDone();
            }
            cleanUp();
            return;
        }

        if(waitFrames-- > 0) {
            return;
        }

        let activeParticles = particles.length;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            const dx = particle.destX - particle.x;
            const dy = particle.destY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 4 || particle.x < 0 || particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
                particle.vx = 0;
                particle.vy = 0;
                activeParticles--;

                particle.x = particle.destX;
                particle.y = particle.destY;
            }

            drawParticle(particle);
        });

        if(activeParticles === 0) {
            scenesDone++;
            console.log("Done morphing")

            if(settings.onAnimationSceneChange) {
                settings.onAnimationSceneChange();
            }

            waitFrames = settings.pause;
            particles.forEach(particle => {
                particle.destX = Math.random() * canvas.width;
                particle.destY = Math.random() >= 0.5 ? canvas.height + 1 : -2;
                const dx = particle.destX - particle.x;
                const dy = particle.destY - particle.y;
                particle.angle = Math.atan2(dy, dx);
                particle.vx = particle.speed * 0.6 * Math.cos(particle.angle);
                particle.vy = particle.speed * 0.6 * Math.sin(particle.angle);
            });
        }

        // requestAnimationFrame(update);
    }

    return {
        init : init,
        update : update,
        cleanUp : cleanUp
    }
})();
