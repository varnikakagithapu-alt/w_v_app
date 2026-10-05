import { findSignLookups, getAliasForLanguage } from './sign-lookup.js';
import { createSignCard } from './sign-render.js';
import { clearSpeechInput, replaySpeechAudio, startListening } from './app.js';
import { addSample, getAllSamples, getCalibrationStatus } from './calibration-store.js';

const SAMPLES_PER_WORD = 5;

const practiceModeButton = document.querySelector('#practiceModeButton');
const practiceMode = document.querySelector('#practiceMode');
const practiceExitButton = document.querySelector('#practiceExitButton');
const hero = document.querySelector('#top');
const chat = document.querySelector('#chat');
const learningMode = document.querySelector('#learningMode');

const videoWrap = document.querySelector('#videoWrap');
const sharedCameraVideo = document.querySelector('#sharedCameraVideo');

const toggleU1 = document.querySelector('#toggleU1');
const toggleU2 = document.querySelector('#toggleU2');
const panelU1 = document.querySelector('#panelU1');
const panelU2 = document.querySelector('#panelU2');
const u1Status = document.querySelector('#u1Status');
const u2Status = document.querySelector('#u2Status');
const startCameraButton = document.querySelector('#startCameraButton');
const u1Suggestions = document.querySelector('#u1Suggestions');
const u1ManualWordSelect = document.querySelector('#u1ManualWordSelect');
const u1UseWordButton = document.querySelector('#u1UseWordButton');

const u2TextInput = document.querySelector('#u2TextInput');
const u2LanguageSelect = document.querySelector('#u2LanguageSelect');
const u2MicButton = document.querySelector('#u2MicButton');
const u2MicLabel = document.querySelector('#u2MicLabel');
const u2ReplayAudioButton = document.querySelector('#u2ReplayAudioButton');
const u2ClearTextButton = document.querySelector('#u2ClearTextButton');
const u2SendButton = document.querySelector('#u2SendButton');

const calibrateButton = document.querySelector('#calibrateButton');
const calibrationStatus = document.querySelector('#calibrationStatus');
const calibrationDialog = document.querySelector('#calibrationDialog');
const calibrationCloseButton = document.querySelector('#calibrationCloseButton');
const calibrationWordList = document.querySelector('#calibrationWordList');
const calibrationCapture = document.querySelector('#calibrationCapture');
const calibrationVideo = document.querySelector('#calibrationVideo');
const calibrationProgress = document.querySelector('#calibrationProgress');
const captureSampleButton = document.querySelector('#captureSampleButton');

const practiceTranscript = document.querySelector('#practiceTranscript');

let mediaStream = null;
let activePanel = 'u1';
let recognitionEnginePromise = null;
let stopDetectionLoop = null;
let samplesByGloss = new Map();
let currentCalibrationGloss = null;

function glossList() {
  return window.SIGN_LIBRARY.map(sign => sign.gloss);
}

function populateManualSelect() {
  u1ManualWordSelect.innerHTML = '<option value="">Select a word…</option>';
  for (const gloss of glossList()) {
    const option = document.createElement('option');
    option.value = gloss;
    option.textContent = gloss;
    u1ManualWordSelect.append(option);
  }
}

async function refreshCalibrationStatus() {
  const status = await getCalibrationStatus(glossList());
  const calibrated = status.filter(entry => entry.count > 0).length;
  calibrationStatus.textContent = `Calibrated: ${calibrated} / ${status.length} words`;
  return status;
}

async function loadSamplesByGloss() {
  const all = await getAllSamples();
  const map = new Map();
  for (const sample of all) {
    if (!map.has(sample.gloss)) map.set(sample.gloss, []);
    map.get(sample.gloss).push(sample.landmarks);
  }
  samplesByGloss = map;
  return map;
}

function ensureRecognitionEngine() {
  if (!recognitionEnginePromise) recognitionEnginePromise = import('./hand-recognition.js');
  return recognitionEnginePromise;
}

async function startCamera() {
  if (mediaStream) return mediaStream;
  mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
  sharedCameraVideo.srcObject = mediaStream;
  videoWrap.hidden = false;
  return mediaStream;
}

function stopCamera() {
  if (stopDetectionLoop) { stopDetectionLoop(); stopDetectionLoop = null; }
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  sharedCameraVideo.srcObject = null;
  videoWrap.hidden = true;
}

