/*
==========================================
Escape Hidden Exit
enemy.js
==========================================
*/

let enemies = [];

// Create multiple enemies
function createEnemies(scene, count = 8) {

    enemies = [];

    for (let i = 0; i < count; i++) {

        let enemy = scene.add.image(

            Phaser.Math.Between(80, 820),

            Phaser.Math.Between(80, 570),

            "enemy"

        );

        enemy.setScale(0.6);

        enemy.speed = Phaser.Math.Between(1, 3);

        enemy.direction = Phaser.Math.Between(0, 3);

        enemy.changeDirectionTime = 0;

        enemies.push(enemy);
    }

}

// Move enemies randomly
function moveEnemies(scene, player) {

    enemies.forEach(enemy => {

        enemy.changeDirectionTime++;

        if (enemy.changeDirectionTime > 60) {

            enemy.direction = Phaser.Math.Between(0, 3);

            enemy.changeDirectionTime = 0;

        }

        let nextX = enemy.x;
        let nextY = enemy.y;

        switch (enemy.direction) {

            case 0:
                nextY -= enemy.speed;
                break;

            case 1:
                nextY += enemy.speed;
                break;

            case 2:
                nextX -= enemy.speed;
                break;

            case 3:
                nextX += enemy.speed;
                break;

        }

        if (!hitsWall(nextX, enemy.y))
            enemy.x = nextX;

        if (!hitsWall(enemy.x, nextY))
            enemy.y = nextY;

        // Stay inside map
        enemy.x = Phaser.Math.Clamp(enemy.x, 50, 850);
        enemy.y = Phaser.Math.Clamp(enemy.y, 50, 600);

    });

}

// Check if any enemy catches the player
function checkEnemyCollision(player) {

    for (let enemy of enemies) {

        if (

            Phaser.Math.Distance.Between(

                player.x,
                player.y,

                enemy.x,
                enemy.y

            ) < 28

        ) {

            return true;

        }

    }

    return false;

}

// Remove enemies
function destroyEnemies() {

    enemies.forEach(enemy => enemy.destroy());

    enemies = [];

}