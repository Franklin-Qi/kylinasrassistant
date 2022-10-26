/*
    指令回调参数格式： cmdCallBack(argNumber, desc, operateCode, objectCode, <arg1>, <arg2>, ... )

    指令回调参数解析: 包含四个必须参数和多个可选参数。

    argNumber: 表示可选参数个数。可用于标识当前语音识别是否匹配到指令。
        -1： 未匹配到指令，不用执行相关操作
        0: 该指令不需要参数
        1: 该指令需要1个参数
        2: 该指令需要2个参数
        ...

    desc:  指令文字描述。如“打开音乐”。

    operateCode: 表示指令操作类型编号。如“打开”、“关闭”、“设置”、“调高”、“调低”、“搜索”等。可在config.json查看。

    objectCode：表示指令对象编号。如具体应用或者具体系统设置：音乐、视频、蓝牙、亮度、音量等。可在config.json查看。

    <arg1>: 第一个可选参数。如“设置音量到80”这条指令，operateCode: 设置； objectCode: 音量; <arg1>: 80

    <arg2>: 第二个可选参数。暂无示例，后期可扩展。

    >>>>>> 具体指令示例
        // 无参数指令情况： H5 可根据argNumber 来判断，或者这边直接不发该条指令给H5
        cmdCallBack(-1, "无操作指令", -1, -1) => 指令： 当前指令不存在，不需要执行相关操作

        // 无参数指令情况： H5方面需要根据operateCode 和 objectCode 参数来判断
        cmdCallBack(0, "打开音乐", 1（操作类型编号：打开），1（指令对象编号：音乐）) => 无参数指令： 打开音乐
        cmdCallBack(0, "关闭音乐", 2（操作类型编号：关闭），1（指令对象编号：音乐）) => 无参数指令： 关闭音乐
        cmdCallBack(0, "打开蓝牙", 1（操作类型编号：打开），16（指令对象编号：蓝牙）) => 无参数指令： 打开蓝牙
        cmdCallBack(0, "关闭蓝牙", 2（操作类型编号：打开），16（指令对象编号：蓝牙）) => 无参数指令： 关闭蓝牙

        // 一个参数指令情况： H5方面需要根据operateCode 、 objectCode 和 <arg1> 参数来判断
        cmdCallBack(1, "搜索今天天气怎么样", 7(操作类型编号：搜索），20（指令对象编号：搜索）, “今天天气怎么样”(指令参数)) => 1个参数指令：搜索今天天气怎么样 
        cmdCallBack(1, "设置音量到80", 3（操作类型编号：设置），18（指令对象编号：音量）, 80(指令参数1)) => 一个参数指令： 设置音量到80
        cmdCallBack(1, "调高音量(每次默认10)", 4(操作类型编号：调高），18（指令对象编号：音量）, 10(指令参数1)) => 一个参数指令： 调高音量，每次默认10
        cmdCallBack(1, "调低音量(每次默认10)", 5(操作类型编号：调低），18（指令对象编号：音量）, 10(指令参数1)) => 一个参数指令： 调低音量，每次默认10

    <<<<<<<<<<<<<<<<<<

    错误回调参数:
    错误码: 
    */

// 加载中文转拼音js
var { pinyin, customPinyin } = pinyinPro;
// 自定义拼音
customPinyin({
    音乐: 'yin yue', // 不自定义，音乐会翻译成'yin le'
});

var urlJson;
var commandObjectJson;
var highlowCommandObjectJson;
var operationJson;

///////////////////////////////////////////////////////// js module test
//var chinesetonumber = require('./chineseToNumber');
//const configJson = require('./config/config.json');
//
//urlJson = configJson["URL"];
//commandObjectJson = configJson["CommandObject"];
//highlowCommandObjectJson = configJson["HighLowCommandObject"];
//operationJson = configJson["Operation"];
///////////////////////////////////////////////////////


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