function renderSuggestions(candidates) {
  u1Suggestions.innerHTML = '';
  for (const { gloss } of candidates) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.textContent = `Did you mean ${gloss}?`;
    chip.addEventListener('click', () => {
      u1ManualWordSelect.value = gloss;
      u1Status.textContent = `Selected ${gloss} from suggestions. Press "Use this word" to confirm.`;
    });
    u1Suggestions.append(chip);
  }
}

async function startLiveRecognition() {
  await loadSamplesByGloss();
  if (!samplesByGloss.size) {
    u1Status.textContent = 'No calibrated words yet — record signs first, or use manual selection below.';
    return;
  }
  let engine;
  try {
    engine = await ensureRecognitionEngine();
  } catch (err) {
    u1Status.textContent = 'Hand recognition unavailable (could not load recognizer) — use manual word selection instead.';
    return;
  }

  const smoother = engine.createSmoother(gloss => {
    u1ManualWordSelect.value = gloss;
    u1Status.textContent = `Recognized: ${gloss}. Press "Use this word" to confirm, or pick a different one.`;
  });

  await engine.initHandLandmarker();
  u1Status.textContent = 'Recognizing… hold a sign steady.';
  stopDetectionLoop = engine.startDetectionLoop(sharedCameraVideo, normalized => {
    if (!normalized) {
      renderSuggestions([]);
      smoother(null);
      return;
    }
    const { candidates, best } = engine.matchAgainstSamples(normalized, samplesByGloss);
    renderSuggestions(candidates);
    smoother(best);
  });
}

async function setActivePanel(panel) {
  activePanel = panel;
  toggleU1.classList.toggle('is-active', panel === 'u1');
  toggleU1.setAttribute('aria-checked', String(panel === 'u1'));
  toggleU2.classList.toggle('is-active', panel === 'u2');
  toggleU2.setAttribute('aria-checked', String(panel === 'u2'));
  panelU1.classList.toggle('is-active', panel === 'u1');
  panelU2.classList.toggle('is-active', panel === 'u2');

  if (panel === 'u2') {
    stopCamera();
    u1Status.textContent = 'Camera off while U2 is active.';
    u2Status.textContent = 'Type or speak a reply in your language.';
    return;
  }

  u2Status.textContent = 'Waiting — switch back to U2 to reply.';
  try {
    await startCamera();
    u1Status.textContent = 'Camera on.';
    startLiveRecognition();
  } catch (err) {
    u1Status.textContent = 'Camera permission denied or unavailable — use manual word selection instead.';
  }
}

function appendPracticeTurn(role, node) {
  const msg = document.createElement('article');
  msg.className = role === 'u1' ? 'msg msg-user' : 'msg msg-assistant';
  msg.append(node);
  practiceTranscript.append(msg);
  requestAnimationFrame(() => {
    practiceTranscript.scrollTo({ top: practiceTranscript.scrollHeight, behavior: 'smooth' });
  });
}

function handleU1Word(gloss) {
  if (!gloss) {
    u1Status.textContent = 'Pick a recognized or manual word first.';
    return;
  }
  const langCode = u2LanguageSelect.value.split('-')[0];
  const alias = getAliasForLanguage(gloss, langCode) || gloss;

  const wrap = document.createElement('div');
  const label = document.createElement('p');
  label.className = 'msg-text';
  label.textContent = alias;
  const sub = document.createElement('p');
  sub.className = 'msg-note';
  sub.textContent = `U1 signed: ${gloss}`;
  wrap.append(label, sub);
  appendPracticeTurn('u1', wrap);

  u1Status.textContent = `Sent "${gloss}" to U2.`;
  u1ManualWordSelect.value = '';
  u1Suggestions.innerHTML = '';
}

function handleU2Reply() {
  if (u2MicButton.getAttribute('aria-pressed') === 'true') {
    u2MicButton.click();
    u2Status.textContent = 'Stopping the microphone. Press Send again when transcription is finished.';
    return;
  }

  const message = u2TextInput.value.trim();
  if (!message) {
    u2Status.textContent = 'Type or speak a reply first.';
    return;
  }
  const signLookups = findSignLookups(message);
  const cards = document.createElement('div');
  cards.className = 'msg-cards';
  cards.append(...signLookups.map(createSignCard));
  appendPracticeTurn('u2', cards);

  u2Status.textContent = `${signLookups.length} ISL ${signLookups.length === 1 ? 'lookup' : 'lookups'} shown to U1.`;
  u2TextInput.value = '';
}

