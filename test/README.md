# CommonJS 实例运行

## testJson 运行
```shell
node testJson
```

## testPinyin
```shell
node testPinyin.js
```

## testCommand
```shell
$ vim ../command.js

# 1. 将以下注释打开

///////////////////////////////////////////////////////// js module test
//var chinesetonumber = require('./chineseToNumber');
//const configJson = require('./config/config.json');
//
//urlJson = configJson["URL"];
//commandObjectJson = configJson["CommandObject"];
//highlowCommandObjectJson = configJson["HighLowCommandObject"];
//operationJson = configJson["Operation"];
///////////////////////////////////////////////////////

// module.exports =  matchCommand ;

# 2. 屏蔽以下fetch 方式

///////////////////////////////////////////////////////// 浏览器fetch 方式
(async() => {
    const configRequest = await fetch('./config/config.json');
    const configJson = await configRequest.json();
    urlJson = configJson["URL"];
    commandObjectJson = configJson["CommandObject"];
    highlowCommandObjectJson = configJson["HighLowCommandObject"];
    operationJson = configJson["Operation"];
})()
/////////////////////////////////////////////////////////

$ node testCommand.js
```
