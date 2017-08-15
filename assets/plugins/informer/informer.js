/* Path to resources folder */
//var resourcesDomen = 'http://i4.tabletki.ua/files/';
//var resourcesDomen = '../Informer_New/'
var resourcesDomen = './';


/* Check whether jQuery is loaded */

var jqueryCheck = () => {
  createHTML();
  if (window.jQuery) {
    console.log('jQuery exists. Version ' + jQuery.fn.jquery);
    init();
  } else {
    console.log('jQuery version does not exist');
    loadjQuery(resourcesDomen + 'assets/js/jquery.js', function () {
      console.log('jQuery version ' + jQuery.fn.jquery + ' loaded');
      init();
    });
  }
}

/* Load jquery from CDN */

var loadjQuery = (url, callback) => {
  var script = document.createElement('script')
  script.type = "text/javascript";

  if (script.readyState) { //IE
    script.onreadystatechange = function () {
      if (script.readyState == "loaded" || script.readyState == "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else { //Others
    script.onload = function () {
      callback();
    };
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
}

/* Script loader */

var loadScript = (url, callback) => {
  var script = document.createElement('script');
  script.src = url;
  document.body.appendChild(script);
  script.onload = callback;

  console.log('script ' + url + ' loaded')
}

/* Style loader */

var loadCSS = (href) => {
  var link = document.createElement('link');
  link.rel = "stylesheet";
  link.href = href;
  document.getElementsByTagName("head")[0].appendChild(link);

  console.log('css ' + href + ' loaded')
}

/* Main app */

var init = () => {
  var 
    $cities      = $("#tabletki-city"),
    $regions     = $("#tabletki-region"),
    domen        = "https://tabletki.ua/",
    productName  = TABLETKI_INFORMER.productName,
    jsonUrl      = domen + "api/widget/get.pharmacy/?q=" + productName,
    regionsArray = [],
    regionOption = '',
    globalData   = {},
    markers      = [];

  var infoWindow;
  
  $.getJSON(jsonUrl, function(data) {

    if($("#tabletki-remodal").length) {
      /* Modal window script upload */
      loadScript(resourcesDomen + 'assets/plugins/remodal/dist/remodal.min.js', hashChangeListener);

      $("#tabletki-remodal").css("visibility", "visible");
    } 

    globalData = data;
    $cities.attr('disabled', true);
    $.each(globalData.response.body, function (key, val) {  // Filling an array of regions without repeats
      if(val.pharmacy_area != 0) {
        if($.inArray(val.pharmacy_area, regionsArray) == -1) {
          regionsArray.push(val.pharmacy_area);
        }
      }
    })
    regionsArray.sort();
    $.each(regionsArray, function(index, value){  // Filling Region Select
      regionOption += '<option value="' + value + '">' + value + '</option>';
    });

    $regions.append(regionOption)
    $('.tabletki-product_name').text(productName);

    if(TABLETKI_INFORMER.view == 'nomodal') {
      var mapStyle = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#e1ffce"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]}]
      /*var bounds = new google.maps.LatLngBounds();*/
      var mapProp = {
        center: new google.maps.LatLng(48.286811, 30.659149),
        zoom: 6,
        minZoom: 3,
        scaleControl: false,
        mapTypeControl: false,
        rotateControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        gestureHandling: 'greedy',
        styles: mapStyle
      };

      map = new google.maps.Map(document.getElementById('tabletki-map'), mapProp);

      createMarkers(globalData);

      google.maps.event.trigger(map, "resize");
      google.maps.event.addListener(map, "click", function(event) {
        if(infoWindow) infoWindow.close();
      });
    }
  });


  if($("#tabletki-remodal").length) {
    $(window).on('hashchange', hashChangeListener);

    $(document).on('opening', '#tabletki-remodal', function () {
      var mapStyle = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#e1ffce"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]}]
      /*var bounds = new google.maps.LatLngBounds();*/
      var mapProp = {
        center: new google.maps.LatLng(48.286811, 30.659149),
        zoom: 6,
        minZoom: 3,
        scaleControl: false,
        mapTypeControl: false,
        rotateControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        gestureHandling: 'greedy',
        styles: mapStyle
      };

      map = new google.maps.Map(document.getElementById('tabletki-map'), mapProp);

      createMarkers(globalData);

      google.maps.event.trigger(map, "resize");
      google.maps.event.addListener(map, "click", function(event) {
        if(infoWindow) infoWindow.close();
      });
    });

    $(document).on('opened', '#tabletki-remodal', function () {
      $('.tabletki-loading').remove();
    });

    $(document).on('click', '#tabletki-modal_closeBtn', function () {
      window.history.back();
    });
    
    $(document).on('keyup', function(e) { 
      if (e.keyCode == 27) {
        if($('#tabletki-remodal').is('.remodal-is-opened')) {
          window.history.back();
        }
      }
    });
  }   else {
      $(".tabletki-map_tooltip").css("margin", "10px");
    }

  $('body').on('change', '#tabletki-region', function(event) {  //City select changes after choosing the region
    citySelect(globalData, event);
    reloadMarkers(globalData);
    clusterBounds()
    counterParagraph();
  });

  $('body').on('change', '#tabletki-city', function(event) {  //City select changes after choosing the region
    reloadMarkers(globalData);
    clusterBounds()
    counterParagraph();
  });


/************
  FUNCTIONS
************/

  /* Open modal window */

  function openModalWindow() {
    var modal = $('[data-remodal-id=modal]').remodal();
    modal.open();
  }
  
  /* Close modal window */

  function closeModalWindow() {
    var modal = $('[data-remodal-id=modal]').remodal();
    modal.close();
    clearMap();
    $regions.val('all');
    $cities.val('all').prop('disabled', true);
  }

  /* Action if hash changed */

  function hashChangeListener() {
    var hash = TABLETKI_INFORMER.hash;

    if((window.location.hash === hash)) {
      loadingAnimation();
      if($.fn.remodal) {
        openModalWindow();
      }
    } else if (window.location.hash === "") {
      if($('#tabletki-remodal').is('.remodal-is-opened')) {
        closeModalWindow();
      }
    }
  }

  /* Filling dropdown with cities */

  function citySelect(data, event) {
    var $this        = $(event.target),
        $cities      = $("#tabletki-city"),
        $regionIndex = $this.val(),
        citiesArray  = [];

    $cities.html('<option value="all">Все города</option>');
    if($regionIndex == "all") {
      $cities.attr('disabled', true);
    } else {
      $cities.attr('disabled', false);
      $.each(data.response.body, function(key, val) { // Filling an array of cities without repeats
        if(val.pharmacy_area == $regionIndex && val.pharmacy_town != 0) {
          if( $.inArray(val.pharmacy_town, citiesArray) == -1 ) {
            citiesArray.push(val.pharmacy_town);
          }
        }
      });
      citiesArray.sort();
      $.each(citiesArray, function(index, value){  // Filling Cities Select
        $cities.append('<option value="' + value + '">' + value + '</option>');
      });
    }
  }

  /* Creating marker */

  function createMarker(value) {
    var markerIcon = {
      url: resourcesDomen + 'assets/plugins/informer/img/' + TABLETKI_INFORMER.marker + '.svg',
      scaledSize: new google.maps.Size(60, 60)
    };
    var latLng = new google.maps.LatLng(+value.pharmacy_coordinates.latitude.replace(',','.'), +value.pharmacy_coordinates.longitude.replace(',','.'));
    var marker = new google.maps.Marker({
                                        position: latLng,
                                        map: map,
                                        title: value.pharmacy_name,
                                        animation: google.maps.Animation.DROP,
                                        icon: markerIcon
                                      });
    marker.addListener('click', function() {
      map.setZoom(16);
      map.setCenter(marker.getPosition());
    });
    var contentString = '<div class="tabletki-map_tooltip scrollfix"><h3>' + value.pharmacy_name + '</h3><div class="tooltip_contacts"><div class="tooltip_address"><span>' + value.pharmacy_town + '</span><br>' + value.pharmacy_address + '</div><div class="tooltip_tel"><br><a href="tel:' + value.pharmacy_phone_number + '">' + value.pharmacy_phone_number + '</a></div></div><div class="tabletki-cf"></div>';
    $.each(value.medicine, function(k, val) {
      var price = val.dosage_price;
      if(!isNaN(price)) {
          price = 'цену уточняйте'
      } else {
          price += ' грн.'
      }
      contentString += '<div class="tooltip_name"><span>' + val.dosage_name + '</span><br>' + val.dosage_producer + '</div>'
      contentString += '<div class="tooltip_price">' + price + '</div>';
    });
    contentString += '<div class="tabletki-cf"></div></div>';

    (function(marker, value) {
      // Attaching a click event to the current marker
      google.maps.event.addListener(marker, "click", function(e) {
        if (infoWindow) infoWindow.close();
        infoWindow = new google.maps.InfoWindow({content: contentString});
        infoWindow.open(map, marker);
      });
    })(marker, value);

    return marker
  }

  /* Creating all markers and clusters of pharmacies on google map */

  function createMarkers(data) {
      var $regionsVal     = $regions.val(),
        $citiesVal        = $cities.val(),
        count             = 0,
        price             = 0,
        counterPriced     = 0,
        averagePriceBlock = '',
        pharmCountBlock   = '';

    $.each(data.response.body, function(key, value) {
      if($regionsVal == 'all') {
        var newMarker = createMarker(value)
        markers.push(newMarker)
        $.each(value.medicine, function(k, val) {
          var num = val.dosage_price.replace(',', '.');
          if(!isNaN(num)) {
            price += +num;
            counterPriced += 1;
          }
        })
        count += 1;
      } else if($citiesVal == "all") {
        if(value.pharmacy_area == $regionsVal) {
          var newMarker = createMarker(value)
          markers.push(newMarker)
          $.each(value.medicine, function(k, val) {
            var num = val.dosage_price.replace(',', '.');
            if(!isNaN(num)) {
              price += +num;
              counterPriced += 1;
            }
          })
          count += 1;
        }
      } else if(($regionsVal != 'all') && ($citiesVal != 'all')) {
        if((value.pharmacy_area == $regionsVal) && (value.pharmacy_town == $citiesVal)) {
          var newMarker = createMarker(value)
          markers.push(newMarker)
          $.each(value.medicine, function(k, val) {
            var num = val.dosage_price.replace(',', '.');
            if(!isNaN(num)) {
              price += +num;
              counterPriced += 1;
            }
          })
          count += 1;
        }
      } 
    });
    price = price.toFixed(2)/counterPriced;

    if(!isNaN(price) && (price != 0)) {
      averagePriceBlock += '<p>Средняя цена:</p>' + 
                      '<p class="tabletki-counter average-price_counter">' + price.toFixed(2) + ' грн.</p>';
      if($('.average-price_counter').length) {
        $('.average-price_counter').text(price.toFixed(2) + ' грн.');
      } else {
        $('.tabletki_average-price').append(averagePriceBlock)
      }
    } else {
      $('.tabletki_average-price').empty();
    }

    if(!isNaN(count) && (count > 0)) {
      pharmCountBlock +=  '<p>Спрашивайте в</p>' + 
                          '<p class="tabletki-counter pharm_counter">' + count + '</p>' + 
                          '<p class="pharm-count_paragraph"><span class="paragraph_pharm">аптеках </span><span class="paragraph_area">Украины</span></p>'
      if($('.pharm_counter').length) {
        $('.pharm_counter').text(count);
      } else {
        $('.tabletki-ask').append(pharmCountBlock);
      }
    } else {
      $('.tabletki-ask').empty();
    }

    var clusterStyles = [ [{
        url: resourcesDomen + 'assets/plugins/informer/img/cluster1.svg',
        height: 41,
        width: 41,
        textColor: '#00a26c',
        textSize: 16
    }, {
        url: resourcesDomen + 'assets/plugins/informer/img/cluster2.svg',
        height: 48,
        width: 48,
        textColor: '#00a26c',
        textSize: 14
    }, {
        url: resourcesDomen + 'assets/plugins/informer/img/cluster3.svg',
        width: 58,
        height: 58,
        textColor: '#00a26c',
        textSize: 14
    }, {
        url: resourcesDomen + 'assets/plugins/informer/img/cluster4.svg',
        height: 70,
        width: 70,
        textColor: '#00a26c',
        textSize: 14
    }, {
        url: resourcesDomen + 'assets/plugins/informer/img/cluster5.svg',
        height: 80,
        width: 80,
        textColor: '#00a26c',
        textSize: 14
    }]];

    var clusterOptions = {
        styles: clusterStyles[0],
    };

    markerCluster = new MarkerClusterer(map, markers, clusterOptions);
  }

  /* Deleting markers and clusters from map */

  function clearMap() {
    // Clear clusters
    markerCluster.clearMarkers();
    // Loop through markers and set map to null for each
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    // Reset the markers array
    markers = [];
  }

  /* Reloading map */

  function reloadMarkers(data) {
    clearMap();
    // Call set markers to re-add markers
    createMarkers(data);
  }


  /* Fit shown markers and clusters to the map size */

  function clusterBounds() {
    var bounds = new google.maps.LatLngBounds();
    if (markers.length > 1) {
      for (var i = 0; i < markers.length; i++) {
        bounds.extend(markers[i].getPosition());
      }
      map.fitBounds(bounds);
    } else if(markers.length == 1) {
      map.setZoom(16);
      map.setCenter(markers[0].getPosition());
    }
  }

  /* Count quantity of pharmacies and inserting result to html */

  function counterParagraph() {
    var $regionsVal  = $regions.val(),
        $citiesVal   = $cities.val(),
        $counterText = $('.pharm_counter').text(),
        textLength   = $counterText.length;

    if($('.pharm_counter').length) {
      if((($counterText[textLength - 1] == '1') && ($counterText[textLength - 2] == '1')) || ($counterText[textLength - 1] != '1')) {
        $('.paragraph_pharm').text('аптеках ');
      } else {
        $('.paragraph_pharm').text('аптеке ');
      }

      if($regionsVal == 'all') {
        $('.paragraph_area').text('Украины');
      } else if($citiesVal == 'all') {
        $('.paragraph_area').text('области');
      } else if(($regionsVal != 'all') && ($citiesVal != 'all')) {
        $('.paragraph_area').text('города');
      }
    }
  }

  /* CSS loading animation block */

  function loadingAnimation() {
    var div = '<div class="tabletki-loading"></div>';

    $('body').append(div);
  }
};

/* Create modal window html */

var createHTML = () => {
  var modalContent   = document.createElement('div'),  
      nomodalContent = document.createElement('div'),
      html           = '';  

  var modalCloseBtn = '<div class="tabletki-modal_close">' + 
                        '<a class="tabletki-modal_closeBtn" id="tabletki-modal_closeBtn">Вернуться</a>' + 
                      '</div>';

  modalContent.setAttribute("style", "visibility: hidden");
  modalContent.setAttribute("class", "remodal tabletki-modal");
  modalContent.setAttribute("id", "tabletki-remodal");
  modalContent.setAttribute("data-remodal-id", "modal");
  modalContent.setAttribute("data-remodal-options", "hashTracking: false, closeOnEscape: false, closeOnOutsideClick: false");

  nomodalContent.setAttribute("class", "tabletki-wrapper");


 
  html += '<div class="tabletki-content">' + 
            '<div class="tabletki_left-column">' + 
              '<div class="left-column_content">';

  if(TABLETKI_INFORMER.view == 'modal') {
    html += modalCloseBtn;
  }

  html +=       '<div class="tabletki-content_block tabletki-product">' + 
                  '<div class="tabletki-product_image">' + 
                    '<img src="' + TABLETKI_INFORMER.image + '" alt="Фитобронхол">' + 
                  '</div>' + 
                  '<p class="tabletki-product_name"></p>' + 
                  '<div class="tabletki_average-price">' + 
                  '</div>' + 
                '</div>' + 
                '<div class="tabletki-content_block tabletki-ask">' + 
                '</div>' + 
                '<div class="tabletki-content_block tabletki_filter">' + 
                  '<select name="region" id="tabletki-region" class="tabletki_selection">' + 
                    '<option value="all">Все области</option>' + 
                  '</select>' + 
                  '<select name="city" id="tabletki-city" class="tabletki_selection">' + 
                    '<option value="all">Все города</option>' + 
                  '</select>' + 
                '</div>' + 
              '</div>' + 
            '</div>' + 
            '<div class="tabletki_right-column">' + 
              '<div id="tabletki-map"></div>' + 
            '</div>' + 
          '</div>';



  if(TABLETKI_INFORMER.view === 'modal') {
    modalContent.innerHTML += html;
    document.body.appendChild(modalContent);
  } else if(TABLETKI_INFORMER.view === 'nomodal') {
    nomodalContent.innerHTML += html;
    document.getElementById('tabletki-informer').appendChild(nomodalContent);
  }
  
}



document.addEventListener('DOMContentLoaded', () => {
  //document.getElementById('tabletki-modalButton').setAttribute('data-remodal-target', 'modal');
  /* Load Styles */
  if(TABLETKI_INFORMER.view === 'modal') {
    loadCSS(resourcesDomen + 'assets/plugins/remodal/dist/remodal.css');
    loadCSS(resourcesDomen + 'assets/plugins/remodal/dist/remodal-default-theme.css');
  }

  loadCSS(resourcesDomen + 'assets/plugins/informer/app.css');
  /* Google maps script */
  loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyD6UFeu-Ookcm7KyBJW0bnHhlGmvkYp2b4");
  /* Google maps clusters script */
  loadScript(resourcesDomen + 'assets/js/markerclusterer.js');
  jqueryCheck();
});