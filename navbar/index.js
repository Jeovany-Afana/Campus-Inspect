// Sélectionner tous les interrupteurs
const statusToggles = document.querySelectorAll('.status-toggle');

statusToggles.forEach(toggle => {
  toggle.addEventListener('change', (e) => {
    // Récupérer l'ID de la classe correspondant à ce switch
    const classId = e.target.getAttribute('data-class-id');
    
    // Trouver la ligne (ou carte) correspondante dans le tableau
    const classCard = document.querySelector(`.class-card[data-class-id="${classId}"]`);
    
    // Récupérer l'élément qui affiche le statut
    const statusText = classCard.querySelector('.status');
    
    // Changer le statut en fonction du switch (checked ou non)
    if (e.target.checked) {
      statusText.textContent = 'Occupée';
      statusText.style.color = 'red';
      // Appeler la fonction pour mettre à jour le statut dans Firestore
      updateClassStatus(classId, true); // true = occupée
    } else {
      statusText.textContent = 'Libre';
      statusText.style.color = 'green';
      // Appeler la fonction pour mettre à jour le statut dans Firestore
      updateClassStatus(classId, false); // false = libre
    }
  });
});