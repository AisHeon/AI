# Cell Signal — 90-second web animation

This repository contains a responsive, canvas-based 90-second animation. The browser scene and the MP4 renderer share the same deterministic timeline: `0:00` through `1:30`.

## Run the web animation

Open `index.html` in a modern browser, or run:

```bash
npm install
npm run serve
```

Use **Play Animation**, **Pause**, **Restart**, or the timeline slider. The **Download MP4** button downloads `assets/cell-signal-90s-1080p.mp4` after that file has been generated.

## Generate the MP4

The renderer uses Playwright to run the real page at a fixed 1920×1080 viewport and FFmpeg to encode the captured frames as H.264 MP4:

```bash
# Install FFmpeg and ensure `ffmpeg` is on PATH
npm install
npm run render:mp4
```

The generated file is written to `assets/cell-signal-90s-1080p.mp4`, which is the exact file targeted by the Download MP4 button. The renderer advances the page's shared 90-second timeline and captures the same canvas animation, rather than recording a manually controlled screen.

## Prerequisites

- Node.js 18+
- FFmpeg with H.264 support
- Playwright Chromium (`npx playwright install chromium` if needed)

No stock footage, remote video, or external media is used at runtime.
