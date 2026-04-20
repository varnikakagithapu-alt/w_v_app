// ═══════════════════════════════════════════════
// THREE.JS AVATAR SETUP
// ═══════════════════════════════════════════════

var threeScene    = null;
var threeCamera   = null;
var threeRenderer = null;
var mixer         = null;
var clock         = new THREE.Clock();
var clips         = {};
var actions       = {};
var currentAction = null;
var avatarReady   = false;

// Word → animation filename mapping
// Add more words here as you add more .glb files
var gestureMap = {
  'hello':     'hello',
  'hi':        'hello',
  'thanks':    'thanks',
  'thank':     'thanks',
  'thank you': 'thanks',
  'yes':       'yes',
  'no':        'no',
  'please':    'please',
  'sorry':     'sorry',
  'help':      'help',
  'good':      'good',
  'bad':       'bad',
  'name':      'name',
  'you':       'you',
  'me':        'me',
  'i':         'me'
};

function initThreeJS() {
  var container = document.getElementById('avatar-container');
  if (!container) return;

  // Scene
  threeScene = new THREE.Scene();
  threeScene.background = new THREE.Color(0x1a1a2e);

  // Camera
  threeCamera = new THREE.PerspectiveCamera(
    60,
    container.offsetWidth / container.offsetHeight,
    0.1,
    100
  );

  threeCamera.position.set(0, 1.5, 3.5);

  // Renderer — injected into avatar-container div
  threeRenderer = new THREE.WebGLRenderer({ antialias: true });
  threeRenderer.setSize(container.offsetWidth, container.offsetHeight);
  threeRenderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(threeRenderer.domElement);

  // Lighting
  var hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  threeScene.add(hemi);

  var dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(1, 2, 3);
  threeScene.add(dirLight);

  // Load avatar
  var loader = new THREE.GLTFLoader();

  setAvatarStatus('Loading avatar...');

  loader.load(
    'avatar.glb',
    function(gltf) {
      var avatar = gltf.scene;
      threeScene.add(avatar);
      avatar.position.set(0, -1, 0);

      // Create mixer
      mixer = new THREE.AnimationMixer(avatar);

      // Register any animations already embedded in avatar.glb
      gltf.animations.forEach(function(clip) {
        clips[clip.name]   = clip;
        actions[clip.name] = mixer.clipAction(clip);
      });

      setAvatarStatus('Avatar ready! Loading gestures...');
      avatarReady = true;

      // Load gesture animations
      // Make sure these files exist in your animations/ folder
      loadGestureClip('animations/idle.glb',   'idle',   true);
      loadGestureClip('animations/hello.glb',  'hello',  false);
      loadGestureClip('animations/thanks.glb', 'thanks', false);
      loadGestureClip('animations/yes.glb',    'yes',    false);
      loadGestureClip('animations/no.glb',     'no',     false);
    },
    function(xhr) {
      var pct = Math.round(xhr.loaded / xhr.total * 100);
      setAvatarStatus('Loading avatar: ' + pct + '%');
    },
    function(err) {
      console.error('Avatar load error:', err);
      setAvatarStatus('⚠️ avatar.glb not found. Add it to project root.');
    }
  );

  // Render loop
  function renderLoop() {
    requestAnimationFrame(renderLoop);
    var delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    if (threeRenderer && threeScene && threeCamera) {
      threeRenderer.render(threeScene, threeCamera);
    }
  }
  renderLoop();
}

function loadGestureClip(url, name, isDefault) {
  var loader = new THREE.GLTFLoader();
  loader.load(
    url,
    function(gltf) {
      if (!gltf.animations.length) return;
      var clip  = gltf.animations[0];
      clip.name = name;
      clips[name]   = clip;
      actions[name] = mixer.clipAction(clip);
      console.log('Loaded gesture:', name);

      if (isDefault) {
        playAnimation('idle');
        setAvatarStatus('Ready! Type a word and click Translate.');
      }
    },
    null,
    function() {
      console.warn('Missing animation file:', url);
      if (isDefault) {
        setAvatarStatus('Ready (add .glb files to animations/ folder)');
      }
    }
  );
}

