const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");
const { isAdmin, isAuth } = require("../utils.js");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});
const uploadRouter = express.Router();

uploadRouter.post(
  "/",
  isAuth,
  isAdmin,
  upload.single("file"),
  async (req, res) => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    try {
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { width: 640, height: 640, crop: "fill" },
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                console.error("Cloudinary error:", error);
                reject(error);
              }
            }
          );
          console.log("req.file:", req.file);
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
      if (!req.file || req.file.size > 1024 * 1024 * 5) {
        return res.status(400).json({ message: "File size limit exceeded" });
      }
      const result = await streamUpload(req);
      res.status(200).send(result);
    } catch (err) {
      res.status(500).send({ message: "internal server Error!!", err });
    }
  }
);
module.exports = uploadRouter;
