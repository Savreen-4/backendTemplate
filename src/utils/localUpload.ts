// src/middleware/localUpload.ts
import multer from "multer";
import fs from "fs";
import path from "path";

/* ---------- absolute folder: <project>/uploads/drivers ---------- */
const UPLOAD_BASE = path.join(__dirname, "../../uploads");
const DRIVER_DIR  = path.join(UPLOAD_BASE, "drivers");

fs.mkdirSync(DRIVER_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DRIVER_DIR),

  filename: (_req, file, cb) => {
    /* 1) separate base & ext  */
    const ext  = path.extname(file.originalname);                  // ".png"
    const base = path.basename(file.originalname, ext)             // "my photo"
                     .replace(/\s+/g, "_");                         // "my_photo"

    /* 2) build filename without double ext */
    cb(null, `${Date.now()}_${base}${ext}`);                       // "1699901234_my_photo.png"
  },
});

export const uploadPhotos = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB per file
}).array("photos", 10);                    // field name = photos[]

export const uploadSinglePhoto = multer({
  storage,                                  // same diskStorage as before
  limits: { fileSize: 20 * 1024 * 1024 },   // 20 MB max
}).single("photos");                         // ← field name in form‑data

export const uploadCompanyDocs = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
}).fields([
  { name: "idFront",       maxCount: 1 },
  { name: "idBack",        maxCount: 1 },
  { name: "licenseFront",  maxCount: 1 },
  { name: "licenseBack",   maxCount: 1 },
  { name: "certification", maxCount: 1 }, // img or PDF
]);