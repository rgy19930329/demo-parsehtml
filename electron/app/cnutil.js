const path = require('path');
const http = require('https');
const iconv = require('iconv-lite');
const BufferHelper = require('bufferhelper');
const fs = require('fs');
const cheerio = require('cheerio');

var console = {
  log(msg) {
    var oldMsg = $('.logs-area').val();
    $('#logs-area').val(oldMsg + '\r\n' + msg);
    document.getElementById('logs-area').scrollTop = document.getElementById('logs-area').scrollHeight;
  }
}

var Program = {
  run: function(opts) {
    this._setOpts(opts);
    this._init();
    this._dateFormat();
  },
  // 小说下载完毕后执行
  callback: function() {
    console.log('--------下载完成后执行的回调方法--------');
  },
  // 章节抓取过程中执行（监听抓取过程）
  snatchCallback: function(chapter, progress) {
    console.log('--------监听抓取过程回调方法--------');
  },
  // 停止抓取
  stop: function() {
    this._makeStop = true;
  },
  // 重置
  reset: function() {
    this._bookId = null;
    this._startChapter = null;
    this._makeStop = false;
    this._isOk = true;
    this._list = [];
    this._chapterNum = 0;
    this._book = '';
    this._errorLog = '\r\n----------------------------------------\r\n';
  },
  // 设置下载参数
  _setOpts: function(opts) {
    if (typeof opts == 'object') {
      this._bookId = opts.bookId;
      this._startChapter = opts.startChapter;
    } else {
      throw new Error('下载参数错误！');
    }
  },
  // 停止下载标志
  _makeStop: false,
  // 下载配置项
  _option: {
    base: 'https://www.boquge.com',
    book: ''
  },
  _bookId: null, // bookId
  _startChapter: null, // 开始章节名
  _isOk: true, // 标志当前章节是否已下载成功
  _list: [], // 小说列表
  _chapterNum: 0, // 需要抓取的总章节数
  _book: '', // 保存小说名
  _bookInfo: { // 用来做下载信息存储
    bookId: 0, // 书号
    count: 0, // 字数
    bookName: '', // 书名
    endChapter: '', // 上次下载的最后一章章节名
    time: 0 // 下载时间戳
  },
  getBook: function() { // 获取小说名
    return this._book;
  },
  _errorLog: '\r\n----------------------------------------\r\n', // 保存错误章节日志
  _outputDir: path.join(__dirname, '../data/'), // 小说输出路径
  _init: function() {
    var bookId = this._bookId,
      startChapterName = this._startChapter;

    this._bookInfo.bookId = bookId;
    var option = this._option;
    option.book = '/book/' + bookId + '/';
    var bookListUrl = option.base + option.book;
    this._entry(bookListUrl, startChapterName);
  },
  // 章节抓取入口
  _entry: function(bookListUrl, startChapterName) {
    var _this = this;
    var req = http.request(bookListUrl, function(res) {
      //解决中文编码问题
      var bufferHelper = new BufferHelper();
      res.on('data', function(chunk) {
        bufferHelper.concat(chunk);
      });
      res.on('end', function() {
        //注意，此编码必须与抓取页面的编码一致，否则会出现乱码，也可以动态去识别
        var val = iconv.decode(bufferHelper.toBuffer(), 'gbk');
        var $ = cheerio.load(val);
        var date = new Date();
        _this._bookInfo.time = date.getTime();
        var bookName = $('h1').text().match(/^[\u4e00-\u9fa5]+/)[0];
        var book = bookName + ' ' + date.Format('yyyy-MM-dd hh-mm-ss');
        _this._book = book;
        _this._bookInfo.bookName = bookName;
        var $links = $('#chapters-list').find('a');

        var list = _this._list;
        var isStart = false;
        if (!startChapterName) {
          isStart = true;
        }
        $links.each(function(index, item) {
          var chapter = {};
          chapter.name = $(item).text();
          chapter.href = $(item).attr('href');
          if (chapter.name == startChapterName) {
            isStart = true;
          }
          if (isStart) {
            list.push(chapter);
          }
        });
        // 统计需要下载的总章节数
        _this._chapterNum = list.length;
        // 调用，让它按队列顺序执行，以免章节错乱
        _this._excuteSnatchTxt();
      });
    });
    req.end();
  },
  // 根据列表进行章节的顺序抓取
  _excuteSnatchTxt: function() {
    var _this = this;
    var list = _this._list;
    console.log('执行-----' + list.length + '  isOk===' + _this._isOk);

    if (_this._isOk == true) {
      _this._isOk = false;
      var chapter = list.shift(),
        progress = parseInt((_this._chapterNum - list.length) * 100 / _this._chapterNum);

      _this._snatchTxt(chapter.name, chapter.href, progress);
      _this._bookInfo.endChapter = chapter.name;
      if(_this._makeStop) {
        list = [];
      }
      if (list.length > 0) {
        _this._excuteSnatchTxt();
      } else {
        _this.snatchCallback && _this.snatchCallback('下载完毕', 100);
        setTimeout(function() {
          console.log(_this._book + ' 下载完毕！');
          _this._appendTxt(_this._errorLog);
          _this.callback && _this.callback(_this._book + '.txt', _this._bookInfo);
        }, 2000);
      }
    } else {
      // 使用setTimeout是为了让它出让cpu，不能让它一直占用着，
      // 不然其他代码段没办法执行
      setTimeout(function() {
        _this._excuteSnatchTxt();
      }, 300);
    }
  },
  // 抓取具体小说内容
  _snatchTxt: function(chapterName, bookUrl, progress) {
    var _this = this;
    _this.snatchCallback && _this.snatchCallback(chapterName, progress);

    var url = _this._option.base + bookUrl;
    var req = http.request(url, function(res) {
      //解决中文编码问题
      var bufferHelper = new BufferHelper();
      res.on('data', function(chunk) {
        bufferHelper.concat(chunk);
      });
      res.on('end', function() {
        //注意，此编码必须与抓取页面的编码一致，否则会出现乱码，也可以动态去识别
        var val = iconv.decode(bufferHelper.toBuffer(), 'gbk');
        var $ = cheerio.load(val);
        var text = $('#txtContent').text();
        if (text.length > 200) {
          text = chapterName + '\r\n' + text;
          _this._appendTxt(text);
          console.log(chapterName + '   下载完毕……');
          // 重置标志
          _this._isOk = true;
        } else if (text.length > 0) {
          console.log('----------废话章节 【' + chapterName + '】 跳过-------------');
          text = chapterName + '\r\n' + text;
          _this._errorLog += text;
          // 重置标志
          _this._isOk = true;
        } else {
          console.log('----------text为空 【' + chapterName + '】 再来一次----------');
          _this._snatchTxt(chapterName, bookUrl, progress);
        }
      });
      res.on('error', function(e) {
        console.log('响应异常', e);
      });
    });
    req.end();
  },
  // 将章节写入文件
  _appendTxt: function(txt) {
    this._bookInfo.count += txt.length;
    fs.appendFileSync(this._outputDir + this._book + '.txt', txt);
  },
  // 格式化时间
  _dateFormat: function() {
    Date.prototype.Format = function(fmt) { //author: meizz
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

module.exports = Program;
