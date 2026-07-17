/*
===========================================
Escape Hidden Exit
server.js - (Single-Player Web Server)
===========================================
*/

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Start the server
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Escape Hidden Exit is Running!`);
    console.log(`👉 Play the game at: http://localhost:${PORT}`);
    console.log(`=========================================`);
});