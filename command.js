// const configRequest = fetch('./config/config.json');

// const configJson = configRequest.json();
// const objectJson = configJson["CommandObject"];
// const operationJson = configJson["Operation"];
var objectJson;
var Operation;

(async() => {
    const configRequest = await fetch('./config/config.json');
    const configJson = await configRequest.json();
    objectJson = configJson["CommandObject"];
    operationJson = configJson["Operation"];
    console.log(objectJson);
})()

function matchCommand(resResult) {
    // 从头开始匹配操作对象或者操作类型
    console.log('开始处理语音识别的文本： ' + resResult);
    console.log(objectJson);
    console.log(operationJson);
}