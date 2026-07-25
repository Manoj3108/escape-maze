/*
==========================================
Escape Hidden Exit
Ultra-Complex & Creative Maze Generator
Part 1 (Fixed & Expanded Open Paths)
==========================================
*/

function drawMaze(scene){

    scene.walls=[];

    scene.spawnX=60;
    scene.spawnY=60;

    scene.exit=scene.add.image(
        1190,
        750,
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
    // Expanded Borders (1260 x 810)
    // ======================

    for(let x=30; x<=1230; x+=30){
        addWall(x,30);
        addWall(x,780);
    }

    for(let y=60; y<=750; y+=30){
        addWall(30,y);
        addWall(1230,y);
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
// FIXED LAYOUTS WITH GUARANTEED PASSAGES (No Full Vertical Line Traps)
// =========================================================================

function layoutOne(addWall) {
    // "The Broken Teeth" - Columns have wide gaps so the player is never locked in
    for (let x = 120; x <= 1200; x += 90) {
        let gapY1 = 150;
        let gapY2 = 450;
        let gapY3 = 630;
        for (let y = 60; y <= 750; y += 30) {
            if (y !== gapY1 && y !== gapY2 && y !== gapY3) addWall(x, y);
        }
    }
    for (let y = 210; y <= 600; y += 180) {
        for (let x = 60; x <= 1200; x += 30) {
            if (x % 180 !== 0) addWall(x, y);
        }
    }
}

function layoutTwo(addWall) {
    // "Nested Chambers" - Open rectangular rings with wide entry doors
    for (let x = 120; x <= 1140; x += 30) {
        if (x !== 630) { addWall(x, 150); addWall(x, 630); }
    }
    for (let y = 150; y <= 630; y += 30) {
        if (y !== 360) { addWall(120, y); addWall(1140, y); }
    }
    // Inner maze structure with open crossways
    for (let x = 300; x <= 960; x += 180) {
        for (let y = 240; y <= 540; y += 30) {
            if (y !== 390) addWall(x, y);
        }
    }
}

function layoutThree(addWall) {
    // "Staggered Blocks" - Modular cluster maze preventing wall lockups
    for (let x = 150; x <= 1110; x += 180) {
        for (let y = 90; y <= 690; y += 180) {
            // Build small open-sided blocks instead of solid lines
            addWall(x, y);
            addWall(x + 30, y);
            addWall(x, y + 30);
            addWall(x + 30, y + 30);
        }
    }
    // Horizontal weaving lanes
    for (let y = 180; y <= 600; y += 180) {
        for (let x = 60; x <= 1200; x += 60) {
            if (x % 360 !== 0) addWall(x, y);
        }
    }
}

function layoutFour(addWall) {
    // "Open Weaver" - Diagonal weave pattern with guaranteed escape gaps
    for (let x = 90; x <= 1200; x += 60) {
        for (let y = 60; y <= 750; y += 60) {
            if ((x + y) % 120 === 0) {
                if (x + 30 <= 1200 && y !== 360) addWall(x + 30, y);
            } else {
                if (y + 30 <= 750 && x !== 630) addWall(x, y + 30);
            }
        }
    }
}

function layoutFive(addWall) {
    // "Diamond Corridor" - Spacious geometric pathways
    for (let x = 90; x <= 1170; x += 90) {
        let offset = Math.abs(630 - x);
        for (let y = 90 + offset/2; y <= 720 - offset/2; y += 60) {
            if (y % 120 !== 0) addWall(x, y);
        }
    }
}

function layoutSix(addWall) {
    // "Twin Hubs" - Large open rooms connected by clear corridors
    for (let y = 90; y <= 720; y += 30) {
        if (y < 300 || y > 450) {
            addWall(390, y);
            addWall(870, y);
        }
    }
    for (let x = 120; x <= 300; x += 90) {
        addWall(x, 240);
        addWall(x, 540);
    }
    for (let x = 960; x <= 1140; x += 90) {
        addWall(x, 240);
        addWall(x, 540);
    }
}

function layoutSeven(addWall) {
    // "Winding Channels" - Horizontal snake paths with wide transitions
    for (let y = 180; y <= 600; y += 120) {
        for (let x = 90; x <= 1140; x += 30) {
            if (x % 360 !== 0) addWall(x, y);
        }
    }
    for (let y = 120; y <= 660; y += 120) {
        for (let x = 270; x <= 1200; x += 360) {
            // Vertical connectors leaving spaces open
            if (x <= 1200) {
                addWall(x, y);
                addWall(x, y + 30);
            }
        }
    }
}

function layoutEight(addWall) {
    // "Cellular Node Network" - Spacious islands with multiple exit vectors
    for (let x = 180; x <= 1080; x += 180) {
        for (let y = 150; y <= 630; y += 150) {
            addWall(x, y);
            addWall(x + 30, y);
            addWall(x, y + 30);
            addWall(x + 30, y + 30);
            
            // Branching arms
            addWall(x - 60, y);
            addWall(x + 90, y);
        }
    }
}

function layoutNine(addWall) {
    // "Hourglass Arena" - Wide open center with guarded flanks
    for (let x = 120; x <= 510; x += 60) {
        addWall(x, 210);
        addWall(x, 570);
    }
    for (let x = 750; x <= 1140; x += 60) {
        addWall(x, 210);
        addWall(x, 570);
    }
    for (let y = 150; y <= 630; y += 90) {
        if (y !== 360) {
            addWall(570, y);
            addWall(690, y);
        }
    }
}

function layoutTen(addWall) {
    // "The Modular Maze" - Balanced grid spacing ensuring full walkability
    for (let x = 120; x <= 1140; x += 120) {
        for (let y = 120; y <= 660; y += 120) {
            addWall(x, y);
            addWall(x + 30, y);
            if (x % 240 === 0) addWall(x, y + 30);
        }
    }
}

function layoutEleven(addWall) {
    // "Open Circuit" - Clean parallel tracks with broad crossover points
    for (let y = 150; y <= 660; y += 150) {
        for (let x = 90; x <= 1170; x += 30) {
            if (x % 270 !== 0) addWall(x, y);
        }
    }
    for (let x = 270; x <= 990; x += 360) {
        for (let y = 90; y <= 720; y += 30) {
            if (y % 300 !== 0) addWall(x, y);
        }
    }
}