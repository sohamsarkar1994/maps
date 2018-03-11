// Variable for initializing map
var map;
// Variables for setting map markers
var markers = [];
// Variable for keeping record of maps with data loaded
var mapsLoaded = 0;

// Loading data in maps
locations.forEach(function(value){
  $.ajax({
    url: 'https://api.foursquare.com/v2/venues/search?ll='+value.lat+','+value.lng+'&client_id='+'VSEOIZJCI1UOBSLHKFZJS5HBQODNQSS3UT1RFSUPBTCGWOXA'+'&client_secret='+'T5NQZH15JQ3LFIJCG4P3MWKXSNRIBC0WFDGB5XUARVWHOEW0'+'&v=20180311' + '&m=foursquare',
    datatype: 'json',
    async: true,
    success: function(data) {
      var venues1= data.response.venues[0].location.formattedAddress;
      if(venues1.length > 0){
         value.address = venues1;
         mapsLoaded++;
         call();
      }
      else {
        value.address = "No results";
        mapsLoaded++;
        call();
      }
    },
    error: function(err) {
      value.address = "An error has occured in foursquare api. Please try again later";
      mapsLoaded++;
      call();
    }
  });
function call() {
 if(mapsLoaded === locations.length) {
   initMap();
 }
}
});



// Designing viewmodel
var viewModel = function() {
  this.separate = ko.observable("");
  this.venue = ko.observableArray(locations);
  var i;
  this.separateArray = ko.computed(function() {
    if(this.separate().length>0) {
      var find = [];
      for(var i=0; i<this.venue().length; i++) {
        find.push(this.venue()[i].title);
      }
      var searchvalue = this.separate();
      var searchresults = [];
      for(var index=0;index <find.length;index++) {
        if(find[index].includes(searchvalue)) {
          searchresults.push(find[index]);
          markers[index].setMap(map);
        }
        else {
          markers[index].setMap(null);
        }
      }
     return searchresults;
    }
    else {
      for(var count=0; count<markers.length; count++) {
        markers[count].setMap(map);
      }
      var restore = [];
      for(var newindex=0; newindex<this.venue().length; newindex++) {
        restore.push(this.venue()[newindex].title);
      }
      return restore;
    }
  },this);
};


//Initalizing Map
function initMap() {
if(mapsLoaded === 8) {
  map = new google.maps.Map(document.getElementById("map"),{
    center: {lat : 26.727101, lng: 88.395286},
    zoom: 14,
    styles: styles,
    mapTypeControl: false
  });



var largeInfoWindow = new google.maps.InfoWindow();
var bounds = new google.maps.LatLngBounds();

for(var index=0;index<locations.length;index++) {
   var position = locations[index].location;
   var title = locations[index].title;
   var lat= locations[index].lat;
   var lng= locations[index].lng;
   var address= locations[index].address;
   var marker =  new google.maps.Marker({
     map: map,
     position: {
       lat: lat,
       lng: lng
     },
     lat:lat,
     lng:lng,
     title: title,
     address: address,
     animation: google.maps.Animation.DROP,
     id: index
   });
   markers.push(marker);

 marker.addListener('click',function() {
   populateInfoWindow(this,largeInfoWindow);
 });
 bounds.extend(markers[index].position);
 marker.addListener('click', function() {
   toggleBounce(this);
 });
}
 map.fitBounds(bounds);
 var mapsError = function() {
   $('map').append("<h1>Ar error has occured while loading the map. Please, try again later </h1>");
 }
 ko.applyBindings(viewModel());
}
}

// For displaying information in infowindow
function populateInfoWindow(marker, infowindow) {
  if(infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div> Name: ' + marker.title + '</div>' + '<div> Latitude: '+marker.lat+' </div>' + '<div> Longitude: '+marker.lng+' </div>' + '<div> Address: '+marker.address+' </div>');
    infowindow.open(map, marker);
    infowindow.addListener('closeclick', function() {
      infowindow.setMarker = null;
    });
  }
}

// For bouncing markers
function toggleBounce(marker) {
  if(marker.getAnimation()!== null) {
    marker.setAnimation(null);
  }
  else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
  setTimeout(function() {
    marker.setAnimation(null);
  },1400);
}

// For calling markers from the list elements
function callMarker(selectedplace) {
   var selected = null;
   var largeInfoWindow = new google.maps.InfoWindow();
   for(var i=0; i< locations.length; i++) {
     if(selectedplace == locations[i].title) {
       selected = i;
     }
   }
   markers[selected].setAnimation(google.maps.Animation.BOUNCE);
   setTimeout(function() {
     markers[selected].setAnimation(null);
   },1400);
   for(var indexAt=0;indexAt< locations.length;indexAt++) {
     if(indexAt===selected) {
       populateInfoWindow(markers[selected],largeInfoWindow);
     }
   }
}
