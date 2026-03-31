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

// TRANSLATE + SPEAK
async function speakText(){

  let text = document.getElementById("textInput").value;
  let lang = document.getElementById("languageSelect").value;

  if(!text){
    alert("Enter text");
    return;
  }

  let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;

  try {

    // ✅ FIXED PROXY
    let res = await fetch("https://corsproxy.io/?" + encodeURIComponent(url));

    let data = await res.json();

    let translated = data[0][0][0];

    document.getElementById("originalText").innerText = text;
    document.getElementById("translatedText").innerText = translated;

    let speech = new SpeechSynthesisUtterance(translated);
    speech.lang = lang + "-IN";

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);

    let avatar = document.getElementById("avatar");
    if(avatar){
      avatar.classList.add("talking");
      speech.onend = () => avatar.classList.remove("talking");
    }

    playSignSequence(text);

  } catch(e) {
    console.log("ERROR:", e);
    alert("Translation not working. Try again.");
  }
}

// SIGN LANGUAGE FUNCTION
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

  let filteredWords = words.filter(word => signMap[word]);

  if(filteredWords.length === 0){
    img.src = "";
    return;
  }

  let i = 0;

  function showNext(){
    if(i >= filteredWords.length) return;

    let word = filteredWords[i];

    img.src = signMap[word];

    i++;

    setTimeout(showNext, 1500);
  }

  showNext();
}

// CLEAR
function clearText(){
  document.getElementById("textInput").value = speechText;
  speakText(); // auto translate + speak
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

// 🎤 VOICE INPUT FUNCTION
function startListening(){
  let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  recognition.lang = "en-IN";

  recognition.onresult = function(event){
    let text = event.results[0][0].transcript;
    document.getElementById("textInput").value = text;
  };

  recognition.start();
}