function matchCommand(resResult) {
    // 从头开始匹配操作对象或者操作类型
    console.log('开始处理语音识别的文本： ' + resResult);
    console.log(urlJson);
    console.log(operationJson);
    console.log(highlowCommandObjectJson);
    console.log(commandObjectJson);

    var valueOperation; // 操作的代号

    // 遍历操作JSON
    var resString = new String(resResult);

    console.log('\n开始遍历操作指令，如打开、关闭、调高、调低 ：\n')
    for (keyOperation in operationJson) {
        console.log('开始遍历具体操作: ' + keyOperation);

        if (resString.includes(keyOperation)) { // 判断是否存在指定json字段，减少匹配操作
            valueOperation = operationJson[keyOperation];
            console.log('文本中包含： ' + keyOperation + ': ' + valueOperation);

            var index = resString.indexOf(keyOperation);
            console.log('index: ' + index);

            // 操作匹配
            switch (valueOperation) {
                case 1:
                    console.log('执行打开操作!');
                    var openIndex = index + 2; // 定位到“打开”之后字符

                    var valueCommand = getCommandObjectValue(keyOperation, valueOperation, openIndex, resString);
                    if (valueCommand[1] != -1) {
                        return [valueCommand[0], valueOperation, valueCommand[1]];
                    } else {
                        return [valueCommand[0], -1, -1];
                    }

                    break;
                case 2:
                    console.log('执行关闭操作!');
                    var closeIndex = index + 2; // 定位到“关闭”之后字符

                    var valueCommand = getCommandObjectValue(keyOperation, valueOperation, closeIndex, resString);
                    if (valueCommand[1] != -1) {
                        return [valueCommand[0], valueOperation, valueCommand[1]];
                    } else {
                        return [valueCommand[0], -1, -1];
                    }

                    break;
                case 3:
                    console.log('执行设置操作!');

                    // 实例： 设置音量到八十 =》 设置音量到80
                    var setIndex = index + 2; // 定位到“设置”之后字符

                    var valueCommand = getHighLowCommandObjectValue(keyOperation, valueOperation, setIndex, resString);
                    if (valueCommand[1] != -1) {
                        return [valueCommand[0], valueOperation, valueCommand[1], valueCommand[2]];
                    } else {
                        return [valueCommand[0], -1, -1, -1];
                    }

                    break;
                case 4:
                    console.log('执行调高操作!');

                    var highIndex = index + 2; // 定位到“调高”之后字符

                    var valueCommand = getHighLowCommandObjectValue(keyOperation, valueOperation, highIndex, resString);
                    if (valueCommand[1] != -1) {
                        if (valueCommand.length == 3 && valueCommand[2] != -1) {
                            return [valueCommand[0], valueOperation, valueCommand[1], valueCommand[2]]; // 设置调高值
                        } else {
                            return [valueCommand[0], valueOperation, valueCommand[1], 10]; // 默认调高10
                        }
                    } else {
                        return [valueCommand[0], -1, -1, 10];
                    }

                    break;
                case 5:
                    console.log('执行调低操作!');

                    var lowIndex = index + 2; // 定位到“调低”之后字符

                    var valueCommand = getHighLowCommandObjectValue(keyOperation, valueOperation, lowIndex, resString);
                    if (valueCommand[1] != -1) {
                        if (valueCommand.length == 3 && valueCommand[2] != -1) {
                            return [valueCommand[0], valueOperation, valueCommand[1], valueCommand[2]]; // 设置调高值
                        } else {
                            return [valueCommand[0], valueOperation, valueCommand[1], 10]; // 默认调高10
                        }
                    } else {
                        return [valueCommand[0], -1, -1, 10];
                    }

                    break;
                case 6:
                    console.log('执行搜索操作!');

                    var setIndex = index + 2; // 定位到"搜索"之后字符

                    var valueCommand = getSearchCommandObjectValue(setIndex, resString);
                    if (valueCommand[1] != -1) {
                        // 实例： ["搜索今天天气怎么样", 6 "今天天气怎么样?"]
                        return [valueCommand[0], valueOperation, valueCommand[1]];
                    } else {
                        return [valueCommand[0], -1, -1];
                    }

                    break;
                default:
                    console.log('不支持该操作: ' + keyOperation + operationJson)
                    return ['无操作指令', -1, -1];
            }
        }
    }
    // 没有匹配到相关操作关键字，因此直接返回[-1, -1]
    return ['无操作指令', -1, -1];
}

/**
 * 
 * @param {需要执行的操作} keyOperation 
 * @param {需要执行的操作编号} valueOperation 
 * @param {需要截断文本的开始索引} index 
 * @param {需要截断文本} strResult 
 * @returns CommandObject应用JSON对应的代号值
 */
function getCommandObjectValue(keyOperation, valueOperation, index, strResult) {
    var subStrResult = strResult.substring(index);
    console.log("子串： " + subStrResult);
    var desc;


    for (keyCommandObject in commandObjectJson) {
        var valueCommandObject = commandObjectJson[keyCommandObject];
        console.log('遍历命令： ' + keyCommandObject + valueCommandObject);
        desc = keyOperation + keyCommandObject;
        console.log('指令描述desc: ' + desc);

        if (subStrResult.startsWith(keyCommandObject)) {
            console.log('成功匹配到指令: ' + keyCommandObject + valueCommandObject);
            console.log('*****************\n\n');
            return [desc, valueCommandObject];
        }
    }
    desc = '无操作指令';
    return [desc, -1];
}

function getHighLowCommandObjectValue(keyOperation, valueOperation, index, strResult) {
    var subStrResult = strResult.substring(index);
    console.log("子串： " + subStrResult);
    var desc;

    var arg1Number; // 第一个数字参数

    arg1Number = getChineseNumber(subStrResult);
    if (arg1Number != -1) {
        console.log("数字汉字转阿拉伯数字成功： " + subStrResult + " => " + arg1Number);
    } else {
        console.log("数字汉字转阿拉伯数字失败： " + subStrResult + " => " + arg1Number);
    }

    for (keyCommandObject in highlowCommandObjectJson) {
        var valueCommandObject = highlowCommandObjectJson[keyCommandObject];
        console.log('遍历命令： ' + keyCommandObject + valueCommandObject);
        desc = keyOperation + keyCommandObject + arg1Number;
        console.log('指令描述desc: ' + desc);

        if (subStrResult.startsWith(keyCommandObject)) {
            console.log('成功匹配到指令: ' + keyCommandObject + valueCommandObject);
            console.log('*****************\n\n');
            return [desc, valueCommandObject, arg1Number];
        }
    }
    desc = '无操作指令';
    return [desc, -1, -1];
}


/**
 * 
 * @param {需要截断搜索文本的开始索引} index 
 * @param {需要截断搜索文本} strResult 
 * @returns 需要搜索的文本
 */
function getSearchCommandObjectValue(index, strResult) {
    var subStrResult = strResult.substring(index);
    console.log("子串： " + subStrResult);

    var desc = strResult.substring(index - 2);

    if (subStrResult == "") {
        console.log('没有搜索内容\n\n');
        return [desc, -1];

    } else {
        console.log('*****************\n\n');
        return [desc, subStrResult];
    }

}

var yinyueRes = pinyin('音乐');
console.log(yinyueRes);
console.log(pinyin('汉语拼音', { toneType: 'none' })); // 'hàn yǔ pīn yīn'

//module.exports =  matchCommand ;