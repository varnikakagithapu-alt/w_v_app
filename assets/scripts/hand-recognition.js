/*
 * Camera + MediaPipe HandLandmarker wrapper for practice-mode sign
 * recognition. Loaded only via dynamic import() on first camera activation
 * — never part of the base app shell.
 *
 * This is a nearest-neighbor pose matcher, not a trained ISL classifier:
 * see docs/SIGN_RECOGNITION.md for what it can and cannot do.
 */
import { HandLandmarker, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21';

const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm';

const DETECT_INTERVAL_MS = 100; // ~10fps, enough for a static-pose matcher
export const MATCH_DISTANCE_THRESHOLD = 0.35; // empirical, needs real-world tuning
export const CONSECUTIVE_MATCH_FRAMES = 5;

let handLandmarker = null;

export async function initHandLandmarker() {
  if (handLandmarker) return handLandmarker;
  const vision = await FilesetResolver.forVisionTasks(WASM_URL);
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL },
    numHands: 1,
    runningMode: 'VIDEO',
  });
  return handLandmarker;
}

// Wrist-origin translation + wrist-to-middle-MCP scale normalization, so the
// result is invariant to hand size and camera distance. Returns null if the
// hand is too edge-on/occluded to get a stable scale reference.
export function normalizeLandmarks(landmarks) {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  const scale = Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y, (middleMcp.z ?? 0) - (wrist.z ?? 0));
  if (scale < 1e-4) return null;

  return landmarks.map(point => [
    (point.x - wrist.x) / scale,
    (point.y - wrist.y) / scale,
    ((point.z ?? 0) - (wrist.z ?? 0)) / scale,
  ]);
}

function distance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    sum += (a[i][0] - b[i][0]) ** 2 + (a[i][1] - b[i][1]) ** 2 + (a[i][2] - b[i][2]) ** 2;
  }
  return Math.sqrt(sum);
}

// samplesByGloss: Map<gloss, Array<normalized landmark array>>
// Returns { candidates: [{gloss, dist}, ...top3], best: {gloss, dist} | null }
export function matchAgainstSamples(normalized, samplesByGloss) {
  const scored = [];
  for (const [gloss, samples] of samplesByGloss) {
    let best = Infinity;
    for (const sample of samples) best = Math.min(best, distance(normalized, sample));
    if (Number.isFinite(best)) scored.push({ gloss, dist: best });
  }
  scored.sort((a, b) => a.dist - b.dist);
  const best = scored.length && scored[0].dist <= MATCH_DISTANCE_THRESHOLD ? scored[0] : null;
  return { candidates: scored.slice(0, 3), best };
}

export function detectOnce(video, timestampMs) {
  if (!handLandmarker) return null;
  const result = handLandmarker.detectForVideo(video, timestampMs);
  if (!result.landmarks || !result.landmarks.length) return null;
  return result.landmarks[0];
}

// Runs a detection loop against `video`, calling onFrame(normalizedLandmarks|null)
// roughly every DETECT_INTERVAL_MS. Returns a stop() function.
export function startDetectionLoop(video, onFrame) {
  let stopped = false;
  let lastRun = 0;

  function tick(timestampMs) {
    if (stopped) return;
    if (timestampMs - lastRun >= DETECT_INTERVAL_MS) {
      lastRun = timestampMs;
      const landmarks = detectOnce(video, timestampMs);
      onFrame(landmarks ? normalizeLandmarks(landmarks) : null);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  return () => { stopped = true; };
}

// Temporal smoothing: requires CONSECUTIVE_MATCH_FRAMES consecutive frames
// resolving to the same gloss before promoting to a confirmed recognition.
export function createSmoother(onConfirmed) {
  let lastGloss = null;
  let streak = 0;
  let confirmedGloss = null;

  return function feed(best) {
    const gloss = best ? best.gloss : null;
    if (gloss && gloss === lastGloss) {
      streak += 1;
    } else {
      lastGloss = gloss;
      streak = gloss ? 1 : 0;
    }
    if (gloss && streak >= CONSECUTIVE_MATCH_FRAMES && gloss !== confirmedGloss) {
      confirmedGloss = gloss;
      onConfirmed(gloss);
    }
    if (!gloss) confirmedGloss = null;
  };
}
