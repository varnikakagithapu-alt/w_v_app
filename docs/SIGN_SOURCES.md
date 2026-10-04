# Sign sources

SignBridge uses the Indian Sign Language Research and Training Centre (ISLRTC) dictionary as its official lookup source:

- Dictionary portal: https://divyangjan.depwd.gov.in/islrtc/
- ISLRTC dictionary information: https://islrtc.nic.in/isl-dictionary/
- Official dataset index: https://www.data.gov.in/resource/indian-sign-language-dictionary-till-january-2024

The local library in `assets/scripts/sign-library.js` only maps common input aliases to dictionary search terms. It is a starter index, not a replacement for the official dataset.

When importing official records, preserve the record title, category, regional/sign-variant metadata, and the source media link. An image preview or embedded video may only be displayed when it is attached to that exact record.

Before adding a production sign mapping, validate the term, grammatical context, and regional variant with Deaf ISL users or qualified interpreters.

For embedded video, retain the original creator and source link in the library entry. Use only an approved official video URL or ID; do not infer that a broad lesson video represents every individual sign.

## Fingerspelling reference images

`assets/datasets/fingerspelling/` contains 26 static hand-shape photos (`a1.jpg`–`z1.jpg`), one per ISL manual alphabet letter, sourced from a third-party Kaggle-style ISL fingerspelling dataset (`dataset_ISL.zip`, ~12.6k images total, contributor-crowdsourced, filenames like `a/A1.jpg`..`a/A122.jpg`). Only one representative image per letter was imported; the source archive is not committed.

These images cover only the 26 letters and are used exclusively as a **fingerspelling fallback**: when typed/spoken input has no curated whole-word match in `sign-library.js`, the app can spell the word out letter-by-letter using these photos. They are not a substitute for whole-word ISL signs and must never be presented as the sign for a word — only as the individual letter shapes used to fingerspell it.

Because the source dataset is crowdsourced with no listed individual photographer credit per image, treat these as unverified reference material (clearly labeled as such in the UI) rather than an ISLRTC-equivalent authoritative source. If a verified official fingerspelling chart becomes available, prefer it and remove this dataset.

## ISLRTC Dictionary videos (Drive)

The user-provided [ISL Dictionary Google Drive folder](https://drive.google.com/drive/folders/1U-Pr4r1-cupgNOOq9NH_uTsQnPSVEKco) contains an `ISLRTC 300` subfolder under `New 2500 ISL Dictionary Videos`. The curated `ACCOMMODATION`, `AGENT`, `BANYAN`, `CHILD`, `CLERK`, `CONSUMER`, and `COURT` entries use individual file IDs from that subfolder, matched against the exact video filenames. These videos are embedded and linked from Drive; they are not downloaded or mirrored into the app.

The folder is identified as an ISLRTC dictionary collection by its supplied source and naming. Filename matching confirms the word-to-file association, but is not independent verification of the sign's linguistic accuracy, regional variant, or authorship. Keep these results labeled as sourced from the ISLRTC 300 collection and retain the individual video link.

## Community ISL Dictionary videos (Drive)

Some curated entries in `sign-library.js` (currently: HELLO, THANK-YOU, PLEASE, HELP, WAIT, YES, NO, SORRY, NAME, WATER, FOOD, DOCTOR) carry a `driveVideoId` field pointing to a specific whole-word sign video in a community-shared "ISL Dictionary" Google Drive folder, organized alphabetically with one video per word/phrase. Only the exact video file matching each curated word was linked — the folder itself is not downloaded, mirrored, or hosted; the app embeds/links to it live via Drive's file preview and view URLs.

This is a **shared/found resource of unclear ownership and authorship**, not ISLRTC's official dictionary. Treat it the same as the fingerspelling images: useful, unverified, and clearly labeled in the UI as community-sourced rather than official. Do not add further entries from this source without exact name-match verification, and do not present it as ISLRTC-equivalent.
