require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const { judgePassion } = require("./lib/gemini");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

const PORT = process.env.PORT || 3000;

app.post("/api/roast", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "No photo uploaded" });
    }
    const passionName = (req.body.passionName || "").trim();
    if (!passionName) {
      return res.status(400).json({ ok: false, error: "passionName is required" });
    }

    const imageBase64 = req.file.buffer.toString("base64");
    const result = await judgePassion({
      imageBase64,
      mimeType: req.file.mimetype,
      passionName,
    });

    res.json({ ok: true, result });
  } catch (err) {
    console.error("Roast error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Multer errors (e.g. file too large) land here
app.use((err, req, res, next) => {
  if (err) {
    console.error("Upload error:", err.message);
    return res.status(400).json({ ok: false, error: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Passion Roast server running on port ${PORT}`);
});
