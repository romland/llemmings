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
            if (!this.components[componentType]) {
                this.components[componentType] = {};
            }
            this.components[componentType][entity.id] = component;
            entity.components[componentType] = component;
        }
        
        removeComponent(entity, componentType) {
            delete this.components[componentType][entity.id];
            delete entity.components[componentType];
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
        constructor(bitmapName, bitmapIndex)
        {
            super();
            
            this.bitmapName = bitmapName;
            this.bitmapIndex = bitmapIndex;
            
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
    
    // >>> Prompt: instructions/ecs-animation.0001.txt
    class Animation extends Component {
        constructor() {
            super();
            this._elapsedTime = 0;
            this.attributes = {};
        }
    }

    // Systems
    
    // >>> Prompt: instructions/ecs-animation.0001.txt
    class AnimationSystem {
        update(deltaTime, components) {
            for (const [id, animation] of Object.entries(components.Animation)) {
                animation._elapsedTime += deltaTime;
                
                for (const [componentName, attributes] of Object.entries(animation.attributes)) {
                    const component = components[componentName][id];
                    
                    for (const [attributeName, animationData] of Object.entries(attributes)) {
                        let progress = animation._elapsedTime * animationData.speed;
                        const completedRepeats = Math.floor(progress / (animationData.direction * animationData.target));
                        const inReverse = animationData.reverseOnRepeat && completedRepeats % 2 !== 0;
                        
                        if (animationData.repeat !== -1 && completedRepeats >= animationData.repeat) {
                            progress = animationData.direction * animationData.target * animationData.repeat;
                        } else {
                            progress = progress % (animationData.direction * animationData.target);
                            if (inReverse) {
                                progress = animationData.direction * animationData.target - progress;
                            }
                        }
                        
                        const easing = Easings[animationData.easing];
                        const t = progress / (animationData.direction * animationData.target);
                        const easedProgress = easing(t);
                        
                        component[attributeName] = easedProgress * (animationData.direction * animationData.target);
                    }
                }
            }
        }
    }
    

    class MovementSystem extends System
    {
        constructor()
        {
            super();
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
    
    class RenderSystem extends System
    {
        constructor(context)
        {
            super();
            this.context = context;
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
                
                if(rotate || scale) {
                    this.context.save();
                    this.context.translate(position.x + sprite.width/2, position.y + sprite.height/2);
                    if(rotate) {
                        this.context.rotate(rotate.radians);
                    }
                    if(scale) {
                        this.context.scale(scale.x, scale.y);
                    }
                    this.context.drawImage(sprite.bitmap, -sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height);
                    this.context.restore();
                } else {
                    this.context.drawImage(sprite.bitmap, position.x, position.y);
                }
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
        
        if(false) {
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
            ecs.addComponent(entity3, new Transform(3, 3, 0));
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
                                            "speed": 0.001,
                                        },
                                    },
                                    "Scale": {
                                        "x": {
                                            "target": 1.2,
                                            "repeat": -1,
                                            "direction": 1,
                                            "reverseOnRepeat": true,
                                            "easing": "easeInOutCubic",
                                            "speed": 0.0005,
                                        },
                                        "y": {
                                            "target": 1.2,
                                            "repeat": -1,
                                            "direction": 1,
                                            "reverseOnRepeat": true,
                                            "easing": "easeInOutCubic",
                                            "speed": 0.0005,
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
                                "speed": 0.25,
                                "currentPoint": 0
                            },
                            "Sprite": {
                                "bitmapName": "16-spiked-star"
                            }
                        }
                    }
                ]
            };
            ecs.deserialize(JSON.stringify(data));
        }
        
        ecs.addSystem(new MovementSystem());
        ecs.addSystem(new AnimationSystem());
        ecs.addSystem(new RenderSystem(context));
        
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
        AnimationSystem : AnimationSystem,
        
        // Components
        Position : Position,
        Velocity : Velocity,
        PathFollowing : PathFollowing,
        Sprite : Sprite,
        Rotate : Rotate,
        Scale : Scale,
        Animation : Animation,
    }
})();
