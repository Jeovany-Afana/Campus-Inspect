// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js"; // Pour initialiser l'application Firebase
// import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
// import { getFirestore, getDocs, query, collection,where  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js"; // Pour utiliser Firestore


// const firebaseConfig = {
//   apiKey: "AIzaSyDibbuBJ2p88T26P0BAB-o_exunK0GYFdA", // Clé API de votre projet
//   authDomain: "inspecteur-de-classes.firebaseapp.com", // Domaine d'authentification
//   projectId: "inspecteur-de-classes", // ID de votre projet
//   storageBucket: "inspecteur-de-classes.appspot.com", // Bucket de stockage pour les fichiers
//   messagingSenderId: "572661846292", // ID de l'expéditeur de messages
//   appId: "1:572661846292:web:aeb0374db2d414fef9f201", // ID de votre application
//   measurementId: "G-NVN5GERDV6" // ID de mesure pour les analyses
// };


// // Initialiser Firebase avec la configuration fournie
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app); // Maintenant, Firestore est prêt à être utilisé

// async function resetPasswordForStudents() {
//   try {
//     // Étape 1 : Récupérer les utilisateurs ayant le rôle "etudiant"
//     const usersRef = collection(db, "users"); // Remplace "users" par le nom de ta collection
//     const q = query(usersRef, where("role", "==", "etudiant"));
//     const querySnapshot = await getDocs(q);

//     const students = []; // Tableau pour stocker les utilisateurs

//     querySnapshot.forEach((doc) => {
//       const data = doc.data();
//       students.push({ email: data.emailOk, name: data.pseudoOk }); // Récupère l'e-mail et le nom
//     });

//     console.log("Utilisateurs récupérés :", students);

//     // Étape 2 : Parcourir le tableau et envoyer un e-mail de réinitialisation à chacun
//     for (const student of students) {
//       try {
//         await sendPasswordResetEmail(auth, student.email);
//         console.log(`E-mail envoyé à ${student.name} (${student.email})`);
//       } catch (error) {
//         console.error(
//           `Erreur lors de l'envoi à ${student.name} (${student.email}) :`,
//           error
//         );
//       }
//     }

//     alert("Les e-mails de réinitialisation ont été envoyés avec succès.");
//   } catch (error) {
//     console.error("Erreur lors de la récupération des utilisateurs :", error);
//     alert("Une erreur est survenue lors de la récupération des utilisateurs.");
//   }
// }

// resetPasswordForStudents();
