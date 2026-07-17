/*
==========================================
Escape Hidden Exit
Ultra-Complex & Creative Maze Generator
Part 1
==========================================
*/

function drawMaze(scene){

    scene.walls=[];

    scene.spawnX=60;
    scene.spawnY=60;

    scene.exit=scene.add.image(
        840,
        590,
        "exit"
    );

    scene.exit.setScale(0.7);
    scene.exit.setDepth(5);

    function addWall(x,y){

        const wall=scene.add.image(
            x,
            y,
            "wall"
        );

        wall.setScale(0.5);
        wall.setTint(0x00ffcc);

        scene.walls.push(wall);

    }

    // ======================
    // Borders
    // ======================

    for(let x=30;x<=870;x+=30){

        addWall(x,30);

        addWall(x,620);

    }

    for(let y=60;y<=590;y+=30){

        addWall(30,y);

        addWall(870,y);

    }

    // ======================
    // Random Ultra-Complex Maze
    // ======================

    const layout=Phaser.Math.Between(1,11);

    switch(layout){

        case 1:
            layoutOne(addWall);
            break;

        case 2:
            layoutTwo(addWall);
            break;

        case 3:
            layoutThree(addWall);
            break;

        case 4:
            layoutFour(addWall);
            break;

        case 5:
            layoutFive(addWall);
            break;

        case 6:
            layoutSix(addWall);
            break;

        case 7:
            layoutSeven(addWall);
            break;

        case 8:
            layoutEight(addWall);
            break;

        case 9:
            layoutNine(addWall);
            break;

        case 10:
            layoutTen(addWall);
            break;

        case 11:
            layoutEleven(addWall);
            break;

    }

}

// =========================================================================
// CREATIVE & INTENSELY COMPLEX LAYOUTS
// =========================================================================

function layoutOne(addWall) {
    // "The Gauntlet of Teeth" - Alternating lock-and-key patterns across columns
    for (let x = 120; x <= 840; x += 90) {
        let gapY = (x / 90) % 2 === 0 ? 150 : 480;
        let altGap = (x / 90) % 2 === 0 ? 360 : 270;
        for (let y = 60; y <= 590; y += 30) {
            if (y !== gapY && y !== altGap) addWall(x, y);
        }
    }
    for (let y = 180; y <= 540; y += 120) {
        for (let x = 60; x <= 840; x += 30) {
            if (x % 90 !== 0 && x !== 210 && x !== 570) addWall(x, y);
        }
    }
}

function layoutTwo(addWall) {
    // "Double Spiral Labyrinth" - Forces the player deep into a center trap before escaping
    for (let x = 120; x <= 780; x += 30) addWall(x, 120);
    for (let y = 120; y <= 500; y += 30) addWall(780, y);
    for (let x = 210; x <= 780; x += 30) addWall(x, 500);
    for (let y = 210; y <= 500; y += 30) addWall(210, y);
    for (let x = 210; x <= 690; x += 30) addWall(x, 210);
    for (let y = 210; y <= 420; y += 30) addWall(690, y);
    
    // Deceptive inner bypass lanes
    for (let y = 270; y <= 390; y += 30) {
        addWall(330, y);
        addWall(540, y);
    }
    for (let x = 330; x <= 540; x += 30) {
        if (x !== 450) addWall(x, 270);
        if (x !== 390) addWall(x, 390);
    }
}

function layoutThree(addWall) {
    // "Fractal Comb" - Deceptive parallel branches that mostly lead to long dead ends
    for (let y = 150; y <= 510; y += 120) {
        for (let x = 60; x <= 810; x += 30) addWall(x, y);
    }
    for (let x = 150; x <= 810; x += 150) {
        for (let y = 60; y <= 590; y += 30) {
            if (y % 120 !== 0 && y !== 90 && y !== 450) addWall(x, y);
        }
    }
    // Strategic micro-blocks blocking natural paths
    addWall(90, 240);
    addWall(240, 330);
    addWall(540, 90);
    addWall(720, 480);
}

function layoutFour(addWall) {
    // "The Matrix Grid Shifter" - Tiny 2x2 movement chambers requiring tight weaving
    for (let x = 90; x <= 840; x += 60) {
        for (let y = 60; y <= 590; y += 60) {
            addWall(x, y);
            // Dynamic checkboard hole pattern
            if ((x + y) % 120 === 0) {
                if (x + 30 <= 840) addWall(x + 30, y);
            } else {
                if (y + 30 <= 590) addWall(x, y + 30);
            }
        }
    }
}

function layoutFive(addWall) {
    // "Concentric Diamond Ribs" - Angled progression forcing long outer-to-inner journeys
    for (let x = 60; x <= 840; x += 30) {
        let distFromCenter = Math.abs(x - 450);
        if (distFromCenter > 30 && distFromCenter < 350) {
            if (x % 90 === 0) {
                for (let y = 90; y <= 540; y += 30) {
                    if (y !== 150 && y !== 330 && y !== 480) addWall(x, y);
                }
            }
        }
    }
    for (let y = 150; y <= 510; y += 90) {
        for (let x = 90; x <= 810; x += 30) {
            if (x % 180 !== 0) addWall(x, y);
        }
    }
}

