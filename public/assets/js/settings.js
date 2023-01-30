document.addEventListener('DOMContentLoaded', function () {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));


  const btn_save_config = document.getElementById('btn_save_config');

  btn_save_config.addEventListener('click',function (e) {
    console.log('Guardando');
  });

});