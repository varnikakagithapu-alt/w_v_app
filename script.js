// START APP
function startApp(){

  let name = document.getElementById("name").value;
  let age = document.getElementById("age").value;
  let study = document.getElementById("study").value;

  if(!name || !age || !study){
    alert("Please fill all fields");
    return;
  }

  localStorage.setItem("name", name);

  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");

  document.getElementById("welcomeText").innerText = "Welcome " + name;
}


// SPEAK + TRANSLATE + SIGN
async function speakText(){

  let text = document.getElementById("textInput").value;
  let lang = document.getElementById("languageSelect").value;

  if(!text){
    alert("Please enter text");
    return;
  }

  let langMap = {
    "en": "en",
    "hi": "hi",
    "te": "te",
    "kn": "kn",
    "ta": "ta"
  };

  let speechMap = {
    "en": "en-US",
    "hi": "hi-IN",
    "te": "te-IN",
    "kn": "kn-IN",
    "ta": "ta-IN"
  };

  try {

    let response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${langMap[lang]}&dt=t&q=${encodeURIComponent(text)}`
    );

    let data = await response.json();
    let translatedText = data[0][0][0];

    document.getElementById("originalText").innerText = text;
    document.getElementById("translatedText").innerText = translatedText;

    let speech = new SpeechSynthesisUtterance(translatedText);
    speech.lang = speechMap[lang];
    window.speechSynthesis.speak(speech);

    // SIGN LANGUAGE
    let signMap = {
      "hello": "https://upload.wikimedia.org/wikipedia/commons/4/4c/ASL_Hello.gif",
      "thank you": "https://upload.wikimedia.org/wikipedia/commons/0/08/ASL_Thank_You.gif",
      "yes": "https://upload.wikimedia.org/wikipedia/commons/1/1d/ASL_Yes.gif",
      "no": "https://upload.wikimedia.org/wikipedia/commons/0/06/ASL_No.gif"
    };

    let lowerText = text.toLowerCase().trim();
    let found = false;

    for(let word in signMap){
      if(lowerText.includes(word)){
        document.getElementById("signImage").src = signMap[word];
        found = true;
        break;
      }
    }

    if(!found){
      document.getElementById("signImage").src = "";
    }

  } catch(error){
    alert("Translation failed");
    console.log(error);
  }
}


// CLEAR
function clearText(){
  document.getElementById("textInput").value = "";
}

// DARK MODE
function toggleDarkMode(){
  document.body.classList.toggle("dark");
}

// LOGOUT
function logout(){
  location.reload();
}