async function registerStudent(studentInfo, file) {
  try {
    // 1. Upload de la photo dans Firebase Storage
    const storageRef = ref(storage, 'photos/' + file.name); // Référence du fichier photo
    const snapshot = await uploadBytes(storageRef, file); // Uploader la photo
    const downloadURL = await getDownloadURL(storageRef); // Récupérer l'URL de la photo

    // 2. Stocker les informations de l'étudiant dans Firestore, y compris l'URL de la photo
    const studentData = {
      name: studentInfo.name,      // Nom de l'étudiant
      email: studentInfo.email,    // Email de l'étudiant
      photoURL: downloadURL        // URL de la photo
    };

    // Ajouter l'étudiant dans la collection "students" de Firestore
    await addDoc(collection(db, "students"), studentData);
    console.log("Étudiant inscrit avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'inscription de l'étudiant :", error);
  }
}

// Exemple d'utilisation
document.getElementById('registerButton').addEventListener('click', () => {
  const name = document.getElementById('nameInput').value; // Récupérer le nom
  const email = document.getElementById('emailInput').value; // Récupérer l'email
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0]; // Récupérer la photo
  
  const studentInfo = { name, email }; // Créer l'objet des infos de l'étudiant

  if (file) {
    registerStudent(studentInfo, file); // Appeler la fonction d'inscription
  } else {
    console.error('Aucune photo sélectionnée !');
  }
});
