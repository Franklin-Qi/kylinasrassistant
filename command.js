// const configRequest = fetch('./config/config.json');

// const configJson = configRequest.json();
// const objectJson = configJson["CommandObject"];
// const operationJson = configJson["Operation"];

(async() => {
    const configRequest = await fetch('./config/config.json');
    const configJson = await configRequest.json();
    const objectJson = configJson["CommandObject"];
    const operationJson = configJson["Operation"];
    console.log(objectJson);
})()

function matchCommand(str) {
    // 从头开始匹配操作对象或者操作类型

}