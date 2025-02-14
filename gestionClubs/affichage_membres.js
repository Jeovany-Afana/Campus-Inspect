import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDibbuBJ2p88T26P0BAB-o_exunK0GYFdA",
  authDomain: "inspecteur-de-classes.firebaseapp.com",
  projectId: "inspecteur-de-classes",
  storageBucket: "inspecteur-de-classes.appspot.com",
  messagingSenderId: "572661846292",
  appId: "1:572661846292:web:aeb0374db2d414fef9f201",
  measurementId: "G-NVN5GERDV6",
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let isPresident = false; // Vérifie si l'utilisateur est président

// Fonction pour récupérer les membres du club
async function fetchClubMembers(userClubId) {
  const membersList = document.getElementById("members-list");
  membersList.innerHTML = ""; // Réinitialisation de la liste pour éviter les doublons

  try {
    // Étape 1 : Requête Firestore pour récupérer les utilisateurs ayant le même `id_club`
    const usersRef = collection(db, "users");
    const clubMembersQuery = query(
      usersRef,
      where("id_club", "==", userClubId)
    );
    const userSnapshot = await getDocs(clubMembersQuery);

    if (userSnapshot.empty) {
      membersList.innerHTML = `<p class="text-gray-500">Aucun membre trouvé pour ce club.</p>`;
      return;
    }

    document.getElementById(
      "nombreMembres"
    ).innerHTML = `(${userSnapshot.size})`;

    // Étape 2 : Afficher chaque membre
    userSnapshot.forEach((doc) => {
      const userData = doc.data();
      const userId = doc.id;

      // Vérifier si l'étudiant est déjà marqué présent
      const isPresent = userData.presence_club || false;

      // Créer la carte du membre avec le bouton si l'utilisateur connecté est président
      const memberCard = `
        <div class="flex items-center space-x-4 border-b pb-2" data-user-id="${userId}">
          <img src="${
            userData.photoURLOk || "https://via.placeholder.com/48"
          }" alt="Avatar" class="w-12 h-12 rounded-full">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">${
              userData.pseudoOk || "Nom inconnu"
} | <span style="font-weight:100;">${userData.classe}</span></h3>
            <p class="text-sm text-gray-500">${
              userData.role.toUpperCase() || "Membre"
            }</p>
          </div>
          ${
            isPresident
              ? `
            <button 
              class="px-3 py-1 text-white ${
                isPresent
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              } rounded-md" 
              ${isPresent ? "disabled" : ""} 
              onclick="markPresence('${userId}', this)">
              ${isPresent ? "Déjà Présent" : "Marquer Présent"}
            </button>
          `
              : ""
          }
        </div>
      `;

      membersList.insertAdjacentHTML("beforeend", memberCard);
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des membres :", error);
    membersList.innerHTML = `<p class="text-red-500">Erreur lors de la récupération des membres.</p>`;
  }
}

// Fonction pour marquer un étudiant comme présent et incrémenter manuellement "nombre_presence_club"
window.markPresence = async function (userId, button) {
  try {
    const userRef = doc(db, "users", userId);

    // Récupérer le document pour obtenir la valeur actuelle de 'nombre_presence_club'
    const userSnapshot = await getDoc(userRef);
    let currentCount = 0;
    if (userSnapshot.exists()) {
      const data = userSnapshot.data();
      currentCount = typeof data.nombre_presence_club === "number" ? data.nombre_presence_club : 0;
    }
    // Calculer la nouvelle valeur
    const newCount = currentCount + 1;

    // Mettre à jour le document : marquer comme présent et mettre à jour le compteur
    await updateDoc(userRef, {
      presence_club: true,
      nombre_presence_club: newCount
    });

    // Désactiver le bouton après mise à jour
    button.innerText = "Déjà Présent";
    button.classList.remove("bg-green-500", "hover:bg-green-600");
    button.classList.add("bg-gray-400", "cursor-not-allowed");
    button.disabled = true;
  } catch (error) {
    console.error("Erreur lors du marquage de présence :", error);
  }
};

// Vérifier si l'utilisateur est président et récupérer `id_club`
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log(`🔍 Utilisateur connecté : ${user.uid}`);

    try {
      // Récupérer l'utilisateur en utilisant where() et son UID
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("uid", "==", user.uid));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0]; // Premier document trouvé
        const userData = userDoc.data();

        // Vérifier si l'utilisateur est président
        isPresident = !!userData.president_club; // Convertir en booléen
        console.log(`👑 Statut de président : ${isPresident ? "Oui" : "Non"}`);

        // Vérifier l'ID du club de l'utilisateur
        const userClubId = userData.id_club;
        if (userClubId) {
          console.log(`🏫 ID du club de l'utilisateur : ${userClubId}`);
          fetchClubMembers(userClubId);
        } else {
          console.warn("⚠ L'utilisateur n'a pas de club associé.");
        }
      } else {
        console.error("❌ Utilisateur non trouvé dans Firestore.");
      }
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération de l'utilisateur :",
        error
      );
    }
  } else {
    console.warn("⚠ Aucun utilisateur connecté.");
  }
});
