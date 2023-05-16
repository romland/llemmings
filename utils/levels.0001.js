var LlemmingsLevels = [
    {
        // Level 0 is all defaults with random seed.
        // Note that the defaults may be different in game and editor.
        "level" : 0,
        "name" : "Intro",
        // "seed" : 49153,        // tiny terrain on top
        // "seed" : 49172,        // terrain on top half
        // "seed" : 49181,        // terrain on left third
        // "seed" : 1683811147696,// a lot of terrain on bottom half
        "seed" : 49188,        // empty
        "__DEBUG__" : true,
        "disableGame" : true,  // set to true to disable objectives / game over / etc
        "unlimitedResources" : true,
        "autoPlay" : true,
        "spawnInterval": 2500,
        "resources": {
            "lemmings": 50,
        },
        "shapes" : [
            /* Works in Chrome, not so much in other browsers
            {
                "type": "text",
                "filled": true,
                "color": "rgb(74, 46, 0)",
                // "color": "rgb(136, 136, 136)",
                "lineWidth": 1,
                "fontName": "Henny Penny",
                "fontSize": 140,
                "textBaseline": "hanging",
                "string": "Llemmings",
                "x": 60,
                "y": 90
            },
            */
            {
                "type": "bitmap",
                "x": 60,
                "y": 90,
                "color": "rgb(74, 46, 0)",
                "width": 658,
                "data": "AAAAAAAAAAAAAAAAAADwAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAfwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP4BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+B8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPB/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADg/wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwP8HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAID/HwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/38AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7/AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8/wcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+P8fAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPj/fwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADw//8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4P//BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOD//x8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPw/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADA//9/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4/wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwP///wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8P8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgHwAAAAAAAAAAAID///8HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOD/PwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwP8PAAAAAAAAAACA////HwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA//8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wMAAAAAAAAAgP////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/P//AwAAAAAAAID/////AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4/x8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOD///8PAID/AACA/////w8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4P9/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+P///////w8AgP8//v8/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAID//wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4//////8/AAD+H/D//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v8HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///////wAA+B+A//8DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPj/HwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADw//////8DAOAPAP7/DwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADg/38AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP//////AQCADwDw/z8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8////BwAAAAAAwP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8/wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4P///wMAAAAAAAD//wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4P8HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAID///8HAAAAAAAA/P8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/P//DwAAAAAAAPD/PwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAAAPD//z8AAAAAAADA//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPABAADA//9/AAAAAAAAAP7/AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADABwAAAP7//wEAAAAAAAD4/w8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgB8AAAD4//8HAAAAAAAA4P8/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+AAAA4P//DwAAAAAAAID//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAgP8P+AEAAID//z8AAAAAAAAA/v8DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAOD///MHAAAA/v//AAAAAAAAAPj/DwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPABAAD4AAAAAAAAAAAAAAAAAAAAAAAAAADw////DwAAAPj//wMAAAAAAADg/z8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwBwAA8AMAAAAAAAAAAAAAAAAAAAAAAAAA4P/3/z8AAADg//8PAAAAAAAAgP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4B8AAOAfAAAAAAAAAAAAAAAAAAAAAAAAAOD/Afz/AAAAAP//PwAAAAAAAAD+/wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOA/AADAfwAAAAAAAAAAAAAAAAAA+P8BAADA/wHA/wMAAAD8//8AAAAAAAAA8P8PAAAAAOD/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADg/wAAAP8BAAAAAAAAAAAAAAAAAPj/HwAAgP8DAP4HAAAA8P//AQAAAAAAAMD/PwAAAADw//8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4P8DAAD+BwAAAAAAAAAAAAAAAAD4//8BAAD/BwDwHwAAAMD//wcAAAAAAAAA//8AAAAA+P//HwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPD/DwAA/B8AAAAAAAAAAAAAAAAA8P//DwAA/g8AgH8AAAAA//8fAAAAAAAAAPz/AwAAAPj///8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4/z8AAPj/AADA/wcAAAAAAAAAAOD//38AAPw/AAD+AQAAAPz/fwAAAAAAAADw/x8AAAD4////DwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA////AADw/wMA4P9/AAAAAAAAAADA////AwDwfwAA+AcAAADw//8BAAAAAAAAwP9/AAAA8P8D/38AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8P///wMA4P8PAOD//wcAAAAAAAAAgB/8/x8A4P8BAMAfAAAAwP//BwAAAAAAAAD//wEAAPD/A/D/AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOD///8PAMD/PwDA//9/AAAAAAAAAAA/4P9/AID/BwAAPwAAAAD//x8AAAAAAAAA/P8HAADg/wOA/x8AAAAYAAAAAAAAAAAAAAAYAAAAAAAAAACA////PwDA//8AgP///wMAAAAAAAAAPgD//wMA/w8AAPwAAAAA/P9/AAAAAAAAAPD/HwAAwP8HAPz/AAAAeAAAAAAAAAAAAAAA8AAAAAAAAAAAAPz//38AgP//A4D///8fAAAAAAAAAPgA/P8PAPw/AADwAwAAAPD//wAAAAAAAACA/38AAID/DwDg/wMAAPADAAAAAAAAAAAAAOADAAAAAAAAAAAA/P//AYD//x8A/////wAAAAAAAADwAfD/PwDw/wAAwA8AAADA//8DAAAAAAAAAP7/AQAA/x8AgP8fAADgDwAAAAAAAAAAAADgDwAAAAAAAAAAAMD//weA//9/AP7///8DAAAAAAAA4APg//8AwP8HAAA/AAAAAP//DwAAAAAAAAD4/wcAAP5/AAD8fwAA4D8AAAAAAAAAAAAAwH8AAAAAAAAAAAAA/v8fgP///wH4////HwAAAAAAAIAPgP//A4D/HwAA/AAAAAD8/z8AAAAAAAAA4P8fAAD8/wAA8P8DAMD/AAAAAAAAAAAAAMD/AQAAAAAAAAAAAPD/f4D///8H8P////8AAAAA+H8AHwD+/w8A/n8AAPADAAAA8P//AAAAAAAAAID/fwAA+P8DAMD/DwDA/wMAAAAAAAAAAADA/wcAAAAAAAAAAADA//8B//H/H+D/////AwAAAP7//38A+P8/APj/AwDADwAAAMD//wMAAAAAAAAA/v8BAOD/BwAA/j8A4P8PAAAAAAB+AAAAwP8fAAAAAAB8AAAAAP//B/yA/3/A//v//w8AAAD/////AeD//wDg/w8AAD8AAAAA//8PAAAAAAAAAPj/BwDA/x8AAPj/AfD/fwD+HwCA/x8AAOD/fwD8PwAA/z8AAAD4/x8AAP7/Af8B/v9/AAAA/////weA//8DgP8/AAB8AAAAAPz/PwAAAAAAAADg/x8AgP8/AADg/wf8//8B/v8BgP//AQD8//8B/P8DgP//AQAA4P9/AADw/w/+AfD//wEAAP////8/AP7/DwD+/wEA8AEAAADw//8AAAAAAAAAgP9/AAD+/wAAgP8f////B/z/H4D//w8A/v//B/z/HwD//x8AAID//wAAwP8/+AOA//8HAAD+/x/8/wP4/z8A+P8PAMAHAAAAwP//AwAAAAAAAAD+/wEA/P8BAAD+f/z//x/8//8A//9/APz//z/4//8B////AAAA/v8DAAD///AHAPz/PwAA/v8fgP8f4P//AMD/PwAAHgAAAAD//w8AAAAAAAAA+P8HAPD/BwAA+P/x//9/+P//B/7//wPw////8P//B/7//wMAAPj/DwAA/P/DDwDg//8AAPz/HwD8/4D//wEA//8BADgAAAAA/P8fAAAAAAAAAMD/HwDg/x8AAOD/x/////H//z/8//8fgP///+P//z/8//8fAADg/z8AAOD/jx8AAP//AwD4/z8A4P8H/P8HAPz/DwAAAAAAAPD/fwAAAAAAAAAA/38AgP8/AACA/x8A/v/n////+P//fwAA/v/P////+f///wAAgP//AACA/z9+AAD8/w8A8P9/AAD/P/D/DwDw/38AAAAAAADA//8BAAAAAAAAAPz/AQD//wAAAP5/APD/n/////f///8DAOD/v////+f///8DAAD+/wMAAP7//AAA4P8/AMD//wEA+P+B/x8AgP//AwAAAAAAAP//BwAAAAAAAADw/wcA/P8DAAD4/wGA//9/+P//P///DwCA//9/+P//P///DwAA+P8PAAD4//cDAID//wGA//8DAOD/B/gfAAD+/w8AAAAAAAD8/x8AAAAAAAAAwP8/APj/DwAA8P8HAP7/f8D//x/w/z8AAPz//4D//z/w/38AAOD/PwAAwP/fBwAA/v8HAP//BwAA/z8ADwAA8P9/AAAAAAAA8P9/AAAAAAAAAAD//wDg/z8AAMD/DwDw//8A/v8/gP//AQDw//8B/P9/gP//AQCA//8AAAD//x8AAPD/HwD8/x8AAPz/AQAAAMD//wMAAAAAAMD//wEAAAAAAAAA/P8DgP9/AAAA/z8AwP//AfD/fwD8/wcAgP//A/D//wD8/wcAAP7/AwAA/P8/AADA/38A+P8/AADw/wcAAAAA/v8fAAAAAAAA//8HAAAAAAAAAPD/DwD+/wEAAPz/AAD+/wfA//8A8P8fAAD+/weA//8B4P8fAAD4/wcAAPD//wAAAP//AeD//wAAgP8/AAAAAPj//wAAAAAAAPz/HwAAAAAAAADA/z8A/P8HAAD4/wMA+P8PAP7/A4D/fwAA+P8fAP7/A4D//wAA4P8fAADA//8DAAD8/wfA//8DAAD+/wAAAADA//8HAAAAAADw/38AAAAAAAAAAP//APD/HwAA4P8HAOD/PwD4/wcA/v8BAMD/PwD4/w8A/v8DAID/fwAAAP7/DwAA8P8fAP//BwAA+P8DAAAAAP7/fwAAAAAAwP//AQAAAAAAAAD4/wPA/38AAMD/HwCA//8A4P8fAPj/BwAA//8AwP8/APD/DwAA/v8BAAD4/x8AAID/fwD8/x8AAOD/HwAAAAD4//8DAAAAAAD//wcAAAAcAAAA4P8PAP//AQAA/z8AAP7/AYD/fwDg/x8AAPz/AwD/fwDA/z8AAPj/BwAA4P9/AAAA/v8B+P9/AACA/38AAAAAwP//HwAAAAAA/P8PAAAA+AAAAID/PwD8/wcAAP7/AADw/wcA/v8AgP9/AADw/w8A/P8BAP//AADg/x8AAID//wEAAPj/B+D//wEAAP7/AQAAAAD+//8AAAAAAPD/PwAAAOADAAAA/v8A+P8fAAD8/wEAwP8fAPD/AwD8/wEAwP8fAPD/BwD8/wMAgP9/AAAA/P8HAADg/x+A//8HAAD4/wcAAAAA8P//BwAAAADA//8AAACAHwAAAPj/A+D/fwAA+P8HAAD/fwDA/w8A8P8HAAD+fwDA/w8A8P8PAAD+/wEAAPD/HwAAgP9/AP7/HwAAwP8fAAAAAMD//z8AAAAAAP//AwAAAHwAAADg/w+A//8BAPD/DwAA/P8BAP8/AMD/HwAA+P8BAP8/AMD/PwAA+P8HAADA/z8AAAD+/wH4/z8AAAD/fwAAAAAA/v//AQAAAAD8/w8AAADwAQAAgP8/AP7/BwDg/x8AAPD/AwD8/wAA/38AAOD/BwD8/wAA//8AAOD/HwAAAP//AAAA+P8H4P//AAAA/P8BAAAAAPD//w8AAAAA8P8/AAAAwA8AAAD+/wD4/x8A4P8/AACA/w8A8P8BAPz/AQCA/x8A8P8DAPz/AwCA/38AAAD8/wMAAOD/H4D//wMAAPD/BwAAAACA//9/AAAAAMD//wAAAAA/AAAA+P8D4P//AOD/fwAAAP4/AMD/BwDw/wcAAP5/AMD/DwDw/w8AAP7/AQAA4P8PAACA/z8A/v8PAADA/x8AAAAAAPz//wMAAAAA//8DAAAA+AAAAOD/D4D//////38AAAD4/wAA/x8AwP8fAAD4/wEA/z8AwP8fAAD4/wMAAID/PwAAAP7/APj/PwAAgP9/AAAAAADg//8fAAAAAPz/DwAAAOAHAACA/z8A/v//////AAAA4P8DAPx/AAD/fwAA4P8HAPz/AAD/fwAA4P8PAAAA/v8AAAD4/wPg//8AAAD+/wEAAAAAAP///wAAAADw/z8AAACAHwAAAPz/APj//////wAAAID/DwDw/wEA/v8BAAD/HwDw/wMA/P8BAID/PwAAAPj/AwAA4P8PgP//AwAA+P8HAAAAAAD4//8HAAAAwP//AAAAAH4AAADw/wfg//////8AAAAA/j8A4P8HAPj/BwAA/D8AwP8PAPD/BwAA/v8AAADg/w8AAID/PwD+/w8AAOD/HwAAAAAAwP//PwAAAAD//wMAAAD4AwAAwP8fgP////9/AB4AAPj/AID/HwDg/x8AAPD/AAD/PwDA/x8AAPj/AwAAAP8/AAAA/v8A+P8/AACA/38AAAAAAAD+//8BAAAA/P8PAAAAwA8AAAD/fwD+/8f/DwD8AADg/wMA/n8AgP9/AADA/wMA/P8AAP9/AADg/w8AAAD8/wAAAPj/A+D//wEAAP7/AQAAAAAA+P//BwAAAPD/PwAAAAA/AAAA/P8B+P8fAAAA8AMAgP8PAPj/AQD+/wAAAP8PAPj/AwD+/wEAgP8/AAAA8P8DAADg/w8A//8HAAD4/wMAAAAAAMD//z8AAADA//8AAAAA/AEAAPD/B+D/fwAAAIAfAAD+PwDg/wcA+P8DAAD8PwDg/w8A+P8HAAD+/wAAAMD/DwAAgP8fAPz/HwAA8P8PAAAAAAAA/v//AQAAAP//AQAAAPAHAADA/x+A//8BAAAAfgAA8P8AwP8fAOD/DwAA8P8AgP8/AOD/HwAA+P8DAAAA/x8AAAD+fwDw/38AAMD/PwAAAAAAAPD//w8AAAD8/wcAAADAHwAAAP9/AP7/BwAAAPgDAMD/AwD//wDA/z8AAMD/BwD+/wCA/38AAOD/DwAAAPx/AAAA+P8BgP//AQAA/38AAAAAAACA//8/AAAA8P8fAAAAAH4AAAD8/wHw/z8AAADADwAA/w8A/P8DAP//AAAA/x8A/P8DAP7/AQCA/z8AAADg/wEAAOD/BwD+/w8AAP7/AQAAAAAAAPz//wEAAMD/fwAAAAD4AwAA8P8HwP//AAAAAD8AAPw/APj/DwD8/wMAAPx/APj/HwD8/wcAAP7/AAAAgP8HAACA/x8A8P8/AAD4/wMAAAAAAADg//8PAAAA//8BAAAA4A8AAMD/HwD//wMAAAD8AADw/wDw/38A+P8PAADw/wHw/38A8P8PAAD4/wMAAAD+HwAAAP5/AMD//wAA8P8PAAAAAAAAAP//PwAAAPz/BwAAAIA/AAAA/38A/P8PAAAA8AcAwP8D8P//A+D/PwAAwP8H8P//A+D/PwAA4P8HAAAA+H8AAAD4/wEA/v8HAMD/HwAAAAAAAAD8//8BAADw/x8AAAAA/gEAAPj/AeD/fwAAAMAfAID/H/j//x/A//8AAAD/H/j//x+A//8AAID/HwAAAOD/AwAA4P8HAPj/PwCA/38AAAAAwAcA4P//BwAAwP9/AAAAAPgHAADg/weA//8BAAAAfwAA/n/g////gf//AwAA/H/g////Af//AwAA/n8AAACA/w8AAID/DwDA//8AAP7/AAAAAAAfAAD//z8AAAD//wEAAADgHwAAgP8fAP7/BwAAAPwBAPj/Af///4///w8AAPj/A////4///w8AAPj/AQAAAPw/AAAA/j8AAP7/BwD8/wEAAAAAfgAA+P//AAAA/P8HAAAAgP8AAAD+fwD4/z8AAADwBwDw/w8AAPy///8/AADw/w8AAPg///8/AADg/wcAAADw/wAAAPj/AADw/z8A+P8DAAAAAPwBAOD//wMAAPD/HwAAAAD+AwAA+P8BwP//AAAAwB8A8P8/AAAAfv7//wAA4P9/AAAA/vz//wAAgP8fAAAAwP8DAADw/wMAgP//Afj/BwAAAADwAwAA//8fAADA/38AAAAA+B8AAOD/DwD//wcAAAB/APz//wMAAAD4//8DAPz//wMAAADw//8HAAD+fwAAAAD/DwAAwP8PAAD4/x/4/wcAAAAA4A8AAPj/fwAAAP//AQAAAOB/AACA/z8A+P8fAAAA/AH///8fAAAAwP//DwD///8/AAAAgP//HwAA/P8BAAAA/D8AAAD/PwAAgP////8HAAAAAIA/AADg//8BAAD8/wcAAADA/wEAAP7/AOD//wAAAPAD/v///wcAAAD4/38A/v///w8AAADw/38AAPD/BwAAAPD/AAAA/P8AAAD4////BwAAAAAAfwAAAP//DwAA8P8fAAAAAP8PAAD4/wMA//8DAADgD/j/////AAAAAP7/Afj/////AQAAAP7/AQDA/x8AAADA/wMAAPD/AwAAgP///wcAAAAAAPwBAAD8/z8AAMD/fwAAAAD8PwAA4P8PAPz/HwAAgD/g/////wMAAADg/wfA/////wcAAADA/w8AAP//AAAAAP8PAADA/w8AAID///8BAAAAAAD4AwAA4P//AAAA//8BAAAA+P8AAID/PwDg//8AAAD/AAAAAP4PAAAAAP4/AAAAAPwPAAAAAPw/AAD+/wMAAAD4PwAAAP8fAACA/z8AAAAAAAAA4A8AAID//wMAAP7/BwAAAOD/BwAA/v8AAP//BwAA/AEAAAAAAAAAAADg/wEAAAAAAAAAAADA/wEA/P8PAAAA4P8BAAD+fwAAAP8fAAAAAAAAAMA/AAAA/P8PAAD4/z8AAADA/x8AAPj/AwD8/z8AAPgHAAAAAAAAAAAAAP4PAAAAAAAAAAAAAPwPAPz/fwAAAID/BwAA+P8BAAD/HwAAAAAAAACAfwAAAPD/PwAA4P//AAAAgP//AADA/w8A4P//AQDwDwAAAAAAAAAAAADgfwAAAAAAAAAAAADg/wD+//8HAAAA/h8AAOD/BwAA/h8AAAAAAAAAAP4BAACA//8AAID//wMAAAD//wMAAP9/AAD//x8A4D8AAAAAAAAAAAAAAP8HAAAAAAAAAAAAAP4H////fwAAAPh/AADA/x8AAPg/AAAAAAAAAAD8BwAAAP7/AwAA//8fAAAA//8PAAD8/wEA+P//AeB/AAAAAAAAAAAAAADwPwAAAAAAAAAAAADwP/7///8/AADg/wEAgP9/AADw/wAAAAAAAAAA+B8AAAD4/w8AAP7//wEAAP//PwAA8P8HAMD//z/g/wAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAP/5/////wcAgP8PAAD//wEAwP8BAAAAAAAAAOA/AAAA4P8/AAD4////AeD///8BAOD/PwAA/v////8BAAAAAAAAAAAAAAD4AwAAAAAAAAAAAADwhz8AwP8fAAD+PwD///8HAAD/BwAAAAAAAADA/wAAAID//wAA+P//////////BwCA//8AAOD/////AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAPwAA+P8B/v//PwAA/B8AAAAAAAAAgP8DAAAA/P8DAPj//////////x8AAP7/BwAA/////wcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPD/B/j///8AAPB/AAAAAAAAAAD/DwAAAPD/DwD8//////////9/AAD8/z8AAPD///8HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADA/z/A////AwDA/wMAAAAAAAAA/D8AAADA/z/A/////////////wAA+P//AwAA////DwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwP//AQD//x8AAP4fAAAAAAAAAPj/AAAAAP//4P///////wEAAAAAAPz//38AAOD//wcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP///w8AwP9/AAD4/wAAAAAAAADw/wMAAAD+/4P///8HAAAAAAAAAPD/////HwAA8P8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/////AADw/wMAwP8PAAAAAAAA4P8PAAAA+P8H/v8PAAAAAAAAAADA//////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/P///x8AAP8fAAD+/wAAAAAAAMD/fwAAAOD/H/B/AAAAAAAAAAAAAP//////AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOD///9/AADg/wEA8P9/AAAAAACA//8BAACA/38AAAAAAAAAAAAAAAD8/wfg/w8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wEAAP4PAAD//38AAAAAAP//BwAAAP7/AQAAAAAAAAAAAAAAwAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgfwAA8P///wEAAAD+/x8AAAD8/wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8DAAD8////AAAA/P//AAAA8P8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwHwAA/v///z8AAPgH/wMAAMD/HwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgH8AAP4f8P//BwDwD/AfAACA/38AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AQD+PwD8/38A4A+A/wAAAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAMA/n8AAP//B4AfAPwDAAD8/wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPx/AADw/38APgDgHwAA+P8HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8/wAAAP//BwAAAP8AAPD/DwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+P8BAADw/z8AAAD8DwDg/x8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPD/AwAAgP//AQAA4H8A4P8/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADw/w8AAAD8/w8AAAD+D+D/fwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4P8fAAAA4P9/AAAA8P////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMD/PwAAAAD//wEAAID/////AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA/38AAAAA+P8PAAAA+P///wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//AQAAAMD/PwAAAID///8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8/wMAAAAA//8BAAAA8P//AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+P8PAAAAAPj/BwAAAAD8fwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPD/HwAAAADg/z8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADA/38AAAAAAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP//AAAAAAD8/wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+/wMAAAAA8P8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/P8PAAAAAID/PwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPD/PwAAAAAA/v8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADg/38AAAAAAPj/AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP//AQAAAADg/w8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+/wcAAAAAgP8/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+P8fAAAAAAD+/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPD/fwAAAAAA+P8DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADA//8BAAAAAOD/DwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//BwAAAACA/z8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8/x8AAAAAAP7/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8P9/AAAAAAD4/wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMD//wMAAAAA4P8HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8PAAAAAID/HwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPz/PwAAAAAA/j8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADw//8AAAAAAPz/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP//BwAAAADw/wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+/x8AAAAAwP8HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+P9/AAAAAID/DwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOD//wMAAAAA/h8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8PAAAAAPx/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPz/fwAAAADw/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADg//8DAAAA4P8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP//HwAAAMD/AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8//8AAACA/wcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4P//BwAAAP8HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAID//z8AAAD+DwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/P//AQAA/h8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOD//x8AAP4fAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v//AQD+HwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPD////A/x8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////8fAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPD/////DwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/////wcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMD///8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4P8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
            }
        ],
        "gradients": [
            {
                "type": "linear",
                "x0": 0,
                "y0": 0,
                "x1": 0,
                "y1": 600,
                "stops": [
                    {
                        "offset": 0,
                        "color": "#000000"
                    },
                    {
                        "offset": 1,
                        "color": "#003366"
                    }
                ]
            }
        ],
        "decorations": [
            {
                "type": "organics",
                "location": [
                    "bottom", "top"
                ]
            }
        ],
        "ui" : {
            showScore : false,
            showActions : false,
            showObjective : false,
            showStartGame : true,
            showSettings : true,
            showFCT : false,
        },
        "start": {
            "x": 50,
            "y": -20,
            "radius" : 100,
            "clear": true
        },
        "finish": {
            "x": 690,
            "y": 260,
            "radius" : 50,
            "clear": true
        },
        "solution" : {
            [2] : [
                {
                    x: 115, y: 118, r: 5,
                    action : "Builder"
                },
            ],
            [3] : [
                {
                    x: 193, y: 204, r: 5,
                    action : "Floater"
                },
            ],
            [4] : [
                {
                    x: 238, y: 130, r: 10,
                    action : "Builder"
                },
            ],
            [5] : [
                {
                    x: 329, y: 141, r: 10,
                    action : "Builder"
                },
                {
                    x: 288, y: 192, r: 5,
                    action : "Digger"
                },
            ],
            [8] : [
                {
                    x: 398, y: 109, r: 10,
                    action : "Builder"
                },
            ],
            [9] : [
                {
                    x: 424, y: 139, r: 10,
                    action : "Builder"
                },
            ],
            [11] : [
                {
                    x: 485, y: 108, r: 10,
                    action : "Bomber"
                },
            ],
            [12] : [
                {
                    x: 470, y: 121, r: 10,
                    action : "Builder"
                },
            ],
            [13] : [
                {
                    x: 550, y: 138, r: 5,
                    action : "Builder"
                },
                {
                    x: 518, y: 155, r: 5,
                    action : "Digger"
                },
            ],
/*
            [15] : [
                {
                    x: 640, y: 131, r: 5,
                    action : "Builder"
                },
            ],
*/
        }

    },
    {
        "level": 1,
        "name": "El-el-em-ing",
        "seed": 129,
        "autoPlay": false,
        "gradients": [
            {
                "type": "linear",
                "x0": 0,
                "y0": 0,
                "x1": 0,
                "y1": 600,
                "stops": [
                    {
                        "offset": 0,
                        "color": "#000000"
                    },
                    {
                        "offset": 1,
                        "color": "#000066"
                    }
                ]
            }
        ],
        "decorations": [
            {
                "type": "organics",
                "location": [
                    "top"
                ]
            }
        ],
        "shapes": [
            {
                "type": "rectangle",
                "filled": true,
                "color": "rgb(0, 119, 190)",
                "lineWidth": 1,
                "x1": 0,
                "y1": 530,
                "x2": 800,
                "y2": 600
            },
            {
                "type": "rectangle",
                "filled": true,
                "color": "rgb(0, 0, 0)",
                "lineWidth": 1,
                "x1": 0,
                "y1": 0,
                "x2": 196,
                "y2": 102
            },
            {
                "type": "draw",
                "filled": false,
                "color": "rgb(74, 46, 0)",
                "lineWidth": 5,
                "points": [
                    {
                        "x": 592,
                        "y": 488
                    },
                    {
                        "x": 612,
                        "y": 475
                    },
                    {
                        "x": 638,
                        "y": 473
                    },
                    {
                        "x": 649,
                        "y": 483
                    },
                    {
                        "x": 658,
                        "y": 498
                    },
                    {
                        "x": 665,
                        "y": 503
                    },
                    {
                        "x": 676,
                        "y": 503
                    },
                    {
                        "x": 694,
                        "y": 496
                    },
                    {
                        "x": 706,
                        "y": 496
                    },
                    {
                        "x": 716,
                        "y": 503
                    },
                    {
                        "x": 720,
                        "y": 510
                    },
                    {
                        "x": 720,
                        "y": 514
                    },
                    {
                        "x": 722,
                        "y": 514
                    },
                    {
                        "x": 724,
                        "y": 519
                    },
                    {
                        "x": 727,
                        "y": 521
                    },
                    {
                        "x": 747,
                        "y": 520
                    }
                ]
            },
            {
                "type": "draw",
                "filled": false,
                "color": "rgb(74, 46, 0)",
                "lineWidth": 30,
                "points": [
                  {
                    "x": 121,
                    "y": 218
                  },
                  {
                    "x": 122,
                    "y": 215
                  },
                  {
                    "x": 144,
                    "y": 195
                  },
                  {
                    "x": 161,
                    "y": 188
                  },
                  {
                    "x": 181,
                    "y": 188
                  },
                  {
                    "x": 188,
                    "y": 190
                  },
                  {
                    "x": 190,
                    "y": 193
                  },
                  {
                    "x": 193,
                    "y": 193
                  },
                  {
                    "x": 211,
                    "y": 204
                  },
                  {
                    "x": 235,
                    "y": 206
                  },
                  {
                    "x": 253,
                    "y": 197
                  },
                  {
                    "x": 287,
                    "y": 193
                  },
                  {
                    "x": 296,
                    "y": 183
                  },
                  {
                    "x": 298,
                    "y": 177
                  },
                  {
                    "x": 302,
                    "y": 175
                  },
                  {
                    "x": 309,
                    "y": 175
                  }
                ]
              }
        ],
        "solution" : {
            [1] : [
                {
                    x: 275, y: 177, r: 3,
                    conditions : [
                        "velX > 0",
                    ],
                    action : "Basher"
                },
                {
                    x: 410, y: 243, r: 3,
                    action : "Builder"
                },
                {
                    x: 545, y: 278, r: 3,
                    action : "Digger"
                },
                {
                    x: 545, y: 431, r: 3,
                    conditions : [
                        "velX > 0",
                    ],
                    action : "Basher"
                }

            ],
            [2] : [
                {
                    x: 164, y: 100, r: 3,
                    action : "Blocker",
                },
                {
                    x: 164, y: 100, r: 3,
                    conditions : [
                        "age > 1400",
                    ],
                    action : "Bomber"
                },
            ],
        },
        "objects": [],
        "resources": {
            "lemmings": 15,
            "time": 120 * 1000,
            "Climber": 0,
            "Floater": 0,
            "Bomber": 1,
            "Blocker": 1,
            "Builder": 1,
            "Basher": 2,
            "Miner": 0,
            "Digger": 1
        },
        "spawnInterval": 1000,
        "goal": {
            "survivors": 10
        },
        "start": {
            "x": 50,
            "y": -20,
            "radius" : 100,
            "clear": true
        },
        "finish": {
            "x": 750,
            "y": 480,
            "radius" : 100,
            "clear": true
        }
    }
];
