/*
==========================================
Escape Hidden Exit
key.js
==========================================
*/

function createKey(scene) {

    // Possible key locations
    const locations = [

        { x: 120, y: 120 },

        { x: 450, y: 120 },

        { x: 780, y: 120 },

        { x: 120, y: 300 },

        { x: 450, y: 300 },

        { x: 780, y: 300 },

        { x: 120, y: 520 },

        { x: 450, y: 520 },

        { x: 780, y: 520 }

    ];

    // Choose a random location
    const position = Phaser.Utils.Array.GetRandom(locations);

    // Create key
    scene.key = scene.add.image(

        position.x,

        position.y,

        "key"

    );

    // Scale
    scene.key.setScale(0.6);

    // Keep above walls
    scene.key.setDepth(5);

    // Return to game.js
    return scene.key;

}