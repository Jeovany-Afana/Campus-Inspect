// index.js CORRIGÉ

// Importez les fonctions nécessaires depuis Firebase
import {
  getFirestore,
  collection,
  query,
  where,
  getDoc,
  doc,
  getDocs,
  updateDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-functions.js";

import {showStudentInfo} from "./studentModal/student-modal.js";

// RÉSOLUTION DU CONFLIT : Ne pas réinitialiser Firebase si déjà initialisé
let db, auth, functions, submitVoteCallable;

try {
  // Essayer d'utiliser les instances existantes
  db = getFirestore();
  auth = getAuth();
  functions = getFunctions(undefined, "europe-west1");
  submitVoteCallable = httpsCallable(functions, "submitVote");
} catch (error) {
  console.warn("Firebase déjà initialisé dans le HTML, utilisation des instances globales");
}

// Variables globales
export let donneeUtilisateur; //Données de l'utilisateur connecté
let currentUserDocId = null; // ID du document Firestore de l'utilisateur connecté

// Éléments du DOM (avec vérification)
const logoutButton = document.getElementById("logoutButton");
const studentFiltersSection = document.getElementById("studentFiltersSection") || document.getElementById("studentFilters");
const studentYearSelect = document.getElementById("student-academic-year");
const studentClassSelect = document.getElementById("student-class");
const loginButton = document.getElementById("loginButton");

// ✅ FONCTION AJOUTÉE POUR CORRIGER L'ERREUR
function updateUIForUser() {
  // Cette fonction met à jour l'interface pour l'utilisateur connecté
  console.log("Mise à jour de l'interface utilisateur");
  // Tu peux ajouter ici d'autres mises à jour d'UI si nécessaire
}

// MODIFIER LA FONCTION openVotingModal POUR AJOUTER LE BULLETIN NUL
async function openVotingModal(voteInfo) {
  // Récupérer les candidats
  const candidates = {};

  try {
    const c1Ref = doc(db, "elections", "active", "candidates", "c1");
    const c2Ref = doc(db, "elections", "active", "candidates", "c2");

    const [c1Snap, c2Snap] = await Promise.all([
      getDoc(c1Ref),
      getDoc(c2Ref)
    ]);

    if (c1Snap.exists()) candidates.c1 = c1Snap.data();
    if (c2Snap.exists()) candidates.c2 = c2Snap.data();

  } catch (error) {
    console.error("Erreur lors de la récupération des candidats:", error);
  }

  // Créer le modal de vote AVEC BULLETIN NUL
  const modalHTML = `
    <div id="votingModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-4xl w-full overflow-hidden animate-scaleIn">
        <!-- En-tête -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold">Vote Électronique</h2>
              <p class="text-blue-100 mt-1">
                Bureau: ${voteInfo.bureauName} • Année: ${voteInfo.electionYear}
              </p>
            </div>
            <button id="closeVotingModal" class="text-2xl hover:scale-110 transition">&times;</button>
          </div>
        </div>
        
        <!-- Contenu -->
        <div class="p-6">
          <div class="mb-6">
            <p class="text-gray-600 mb-4 text-center">
              <i class="fas fa-info-circle text-blue-500 mr-2"></i>
              Sélectionnez un candidat OU votez "Bulletin nul" si vous ne souhaitez soutenir aucun candidat.
            </p>
            
            <div class="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded">
              <div class="flex">
                <i class="fas fa-exclamation-triangle text-amber-500 text-xl mr-3 mt-1"></i>
                <div>
                  <h4 class="font-bold text-amber-800">Important</h4>
                  <p class="text-amber-700 text-sm mt-1">
                    • Votez pour un candidat si vous le soutenez<br>
                    • Votez "Bulletin nul" si aucun candidat ne vous convient<br>
                    • Une fois validé, votre choix est <strong>définitif</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Candidats -->
          <div class="grid md:grid-cols-2 gap-6 mb-8">
            <!-- Candidat 1 -->
            <div class="candidate-card border-2 border-blue-100 rounded-xl p-5 hover:border-blue-300 transition cursor-pointer" data-candidate="c1">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-16 h-16 rounded-full overflow-hidden bg-blue-100">
                  ${candidates.c1?.photoURL ?
    `<img src="${candidates.c1.photoURL}" alt="Candidat 1" class="w-full h-full object-cover">` :
    `<div class="w-full h-full flex items-center justify-center text-blue-600 font-bold">C1</div>`
}
                </div>
                <div>
                  <h3 class="font-bold text-lg">${candidates.c1?.name || "Candidat 1"}</h3>
                  <p class="text-sm text-gray-500">${candidates.c1?.slogan || ""}</p>
                </div>
              </div>
              <button class="vote-candidate-btn w-full py-3 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition" data-candidate="c1">
                <i class="far fa-check-circle mr-2"></i>
                Voter pour ce candidat
              </button>
            </div>
            
            <!-- Candidat 2 -->
            <div class="candidate-card border-2 border-blue-100 rounded-xl p-5 hover:border-blue-300 transition cursor-pointer" data-candidate="c2">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-16 h-16 rounded-full overflow-hidden bg-amber-100">
                  ${candidates.c2?.photoURL ?
    `<img src="${candidates.c2.photoURL}" alt="Candidat 2" class="w-full h-full object-cover">` :
    `<div class="w-full h-full flex items-center justify-center text-amber-600 font-bold">C2</div>`
}
                </div>
                <div>
                  <h3 class="font-bold text-lg">${candidates.c2?.name || "Candidat 2"}</h3>
                  <p class="text-sm text-gray-500">${candidates.c2?.slogan || ""}</p>
                </div>
              </div>
              <button class="vote-candidate-btn w-full py-3 bg-amber-100 text-amber-700 font-semibold rounded-lg hover:bg-amber-200 transition" data-candidate="c2">
                <i class="far fa-check-circle mr-2"></i>
                Voter pour ce candidat
              </button>
            </div>
          </div>
          
          <!-- Section Bulletin Nul -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <h3 class="text-xl font-bold text-center text-gray-800 mb-4">
              <i class="fas fa-ban text-gray-500 mr-2"></i>
              Option alternative
            </h3>
            
            <div class="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition cursor-pointer" data-candidate="null">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    <i class="fas fa-ban text-gray-500 text-2xl"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-lg text-gray-700">Bulletin nul</h3>
                    <p class="text-sm text-gray-500">
                      Je ne souhaite soutenir aucun des candidats présentés
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    VOTE BLANC
                  </div>
                </div>
              </div>
              
              <div class="bg-gray-100 p-4 rounded-lg mb-4">
                <p class="text-sm text-gray-600 text-center">
                  <i class="fas fa-info-circle mr-2"></i>
                  Un bulletin nul est comptabilisé dans les votes totaux, mais ne compte pas pour un candidat.
                </p>
              </div>
              
              <button class="vote-null-btn w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition" data-candidate="null">
                <i class="fas fa-ban mr-2"></i>
                Voter "Bulletin nul"
              </button>
            </div>
          </div>
          
          <div class="text-center text-sm text-gray-500 mt-6">
            <i class="fas fa-lock mr-2"></i>
            Votre vote est sécurisé, anonyme et définitif
          </div>
        </div>
      </div>
    </div>
  `;

  // Ajouter le modal au body
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Gérer la fermeture
  document.getElementById('closeVotingModal').addEventListener('click', () => {
    document.getElementById('votingModal').remove();
  });

  // Gérer le clic en dehors
  document.getElementById('votingModal').addEventListener('click', (e) => {
    if (e.target.id === 'votingModal') {
      e.target.remove();
    }
  });

  // Gérer le choix d'un candidat
  document.querySelectorAll('.vote-candidate-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const candidateId = e.target.closest('[data-candidate]').dataset.candidate;
      await confirmVoteChoice(candidateId, voteInfo, candidates[candidateId]?.name || `Candidat ${candidateId}`);
    });
  });

  // Gérer le choix du bulletin nul
  document.querySelector('.vote-null-btn').addEventListener('click', async (e) => {
    await confirmNullVote(voteInfo);
  });

  // Animation d'entrée
  setTimeout(() => {
    document.querySelector('#votingModal .animate-scaleIn').classList.add('scale-100');
  }, 10);
}

