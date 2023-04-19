var LlemmingsLevels = [
    {
        // Level 0 is all defaults with random seed.
        // Note that the defaults may be different in game and editor.
    },
    {
        level : 1,
        name : "El-el-em-ing",
        seed : 129,
        gradients : [
            {
                type: 'linear',
                x0: 0, y0: 0, x1: 0, y1: 600,
                stops: [
                    { offset: 0, color: '#000000' },
                    { offset: 1, color: '#000066' }
                ]
            }
        ],
        decorations : [ { type: "organics", location: ["top"], } ],
        shapes : [
            // Water
            {
                "type": "rectangle",
                "filled": true,
                "color": `rgb(0, 119, 190)`,
                "lineWidth": 1,
                "x1": 0,
                "y1": 530,
                "x2": 800,
                "y2": 600 
            },
            // Bigger area cleared at spawn
            {
                "type": "rectangle",
                "filled": true,
                "color": "rgb(0, 0, 0)",
                "lineWidth": 1,
                "x1": 0,
                "y1": 0,
                "x2": 196,
                "y2": 102
            }
        ],
        spawnInterval : 1000,
        resources : {
            lemmings : 15,

            Climber : 3,
            Floater : 0,
            Bomber : 1,
            Blocker : 1,
            Builder : 4,
            Basher : 1,
            Miner : 0,
            Digger : 1,
        },
        goal : { survivors : 5 },
        objects : [],
        start : { x : 50, y : -20, clear: true },
        finish : { x : 750, y : 480, clear: true },
    }
];
