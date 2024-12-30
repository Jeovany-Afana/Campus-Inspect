import { registerClass } from "./sendDataToFirebase.js";

const form = document.querySelector('form');
const nameInput = document.getElementById('class-name');


form.addEventListener('submit', function(event) {
  event.preventDefault(); // Empêche l'envoi du formulaire

  // Récupérer les équipements sélectionnés
  const equipmentCheckboxes = document.querySelectorAll('input[name="equipement"]:checked');
  const selectedEquipment = Array.from(equipmentCheckboxes).map(checkbox => checkbox.value);
  let options = document.getElementById('localisation');
  const capacityRadios = document.getElementsByName('capacity');
  // Récupérer la capacité choisie
  
  let selectedCapacity;
  for (const radio of capacityRadios) {
    if (radio.checked) {
      selectedCapacity = radio.value;
      break;
    }
  }

  const name = nameInput.value;
  const capacity = selectedCapacity;
  const equipements = selectedEquipment;
  const localisation = options.value;
  const status_occupation = "Libre";
  const occupants = "";
  const prochaines_reservations = [];

  const classInfo = {name, capacity, equipements, status_occupation,  localisation, occupants, prochaines_reservations};

  registerClass(classInfo);
});






