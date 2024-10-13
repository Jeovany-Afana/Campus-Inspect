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




export async function registerBureau(bureauInfo, file) {

    try {
        //Upload la photo du bureau
        const storageRef = ref(storage, 'bureaux/' + file.name);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        //Stocker les informations du bureau dans Firestore

        const bureauData = {
            proprio: bureauInfo.proprioOk,
            localisation: bureauInfo.localisation,
            presence: "Absent",
            status: "Libre",
            poste: "",
            photoURL: downloadURL
        };

        //Ajouter le bureau dans la collection bureaux de Firestore

        await addDoc(collection(db, "bureaux"), bureauData);

        setTimeout(() => {
            alert('Bureau ajouter avec succès');
            window.location.href = '../bureaux/index.html'; // Change la destination
          }, 2000); // 2 secondes avant redirection


    } catch (error) {

        console.log("Erreur lors de l'ajout du bureau" + error);
    }
    
}