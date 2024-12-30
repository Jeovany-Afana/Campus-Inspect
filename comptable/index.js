// Importez les fonctions nécessaires depuis Firebase
import {
  getFirestore,
  collection,
  query,
  where,
  getDoc,
  onSnapshot,
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
const aujourdHui = new Date();
const jourDuMois = aujourdHui.getDate();
const studentSearchKairos = document.getElementById("studentSearchKairos");
const searchInput = document.getElementById("studentSearch");
const classFilter = document.getElementById("classFilter");
console.log(jourDuMois);


window.addEventListener("load", function () {});

logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      // Déconnexion réussie
      console.log("Déconnexion réussie");
      window.location.href = "../login/index.html"; // Redirige vers la page de connexion
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

      document.getElementById("userName").innerHTML = userData.pseudoOk;
      document
        .getElementById("userPhoto")
        .setAttribute("src", userData.photoURLOk);
      userProfil.style.display = "block"; //Si l'utilisateur est connecté on affiche sa photo de profile
      logoutButton.style.display = "block"; //Si l'utilisateur est connecté on affiche le bouton de déconnexion

      
    });
  } else {
    console.log("Aucune donnée trouvée pour cet utilisateur");
  }
}


let derniereMiseAJour = null;
// Fonction pour décrémenter la solvabilité de tous les étudiants chaque 5 du mois
async function updateSolvabilityForAllStudents() {
  const aujourdHui = new Date(); // Récupère la date actuelle

  // Vérifie si aujourd'hui est le 5
  if (aujourdHui.getDate() === 5) {
    console.log("Vérification et mise à jour des solvabilités...");

    // Récupère les étudiants ayant le rôle "etudiant"
    const q = query(collection(db, "users"), where("role", "==", "etudiant"));
    const querySnapshot = await getDocs(q);

    // Parcourt les étudiants récupérés
    for (const doc of querySnapshot.docs) {
      const student = doc.data(); // Récupère les données d'un étudiant
      const dureeSolvabilite = student.dureeSolvabilite || 0; // Définit la durée de solvabilité (par défaut à 0 si non définie)
      const derniereMiseAJour = student.derniereMiseAJour
        ? new Date(student.derniereMiseAJour) // Convertit la valeur en objet Date si elle existe
        : null;

      // Vérifie si la mise à jour a déjà été effectuée ce mois-ci
      if (
        !derniereMiseAJour || //Si aucune mise à jour précédente
        derniereMiseAJour.getFullYear() !== aujourdHui.getFullYear() || // Si l'année est différente
        derniereMiseAJour.getMonth() !== aujourdHui.getMonth() // Si le mois est différent
      ) {
        if (dureeSolvabilite > 0) {
          // Décrémente la durée de solvabilité
          const nouvelleDureeSolvabilite = dureeSolvabilite - 1;

          // Met à jour dans Firestore
          await updateDoc(doc.ref, {
            dureeSolvabilite: nouvelleDureeSolvabilite,
            a_jour: nouvelleDureeSolvabilite > 0, // Marque comme "À jour" si dureeSolvabilite > 0
            derniereMiseAJour: aujourdHui.toISOString(), // Stocke une date complète au format ISO
          });

          console.log(
            `Solvabilité de ${student.pseudoOk} mise à jour : ${nouvelleDureeSolvabilite} mois restants`
          );
        } else {
          console.log(`${student.pseudoOk} n'a plus de solvabilité restante.`);
        }
      } else {
        console.log(
          `Mise à jour déjà effectuée pour ${student.pseudoOk} ce mois-ci.`
        );
      }
    }
  } else {
    console.log("Aujourd'hui n'est pas le 5. Pas de mise à jour.");
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
  }
});

document.getElementById("refreshButton").addEventListener("click", function () {
  location.reload();
});

