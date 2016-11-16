var Page = {
    run: function() {
        this._init();
        this._submit();
    },
    _init: function() {
        this.$submitBtn = $('#J-submit-btn'),
        this.$content = $('#J-content');
    },
    _submit: function() {
        var _this = this;
        this.$submitBtn.on('click', function() {
            var bookId = $('#J-book-id').val(),
                startChapter = $('#J-book-start').val();
            _this._showLoading();
            _this.$submitBtn.addClass('disabled');
            $.ajax({
                url: '/catch',
                type: 'post',
                data: { id: bookId, start: startChapter },
                dataType: 'json',
                success: function(res) {
                    console.log(res);
                    if(res.success) {
                        _this._hideLoading();
                        _this._showNovel(res);
                        _this.$submitBtn.removeClass('disabled');
                    }
                },
                error: function(e) {
                    console.log(e);
                }
            });
        });
    },
    _showLoading: function() {
        this.$content.html('<div class="form-content tc"><i class="icon-loading"></i></div>');
    },
    _hideLoading: function() {
        this.$content.empty();
    },
    // 显示小说信息
    _showNovel: function(res) {
        var book = res.data.book,
            url = res.data.url;
        this.$content.html('<div class="form-content"><a target="_blank" href=' + url + '>' + book + '</a></div>');
    }
};

Page.run();
