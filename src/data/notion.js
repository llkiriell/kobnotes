const { Client } = require('@notionhq/client');

const NOTION_API_KEY = 'secret_3kRqzgC5y9IpaPIeub1SFWQXTarRhJ5NNAmUOyH87ZR';
const NOTION_DATABASE_ID = "cf70bb64841a4aa7809d0c4600722b59";

const notion = new Client({ auth: NOTION_API_KEY });
const bookmark = require('../models/bookmark');

async function createPage(name,autor) {
  let highlights = bookmark.getBookmarksById('file:///mnt/onboard/Precht, Richard David/Amor. Un sentimiento desordenado - Richard David Precht.epub');
  let page = 
  {
    "icon": {
      "type": "emoji",
      "emoji": "📝"
    },
    "parent": {
      "type": "database_id",
      "database_id": NOTION_DATABASE_ID
    },
    "properties": {
      "Name": {
        "title": [
          {
            "text": {
              "content": name
            }
          }
        ]
      },
      "Autor": {
        "rich_text": [
          {
            "text": {
              "content": autor
            }
          }
        ]
      }
    },
    "children": []
  };

  let childrensPage = [];

  let datos = [
    {
      'Text': 'La finalidad sería siempre la misma: representarse junto al ser deseado para estar con él sin estarlo.',
      'TitleChapter': 'XX'
    },
    {
      'Text': 'Ésta es la lógica interna e ilusoria en la que se fundamenta la iconofilia, fomentada enérgicamente desde las industrias audiovisuales contemporáneas.',
      'TitleChapter': 'V'
    },
    {
      'Text': 'Al proponer a la sociedad sujetos altamente deseables, pero a la vez inalcanzables.',
      'TitleChapter': 'XVI'
    }
  ];


  childrensPage = addDataInToggleBloks(highlights.data);

  page.children = childrensPage;
  const res = await notion.pages.create(page);

  console.log(res);

  // let bkmks = bookmark.getBookmarksGroupedById('file:///mnt/onboard/Montes de Oca Sicilia, Maria del Pilar/Para insultar con propiedad - Maria del Pilar Montes de Oca Sicilia.epub');

  // console.log(bkmks);

  
}

async function updateBlock(pageId = '5ecf8d06-36f7-4810-984f-a8e1c092e667') {

  const blockId = pageId;
  const response = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 50,
  });




  console.log(response);


}

function addDataInToggleBlock(nameToggleBlock, annotations, data) {
  let toggleBlock = {
    "object": "block",
    "toggle": {
      "rich_text": [{
        "type": "text",
        "text": {
          "content": nameToggleBlock,
          "link": null
        },
        "annotations": annotations
      }],
      "color": "default",
      "children": []
    }
  };

  let childrens = [];

  for (let index = 0; index < data.length; index++) {
    childrens.push(
      {
        "object": "block",
        "paragraph": {
          "rich_text": [
            {
              "type": "text",
              "text":
              {
                "content": '» ' + data[index].Text,
                "link": null
              },
              "annotations": {
                "bold": true,
                "color": "green_background"
              }
            }
          ],
          "color": "default"
        }
      }
    );

    childrens.push(
      {
        "object": "block",
        "paragraph": {
          "rich_text": [
            {
              "type": "text",
              "text":
              {
                "content": '',
                "link": null
              }
            }
          ],
          "color": "default"
        }
      }
    );

    childrens.push(
      {
        "object": "block",
        "paragraph": {
          "rich_text": [
            {
              "type": "text",
              "text":
              {
                "content": '— ' + data[index].TitleChapter,
                "link": null
              }
            }
          ],
          "color": "default"
        }
      }
    );

    childrens.push(
      {
        "object": "block",
        "divider": {}
      }
    );
  }

  // console.log(childrens);
  toggleBlock.toggle.children = childrens;
  return [toggleBlock];
}

