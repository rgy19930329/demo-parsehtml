var socket = io();

var Page = {
	run: function() {
		this._init();
	},
	_init: function() {
		this.$bookId = $('#J-book-id');
		this.$startChapter = $('#J-book-start');
		this.$progress = $('#J-progress');
		this.$content = $('#J-content');
		this.$catchBtn = $('#J-submit-btn');
		this.$resetBtn = $('#J-reset-btn');
		// ---- //
		this._initEvent();
	},
	_initEvent: function() {
		this._catchEvent();
		this._catchingEvent();
		this._catchendEvent();
		this._resetEvent();
	},
	// 点击开始抓取
	_catchEvent: function() {
		var _this = this;
		this.$catchBtn.on('click', function() {
			var bookId = $('#J-book-id').val(),
		        startChapter = $('#J-book-start').val();
		    socket.emit('catch', {
		    	id: bookId,
		    	start: startChapter
		    });
		    // --生成进度条-- //
		   	_this._showProgress();
			// --禁用catch按钮-- //
			$(this).addClass('disabled');
		});
	},
	// 监听抓取过程的事件
	_catchingEvent: function() {
		var _this = this;
		socket.on('catching', function(obj) {
			_this.$content.html(obj.chapter);
			$('#J-progress-inner').css({width: obj.progress + '%'});
		});
	},
	// 监听抓取结束的事件
	_catchendEvent: function() {
		var _this = this;
		socket.on('catchend', function(obj) {
			// --启用catch按钮-- //
			_this.$catchBtn.removeClass('disabled');
			var book = obj.book,
		        url = obj.url;
		    _this.$content.html(
		    	'<div class="form-content">' +
		    		'<a target="_blank" href=' + url + '>' + book + '</a>' +
		    	'</div>'
		    );
		});
	},
	_resetEvent: function() {
		var _this = this;
		this.$resetBtn.on('click', function() {
			// --发出停止下载的指令-- //
			socket.emit('stop');
			// 
			_this.$bookId.val('');
			_this.$startChapter.val('');
			_this.$progress.empty();
			_this.$content.empty();
			// --启用catch按钮-- //
			_this.$catchBtn.removeClass('disabled');
		});
	},
	// --生成进度条-- //
	_showProgress: function() {
		this.$progress.html(
			'<div class="progress progress-striped">' +
				'<div class="progress-bar progress-bar-info" role="progressbar"' +
			         'aria-valuemin="0" aria-valuemax="100"' +
			         'style="width: 0%;" id="J-progress-inner">' +
			         '<span class="sr-only"></span>' +
			    '</div>' +
			'</div>'
		);
	}
}

Page.run();