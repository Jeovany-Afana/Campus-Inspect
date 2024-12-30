// Importer les fonctions nécessaires depuis les SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js"; // Pour initialiser l'application Firebase
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js"; // Pour utiliser Firestore
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js"; // Pour utiliser Storage
import {collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

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
// Initialiser Firestore (base de données de Firebase)
const db = getFirestore(app); // Maintenant, Firestore est prêt à être utilisé
// Initialiser Firebase Storage (pour stocker des fichiers)

export async function registerClass(classInfo) {

  try
  {

    //On affiche le spinner
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'block';
        
    const classData = {
      name:classInfo.name,
      capacity:classInfo.capacity,
      equipements:classInfo.equipements,
      status_occupation:classInfo.status_occupation,
      localisation:classInfo.localisation,
      occupants:classInfo.occupants,
      prochaines_reservations:classInfo.prochaines_reservations
            
    };
        
    await addDoc(collection(db, "classes"), classData);
    console.log("Classe enregistrée avec succès");
        
    setTimeout(()=>{
      window.location.href = '../index.html';//On change la estination après avoir ajouter une classe (On redirige l'utilisateur vers la page d'acceuil)
    }, 2000);
        
  } 
  catch(error){
    alert('Erreur lors de l\'ajout de la classe: ', error);
    window.location.href='/index.html';

  }
  finally{
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'none';
  }
} 

