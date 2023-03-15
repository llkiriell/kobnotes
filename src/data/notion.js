const { Client } = require('@notionhq/client');
const NOTION_API_KEY = 'secret_3kRqzgC5y9IpaPIeub1SFWQXTarRhJ5NNAmUOyH87ZR';
const NOTION_DATABASE_ID = "cf70bb64841a4aa7809d0c4600722b59";

const notion = new Client({ auth: NOTION_API_KEY });

(async () => {
  const response = await notion.pages.create({
    "cover": {
      "type": "external",
      "external": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
      }
    },
    "icon": {
      "type": "emoji",
      "emoji": "🥬"
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
              "content": "Tuscan kale"
            }
          }
        ]
      },
      "Description": {
        "rich_text": [
          {
            "text": {
              "content": "A dark green leafy vegetable"
            }
          }
        ]
      }
    },
    "children": [
      {
        "object": "block",
        "heading_2": {
          "rich_text": [
            {
              "text": {
                "content": "Lacinato kale"
              }
            }
          ]
        }
      },
      {
        "object": "block",
        "paragraph": {
          "rich_text": [
            {
              "text": {
                "content": "Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.",
                "link": {
                  "url": "https://en.wikipedia.org/wiki/Lacinato_kale"
                }
              },
              "href": "https://en.wikipedia.org/wiki/Lacinato_kale"
            }
          ],
          "color": "default"
        }
      }
    ]
  });
  console.log(response);
})();