
      import { 
        initializeApp 
      } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js"; 
      import { 
        getFirestore, collection, query, where, getDocs, doc, getDoc 
      } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
      
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
      
      // Fonction pour récupérer les membres du club
      async function fetchClubMembers() {
        const clubId = document.getElementById('club-members').dataset.clubId;
        const membersList = document.getElementById('members-list');
        membersList.innerHTML = '';  // Réinitialisation de la liste pour éviter les doublons
    
        try {
          // Étape 1 : Récupérer le document du club en utilisant l'ID
          const clubRef = doc(db, 'clubs', clubId);  // Accède directement au document du club par son ID
          const clubDoc = await getDoc(clubRef);
    
          if (!clubDoc.exists()) {
            membersList.innerHTML = `<p class="text-gray-500">Aucun membre trouvé pour ce club.</p>`;
            return;
          }
    
          const clubData = clubDoc.data();
          const memberUIDs = clubData.membres || [];
    
          // Vérifie s'il y a des membres
          if (memberUIDs.length === 0) {
            membersList.innerHTML = `<p class="text-gray-500">Aucun membre trouvé pour ce club.</p>`;
            return;
          }
    
          // Étape 2 : Récupérer les infos de chaque membre via leur UID
          document.getElementById("nombreMembres").innerHTML += ` (${memberUIDs.length})`;
          for (const uid of memberUIDs) {
            const usersRef = collection(db, 'users');
            const userQuery = query(usersRef, where("uid", "==", uid)); // Requête pour obtenir les infos de l'utilisateur
            const userSnapshot = await getDocs(userQuery);
    
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
    
              // Crée une carte pour afficher les informations du membre
              const memberCard = `
                <div class="flex items-center space-x-4 border-b pb-2">
                  <img src="${userData.photoURLOk || 'https://via.placeholder.com/48'}" alt="Avatar" class="w-12 h-12 rounded-full">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800">${userData.pseudoOk || 'Nom inconnu'} | <span style="font-weight:100;">${userData.classe}</span></h3>
                    <p class="text-sm text-gray-500">${userData.role.toUpperCase() || 'Membre'}</p>
                  </div>
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
    
      // Charger les membres au chargement de la page
      window.addEventListener('DOMContentLoaded', fetchClubMembers);
    