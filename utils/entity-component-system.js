"use strict";
/**
* >>> Prompt: instructions/entity-component-system.0001.txt
* >>> Prompt: instructions/entity-component-system.0002.txt
* >>> Prompt: instructions/entity-component-system.0003.txt
* >>> Prompt: instructions/entity-component-system.0004.txt
* 
* Human notes:
* - Human CHEATED quite a bit on the LLM output of this. It is now an ECS
*   that I can work with.
* 
* - This is an entity-component-system for the variety of objects that can
*   exist in a level.
* 
* - I'm introducing this pattern way too late into the development cycle,
* 
* - The reason I am going down this route now is because I feel it may be 
*   advantegous for prompting the LLM about individual components, as they
*   are largely stand-alone
* 
* - There are significant parts that should be rewritten to use this 
*   (e.g. lemming, map) but I don't see that happening any time soon
*/
var ECS = (function () {
    
    // >>> Prompts: instructions/ecs-serialization.0001.txt
    class Serializable
    {
        serialize() {
            const obj = {};
            
            for (let key in this) {
                if (!key.startsWith('_')) {
                    const value = this[key];
                    
                    if (value instanceof Serializable) {
                        obj[key] = value.serialize();
                    } else {
                        obj[key] = value;
                    }
                }
            }
            
            return obj;
        }
        
        static deserialize(data, clazz) {
            const instance = new clazz();
            Object.assign(instance, data);
            
            // recursively deserialize child Serializable objects
            Object.values(instance)
            .filter(value => value instanceof Serializable)
            .forEach(value => {
                const child = Serializable.deserialize(value, clazz);
                instance[value.constructor.name.toLowerCase()] = child;
            });
            
            if(instance.init) {
                instance.init();
            }
            
            return instance;
        }
    }
    
    // ECS
    
    class Main {
        constructor() {
            this.entities = {};
            this.components = {};
            this.systems = [];
            this.entityCount = 0;
        }
        
        createEntity(label) {
            let entity = new Entity(this.entityCount++, label);
            this.entities[entity.id] = entity;
            return entity;
        }
        
        removeEntity(entity) {
            for (let componentType in entity.components) {
                let component = entity.components[componentType];
                delete this.components[componentType][entity.id];
            }
            delete this.entities[entity.id];
        }

        addComponent(entity, component) {
            let componentType = component.constructor.name;

            this.registerComponentType(componentType);

            this.components[componentType][entity.id] = component;
            entity.components[componentType] = component;
        }
        
        removeComponent(entity, componentType) {
            delete this.components[componentType][entity.id];
            delete entity.components[componentType];
        }
        
        registerComponentType(componentType)
        {
            if (!this.components[componentType]) {
                this.components[componentType] = {};
            }
        }
        
        /**
        * Human:
        * Calling this search() as deterrence.
        * 
        * Allows this: ecs.entities[ecs.search("PathFollowing Star")].components.Transform.rotation += 0.003;
        * Whilst you should use: ecs.entities[2].components.Transform.rotation += 0.003.
        * 
        * This method returns the id (2 above); cache it.
        * 
        * @param {*} label to search for
        * @returns entity id
        */
        search(label)
        {
            // This can be optimized using a lookup table populated with create/removeEntity
            const ents = Object.values(this.entities);
            for(let i = 0; i < ents.length; i++) {
                if(ents[i].label === label) {
                    return i;
                }
            }
            return null;
        }
        
        addSystem(system) {
            this.systems.push(system);
        }
        
        update(dt) {
            for (const system of this.systems) {
                system.update(dt, this.components);
            }
        }
        
        serialize() {
            let data = {
                entities: [],
            };
            
            for (let entityId in this.entities) {
                let entity = this.entities[entityId];
                let entityData = {
                    id: entity.id,
                    label: entity.label,
                    components: {}
                };
                
                for (let componentType in entity.components) {
                    let component = entity.components[componentType];
                    let componentData = component.serialize();
                    entityData.components[componentType] = componentData;
                }
                data.entities.push(entityData);
            }
            
            return JSON.stringify(data, null, 2);
        }
        
        deserialize(json) {
            let data = JSON.parse(json);
            let entitiesMap = new Map();
            
            for (let entityData of data.entities) {
                let entity = new Entity(entityData.id, entityData.label);
                entitiesMap.set(entity.id, entity);
                for (let componentType in entityData.components) {
                    let componentData = entityData.components[componentType];
                    let ComponentType = eval(componentType); // Note: using eval here for simplicity, but be careful!
                    let component = Serializable.deserialize(componentData, ComponentType);
                    this.addComponent(entity, component);
                }
                console.log("Loaded entity", entity);
            }
            
            this.entities = Object.fromEntries(entitiesMap.entries());
        }
    }
    
    class Entity {
        constructor(id, label) {
            this.id = id;
            this.label = label;
            this.components = {};
        }
    }
    
    class Component extends Serializable {
        constructor() { super(); }
    }
    
    class System {
        constructor() {}
        update() {}
    }
    
    // Components
    
    class Position extends Component {
        constructor(x, y) {
            super();
            this.x = x;
            this.y = y;
        }
    }
    
    class Velocity extends Component {
        constructor(dx, dy) {
            super();
            this.dx = dx;
            this.dy = dy;
        }
    }
    
    // >>> instructions/ecs-pathfollowing.0001.txt
    class PathFollowing extends Component {
        constructor(path, speed = 1) {
            super();
            this.path = path;
            this.speed = speed;
            this.currentPoint = 0;
        }
    }
    
    
    class Scale extends Component
    {
        constructor(x = 1, y = 1)
        {
            super();
            this.x = x;
            this.y = y;
        }
    }
    
    class Rotate extends Component
    {
        constructor(radians = 0)
        {
            super();
            this.radians = radians;
        }
    }
    
    class Renderable extends Component
    {
        constructor() { super(); }
    }
    
    class Sprite extends Renderable
    {
        constructor(bitmapName, bitmapIndex, alpha = 1)
        {
            super();
            
            this.bitmapName = bitmapName;
            this.bitmapIndex = bitmapIndex;
            this.alpha = alpha;
            
            // Human: We might be instantiated through deserialization, 
            //        no vars are passed in then.
            if(this.bitmapName) {
                this.init();
            }
        }
        
        init()
        {
            this._bitmap = Llemmings.getBitmap(this.bitmapName);
        }
        
        get bitmap()   { return this._bitmap; }
        set bitmap(bm) { this._bitmap = bm; }
        get width()    { return this._bitmap.width; }
        get height()   { return this._bitmap.height; }
    }
    
    
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
    class Animation extends Component {
        constructor(attributes)
        {
            super();
            this._elapsedTime = 0;
            this._initialVals = {};
            this.attributes = attributes;
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
     */
    // >>> Prompt: instructions/ecs-follow.0001.txt
    class Follow extends Component
    {
        constructor(entityId, componentName, attributes) {
            super();
            this.entityId = entityId;
            this.componentName = componentName;
            this.attributes = attributes;
        }
    }
    
    // Systems
    
    // >>> Prompt: instructions/ecs-animation.0001.txt
    class AnimationSystem extends System
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
    
    
    class MovementSystem extends System
    {
        constructor(ecs)
        {
            super();
            ecs.registerComponentType("Position");
            ecs.registerComponentType("Velocity");
            ecs.registerComponentType("PathFollowing");
        }
        
        update(dt, components) {
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
                
                const target = pathFollowing.path[pathFollowing.currentPoint];
                
                // Calculate distance to target
                const dx = target.x - position.x;
                const dy = target.y - position.y;
                const distance = Math.hypot(dx, dy);
                
                // Check if target is reached
                if (distance <= 1) {
                    // Reset to the beginning if the end of the path is reached
                    if (pathFollowing.currentPoint >= pathFollowing.path.length - 1) {
                        pathFollowing.currentPoint = 0;
                    } else {
                        pathFollowing.currentPoint++;
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

    
    // >>> Prompt: instructions/ecs-follow.0001.txt
    class FollowSystem extends System
    {
        constructor(ecs)
        {
            super();
            ecs.registerComponentType("Follow");
        }

        update(deltaTime, components)
        {
            // For each entity with a Follow component
            for (const [id, follow] of Object.entries(components.Follow)) {
                // Get the followed entity's components
                const followedComponents = components[follow.componentName][follow.entityId];
                // Copy the specified attributes from the followed entity to the entity with the Follow component
                for (const attribute of follow.attributes) {
                    components[followedComponents.constructor.name][id][attribute] = followedComponents[attribute];
                }
            }
        }
    }
    
    
    class RenderSystem extends System
    {
        constructor(ecs, context)
        {
            super();
            this.context = context;
            ecs.registerComponentType("Sprite");
        }
        
        update(dt, components)
        {
            // Sprite and Transform
            // Note: At this moment, if there is no sprite on the Entity, Transform is ignored
            for (const [id, sprite] of Object.entries(components.Sprite)) {
                const position = components.Position[id];
                const rotate = components.Rotate ? components.Rotate[id] : undefined;
                const scale = components.Scale ? components.Scale[id] : undefined;
                
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
                    
                    this.context.drawImage(sprite.bitmap, -sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height);
                } else {
                    this.context.drawImage(sprite.bitmap, position.x, position.y);
                }
                this.context.restore();
            }
        }
    }
    
    
    /**
    * This is simply for testing.
    * It should be elsewhere and should grab it from levelData
    */
    function init(levelData, context)
    {
        let ecs = new Main();
        
        if(true) {
            let entity1 = ecs.createEntity("Test 1");
            ecs.addComponent(entity1, new Position(0, 0));
            ecs.addComponent(entity1, new Velocity(1, 1));
            
            let entity2 = ecs.createEntity("Test 2");
            ecs.addComponent(entity2, new Position(10, 10));
            ecs.addComponent(entity2, new Velocity(-1, -1));
            
            let path = [{"x": 5,"y": 5},{"x": 65,"y": 65},{"x": 130,"y": 45}];
            let entity3 = ecs.createEntity("PathFollowing Star");
            ecs.addComponent(entity3, new Position(5, 5));
            ecs.addComponent(entity3, new PathFollowing(path, 0.25));
            ecs.addComponent(entity3, new Sprite("16-spiked-star"));
            ecs.addComponent(entity3, new Scale(1, 1));
            ecs.addComponent(entity3, new Rotate(1));
        } else {
            const data = {
                "entities": [
                    {
                        "id": 0,
                        "label": "Test 1",
                        "components": {
                            "Position": {
                                "x": 0,
                                "y": 0
                            },
                            "Velocity": {
                                "dx": 1,
                                "dy": 1
                            }
                        }
                    },
                    {
                        "id": 1,
                        "label": "Test 2",
                        "components": {
                            "Position": {
                                "x": 10,
                                "y": 10
                            },
                            "Velocity": {
                                "dx": -1,
                                "dy": -1
                            }
                        }
                    },
                    {
                        "id": 2,
                        "label": "PathFollowing Star",
                        "components": {
                            "Position": {
                                "x": 5,
                                "y": 5
                            },
                            "Rotate": {
                                "radians": 0,
                            },
                            "Scale": {
                                "x": 1,
                                "y": 1,
                            },
                            "Animation": {
                                "attributes" : {
                                    "Rotate": {
                                        "radians": {
                                            "target": Math.PI * 2,
                                            "repeat": -1,
                                            "direction": 1,
                                            "reverseOnRepeat": false,
                                            "easing": "linear",
                                            "speed": 0.00010,
                                        },
                                    },
                                }
                            },
                            "PathFollowing": {
                                "path": [
                                    {
                                        "x": 5,
                                        "y": 5
                                    },
                                    {
                                        "x": 65,
                                        "y": 65
                                    },
                                    {
                                        "x": 130,
                                        "y": 45
                                    }
                                ],
                                "speed": 0.05,
                                "currentPoint": 0
                            },
                            "Sprite": {
                                "bitmapName": "16-spiked-star",
                                "alpha": 1.0,
                            }
                        }
                    },
                    {
                        "id": 3,
                        "label": "Follow Star",
                        "components": {
                            "Follow": {
                                "entityId": 2,
                                "componentName": "Position",
                                "attributes": ["x", "y"],
                            },
                            "Position": {
                                "x": 0, // followed
                                "y": 0  // followed
                            },
                            "Rotate": {
                                "radians": 0,
                            },
                            "Scale": {
                                "x": 1,
                                "y": 1,
                            },
                            "Animation": {
                                "attributes" : {
                                    "Rotate": {
                                        "radians": {
                                            "target": Math.PI * 2,
                                            "repeat": -1,
                                            "direction": -1,
                                            "reverseOnRepeat": false,
                                            "easing": "linear",
                                            "speed": 0.00010,
                                        },
                                    },
                                    "Scale": {
                                        "x": {
                                            "target": 0.7,
                                            "repeat": -1,
                                            "direction": 1,
                                            "reverseOnRepeat": true,
                                            "easing": "easeInOutCubic",
                                            "speed": 0.0001,
                                        },
                                        "y": {
                                            "target": 0.7,
                                            "repeat": -1,
                                            "direction": 1,
                                            "reverseOnRepeat": true,
                                            "easing": "easeInOutCubic",
                                            "speed": 0.0001,
                                        },
                                    },
                                }
                            },
                            "Sprite": {
                                "bitmapName": "8-spiked-star",
                                "alpha": 0.7,
                            }
                        }
                    }
                ]
            };
            ecs.deserialize(JSON.stringify(data));
        }
        
        ecs.addSystem(new MovementSystem(ecs));
        ecs.addSystem(new AnimationSystem(ecs));
        
        ecs.addSystem(new FollowSystem(ecs));  // Note: Make sure this is the last System before rendering
        ecs.addSystem(new RenderSystem(ecs, context));
        
        // console.log(ecs.serialize());
        
        return ecs;
    }
    
    return {
        // Testing
        init : init,
        
        // ECS
        Main : Main,
        
        // Systems
        MovementSystem : MovementSystem,
        RenderingSystem : RenderSystem,
        FollowSystem : FollowSystem,
        AnimationSystem : AnimationSystem,
        
        // Components
        Position : Position,
        Velocity : Velocity,
        PathFollowing : PathFollowing,
        Sprite : Sprite,
        Rotate : Rotate,
        Scale : Scale,
        Animation : Animation,
        Follow : Follow,
    }
})();
