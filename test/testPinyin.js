const { pinyin, customPinyin } = require('pinyin-pro');


// 自定义拼音
customPinyin({
  音乐: 'yin yue', // 不自定义，音乐会翻译成'yin le'
});
var yinyueRes = pinyin('音乐');


console.log(yinyueRes);

// 获取不带音调韵母
var res = pinyin('汉语拼音音乐', { toneType: 'none' }); // 'han yu pin yin yin yue'
console.log(res);


