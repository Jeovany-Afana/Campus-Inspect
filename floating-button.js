const mainFab = document.getElementById("mainFab");
const fabMenu = document.getElementById("fabMenu");

mainFab.addEventListener("click", () => {
  if (fabMenu.classList.contains("active")) {
    fabMenu.classList.remove("active");
  } else {
    fabMenu.classList.add("active");
  }
});



// // Lorsque l'utilisateur entre dans l'appli (par exemple au chargement de la page)
// window.onload = function() {
//     // Afficher la notification après un délai de 1 seconde (simule un changement dans l'application)
//     setTimeout(() => {
//       document.getElementById('notification').classList.toggle('show');
//     }, 2000); // Ajuste le délai selon tes besoins
  
//     // Fermer la notification lorsque l'utilisateur clique sur le bouton X
//     document.getElementById('closeNotification').addEventListener('click', () => {
//       document.getElementById('notification').classList.toggle('show');
//       document.getElementById("notification").style.display = "none";
//     });
        
// }
  
  
  