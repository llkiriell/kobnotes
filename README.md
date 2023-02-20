![Kobnotes](./public/assets/images/logo_2407x400.png)
---
Kobnotes is a **simple application for exporting Kobo e-reader notes and bookmarks**, developed in Node.js, using Express.js for back-end management and Bootstrap as the front-end framework. **Its installation is very easy**, it only requires the embedded database of e-reader and that's it.

**NOTE**: This application is still under development, however it is fully functional for viewing bookmarks and notes.

# Installation

### Prerequisites/dependencies
- Node.js^18.x
- better-sqlite3^8.x
- express^4.18.x
- express-handlebars^6.x
- md5^2.3
- multer^1.4.5

# Additional functions
When creating a highlight, in the body of the note you can write a tag that categorizes the note as a quote, definition, or example for your personal vocabulary. This feature is optional and can be disabled from the settings panel.

## Quotes
To turn your highlight into a quote you must type "^:", this way the application will format your highlight as a quote. You can write a comment from the two vertical dots.
```text
^:comment...
```
## Definitions
To turn your highlight into a quote you must type "@:", this way the application will format your highlight as a definition. You can write a comment from the two vertical dots.
```text
@:comment...
```
## Vocabulary
To turn your highlight into a quote, you need to type "#:", this way the app will format your highlight as an example for its vocabulary. After the tag you must necessarily write the word to which the selected example belongs.

```text
#:word
```

