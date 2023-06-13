"use strict";
var ECSystems = (function () {

    /**
    * Animation Example:
    *    "attributes" : {
    *        // This will animate the 'radians' attribute on the 'Rotate' component in this entity
    *        "Rotate": {
    *            "radians": {
    *                "target": Math.PI * 2,      // Full circle
    *                "repeat": -1,               // Repeat forever
    *                "direction": 1,             // Forward (-1 backward)
    *                "reverseOnRepeat": false,   // No reverse on repeat
    *                "easing": "linear",
    *                "speed": 0.001,
    *            },
    *        },
    *        // Will animate the 'x' attribute on 'Scale' component in this entity
    *        "Scale": {
    *            "x": {
    *                "target": 0.1,               // 10% size
    *                "repeat": -1,
    *                "direction": 1,
    *                "reverseOnRepeat": true,
    *                "easing": "easeInOutCubic",  // Specific easing
    *                "speed": 0.00005,
    *            },
    *        }
    *    }  
    * 
    */
    // >>> Prompt: instructions/ecs-animation.0001.txt
    class AnimationSystem extends ECS.System
    {
        constructor(ecs)
        {
            super();
            ecs.registerComponentType("Animation");
        }

        update(deltaTime, components) {
            for (const [id, animation] of Object.entries(components.Animation)) {
                animation._elapsedTime += deltaTime;
                
                for (const [componentName, attributes] of Object.entries(animation.attributes)) {
                    const component = components[componentName][id];
                    
                    if(!animation._initialVals[componentName]) {
                        // Store the initial values of each attribute for this component
                        animation._initialVals[componentName] = Object.assign({}, component);
                    }
                    
                    for (const [attributeName, animationData] of Object.entries(attributes)) {
                        const initialValue = animation._initialVals[componentName][attributeName];
                        const targetValue = animationData.target;
                        
                        let progress = animation._elapsedTime * animationData.speed;
                        const completedRepeats = Math.floor(progress / (animationData.direction * targetValue));
                        const inReverse = animationData.reverseOnRepeat && completedRepeats % 2 !== 0;
                        
                        if (animationData.repeat !== -1 && completedRepeats >= animationData.repeat) {
                            progress = animationData.direction * targetValue * animationData.repeat;
                        } else {
                            progress = progress % (animationData.direction * targetValue);
                            if (inReverse) {
                                progress = animationData.direction * targetValue - progress;
                            }
                        }
                        
                        const easing = Easings[animationData.easing];
                        const t = progress / (animationData.direction * targetValue);
                        const easedProgress = easing(t);
                        
                        // Calculate the animated value as a weighted sum of the initial and target values
                        const animatedValue = (1 - easedProgress) * initialValue + easedProgress * targetValue;
                        component[attributeName] = animatedValue;
                    }
                }
            }
        }
    }
    
    
    class MovementSystem extends ECS.System
    {
        constructor(ecs)
        {
            super();
            ecs.registerComponentType("Position");
            ecs.registerComponentType("Velocity");
            ecs.registerComponentType("PathFollowing");
        }
        
        update(dt, components)
        {
            // Position and Velocity
            for (const [id, position] of Object.entries(components.Position)) {
                const velocity = components.Velocity[id];
                if(velocity) {
                    position.x += velocity.dx;
                    position.y += velocity.dy;
                }
            }
            
            // PathFollowing
            for (const [id, pathFollowing] of Object.entries(components.PathFollowing)) {
                const position = components.Position[id];
                
                // Throw error when Position component not found
                if (!position) {
                    throw new Error('PathFollowing requires Position component');
                }
                
                // Throw error when Velocity component found
                if (components.Velocity[id]) {
                    throw new Error('PathFollowing may not have Velocity component');
                }
                
                const path = pathFollowing.path;

                const target = path[pathFollowing._currentPoint];
                
                // Calculate distance to target
                const dx = target.x - position.x;
                const dy = target.y - position.y;
                const distance = Math.hypot(dx, dy);
                
                // Check if target is reached
                if (distance <= 1) {
                    // Reset to the beginning if the end of the path is reached
                    if (pathFollowing._currentPoint >= path.length - 1) {
                        pathFollowing._currentPoint = 0;
                    } else {
                        pathFollowing._currentPoint++;
                    }
                }
                
                // Calculate direction to target
                const angle = Math.atan2(dy, dx);
                
                // Update position based on direction and speed
                const velocity = {
                    x: Math.cos(angle) * pathFollowing.speed,
                    y: Math.sin(angle) * pathFollowing.speed,
                };
                
                position.x += velocity.x;
                position.y += velocity.y;
            }
        }
    }


    /**
     * I deliberated how to go about having child or sibling entities. I would
     * want e.g. two sprites that had two different rotations on the same Entity
     * but should share position.
     * I do not want a lot of boilerplate outside of the ECS for this since it
     * would mean I could not easily describe it in JSON (levels).
     * 
     * I tried finding patterns for child/sibling entities but none of them 
     * appealed to me as it would mean boilerplate in Entities and Systems.
     * 
     * Also:
     * In order to not make the "sibling" Entities leak into every single 
     * System I might ask the LLM to make, I went with a "Follow" component 
     * instead: it can follow any attributes of another entity. The name might
     * not be optimal as it implies Position, but it's not limited to that;
     * perhaps a better component name would be "Copy".
     * 
     * I'm happy with the idea and functionality ... for now.
     * 
     * TLDR: This follows attributes in another Entity and applies it to 
     *       components of this Entity.
     * 
     * Attributes should look like this (to follow both position and scale of entity 2):
     *   "attributes": {
     *       "Position": {
     *           "entityId": 2,
     *           "attributes": ["x", "y"],
     *       },
     *       "Scale": {
     *           "entityId": 2,
     *           "attributes": ["x", "y"],
     *       },
     *   }
     * 
     */
    // >>> Prompt: instructions/ecs-follow.0001.txt
    // >>> Prompt: instructions/ecs-follow.0002.txt
    class FollowSystem extends ECS.System {
        constructor(ecs) {
          super();
          ecs.registerComponentType("Follow");
        }
      
        update(deltaTime, components) {
          for (const [id, follow] of Object.entries(components.Follow)) {
            for (const [componentName, componentData] of Object.entries(follow.attributes)) {
              const followedComponents = components[componentName][componentData.entityId];

              for (const attribute of componentData.attributes) {
                components[followedComponents.constructor.name][id][attribute] = followedComponents[attribute];
              }
            }
          }
        }
      }
    
    
    class RenderSystem extends ECS.System
    {
        constructor(ecs, context)
        {
            super();
            this.context = context;
            ecs.registerComponentType("Rotate");
            ecs.registerComponentType("Scale");
            ecs.registerComponentType("Sprite");
            ecs.registerComponentType("AnimatedSprite");
        }
        
        update(dt, components)
        {
            // Note: At this moment, if there is no sprite on the Entity, Transform is ignored

            // Sprite and Transform
            for (const [id, sprite] of Object.entries(components.Sprite)) {
                const position = components.Position[id];
                const rotate = components.Rotate[id];
                const scale = components.Scale[id];

                this.drawBitmap(sprite.bitmap, sprite, position, rotate, scale);
            }

            // AnimatedSprite and Transform
            for (const [id, sprite] of Object.entries(components.AnimatedSprite)) {
                const position = components.Position[id];
                const rotate = components.Rotate[id];
                const scale = components.Scale[id];

                this.drawBitmap(this.getAnimatedSpriteFrame(sprite), sprite, position, rotate, scale);
            }
        }

        /**
         * 
         * @param {*} bitmap 
         * @param {Sprite or AnimatedSprite} sprite 
         * @param {*} position 
         * @param {*} rotate 
         * @param {*} scale 
         */
        drawBitmap(bitmap, sprite, position, rotate, scale)
        {
            if(!position) {
                throw "Sprite requires Position component";
            }
            
            this.context.save();
            this.context.globalAlpha = sprite.alpha;
            
            if(rotate || scale) {
                this.context.translate(position.x + sprite.width/2, position.y + sprite.height/2);
                if(rotate) {
                    this.context.rotate(rotate.radians);
                }
                
                if(scale) {
                    this.context.scale(scale.x, scale.y);
                }
                
                this.context.drawImage(bitmap, -sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height);
            } else {
                this.context.drawImage(bitmap, position.x, position.y);
            }
            this.context.restore();
        }

        /**
         * 
         * @param {Component} animatedSprite 
         * @returns bitmap
         */
        getAnimatedSpriteFrame(animatedSprite)
        {
            if(animatedSprite._done) {
                // If done, just draw last frame without fuss.
                // TODO: Just realized this needs a bit more work for reverse direction (first frame).
                return animatedSprite.bitmaps[animatedSprite.bitmaps.length - 1];
            }

            const progress = Easings[animatedSprite.easing](animatedSprite._currentFrame / animatedSprite.bitmaps.length);
            
            let index = Math.floor(progress * animatedSprite.bitmaps.length);
            if(animatedSprite.direction !== 1) {
                index = animatedSprite.bitmaps.length - index;
            }
            
            const ret = animatedSprite.bitmaps[Math.round(Math.max(0, Math.min(index, animatedSprite.bitmaps.length - 1)))];
            
            animatedSprite._currentFrame += (animatedSprite.speed || 1);
            if(animatedSprite._currentFrame >= animatedSprite.bitmaps.length) {
                animatedSprite._currentFrame = 0;
                if(!animatedSprite.repeat) {
                    if(animatedSprite.onAnimationDone) {
                        animatedSprite.onAnimationDone(animatedSprite);
                    }
                    animatedSprite._done = true;
                    return ret;

                } else if(animatedSprite.onAnimationRepeat) {
                    animatedSprite.onAnimationRepeat(animatedSprite);
                }
            }
            
            return ret;
        }
    }
    
    
    class ShakeSystem extends ECS.System {
        constructor(ecs) {
            super();
            ecs.registerComponentType("Shake");
        }

        update(dt, components) {
            for (const [id, shake] of Object.entries(components.Shake)) {
                if (shake._stopped) {
                    continue;
                }

                const position = components.Position[id];
                const rotate = components.Rotate[id];
                const scale = components.Scale[id];
                
                if(position && !shake._orgPosition) {
                    shake._orgPosition = { x:position.x, y:position.y };
                }

                if(scale && !shake._orgScale) {
                    shake._orgScale = { x:scale.x, y:scale.y };
                }

                if(rotate && shake._orgRotate === null) {
                    shake._orgRotate = rotate.radians;
                }

                shake._timer += dt;
                
                if (shake._timer > shake.duration) {
                    shake._stopped = true;
                    shake._timer = 0;
                    
                    position.x = shake._orgPosition.x;
                    position.y = shake._orgPosition.y;
                    if(rotate) {
                        rotate.radians = shake._orgRotate;
                    }

                    if(scale) {
                        scale.x = shake._orgScale.x;
                        scale.y = shake._orgScale.y;
                    }
                    continue;
                }
                
                const offset = {
                    x: (Math.random() * 2 - 1) * shake.intensity,
                    y: (Math.random() * 2 - 1) * shake.intensity,
                    r: (Math.random() * 2 - 1) * shake.intensity,
                    sx: (Math.random() * 2 - 1) * shake.intensity,
                    sy: (Math.random() * 2 - 1) * shake.intensity,
                };
                
                position.x = shake._orgPosition.x + offset.x;
                position.y = shake._orgPosition.y + offset.y;
                if(rotate) {
                    rotate.radians = shake._orgRotate + offset.r;
                }
                if(scale) {
                    scale.x = shake._orgScale.x + offset.sx;
                    scale.y = shake._orgScale.y + offset.sy;
                }
            }
        }
    }
    
    
    return {
        MovementSystem,
        RenderSystem,
        FollowSystem,
        AnimationSystem,
        ShakeSystem,
    };
})();
