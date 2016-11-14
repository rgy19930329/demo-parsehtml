
;(function() {
    var $submitBtn = $('#J-submit-btn');
    $submitBtn.on('click', function() {
        $.ajax({
            url: '/books',
            type: 'get',
            dataType: 'json',
            success: function(res) {
                console.log(res);
            },
            error: function(e) {

            }
        });
    });
})();
