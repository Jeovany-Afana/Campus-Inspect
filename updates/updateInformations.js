import {
    getFirestore,
    doc,
    updateDoc,
  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
  
  import {
    getAuth,
    updateProfile,
    updateEmail,
    sendPasswordResetEmail,
  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
  
  import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";
  
  const db = getFirestore();
  const auth = getAuth();
  const storage = getStorage();
  
  // Modal controls
  const updateModal = document.getElementById("updateModal");
  const closeUpdateModal = document.getElementById("closeUpdateModal");
  const resetPassword = document.getElementById("resetPassword");
  
  // Open modal
  export function showUpdateModal() {
    updateModal.style.visibility = "visible";
    updateModal.style.opacity = "1";
  }
  
  // Close modal
  closeUpdateModal.addEventListener("click", () => {
    updateModal.style.visibility = "hidden";
    updateModal.style.opacity = "0";
  });
  
  // Handle reset password
  resetPassword.addEventListener("click", () => {
    const user = auth.currentUser;
    if (user) {
      sendPasswordResetEmail(auth, user.email)
        .then(() => alert("Email de réinitialisation envoyé !"))
        .catch((error) => console.error("Erreur :", error));
    }
  });
  
  // Handle profile update
  document.getElementById("updateForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const photoFile = document.getElementById("profilePhoto").files[0];
  
    try {
      const user = auth.currentUser;
  
      if (user) {
        // Update name and email
        if (fullName) await updateProfile(user, { displayName: fullName });
        if (email) await updateEmail(user, email);
  
        // Update photo
        if (photoFile) {
          const storageRef = ref(storage, "photos/" + photoFile.name);
          await uploadBytes(storageRef, photoFile);
          const photoURL = await getDownloadURL(storageRef);
          await updateProfile(user, { photoURL });
          await updateDoc(doc(db, "users", user.uid), { photoURLOk: photoURL });
        }
  
        alert("Informations mises à jour !");
        updateModal.style.visibility = "hidden";
        updateModal.style.opacity = "0";
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  });
  