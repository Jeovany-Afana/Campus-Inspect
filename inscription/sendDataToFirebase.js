import {collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js"; // Pour initialiser l'application Firebase
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js"; // Pour utiliser Firestore
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js"; // Pour utiliser Storage

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

const statusMessage = document.getElementById('statusMessage'); // Sélectionner le div pour afficher le message


export async function registerUser(userInfo,file){

   try {
    // 1. Upload de la photo dans Firebase Storage
    const storageRef = ref(storage, 'photos/' + file.name);//Référence au fichier photo

    const snapshot = await uploadBytes(storageRef, file);//Uploader la photo
    const downloadURL = await getDownloadURL(storageRef); //Récupérer l'URL de la photo
    // 2. Stocker les informations de l'étudiant dans Firestore, y compris l'URL de la photo

    const userData = {
        pseudoOk: userInfo.pseudoOk, //nom de l'utilisateur
        emailOk: userInfo.emailOk, //Email de l'utilisateur
        passwordOk: userInfo.passwordOk, //Mot de passe de l'utilisateur
        role: "etudiant",
        photoURLOk: downloadURL //URL de la photo de l'utilisateur
    };

    //Ajouter l'utilisateur dans la collection "users" de Firestore

    await addDoc(collection(db, "users"), userData);
    console.log('Utilisateur enregistré avec succès');

    statusMessage.textContent = "Inscription réussie ! Redirection en cours...";
    statusMessage.classList.remove('error');
    statusMessage.classList.add('success');
    statusMessage.style.display = 'block';

     // Redirection après un court délai
     setTimeout(() => {
        window.location.href = '/login/index.html'; // Change la destination
      }, 2000); // 3 secondes avant redirection
    
   } catch (error) {

    console.error('Erreur lors de l’ajout des données dans Firebase:', error);

    // Afficher un message d'erreur
    statusMessage.textContent = "Échec de l'inscription. Veuillez réessayer.";
    statusMessage.classList.remove('success');
    statusMessage.classList.add('error');
    statusMessage.style.display = 'block';
    
   }
}
