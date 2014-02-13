(function() {
  var script;

  Stripe.setPublishableKey($("#card").data('key'));

  window.STUF = {
    init: function() {
      var $pay;
      $pay = STUF.pay();
      STUF.verify();
      STUF.toggle_payment_method();
      $pay.on('blur, focus, click, change', 'input, textarea', function() {
        return STUF.verify();
      });
      $pay.find('[name*=share]').on('change', function() {
        return STUF.update_price(this);
      });
      $pay.find("input[name=payment_method]").on('blur, focus, click, change', STUF.toggle_payment_method);
      $pay.find("#checkout-button").on('click', function() {
        return $("#payment-credit").trigger('click');
      });
      $pay.on('submit', function() {
        return STUF.delegate_payment();
      });
      if (true || Mapping.init()) {
        window.map = L.mapbox.map('map', 'kjell.map-55a7dkjq', {
          minZoom: 11
        });
        return (window.farms = L.mapbox.markerLayer()).loadURL('/farms.geojson').addTo(map);
      }
    },
    pay: function() {
      return $("#payment");
    },
    pay_with_credit_card: function() {
      return $('[name=payment_method]:checked').val() === 'credit';
    },
    delegate_payment: function() {
      if (this.pay_with_credit_card()) {
        this.stripe_checkout();
        return false;
      } else {
        return STUF.disable();
      }
    },
    price: function() {
      return parseInt($('#cost').val());
    },
    extras_price: function() {
      return $('.extras :checked').data('cost') || 0;
    },
    price_with_extras: function() {
      return this.price() + this.extras_price();
    },
    price_in_cents: function() {
      return parseInt(this.price_with_extras()) * 103;
    },
    stripe_checkout: function() {
      StripeCheckout.open({
        key: $("#card").data('key'),
        amount: this.price_in_cents(),
        name: "Stone's Throw Urban Farm",
        description: "2013 CSA Subscription",
        panelLabel: 'Subscribe for',
        token: STUF.token
      });
      return false;
    },
    token: function(result) {
      var token;
      token = result.id;
      return STUF.pay().append("<input type='hidden' name='stripeToken' value='" + token + "'/>").get(0).submit();
    },
    person_inputs: function() {
      return $(_.difference(this.pay().find("[name^=person]"), this.pay().find(":input")));
    },
    person_valid: function() {
      var inputs;
      inputs = this.person_inputs();
      return _.every(inputs, function(i) {
        return !_.isEmpty($(i).val());
      }) && inputs.is("[name*=share]:checked") && inputs.is("[name*=pickup]:checked");
    },
    clear_errors: function() {
      $('.errors').html('');
      return $("p.status").html("");
    },
    enable: function() {
      return $('[type=submit]').removeAttr("disabled");
    },
    disable: function() {
      return $('[type=submit]').attr("disabled", "disabled");
    },
    verify: function() {
      var person;
      if (person = this.person_valid()) {
        this.enable();
      } else {
        this.disable();
      }
      return person;
    },
    update_price: function(share) {
      var $cost, max, min, price_range, value;
      price_range = (function() {
        switch ($(share).val()) {
          case 'half':
            return [300, 400];
          case 'full':
            return [500, 675];
        }
      })();
      $cost = $('#cost');
      min = price_range[0], max = price_range[1];
      value = $cost.val() || max;
      if (!((min < value && value < max))) {
        value = max;
      }
      $cost.attr({
        min: min,
        max: max,
        value: value
      });
      return $("#cost").parent('dd').find(".note .cost").html("$" + min + "-$" + max);
    },
    toggle_payment_method: function() {
      var $pay, check_or_card;
      $pay = $("[name=payment_method]");
      $pay.nextAll(".note").hide().end().filter(":checked").nextAll(".note").show();
      check_or_card = $pay.filter(':checked').val() === 'credit';
      $("#card").toggle(check_or_card);
      if (typeof GMaps !== "undefined" && GMaps !== null) {
        return $(Mapping.map().getDiv()).css('width', '100%').css('height', '100%');
      }
    },
    resize_background_and_body: function() {
      if ($(document).width() > 1400) {
        $('html').css('background-size', ($(document).width() - 834) / 2);
      }
      return $('body').css('min-height', $(window).height());
    }
  };

  window.Mapping = {
    map: function() {
      if (typeof GMaps === "undefined" || GMaps === null) {
        return false;
      }
      return this._map || (this._map = new GMaps({
        div: '#map',
        lat: 44.951239,
        lng: -93.253683,
        panControl: false,
        zoomControl: false,
        scaleControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true
      }));
    },
    init: function() {
      if (typeof GMaps === "undefined" || GMaps === null) {
        return false;
      }
      this.map();
      this.mark_coords();
      return true;
    },
    coords: function(parent, filter) {
      if (parent == null) {
        parent = 'body';
      }
      if (filter == null) {
        filter = '[data-coords]';
      }
      return _.map($(parent).find('[data-coords]').andSelf().filter(filter), function(e) {
        var _ref;
        return _.map((_ref = $(e).attr('data-coords')) != null ? _ref.split(',') : void 0, function(ll) {
          return parseFloat(ll);
        });
      });
    },
    mark_coords: function(coords) {
      var center, lls, map;
      if (coords == null) {
        coords = this.coords();
      }
      map = this.map();
      map.removeMarkers();
      lls = _.map(coords, function(ll) {
        var lat, lng;
        lat = ll[0], lng = ll[1];
        map.addMarker({
          lat: lat,
          lng: lng
        });
        return new google.maps.LatLng(lat, lng);
      });
      center = _.map(_.zip.apply(this, coords), function(ll) {
        return _.foldl(ll, function(sum, l) {
          return sum + l;
        }) / coords.length;
      });
      map.setCenter(center[0], center[1]);
      map.fitLatLngBounds(lls);
      return coords;
    },
    focus_pickup_locations: function() {
      var address, chosen_pickup, map, _ref, _ref1;
      map = this.map();
      address = (_ref = this.coords('textarea#address')) != null ? _ref[0] : void 0;
      chosen_pickup = (_ref1 = this.coords('#locations', ':checked')) != null ? _ref1[0] : void 0;
      Mapping.mark_coords(this.coords('#signup'));
      if (address && chosen_pickup) {
        return this.route_pickup(address, chosen_pickup);
      }
    },
    route_pickup: function(address, chosen_pickup) {
      this.map().cleanRoute();
      return this.map().drawRoute({
        origin: address,
        destination: chosen_pickup,
        travelMode: 'biking',
        strokeColor: '#131540',
        strokeOpacity: 0.6,
        strokeWeight: 6
      });
    },
    geocode_address: function(e, address) {
      if (address == null) {
        return;
      }
      return GMaps.geocode({
        address: address,
        callback: function(results, status) {
          if (status === 'OK') {
            return $(e).attr('data-coords', results[0].geometry.location.toUrlValue());
          }
        }
      });
    }
  };

  if (typeof jQuery === "undefined" || jQuery === null) {
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '/js/jquery.min.js';
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  $(function() {
    var resizeTimer;
    STUF.init();
    STUF.resize_background_and_body();
    resizeTimer = null;
    return $(window).resize(function() {
      clearTimeout(resizeTimer);
      return resizeTimer = setTimeout(STUF.resize_background_and_body, 100);
    });
  });

  window.reload_js = function() {
    return $('head').append($('<script>').attr({
      src: '/_.js',
      type: 'text/javascript'
    }));
  };

}).call(this);
