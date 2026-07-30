// Check if the page was refreshed and redirect to main page
if (performance.getEntriesByType("navigation")[0]?.type === "reload" || performance.navigation.type === 1) {
    window.location.href = "index.html";
}

/*
==========================================
Escape Hidden Exit
game.js - (Random Spawns & Teleporting Traps)
==========================================
*/

// ------------------------------------
// Global Variables
// ------------------------------------

let sceneRef;
let player;
let cursors;
let wasd;

let timerText;
let statusText;
let scoreText;
let livesText;
let levelText;

let gameStarted = true;
let gameOver = false;
let isCinematic = false; 

let score = 0;
let timeLeft = 300;
let lives = 3;
let currentLevel = 1;    
let maxLevel = 3;     
let moveSpeed = 1.0;

let coins = [];
let spikes = [];
let smartEnemies = []; 
let mysteryTraps = []; 
let trapGlows = []; 
let powerUps = [];

let hasShield = false;
let isSpeedBoosted = false;

// ------------------------------------
// Phaser Config
// ------------------------------------

const config = {
    type: Phaser.AUTO,
    backgroundColor: "#0a0a14", 
    parent: "game",
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
    },
    scene: {
        preload,
        create,
        update
    }
};

new Phaser.Game(config);

// ------------------------------------
// PRELOAD
// ------------------------------------

function preload() {
    this.load.image("player", "assets/player.svg");
    this.load.image("enemy", "assets/enemy.svg");
    this.load.image("wall", "assets/wall.svg");
    this.load.image("key", "assets/key.svg");
    this.load.image("exit", "assets/exit.svg");
    this.load.image("coin", "assets/coin.svg");
    this.load.image("spike", "assets/spike.svg"); 
    this.load.image("gift", "assets/gift.svg"); 
    this.load.image("powerup", "assets/powerup.svg");

    // Audio
    this.load.audio("bgm", "assets/bgm.mp3");
    this.load.audio("sfx_coin", "assets/coin.mp3");
    this.load.audio("sfx_hurt", "assets/hurt.mp3");
    this.load.audio("sfx_win", "assets/win.mp3");
    this.load.audio("sfx_key", "assets/key.mp3");
}

// ======================================
// Helper: Get Random Valid Spot
// ======================================
function getRandomValidSpot(scene) {
    let rx, ry;
    do {
        // Keeps coords aligned with the 30px grid bounds
        rx = Phaser.Math.Between(3, 27) * 30; 
        ry = Phaser.Math.Between(3, 18) * 30; 
    } while (hitsWall(rx, ry));
    return { x: rx, y: ry };
}

// ======================================
// FX Helper: Screen Shake & Particles
// ======================================
function triggerActionFX(x, y, colorHex = 0x00ffcc) {
    sceneRef.cameras.main.shake(200, 0.005);

    for (let i = 0; i < 8; i++) {
        let p = sceneRef.add.circle(x, y, 4, colorHex, 1);
        p.setDepth(15);
        
        let angle = Math.random() * Math.PI * 2;
        let speed = Phaser.Math.Between(30, 80);
        
        sceneRef.tweens.add({
            targets: p,
            x: x + Math.cos(angle) * speed,
            y: y + Math.sin(angle) * speed,
            alpha: 0,
            scale: 0.2,
            duration: 400,
            onComplete: () => p.destroy()
        });
    }
}

// ======================================
// CREATE
// ======================================

