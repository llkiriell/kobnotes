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
      return {"status":"ok","message":"ok","data":configuration};
    } catch (error) {
      return {"status":"error","message":error.message,"data":""};
    }
  },
  searchOption: function (option) {
    data = "Search =>" + option;
    return data;
  },
  update: function (config) {
    try {
      fs.writeFileSync(".\\src\\config\\settings\\config-" + os.hostname() + '.json',JSON.stringify(config),'utf8');
      return config;
    } catch (error) {
      return '[ERROR] => ' + error.message;
    }
  },
  deleteConfiguration: function (deleteFileConfig) {
    data = "File was deleted => " + deleteFileConfig;
    return data;
  }
}