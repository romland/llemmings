var LevelEditor = (function () {
    const c = getById("canvas");
    const ctx = c.getContext("2d");
    ctx.globalAlpha = true;
    const fill = getById("fill");
    const redoStack = [];
    const availableCols = [
      {name:"Void", col: "rgb(0,0,0)"},
      {name:"Water", col: "rgb(0,119,190)"},
      {name:"Rock",  col: "rgb(136,136,136)"},
      {name:"Dirt",  col: "rgb(74,46,0)"}
    ];
    const availableColsBytes = availableCols.map(col => {
      const rgbValues = col.col.slice(4, -1).split(',');
      const formattedRgbValues = rgbValues.map(value => Number(value.trim()));
      formattedRgbValues.push(255);
      return {name: col.name, col: formattedRgbValues};
    });

    let currColor = availableCols[0].col;
    let currToolType = "select";
    let currLineWidth = 1;
    let currSelectedShapeIndex = null;
    let selectionDiv = getById("selectionDiv");
    let lastX, lastY;
    let startX, startY;
    let isDrawing = false;
    // let shapes = [];
    let previewing = false;
    let levelData = { };

    function getById(id)
    {
      return document.getElementById(id);
    }

    function draw()
    {
      // Clear the canvas
      ctx.clearRect(0, 0, c.width, c.height);
      Llemmings.drawShapes(ctx, levelData.shapes);

      // Draw preview of current shape
      if (isDrawing) {
        // Note: If new shapes are added, make sure drawShapes() in llemmings.js is also modified
        const shape = levelData.shapes[levelData.shapes.length - 1];

        switch (currToolType) {
          case "ellipse":
            ctx.beginPath();
            
            const halfWidth = (lastX - startX) / 2;
            const halfHeight = (lastY - startY) / 2;
            const x = startX + halfWidth;
            const y = startY + halfHeight;

            ctx.ellipse(x, y, Math.abs(halfWidth), Math.abs(halfHeight), 0, 0, 2 * Math.PI);

            if (fill.checked) {
              ctx.fill();
            } else {
              ctx.stroke();
            }
            break;

          case "rectangle":
            ctx.beginPath();

            if (fill.checked) {
              ctx.fillRect(startX, startY, lastX - startX, lastY - startY);
            } else {
              ctx.strokeRect(startX, startY, lastX - startX, lastY - startY);
            }
            break;

          case "line":
            ctx.beginPath();
            
            ctx.moveTo(startX, startY);
            ctx.lineTo(lastX, lastY);

            ctx.stroke();
            break;

          case "draw":
            if(!shape.points) {
              shape.points = [{x:startX, y:startY}];
            } else {
              shape.points.push({x:lastX, y:lastY});
            }
            break;

          case "triangle":
            ctx.beginPath();
            
            const x1 = startX;
            const y1 = startY;
            const x2 = lastX;
            const y2 = lastY;
            const x3 = startX - (lastX - startX);
            const y3 = lastY;

            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.closePath();

            if (fill.checked) {
              ctx.fill();
            } else {
              ctx.stroke();
            }
            break;

          case "text" :
            shape.x = lastX;
            shape.y = lastY;
            /*
            ctx.font = shape.fontSize + "px " + shape.fontName;
            ctx.fillStyle = shape.color;
            ctx.textBaseline = shape.textBaseline;
            ctx.fillText(shape.string, lastX, lastY);
            */
            break;

          case "bitmap" :
/*
            // >>> Prompt: editor/instructions/shapes-bitmap.0001.txt
            GameUtils.renderBitmap(shape, ctx, lastX, lastY);
*/
            shape.x = lastX;
            shape.y = lastY;
            break;

          case "fill" :
            shape.x = startX;
            shape.y = startY;
            break;

          case "select" :
            break;

          default :
            throw "Unknown tool " + currToolType;
        }
      }
    }

    function startDrawing(x, y)
    {
      // A new shape resets redo stack
      if(redoStack.length) {
        redoStack.length = 0;
      }

      isDrawing = true;
      startX = x;
      startY = y;

      const filled = fill.checked;
      const newShape = { type: currToolType, filled, color: currColor, lineWidth: currLineWidth };

      if(currToolType === "text") {
        // TODO: Make this configurable
        newShape.fontName = "Henny Penny";
        newShape.filled = true;
        newShape.fontSize = 140;
        newShape.textBaseline = "hanging";
        newShape.color = "rgb(74, 46, 0)";
        newShape.string = "Llemmings";

      } else if(currToolType === "bitmap") {
        // >>> Prompt: editor/instructions/shapes-bitmap.0001.txt
        newShape.fontName = "Henny Penny";
        newShape.filled = true;
        newShape.fontSize = 140;
        newShape.textBaseline = "hanging";
        newShape.color = "rgb(74, 46, 0)";
        newShape.string = "Llemmings";

        const bitmap = generateTextBitmap(newShape);
        newShape.width = bitmap.width;
        newShape.data = bitmap.data;
      }

      levelData.shapes.push(newShape);
    }

    function finishDrawing(x, y)
    {
      isDrawing = false;

      const shape = levelData.shapes[levelData.shapes.length - 1];
      switch (currToolType) {
        case "ellipse":
          const halfWidth = (x - startX) / 2;
          const halfHeight = (y - startY) / 2;
          const cx = startX + halfWidth;
          const cy = startY + halfHeight;

          shape.x1 = cx - Math.abs(halfWidth);
          shape.y1 = cy - Math.abs(halfHeight);
          shape.x2 = cx + Math.abs(halfWidth);
          shape.y2 = cy + Math.abs(halfHeight);
          break;

        case "rectangle":
          shape.x1 = startX;
          shape.y1 = startY;
          shape.x2 = x;
          shape.y2 = y;
          break;

        case "line":
          shape.x1 = startX;
          shape.y1 = startY;
          shape.x2 = x;
          shape.y2 = y;
          break;

        case "draw" :
          shape.points.push({x:lastX, y:lastY});
          // >>> Prompt: editor/instructions/point-reduction.0001.txt
          console.log("Num points before: ", shape.points.length);
          shape.points = EditorUtils.douglasPeucker(shape.points, 1.2);
          console.log("Num points after: ", shape.points.length);
          break;

        case "triangle" :
          shape.x1 = startX;
          shape.y1 = startY;
          shape.x2 = lastX;
          shape.y2 = lastY;
          shape.x3 = startX - (lastX - startX);
          shape.y3 = lastY;
          break;

        case "text" :
          shape.x = lastX;
          shape.y = lastY;
          break;

        case "bitmap" :
          shape.x = lastX;
          shape.y = lastY;
          break;

        case "select" :
          break;

        case "fill" :
          shape.x = startX;
          shape.y = startY;
          shape.targetColor = null;//[0,0,0,255];
          shape.fillColor = availableColsBytes[2].col;

          // console.log("starting fill");
          // GameUtils.floodFill(shape.x, shape.y, shape.targetColor, shape.fillColor, ctx);
          // console.log("fill done");
          break;

        default :
          throw "Unknown tool: " + currToolType;
      }
    }


    function getShapeBounds(shape)
    {
      let minX, minY, maxX, maxY;
      
      switch (shape.type) {
        case 'ellipse':
          minX = Math.min(shape.x1, shape.x2);
          minY = Math.min(shape.y1, shape.y2);
          maxX = Math.max(shape.x1, shape.x2);
          maxY = Math.max(shape.y1, shape.y2);
          break;
        case 'rectangle':
          minX = shape.x1;
          minY = shape.y1;
          maxX = shape.x2;
          maxY = shape.y2;
          break;
        case 'triangle':
          minX = Math.min(shape.x1, shape.x2, shape.x3);
          minY = Math.min(shape.y1, shape.y2, shape.y3);
          maxX = Math.max(shape.x1, shape.x2, shape.x3);
          maxY = Math.max(shape.y1, shape.y2, shape.y3);
          break;
        case 'line':
          minX = Math.min(shape.x1, shape.x2);
          minY = Math.min(shape.y1, shape.y2);
          maxX = Math.max(shape.x1, shape.x2);
          maxY = Math.max(shape.y1, shape.y2);
          break;
        case 'draw':
          let xs = shape.points.map(p => p.x);
          let ys = shape.points.map(p => p.y);
          minX = Math.min(...xs);
          minY = Math.min(...ys);
          maxX = Math.max(...xs);
          maxY = Math.max(...ys);
          break;

        case 'text':
          let {w,h} = getTextDimensions(shape.string, shape.fontName, shape.fontSize);
          minX = shape.x;
          minY = shape.y;
          maxX = shape.x + w;
          maxY = shape.y + h;
          break;

        case 'bitmap':
          minX = shape.x;
          minY = shape.y;
          maxX = shape.x + shape.width;
          maxY = shape.y + Math.ceil(shape.data.length * 8 / shape.width);
          break;

        case 'fill' :
          throw "TODO: cannot grab a filled area, I think?";

        default:
          throw `unknown shape type ${shape.type}`
      }

      return { minX, minY, maxX, maxY };
    }

    // >>> Prompt: editor/instructions/shapes-text-dimension-0001.txt
    function getTextDimensions(text, font, fontSize)
    {
      ctx.font = `${fontSize}px ${font}`;
      const w = ctx.measureText(text).width;
      const h = ctx.measureText(text).actualBoundingBoxAscent +
                     ctx.measureText(text).actualBoundingBoxDescent;
      return { w, h };
    }

    function findSmallestShape(x, y, haystack)
    {
      let smallest = null;
      let minDistance = Infinity;
      let smallestIndex = null;

      let index = 0;
      for (const shape of haystack) {
        let {minX, minY, maxX, maxY} = getShapeBounds(shape);
        
        if (minX <= x && x <= maxX && minY <= y && y <= maxY) {
          let cx = (minX + maxX) / 2;
          let cy = (minY + maxY) / 2;
          let distance = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          
          if (distance < minDistance) {
            smallest = shape;
            smallestIndex = index;
            minDistance = distance;
          }
        }
        index++;
      }
      
      return smallestIndex;//smallest;
    }

    function selectShape(x, y)
    {
      currSelectedShapeIndex = findSmallestShape(x, y, levelData.shapes);

      if(currSelectedShapeIndex === null) {
        deselectSelected();
        return;
      }

      const shape = levelData.shapes[currSelectedShapeIndex];
      const bounds = getShapeBounds(shape);
      bounds.minX += c.offsetLeft;
      bounds.minY += c.offsetTop;
      bounds.maxX += c.offsetLeft;
      bounds.maxY += c.offsetTop;
      selectionDiv.style.left = `${bounds.minX}px`;
      selectionDiv.style.top = `${bounds.minY}px`;
      selectionDiv.style.width = `${bounds.maxX-bounds.minX}px`;
      selectionDiv.style.height = `${bounds.maxY-bounds.minY}px`;
      selectionDiv.style.display = "block";
    }

    function deselectSelected()
    {
      currSelectedShapeIndex = null;
      selectionDiv.style.display = "none";
    }

    function translateShape(shape, x, y)
    {
        switch (shape.type) {
          case "ellipse":
            shape.x1 += x;
            shape.y1 += y;
            shape.x2 += x;
            shape.y2 += y;
            break;
          case "rectangle":
            shape.x1 += x;
            shape.y1 += y;
            shape.x2 += x;
            shape.y2 += y;
            break;
          case "triangle":
            shape.x1 += x;
            shape.y1 += y;
            shape.x2 += x;
            shape.y2 += y;
            shape.x3 += x;
            shape.y3 += y;
            break;
          case "line":
            shape.x1 += x;
            shape.y1 += y;
            shape.x2 += x;
            shape.y2 += y;
            break;
          case "draw":
            shape.points.forEach(point => {
              point.x += x;
              point.y += y;
            });
            break;
          case "text":
            shape.x += x;
            shape.y += y;
            break;
          case "bitmap":
            shape.x += x;
            shape.y += y;
            break;
          default:
            console.log("Unknown shape type.");
            break;
        }
    }

    // >>> Prompt: editor/instructions/shapes-bitmap.0001.txt
    function generateTextBitmap(shape) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const font = shape.fontSize + 'px ' + shape.fontName;
      const color = shape.color;
      const baseline = shape.textBaseline;
      
      // Set font and fill style
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textBaseline = baseline;
      
      // Draw text to canvas
      const metrics = ctx.measureText(shape.string);
      canvas.width = Math.ceil(metrics.width);
      canvas.height = Math.ceil(shape.fontSize * 1.5);
      ctx.font = font; // Need to set again after resizing canvas
      ctx.fillStyle = color; // Need to set again after resizing canvas
      ctx.textBaseline = baseline; // Need to set again after resizing canvas
      ctx.fillText(shape.string, 0, 0);
      
      // Create the bitmap data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const bits = [];
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        const bit = alpha > 0 ? 1 : 0;
        bits.push(bit);
      }
      
      // Pack bits into bytes
      const width = canvas.width;
      const bytesPerRow = Math.ceil(width / 8);
      const byteData = new Uint8Array(bytesPerRow * canvas.height);
      let byteIndex = 0;
      let bitIndex = 0;
      let currentByte = 0;
      for (let i = 0; i < bits.length; i++) {
        if (bitIndex === 8) {
          byteData[byteIndex] = currentByte;
          byteIndex += 1;
          currentByte = 0;
          bitIndex = 0;
        }
        currentByte |= bits[i] << bitIndex;
        bitIndex += 1;
      }
      if (bitIndex > 0) {
        byteData[byteIndex] = currentByte;
      }
      
      // Encode to base64
      const base64 = btoa(String.fromCharCode.apply(null, byteData));
      return {
        width,
        data: base64,
      };
    }

    function serialize()
    {
      const data = JSON.stringify({ shapes : levelData.shapes, currColor : currColor });
      localStorage.setItem("data", data);
    }

    function deserialize()
    {
      if(true) {
        console.warn("Not getting shapes from LocalStorage -- using levelData instead")
        return;
      }

      const data = localStorage.getItem("data");
      if (!data) {
        return;
      }

      const { shapes: loadedShapes, currentColor: loadedColor } = JSON.parse(data);
      levelData.shapes = loadedShapes;
      if(!levelData.shapes) {
        levelData.shapes = [];
      }
      console.log("Loaded shapes:", levelData.shapes);
      draw();
    }

    function undo()
    {
      if(!levelData.shapes.length) return;
      redoStack.push(levelData.shapes.pop());
      draw();
      renderLevel();
    }

    function redo()
    {
      if(!redoStack.length) return;
      levelData.shapes.push(redoStack.pop());
      draw();
      renderLevel();
    }

    function preview()
    {
      if(previewing) {
        // TODO: Only set selectionDiv to visible if it was actually visible before (for now do nothing)
        // selectionDiv.style.display = "block";
        canvas.style.display = "block";
        Llemmings.reset();
        Llemmings.init(document.querySelector('#seededCanvas'), levelData, false);
      } else {
        selectionDiv.style.display = "none";
        canvas.style.display = "none";
        Llemmings.init(document.querySelector('#seededCanvas'), levelData, false);
        Llemmings.start();
      }

      previewing = !previewing;
    }

    // Set up events.
    function initEditor()
    {
      c.addEventListener('contextmenu', e => e.preventDefault());

      // HUMAN: TODO:
      //       If a shape is already selected and you want to select
      //       another, this will fail as we are clicking the select
      //       div instead. This can be solved in a number of ways,
      //       I'm not sure which I prefer. Yet.
      c.addEventListener("mousedown", function(e) {
        startX = e.offsetX;
        startY = e.offsetY;

        if(currToolType === "select") {
          selectShape(startX, startY);
        } else {
          startDrawing(startX, startY);
        }
      });

      c.addEventListener("mousemove", function(e) {
        if (!isDrawing) {
          return;
        }

        lastX = e.offsetX;
        lastY = e.offsetY;

        draw();
      });

      c.addEventListener("mouseup", function(e) {
        const x = e.offsetX;
        const y = e.offsetY;

        finishDrawing(x, y);

        draw();
      });

      for(let i = 0; i < availableCols.length; i++) {
        let acol = availableCols[i];
        let elt = document.createElement("button");

        elt.setAttribute("class", "colorButton");
        elt.setAttribute("col", acol.col);
        elt.setAttribute("colName", acol.name);
        elt.style.backgroundColor = acol.col;

        elt.addEventListener("click", (evt) => {
          currColor = evt.target.getAttribute("col");
        });

        getById("colDiv").appendChild(elt);
      }

      getById("line-width").addEventListener("click", function(evt) {
        currLineWidth = parseInt(evt.target.selectedOptions[0].text, 10);
      });

      getById("select").addEventListener("click", function() {
        currToolType = "select";
      });

      getById("shape-ellipse").addEventListener("click", function() {
        deselectSelected();
        currToolType = "ellipse";
      });

      getById("shape-rectangle").addEventListener("click", function() {
        deselectSelected();
        currToolType = "rectangle";
      });

      getById("shape-line").addEventListener("click", function() {
        deselectSelected();
        currToolType = "line";
      });

      getById("shape-draw").addEventListener("click", function() {
        deselectSelected();
        currToolType = "draw";
      });

      getById("shape-triangle").addEventListener("click", function() {
        deselectSelected();
        currToolType = "triangle";
      });

      getById("shape-text").addEventListener("click", function() {
        deselectSelected();
        currToolType = "text";
      });

      getById("shape-bitmap").addEventListener("click", function() {
        deselectSelected();
        currToolType = "bitmap";
      });

      getById("shape-fill").addEventListener("click", function() {
        deselectSelected();
        currToolType = "fill";
      });

      getById("undo").addEventListener("click", function() {
        deselectSelected();
        undo();
      });

      getById("redo").addEventListener("click", function() {
        deselectSelected();
        redo();
      });

      getById("open-level").addEventListener("click", function() {
        openLevel();
      });

      getById("new-level").addEventListener("click", function() {
        createNewLevel();
      });

      window.addEventListener("load", function() {
        // Load saved data
        deserialize();
      });

      window.addEventListener("beforeunload", function() {
        // Save data before user leaves the page
        serialize();
      });

      // I really want ctrl+z/y
      window.addEventListener('keydown', (evt) => {
        if(evt.ctrlKey) {
          switch(evt.key) {
            case "z": undo(); break;
            case "y": redo(); break;
          }
        } else {
          switch(evt.key) {
            case "Delete" : 
              console.log("delete");
              if(currSelectedShapeIndex) {
                // HUMAN: TODO: This needs to be handled in undo logic:
                // - need to keep index available in shapes array
                // - un redo array, store whether it was a delete action and which index the shape was in
                levelData.shapes.splice(currSelectedShapeIndex, 1);
                draw();
                deselectSelected();
              }
              break;
          }
        }
      });

      initSelectionDiv();
    }

    function initSelectionDiv()
    {
      let isDragging = false;
      let mouseX, mouseY;
      let offsetX = 0, offsetY = 0;
      let orgX, orgY;

      const canvas = document.querySelector('#canvas');
      const selectionDiv = document.querySelector('#selectionDiv');

      selectionDiv.addEventListener('mousedown', e => {
        isDragging = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
        const bounds = canvas.getBoundingClientRect();
        offsetX = bounds.left + window.scrollX;
        offsetY = bounds.top + window.scrollY;

        orgX = mouseX;
        orgY = mouseY;
      });

      selectionDiv.addEventListener('mousemove', e => {
        if (isDragging) {
          const dx = e.clientX - mouseX;
          const dy = e.clientY - mouseY;
          selectionDiv.style.left = Math.min(Math.max(selectionDiv.offsetLeft + dx, offsetX), offsetX + canvas.offsetWidth - selectionDiv.offsetWidth) + 'px';
          selectionDiv.style.top = Math.min(Math.max(selectionDiv.offsetTop + dy, offsetY), offsetY + canvas.offsetHeight - selectionDiv.offsetHeight) + 'px';
          mouseX = e.clientX;
          mouseY = e.clientY;

          // Translate selected shape
          if(currSelectedShapeIndex !== null) {
            const shape = levelData.shapes[currSelectedShapeIndex];
            translateShape(shape, mouseX - orgX, mouseY - orgY);
            draw();
          }

          orgX = mouseX;
          orgY = mouseY;
        }
      });

      selectionDiv.addEventListener('mouseup', () => {
        if(!isDragging) {
          return;
        }

        isDragging = false;
        renderLevel();
      });
    }
    
    // Note: This is expensive.
    function renderLevel()
    {
      Llemmings.reset();
      Llemmings.init(document.querySelector('#seededCanvas'), levelData, false);
    }

    function initLevel(lvl = 1)
    {
      // >>> Prompt: editor/instructions/gradient-serialize.0001.txt
      const defaultLevelData = Llemmings.getDefaultLevelData(
        {
            // You can pass in any variables that should be overridden in default data
        }
      );

      // Set which level to load (or null to create new)!
      if(lvl === null) {
        levelData = {};
        levelData.level = LlemmingsLevels.length;
        levelData.seed = Date.now();
        levelData = EditorUtils.deepMerge(levelData, defaultLevelData);
      } else {
        levelData = EditorUtils.deepMerge({}, defaultLevelData, LlemmingsLevels[lvl]);
      }

      const levelDataCrudOpts = {
        gradients: {
          type: ['linear', 'radial']
        },
        decorations: {
          type: ['organics']
        }
      };

      CRUD.create(levelData, levelDataCrudOpts, document.getElementById("levelData"), (evt, data) => {
        console.log("Saved:", data);
        
        // >>> Prompt: editor/instructions/clipboard-copy.0001.txt
        navigator.clipboard.writeText(JSON.stringify(data, undefined, "\t"))
          .then(() => {
            console.log('Stringified data copied to clipboard successfully!');
          })
          .catch(err => {
            console.log('Error in copying stringified data to clipboard: ', err);
          });

        alert("Level saved to clipboard. Paste it into the levels array.");
        levelData = data;
        renderLevel();
      });

      // Render the seeded elements/background
      renderLevel();
    }

    function reset()
    {
        currColor = availableCols[0].col;
        currToolType = "select";
        currLineWidth = 1;
        currSelectedShapeIndex = null;
        selectionDiv = getById("selectionDiv");
        lastX, lastY;
        startX, startY;
        isDrawing = false;
        previewing = false;
        levelData = { };
        document.getElementById("levelData").innerHTML = "";
    }

    async function createNewLevel()
    {
        await LlemmingsArt.generateBitmaps();
        
        reset();
        Llemmings.reset();
        initLevel(null);
        draw();
    }

    async function openLevel(lvl)
    {
        if(lvl === undefined || lvl === null) {
          lvl = prompt("Level to open (0-" + (LlemmingsLevels.length - 1) + ":");
        }

        await LlemmingsArt.generateBitmaps();

        reset();
        Llemmings.reset();
        initLevel(parseInt(lvl, 10));
        draw();
    }

    return {
      preview : preview,
      initEditor : initEditor,
      // initLevel: initLevel,
      openLevel : openLevel,
    }
})();
