/*
 * Shared ISL word-lookup logic: exact match -> fuzzy match -> fingerspelling
 * fallback -> generic dictionary-search fallback. Used by both the main chat
 * flow (app.js) and practice mode (practice.js) so both consume identical
 * matching behavior against window.SIGN_LIBRARY.
 */

export function officialSearch(term) {
  return `https://divyangjan.depwd.gov.in/islrtc/search.php?search=${encodeURIComponent(term)}`;
}

export function getAliasForLanguage(gloss, langCode) {
  const sign = window.SIGN_LIBRARY.find(entry => entry.gloss === gloss);
  if (!sign) return null;
  const variants = sign.aliases[langCode];
  return variants && variants.length ? variants[0] : null;
}

function flattenAliases(aliases) {
  return Object.values(aliases).flat();
}

function levenshteinDistance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const distance = Array.from({ length: rows }, (_, row) => [row, ...new Array(cols - 1).fill(0)]);
  for (let col = 1; col < cols; col += 1) distance[0][col] = col;

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = a[row - 1] === b[col - 1] ? 0 : 1;
      distance[row][col] = Math.min(
        distance[row - 1][col] + 1,
        distance[row][col - 1] + 1,
        distance[row - 1][col - 1] + cost
      );
    }
  }
  return distance[rows - 1][cols - 1];
}

function fuzzyMatchThreshold(length) {
  if (length <= 4) return 1;
  if (length <= 8) return 2;
  return 3;
}

const LATIN_WORD_PATTERN = /^[a-z]+$/;

function findFuzzyMatches(normalized) {
  const tokens = normalized.split(/[\s,!.?;:]+/).filter(token => LATIN_WORD_PATTERN.test(token));
  if (!tokens.length) return [];

  const candidates = [];
  for (const sign of window.SIGN_LIBRARY) {
    let best = null;
    for (const alias of flattenAliases(sign.aliases)) {
      if (!LATIN_WORD_PATTERN.test(alias)) continue;
      for (const token of tokens) {
        const threshold = fuzzyMatchThreshold(Math.max(token.length, alias.length));
        const distance = levenshteinDistance(token, alias);
        if (distance <= threshold && (!best || distance < best.distance)) {
          best = { distance, matchedWord: token };
        }
      }
    }
    if (best) candidates.push({ ...sign, kind: 'fuzzy', matchedWord: best.matchedWord, distance: best.distance });
  }

  candidates.sort((a, b) => a.distance - b.distance);
  return candidates.filter((sign, index) =>
    candidates.findIndex(match => match.gloss === sign.gloss) === index
  );
}

const FINGERSPELL_LETTERS = new Set('abcdefghijklmnopqrstuvwxyz'.split(''));
const FINGERSPELL_MAX_LENGTH = 14;

function findFingerspellEntry(message) {
  const [firstToken] = message.trim().split(/[\s,!.?;:]+/);
  if (!firstToken) return null;
  const word = firstToken.toLocaleLowerCase();
  if (!LATIN_WORD_PATTERN.test(word) || word.length > FINGERSPELL_MAX_LENGTH) return null;

  const letters = word.split('').map(letter => ({
    letter,
    available: FINGERSPELL_LETTERS.has(letter),
    src: FINGERSPELL_LETTERS.has(letter) ? `assets/datasets/fingerspelling/${letter}1.jpg` : null,
  }));
  if (!letters.some(entry => entry.available)) return null;

  return { kind: 'fingerspell', word, letters };
}

export function findSignLookups(message) {
  const normalized = message.toLocaleLowerCase();
  const exactMatches = window.SIGN_LIBRARY.filter(sign =>
    flattenAliases(sign.aliases).some(alias => normalized.includes(alias.toLocaleLowerCase()))
  ).map(sign => ({ ...sign, kind: 'match' }));
  const uniqueExact = exactMatches.filter((sign, index) =>
    exactMatches.findIndex(match => match.gloss === sign.gloss) === index
  );
  if (uniqueExact.length) return uniqueExact;

  const fuzzyMatches = findFuzzyMatches(normalized);
  if (fuzzyMatches.length) return fuzzyMatches;

  const fingerspell = findFingerspellEntry(message);
  if (fingerspell) return [fingerspell];

  const phrase = message.trim().split(/[\s,!.?;:]+/).slice(0, 4).join(' ');
  return phrase ? [{ kind: 'search', gloss: phrase, category: 'Search this phrase in the official dictionary', fallback: true }] : [];
}
