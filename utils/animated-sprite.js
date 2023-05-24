"use strict";
/*
>>> Prompt: instructions/art-hatch.0001.txt
>>> Prompt: instructions/art-hatch.0002.txt
>>> Prompt: instructions/art-hatch.0003.txt
>>> Prompt: instructions/art-animation.0001.txt
>>> Prompt: instructions/art-animation.0002.txt
>>> Prompt: instructions/art-animation.0003.txt
*/
class AnimatedSprite
{
    settings = {
        // easing function, expects 't' as only argument
        easing : Easings.easeOutBounce,

        // 1 forward, -1 backward
        direction: 1,

        // start over when reaching end
        repeat: false,

        // speed (1 = normal speed, one image / frame)
        speed: 1,

        // callback for when animation finished
        onAnimationDone : () => {
            // console.log("Animation done!");
        },

        // callback for when animation is repeating (default toggles direction of the animation)
        onAnimationRepeat : (settings) => {
            settings.direction = (settings.direction === 1 ? -1 : 1);
        }
    };

    frameImages = undefined;
    target = undefined;
    currentFrame = 0;
    done = false;


    constructor(targetContext, targetX, targetY, bitmaps, animationSettings)
    {
        this.target = {
            context : targetContext,
            x : targetX,
            y : targetY,
        };
        this.settings = { ...this.settings, ...animationSettings };
        this.frameImages = bitmaps;
    }

    reset()
    {
        this.currentFrame = 0;
        this.done = false;
    }

    cleanUp()
    {
        this.reset();
        this.frameImages = undefined;
        this.target = undefined;
    }

    update()
    {
      if(this.done) {
        // If done, just draw last frame without fuss.
        this.target.context.drawImage(
                this.frameImages[this.frameImages.length - 1],
                this.target.x,
                this.target.y
        );
        return;
      }

      const progress = this.settings.easing(this.currentFrame / this.frameImages.length);
    
      let index = Math.floor(progress * this.frameImages.length);
      if(this.settings.direction !== 1) {
        index = this.frameImages.length - index;
      }

      this.target.context.drawImage(
            this.frameImages[Math.round(Math.max(0, Math.min(index, this.frameImages.length - 1)))],
            this.target.x,
            this.target.y
      );

      this.currentFrame += (this.settings.speed || 1);
      if(this.currentFrame >= this.frameImages.length) {
        this.currentFrame = 0;
        if(!this.settings.repeat) {
          if(this.settings.onAnimationDone) {
            this.settings.onAnimationDone();
            this.done = true;
          }
          return;
        } else if(this.settings.onAnimationRepeat) {
            this.settings.onAnimationRepeat(this.settings);
        }
      }
    }
}
