import {collection, addDoc, getDocs, getDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js"; // Pour initialiser l'application Firebase
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js"; // Pour utiliser Firestore
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js"; // Pour utiliser Storage
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';
import { showModal} from "./index.js";
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
const storage = getStorage(app);
const db = getFirestore(app); // Maintenant, Firestore est prêt à être utilisé
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const googleButton = document.getElementById("google-sign-in-btn");
const statusMessage = document.getElementById('statusMessage'); // Sélectionner le div pour afficher le message



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
  
  


export async function registerUser(email, password, userInfo, file) {
  try {
    // Afficher le spinner
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'block';

    // 1. Création de l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user; // Récupérer l'utilisateur
    const uid = user.uid; // Récupérer l'UID de l'utilisateur

    // 2. Upload de la photo dans Firebase Storage
    const storageRef = ref(storage, `photos/${uid}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file); // Uploader la photo
    const downloadURL = await getDownloadURL(storageRef); // Récupérer l'URL de la photo
      
    // 3. Stocker les informations de l'utilisateur dans Firestore, y compris l'URL de la photo
    const userData = {
      uid: uid, // Ajouter l'UID ici
      pseudoOk: userInfo.pseudoOk,
      emailOk: email,
      passwordOk: password,
      role: "etudiant",
      classe:userInfo.classe,
      dureeSolvabilite:0,
      kairos: userInfo.kairosOk,
      a_jour:false, //Attribut de type booleen qui va permettre de savoir si l'étudiant est à jour ou pas
      photoURLOk: downloadURL,
    };

    // 4. Ajouter l'étudiant dans la collection "users" de Firestore
    await addDoc(collection(db, "users"), userData);

    // 5. Afficher un message de succès et rediriger
    await showModal("Inscription réussie !", "success");
    statusMessage.textContent = "Inscription réussie ! Redirection en cours...";
    statusMessage.classList.remove('error');
    statusMessage.classList.add('success');
    statusMessage.style.display = 'block';

    // Redirection après 2 secondes
    setTimeout(() => {
      window.location.href = '../login/index.html';
    }, 2000);
      
  } catch (error) {
    console.error("Erreur lors de l'ajout des données de l'utilisateur:", error);
    showModal("Échec de l'inscription. Veuillez réessayer.", "error");
    statusMessage.textContent = "Échec de l'inscription. Veuillez réessayer.";
    statusMessage.classList.remove('success');
    statusMessage.classList.add('error');
    statusMessage.style.display = 'block';
  } finally {
    // Masquer le spinner
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'none';
  }
}
