/** @type {import('eslint').Linter.Config} */
const config = {
  plugins: {
    node: require('eslint-plugin-node'),  // Assure-toi que le plugin est installé
  },
  languageOptions: {
    globals: {
      // Déclare ici les variables globales, si nécessaire
      // Par exemple :
      process: 'readonly', // Exemple de variable globale
    },
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'indent': ['error', 2], // Utilise 2 espaces pour l'indentation
    'semi': ['error', 'always'], // Toujours ajouter un point-virgule
  },
};

module.exports = config;
