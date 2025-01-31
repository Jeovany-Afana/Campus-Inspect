import { 
    initializeApp 
  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js"; 
  import { 
    getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc, 
  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
  const firebaseConfig = {
    apiKey: "AIzaSyDibbuBJ2p88T26P0BAB-o_exunK0GYFdA",
    authDomain: "inspecteur-de-classes.firebaseapp.com",
    projectId: "inspecteur-de-classes",
    storageBucket: "inspecteur-de-classes.appspot.com",
    messagingSenderId: "572661846292",
    appId: "1:572661846292:web:aeb0374db2d414fef9f201",
    measurementId: "G-NVN5GERDV6"
  };
  
  // Initialisation Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

// Fonction pour obtenir l'utilisateur actuel
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user); // Retourne l'utilisateur connecté
      } else {
        reject("Utilisateur non connecté"); // Si aucun utilisateur n'est connecté
      }
    });
  });
}


// Fonction pour ouvrir le modal et afficher la liste des clubs
async function showChangeClubModal() {
    const clubList = document.getElementById('clubList');
    const changeClubModal = document.getElementById('changeClubModal');
    const closeChangeButton = document.getElementById('cancelChangeBtn');
    const user = await getCurrentUser();
  
    if (!user) {
      showModal("Veuillez vous connecter pour changer de club.", "error");
      return;
    }
  
    try {
      // Récupérer la liste des clubs
      const clubsRef = collection(db, "clubs");
      const clubsSnapshot = await getDocs(clubsRef);
  
      clubList.innerHTML = ''; // Réinitialiser la liste des clubs
  
      clubsSnapshot.forEach(doc => {
        const clubData = doc.data();
        const clubId = doc.id;
        const clubName = clubData.nomClub;
  
        const clubItem = document.createElement('li');
        clubItem.textContent = clubName;
        clubItem.dataset.clubId = clubId; // Ajouter l'ID du club dans le dataset
        clubItem.classList.add('p-3', 'border', 'rounded-lg', 'hover:bg-gray-100', 'cursor-pointer'); // Ajouter des styles
  
        clubItem.addEventListener('click', () => confirmChangeClub(clubId, clubName));
  
        clubList.appendChild(clubItem);
      });
  
      changeClubModal.classList.remove('hidden'); // Afficher la modal
      closeChangeButton.addEventListener('click', () => {
        changeClubModal.classList.add('hidden'); // Cacher la modal lorsqu'on clique sur "Annuler"
      });
  
    } catch (error) {
      console.error("Erreur lors de la récupération des clubs :", error);
      showModal("Une erreur est survenue lors de la récupération des clubs.", "error");
    }
  }
  
  
  // Fonction pour confirmer le changement de club
  async function confirmChangeClub(clubId, clubName) {
    const confirmModal = document.getElementById('confirmModal');
    const confirmationMessage = document.getElementById('confirmationMessage');
    confirmationMessage.innerHTML = `Êtes-vous sûr de vouloir rejoindre le club <b>"${clubName}"</b> ?`;
  
    confirmModal.style.display = 'block';
  
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelConfirmBtn');
  
    confirmBtn.addEventListener('click', async () => {
      await changeClub(clubId);
      confirmModal.style.display = 'none';
    });
  
    cancelBtn.addEventListener('click', () => {
      confirmModal.style.display = 'none';
    });
  }
  
  // Fonction pour changer de club
  async function changeClub(newClubId) {
    onAuthStateChanged(auth, async (user) => {
      try {
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.style.display = 'block';
  
        if (user) {
          const userIud = user.uid;
          const usersRef = collection(db, "users");
          const userQuery = query(usersRef, where("uid", "==", userIud));
          const userSnapshot = await getDocs(userQuery);
  
          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();
  
            const currentClubId = userData.id_club;
  
            if (currentClubId === newClubId) {
              await showModal("Vous êtes déjà membre de ce club.", "error");
              return;
            }
  
            // Retirer l'utilisateur du club actuel
            const currentClubRef = doc(db, "clubs", currentClubId);
            const currentClubSnapshot = await getDoc(currentClubRef);
  
            if (currentClubSnapshot.exists()) {
              const currentClubData = currentClubSnapshot.data();
              const updatedMembersCurrentClub = currentClubData.membres.filter(uid => uid !== userIud);
  
              await updateDoc(currentClubRef, {
                membres: updatedMembersCurrentClub
              });
            }
  
            // Ajouter l'utilisateur au nouveau club
            const newClubRef = doc(db, "clubs", newClubId);
            const newClubSnapshot = await getDoc(newClubRef);
  
            if (newClubSnapshot.exists()) {
              const newClubData = newClubSnapshot.data();
              const updatedMembersNewClub = [...newClubData.membres, userIud];
  
              await updateDoc(newClubRef, {
                membres: updatedMembersNewClub
              });
            }
  
            // Mettre à jour les informations utilisateur
            await updateDoc(userDoc.ref, {
              id_club: newClubId
            });
  
            await showConfirmModal("Vous avez changé de club avec succès.", "success");
            location.href = "index.html"; // Rediriger ou rafraîchir la page après le changement
          } else {
            await showConfirmModal("Utilisateur non trouvé.", "error");
          }
        } else {
          await showConfirmModal("Veuillez vous connecter pour changer de club.", "error");
        }
      } catch (error) {
        console.error("Erreur lors du changement de club :", error);
        await showConfirmModal("Une erreur est survenue lors du changement de club.", "error");
      } finally {
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.style.display = 'none';
      }
    });
  }
  
  // Fonction pour afficher les modals (par exemple, messages de succès ou d'erreur)
  function showModal(message, type) {
    const modal = document.createElement('div');
    modal.classList.add('modal', type === 'error' ? 'error-modal' : 'success-modal');
    modal.innerHTML = `<p>${message}</p><button onclick="this.parentElement.remove()">Fermer</button>`;
    document.body.appendChild(modal);
  }

  
  // document.getElementById("changeClubButton").addEventListener("click", async () => {
  //   await showChangeClubModal();
  // });

  async function showConfirmModal(message, color) {
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
    } else if (color === "warning") {
      errorIcon.style.color = "orange";
      okButton.style.backgroundColor = "orange";
      errorIcon.style.borderColor = "orange";
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


  async function displayUserClub() {
    const user = await getCurrentUser();
  
    if (!user) {
      showModal("Veuillez vous connecter pour voir votre club.", "error");
      return;
    }
  
    try {
      // Récupérer les informations de l'utilisateur en utilisant 'where'
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("uid", "==", user.uid)); // Utilisation de 'where' pour rechercher l'utilisateur par son UID
      const querySnapshot = await getDocs(userQuery);
  
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const userClubId = userData.id_club;
  
        // Récupérer les détails du club
        const clubRef = doc(db, "clubs", userClubId);
        const clubDoc = await getDoc(clubRef);
  
        if (clubDoc.exists()) {
          const clubData = clubDoc.data();
          const clubName = clubData.nomClub;
  
          // Mettre à jour l'affichage du club de l'utilisateur
          const userClubElement = document.getElementById('userClub');
          userClubElement.textContent = clubName; // Afficher le nom du club
        } else {
          console.error("Le club n'existe pas.");
          const userClubElement = document.getElementById('userClub');
          userClubElement.textContent = "Aucun club associé"; // Si aucun club n'est trouvé
        }
      } else {
        console.error("Utilisateur non trouvé.");
        const userClubElement = document.getElementById('userClub');
        userClubElement.textContent = "Aucun club associé"; // Si l'utilisateur n'est pas trouvé
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du club de l'utilisateur", error);
      showModal("Une erreur est survenue lors de la récupération du club.", "error");
    }
  }
  
  // Appeler la fonction pour afficher le club de l'utilisateur lors du chargement de la page
  displayUserClub();
  