// AJOUTER CE CSS POUR AMÉLIORER L'APPARENCE
const style = document.createElement('style');
style.textContent = `
  /* Animation pour les cartes de vote */
  .candidate-card {
    transition: all 0.3s ease;
    position: relative;
  }
  
  .candidate-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  .candidate-card[data-candidate="null"]:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  }
  
  /* Style pour le bouton de bulletin nul */
  .vote-null-btn {
    transition: all 0.3s ease;
  }
  
  .vote-null-btn:hover {
    background-color: #d1d5db !important;
    color: #374151 !important;
  }
  
  /* Badge "Bulletin nul" */
  .vote-badge-null {
    background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
    color: white;
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  
  /* Style pour l'indicateur de sélection */
  .selected-vote {
    border-color: #3B82F6 !important;
    background-color: #f0f9ff;
  }
  
  .selected-null {
    border-color: #6b7280 !important;
    background-color: #f9fafb;
  }
`;
document.head.appendChild(style);

// Charger les années académiques dans le select (collection "annee_academique")
async function loadAcademicYearsIntoSelect() {
  if (!studentYearSelect) return;

  // Réinitialiser le select
  studentYearSelect.innerHTML =
      '<option value="" disabled selected>Choisissez une année académique</option>';

  try {
    const snapshot = await getDocs(collection(db, "annee_academique"));
    snapshot.forEach((docSnap) => {
      const id = docSnap.id; // ex: "2024-2025"

      const option = document.createElement("option");
      option.value = id;
      option.textContent = id;
      studentYearSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Erreur lors du chargement des années académiques :", err);
  }
}

// Initialiser les filtres (année + classe) pour l'étudiant connecté
function initStudentFilters(userData) {
  if (!studentFiltersSection || !studentYearSelect || !studentClassSelect) return;

  // Afficher le bandeau
  studentFiltersSection.classList.remove("hidden");

  // 🔒 Vérifier si déjà verrouillé côté Firestore
  let isYearLocked  = userData.annee_academique_locked === true;
  let isClassLocked = userData.classe_locked === true;

  // Désactiver les selects si déjà verrouillés
  if (isYearLocked) {
    studentYearSelect.disabled = true;
  }
  if (isClassLocked) {
    studentClassSelect.disabled = true;
  }

  // Charger les années académiques et pré-sélectionner si possible
  loadAcademicYearsIntoSelect().then(() => {
    // 1) Priorité : valeur déjà choisie sur cet appareil
    const localYear  = localStorage.getItem("student_academic_year");
    const localClass = localStorage.getItem("student_class");

    // 2) Sinon : dernière année du tableau annee_academique_id
    let yearToSelect = localYear;
    if (
      !yearToSelect &&
        Array.isArray(userData.annee_academique_id) &&
        userData.annee_academique_id.length > 0
    ) {
      yearToSelect =
          userData.annee_academique_id[userData.annee_academique_id.length - 1];
    }

    if (yearToSelect) {
      studentYearSelect.value = yearToSelect;
    }

    // Classe : soit celle déjà choisie, soit celle du profil
    const classToSelect = localClass || userData.classe;
    if (classToSelect) {
      studentClassSelect.value = classToSelect;
    }

    // Mettre à jour le petit texte d'info
    updateStudentFiltersInfo({
      year: yearToSelect,
      classe: classToSelect,
      isYearLocked,
      isClassLocked,
    });

    // Re-check vote après choix année/classe
    setTimeout(async () => {
      const voteEligibility = await checkVotingEligibility(donneeUtilisateur, currentUserDocId);
      if (voteEligibility.eligible) showVoteButton(voteEligibility);
    }, 300);
  });

  // 🎯 Gestion du changement d'année (si pas encore verrouillée)
  if (!isYearLocked) {
    studentYearSelect.addEventListener("change", async () => {
      const year = studentYearSelect.value;
      localStorage.setItem("student_academic_year", year);
      console.log("Année académique sélectionnée :", year);

      // Sauvegarde + verrouillage côté Firestore (fonction déjà créée)
      await saveStudentFiltersToFirestore(year, null);
      isYearLocked = true;
      studentYearSelect.disabled = true;

      const classe =
          studentClassSelect.value || userData.classe || null;

      updateStudentFiltersInfo({
        year,
        classe,
        isYearLocked,
        isClassLocked,
      });
    });
  }

  // 🎯 Gestion du changement de classe (si pas encore verrouillée)
  if (!isClassLocked) {
    studentClassSelect.addEventListener("change", async () => {
      const classe = studentClassSelect.value;
      localStorage.setItem("student_class", classe);
      console.log("Classe sélectionnée :", classe);

      // Sauvegarde + verrouillage côté Firestore (fonction déjà créée)
      await saveStudentFiltersToFirestore(null, classe);
      isClassLocked = true;
      studentClassSelect.disabled = true;

      const year =
          studentYearSelect.value ||
          (Array.isArray(userData.annee_academique_id) &&
          userData.annee_academique_id.length > 0
            ? userData.annee_academique_id[userData.annee_academique_id.length - 1]
            : null);

      updateStudentFiltersInfo({
        year,
        classe,
        isYearLocked,
        isClassLocked,
      });
    });
  }
}

// Met à jour le petit texte d'information + le côté "verrouillé"
function updateStudentFiltersInfo({ year, classe, isYearLocked, isClassLocked }) {
  const studentFiltersInfo = document.getElementById("studentFiltersInfo");
  const studentFiltersControls = document.getElementById("studentFiltersControls");

  if (!studentFiltersInfo) return;

  const parts = [];
  if (year) parts.push(`Année : ${year}`);
  if (classe) parts.push(`Classe : ${classe}`);

  const mainText =
      parts.length > 0
        ? parts.join(" · ")
        : "Aucune année / classe sélectionnée pour le moment.";

  let lockText = "";

  if (isYearLocked && isClassLocked) {
    lockText =
        "Ces informations ont été validées. Pour les modifier, veuillez contacter l'administration de la plateforme.";
  } else if (isYearLocked) {
    lockText =
        "Votre année académique a été validée. Pour la modifier, contactez l'administration.";
  } else if (isClassLocked) {
    lockText =
        "Votre classe a été validée. Pour la modifier, contactez l'administration.";
  } else {
    lockText =
        "Vous pouvez définir une seule fois votre année académique et votre classe.";
  }

  // Texte final affiché dans le bandeau
  studentFiltersInfo.textContent = `${mainText} · ${lockText}`;

  // 🫥 Rendre les selects visuellement plus discrets si tout est verrouillé
  if (studentFiltersControls) {
    if (isYearLocked && isClassLocked) {
      studentFiltersControls.classList.add("opacity-60");
    } else {
      studentFiltersControls.classList.remove("opacity-60");
    }
  }
}

// ✅ Sauvegarder les choix de l'étudiant dans Firestore
async function saveStudentFiltersToFirestore(year, classe) {
  if (!currentUserDocId) {
    console.warn("Impossible de sauvegarder : aucun userDocId défini.");
    return;
  }

  try {
    const userRef = doc(db, "users", currentUserDocId);
    const updateData = {};

    // 🔒 Empêcher plusieurs changements (on lit l'état courant en mémoire)
    const yearLocked  = donneeUtilisateur?.annee_academique_locked === true;
    const classLocked = donneeUtilisateur?.classe_locked === true;

    // Année académique : on autorise UNE SEULE écriture depuis cette page
    if (year && !yearLocked) {
      updateData.annee_academique_id = arrayUnion(year);
      updateData.annee_academique_locked = true;      // 🔒 on verrouille côté Firestore
      donneeUtilisateur.annee_academique_locked = true; // on met à jour la copie locale
    }

    if (year && !yearLocked) {
      if (!Array.isArray(donneeUtilisateur.annee_academique_id)) donneeUtilisateur.annee_academique_id = [];
      if (!donneeUtilisateur.annee_academique_id.includes(year)) donneeUtilisateur.annee_academique_id.push(year);
    }

    // Classe : pareil, une seule écriture
    if (classe && !classLocked) {
      updateData.classe = classe;
      updateData.classe_locked = true;               // 🔒 on verrouille côté Firestore
      donneeUtilisateur.classe_locked = true;        // on met à jour la copie locale
    }

    // Si tout est déjà verrouillé, on ne fait rien
    if (Object.keys(updateData).length === 0) {
      console.log("Rien à mettre à jour : les choix sont déjà verrouillés.");
      return;
    }

    await updateDoc(userRef, updateData);
    console.log("Profil mis à jour dans Firestore :", updateData);
  } catch (err) {
    console.error(
      "Erreur lors de la mise à jour Firestore des filtres étudiant :",
      err
    );
  }
}

export async function getUserData(uid) {
  // Crée une requête pour rechercher l'utilisateur par son uid
  const q = query(collection(db, "users"), where("uid", "==", uid));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    // ✅ On récupère UNIQUEMENT le premier document (normalement il n'y en a qu'un)
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    donneeUtilisateur = userData;           // Données de l'utilisateur connecté
    currentUserDocId = userDoc.id;          // ✅ ID du document Firestore de cet utilisateur

    afficherProfilUtilisateur(userData);

    // Cacher le bouton login s'il existe dans le nouveau design
    if (loginButton) {
      loginButton.style.display = "none";
    }

    if (userData.role === "responsable") {
      // Logique pour responsable (à adapter si nécessaire)
      const generateQRCode = document.getElementById("generateQRCode");
      if (generateQRCode) generateQRCode.style.display = "block";

    } else if (userData.role === "etudiant") {
      // Si l'utilisateur connecté est un étudiant

      // Ajouter les éléments au menu flottant
      const fabMenu = document.querySelector(".fab-menu");
      if (fabMenu) {
        fabMenu.innerHTML += `
          <button class="fab-menu-item" id="updateInformationsModal">
            <i class="fa-solid fa-gears"></i>
          </button>
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

        // Gérer la déconnexion
        document.getElementById("logoutButton").addEventListener("click", () => {
          let deconnexion = confirm("Voulez-vous vraiment vous déconnecter ?");

          if (deconnexion) {
            try {
              const loadingSpinner = document.getElementById('loadingSpinner');
              if (loadingSpinner) loadingSpinner.style.display = 'block';

              signOut(auth)
                .then(() => {
                  console.log("Déconnexion réussie");
                  window.location.href = "./login/index.html";
                })
                .catch((error) => {
                  console.error("Erreur lors de la déconnexion:", error);
                });

            } catch (error) {
              console.log(error);
            } finally {
              const loadingSpinner = document.getElementById('loadingSpinner');
              if (loadingSpinner) loadingSpinner.style.display = 'none';
            }
          }
        });
      }

      // 🔹 Initialiser les selects Année académique + Classe pour l'étudiant
      initStudentFilters(userData);

      // 🔹 Vérifier l'éligibilité au vote
      setTimeout(async () => {
        const voteEligibility = await checkVotingEligibility(userData, currentUserDocId);

        if (voteEligibility.eligible) {
          // Afficher le bouton de vote
          showVoteButton(voteEligibility);

          // Afficher une notification discrète
          showToast(`Vous pouvez voter au bureau ${voteEligibility.bureauName}`, 'info');
        } else if (voteEligibility.hasVoted) {
          // L'étudiant a déjà voté
          updateUIAfterVote();
          showToast('Vous avez déjà voté', 'info');
        } else {
          // L'étudiant n'est pas éligible
          console.log('Étudiant non éligible:', voteEligibility.reason);
        }
      }, 1000);

    } else if (
      userData.role === "directeur" ||
        userData.role === "administration" ||
        userData.role === "comptable"
    ) {
      // Logique pour autres rôles
      console.log(`Utilisateur ${userData.role} connecté`);
    }

  } else {
    console.log("Aucune donnée trouvée pour cet utilisateur");
  }
}

// 🔒 VÉRIFICATION POUR LE VOTING ÉLECTRONIQUE - CORRIGÉ POUR ÉVITER LA RÉCURSION
async function checkVotingEligibility(userData, userDocId) {
  try {
    // 1. Récupérer l'élection active
    const electionRef = doc(db, "elections", "active");
    const electionSnap = await getDoc(electionRef);

    if (!electionSnap.exists()) {
      console.log("Aucune élection active");
      return { eligible: false, reason: "Aucune élection en cours" };
    }

    const electionData = electionSnap.data();
    const currentYear = electionData.yearId; // ex: "2024-2025"

    // 2. Vérifier si l'étudiant a cette année académique
    const userYears = userData.annee_academique_id || [];
    const hasCorrectYear = userYears.includes(currentYear);

    if (!hasCorrectYear) {
      console.log("L'étudiant n'est pas dans l'année académique de l'élection");
      return {
        eligible: false,
        reason: `Vous devez être en ${currentYear} pour voter`
      };
    }

    // 3. Vérifier si l'étudiant est assigné à un bureau
    const assignmentRef = doc(db, "elections", "active", "assignments", userDocId);
    const assignmentSnap = await getDoc(assignmentRef);

    if (!assignmentSnap.exists()) {
      console.log("L'étudiant n'est pas assigné à un bureau");
      return {
        eligible: false,
        reason: "Vous n'êtes pas assigné à un bureau de vote"
      };
    }

    const assignmentData = assignmentSnap.data();
    const bureauId = assignmentData.bureauId;

    // 4. Vérifier si le bureau est actif
    const bureauRef = doc(db, "elections", "active", "bureaux", bureauId);
    const bureauSnap = await getDoc(bureauRef);

    if (!bureauSnap.exists() || !bureauSnap.data().isActive) {
      console.log("Le bureau de l'étudiant n'est pas actif");
      return {
        eligible: false,
        reason: "Votre bureau de vote n'est pas actif"
      };
    }

    // 5. Vérifier si l'étudiant a déjà voté
    const voteRef = doc(db, "elections", "active", "votes", userDocId);
    const voteSnap = await getDoc(voteRef);

    if (voteSnap.exists()) {
      console.log("L'étudiant a déjà voté");
      return {
        eligible: false,
        reason: "Vous avez déjà voté",
        hasVoted: true,
        votedFor: voteSnap.data().candidateId
      };
    }

    // 6. Récupérer les infos du bureau pour l'affichage
    const bureauData = bureauSnap.data();

    return {
      eligible: true,
      bureauId: bureauId,
      bureauName: bureauData.name,
      electionYear: currentYear,
      userData: userData
    };

  } catch (error) {
    console.error("Erreur lors de la vérification d'éligibilité:", error);
    return { eligible: false, reason: "Erreur technique" };
  }
}

// FONCTION POUR AFFICHER LE BOUTON DE VOTE
function showVoteButton(voteInfo) {
  // Créer le bouton flottant pour voter
  const voteFabItem = document.createElement("button");
  voteFabItem.className = "fab-menu-item vote-button";
  voteFabItem.style.backgroundColor = "#10b981"; // Vert
  voteFabItem.innerHTML = `
    <i class="fa-solid fa-vote-yea"></i>
    <span>VOTER</span>
  `;

  // Ajouter au menu flottant
  const fabMenu = document.querySelector(".fab-menu");
  if (fabMenu) {
    // Insérer en premier dans le menu
    fabMenu.insertBefore(voteFabItem, fabMenu.firstChild);

    // Ajouter l'événement click
    voteFabItem.addEventListener("click", () => {
      openVotingModal(voteInfo);
    });
  }
}

// FONCTION DE CONFIRMATION POUR UN CANDIDAT
async function confirmVoteChoice(candidateId, voteInfo, candidateName) {
  const confirmVote = confirm(
    `Voulez-vous vraiment voter pour :\n\n"${candidateName}" ?\n\n` +
      `⚠️ Cette action est définitive et ne peut être annulée.\n` +
      `Votre vote sera enregistré de manière anonyme.`
  );

  if (!confirmVote) return;

  await submitVote(candidateId, voteInfo, candidateName);
}

// FONCTION DE CONFIRMATION POUR BULLETIN NUL
async function confirmNullVote(voteInfo) {
  const confirmVote = confirm(
    `Voulez-vous vraiment voter "Bulletin nul" ?\n\n` +
      `⚠️ Cette action est définitive et ne peut être annulée.\n` +
      `• Votre vote comptera dans les totaux\n` +
      `• Aucun candidat ne recevra votre voix\n` +
      `• Votre choix sera enregistré anonymement`
  );

  if (!confirmVote) return;

  await submitVote("null", voteInfo, "Bulletin nul");
}

// FONCTION POUR SOUMETTRE LE VOTE
async function submitVote(candidateId, voteInfo, displayName = "Votre choix") {
  // UI loading
  const votingModal = document.getElementById("votingModal");
  if (votingModal) {
    votingModal.innerHTML = `
      <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Enregistrement de votre vote</h3>
          <p class="text-gray-600">
            ${candidateId === "null" ?
    "Enregistrement de votre bulletin nul..." :
    `Enregistrement de votre vote pour ${displayName}...`
}
          </p>
        </div>
      </div>
    `;
  }

  try {
    // 1) Vérif auth
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Utilisateur non connecté.");

    // 2) Appel Cloud Function avec le candidatId (qui peut être "null")
    const payload = {
      electionId: "active",
      candidateId: candidateId, // "c1", "c2" ou "null"
      uid: uid,
      userDocId: currentUserDocId,
      bureauId: voteInfo.bureauId
    };

    console.log("📤 Envoi du vote:", payload);
    const result = await submitVoteCallable(payload);

    // 3) Succès - Afficher un message différent selon le type de vote
    console.log("✅ submitVote OK:", result.data);

    document.getElementById("votingModal")?.remove();

    // Afficher un message de succès adapté
    let successMessage = "";
    let icon = "✅";

    if (candidateId === "null") {
      successMessage = "Bulletin nul enregistré avec succès";
      icon = "⚪";
    } else {
      successMessage = `Vote pour ${displayName} enregistré avec succès`;
      icon = "✅";
    }

    updateUIAfterVote();
    showToast(`${icon} ${successMessage}`, "success");

  } catch (err) {
    console.error("❌ submitVote error:", err);

    // Gestion des erreurs spécifiques
    let errorMessage = err?.message || "Erreur lors de l'enregistrement du vote.";

    // Messages d'erreur plus explicites
    if (err.code === 'functions/already-exists') {
      errorMessage = "Vous avez déjà voté pour cette élection.";
    } else if (err.code === 'functions/invalid-argument') {
      errorMessage = "Votre vote n'est pas valide. Veuillez réessayer.";
    } else if (err.code === 'functions/failed-precondition') {
      errorMessage = "Vous n'êtes pas éligible pour voter.";
    }

    // Afficher l'erreur
    const votingModal = document.getElementById("votingModal");
    if (votingModal) {
      votingModal.innerHTML = `
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-times text-red-600 text-3xl"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-3">Erreur</h3>
            <p class="text-gray-600 mb-6">${errorMessage}</p>
            <button id="closeVotingError" class="w-full py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">
              Fermer
            </button>
          </div>
        </div>
      `;
      document.getElementById("closeVotingError")?.addEventListener("click", () => {
        document.getElementById("votingModal")?.remove();
      });
    }

    showToast(errorMessage, "error");
  }
}

// FONCTION POUR METTRE À JOUR L'UI APRÈS LE VOTE
function updateUIAfterVote() {
  // Retirer le bouton VOTER du menu flottant
  const voteButton = document.querySelector('.vote-button');
  if (voteButton) voteButton.remove();

  // Ajouter un badge "A voté" dans le profil
  const userProfileContainer = document.getElementById('userProfileContainer');
  if (userProfileContainer) {
    const votedBadge = document.createElement('div');
    votedBadge.className = 'absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full px-2 py-1';
    votedBadge.innerHTML = '<i class="fas fa-check mr-1"></i>A voté';

    const profilePic = userProfileContainer.querySelector('.profile-picture');
    if (profilePic) {
      profilePic.style.position = 'relative';
      profilePic.appendChild(votedBadge);
    }
  }

  // Afficher un message toast
  showToast('Votre vote a été enregistré avec succès !', 'success');
}

// FONCTION POUR AFFICHER UN TOAST
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-semibold z-50 animate-slideIn ${
    type === 'success' ? 'bg-green-600' :
      type === 'error' ? 'bg-red-600' : 'bg-blue-600'
  }`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('animate-slideOut');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Écouteur d'authentification
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid; // Obtenir le uid de l'utilisateur connecté
    getUserData(uid); // Appeler la fonction pour obtenir les données
    updateUIForUser(); // ✅ AJOUT DE CET APPEL
  } else {
    console.log("L'utilisateur n'est pas connecté");

    // Cacher les éléments spécifiques aux utilisateurs connectés
    if (loginButton) loginButton.style.display = "block";

    // Animation du bouton login (si présent)
    if (loginButton) {
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
    }
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
      const photoElement = document.getElementById("userPhoto");
      if (photoElement) {
        photoElement.addEventListener("click", showStudentInfo);
      }
    } else {
      console.error("Le conteneur parent n'a pas été trouvé.");
    }
  } else {
    console.error("Utilisateur non connecté ou photo de profil manquante.");
  }
}

// ✅ EXPOSER LES FONCTIONS GLOBALEMENT POUR LE NOUVEAU CODE HTML
window.checkVotingEligibility = checkVotingEligibility;
window.openVotingModal = openVotingModal;
window.showToast = showToast;
window.updateUIForUser = updateUIForUser; // <-- AJOUTEZ CETTE LIGNE