function create() {
    sceneRef = this;

    // Grid Background
    let floorGrid = this.add.grid(
        900, 600, 1800, 1200, 30, 30, 
        0x0a0a14, 1, 0x1a1a2e, 0.8
    );
    floorGrid.setDepth(-1);

    // Audio
    this.bgm = this.sound.add("bgm", { volume: 0.4, loop: true });
    this.sfx_coin = this.sound.add("sfx_coin", { volume: 0.6 });
    this.sfx_hurt = this.sound.add("sfx_hurt", { volume: 0.8 });
    this.sfx_win = this.sound.add("sfx_win", { volume: 0.8 });
    this.sfx_key = this.sound.add("sfx_key", { volume: 0.8 });

    this.bgm.play();

    // Get Player Name from Menu
    let pName = localStorage.getItem("playerName") || "Player";

    // HUD
    statusText = this.add.text(20, 20, "Find the Real Key, " + pName + "!", {
        fontSize: "24px", color: "#ffffff", backgroundColor: "#000000"
    });
    levelText = this.add.text(20, 55, "Level : " + currentLevel + " / " + maxLevel, {
        fontSize: "22px", color: "#a832a8", backgroundColor: "#000000"
    });
    timerText = this.add.text(20, 90, "Time : " + timeLeft, {
        fontSize: "22px", color: "#ffff00", backgroundColor: "#000000"
    });
    scoreText = this.add.text(20, 125, "Score : 0", {
        fontSize: "20px", color: "#00ffff", backgroundColor: "#000000"
    });
    livesText = this.add.text(20, 160, "Lives : " + lives, {
        fontSize: "20px", color: "#ff0055", backgroundColor: "#000000"
    });

    statusText.setScrollFactor(0).setDepth(100);
    levelText.setScrollFactor(0).setDepth(100);
    timerText.setScrollFactor(0).setDepth(100);
    scoreText.setScrollFactor(0).setDepth(100);
    livesText.setScrollFactor(0).setDepth(100);

    // Setup Level
    setupLevel(this);

    // Camera
    this.cameras.main.setBounds(-300, -100, 800, 750);
    this.cameras.main.startFollow(player, true, 0.15, 0.15);
    this.cameras.main.centerOn(player.x, player.y);
    this.cameras.main.setZoom(1.0);

    // Controls
    cursors = this.input.keyboard.createCursorKeys();

    wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
});

    // Resize
    window.addEventListener("resize", () => {
        this.scale.resize(window.innerWidth, window.innerHeight);
    });

    // TIMER
    this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            if (!gameStarted || gameOver || isCinematic) return;
            timeLeft--;
            timerText.setText("Time : " + timeLeft);
            if (timeLeft <= 0) endGame("Time Up! Game Over.");
        }
    });

    this.cameras.main.roundPixels = true;
    this.cameras.main.fadeIn(500);

    this.input.keyboard.on("keydown-ESC", () => {
        if (confirm("Leave Game?")) location.href = "index.html";
    });
}

// ======================================
// LEVEL SETUP & PROGRESSION
// ======================================

function setupLevel(scene) {
    scene.hasKey = false;
    
    drawMaze(scene);

    // Pick a random valid starting spot
    let startPos = getRandomValidSpot(scene);
    scene.spawnX = startPos.x;
    scene.spawnY = startPos.y;

    if (!player) {
        player = scene.add.image(scene.spawnX, scene.spawnY, "player");
        player.setScale(0.85);
        player.setDepth(10);
    }

    if (scene.exit) scene.exit.setVisible(false);

    spawnKey(scene);            
    createCoins(scene, 10);      
    createSpikes(scene, 3 + currentLevel);  
    spawnSmartEnemies(scene, 3 + currentLevel); 
    createMysteryTraps(scene, 2);              
    createPowerUps(scene, 3);
    
    playLevelIntro(scene);


    // ADD THIS CODE BLOCK:
    const avatarData = localStorage.getItem("playerAvatar");
    const name = localStorage.getItem("playerName") || "Player 1";

    if (avatarData) {
        // Create an HTML container for the UI
        const ui = document.createElement('div');
        ui.style.position = 'absolute';
        ui.style.top = '20px';
        ui.style.right = '20px';
        ui.style.textAlign = 'center';
        ui.style.zIndex = '1000'; // Ensures it stays above the canvas

        ui.innerHTML = `
            <img src="${avatarData}" style="width:150px; height:150px; border-radius:50%; border:3px solid #00ffcc; object-fit: cover;">
            <div style="color:#ffffff; font-family:Arial, sans-serif; font-weight:bold; margin-top:5px; text-shadow: 1px 1px 2px #000;">
                ${name}
            </div>
        `;
        
        document.body.appendChild(ui);
    }

}

