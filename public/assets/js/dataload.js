document.addEventListener('DOMContentLoaded', function () {
  let btn_upload = document.getElementById('btn_upload');

  btn_upload.addEventListener('click', function (e) {
    const container_upload = document.getElementById('container_upload');
    const message_upload = document.getElementById('message_upload');
    const fileField = document.getElementById('input_dataload');

    const toast_upload = new bootstrap.Toast(document.getElementById('toast_upload'));
    const container_toast_upload = document.getElementById('container_toast_upload');

    container_upload.classList.add('d-none');
    message_upload.classList.remove('d-none');

  //console.log(fileField.files.length);
    if (fileField.files.length) {
      let database = fileField.files[0];
      
      if (database.name.split(".").pop() == 'sqlite') {
        // console.log(database.name.split(".").pop()); //extension

        let host = window.location.host;
        let formData = new FormData();
        formData.append('database',database);
        // formData.append('usuario','antonny');

        fetch('http://' + host + '/api/v1/settings/database', {
          method: 'POST',
          body: formData
        })
          .then((response) => response.json())
          .then((result) => {
            // console.log(result);
            fileField.value = '';
            container_upload.classList.remove('d-none');
            message_upload.classList.add('d-none');
            //evalua si se creo la configuracion inicial para el host cliente
            if (result.resreturn.status == 'ok') {
              document.getElementById('toast_upload').classList.remove('text-bg-danger');
              document.getElementById('toast_upload').classList.add('text-bg-success');
              container_toast_upload.innerText = 'Cargado correctamente';
              toast_upload.show();
              setTimeout( function() { window.location.href = "http://"+ host + "/libraries/books"; }, 1200 );
            } else {
              container_toast_upload.innerText = 'Hubo un error en el archivo.';
              console.log(result.resreturn.message);
              toast_upload.show();
            }
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      } else {
        fileField.value = '';
        container_toast_upload.innerText = 'La extensión del archivo debe ser .sqlite';
        toast_upload.show();
      }
    } else {
      container_toast_upload.innerText = 'No se seleccionó ningún archivo';
      toast_upload.show();
    }
  });
});