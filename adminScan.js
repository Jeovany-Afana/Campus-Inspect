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


  //Éléments HTML
  const video = document.getElementById("preview");
  const canvasElement = document.createElement("canvas");
  const canvas = canvasElement.getContext("2d");
  const startScanButton = document.getElementById("startScanButton");
  const videoOverlay = document.getElementById("videoOverlay");
  const closeButton = document.getElementById("closeButton");
  const qrCodeContentDiv = document.getElementById("qrCodeContent");
 

  function startCamera() {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" } })
      .then((stream) => {
        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        video.style.display = "block";
        videoOverlay.style.display = "flex";
        video.play();
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
  
      if (code) {
        const qrContent = code.data;
        console.log(`QR Code détecté : ${qrContent}`);

        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("uid", "==", qrContent));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) //Si l'étudiant a été trouvé dans la base de données
            {
                const userDoc = querySnapshot.docs[0].data();
                console.log("Étudiant trouvé :", userDoc);
                // Vous pouvez maintenant utiliser les données de l'étudiant

                try {
                    await addDoc(collection(db, "scans"), {
                        pseudoOk: userDoc.pseudoOk || "Inconnu",
                        kairos: userDoc.kairos || "Non défini",
                        classe: userDoc.classe || "Non spécifié",
                        dureeSolvabilite: userDoc.dureeSolvabilite || 0,
                        a_jour: userDoc.a_jour || false,
                    });

                    alert("Scan effectué avec succès !");
                    
                } catch (error) {

                    alert("Désolé, une erreur est survenue lors de l'enregistrement du scan.");
                    console.error("Erreur lors de l'enregistrement du scan :", error);
                    
                }
            }
  

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




