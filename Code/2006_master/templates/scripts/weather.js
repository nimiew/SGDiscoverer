/*
  input: nil
  output: nil
  desc: function to get weather data from API
*/
function getWeatherData(){
  $.ajax({
    type: "GET",
    dataType: "json",
		data: {},
    url: "https://api.data.gov.sg/v1/environment/2-hour-weather-forecast",
		complete: function(xhr, status) {},
    success: function(data, status, xhr){
			console.log(data);
			//get data, create markers
			let lat, lng, latlng, name, forecast;
		  for (let i=0; i<data["area_metadata"].length; i++){
		    lat = parseFloat(data["area_metadata"][i]['label_location']['latitude']);
				lng = parseFloat(data["area_metadata"][i]['label_location']['longitude']);
				name = data["area_metadata"][i]['name'];
				forecast = name + ": " + data['items'][0]['forecasts'][i]['forecast'];

				latlng = new google.maps.LatLng(lat, lng);

				addMarker(map.markers.weather, createMarker(forecast, latlng, weatherdot));
		  }
    }
  });
};

/*
  input: nil
  output: nil
  desc: function to put weather data into table form
*/
function putWeatherIntoTable(){
  $.ajax({
    type: "GET",
    dataType: "json",
		data: {},
    url: "https://api.data.gov.sg/v1/environment/2-hour-weather-forecast",
		complete: function(xhr, status) {},
    success: function(data, status, xhr){
      for (let i=0; i<5; i++){
        var w = document.getElementById('w1');
        var forecast = document.createElement('td');
        var name = data["area_metadata"][i]['name'];
        forecast.textContent =  name +": "+ data['items'][0]['forecasts'][i]['forecast'];
        w.appendChild(forecast);
		  }
      for (i=5; i<10; i++){
        w = document.getElementById('w2');
        forecast = document.createElement('td');
        name = data["area_metadata"][i]['name'];
        forecast.textContent =  name + ": "  + data['items'][0]['forecasts'][i]['forecast'];
        w.appendChild(forecast);
		  }
      for (i=10; i<15; i++){
        w = document.getElementById('w3');
        forecast = document.createElement('td');
        name = data["area_metadata"][i]['name'];
        forecast.textContent =  name +  ": " + data['items'][0]['forecasts'][i]['forecast'];
        w.appendChild(forecast);
      }
      for (i=15; i<20; i++){
        w = document.getElementById('w4');
        forecast = document.createElement('td');
        name = data["area_metadata"][i]['name'];
        forecast.textContent =  name + ": "  + data['items'][0]['forecasts'][i]['forecast'];
        w.appendChild(forecast);
      }
      for (i=20; i<25; i++){
        w = document.getElementById('w5');
        forecast = document.createElement('td');
        name = data["area_metadata"][i]['name'];
        forecast.textContent =  name + ": "  + data['items'][0]['forecasts'][i]['forecast'];
        w.appendChild(forecast);
      }
      for (i=25; i<30; i++){
        w = document.getElementById('w6');
        forecast = document.createElement('td');
        name = data["area_metadata"][i]['name'];
        forecast.textContent =  name + ": "  + data['items'][0]['forecasts'][i]['forecast'];
        w.appendChild(forecast);
      }
      for (i=30; i<35; i++){
        w = document.getElementById('w7');
        forecast = document.createElement('td');
        name = data["area_metadata"][i]['name'];
        forecast.textContent =  name + ": "  + data['items'][0]['forecasts'][i]['forecast'];
        w.appendChild(forecast);
      }
      for (i=35; i<40; i++){
        w = document.getElementById('w8');
        forecast = document.createElement('td');
        name = data["area_metadata"][i]['name'];
        forecast.textContent =  name + ": "  + data['items'][0]['forecasts'][i]['forecast'];
        w.appendChild(forecast);
      }
      for (i=40; i<45; i++){
        w = document.getElementById('w9');
        forecast = document.createElement('td');
        name = data["area_metadata"][i]['name'];
        forecast.textContent =  name + ": "  + data['items'][0]['forecasts'][i]['forecast'];
        w.appendChild(forecast);
      }
      for (i=45; i<47; i++){
        w = document.getElementById('w10');
        forecast = document.createElement('td');
        name = data["area_metadata"][i]['name'];
        forecast.textContent =  name + ": "  + data['items'][0]['forecasts'][i]['forecast'];
        w.appendChild(forecast);
      }
    }
  });
};
