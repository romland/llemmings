"use strict";
var Particles = (function () {

    const explosions = [];
    let ctx;

    function init(sharedVars)
    {
        ctx = sharedVars.ctx;
    }

    // >>> Prompt: instructions/particle-explosion.0001.txt
    class Particle
    {
        constructor(x, y)
        {
            this.x = x;
            this.y = y;
            this.velX = (Math.random() - 0.5) * 4; // Random horizontal velocity
            this.velY = -Math.random() * 6; // Random upward velocity
            this.life = 60; // Number of frames this particle should exist for
            this.color = "#FFA500"; // Orange color
        }

        update()
        {
            // Update position based on velocity
            this.x += this.velX;
            this.y += this.velY;
        
            // Apply gravity
            this.velY += 0.15;
        
            // Decrease life counter
            this.life--;
        
            // Fade out as life approaches zero
            if (this.life <= 0) {
                this.color = "#00000000"; // Transparent color
            }
        }
        
        draw()
        {
            // Draw a small rectangle at the particle's location
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, 2, 2);
        }
    }
  
    class Explosion
    {
        particles = [];

        constructor(x, y)
        {
            for(let i = 0; i < 50; i++) {
              const p = new Particle(x + Math.random() * 20 - 10, y + Math.random() * 20 - 10);
              p.color = i < 20 ? "#55ff55" : "#5555ff";
              this.particles.push(p);
            }
        }
        
        update()
        {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const particle = this.particles[i];

                particle.update();
                particle.draw();
        
                // Remove dead particles from the array
                if (particle.life <= 0) {
                  this.particles.splice(i, 1);
                }
            }
        }

        done()
        {
            return this.particles.length === 0;
        }

        cleanUp()
        {
            this.particles.length = 0;
        }
    }

    function cleanUp()
    {
        explosions.length = 0;
    }

    function update()
    {
        for (let i = explosions.length - 1; i >= 0; i--) {
            explosions[i].update();
            if(explosions[i].done()) {
                explosions[i].cleanUp();
                explosions.splice(i, 1);
            }
        }
    }

    function createExplosion(x, y)
    {
        explosions.push(
            new Explosion(x, y)
        );
    }

    return {
        init : init,
        update : update,
        cleanUp : cleanUp,
        createExplosion : createExplosion,
    }
})();
