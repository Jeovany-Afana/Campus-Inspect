

// Importez les fonctions nécessaires depuis Firebase
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc, // Importation ajoutée
    getDoc, // Importation ajoutée
  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
  
  import {
    getAuth,
    onAuthStateChanged,
  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
  
  // Initialisation de Firestore et Auth
  const db = getFirestore();
  const auth = getAuth();
  

  // Récupérer les informations de l'utilisateur connecté
  async function getUtilisateurConnecte() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log("Utilisateur détecté :", user);
          try {
            // Rechercher l'utilisateur dans Firestore avec le champ `uid`
            const usersCollection = collection(db, "users");
            const q = query(usersCollection, where("uid", "==", user.uid));
            const querySnapshot = await getDocs(q);
  
            if (!querySnapshot.empty) {
              // Si on trouve un ou plusieurs résultats, récupérer le premier
              const utilisateurData = querySnapshot.docs[0].data();
              console.log("Données utilisateur récupérées :", utilisateurData);
              resolve(utilisateurData);
            } else {
              alert("Aucun utilisateur correspondant trouvé dans Firestore.");
              console.error("Aucun document trouvé pour le champ uid :", user.uid);
              resolve(null);
            }
          } catch (error) {
            console.error("Erreur lors de la récupération des données Firestore :", error);
            resolve(null);
          }
        } else {
          console.error("Aucun utilisateur connecté.");
          resolve(null);
        }
      });
    });
  }


  async function ajoutervoteDansFirestore() {
    const user = await getUtilisateurConnecte();
    if (!user) {
        console.error("Aucun utilisateur connecté.");
        return;
    }
  
    try {
        // Référence à la collection "votes"
        const votesCollections = collection(db, "liste_votants");
  
        // Requête pour vérifier si un document avec cet UID existe déjà
        const q = query(
            votesCollections,
            where("uid", "==", user.uid) // On vérifie si cet UID existe
        );
  
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
            // Si on trouve un document avec cet UID
            alert("Vous avez déjà voté !");
            console.log("Vote déjà enregistré pour cet utilisateur.");
            return;
        }
  
        // Si aucun document trouvé, ajouter les informations dans Firestore
        await addDoc(votesCollections, {
            uid: user.uid, // Ajouter l'UID pour identification unique
            pseudoOk: user.pseudoOk || "Inconnu",
            kairos: user.kairos || "Non défini",
            a_vote: user.a_vote || false,
            classe: user.classe || "Non spécifié",
            date: new Date().toISOString().split("T")[0], // Date (AAAA-MM-JJ)
            timestamp: new Date().toISOString(), // Horodatage complet
        });
  
        alert("Merci pour votre vote !");
    } catch (error) {
        alert("Désolé, une erreur est survenue !");
        console.error("Erreur lors de l'ajout dans Firestore :", error);
    }
  }