// Calibration dialog

async function openCalibrationDialog() {
  calibrationWordList.innerHTML = '';
  const status = await refreshCalibrationStatus();
  for (const { gloss, count } of status) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = count > 0 ? `${gloss} ✓` : gloss;
    button.classList.toggle('is-calibrated', count > 0);
    button.addEventListener('click', () => selectCalibrationWord(gloss));
    calibrationWordList.append(button);
  }
  calibrationCapture.hidden = true;
  calibrationDialog.showModal();
}

async function selectCalibrationWord(gloss) {
  currentCalibrationGloss = gloss;
  calibrationCapture.hidden = false;
  const existing = await getAllSamples();
  const count = existing.filter(sample => sample.gloss === gloss).length;
  calibrationProgress.textContent = `Samples captured: ${Math.min(count, SAMPLES_PER_WORD)} / ${SAMPLES_PER_WORD}`;

  if (!mediaStream) {
    try {
      await startCamera();
    } catch (err) {
      calibrationProgress.textContent = 'Camera permission is required to record samples.';
      return;
    }
  }
  calibrationVideo.srcObject = mediaStream;
  await ensureRecognitionEngine().then(engine => engine.initHandLandmarker()).catch(() => {
    calibrationProgress.textContent = 'Hand recognition unavailable — cannot capture samples right now.';
  });
}

async function captureSample() {
  if (!currentCalibrationGloss) return;
  const engine = await ensureRecognitionEngine();
  const landmarks = engine.detectOnce(calibrationVideo, performance.now());
  if (!landmarks) {
    calibrationProgress.textContent = 'No hand detected — hold your sign in view and try again.';
    return;
  }
  const normalized = engine.normalizeLandmarks(landmarks);
  if (!normalized) {
    calibrationProgress.textContent = 'Could not read hand pose clearly — adjust your hand and try again.';
    return;
  }
  await addSample(currentCalibrationGloss, normalized);
  const existing = await getAllSamples();
  const count = existing.filter(sample => sample.gloss === currentCalibrationGloss).length;
  calibrationProgress.textContent = `Samples captured: ${Math.min(count, SAMPLES_PER_WORD)} / ${SAMPLES_PER_WORD}`;
}

function closeCalibrationDialog() {
  calibrationDialog.close();
  calibrationVideo.srcObject = null;
  currentCalibrationGloss = null;
  if (activePanel === 'u2') stopCamera();
  refreshCalibrationStatus();
}

// Wiring

practiceModeButton.addEventListener('click', () => {
  hero.hidden = true;
  chat.hidden = true;
  learningMode.hidden = true;
  practiceMode.hidden = false;
  populateManualSelect();
  refreshCalibrationStatus();
  practiceMode.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

practiceExitButton.addEventListener('click', () => {
  stopCamera();
  practiceMode.hidden = true;
  hero.hidden = false;
  chat.hidden = false;
});

toggleU1.addEventListener('click', () => setActivePanel('u1'));
toggleU2.addEventListener('click', () => setActivePanel('u2'));

startCameraButton.addEventListener('click', () => setActivePanel('u1'));

u1UseWordButton.addEventListener('click', () => handleU1Word(u1ManualWordSelect.value));

u2SendButton.addEventListener('click', handleU2Reply);
u2TextInput.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') handleU2Reply();
});
u2MicButton.addEventListener('click', () => startListening({
  input: u2TextInput,
  micButton: u2MicButton,
  micLabel: u2MicLabel,
  replayButton: u2ReplayAudioButton,
  languageSelect: u2LanguageSelect,
  statusEl: u2Status,
}));
u2ReplayAudioButton.addEventListener('click', () => replaySpeechAudio(u2TextInput, u2Status));
u2ClearTextButton.addEventListener('click', () => clearSpeechInput({
  input: u2TextInput,
  micButton: u2MicButton,
  micLabel: u2MicLabel,
  replayButton: u2ReplayAudioButton,
  statusEl: u2Status,
}));

calibrateButton.addEventListener('click', openCalibrationDialog);
calibrationCloseButton.addEventListener('click', closeCalibrationDialog);
captureSampleButton.addEventListener('click', captureSample);
