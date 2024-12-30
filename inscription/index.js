import { registerUser } from './sendDataToFirebase.js';


const form = document.querySelector(".form");
const inputs = document.querySelectorAll(
  'input[type="email"], input[type="password"], input[type="text"]'
);
const progressBar = document.getElementById("progress-bar");
let email, password, confirmPass, pseudo, kairos;

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



const pseudoChecker = (value) => {
  if (value.length > 0 && (value.length < 3 || value.length > 50)) {
    errorDisplay("pseudo", "Le nom doit faire entre 3 et 50 caractères");
    pseudo = null;
  } else if (!value.match(/^[a-zA-Z0-9_ .-]*$/)) {
    errorDisplay(
      "pseudo",
      "Le pseudo ne doit pas contenir de caractères spéciaux"
    );
    pseudo = null;
  } else {
    errorDisplay("pseudo", "", true);
    pseudo = value;
  }
};


const kairosChecker = (value) => {
  if (!value.match(/^[0-9]{7,10}$/)) {
    errorDisplay("kairos", "Le numéro kairos n'est pas valide");
    kairos = null;
  } else {
    errorDisplay("kairos", "", true);
    kairos = value;
  }

};




const emailChecker = (value) => {
  if (!value.match(/^[\w._-]+@[\w-]+\.[a-z]{2,4}$/i)) {
    errorDisplay("email", "Le mail n'est pas valide");
    email = null;
  } 
  else {
    errorDisplay("email", "", true);
    email = value;
  }
};

const passwordChecker = (value) => {
  progressBar.classList = "";

  if (
    !value.match(
      /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?!.*\s).{8,}$/
    )
  ) {
    errorDisplay(
      "password",
      "Minimum de 8 caractères, une majuscule et un chiffre"
    );
    progressBar.classList.add("progressRed");
    password = null;
  } else if (value.length < 12) {
    progressBar.classList.add("progressBlue");
    errorDisplay("password", "", true);
    password = value;
  } else {
    progressBar.classList.add("progressGreen");
    errorDisplay("password", "", true);
    password = value;
  }
  if (confirmPass) confirmChecker(confirmPass);
};


const confirmChecker = (value) => {
  if (value !== password) {
    errorDisplay("confirm", "Les mots de passe ne correspondent pas");
    confirmPass = false;
  } else {
    errorDisplay("confirm", "", true);
    confirmPass = true;
  }
};

inputs.forEach((input) => {
  input.addEventListener("input", (e) => {
    switch (e.target.id) {

    case "pseudo":
      pseudoChecker(e.target.value);
      break;

    case "kairos":
      kairosChecker(e.target.value);
      break;

    case "email":
      emailChecker(e.target.value);
      break;
    case "password":
      passwordChecker(e.target.value);
      break;
    case "confirm":
      confirmChecker(e.target.value);
      break;
    default:null;
    }
  });
});


form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Récupérer les valeurs des champs du formulaire
  const pseudoOk = document.getElementById('pseudo').value;
  const emailOk = document.getElementById('email').value;
  const passwordOk = document.getElementById('password').value;
  const confirmPassOk = document.getElementById('confirm').value;
  const kairosOk = document.getElementById('kairos').value;
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0]; // On récupère la photo
  const classe = document.getElementById('classe');

  // Vérifier que tous les champs sont correctement remplis et que le mot de passe est confirmé

  if (!emailOk || !passwordOk || !confirmPassOk || !pseudoOk || !kairosOk || passwordOk !== confirmPassOk || classe.value == "") {
    showModal("Veuillez remplir tous les champs et vérifier que le mot de passe est correctement confirmé.");
    return;
    
  }


  // Vérifier si un fichier a été sélectionné
  if (!file) {
    showModal("Veuillez sélectionner une photo de profil.");
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    showModal("Le fichier sélectionné n'est pas une image valide.");
    return;
  }

  const userInfo = {
    pseudoOk: pseudoOk,
    emailOk: emailOk,
    kairosOk: kairosOk,
    passwordOk: passwordOk,
    classe:classe.value,};
  // Enregistrer l'utilisateur dans Firebase
  registerUser(emailOk, passwordOk, userInfo, file);

  // Réinitialiser les champs du formulaire après l'inscription
  inputs.forEach((input) => (input.value = ""));
  progressBar.classList = "";

  // Réinitialiser les variables
  pseudo = null;
  email = null;
  password = null;
  confirmPass = null;
  kairos = null;
});

export async function showModal(message, color) {
  const modal = document.getElementById("error-modal");
  const modalMessage = document.getElementById("modal-message");
  const modalContent = modal.querySelector(".modal-content");
  const okButton = document.getElementById("ok-button");
  const errorIcon = document.querySelector(".error-icon");

  // Mettre à jour le message et la couleur
  modalMessage.textContent = message;
  modal.style.display = "flex";
  modalContent.style.animation = "zoomIn 0.3s ease forwards";
  
  // Changer la couleur du message et de l'icône en fonction du statut (succès ou erreur)
  if (color === "error") {
    errorIcon.style.color = "red";
    okButton.style.backgroundColor = "red";
    errorIcon.style.borderColor = "red";
  } else if (color === "success") {
    errorIcon.style.color = "green";
    okButton.style.backgroundColor = "green";
    errorIcon.style.borderColor = "green";
  }

  // Retourner une promesse qui ne se résout qu'à la fermeture du modal
  return new Promise((resolve) => {
    okButton.onclick = () => {
      closeModal(resolve); // Appeler resolve lorsque l'utilisateur appuie sur OK
    };

    window.onclick = (event) => {
      if (event.target === modal) {
        closeModal(resolve); // Appeler resolve si on clique en dehors du modal
      }
    };

    // Fonction pour fermer le modal
    function closeModal(resolve) {
      modalContent.style.animation = "zoomOut 0.3s ease forwards";
      modal.style.animation = "fadeOut 0.3s ease forwards";

      // Attendre la fin de l'animation avant de cacher le modal
      setTimeout(() => {
        modal.style.display = "none";
        resolve(); // Résoudre la promesse, ce qui permet de continuer le code
      }, 300);
    }
  });
}


// showModal("Une erreur est survenue. Veuillez vérifier vos informations.", "error");
// showModal("Inscription réussie !", "success");

