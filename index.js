// index.js


// Importez les fonctions nécessaires depuis Firebase
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

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
                <p><strong>Statut d'Occupation :</strong> ${classeData.status_occupation}</p>
                <p><strong>Horaires d'Occupation :</strong> 8h - 16h</p>
                <p><strong>Localisation :</strong> ${classeData.localisation}</p>
                <p><strong>Occupants :</strong> ${classeData.occupants === "" ? "Aucun occupant" 
                    : classeData.occupants
                }</p>
            </div>
          </div>
        `;

        // Insérer la carte dans le conteneur
        classListContainer.innerHTML += classCard;
    });
}

// Appeler la fonction pour afficher les éléments
getElements();



// getElements();

// Appeler la fonction pour ajouter un utilisateur
