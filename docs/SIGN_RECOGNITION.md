# Practice-mode sign recognition

`#practiceMode` (the "Practice conversation" button in the top bar) adds an experimental, same-device, two-panel test flow: U1 signs to a shared camera, the app tries to recognize which curated word (`assets/scripts/sign-library.js`) it matches and shows that word to U2 in their chosen language; U2 replies by typing/speaking, and the reply is looked up and shown back to U1 as sign video cards using the same rendering as the main chat.

## What this is

On-device, client-side hand-pose matching for the curated words in `sign-library.js`. It uses MediaPipe Tasks Vision `HandLandmarker` (Google, Apache-2.0, loaded from the jsDelivr CDN at a pinned version, `@mediapipe/tasks-vision@0.10.21`) purely to extract 21 hand-landmark points per frame — there is no ISL-specific model, no bundled training data, and no cloud/server-side inference. Matching is a plain nearest-neighbor distance comparison against landmark samples the user records themselves (`assets/scripts/hand-recognition.js`, `assets/scripts/calibration-store.js`).

## What this is NOT

- **Not a general ISL recognizer.** It only ever attempts to recognize words in `sign-library.js` — nothing else.
- **Not motion-aware.** Recognition is based on a single held hand pose per frame. Any sign whose meaning depends on movement (a wave, a repeated or directional motion) rather than a static final handshape will not be reliably distinguished from a similar-looking static pose. Treat every word as a lower-confidence candidate for this matcher until tested individually — several (e.g. WAIT, HELP) plausibly involve motion in actual ISL production that a static snapshot won't capture.
- **Not two-hand aware.** Only the first detected hand is used; two-handed signs are not supported in this version.
- **Not verified against real ISL production.** Nobody has checked that the reference poses a user records actually match standard ISL handshapes — this is whatever the user themselves signs and labels.
- **Not usable out of the box.** No shared or pre-trained reference set ships with the app. Each user must record their own calibration samples via "Record my signs" before recognition can do anything; unrecorded words always fall back to manual selection.

## How matching works

1. When U1's camera is active, MediaPipe extracts 21 hand-landmark points (x, y, z) roughly 10 times per second.
2. Each landmark set is normalized: translated so the wrist is the origin, then scaled by the wrist-to-middle-knuckle distance, so the result is roughly invariant to hand size and distance from the camera.
3. During calibration, a few normalized samples (target 5) are stored per word in the browser's IndexedDB (`signbridge-calibration`), keyed by the word's gloss.
4. During live recognition, each frame's normalized landmarks are compared (Euclidean distance) against every stored sample of every calibrated word; the closest match under a fixed distance threshold becomes a frame-level candidate.
5. A word is only promoted to a confirmed recognition after several consecutive frames agree, to reduce flicker — and even then, the user must explicitly press "Use this word" before it's sent to U2. Nothing is auto-committed from a recognition alone.

This is nearest-neighbor distance thresholding with temporal smoothing, not a trained ML classifier, and the match-distance threshold is a fixed constant that has not been empirically tuned across users, lighting, or cameras.

## Data storage and privacy

- Calibration samples are hand-landmark coordinates only (numbers), never images or video frames — stored locally in the browser's IndexedDB, never uploaded or synced anywhere.
- Camera video is processed live, frame by frame, entirely in the browser. It is never recorded, saved, or transmitted.
- Calibration is per-browser/per-device. Recording samples on one device or browser profile does not carry over to another.

## Known limitations

- Single-hand only in this version.
- Sensitive to lighting, background, camera angle, and hand-to-camera distance — normalization helps but does not fully cancel this out, and none of this has been tested across varied conditions.
- The match-distance threshold and consecutive-frame count are fixed constants (`assets/scripts/hand-recognition.js`), not calibrated per user beyond the samples they record.
- Recognition quality depends entirely on the quality and consistency of the calibration samples a user records; recording samples with a different camera angle/distance than later live use will degrade accuracy.
- Not a substitute for, or a claim of, ISL fluency or accuracy. This is a testing/learning aid, not a dependable recognizer — always keep the manual word-selection fallback available, which this feature does.

See also [`SIGN_SOURCES.md`](SIGN_SOURCES.md) — this feature follows the same "useful, unverified, clearly labeled" pattern already established there for the fingerspelling images and community Drive videos.
