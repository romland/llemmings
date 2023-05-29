"use strict";
var Particles = (function ()
{
    const systems = [];
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
            this.velX = (Math.random() - 0.5) * 4;  // Random horizontal velocity
            this.velY = -Math.random() * 6;         // Random upward velocity
            this.life = 60;
            this.color = [0xFF, 0xA5, 0x00];        // Orange color
            this.gravity = 0.15;
            this.fadeFrames = Math.abs(this.life / 6);
        }

        update()
        {
            // Update position based on velocity
            this.x += this.velX;
            this.y += this.velY;
        
            // Apply gravity
            this.velY += this.gravity;
        
            // Decrease life counter
            this.life--;
        
            // Fade out as life approaches zero
            if (this.life < this.fadeFrames) {
                if(this.color.length === 3) {
                    this.color.push(0xff);
                } else if(this.life === this.fadeFrames) {
                    this.color[3] = 0xff;
                }
                this.color[3] -= Math.abs(255/this.fadeFrames);
            }
        }
        
        draw()
        {
            // Draw a small rectangle at the particle's location
            ctx.fillStyle = `rgba(${this.color.join(",")})`;
            ctx.fillRect(this.x, this.y, 2, 2);
        }

        done()
        {
            return this.life <= 0;
        }
    }

    class Explosion
    {
        particles = [];

        constructor(x, y)
        {
            for(let i = 0; i < 50; i++) {
              const p = new Particle(x + Math.random() * 20 - 10, y + Math.random() * 20 - 10);
              p.color = i < 20 ? [0x55, 0xff, 0x55] : [0x55, 0x55, 0xff];
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
                if (particle.done()) {
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

    class Firework
    {
        rocket = null;

        constructor(x, y)
        {
            const lifeSpan = 120;

            let x2 = x - 100 + (Math.random() * 200);
            let y2 = -200; // let gravity take care of it
            
            const xVelocity = -Math.abs(x2 - x) / lifeSpan;
            const yVelocity = -Math.abs(y2 - y) / lifeSpan;
            
            this.rocket = new Particle(x, y);
            this.rocket.velX = xVelocity;
            this.rocket.velY = yVelocity;
            this.rocket.life = lifeSpan;
            this.rocket.gravity = 0.05;
        }

        update()
        {
            if(this.rocket.life === 0) {
                createExplosion(this.rocket.x, this.rocket.y);
            }

            if(this.rocket.done()) {
                this.rocket = null;
            } else {
                this.rocket.update();
                this.rocket.draw();
            }
        }

        done()
        {
            return !this.rocket;
        }

        cleanUp()
        {
            this.rocket = null;
        }
    }

    function cleanUp()
    {
        systems.length = 0;
    }

    function createExplosion(x, y)
    {
        systems.push(new Explosion(x, y));
    }

    function createFirework(x, y)
    {
        systems.push(new Firework(x, y));
    }

    function update()
    {
        for (let i = systems.length - 1; i >= 0; i--) {
            systems[i].update();
            if(systems[i].done()) {
                systems[i].cleanUp();
                systems.splice(i, 1);
                console.log("Removed particle system. Now,", systems.length, "remaining");
            }
        }
    }

    return {
        init : init,
        update : update,
        cleanUp : cleanUp,
        createExplosion : createExplosion,
        createFirework : createFirework,
    }
})();
