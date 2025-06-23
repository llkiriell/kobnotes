document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("loading_screen").classList.add("d-none");

    // Inicializar tooltips solo para elementos que tienen un título
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => {
        // Verificar que el elemento tiene un título antes de crear el tooltip
        if (tooltipTriggerEl.getAttribute('title') || tooltipTriggerEl.getAttribute('data-bs-title')) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        }
        return null;
    }).filter(tooltip => tooltip !== null);
    
    const toast_copy = document.getElementById('toast_copiar');
    const toast = new bootstrap.Toast(toast_copy);
    var toast_message = document.getElementById("toast_message");

    const dpd_filters = document.getElementById('dpd_filters');
    const span_btn_dpd_filters = document.getElementById('span_btn_dpd_filters');
    const dpd_filters_menu = document.getElementById('dpd_filters_menu');
    
    const message_words = document.getElementById('message_words');
    const bookmark_list = document.getElementById("bookmark_list");
    const bookmark_message = document.getElementById('bookmark_message');
    const bookmark_message_category = document.getElementById('bookmark_message_category');

    // Inicializar eventos
    inicializar_eventos_copiar();
    initializeFilterEvents();
    
    // Función para inicializar los eventos de filtrado
    function initializeFilterEvents() {
      if (!dpd_filters_menu) return;
      
      for (let index = 0; index < dpd_filters_menu.children.length; index++) {
        dpd_filters_menu.children[index].addEventListener('click', function (e) {
          e.preventDefault();
          
          // Desactivar todos los filtros
          for (let i = 0; i < dpd_filters_menu.children.length; i++) {
            dpd_filters_menu.children[i].children[0].classList.remove('active');
          }
          
          // Activar el filtro seleccionado
          let selectedFilter = dpd_filters_menu.children[index].children[0];
          selectedFilter.classList.add('active');
          
          // Actualizar el texto del botón
          if (span_btn_dpd_filters) {
            span_btn_dpd_filters.innerText = selectedFilter.innerText + ' ';
          }
          
          // Aplicar el filtro
          applyFilter(selectedFilter.dataset.filterCategory);
        });
      }
    }
    
    // Función para aplicar el filtro seleccionado
    function applyFilter(category) {
      if (!bookmark_list) return;
      
      const bookmarks = bookmark_list.querySelectorAll('.vstack');
      let visibleCount = 0;
      
      for (let i = 0; i < bookmarks.length; i++) {
        const bookmark = bookmarks[i].querySelector('.bookmark');
        
        if (!bookmark) continue;
        
        const bookmarkCategory = bookmark.dataset.bookmarkCategory;
        
        if (category === 'all' || bookmarkCategory === category) {
          bookmarks[i].classList.remove('d-none');
          visibleCount++;
        } else {
          bookmarks[i].classList.add('d-none');
        }
      }
      
      // Mostrar mensaje si no hay marcadores de la categoría seleccionada
      if (bookmark_message && bookmark_message_category) {
        if (visibleCount === 0 && category !== 'all') {
          bookmark_message.classList.remove('d-none');
          bookmark_message_category.innerText = dpd_filters_menu.querySelector(`[data-filter-category="${category}"]`).innerText.toLowerCase();
        } else {
          bookmark_message.classList.add('d-none');
        }
      }
    }

    //showMessageWords();

    toast_copy.addEventListener('hidden.bs.toast', () => {
      toast_message.innerText = '';
    })
  
    function inicializar_eventos_copiar() {
      if (!bookmark_list) return;
      
      var botones_copiar = bookmark_list.querySelectorAll('button.btn-copy');
      
      for (let index = 0; index < botones_copiar.length; index++) {
        botones_copiar[index].addEventListener('click', function (e) {
          
          let padre = botones_copiar[index].parentNode.parentNode.parentNode.parentNode;
          
          padre = padre.children[0].firstElementChild;

          
          let tipo_resalte = padre.classList[3];
          let hijo = padre.children[1].firstElementChild.firstElementChild;

          let titulo_y_auto = '\n[' + document.getElementById('p_title_book').innerText + ' - ' + document.getElementById('p_autor_book').innerText + ']';
          let texto_copiado = '';

          if (tipo_resalte == 'highlight' || tipo_resalte == 'note' || tipo_resalte == 'vocabulary') {
            texto_copiado += '«' + hijo.children[0].textContent.trim() + '»';
          }else{
            texto_copiado += hijo.children[0].textContent.trim();
          }
          navigator.clipboard.writeText(texto_copiado + titulo_y_auto);
  
          toast_message.innerText = texto_copiado;
          toast.show();
        }, false);
      }
    }

    function showMessageWords() {
      let qty_words = document.getElementById('qty_words');
      if (qty_words && parseInt(qty_words.innerText) < 1) {
        if (message_words) {
        message_words.classList.remove('d-none');
        }
      }
    }

    let btn_notion_export = document.getElementById('btn_notion_export');

    if (btn_notion_export) {
    btn_notion_export.addEventListener('click', async function (e) {
        let container_book_info = document.getElementById('container_book_info');
        if (!container_book_info) return;

        let volumeId = container_book_info.dataset.idLibro;
      let autor = document.getElementById('p_autor_book').innerText;
      let title = document.getElementById('p_title_book').innerText;
    
console.log('Cargando...');
    });
    }
  });

  async function createPage(autor,title,volumeId) {
    try {
      let paramms = new URLSearchParams({
        Autor:autor,
        Title:title,
        VolumeID:volumeId
      });
      paramms = paramms.toString();
      let res = await fetch(`http://localhost:5100/api/v1/export/notion/createPage?${paramms}`);
      return res.json();
    } catch (error) {
      return {status:'error', message: error.message};
    }
  }