function layoutSix(addWall) {
    // "The Twin Citadels" - Left and Right heavy chambers with a chaotic choke point in the middle
    for (let y = 90; y <= 540; y += 30) {
        if (y !== 210 && y !== 450) addWall(270, y);
        if (y !== 150 && y !== 390) addWall(570, y);
    }
    // Internal maze inside left citadel
    for (let x = 60; x <= 270; x += 60) {
        for (let y = 120; y <= 510; y += 120) addWall(x, y);
    }
    // Internal maze inside right citadel
    for (let x = 570; x <= 840; x += 60) {
        for (let y = 90; y <= 480; y += 120) addWall(x, y);
    }
    // Connective tissue center lines
    for (let x = 330; x <= 510; x += 30) {
        addWall(x, 180);
        addWall(x, 420);
    }
}

function layoutSeven(addWall) {
    // "Serpentine Splitter" - Three winding paths, two of which completely trap the player near the end
    for (let y = 120; y <= 540; y += 120) {
        for (let x = 90; x <= 780; x += 30) addWall(x, y);
    }
    for (let y = 180; y <= 420; y += 120) {
        for (let x = 150; x <= 840; x += 30) addWall(x, y);
    }
    // Drop walls that convert horizontal long corridors into sudden dead ends
    addWall(240, 90);
    addWall(480, 210);
    addWall(720, 330);
    addWall(360, 450);
    addWall(600, 570);
}

function layoutEight(addWall) {
    // "Asymmetric Hive" - Organic, non-repeating node rooms that mask the correct direction
    for (let x = 120; x <= 840; x += 120) {
        for (let y = 90; y <= 540; y += 90) {
            addWall(x, y);
            // Scatter accent walls asynchronously
            if ((x + y) % 5 === 0) addWall(x - 30, y);
            if ((x * y) % 3 === 0) addWall(x, y + 30);
            if ((x - y) % 4 === 0) addWall(x + 30, y);
        }
    }
    // Clean escape route blockers
    for (let x = 720; x <= 840; x += 30) addWall(x, 480);
    for (let y = 480; y <= 570; y += 30) addWall(720, y);
}

function layoutNine(addWall) {
    // "The Hourglass Mirror" - Funnels players into a ultra-tight center lane, then opens into a blind choice layout
    for (let x = 60; x <= 360; x += 30) {
        addWall(x, 180);
        addWall(x, 450);
    }
    for (let x = 540; x <= 840; x += 30) {
        addWall(x, 180);
        addWall(x, 450);
    }
    // Center bottleneck complexity
    for (let y = 90; y <= 540; y += 30) {
        if (y !== 300) {
            addWall(420, y);
            addWall(480, y);
        }
    }
    // Blind loops in corners
    for (let y = 60; y <= 180; y += 30) addWall(210, y);
    for (let y = 450; y <= 590; y += 30) addWall(660, y);
}

function layoutTen(addWall) {
    // "The Chaos Engine" - High-density block groupings creating narrow 1-tile winding tracks everywhere
    for (let x = 90; x <= 810; x += 60) {
        for (let y = 90; y <= 540; y += 60) {
            // Skips cells dynamically to keep a valid path open but masked
            if ((x === 90 && y === 90) || (x === 810 && y === 540) || (x === 450 && y === 270)) continue;
            
            addWall(x, y);
            
            // Generate surrounding noise structures
            if (x % 180 === 0 && y !== 210) addWall(x + 30, y);
            if (y % 120 === 0 && x !== 570) addWall(x, y + 30);
        }
    }
}

function layoutEleven(addWall) {
    // "The Classic Winder" - Inspired by the winding orthogonal paths in image_1ee405.png
    // Creates a long, singular main path with deceptive orthogonal dead ends.

    // 1. Major vertical partitions to create winding columns
    for (let y = 120; y <= 540; y += 30) {
        if (y !== 450) addWall(150, y);                   // Left-most barrier
        if (y !== 150 && y !== 300) addWall(330, y);      // Mid-left barrier
        if (y !== 240 && y !== 510) addWall(510, y);      // Mid-right barrier
        if (y !== 120 && y !== 390) addWall(690, y);      // Right-most barrier
    }

    // 2. Major horizontal barriers to cap off the vertical columns
    for (let x = 60; x <= 330; x += 30) {
        if (x !== 240) addWall(x, 270);
    }
    for (let x = 330; x <= 690; x += 30) {
        if (x !== 420 && x !== 600) addWall(x, 150);
        if (x !== 510) addWall(x, 420);
    }
    for (let x = 510; x <= 840; x += 30) {
        if (x !== 780) addWall(x, 270);
    }

    // 3. Deceptive hooks and dead-end micro-walls (The "U-Turns")
    // Left zone traps
    addWall(90, 150); addWall(90, 180); addWall(90, 210);
    
    // Bottom-mid zone traps
    addWall(240, 360); addWall(270, 360);
    
    // Center trap
    addWall(420, 240); addWall(420, 270); addWall(450, 270);
    
    // Bottom-right traps
    addWall(600, 480); addWall(600, 510); addWall(630, 510);
    
    // Top-right exit guards
    addWall(750, 90);  addWall(750, 120); addWall(750, 150);
}