// Importez Firebase si ce n'est pas déjà fait
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection,getDoc, query, where, onSnapshot, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import {
    getAuth,
    signOut,
    onAuthStateChanged,
  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
  
// Configuration Firebase (remplacez par vos informations)
// Configuration de votre application Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDibbuBJ2p88T26P0BAB-o_exunK0GYFdA", // Clé API de votre projet
    authDomain: "inspecteur-de-classes.firebaseapp.com", // Domaine d'authentification
    projectId: "inspecteur-de-classes", // ID de votre projet
    storageBucket: "inspecteur-de-classes.appspot.com", // Bucket de stockage pour les fichiers
    messagingSenderId: "572661846292", // ID de l'expéditeur de messages
    appId: "1:572661846292:web:aeb0374db2d414fef9f201", // ID de votre application
    measurementId: "G-NVN5GERDV6" // ID de mesure pour les analyses
  };

  // Initialisez Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  const openStudentNotificationModalBtn = document.getElementById('openNotificationModal');
  const overlay = document.querySelector('.student-notification-overlay');
// Fonction pour charger les notifications de l'utilisateur connecté
async function loadStudentNotifications() {
    const messageContainer = document.getElementById('studentMessageContainer');
    messageContainer.innerHTML = ''; // Vider les notifications précédentes

    try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
            console.error("Aucun utilisateur connecté !");
            return;
        }

        const userUid = currentUser.uid;
        const userQuery = query(collection(db, "users"), where("uid", "==", userUid));
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) {
            console.error("Utilisateur non trouvé !");
            return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const messages = userData.messages || [];

        const notifications = [];
        for (const message of messages) {
            const senderUid = message.uid_envoyeur;

            if (!senderUid || typeof senderUid !== "string") {
                console.warn("UID de l'expéditeur invalide :", senderUid);
                continue;
            }

            const senderQuery = query(collection(db, "users"), where("uid", "==", senderUid));
            const senderSnapshot = await getDocs(senderQuery);

            if (!senderSnapshot.empty) {
                const senderDoc = senderSnapshot.docs[0];
                const senderData = senderDoc.data();
                notifications.push({
                    name: senderData.pseudoOk || "Nom inconnu",
                    message: message.message,
                    date: new Date(message.date).toLocaleString(),
                    image: senderData.photoURLOk || "https://via.placeholder.com/50",
                    lue: message.lue,
                    messageIndex: messages.indexOf(message),
                });
            }
        }

        // Mettre à jour le compteur de notifications
        updateNotificationCount(notifications);

        notifications.forEach(notif => {
            const notificationDiv = document.createElement('div');
            notificationDiv.classList.add('student-message');
            notificationDiv.dataset.lue = notif.lue;
            notificationDiv.dataset.messageIndex = notif.messageIndex;

            notificationDiv.innerHTML = `
                <img src="${notif.image}" alt="User Picture">
                <div class="message-details">
                    <h4>${notif.name}</h4>
                    <p>${notif.message}</p>
                    <small>${notif.date}</small>
                </div>
            `;

            notificationDiv.addEventListener('click', async () => {
                if (notif.lue === false) {
                    await markMessageAsRead(userDoc.id, notif.messageIndex);
                    notificationDiv.dataset.lue = "true";

                    // Recalculer et mettre à jour le compteur après avoir marqué comme lu
                    notif.lue = true;
                    updateNotificationCount(notifications);
                }
            });

            messageContainer.appendChild(notificationDiv);
        });

    } catch (error) {
        console.error("Erreur lors du chargement des notifications :", error);
    }
}



//Fonction pour marquer un message comme lu
async function markMessageAsRead(userDocId, messageIndex) {
    try {
        const userRef = doc(db, "users", userDocId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const messages = userData.messages;

            // Mettre à jour le champ 'lue' du message
            messages[messageIndex].lue = true;

            // Enregistrer les modifications dans Firestore
            await updateDoc(userRef, { messages });
            console.log("Message marqué comme lu !");
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour du message :", error);
    }
}


// Fonction pour mettre à jour le compteur de notifications non lues
function updateNotificationCount(notifications) {
    const unreadCount = notifications.filter(notif => !notif.lue).length;
    const notificationCountSpan = document.getElementById('notificationCount');

    // Mettre à jour le texte du span
    notificationCountSpan.textContent = unreadCount;

    // Cacher le span si aucun message non lu
    if (unreadCount === 0) {
        notificationCountSpan.style.display = "none";
    } else {
        notificationCountSpan.style.display = "inline";
    }
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // L'utilisateur est connecté
        const userUid = user.uid; // Récupérer l'UID depuis l'utilisateur connecté
        
        const userQuery = query(
            collection(db, "users"),
            where("uid", "==", userUid) // Rechercher le document Firestore avec ce UID
        );

        onSnapshot(userQuery, (querySnapshot) => {
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0]; // Récupérer le premier document correspondant
                const userData = userDoc.data();
                const messages = userData.messages || [];

                const notifications = messages.map((message, index) => ({
                    ...message,
                    messageIndex: index,
                }));

                // Mettre à jour le compteur
                updateNotificationCount(notifications);
            } else {
                console.error("Utilisateur introuvable dans Firestore !");
            }
        });
    } else {
        // Aucun utilisateur n'est connecté
        console.error("Aucun utilisateur connecté !");
    }
});



// Écouter le clic pour ouvrir la modal et charger les notifications
openStudentNotificationModalBtn.addEventListener('click', () => {
    loadStudentNotifications();
    document.getElementById('studentNotificationModal').classList.add('active');
    overlay.classList.add('active');
});

// Fermer la modal
document.getElementById('closeStudentNotificationModal').addEventListener('click', () => {
    document.getElementById('studentNotificationModal').classList.remove('active');
    overlay.classList.remove('active');
});

// Fermer la modal
document.getElementById('closeStudentNotificationModal').addEventListener('click', () => {
    document.getElementById('studentNotificationModal').classList.remove('active');
    overlay.classList.remove('active');
});
