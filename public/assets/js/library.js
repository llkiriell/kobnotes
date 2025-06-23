document.addEventListener('DOMContentLoaded', async function () {
  // Inicializar tooltips
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

  // Referencias a elementos del DOM
  const librariesContainer = document.getElementById('libraries-container');
  const noLibrariesContainer = document.getElementById('no-libraries-container');
  const toast = new bootstrap.Toast(document.getElementById('libraryToast'));
  const toastMessage = document.getElementById('toastMessage');
  
  // Modal de activación de librería
  const activateLibraryModal = new bootstrap.Modal(document.getElementById('activateLibraryModal'));
  const confirmActivateBtn = document.getElementById('confirmActivateBtn');
  const libraryNameToActivate = document.getElementById('libraryNameToActivate');
  const activationLoadingIndicator = document.getElementById('activationLoadingIndicator');
  
  // Variables para almacenar información de la librería a activar
  let libraryToActivate = null;
  
  // Cargar librerías al iniciar
  loadLibraries();

  // Función para cargar las librerías
  async function loadLibraries() {
    try {
      const response = await fetch('/libraries/api/list');
      const data = await response.json();
      
      if (data.success && data.libraries && data.libraries.length > 0) {
        renderLibraries(data.libraries);
        
        // Verificar que los elementos existen antes de manipular sus clases
        if (noLibrariesContainer) {
          noLibrariesContainer.classList.add('d-none');
        }
        
        if (librariesContainer) {
          librariesContainer.classList.remove('d-none');
        }
        
        // Añadir event listeners a los botones de activación
        addActivateButtonListeners();
      } else {
        // No hay librerías dinámicas, mostrar mensaje si tampoco hay estáticas
        const staticLibraries = librariesContainer ? librariesContainer.querySelectorAll('.card') : [];
        if (staticLibraries.length === 0) {
          if (noLibrariesContainer) {
            noLibrariesContainer.classList.remove('d-none');
          }
          
          if (librariesContainer) {
            librariesContainer.classList.add('d-none');
          }
        }
      }
    } catch (error) {
      console.error('Error cargando librerías:', error);
      showToast('Error al cargar las librerías', false);
    }
  }

  // Función para renderizar las librerías
  function renderLibraries(libraries) {
    // Crear elementos para las librerías dinámicas
    libraries.forEach(library => {
      // Verificar si la librería ya existe (para evitar duplicados)
      const existingLibrary = document.getElementById(`library-${library.id}`);
      if (existingLibrary) {
        return; // Si ya existe, no la añadimos de nuevo
      }
      
      // Crear columna
      const col = document.createElement('div');
      col.className = 'col-12 col-xxl-3 pt-2 pt-sm-0';
      col.id = `library-${library.id}`;
      
      // Crear tarjeta
      const card = document.createElement('div');
      card.className = 'card';
      if (library.is_active) {
        card.classList.add('active-library');
      }
      
      // Crear contenido de la tarjeta
      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title"><i class="fa-duotone fa-server me-2"></i>${library.name}</h5>
          <h6 class="card-subtitle mb-2 text-body-secondary">${library.description || 'Sin descripción'}</h6>
          <p class="card-text"><i class="fa-duotone fa-books me-2"></i>${library.bookCount || 0} libros con marcadores</p>
          <a href="/libraries/${library.id}/settings" class="btn btn-outline-dark border-0"><i class="fad fa-cog"></i></a>
          ${library.is_active ? 
            `<a href="/libraries/${library.id}/books" class="btn btn-warning float-end"><i class="fa-duotone fa-books"></i></a>` : 
            `<button class="btn btn-warning float-end btn-activate" data-id="${library.id}" data-name="${library.name}"><i class="fa-duotone fa-plug"></i></button>`}
        </div>
      `;
      
      // Añadir la tarjeta a la columna
      col.appendChild(card);
      
      // Añadir la columna al contenedor
      librariesContainer.appendChild(col);
    });
  }
  
  // Función para añadir event listeners a los botones de activación
  function addActivateButtonListeners() {
    const activateButtons = document.querySelectorAll('.btn-activate');
    activateButtons.forEach(button => {
      button.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const name = this.getAttribute('data-name');
        
        libraryToActivate = id;
        if (libraryNameToActivate) {
          libraryNameToActivate.textContent = name;
        }
        
        activateLibraryModal.show();
      });
    });
  }
  
  // Event listener para el botón de confirmar activación
  if (confirmActivateBtn) {
    confirmActivateBtn.addEventListener('click', function() {
      if (libraryToActivate) {
        activateLibrary(libraryToActivate);
    }
    });
  }
  
  // Función para activar una librería
  async function activateLibrary(id) {
    try {
      // Mostrar indicador de carga
      if (activationLoadingIndicator) {
        activationLoadingIndicator.classList.remove('d-none');
      }
      
      const response = await fetch(`/libraries/api/${id}/activate`, {
        method: 'PUT'
      });
      
      const data = await response.json();
      
      // Ocultar indicador de carga
      if (activationLoadingIndicator) {
        activationLoadingIndicator.classList.add('d-none');
      }
      
      if (data.success) {
        // Cerrar el modal
        activateLibraryModal.hide();
        
        showToast('Librería activada correctamente', true);
        
        // Recargar la página después de un breve retraso
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        showToast(data.message || 'Error al activar la librería', false);
      }
    } catch (error) {
      console.error('Error activando librería:', error);
      showToast('Error al activar la librería', false);
      
      // Ocultar indicador de carga en caso de error
      if (activationLoadingIndicator) {
        activationLoadingIndicator.classList.add('d-none');
      }
    }
  }
  
  // Función para mostrar mensajes en el toast
  function showToast(message, isSuccess = true) {
    const toastElement = document.getElementById('libraryToast');
    
    if (!toastElement || !toastMessage) {
      console.error('Elementos del toast no encontrados');
      return;
    }
    
    if (isSuccess) {
      toastElement.classList.remove('text-bg-danger');
      toastElement.classList.add('text-bg-success');
    } else {
      toastElement.classList.remove('text-bg-success');
      toastElement.classList.add('text-bg-danger');
    }
    
    toastMessage.textContent = message;
    toast.show();
  }
});
