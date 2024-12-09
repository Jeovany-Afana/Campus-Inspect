import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js"; // Pour initialiser l'application Firebase
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js"; // Pour utiliser Firestore
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

//Récupérer les données de la collection "scans" dans Firestore
const scansCollection = collection(db, 'scans');

//Fonction pour afficher les scans dans la table

const afficherTableauEtudiants = (scans) => 
{
  // Récupérer les données de la collection "scans" dans Firestore
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = ""; //Nettoie l'ancien contenu


    scans.forEach((scan) => {
        const row = document.createElement("tr");

        row.innerHTML = 
        `
        <td style="text-align: center;"><b>${scan.kairos}</b></td>
       <td style="font-family:Georgia, 'Times New Roman', Times, serif; font-size: 1.2rem; text-align:center;"><b>${scan.pseudoOk.toUpperCase()}</b></td>
      <td style="text-align: center; color:${scan.dureeSolvabilite > 0 ? "green" : "red"};font-size: 1.5rem;"><b>${scan.dureeSolvabilite}</b></td>
      <td>${scan.classe}</td>
      <td class="status ${scan.a_jour ? "up-to-date" : "not-up-to-date"}">
          ${scan.a_jour ? "À jour" : "Pas à jour"}
      </td>
        `

        tableBody.appendChild(row);
        
    });
}

//Ecoute en temps réel les modifications dans la collection "scans"
onSnapshot(scansCollection, (snapshot) => {
    const scans = [];
    snapshot.forEach((doc) => {
        scans.push(doc.data());
    });

    afficherTableauEtudiants(scans);
});







