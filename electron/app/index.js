const path = require('path');
const fs = require('fs');
const shell = require('electron').shell;
var Program = require('./cnutil.js');
var fileutil = require('./fileutil.js');

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

var Page = {
  run() {
      this.init();
    },
    init() {
      this.ncatch();
      this.linkto();
      this.nreset();
      this.logshow();
      this.historyshow();
    },
    linkto() {
      $('#linkto').on('click', function() {
        var link = $(this).data('href');
        shell.openExternal(link);
      });
    },
    ncatch() {
      var me = this;
      $('#catch').on('click', function() {
        var bookId = $('#bookId').val();
        var startChapter = $('#startChapter').val();

        if (!bookId) {
          me.msgtips('书号不能为空');
          return;
        }

        if (!bookId.match(/^\d+$/)) {
          me.msgtips('书号只能为数字');
          return;
        }

        me.progressshow();

        Program.snatchCallback = function(chapter, progress) {
          $('#chapter').text(chapter);
          $('#J-progress-inner').css({
            width: progress + '%'
          });
        }

        Program.callback = function(bookName) {
          var curPath = path.join(__dirname, '../data', `/${bookName}`);
          $('#chapter').html(`<a href="file://${curPath}" download="${bookName}">${bookName}</a>`);
        }

        Program.run({
          bookId,
          startChapter
        });
      });
    },
    nreset() {
      $('#reset').on('click', function() {
        $('#bookId').val('');
        $('#startChapter').val('');
        $('#logs-area').val('');
      });
    },
    logshow() {
      $('#logs-eye').on('click', function() {
        if ($(this).hasClass('glyphicon-eye-open')) {
          $(this).removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close');
          $('#logs-area').hide();
        } else {
          $(this).removeClass('glyphicon-eye-close').addClass('glyphicon-eye-open');
          $('#logs-area').show();
        }
      });
    },
    progressshow() {
      $('#progress').html(
        '<div class="progress progress-striped" style="height:10px;">' +
        '<div class="progress-bar progress-bar-info" role="progressbar"' +
        'aria-valuemin="0" aria-valuemax="100"' +
        'style="width: 0%;" id="J-progress-inner">' +
        '<span class="sr-only"></span>' +
        '</div>' +
        '</div>' +
        '<div class="chapter" id="chapter"></div>'
      );
    },
    historyshow() {
      var me = this;
      $('#bookId').on('focus', function() {
        $('#history').addClass('show');
        me.updateHistoryList();
      });
      $('#bookId').on('blur', function() {
        setTimeout(function() {
          $('#history').removeClass('show');
        }, 150);
      });

      $('#history').on('click', 'li', function() {
        var bookId = $(this).data('book');
        var bookInfo = JSON.parse(decodeURIComponent($(this).data('bookinfo')));
        var url = 'http://www.boquge.com/book/' + bookId;
        $('#linkto').data('href', url).html(url);
        $('#bookId').val(bookId);
        $('#startChapter').val(bookInfo.endChapter);
      });
      $('#history').on('click', 'a', function() {
        var bookId = $(this).parents('li').data('book');
        fileutil.setFinished(bookId);
      });
    },
    updateHistoryList() {
      var historyData = require('../data/history.json');
      var $historyList = $('#history').find('ul');
      var str = '';
      for (var bookId in historyData) {
        if (!historyData[bookId].isFinished) {
          str += `<li data-book="${bookId}" data-bookinfo="${encodeURIComponent(JSON.stringify(historyData[bookId]))}">
              <span class="col-1">${historyData[bookId].bookName}</span>
              <span class="col-2">${new Date(parseInt(historyData[bookId].time)).Format('yyyy-MM-dd hh:mm:ss')}</span>
              <span class="col-3"><a href="javascript:;">完成</a></span>
             </li>`;
        }
      }
      $historyList.html(str);
    },
    msgtips(msg) {
      $('.msgtips').html(
        `<div class="alert alert-warning">
        <a href="#" class="close" data-dismiss="alert">
            &times;
        </a>
        ${msg}
      </div>`
      );
      $('.alert').alert();
    }
}

Page.run();
