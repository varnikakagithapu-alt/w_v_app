import { officialSearch } from './sign-lookup.js';
import { createSignCard } from './sign-render.js';

const CATEGORIES = [
  { name: 'Alphabet', words: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') },
  { name: 'Numbers', words: ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'TEN', 'HUNDRED'] },
  { name: 'Greetings', words: ['HELLO', 'GOOD-MORNING', 'GOOD-NIGHT', 'PLEASE', 'THANK-YOU', 'SORRY'] },
  { name: 'Family', words: ['FAMILY', 'MOTHER', 'FATHER', 'SISTER', 'BROTHER', 'CHILD'] },
  { name: 'Education', words: ['SCHOOL', 'TEACHER', 'STUDENT', 'BOOK', 'LEARN', 'EXAM'] },
  { name: 'Emergency', words: ['HELP', 'DOCTOR', 'POLICE', 'HOSPITAL', 'EMERGENCY', 'FIRE'] },
  { name: 'Food', words: ['WATER', 'FOOD', 'EAT', 'RICE', 'MILK', 'FRUIT'] },
  { name: 'Places', words: ['HOME', 'SCHOOL', 'HOSPITAL', 'MARKET', 'HERE', 'THERE'] },
  { name: 'Common conversations', words: ['HELLO', 'NAME', 'YES', 'NO', 'PLEASE', 'THANK-YOU', 'WAIT', 'HELP'] },
];

const learningMode = document.querySelector('#learningMode');
const categoriesElement = document.querySelector('#learningCategories');
const categoryLabel = document.querySelector('#learningCategoryLabel');
const progress = document.querySelector('#learningProgress');
const wordHeading = document.querySelector('#learningWord');
const prompt = document.querySelector('#learningPrompt');
const signContainer = document.querySelector('#learningSign');
const watchButton = document.querySelector('#watchSignButton');
const practiceButton = document.querySelector('#practiceWordButton');
const nextButton = document.querySelector('#nextWordButton');
let selectedCategory = CATEGORIES[0];
let wordIndex = 0;
let practicing = false;

function selectedWord() {
  return selectedCategory.words[wordIndex];
}

function signForWord(word) {
  if (selectedCategory.name === 'Alphabet') {
    return {
      kind: 'fingerspell',
      word,
      letters: [{
        letter: word.toLowerCase(),
        available: true,
        src: `assets/datasets/fingerspelling/${word.toLowerCase()}1.jpg`,
      }],
    };
  }

  return window.SIGN_LIBRARY.find(sign => sign.gloss === word) || {
    kind: 'match',
    gloss: word,
    category: selectedCategory.name,
  };
}

function setPracticeMode(enabled) {
  practicing = enabled;
  signContainer.replaceChildren();
  if (enabled) {
    wordHeading.textContent = 'Your turn';
    prompt.textContent = 'Try signing the word from memory. When you’re ready, reveal it to check.';
    watchButton.hidden = true;
    practiceButton.textContent = 'Reveal word and sign';
  } else {
    wordHeading.textContent = selectedWord();
    prompt.textContent = selectedCategory.name === 'Alphabet'
      ? 'ISL fingerspelling handshape'
      : 'Explore this sign, then try it yourself.';
    watchButton.textContent = selectedCategory.name === 'Alphabet' ? 'View handshape' : '▶ Watch sign';
    watchButton.hidden = false;
    practiceButton.textContent = 'Practice';
  }
}

function renderLesson() {
  categoryLabel.textContent = selectedCategory.name;
  progress.textContent = `${wordIndex + 1} of ${selectedCategory.words.length}`;
  setPracticeMode(false);
  nextButton.disabled = selectedCategory.words.length < 2;
}

function renderCategories() {
  categoriesElement.replaceChildren();
  for (const category of CATEGORIES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'learning-category';
    button.setAttribute('aria-pressed', String(category === selectedCategory));

    const name = document.createElement('span');
    name.textContent = category.name;
    const count = document.createElement('span');
    count.className = 'learning-category-count';
    count.textContent = `${category.words.length} ${category.name === 'Alphabet' ? 'letters' : 'words'}`;
    button.append(name, count);
    button.addEventListener('click', () => {
      selectedCategory = category;
      wordIndex = 0;
      renderCategories();
      renderLesson();
    });
    categoriesElement.append(button);
  }
}

document.querySelector('#learnModeButton').addEventListener('click', () => {
  document.querySelector('#top').hidden = true;
  document.querySelector('#chat').hidden = true;
  document.querySelector('#practiceMode').hidden = true;
  learningMode.hidden = false;
  renderCategories();
  renderLesson();
  learningMode.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.querySelector('#learningExitButton').addEventListener('click', () => {
  learningMode.hidden = true;
  document.querySelector('#top').hidden = false;
  document.querySelector('#chat').hidden = false;
});

watchButton.addEventListener('click', () => {
  signContainer.replaceChildren(createSignCard(signForWord(selectedWord()), 0));
  prompt.textContent = selectedCategory.name === 'Alphabet'
    ? 'A community-sourced fingerspelling handshape reference. Check regional variations with an ISL teacher.'
    : 'Video preview or official dictionary lookup for this word.';
});

practiceButton.addEventListener('click', () => {
  if (practicing) {
    setPracticeMode(false);
    watchButton.click();
    return;
  }
  setPracticeMode(true);
});

nextButton.addEventListener('click', () => {
  wordIndex = (wordIndex + 1) % selectedCategory.words.length;
  renderLesson();
});

renderCategories();
renderLesson();
