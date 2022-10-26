var canvas_2d = document.getElementById("m2d");
var ctx_2d = canvas_2d.getContext("2d");

var recordButton = document.getElementById('btn-recording');
var resLabel = document.getElementById('res');
var cmdLabel = document.getElementById('cmd-result');

function drawPlay(dataArray) {
    var bufferLength = dataArray.length;
    // 填充背景色
    ctx_2d.fillStyle = 'rgb(200, 200, 200)';
    ctx_2d.fillRect(0, 0, canvas_2d.width, canvas_2d.height);

    var count = canvas_2d.width / 5;
    var margin = canvas_2d.width % 5 / 2;
    var group_count = Math.trunc(bufferLength / count);

    // 柱状图测试
    for (let i = 0; i < count; i++) {
        let xStart = margin + 1 + i * 5;
        ctx_2d.fillStyle = 'green';

        var tmp_val = 0;
        for (let j = 0; j < group_count; j++) {
            tmp_val += dataArray[i * group_count + j];
        }
        tmp_val /= group_count;
        let height = Math.abs((tmp_val - 128) * 2);

        ctx_2d.fillRect(xStart, (canvas_2d.height - height) / 2, 3, height);
        ctx_2d.closePath();
    }
}

function showRecognitionResult(text) {
    resLabel.innerText = "识别到的内容，可以不打印，因为不太准确：" + text;
}

function showCommandResult(text) {
    cmdLabel.innerText = "匹配到指令：" + text;
}

/**
 * 
 * @param {*} cmdCallBack 
 * 指令回调
 * 回调函数参数：
 * 参数为一个 var 数组
 * args[0]. 指令描述 {打开播放器，亮度调节}
 *  -- 指令文字描述。如“打开音乐”。
 * 
 * args[1]. 指令操作类型 {打开，关闭，数值调整}
 *  -- 表示指令操作类型编号。如“打开”、“关闭”、“设置”、“调高”、“调低”、“搜索”等。可在config.json查看。
 * 
 * args[2]. 指令操作对象 {播放器，亮度，音量}
 *  -- 表示指令对象编号。如具体应用或者具体系统设置：音乐、视频、蓝牙、亮度、音量等。可在config.json查看。
 * 
 * args[...]扩展参数
 *  -- <arg1>: 第一个可选参数。如“设置音量到80”这条指令，operateCode: 设置； objectCode: 音量; <arg1>: 80
 *  -- <arg2>: 第二个可选参数。暂无示例，后期可扩展。
 * 
 *     >>>>>> 具体指令示例
 *      // 无参数指令情况： H5 可根据argNumber 来判断，或者这边直接不发该条指令给H5
 *      cmdCallBack(["无操作指令", -1, -1]) => 指令： 当前指令不存在，不需要执行相关操作
 *
 *      // 无参数指令情况： H5方面需要根据operateCode 和 objectCode 参数来判断
 *      cmdCallBack(["打开音乐", 1（操作类型编号：打开），1（指令对象编号：音乐）]) => 无参数指令： 打开音乐
 *      cmdCallBack(["关闭音乐", 2（操作类型编号：关闭），1（指令对象编号：音乐）]) => 无参数指令： 关闭音乐
 *      cmdCallBack(["打开蓝牙", 1（操作类型编号：打开），16（指令对象编号：蓝牙）]) => 无参数指令： 打开蓝牙
 *      cmdCallBack(["关闭蓝牙", 2（操作类型编号：打开），16（指令对象编号：蓝牙）]) => 无参数指令： 关闭蓝牙
 *
 *      // 一个参数指令情况： H5方面需要根据operateCode 、 objectCode 和 <arg1> 参数来判断
 *      cmdCallBack(["搜索今天天气怎么样", 7(操作类型编号：搜索），20（指令对象编号：搜索）, “今天天气怎么样”(指令参数)]) => 1个参数指令：搜索今天天气怎么样 
 *      cmdCallBack(["设置音量到80", 3（操作类型编号：设置），18（指令对象编号：音量）, 80(指令参数1)]) => 一个参数指令： 设置音量到80
 *      cmdCallBack(["调高音量(每次默认10)", 4(操作类型编号：调高），18（指令对象编号：音量）, 10(指令参数1)]) => 一个参数指令： 调高音量，每次默认10
 *      cmdCallBack(["调低音量(每次默认10)", 5(操作类型编号：调低），18（指令对象编号：音量）, 10(指令参数1)]) => 一个参数指令： 调低音量，每次默认10
 *  <<<<<<<<<<<<<<<<<<
 * @param {*} errCallBack 
 * 失败回调
 * 回调函数参数：
 * 1. 失败错误码
 * 2. 错误描述
 */
