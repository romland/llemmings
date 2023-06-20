"use strict";
/**
* >>> Prompt: editor/instructions/crud.0001.txt
*/
var CRUD = (function ()
{
    const singularis = {
        "gradients" : "gradient",
        "stops" : "stop",
        "shapes" : "shape",
        "decorations": "decoration",
        "attributes" : "attribute",
        "entities" : "entity",
    };
    const indent = 10;

    function inpCreator(id, val, type, lvl, hdlr)
    {
        const inp = document.createElement('input');
        inp.id = id;
        inp.value = val;
        inp.style.marginLeft = lvl * 20 + "px";
        if(type) {
            inp.type = type;
        }
        if(hdlr) {
            inp.addEventListener('input', (e) => hdlr(e));
        }
        return inp;
    }

    // >>> Prompt: editor/instructions/crud.0001.txt
    // >>> Prompt: editor/instructions/crud-expand-collapse.0001.txt    
    function dive(obj, path, opts, lvl = 0)
    {
        // HUMAN: This is such stupid code. A string is also for-in-able, which means
        //        a string will be seen as an array. Thus, making an input for every
        //        character in the string. Off the hip, right now, I'm not entirely
        //        sure how to best fix this without a rewrite.

        // HUMAN HACK: See note above (will need to be rethought).
        if(typeof obj === "string") {
            obj = [ obj ]
        }

        for (let key in obj) {
            const lbl = document.createElement('label');
            lbl.textContent = key;
            lbl.style.marginLeft = `${indent * lvl}px`;
            const id = path.id + '.' + key;
            
            if (key === 'type' && opts) {
                path.append(lbl);
                const sel = document.createElement('select');
                opts["type"].forEach((o) => {
                    const opt = document.createElement('option');
                    opt.value = o;
                    opt.textContent = o;
                    sel.appendChild(opt);
                });
                sel.id = id;
                sel.style.marginLeft = lvl * indent + "px";
                sel.value = obj[key];
                sel.addEventListener('change', (e) => {
                    obj[key] = e.target.value;
                });
                path.appendChild(sel);
            } else if (key.toLowerCase().includes('color')) {
                path.append(lbl);
                const colorInp = inpCreator(id, obj[key], 'color', lvl, (e) => {
                    obj[key] = e.target.value;
                });
                path.appendChild(colorInp);
            } else if (typeof obj[key] === 'string') {
                path.append(lbl);
                const strInp = inpCreator(id, obj[key], 'text', lvl, (e) => {
                    obj[key] = e.target.value;
                });
                path.appendChild(strInp);
            } else if (typeof obj[key] === 'number') {
                path.append(lbl);
                const numInp = inpCreator(id, obj[key], 'number', lvl, (e) => {
                    obj[key] = parseFloat(e.target.value);
                });
                path.appendChild(numInp);
            } else if (typeof obj[key] === 'boolean') {
                const boolCb = document.createElement('input');
                boolCb.type = 'checkbox';
                boolCb.id = id;
                boolCb.checked = obj[key];
                boolCb.addEventListener('change', (e) => {
                    obj[key] = e.target.checked;
                });

                path.append(document.createElement('br'));
                path.appendChild(boolCb);
                lbl.style.display = "inline-block";
                path.append(lbl);
            } else if (Array.isArray(obj[key])) {
                const arrContainer = createCollapsibleContainer(key, obj[key], opts, lvl);
                path.appendChild(arrContainer);
          
                addAddButton(key, lvl, obj, arrContainer, opts);
                addRemoveButton(obj, key, lvl, arrContainer);

              } else if (typeof obj[key] === "object") {
                const newObjContainer = createCollapsibleContainer(key, obj[key], opts, lvl, true);
                path.appendChild(newObjContainer);
            }
        }
    }

    function addAddButton(key, lvl, obj, arrContainer, opts) {
        const addButton = document.createElement("button");
        addButton.textContent = "+ " + (singularis[key] || key);
        // addButton.style.marginLeft = `${indent * lvl}px`;
        addButton.addEventListener("click", () => {
            obj[key].push(JSON.parse(JSON.stringify(obj[key][0])));
            const itemPath = document.createElement("div");
            const idx = obj[key].length - 1;
            itemPath.id = arrContainer.id + `[${idx}]`;
            const newItemContainer = createCollapsibleContainer(
                idx,
                obj[key][idx],
                opts?.[key],
                lvl + 1,
                false
            );
            itemPath.appendChild(newItemContainer);
            contentContainer.appendChild(itemPath);
        });
        arrContainer.prepend(addButton);
    }

    function addRemoveButton(obj, key, lvl, arrContainer) {
        const removeButton = document.createElement("button");
        if (obj[key].length === 0) {
            removeButton.disabled = true;
        }
        removeButton.textContent = "- " + (singularis[key] || key);
        // removeButton.style.marginLeft = `${indent * lvl}px`;
        removeButton.addEventListener("click", () => {
            obj[key].pop();
            contentContainer.removeChild(
                contentContainer.lastElementChild || null
            );
        });
        arrContainer.prepend(removeButton);
    }

    // >>> Prompt: editor/instructions/crud-expand-collapse.0001.txt    
    function createToggleButton(expanded) {
        const button = document.createElement("button");
        button.className = "toggle-button";
        button.textContent = expanded ? "▼" : "▶";
        return button;
    }
    
    // >>> Prompt: editor/instructions/crud-expand-collapse.0001.txt    
    // Define a function to create a collapsible container for an item
    function createCollapsibleContainer(key, item, opts, lvl, addLabel = true) {
        const container = document.createElement("div");
        
        // Create the expand/collapse button
        const toggleButton = createToggleButton(false);

        toggleButton.addEventListener("click", () => {
            const expanded = toggleButton.textContent === "▼";
            toggleButton.textContent = expanded ? "▶" : "▼";
            contentContainer.style.display = expanded ? "none" : "block";
        });
        
        // Create the label
        if(addLabel) {
            const label = document.createElement("label");
            label.textContent = key;
            label.style.marginLeft = `${indent * lvl}px`;
            if(lvl === 0) {
                label.setAttribute("class", "crud-label");
            }
            toggleButton.style.float = "right";
            label.appendChild(toggleButton);
            container.appendChild(label);
        } else {
            container.appendChild(toggleButton);
        }
        
        // Create the content container
        const contentContainer = document.createElement("div");
        contentContainer.style.marginLeft = `${indent * lvl}px`;
        contentContainer.style.display = "none";
        container.appendChild(contentContainer);
        
        // Recursively dive into the item
        dive(item, contentContainer, opts?.[key], lvl + 1);
        
        return container;
    }
      
    
    function create(data, options, elt, saveCB)
    {
        const root = document.createElement('div');
        dive(data, root, options);
        elt.appendChild(root);
        
        const btnSave = document.createElement('button');
        btnSave.textContent = 'Save';
        btnSave.addEventListener('click', (e) => saveCB(e, data));
        elt.appendChild(btnSave);
    }
    
    return {
        create : create
    }
})();
