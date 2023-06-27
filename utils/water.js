"use strict";
const Water = (function () {
    function init(ecs)
    {
        for(let i = 0; i < 100; i++) {
            createBubble(ecs);
        }
    }
    
    function createBubble(ecs)
    {
        // Test Animated bubble pop
        let waterBubble = ecs.createEntity("WaterBubble");
        ecs.addComponent(waterBubble, new ECS.Components.Position(Math.random() * 750, 550 + Math.random() * 50));
        ecs.addComponent(waterBubble, new ECS.Components.AnimatedSprite(
            "bubblepop",      // bitmap name
            "linear",         // easing
            1,                // direction
            true,             // repeat,
            0.25 + Math.random() * 0.25,              // speed,
            1,                // alpha
            null,             // onAnimationDone callback
            (settings) => {   // onAnimationRepeat callback
                waterBubble.components.Animation.reset();
                waterBubble.components.Position.y = 550 + Math.random() * 50;
                waterBubble.components.Position.x = Math.random() * 750;
                waterBubble.components.Animation.attributes.Position.y.target = waterBubble.components.Position.y - 100;
            }
        ));
        const size = 0.35 + Math.random() * 0.2;
        ecs.addComponent(waterBubble, new ECS.Components.Scale(size, size));
        // Animate so that it floats up
        ecs.addComponent(waterBubble, new ECS.Components.Animation(
            {
                "Position": {
                    "y": {
                        "target": waterBubble.components.Position.y - 150,
                        "repeat": 1,
                        "direction": 1,
                        "reverseOnRepeat": false,
                        "easing": "linear",
                        "speed": 0.04 + Math.random() * 0.04,
                    },
                },
            }
        ));
    }
    
    function cleanUp()
    {
    }
    
    return {
        init : init,
        cleanUp : cleanUp,
    };
})();
