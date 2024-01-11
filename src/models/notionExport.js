const { Client } = require('@notionhq/client');

const NOTION_API_KEY = 'secret_3kRqzgC5y9IpaPIeub1SFWQXTarRhJ5NNAmUOyH87ZR';
const NOTION_DATABASE_ID = "cf70bb64841a4aa7809d0c4600722b59";

const notion = new Client({ auth: NOTION_API_KEY });

module.exports = {
  createPage: async function (autor, bookTitle, bookmarksQty, togglesList) {
    try {
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
              "number": bookmarksQty
            }
          },
          "children": togglesList
        }
      );

      return resPage;
    } catch (error) {
      return error.message
    }
  },
  buildBlock: function (blockType, attributes = { link: null }, annotations = {}) {
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
}

