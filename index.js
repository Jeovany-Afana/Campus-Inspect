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

import {showStudentInfo} from "./studentModal/student-modal.js";
import { showSupportModal } from "./support/support.js";
import { showModalSpecific } from "./updates/updateInformations.js";

// Assurez-vous que Firebase est déjà initialisé dans votre fichier HTML
const db = getFirestore(); // Assurez-vous que cela soit défini après l'initialisation de Firebase
const auth = getAuth();
const logoutButton = document.getElementById("logoutButton"); //On sélectionne le bouton de déconnexion
const loginButton = document.getElementById("loginButton");
// const camera = document.getElementById("scan-container");

const modal = document.getElementById("myModal");
const closeModalSpan = document.querySelector(".close");
const saveTimeBtn = document.getElementById("saveTime");
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


export async function getUserData(uid) {
  // Crée une requête pour rechercher l'utilisateur par son uid
  const q = query(collection(db, "users"), where("uid", "==", uid));

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      donneeUtilisateur = userData; //On récupère les données de l'utilisateur connecté actuellement(L'étudiant)

      
      afficherProfilUtilisateur(userData);
      loginButton.style.display = "none"; //On éfface le bouton connection si l'utilisateur est déjà connecté

      if (userData.role === "responsable") {
        //
        document.getElementById("generateQRCode").style.display = "block"; //On affiche le bouton pour le QRCode si c'est un étudiant qui est connecté
        // camera.style.display = "block";
      
        getElements().then(() => {
          const switchButtons = document.querySelectorAll(".switch-container");
          switchButtons.forEach((switchButton) => {
            switchButton.style.display = "block";
          }, 1000);
        });
      } else if (userData.role === "etudiant") {
        //Si l'utilisateur connecté est un étudiant

        document.getElementById("openSearchModal").style.display = "block"; //On affiche le bouton pour la recherche des étudiants
        document.getElementById("relative").style.display = "block"; //On affiche le bouton pour les notifications
        document.querySelector(".fab-menu").innerHTML += 
        `
         
    <button class="fab-menu-item" id="updateInformationsModal"><i class="fa-solid fa-gears"></i></button>
     <button class="fab-menu-item" id="openSupportModal">
      <i class="fa-solid fa-headset"></i>
      <span>JOE</span>
    </button>
    <button class="fab-menu-item"><i class="fa-regular fa-message"></i></button>
    <button class="fab-menu-item"><i class="fa-regular fa-file"></i></button>
     <button id="logoutButton" class="fab-menu-item" style="background-color: rgb(237, 56, 56);">
      <i class="fa-solid fa-power-off"></i>
    </button>
        
        `;

        document.getElementById("logoutButton").addEventListener("click", () => {
          let deconnexion = confirm("Voulez-vous vraiment vous déconnecter ?");

          if (deconnexion) {
          
            try{
              // Afficher le spinner
              const loadingSpinner = document.getElementById('loadingSpinner');
              loadingSpinner.style.display = 'block';

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
          
            }catch(error){
              console.log(error);
            }finally{
            // Cacher le spinner
              // Masquer le spinner
              const loadingSpinner = document.getElementById('loadingSpinner');
              loadingSpinner.style.display = 'none';
            }

          }
        });
        
        
        document.getElementById('openSupportModal').addEventListener('click', showSupportModal);
        document.getElementById('updateInformationsModal').addEventListener('click', showModalSpecific);
        // document.querySelector("#notification > p").innerHTML = "Découvrez les nouvelles fonctionnalités : le bouton de déconnexion a été déplacé dans le menu flottant pour une meilleure navigation !"

        // Lorsque l'utilisateur entre dans l'appli (par exemple au chargement de la page)
        // window.onload = function() {

  
        //   // Afficher la notification après un délai de 1 seconde (simule un changement dans l'application)
        //   // setTimeout(() => {
        //   //   document.getElementById('notification').classList.toggle('show');
        //   // }, 2000); // Ajuste le délai selon tes besoins

        //   // Fermer la notification lorsque l'utilisateur clique sur le bouton X
        //   document.getElementById('closeNotification').addEventListener('click', () => {
        //     document.getElementById('notification').classList.toggle('show');
        //     document.getElementById("notification").style.display = "none";
        //   });
      
        // }




        document.getElementById("generateQRCode").style.display = "block"; //On affiche le bouton pour le QRCode si c'est un étudiant qui est connecté
        // camera.style.display = "block";
        document.getElementById("startScanButton").style.display = "block";
        getElements().then(() => {
          // Appeler getElements ici pour être sûr que les classes sont ajoutées avant de manipuler switchButton

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
        document.getElementById("startScanButton").style.display = "none";

        const switchButtons = document.querySelectorAll(".switch-container");
        switchButtons.forEach((switchButton) => {
          switchButton.style.display = "block";
        }, 1000);
      } else {
        document.getElementById("openSearchModal").style.display = "none";
        document.getElementById("relative").style.display = "none";
        getElements().then(() => {
          const switchButtons = document.querySelectorAll(".switch-container");
          switchButtons.forEach((switchButton) => {
            switchButton.style.display = "none";
          }, 1000);
        });
      }

      if (userData.role === "comptable") {
        document.getElementById("generateQRCode").style.display = "none"; //Si c'est un membre de l'administration qui est connecté on cache le buton pour le QRCode

        getElements().then(() => {
          // Appeler getElements ici pour être sûr que les classes sont ajoutées avant de manipuler switchButton

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
    document.getElementById("openSearchModal").style.display = "none";//On cache le bouton de recherche si l'utilisateur n'est pas connecté
    document.getElementById("relative").style.display = "none";
    loginButton.style.display = "block"; //On affiche le bouton connection si l'utilisateur n'est pas  connecté
    document.getElementById("services").style.display = "none";
    // camera.style.display = "none";
    document.getElementById("startScanButton").style.display = "none";
    let compteur = 0;
    

    let interval = setInterval(function () {
      compteur++;

      if(compteur % 2 === 0){
        loginButton.style.transform = "scale(1.2)";
        loginButton.style.backgroundColor = "red";
      }
      else{
        loginButton.style.transform = "scale(1)";
        loginButton.style.backgroundColor = "green";
      }
      if (compteur >= 20) {
        clearInterval(interval);
        loginButton.style.transform = "scale(1)";
        loginButton.style.backgroundColor = "green";
      }
    }, 1000);


    // camera.style.display = "none";
    document.getElementById("generateQRCode").style.display = "none"; //Si aucun utilisateur n'est connecté on cache le bouton pour le QRCode
    getElements().then(() => {
      const switchButtons = document.querySelectorAll(".switch-container");
      switchButtons.forEach((switchButton) => {
        switchButton.style.display = "none";
      }, 1000);
    });
  }
});


async function afficherProfilUtilisateur(userData) {
  // Vérifie si l'utilisateur est connecté
  if (userData.photoURLOk) {
    // Création du conteneur principal pour la photo
    const userProfil = document.createElement("div");
    userProfil.classList.add("flex", "items-center", "space-x-2", "profile-utilisateur");

    // Création de l'élément pour l'image de profil
    const profilePicture = document.createElement("div");
    profilePicture.classList.add("profile-picture", "w-10", "h-10", "rounded-full", "overflow-hidden", "shadow-lg", "transform", "hover:scale-110", "transition-transform", "duration-300");

    // Création de l'image elle-même
    const userPhoto = document.createElement("img");
    userPhoto.setAttribute("src", userData.photoURLOk); // Définir l'URL de la photo
    userPhoto.setAttribute("alt", "Photo de profil");
    userPhoto.setAttribute("id", "userPhoto");
    userPhoto.classList.add("w-full", "h-full", "object-cover");

    // Ajout de l'image au conteneur de la photo
    profilePicture.appendChild(userPhoto);

    // Ajout du conteneur de la photo au conteneur principal
    userProfil.appendChild(profilePicture);

    // Ajouter le conteneur principal dans le DOM (dans `#userProfileContainer`)
    const parentElement = document.getElementById("userProfileContainer");
    if (parentElement) {
      parentElement.appendChild(userProfil);

      // Ajouter un événement click sur la photo pour afficher plus d'infos
      document.getElementById("userPhoto").addEventListener("click", showStudentInfo);
    } else {
      console.error("Le conteneur parent n'a pas été trouvé.");
    }
  } else {
    console.error("Utilisateur non connecté ou photo de profil manquante.");
  }
}


function redirectionClub(){

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
              document.location.href =  "./gestionClubs/" + userData.id_club + '.html';
              return;
            }
          
            else{
              document.location.href =  "./gestionClubs/index.html";
            }
            }}
          
          }catch(error){
            console.error("Erreur lors de la vérification de l'appartenance au club :", error);}
            finally{
               // Afficher le spinner
               const loadingSpinner = document.getElementById('loadingSpinner');
               loadingSpinner.style.display = 'none';
              
            }
          
          })
}

document. getElementById("associationButton").addEventListener("click", redirectionClub);