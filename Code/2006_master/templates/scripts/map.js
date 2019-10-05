var infowindow;
var map;
var reddot = {url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"};
var bluedot = {url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"};
var yellowdot = {url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"};
var pinkdot = {url: "https://maps.google.com/mapfiles/ms/icons/pink-dot.png"};
var weatherdot = {url: "http://maps.google.com/mapfiles/ms/micons/rainy.png"};

var all_districts = ['Admiralty', 'Alexandra Road', 'Ang Mo Kio', 'Anson', 'Balestier', 'Balmoral', 'Bayshore', 'Beach Road', 'Bedok', 'Bencoolen Road', 'Bishan', 'Boat Quay', 'Boon Lay', 'Boulevard', 'Braddell Road', 'Bugis', 'Bukit Batok', 'Bukit Timah', 'Buona Vista', 'Cairnhill', 'Chai Chee', 'Chancery', 'Changi', 'Chinatown', 'Choa Chu Kang', 'City Hall', 'Clementi', 'Dover', 'Dunearn Road', 'Eunos', 'Farrer Park', 'Geylang', 'Grange Road', 'Havelock Road', 'High Street', 'Hillview Avenue', 'Holland Road', 'Hougang', 'Hume Avenue', 'Jurong', 'Katong', 'Kembangan', 'Keppel', 'Killiney', 'Kranji', 'Leonie Hill', 'Lim Chu Kang', 'Little India', 'Loyang', 'Macpherson', 'Marina Square', 'Marine Parade', 'Moulmein', 'Mount Faber', 'Neil Road', 'Newton', 'North Bridge Road', 'Novena', 'Orchard', 'Oxley', 'Pasir Panjang', 'Pasir Ris', 'Paya Lebar', 'Potong Pasir', 'Punggol', 'Queenstown', 'Raffles Place', 'River Valley', 'Rochor', 'Seletar', 'Sembawang', 'Sengkang', 'Sentosa', 'Serangoon Road', 'Shenton Way', 'Siglap', 'Simei', 'Sungei Gedong', 'Suntec City', 'Tagore', 'Tampines', 'Tanglin Road', 'Tanjong Pagar', 'Tanjong Rhu', 'Telok Blangah', 'Tengah', 'Thomson', 'Tiong Bahru', 'Toa Payoh', 'Tuas', 'Upper Bukit Timah', 'West Coast', 'Woodlands', 'Yio Chu Kang', 'Yishun'];

/*
  input: nil
  output: nil
  desc: function to initialise map with proper settings
*/
function initMap(){
  const sg_center = new google.maps.LatLng(1.3521, 103.8198);
  const options={
    zoom: 11,
    center: sg_center,
  };

  //initialise the map
  map = new google.maps.Map(document.getElementById("map"),options);

  const currentUrl = new URLSearchParams(window.location.search);
  console.log(currentUrl);
  const selected = (currentUrl.get("selected")) ? currentUrl.get("selected"):'';
  const favselected = (currentUrl.get("favselected")) ? currentUrl.get("favselected"): '';

  map.markers = {};

  //only if user initialising map for the first time/re-initialising
  if (!selected){
    //input weather data to map
    map.markers.weather = [];
    getWeatherData();
    console.log("weather data from Weather.js:");
    console.log(map.markers.weather);
  }
  else {
    //else just hide the weather box
    document.getElementById("weatherbox").parentElement.style.display = "none";
    document.getElementById("discountbox").parentElement.style.display = "none";
  }

  //create arrays to store data tagged to the map
  map.markers.discount = [];
  map.markers.nearby = [];
  map.markers.favourite = [];
  map.nearbymarkerinfo; //store marker info
  map.currentPOIurl = '';

  //get discount deals
  $.ajax({
    url: "/getdeals",
    method: "GET",
    dataType: "json",
    data: {},
    complete: function(xhr, status) {},
    success: function(data, status, xhr) {
      for (var i=0; i<data.length; i++){
        //if user came here from discount page, show selected marker
        //else, display all
        if (data[i].name === selected || selected === ""){
          var deal = {};

          deal.name = data[i].name;
          deal.enddate = data[i].enddate;
          deal.timeinfo = (data[i].timeinfo)? data[i].timeinfo:'';
          deal.timeinfo = '<br><br>'+deal.timeinfo;
          deal.latlongs = data[i].latlongs;

          let contentString = '<div id="infoview">'+ '<p><b>'+ deal.name + '</b><br>' + 'Until '+ deal.enddate.substring(0, deal.enddate.length-13) + deal.timeinfo + '</p></div>';
          for (var j=0; j<deal.latlongs.length; j++){
            var latlng = new google.maps.LatLng(deal.latlongs[j][0], deal.latlongs[j][1]);
            addMarker(map.markers.discount, createMarker(contentString, latlng, reddot, 'discount'));
          }
        }
      }
    }
  });

  //get favourites
  let username = account_control.getAttribute("data-username")
  let status = account_control.getAttribute("data-status");
  if(status=='connected' && username!=''){
    favourite_urlString = "/getfavourites?username="+username
    $.ajax({
      url: favourite_urlString,
      method: "GET",
      dataType: "json",
      data: {},
      complete: function(xhr, status) {},
      success: function(data, status, xhr) {
        navbardrop = document.getElementById("navbardrop");
        for (let i=0; i<data.length; i++){
          //else, display all
          favourite_name = data[i]['result']['name'];
          favourite_lat = data[i]['result']['geometry']['location']['lat'];
          favourite_lng = data[i]['result']['geometry']['location']['lng'];
          favourite_rating = data[i]['result']['rating']
          favourite_address = data[i]['result']['formatted_address']
          favourite_type = data[i]['result']['types'][0]
          var navElement = document.createElement('a');
          navElement.className = "dropdown-item";
          navElement.textContent = favourite_name;
          navElement.setAttribute('href', "/?favselected=" + favourite_name +"#topmap");
          navbardrop.appendChild(navElement);
          if (favourite_name === favselected){
            let contentString = '<div id="infoview">'+
                '<p><b>'+ favourite_name + '</b><br>' +
                '\u2B50 '+ favourite_rating + '<br/>' +
                favourite_address + '<br/>' +
                favourite_type.charAt(0).toUpperCase() + favourite_type.slice(1) +
                '</p></div>';
            var latlng = new google.maps.LatLng(favourite_lat, favourite_lng);
            addMarker(map.markers.favourite, createMarker(contentString, latlng, pinkdot, 'favourite'));
          }
        }
      }
    });
  }
};

/*
  Function that runs when page has loaded
*/
$(document).ready(function() {
  //put weather information into table
   putWeatherIntoTable();

  //make nav bar item active
  $("li").click(function(){
      $(this).addClass("active");
      $(this).siblings().removeClass("active");
  });

  // request for user's permission for location, and move the map to his current location
  const currentUrl = new URLSearchParams(window.location.search);

  //if user has selected a marker to inspect via discount, do not further do map initialisations
  const selected = (currentUrl.get("selected")) ? currentUrl.get("selected"): '';
  const favselected = (currentUrl.get("favselected")) ? currentUrl.get("favselected"): '';

  if (navigator.geolocation){
    document.getElementById("loadtext").innerHTML = "Loading current location..."
    var searchBtn = document.getElementById('search');
    searchBtn.disabled = true;
    navigator.geolocation.getCurrentPosition(function(position) {
      console.log(position);
      map.userLat = position.coords.latitude;
      map.userLng = position.coords.longitude;
      map.userLatLng = new google.maps.LatLng(map.userLat, map.userLng);

      //pin user's location and store globally
      map.userLoc = createMarker("Your Current Position", map.userLatLng, yellowdot);

      var sgViewBounds = {
        'southwest': {
          "lat": map.userLat-0.0013, "lng": map.userLng-0.0015
        },
        'northeast': {
          "lat": map.userLat+0.0013, "lng": map.userLng+0.0015
        }
      }

      //store user's location globally
      map.userLocBounds = new google.maps.LatLngBounds(sgViewBounds.southwest, sgViewBounds.northeast);

      document.getElementById('loadtext').innerHTML = "Current position loaded.";
      searchBtn.disabled = false;

    }, function(error){
      if (error.code === 1) {
        document.getElementById('loadtext').innerHTML = "";
        searchBtn.disabled = false;
      }
    });
  }

  /*
    Function triggered upon pressing "Search" button
  */
  $("#search").click(function() {
    var searchBtn = document.getElementById('search');
    searchBtn.innerHTML = "Loading...";
    searchBtn.disabled = true;

    var searchTerm = $("#searchinput").val();
    if (searchTerm.trim() == ''){
      searchTerm = 'nil';
    }
    $("#searchinput").blur();
    var minstar = minRating();
    var maxdist = maxDistance();
    var type = getType();
    var district = getDistrict();
    if (district !== '' && district!=="selectdistrict"){
      console.log("district is "+district)
      searchTerm = "Singapore " + district;
    }
    console.log("searchTerm is "+searchTerm);
    var urlString = "/viewport?search=" + searchTerm + "&minrating=" + minstar + "&maxdist=" + maxdist + "&userlat=" + map.userLat + "&userlng=" + map.userLng + "&type=" + type;

    //reset to empty arrays
    for (var i=0; i<map.markers.nearby.length; i++){
      map.markers.nearby[i].setMap(null);
    }
    map.markers.nearby = [];
    map.nearbymarkerinfo = [];

    //clear POI list
    clearDisplay();

    //ajax call to get marker info onto page
    $.ajax({
      url: urlString,
      method: "GET",
      dataType: "json",
      data: {},
      complete: function(xhr, status) {},
      success: function(data, status, xhr) {
        console.log(data);
        if (data['results']['nearby'].length == 0){ //no nearby markers found
          document.getElementById('chosen').value = {};
          document.getElementById('loadtext').innerHTML = "No nearby locations found :( <br> Try another category?";
          map.chosen = {};

          map.fitBounds(map.userLocBounds);
        }
        else { //if markers are found
          let bounds = new google.maps.LatLngBounds();
          for (let j=0; j<data.results.nearby.length; j++){
            let contentString = '<div id="infoview">'+
                '<p><b>'+ data.results.nearby[j].name + '</b><br>' +
                '\u2B50 '+ data.results.nearby[j].rating + '<br/>' +
                data.results.nearby[j].address + '<br/>' +
                data.results.nearby[j].type.charAt(0).toUpperCase() + data.results.nearby[j].type.slice(1) +
                '</p></div>';
            let latlng = new google.maps.LatLng(data.results.nearby[j].latlongs[0][0], data.results.nearby[j].latlongs[0][1]);
            addMarker(map.markers.nearby, createMarker(contentString, latlng, bluedot, "poi"));

            //extend bounds
            bounds.extend(map.markers.nearby[j].getPosition());
          }

          document.getElementById('chosen').value = data.results.chosen;
          document.getElementById('bounds').value = bounds;
          map.chosen = data.results.chosen;
          document.getElementById('loadtext').innerHTML = "Locations found!";

          map.fitBounds(bounds);
        }
        document.getElementById('prevloc').value = searchTerm;

        searchBtn.innerHTML = "Search";
        searchBtn.disabled = false;

        map.currentPOIurl = urlString;
        map.nearbymarkerinfo = data['results']['nearby'];

        //initialise POI list
        listDisplay(map.nearbymarkerinfo);
      }
    });
  });

  //if return/enter key is pressed, start search for POIs
  $("#searchinput").on("keydown", function(e) {
    if (e.keyCode == 13){
      $("#search").click();
    }
  });

  $("#listview").click(function() {

  });

  //button stuff
  //stars
  $("#starany").click(function() {
    updateDropdownStar('Any &#11088');
  });
  $("#star5").click(function() {
    updateDropdownStar('5 &#11088');
  });
  $("#star4").click(function() {
    updateDropdownStar('4 &#11088');
  });
  $("#star3").click(function() {
    updateDropdownStar('3 &#11088');
  });
  $("#star2").click(function() {
    updateDropdownStar('2 &#11088');
  });
  $("#star1").click(function() {
    updateDropdownStar('1 &#11088');
  });

  //radius of search
  $("#distanceany").click(function() {
    updateDropdownDist('Any');
  });
  $("#200m").click(function() {
    updateDropdownDist('200');
  });
  $("#400m").click(function() {
    updateDropdownDist('400');
  });
  $("#600m").click(function() {
    updateDropdownDist('600');
  });
  $("#800m").click(function() {
    updateDropdownDist('800');
  });
  $("#1000m").click(function() {
    updateDropdownDist('1000');
  });

  //type of POIs
  $("#typeany").click(function() {
    updateDropdownType('Any');
  });
  $("#food").click(function() {
    updateDropdownType('food');
  });
  $("#parking").click(function() {
    updateDropdownType('parking');
  });
  $("#health").click(function() {
    updateDropdownType('health');
  });
  $("#sports").click(function() {
    updateDropdownType('sports');
  });
  $("#school").click(function() {
    updateDropdownType('school');
  });
  $("#pet").click(function() {
    updateDropdownType('pet');
  });
  $("#beauty").click(function() {
    updateDropdownType('beauty');
  });
  // $("#entertainment").click(function() {
  //   updateDropdownType('entertainment');
  // });
  $("#necessities").click(function() {
    updateDropdownType('necessities');
  });
  $("#ATM").click(function() {
    updateDropdownType('ATM');
  });

  //districts
  for (let i=0; i<all_districts.length; i++){
    //console.log("#"+all_districts[i].split(" ").join(""));
    $("#"+all_districts[i].split(" ").join("")).click(function() {
      updateDropdownDistrict(all_districts[i]);
      $("#searchinput").val('');
      document.getElementById("searchinput").placeholder = '';
      $("#searchinput").focus(function() {
        $("#searchinput").blur();
      });
    });
  }
  $('#selectdistrict').click(function (){
    updateDropdownDistrict('selectdistrict');
    $("#searchinput").unbind('focus');
    document.getElementById("searchinput").placeholder = 'Enter a place to discover or choose a district';
  });
});

/*
  Function to add marker into an array of choice
*/
function addMarker(markerarray, marker){
  markerarray[markerarray.length] = marker;
};

/*
  input: string, google.maps.LatLng, image file, string
  output: google.maps.Marker
  desc: function to create a GoogleMaps Marker
*/
function createMarker(string, latlng, pinIcon, type){
  var marker = new google.maps.Marker({
    position: latlng,
    map: map,
    icon: pinIcon
  });

  //add a listener
  google.maps.event.addListener(marker, "click", function(){
    closeCurrentInfoWindow();

    infowindow = new google.maps.InfoWindow();
    return_url = getDirections(map.userLat, map.userLng, [latlng.lat(),latlng.lng()]);
    switch (type){
      case 'discount':
        infowindow.setContent(string + '<br>' + '<a href='+return_url+' target="_blank"'+'>Get Directions</a>');
        break;
      case 'poi':
        infowindow.setContent(string + '<br>' + '<a href='+return_url+' target="_blank"'+'>Get Directions</a>');
        break;
      case 'favourite':
        infowindow.setContent(string + '<br>' + '<a href='+return_url+' target="_blank"'+'>Get Directions</a>');
        break;
      default:
        infowindow.setContent(string + '<br>');
        break;
    }
    infowindow.open(map, marker);
  });
  return marker;
};

/*
  input: float, float, google.maps.LatLng
  output: str (url string)
  desc: function to link user to GoogleMaps for directions to POI
*/
function getDirections(userLat, userLng, latlng){
  if (!map.userLat || !map.userLng){

  }
  //return URL
  lat = latlng[0];
  lng = latlng[1];
  return_url = "https://www.google.com/maps/dir/" + userLat + "," + userLng + "/" + lat + "," + lng;
  console.log(return_url);
  return return_url;
}

/*
  input: array, bool
  output: array
  desc: function to sort array and return an array of indices
        that indicates the position of the sorted elements
        with respect to the original elements
*/
function sortWithIndeces(toSort, reverse) {
  for (var i = 0; i < toSort.length; i++) {
    toSort[i] = [toSort[i], i];
  }
  if(reverse==true){
    toSort.sort(function(left, right) {
      return left[0] > right[0] ? -1 : 1;
    });
  }
  else{
    toSort.sort(function(left, right) {
      return left[0] < right[0] ? -1 : 1;
    });
  }
  toSort.sortIndices = [];
  for (var j = 0; j < toSort.length; j++) {
    toSort.sortIndices.push(toSort[j][1]);
    toSort[j] = toSort[j][0];
  }
  return toSort;
}
