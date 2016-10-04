'use strict';
$(document).ready(function() {

    // Hide alert on page after 5sec
    setTimeout(() => {
        $('.alert').hide();
    }, 5000);

    // Set max height to captions
    var maxHeight = 0;
    $('.equalize').each(function() {
        if ($(this).height() > maxHeight) {
            maxHeight = $(this).height();
        }
    });
    $('.equalize').height(maxHeight);

});