function addDataInToggleBloks(bookmarkList) {
  let childrensPage = [];
  let block_divider = buildBlock('divider');

  let togglesBlock =
  {
    quote: {
      title: '🖋️ Citas',
      link: null,
      annotations: { "bold": true },
      paragraphAnnotations: { "italic": true },
      children: [],
      qty: 0
    },
    highlight: {
      title: '🖊️ Subrayados',
      link: null,
      annotations: { "bold": true, "color": "green" },
      paragraphAnnotations: { "bold": true, "color": "green_background" },
      children: [],
      qty: 0
    },
    note: {
      title: '✏️ Anotaciones',
      link: null,
      annotations: { "bold": true, "color": "blue" },
      paragraphAnnotations: { "bold": true, "color": "blue_background" },
      children: [],
      qty: 0
    },
    definition: {
      title: '🎓 Definiciones',
      link: null,
      annotations: { "bold": true, "color": "yellow" },
      paragraphAnnotations: { "bold": true, "italic": true },
      children: [],
      qty: 0
    },
    vocabulary: {
      title: '📔 Vocabulario',
      link: null,
      annotations: { "bold": true, "color": "purple" },
      paragraphAnnotations: { "italic": true },
      children: [],
      qty: 0
    }
  };

  let tb_temp = [];

  for (let index = 0; index < bookmarkList.length; index++) {
    let bookmark = bookmarkList[index];
    switch (bookmark.Category) {
      case 'quote':
        togglesBlock.quote.children.push(buildBlock('quote', { content: bookmark.Text }, togglesBlock.quote.paragraphAnnotations), buildBlock('paragraph', { content: bookmark.Annotation }, {}),buildBlock('paragraph', { content: `—${bookmark.TitleChapter}` }, {}),block_divider);
        tb_temp = togglesBlock.quote.children;
        togglesBlock.quote.qty++;
        break;
      case 'highlight':
        togglesBlock.highlight.children.push(buildBlock('paragraph', { content: bookmark.Text }, togglesBlock.highlight.paragraphAnnotations));
        tb_temp = togglesBlock.highlight.children;
        togglesBlock.highlight.qty++;
        if (togglesBlock.highlight.qty == 50) {
          break;
        }
        break;
      case 'note':
        togglesBlock.note.children.push(buildBlock('paragraph', { content: bookmark.Text }, togglesBlock.note.paragraphAnnotations));
        togglesBlock.note.qty++;
        break;
      case 'definition':
        togglesBlock.definition.children.push(buildBlock('paragraph', { content: bookmark.Text }, togglesBlock.definition.paragraphAnnotations));
        togglesBlock.definition.qty++;
        break;
      case 'vocabulary':
        togglesBlock.vocabulary.children.push(buildBlock('paragraph', { content: bookmark.Text }, togglesBlock.vocabulary.paragraphAnnotations));
        togglesBlock.vocabulary.qty++;
        break;
    }

    tb_temp = [];
  }


  childrensPage =
    [
      buildBlock('toggle', { content: togglesBlock.quote.title + ` [${togglesBlock.quote.qty + '-' + bookmarkList.length}]`, children: togglesBlock.quote.children }, togglesBlock.quote.annotations),
      buildBlock('divider'),
      buildBlock('toggle', { content: togglesBlock.note.title + ` [${togglesBlock.note.qty}]`, children: togglesBlock.note.children }, togglesBlock.note.annotations),
      // buildBlock('toggle', { content: togglesBlock.highlight.title + ` [${togglesBlock.highlight.qty}]`, children: togglesBlock.highlight.children }, togglesBlock.highlight.annotations),
      // buildBlock('divider')
    ];

    return childrensPage;


  // console.log('definition',l_definition.length);
  // console.log('vocabulary',l_vocabulary.length);
  // console.log('quote',l_quote.length);
  // console.log('note',l_note.length); 
  // console.log('highlight',l_highlight.length);



}

/**
 * Construye un bloque de la pagina de notion en la base de datos
 * @blockType {string} tipo de bloque
 * @attributes {Object} datos y bloques
 * @annotations {Object} opciones para el formato del bloque
 * @returns {Object}
 */
function buildBlock(blockType, attributes = { link: null }, annotations = {}) {
  let block = null;

  switch (blockType) {
    case 'page':
      block = 
      {
        "icon": {
          "type": "emoji",
          "emoji": attributes.emoji
        },
        "parent": {
          "type": "database_id",
          "database_id": NOTION_DATABASE_ID
        },
        "properties": {
          "Name": {
            "title": [
              {
                "text": {
                  "content": attributes.title
                }
              }
            ]
          },
          "Autor": {
            "rich_text": [
              {
                "text": {
                  "content": attributes.autor
                }
              }
            ]
          }
        },
        "children": attributes.children
      };
      break;
    case 'paragraph':
      block = 
        {
          "object": "block",
          "paragraph": {
            "rich_text": [
              {
                "type": "text",
                "text":
                {
                  "content": attributes.content,
                  "link": attributes.link
                },
                "annotations": annotations
              }
            ],
            "color": "default"
          }
        };
      break;
    case 'divider':
      block = 
      {
        "object": "block",
        "divider": {}
      };
      break;
    case 'quote': 
      block =
      {
       "quote": {
        "rich_text": [{
          "type": "text",
          "text": {
            "content": `«${attributes.content}»`,
            "link": attributes.link
          },
          "annotations": annotations
        }],
        "color": "default"
       }
      };
      break;
    case 'toggle':
      block = {
        "object": "block",
        "toggle": {
          "rich_text": [{
            "type": "text",
            "text": {
              "content": attributes.content,
              "link": attributes.link
            },
            "annotations": annotations
          }],
          "color": "default",
          "children": attributes.children
        }
      };
      break;
    default:
      block = 
      {
        "object": "block",
        "divider": {}
      };
      break;
  }
  return block;
}

