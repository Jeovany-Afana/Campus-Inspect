import {collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js"; // Pour initialiser l'application Firebase
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js"; // Pour utiliser Firestore
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js"; // Pour utiliser Storage
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';

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

const statusMessage = document.getElementById('statusMessage'); // Sélectionner le div pour afficher le message


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
      const storageRef = ref(storage, 'photos/' + file.name); // Référence au fichier photo
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
      alert('Utilisateur enregistré avec succès');
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
      alert('Erreur lors de l’inscription : ' + error.message);
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
