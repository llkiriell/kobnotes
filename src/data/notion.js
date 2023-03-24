const { Client } = require('@notionhq/client');
const NOTION_API_KEY = 'secret_3kRqzgC5y9IpaPIeub1SFWQXTarRhJ5NNAmUOyH87ZR';
const NOTION_DATABASE_ID = "cf70bb64841a4aa7809d0c4600722b59";

const notion = new Client({ auth: NOTION_API_KEY });

async function createPage(name,autor) {
  // const res = await notion.pages.create({
  //   // "cover": {
  //   //   "type": "external",
  //   //   "external": {
  //   //     "url": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
  //   //   }
  //   // },
  //   "icon": {
  //     "type": "emoji",
  //     "emoji": "📝"
  //   },
  //   "parent": {
  //     "type": "database_id",
  //     "database_id": NOTION_DATABASE_ID
  //   },
  //   "properties": {
  //     "Name": {
  //       "title": [
  //         {
  //           "text": {
  //             "content": name
  //           }
  //         }
  //       ]
  //     },
  //     "Autor": {
  //       "rich_text": [
  //         {
  //           "text": {
  //             "content": autor
  //           }
  //         }
  //       ]
  //     }
  //   },
  //   "children": [
  //     // {
  //     //   "object": "block",
  //     //   "heading_2": {
  //     //     "rich_text": [
  //     //       {
  //     //         "text": {
  //     //           "content": "Lacinato kale"
  //     //         }
  //     //       }
  //     //     ]
  //     //   }
  //     // },
  //     // {
  //     //   "object": "block",
  //     //   "paragraph": {
  //     //     "rich_text": [
  //     //       {
  //     //         "text": {
  //     //           "content": "Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.",
  //     //           "link": {
  //     //             "url": "https://en.wikipedia.org/wiki/Lacinato_kale"
  //     //           }
  //     //         },
  //     //         "href": "https://en.wikipedia.org/wiki/Lacinato_kale"
  //     //       }
  //     //     ],
  //     //     "color": "default"
  //     //   }
  //     // },
  //     // {
  //     //   "object": "block",
  //     //   "callout": {
  //     //     "rich_text": [{
  //     //       "type": "text",
  //     //       "text": {
  //     //         "content": "Lacinato kale",
  //     //         "link": null
  //     //       }
  //     //     }],
  //     //     "icon": {
  //     //       "emoji": "⭐"
  //     //     },
  //     //     "color": "gray_background"
  //     //   }
  //     // }, -------------------------------------------
  //     {
  //       "object": "block",
  //       "toggle": {
  //         "rich_text": [{
  //           "type": "text",
  //           "text": {
  //             "content": "🖊️ Subrayados [5]",
  //             "link": null
  //           },
  //           "annotations": {
  //             "bold": true,
  //             "color": "green"
  //           }
  //         }],
  //         "color": "default",
  //         "children": [
  //           {
  //             "object": "block",
  //             "paragraph": {
  //               "rich_text": [
  //                 {
  //                   "type": "text",
  //                   "text":
  //                   {
  //                     "content": "» La finalidad sería siempre la misma: representarse junto al ser deseado para estar con él sin estarlo. Ésta es la lógica interna e ilusoria en la que se fundamenta la iconofilia, fomentada enérgicamente desde las industrias audiovisuales contemporáneas al proponer a la sociedad sujetos altamente deseables, pero a la vez inalcanzables.",
  //                     "link": null
  //                   },
  //                   "annotations": {
  //                     "bold": true,
  //                     "color": "green_background"
  //                   }
  //                 }
  //               ],
  //               "color": "default"
  //             }
  //           },
  //           {
  //             "object": "block",
  //             "paragraph": {
  //               "rich_text": [
  //                 {
  //                   "type": "text",
  //                   "text":
  //                   {
  //                     "content": "— VIII",
  //                     "link": null
  //                   }
  //                 }
  //               ],
  //               "color": "default"
  //             }
  //           },
  //           {
  //             "object": "block",
  //             "divider": {}
  //           },
  //           {
  //             "object": "block",
  //             "paragraph": {
  //               "rich_text": [
  //                 {
  //                   "type": "text",
  //                   "text":
  //                   {
  //                     "content": "» Al proponer a la sociedad sujetos altamente deseables, pero a la vez inalcanzables.",
  //                     "link": null
  //                   },
  //                   "annotations": {
  //                     "bold": true,
  //                     "color": "green_background"
  //                   }
  //                 }
  //               ],
  //               "color": "default"
  //             }
  //           },
  //           {
  //             "object": "block",
  //             "paragraph": {
  //               "rich_text": [
  //                 {
  //                   "type": "text",
  //                   "text":
  //                   {
  //                     "content": "— X",
  //                     "link": null
  //                   }
  //                 }
  //               ],
  //               "color": "default"
  //             }
  //           }
  //         ]
  //       }
  //     },
  //     {
  //       "object": "block",
  //       "divider": {}
  //     }
  //   ]
  // });

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

  childrensPage = addDataInToggleBlock('🖊️ Citas [3]', { "bold": true, "color": "green" }, datos);
  childrensPage = [...childrensPage, {
    "object": "block",
    "divider": {}
  },...(addDataInToggleBlock('✏️ Anotaciones [1]', { "bold": true, "color": "blue" }, datos))];

  page.children = childrensPage;
  const res = await notion.pages.create(page);

  console.log(res.url);
}

let numrand = Math.round(Math.random() * 1000000);
console.log(numrand);
createPage(`Libro ${numrand}`, `Autor ${numrand}`);

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





