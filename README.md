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

Results open the official ISLRTC dictionary. See [sign sources](docs/SIGN_SOURCES.md) before adding sign mappings or bundled media.

## In-app video

An official ISLRTC greeting lesson is embedded for the curated `HELLO` lookup. Add only verified video IDs to `assets/scripts/sign-library.js`; all other results continue to link to the official dictionary.
