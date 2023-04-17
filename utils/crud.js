"use strict";
/**
* >>> Prompt: editor/instructions/crud.0001.txt
*/
var CRUD = (function ()
{
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

    function dive(obj, path, opts, lvl = 0)
    {
        for (let key in obj) {
            const lbl = document.createElement('label');
            lbl.textContent = key;
            lbl.style.marginLeft = `${20 * lvl}px`;
            path.append(lbl);
            const id = path.id + '.' + key;
            
            if (key === 'type' && opts) {
                const sel = document.createElement('select');
                opts["type"].forEach((o) => {
                    const opt = document.createElement('option');
                    opt.value = o;
                    opt.textContent = o;
                    sel.appendChild(opt);
                });
                sel.id = id;
                sel.style.marginLeft = lvl * 20 + "px";
                sel.value = obj[key];
                sel.addEventListener('change', (e) => {
                    obj[key] = e.target.value;
                });
                path.appendChild(sel);
            } else if (key.toLowerCase().includes('color')) {
                const colorInp = inpCreator(id, obj[key], 'color', lvl, (e) => {
                    obj[key] = e.target.value;
                });
                path.appendChild(colorInp);
            } else if (typeof obj[key] === 'string') {
                const strInp = inpCreator(id, obj[key], 'text', lvl, (e) => {
                    obj[key] = e.target.value;
                });
                path.appendChild(strInp);
            } else if (typeof obj[key] === 'number') {
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
                path.appendChild(boolCb);
            } else if (Array.isArray(obj[key])) {
                const arrContainer = document.createElement('div');
                arrContainer.id = id;
                path.appendChild(arrContainer);
                const updateArr = (container) => {
                    container.innerHTML = '';
                    obj[key].forEach((item, idx) => {
                        const itemPath = document.createElement('div');
                        itemPath.id = container.id + `[${idx}]`;
                        container.appendChild(itemPath);
                        dive(item, itemPath, opts?.[key], lvl + 1);
                    });
                    
                    const addButton = document.createElement('button');
                    addButton.textContent = '+ ' + key;
                    addButton.style.marginLeft = `${20 * lvl}px`;
                    
                    addButton.addEventListener('click', () => {
                        obj[key].push(JSON.parse(JSON.stringify(obj[key][0])));
                        updateArr(container);
                    });
                    
                    container.appendChild(addButton);
                };
                
                updateArr(arrContainer);
                
                if (obj[key].length > 0) {
                    const removeButton = document.createElement('button');
                    removeButton.textContent = '- ' + key;
                    removeButton.style.marginLeft = `${20 * lvl}px`;

                    removeButton.addEventListener('click', () => {
                        obj[key].pop();
                        updateArr(arrContainer);
                    });
                    path.appendChild(removeButton);
                }
            } else if (typeof obj[key] === 'object') {
                const newObjPath = document.createElement('div');
                newObjPath.id = id;
                path.appendChild(newObjPath);
                dive(obj[key], newObjPath, opts, lvl + 1);
            }
        }
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
