
    // Import Firebase SDKs
    import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";


// Initialiser Firestore (base de données de Firebase)
const db = getFirestore(); // Maintenant, Firestore est prêt à être utilisé

    export async function fetchStudentData() {
      try {
        // Query for all students
        const studentQuery = query(collection(db, "users"), where("role", "==", "etudiant"));
        const studentSnapshot = await getDocs(studentQuery);

        // Total students
        const totalStudents = studentSnapshot.size;

        // Students who are up-to-date
        let studentsAjout = 0;
        let studentsDerogation = 0;

        studentSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.a_jour) studentsAjout++;
          if (data.derogation) studentsDerogation++;
        });

        // Students not up-to-date
        const studentsNotAjout = totalStudents - studentsAjout;

        // Update the UI
        document.getElementById("totalStudents").innerText = totalStudents;
        document.getElementById("studentsAjour").innerText = studentsAjout;
        document.getElementById("studentsNotAjour").innerText = studentsNotAjout;
        document.getElementById("studentsDerogation").innerText = studentsDerogation;

      } catch (error) {
        console.error("Erreur lors de la récupération des données : ", error);
      }
    }


     // Charger les données JSON
     fetch('data.json')
     .then(response => response.json())
     .then(data => {
       // Extraire les mois et les données pour chaque graphique
       const mois = data.map(item => item.mois);
       const aJour = data.map(item => item.aJour);
       const pasAJour = data.map(item => item.pasAJour);
       const derogations = data.map(item => item.derogations);
       const total = data.map(item => item.total);

       // Premier graphique: Barres
       const ctxBar = document.getElementById('barChart').getContext('2d');
       const barChart = new Chart(ctxBar, {
         type: 'bar',  // Type de graphique à barres
         data: {
           labels: mois,  // Mois en X
           datasets: [
             {
               label: 'Nombre total Etudiants',
               data: total,
               backgroundColor: '#007bff'
             }
             ,
             {
               label: 'Étudiants à jour',
               data: aJour,  // Données pour les étudiants à jour
               backgroundColor: 'rgb(14, 199, 14)'
             },
             {
               label: 'Étudiants pas à jour',
               data: pasAJour,  // Données pour les étudiants pas à jour
               backgroundColor: 'red'
             }, 
             {
               label: 'Dérogations',
               data: derogations,  // Données pour les dérogations
               backgroundColor: 'rgb(214, 165, 5)'
             }
           ]
         },
         options: {
           responsive: false, // Désactiver l'adaptation automatique
           maintainAspectRatio: true
         }
       });

       // Deuxième graphique: Linéaire (évolution des dérogations)
       const ctxLine = document.getElementById('lineChart').getContext('2d');
       const lineChart = new Chart(ctxLine, {
         type: 'line',  // Type de graphique linéaire
         data: {
           labels: mois,  // Mois en X
           datasets: [
            {
                label: 'Nombre total Etudiants',
                data: total,
                fill: false,
                borderColor: '#007bff',
                tension: 1
            },{
             label: 'Dérogations',
             data: derogations,  // Données pour les dérogations
             fill: false,
             borderColor: 'rgb(214, 165, 5)',
             tension: 1
           }, 
            {
                label: 'Étudiants à jour',
                data: aJour,  // Données pour les étudiants à jour
                fill: false,
                borderColor: 'rgb(14, 199, 14)',
                tension: 1
            },
            {
                label: 'Étudiants pas à jour',
                data: pasAJour,  // Données pour les étudiants pas à jour
                fill: false,
                borderColor: 'red',
                tension: 1
            }]
         },
         options: {
           responsive: false, // Désactiver l'adaptation automatique
           maintainAspectRatio: true
         }
       });
     })
     .catch(error => console.error('Erreur lors du chargement des données JSON:', error));