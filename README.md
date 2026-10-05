# SignBridge

A browser-based assistant that accepts English, Hindi, Telugu, Kannada, and Tamil text or speech and helps users look up Indian Sign Language (ISL) signs.

The **Learn ISL** section provides self-paced lessons across the alphabet, numbers, greetings, family, education, emergency, food, places, and common conversations. It uses official dictionary searches when a curated in-app video is not available.

## Project structure

```
assets/
  icons/          PWA icon
  scripts/        application behaviour and curated sign lookup data
  styles/         global application styles
docs/             source and validation notes
index.html        application shell
manifest.json     PWA metadata
service-worker.js offline app-shell cache
```

## Run locally

Serve the repository with any static web server, then open the local URL in a modern browser. Speech input uses the browser's Web Speech API and may require HTTPS or localhost.

## Publish for phone access

The site is a static app and can be published with GitHub Pages:

1. In the repository settings, open **Pages** and set the build source to **GitHub Actions**.
2. Push or merge changes into `main`. The **Deploy to GitHub Pages** workflow publishes the app.
3. Open `https://varnikakagithapu-alt.github.io/w_v_app/` on a phone or computer.

The deployed site uses HTTPS, which is required by mobile browsers for camera access and some speech features. Speech recognition is provided by the browser and may require an internet connection. The app can capture a temporary microphone recording for replay; it stays in page memory and is discarded when cleared or when the page is refreshed. Camera access and recorded practice samples remain on each user's device.

## Speech input

Use **Start microphone** to see live transcription, then **Stop microphone** to review and edit the recognized text before sending it for sign lookup. **Replay audio** is enabled when the browser supports local microphone recording. **Clear text** removes the draft and its temporary replay recording. Speech recognition and audio recording require microphone permission; browser support varies.

## Data policy

Unmatched terms search the official ISLRTC dictionary; curated terms can open a linked word video. See [sign sources](docs/SIGN_SOURCES.md) before adding sign mappings or bundled media.

## In-app video

Curated word lookups can embed their exact matching video from Google Drive. The library includes community-shared clips and clips from the ISLRTC 300 collection; their source labels are shown with each result. Other terms fall back to the official dictionary search. See [sign sources](docs/SIGN_SOURCES.md) before adding mappings or media.
