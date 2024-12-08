// server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const uploadRoutes = require("./routes/uploadRoutes");
const videoRoutes = require("./routes/videoRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/videos", uploadRoutes);
app.use("/api/videos", videoRoutes);

// Server Configuration
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Increase server timeout for large video processing
server.timeout = 0;
