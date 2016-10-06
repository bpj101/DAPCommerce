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



$(function() {
  $('#search').keyup(function() {
    let search_term = $(this).val();

    $.ajax({
      method: 'post',
      url: '/api/search',
      data: {
        search_term
      },
      dataType: 'json',
      success: function(json) {
        let xdata = [];
        let data = json.hits.hits.map((hit) => {
          if (hit) {
            xdata.push(hit);
          }
          return hit;
        });
        console.log(xdata);
        $('#searchResults').empty();
        for (var i = 0; i < xdata.length; i++) {
          let html = '';
          html += '<div class="col-md-4">';
          html += '<a href="/product/' + xdata[i]._id + '">';
          html += '<div class="thumbnail">';
          html += '<img src="' + xdata[i].image + '" alt="">';
          html += '<div class="caption equalize">';
          html += '<h3>' + xdata[i].name + '</h3>';
          html += '<p>$' + xdata[i].price + '</p>';
          html += '</div>';
          html += '</div>';
          html += '</a>';
          html += '</div>';
          $('#searchResults').append(html);
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  });
});
