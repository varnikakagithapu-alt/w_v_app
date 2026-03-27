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

  let langMap = {
    en: "en",
    hi: "hi",
    te: "te",
    kn: "kn",
    ta: "ta"
  };

  let speechMap = {
    en: "en-US",
    hi: "hi-IN",
    te: "te-IN",
    kn: "kn-IN",
    ta: "ta-IN"
  };

  try {

    let res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${langMap[lang]}&dt=t&q=${encodeURIComponent(text)}`
    );

    let data = await res.json();
    let translated = data[0][0][0];

    document.getElementById("originalText").innerText = text;
    document.getElementById("translatedText").innerText = translated;

    // SPEAK
    let speech = new SpeechSynthesisUtterance(translated);
    speech.lang = speechMap[lang];
    window.speechSynthesis.speak(speech);

    // SIGN LANGUAGE
    playSignSequence(text);

  } catch(e){
    alert("Error in translation");
    console.log(e);
  }
}


// SIGN LANGUAGE FUNCTION
function playSignSequence(text){

  let signMap = {
    "hello": "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif",
    "thank": "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "you": "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "yes": "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif",
    "no": "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif"
  };

  let words = text.toLowerCase().split(" ");
  let i = 0;

  function showNext(){
    if(i >= words.length) return;

    let word = words[i];
    let img = document.getElementById("signImage");

    if(img){
      img.src = signMap[word] || "";
    }

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