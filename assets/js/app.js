(function() {
  /* Path to resources folder */
  var resourcesDomen = 'https://tabletki.ua/article/i4/files/';
  //var resourcesDomen = './';


  /* Check whether jQuery is loaded */

  var jqueryCheck = () => {
    createHTML();
    if (window.jQuery) {
      console.log('jQuery exists. Version ' + jQuery.fn.jquery);
      window.jQuery = window.$ = jQuery;
      init();
    } else {
      console.log('jQuery version does not exist');
      loadjQuery(resourcesDomen + 'assets/js/jquery.js', function () {
        console.log('jQuery version ' + jQuery.fn.jquery + ' loaded');
        window.jQuery = window.$ = jQuery;
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

  var loadCSS = (href, callback) => {
    var link = document.createElement('link');
    link.rel = "stylesheet";
    link.href = href;
    document.getElementsByTagName("head")[0].appendChild(link);
    link.onload = callback

    console.log('css ' + href + ' loaded')
  }

  /* Main app */

  var init = () => {
    var 
      $cities      = $("#tabletki-city"),
      $regions     = $("#tabletki-region"),
      domen        = "https://tabletki.ua/",
      productName  = TABLETKI_INFORMER.productName,
      jsonUrl      = domen + "api/widget/v2/getpharmacy/?q=" + productName,
      userID       = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase(),
      regionsArray = [],
      regionOption = '',
      globalData   = {},
      markers      = [],
      jqxhr;

    var infoWindow;

    /* Load mask input */
    loadScript(resourcesDomen + 'assets/plugins/maskedinput/maskedinput.min.js', function() {
      $(".modal-reserve_tel-input").mask("+38 (999) 999-99-99");
    });

    checkOptions();
    if(productName) loadAPI();

    if(TABLETKI_INFORMER.view == 'modal') {
      $('.tabletki_right-column').addClass('tabletki--fixed');
      $('.tabletki-content').css('min-height', '100vh');
    }

    if($("#tabletki-remodal").length) {
      $(window).on('hashchange', hashChangeListener);

      $(document).on('opening', '#tabletki-remodal', function () {
        createMap();
        jqxhr.complete(function() {
          // if($('#tabletki-region  option[value="' + globalData.response.area + '"]').length > 0) {
          //   $('#tabletki-region').val(globalData.response.area);
          //   citySelect(globalData, event);
          //   if($('#tabletki-city  option[value="' + globalData.response.town + '"]').length > 0) {
          //     $('#tabletki-city').val(globalData.response.town);
          //   }

          //   // if (navigator.geolocation) {
          //   //   navigator.geolocation.getCurrentPosition(geoPosition);
          //   // }

          //   reloadMarkers(globalData);
          //   clusterBounds();
          //   recountPharmacies();
          //   listPopulate(globalData);
          // }
        });
        if(TABLETKI_INFORMER.pharmView == 'list') {
          $('#radio-list').prop('checked', true);
          $('.tabletki_product-list').css('display', 'block');
          $('#tabletki-map').hide();
          $('.tabletki_right-column').removeClass('tabletki--fixed');
          jqxhr.complete(function() {
            listPopulate(globalData);
          });
        } else if (TABLETKI_INFORMER.pharmView == 'map') {
          $('#radio-map').prop('checked', true);
          $('.tabletki_product-list').hide();
          $('#tabletki-map').show();
          clearMap();
          google.maps.event.trigger(map, "resize");
          createMarkers(globalData);
          clusterBounds();
        }
      });

      $(document).on('opened', '#tabletki-remodal', function () {
        $('.tabletki-loading').remove();
      });

      $(document).on('closing', '#tabletki-remodal', function () {
        $('.tabletki_product-list').empty();
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
    } else {
      if(TABLETKI_INFORMER.pharmView == 'list') {
        $('#radio-list').prop('checked', true);
        $('.tabletki_product-list').css('display', 'block');
        $('#tabletki-map').hide();
        jqxhr.complete(function() {
          listPopulate(globalData);
        });
      } else if (TABLETKI_INFORMER.pharmView == 'map') {
        $('#radio-map').prop('checked', true);
        $('.tabletki_product-list').hide();
        $('#tabletki-map').show();
      }

      jqxhr.complete(function() {
        // if($('#tabletki-region  option[value="' + globalData.response.area + '"]').length > 0) {
        //   $('#tabletki-region').val(globalData.response.area);
        //   citySelect(globalData, event);
        //   if($('#tabletki-city  option[value="' + globalData.response.town + '"]').length > 0) {
        //     $('#tabletki-city').val(globalData.response.town);
        //   }
        //   // if (navigator.geolocation) {
        //   //   navigator.geolocation.getCurrentPosition(geoPosition);
        //   // }

        //   reloadMarkers(globalData);
        //   clusterBounds();
        //   recountPharmacies();
        //   listPopulate(globalData);
        // }
      });
    }

    $('body').on('change', '.map-or-list', function () {
      if($('#radio-list').is(':checked')) {
        listPopulate(globalData)
        $('.tabletki_product-list').show();
        $('#tabletki-map').hide();
        $('.tabletki_right-column').removeClass('tabletki--fixed');
      } else if($('#radio-map').is(':checked')) {
        $('.tabletki_product-list').hide();
        $('#tabletki-map').show();
        clearMap();
        google.maps.event.trigger(map, "resize");
        createMarkers(globalData);
        clusterBounds();
      }
    });

    $('body').on('click', '.js-find-nearby-button', function(event) { 
      $('#modal-geoposition').fadeIn();

      var input = document.getElementById('modal-geoposition_address-input');
      var autocomplete = new google.maps.places.Autocomplete(input, {
                            componentRestrictions: {'country': 'ua'},
                            types : [ 'geocode' ]
                          });

      google.maps.event.addListener(autocomplete, 'place_changed', () => { 
        var place     = autocomplete.getPlace(),
            latitude  = place.geometry.location.lat(),
            longitude = place.geometry.location.lng();

        $('#modal-geoposition').fadeOut();

        $regions.val('all').trigger('change');

        map.setCenter(new google.maps.LatLng(latitude, longitude));
        map.setZoom(14);
      });
    });

    $('body').on('click','.js-define-location' , function(event) {  
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(geoPosition);
        $('#modal-geoposition').fadeOut();
      } else {
        alert("Ваш браузер не поддерживает определение геолокации.");
      }
    });

    $('body').on('click', '#modal-geoposition, .js-modal-geoposition_close', function(event) { 
      $('#modal-geoposition').fadeOut();
    });

    $('body').on('click','.js-modal-geoposition_body' , function(event) {  
      event.stopPropagation();
    });

    $('body').on('change', '#tabletki-region', function(event) {  //Region select
      citySelect(globalData, event);
      reloadMarkers(globalData);
      clusterBounds();
      recountPharmacies();
      listPopulate(globalData);
    });

    $('body').on('change', '#tabletki-city', function(event) {  //City select changes after choosing the region
      reloadMarkers(globalData);
      clusterBounds();
      recountPharmacies();
      listPopulate(globalData);
    });

    $('body').on('click', '.modal-reserve_open-button', function(event) { 
      $('#modal-reserve').fadeIn();
      modalReserveData(this);
      $('.modal-reserve_tel-input').focus();
    });

    $('body').on('click', '#modal-reserve, .modal-reserve_close-button, .modal-reserve_close', function(event) { 
      $('#modal-reserve').fadeOut();
      $('.tabletki_quantity-input').val('1');
    });

    $('body').on('click','.js-modal-reserve_body' , function(event) {  
      event.stopPropagation();
    });

    $('body').on('click','.modal-reserve_confirm-button' , function(event) { 
      var quantity   = $('.tabletki_quantity-input').val(),
          tel        = $('.modal-reserve_tel-input').val(),
          pharmacyId = $('.modal-reserve_pharmacy-name').attr('data-pharmacy-id'),
          productId  = $('.modal-reserve_medicine').attr('data-product-id') % 1000000,
          price      = $('.order_price').find('span').text(),
          guid       = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
          str        = '[{"ID":"' + guid + '","BranchSerialNumber":"' + pharmacyId + '","Customer":"","CustomerPhone":"' + tel + '","ID_User":"' + userID + '","Rows":[{"ID_ReserveDocDH":"' + guid + '","GoodsCode":' + productId + ',"Qty":' + quantity + ',"Price":' + price + ',"NeedOrder":0}]}]',
          loc        = window.location.pathname;

      if($('.modal-reserve_tel-input').val()) {
        $.ajax({
          url: 'https://api2.tabletki.ua/apptestreserve/?Referer=' + encodeURIComponent(loc),
          type:'POST',
          contentType: "application/json",
          dataType: 'json',
          data: str,
          success: function(data, textStatus, jqXHR) {
            if(data[0].Status == 0) {
              $('#modal-response').fadeIn();
              $('#modal-response').find('h3').text('Заказ отправлен в обработку. В ближайшее время с Вами свяжутся.');
              $('.modal-response_confirm-button').text('ОК');
              setTimeout(function() {
                $('#modal-reserve').fadeOut();
                $('#modal-response').fadeOut();
              }, 3000);
            } else if(data[0].Status == -1) {
              $('.modal-response_confirm-button').text('Вернуться');
              $('#modal-response').find('h3').text('В аптеке недостаточно товара. В наличии ' + data[0].Rows[0].QtyShip + ' ед.');
              $('#modal-response').fadeIn();            
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
          }
        });
      } else {
        $('.modal-reserve_warning-tip').show();
        $('.modal-reserve_tel-input').focus().css('border-color', 'red');
        setTimeout(function() {
          $('.modal-reserve_warning-tip').fadeOut();
        }, 3000);
      }
    });

    $('body').on('click', '.tabletki_quantity-btn', function() {
      var $button = $(this);
      var oldValue = $button.parent().find("input").val();
      var price = $('.order_price').find('span').text();

      if ($button.hasClass('quantity-plus')) {
        if(oldValue < 99) {
          var newVal = parseFloat(oldValue) + 1;
        } else {
          var newVal = 99;
        }
      } else {
       // Don't allow decrementing below zero
        if (oldValue > 1) {
          var newVal = parseFloat(oldValue) - 1;
        } else {
          newVal = 1;
        }
      }

      $button.parent().find("input").val(newVal);
      $('.order_full-price').find('span').text((price * $('.tabletki_quantity-input').val()).toFixed(2))
    });

    $(".modal-reserve_tel-input").on("keyup", function() {
      $(this).css('border-color', '#30654c');
    });

    $(".modal-reserve_tel-input").on("focusout", function() {
      if(!$(this).css('border-color', '#ccc')) {
        $(this).css('border-color', '#ccc');
      }
    });

    $(".modal-reserve_tel-input").on("focus hover", function() {
      $(this).css('border-color', '#30654c');
    });

    $('body').on('click','.modal-response_confirm-button' , function(event) {
      if($(this).text() == 'ОК') {
        $('#modal-response').fadeOut();
        $('#modal-reserve').fadeOut();
      } else {
        $('#modal-response').fadeOut();
      }
    });

    $('.tabletki-wrapper, .tabletki-modal').scroll(function() {
      if(!$('.average-price_counter').isOnScreen()) {
        $('#tabletki_scrollup').show();
      } else {
        $('#tabletki_scrollup').hide();
      }
    });

    $('body').on('click', '#tabletki_scrollup', function() {
      if(TABLETKI_INFORMER.view == 'modal') {
        $(".tabletki-modal").animate({ scrollTop: 0 }, 'slow');
      } else {
        $(".tabletki-wrapper").animate({ scrollTop: 0 }, 'slow');
      } 
    });

    // $(".modal-reserve_tel-input").on("blur", function() {
    //     var last = $(this).val().substr( $(this).val().indexOf("-") + 1 );

    //     if( last.length == 3 ) {
    //         var move = $(this).val().substr( $(this).val().indexOf("-") - 1, 1 );
    //         var lastfour = move + last;
    //         var first = $(this).val().substr( 0, 9 );

    //         $(this).val( first + '-' + lastfour );
    //     }
    // });

    /************
      FUNCTIONS
    ************/

    /* Customizing informer by options */

    function checkOptions() {
      if(TABLETKI_INFORMER.averagePrice === 'hide') {
        $('.tabletki_average-price').hide();
      }

      if(TABLETKI_INFORMER.image === 'false') {
        $('.tabletki-product_image').hide();
        $('.tabletki-product_image').find('img').attr('src', '');
      } else if(TABLETKI_INFORMER.image === 'true') {
        $('.tabletki-product_image').find('img').attr('src', 'https://tabletki.ua/article/i4/generator//assets/img/logo.png');
      }

      if(TABLETKI_INFORMER.pharmCount === 'hide') {
        $('.tabletki-ask').hide();
      }
    }

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
      var hash    = TABLETKI_INFORMER.hash,
          product = window.location.hash.replace('-',' ').split(' ')[1];

      if(window.location.hash.indexOf(hash + '-') > -1 && window.location.hash !== "") {
        loadingAnimation();
        $('.tabletki-product_image').hide();

        if(product !== productName) {
          productName = product;
          jsonUrl = domen + "api/widget/v2/getpharmacy/?q=" + product;
          loadAPI();
        }

        jqxhr.complete(function() {
          if($.fn.remodal) {
            openModalWindow();
          }
        });
      } else if(window.location.hash === hash) {
        loadingAnimation();

        if(productName !== TABLETKI_INFORMER.productName) {
          productName = TABLETKI_INFORMER.productName;
          jsonUrl = domen + "api/widget/v2/getpharmacy/?q=" + TABLETKI_INFORMER.productName;
          loadAPI();
        }
        
        jqxhr.complete(function() {
          if($.fn.remodal) {
            openModalWindow();
          }
        });
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
          $regionIndex = $regions.val(),
          citiesArray  = [];

      $cities.html('<option value="all">Все города</option>');
      if($regionIndex == "all") {
        $cities.attr('disabled', true);
      } else {
        $cities.attr('disabled', false);
        $.each(data.response.rests, function(key, val) { // Filling an array of cities without repeats
          if(val.area == $regionIndex && val.town != 0) {
            if( $.inArray(val.town, citiesArray) == -1 ) {
              citiesArray.push(val.town);
            }
          }
        });
        citiesArray.sort();
        $.each(citiesArray, function(index, value){  // Filling Cities Select
          $cities.append('<option value="' + value + '">' + value + '</option>');
        });
      }
    }

    /* Getting data from API */

    function loadAPI() {
      jqxhr = $.getJSON(jsonUrl, function(data) {

        /* Modal window script upload */
        if(!$.fn.remodal) {
          loadScript(resourcesDomen + 'assets/plugins/remodal/dist/remodal.min.js', hashChangeListener);
        }

        if($("#tabletki-remodal").length) {
          $("#tabletki-remodal").css("visibility", "visible");
        }

        globalData = data;

        $cities.attr('disabled', true);
        $.each(globalData.response.rests, function (key, val) {  // Filling an array of regions without repeats
          if(val.area != 0) {
            if($.inArray(val.area, regionsArray) == -1) {
              regionsArray.push(val.area);
            }
          }
        })
        regionsArray.sort();
        $.each(regionsArray, function(index, value){  // Filling Region Select
          regionOption += '<option value="' + value + '">' + value + '</option>';
        });

        $regions.append(regionOption)
        $('.tabletki-product_name').text(decodeURI(productName));

        if(TABLETKI_INFORMER.view == 'nomodal') {
          createMap();
        }
      });
    }

    /* Creating map */

    function createMap() {
      var mapStyle = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#e1ffce"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]}];;
      
      if(TABLETKI_INFORMER.mapStyle === 'green') {
        mapStyle = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#e1ffce"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]}];
      } else if(TABLETKI_INFORMER.mapStyle === 'classic') {
        mapStyle = [{"featureType":"administrative","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]}];
      } else if(TABLETKI_INFORMER.mapStyle === 'blue_water') {
        mapStyle = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]}];
      } else if(TABLETKI_INFORMER.mapStyle === 'grey') {
        mapStyle = [{"featureType":"all","elementType":"geometry.fill","stylers":[{"weight":"2.00"}]},{"featureType":"all","elementType":"geometry.stroke","stylers":[{"color":"#9c9c9c"}]},{"featureType":"all","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#eeeeee"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#7b7b7b"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#c8d7d4"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#070707"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]}];
      }

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

    /* Creating marker */

    function createMarker(value) {
      var iconUrl = TABLETKI_INFORMER.markerUrl || resourcesDomen + 'assets/img/' + TABLETKI_INFORMER.marker + '.svg';

      var markerIcon = {
        url: iconUrl,
        scaledSize: new google.maps.Size(60, 60)
      };
      var latLng = new google.maps.LatLng(+value.coords[0], +value.coords[1]);
      var markerAnimation = false;
      if(TABLETKI_INFORMER.markerAnimation) markerAnimation = google.maps.Animation.DROP;

      var marker = new google.maps.Marker({
                                          position: latLng,
                                          map: map,
                                          title: value.name,
                                          animation: markerAnimation,
                                          icon: markerIcon
                                        });
      marker.addListener('click', function() {
        map.setZoom(16);
        map.setCenter(marker.getPosition());
      });

      var pharmacyName = value.name,
          pharmacyId   = value.sn,
          address      = value.town + ', ' + value.address,
          phone        = '',
          schedule     = '';
      if(value.phone) {
        phone = '<p class="tooltip_tel"><a href="tel:' + value.phone + '" data-rel="external" target ="_blank">' + value.phone + '</a></p>'
      }
      if(value.schedule) {
        schedule = '<p class="tooltip_schedule">' + value.schedule + '</p>';
      }
      var contentString = '<div class="tabletki-map_tooltip scrollfix"><h3>' + pharmacyName + '</h3><div class="tooltip_contacts tabletki-cf"><p class="tooltip_address">' + address + '</p>' + phone + schedule + '</div><div class="tooltip_pharm-goods">';
      $.each(value.rest, function(k, val) {
        var price        = val.p,
            reservePrice = val.pr,
            productId    = val.c,
            name, producer, discount;

        $.each(globalData.response.pharmacy_goods, function(key, value) {
          if(val.c == value.c) {
            name = value.n;
            producer = value.p;
          }
        });

        if((price > 0) && reservePrice && (price != reservePrice)) {
          discount = ((price * 100 - reservePrice * 100)/100).toFixed(2);
          discount = ('' + discount).split('.');
          discount = discount[0] + '.<span>' + discount[1] + '</span> грн.';
        }

        if(price == -1) {
            price = 'цену уточняйте'
        } else {
            price = price.split('.');
            price = price[0] + '.<span>' + price[1] + '</span> грн.';
        }
        contentString += '<div class="tooltip_pharm-card">' + 
                            '<div class="tooltip_name">' + name + '<br><span>' + producer + '</span></div>' + 
                            '<div class="tooltip_price">' + price + '</div>';

        // if(reservePrice) {
        //   reservePrice = reservePrice.split('.');
        //   reservePrice = reservePrice[0] + '.<span>' + reservePrice[1] + '</span> грн.';

        //   contentString +=    '<div class="tooltip_discount">';
        //   if(discount) contentString += 'Экономия ' + discount;
        //   contentString +=    '</div>' + 
        //                       '<div class="tooltip_reserve"><button class="tabletki-btn modal-reserve_open-button" data-pharmacy="' + pharmacyName + '" data-pharmacy-id="' + pharmacyId + '" data-address="' + address + '" data-name="' + name + '" data-product-id="' + productId + '" data-price="' + val.pr + '" data-discount="' + discount + '">Резерв</button></div>' + 
        //                     '<div class="tooltip_reserve-price">' + reservePrice + '</div>';
        // }
        
        contentString += '</div>';
      });
      contentString += '</div></div>';

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
        var $regionsVal       = $regions.val(),
            $citiesVal        = $cities.val(),
            count             = 0,
            price             = 0,
            counterPriced     = 0,
            averagePriceBlock = '',
            pharmCountBlock   = '';

      $.each(data.response.rests, function(key, value) {
        if($regionsVal == 'all') {
          var newMarker = createMarker(value)
          markers.push(newMarker)
          $.each(value.rest, function(k, val) {
            var num = val.p.replace(',', '.');
            if(!isNaN(num)) {
              price += +num;
              counterPriced += 1;
            }
          })
          count += 1;
        } else if($citiesVal == "all") {
          if(value.area == $regionsVal) {
            var newMarker = createMarker(value)
            markers.push(newMarker)
            $.each(value.rest, function(k, val) {
              var num = val.p.replace(',', '.');
              if(!isNaN(num)) {
                price += +num;
                counterPriced += 1;
              }
            })
            count += 1;
          }
        } else if(($regionsVal != 'all') && ($citiesVal != 'all')) {
          if((value.area == $regionsVal) && (value.town == $citiesVal)) {
            var newMarker = createMarker(value)
            markers.push(newMarker)
            $.each(value.rest, function(k, val) {
              var num = val.p.replace(',', '.');
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

      if(price > 0) {
        price = price.toFixed(2).split('.');
        price = price[0] + '.<span>' + price[1] + '</span> грн.';
        averagePriceBlock += '<p>Средняя цена:</p>' + 
                        '<p class="tabletki-counter average-price_counter">' + price + '</p>';
        if($('.average-price_counter').length) {
          $('.average-price_counter').empty();
          $('.average-price_counter').append(price);
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
          url: resourcesDomen + 'assets/img/cluster1.svg',
          height: 41,
          width: 41,
          textColor: '#00a26c',
          textSize: 16
      }, {
          url: resourcesDomen + 'assets/img/cluster2.svg',
          height: 48,
          width: 48,
          textColor: '#00a26c',
          textSize: 14
      }, {
          url: resourcesDomen + 'assets/img/cluster3.svg',
          width: 58,
          height: 58,
          textColor: '#00a26c',
          textSize: 14
      }, {
          url: resourcesDomen + 'assets/img/cluster4.svg',
          height: 70,
          width: 70,
          textColor: '#00a26c',
          textSize: 14
      }, {
          url: resourcesDomen + 'assets/img/cluster5.svg',
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

    /* Display pharmacies in the list */

    function listPopulate(data) {
      var $table       = $('.tabletki_product-table'),
          $cityId      = $cities.val(),
          $regionId    = $regions.val(),
          pharmacy     = '';

      $('.tabletki_product-list').empty() // Clearing old data

      $.each(data.response.rests, function(key, val) {
        var town           = val.town,
            //townsection = val.pharmacy_townsection,
            pharmacyName   = val.name,
            pharmacyId     = val.sn,
            address        = town + ', ' + val.address 
            phoneNumber    = '',
            itemInfo       = '',
            textBlock      = '',
            schedule       = '',
            openedOrClosed = '';

        // if(townsection != '') {
        //   town += ", " + townsection + " район";
        // }

        if (val.phone != '') {
          phoneNumber += '<p class="pharm-card_tel">Тел: <a href="tel:' + val.phone + '" data-rel="external" target ="_blank">' + val.phone + '</a></p>';
        }
        if(val.schedule) {
          if(val.open == 1) {
            openedOrClosed = '<span class="schedule_opened">Открыто</span>'
          } else {
            openedOrClosed = '<span class="schedule_closed">Закрыто</span>'
          }
          schedule = '<p class="pharm-card_schedule">График работы: ' + val.schedule + openedOrClosed + '</p>';
        }

        $.each(val.rest, function(key, val) {
          var price        = val.p,
              reservePrice = val.pr,
              productId    = val.c,
              discount, name, producer;

          if((price != -1) && reservePrice && (reservePrice != price)) {
            discount = ((price * 100 - reservePrice * 100)/100).toFixed(2);
            discount = ('' + discount).split('.');
            discount = discount[0] + '.<span>' + discount[1] + '</span> грн.';
          }

          if(price != -1) {
            price = price.split('.');
            price = price[0] + '.<span>' + price[1] + '</span> грн.';
          } else {
            price = 'цену уточняйте'
          }

          $.each(globalData.response.pharmacy_goods, function(key, value) {
            if(val.c == value.c) {
              name = value.n;
              producer = value.p
            }
          });

          itemInfo += '<div class="pharm-card_product">' + 
                        '<div class="pharm-card_product-info">' + name + '<br><span>' + producer + '</span></div>' + 
                        '<div class="pharm-card_product-price">' + price + '</div>';


        // if(reservePrice) {
        //   reservePrice = reservePrice.split('.');
        //   reservePrice = reservePrice[0] + '.<span>' + reservePrice[1] + '</span> грн.';

        //   itemInfo +=    '<div class="pharm-card_discount">';
        //   if(discount) itemInfo += 'Экономия ' + discount;
        //   itemInfo +=    '</div>' + 
        //                     '<div class="pharm-card_reserve"><button class="tabletki-btn modal-reserve_open-button" data-pharmacy="' + pharmacyName + '" data-pharmacy-id="' + pharmacyId + '" data-address="' + address + '" data-name="' + name + '" data-product-id="' + productId + '" data-price="' + val.pr + '" data-discount="' + discount + '">Резерв</button></div>' + 
        //                     '<div class="pharm-card_reserve-price">' + reservePrice + '</div>';
        // }

          itemInfo +=  '</div>';
        });

        if($regionId == "all") {      // If chosen all regions

          textBlock += '<div class="tabletki-list_pharm-card">' + 
                        '<h3>' + pharmacyName + '</h3>' + 
                        '<div class="pharm-card_info">' + 
                          phoneNumber + 
                          '<p class="pharm-card_address">Адрес: ' + address + '</p>' + 
                          schedule + 
                        '</div>' +
                         itemInfo + 
                        '</div>';

          pharmacy  += textBlock;

        } else if($cityId == "all") {      // If chosen all cities of one region

          if(val.area == $regionId) {
          textBlock += '<div class="tabletki-list_pharm-card">' + 
                        '<h3>' + val.name + '</h3>' + 
                        '<div class="pharm-card_info">' + 
                          phoneNumber + 
                          '<p class="pharm-card_address">Адрес: ' + town + ', ' + val.address + '</p>' + 
                          schedule + 
                        '</div>' +
                         itemInfo + 
                        '</div>';

          pharmacy  += textBlock;
          }

        } else if(($regionId != "all") && ($cityId != "all")) {     // If chosen region and city

          if (val.town == $cityId) {
          textBlock += '<div class="tabletki-list_pharm-card">' + 
                        '<h3>' + val.name + '</h3>' + 
                        '<div class="pharm-card_info">' + 
                          phoneNumber + 
                          '<p class="pharm-card_address">Адрес: ' + town + ', ' + val.address + '</p>' + 
                          schedule + 
                        '</div>' +
                         itemInfo + 
                        '</div>';

          pharmacy  += textBlock;
          }
        }
      });

      $('.tabletki_product-list').append(pharmacy);
    }

    /* Count quantity of pharmacies and inserting result to html */

    function recountPharmacies() {
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

    /* Modal reserve filling with data */

    function modalReserveData(target) {
      var price = $(target).attr('data-price'),
          qty   = $('.tabletki_quantity-input').val();

      $('.modal-reserve_pharmacy-name').text('Аптека: ' + $(target).attr('data-pharmacy')).attr('data-pharmacy-id', $(target).attr('data-pharmacy-id'));
      $('.modal-reserve_pharmacy-address').text('Адрес: ' + $(target).attr('data-address'));
      $('.modal-reserve_medicine').text($(target).attr('data-name')).attr('data-product-id', $(target).attr('data-product-id'));;
      $('.order_price').find('span').text($(target).attr('data-price'));
      $('.order_full-price').find('span').text((price * qty).toFixed(2));
    }

    /* Modal reserve clear data */

    function modalReserveEmptyData() {
      $('.modal-reserve_pharmacy-name').text('');
      $('.modal-reserve_pharmacy-name').attr('data-pharmacy-id', '');
      $('.modal-reserve_pharmacy-address').text('');
      $('.modal-reserve_medicine').text('');
      $('.modal-reserve_medicine').attr('data-product-id', '');
      $('.order_price').text('');
      $('.order_full-price').text('');
      $('.tabletki_quantity-input').val('1');
    }

    /* Browser geoposition */

    function geoPosition(position) {
      var latitude  = position.coords.latitude,
          longitude = position.coords.longitude,
          image     = resourcesDomen + 'assets/img/mark.png';

      var myPos = new google.maps.Marker({
                    position: {lat: latitude, lng: longitude},
                    map: map,
                    icon: image
                  });

      map.setCenter(new google.maps.LatLng(latitude, longitude));
      map.setZoom(14);
    }

    /* CSS loading animation block */

    function loadingAnimation() {
      var div = '<div class="tabletki-loading"></div>';
      $('body').append(div);
    }

    /* Check if the element is in viewport */

    $.fn.isOnScreen = function() {
      var win = $(window);

      var viewport = {
          top : win.scrollTop(),
          left : win.scrollLeft()
      };
      viewport.right = viewport.left + win.width();
      viewport.bottom = viewport.top + win.height();

      var bounds = this.offset();
      bounds.right = bounds.left + this.outerWidth();
      bounds.bottom = bounds.top + this.outerHeight();

      return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
    };

    /* Base64 encode */

    function S4() {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
    }
  };

  /* Create modal window html */

  var createHTML = () => {
    var modalContent   = document.createElement('div'),  
        nomodalContent = document.createElement('div'),
        html           = '';  

    var modalCloseBtn = '<div class="tabletki-modal_close">' + 
                          '<a class="tabletki-modal_closeBtn" id="tabletki-modal_closeBtn">Вернуться</a>' + 
                          '<div class="tabletki_map-or-list">' + 
                            '<input type="radio" class="map-or-list" id="radio-map" name="map-or-list" checked>' + 
                            '<label  class="map-or-list_off" for="radio-map">Карта</label>' + 
                            '<input type="radio" class="map-or-list" id="radio-list" name="map-or-list">' + 
                            '<label class="map-or-list_on" for="radio-list">Список</label>' + 
                          '</div>' + 
                        '</div>';

    var mapOrList = '<div class="tabletki-content_block tabletki-cf" style="padding: 0 0 10px;">' +
                      '<div class="tabletki_map-or-list">' + 
                        '<input type="radio" class="map-or-list" id="radio-map" name="map-or-list" checked>' + 
                        '<label  class="map-or-list_off" for="radio-map">Карта</label>' + 
                        '<input type="radio" class="map-or-list" id="radio-list" name="map-or-list">' + 
                        '<label class="map-or-list_on" for="radio-list">Список</label>' + 
                      '</div>' + 
                    '</div>';

    modalContent.setAttribute("style", "visibility: hidden");
    modalContent.setAttribute("class", "remodal tabletki-modal");
    modalContent.setAttribute("id", "tabletki-remodal");
    modalContent.setAttribute("data-remodal-id", "modal");
    modalContent.setAttribute("data-remodal-options", "hashTracking: false, closeOnEscape: false, closeOnOutsideClick: false");

    nomodalContent.setAttribute("class", "tabletki-wrapper");
    nomodalContent.setAttribute("style", "visibility: hidden");


   
    html += '<div class="tabletki-content">' + 
              '<div class="tabletki_left-column">' + 
                '<div class="left-column_content">';

    if(TABLETKI_INFORMER.view === 'modal') {
      html += modalCloseBtn;
    } else {
      html += mapOrList;
    }

    html +=       '<div class="tabletki-content_block tabletki-product">' + 
                    '<div class="tabletki-product_image">' + 
                      '<img src="' + TABLETKI_INFORMER.image + '" alt="' + TABLETKI_INFORMER.productName + '">' + 
                    '</div>' + 
                    '<p class="tabletki-product_name"></p>' + 
                    '<div class="tabletki_average-price">' + 
                    '</div>' + 
                  '</div>' + 
                  '<div class="tabletki-content_block tabletki-ask">' + 
                  '</div>' + 
                  '<div class="tabletki-content_block tabletki-geoposition">' + 
                    '<button class="tabletki-geoposition-button js-find-nearby-button">Найти рядом со мной</button>' + 
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
                '<div class="tabletki_product-list">' + 
                '</div>' + 
              '</div>' + 
            '</div>' + 
            '<div class="modal-reserve" id="modal-reserve">' + 
              '<div class="modal_body modal-reserve_body js-modal-reserve_body">' + 
                '<button class="modal_close modal-reserve_close"></button>' + 
                '<h3>Резерв товара</h3>' + 
                '<p class="modal-reserve_pharmacy-name"></p>' +
                '<p class="modal-reserve_pharmacy-address"></p>' +
                '<p class="modal-reserve_medicine"></p>' +
                '<div class="modal-reserve_order">' + 
                  '<div class="order_price">Цена: <span></span> грн.</div>' +
                  '<div class="order_quantity">Количество: ' +
                    '<button class="tabletki_quantity-btn quantity-minus">-</button>' +
                    '<input type="text" class="tabletki_quantity-input" value="1" readonly>' +
                    '<button class="tabletki_quantity-btn quantity-plus">+</button>' +
                  '</div>' +
                  '<div class="order_full-price">К оплате: <span></span> грн.</div>' + 
                '</div>' +
                '<div class="modal-reserve_tel">Введите контактный телефон: ' +
                  '<input type="tel" class="modal-reserve_tel-input">' + 
                  '<div class="modal-reserve_warning-tip">Номер телефона не введен корректно!</div>' + 
                '</div>' +
                '<div class="modal-reserve_bottom-buttons">' + 
                  '<button class="tabletki-btn modal-reserve_close-button" style="margin-right: 10px;">Отменить</button>' +
                  '<button class="tabletki-btn modal-reserve_confirm-button">Подтвердить</button>' +
                '</div>' +
              '</div>' + 
            '</div>' + 
            '<div class="modal-response" id="modal-response">' + 
              '<div class="modal_body modal-response_body">' + 
                '<h3></h3>' + 
                '<button class="tabletki-btn modal-response_confirm-button"></button>' +
              '</div>' + 
            '</div>' + 
            '<div class="modal-geoposition" id="modal-geoposition">' + 
              '<div class="modal_body modal-geoposition_body js-modal-geoposition_body">' + 
                '<button class="modal_close js-modal-geoposition_close"></button>' +
                '<h4>Укажите свой адрес</h4>' + 
                '<p>' + 
                  '<input id="modal-geoposition_address-input" type="text" maxlength="400" autocomplete="off" autocorrect="off" class="form-control" placeholder="улица, метро">' +
                '</p>' + 
                '<button class="tabletki-btn modal-geoposition_define-location js-define-location">Определить автоматически</button>' +
              '</div>' + 
            '</div>' + 
            '<div id="tabletki_scrollup"></div>';

    if(TABLETKI_INFORMER.view === 'modal') {
      modalContent.innerHTML += html;
      document.body.appendChild(modalContent);
      document.getElementById('tabletki_scrollup').style.position = 'fixed';
    } else if(TABLETKI_INFORMER.view === 'nomodal') {
      nomodalContent.innerHTML += html;
      document.getElementById('tabletki-informer').appendChild(nomodalContent);
    }
  }


  document.addEventListener('DOMContentLoaded', () => {
    //document.getElementById('tabletki-modalButton').setAttribute('data-remodal-target', 'modal');
    /* Load Styles */
    loadCSS(resourcesDomen + 'assets/plugins/remodal/dist/remodal.css');
    loadCSS(resourcesDomen + 'assets/plugins/remodal/dist/remodal-default-theme.css');
    loadCSS(resourcesDomen + 'css/app.css', function() {
      if(document.body.contains(document.querySelector('.tabletki-wrapper'))) {
        document.querySelector('.tabletki-wrapper').style.visibility = "visible";
      }
    });
    /* Google maps script */
    loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyD6UFeu-Ookcm7KyBJW0bnHhlGmvkYp2b4&libraries=places");
    /* Google maps clusters script */
    loadScript(resourcesDomen + 'assets/js/markerclusterer.js');
    jqueryCheck();
  });
})();