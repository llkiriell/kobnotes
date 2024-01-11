document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    
    const toast_copy = document.getElementById('toast_copiar');
    const toast = new bootstrap.Toast(toast_copy);
    var toast_message = document.getElementById("toast_message");

    const dpd_filters = document.getElementById('dpd_filters');
    const span_btn_dpd_filters = document.getElementById('span_btn_dpd_filters');
    const dpd_filters_menu = document.getElementById('dpd_filters_menu');
    
    const message_words = document.getElementById('message_words');

    inicializar_eventos_copiar();
    showMessageWords();

    toast_copy.addEventListener('hidden.bs.toast', () => {
      toast_message.innerText = '';
    })
  
    function inicializar_eventos_copiar() {
      var bookmark_list = document.getElementById("bookmark_list");
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

        // console.log( bookmark_list.children[0]);
        let bookmark_selected_temp = '';
        for (let index = 0; index < bookmark_list.children.length; index++) {
          bookmark_selected_temp = bookmark_list.children[index].firstElementChild.firstElementChild;

          if (category != 'all') {
            if (bookmark_selected_temp.dataset.bookmarkCategory == category) {
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
  
        // console.log('Texto de filtro =>',selectedFilter.innerText);
        // console.log('Categoria =>',filterCategory);
        
        
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

    function showMessageWords() {
      let qty_words = document.getElementById('qty_words').innerText;
      if (qty_words < 1) {
        message_words.classList.remove('d-none');
      }
    }

    let btn_notion_export = document.getElementById('btn_notion_export');

    btn_notion_export.addEventListener('click', async function (e) {

      let volumeId = document.getElementById('container_book_info').dataset.idLibro;
      let autor = document.getElementById('p_autor_book').innerText;
      let title = document.getElementById('p_title_book').innerText;



      // let rpta_create_page = await createPage(autor,title,volumeId);

      // console.log(rpta_create_page)

    
console.log('Cargando...');
    });
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