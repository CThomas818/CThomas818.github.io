"use strict";
exports.__esModule = true;
var marker_1 = require("./marker");
/*
Creates the google map and gets all the locations of the markers and puts them into an array: locations_array
The function also adds a listener to the map to place_marker() on a click.
*/
var markers = [];
var locations_array = new Array();
function initMap() {
    //Getting the locations from the API as JSON, then pushing each location to an array.
    $.getJSON("https://radiant-mesa-71731.herokuapp.com/locations", function (data) {
        $.each(data, function (i, obj) {
            var markerObj = new marker_1.Marker(obj.name, obj.content, obj.latitude, obj.longitude, obj._id);
            locations_array.push(markerObj);
        });
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: new google.maps.LatLng(48.435243, -123.367508)
        });
        google.maps.event.addListener(map, 'click', function (event) {
            place_marker(event.latLng, locations_array, map);
            console.log(typeof event);
        });
        pull_markers(locations_array, map);
        $('.spinner').remove();
    });
}
function removeMarker(marker) {
    marker.setMap(null);
}
//This function pulls each marker onto the map from the locations_array.
function pull_markers(locations_array, map) {
    var infowindow = new google.maps.InfoWindow;
    var marker, i;
    //Placing the markers
    for (i = 0; i < locations_array.length; i++) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations_array[i].latitude, locations_array[i].longitude),
            map: map
        });
        markers.push(marker);
        var markerObj = locations_array[i];
        //Setting the google maps infowindow (appears when clicked) of the marker based on the index of the array, i.
        google.maps.event.addListener(marker, 'click', (function (infowindow, markerObj, marker) {
            return function () {
                var content_string = markerObj.create_content();
                infowindow.open(map, marker);
                infowindow.setContent(content_string);
                markerObj.add_listeners(infowindow, marker);
            };
        })(infowindow, markerObj, marker));
    }
}
//Places a marker with the specified location (latitude and longitude) onto the map.
function place_marker(location, locations_array, map) {
    var infowindow = new google.maps.InfoWindow;
    console.log(typeof infowindow);
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    //Default marker content.
    $.ajax({
        url: "https://radiant-mesa-71731.herokuapp.com/locations/",
        type: "POST",
        data: { name: "New Place", latitude: location.lat(), longitude: location.lng(), content: "Write about your memories here!" },
        success: function (result) {
            markers.push(marker);
            marker.setMap(map);
            var markerObj = new marker_1.Marker(result.name, result.content, result.latitude, result.longitude, result._id);
            locations_array.push(markerObj);
            google.maps.event.addListener(marker, 'click', (function (infowindow, content_string, marker) {
                return function () {
                    var content_string = markerObj.create_content();
                    infowindow.open(map, marker);
                    infowindow.setContent(content_string);
                    markerObj.add_listeners(infowindow, marker);
                };
            })(infowindow, markerObj, marker));
        }
    });
}
//Simple function to reload the page - reflects changes in the database.
function refresh_page(map) {
    location.reload();
}
