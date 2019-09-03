var os = require('os');
var path = require('path');
var iconv = require('iconv-lite');
var fs = require('fs');
//引用cheerio模块,使在服务器端像在客户端上操作DOM,不用正则表达式
var cheerio = require('cheerio');
var request = require('request');

var homedir = os.homedir();

var Program = {
    run: function() {
        this._init();
        this._dateFormat();
    },
    // 小说下载完毕后执行
    callback: function() {
        console.log('--------下载完成后执行的回调方法--------');
    },
    // 下载配置项
    _option: {
        base: 'https://www.boquge.com',
        book: ''
    },
    _isOk: true, // 标志当前章节是否已下载成功
    _list: [], // 小说列表
    _book: '', // 保存书籍名
    _errorLog: '\r\n------------------------------------------\r\n', // 保存错误章节日志
    _outputDir: path.join(homedir, "Desktop"), // 小说导出路径
    _init: function() {
        var config = fs.readFileSync('config.xml').toString();
        var $ = cheerio.load(config);
        var bookId = $('.book-id').html();
        var startChapterName = $('.start-chapter').text();
        // this._outputDir = $('.output-dir').text();

        var option = this._option;
        option.book = '/book/'+ bookId + '/';
        var bookListUrl = option.base + option.book;
        this._entry(bookListUrl, startChapterName);
    },
    // 章节抓取入口
    _entry: function(bookListUrl, startChapterName) {
        var _this = this;

        var options = {
            url: bookListUrl,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
            }
        };

        request(options).on('response', function (res) {
            var chunks = [];
            res.on('data', function (chunk) {
                chunks = chunks.concat(chunk);
            });
        
            res.on('end', function () {
                var buf = Buffer.concat(chunks);
                // 转码
                var val = iconv.decode(buf, 'gbk');
                // console.log("val", val);
                var $ = cheerio.load(val);
                var bookName = _this._bookId;
                console.log($('h1').text())
                if (!$('h1').text().match(/^[\u4e00-\u9fa5]+/)) {
                    console.log("抓取书名出错");
                } else {
                    bookName = $('h1').text().match(/^[\u4e00-\u9fa5]+/)[0];
                }
                var book = bookName + ' ' + new Date().Format("yyyy-MM-dd") + '-' + Date.now();
                _this._book = book;
                var $links = $('#chapters-list').find('a');
                console.log($links.length);
                // return;
                var list = _this._list;
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
                console.log(list);
                // 调用，让它按队列顺序执行，以免章节错乱
                _this._excuteSnatchTxt();
            });
        });
    },
    // 根据列表进行章节的顺序抓取
    _excuteSnatchTxt() {
        var _this = this;
        var list = _this._list;
        console.log('执行-----' + list.length + '  isOk===' + _this._isOk);

        if(_this._isOk == true){
            _this._isOk = false;
            var chapter = list.shift();
            _this._snatchTxt(chapter.name, chapter.href);
            if(list.length > 0){
                _this._excuteSnatchTxt();
            }else{
                setTimeout(function() {
                    console.log(_this._book + ' 下载完毕！');
                    _this._appendTxt(_this._errorLog);
                    _this.callback && _this.callback();
                }, 2000);
            }
        }else{
            // 使用setTimeout是为了让它出让cpu，不能让它一直占用着，
            // 不然其他代码段没办法执行
            setTimeout(function(){
                _this._excuteSnatchTxt();
            }, 300);
        }
    },
    // 抓取具体小说内容
    _snatchTxt: function(chapterName, bookUrl) {
        var _this = this;
        var url = _this._option.base + bookUrl;

        var options = {
            url,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
            }
        };

        request(options).on('response', function (res) {
            var chunks = [];
            res.on('data', function (chunk) {
                chunks = chunks.concat(chunk);
            });
        
            res.on('end', function () {
                var buf = Buffer.concat(chunks);
                // 转码
                var val = iconv.decode(buf, 'gbk');
                // console.log("val", val);
                var $ = cheerio.load(val);
                var text = $('#txtContent').text();
                if(text.length > 200){
                    text = chapterName + '\r\n' + text;
                    _this._appendTxt(text);
                    console.log(chapterName + '   下载完毕……');
                    // 重置标志
                    _this._isOk = true;
                }else if(text.length > 0){
                    console.log('----------废话章节---------');
                    text = chapterName + '\r\n' + text;
                    _this._errorLog += text;
                    // 重置标志
                    _this._isOk = true;
                }else{
                    console.log(chapterName + '----------text为空，重新下载----------');
                    _this._snatchTxt(chapterName, bookUrl);
                }
            });
        });
    },
    // 将章节写入文件
    _appendTxt: function(txt) {
        let outputDir = path.resolve(this._outputDir, `${this._book}.txt`);
        fs.appendFileSync(outputDir, txt);
    },
    // 格式化时间
    _dateFormat: function() {
        Date.prototype.Format = function (fmt) { //author: meizz
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }
    }
};

Program.run();
