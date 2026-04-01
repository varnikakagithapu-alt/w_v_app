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

// VOICE INPUT
function startListening(){
  let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-IN";

  recognition.onresult = function(event){
    document.getElementById("textInput").value = event.results[0][0].transcript;
  };

  recognition.start();
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
    let res = await fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent(url));
    let data = await res.json();

    let translated = data[0][0][0];

    document.getElementById("originalText").innerText = text;
    document.getElementById("translatedText").innerText = translated;

    let speech = new SpeechSynthesisUtterance(translated);
    speech.lang = lang + "-IN";
    window.speechSynthesis.speak(speech);

    // avatar animation
    let avatar = document.getElementById("avatar");
    avatar.classList.add("talking");

    speech.onend = () => {
      avatar.classList.remove("talking");
    };

    playSignSequence(text);

  } catch(e){
    console.log(e);
    alert("Translation not working");
  }
}

// SIGN LANGUAGE
function playSignSequence(text){
  let signMap = {
    "hello": "https://upload.wikimedia.org/wikipedia/commons/4/4c/ASL_Hello.gif",
    "thank": "https://upload.wikimedia.org/wikipedia/commons/0/08/ASL_Thank_You.gif",
    "yes": "https://upload.wikimedia.org/wikipedia/commons/1/1d/ASL_Yes.gif",
    "no": "https://upload.wikimedia.org/wikipedia/commons/0/06/ASL_No.gif"
  };

  let words = text.toLowerCase().split(" ");
  let i = 0;
  let img = document.getElementById("signImage");

  function showNext(){
    if(i >= words.length) return;

    img.src = signMap[words[i]] || "";
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