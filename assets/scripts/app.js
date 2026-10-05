import { findSignLookups, findSituationPhraseLookups } from './sign-lookup.js';
import { createSignCard } from './sign-render.js';

const textInput = document.querySelector('#textInput');
const languageSelect = document.querySelector('#languageSelect');
const inputStatus = document.querySelector('#inputStatus');
const wordCount = document.querySelector('#wordCount');
const micButton = document.querySelector('#micButton');
const micLabel = document.querySelector('#micLabel');
const replayAudioButton = document.querySelector('#replayAudioButton');
const clearTextButton = document.querySelector('#clearTextButton');
const transcript = document.querySelector('#transcript');
const greetingClone = document.querySelector('#greetingMsg').cloneNode(true);
const phraseSuggestions = document.querySelector('#phraseSuggestions');
const wordSuggestions = document.querySelector('#wordSuggestions');
const listeningSessions = new WeakMap();

function updateCount() {
  wordCount.textContent = `${textInput.value.length} / 280`;
}

function scrollResultsIntoView(target) {
  requestAnimationFrame(() => {
    target.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
}

function appendTurn(message, signLookups) {
  const userMsg = document.createElement('article');
  userMsg.className = 'msg msg-user';
  const userText = document.createElement('p');
  userText.className = 'msg-text';
  userText.textContent = message;
  userMsg.append(userText);

  const assistantMsg = document.createElement('article');
  assistantMsg.className = 'msg msg-assistant';
  const cards = document.createElement('div');
  cards.className = 'msg-cards';
  cards.append(...signLookups.map(createSignCard));
  const resultsNote = document.createElement('p');
  resultsNote.className = 'msg-note msg-results-note';
  const curatedLookups = signLookups.filter(sign => sign.kind === 'match' || sign.kind === 'fuzzy');
  const dictionaryLookups = signLookups.filter(sign => sign.fallback);
  if (curatedLookups.length && dictionaryLookups.length) {
    resultsNote.textContent = `Matched signs: ${curatedLookups.map(sign => sign.gloss).join(', ')}. Search the dictionary for: ${dictionaryLookups.map(sign => sign.gloss).join(', ')}.`;
  } else if (signLookups.length > 1) {
    resultsNote.textContent = `Results: ${signLookups.map(sign => sign.gloss).join(', ')}. View each card for its sign video, fingerspelling, or dictionary search.`;
  } else if (signLookups[0].fallback) {
    resultsNote.textContent = `No curated sign match for "${signLookups[0].gloss}". Search the official dictionary using the link below.`;
  } else {
    resultsNote.textContent = `Showing sign lookup for ${signLookups[0].gloss}.`;
  }
  const disclaimer = document.createElement('p');
  disclaimer.className = 'msg-disclaimer';
  const disclaimerIcon = document.createElement('span');
  disclaimerIcon.setAttribute('aria-hidden', 'true');
  disclaimerIcon.textContent = 'i';
  const disclaimerText = document.createElement('span');
  disclaimerText.textContent = 'ISL has its own grammar. These are database lookups, not a word-for-word signed translation. Verify regional variants with the official source.';
  disclaimer.append(disclaimerIcon, disclaimerText);
  assistantMsg.append(resultsNote, cards, disclaimer);

  transcript.append(userMsg, assistantMsg);
  document.querySelector('.chat').classList.add('has-results');
  scrollResultsIntoView(resultsNote);
}

function showSigns(useSituationPhraseLookup = false) {
  if (listeningSessions.get(textInput)?.active) {
    micButton.click();
    inputStatus.textContent = 'Stopping the microphone. Press Send again when transcription is finished.';
    return;
  }

  const message = textInput.value.trim();
  if (!message) {
    inputStatus.textContent = 'Type or speak a message first.';
    textInput.focus();
    return;
  }

  const signLookups = useSituationPhraseLookup
    ? findSituationPhraseLookups(message)
    : findSignLookups(message);
  appendTurn(message, signLookups);
  const matchedWords = signLookups.map(sign => sign.gloss).join(', ');
  const curatedLookups = signLookups.filter(sign => sign.kind === 'match' || sign.kind === 'fuzzy');
  const dictionaryLookups = signLookups.filter(sign => sign.fallback);
  if (curatedLookups.length && dictionaryLookups.length) {
    inputStatus.textContent = `Sign videos ready: ${curatedLookups.map(sign => sign.gloss).join(', ')}. Dictionary searches ready: ${dictionaryLookups.map(sign => sign.gloss).join(', ')}.`;
  } else if (dictionaryLookups.length) {
    inputStatus.textContent = `No curated sign match for "${matchedWords}". Open the result link to search the official dictionary.`;
  } else {
    inputStatus.textContent = `${signLookups.length} ISL ${signLookups.length === 1 ? 'result' : 'results'} ready: ${matchedWords}. Review the result card for its sign video or fingerspelling.`;
  }
  textInput.value = '';
  updateCount();
  textInput.focus();
}

function populateWordSuggestions() {
  const fragment = document.createDocumentFragment();
  for (const sign of window.SIGN_LIBRARY) {
    if (!sign.driveVideoId || !sign.aliases.en?.length) continue;
    const word = sign.aliases.en[0];
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.phrase = word;
    button.textContent = word;
    fragment.append(button);
    if (fragment.childElementCount === 4) break;
  }
  wordSuggestions.replaceChildren(fragment);
}

function handleSuggestionClick(event, isSituationPhrase = false) {
  const button = event.target.closest('button[data-phrase]');
  if (!button) return;
  textInput.value = button.dataset.phrase;
  updateCount();
  showSigns(isSituationPhrase);
}

function releaseRecordedAudio(session) {
  session.audio.pause();
  session.audio.removeAttribute('src');
  session.audio.load();
  if (session.audioUrl) URL.revokeObjectURL(session.audioUrl);
  session.audioUrl = null;
  session.chunks = [];
}

function stopAudioRecording(session) {
  if (session.recorder && session.recorder.state !== 'inactive') {
    session.recorder.stop();
  } else if (session.stream) {
    session.stream.getTracks().forEach(track => track.stop());
    session.stream = null;
  }
}

function finishListening(session) {
  if (!session.active) return;
  session.active = false;
  session.input.removeEventListener('input', session.onManualEdit);
  session.micButton.classList.remove('is-listening');
  session.micButton.setAttribute('aria-pressed', 'false');
  session.micLabel.textContent = 'Start microphone';
  stopAudioRecording(session);
  if (session.suppressStatus) return;

  if (session.error === 'no-speech') {
    session.statusEl.textContent = 'No speech was detected. Try again and speak clearly.';
  } else if (session.error === 'not-allowed' || session.error === 'service-not-allowed') {
    session.statusEl.textContent = 'Microphone permission was denied. Allow microphone access in your browser settings, or type your message.';
  } else if (session.error) {
    session.statusEl.textContent = `Speech recognition stopped (${session.error}). You can edit the text or type a message.`;
  } else if (session.input.value.trim()) {
    session.statusEl.textContent = session.audioError
      ? `Speech captured. Review or edit the text; audio replay is unavailable (${session.audioError}).`
      : 'Speech captured. Review or edit the text. Your audio replay is being finalized.';
  } else {
    session.statusEl.textContent = 'Microphone stopped. No speech was recognized.';
  }
}

export function clearSpeechInput({ input, micButton, micLabel, replayButton, statusEl }) {
  const session = listeningSessions.get(input);
  if (session) {
    session.suppressStatus = true;
    if (session.active) {
      session.active = false;
      session.input.removeEventListener('input', session.onManualEdit);
      session.recognition.abort();
      session.micButton.classList.remove('is-listening');
      session.micButton.setAttribute('aria-pressed', 'false');
      session.micLabel.textContent = 'Start microphone';
    }
    stopAudioRecording(session);
    releaseRecordedAudio(session);
    listeningSessions.delete(input);
  }
  replayButton.disabled = true;
  input.value = '';
  input.dispatchEvent(new Event('input'));
  statusEl.textContent = 'Text and audio recording cleared.';
  input.focus();
}

export function replaySpeechAudio(input, statusEl) {
  const session = listeningSessions.get(input);
  if (!session?.audioUrl) return;
  session.audio.currentTime = 0;
  session.audio.play().catch(error => {
    statusEl.textContent = `Could not replay the audio (${error.message}).`;
  });
}

export function startListening({ input, micButton, micLabel, replayButton, languageSelect, statusEl }) {
  const currentSession = listeningSessions.get(input);
  if (currentSession?.active) {
    micButton.disabled = true;
    micLabel.textContent = 'Stopping…';
    try {
      currentSession.recognition.stop();
    } catch (error) {
      micButton.disabled = false;
      micLabel.textContent = 'Stop microphone';
      statusEl.textContent = `Could not stop the microphone (${error.message}).`;
    }
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    statusEl.textContent = 'Live speech recognition is not available in this browser. Please type your message.';
    return;
  }

  const previousSession = listeningSessions.get(input);
  if (previousSession) releaseRecordedAudio(previousSession);
  replayButton.disabled = true;

  const recognition = new SpeechRecognition();
  recognition.lang = languageSelect.value;
  recognition.interimResults = true;
  recognition.continuous = true;

  const session = {
    recognition,
    input,
    micButton,
    micLabel,
    replayButton,
    statusEl,
    active: true,
    error: '',
    finalText: input.value.trim(),
    interimText: '',
    updatingInput: false,
    suppressStatus: false,
    recorder: null,
    stream: null,
    chunks: [],
    audioUrl: null,
    audio: new Audio(),
  };
  session.onManualEdit = () => {
    if (session.updatingInput) return;
    session.finalText = input.value.trim();
    session.interimText = '';
  };
  input.addEventListener('input', session.onManualEdit);
  listeningSessions.set(input, session);

  function renderTranscript() {
    const combined = [session.finalText, session.interimText].filter(Boolean).join(' ').trim();
    session.finalText = session.finalText.slice(0, input.maxLength);
    session.updatingInput = true;
    input.value = combined.slice(0, input.maxLength);
    input.dispatchEvent(new Event('input'));
    session.updatingInput = false;
  }

  recognition.onstart = () => {
    micButton.classList.add('is-listening');
    micButton.setAttribute('aria-pressed', 'true');
    micButton.disabled = false;
    micLabel.textContent = 'Stop microphone';
    statusEl.textContent = 'Listening… Your words will appear here as you speak.';
  };
  recognition.onresult = event => {
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const recognized = event.results[index][0].transcript.trim();
      if (!recognized) continue;
      if (event.results[index].isFinal) {
        session.finalText = [session.finalText, recognized].filter(Boolean).join(' ').trim();
        session.interimText = '';
      } else {
        session.interimText = recognized;
      }
    }
    renderTranscript();
    statusEl.textContent = input.value
      ? `Listening… ${input.value}`
      : 'Listening… Your words will appear here as you speak.';
  };
  recognition.onerror = event => {
    session.error = event.error;
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      statusEl.textContent = 'Microphone permission was denied. Allow microphone access in your browser settings, or type your message.';
    } else if (event.error === 'no-speech') {
      statusEl.textContent = 'No speech was detected. Try again and speak clearly.';
    } else {
      statusEl.textContent = `Speech recognition encountered a problem (${event.error}). You can type your message instead.`;
    }
  };
  recognition.onend = () => {
    micButton.disabled = false;
    finishListening(session);
  };
  try {
    recognition.start();
  } catch (error) {
    session.error = error.message;
    finishListening(session);
    statusEl.textContent = `Could not start speech recognition (${error.message}). Check microphone permission, then try again.`;
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    session.audioError = 'audio recording is not supported in this browser';
    statusEl.textContent = 'Live transcription is active. Audio replay is not supported in this browser.';
    return;
  }

  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    if (!session.active) {
      stream.getTracks().forEach(track => track.stop());
      return;
    }
    session.stream = stream;
    try {
      session.recorder = new MediaRecorder(stream);
      session.recorder.addEventListener('dataavailable', event => {
        if (event.data.size) session.chunks.push(event.data);
      });
      session.recorder.addEventListener('stop', () => {
        stream.getTracks().forEach(track => track.stop());
        session.stream = null;
        if (session.suppressStatus) return;
        if (!session.chunks.length) {
          session.audioError = 'no audio data was recorded';
          if (!session.active && session.input.value.trim()) {
            statusEl.textContent = `Speech captured. Review or edit the text; audio replay is unavailable (${session.audioError}).`;
          }
          return;
        }
        const recording = new Blob(session.chunks, { type: session.recorder.mimeType });
        session.audioUrl = URL.createObjectURL(recording);
        session.audio.src = session.audioUrl;
        replayButton.disabled = false;
        if (!session.active && session.input.value.trim()) {
          statusEl.textContent = 'Speech captured. Review or edit the text, replay your recording, then choose “Send”.';
        }
      });
      session.recorder.start();
    } catch (error) {
      stream.getTracks().forEach(track => track.stop());
      session.stream = null;
      session.audioError = error.message;
      statusEl.textContent = `Live transcription is active, but audio replay could not start (${error.message}).`;
    }
  }).catch(error => {
    session.audioError = error.message;
    if (session.active) {
      statusEl.textContent = `Live transcription is active, but microphone audio could not be recorded for replay (${error.message}).`;
    } else if (!session.suppressStatus && session.input.value.trim()) {
      statusEl.textContent = `Speech captured. Review or edit the text; audio replay is unavailable (${error.message}).`;
    }
  });
}

