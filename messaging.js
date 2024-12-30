import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging.js";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDibbuBJ2p88T26P0BAB-o_exunK0GYFdA",
  authDomain: "inspecteur-de-classes.firebaseapp.com",
  projectId: "inspecteur-de-classes",
  storageBucket: "inspecteur-de-classes.appspot.com",
  messagingSenderId: "572661846292",
  appId: "1:572661846292:web:aeb0374db2d414fef9f201",
  measurementId: "G-NVN5GERDV6",
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const messaging = getMessaging(app);

// Enregistrer le service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker enregistré avec succès :", registration);
    })
    .catch((error) => {
      console.error("Erreur lors de l'enregistrement du Service Worker :", error);
    });
}

// Fonction pour enregistrer le token dans Firestore
async function saveTokenToDatabase(token) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.error("Aucun utilisateur connecté !");
    return;
  }

  const userUid = currentUser.uid;
  console.log("Recherche de l'utilisateur avec UID :", userUid);

  try {
    // Recherche de l'utilisateur dans la collection "users"
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("uid", "==", userUid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn("Aucun utilisateur trouvé avec cet UID !");
      return;
    } else {
      // Si l'utilisateur est trouvé, on récupère ses données
      querySnapshot.forEach(async (userDoc) => {
        console.log(`Utilisateur trouvé : ${userDoc.id} =>`, userDoc.data());

        // Enregistrement du token FCM dans Firestore
        const userDocRef = doc(db, "users", userDoc.id);
        await setDoc(userDocRef, { fcmToken: token }, { merge: true });
        console.log("Token FCM enregistré avec succès dans Firestore !");
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du token :", error);
  }
}

// Demander la permission et récupérer le token
function getAndSaveToken() {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Permission de notification accordée !");
      
      // Obtenir le token FCM
      getToken(messaging, { vapidKey: "VOTRE_CLE_VAPID" })
        .then((currentToken) => {
          if (currentToken) {
            console.log("Token FCM :", currentToken);
            // Enregistrer le token dans Firestore
            saveTokenToDatabase(currentToken);
          } else {
            console.warn("Aucun token disponible. Demandez la permission à l'utilisateur.");
          }
        })
        .catch((err) => {
          console.error("Erreur lors de la récupération du token :", err);
        });
    } else {
      console.warn("Permission de notification refusée !");
    }
  });
}

// Vérifier l'utilisateur connecté et récupérer le token
getAndSaveToken();
