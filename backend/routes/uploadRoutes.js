// uploadRoutes.js

const express = require("express");
const {
    videoUpload,
    uploadVideo,
    imageUpload,
    uploadImage,
} = require("../controllers/uploadController");

const router = express.Router();

router.post("/upload", videoUpload.single("video"), uploadVideo);
router.post("/upload-image", imageUpload.single("image"), uploadImage);

module.exports = router;
