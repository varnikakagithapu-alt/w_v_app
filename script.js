// START APP
function startApp(){
  let name = document.getElementById("name").value;
  let age = document.getElementById("age").value;
  let study = document.getElementById("study").value;

  if(!name || !age || !study){
    alert("Please fill all fields");
    return;
  }

  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");

  document.getElementById("welcomeText").innerText = "Welcome " + name;
}

// 🎤 VOICE INPUT
function startListening(){

  let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  recognition.lang = "en-IN";

  recognition.onresult = function(event){
    let text = event.results[0][0].transcript;
    document.getElementById("textInput").value = text;
  };

  recognition.start();
}


// 🌍 TRANSLATE + SPEAK
async function speakText(){

  let text = document.getElementById("textInput").value;
  let lang = document.getElementById("languageSelect").value;

  if(!text){
    alert("Enter text");
    return;
  }

  let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;

  try {

    let res = await fetch(url);
    let data = await res.json();

    let translated = data[0][0][0];

    document.getElementById("originalText").innerText = text;
    document.getElementById("translatedText").innerText = translated;

    // 🔊 SPEAK
    let speech = new SpeechSynthesisUtterance(translated);
    speech.lang = lang + "-IN";
    window.speechSynthesis.speak(speech);

   animateTalking(true);

speech.onend = () => {
  animateTalking(false);
};


    // 🤟 SIGN
    playSignSequence(text);

  } catch(e){
    console.log(e);
    alert("Translation failed");
  }
}

// INIT 3D AVATAR
function initAvatar(){

  let container = document.getElementById("avatarContainer");

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  camera.position.z = 3;

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(200, 200);
  container.appendChild(renderer.domElement);

  let geometry = new THREE.SphereGeometry(1, 32, 32);
  let material = new THREE.MeshStandardMaterial({ color: 0x00ffcc });

  avatarMesh = new THREE.Mesh(geometry, material);
  scene.add(avatarMesh);

  let light = new THREE.PointLight(0xffffff, 1);
  light.position.set(5,5,5);
  scene.add(light);

  animate();
}

// LOOP
function animate(){
  requestAnimationFrame(animate);

  if(avatarMesh){
    avatarMesh.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}

function animateTalking(isTalking){

  if(!avatarMesh) return;

  if(isTalking){
    avatarMesh.scale.set(1.2,1.2,1.2);
  } else {
    avatarMesh.scale.set(1,1,1);
  }
}

// 🤟 SIGN LANGUAGE
function playSignSequence(text){

  let signMap = {
    "hello": "https://upload.wikimedia.org/wikipedia/commons/4/4c/ASL_Hello.gif",
    "thank": "https://upload.wikimedia.org/wikipedia/commons/0/08/ASL_Thank_You.gif",
    "you": "https://upload.wikimedia.org/wikipedia/commons/0/08/ASL_Thank_You.gif",
    "yes": "https://upload.wikimedia.org/wikipedia/commons/1/1d/ASL_Yes.gif",
    "no": "https://upload.wikimedia.org/wikipedia/commons/0/06/ASL_No.gif"
  };

  let words = text.toLowerCase().split(" ");
  let img = document.getElementById("signImage");

  let filtered = words.filter(w => signMap[w]);

  let i = 0;

  function showNext(){
    if(i >= filtered.length) return;

    img.src = signMap[filtered[i]];
    i++;

    setTimeout(showNext, 1500);
  }

  showNext();
}


// CLEAR
function clearText(){
  document.getElementById("textInput").value = "";
  document.getElementById("originalText").innerText = "";
  document.getElementById("translatedText").innerText = "";
  document.getElementById("signImage").src = "";
}


// DARK MODE
function toggleDarkMode(){
  document.body.classList.toggle("dark");
}


// LOGOUT
function logout(){
  location.reload();
}

