// videoRoutes.js

const express = require("express");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const router = express.Router();

// Function to download files using either HTTP or HTTPS
function downloadFile(url, outputPath) {
    const protocol = url.startsWith("https") ? https : http;
    return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(outputPath);
        protocol
            .get(url, (response) => {
                response.pipe(stream);
                stream.on("finish", () => {
                    stream.close(); // Close the stream
                    console.log(`File downloaded to: ${outputPath}`);
                    resolve(outputPath);
                });
                stream.on("error", (err) => {
                    console.error(`Error downloading file: ${err.message}`);
                    reject(err);
                });
            })
            .on("error", (err) => {
                console.error(`Request error: ${err.message}`);
                reject(err);
            });
    });
}

// Function to create a video from an image
function createVideoFromImage(imagePath, outputVideoPath, duration = 3) {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(imagePath)
            .loop(duration)
            .videoCodec("libx264")
            .size("1280x720")
            .outputOptions(["-pix_fmt", "yuv420p", "-t", duration])
            .save(outputVideoPath)
            .on("end", () => {
                console.log(`Created video from image: ${outputVideoPath}`);
                resolve(outputVideoPath);
            })
            .on("error", (err) => {
                console.error(`Error creating video from image: ${err.message}`);
                reject(err);
            });
    });
}

// Function to get media file info (to check if it has audio)
function getMediaInfo(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                const hasAudio = metadata.streams.some(
                    (stream) => stream.codec_type === "audio"
                );
                const duration = metadata.format.duration;
                resolve({ hasAudio, duration });
            }
        });
    });
}

