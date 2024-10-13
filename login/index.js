// Importer les fonctions nécessaires depuis les SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js"; // Pour initialiser l'application Firebase
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js"; // Pour utiliser Firestore
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';

// Configuration de votre application Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDibbuBJ2p88T26P0BAB-o_exunK0GYFdA", // Clé API de votre projet
  authDomain: "inspecteur-de-classes.firebaseapp.com", // Domaine d'authentification
  projectId: "inspecteur-de-classes", // ID de votre projet
  storageBucket: "inspecteur-de-classes.appspot.com", // Bucket de stockage pour les fichiers
  messagingSenderId: "572661846292", // ID de l'expéditeur de messages
  appId: "1:572661846292:web:aeb0374db2d414fef9f201", // ID de votre application
  measurementId: "G-NVN5GERDV6" // ID de mesure pour les analyses
};

// Initialiser Firebase avec la configuration fournie
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const form = document.querySelector("form");
const inputs = document.querySelectorAll(
  'input[type="email"], input[type="password"]'
);
const progressBar = document.getElementById("progress-bar");
let email, password;

const errorDisplay = (tag, message, valid) => {
  const container = document.querySelector("." + tag + "-container");
  const span = document.querySelector("." + tag + "-container > span");

  if (!valid) {
    container.classList.add("error");
    span.textContent = message;
  } else {
    container.classList.remove("error");
    span.textContent = message;
  }
};


const emailChecker = (value) => {
  if (!value.match(/^[\w._-]+@[\w-]+\.[a-z]{2,4}$/i)) {
    errorDisplay("email", "Le mail n'est pas valide");
    email = null;
  } else {
    errorDisplay("email", "", true);
    email = value;
  }
};

const passwordChecker = (value) => {
  progressBar.classList = "";
  if (
    !value.match(
      /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/
    )
  ) {
    errorDisplay(
      "password",
      "Minimum de 8 caractères, une majuscule, un chiffre et un caractère spécial"
    );
    progressBar.classList.add("progressRed");
    password = null;
  } else if (value.length < 12) {
    progressBar.classList.add("progressBlue");
    errorDisplay("password", "", true);
    password = value;
  } else {
    progressBar.classList.add("progressGreen");
    errorDisplay("password", "", true);
    password = value;
  }
};



inputs.forEach((input) => {
  input.addEventListener("input", (e) => {
    switch (e.target.id) {
      case "email":
        emailChecker(e.target.value);
        break;
      case "password":
        passwordChecker(e.target.value);
        break;
    
      default:
        null;
    }
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (email && password) {
    const data = {
      email,
      password,
    };
    console.log(data);

    const emailOk = document.getElementById("email").value;
    const passwordOk = document.getElementById("password").value;


    try {
      // Authentifier l'utilisateur avec Firebase Auth
      const loadingSpinner = document.getElementById('loadingSpinner');//On récupère le loading spinner
      loadingSpinner.style.display = 'block';




      const userCredential = await signInWithEmailAndPassword(auth, emailOk, passwordOk);
      const user = userCredential.user;
  
      // Une fois connecté, vous pouvez rediriger l'utilisateur ou afficher un message
      alert('Connexion réussie !');
      console.log("Utilisateur connecté :", user);
  
      // Redirection vers la page d'accueil ou autre après connexion
      window.location.href = "../index.html";
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      alert("Échec de la connexion. Veuillez vérifier vos informations.");
    } finally {
      const loadingSpinner = document.getElementById('loadingSpinner');
      loadingSpinner.style.display = 'none';
    }



    inputs.forEach((input) => (input.value = ""));
    progressBar.classList = "";

    email = null;
    password = null;
  } 
  else {
    alert("Veuillez remplir correctement les champs");
  }
});






