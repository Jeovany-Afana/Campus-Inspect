function loadHTML(filePath, elementID) {
  fetch(filePath)
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to load file");
      }
      return response.text();
    })
    .then(data => {
      document.getElementById(elementID).innerHTML = data;
    })
    .catch(error => {
      console.error("Error loading file: ", error);
    });
}

window.onload = () => {
  loadHTML('Campus-Inspect/assets/navbar.html', 'navbar'); // Chemin relatif à navbar.html
  loadHTML('Campus-Inspect/assets/footer.html', 'footer');
};
