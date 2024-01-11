const { Client } = require('@notionhq/client');

const NOTION_API_KEY = 'secret_3kRqzgC5y9IpaPIeub1SFWQXTarRhJ5NNAmUOyH87ZR';
const NOTION_DATABASE_ID = "cf70bb64841a4aa7809d0c4600722b59";

const notion = new Client({ auth: NOTION_API_KEY });
const bookmark = require('../models/bookmark');

/**
 * Construye un bloque de la pagina de notion en la base de datos
 * @blockType {string} tipo de bloque
 * @attributes {Object} datos y bloques
 * @annotations {Object} opciones para el formato del bloque childrenList
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

async function appendBlockChildren(blockId, children) {
  let tempBlock = [];
  let groups = 20, numberTimes = Math.round(children.length/groups);
  for (let index = 0; index < children.length; index++) {
    tempBlock.push(children[index]);
    if (tempBlock.length == 20 || index == (children.length - 1)) {
      //Update a specific block
      await notion.blocks.children.append({
        block_id: blockId,
        children: tempBlock
      });
      // console.log('last index:', index + 1, '- qty blocks: ', numberTimes);
      tempBlock = [];
    }
  }
}

async function exportBookmaks(bookTitle, autor, VolumeId){
  try {
    let res = { status: 200, msg: 'OK', data: null};
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
    let childrenList = {};

    let bookmarks = bookmark.getBookmarksGroupedById(VolumeId);

    if (bookmarks.groups.length >= 1) {
      //Group bookmarks by type
      bookmarks.groups.forEach(group => {
        let temp = [];
        switch (group.type) {
          case 'quotes':
            togglesList.push(buildBlock('toggle', { content: togglesBlock.quote.title + ` [${group.qty}]`, children: [] }, togglesBlock.quote.annotations));
            group.data.forEach(bkmrk => {
              temp.push(buildBlock('paragraph', { content: '»'+ bkmrk.Text.trim() }, togglesBlock.quote.paragraphAnnotations), buildBlock('paragraph', { content: `— ${bkmrk.TitleChapter}` }, {}),dividerBlock);
            });
            childrenList.quotes = temp;
            break;
          case 'highlights':
            togglesList.push(buildBlock('toggle', { content: togglesBlock.highlight.title + ` [${group.qty}]`, children: [] }, togglesBlock.highlight.annotations));
            group.data.forEach(bkmrk => {
              temp.push(buildBlock('paragraph', { content: '»'+ bkmrk.Text.trim() }, togglesBlock.highlight.paragraphAnnotations), buildBlock('paragraph', { content: `— ${bkmrk.TitleChapter}` }, {}),dividerBlock);
            });
            childrenList.highlights = temp;
            break;
          case 'notes':
            togglesList.push(buildBlock('toggle', { content: togglesBlock.note.title + ` [${group.qty}]`, children: [] }, togglesBlock.note.annotations));
            group.data.forEach(bkmrk => {
              temp.push(buildBlock('paragraph', { content: '»'+ bkmrk.Text.trim() }, togglesBlock.note.paragraphAnnotations), buildBlock('paragraph', { content: bkmrk.Annotation }, {}),buildBlock('paragraph', { content: `— ${bkmrk.TitleChapter}` }, {}),dividerBlock);
            });
            childrenList.notes = temp;
            break;
          case 'definitions':
            togglesList.push(buildBlock('toggle', { content: togglesBlock.definition.title + ` [${group.qty}]`, children: [] }, togglesBlock.definition.annotations));
            group.data.forEach(bkmrk => {
              temp.push(buildBlock('paragraph', { content: bkmrk.Text.trim() }, togglesBlock.definition.paragraphAnnotations), buildBlock('paragraph', { content: `— ${bkmrk.TitleChapter}` }, {}),dividerBlock);
            });
            childrenList.definitions = temp;
            break;
          case 'vocabularies':
            togglesList.push(buildBlock('toggle', { content: togglesBlock.vocabulary.title + ` [${group.qty}]`, children: [] }, togglesBlock.vocabulary.annotations));
            group.data.forEach(bkmrk => {
              temp.push(buildBlock('paragraph', { content: bkmrk.Text.trim() }, togglesBlock.vocabulary.paragraphAnnotations), buildBlock('paragraph', { content: `— ${bkmrk.TitleChapter}` }, {}),dividerBlock);
            });
            childrenList.vocabularies = temp;
            break;
        }
        temp = [];
      });

      //Create a new page in the database
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

      let temp_id = resPage.id;

      //Get page block list
      const blocksChildrenPage = await notion.blocks.children.list({
        block_id: temp_id,
        page_size: 50,
      });
  
      let idsBlocks = {};
      //Extract block identifiers
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

      //Update the blocks of the page
      bookmarks.groups.forEach(async (group) => {
        switch (group.type) {
          case 'quotes':
            await appendBlockChildren(idsBlocks.quotes.id,childrenList.quotes);
            break;
          case 'highlights':
            await appendBlockChildren(idsBlocks.highlights.id,childrenList.highlights);
            break;
          case 'notes':
            await appendBlockChildren(idsBlocks.notes.id,childrenList.notes);
            break;
          case 'definitions':
            await appendBlockChildren(idsBlocks.definitions.id,childrenList.definitions);
            break;
          case 'vocabularies':
            await appendBlockChildren(idsBlocks.vocabularies.id,childrenList.vocabularies);
            break;
        }
      });

      res.data = { idPage: temp_id, idsBlocks: idsBlocks };

    }else{
      res.status = 500;
      res.msg = 'ERROR: There are no groups or elements.';
    }
    return res;
  } catch (error) {
    return { status: 500, msg: error.message, data: error };
  }
}

// exportBookmaks('El eros electrónico', 'Roman Gubern','file:///mnt/onboard/Gubern, Roman/eros electronico, El - Roman Gubern.epub');
// exportBookmaks('Amor. Un sentimiento desordenado', 'Richard David Precht','file:///mnt/onboard/Precht, Richard David/Amor. Un sentimiento desordenado - Richard David Precht.epub');

(async function () {
  let res = await exportBookmaks('El eros electrónico', 'Roman Gubern','file:///mnt/onboard/Gubern, Roman/eros electronico, El - Roman Gubern.epub');
  console.log(res);
})();