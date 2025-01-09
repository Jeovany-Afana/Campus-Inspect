// Importer les fonctions nécessaires depuis les SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js"; // Pour initialiser l'application Firebase
import { getFirestore, where, getDocs, query,doc, collection, setDoc,    } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js"; // Pour utiliser Firestore
import { getAuth, createUserWithEmailAndPassword,signInWithEmailAndPassword, signOut, sendPasswordResetEmail, signInWithPopup, fetchSignInMethodsForEmail, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';
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
const db = getFirestore(app); // Maintenant, Firestore est prêt à être utilisé
const provider = new GoogleAuthProvider();



const googleButton = document.getElementById("google-sign-in-btn");

googleButton.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Vérifier si l'email existe déjà dans Firebase Auth
    const emailExist = await fetchUsersByEmail(user.email);

    if (emailExist) {
      // Si l'email existe déjà dans Firebase Auth, afficher un message d'alerte
      await showModal("Vous êtes déjà inscrit. Veuillez vous connecter avec votre mot de passe.", "error");
      // Optionnel : Rediriger l'utilisateur vers le formulaire de connexion avec mot de passe
    } else {
      // Si l'utilisateur n'existe pas dans Firebase Auth, vérifier dans Firestore
      const userSnapshot = await getFirestoreUserByUid(user.uid);

      if (!userSnapshot) {
        // Si l'utilisateur n'existe pas dans Firestore, ouvrir le modal pour collecter ses informations
        openAdditionalInfoModal(user);
      } else {
        // Si l'utilisateur existe déjà, redirection vers la page d'accueil
        await showModal("Connexion réussie !", "success");
        window.location.href = "../index.html";
      }
    }
  } catch (error) {
    console.error("Erreur lors de la connexion avec Google :", error);
  }
});

// Fonction pour rechercher un utilisateur dans Firebase Auth par email
async function fetchUsersByEmail(email) {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0;  // Si l'email est déjà utilisé, renvoyer true
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email : ", error);
    return false;  // En cas d'erreur, considérer que l'email n'est pas utilisé
  }
}

// Fonction pour vérifier si un utilisateur avec un UID existe déjà dans Firestore
async function getFirestoreUserByUid(uid) {
  const userQuerySnapshot = await getDocs(query(collection(db, "users"), where("uid", "==", uid)));
  
  if (!userQuerySnapshot.empty) {
    return userQuerySnapshot.docs[0].data();  // Retourner les données du premier utilisateur trouvé
  }
  return null;  // Si aucun utilisateur n'est trouvé
}





// Fonction pour fermer le modale
export function closeModal() {
  const modal = document.getElementById("additional-info-modal");
  modal.style.display = "none";
}
  

// Fonction pour ouvrir le modale et pré-remplir les champs
export function openAdditionalInfoModal(user) {
  const modal = document.getElementById("additional-info-modal");
  const emailInput = document.getElementById("user-email");
  const nameInput = document.getElementById("user-name");
  
  // Pré-remplir les champs avec les informations de Google
  emailInput.value = user.email || ""; // Email de Google
  nameInput.value = user.displayName || ""; // Nom complet de Google
  
  // Afficher le modale
  modal.style.display = "flex";
}
  

// Ajouter un écouteur pour fermer le modale via le bouton "×"
document.querySelector(".modal-close-btn").addEventListener("click", closeModal);
  
// Fermer le modale en cliquant en dehors de son contenu
const modal = document.getElementById("additional-info-modal");
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModal();
  }
});
  
// Sauvegarder les informations dans Firestore
export async function saveAdditionalInfo(user) {
  const nameInput = document.getElementById("user-name").value.trim();
  const emailInput = document.getElementById("user-email").value.trim();
  const classInput = document.getElementById("user-class").value.trim();
  const kairosInput = document.getElementById("user-kairos").value.trim();
  
  // Validation des champs
  if (!nameInput || !classInput || !kairosInput) {
    alert("Tous les champs sont obligatoires !");
    return;
  }
  
  try {
    // Ajouter les données à Firestore (Assurez-vous que Firebase est configuré)
    const userDocRef = doc(db, "users", user.uid);
  
    await setDoc(userDocRef, {
      uid: user.uid, // ID unique de l'utilisateur Firebase
      pseudoOk: nameInput,
      emailOk: emailInput,
      classe: classInput,
      kairos: kairosInput,
      dureeSolvabilite:0,
      role: "etudiant",
      photoURLOk: user.photoURL,
      passwordOk: "",
      a_jour: false,
      createdAt: new Date(), // Date d'enregistrement
    });
  
    await showModal("Votre inscription a été enregistrée avec succès !", "success");
    closeModal();
    window.location.href = "../login/index.html";
  } catch (error) {
    console.error("Erreur lors de l'enregistrement dans Firestore :", error);
    await showModal("Erreur lors de l'enregistrement. Veuillez réessayer.", "error");
  }
}
  
// Gestionnaire de soumission du formulaire dans le modale
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



async function showModal(message, color) {
  const modal = document.getElementById("error-modal");
  const modalMessage = document.getElementById("modal-message");
  const modalContent = modal.querySelector(".modal-content");
  const okButton = document.getElementById("ok-button");
  const errorIcon = document.querySelector(".error-icon");

  // Mettre à jour le message et la couleur
  modalMessage.textContent = message;
  modal.style.display = "flex";
  modalContent.style.animation = "zoomIn 0.3s ease forwards";
  
  // Changer la couleur du message et de l'icône en fonction du statut (succès ou erreur)
  if (color === "error") {
    errorIcon.style.color = "red";
    okButton.style.backgroundColor = "red";
    errorIcon.style.borderColor = "red";
  } else if (color === "success") {
    errorIcon.style.color = "green";
    okButton.style.backgroundColor = "green";
    errorIcon.style.borderColor = "green";
  }

  else if (color === "warning") {
    errorIcon.style.color = "orange";
    okButton.style.backgroundColor = "orange";
    errorIcon.style.borderColor = "orange";
  }

  // Retourner une promesse qui ne se résout qu'à la fermeture du modal
  return new Promise((resolve) => {
    okButton.onclick = () => {
      closeModal(resolve); // Appeler resolve lorsque l'utilisateur appuie sur OK
    };

    window.onclick = (event) => {
      if (event.target === modal) {
        closeModal(resolve); // Appeler resolve si on clique en dehors du modal
      }
    };

    // Fonction pour fermer le modal
    function closeModal(resolve) {
      modalContent.style.animation = "zoomOut 0.3s ease forwards";
      modal.style.animation = "fadeOut 0.3s ease forwards";

      // Attendre la fin de l'animation avant de cacher le modal
      setTimeout(() => {
        modal.style.display = "none";
        resolve(); // Résoudre la promesse, ce qui permet de continuer le code
      }, 300);
    }
  });
}


await showModal("Juste un essai", "success")

