// Importer les modules nécessaires de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDibbuBJ2p88T26P0BAB-o_exunK0GYFdA",
  authDomain: "inspecteur-de-classes.firebaseapp.com",
  projectId: "inspecteur-de-classes",
  storageBucket: "inspecteur-de-classes.appspot.com",
  messagingSenderId: "572661846292",
  appId: "1:572661846292:web:aeb0374db2d414fef9f201",
  measurementId: "G-NVN5GERDV6",
  databaseURL: "https://inspecteur-de-classes-default-rtdb.firebaseio.com/" // Ajoute l'URL de la database
};

// Initialiser Firebase
export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// Référence vers les classes
const classesRef = ref(database, "classes");

// Récupérer les classes et les afficher
onValue(classesRef, (snapshot) => {
  const classes = snapshot.val();
  if (classes) {
    console.log("Classes disponibles :", classes);
    displayClasses(classes);
  } else {
    console.log("Aucune classe trouvée.");
  }
});

// Fonction pour afficher dynamiquement les classes
export function displayClasses(classes) {
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = ""; // Vider la boîte avant d'ajouter les classes
  for (const classID in classes) {
    const classInfo = classes[classID];
    const classElement = document.createElement("div");
    classElement.className = "class-item";
    classElement.innerHTML = `
      <h3>${classInfo.name}</h3>
      <p>Enseignant : ${classInfo.teacher}</p>
      <button onclick="joinClass('${classID}')">Rejoindre</button>
    `;
    chatBox.appendChild(classElement);
  }
}

// Fonction pour rejoindre une classe
export function joinClass(classID) {
  console.log(`Rejoindre la classe : ${classID}`);
  // Ici, tu peux charger les messages de cette classe
  loadMessages(classID);
}

// Charger les messages d'une classe
export function loadMessages(classID) {
  const messagesRef = ref(database, `messages/${classID}`);
  onValue(messagesRef, (snapshot) => {
    const messages = snapshot.val();
    if (messages) {
      console.log("Messages :", messages);
      displayMessages(messages);
    } else {
      console.log("Aucun message dans cette classe.");
    }
  });
}

// Afficher les messages
export function displayMessages(messages) {
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = ""; // Vider avant d'ajouter les messages
  for (const messageID in messages) {
    const message = messages[messageID];
    const messageBubble = document.createElement("div");
    messageBubble.className = message.sender === "userID_123" ? "message sent" : "message received";
    messageBubble.innerHTML = `
      <p>${message.text}</p>
      <small>${new Date(message.timestamp).toLocaleString()}</small>
    `;
    chatBox.appendChild(messageBubble);
  }
}
