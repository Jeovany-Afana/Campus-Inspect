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
    alert("Impossible d'accéder à la caméra.");
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
            alert("QR code invalide.");
        }
      }
    }
  
    requestAnimationFrame(scanQRCode);
  }
  
  // Ajouter les informations de l'étudiant connecté dans Firestore
  async function ajouterScanDansFirestore() {
    const user = await getUtilisateurConnecte();
    if (!user) {
        console.error("Aucun utilisateur connecté.");
        alert("Veuillez vous connecter pour scanner.");
        return;
    }

    try {
        // Obtenir l'heure exacte du scan
        const maintenant = new Date();

        // Vérifiez s'il existe déjà un scan pour cet utilisateur aujourd'hui
        const scansCollection = collection(db, "scans");
        const q = query(
            scansCollection,
            where("pseudoOk", "==", user.pseudoOk),
            where("date", "==", maintenant.toISOString().split("T")[0]) // Comparer uniquement la date
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            alert("Vous avez déjà scanné aujourd'hui !");
            console.log("Scan déjà effectué pour aujourd'hui.");
            return;
        }

        // Ajout des informations de l'étudiant dans la collection "scans"
        await addDoc(scansCollection, {
            pseudoOk: user.pseudoOk || "Inconnu",
            kairos: user.kairos || "Non défini",
            classe: user.classe || "Non spécifié",
            dureeSolvabilite: user.dureeSolvabilite || 0,
            a_jour: user.a_jour || false,
            date: maintenant.toISOString().split("T")[0], // Ajouter uniquement la date (AAAA-MM-JJ)
            timestamp: maintenant.toISOString(), // Ajouter l'horodatage complet (AAAA-MM-JJTHH:MM:SS.sssZ)
        });

        alert("Merci pour votre scan !");
    } catch (error) {
        alert("Désolé, une erreur est survenue !");
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
              console.log("Données utilisateur récupérées :", utilisateurData);
              resolve(utilisateurData);
            } else {
              alert("Aucun utilisateur correspondant trouvé dans Firestore.");
              console.error("Aucun document trouvé pour le champ uid :", user.uid);
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
    document.getElementById("secondStartScanButton").style.display = "none";
    qrCodeContentDiv.style.display = "none";
    video.style.display = "block";
  });
  