/// Fonction pour récupérer les données et mettre à jour le tableau
async function loadStudents() {


  // Récupérer les documents de la collection 'users'
  const q = query(collection(db, "users"), where("role", "==", "etudiant"));
  const querySnapshot = await getDocs(q);

  document.getElementById("numberOfStudent").innerHTML = `Nombre d'étudiants : ${querySnapshot.size}`;

  // Créer un tableau pour stocker les étudiants
  let studentsArray = [];

  if (!querySnapshot.empty) {
    // Utilisez un for...of pour attendre chaque mise à jour et éviter l'asynchronisme de forEach
    for (const doc of querySnapshot.docs) {
      // Récupérer les données de chaque étudiant
      const student = doc.data();

      // Vérifier la solvabilité : Si la durée de solvabilité est <= 0, l'étudiant n'est plus à jour
      if (student.dureeSolvabilite <= 0) {
        await updateDoc(doc.ref, {
          a_jour: false, // Marquer l'étudiant comme "Pas à jour"
        });
      }

      // Ajouter l'étudiant dans le tableau
      studentsArray.push({
        id: doc.id,
        pseudoOk: student.pseudoOk,
        classe: student.classe,
        a_jour: student.a_jour,
        photoURLOk: student.photoURLOk,
        dureeSolvabilite: student.dureeSolvabilite,
        kairos: student.kairos,
        classe: student.classe,
        dureeSolvabiliteJour: student.dureeSolvabiliteJour,
        trancheRegle: student.trancheRegle,
        nombreTotalTranches: student.nombreTotalTranches,

      });
    }

    // Une fois que le tableau est rempli, on peut afficher les étudiants
    console.log("Liste des étudiants chargée : ", studentsArray);
    displayStudents(studentsArray);
  }


  // Remplir la liste des classes
  populateClassFilter(studentsArray);

  // Fonction pour filtrer et afficher les étudiants
  function filterStudents() {
    const kairosSearch = studentSearchKairos.value.toLowerCase();
    const nameSearch = searchInput.value.toLowerCase();
    const selectedClass = classFilter.value;

    const filteredStudents = studentsArray.filter((student) => {
      const matchesKairos = String(student.kairos).toLowerCase().includes(kairosSearch);
      const matchesName = student.pseudoOk.toLowerCase().includes(nameSearch);
      const matchesClass = selectedClass ? student.classe === selectedClass : true;
      return matchesKairos && matchesName && matchesClass;
    });

    displayStudents(filteredStudents);
  }

  // Ajouter les événements
  studentSearchKairos.addEventListener("input", filterStudents);
  searchInput.addEventListener("input", filterStudents);
  classFilter.addEventListener("change", filterStudents);

  // Générer les options de la liste déroulante
  function populateClassFilter(students) {
    const classFilter = document.getElementById("classFilter");
    const classes = [...new Set(students.map((student) => student.classe))];
    classes.forEach((classe) => {
      const option = document.createElement("option");
      option.value = classe;
      option.textContent = classe;
      classFilter.appendChild(option);
    });
  }

  // Afficher les étudiants initiaux
  displayStudents(studentsArray);

}



// Fonction pour afficher les étudiants dans le tableau
function displayStudents(students) {
  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = ""; // Vider le tableau avant de le remplir à nouveau

  students.forEach((student) => {
    // Créer une nouvelle ligne de tableau
    const row = document.createElement("tr");

    row.innerHTML = `
      <td style="text-align: center;"><b>${student.kairos}</b></td>
      <td style="font-family:Georgia, 'Times New Roman', Times, serif; font-size: 1.2rem; text-align:center;"><b>${student.pseudoOk.toUpperCase()}</b></td>
      <td style="text-align: center; color:${student.dureeSolvabilite > 0 ? "green" : "red"};font-size: 1.5rem;"><b>${student.dureeSolvabilite}</b></td>
      <td>${student.classe}</td>
      <td class="status ${student.a_jour ? "up-to-date" : "not-up-to-date"}">
          ${student.a_jour ? "À jour" : "Pas à jour"}
      </td>
      <td class="action-buttons">
          <button class="icon-btn up-to-date" onclick="markAsUpToDate(this, '${student.id}')">
              <i class="fas fa-check-circle"></i>
          </button>
      </td>
      <td class="action-buttons">
          <button class="icon-btn not-up-to-date" onclick="markAsNotUpToDate(this, '${student.id}')">
              <i class="fas fa-times-circle"></i>
          </button>
      </td>
      <td>
          <img src="${student.photoURLOk}" style="max-width: 100%; height: auto;">
      </td>
    `;

    // Ajouter la nouvelle ligne dans le tableau
    tableBody.appendChild(row);
  });
}

// Fonction pour écouter les changements en temps réel
function listenToStudents() {
  const studentsQuery = query(
    collection(db, "users"),
    where("role", "==", "etudiant")
  );

  onSnapshot(studentsQuery, (snapshot) => {
    const studentsArray = [];
    snapshot.forEach((doc) => {
      const student = doc.data();
      studentsArray.push({
        id: doc.id,
        pseudoOk: student.pseudoOk,
        classe: student.classe,
        a_jour: student.a_jour,
        photoURLOk: student.photoURLOk,
        dureeSolvabilite: student.dureeSolvabilite,
        kairos: student.kairos,
      });
    });

    // Met à jour le tableau avec les données en temps réel
    displayStudents(studentsArray);
  });
}




window.onload = async function () {
  const loadingOverlay = document.getElementById('loadingOverlay'); // Fond sombre et spinner

  try {
    loadingOverlay.style.display = 'flex'; // Afficher le spinner et le fond sombre
    await loadStudents(); // Attendre le chargement des étudiants
    updateSolvabilityForAllStudents(); // Met à jour les solvabilités
  } catch (error) {
    alert("Une erreur est survenue lors du chargement, veuillez réessayer ultérieurement.");
    console.error("Erreur lors du chargement :", error);
  } finally {
    loadingOverlay.style.display = 'none'; // Masquer le spinner et le fond sombre
  }
};



