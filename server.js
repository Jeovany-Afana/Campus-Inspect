const https = require('https');
const fs = require('fs');
const express = require('express');
const path = require('path');

const app = express();

// Charge les certificats SSL
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

// Servir les fichiers statiques dans le répertoire courant
app.use(express.static(path.join(__dirname)));

// Lancer le serveur HTTPS
https.createServer(options, app).listen(3000, () => {
  console.log('Serveur HTTPS en cours d\'exécution sur https://localhost:3000');
});
