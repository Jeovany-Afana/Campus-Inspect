const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");

// Configure ta clé API SendGrid
sgMail.setApiKey(functions.config().sendgrid.key);

// Fonction pour envoyer un email
exports.sendEmail = functions.https.onRequest(async (req, res) => {
  try {
    const msg = {
      to: 'jeovany.afana@icloud.com',  // Remplace par l'email du destinataire
      from: 'wilfrieddylan451@gmail.com', // Remplace par ton email vérifié
      subject: 'Sending with SendGrid is Fun',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };

    // Envoi de l'email
    await sgMail.send(msg);
    res.status(200).send('Email envoyé avec succès !');
  } catch (error) {
    res.status(500).send('Erreur lors de l\'envoi de l\'email');
  }
});
