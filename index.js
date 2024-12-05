// index.js

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
const db = getFirestore(); // Assurez-vous que cela soit défini après l'initialisation de Firebase
const auth = getAuth();
const buttonsActions = document.querySelectorAll(".home-button-container");
const userProfil = document.querySelector(".user-profile"); //Photo de profile de l'utilisateur(Qui va s'afficher si l'utilisateur est connecté)
const logoutButton = document.getElementById("logoutButton"); //On sélectionne le bouton de déconnexion
const loginButton = document.getElementById("loginButton");
const camera = document.getElementById("scan-container");

const modal = document.getElementById("myModal");
const closeModalSpan = document.querySelector(".close");
const saveTimeBtn = document.getElementById("saveTime");
const boutonComptable = document.getElementById("boutonComptable");
export let donneeUtilisateur; //Données de l'utilisateur connecté
// Fermer la modale
closeModalSpan.addEventListener("click", () => {
  modal.style.display = "none";
});

// Fermer la modale si on clique en dehors du contenu
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

async function getElements() {
  const querySnapshot = await getDocs(collection(db, "classes"));
  const classListContainer = document.getElementById("class-list");
  classListContainer.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const classeData = doc.data();

    const classCard = `
      <div class="class-card">
        <img src="./classe.jpg" alt="Image sede la classe" class="class-image">
        <div class="class-info">
          <h2>${classeData.name}</h2>
          <h3 class="status" style="text-align: center; font-size: 1.5rem; font-weight: bold; color: ${
            classeData.status_occupation === "Occupée" ? "red" : "green"
          };">
            ${classeData.status_occupation}
          </h3>
          <p><strong>Capacité :</strong> ${classeData.capacity}</p>
          <p><strong>Équipements Disponibles :</strong>
            ${
              classeData.equipements.length === 0
                ? "Aucun équipement disponible"
                : classeData.equipements
                    .map((equipement) => `<span>${equipement}</span>`)
                    .join(", ")
            }
          </p>
          <p class="occupee_jusqua"><strong>Occupée jusqu'à :</strong> ${
            classeData.occupee_jusqua
              ? classeData.occupee_jusqua
              : "Non spécifié"
          }</p>
          <p><strong>Localisation :</strong> ${classeData.localisation}</p>
          <p class="occupants"><strong>Occupants :</strong> ${
            classeData.occupants || "Aucun occupant"
          }</p>
        </div>
        <br>
        <div class="switch-container">
          <label class="switch">
            <input type="checkbox" class="status-toggle" data-class-id="${
              doc.id
            }" ${classeData.status_occupation === "Occupée" ? "checked" : ""}/>
            <span class="slider round"></span>
          </label>
        </div>
      </div>
    `;

    classListContainer.innerHTML += classCard;
  });

  addToggleListeners();
}

function addToggleListeners() {
  const statusToggles = document.querySelectorAll(".status-toggle");

  statusToggles.forEach((toggle) => {
    toggle.addEventListener("change", async (e) => {
      const classId = e.target.getAttribute("data-class-id");
      const statusText = e.target
        .closest(".class-card")
        .querySelector(".status");
      const occupantsText = e.target
        .closest(".class-card")
        .querySelector(".occupants");
      const occupeeJusquaText = e.target
        .closest(".class-card")
        .querySelector(".occupee_jusqua");

      if (e.target.checked) {
        let nomOccupants = "";

        while (!nomOccupants) {
          nomOccupants = prompt("Qui occupe la salle ? (Votre classe) !");

          if (nomOccupants === null) {
            break;
          } else if (nomOccupants.trim() !== "") {
            modal.style.display = "block"; // Afficher le modal pour la sélection du temps

            // Ecouteur d'événement pour la sélection de l'heure dans le modal
            saveTimeBtn.onclick = async () => {
              const selectedTime = document.getElementById("end-time").value;
              if (selectedTime) {
                statusText.innerHTML = "Occupée";
                statusText.style.color = "red";
                occupantsText.innerHTML = `<strong>Occupants:</strong> ${nomOccupants}`;
                occupeeJusquaText.innerHTML = `<strong>Occupée jusqu'à:</strong> ${selectedTime}`;

                // Mettre à jour dans Firestore
                await updateClassStatus(
                  classId,
                  "Occupée",
                  nomOccupants,
                  selectedTime
                );
                modal.style.display = "none"; // Fermer le modal après sélection
              } else {
                alert("Veuillez sélectionner une heure de libération.");
              }
            };
          } else {
            alert(
              "Le champ ne peut pas être vide. Veuillez entrer une valeur."
            );
          }
        }
      } else {
        statusText.innerHTML = "Libre";
        statusText.style.color = "green";
        occupantsText.innerHTML = `<strong>Occupants:</strong> Aucun occupant`;
        occupeeJusquaText.innerHTML = `<strong>Occupée jusqu'à:</strong> Aucune horaire d'occupation`;

        // Mettre à jour dans Firestore
        await updateClassStatus(classId, "Libre", "Aucun occupant", "");
      }
    });
  });
}

