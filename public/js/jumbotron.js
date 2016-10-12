'use strict';
$(document).ready(function() {

  // Hide alert on page after 5sec
  setTimeout(() => {
    $('.alert').hide();
  }, 5000);

  // Set max height to captions
  let maxHeight = 0;
  $('.equalize').each(function() {
    if ($(this).height() > maxHeight) {
      maxHeight = $(this).height();
    }
  });
  $('.equalize').height(maxHeight);

});



$(function() {

  Stripe.setPublishableKey('pk_test_P6JY1TaYnTg4DLgALvTzMSJH');

  var opts = {
    lines: 13, // The number of lines to draw
    length: 28, // The length of each line
    width: 14, // The line thickness
    radius: 42, // The radius of the inner circle
    scale: 0.5, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#000', // #rgb or #rrggbb or array of colors
    opacity: 0.25, // Opacity of the lines
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise -1: counterclockwise
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '40%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    position: 'absolute', // Element positioning
  };




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
        for (let i = 0; i < xdata.length; i++) {
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



  $(document).on('click', '#plus', function(e) {
    e.preventDefault();
    let priceValue = parseFloat($('#priceValue').val());
    let quantity = parseInt($('#quantity').val());

    priceValue += parseFloat($('#priceHidden').val());
    quantity += 1;

    $('#quantity').val(quantity);
    $('#priceValue').val(priceValue.toFixed(2));
    $('#total').html(quantity);

  });

  $(document).on('click', '#minus', function(e) {
    e.preventDefault();
    let priceValue = parseFloat($('#priceValue').val());
    let quantity = parseInt($('#quantity').val());

    if (quantity > 1) {
      priceValue -= parseFloat($('#priceHidden').val());
      quantity -= 1;
    }

    $('#quantity').val(quantity);
    $('#priceValue').val(priceValue.toFixed(2));
    $('#total').html(quantity);

  });

  function stripeResponseHandler(status, response) {
    // Grab the form:
    let $form = $('#payment-form');

    if (response.error) { // Problem!

      // Show the errors on the form:
      $form.find('.payment-errors').text(response.error.message);
      $form.find('.submit').prop('disabled', false); // Re-enable submission

    } else { // Token was created!

      // Get the token ID:
      let token = response.id;

      // Insert the token ID into the form so it gets submitted to the server:
      $form.append($('<input type="hidden" name="stripeToken" />').val(token));

      // Spinning device
      var target = document.getElementById('loading');
      var spinner = new Spinner(opts).spin(target);

      // Submit the form:
      $form.get(0).submit();
    }
  }

  let $form = $('#payment-form');
  $form.submit(function(event) {
    // Disable the submit button to prevent repeated clicks:
    $form.find('.submit').prop('disabled', true);

    // Request a token from Stripe:
    Stripe.card.createToken($form, stripeResponseHandler);

    // Prevent the form from being submitted:
    return false;
  });

});
