// Importez Firebase si ce n'est pas déjà fait
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import {
    getAuth,
    signOut,
    onAuthStateChanged,
  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
  
// Configuration Firebase (remplacez par vos informations)
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

// Initialisez Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const searchModal = document.getElementById('searchModal');
const openSearchModalBtn = document.getElementById('openSearchModal');
const closeSearchModalBtn = document.getElementById('closeSearchModal');
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');
const overlay = document.querySelector('.modal-overlay');
const messageOverlay = document.querySelector('.modal-overlay-message');
const modal = document.getElementById('messageModal');
const cancelBtn = document.getElementById('cancelBtn');

// Tableau pour stocker les étudiants
let studentsCache = [];

// Fonction pour récupérer les étudiants une seule fois
async function fetchAllStudents() {
    const studentsCollection = collection(db, "users");
    const q = query(studentsCollection, where("role", "==", "etudiant")); // Récupère uniquement les étudiants
    const querySnapshot = await getDocs(q);

    studentsCache = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            name: data.pseudoOk, 
            class: data.classe, 
            image: data.photoURLOk || 'https://via.placeholder.com/50',
            uid: data.uid
        };
    });

    console.log("Étudiants récupérés:", studentsCache);
}

// Fonction pour rechercher dans le cache
function searchStudents(queryText) {
    if (!queryText) return []; // Si aucune recherche, retourne un tableau vide
    return studentsCache.filter(student => 
        student.name.toLowerCase().includes(queryText)
    );
}

const showStudents = () => {

    studentsCache.forEach(student => {
        
        const studentCard = document.createElement('div');
        studentCard.classList.add('student');

        studentCard.innerHTML = `
        <img src="${student.image}" alt="Student Picture">
        <div class="details">
            <h3>${student.name}</h3>
            <p>Classe: ${student.class}</p>
        </div>
        <i
            class="fas fa-envelope message-icon open-modal-btn" 
            data-name="${student.name}" 
            data-photo="${student.image}" 
            data-class="${student.class}"
            data-uid=${student.uid}> </i>
    `;

    resultsContainer.appendChild(studentCard);
        
    })
}
// Gestionnaire d'événement pour la recherche
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    if(!query) {
        showStudents();
        return;
    }

    resultsContainer.innerHTML = ''; // Réinitialiser les résultats

    const students = searchStudents(query); // Filtrer depuis le cache

    if (students.length > 0) {
        students.forEach(student => {
            const studentCard = document.createElement('div');
            studentCard.classList.add('student');

            studentCard.innerHTML = `
                <img src="${student.image}" alt="Student Picture">
                <div class="details">
                    <h3>${student.name}</h3>
                    <p>Classe: ${student.class}</p>
                </div>
                <i
                    class="fas fa-envelope message-icon open-modal-btn" 
                    data-name="${student.name}" 
                    data-photo="${student.image}" 
                    data-class="${student.class}"
                    data-uid=${student.uid}> </i>
            `;

            resultsContainer.appendChild(studentCard);
        });
    } else {
        resultsContainer.innerHTML = '<p>Aucun étudiant trouvé.</p>';
    }
});


// Initialisation : Récupère les étudiants une seule fois au chargement
window.addEventListener('load', async () => {
    try {
        await fetchAllStudents();
        console.log("Cache des étudiants initialisé.");
    } catch (error) {
        console.error("Erreur lors de la récupération initiale des étudiants :", error);
    }
});



// Function to open the modal
function openSearchModal() {
    searchModal.classList.add('active');
    overlay.classList.add('active'); // Active l'overlay
    showStudents();
}

// Function to close the modal
function closeSearchModal() {
    searchModal.classList.remove('active');
    overlay.classList.remove('active'); // Désactive l'overlay
}

// Event listeners
openSearchModalBtn.addEventListener('click', openSearchModal);
closeSearchModalBtn.addEventListener('click', closeSearchModal);

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === searchModal) {
        closeSearchModal();
    }
});


//-------------------------------------------------------------------------
// Function to open the modal
function openModal() {
    modal.classList.add('active');
}

// Function to close the modal
function closeModal() {
    modal.classList.remove('active');
    messageOverlay.classList.remove('active')
}

cancelBtn.addEventListener('click', closeModal);

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});


function openMessageModal({ name, photo, studentClass }) {
    const messageModal = document.getElementById('messageModal');
    const modalStudentPhoto = document.getElementById('modalStudentPhoto');
    const modalStudentName = document.getElementById('modalStudentName');
    const modalStudentClass = document.getElementById('modalStudentClass');

    // Remplir les informations
    modalStudentPhoto.src = photo;
    modalStudentName.textContent = name;
    modalStudentClass.textContent = `Classe: ${studentClass}`;

    // Afficher le modal
    messageModal.classList.add('active');
    messageOverlay.classList.add('active')
}


