define(['backbone'], function (Backbone) {
  'use strict';

  var MainView = Backbone.View.extend({

    el: 'body',
    foursquareApiUrl: 'https://api.foursquare.com/v2/',
    foursquareOauthToken: 'L3DMOWACH200L0QKG1GK5DVGS1EEFMO5K4ND5WCI3JQ1RZ3I',
    foursquareFoodCategoryId: '4d4b7105d754a06374d81259',
    foursquareCategories: $('#require-js').data('params').foursquareCategories,
    /*foursquareCategories: [
      {name: "Boulangerie",                      id: "4bf58dd8d48988d16a941735"},
      {name: "Brasserie",                        id: "50327c8591d4c4b30a586d5d"},
      {name: "Lieu servant des hamburgers",      id: "4bf58dd8d48988d16c941735"},
      {name: "Restaurant chinois",               id: "4bf58dd8d48988d145941735"},
      {name: "Café-restaurant",                  id: "4bf58dd8d48988d147941735"},
      {name: "Fast-food",                        id: "4bf58dd8d48988d16e941735"},
      {name: "Restaurant français",              id: "4bf58dd8d48988d10c941735"},
      {name: "Restaurant grec",                  id: "4bf58dd8d48988d10e941735"},
      {name: "Restaurant indien",                id: "4bf58dd8d48988d10f941735"},
      {name: "Restaurant japonais",              id: "4bf58dd8d48988d111941735"},
      {name: "Restaurant coréen",                id: "4bf58dd8d48988d113941735"},
      {name: "Pizzeria",                         id: "4bf58dd8d48988d1ca941735"},
      {name: "Sandwicherie",                     id: "4bf58dd8d48988d1c5941735"},
      {name: "Restaurant de fruits de mer",      id: "4bf58dd8d48988d1ce941735"},
      {name: "Snack",                            id: "4bf58dd8d48988d1c7941735"},
      {name: "Restaurant-grill",                 id: "4bf58dd8d48988d1cc941735"},
      {name: "Bar à sushis",                     id: "4bf58dd8d48988d1d2941735"},
      {name: "Bar à tapas",                      id: "4bf58dd8d48988d1db931735"},
      {name: "Restaurant thaïlandais",           id: "4bf58dd8d48988d149941735"},
      {name: "Restaurant turc",                  id: "4f04af1f2fb6e1c99f3db0bb"},
      {name: "Restaurant végétarien/végétalien", id: "4bf58dd8d48988d1d3941735"}
    ],*/
    map: null,

    events: {
      'click .find-venues': 'fireVenuesSearch'
    },

    initialize: function () {
      var self = this;
      if (this.geolocIsAvailable()) {
        navigator.geolocation.getCurrentPosition(function (position) {
          self.renderMap(position);
          self.showCategoryList(self.foursquareCategories);
        });
      } else {
        console.warn('You don\'t have HTML Geolocation API available on this browser.');
      }
    },

    geolocIsAvailable: function () {
      return typeof navigator.geolocation !== 'undefined';
    },

    renderMap: function (position) {
      // User's location
      this.userLatitude = position.coords.latitude;
      this.userLongitude = position.coords.longitude;

      var center = new google.maps.LatLng(this.userLatitude, this.userLongitude);
      var mapOptions = {
        center: center,
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      this.map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
      this.renderUserLocation(center, this.map);
    },

    renderUserLocation: function (position, map) {
      var customMarker = this.customMarker();
      var marker = new google.maps.Marker({
        position: position,
        map: this.map,
        title: 'You are here!',
        icon: customMarker[0],
        shadow: customMarker[1]
      });
    },

    foursquareRequest: function (url, params) {
      var params = params || {};
      params.oauth_token = this.foursquareOauthToken;
      return $.ajax({
        url: this.foursquareApiUrl + url,
        dataType: 'jsonp',
        type: 'get',
        data: params
      });
    },

    fireVenuesSearch: function (e) {
      var choices = []
          self = this;
      $( $(e.currentTarget).parent().find('input:checked') ).each(function (k, v) {
        choices.push($(v).attr('name'));
      });
      choices = choices.join(',');

      var venuesRequest = this.foursquareRequest('venues/search', {
        ll: this.userLatitude + ',' + this.userLongitude,
        intent: 'browse',
        limit: 50,
        radius: 5000, // 5000 meters around user's location
        categoryId: choices
      }).done(function (results) {
        var items = results.response.groups[0].items;
        self.showNearVenues(self.map, items);
      });
    },

    showNearVenues: function (map, items) {
      for(var k in items) {
        var item = items[k];
        var location = item.location;
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(location.lat, location.lng),
          map: map,
          title: item.name
        });
      }
    },

    showCategoryList: function (categories) {
      var inputs = '';
      for(var i in categories) {
        var category = categories[i];
        inputs += '<div class="row-fluid"><label><input type="checkbox" name="' + category.id + '" checked /> ' + category.name + '</label></div>';
      }
      $('.categories').append('<button class="btn find-venues">Find!</button>' + inputs);
    },

    customMarker: function () {
      // User's location marker
      // Credit: http://stackoverflow.com/users/3800/jack-b-nimble
      var pinColor = "37c855";
      var GMaps = google.maps;
      var pinImage = new GMaps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
        new GMaps.Size(21, 34),
        new GMaps.Point(0, 0),
        new GMaps.Point(10, 34)
      );
      var pinShadow = new GMaps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
        new GMaps.Size(40, 37),
        new GMaps.Point(0, 0),
        new GMaps.Point(12, 35)
      );
      return [pinImage, pinShadow];
    }

  });

  return MainView;
});