// Merge Videos API
router.post("/merge-videos", async (req, res) => {
    const {
        videoUrls,
        firstImageUrl,
        lastImageUrl,
        firstImageDuration,
        lastImageDuration,
        transitions, // Now expecting an array
    } = req.body;

    if (
        (!videoUrls || videoUrls.length === 0) &&
        !firstImageUrl &&
        !lastImageUrl
    ) {
        return res.status(400).json({ message: "No media URLs provided" });
    }

    try {
        const tempDir = path.join(__dirname, "../temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const mediaFiles = [];
        const mediaInfos = [];

        // Handle first image
        if (firstImageUrl) {
            const firstImagePath = path.join(tempDir, "firstImage.jpg");
            await downloadFile(firstImageUrl, firstImagePath);
            const firstVideoPath = path.join(tempDir, "firstVideo.mp4");
            await createVideoFromImage(
                firstImagePath,
                firstVideoPath,
                firstImageDuration || 3 // Use provided duration
            );
            mediaFiles.push(firstVideoPath);
        }

        // Download video files
        if (videoUrls && videoUrls.length > 0) {
            const videoFiles = await Promise.all(
                videoUrls.map((url, index) => {
                    const outputPath = path.join(tempDir, `video${index}.mp4`);
                    console.log(`Downloading video from: ${url}`);
                    return downloadFile(url, outputPath);
                })
            );
            mediaFiles.push(...videoFiles);
        }

        // Handle last image
        if (lastImageUrl) {
            const lastImagePath = path.join(tempDir, "lastImage.jpg");
            await downloadFile(lastImageUrl, lastImagePath);
            const lastVideoPath = path.join(tempDir, "lastVideo.mp4");
            await createVideoFromImage(
                lastImagePath,
                lastVideoPath,
                lastImageDuration || 3 // Use provided duration
            );
            mediaFiles.push(lastVideoPath);
        }

        if (mediaFiles.length === 0) {
            return res.status(400).json({ message: "No media files to process" });
        }

        // Get media info for each file
        for (let i = 0; i < mediaFiles.length; i++) {
            const mediaInfo = await getMediaInfo(mediaFiles[i]);
            mediaInfos.push({
                file: mediaFiles[i],
                hasAudio: mediaInfo.hasAudio,
                duration: mediaInfo.duration,
            });
        }

        const outputVideoPath = path.join(tempDir, "output.mp4");

        // Validate transitions array
        const expectedTransitions = mediaFiles.length - 1;
        let transitionsArray = [];

        if (transitions && Array.isArray(transitions)) {
            if (transitions.length !== expectedTransitions) {
                return res.status(400).json({
                    message: `Number of transitions (${transitions.length}) does not match the required number (${expectedTransitions})`,
                });
            }
            transitionsArray = transitions;
        } else {
            // Default to 'none' if not provided
            transitionsArray = Array(expectedTransitions).fill("none");
        }

        // Validate transitions
        const supportedTransitions = [
            "fade",
            "wipeleft",
            "wiperight",
            "slideup",
            "slidedown",
            "circleopen",
            "circleclose",
            // Add other supported transitions
        ];

        if (!transitionsArray.every((t) => supportedTransitions.includes(t))) {
            return res.status(400).json({ message: "One or more unsupported transitions provided." });
        }

        // Build the FFmpeg command
        let ffmpegCommand = ffmpeg();

        // Add all input media files
        mediaFiles.forEach((file) => {
            ffmpegCommand = ffmpegCommand.addInput(file);
        });

        // Prepare the filter_complex string with transitions
        let filterComplex = "";
        const transitionDuration = 1; // Duration of the transition in seconds

        // Prepare video scaling, setting framerate, and labeling
        for (let i = 0; i < mediaFiles.length; i++) {
            filterComplex += `[${i}:v]scale=1280:720,setsar=1,fps=25,format=yuv420p,settb=AVTB[v${i}];`;
        }

        // Prepare audio streams (generate silent audio if needed)
        for (let i = 0; i < mediaFiles.length; i++) {
            if (!mediaInfos[i].hasAudio) {
                filterComplex += `aevalsrc=0:d=${mediaInfos[i].duration}[a${i}];`;
            }
        }

        // Initialize the video merging process
        let lastVideo = `[v0]`;
        let totalDuration = 0;

        for (let i = 1; i < mediaFiles.length; i++) {
            const currentVideo = `[v${i}]`;
            const transition = transitionsArray[i - 1] || "none";
            const outputVideo = `[v_temp${i}]`;

            // Calculate offset for xfade
            totalDuration += parseFloat(mediaInfos[i - 1].duration) - transitionDuration;

            if (transition === "none") {
                // No transition, simple concatenation
                filterComplex += `${lastVideo}${currentVideo}concat=n=2:v=1:a=0[${outputVideo.slice(1, -1)}];`;
            } else {
                // Apply transition using xfade
                filterComplex += `${lastVideo}${currentVideo}xfade=transition=${transition}:duration=${transitionDuration}:offset=${totalDuration}[${outputVideo.slice(1, -1)}];`;
            }

            lastVideo = outputVideo;
        }

        // Handle audio concatenation
        let audioInputs = [];
        for (let i = 0; i < mediaFiles.length; i++) {
            const audioLabel = mediaInfos[i].hasAudio ? `[${i}:a]` : `[a${i}]`;
            audioInputs.push(audioLabel);
        }

        // Concatenate audio streams
        const audioConcatInputs = audioInputs.join("");
        filterComplex += `${audioConcatInputs}concat=n=${mediaFiles.length}:v=0:a=1[aout];`;

        // Map the final video and audio outputs
        const finalVideoLabel =
            mediaFiles.length > 1 ? `[v_temp${mediaFiles.length - 1}]` : `[v0]`;

        ffmpegCommand
            .complexFilter(filterComplex)
            .outputOptions([
                "-map",
                finalVideoLabel,
                "-map",
                "[aout]",
                "-preset",
                "fast",
                "-c:v",
                "libx264",
                "-c:a",
                "aac",
                "-pix_fmt",
                "yuv420p",
                "-r",
                "25", // Set output frame rate to 25 fps
            ])
            .on("start", (commandLine) => {
                console.log(`FFmpeg command: ${commandLine}`);
            })
            .on("end", () => {
                console.log("Merging complete. Sending file...");
                res.sendFile(outputVideoPath, (err) => {
                    if (err) {
                        console.error("Error sending file:", err);
                        res.status(500).json({
                            message: "Error sending merged video",
                            error: err.message,
                        });
                    }
                });

                res.on("finish", () => {
                    console.log("Response finished. Cleaning up temp files.");
                    try {
                        fs.rmSync(tempDir, { recursive: true, force: true });
                    } catch (err) {
                        console.error("Error cleaning up temp files:", err);
                    }
                });
            })
            .on("error", (err, stdout, stderr) => {
                console.error("FFmpeg Error:", err.message);
                console.error("FFmpeg Stdout:", stdout);
                console.error("FFmpeg Stderr:", stderr);
                res.status(500).json({
                    message: "Error merging videos",
                    error: stderr || err.message,
                });
            })
            .save(outputVideoPath);
    } catch (err) {
        console.error("Server Error:", err.message);
        res
            .status(500)
            .json({ message: "Error processing videos", error: err.message });
    }
});

module.exports = router;
