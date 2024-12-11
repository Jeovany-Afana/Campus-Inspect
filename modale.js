// Importez les fonctions nécessaires depuis Firebase
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    doc, // Importation ajoutée
    getDoc, // Importation ajoutée
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Initialisation de Firestore et Auth
const db = getFirestore();
const auth = getAuth();

// Vérifie si l'utilisateur est connecté avec la méthode correcte
onAuthStateChanged(auth, function(user) {
    if (user) {
        // L'utilisateur est connecté, on affiche la modale
        showModal();
    } else {
        // L'utilisateur n'est pas connecté, on ne fait rien
        console.log("Utilisateur non connecté");
    }
});

// Fonction pour afficher la modale
function showModal() {
    const modal = document.getElementById("updateModal"); // Assurez-vous que votre modale a l'ID 'myModal'
    const modalContent = document.querySelector(".custom-modal-content"); // Contenu de la modale
    const closeModalButton = document.getElementById("closeUpdateModal");

    modal.classList.add("active"); // Affiche la modale

    // Fermer la modale lorsque le bouton de fermeture est cliqué
    closeModalButton.addEventListener("click", () => {
        modal.classList.remove("active");
    });

    // Fermer la modale si l'utilisateur clique en dehors de la modale
    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            modal.classList.remove("active");
        }
    });
}
