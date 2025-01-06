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
  serverTimestamp, // Importation ajoutée
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
  
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
  
// Initialisation de Firestore et Auth
const db = getFirestore();
const auth = getAuth();
  
// Éléments HTML
const video = document.getElementById("preview");
const canvasElement = document.createElement("canvas");
const canvas = canvasElement.getContext("2d");
const startScanButton = document.getElementById("startScanButton");
const videoOverlay = document.getElementById("videoOverlay");
const closeButton = document.getElementById("closeButton");
const qrCodeContentDiv = document.getElementById("qrCodeContent");
  

// Fonction pour démarrer la caméra et afficher le flux vidéo
async function startCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === "videoinput");

    // Rechercher une caméra arrière
    const backCamera = videoDevices.find((device) =>
      device.label.toLowerCase().includes("back")
    );

    const constraints = {
      video: backCamera
        ? { deviceId: { exact: backCamera.deviceId } } // Si une caméra arrière est trouvée
        : { facingMode: "environment" }, // Sinon, utiliser facingMode
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Configuration du flux vidéo
    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    video.style.display = "block";
    videoOverlay.style.display = "flex";
    video.play();
    requestAnimationFrame(scanQRCode);
  } catch (error) {
    console.error("Erreur d'accès à la caméra :", error);
    await showModal("Impossible d'accéder à la caméra !", "error");
  }
}

  
  
// Fonction pour scanner le QR code dans le flux vidéo
async function scanQRCode() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvasElement.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
  
    const imageData = canvas.getImageData(
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
  
    if (code) {
      const qrContent = code.data;
      console.log(`QR Code détecté : ${qrContent}`);
  
      // Vérifiez si le contenu du QR code est valide
      if (qrContent === "SCAN-VALID") {
        console.log("QR code valide détecté !");
        await ajouterScanDansFirestore();
      } else {
        await showModal("QR code invalide !", "error");
      }
    }
  }
  
  requestAnimationFrame(scanQRCode);
}
  
// Ajouter les informations de l'étudiant connecté dans Firestore
// Ajouter les informations de l'étudiant connecté dans Firestore
async function ajouterScanDansFirestore() {
  const user = await getUtilisateurConnecte();
  if (!user) {
    console.error("Aucun utilisateur connecté.");
    await showModal("Veuillez vous connecter pour scanner.", "error");
    return;
  }

  try {
    // Référence à la collection "scans"
    const scansCollection = collection(db, "scans");

    // Requête pour vérifier si un document avec cet UID existe déjà
    const q = query(
      scansCollection,
      where("uid", "==", user.uid) // On vérifie si cet UID existe
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Si on trouve un document avec cet UID
      await showModal("Votre scan a déjà été enregistré, merci !", "warning");
      console.log("Scan déjà enregistré pour cet utilisateur.");
      return;
    }

    // Si aucun document trouvé, ajouter les informations dans Firestore
    await addDoc(scansCollection, {
      uid: user.uid,
      pseudoOk: user.pseudoOk || "Inconnu",
      kairos: user.kairos || "Non défini",
      classe: user.classe || "Non spécifié",
      dureeSolvabilite: user.dureeSolvabilite || 0,
      derogation: user.derogation || false,
      dateDerogation: user.dateDerogation || null,
      a_jour: user.a_jour || false,
      date: new Date().toLocaleTimeString("fr-FR", { hour12: false }), // HH:MM:SS
      timestamp: serverTimestamp(), // Horodatage généré côté serveur
    });

    await showModal("Merci pour votre scan !", "success");
  } catch (error) {
    await showModal("Désolé, une erreur est survenue !", "error");
    console.error("Erreur lors de l'ajout dans Firestore :", error);
  }
}


  
  
// Récupérer les informations de l'utilisateur connecté
async function getUtilisateurConnecte() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Utilisateur détecté :", user);
        try {
          // Rechercher l'utilisateur dans Firestore avec le champ `uid`
          const usersCollection = collection(db, "users");
          const q = query(usersCollection, where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);
  
          if (!querySnapshot.empty) {
            // Si on trouve un ou plusieurs résultats, récupérer le premier
            const utilisateurData = querySnapshot.docs[0].data();
            // console.log("Données utilisateur récupérées :", utilisateurData);
            resolve(utilisateurData);
          } else {
            alert("Aucun utilisateur correspondant trouvé dans Firestore.");
            // console.error("Aucun document trouvé pour le champ uid :", user.uid);
            resolve(null);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données Firestore :", error);
          resolve(null);
        }
      } else {
        console.error("Aucun utilisateur connecté.");
        resolve(null);
      }
    });
  });
}
  
  
  
// Événement pour démarrer le scan lorsque le bouton est cliqué
startScanButton.addEventListener("click", () => {
  startCamera(); // Démarre la caméra
  startScanButton.style.display = "none"; // Cache le bouton
});
  
// Événement pour fermer l'overlay et arrêter la vidéo
closeButton.addEventListener("click", () => {
  const stream = video.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach((track) => track.stop());
  videoOverlay.style.display = "none";
  startScanButton.style.display = "block";
  qrCodeContentDiv.style.display = "none";
  video.style.display = "block";
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