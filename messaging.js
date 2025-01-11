import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js"; // Pour initialiser l'application Firebase
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, getDocs, query, collection,where, updateDoc,doc  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js"; // Pour utiliser Firestore


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

async function resetPasswordForDerogationStudents() {
    try {
      const queryDate = "2025-01-10"; // Date ciblée pour la dérogation
  
      // Étape 1 : Récupérer les étudiants ayant la date de dérogation spécifiée
      const usersRef = collection(db, "users"); // Remplace "users" par le nom de ta collection
      const q = query(usersRef, where("derogationDate", "==", queryDate));
      const querySnapshot = await getDocs(q);
  
      const students = []; // Tableau pour stocker les utilisateurs
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        students.push({ id: doc.id, email: data.emailOk, name: data.pseudoOk }); // Récupère l'e-mail et le nom
      });
  
      console.log("Étudiants ciblés :", students);
  
      // Étape 2 : Envoyer un e-mail de notification et réinitialiser les champs Firestore
      for (const student of students) {
        try {
          // Envoyer l'e-mail
          await sendPasswordResetEmail(auth, student.email);
          console.log(`E-mail envoyé à ${student.name} (${student.email})`);
  
          // Réinitialiser les champs derogationDate et derogation
          await updateDoc(doc(db, "users", student.id), {
            derogationDate: "",
            derogation: false,
          });
  
          console.log(`Champs réinitialisés pour ${student.name}`);
        } catch (error) {
          console.error(`Erreur pour ${student.name} (${student.email}) :`, error);
        }
      }
  
      alert("Traitement des dérogations terminé avec succès.");
    } catch (error) {
      console.error("Erreur lors de la récupération ou du traitement :", error);
      alert("Une erreur est survenue lors du traitement.");
    }
  }
  
  resetPasswordForDerogationStudents();
  