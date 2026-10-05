/*
 * Shared sign-result rendering: builds the DOM cards shown for a lookup
 * result (video preview / fingerspelling tiles / search fallback). Used by
 * both the main chat flow (app.js) and practice mode (practice.js).
 */
import { officialSearch } from './sign-lookup.js';

const PREVIEW_TIMEOUT_MS = 15000;

function driveVideoEmbedUrl(driveVideoId) {
  return `https://drive.google.com/file/d/${driveVideoId}/preview`;
}

function createPreviewFrame(sign) {
  const wrap = document.createElement('div');
  wrap.className = 'sign-preview';

  const status = document.createElement('p');
  status.className = 'sign-preview-status';
  status.textContent = sign.driveVideoId ? 'Loading ISL video…' : 'Loading official ISL preview…';

  const frame = document.createElement('iframe');
  frame.className = 'sign-preview-frame';
  frame.src = sign.driveVideoId ? driveVideoEmbedUrl(sign.driveVideoId) : officialSearch(sign.gloss);
  frame.loading = sign.driveVideoId ? 'eager' : 'lazy';
  frame.title = sign.driveVideoId
    ? `ISL sign video for ${sign.gloss}`
    : `Official ISLRTC preview for ${sign.gloss}`;
  frame.referrerPolicy = 'no-referrer';
  frame.allow = 'autoplay; fullscreen; picture-in-picture';
  frame.hidden = true;

  let settled = false;
  const timeout = setTimeout(() => {
    if (settled) return;
    settled = true;
    frame.remove();
    status.textContent = 'Preview unavailable right now. Use the link below to watch it directly.';
  }, PREVIEW_TIMEOUT_MS);

  frame.addEventListener('load', () => {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    frame.hidden = false;
    status.remove();
  });

  wrap.append(status, frame);
  if (sign.driveVideoId) {
    const playbackHint = document.createElement('p');
    playbackHint.className = 'sign-preview-hint';
    playbackHint.textContent = 'Press Play in the video to start it. If it does not respond, use "Open video in Drive" below.';
    wrap.append(playbackHint);
  }
  return wrap;
}

function createFingerspellCard(entry, index) {
  const card = document.createElement('article');
  const number = document.createElement('span');
  const title = document.createElement('h3');
  const description = document.createElement('p');
  const row = document.createElement('div');
  const link = document.createElement('a');

  card.className = 'sign-card';
  number.className = 'card-number';
  number.textContent = `SIGN ${String(index + 1).padStart(2, '0')}`;
  title.textContent = entry.word.toUpperCase();
  description.textContent = 'No curated whole-word match. Spelled letter-by-letter using an unverified public ISL alphabet dataset — not an official standard.';

  row.className = 'fingerspell-row';
  for (const { letter, available, src } of entry.letters) {
    const tile = document.createElement('div');
    tile.className = 'fingerspell-tile';
    if (available) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `ISL fingerspelling hand shape for the letter ${letter.toUpperCase()}`;
      img.loading = 'lazy';
      tile.append(img);
    } else {
      tile.classList.add('fingerspell-tile-missing');
    }
    const label = document.createElement('span');
    label.textContent = letter.toUpperCase();
    tile.append(label);
    row.append(tile);
  }

  link.className = 'source-link';
  link.href = officialSearch(entry.word);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Search official ISL dictionary ↗';

  card.append(number, title, description, row, link);
  return card;
}

export function createSignCard(sign, index) {
  if (sign.kind === 'fingerspell') return createFingerspellCard(sign, index);

  const card = document.createElement('article');
  const number = document.createElement('span');
  const title = document.createElement('h3');
  const description = document.createElement('p');
  const link = document.createElement('a');

  card.className = 'sign-card';
  number.className = 'card-number';
  number.textContent = `SIGN ${String(index + 1).padStart(2, '0')}`;
  title.textContent = sign.gloss;
  description.textContent = sign.fallback
    ? 'No curated match yet. Use the official search to find the closest ISL sign or fingerspelling.'
    : sign.kind === 'fuzzy'
      ? `Closest match to "${sign.matchedWord}". ${sign.category}`
      : sign.category;
  link.className = 'source-link';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  if (sign.driveVideoId) {
    link.href = `https://drive.google.com/file/d/${sign.driveVideoId}/view`;
    link.textContent = 'Open video in Drive ↗';
  } else {
    link.href = officialSearch(sign.gloss);
    link.textContent = 'Watch official ISL sign ↗';
  }

  card.append(number, title, createPreviewFrame(sign), description, link);

  if (sign.driveVideoId) {
    const note = document.createElement('p');
    note.className = 'sign-card-note';
    note.textContent = sign.driveSource === 'islrtc'
      ? 'Video from the ISLRTC 300 collection in the ISL Dictionary Google Drive folder.'
      : 'Video from a community-shared ISL dictionary, not the official ISLRTC source.';
    card.append(note);
  }

  return card;
}
