// index.js


// Importez les fonctions nécessaires depuis Firebase
import { getFirestore, collection, query, where, getDoc, doc , addDoc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';
// Assurez-vous que Firebase est déjà initialisé dans votre fichier HTML
const db = getFirestore(); // Assurez-vous que cela soit défini après l'initialisation de Firebase
const auth = getAuth();
const buttonsActions = document.querySelectorAll('.home-button-container');
const userProfil = document.querySelector('.user-profile');//Photo de profile de l'utilisateur(Qui va s'afficher si l'utilisateur est connecté)
const logoutButton = document.getElementById('logoutButton');//On sélectionne le bouton de déconnexion
const loginButton = document.getElementById('loginButton');

const modal = document.getElementById('myModal');
const closeModalSpan = document.querySelector('.close');
const saveTimeBtn = document.getElementById('saveTime');

// Fermer la modale
closeModalSpan.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Fermer la modale si on clique en dehors du contenu
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});


async function getElements() {
  const querySnapshot = await getDocs(collection(db, "classes"));
  const classListContainer = document.getElementById('class-list');
  classListContainer.innerHTML = '';

  querySnapshot.forEach((doc) => {
    const classeData = doc.data();

    const classCard = `
      <div class="class-card">
        <img src="./classe.jpg" alt="Image de la classe" class="class-image">
        <div class="class-info">
          <h2>${classeData.name}</h2>
          <h3 class="status" style="text-align: center; font-size: 1.5rem; font-weight: bold; color: ${classeData.status_occupation === 'Occupée' ? 'red' : 'green'};">
            ${classeData.status_occupation}
          </h3>
          <p><strong>Capacité :</strong> ${classeData.capacity}</p>
          <p><strong>Équipements Disponibles :</strong>
            ${classeData.equipements.length === 0 
              ? "Aucun équipement disponible" 
              : classeData.equipements.map(equipement => `<span>${equipement}</span>`).join(', ')
            }
          </p>
          <p class="occupee_jusqua"><strong>Occupée jusqu'à :</strong> ${classeData.occupee_jusqua ? classeData.occupee_jusqua : "Non spécifié"}</p>
          <p><strong>Localisation :</strong> ${classeData.localisation}</p>
          <p class="occupants"><strong>Occupants :</strong> ${classeData.occupants || "Aucun occupant"}</p>
        </div>
        <br>
        <div class="switch-container">
          <label class="switch">
            <input type="checkbox" class="status-toggle" data-class-id="${doc.id}" ${classeData.status_occupation === 'Occupée' ? 'checked' : ''}/>
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
  const statusToggles = document.querySelectorAll('.status-toggle');

  statusToggles.forEach((toggle) => {
    toggle.addEventListener('change', async (e) => {
      const classId = e.target.getAttribute('data-class-id');
      const statusText = e.target.closest('.class-card').querySelector('.status');
      const occupantsText = e.target.closest('.class-card').querySelector('.occupants');
      const occupeeJusquaText = e.target.closest('.class-card').querySelector('.occupee_jusqua');

      if (e.target.checked) {
        let nomOccupants = '';

        while (!nomOccupants) {
          nomOccupants = prompt("Qui occupe la salle ? (Votre classe) !");

          if (nomOccupants === null) {
            break;
          } else if (nomOccupants.trim() !== '') {
            modal.style.display = 'block'; // Afficher le modal pour la sélection du temps
            
            // Ecouteur d'événement pour la sélection de l'heure dans le modal
            saveTimeBtn.onclick = async () => {
              const selectedTime = document.getElementById('end-time').value;
              if (selectedTime) {
                statusText.innerHTML = 'Occupée';
                statusText.style.color = 'red';
                occupantsText.innerHTML = `<strong>Occupants:</strong> ${nomOccupants}`;
                occupeeJusquaText.innerHTML = `<strong>Occupée jusqu'à:</strong> ${selectedTime}`;

                // Mettre à jour dans Firestore
                await updateClassStatus(classId, "Occupée", nomOccupants, selectedTime);
                modal.style.display = 'none'; // Fermer le modal après sélection
              } else {
                alert('Veuillez sélectionner une heure de libération.');
              }
            };
          } else {
            alert('Le champ ne peut pas être vide. Veuillez entrer une valeur.');
          }
        }
      } else {
        statusText.innerHTML = 'Libre';
        statusText.style.color = 'green';
        occupantsText.innerHTML = `<strong>Occupants:</strong> Aucun occupant`;
        occupeeJusquaText.innerHTML = `<strong>Occupée jusqu'à:</strong> Aucune horaire d'occupation`;

        // Mettre à jour dans Firestore
        await updateClassStatus(classId, 'Libre', "Aucun occupant", "");
      }
    });
  });
}