resultsContainer.addEventListener('click', (e) => {
    // Vérifiez si l'élément cliqué est exactement l'icône de message
    if (e.target.matches('.message-icon')) {
        // Récupérez les informations à partir des attributs data-*
        const name = e.target.getAttribute('data-name');
        const photo = e.target.getAttribute('data-photo');
        const studentClass = e.target.getAttribute('data-class');

        // Appelez la fonction pour afficher le modal
        openMessageModal({ name, photo, studentClass });
    }
});


// Fonction pour envoyer le message
async function sendMessageToStudent(receiverUid, senderUid, messageContent) {
    const studentsCollection = collection(db, "users");
    const q = query(studentsCollection, where("uid", "==", receiverUid)); // Rechercher l'étudiant par son champ `uid`

    try {
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const receiverDoc = querySnapshot.docs[0]; // Récupère le premier document correspondant
            const receiverRef = receiverDoc.ref; // Référence du document Firestore
            const receiverData = receiverDoc.data(); // Données du document
            const messages = receiverData.messages || []; // Tableau des messages (ou tableau vide)

            // Créer le message
            const newMessage = {
                uid_envoyeur: senderUid,
                message: messageContent,
                lue: false, // Message non lu
                date: new Date().toISOString(), // Date au format ISO
            };

            // Ajouter le message au tableau
            messages.push(newMessage);

            // Mettre à jour le document Firestore avec le nouveau tableau de messages
            await updateDoc(receiverRef, { messages: messages });

            // Afficher une alerte pour indiquer que le message a été envoyé
            await showModal("Message envoyé avec succès!", "success");

            // Fermer la modale après l'envoi du message
            closeModal();
        } else {
            console.log("Aucun étudiant trouvé avec cet UID.");
            alert("Étudiant introuvable.");
        }
    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
        await showModal("Erreur lors de l'envoi du message.", "error");
    }
}


// Gestion de l'événement d'envoi du message
const sendMessageButton = document.querySelector('.send');  // Assurez-vous que ce bouton est dans la modale

sendMessageButton.addEventListener('click', async () => {
    const messageContent = document.querySelector('textarea').value;  // Récupérer le contenu du message
    const receiverUid = document.querySelector('.message-icon').getAttribute('data-uid');  // L'uid de l'étudiant

    // Récupérer l'uid de l'envoyeur (probablement depuis l'authentification Firebase)
    const senderUid = auth.currentUser.uid;

    if (messageContent) {
        // Appeler la fonction d'envoi de message
        await sendMessageToStudent(receiverUid, senderUid, messageContent);
    } else {
        alert("Veuillez saisir un message avant d'envoyer.");
    }
});


 async function showModal(message, color) {
    const modal = document.getElementById("error-modal");
    const modalMessage = document.getElementById("modal-message");
    const modalContent = modal.querySelector(".modal-content");
    const okButton = document.getElementById("ok-button");
    const errorIcon = document.querySelector(".error-icon");
  
    // Mettre à jour le message et la couleur
    modalMessage.textContent = message;
    modal.style.display = "flex";
    modalContent.style.animation = "zoomIn 0.3s ease forwards";
    
    // Changer la couleur du message et de l'icône en fonction du statut (succès ou erreur)
    if (color === "error") {
      errorIcon.style.color = "red";
      okButton.style.backgroundColor = "red";
      errorIcon.style.borderColor = "red";
    } else if (color === "success") {
      errorIcon.style.color = "green";
      okButton.style.backgroundColor = "green";
      errorIcon.style.borderColor = "green";
    }
  
    // Retourner une promesse qui ne se résout qu'à la fermeture du modal
    return new Promise((resolve) => {
      okButton.onclick = () => {
        closeModal(resolve); // Appeler resolve lorsque l'utilisateur appuie sur OK
      };
  
      window.onclick = (event) => {
        if (event.target === modal) {
          closeModal(resolve); // Appeler resolve si on clique en dehors du modal
        }
      };
  
      // Fonction pour fermer le modal
      function closeModal(resolve) {
        modalContent.style.animation = "zoomOut 0.3s ease forwards";
        modal.style.animation = "fadeOut 0.3s ease forwards";
  
        // Attendre la fin de l'animation avant de cacher le modal
        setTimeout(() => {
          modal.style.display = "none";
          resolve(); // Résoudre la promesse, ce qui permet de continuer le code
        }, 300);
      }
    });
  }
  