function playAnimation(name, fadeDuration) {
  if (fadeDuration === undefined) fadeDuration = 0.4;
  if (!actions[name]) return;

  var next = actions[name];
  if (currentAction === next) return;

  if (currentAction) {
    next.reset();
    next.play();
    currentAction.crossFadeTo(next, fadeDuration, true);
  } else {
    next.reset().play();
  }

  currentAction = next;
}

// Signs one word, calls onDone when finished
function signWord(word, onDone) {
  var clipName = gestureMap[word.toLowerCase().trim()];

  if (!clipName || !actions[clipName]) {
    // No gesture for this word — just wait briefly and move on
    setTimeout(onDone, 400);
    return;
  }

  var action = actions[clipName];
  action.setLoop(THREE.LoopOnce, 1);
  action.clampWhenFinished = true;

  playAnimation(clipName, 0.25);

  function onFinished(e) {
    if (e.action === action) {
      mixer.removeEventListener('finished', onFinished);
      playAnimation('idle', 0.35);
      setTimeout(onDone, 350);
    }
  }
  mixer.addEventListener('finished', onFinished);
}

// Signs all words in a sentence, one after another
function signSentence(text) {
  if (!avatarReady || !mixer) {
    console.warn('Avatar not ready yet');
    return;
  }

  var words = text.toLowerCase().trim().split(/\s+/);
  var index  = 0;

  function next() {
    if (index >= words.length) {
      setAvatarStatus('Done signing.');
      return;
    }
    var word = words[index];
    index++;
    setAvatarStatus('Signing: "' + word + '"');
    signWord(word, next);
  }

  next();
}

function setAvatarStatus(msg) {
  var el = document.getElementById('avatarStatus');
  if (el) el.innerText = msg;
}

// ═══════════════════════════════════════════════
// YOUR ORIGINAL APP LOGIC (unchanged below)
// ═══════════════════════════════════════════════

// START APP
function startApp() {
  var name  = document.getElementById("name").value;
  var age   = document.getElementById("age").value;
  var study = document.getElementById("study").value;

  if (!name || !age || !study) {
    alert("Please fill all fields");
    return;
  }

  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");
  document.getElementById("welcomeText").innerText = "Welcome " + name + "!";

  // Small delay to ensure the container is visible before Three.js initializes
  setTimeout(function() {
    initThreeJS();
  }, 100);
}

// VOICE INPUT
function startListening() {
  var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-IN";

  recognition.onresult = function(event) {
    document.getElementById("textInput").value = event.results[0][0].transcript;
  };

  recognition.start();
}

// TRANSLATE + SPEAK
async function speakText() {
  var text = document.getElementById("textInput").value;
  var lang = document.getElementById("languageSelect").value;

  if (!text) {
    alert("Enter text");
    return;
  }

  // If English selected, no translation needed
  if (lang === "en") {
    document.getElementById("originalText").innerText  = text;
    document.getElementById("translatedText").innerText = text;
    playSignSequence(text);
    return;
  }
  
  var url = 'https://lingva.ml/api/v1/en/' + lang + '/' + encodeURIComponent(text);

try {
  var res  = await fetch(url);
  var json = await res.json();
  var translated = json.translation;

  document.getElementById("originalText").innerText  = text;
  document.getElementById("translatedText").innerText = translated;

  var speech = new SpeechSynthesisUtterance(translated);
  speech.lang = lang + "-IN";
  window.speechSynthesis.speak(speech);

  playSignSequence(text);

} catch(e) {
  console.log("Translation error:", e);
  document.getElementById("originalText").innerText = text;
  document.getElementById("translatedText").innerText = "(translation unavailable)";
  playSignSequence(text);
}

// SIGN SEQUENCE — now drives the 3D avatar
function playSignSequence(text) {
  // This now uses the 3D avatar instead of GIF images
  signSentence(text);
}

// CLEAR
function clearText() {
  document.getElementById("textInput").value       = "";
  document.getElementById("originalText").innerText  = "";
  document.getElementById("translatedText").innerText = "";
  setAvatarStatus('Cleared.');
}

// DARK MODE
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

// LOGOUT
function logout() {
  location.reload();
}