function playLevelIntro(scene) {
    isCinematic = true;
    
    let startDoor = scene.add.rectangle(scene.spawnX, scene.spawnY - 50, 40, 20, 0x00ffcc);
    startDoor.setDepth(1);
    
    player.setPosition(scene.spawnX, scene.spawnY - 50);
    player.setAlpha(0);
    
    let cx = scene.cameras.main.centerX;
    let cy = scene.cameras.main.centerY;
    
    let welcomeBg = scene.add.rectangle(cx, cy, 300, 150, 0x000000, 0.8);
    welcomeBg.setScrollFactor(0).setDepth(200);
    
    let welcomeText = scene.add.text(cx, cy, "WELCOME\nLevel " + currentLevel + " Loading...\nScore: " + score, {
        fontSize: "26px", color: "#00ffcc", align: "center", fontStyle: "bold"
    });
    welcomeText.setOrigin(0.5).setScrollFactor(0).setDepth(201);
    
    scene.tweens.add({
        targets: player,
        y: scene.spawnY, // Walk out of the door to the safe spot
        alpha: 1,
        duration: 1800,
        ease: 'Power2',
        onComplete: () => {
            startDoor.destroy();
            scene.tweens.add({
                targets: [welcomeBg, welcomeText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    welcomeBg.destroy();
                    welcomeText.destroy();
                    isCinematic = false; 
                }
            });
        }
    });
}

function clearLevel(scene) {
    if (scene.walls) scene.walls.forEach(w => w.destroy());
    if (coins) coins.forEach(c => c.destroy());
    if (spikes) spikes.forEach(s => s.destroy());
    if (smartEnemies) smartEnemies.forEach(e => e.destroy());
    if (mysteryTraps) mysteryTraps.forEach(m => m.destroy());
    if (powerUps) powerUps.forEach(p => p.destroy());
    if (trapGlows) trapGlows.forEach(g => g.destroy());
    
    if (scene.keyItem) scene.keyItem.destroy();
    if (scene.exit) scene.exit.destroy();

    // Reset music playback rate back to normal for the next level
    if (scene.bgm) scene.bgm.setRate(1.0);

    scene.walls = []; coins = []; spikes = []; smartEnemies = []; mysteryTraps = []; powerUps = []; trapGlows = [];
}

// ======================================
// UPDATE
// ======================================

function update() {
    if (!gameStarted || gameOver || isCinematic) return;

    movePlayer();
    updateSmartEnemies(); 

    checkTrapCollision(); 
    checkMysteryTraps(); 
    checkPowerUps();
    handleEnemyCollision(); 
    checkCoinCollection();  
    checkKeyCollection();
    checkExitReached();
}

// ======================================
// PLAYER MOVEMENT
// ======================================

function movePlayer() {
    let nextX = player.x;
    let nextY = player.y;

    if (cursors.left.isDown || wasd.left.isDown) {
    nextX -= moveSpeed;
}

if (cursors.right.isDown || wasd.right.isDown) {
    nextX += moveSpeed;
}

if (cursors.up.isDown || wasd.up.isDown) {
    nextY -= moveSpeed;
}

if (cursors.down.isDown || wasd.down.isDown) {
    nextY += moveSpeed;
} 

    if (!hitsWall(nextX, player.y)) player.x = nextX;
    if (!hitsWall(player.x, nextY)) player.y = nextY;

    player.x = Phaser.Math.Clamp(player.x, 40, 1760);
    player.y = Phaser.Math.Clamp(player.y, 40, 1160);
}

// ======================================
// SMART ENEMIES
// ======================================

function spawnSmartEnemies(scene, amount) {
    smartEnemies = [];
    for (let i = 0; i < amount; i++) {
        let rx, ry;
        do {
            rx = Phaser.Math.Between(100, 840);
            ry = Phaser.Math.Between(100, 590);
        } while (hitsWall(rx, ry) || Phaser.Math.Distance.Between(rx, ry, scene.spawnX, scene.spawnY) < 200);
        
        let enemy = scene.add.image(rx, ry, "enemy");
        enemy.setScale(0.5);
        enemy.setDepth(9);
        
        enemy.direction = Phaser.Math.Between(0, 3); 
        enemy.baseSpeed = 0.8;
        enemy.chaseSpeed = 1.1; 
        enemy.isFrozen = false;
        
        smartEnemies.push(enemy);
    }
}

