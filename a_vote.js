import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js"; // Pour initialiser l'application Firebase
import { getFirestore, collection, onSnapshot, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js"; // Pour utiliser Firestore
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

//Récupérer les données de la collection "votants" dans Firestore
const voteCollections = collection(db, 'liste_votants');

//Fonction pour afficher les votants dans la table

// const afficherTableauEtudiants = (votants) => 
// {
//   // Récupérer les données de la collection "votants" dans Firestore
//     const tableBody = document.getElementById("table-body");
//     tableBody.innerHTML = ""; //Nettoie l'ancien contenu


//     votants.forEach((votant) => {
//         const row = document.createElement("tr");

//         row.innerHTML = 
//         `
//         <td style="text-align: center;"><b>${votant.kairos}</b></td>
//        <td style="font-family:Georgia, 'Times New Roman', Times, serif; font-size: 1.2rem; text-align:center;"><b>${votant.pseudoOk.toUpperCase()}</b></td>
//          <td>${votant.classe}</td>
//       <td class="status ${votant.a_vote ? "up-to-date" : "not-up-to-date"}">
//           ${votant.a_vote ? "Déjà voté" : "Pas encore voté"}
//       </td>

//       <td style="text-align: center; font-weight: bold;" >
      
//       ${votant.date}

//       </td>
//         `

//         tableBody.appendChild(row);
        
//     });
// }

// Écoute en temps réel les modifications dans la collection "votants"
onSnapshot(voteCollections, (snapshot) => {
  const votants = [];
  snapshot.forEach((doc) => {
    votants.push(doc.data());
  });

  // Trier les votants par timestamp (du plus récent au plus ancien)
  votants.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  afficherTableauEtudiants(votants);
});




// Référence à la collection des candidats
const candidateCollections = collection(db, "candidats");

// Écoute des votes en temps réel
onSnapshot(candidateCollections, (snapshot) => {
  snapshot.forEach((doc) => {
    const candidat = doc.data();
    const { nom, nombre_votes } = candidat;

    // Mettre à jour le DOM pour chaque candidat
    if (nom === "Ndieguene1") {
      document.getElementById("voteCandidat1").innerHTML = nombre_votes;
    } else if (nom === "Ndieguene2") {
      document.getElementById("voteCandidat2").innerHTML = nombre_votes;
    }
  });
});





