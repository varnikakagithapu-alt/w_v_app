import { findSignLookups } from './sign-lookup.js';
import { createSignCard } from './sign-render.js';

const textInput = document.querySelector('#textInput');
const languageSelect = document.querySelector('#languageSelect');
const inputStatus = document.querySelector('#inputStatus');
const wordCount = document.querySelector('#wordCount');
const micButton = document.querySelector('#micButton');
const micLabel = document.querySelector('#micLabel');
const transcript = document.querySelector('#transcript');
const greetingClone = document.querySelector('#greetingMsg').cloneNode(true);

function updateCount() {
  wordCount.textContent = `${textInput.value.length} / 280`;
}

function scrollTranscriptToEnd() {
  requestAnimationFrame(() => {
    transcript.scrollTo({ top: transcript.scrollHeight, behavior: 'smooth' });
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
  const disclaimer = document.createElement('p');
  disclaimer.className = 'msg-disclaimer';
  const disclaimerIcon = document.createElement('span');
  disclaimerIcon.setAttribute('aria-hidden', 'true');
  disclaimerIcon.textContent = 'i';
  const disclaimerText = document.createElement('span');
  disclaimerText.textContent = 'ISL has its own grammar. These are database lookups, not a word-for-word signed translation. Verify regional variants with the official source.';
  disclaimer.append(disclaimerIcon, disclaimerText);
  assistantMsg.append(cards, disclaimer);

  transcript.append(userMsg, assistantMsg);
  scrollTranscriptToEnd();
}

function showSigns() {
  const message = textInput.value.trim();
  if (!message) {
    inputStatus.textContent = 'Type or speak a message first.';
    textInput.focus();
    return;
  }

  const signLookups = findSignLookups(message);
  appendTurn(message, signLookups);
  inputStatus.textContent = `${signLookups.length} ISL ${signLookups.length === 1 ? 'lookup' : 'lookups'} ready. Open a card to view the source sign video.`;
  textInput.value = '';
  updateCount();
  textInput.focus();
}

export function startListening({ input, micButton, micLabel, languageSelect, statusEl }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    statusEl.textContent = 'Speech recognition is not available in this browser. Please type your message.';
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = languageSelect.value;
  recognition.interimResults = true;
  recognition.continuous = false;
  let finalText = '';

  recognition.onstart = () => {
    micButton.classList.add('is-listening');
    micButton.setAttribute('aria-pressed', 'true');
    micLabel.textContent = 'Listening…';
    statusEl.textContent = 'Listening. Speak clearly, then review the text.';
  };
  recognition.onresult = event => {
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      if (event.results[index].isFinal) finalText += `${event.results[index][0].transcript} `;
    }
    input.value = (finalText || event.results[event.results.length - 1][0].transcript).trim();
    input.dispatchEvent(new Event('input'));
  };
  recognition.onerror = event => {
    statusEl.textContent = `Speech recognition could not start (${event.error}). You can type your message instead.`;
  };
  recognition.onend = () => {
    micButton.classList.remove('is-listening');
    micButton.setAttribute('aria-pressed', 'false');
    micLabel.textContent = 'Speak';
    if (input.value.trim()) statusEl.textContent = 'Speech captured. Review the text, then choose “Send”.';
  };
  recognition.start();
}

function clearResults() {
  if (transcript.children.length > 1 && !window.confirm('Clear this conversation? This cannot be undone.')) return;
  transcript.replaceChildren(greetingClone.cloneNode(true));
  textInput.value = '';
  updateCount();
  inputStatus.textContent = 'You can edit speech recognition before looking up signs.';
  textInput.focus();
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
  languageSelect,
  statusEl: inputStatus,
}));
document.querySelectorAll('[data-phrase]').forEach(button => {
  button.addEventListener('click', () => {
    textInput.value = button.dataset.phrase;
    updateCount();
    showSigns();
  });
});

updateCount();
registerServiceWorker();
