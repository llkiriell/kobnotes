const fs = require('fs');
const os = require('os');

module.exports = {
  create: function () {
    let filePath = '.\\src\\config\\settings\\config-' + os.hostname() + '.json';
    try {
      //fs.writeFileSync(filePath, '', 'utf8');
      fs.copyFileSync(".\\src\\config\\settings\\default.json", filePath);
      return filePath;
    }
    catch(error) {
      return '[ERROR] => ' + error.message;
    }
  },
  read: function () {
    try {
      let configuration = JSON.parse(fs.readFileSync(".\\src\\config\\settings\\config-" + os.hostname() + '.json'));
      return configuration;
    } catch (error) {
      return '[ERROR] => ' + error.message;
    }
  },
  searchOption: function (option) {
    data = "Search =>" + option;
    return data;
  },
  updateAnyOption: function (option) {
    data = "Option is edited by => " + option;
    return data;
  },
  updateManyOptions: function (options) {
    data = options;
    return data;
  },
  deleteConfiguration: function (deleteFileConfig) {
    data = "File was deleted => " + deleteFileConfig;
    return data;
  }
}