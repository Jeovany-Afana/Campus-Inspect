import { donneeUtilisateur } from "./index.js";

document.getElementById('generateQRCode').addEventListener('click', function() {
    if (donneeUtilisateur && typeof donneeUtilisateur.a_jour !== 'undefined') {
        // Afficher le QR code et l'overlay
        document.getElementById("qrcode-container").style.display = 'block';
        document.getElementById("overlay").style.display = 'block';
        
        // Générer le QR code avec des informations
        var qrcode = new QRCode(document.getElementById("qrcode"), {
            text: donneeUtilisateur.a_jour ? "Autorisé" : "Pas autorisé",
            width: 300,
            height: 300,
            colorDark: "#000000",  // Couleur unie (noir)
            colorLight: "#ffffff",  // Fond blanc
            correctLevel: QRCode.CorrectLevel.H // Niveau de correction des erreurs
        });
    } else {
        alert("Les informations de l'utilisateur ne sont pas disponibles ou complètes.");
    }
});


// Événement pour fermer le QR code
document.getElementById('closeQRCode').addEventListener('click', function() {
    // Masquer le QR code, l'overlay et le bouton Fermer
    document.getElementById("qrcode-container").style.display = 'none';
    document.getElementById("qrcode").innerHTML = '';
    document.getElementById("overlay").style.display = 'none';
});



