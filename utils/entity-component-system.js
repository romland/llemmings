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
                    let component = GameUtils.Serializable.deserialize(componentData, ComponentType);
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
    
    class Component extends GameUtils.Serializable {
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
    

    // >>> Prompt: instructions/ecs-follow.0001.txt
    // >>> Prompt: instructions/ecs-follow.0002.txt
    class Follow extends Component {
        constructor(attributes) {
            super();
            this.attributes = attributes;
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
            ecs.addComponent(entity3, new Sprite("8-spiked-star"));
            ecs.addComponent(entity3, new Scale(1, 1));
            ecs.addComponent(entity3, new Rotate(0));
        } else {
            const data = {
                "entities": [
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
                                    "Scale": {
                                        "x": {
                                            "target": 0.7,
                                            "repeat": -1,
                                            "direction": 1,
                                            "reverseOnRepeat": true,
                                            "easing": "linear",
                                            "speed": 0.00010,
                                        },
                                        "y": {
                                            "target": 0.7,
                                            "repeat": -1,
                                            "direction": 1,
                                            "reverseOnRepeat": true,
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
                                "attributes": {
                                    "Position": {
                                        "entityId": 2,
                                        "attributes": ["x", "y"],
                                    },
                                    "Scale": {
                                        "entityId": 2,
                                        "attributes": ["x", "y"],
                                    },
                                }
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
        
        ecs.addSystem(new ECSystems.MovementSystem(ecs));
        ecs.addSystem(new ECSystems.AnimationSystem(ecs));
        
        ecs.addSystem(new ECSystems.FollowSystem(ecs));  // Note: Make sure this is the last System before rendering
        ecs.addSystem(new ECSystems.RenderSystem(ecs, context));
        
        // console.log(ecs.serialize());
        
        return ecs;
    }
    
    return {
        // Testing
        init : init,
        
        // ECS
        Main : Main,
        System : System,
        
        // Components
        Components : {
            Position : Position,
            Velocity : Velocity,
            PathFollowing : PathFollowing,
            Sprite : Sprite,
            Rotate : Rotate,
            Scale : Scale,
            Animation : Animation,
            Follow : Follow,
        },
    }
})();
