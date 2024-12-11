// Firebase configuration
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    addDoc,
  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
  
  import {
    getAuth,
    onAuthStateChanged,
  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
  
  import { getUserData } from "../index.js";
  const db = getFirestore();
  const auth = getAuth();
  
  
  // Afficher le modal
  const supportModal = document.getElementById("supportModal");
  const closeSupportModal = document.getElementById("closeSupportModal");
  const supportForm = document.getElementById("supportForm");
  
  // Fonction pour afficher le modal
  export function showSupportModal() {
    supportModal.style.visibility = "visible";
    supportModal.style.opacity = "1";
  }
  
  // Fonction pour fermer le modal
  function hideSupportModal() {
    supportModal.style.visibility = "hidden";
    supportModal.style.opacity = "0";
  }
  
  // Événement pour fermer le modal
  closeSupportModal.addEventListener("click", hideSupportModal);
  
  // Enregistrer le commentaire dans Firestore
  supportForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const comment = document.getElementById("supportComment").value;
  

    try {

         // Afficher le spinner
      const loadingSpinner = document.getElementById('loadingSpinner');
      loadingSpinner.style.display = 'block';


      const user = auth.currentUser;


      const studentsRef = collection(db, "users"); // Remplacez "students" par votre collection
      const studentQuery = query(studentsRef, where("uid", "==", user.uid)); // Recherche par uid
      const querySnapshot = await getDocs(studentQuery);

      if (!querySnapshot.empty) {
          const studentDoc = querySnapshot.docs[0]; // Premier résultat trouvé
          const studentData = studentDoc.data();
      if (user) {
        await addDoc(collection(db, "supportComments"), {
          userName: studentData.pseudoOk,
          userClasse: studentData.classe,
          kairos: studentData.kairos,
          comment,
          timestamp: new Date(),
        });
        alert("Votre commentaire a été envoyé !");
        hideSupportModal();
      } else {
        alert("Veuillez vous connecter pour soumettre un commentaire.");
      }
    }
    } catch (error) {
      console.error("Erreur lors de l'envoi du commentaire :", error);
    } finally{

         // Masquer le spinner
      const loadingSpinner = document.getElementById('loadingSpinner');
      loadingSpinner.style.display = 'none';
    }
  });
  
document.body.addEventListener("click", (event) => {
  if (event.target.classList.contains("openSupportModal")) {
    showSupportModal();
  }
});
// Afficher le modal si l'utilisateur clique sur un bouton spécifique
