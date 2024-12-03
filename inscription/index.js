import { registerUser } from './sendDataToFirebase.js';


const form = document.querySelector("form");
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

}




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
      /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/
    )
  ) {
    errorDisplay(
      "password",
      "Minimum de 8 caractères, une majuscule, un chiffre et un caractère spécial"
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
      default:null
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
  if (emailOk && passwordOk && confirmPassOk && kairosOk &&  pseudoOk && passwordOk === confirmPassOk && classe.value != "") {
    const userInfo = {
      pseudoOk: pseudoOk,
      emailOk: emailOk,
      kairosOk: kairosOk,
      passwordOk: passwordOk,
      classe:classe.value,
    };

    // Vérifier si un fichier a été sélectionné
    if (file) {
      // Appeler la fonction d'inscription avec les infos utilisateur et la photo
      registerUser(emailOk, passwordOk, userInfo, file);
    } else {
      alert('Aucune photo sélectionnée !');
    }

    // Réinitialiser les champs du formulaire après l'inscription
    inputs.forEach((input) => (input.value = ""));
    progressBar.classList = "";

    // Réinitialiser les variables
    pseudo = null;
    email = null;
    password = null;
    confirmPass = null;
    kairos = null;

  } else {
    alert("Veuillez remplir correctement tous les champs et vérifier que les mots de passe correspondent.");
  }
});