const user = await getUtilisateurConnecte();

  // Vérifier si l'utilisateur est connecté
  if (!user) {
    console.log("Utilisateur non connecté.");
  }

  else {
    
    // Sélection des éléments


    if (!user.a_vote && user.present === 1) {

        // const openModal = document.getElementById('openModal');
        const voteModal = document.getElementById('voteModal');
        const closeModal = document.getElementById('closeModal');
        const voteButtons = document.querySelectorAll('.vote-btn');
        const candidat1 = document.getElementById('candidat1');
        const candidat2 = document.getElementById('candidat2');

        // Ouvrir le modal
        voteModal.style.display = 'flex';
        // Fermer le modal
      


        candidat1.addEventListener('click', async () => {
        
            user.a_vote = true;
            try{

                // Affichage du Spinner lors du vote
                const loadingSpinner = document.getElementById('loadingSpinner');//On récupère le loading spinner
                loadingSpinner.style.display = 'block';


            const candidatsCollection = collection(db, "candidats");
            const q = query(candidatsCollection, where("nom", "==", "Ndieguene1"));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
            // Si on trouve un ou plusieurs résultats, récupérer le premier
            const candidatDoc = querySnapshot.docs[0].data();

            const candidatId = querySnapshot.docs[0].id;
         
            const candidatRef = doc(db, "candidats", candidatId);
            await updateDoc(candidatRef, {
                nombre_votes: candidatDoc.nombre_votes + 1,
            });

            try {
                // Étape 1: Créer une requête pour rechercher l'utilisateur avec le champ "uid"
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("uid", "==", user.uid));
                
                // Étape 2: Exécuter la requête
                const querySnapshot = await getDocs(q);
        
                if (!querySnapshot.empty) {
                    // Étape 3: Parcourir les résultats et mettre à jour la valeur
                    querySnapshot.forEach(async (docSnapshot) => {
                        const userRef = doc(db, "users", docSnapshot.id);
                        await updateDoc(userRef, { a_vote: true, present: 0, });
                        console.log(`Utilisateur avec UID ${user.uid} mis à jour.`);
                    });
                } else {
                    console.log("Aucun utilisateur trouvé avec cet UID.");
                }
            } catch (error) {
                console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
            }

            await ajoutervoteDansFirestore();
            alert("Votre vote a été enregistré avec succès !");
            voteModal.style.display = 'none';
            } else {
            alert("Aucun candidat correspondant trouvé dans Firestore.");
            console.error("Aucun document trouvé pour le champ uid :", user.uid);
            }
        }catch(error){
            console.error("Erreur lors de la récupération des données Firestore :", error);
        }
        finally {
            const loadingSpinner = document.getElementById('loadingSpinner');
            loadingSpinner.style.display = 'none';
          }
        
        
        });

        candidat2.addEventListener('click', async () => {
        
            user.a_vote = true;
            try{


                  // Affichage du Spinner lors du vote
                  const loadingSpinner = document.getElementById('loadingSpinner');//On récupère le loading spinner
                  loadingSpinner.style.display = 'block';
  


            const candidatsCollection = collection(db, "candidats");
            const q = query(candidatsCollection, where("nom", "==", "Ndieguene2"));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
            // Si on trouve un ou plusieurs résultats, récupérer le premier
            const candidatDoc = querySnapshot.docs[0].data();

            const candidatId = querySnapshot.docs[0].id;

         
            const candidatRef = doc(db, "candidats", candidatId);
            await updateDoc(candidatRef, {
                nombre_votes: candidatDoc.nombre_votes + 1,
            });


            try {
                // Étape 1: Créer une requête pour rechercher l'utilisateur avec le champ "uid"
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("uid", "==", user.uid));
                
                // Étape 2: Exécuter la requête
                const querySnapshot = await getDocs(q);
        
                if (!querySnapshot.empty) {
                    // Étape 3: Parcourir les résultats et mettre à jour la valeur
                    querySnapshot.forEach(async (docSnapshot) => {
                        const userRef = doc(db, "users", docSnapshot.id);
                        await updateDoc(userRef, { a_vote: true, present : 0, });
                        console.log(`Utilisateur avec UID ${user.uid} mis à jour.`);
                    });
                } else {
                    console.log("Aucun utilisateur trouvé avec cet UID.");
                }
            } catch (error) {
                console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
            }

            await ajoutervoteDansFirestore();
            alert("Votre vote a été enregistré avec succès !");
            voteModal.style.display = 'none';
            } else {
            alert("Aucun candidat correspondant trouvé dans Firestore.");
            console.error("Aucun document trouvé pour le champ uid :", user.uid);
            }
        }catch(error){
            console.error("Erreur lors de la récupération des données Firestore :", error);
        } finally {
            const loadingSpinner = document.getElementById('loadingSpinner');
            loadingSpinner.style.display = 'none';
          }
        
        
        });

    }      
  }



// async function updateStudentsPresence(kairosArray) {
//     try {
//         // Parcourir chaque valeur de kairos dans le tableau
//         for (const kairos of kairosArray) {
//             // Étape 1: Rechercher les étudiants avec le kairos actuel
//             const studentsRef = collection(db, "users");
//             const q = query(studentsRef, where("kairos", "==", kairos));
//             const querySnapshot = await getDocs(q);

//             // Étape 2: Vérifier si des étudiants sont trouvés
//             if (!querySnapshot.empty) {
//                 // Étape 3: Mettre à jour le champ 'present' pour chaque étudiant trouvé
//                 querySnapshot.forEach(async (docSnapshot) => {
//                     const studentRef = doc(db, "users", docSnapshot.id);
//                     await updateDoc(studentRef, { present: 0 });
//                     console.log(`Présence mise à jour pour l'étudiant avec kairos: ${kairos}`);
//                 });
//             } else {
//                 console.log(`Aucun étudiant trouvé pour kairos: ${kairos}`);
//             }
//         }
//     } catch (error) {
//         console.error("Erreur lors de la mise à jour des présences :", error);
//     }
// }

// // Appeler la fonction avec un tableau de kairos
// const kairosArray = ["10511399", "10511346"]; // Remplacez par vos valeurs
// updateStudentsPresence(kairosArray);



