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

## Publish for phone access

The site is a static app and can be published with GitHub Pages:

1. In the repository settings, open **Pages** and set the build source to **GitHub Actions**.
2. Push or merge changes into `main`. The **Deploy to GitHub Pages** workflow publishes the app.
3. Open `https://varnikakagithapu-alt.github.io/w_v_app/` on a phone or computer.

The deployed site uses HTTPS, which is required by mobile browsers for camera access and some speech features. Camera access and recorded practice samples remain on each user's device.

## Data policy

Results open the official ISLRTC dictionary. See [sign sources](docs/SIGN_SOURCES.md) before adding sign mappings or bundled media.

## In-app video

An official ISLRTC greeting lesson is embedded for the curated `HELLO` lookup. Add only verified video IDs to `assets/scripts/sign-library.js`; all other results continue to link to the official dictionary.