function clearResults() {
  if (transcript.children.length > 1 && !window.confirm('Clear this conversation? This cannot be undone.')) return;
  clearSpeechInput({
    input: textInput,
    micButton,
    micLabel,
    replayButton: replayAudioButton,
    statusEl: inputStatus,
  });
  transcript.replaceChildren(greetingClone.cloneNode(true));
  document.querySelector('.chat').classList.remove('has-results');
  inputStatus.textContent = 'Conversation, message, and audio recording cleared.';
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
}

textInput.addEventListener('input', updateCount);
textInput.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') showSigns();
});
document.querySelector('#showButton').addEventListener('click', showSigns);
document.querySelector('#clearButton').addEventListener('click', clearResults);
micButton.addEventListener('click', () => startListening({
  input: textInput,
  micButton,
  micLabel,
  replayButton: replayAudioButton,
  languageSelect,
  statusEl: inputStatus,
}));
replayAudioButton.addEventListener('click', () => replaySpeechAudio(textInput, inputStatus));
clearTextButton.addEventListener('click', () => clearSpeechInput({
  input: textInput,
  micButton,
  micLabel,
  replayButton: replayAudioButton,
  statusEl: inputStatus,
}));
phraseSuggestions.addEventListener('click', event => handleSuggestionClick(event, true));
wordSuggestions.addEventListener('click', handleSuggestionClick);

populateWordSuggestions();
updateCount();
registerServiceWorker();
