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




async function getElements() {
  // Récupérer tous les documents dans la collection "bureaux"
  const querySnapshot = await getDocs(collection(db, "bureaux"));

  // Sélectionner le conteneur où les cartes vont être ajoutées
  const classListContainer = document.getElementById('class-list');

  classListContainer.innerHTML = '';

  // Parcourir chaque document récupéré
  querySnapshot.forEach((doc) => {
      // Les données de chaque classe
      const classeData = doc.data();

      // Créer la carte pour chaque classe
      const classCard = `
      <div class="class-card">
          <img src="${classeData.photoURL}" alt="Image du bureau" class="class-image">
          <div class="class-info">
              <h2>${classeData.proprio}</h2>
              <p style="text-align: center; color: #007BFF;">${classeData.poste}</p>
              <p><strong>Présence :</strong></p>
              <h3 class="status1" style="color: ${classeData.presence === 'Absent' ? 'red' : 'green'};">
                  ${classeData.presence}
              </h3>
  
              <div class="availability-container" style="${classeData.presence === 'Absent' ? 'display: none;' : ''}">
                  <p><strong>Disponibilité :</strong></p>
                  <h3 class="status2" style="color: ${classeData.status === 'Occupé' ? 'red' : 'green'};">
                      ${classeData.status}
                  </h3>
              </div>

              <p><strong>Localisation :</strong> ${classeData.localisation}</p>
  
              <div class="switch-container">
                  <p><strong>Présence :</strong></p>
                  
                  <label class="switch">
                      <input type="checkbox" class="presence-toggle" data-class-id="${doc.id}" ${classeData.presence === 'Présent' ? 'checked' : ''}/>
                      <span class="slider round"></span>
                  </label>
  
                  <div class="availability-switch" style="${classeData.presence === 'Absent' ? 'display: none;' : ''}">
                      <p><strong>Disponibilité :</strong></p>
                      
                      <label class="switch">
                          <input type="checkbox" class="status-toggle" data-class-id="${doc.id}" ${classeData.status === 'Occupé' ? 'checked' : ''}/>
                          <span class="slider round"></span>
                      </label>
                  </div>
              </div>
          </div>
      </div>
  `;

      // Insérer la carte dans le conteneur
      classListContainer.innerHTML += classCard;
  });

  // Ajoute les écouteurs d'événements après avoir ajouté les cartes
  addToggleListeners();
}


function addToggleListeners() {
  // Listener pour la présence
  const presenceToggles = document.querySelectorAll('.presence-toggle');
  presenceToggles.forEach((toggle) => {
      toggle.addEventListener('change', async (e) => {
          const classId = e.target.getAttribute('data-class-id');
          const classCard = e.target.closest('.class-card');
          const presenceText = classCard.querySelector('.status1');
          const availabilityContainer = classCard.querySelector('.availability-container');
          const availabilitySwitch = classCard.querySelector('.availability-switch');

          if (e.target.checked) {
              presenceText.innerHTML = 'Présent';
              presenceText.style.color = 'green';
              availabilityContainer.style.display = 'block';
              availabilitySwitch.style.display = 'block';
              await updatePresenceStatus(classId, "Présent");
          } else {
              presenceText.innerHTML = 'Absent';
              presenceText.style.color = 'red';
              availabilityContainer.style.display = 'none';
              availabilitySwitch.style.display = 'none';
              await updatePresenceStatus(classId, 'Absent');
          }
      });
  });

  // Listener pour la disponibilité
  const statusToggles = document.querySelectorAll('.status-toggle');
  statusToggles.forEach((toggle) => {
      toggle.addEventListener('change', async (e) => {
          const classId = e.target.getAttribute('data-class-id');
          const statusText = e.target.closest('.class-card').querySelector('.status2');

          if (e.target.checked) {
              statusText.innerHTML = 'Occupé';
              statusText.style.color = 'red';
              await updateClassStatus(classId, "Occupé");
          } else {
              statusText.innerHTML = 'Libre';
              statusText.style.color = 'green';
              await updateClassStatus(classId, 'Libre');
          }
      });
  });
}



// Fonction pour modifier la disponibilité de la classe
async function updateClassStatus(bureauId, newStatus) {
  const classRef = doc(db, "bureaux", bureauId);
  await updateDoc(classRef, {
      status: newStatus
  });
}

// Fonction pour modifier la présence de la classe
async function updatePresenceStatus(bureauId, newPresence) {
  const classRef = doc(db, "bureaux", bureauId);
  await updateDoc(classRef, {
      presence: newPresence
  });
}





getElements();




logoutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        // Déconnexion réussie
        console.log('Déconnexion réussie');
        window.location.href = '../login/index.html'; // Redirige vers la page de connexion
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
       
       
       
       if (userData.role === "directeur" || userData.role === "administration") 
        {
            getElements().then(() => {// Appeler getElements ici pour être sûr que les classes sont ajoutées avant de manipuler switchButton
              
                    buttonsActions.forEach(function (element){ //On
                      element.style.display="block";
                    });


                    const switchButtons = document.querySelectorAll('.switch-container');
                    switchButtons.forEach((switchButton) => {
                       switchButton.style.display = "block";
                        
                    }, 1000);

                   
            });
    
        
       } else {
        getElements().then(() => {


          buttonsActions.forEach(function (element){
            element.style.display="none";
          });
           
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

  document.getElementById('refreshButton').addEventListener('click', function() {
    location.reload();
});





  