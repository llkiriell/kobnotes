document.addEventListener('DOMContentLoaded', function () {
  // Referencias a elementos DOM
  const librariesList = document.getElementById('libraries-list');
  const noLibrariesMessage = document.getElementById('no-libraries-message');
  const btnAddFirstLibrary = document.getElementById('btn-add-first-library');
  const newLibraryForm = document.getElementById('new-library-form');
  const libraryNameInput = document.getElementById('library-name');
  const libraryDescriptionInput = document.getElementById('library-description');
  const fileInput = document.getElementById('input_dataload');
  const filePathContainer = document.getElementById('file-path-container');
  const filePathInput = document.getElementById('file-path');
  const btnBrowseFile = document.getElementById('btn-browse-file');
  const btnVerify = document.getElementById('btn-verify');
  const btnSaveLibrary = document.getElementById('btn-save-library');
  const messageUpload = document.getElementById('message_upload');
  
  // Inicializar toast
  const toastEl = document.getElementById('toast_upload');
  const toast = new bootstrap.Toast(toastEl);
  const toastMessage = document.getElementById('container_toast_upload');
  
  // Función para mostrar mensaje en el toast
  function showToast(message, isSuccess = false) {
    toastMessage.innerText = message;
    
    if (isSuccess) {
      toastEl.classList.remove('text-bg-danger');
      toastEl.classList.add('text-bg-success');
    } else {
      toastEl.classList.remove('text-bg-success');
      toastEl.classList.add('text-bg-danger');
    }
    
    toast.show();
  }
  
  // Cargar la lista de librerías al iniciar
  loadLibraries();
  
  // Event listeners
  btnAddFirstLibrary.addEventListener('click', function() {
    document.getElementById('new-library-tab').click();
  });
  
  fileInput.addEventListener('change', function() {
    if (this.files.length > 0) {
      const file = this.files[0];
      
      if (file.name.endsWith('.sqlite')) {
        filePathInput.value = file.name;
        filePathContainer.style.display = 'block';
        btnVerify.disabled = false;
      } else {
        showToast('El archivo debe tener extensión .sqlite');
        this.value = '';
        filePathContainer.style.display = 'none';
      }
    }
  });
  
  btnVerify.addEventListener('click', function() {
    if (fileInput.files.length === 0) {
      showToast('Por favor, selecciona un archivo');
      return;
    }
    
    const file = fileInput.files[0];
    verifyDatabase(file);
  });
  
  newLibraryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!libraryNameInput.value.trim()) {
      showToast('Por favor, ingresa un nombre para la librería');
      return;
    }
    
    if (fileInput.files.length === 0) {
      showToast('Por favor, selecciona un archivo de base de datos');
      return;
    }
    
    saveLibrary();
  });
  
  // Función para cargar la lista de librerías
  function loadLibraries() {
    fetch('/libraries/api/list')
      .then(response => response.json())
      .then(data => {
        if (data.success && data.libraries && data.libraries.length > 0) {
          // Mostrar la lista de librerías
          noLibrariesMessage.style.display = 'none';
          renderLibrariesList(data.libraries);
        } else {
          // Mostrar mensaje de que no hay librerías
          noLibrariesMessage.style.display = 'block';
        }
      })
      .catch(error => {
        console.error('Error cargando librerías:', error);
        showToast('Error al cargar las librerías');
      });
  }
  
  // Función para renderizar la lista de librerías
  function renderLibrariesList(libraries) {
    // Limpiar lista actual
    librariesList.innerHTML = '';
    
    libraries.forEach(library => {
      const item = document.createElement('div');
      item.className = 'list-group-item list-group-item-action d-flex gap-3 py-3';
      if (library.is_active) {
        item.classList.add('active');
      }
      
      item.innerHTML = `
        <div class="d-flex gap-2 w-100 justify-content-between">
          <div>
            <h6 class="mb-0">${library.name}</h6>
            <p class="mb-0 opacity-75">${library.description || 'Sin descripción'}</p>
            <small class="opacity-50 text-nowrap">${library.path_db}</small>
          </div>
          <div class="btn-group" role="group">
            ${!library.is_active ? `<button type="button" class="btn btn-sm btn-outline-primary btn-activate" data-id="${library.id}">Activar</button>` : ''}
            <button type="button" class="btn btn-sm btn-outline-danger btn-delete" data-id="${library.id}">Eliminar</button>
          </div>
        </div>
      `;
      
      librariesList.appendChild(item);
    });
    
    // Agregar event listeners a los botones
    document.querySelectorAll('.btn-activate').forEach(btn => {
      btn.addEventListener('click', function() {
        const libraryId = this.getAttribute('data-id');
        activateLibrary(libraryId);
      });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', function() {
        const libraryId = this.getAttribute('data-id');
        deleteLibrary(libraryId);
      });
    });
  }
  
  // Función para verificar la base de datos
  function verifyDatabase(file) {
    const formData = new FormData();
    formData.append('database', file);
    
    messageUpload.classList.remove('d-none');
    btnVerify.disabled = true;
    
    fetch('/libraries/api/verify', {
          method: 'POST',
          body: formData
        })
      .then(response => response.json())
      .then(data => {
        messageUpload.classList.add('d-none');
        btnVerify.disabled = false;
        
        if (data.success && data.valid) {
          showToast('Base de datos válida', true);
          btnSaveLibrary.disabled = false;
            } else {
          showToast(data.message || 'La base de datos no es válida');
          btnSaveLibrary.disabled = true;
            }
          })
      .catch(error => {
        messageUpload.classList.add('d-none');
        btnVerify.disabled = false;
        showToast('Error al verificar la base de datos');
            console.error('Error:', error);
          });
  }
  
  // Función para guardar la librería
  function saveLibrary() {
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('database', file);
    formData.append('name', libraryNameInput.value);
    formData.append('description', libraryDescriptionInput.value);
    
    messageUpload.classList.remove('d-none');
    btnSaveLibrary.disabled = true;
    
    fetch('/libraries/api/save', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        messageUpload.classList.add('d-none');
        
        if (data.success) {
          showToast('Librería guardada correctamente', true);
          
          // Limpiar formulario
          newLibraryForm.reset();
          filePathContainer.style.display = 'none';
          btnSaveLibrary.disabled = true;
          
          // Recargar lista de librerías
          loadLibraries();
          
          // Cambiar a la pestaña de librerías
          document.getElementById('libraries-tab').click();
      } else {
          showToast(data.message || 'Error al guardar la librería');
          btnSaveLibrary.disabled = false;
        }
      })
      .catch(error => {
        messageUpload.classList.add('d-none');
        btnSaveLibrary.disabled = false;
        showToast('Error al guardar la librería');
        console.error('Error:', error);
      });
  }
  
  // Función para activar una librería
  function activateLibrary(libraryId) {
    fetch(`/libraries/api/${libraryId}/activate`, {
      method: 'PUT'
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showToast('Librería activada correctamente', true);
          
          // Recargar lista de librerías
          loadLibraries();
          
          // Redirigir a la página principal después de un breve retraso
          setTimeout(() => {
            window.location.href = '/libraries';
          }, 1000);
    } else {
          showToast(data.message || 'Error al activar la librería');
        }
      })
      .catch(error => {
        showToast('Error al activar la librería');
        console.error('Error:', error);
      });
  }
  
  // Función para eliminar una librería
  function deleteLibrary(libraryId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta librería?')) {
      return;
    }
    
    fetch(`/libraries/api/${libraryId}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showToast('Librería eliminada correctamente', true);
          
          // Recargar lista de librerías
          loadLibraries();
        } else {
          showToast(data.message || 'Error al eliminar la librería');
        }
      })
      .catch(error => {
        showToast('Error al eliminar la librería');
        console.error('Error:', error);
      });
  }
});