function SpeechAIEngine(cmdCallBack, errCallBack) {
    var self = this;
    this.server = "ws://172.30.40.147:8090/paddlespeech/asr/streaming";
    this.onReco = false;
    this.serverReady = false;

    // 指令匹配，每 500ms 匹配一次指令，后面可以等说完再匹配，通过断句，目前未开通标点服务
    this.matchingDurationStep = 0;
    // 识别时长，如果长时间没识别出来，就停止识别
    this.speechDuration = 0;
    // 匹配失败时索引，继续匹配时去掉索引之前的识别内容
    this.matchErrorIndex = 0;
    this.commandCallBack = cmdCallBack;
    this.errorCallBack = errCallBack;

    this.recorder = new Recorder({
        sampleBits: 16, // 采样位数，支持 8 或 16，默认是16
        sampleRate: 16000, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
        numChannels: 1, // 声道，支持 1 或 2， 默认是1
        compiling: true, // (0.x版本中生效,1.x增加中)  // 是否边录边转换，默认是false
    });
    this.recorder.onprogress = function() {
        var syncDataArray = self.recorder.getRecordAnalyseData();
        drawPlay(syncDataArray);
    };

    this.ws = new WebSocket(this.server);
    this.ws.addEventListener('message', function(event) {
        var temp = JSON.parse(event.data);
        if (!self.serverReady) {
            console.log(temp.status, temp.signal)
            if (temp.status == "ok" && temp.signal == "server_ready") {
                self.serverReady = true;
            }
        }
        if (temp.result) {
            // 指令匹配需要时间间隔 500ms
            var timeNow = Date.now();
            if (timeNow - self.matchingDurationStep < 500)
                return;
            self.matchingDurationStep = timeNow;

            var matchStr = temp.result.slice(self.matchErrorIndex);
            showRecognitionResult(matchStr);
            var matchCommandResult = matchCommand(matchStr); // 开始根据识别结果文本解析操作指令
            if (matchCommandResult[1] != -1) {
                self.matchErrorIndex = temp.result.length;
                showCommandResult(matchCommandResult[0]);
                for (var i = 0; i < matchCommandResult.length; i++) {
                    console.log(matchCommandResult.length + ' 指令匹配结果： ' + matchCommandResult[i]);
                }
                self.stopRecognition();
                self.commandCallBack(matchCommandResult);
            } else {
                if (timeNow - self.speechDuration > 5000) {
                    self.matchErrorIndex = temp.result.length;
                    self.stopRecognition();
                    self.errorCallBack(-1, "自己定义");
                    console.log("指令匹配结果： 未匹配到相关指令，请继续尝试指令！如'打开音乐'、'设置音量到八十'、'搜索今天天气'");
                }
            }
        }
    });

    this.uploadChunk = function(chunkDatas) {
        console.log("upload chunk ", chunkDatas.length);

        for (var i = 0; i < chunkDatas.length; i++) {
            this.ws.send(chunkDatas[i]);
        }
    }

    this.initStart = function() {
        if (this.ws.readyState != 1) {
            console.log("服务未连接");
            return;
        }
        var start = JSON.stringify({ "name": "test.wav", "nbest": 5, "signal": "start" });
        this.ws.send(start);
    }

    this.wakeup = function() {
        if (!this.serverReady) {
            this.initStart();
        }

        // 读取 mic 音频
        if (this.onReco) {
            this.recorder.stop();
            this.onReco = false;
        }

        this.recorder.start().then(() => {
            console.log("start recorde.");
            this.onReco = true;
            setInterval(() => {
                // 持续录音
                let newData = this.recorder.getNextData();
                if (!newData.length) {
                    return;
                }
                // 上传到流式识别服务器
                if (this.ws.readyState != 1) {
                    this.stopRecognition();
                    return;
                }
                this.uploadChunk(newData)
            }, 500);
            this.speechDuration = Date.now();
        }, (error) => {
            this.onReco = false;
            console.log("录音开始失败");
        });
    }

    this.stopRecognition = function() {
        // 停止录音
        this.recorder.stop();
        onReco = false;
        this.recorder.getWholeData();
    }

    this.shutdown = function() {
        // 停止录音
        this.recorder.stop();
        this.recorder.getWholeData();

        // 断开连接
        var end = JSON.stringify({ "name": "test.wav", "nbest": 5, "signal": "end" });
        this.ws.send(end);
    }
}