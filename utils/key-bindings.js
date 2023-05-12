// >>> Prompt: instructions/keybindings-editor.0001.txt
var LlemmingsKeyBindings = (function () {
    const defaultKeybinds = {
        "exit-game": "x",
        "restart-level": "escape",
        "select-next-creature": "q",
        "select-previous-creature": "e",
        "deselect-creature": "space",
        "toggle-pause": "p",
        "apply-climber": "1",
        "apply-floater": "2",
        'apply-bomber': "3",
        'apply-blocker': "4",
        'apply-builder': "shift+1",
        'apply-basher': "shift+2",
        'apply-miner': "shift+3",
        'apply-digger': "shift+4"
    };
    
    let keybindingEditor, bindings, toCallOnKeyBindPress;
    
    // >>> Prompt: instructions/keybindings-editor.0002.txt
    function convertToTitleCase(str) {
        let words = str.split('-');
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substr(1);
        }
        return words.join(' ');
    }
    
    function generateHTML() {
        let html = `<table>
            <thead>
                <tr>
                    <th>Action</th>
                    <th>Key bind</th>
                </tr>
                <th></th>
            </thead>
        `;
        for (const [actionId, keybind] of Object.entries(bindings)) {
            html += `
            <tr>
                <td>
                    ${convertToTitleCase(actionId)}
                </td>
                <td>
                    <input 
                        type="text" 
                        id="${actionId}-input" 
                        value="${keybind.replace(" ", "space")}" 
                        onkeydown="LlemmingsKeyBindings.setKeybind('${actionId}', event)"
                    />
                </td>
                <td>
                    <button onclick="LlemmingsKeyBindings.resetKeybind('${actionId}')">Reset</button>
                </td>
            </tr>
            `;
        }
        html += `
        <tr>
            <td></td>
            <td>
                <button onclick="LlemmingsKeyBindings.resetAll()">Set all to default</button>
                <button onclick="LlemmingsKeyBindings.saveBindings()">Save</button>
            </td>
            <td></td>
        </tr>
        </table>
        `;
        keybindingEditor.innerHTML = html;
    }
    
    function resetKeybind(actionId) {
        bindings[actionId] = defaultKeybinds[actionId];
        generateHTML();
    }
    
    function resetAll() {
        bindings = defaultKeybinds;
        generateHTML();
    }
    
    function saveBindings() {
        localStorage.setItem("keybindings", JSON.stringify(bindings));
        LlemmingsDialog.closeDialog();
    }

    function getActionIdForKey(key)
    {
        const ids = Object.keys(bindings);
        for(let i = 0; i < ids.length; i++) {
            if(bindings[ids[i]] === key) {
                return ids[i];
            }
        }

        return null;
    }
    
    function setKeybind(actionId, event) {
        let keybind = "";
        if (event.key !== "Shift" && event.key !== "Control" && event.key !== "Alt" && event.key !== "Meta") {
            if (event.shiftKey) keybind += "shift+";
            if (event.ctrlKey) keybind += "ctrl+";
            if (event.altKey) keybind += "alt+";
            if (event.metaKey) keybind += "cmd+";
            
            if(event.code.includes("Digit")) {
                keybind += event.code.toLowerCase().replace("digit", "");
            } else {
                keybind += event.key.toLowerCase();
            }
        }
        
        if (keybind !== "") {
            // Human: I had to completely rewrite the clearing of existing key-binds bit.
            const existingKeybind = Object.values(bindings).find((k) => k === keybind);
            if (existingKeybind) {
                console.log("Clearing duplicate keybind for", existingKeybind, ":", getActionIdForKey(existingKeybind) );
                bindings[getActionIdForKey(existingKeybind)] = "";
            }
            bindings[actionId] = keybind;
            generateHTML();
        }
        
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
    
    // >>> Prompt: instructions/keybindings-editor.0003.txt
    // This is an action-dispatcher for use when game is running, it has nothing
    // to do with the editor (which the rest of this file is).
    function handleKeyBinds(event) {
        let action = "";
        
        for (let key in bindings) {
            let keys = bindings[key].split("+");
            let bindModifiers = new Set(keys.filter(k => k !== keys[keys.length-1]));
            let keyName = keys[keys.length-1];

            // Human: I had to add the inverse check in the four statements below (key is pressed, but bind does not require it)
            if ((bindModifiers.has("ctrl") && !event.ctrlKey) || (!bindModifiers.has("ctrl") && event.ctrlKey))
                continue;

            if ((bindModifiers.has("shift") && !event.shiftKey) || (!bindModifiers.has("shift") && event.shiftKey))
                continue;

            if ((bindModifiers.has("alt") && !event.altKey) || (!bindModifiers.has("alt") && event.altKey))
                continue;

            if ((bindModifiers.has("cmd") && !event.metaKey) || (!bindModifiers.has("cmd") && event.metaKey))
                continue;

            // Human: I added the Digit check here (just like we do in the editor).
            let actualKey = event.code.includes("Digit") ? event.code.replace("Digit", "") : event.key.toLowerCase();

            if(actualKey === " ") {
                actualKey = "space";
            }

            if(keyName !== actualKey) {
                continue;
            }

            action = key;
            break;
        }
        
        if (action === "") return;
        
        // let functionName = action.split("-").map(w => w.slice(0,1).toUpperCase() + w.slice(1)).join("");
        
        toCallOnKeyBindPress(action);
        // window[functionName]();

        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    // This is for changing key-binds
    function initKeyBindEditor()
    {
        keybindingEditor = document.getElementById("keybinding-editor");
        bindings = JSON.parse(localStorage.getItem("keybindings")) || { ...defaultKeybinds };

        // Human: To facilitate for adding new binds in the future, merging default binds with saved binds instead of just ||.
        bindings = { ...defaultKeybinds, ...bindings };

        LlemmingsDialog.openDialog("Key Binds", keybindingEditor, () => {
            keybindingEditor.innerHTML = "";
            // Put the editor element back in body so we can use it again
            document.body.append(keybindingEditor);
        });

        generateHTML();
    }

    // This is for key-bind events
    function startKeyBinds(_toCallOnKeyBindPress)
    {
        bindings = JSON.parse(localStorage.getItem("keybindings")) || { ...defaultKeybinds };

        // Human: To facilitate for adding new binds in the future, merging default binds with saved binds instead of just ||.
        bindings = { ...defaultKeybinds, ...bindings };

        toCallOnKeyBindPress = _toCallOnKeyBindPress;
        document.addEventListener("keydown", handleKeyBinds);
    }

    function endKeyBinds()
    {
        document.removeEventListener("keydown", handleKeyBinds);
    }

    return {
        // Actual API:
        initKeyBindEditor : initKeyBindEditor,

        startKeyBinds : startKeyBinds,
        endKeyBinds : endKeyBinds,

        // Public only because it's used from the HTML
        setKeybind : setKeybind,
        resetKeybind : resetKeybind,
        resetAll : resetAll,
        saveBindings : saveBindings,
    }
})();