async function exportBookmaks(bookTitle, autor, VolumeId){
  let togglesBlock =
  {
    quote: {
      title: '🖋️ Citas',
      link: null,
      annotations: { "bold": true },
      paragraphAnnotations: { "italic": true },
      children: [],
      qty: 0
    },
    highlight: {
      title: '🖊️ Subrayados',
      link: null,
      annotations: { "bold": true, "color": "green" },
      paragraphAnnotations: { "bold": true, "color": "green_background" },
      children: [],
      qty: 0
    },
    note: {
      title: '✏️ Anotaciones',
      link: null,
      annotations: { "bold": true, "color": "blue" },
      paragraphAnnotations: { "bold": true, "color": "blue_background" },
      children: [],
      qty: 0
    },
    definition: {
      title: '🎓 Definiciones',
      link: null,
      annotations: { "bold": true, "color": "purple" },
      paragraphAnnotations: { "bold": true, "italic": true },
      children: [],
      qty: 0
    },
    vocabulary: {
      title: '📔 Vocabulario',
      link: null,
      annotations: { "bold": true, "color": "yellow" },
      paragraphAnnotations: { "italic": true },
      children: [],
      qty: 0
    }
  };
  let dividerBlock = buildBlock('divider');
  let togglesList = [];
  let childrenList = [];
  let childrenList2 = {};

  let bookmarks = bookmark.getBookmarksGroupedById(VolumeId);

  if (bookmarks.groups.length >= 1) {

    bookmarks.groups.forEach(group => {
      let temp = [];
      switch (group.type) {
        case 'quotes':
          togglesList.push(buildBlock('toggle', { content: togglesBlock.quote.title + ` [${group.qty}]`, children: [] }, togglesBlock.quote.annotations));
          group.data.forEach(bkmrk => {
            temp.push(buildBlock('paragraph', { content: '»'+ bkmrk.Text.trim() }, togglesBlock.quote.paragraphAnnotations), buildBlock('paragraph', { content: `— ${bkmrk.TitleChapter}` }, {}),dividerBlock);
          });
          childrenList2.quotes = temp;
          break;
        case 'highlights':
          togglesList.push(buildBlock('toggle', { content: togglesBlock.highlight.title + ` [${group.qty}]`, children: [] }, togglesBlock.highlight.annotations));
          group.data.forEach(bkmrk => {
            temp.push(buildBlock('paragraph', { content: '»'+ bkmrk.Text.trim() }, togglesBlock.highlight.paragraphAnnotations), buildBlock('paragraph', { content: `— ${bkmrk.TitleChapter}` }, {}),dividerBlock);
          });
          childrenList2.highlights = temp;
          break;
        case 'notes':
          togglesList.push(buildBlock('toggle', { content: togglesBlock.note.title + ` [${group.qty}]`, children: [] }, togglesBlock.note.annotations));
          group.data.forEach(bkmrk => {
            temp.push(buildBlock('paragraph', { content: '»'+ bkmrk.Text.trim() }, togglesBlock.note.paragraphAnnotations), buildBlock('paragraph', { content: `— ${bkmrk.TitleChapter}` }, {}),dividerBlock);
          });
          childrenList2.notes = temp;
          break;
        case 'definitions':
          togglesList.push(buildBlock('toggle', { content: togglesBlock.definition.title + ` [${group.qty}]`, children: [] }, togglesBlock.definition.annotations));
          group.data.forEach(bkmrk => {
            temp.push(buildBlock('paragraph', { content: bkmrk.Text.trim() }, togglesBlock.definition.paragraphAnnotations), buildBlock('paragraph', { content: `— ${bkmrk.TitleChapter}` }, {}),dividerBlock);
          });
          childrenList2.definitions = temp;
          break;
        case 'vocabularies':
          togglesList.push(buildBlock('toggle', { content: togglesBlock.vocabulary.title + ` [${group.qty}]`, children: [] }, togglesBlock.vocabulary.annotations));
          group.data.forEach(bkmrk => {
            temp.push(buildBlock('paragraph', { content: bkmrk.Text.trim() }, togglesBlock.vocabulary.paragraphAnnotations), buildBlock('paragraph', { content: `— ${bkmrk.TitleChapter}` }, {}),dividerBlock);
          });
          childrenList2.vocabularies = temp;
          break;
      }
      temp = [];
    });

    // console.log(togglesList);

    //crear pagina
    const resPage = await notion.pages.create(
      {
        "icon": {
          "type": "emoji",
          "emoji": "📝"
        },
        "parent": {
          "type": "database_id",
          "database_id": NOTION_DATABASE_ID
        },
        "properties": {
          "Título": {
            "title": [
              {
                "text": {
                  "content": bookTitle
                }
              }
            ]
          },
          "Autor": {
            "rich_text": [
              {
                "text": {
                  "content": autor
                }
              }
            ]
          },
          "Resaltados": {
            "number": bookmarks.qty
          }
        },
        "children": togglesList
      }
    );

    // let temp_id = 'f660cbfe-f0c9-4f65-a1bf-dc44c7d70160';
    let temp_id = resPage.id;

    const blocksChildrenPage = await notion.blocks.children.list({
      block_id: temp_id,
      page_size: 50,
    });
 
    let idsBlocks = {}
    
    blocksChildrenPage.results.forEach(block => {
      let toggleTitle = block.toggle.rich_text[0].text.content;
      if (toggleTitle.search(togglesBlock.quote.title) >= 0) {
        idsBlocks.quotes = { id: block.id };
      } else if (toggleTitle.search(togglesBlock.highlight.title) >= 0) {
        idsBlocks.highlights = { id: block.id };
      } else if (toggleTitle.search(togglesBlock.note.title) >= 0) {
        idsBlocks.notes = { id: block.id };
      } else if (toggleTitle.search(togglesBlock.definition.title) >= 0) {
        idsBlocks.definitions = { id: block.id };
      } else if (toggleTitle.search(togglesBlock.vocabulary.title) >= 0) {
        idsBlocks.vocabularies = { id: block.id };
      }
    });

    //Actualiza los bloques
    bookmarks.groups.forEach(group => {
      switch (group.type) {
        case 'quotes':
          appendBlockChildren(idsBlocks.quotes.id,childrenList2.quotes);
          break;
        case 'highlights':
          appendBlockChildren(idsBlocks.highlights.id,childrenList2.highlights);
          break;
        case 'notes':
          appendBlockChildren(idsBlocks.notes.id,childrenList2.notes);
          break;
        case 'definitions':
          appendBlockChildren(idsBlocks.definitions.id,childrenList2.definitions);
          break;
        case 'vocabularies':
          appendBlockChildren(idsBlocks.vocabularies.id,childrenList2.vocabularies);
          break;
      }
    });
  }else{
    console.log('ERROR: No hay grupos ni elementos');
  }
}

async function appendBlockChildren(blockId, children) {

  let tempBlock = [];
  // console.log(children.length);
  for (let index = 0; index < children.length; index++) {
    // console.log(index);
    // console.log(children[index].paragraph.rich_text);
    tempBlock.push(children[index]);
    if (tempBlock.length == 20 || index == (children.length - 1)) {
      //actualiza el bloque especificado
      const response = await notion.blocks.children.append({
        block_id: blockId,
        children: tempBlock
      });
      console.log('last index:',index,'- qty blocks: ' ,response.object.length);
      tempBlock = [];
    }
  }
  console.log('------------------');
}

let numrand = Math.round(Math.random() * 1000000);
// console.log(numrand);
// createPage(`Libro ${numrand}`, `Autor ${numrand}`);
// updateBlock();

exportBookmaks('El eros electrónico', 'Roman Gubern','file:///mnt/onboard/Gubern, Roman/eros electronico, El - Roman Gubern.epub');
exportBookmaks('Amor. Un sentimiento desordenado', 'Richard David Precht','file:///mnt/onboard/Precht, Richard David/Amor. Un sentimiento desordenado - Richard David Precht.epub');




