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

const LATIN_WORD_PATTERN = /^[a-z]+$/;

function findFuzzyMatches(normalized) {
  const tokens = normalized.split(/[\s,!.?;:]+/)
    .filter(token => LATIN_WORD_PATTERN.test(token) && token.length >= 3 && !LOOKUP_STOP_WORDS.has(token));
  if (!tokens.length) return [];

  const candidates = [];
  for (const sign of window.SIGN_LIBRARY) {
    let best = null;
    for (const alias of flattenAliases(sign.aliases)) {
      if (!LATIN_WORD_PATTERN.test(alias)) continue;
      for (const token of tokens) {
        if (Math.abs(token.length - alias.length) > 1) continue;
        const distance = levenshteinDistance(token, alias);
        if (distance <= 1 && (!best || distance < best.distance)) {
          best = { distance, matchedWord: token };
        }
      }
    }
    if (best) candidates.push({ ...sign, kind: 'fuzzy', matchedWord: best.matchedWord, distance: best.distance });
  }

  candidates.sort((a, b) => a.distance - b.distance);
  const closest = candidates.filter(sign => sign.distance === candidates[0].distance);
  if (closest.length > 1) return [];

  return closest.filter((sign, index) =>
    candidates.findIndex(match => match.gloss === sign.gloss) === index
  );
}

const FINGERSPELL_LETTERS = new Set('abcdefghijklmnopqrstuvwxyz'.split(''));
const FINGERSPELL_MAX_LENGTH = 14;

function findFingerspellEntry(message) {
  const tokens = message.trim().split(/[\s,!.?;:]+/).filter(Boolean);
  if (tokens.length !== 1) return null;
  const [word] = tokens.map(token => token.toLocaleLowerCase());
  if (!LATIN_WORD_PATTERN.test(word) || word.length > FINGERSPELL_MAX_LENGTH) return null;

  const letters = word.split('').map(letter => ({
    letter,
    available: FINGERSPELL_LETTERS.has(letter),
    src: FINGERSPELL_LETTERS.has(letter) ? `assets/datasets/fingerspelling/${letter}1.jpg` : null,
  }));
  if (!letters.some(entry => entry.available)) return null;

  return { kind: 'fingerspell', word, letters };
}

const LOOKUP_STOP_WORDS = new Set([
  'a', 'am', 'an', 'are', 'be', 'can', 'could', 'did', 'do', 'does', 'for',
  'have', 'has', 'i', 'in', 'is', 'it', 'me', 'my', 'need', 'of', 'the',
  'to', 'was', 'were', 'where', 'will', 'would', 'you', 'your',
]);

function tokenize(text) {
  return [...text.matchAll(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)]
    .map(match => match[0].toLocaleLowerCase().replaceAll('’', "'"));
}

function findExactMatches(message) {
  const words = tokenize(message);
  const candidates = [];

  for (const sign of window.SIGN_LIBRARY) {
    for (const alias of flattenAliases(sign.aliases)) {
      const aliasWords = tokenize(alias);
      if (!aliasWords.length) continue;

      for (let start = 0; start <= words.length - aliasWords.length; start += 1) {
        if (aliasWords.every((word, offset) => word === words[start + offset])) {
          candidates.push({ sign, start, end: start + aliasWords.length });
        }
      }
    }
  }

  candidates.sort((a, b) => a.start - b.start || b.end - a.end);
  const coveredWords = new Set();
  const matchedSigns = new Map();

  for (const candidate of candidates) {
    let overlaps = false;
    for (let index = candidate.start; index < candidate.end; index += 1) {
      if (coveredWords.has(index)) overlaps = true;
    }
    if (overlaps) continue;

    for (let index = candidate.start; index < candidate.end; index += 1) {
      coveredWords.add(index);
    }
    if (!matchedSigns.has(candidate.sign.gloss)) {
      matchedSigns.set(candidate.sign.gloss, { ...candidate.sign, kind: 'match' });
    }
  }

  const unmatchedGroups = [];
  let currentGroup = [];
  let previousIndex = -2;

  const flushGroup = () => {
    if (currentGroup.length) unmatchedGroups.push(currentGroup.join(' '));
    currentGroup = [];
    previousIndex = -2;
  };

  words.forEach((word, index) => {
    if (coveredWords.has(index) || LOOKUP_STOP_WORDS.has(word)) {
      flushGroup();
      return;
    }
    if (index !== previousIndex + 1) flushGroup();
    currentGroup.push(word);
    previousIndex = index;
  });
  flushGroup();

  return {
    matches: [...matchedSigns.values()],
    unmatchedGroups,
  };
}

function dictionarySearch(phrase) {
  return {
    kind: 'search',
    gloss: phrase,
    category: 'Search this phrase in the official dictionary',
    fallback: true,
  };
}

export function findSignLookups(message) {
  const { matches, unmatchedGroups } = findExactMatches(message);
  if (matches.length) {
    return [
      ...matches,
      ...unmatchedGroups.map(dictionarySearch),
    ];
  }

  const normalized = message.toLocaleLowerCase();

  const fuzzyMatches = tokenize(message).length === 1 ? findFuzzyMatches(normalized) : [];
  if (fuzzyMatches.length) return fuzzyMatches;

  const fingerspell = findFingerspellEntry(message);
  if (fingerspell) return [fingerspell];

  const phrase = message.trim();
  return phrase ? [dictionarySearch(phrase)] : [];
}

export function findSituationPhraseLookups(message) {
  const lookups = findSignLookups(message);
  if (lookups.some(sign => sign.kind === 'match')) return lookups;

  const phrase = message.trim();
  return phrase
    ? [{ kind: 'search', gloss: phrase, category: 'Search this phrase in the official dictionary', fallback: true }]
    : [];
}
