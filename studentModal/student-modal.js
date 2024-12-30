import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Initialisation de Firestore et Auth
const db = getFirestore();
const auth = getAuth();

// Fonction pour récupérer et afficher les informations de l'étudiant connecté
export async function showStudentInfo() {
  const modal = document.getElementById("user-profile-modale"); // Modale
  const closeModalButton = document.getElementById("close-modal-btn"); // Bouton de fermeture
  // Vérifier l'état de connexion de l'utilisateur
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Requête pour trouver l'étudiant dans Firestore
        const studentsRef = collection(db, "users"); // Remplacez "users" par votre collection
        const studentQuery = query(studentsRef, where("uid", "==", user.uid)); // Recherche par uid
        const querySnapshot = await getDocs(studentQuery);

        if (!querySnapshot.empty) {
          const studentDoc = querySnapshot.docs[0]; // Premier résultat trouvé
          const studentData = studentDoc.data();

          // Mettre à jour les informations dans la modale
          document.getElementById("student-photo").src = studentData.photoURLOk; // URL de la photo
          document.getElementById("studentName").textContent = studentData.pseudoOk.toUpperCase(); // Nom complet
          document.getElementById("kairosNumber").textContent = studentData.kairos; // Numéro Kairos
          document.getElementById("studentEmail").textContent = studentData.emailOk; // Email
          document.getElementById("studentClasse").textContent = studentData.classe; // Téléphone
          document.getElementById("accountStatus").textContent = studentData.dureeSolvabilite; // Solvabilité

          // Vérifier la situation et appliquer la couleur correspondante
          const statusElement = document.getElementById("accountStatus");
          if (studentData.a_jour) {
            statusElement.textContent = "À jour";
            statusElement.classList.add("up-to-date");
            statusElement.classList.remove("not-up-to-date");
          } else {
            statusElement.textContent = "Pas à jour";
            statusElement.classList.add("not-up-to-date");
            statusElement.classList.remove("up-to-date");
          }

          // Afficher la modale
          modal.classList.add("active");

        } else {
          console.log("Aucune donnée trouvée pour cet utilisateur.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données de l'étudiant :", error);
      }
    } else {
      console.log("Aucun utilisateur connecté");
    }
  });

  // // Fermer la modale lorsque le bouton de fermeture est cliqué
  closeModalButton.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  // Fermer la modale si l'utilisateur clique en dehors de la modale
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.classList.remove("active");
    }
  });
}
