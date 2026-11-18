const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const MUSIC_DIR = path.join(DATA_DIR, "music");
const DB_FILE = path.join(DATA_DIR, "tracks.json");
fs.mkdirSync(MUSIC_DIR, { recursive: true });

function readTracks() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return []; }
}
function writeTracks(items) {
  fs.writeFileSync(DB_FILE, JSON.stringify(items, null, 2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, MUSIC_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 10).replace(/[^.a-zA-Z0-9]/g, "");
    cb(null, crypto.randomUUID() + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) cb(null, true);
    else cb(new Error("Please upload audio files only."));
  }
});

app.get("/api/tracks", (_req, res) => {
  const tracks = readTracks().map(({ filename, ...t }) => t);
  res.json(tracks);
});

app.post("/api/upload", upload.array("tracks", 8), (req, res) => {
  const tracks = readTracks();
  const added = (req.files || []).map(file => {
    const track = {
      id: crypto.randomUUID(),
      title: path.parse(file.originalname).name,
      artist: "Community upload",
      filename: file.filename,
      mime: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      likes: 0
    };
    tracks.unshift(track);
    return { ...track, url: `/api/stream/${track.id}` };
  });
  writeTracks(tracks);
  res.status(201).json(added);
});

app.get("/api/stream/:id", (req, res) => {
  const track = readTracks().find(t => t.id === req.params.id);
  if (!track) return res.status(404).send("Track not found");
  const file = path.join(MUSIC_DIR, path.basename(track.filename));
  if (!fs.existsSync(file)) return res.status(404).send("Audio file is missing");
  res.setHeader("Content-Type", track.mime || "application/octet-stream");
  res.setHeader("Accept-Ranges", "bytes");
  res.sendFile(file);
});

app.post("/api/tracks/:id/like", (req, res) => {
  const tracks = readTracks();
  const track = tracks.find(t => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: "Track not found" });
  track.likes = (track.likes || 0) + 1;
  writeTracks(tracks);
  res.json({ likes: track.likes });
});

app.delete("/api/tracks/:id", (req, res) => {
  // Basic demo endpoint. Add authentication before exposing delete controls publicly.
  const tracks = readTracks();
  const index = tracks.findIndex(t => t.id === req.params.id);
  if (index < 0) return res.status(404).json({ error: "Track not found" });
  const [track] = tracks.splice(index, 1);
  const file = path.join(MUSIC_DIR, path.basename(track.filename));
  if (fs.existsSync(file)) fs.unlinkSync(file);
  writeTracks(tracks);
  res.json({ ok: true });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(400).json({ error: err.message || "Upload failed" });
});

app.listen(PORT, () => console.log(`SoundSpace listening on ${PORT}`));
