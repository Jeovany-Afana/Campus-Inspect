import {registerBureau} from './sendDataToFirebase.js';

const proprio = document.getElementById('proprio');
const form = document.querySelector('form');
let options = document.getElementById('localisation');
let proprioVerif;
const errorDisplay = (tag, message, valid) => {
    const container = document.querySelector("." + tag + "-container");
    const span = document.querySelector("." + tag + "-container > span");
  
    if (!valid) {
      container.classList.add("error");
      span.textContent = message;
    } else {
      container.classList.remove("error");
      span.textContent = message;
    }
  };


  const proprioChecker = (value) => {
    if (value.length > 0 && (value.length < 3 || value.length > 20)) {
      errorDisplay("proprio", "Le nom doit faire entre 3 et 20 caractères");
      proprioVerif = null;
    } else if (!value.match(/^[a-zA-Z0-9_ .-]*$/)) {
      errorDisplay(
        "proprio",
        "Le nom ne doit pas contenir de caractères spéciaux"
      );
      proprioVerif = null;
    } else {
      errorDisplay("proprio", "", true);
      proprioVerif = value;
    }
  };

proprio.addEventListener('input', (e) => {

        proprioChecker(e.target.value);
});

form.addEventListener('submit', function(e){
    e.preventDefault();

    if (proprioVerif) {

        const proprioOk = proprio.value;
        const localisation = options.value;
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];//On récupère la photo

        const bureauInto = {proprioOk, localisation}

        if (file) {

            registerBureau(bureauInto, file)
        } else {

            alert('Aucune photo sélectionnée');
            
        }

        
    }

    else
    {
        alert('Veuillez remplir correctement les champs');
    }
});






