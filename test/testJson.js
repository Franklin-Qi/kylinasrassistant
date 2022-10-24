const json = require('../config/config.json');

console.log(json["CommandObject"]);
var commandObjectJson = json["CommandObject"];
for (key in commandObjectJson) {
    var value = commandObjectJson[key];
    console.log(key + value);
}
