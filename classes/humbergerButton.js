
 function loadtoggler() {
  
  const toggler = document.getElementById('navbar-toggler');
  const navbarCollapse = document.getElementById('navbar-collapse');


  toggler.addEventListener('click', function() {
    navbarCollapse.classList.toggle('active');
  });
 }

setTimeout(loadtoggler,2000);




  