// Appeler la fonction pour démarrer l'écoute en temps réel
listenToStudents();

// Fonction pour marquer un étudiant comme "À jour" en précisant la durée
window.markAsUpToDate = async function (button, studentId) {
  const row = button.closest("tr"); // Récupère la ligne de la table correspondante à l'étudiant
  const statusCell = row.querySelector(".status"); // Cellule où le statut sera mis à jour

  // Demande combien de mois l'étudiant est à jour
  let solvabilite = parseInt(
    prompt("Précisez la durée (en mois) pour laquelle l'étudiant est à jour")
  );

  // Vérifie si la durée est valide
  if (isNaN(solvabilite) || solvabilite <= 0) {
    alert("Durée invalide. Veuillez entrer un nombre positif.");
    return;
  }

  const docRef = doc(db, "users", studentId); // Référence à l'étudiant dans Firestore
  const date = new Date(); // Date du paiement

  // Mise à jour dans Firestore
  await updateDoc(docRef, {
    dureeSolvabilite: solvabilite,
    dernier_paiement: date.toISOString(), // Enregistre la date du dernier paiement
    a_jour: true, // Marque l'étudiant comme "À jour"
    derniereMiseAJour: date.toISOString(), // Stocke une date complète au format ISO
  });

  // Met à jour l'interface utilisateur
  statusCell.textContent = "À jour"; // Modifie le texte du statut dans la table
  statusCell.classList.remove("not-up-to-date"); // Supprime la classe "non à jour"
  statusCell.classList.add("up-to-date"); // Ajoute la classe "à jour"

  loadStudents();
  console.log(
    `Étudiant ${studentId} marqué comme à jour pour ${solvabilite} mois`
  );
  alert(
    `Étudiant marqué comme à jour pour ${solvabilite} mois`
  );
};

// Fonction pour marquer un étudiant comme "Non à jour"
window.markAsNotUpToDate = function (button, studentId) {
  // 1. Trouver la ligne du tableau contenant le bouton cliqué
  const row = button.closest("tr");
  // Comme précédemment, cela nous permet de trouver la ligne du tableau.

  // 2. Trouver la cellule qui affiche le statut de l'étudiant
  const statusCell = row.querySelector(".status");

  // 3. Mettre à jour le texte du statut pour indiquer que l'étudiant n'est pas à jour
  statusCell.textContent = "Non à jour";

  // 4. Modifier les classes CSS pour le style
  statusCell.classList.remove("up-to-date"); // Retire la classe 'up-to-date'
  statusCell.classList.remove("enRegle");
  statusCell.classList.add("not-up-to-date"); // Ajoute la classe 'not-up-to-date'

  // 5. Mettre à jour Firestore pour marquer l'étudiant comme non à jour
  const docRef = doc(db, "users", studentId);
  // Comme pour la fonction précédente, cela crée une référence au document de l'étudiant.

  updateDoc(docRef, { a_jour: false, dureeSolvabilite: 0 }) // Met à jour le champ 'a_jour' à `false`
    .then(() => {
      loadStudents();
      console.log("Étudiant marqué comme non à jour"); // Message de confirmation dans la console
      alert("Étudiant marqué comme non à jour"); // Message d'alerte pour l'utilisateur
    })
    .catch((error) => {
      console.error("Erreur lors de la mise à jour : ", error); // Affiche une erreur en cas de problème
    });
};



// // Fonction pour ajouter les champs à tous les étudiants
// async function addFieldsToAllStudents() {
//   const db = getFirestore();
  
//   // Crée une requête pour obtenir tous les étudiants (role == "etudiant")
//   const q = query(collection(db, "users"), where("role", "==", "etudiant"));
  
//   // Récupère les documents des étudiants
//   const querySnapshot = await getDocs(q);

//   // Parcourt chaque document (étudiant) et ajoute les nouveaux champs
//   for (const docSnap of querySnapshot.docs) {
//     const studentRef = doc(db, "users", docSnap.id);
    
//     try {
//       // Met à jour chaque étudiant pour ajouter les nouveaux champs avec les valeurs par défaut
//       await updateDoc(studentRef, {
//       present: 0,
//       });
//       console.log(`Champs ajoutés pour l'étudiant ${docSnap.id}`);
//     } catch (error) {
//       console.error(`Erreur lors de l'ajout des champs pour l'étudiant ${docSnap.id}:`, error);
//     }
//   }
// }

// // Appel de la fonction
// addFieldsToAllStudents();
