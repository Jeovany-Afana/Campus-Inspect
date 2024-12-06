//Dans ce fichier nous allons mettre le code qui permet à l'utilisateur de scanner son code QR

// Importez les fonctions nécessaires depuis Firebase
import {
  getFirestore,
  collection,
  query,
  where,
  getDoc,
  doc,
  addDoc,
  getDocs,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
// Assurez-vous que Firebase est déjà initialisé dans votre fichier HTML
const db = getFirestore();
const auth = getAuth();

const video = document.getElementById("preview");
const canvasElement = document.createElement("canvas");
const canvas = canvasElement.getContext("2d");
const resultDiv = document.getElementById("result");
const startScanButton = document.getElementById("startScanButton");
const videoOverlay = document.getElementById("videoOverlay");
const closeButton = document.getElementById("closeButton");
const qrCodeContentDiv = document.getElementById("qrCodeContent");

// Fonction pour démarrer la caméra et afficher le flux vidéo
function startCamera() {
  // Demande l'accès à la caméra de l'utilisateur (caméra avant sur les téléphones)
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "user" } })
    .then((stream) => {
      // Associe le flux vidéo à l'élément vidéo sur la page
      video.srcObject = stream;

      // Cette ligne est pour iPhone afin de jouer la vidéo sans ouvrir l'application caméra
      video.setAttribute("playsinline", true);

      // Affiche la vidéo dans l'overlay (modale)
      video.style.display = "block";

      // Affiche l'overlay
      videoOverlay.style.display = "flex";

      // Lance la lecture de la vidéo
      video.play();

      // Démarre la fonction scanQRCode pour analyser les frames de la vidéo
      requestAnimationFrame(scanQRCode);
    })
    .catch((error) => {
      console.error("Erreur d'accès à la caméra :", error);
    });
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

    let username = "";

    if (code) {
      // Cache la vidéo et montre le contenu du QR Code trouvé
      video.style.display = "none";
      qrCodeContentDiv.style.display = "block";

      //On recherche l'étudiant par son ID(Car c'est ce qui est écrit dans son CODE QR)
      const q = query(collection(db, "users"), where("uid", "==", code.data));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          username = userData.pseudoOk; //On récupère le nom de l'étudiant
          qrCodeContentDiv.innerHTML = `
            
            QR Code scanné 
            <br>
            <br>
            <br>
             ${userData.pseudoOk.toUpperCase()}
            <br>
            <br>
            <br>
            ${userData.a_jour ? "À Jour !" : "Pas à Jour !"}
            
            <br>
            <br>
            <br>
            Dernier paiement: ${userData.dernier_paiement}
          `;

          showCamera(); //On lance la fonction qui permet de compter 4s avant de relancer la caméra automatiquement
        });
      } else {
        qrCodeContentDiv.innerHTML = `
        
       Impossible d'afficher la situation de l'étudiant!
       <br>
       Veuillez Réessayer !
     
        `;

        showCamera(); //On lance la fonction qui permet de compter 4s avant de relancer la caméra automatiquement
      }

      //   // Affiche le contenu du QR Code dans l'overlay
      //   qrCodeContentDiv.textContent = `QR Code scanné : ${code.data}`;

      // Affiche aussi le résultat sous l'overlay
      resultDiv.textContent = `QR Code scanné : ${code.data}`;

      console.log(`QR Code scanné : ${username}`);
    }
  }
  requestAnimationFrame(scanQRCode);
}

const showCamera = () => {
  let compteur = 0;

  let interval = setInterval(function () {
    compteur++;

    if (compteur == 4) {
      qrCodeContentDiv.innerHTML = ""; //On supprime les informations actuellement affichées à l'écran
      startCamera();
      clearInterval(interval);
    }
  }, 200);
};

// Événement pour démarrer le scan lorsque le bouton est cliqué
startScanButton.addEventListener("click", () => {
  startCamera(); // Démarre la caméra
  startScanButton.style.display = "none"; // Cache le bouton une fois cliqué
});

// Événement pour fermer l'overlay et arrêter la vidéo
closeButton.addEventListener("click", () => {
  // Arrête la vidéo
  const stream = video.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach((track) => track.stop()); // Arrête tous les flux de la vidéo

  // Cache l'overlay vidéo et réaffiche le bouton de scan
  videoOverlay.style.display = "none";
  startScanButton.style.display = "block";

  // Cache le contenu du QR Code
  qrCodeContentDiv.style.display = "none";
  video.style.display = "block"; // Réaffiche la vidéo pour le prochain scan
});
