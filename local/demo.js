var request = require('request');
var iconv = require('iconv-lite');
var os = require('os');
var path = require('path');
var homedir = os.homedir();

console.log("homedir", homedir);
console.log("desktop", path.join(homedir, "Desktop"));

// // 这是书包网的一个搜索 书包网返回的网页编码是gbk格式的 如果不转码就是乱码
// var url = 'https://www.boquge.com/book/4585/';
// // var url = "http://www.baidu.com/";
// // var url = "http://www.xbiquge.la/";

// var options = {
//     url,
//     headers: {
//         'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
//     }
// };

// request(options).on('response', function (res) {
//     var chunks = [];
//     res.on('data', function (chunk) {
//         chunks = chunks.concat(chunk);
//     });

//     res.on('end', function () {
//         var buf = Buffer.concat(chunks);
//         // 转码
//         var text = iconv.decode(buf, 'gbk');
//         // console.log("text", text);
//     });
// });