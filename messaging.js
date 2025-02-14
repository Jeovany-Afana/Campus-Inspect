import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getFirestore,
  getDocs,
  query,
  collection,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js"; 

const firebaseConfig = {
  apiKey: "AIzaSyDibbuBJ2p88T26P0BAB-o_exunK0GYFdA",
  authDomain: "inspecteur-de-classes.firebaseapp.com",
  projectId: "inspecteur-de-classes",
  storageBucket: "inspecteur-de-classes.appspot.com",
  messagingSenderId: "572661846292",
  appId: "1:572661846292:web:aeb0374db2d414fef9f201",
  measurementId: "G-NVN5GERDV6"
};

// 1. Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Fonction pour remettre le champ presence_club à false
 * pour tous les utilisateurs de la collection "users".
 */
async function resetAllPresenceClub() {
  try {
    // a) Récupérer tous les utilisateurs (sans filtre)
    const usersRef = collection(db, "users");
    const allUsersQuery = query(usersRef);
    const querySnapshot = await getDocs(allUsersQuery);

    // b) Pour chaque utilisateur, mettre presence_club = false
    for (const docSnap of querySnapshot.docs) {
      const docId = docSnap.id;
      
      await updateDoc(doc(db, "users", docId), {
        presence_club: false,
      });
      
      console.log(`Remis à false pour l'utilisateur (ID: ${docId}).`);
    }

    console.log("✅ Tous les utilisateurs ont presence_club = false maintenant.");
  } catch (error) {
    console.error("❌ Erreur lors de la remise à false :", error);
  }
}

// Exécuter la fonction si nécessaire
resetAllPresenceClub();
