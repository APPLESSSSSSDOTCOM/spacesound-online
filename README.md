# SoundSpace Online

This is the server-backed version of SoundSpace. Unlike the single-file demo, uploads are stored on the server and the same library is visible to everyone who visits the deployed website.

## Run it on your computer

You need Node.js 20 or newer.

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

## Put it online

A straightforward option is Render:

1. Create a GitHub repository and upload the contents of this folder.
2. Create a **Web Service** on Render and connect that repository.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add a **persistent disk** mounted at `/opt/render/project/src/data` (or set `DATA_DIR` to the disk mount path).
6. Deploy, then open the public `onrender.com` address on each device.

The persistent disk matters: without persistent storage, uploaded songs can disappear when the hosting service restarts or redeploys. Check your host's current disk pricing and limits before choosing a plan.

## Current features

- Shared upload library (MP3 and other browser-supported audio formats)
- Streaming playback, search, likes, and refresh
- Upload limit: 30 MB per file, up to 8 files per upload

## Important before inviting the public

This is a starter project, not a hardened public service. It currently has no accounts, ownership checks, moderation, rate limits, or abuse reporting. Anyone who can reach the site can upload and add likes. Add authentication, moderation, storage quotas, and rate limiting before public launch. Only upload music you created or have permission to share. Do not upload copyrighted tracks without permission.