function updateSmartEnemies() {
    let isAggroMode = sceneRef.hasKey;
    for (let enemy of smartEnemies) {
        if (enemy.isFrozen) continue;

        let distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
        
        if (isAggroMode && distToPlayer < 150) {
            enemy.setTint(0xff0000); 
            let angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
            let nextX = enemy.x + Math.cos(angle) * enemy.chaseSpeed;
            let nextY = enemy.y + Math.sin(angle) * enemy.chaseSpeed;
            
            if (!hitsWall(nextX, enemy.y)) enemy.x = nextX;
            if (!hitsWall(enemy.x, nextY)) enemy.y = nextY;
        } 
        else {
            enemy.clearTint(); 
            let nextX = enemy.x;
            let nextY = enemy.y;
            
            if (enemy.direction === 0) nextY -= enemy.baseSpeed;      
            else if (enemy.direction === 1) nextX += enemy.baseSpeed; 
            else if (enemy.direction === 2) nextY += enemy.baseSpeed; 
            else if (enemy.direction === 3) nextX -= enemy.baseSpeed; 

            if (hitsWall(nextX, nextY)) {
                enemy.direction = Phaser.Math.Between(0, 3);
            } else {
                enemy.x = nextX;
                enemy.y = nextY;
            }
        }
    }
}

function handleEnemyCollision() {
    for (let enemy of smartEnemies) {
        if (Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y) < 20) {
            takeDamage();
            return; 
        }
    }
}

// ======================================
// GLOWING EFFECTS
// ======================================

function createWhiteGlow(scene, x, y) {
    let glow = scene.add.circle(x, y, 22, 0xffffff, 0.4);
    glow.setDepth(2);
    scene.tweens.add({ targets: glow, alpha: 0.1, scale: 1.3, duration: 1200, yoyo: true, repeat: -1 });
    trapGlows.push(glow);
    return glow;
}

// ======================================
// TELEPORTING & LETHAL TRAPS
// ======================================

function createSpikes(scene, amount) {
    spikes = [];
    // Only ONE trap per level is lethal (reduces a life)
    let lethalIndex = Phaser.Math.Between(0, amount - 1); 

    for (let i = 0; i < amount; i++) {
        let rx, ry;
        do {
            rx = Phaser.Math.Between(4, 28) * 30;
            ry = Phaser.Math.Between(4, 19) * 30;
        } while (hitsWall(rx, ry) || Phaser.Math.Distance.Between(rx, ry, scene.spawnX, scene.spawnY) < 100);
        
        let glow = createWhiteGlow(scene, rx, ry);
        let spike = scene.add.image(rx, ry, "spike");
        spike.setScale(0.5);
        spike.setDepth(3); 
        spike.isActiveTrap = false;
        spike.setAlpha(0.3); 
        
        // Assign the unique lethal trap
        spike.isLethal = (i === lethalIndex);
        
        spikes.push(spike);
    }

    scene.time.addEvent({
        delay: 2000,
        loop: true,
        callback: () => {
            if (isCinematic) return;
            spikes.forEach(s => {
                s.isActiveTrap = !s.isActiveTrap;
                if (s.isActiveTrap) {
                    s.setAlpha(1.0);    
                    s.setTint(0xff3333); 
                } else {
                    s.setAlpha(0.3);    
                    s.clearTint();
                }
            });
        }
    });
}

function checkTrapCollision() {
    for (let spike of spikes) {
        if (spike.isActiveTrap) {
            if (Phaser.Math.Distance.Between(player.x, player.y, spike.x, spike.y) < 15) {
                
                // Trigger shake and red particle burst
                triggerActionFX(player.x, player.y, 0xff0055);

                if (spike.isLethal) {
                    statusText.setText("Lethal Trap! Life Lost!");
                    takeDamage();
                } else {
                    let newPos = getRandomValidSpot(sceneRef);
                    player.setPosition(newPos.x, newPos.y);
                    sceneRef.cameras.main.flash(400, 200, 0, 255); 
                    statusText.setText("Whoosh! You hit a Teleport Trap!");
                }
                return;
            }
        }
    }
}

