/*
 * IndexedDB wrapper for practice-mode calibration samples: normalized hand
 * landmark snapshots the user records for each curated dictionary word.
 * Local to this browser/device only — never synced or uploaded.
 */
const DB_NAME = 'signbridge-calibration';
const DB_VERSION = 1;
const STORE_NAME = 'samples';

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('gloss', 'gloss', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

export async function addSample(gloss, landmarks) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add({ gloss, landmarks, capturedAt: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSamples(gloss) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).index('gloss').getAll(gloss);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearSamples(gloss) {
  const db = await openDb();
  const samples = await getSamples(gloss);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    samples.forEach(sample => store.delete(sample.id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllSamples() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getCalibrationStatus(glosses) {
  const all = await getAllSamples();
  const counts = new Map();
  for (const sample of all) counts.set(sample.gloss, (counts.get(sample.gloss) || 0) + 1);
  return glosses.map(gloss => ({ gloss, count: counts.get(gloss) || 0 }));
}
