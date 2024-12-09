// script.js

// Importez les fonctions nécessaires depuis Firebase
import {displayMessages, loadMessages, joinClass, app} from './databaseManage.js';
import {
  getFirestore,
  collection,
  query,
  where,
  getDoc,
  doc,
  addDoc,
  getDocs,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
// Assurez-vous que Firebase est déjà initialisé dans votre fichier HTML
const db = getFirestore(app); // Assurez-vous que cela soit défini après l'initialisation de Firebase
const auth = getAuth(app);

const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const emojiButton = document.getElementById("emoji-button");
const emojiPicker = document.getElementById("emoji-picker");
const fileInput = document.getElementById("file-input");







onAuthStateChanged(auth, (user) => {
  if (user) {
    // Utilisateur connecté


    console.log("Utilisateur connecté :", user);
    console.log("ID utilisateur :", user.uid);
    console.log("Email utilisateur :", user.email);


  } else {
    // Pas d'utilisateur connecté
    console.log("Aucun utilisateur connecté.");
  }
});



// Émojis disponibles
const emojis = ["😀", "😁", "😂", "🤣", "😊", "😍", "😎", "🤔", "👍", "🙏"];

// Ajouter les émojis au picker
emojis.forEach(emoji => {
  const emojiElement = document.createElement("span");
  emojiElement.textContent = emoji;
  emojiElement.addEventListener("click", () => {
    messageInput.value += emoji; // Ajouter l'emoji au champ de texte
    emojiPicker.classList.add("hidden");
  });
  emojiPicker.appendChild(emojiElement);
});

// Afficher/Masquer le picker d'émojis
emojiButton.addEventListener("click", () => {
  emojiPicker.classList.toggle("hidden");
});

// Fonction pour envoyer un message
sendButton.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message) {
    sendMessage(message, "sent");
    messageInput.value = ""; // Réinitialiser le champ d'entrée
    simulateReply(message); // Simuler une réponse
  }
});

// Gérer l'envoi de fichiers
fileInput.addEventListener("change", event => {
  const file = event.target.files[0];
  if (file) {
    sendMessage(`📎 Fichier envoyé : ${file.name}`, "sent");
    simulateReply("Je vois que tu as envoyé un fichier !");
  }
  fileInput.value = ""; // Réinitialiser l'entrée du fichier
});

// Fonction pour afficher un message dans la boîte
function sendMessage(content, type) {
  const messageBubble = document.createElement("div");
  messageBubble.classList.add("message", type);
  messageBubble.textContent = content;
  chatBox.appendChild(messageBubble);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroller vers le bas automatiquement
}

// Fonction pour simuler une réponse automatique
function simulateReply(userMessage) {
  const reply = generateReply(userMessage);
  setTimeout(() => {
    sendMessage(reply, "received");
  }, 1000); // Délai de 1 seconde pour simuler un délai humain
}

// Fonction pour générer une réponse automatique
function generateReply(userMessage) {
  if (userMessage.toLowerCase().includes("bonjour")) {
    return "Salut ! Comment puis-je t'aider aujourd'hui ?";
  } else if (userMessage.toLowerCase().includes("merci")) {
    return "Avec plaisir ! 😊";
  } else if (userMessage.toLowerCase().includes("fichier")) {
    return "Merci pour le fichier ! Je vais le vérifier.";
  } else {
    return "Je suis un chatbot, mais je fais de mon mieux pour répondre. 😊";
  }
}


