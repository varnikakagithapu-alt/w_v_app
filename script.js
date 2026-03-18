// SERVICE WORKER
if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('service-worker.js')
.then(() => console.log("Service Worker Registered"))
.catch(err => console.log("Service Worker Failed", err));
}

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

document.getElementById("loginPage").style.display = "none";
document.getElementById("mainApp").style.display = "block";

document.getElementById("welcomeText").innerText = "Welcome " + name;

}

// TEXT TO SPEECH
function speakText(){

let text = document.getElementById("textInput").value;

if(!text){
alert("Enter text");
return;
}

let speech = new SpeechSynthesisUtterance(text);
speech.lang = "en-US";

window.speechSynthesis.speak(speech);

}

// VOICE INPUT
function startSpeech(){

const recognition = new webkitSpeechRecognition();
recognition.lang = "en-US";

recognition.onresult = function(event){

let speechText = event.results[0][0].transcript;
document.getElementById("textInput").value = speechText;

};

recognition.start();

}

// CLEAR
function clearText(){

document.getElementById("textInput").value = "";

}

// FONT SIZE
function increaseFont(){

let input = document.getElementById("textInput");

let size = window.getComputedStyle(input).fontSize;

input.style.fontSize = (parseFloat(size) + 2) + "px";

}

function decreaseFont(){

let input = document.getElementById("textInput");

let size = window.getComputedStyle(input).fontSize;

input.style.fontSize = (parseFloat(size) - 2) + "px";

}

// DARK MODE
function toggleDarkMode(){

document.body.classList.toggle("dark");

}

// LOGOUT
function logout(){

location.reload();

}

// PROFILE PAGE
function openProfile(){
  document.getElementById("mainApp").style.display = "none";
  document.getElementById("profilePage").style.display = "block";

  document.getElementById("profileName").innerText = localStorage.getItem("name") || "";
}

function goBack(){
  document.getElementById("profilePage").style.display = "none";
  document.getElementById("mainApp").style.display = "block";
}

// DASHBOARD
function openDashboard(){
  document.getElementById("mainApp").style.display = "none";
  document.getElementById("dashboardPage").style.display = "block";

  document.getElementById("dashboardMessages").innerText = "0";
  document.getElementById("dashboardReminders").innerText = "0";
  document.getElementById("dashboardLanguage").innerText = "English";
}

function goBackFromDashboard(){
  document.getElementById("dashboardPage").style.display = "none";
  document.getElementById("mainApp").style.display = "block";
}

// REMINDER
function setReminder(){
  let minutes = document.getElementById("reminderMinutes").value;

  if(!minutes){
    alert("Enter minutes");
    return;
  }

  setTimeout(() => {
    alert("Reminder!");
  }, minutes * 60000);
}

function changeLanguage(){
  let lang = document.getElementById("uiLanguage").value;

  if(lang === "hi"){
    document.getElementById("welcomeText").innerText = "स्वागत है";
  } 
  else if(lang === "te"){
    document.getElementById("welcomeText").innerText = "స్వాగతం";
  } 
  else {
    document.getElementById("welcomeText").innerText = "Welcome";
  }
}