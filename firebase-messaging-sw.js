importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging.js");

// Configuration de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDibbuBJ2p88T26P0BAB-o_exunK0GYFdA",
  authDomain: "inspecteur-de-classes.firebaseapp.com",
  projectId: "inspecteur-de-classes",
  storageBucket: "inspecteur-de-classes.appspot.com",
  messagingSenderId: "572661846292",
  appId: "1:572661846292:web:aeb0374db2d414fef9f201",
  measurementId: "G-NVN5GERDV6",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Gérer les notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log("Notification en arrière-plan :", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
