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

  try {

    let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;

let res = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent(url));

let data = await res.json();
let json = JSON.parse(data.contents);

let translated = json[0][0][0];

    // SHOW TEXT
    document.getElementById("originalText").innerText = text;
    document.getElementById("translatedText").innerText = translated;

    // 🔊 SPEAK
    let speech = new SpeechSynthesisUtterance(translated);
    speech.lang = lang + "-IN";
    window.speechSynthesis.cancel(); // stop previous
    window.speechSynthesis.speak(speech);

    // 👦 AVATAR ANIMATION
    let avatar = document.getElementById("avatar");
    if(avatar){
      avatar.classList.add("talking");

      speech.onend = () => {
        avatar.classList.remove("talking");
      };
    }

    // ✋ SIGN LANGUAGE
    playSignSequence(text);

  } catch(e){
    console.log(e);
    alert("Translation not working. Check internet.");
  }
}

// SIGN LANGUAGE FUNCTION (WORD BY WORD)
function playSignSequence(text){

  let signMap = {
    "hello": "https://upload.wikimedia.org/wikipedia/commons/4/4c/ASL_Hello.gif",
    "thank": "https://upload.wikimedia.org/wikipedia/commons/0/08/ASL_Thank_You.gif",
    "you": "https://upload.wikimedia.org/wikipedia/commons/0/08/ASL_Thank_You.gif",
    "yes": "https://upload.wikimedia.org/wikipedia/commons/1/1d/ASL_Yes.gif",
    "no": "https://upload.wikimedia.org/wikipedia/commons/0/06/ASL_No.gif"
  };

  let words = text.toLowerCase().split(" ");
  let i = 0;
  let img = document.getElementById("signImage");

  function showNext(){
    if(i >= words.length) return;

    let word = words[i];

    // clear image first
    img.src = "";

    setTimeout(() => {
      img.src = signMap[word] || "";
    }, 200);

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