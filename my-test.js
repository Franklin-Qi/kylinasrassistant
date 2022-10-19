
var onReco = false;

var canvas_2d = document.getElementById("m2d");

var ctx_2d = canvas_2d.getContext("2d");

var recordButton = document.getElementById('btn-recording')

// var startButton = document.getElementById('btn-start-recording');
// var stopButton = document.getElementById('btn-stop');

var resLabel = document.getElementById('res');

var record_duration = 0;
var lockReconnect = false;

var server = "ws://172.30.40.147:8090/paddlespeech/asr/streaming";
var ws = new WebSocket(server);

(async() => {
    const fetchRequest = await fetch('./config/config.json');
    const json = await fetchRequest.json();
    for (var key in json) {
        console.log(key, ":");
        for (var key2 in json[key]) {
            console.log(key2, ":", json[key][key2])
        }
    }
})()


function createWebSocket() {
    try {
        ws = new WebSocket(server);
    } catch (e) {
        reconnect();
    }
}

function reconnect() {
    if (lockReconnect) return;
    lockReconnect = true;
    //没连接上会一直重连，设置延迟避免请求过多
    setTimeout(function() {
        createWebSocket();
        console.log("正在重连，当前时间" + new Date())
        lockReconnect = false;
    }, 5000); //这里设置重连间隔(ms)
}

ws.addEventListener('message', function(event) {
    var temp = JSON.parse(event.data);
    if (temp.result) {
        resLabel.innerText = temp.result;
        console.log('实时语音识别结果：', resLabel.innerText);
    }
})

const recorder = new Recorder({
    sampleBits: 16, // 采样位数，支持 8 或 16，默认是16
    sampleRate: 16000, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
    numChannels: 1, // 声道，支持 1 或 2， 默认是1
    compiling: true, // (0.x版本中生效,1.x增加中)  // 是否边录边转换，默认是false
})

function drawPlay() {
    // 用requestAnimationFrame稳定60fps绘制
    // this.drawPlayId = requestAnimationFrame(this.drawPlay);
    // 实时获取音频大小数据
    let dataArray = recorder.getRecordAnalyseData();
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

recorder.onprogress = function(params) {
    drawPlay();
}

// 绑定事件-打印的是当前录音数据
function uploadChunk(chunkDatas) {
    chunkDatas.forEach((chunkData) => {
        ws.send(chunkData)
    })
}

recordButton.onmousedown = function() {
    if (onReco == true) {
        recorder.stop();
        onReco = false;
        recorder.clear();
    }

    var txt = document.getElementById("view");

    txt.innerHTML = "正在录音.............";
    onReco = true;

    var start = JSON.stringify({ "name": "test.wav", "nbest": 5, "signal": "start" });
    if (ws.readyState != 1) {
        try {
            ws = new WebSocket(server);
        } catch (e) {
            alert("重连失败")
        }
    }
    if (ws.readyState != 1) {
        alert("无法连接服务器");
    }
    ws.send(start);
    record_duration = 0;
    recorder.start().then(() => {
        setInterval(() => {
            // 持续录音
            let newData = recorder.getNextData();
            if (!newData.length) {
                return;
            }
            // 上传到流式测试1
            uploadChunk(newData)
        }, 500)
    }, (error) => {
        console.log("录音出错");
    });
};

function stopRecorder() {
    var txt = document.getElementById("view");
    txt.innerHTML = "停止录音";
    onReco = true;
    recorder.stop();
    onReco = false;
    recorder.clear();

    console.log('待处理文本： ', resLabel.innerText);
    var resText = resLabel.innerText; // 需要一个中间变量来存储值，否则函数参数会报未定义错误
    matchCommand(resText); // 开始根据识别结果文本解析操作指令
};

// stopButton.onmousedown = stopRecorder;
recordButton.onmouseup = stopRecorder;
// recordButton.onmouseout = stopRecorder;

window.onbeforeunload = function() {
    var end = JSON.stringify({ "name": "test.wav", "nbest": 5, "signal": "end" });
    ws.send(end);
};

