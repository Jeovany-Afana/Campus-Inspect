// Importer les fonctions nécessaires depuis les SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js"; // Pour initialiser l'application Firebase
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js"; // Pour utiliser Firestore
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, sendPasswordResetEmail  } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';
import { openAdditionalInfoModal, saveAdditionalInfo, closeModal } from "../inscription/sendDataToFirebase.js";
import { showModal } from "../inscription/index.js";
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
const provider = new GoogleAuthProvider();



const googleButton = document.getElementById("google-sign-in-btn");

googleButton.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Vérifier si l'utilisateur existe déjà dans Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userDocRef); // Utilisation de getDoc ici pour un seul document

    if (!userSnapshot.exists()) {
      // Si l'utilisateur n'existe pas, ouvrir le modale pour collecter ses informations
      openAdditionalInfoModal(user);
    } else {
      // Si l'utilisateur existe, redirection vers la page d'accueil
      await showModal("Connexion réussie !", "success");
      window.location.href = "../index.html";
    }
  } catch (error) {
    console.error("Erreur lors de la connexion avec Google :", error);
  }
});

document.getElementById("additional-info-form").addEventListener("submit", (e) => {
  e.preventDefault(); // Empêche la soumission classique du formulaire
  
  // Récupérer l'utilisateur connecté avec la méthode modulaire
  const user = getAuth().currentUser; // Utilisation de getAuth() pour récupérer l'utilisateur
  if (user) {
    saveAdditionalInfo(user);
  } else {
    alert("Aucun utilisateur n'est connecté.");
  }
});

// Ajouter un écouteur pour fermer le modale via le bouton "×"
document.querySelector(".modal-close-btn").addEventListener("click", closeModal);
    
// Fermer le modale en cliquant en dehors de son contenu
const modal = document.getElementById("additional-info-modal");
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModal();
  }
});



// Fonction pour réinitialiser le mot de passe
document.getElementById("forgotPasswordButton").addEventListener("click", async () => {
  const userEmail = prompt("Entrez votre adresse e-mail pour réinitialiser votre mot de passe:");

  if (userEmail) {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, userEmail);
      alert("Un e-mail de réinitialisation de mot de passe a été envoyé !");
    } catch (error) {
      alert("Une erreur est survenue. Veuillez vérifier votre adresse e-mail.");
      console.error(error);
    }
  } else {
    alert("Veuillez entrer une adresse e-mail.");
  }
});





const form = document.querySelector(".form");
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
      /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?!.*\s).{8,}$/
    )
  ) {
    errorDisplay(
      "password",
      "Minimum de 8 caractères, une majuscule et un chiffre"
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
    const data = { email, password };
    console.log(data);

    const emailOk = document.getElementById("email").value;
    const passwordOk = document.getElementById("password").value;

    try {
      const loadingSpinner = document.getElementById('loadingSpinner');
      loadingSpinner.style.display = 'block';

      const userCredential = await signInWithEmailAndPassword(auth, emailOk, passwordOk);
      const user = userCredential.user;

      // L'utilisateur est authentifié, afficher le modal de succès
      if (user) {
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.style.display = 'none';
        await showModal("Connexion réussie !", "success");
        console.log("Utilisateur connecté :", user);

        // Redirection vers la page d'accueil après la connexion
        window.location.href = "../index.html";
      }

    } catch (error) {
      console.error("Erreur lors de la connexion :", error);

      // Afficher un modal d'erreur en cas d'échec de la connexion
      await showModal("Échec de la connexion. Veuillez vérifier vos informations.", "error");
    } finally {
      const loadingSpinner = document.getElementById('loadingSpinner');
      loadingSpinner.style.display = 'none';
    }

    // Réinitialisation des champs et variables
    inputs.forEach((input) => (input.value = ""));
    progressBar.classList = "";
    email = null;
    password = null;

  } else {
    // Si les champs ne sont pas remplis, afficher un modal d'erreur
    await showModal("Veuillez remplir tous les champs", "error");
  }
});


