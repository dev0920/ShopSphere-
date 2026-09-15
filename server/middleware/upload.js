import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

let storage;
try {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "shopsphere/products",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
  });
} catch (err) {
  console.warn("Cloudinary storage fallback to memory storage:", err.message);
  storage = multer.memoryStorage();
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export default upload;