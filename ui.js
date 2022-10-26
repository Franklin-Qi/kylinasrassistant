var h1 = document.createElement('h1');

var canvas_2d = document.createElement('canvas');
canvas_2d.setAttribute('id', 'm2d');
canvas_2d.style['backgroundColor'] = 'burlywood';
canvas_2d.style['width'] = '30%';
canvas_2d.style['height'] = '10%';
canvas_2d.style['border-radius'] = '20px';

var br1 = document.createElement("br");
var br2 = document.createElement("br");
var br3 = document.createElement("br");
var br4 = document.createElement("br");

var txt = document.createElement("label");
txt.setAttribute('id', 'view');

var recordButton = document.createElement('button');
recordButton.setAttribute('id', 'btn-recording');
recordButton.style['width'] = '100px';
recordButton.style['height'] = '100px';
recordButton.style['color'] = 'brown';
recordButton.style['borderRadius'] = '50%';
recordButton.innerHTML = '录音';

// var stopButton = document.createElement('button');
// stopButton.setAttribute('id', 'btn-stop');
// stopButton.style['width'] = '100px';
// stopButton.style['height'] = '100px';
// stopButton.style['color'] = 'brown';
// stopButton.style['borderRadius'] = '50%';
// stopButton.innerHTML = '停止录音';

var resLabel = document.createElement('label');
resLabel.setAttribute('id', 'res');
resLabel.innerHTML = '识别结果: 暂无';

var cmdResult = document.createElement('label');
cmdResult.setAttribute('id', 'cmd-result');
cmdResult.innerHTML = '指令识别结果： 暂无';

var container = document.getElementById('container');
container.style['display'] = 'table';
container.style['marginBottom'] = '300px';
container.style['verticalAlign'] = 'middle';
container.style['textAlign'] = 'center';
container.style['minHeight'] = '100vh';
container.style['minWidth'] = '100vw';
container.appendChild(h1);
container.appendChild(canvas_2d);
container.appendChild(br1);
container.appendChild(txt);
container.appendChild(br2);
container.appendChild(recordButton);
// container.appendChild(stopButton);
container.appendChild(br3);
container.appendChild(resLabel);
container.appendChild(br4);
container.appendChild(cmdResult);