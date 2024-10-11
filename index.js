// index.js


// Importez les fonctions nécessaires depuis Firebase
import { getFirestore, collection, doc, addDoc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Assurez-vous que Firebase est déjà initialisé dans votre fichier HTML
const db = getFirestore(); // Assurez-vous que cela soit défini après l'initialisation de Firebase

async function addUser() {
    try {
        const docRef = await addDoc(collection(db, "users"), {
            first: "Ada",
            last: "Lovelace",
            born: 1815
        });
        console.log("Document écrit avec l'ID : ", docRef.id);
    } catch (e) {
        console.error("Erreur lors de l'ajout du document : ", e);
    }
}


async function getElements() {
    // Récupérer tous les documents dans la collection "classes"
    const querySnapshot = await getDocs(collection(db, "classes"));

    // Sélectionner le conteneur où les cartes vont être ajoutées
    const classListContainer = document.getElementById('class-list');

    // Parcourir chaque document récupéré
    querySnapshot.forEach((doc) => {
        // Les données de chaque classe
        const classeData = doc.data();

        // Créer la carte pour chaque classe
        const classCard = `
        <div class="class-card">
          <img src="classe.jpg" alt="Image de la classe" class="class-image">
          <div class="class-info">
              <h2>${classeData.name}</h2>
              <p><strong>Capacité :</strong> ${classeData.capacity}</p>
              <p><strong>Équipements Disponibles :</strong>
              ${classeData.equipements.length === 0 
                  ? "Aucun équipement disponible" 
                  : classeData.equipements.map(equipement => `<span>${equipement}</span>`).join(', ')
              }
              </p>
              <p class="status"><strong>Statut d'Occupation :</strong> ${classeData.status_occupation}</p>
              <p><strong>Horaires d'Occupation :</strong> 8h - 16h</p>
              <p><strong>Localisation :</strong> ${classeData.localisation}</p>
              <p><strong>Occupants :</strong> ${classeData.occupants === "" ? "Aucun occupant" 
                  : classeData.occupants
              }</p>
          </div>
          <br>
          <!-- Switch pour changer le statut de la classe -->
          <div class="switch-container">
            <label class="switch">
              <input type="checkbox" class="status-toggle" data-class-id="${doc.id}" ${classeData.status_occupation === 'Occupée' ? 'checked' : ''}/>
              <span class="slider round"></span>
            </label>
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
    const statusToggles = document.querySelectorAll('.status-toggle');

    statusToggles.forEach((toggle) => {
        toggle.addEventListener('change', async (e) => {
            // On récupère l'id de la classe correspondante
            const classId = e.target.getAttribute('data-class-id');

            // On récupère l'élément qui affiche le statut
            const statusText = e.target.closest('.class-card').querySelector('.status');

            if (e.target.checked) {
                statusText.innerHTML = '<strong>Statut d\'Occupation :</strong> Occupée';
                statusText.style.color = 'red';
                // Appeler la fonction pour mettre à jour le statut dans Firestore
                await updateClassStatus(classId, "Occupée"); // true = occupée
            } else {
                statusText.innerHTML = '<strong>Statut d\'Occupation :</strong> Libre';
                statusText.style.color = 'green';
                // Appeler la fonction pour mettre à jour le statut dans Firestore
                await updateClassStatus(classId, 'Libre'); // false = libre
            }
        });
    });
}

// Fonction pour modifier le statut de la classe
async function updateClassStatus(classId, newStatus) {
    // Référence au document de la classe dans Firestore
    const classRef = doc(db, "classes", classId); // Remplace "classes" par le nom de ta collection

    // Mettre à jour l'attribut `status_occupation` avec le nouveau statut
    await updateDoc(classRef, {
        status_occupation: newStatus
    });
}

// Appeler la fonction pour afficher les éléments
getElements();
