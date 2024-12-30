import {
  getAuth,
  updateProfile,
  updateEmail,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
  
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";
  
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
  
const auth = getAuth();
const storage = getStorage();
const db = getFirestore();


// Récupération des éléments du DOM
const modalSpecific = document.querySelector('.modal-specific');
const closeModalSpecific = document.querySelector('.modal-specific-close');
const openModalSpecific = document.getElementById('openModalSpecific');
const customResetPasswordButton = document.getElementById("customResetPasswordButton");
// Fonction pour afficher le modal

export function showModalSpecific() {
  modalSpecific.style.display = 'block';
}

// Fonction pour masquer le modal
function hideModalSpecific() {
  modalSpecific.style.display = 'none';
}


closeModalSpecific.addEventListener('click', hideModalSpecific);

// Fermer le modal si l'utilisateur clique en dehors de son contenu
window.addEventListener('click', function (event) {
  if (event.target === modalSpecific) {
    hideModalSpecific();
  }
});



  
// Fonction pour fermer le modal
document.getElementById("closeUpdateUserModal").addEventListener("click", () => {
  document.getElementById("updateUserModal").style.display = "none";
});


// Réinitialiser le mot de passe
customResetPasswordButton.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      // Afficher le spinner
      const loadingSpinner = document.getElementById('loadingSpinner');
      loadingSpinner.style.display = 'block';

      await sendPasswordResetEmail(auth, user.email);

      loadingSpinner.style.display = 'none';
      // Afficher un message de succès
      await showModal("Email de réinitialisation  envoyé !", "success");
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      // Afficher un message d'erreur
      await showModal("Erreur lors de l'envoi de l'email de réinitialisation. " +error , "error");
    }
    finally {
      // Masquer le spinner
      const loadingSpinner = document.getElementById('loadingSpinner');
      loadingSpinner.style.display = 'none';
    }
  }
});
  

// Mettre à jour le nom complet
document.getElementById("updateNameButton").addEventListener("click", async () => {
  const newName = document.getElementById("updateUserName").value.trim();
  if (newName) {
    try {

      // Afficher le spinner
      const loadingSpinner = document.getElementById('loadingSpinner');
      loadingSpinner.style.display = 'block';
      const user = auth.currentUser;
  
      // Trouver l'utilisateur connecté dans Firestore
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(userQuery);
  
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userDocRef = doc(db, "users", userDoc.id);
  
        // Mettre à jour l'information dans Firestore et Firebase Auth
        await updateProfile(user, { displayName: newName });
        await updateDoc(userDocRef, { pseudoOk: newName });
  
        await showModal("Nom mis à jour avec succès !", "success");
      } else {

        await showModal("Utilisateur introuvable dans Firestore.", "error");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du nom :", error);
      await showModal("Une erreur s'est produite lors de la mise à jour du nom.", "error");
    }finally {
      // Masquer le spinner
      const loadingSpinner = document.getElementById('loadingSpinner');
      loadingSpinner.style.display = 'none';
    }
  } else {
    await showModal("Veuillez entrer un nom valide.", "error");
  }
});


//Mettre à jour le numéro kairos

document.getElementById("updateKairosButton").addEventListener("click", async () => {
  const newKairos = document.getElementById("updateKairos").value.trim();
  if (newKairos) {
    try {
      // Afficher le spinner
      const loadingSpinner = document.getElementById('loadingSpinner');
      loadingSpinner.style.display = 'block';
      const user = auth.currentUser;

      // Trouver l'utilisateur connecté dans Firestore
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userDocRef = doc(db, "users", userDoc.id);

        // Mettre à jour l'information dans Firestore et Firebase Auth
        await updateProfile(user, { kairos: newKairos });
        await updateDoc(userDocRef, { kairos: newKairos });}

      await showModal("Numéro Kairos mis à jour avec succès !", "success");
    }catch (error) {
      console.error("Erreur lors de la mise à jour du numéro Kairos :", error);
      await showModal("Une erreur s'est produite lors de la mise à jour du numéro Kairos.", "error");
    }
  }else{
    await showModal("Veuillez entrer un numéro Kairos valide.", "error");
  }
});

