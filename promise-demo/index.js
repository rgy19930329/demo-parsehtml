var http = require('http'); //引入nodejs的http模块，该模块用于构建http服务和作为HttpClient使用。
var Promise = require('bluebird'); //对异步编程进行流程控制，更加符合后端程序员的编程习惯。
var cheerio = require('cheerio'); //可以理解为服务端的Jquery。使用方法和客户端一样。

var url = 'http://www.cnblogs.com/#p'; //要抓取的网址。博客园的页数是通过添加锚点的，后面有拼接


//Promise 在任何情况下都处于以下三种状态中的一种：
//未完成（unfulfilled）、已完成（resolved）和拒绝（rejected）
//事件已完成则使用成功的callback（resolve）返回自身，失败了则
//选择使用callback(reject)来返回失败的自身。

function getPageList(url) {
  //return Promise对象
  return new Promise(function(resolve, reject) {
    http.get(url, function(res) {
      var body = '';

      //当接受到数据的时候，http是执行范围请求的。所以每个范围请求就是一个chunk。
      res.on('data', function(chunk) {
        //buffer是一种node处理二进制信息的格式，不必理会。
        res.setEncoding('utf8'); //设置buffer字符集
        body += chunk; //拼接buffer
      });

      //当整个http请求结束的时候
      res.on('end', function() {
        var $ = cheerio.load(body); //将html变为jquery对象。
        var articleList = $('.post_item');
        var articleArr = [];
        articleList.each(function() {
          var curEle = $(this);
          var title = curEle.find('.post_item_body h3').text(); //获取标题
          var href = curEle.find('.post_item_body h3 a').attr('href'); //文章链接
          articleArr.push({
            title: title,
            href: href
          });
        });

        //成功的状态使用resolve回调函数。
        resolve(articleArr);
      });

      //当执行http请求失败的时候，返回错误信息
      res.on('error', function(e) {
        reject(e.message);
      });
    })
  })
}


//请求博客园前10页的数据。将所有的请求预先放置在集合内。
var list = [];
for (var i = 1; i <= 3; i++) {
  var newUrl = url + i;
  console.log(newUrl);
  list.push(getPageList(newUrl));
}


function makePromise(name, delay) {
  return new Promise((resolve) => {
    console.log(`${name} started`);
    setTimeout(() => {
      console.log(`${name} completed`);
      resolve(name);
    }, delay);
  });
}

var data = [2000, 200, 2000];

// Promise.reduce(data, (total, item, index) => {
//   return makePromise(index, item).then(res => {
//     return total + res;
//   });
// }, 0).then(res => {
// 	console.log(`计算结果 = ${res}`);
// });

// Promise.mapSeries(data, (item, index) => {
//   makePromise(index, item).then(res => {
//   	console.log(res);
//   });
// });

// Promise.all(data.map((item, index) => makePromise(index, item))).then(res => {
//     console.log(res);
// });

Promise.mapSeries(data, (item, index) => makePromise(index, item))
.then(res => {
  console.log(res);
});
