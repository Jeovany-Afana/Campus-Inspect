
  // Import des modules nécessaires depuis Firebase
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
  import {
    getFirestore,
    collection,
    query,
    where,
    getDoc,
    onSnapshot,
    doc,
    addDoc,
    getDocs,
    updateDoc
  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
  import {
    getAuth,
    signOut,
    onAuthStateChanged
  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

  // Configuration Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyDibbuBJ2p88T26P0BAB-o_exunK0GYFdA", // Clé API de votre projet
    authDomain: "inspecteur-de-classes.firebaseapp.com", // Domaine d'authentification
    projectId: "inspecteur-de-classes", // ID de votre projet
    storageBucket: "inspecteur-de-classes.appspot.com", // Bucket de stockage pour les fichiers
    messagingSenderId: "572661846292", // ID de l'expéditeur de messages
    appId: "1:572661846292:web:aeb0374db2d414fef9f201", // ID de votre application
    measurementId: "G-NVN5GERDV6" // ID de mesure pour les analyses
  };

  // Initialisation de Firebase et Firestore
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // Fonction pour récupérer les clubs depuis Firestore
  async function loadClubsData() {
    const clubsCollection = collection(db, "clubs");
    const snapshot = await getDocs(clubsCollection);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      addClubCard(data.nomClub, data.description, data.photoURL, doc.id, data.icon);
    });
  }

  // Charger les données au chargement de la page
  window.onload = loadClubsData;



  function joinClub(clubId) {
    onAuthStateChanged(auth, async (user) => {
        try{
             // Afficher le spinner
             const loadingSpinner = document.getElementById('loadingSpinner');
             loadingSpinner.style.display = 'block';
      if (user) {
        const userIud = user.uid;
        const usersRef = collection(db, "users");
        const userQuery = query(usersRef, where("uid", "==", userIud));
        const querySnapshot = await getDocs(userQuery);

        
  
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
  
          // Vérifie l'existence de "appartientClub" et initialise si nécessaire
          const alreadyInClub = userData.appartientClub || false;
  
          if (alreadyInClub) {
            await showModal("Vous êtes déjà membre d'un club.", "error");
            return;
          }
  
          // Mettre à jour les informations utilisateur avec initialisation si nécessaire
          await updateDoc(userDoc.ref, {
            id_club: clubId,
            appartientClub: true
          });
  
          // Ajouter l'utilisateur dans le tableau des membres du club
          const clubRef = doc(db, "clubs", clubId);
          const clubSnapshot = await getDoc(clubRef);
  
          if (clubSnapshot.exists()) {
            const clubData = clubSnapshot.data();
            const updatedMembres = clubData.membres ? [...clubData.membres, userIud] : [userIud];
  
            await updateDoc(clubRef, {
              membres: updatedMembres
            });
  
            await showModal("Vous avez rejoint le club avec succès.", "success");
          } else {
            await showModal("Le club n'existe pas.", "error");
          }
        } else {
          await showModal("Vous n'avez pas d'utilisateur associé à votre compte.", "error");
        }
      } else {
        await showModal("Veuillez vous connecter pour rejoindre un club.", "error");
      }
    }catch (error) {
      console.error("Erreur lors de la mise à jour des données :", error);
      await showModal("Une erreur est survenue lors de la mise à jour des données.", "error");
    } finally{
        // Masquer le spinner
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.style.display = 'none';
    }
  });}
  
  // Écouteur de clic pour les boutons "Rejoindre"
  document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('join-club-button')) {
      const clubId = e.target.dataset.clubId;
      joinClub(clubId);
    }
  });



let currentIndex = 0;


function addClubCard(name, description, image, clubId, icon) {
    const container = document.getElementById('clubs-container'); // L'élément où ajouter les cartes

    // Créer la carte
    const clubCard = document.createElement('div');
    clubCard.classList.add('bg-white', 'shadow-lg', 'rounded-lg', 'overflow-hidden', 'transform', 'hover:scale-105', 'transition-all', 'w-full', 'sm:w-80', 'md:w-96', 'lg:w-1/4', 'min-w-[300px]');

    // Ajouter l'image
    const clubImage = document.createElement('img');
    clubImage.src = image;
    clubImage.alt = `${name} Club`;
    clubImage.classList.add('w-full', 'h-48', 'object-cover');
    clubCard.appendChild(clubImage);

    // Contenu de la carte
    const cardContent = document.createElement('div');
    cardContent.classList.add('p-6');

    // Titre du club
    const clubTitle = document.createElement('h3');
    clubTitle.classList.add('text-xl', 'font-semibold', 'text-indigo-600');
    clubTitle.textContent = name;
    cardContent.appendChild(clubTitle);

    // Description du club
    const clubDescription = document.createElement('p');
    clubDescription.classList.add('mt-4', 'text-gray-600');
    clubDescription.textContent = description;
    cardContent.appendChild(clubDescription);

    // Bouton Rejoindre
    const joinButton = document.createElement('button');
    joinButton.classList.add('mt-6', 'px-4', 'py-2', 'bg-indigo-600', 'text-white', 'rounded-lg', 'hover:bg-indigo-700', 'join-club-button');
    joinButton.textContent = 'Rejoindre le Club';
    joinButton.dataset.clubId = clubId;  // On stocke l'ID du club dans le dataset du bouton
    joinButton.addEventListener('click', (e) => {
        const clubId = e.target.dataset.clubId;
    });
    cardContent.appendChild(joinButton);

    // Ajouter une icône (si spécifié)
    if (icon) {
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('mt-4', 'flex', 'items-center');
        const iconElement = document.createElement('i');
        iconElement.classList.add('mr-2', ...icon.split(' ')); // Ajoute les classes de l'icône (par exemple, 'fab fa-facebook')
        iconContainer.appendChild(iconElement);
        cardContent.appendChild(iconContainer);
    }

    // Ajouter la carte au container
    clubCard.appendChild(cardContent);
    container.appendChild(clubCard);
}

// // Fonction pour naviguer à gauche (défilement fluide)
// document.getElementById('prevBtn').addEventListener('click', () => {
//     const container = document.getElementById('clubs-container');
//     currentIndex--;
//     if (currentIndex < 0) {
//         currentIndex = container.children.length - 1; // Retour au dernier élément
//     }
//     container.style.transform = `translateX(-${currentIndex * 320}px)`;  // Chaque carte a une largeur d'environ 320px
// });

// // Fonction pour naviguer à droite (défilement fluide)
// document.getElementById('nextBtn').addEventListener('click', () => {
//     const container = document.getElementById('clubs-container');
//     currentIndex++;
//     if (currentIndex >= container.children.length) {
//         currentIndex = 0; // Retour au premier élément
//     }
//     container.style.transform = `translateX(-${currentIndex * 320}px)`;  // Chaque carte a une largeur d'environ 320px
// });


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
  