// ======================================
// MYSTERY GIFTS
// ======================================

function createMysteryTraps(scene, amount) {
    mysteryTraps = [];
    for (let i = 0; i < amount; i++) {
        let rx, ry;
        do {
            rx = Phaser.Math.Between(100, 840);
            ry = Phaser.Math.Between(100, 590);
        } while (hitsWall(rx, ry));
        
        let glow = createWhiteGlow(scene, rx, ry);
        
        let trap = scene.add.image(rx, ry, "gift");
        trap.setScale(0.55);
        trap.setDepth(3);
        trap.glowRef = glow; 

        scene.tweens.add({ targets: trap, scale: 0.65, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        mysteryTraps.push(trap);
    }
}

function checkMysteryTraps() {
    for (let i = mysteryTraps.length - 1; i >= 0; i--) {
        let trap = mysteryTraps[i];
        if (Phaser.Math.Distance.Between(player.x, player.y, trap.x, trap.y) < 25) {
            trap.glowRef.destroy();
            trap.destroy();
            mysteryTraps.splice(i, 1);
            
            let effect = Phaser.Math.Between(1, 2); // Simplified gifts
            if (effect === 1) {
                statusText.setText("Gift: Jackpot! +300");
                if(sceneRef.sfx_coin) sceneRef.sfx_coin.play();
                addBonus(300);
            } 
            else if (effect === 2) {
                statusText.setText("Gift: Teleported!");
                let newPos = getRandomValidSpot(sceneRef);
                player.setPosition(newPos.x, newPos.y);
                sceneRef.cameras.main.flash(300, 255, 255, 255);
            }
        }
    }
}

// ======================================
// POWER-UPS & CONSUMABLES
// ======================================

function createPowerUps(scene, amount) {
    powerUps = [];
    const types = ["speed", "freeze", "shield"];

    for (let i = 0; i < amount; i++) {
        let rx, ry;
        do {
            rx = Phaser.Math.Between(60, 840);
            ry = Phaser.Math.Between(60, 590);
        } while (hitsWall(rx, ry));

        let glow = createWhiteGlow(scene, rx, ry);
        let pUp = scene.add.image(rx, ry, "powerup");
        pUp.setScale(0.5);
        pUp.setDepth(4);
        pUp.glowRef = glow;
        
        pUp.powerType = types[Phaser.Math.Between(0, types.length - 1)];

        if (pUp.powerType === "speed") pUp.setTint(0x00ffff);
        else if (pUp.powerType === "freeze") pUp.setTint(0x0088ff);
        else if (pUp.powerType === "shield") pUp.setTint(0xff00ff);

        scene.tweens.add({
            targets: pUp, scale: 0.6, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        powerUps.push(pUp);
    }
}

function checkPowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        let pUp = powerUps[i];
        if (Phaser.Math.Distance.Between(player.x, player.y, pUp.x, pUp.y) < 25) {
            pUp.glowRef.destroy();
            pUp.destroy();
            powerUps.splice(i, 1);

            if (sceneRef.sfx_coin) sceneRef.sfx_coin.play();
            triggerActionFX(pUp.x, pUp.y, 0x00ffcc);

            if (pUp.powerType === "speed") {
                statusText.setText("Power-Up: Speed Boost Active!");
                if (!isSpeedBoosted) {
                    isSpeedBoosted = true;
                    moveSpeed *= 1.8
                    sceneRef.time.delayedCall(5000, () => {
                        moveSpeed /= 1.8;
                        isSpeedBoosted = false;
                        statusText.setText("Speed Boost Expired.");
                    });
                }
            } 
            else if (pUp.powerType === "freeze") {
                statusText.setText("Power-Up: Enemies Frozen!");
                for (let enemy of smartEnemies) {
                    enemy.isFrozen = true;
                }
                sceneRef.time.delayedCall(4000, () => {
                    for (let enemy of smartEnemies) {
                        enemy.isFrozen = false;
                    }
                    statusText.setText("Enemies Unfrozen!");
                });
            } 
            else if (pUp.powerType === "shield") {
                statusText.setText("Power-Up: Energy Shield Acquired!");
                hasShield = true;
                player.setTint(0xff00ff);
            }
        }
    }
}

// ======================================
// DAMAGE & LIVES 
// ======================================

function takeDamage() {
    if (hasShield) {
        hasShield = false;
        player.clearTint();
        statusText.setText("Shield absorbed the damage!");
        if (sceneRef.sfx_hurt) sceneRef.sfx_hurt.play();
        sceneRef.cameras.main.flash(300, 255, 0, 255);
        return;
    }

    lives--;
    livesText.setText("Lives : " + lives);
    if(sceneRef.sfx_hurt) sceneRef.sfx_hurt.play();

    if (lives > 0) {
        player.setPosition(sceneRef.spawnX, sceneRef.spawnY); // Reset to level spawn
        sceneRef.cameras.main.flash(300, 255, 0, 0); 
    } else {
        endGame("Caught! Out of lives. Final Score: " + score);
    }
}

// ======================================
// COINS & DYNAMIC EXIT
// ======================================

function createCoins(scene, amount) {
    coins = [];
    for (let i = 0; i < amount; i++) {
        let rx, ry;
        do {
            rx = Phaser.Math.Between(60, 840);
            ry = Phaser.Math.Between(60, 590);
        } while (hitsWall(rx, ry));
        
        let coin = scene.add.image(rx, ry, "coin");
        coin.setScale(0.5);
        coin.setDepth(4);
        
        scene.tweens.add({
            targets: coin, y: coin.y - 8, duration: 1000, yoyo: true,
            repeat: -1, ease: 'Sine.easeInOut', delay: Math.random() * 1000
        });

        coins.push(coin);
    }
}

function checkCoinCollection() {
    for (let i = coins.length - 1; i >= 0; i--) {
        let coin = coins[i];
        if (Phaser.Math.Distance.Between(player.x, player.y, coin.x, coin.y) < 25) {
            coin.destroy();
            coins.splice(i, 1);
            if(sceneRef.sfx_coin) sceneRef.sfx_coin.play();
            addBonus(50);
        }
    }
}

function spawnKey(scene) {
    let rx, ry;
    do {
        rx = Phaser.Math.Between(400, 840);
        ry = Phaser.Math.Between(300, 590);
    } while (hitsWall(rx, ry) || Phaser.Math.Distance.Between(scene.spawnX, scene.spawnY, rx, ry) < 300);

    scene.keyItem = scene.add.image(rx, ry, "key");
    scene.keyItem.setScale(1.0);
    scene.keyItem.setDepth(4);

    scene.tweens.add({ targets: scene.keyItem, y: scene.keyItem.y - 10, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
}

function checkKeyCollection() {
    if (sceneRef.hasKey || !sceneRef.keyItem) return;

    if (Phaser.Math.Distance.Between(player.x, player.y, sceneRef.keyItem.x, sceneRef.keyItem.y) < 28) {
        sceneRef.hasKey = true;
        
        // Trigger particle and camera shake FX
        triggerActionFX(sceneRef.keyItem.x, sceneRef.keyItem.y, 0xffff00);
        
        sceneRef.keyItem.destroy();

        if(sceneRef.sfx_key) sceneRef.sfx_key.play(); 
        
        // Dynamic BGM Pitch/Rate Increase for Tension
        if(sceneRef.bgm) {
            sceneRef.bgm.setRate(1.25); 
        }

        addBonus(200);
        statusText.setText("Key Found! Enemies are hunting you!");

        if (sceneRef.exit) {
            let ex, ey;
            do {
                ex = Phaser.Math.Between(60, 840);
                ey = Phaser.Math.Between(60, 590);
            } while (hitsWall(ex, ey) || Phaser.Math.Distance.Between(player.x, player.y, ex, ey) < 400); 

            sceneRef.exit.setPosition(ex, ey);
            sceneRef.exit.setVisible(true);
            
            sceneRef.tweens.add({
                targets: sceneRef.exit, scale: 0.9, duration: 500, yoyo: true, repeat: -1
            });
        }
    }
}

// ======================================
// WALL COLLISION
// ======================================

function hitsWall(x, y) {
    if (!sceneRef.walls) return false;
    for (let wall of sceneRef.walls) {
        if (Phaser.Math.Distance.Between(x, y, wall.x, wall.y) < 20) {
            return true;
        }
    }
    return false;
}

// ======================================
// UTILS & ENDGAME / LEVEL ADVANCE
// ======================================

function addBonus(points) {
    score += points;
    scoreText.setText("Score : " + score);
}

function checkExitReached() {

    if (!sceneRef.hasKey || !sceneRef.exit) return;

    if (Phaser.Math.Distance.Between(
        player.x,
        player.y,
        sceneRef.exit.x,
        sceneRef.exit.y
    ) < 30) {

        if (sceneRef.sfx_win) sceneRef.sfx_win.play();

        // ===============================
        // LAST LEVEL COMPLETED
        // ===============================
        if (currentLevel >= maxLevel) {

            statusText.setText("MISSION COMPLETE!");

            sceneRef.time.delayedCall(1000, () => {
                endGame("🎉 Congratulations!\nYou Escaped Hidden Exit!\n\nFinal Score : " + score);
            });

            return;
        }

        // ===============================
        // NEXT LEVEL
        // ===============================
        currentLevel++;
        isCinematic = true;

        sceneRef.cameras.main.fadeOut(500);

        sceneRef.time.delayedCall(600, () => {

            // Remove old objects
            clearLevel(sceneRef);

            // Overlay
            const overlay = sceneRef.add.rectangle(
                sceneRef.cameras.main.centerX,
                sceneRef.cameras.main.centerY,
                sceneRef.cameras.main.width,
                sceneRef.cameras.main.height,
                0x000000,
                0.96
            )
            .setScrollFactor(0)
            .setDepth(500);

            // Title
            const title = sceneRef.add.text(
                sceneRef.cameras.main.centerX,
                90,
                "✔ MISSION COMPLETE",
                {
                    fontSize: "40px",
                    color: "#00ffcc",
                    fontStyle: "bold"
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(501);

            // Stats
            const info = sceneRef.add.text(
                sceneRef.cameras.main.centerX,
                220,

`Current Score : ${score}

Lives Remaining : ${"❤".repeat(lives)}

Coins Collected : ${10 - coins.length}

Time Bonus : +${timeLeft * 5}`,

                {
                    fontSize: "28px",
                    color: "#ffffff",
                    align: "center",
                    lineSpacing: 10
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(501);

            // Progress
            const progress = sceneRef.add.text(
                sceneRef.cameras.main.centerX,
                500,
                "Preparing Next Sector...\n\n░░░░░░░░░░ 0%",
                {
                    fontSize: "28px",
                    color: "#00ffcc",
                    align: "center"
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(501);

            const glitches = [
                "SYSTEM BREACH",
                "LOADING ENEMY AI",
                "RECONFIGURING MAZE",
                "GENERATING EXIT",
                "INITIALIZING TRAPS",
                "ACCESS GRANTED"
            ];

            let percent = 0;

            const loading = sceneRef.time.addEvent({

                delay: 30,

                repeat: 10,

                callback: () => {

                    percent += 10;

                    let bars = Math.floor(percent / 10);

                    progress.setText(

                        glitches[Math.floor(Math.random() * glitches.length)]

                        +

                        "\n\n"

                        +

                        "█".repeat(bars)

                        +

                        "░".repeat(10 - bars)

                        +

                        " "

                        +

                        percent

                        +

                        "%"

                    );

                    overlay.alpha = 0.88 + Math.random() * 0.08;

                    title.x = sceneRef.cameras.main.centerX + Phaser.Math.Between(-2, 2);

                    title.y = 90 + Phaser.Math.Between(-2, 2);

                    sceneRef.cameras.main.shake(20, 0.001);

                    if (percent >= 100) {

                        loading.remove();

                        sceneRef.time.delayedCall(700, () => {

                            overlay.destroy();
                            title.destroy();
                            info.destroy();
                            progress.destroy();

                            levelText.setText(
                                "Level : " + currentLevel + " / " + maxLevel
                            );

                            setupLevel(sceneRef);

                            sceneRef.cameras.main.fadeIn(600);

                            const levelTitle = sceneRef.add.text(
                                sceneRef.cameras.main.centerX,
                                sceneRef.cameras.main.centerY,
                                "LEVEL " + currentLevel,
                                {
                                    fontSize: "64px",
                                    fontStyle: "bold",
                                    color: "#00ffcc",
                                    backgroundColor: "#000000"
                                }
                            )
                            .setOrigin(0.5)
                            .setScrollFactor(0)
                            .setDepth(999);

                            sceneRef.tweens.add({
                                targets: levelTitle,
                                alpha: 0,
                                duration: 1500,
                                delay: 1200,
                                onComplete: () => levelTitle.destroy()
                            });

                            isCinematic = false;

                        });

                    }

                }

            });

        });

    }

}

// ======================================
// GAME OVER
// ======================================

function endGame(reason) {
    if (gameOver) return;

    lives--; // Subtract a life

    if (lives > 0) {
        // Player still has lives
        alert("System Alert: Life Lost! \nRemaining Lives: " + lives + "\n\nGet ready for the next attempt.");
        
        // Reset player position instead of restarting the whole game
        player.setPosition(startX, startY); 
        return;
    }

    // No lives left - Final Game Over
    gameOver = true;
    
    // Stop Music
    if (sceneRef.bgm) sceneRef.bgm.stop();
    if (sceneRef.sfx_hurt) sceneRef.sfx_hurt.play();
    
    // The "Funny" Final Death Messages
    const finalMessages = [
        "SYSTEM CRITICAL: All lives exhausted. You are not meant for this maze.",
        "GAME OVER: Even the best runners eventually run out of luck.",
        "TERMINATED: The Hunter is now officially bored of you.",
        "ERROR 404: Skill not found. Restarting simulation...",
        "DELETED: Your performance was... memorable, but ultimately fatal."
    ];
    
    let finalMsg = finalMessages[Math.floor(Math.random() * finalMessages.length)];
    
    alert(finalMsg + "\n\nFinal Score: " + score + "\n\nReturning to Main Menu.");
    
    // Redirect to menu
    window.location.href = "index.html";
}

function showGameOverScreen(message) {
    // Create a dark overlay
    let overlay = sceneRef.add.rectangle(900, 600, 1800, 1200, 0x000000, 0.9);
    overlay.setScrollFactor(0);
    
    // Display the final stats
    sceneRef.add.text(900, 500, "GAME OVER", { fontSize: "60px", color: "#ff0000" }).setOrigin(0.5).setScrollFactor(0);
    sceneRef.add.text(900, 600, message, { fontSize: "30px", color: "#ffffff" }).setOrigin(0.5).setScrollFactor(0);
    sceneRef.add.text(900, 650, "Final Score: " + score, { fontSize: "30px", color: "#00ffff" }).setOrigin(0.5).setScrollFactor(0);
    function getFunnyDeathMessage() {
    const messages = [
        "The Hunter caught you. You weren't that fast, were you?",
        "Spiked! Did you think that was a jump pad?",
        "You died. At least the high score board will have a good laugh.",
        "You ran out of time. Maybe try running... faster?",
        "Ouch. That looked like it hurt in 8-bit resolution.",
        "The Hunter says thanks for the snack."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

endGame(getFunnyDeathMessage());
    // Click to return to menu
    let btn = sceneRef.add.text(900, 750, "CLICK TO RETURN TO MENU", { fontSize: "24px", color: "#00ffcc", backgroundColor: "#333" })
        .setOrigin(0.5).setScrollFactor(0).setInteractive();
        
    btn.on('pointerdown', () => { window.location.href = "index.html"; });
}