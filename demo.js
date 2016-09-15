var http = require("http");
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
var fs = require('fs');
//引用cheerio模块,使在服务器端像在客户端上操作DOM,不用正则表达式
var cheerio = require("cheerio");

var config = fs.readFileSync('config.xml').toString();
var $ = cheerio.load(config);
var bookId = $('.book-id').html();
var startChapterName = $('.start-chapter').text();

var option = {
    base: "http://www.boquge.com",
    book: "/book/"+ bookId +"/"
};                                                                                                                                                   

var bookListUrl = option.base + option.book;
var isOk = true;
// 执行入口函数
entry(bookListUrl);

// 入口函数
// 根据小说章节目录列表 进行抓取
function entry(bookListUrl) {
    var req = http.request(bookListUrl, function(res) {
        //解决中文编码问题
        var bufferHelper = new BufferHelper();
        res.on("data", function(chunk) {
            bufferHelper.concat(chunk);
        });
        res.on("end", function() {
            //注意，此编码必须与抓取页面的编码一致，否则会出现乱码，也可以动态去识别
            var val = iconv.decode(bufferHelper.toBuffer(), 'gbk');
            var $ = cheerio.load(val);

            var $links = $('#chapters-list').find('a');

            var list = [];
            var isStart = false;
            if(!startChapterName){
                isStart = true;
            }
            $links.each(function(index, item){
            	var chapter = {};
            	chapter.name = $(item).text();
            	chapter.href = $(item).attr('href');

                if(chapter.name == startChapterName){
                    isStart = true;
                }

                if(isStart){
                    list.push(chapter);
                }
            });

            // ---- //

            var excuteSnatchTxt = function(){
            	console.log("执行-----" + list.length + '  isOk===' + isOk);
            	if(list.length <= 0){
            		console.log("执行退出指令")
            		return;
            	}
            	if(isOk){
            		isOk = false;

            		var chapter = list.shift();
            		snatchTxt(chapter.name, chapter.href);

            		if(list.length > 0){
            			excuteSnatchTxt();
            		}
            	}else{
            		// 使用setTimeout是为了让它出让cpu，不能让它一直占用着，
            		// 不然其他代码段没办法执行
            		setTimeout(function(){
            			excuteSnatchTxt();
            		}, 300);
            	}
            }
            // 调用，让它按队列顺序执行，以免章节错乱
            excuteSnatchTxt();
        });
    }).on("error", function(e) {
        console.log(e.message);
    });
    req.end();
}

// 抓取具体小说内容
function snatchTxt(chapter, bookUrl) {
	var url = option.base + bookUrl;
    var req = http.request(url, function(res) {
        //解决中文编码问题
        var bufferHelper = new BufferHelper();
        res.on("data", function(chunk) {
            bufferHelper.concat(chunk);
        });
        res.on("end", function() {
            //注意，此编码必须与抓取页面的编码一致，否则会出现乱码，也可以动态去识别
            var val = iconv.decode(bufferHelper.toBuffer(), 'gbk');
            var $ = cheerio.load(val);
            var text = $("#txtContent").text();
            // console.log(text);
            if(text.length > 200){
                text = chapter + '\r\n' + text;
                appendTxt(chapter, text);
            }else{
                text = chapter + '\r' + text;
                errorTxt(chapter, text);
            }
            // 
            isOk = true;
        });
    }).on("error", function(e) {
        console.log(e.message);
    });
    req.end();
}

// 追加到文件
function appendTxt(chapter, txt){
	fs.appendFileSync('/Users/rgy/Desktop/output.txt', txt);
	console.log(chapter + '   下载完毕……');
}

// 生成异常日志
function errorTxt(chapter, txt){
    fs.appendFileSync('/Users/rgy/Desktop/output.txt', txt);
    console.log(chapter + '   章节错误……写入日志');
}
