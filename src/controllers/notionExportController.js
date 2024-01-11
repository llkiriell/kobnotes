const NotionExport = require('../models/notionExport');
const bookmark = require('../models/bookmark');

let togglesBlock =
{
  quote: {
    title: '🖋️ Citas',
    link: null,
    annotations: { "bold": true },
    paragraphAnnotations: { "italic": true }
  },
  highlight: {
    title: '🖊️ Subrayados',
    link: null,
    annotations: { "bold": true, "color": "green" },
    paragraphAnnotations: { "bold": true, "color": "green_background" }
  },
  note: {
    title: '✏️ Anotaciones',
    link: null,
    annotations: { "bold": true, "color": "blue" },
    paragraphAnnotations: { "bold": true, "color": "blue_background" }
  },
  definition: {
    title: '🎓 Definiciones',
    link: null,
    annotations: { "bold": true, "color": "purple" },
    paragraphAnnotations: { "bold": true, "italic": true }
  },
  vocabulary: {
    title: '📔 Vocabulario',
    link: null,
    annotations: { "bold": true, "color": "yellow" },
    paragraphAnnotations: { "italic": true }
  }
};

exports.createPage = async (req, res) => {
  let autor = req.query.Autor;
  let title = req.query.Title;
  let volumeID = req.query.VolumeID;

  let togglesList = [];
  let childrenList = {};
  let dividerBlock = NotionExport.buildBlock('divider');

  let bookmarks = bookmark.getBookmarksGroupedById(volumeID);
  bookmarks.groups.forEach(group => {
    let temp = [];
    switch (group.type) {
      case 'quotes':
        togglesList.push(NotionExport.buildBlock('toggle', { content: togglesBlock.quote.title + ` [${group.qty}]`, children: [] }, togglesBlock.quote.annotations));
        group.data.forEach(bkmrk => {
          temp.push(NotionExport.buildBlock('paragraph', { content: '»'+ bkmrk.Text.trim() }, togglesBlock.quote.paragraphAnnotations), NotionExport.buildBlock('paragraph', { content: `— ${bkmrk.TitleChapter}` }, {}),dividerBlock);
        });
        childrenList.quotes = temp;
        break;
      case 'highlights':
        togglesList.push(NotionExport.buildBlock('toggle', { content: togglesBlock.highlight.title + ` [${group.qty}]`, children: [] }, togglesBlock.highlight.annotations));
        group.data.forEach(bkmrk => {
          temp.push(NotionExport.buildBlock('paragraph', { content: '»'+ bkmrk.Text.trim() }, togglesBlock.highlight.paragraphAnnotations), NotionExport.buildBlock('paragraph', { content: `— ${bkmrk.TitleChapter}` }, {}),dividerBlock);
        });
        childrenList.highlights = temp;
        break;
      case 'notes':
        togglesList.push(NotionExport.buildBlock('toggle', { content: togglesBlock.note.title + ` [${group.qty}]`, children: [] }, togglesBlock.note.annotations));
        group.data.forEach(bkmrk => {
          temp.push(NotionExport.buildBlock('paragraph', { content: '»'+ bkmrk.Text.trim() }, togglesBlock.note.paragraphAnnotations), NotionExport.buildBlock('paragraph', { content: bkmrk.Annotation }, {}),NotionExport.buildBlock('paragraph', { content: `— ${bkmrk.TitleChapter}` }, {}),dividerBlock);
        });
        childrenList.notes = temp;
        break;
      case 'definitions':
        togglesList.push(NotionExport.buildBlock('toggle', { content: togglesBlock.definition.title + ` [${group.qty}]`, children: [] }, togglesBlock.definition.annotations));
        group.data.forEach(bkmrk => {
          temp.push(NotionExport.buildBlock('paragraph', { content: bkmrk.Text.trim() }, togglesBlock.definition.paragraphAnnotations), NotionExport.buildBlock('paragraph', { content: `— ${bkmrk.TitleChapter}` }, {}),dividerBlock);
        });
        childrenList.definitions = temp;
        break;
      case 'vocabularies':
        togglesList.push(NotionExport.buildBlock('toggle', { content: togglesBlock.vocabulary.title + ` [${group.qty}]`, children: [] }, togglesBlock.vocabulary.annotations));
        group.data.forEach(bkmrk => {
          temp.push(NotionExport.buildBlock('paragraph', { content: bkmrk.Text.trim() }, togglesBlock.vocabulary.paragraphAnnotations), NotionExport.buildBlock('paragraph', { content: `— ${bkmrk.TitleChapter}` }, {}),dividerBlock);
        });
        childrenList.vocabularies = temp;
        break;
    }
    temp = [];
  });

  let res_notion = await NotionExport.createPage(autor, title, bookmarks.qty, togglesList);

  let rpta = {"data":res_notion, "status":"ok","message":"Configuración local"};
  // let rpta = {"togglesList": togglesList, "childrenList": childrenList};
  res.json(rpta);
};
