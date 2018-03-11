import {Marker} from "./marker"

var markers = [];

var locations_array = new Array();

(<any>window).initMap = function() {

  //Getting the locations from the API as JSON, then pushing each location to an array.
  $.getJSON("https://radiant-mesa-71731.herokuapp.com/locations", function(data) {
      $.each(data, function(i, obj){
        var markerObj = new Marker(obj.name, obj.content, obj.latitude, obj.longitude, obj._id);
        locations_array.push(markerObj);
      });
      
      var map = new google.maps.Map(document.getElementById('map'), {
       zoom: 12,
       center: new google.maps.LatLng(48.435243, -123.367508),
      });

      google.maps.event.addListener(map, 'click', function(event){
        place_marker(event.latLng, locations_array, map);
        console.log(typeof event);
      });


      pull_markers(locations_array, map);
      $('.spinner').remove();
  });
}
/**
 * Sets a marker to null, removing it from the google map.
 * 
 * @param {any} marker 
 */
function removeMarker(marker){
    marker.setMap(null);
}


/**
 * This function pulls each marker onto the map from the locations_array.
 * 
 * @param {any} locations_array 
 * @param {any} map 
 */
function pull_markers(locations_array, map){

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
      google.maps.event.addListener(marker, 'click', (function(infowindow,markerObj,marker) {
           return function() {

              var content_string = markerObj.create_content();
              infowindow.open(map, marker);
              infowindow.setContent(content_string);
              markerObj.add_listeners(infowindow,marker);

           }
      })(infowindow,markerObj,marker));

  }
}

/**
 * Places a marker with the specified location (latitude and longitude) onto the map.
 * 
 * @param {any} location 
 * @param {any} locations_array 
 * @param {any} map 
 */
function place_marker(location, locations_array, map){

  var infowindow = new google.maps.InfoWindow;
  console.log(typeof infowindow);

  let marker = new google.maps.Marker({
       position: location,
       map: map
  });

  //Default marker content.
  $.ajax({
    url: "https://radiant-mesa-71731.herokuapp.com/locations/",
    type: "POST",
    data: {name: "New Place", latitude: location.lat(), longitude: location.lng(), content: "Write about your memories here!"},
    success: function(result){

      markers.push(marker);
      marker.setMap(map);

      var markerObj = new Marker(result.name, result.content, result.latitude, result.longitude, result._id);
      locations_array.push(markerObj);


      google.maps.event.addListener(marker, 'click', (function(infowindow,content_string,marker) {
           return function() {

              var content_string = markerObj.create_content();
              infowindow.open(map, marker);
              infowindow.setContent(content_string);
              markerObj.add_listeners(infowindow,marker);

           }
      })(infowindow,markerObj,marker));

    }
  });

}

/**
 * Refreshes the window.
 * 
 * @param {any} map 
 */
function refresh_page(map){
  location.reload();
}
