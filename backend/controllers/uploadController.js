// uploadController.js

const cloudinary = require("../config/cloudinaryConfig");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Video storage configuration
const videoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "demo-reels",
        resource_type: "video",
    },
});

// Image storage configuration
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "demo-reels-images",
        resource_type: "image",
    },
});

const videoUpload = multer({ storage: videoStorage });
const imageUpload = multer({ storage: imageStorage });

const uploadVideo = (req, res) => {
    try {
        const videoUrl = req.file.path;
        res.status(200).json({ success: true, videoUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const uploadImage = (req, res) => {
    try {
        const imageUrl = req.file.path;
        res.status(200).json({ success: true, imageUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { videoUpload, uploadVideo, imageUpload, uploadImage };
