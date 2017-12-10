const path = require('path');
const fs = require('fs');
const shell = require('electron').shell;
var Program = require('./cnutil.js');
var historyData = require('../data/history.json');
console.log(historyData);

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
        $('#J-progress-inner').css({width: progress + '%'});
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
      if($(this).hasClass('glyphicon-eye-open')) {
        $(this).removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close');
        $('#logs-area').hide();
      }else{
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
    $('#bookId').on('focus', function() {
      $('#history').addClass('show');
    });
    $('#bookId').on('blur', function() {
      setTimeout(function() {
        $('#history').removeClass('show');
      }, 150);
    });
    var $historyList = $('#history').find('ul');
    var str = '';
    for(var bookId in historyData) {
      str += `<li data-book="${bookId}">
              <span class="col-1"><a href="javascript:;">${historyData[bookId].bookName}</a></span>
              <span class="col-2">${historyData[bookId].time}</span>
              <span class="col-3"><a href="javascript:;">完成</a></span>
             </li>`;
    }
    $historyList.html(str);
    $('#history').on('click', 'li', function() {
      console.log($(this));
      var bookId = $(this).data('book');
      var url = 'http://www.boquge.com/book/' + bookId;
      $('#linkto').data('href', url).html(url);
    });
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