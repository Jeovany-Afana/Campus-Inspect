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
       
       if (userData.role === "responsable") 
        {

          buttonsActions.forEach(function (element){
            element.style.display="none";
          });
            getElements().then(() => {// Appeler getElements ici pour être sûr que les classes sont ajoutées avant de manipuler switchButton
                    const switchButtons = document.querySelectorAll('.switch-container');
                    switchButtons.forEach((switchButton) => {
                       switchButton.style.display = "block";
                        
                    }, 1000);
            });
       } 

       else if (userData.role === "directeur" || userData.role === "administration") {
        buttonsActions.forEach(function (element){
          element.style.display="block";
        });

     
          
        
        
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
    
    }
  });
  
  document.getElementById('refreshButton').addEventListener('click', function() {
    location.reload();
});



/// Fonction pour récupérer les données et mettre à jour le tableau
async function loadStudents() {
const tableBody = document.querySelector("tbody"); // Sélectionner le corps du tableau

  // Récupérer les documents de la collection 'users'
  const q = query(collection(db, "users"), where("role", "==", "etudiant"));
  const querySnapshot = await getDocs(q);

  // Créer un tableau pour stocker les étudiants
  let studentsArray = [];

  if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
          // Récupérer les données de chaque étudiant
          const student = doc.data();

          // Ajouter l'étudiant dans le tableau
          studentsArray.push({
              id: doc.id,
              pseudoOk: student.pseudoOk,
              classe: student.classe,
              a_jour: student.a_jour,
              photoURLOk: student.photoURLOk
          });
      });

      // Afficher les étudiants dans le tableau
      displayStudents(studentsArray);
  }

  // Ajoute l'événement de recherche
  const searchInput = document.getElementById('studentSearch');
  searchInput.addEventListener('input', function() {
      const searchTerm = searchInput.value.toLowerCase(); // Texte recherché
      const filteredStudents = studentsArray.filter(student => 
          student.pseudoOk.toLowerCase().includes(searchTerm)
      );
      displayStudents(filteredStudents); // Mettre à jour le tableau avec les résultats filtrés
  });
}

// Fonction pour afficher les étudiants dans le tableau
function displayStudents(students) {
  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = ""; // Vider le tableau avant de le remplir à nouveau

  students.forEach((student) => {
      // Créer une nouvelle ligne de tableau
      const row = document.createElement("tr");

      // Ajouter les cellules de données
      row.innerHTML = `
          <td>${student.id}</td>
          <td>${student.pseudoOk}</td>
          <td>${student.classe}</td>
          <td class="status ${student.a_jour ? 'up-to-date' : 'not-up-to-date'}">
              ${student.a_jour ? 'À jour' : 'Pas à jour'}
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

// Appeler la fonction pour charger les étudiants quand la page est chargée
window.onload = loadStudents;


// Fonction pour marquer un étudiant comme "À jour"
window.markAsUpToDate = function(button, studentId) {
    // 1. Trouver la ligne du tableau contenant le bouton cliqué
    const row = button.closest('tr');
    // `button.closest('tr')` cherche le premier élément parent `<tr>` de l'élément `button`.
    // Cela nous permet de savoir dans quelle ligne du tableau se trouve le bouton cliqué.

    // 2. Trouver la cellule qui affiche le statut de l'étudiant
    const statusCell = row.querySelector('.status');
    // `row.querySelector('.status')` sélectionne la première cellule (élément `<td>`) 
    // de la ligne qui a la classe `status`, où nous allons afficher le statut de l'étudiant.

    // 3. Mettre à jour le texte du statut pour indiquer que l'étudiant est à jour
    statusCell.textContent = 'À jour';
    // `textContent` met à jour le contenu textuel de `statusCell` pour afficher "À jour".

    // 4. Modifier les classes CSS pour le style
    statusCell.classList.remove('not-up-to-date'); // Retire la classe 'not-up-to-date'
    statusCell.classList.add('up-to-date'); // Ajoute la classe 'up-to-date'
    // `classList.remove` et `classList.add` permettent de gérer les classes CSS de l'élément.
    // Cela permet de changer l'apparence de la cellule en fonction du statut.

    // 5. Mettre à jour Firestore pour marquer l'étudiant comme à jour
    const docRef = doc(db, "users", studentId);
    // `doc(db, "users", studentId)` crée une référence au document de l'étudiant dans la collection 'users'
    // en utilisant son identifiant `studentId`.

    updateDoc(docRef, { a_jour: true }) // Met à jour le champ 'a_jour' à `true`
        .then(() => {
            console.log("Étudiant marqué comme à jour"); // Message de confirmation dans la console
        })
        .catch((error) => {
            console.error("Erreur lors de la mise à jour : ", error); // Affiche une erreur en cas de problème
        });
};

// Fonction pour marquer un étudiant comme "Non à jour"
window.markAsNotUpToDate = function(button, studentId) {
    // 1. Trouver la ligne du tableau contenant le bouton cliqué
    const row = button.closest('tr');
    // Comme précédemment, cela nous permet de trouver la ligne du tableau.

    // 2. Trouver la cellule qui affiche le statut de l'étudiant
    const statusCell = row.querySelector('.status');

    // 3. Mettre à jour le texte du statut pour indiquer que l'étudiant n'est pas à jour
    statusCell.textContent = 'Non à jour';

    // 4. Modifier les classes CSS pour le style
    statusCell.classList.remove('up-to-date'); // Retire la classe 'up-to-date'
    statusCell.classList.add('not-up-to-date'); // Ajoute la classe 'not-up-to-date'

    // 5. Mettre à jour Firestore pour marquer l'étudiant comme non à jour
    const docRef = doc(db, "users", studentId);
    // Comme pour la fonction précédente, cela crée une référence au document de l'étudiant.

    updateDoc(docRef, { a_jour: false }) // Met à jour le champ 'a_jour' à `false`
        .then(() => {
            console.log("Étudiant marqué comme non à jour"); // Message de confirmation dans la console
        })
        .catch((error) => {
            console.error("Erreur lors de la mise à jour : ", error); // Affiche une erreur en cas de problème
        });
};





