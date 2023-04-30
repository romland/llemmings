var LlemmingsLevels = [
    {
        // Level 0 is all defaults with random seed.
        // Note that the defaults may be different in game and editor.
    },
    {
        "level": 1,
        "name": "El-el-em-ing",
        "seed": 129,
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
            }
        ],
        "solution" : {
            [1] : [
                {
                    x: 185, y: 204, r: 3,
                    conditions : [
                        "velX > 0",
                    ],
                    action : "Builder"
                },
                {
                    x: 287, y: 185, r: 3,
                    conditions : [
                        "velX > 0",
                    ],
                    action : "Miner"
                },
                {
                    x: 399, y: 311, r: 3,
                    action : "Bomber"
                }
            ],
            [2] : [
                {
                    x: 383, y: 333, r: 3,
                    action : "Builder",
                },
                {
                    x: 449, y: 312, r: 3,
                    action : "Basher",
                },
                {
                    x: 462, y: 306, r: 3,
                    action : "Basher",
                },
            ],
            [3] : [
                {
                    x: 164, y: 100, r: 3,
                    action : "Blocker",
                },
                {
                    x: 164, y: 100, r: 3,
                    conditions : [
                        "age > 6000",
                    ],
                    action : "Bomber"
                },
            ],
            [13] : [
                {
                    x: 510, y: 333, r: 3,
                    action : "Miner",
                },
            ]
        },
        "objects": [],
        "resources": {
            "lemmings": 15,
            "Climber": 3,
            "Floater": 0,
            "Bomber": 2,
            "Blocker": 1,
            "Builder": 4,
            "Basher": 1,
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
