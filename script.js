if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(() => console.log('Service Worker Registered'))
    .catch((err) => console.log('Service Worker Failed', err));
}
function showMessage() {
  let message = document.getElementById("userInput").value;
  document.getElementById("output").innerText = "You typed: " + message;
}
if(!name || !age || !study){
alert("Fill all fields");
return;
}

localStorage.setItem("name", name);
localStorage.setItem("age", age);
localStorage.setItem("study", study);
localStorage.setItem("disability", disability);

let voices = [];
/* Load voices + theme */
window.onload = function() {
if(localStorage.getItem("theme")==="dark"){
document.body.classList.add("dark");
}
loadVoices();
}

speechSynthesis.onvoiceschanged = loadVoices;

function loadVoices(){
voices = speechSynthesis.getVoices();
let select = document.getElementById("languageSelect");
select.innerHTML="";
voices.forEach((voice,i)=>{
let option=document.createElement("option");
option.value=i;
option.textContent=voice.name+" ("+voice.lang+")";
select.appendChild(option);
});
}

/* LOGIN */
function startApp(){
let name = document.getElementById("name").value;
let age = document.getElementById("age").value;
let study = document.getElementById("study").value;
let disability = document.getElementById("disability").value;

localStorage.setItem("name", name);
localStorage.setItem("age", age);
localStorage.setItem("study", study);
localStorage.setItem("disability", disability);

document.getElementById("loginPage").classList.add("hidden");
document.getElementById("mainApp").classList.remove("hidden");
  document.getElementById("welcomeText").innerText="Welcome "+name;

requestNotificationPermission();
}

/* SPEAK */
function speakText(){
let text=document.getElementById("textInput").value;
let rate=document.getElementById("rate").value;
let voiceIndex=document.getElementById("languageSelect").value;

if(!text){ alert("Enter text"); return;}

let speech=new SpeechSynthesisUtterance(text);
speech.rate=rate;
if(voices[voiceIndex]) speech.voice=voices[voiceIndex];

window.speechSynthesis.speak(speech);
document.getElementById("visualOutput").innerText=text;

/* analytics */
let count=localStorage.getItem("messageCount")||0;
count++;
localStorage.setItem("messageCount",count);

if(voices[voiceIndex]){
localStorage.setItem("lastLanguage",voices[voiceIndex].lang);
}
}

/* CLEAR */
function clearText(){
document.getElementById("textInput").value="";
document.getElementById("visualOutput").innerText="";
}

/* DARK MODE */
function toggleDarkMode(){
document.body.classList.toggle("dark");
localStorage.setItem("theme",
document.body.classList.contains("dark")?"dark":"light");
}

/* PROFILE */
function openProfile(){
document.getElementById("mainApp").classList.add("hidden");
document.getElementById("profilePage").classList.remove("hidden");

profileName.innerText=localStorage.getItem("name");
profileAge.innerText=localStorage.getItem("age");
profileStudy.innerText=localStorage.getItem("study");
profileDisability.innerText=localStorage.getItem("disability");
}

function goBack(){
profilePage.classList.add("hidden");
mainApp.classList.remove("hidden");
}

/* LOGOUT */
function logout(){
localStorage.removeItem("name");
localStorage.removeItem("age");
localStorage.removeItem("study");
localStorage.removeItem("disability");

mainApp.classList.add("hidden");
loginPage.classList.remove("hidden");
}

/* REMINDER */
function setReminder(){
let minutes=document.getElementById("reminderMinutes").value;
if(!minutes||minutes<=0){alert("Enter valid minutes");return;}
let ms=minutes*60*1000;

let rcount=localStorage.getItem("reminderCount")||0;
rcount++;
localStorage.setItem("reminderCount",rcount);

setTimeout(()=>{
showNotification("Reminder: Time to communicate confidently!");
},ms);
}

/* NOTIFICATIONS */
function requestNotificationPermission(){
if("Notification"in window){
Notification.requestPermission();
}
}

function showNotification(message){
if(Notification.permission==="granted"){
navigator.serviceWorker.getRegistration().then(reg=>{
if(reg){
reg.showNotification("Inclusive App",{body:message});
}
});
}
}

/* DASHBOARD */
function openDashboard(){
mainApp.classList.add("hidden");
dashboardPage.classList.remove("hidden");

dashboardMessages.innerText=
localStorage.getItem("messageCount")||0;

dashboardReminders.innerText=
localStorage.getItem("reminderCount")||0;

dashboardLanguage.innerText=
localStorage.getItem("lastLanguage")||"Not Used";
}

function goBackFromDashboard(){
dashboardPage.classList.add("hidden");
mainApp.classList.remove("hidden");
}

/* AI Suggestions */
const suggestionDatabase={
help:["I need help.","Please help me."],
water:["I need water."],
doctor:["Please call a doctor."]
};

function generateSuggestions(){
let input=document.getElementById("textInput").value.toLowerCase();
let div=document.getElementById("suggestions");
div.innerHTML="";
for(let key in suggestionDatabase){
if(input.includes(key)){
suggestionDatabase[key].forEach(sentence=>{
let btn=document.createElement("button");
btn.innerText=sentence;
btn.className="suggestion-btn";
btn.onclick=function(){
textInput.value=sentence;
};
div.appendChild(btn);
});
}
}
}

/* SERVICE WORKER */
if("serviceWorker"in navigator){
navigator.serviceWorker.register("service-worker.js");
}
function showMessage() {
  let message = document.getElementById("userInput").value;
  document.getElementById("output").innerText = "You typed: " + message;
}

function startSpeech() {

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";

  recognition.onresult = function(event) {
    let speechText = event.results[0][0].transcript;
    document.getElementById("userInput").value = speechText;
  };

  recognition.start();
}