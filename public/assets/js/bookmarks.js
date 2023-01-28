document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    
    const dpd_filters = document.getElementById('dpd_filters');
    const span_btn_dpd_filters = document.getElementById('span_btn_dpd_filters');
    const dpd_filters_menu = document.getElementById('dpd_filters_menu');
  
    inicializar_eventos_copiar();
  
  
  
    function inicializar_eventos_copiar() {
      var bookmark_list = document.getElementById("bookmark_list");
      var botones_copiar = bookmark_list.querySelectorAll('button.btn-copiar');
  
      for (let index = 0; index < botones_copiar.length; index++) {
        botones_copiar[index].addEventListener('click', function (e) {
          
          let padre = botones_copiar[index].parentNode.parentNode.parentNode.parentNode;
          
          let tipo_resalte = padre.classList[3];
          
          let hijo = botones_copiar[index].parentNode.parentNode.firstElementChild;
          let titulo_y_auto = '\n[' + document.getElementById('p_titulo_libro').innerText + ' - ' + document.getElementById('p_autor_libro').innerText + ']';
          let texto_copiado = '';
          
          if (tipo_resalte == 'cita') {
            texto_copiado += '«' + hijo.firstElementChild.querySelector('blockquote>p').textContent.trim() + '»';
            texto_copiado += '\n— ' + hijo.firstElementChild.querySelector('figcaption').textContent.trim()
          } else if (tipo_resalte == 'palabra') {
            texto_copiado += hijo.querySelector('h5').textContent.trim();
          } else {
            texto_copiado += '«' + hijo.querySelector('h5').textContent.trim() + '»';
            if (tipo_resalte == 'nota') {
              texto_copiado += '\n' + hijo.querySelector('p').textContent.trim();
            }
          }
  
          navigator.clipboard.writeText(texto_copiado + titulo_y_auto);
  
          const toast = new bootstrap.Toast(document.getElementById('toast_copiar'));
  
          toast.show();
  
  
  
        }, false);
      }
    }
  
  
    for (let index = 0; index < dpd_filters_menu.children.length; index++) {
      //Desactiva el ul seleccionado
      const initActive = function (list) {
        for (let index = 0; index < list.length; index++) {
          list[index].children[0].classList.remove('active');
        }
      }
      //inicializa los marcadores
      const initOrderBookmarks = function (category) {
        let bookmark_list = document.getElementById('bookmark_list');
        
        
  
        for (let index = 0; index < bookmark_list.children.length; index++) {
  
          if (category != 'all') {
            if (bookmark_list.children[index].dataset.bookmarkCategory == category) {
              bookmark_list.children[index].classList.remove('d-none');
            } else {
              bookmark_list.children[index].classList.add('d-none');
            }
          } else {
            bookmark_list.children[index].classList.remove('d-none');
          }
        }
      }
  
      dpd_filters_menu.children[index].addEventListener('click',function (e) {
  
        initActive(dpd_filters_menu.children);
        let selectedFilter = dpd_filters_menu.children[index].children[0];
        let filterCategory = selectedFilter.dataset.filterCategory;
        const quantity_bookmarks_category = document.getElementsByClassName(filterCategory).length;
        const bookmark_message = document.getElementById('bookmark_message');
        const bookmark_message_category = document.getElementById('bookmark_message_category');
  
        console.log('Texto de filtro =>',selectedFilter.innerText);
        console.log('Categoria =>',filterCategory);
        
        
        dpd_filters_menu.children[index].children[0].classList.add('active');
        span_btn_dpd_filters.innerText = selectedFilter.innerText + ' ';
  
        initOrderBookmarks(filterCategory);
  
        //Muestra mensaje si no hay marcadores
        if (quantity_bookmarks_category == 0 && filterCategory != 'all') {
          bookmark_message.classList.remove('d-none');
          bookmark_message_category.innerText = selectedFilter.innerText.toLowerCase();
        }else{
          bookmark_message.classList.add('d-none');
        }
  
      });
    }
  
  
  });