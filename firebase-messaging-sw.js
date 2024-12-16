// Importer les scripts Firebase nécessaires
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging.js');

// Initialiser Firebase avec les informations de ton projet
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
firebase.initializeApp(firebaseConfig);

// Initialiser Firebase Cloud Messaging
const messaging = firebase.messaging();

// Lorsque le service worker reçoit une notification en arrière-plan, exécuter cette fonction
messaging.onBackgroundMessage((payload) => {
  console.log('Message reçu en arrière-plan : ', payload);
  
  // Tu peux personnaliser la notification ici (ex. titre, message, etc.)
  const notificationTitle = 'Nouvelle notification';
  const notificationOptions = {
    body: payload.notification.body,
    icon: './icons/logo.png',
  };

  // Afficher la notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});
