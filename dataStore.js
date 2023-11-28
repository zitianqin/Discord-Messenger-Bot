const fs = require('node:fs');

let data = {
  reminders: []
};

function getData() {
  if (fs.existsSync('dataStore.json')) {
    data = JSON.parse(String(fs.readFileSync('dataStore.json')));
  } else {
    console.log(`[WARNING] The dataStore.json file called by dataStore.js is missing.`);
  }
  return data;
}

function setData(data) {
  fs.writeFileSync('dataStore.json', JSON.stringify(data, null, 2));
}

module.exports = {
  getData: getData,
  setData: setData
};
