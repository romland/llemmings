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
                // let component = entity.components[componentType];
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
        
        deserialize(data) {
            let entitiesMap = new Map();
            
            for (let entityData of data) {
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

        cleanUp()
        {
            // TODO?
            console.log("Cleaning up ECS: TODO?");
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
    
    // 
    // Components
    // 
    
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
            //        no vars are passed in then. But, init() will be
            //        called by deserializer after all attributes are set.
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

    
    return {
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