// Fonction pour mettre à jour Firestore
async function updateClassStatus(classId, newStatus, newOccupants, newOccupeeJusqua) {
  const classRef = doc(db, "classes", classId);
  await updateDoc(classRef, {
    status_occupation: newStatus,
    occupants: newOccupants,
    occupee_jusqua: newOccupeeJusqua,
  });
}

// Charger les éléments
getElements();




logoutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        // Déconnexion réussie
        console.log('Déconnexion réussie');
        window.location.href = './login/index.html'; // Redirige vers la page de connexion
    }).catch((error) => {
        // Une erreur est survenue lors de la déconnexion
        console.error('Erreur lors de la déconnexion:', error);
    });
});



async function getUserData(uid) {
    // Crée une requête pour rechercher l'utilisateur par son uid
    const q = query(collection(db, "users"), where("uid", "==", uid));
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
       document.getElementById('userName').innerHTML = userData.pseudoOk;
       document.getElementById('userPhoto').setAttribute('src', userData.photoURLOk);
       userProfil.style.display = "block";//Si l'utilisateur est connecté on affiche sa photo de profile
       logoutButton.style.display="block";//Si l'utilisateur est connecté on affiche le bouton de déconnexion
       loginButton.style.display = "none"; //On éfface le bouton connection si l'utilisateur est déjà connecté
       
       
       
       if (userData.role === "responsable") //
        {
            getElements().then(() => {// Appeler getElements ici pour être sûr que les classes sont ajoutées avant de manipuler switchButton
                
              buttonsActions.forEach(function (element){
                element.style.display="none";});
              
                    const switchButtons = document.querySelectorAll('.switch-container');
                    switchButtons.forEach((switchButton) => {
                       switchButton.style.display = "block";
                        
                    }, 1000);
            });
       } 
       
       else if ( userData.role === "directeur" || userData.role === "administration") {

        buttonsActions.forEach(function (element){
          element.style.display="block";
        });
        
        const switchButtons = document.querySelectorAll('.switch-container');
        switchButtons.forEach((switchButton) => {
           switchButton.style.display = "block";
            
        }, 1000);
      }
       
       else {
        getElements().then(() => {
           
                const switchButtons = document.querySelectorAll('.switch-container');
                switchButtons.forEach((switchButton) => {
                   switchButton.style.display = "none";
                 
                }, 1000);
        });
       }
      

      
        // Utilise les données de l'utilisateur selon tes besoins
      });
    } else {
      console.log('Aucune donnée trouvée pour cet utilisateur');
     
    }
  }
  

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid; // Obtenir le uid de l'utilisateur connecté
      getUserData(uid); // Appeler la fonction pour obtenir les données
    } else {
      console.log("L'utilisateur n'est pas connecté");
      buttonsActions.forEach(function (element){
        element.style.display="none";
      });
      userProfil.style.display = "none";//On cache la photo si l'utilisateur n'est pas connecté
      logoutButton.style.display="none";//Si l'utilisateur est pas connecté on éfface le bouton de déconnexion
      loginButton.style.display = "block"; //On affiche le bouton connection si l'utilisateur n'est pas  connecté
      getElements().then(() => {
       
            const switchButtons = document.querySelectorAll('.switch-container');
            switchButtons.forEach((switchButton) => {
               switchButton.style.display = "none";
            
            }, 1000);
    }); }
  });
  