// Mettre à jour l'adresse e-mail
document.getElementById("updateEmailButton").addEventListener("click", async () => {
  const newEmail = document.getElementById("updateUserEmail").value.trim();
  if (newEmail) {
    try {
      // Afficher le spinner
      const loadingSpinner = document.getElementById('loadingSpinner');
      loadingSpinner.style.display = 'block';
      const user = auth.currentUser;
  
      // Trouver l'utilisateur connecté dans Firestore
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(userQuery);
  
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userDocRef = doc(db, "users", userDoc.id);
  
        // Mettre à jour l'information dans Firestore et Firebase Auth
        await updateEmail(user, newEmail);
        await updateDoc(userDocRef, { emailOk: newEmail });
  
        await showModal("Adresse e-mail mise à jour avec succès !", "success");
      } else {
        await showModal("Utilisateur introuvable dans Firestore.", "error");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'email :", error);
      await showModal("Une erreur s'est produite lors de la mise à jour de l'email.", "error");
    }
    finally {
      // Masquer le spinner
      const loadingSpinner = document.getElementById('loadingSpinner');
      loadingSpinner.style.display = 'none';
    }
  } else {

    await showModal("Veuillez entrer une adresse e-mail valide.", "error");
  }
});
  
  
// Mettre à jour la photo de profil
document.getElementById("updatePhotoButton").addEventListener("click", async () => {
  const file = document.getElementById("updateUserPhoto").files[0];
  if (file) {
    const user = auth.currentUser;
      
    // Vérification si l'utilisateur est connecté
    if (!user) {
      await showModal("Vous devez être connecté pour mettre à jour la photo.", "error");
      return;
    }
  
    try {
      // Afficher le spinner
      const loadingSpinner = document.getElementById('loadingSpinner');
      loadingSpinner.style.display = 'block';

      // Recherche de l'étudiant dans Firestore en utilisant la requête 'where'
      const studentsRef = collection(db, "users");
      const studentQuery = query(studentsRef, where("uid", "==", user.uid)); // Recherche par uid
  
      const querySnapshot = await getDocs(studentQuery);
  
      // Si l'étudiant existe
      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0]; // Premier résultat trouvé
        const studentData = studentDoc.data();
  
        // Upload de la photo dans Firebase Storage
        const storageRef = ref(storage, `photos/` + file.name);
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);
  
        // Mise à jour du profil de l'utilisateur avec la nouvelle photo
        await updateProfile(user, { photoURL });
  
        // Mise à jour du champ 'photoURLOk' dans Firestore
        await updateDoc(doc(db, "users", studentDoc.id), { photoURLOk: photoURL });
  
        await showModal("Photo de profil mise à jour avec succès !", "success");
      } else {
        await showModal("Aucun utilisateur trouvé dans Firestore.", "error");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la photo : ", error);
      await showModal("Une erreur est survenue lors de la mise à jour de la photo.", "error");
    }finally {
      // Masquer le spinner
      const loadingSpinner = document.getElementById('loadingSpinner');
      loadingSpinner.style.display = 'none';
    }
  } else {
    await showModal("Veuillez sélectionner une photo.", "error");
  }
});


async function showModal(message, color) {
  const modal = document.getElementById("error-modal");
  const modalMessage = document.getElementById("modal-message");
  const modalContent = modal.querySelector(".modal-content");
  const okButton = document.getElementById("ok-button");
  const errorIcon = document.getElementById("icon");
  
  // Mettre à jour le message et la couleur
  modalMessage.textContent = message;
  modal.style.display = "flex"; // Afficher le modal
  modalContent.style.animation = "zoomIn 0.3s ease forwards"; // Animation d'entrée
  
  // Changer la couleur de l'icône et du bouton en fonction du type (succès ou erreur)
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
      closeModal(resolve); // Fermer le modal lorsque l'utilisateur clique sur OK
    };
  
    window.onclick = (event) => {
      if (event.target === modal) {
        closeModal(resolve); // Fermer le modal si on clique en dehors
      }
    };
  
    // Fonction pour fermer le modal
    function closeModal(resolve) {
      modalContent.style.animation = "zoomOut 0.3s ease forwards"; // Animation de fermeture
      modal.style.animation = "fadeOut 0.3s ease forwards";
  
      // Attendre la fin de l'animation avant de cacher le modal
      setTimeout(() => {
        modal.style.display = "none";
        resolve(); // Résoudre la promesse
      }, 300);
    }
  });
}
  
  