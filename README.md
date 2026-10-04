# SignBridge

A browser-based assistant that accepts English, Hindi, Telugu, Kannada, and Tamil text or speech and helps users look up Indian Sign Language (ISL) signs.

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

## Data policy

Unmatched terms search the official ISLRTC dictionary; curated terms can open a linked word video. See [sign sources](docs/SIGN_SOURCES.md) before adding sign mappings or bundled media.

## In-app video

Curated word lookups can embed their exact matching video from Google Drive. The library includes community-shared clips and clips from the ISLRTC 300 collection; their source labels are shown with each result. Other terms fall back to the official dictionary search. See [sign sources](docs/SIGN_SOURCES.md) before adding mappings or media.