// Fonction pour mettre à jour Firestore
async function updateClassStatus(
  classId,
  newStatus,
  newOccupants,
  newOccupeeJusqua
) {
  const classRef = doc(db, "classes", classId);
  await updateDoc(classRef, {
    status_occupation: newStatus,
    occupants: newOccupants,
    occupee_jusqua: newOccupeeJusqua,
  });
}

// Charger les éléments
getElements();

logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      // Déconnexion réussie
      console.log("Déconnexion réussie");
      window.location.href = "./login/index.html"; // Redirige vers la page de connexion
    })
    .catch((error) => {
      // Une erreur est survenue lors de la déconnexion
      console.error("Erreur lors de la déconnexion:", error);
    });
});

async function getUserData(uid) {
  // Crée une requête pour rechercher l'utilisateur par son uid
  const q = query(collection(db, "users"), where("uid", "==", uid));

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      donneeUtilisateur = userData; //On récupère les données de l'utilisateur connecté actuellement(L'étudiant)

      document.getElementById("userName").innerHTML = userData.pseudoOk;
      document
        .getElementById("userPhoto")
        .setAttribute("src", userData.photoURLOk);
      userProfil.style.display = "block"; //Si l'utilisateur est connecté on affiche sa photo de profile
      logoutButton.style.display = "block"; //Si l'utilisateur est connecté on affiche le bouton de déconnexion
      loginButton.style.display = "none"; //On éfface le bouton connection si l'utilisateur est déjà connecté

      if (userData.role === "responsable") {
        //
        document.getElementById("generateQRCode").style.display = "block"; //On affiche le bouton pour le QRCode si c'est un étudiant qui est connecté
        camera.style.display = "block";
        getElements().then(() => {
          // Appeler getElements ici pour être sûr que les classes sont ajoutées avant de manipuler switchButton

          buttonsActions.forEach(function (element) {
            element.style.display = "none";
          });

          const switchButtons = document.querySelectorAll(".switch-container");
          switchButtons.forEach((switchButton) => {
            switchButton.style.display = "block";
          }, 1000);
        });
      } else if (userData.role === "etudiant") {
        //Si l'utilisateur connecté est un étudiant

        document.getElementById("generateQRCode").style.display = "block"; //On affiche le bouton pour le QRCode si c'est un étudiant qui est connecté
        boutonComptable.style.display = "none";
        camera.style.display = "block";
        document.getElementById("startScanButton").style.display = "none";
        getElements().then(() => {
          // Appeler getElements ici pour être sûr que les classes sont ajoutées avant de manipuler switchButton

          buttonsActions.forEach(function (element) {
            element.style.display = "none";
          }); //On cache les boutons d'action

          const switchButtons = document.querySelectorAll(".switch-container");
          switchButtons.forEach((switchButton) => {
            switchButton.style.display = "none"; //On cache les switchs pour changer l'état des classes
          }, 1000);
        });
      } else if (
        userData.role === "directeur" ||
        userData.role === "administration" ||
        userData.role === "comptable"
      ) {
        document.getElementById("generateQRCode").style.display = "none"; //Si c'est un membre de l'administration qui est connecté on cache le buton pour le QRCode

        buttonsActions.forEach(function (element) {
          element.style.display = "block";
        });

        const switchButtons = document.querySelectorAll(".switch-container");
        switchButtons.forEach((switchButton) => {
          switchButton.style.display = "block";
        }, 1000);
      } else {
        getElements().then(() => {
          const switchButtons = document.querySelectorAll(".switch-container");
          switchButtons.forEach((switchButton) => {
            switchButton.style.display = "none";
          }, 1000);
        });
      }

      if (userData.role === "comptable") {
        boutonComptable.style.display = "block";
        document.getElementById("generateQRCode").style.display = "none"; //Si c'est un membre de l'administration qui est connecté on cache le buton pour le QRCode

        getElements().then(() => {
          // Appeler getElements ici pour être sûr que les classes sont ajoutées avant de manipuler switchButton

          buttonsActions.forEach(function (element) {
            element.style.display = "none";
          });

          const switchButtons = document.querySelectorAll(".switch-container");
          switchButtons.forEach((switchButton) => {
            switchButton.style.display = "block";
          }, 1000);
        });
      }

      // Utilise les données de l'utilisateur selon tes besoins
    });
  } else {
    console.log("Aucune donnée trouvée pour cet utilisateur");
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid; // Obtenir le uid de l'utilisateur connecté
    getUserData(uid); // Appeler la fonction pour obtenir les données
  } else {
    console.log("L'utilisateur n'est pas connecté");
    buttonsActions.forEach(function (element) {
      element.style.display = "none";
    });
    userProfil.style.display = "none"; //On cache la photo si l'utilisateur n'est pas connecté
    logoutButton.style.display = "none"; //Si l'utilisateur est pas connecté on éfface le bouton de déconnexion
    loginButton.style.display = "block"; //On affiche le bouton connection si l'utilisateur n'est pas  connecté
    let compteur = 0;
    

    let interval = setInterval(function () {
      compteur++;

      if(compteur % 2 === 0){
        loginButton.style.transform = "scale(1.2)";
        loginButton.style.backgroundColor = "red";
      }
      else{
        loginButton.style.transform = "scale(1)";
        loginButton.style.backgroundColor = "#0056b3";
      }
      if (compteur >= 20) {
        clearInterval(interval);
        loginButton.style.transform = "scale(1)";
        loginButton.style.backgroundColor = "#0056b3";
      }
    }, 1000);


    camera.style.display = "none";
    document.getElementById("generateQRCode").style.display = "none"; //Si aucun utilisateur n'est connecté on cache le bouton pour le QRCode
    boutonComptable.style.display = "none";
    getElements().then(() => {
      const switchButtons = document.querySelectorAll(".switch-container");
      switchButtons.forEach((switchButton) => {
        switchButton.style.display = "none";
      }, 1000);
    });
  }
});

//Bouton qui permet d'actualiser la page
document.getElementById("refreshButton").addEventListener("click", function () {
  location.reload();
});

//Gestion du QRCODE

// document.getElementById('generateQRCode').addEventListener('click', function() {
//   // Afficher le QR code et l'overlay
//   document.getElementById("qrcode-container").style.display = 'block';
//   document.getElementById("overlay").style.display = 'block';

//   // Générer le QR code avec des informations
//   var qrcode = new QRCode(document.getElementById("qrcode"), {
//       text: "Joe Wilfred\njohndoe@example.com\nA jour",
//       width: 300,
//       height: 300,
//       colorDark : "#000000",  // Couleur unie (noir)
//       colorLight : "#ffffff",  // Fond blanc
//       correctLevel : QRCode.CorrectLevel.H
//   });
// });

// // Événement pour fermer le QR code
// document.getElementById('closeQRCode').addEventListener('click', function() {
//   // Masquer le QR code, l'overlay et le bouton Fermer
//   document.getElementById("qrcode-container").style.display = 'none';
//   document.getElementById("overlay").style.display = 'none';
// });
