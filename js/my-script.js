

/*
Creates the google map and gets all the locations of the markers and puts them into an array: locations_array
The function also adds a listener to the map to place_marker() on a click.
*/

var markers = [];

function initMap() {

  var locations_array = new Array();

  //Getting the locations from the API as JSON, then pushing each location to an array.
  $.getJSON("https://radiant-mesa-71731.herokuapp.com/locations", function(data) {
      $.each(data, function(i, obj){
        locations_array.push(obj);
      });


      var map = new google.maps.Map(document.getElementById('map'), {
       zoom: 12,
       center: new google.maps.LatLng(48.435243, -123.367508),
      });

      google.maps.event.addListener(map, 'click', function(event){
        place_marker(event.latLng, locations_array, map);
      });

      
      pull_markers(locations_array, map);
      $('.spinner').remove();


  });


}

function removeMarker(marker){

    marker.setMap(null);

}


//This function pulls each marker onto the map from the locations_array.
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

      //Setting the google maps infowindow (appears when clicked) of the marker based on the index of the array, i.
      google.maps.event.addListener(marker, 'click', (function(marker, i) {
           return function() {
              var location_id = locations_array[i]._id;
              //This function creates the html content of a infowindow based on the locations_array index.
               var content_string = create_content(locations_array, location_id);

               infowindow.setContent(content_string);
               infowindow.open(map, marker);



               //Deleting a marker.
               $('#delete-button').on('click', function(){
                 $.ajax({
                   url: "https://radiant-mesa-71731.herokuapp.com/locations/"+locations_array[i]._id,
                   type: "DELETE",
                   success: function(result){
                     removeMarker(markers[i]);
                   }
                 });
               })
               $('#edit-button').on('click', function(){
                 var form_string = create_form(locations_array, location_id);
                 infowindow.setContent(form_string);

                 //Making a Jquery post for submitting a form to the api, updating the infowindow with new content.
                 $('#myForm').on('submit', function(){
                   $.post($(this).attr('action'), $(this).serialize(), function(response){
                      refresh_page(map);
                   },'json');
                   return false;
                 });

                if(locations_array[i].name != "New Place" || locations_array[i].content != "Write about your memories here!"){
                  $('#name-field').val(locations_array[i].name);
                  $('#content-field').val(locations_array[i].content);
                }



               })

           }
      })(marker, i));

  }
}

//Finds the index of a location in locations_array given the id.
function find_id_index(locations_array, value){

  for(var i = 0; i < locations_array.length; i++) {
         if(locations_array[i]._id === value) {
             return i;
         }

     }
     return -1;

}

//Takes the array of locations and an index int i. Returns a content string for the infowindow of the marker at index i in the locations_array.
function create_content(locations_array, id){

  var location_in_array = find_id_index(locations_array, id);

  var content_string = '<div style="text-align: right;"><i id="edit-button" class="fa fa-pencil" aria-hidden="true" style="cursor: pointer; padding-right: 14px;"></i>' +
    '<i id="delete-button" class="fa fa-trash-o" aria-hidden="true" style="cursor: pointer;"></i></div>' +
    '' +
    '<b>'+locations_array[location_in_array].name+'</b>' +
     '<br><br>' +
     locations_array[location_in_array].content;

  return content_string;
}

function create_form(locations_array, id){

  var location_in_array = find_id_index(locations_array, id);


  var form_string = '<form id="myForm" method="post" action="https://radiant-mesa-71731.herokuapp.com/locations/'+locations_array[location_in_array]._id+'">' +
       '<input id="name-field" type="text" name="name" placeholder = "Where did you visit?">' +
       '<br>' +
       '<textarea id="content-field" type="text" name="content" style="height: 100px; width: 250px" placeholder="Say something about this place!"></textarea>' +
       '<br>' +
       '<input type="submit" value="Submit">' +
     '</form>';

    return form_string;
}


//Places a marker with the specified location (latitude and longitude) onto the map.
function place_marker(location, locations_array, map){

  var infowindow = new google.maps.InfoWindow;

  marker = new google.maps.Marker({
       position: location,
       map: map
  });

  //Default marker content.
  $.ajax({
    url: "https://radiant-mesa-71731.herokuapp.com/locations/",
    type: "POST",
    data: {name: "New Place", latitude: location.lat(), longitude: location.lng(), content: "Write about your memories here!"},
    success: function(result){

      locations_array.push(result);
      markers.push(marker);
      marker.setMap(map);

      google.maps.event.addListener(marker, 'click', (function(marker) {
           return function() {

             //This function creates the html content of a infowindow based on the locations_array index.
              var content_string = create_content(locations_array, result._id);

              infowindow.setContent(content_string);
              infowindow.open(map, marker);

               //Deleting a marker.
               $('#delete-button').on('click', function(){
                 $.ajax({
                   url: "https://radiant-mesa-71731.herokuapp.com/locations/"+result._id,
                   type: "DELETE",
                   success: function(result){
                     removeMarker(marker);
                   }
                 });
               })
               $('#edit-button').on('click', function(){
                 var form_string = create_form(locations_array, result._id);
                 infowindow.setContent(form_string);

                 //Making a Jquery post for submitting a form to the api, updating the infowindow with new content.
                 $('#myForm').on('submit', function(){
                   $.post($(this).attr('action'), $(this).serialize(), function(response){
                      refresh_page(map);
                   },'json');
                   return false;
                 });

               })

           }
      })(marker));

    }
  });

}


//Simple function to reload the page - reflects changes in the database.
function refresh_page(map){
  location.reload();
}
