document.addEventListener('DOMContentLoaded', function () {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));


  
  async function getConfig() {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon/ditto');
      const data = await response.json();
      return data;
    } catch (error) {
        console.error('Error en la función getConfigs:', error.message);
        return null;
    }

  }




});
