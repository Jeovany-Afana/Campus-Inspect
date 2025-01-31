import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js"; 

import { 
  getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

import { 
  getAuth, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDibbuBJ2p88T26P0BAB-o_exunK0GYFdA",
  authDomain: "inspecteur-de-classes.firebaseapp.com",
  projectId: "inspecteur-de-classes",
  storageBucket: "inspecteur-de-classes.appspot.com",
  messagingSenderId: "572661846292",
  appId: "1:572661846292:web:aeb0374db2d414fef9f201",
  measurementId: "G-NVN5GERDV6"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let isPresident = false;  // Variable pour vérifier si l'utilisateur est président

// Fonction pour récupérer les membres du club
async function fetchClubMembers() {
  const clubId = document.getElementById('club-members').dataset.clubId;
  const membersList = document.getElementById('members-list');
  membersList.innerHTML = '';  // Réinitialisation de la liste pour éviter les doublons

  try {
    // Étape 1 : Récupérer le document du club en utilisant l'ID
    const clubRef = doc(db, 'clubs', clubId);
    const clubDoc = await getDoc(clubRef);

    if (!clubDoc.exists()) {
      membersList.innerHTML = `<p class="text-gray-500">Aucun membre trouvé pour ce club.</p>`;
      return;
    }

    const clubData = clubDoc.data();
    const memberUIDs = clubData.membres || [];

    if (memberUIDs.length === 0) {
      membersList.innerHTML = `<p class="text-gray-500">Aucun membre trouvé pour ce club.</p>`;
      return;
    }

    document.getElementById("nombreMembres").innerHTML += ` (${memberUIDs.length})`;

    for (const uid of memberUIDs) {
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where("uid", "==", uid));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        const userId = userSnapshot.docs[0].id; // ID du document utilisateur

        // Vérifier si l'étudiant est déjà marqué présent
        const isPresent = userData.presence_club || false;

        // Créer la carte du membre avec le bouton si l'utilisateur connecté est président
        const memberCard = `
          <div class="flex items-center space-x-4 border-b pb-2" data-user-id="${userId}">
            <img src="${userData.photoURLOk || 'https://via.placeholder.com/48'}" alt="Avatar" class="w-12 h-12 rounded-full">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">${userData.pseudoOk || 'Nom inconnu'} | <span style="font-weight:100;">${userData.classe}</span></h3>
              <p class="text-sm text-gray-500">${userData.role.toUpperCase() || 'Membre'}</p>
            </div>
            ${isPresident ? `
              <button 
                class="px-3 py-1 text-white ${isPresent ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} rounded-md" 
                ${isPresent ? 'disabled' : ''} 
                onclick="markPresence('${userId}', this)">
                ${isPresent ? 'Déjà Présent' : 'Marquer Présent'}
              </button>
            ` : ''}
          </div>
        `;

        membersList.insertAdjacentHTML('beforeend', memberCard);
      }
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des membres :", error);
    membersList.innerHTML = `<p class="text-red-500">Erreur lors de la récupération des membres.</p>`;
  }
}

// Fonction pour marquer un étudiant comme présent
window.markPresence = async function(userId, button) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { presence_club: true });

    // Désactiver le bouton après mise à jour
    button.innerText = 'Déjà Présent';
    button.classList.remove('bg-green-500', 'hover:bg-green-600');
    button.classList.add('bg-gray-400', 'cursor-not-allowed');
    button.disabled = true;
  } catch (error) {
    console.error("Erreur lors du marquage de présence :", error);
  }
}

// Vérifier si l'utilisateur est président avant d'afficher les boutons
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      isPresident = userDoc.data().president_club === true;
    }
    
    fetchClubMembers();
  }
});
