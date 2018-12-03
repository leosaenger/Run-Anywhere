/*
Dynamically handles user input and passes it to Mapbox for processing.
Creates DataTable each time a request is made that enables user customization of
called routes.
*/

// Remember JSON Data storage
// See: https://jsonbin.io/api-reference
var bin_id;
// Remember selected_routes
var selected_routes;
// Remember if a DataTable exists
var table;

// Dict of colors to iterate through
var colors = [
  '#e74c3c',
  '#3498db',
  '#2980b9',
  '#ff974f',
  '#77c4d3',
  '#ff530d',
  '#a6d3eb',
  '#0078a4',
  '#ea2e49',
  '#e74c3c'
];

// Renders a mapbox map
mapboxgl.accessToken = 'pk.eyJ1IjoibGVvc2FlbmdlciIsImEiOiJjam9wOGVsczkwa2ZzM3FsMWQxdHc2NHZzIn0.2yb_-4yL8nlzA1eEFjDRKw';
const map = new mapboxgl.Map({
    container: 'map', // References container
    style: 'mapbox://styles/leosaenger/cjop8gvrp2yz42ro2xlwzyhhn', // Custom styling
    center: [-71.116404, 42.374346], // Centered on Cambridge by default
    zoom: 13.6 // Zoom
});


// See user's location
map.addControl(new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true
}));
let routeNum = 0;
let layers = [];

/*
Takes in lat and long and draws nearby routes on a mapbox element using those two.
Initializes a DataTable with route data.
*/
function drawRoute(point1, point2)
{
  let eachLayer = [];
  for(let i = 0; i < layers.length; i++)
  {
    console.log(layers[i]);
    for(let j = 0; j < layers[i].length; j++)
    {
      map.setLayoutProperty(layers[i][j], 'visibility', 'none');
    }
  }
  $.getJSON($SCRIPT_ROOT + '/get_routes', {
    lat: point1,
    long: point2,
  }, function(data) {
    var routes_list = data;

    // Initialize a table with the data, using an anonymous function
    (function(){

      // Creates table
      var table = $('#routes_list').DataTable({
        // Make sure to destroy the table if it exists
        destroy: true,
        processing: true,
        // Display buttons
        dom: 'Bfrtip',
        paging: false,
        // Initialize data
        "data": data.data,
        "columns": [
          { "data": "name" },
          { "data": "avg_grade" },
          { "data": "elev_difference" },
          { "data": "distance" },
          // Adds an extra null row to the end
          {
              "targets": -1,
              "data": null,
              "defaultContent": "<button type='button' class='btn btn-secondary'>Add to route builder</button>"
          }
        ],
        buttons: [
            {
                text: 'Initialize Custom Route',
                action: function (e, dt, node, config) {
                    custom_route();
                }
            }
        ]
      });

      // Adds a button to the end of each row
      $('#routes_list tbody').on('click', 'button', function() {
          // Initializes the data stored
          var data = table.row($(this).parents('tr')).data();

          // Stringify JSON to send to server
          var data_str = JSON.stringify(data);

          // If we haven't done so, create a JSON bin
          if (!bin_id) {
            // Creates a JSON bin for our data, as per: https://jsonbin.io/api-reference/
            let req = new XMLHttpRequest();

            // Response handler
            req.onreadystatechange = () => {
              if (req.readyState == XMLHttpRequest.DONE) {
                response = JSON.parse(req.responseText);
                // Save our bin_id for current session
                bin_id = response.id;
                // Alert the user
                alert("1 route stored in route builder");
              }
            };

            // Send data to server
            req.open("POST", "https://api.jsonbin.io/b", true);
            req.setRequestHeader("Content-type", "application/json");
            req.setRequestHeader("secret-key", "$2a$10$h0anNYLQyYyV5eUvvyy7.uDFHPZAM21Gjt7vodG1sp27C.76DhRq.");
            req.setRequestHeader("private", "true");
            req.send(data_str);
          }

          // Else, update our bin to store our data
          else {
            // Creates a JSON bin for our data, as per: https://jsonbin.io/api-reference/
            let req = new XMLHttpRequest();

            // Response handler
            req.onreadystatechange = () => {
              if (req.readyState == XMLHttpRequest.DONE) {
                current_data = JSON.parse(req.responseText);

                // Update our bin to have our new data too
                let req_up = new XMLHttpRequest();

                req_up.onreadystatechange = () => {
                  if (req_up.readyState == XMLHttpRequest.DONE) {
                    // Store our selected routes, for later use
                    selected_routes = JSON.parse(req_up.responseText).data;
                    // Alert user
                    alert(selected_routes.length + " routes stored in route builder");
                  }
                };

                // Concatonates old and new JSON objects
                var jsons = new Array();
                // If there's only one list item, concatonate into a new object like so
                if (current_data.hasOwnProperty('name')) {
                  jsons.push(current_data);
                  jsons.push(data);
                }
                // Else, we have to iterate through the already existing object first
                else {
                  for (var n = 0; n < current_data.length; n++) {
                    jsons.push(current_data[n]);
                  }
                  // Only after that can we add our end data
                  jsons.push(data);
                }
                // Finally, make this something we can handle
                var new_str = JSON.stringify(jsons);

                // Update bin
                req_up.open("PUT", "https://api.jsonbin.io/b/" + bin_id, true);
                req_up.setRequestHeader("Content-type", "application/json");
                req_up.setRequestHeader("secret-key", "$2a$10$h0anNYLQyYyV5eUvvyy7.uDFHPZAM21Gjt7vodG1sp27C.76DhRq.");
                req_up.setRequestHeader("versioning", "false");
                req_up.send(new_str);

              }
            };

            // Send data to server
            req.open("GET", "https://api.jsonbin.io/b/" + bin_id, true);
            req.setRequestHeader("secret-key", "$2a$10$h0anNYLQyYyV5eUvvyy7.uDFHPZAM21Gjt7vodG1sp27C.76DhRq.");
            req.send();
          }
      });

    })();

    // Parse through the data
    for (var i = 0; i < routes_list.data.length; i++) {
      var name = routes_list.data[i].name;
      var avg_grade = routes_list.data[i].avg_grade;
      var elev_difference = routes_list.data[i].elev_difference;
      var distance = routes_list.data[i].distance;
      var coords = []
      for (var j = 0; j < routes_list.data.length; j++) {
        coords.push(routes_list.data[j].points);
      }
      // Keep track of which route we're on
      let id = "route" + routeNum;
      let marker1 = "custom-marker" + routeNum;
      let id2 = "markers" + routeNum;
      // Keep track of start lat and long, for connecting routes
      let lat1 = coords[i][0][0];
      let long1 = coords[i][0][1];
      routeNum++;
      // Map each coordinate set
      map.addLayer({
          "id": id,
          "type": "line",
          "source": {
              "type": "geojson",
              "data": {
                  "type": "Feature",
                  "properties": {},
                  "geometry": {
                      "type": "LineString",
                      "coordinates": coords[i]
                  }
              }
          },
          "layout": {
              "line-join": "round",
              "line-cap": "round"
          },
          "paint": {
              "line-color": colors[i],
              "line-width": 4
          }
      });
      eachLayer.push(id);
      // Set the opacity a bit lower
      map.setPaintProperty(id, 'line-opacity', 70 / 100);
      // If we have more than one route, connect them
      if (i != 0) {
        // Define needed data for connecting
        let len = coords[i].length - 1;
        let lenpast = coords[i-1].length - 1;
        let endlat = coords[i][len][0];
        let endlong = coords[i][len][1];
        let startlat = coords[i-1][lenpast][0];
        let startlong = coords[i-1][lenpast][1];
        let routename = 'routeconnect' + routeNum;
        // Get the connector
        var directionsRequest = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + endlat + ',' + endlong + ';' + startlat + ',' + startlong + '?geometries=geojson&access_token=' + mapboxgl.accessToken;
        // AJAX the route data from mapbox
        $.ajax({
          method: 'GET',
          url: directionsRequest,
        }).done(function(data) {
          // Display the route between each
          var route = data.routes[0].geometry;
          map.addLayer({
            id: routename,
            type: 'line',
            source: {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: route
              }
            },
            paint: {
              'line-width': 2
            }
          });
          eachLayer.push(routename);
        });
      }

      let iconid = "places" + routeNum;

      map.addLayer({
        "id": iconid,
        "type": "symbol",
        "source": {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "properties": {
                        "description": '<h5>' + name + '</h5><p>' +
                                'Elevation Difference: ' + elev_difference + '</p><p>' +
                                'Distance: ' + distance + '</p><p>'+
                                'Average Grade: ' + avg_grade + '</p>',
                        "icon": "marker"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lat1, long1]
                    }
                }]
            }
        },
        "layout": {
            "icon-image": "{icon}-15",
            "icon-allow-overlap": true
        }
      });
      eachLayer.push(iconid);
    map.on('click', iconid, function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', iconid, function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', iconid, function () {
        map.getCanvas().style.cursor = '';
    });
    }
  });
  layers.push(eachLayer);
}


/*
Assuming selected routes have already been loaded on the DataTable, renders
user input and strings together routes that have been selected.
*/
function custom_route()
{
  var routes_list = selected_routes;
  let eachLayer = [];
  for(let i = 0; i < layers.length; i++)
  {
    console.log(layers[i]);
    for(let j = 0; j < layers[i].length; j++)
    {
      map.setLayoutProperty(layers[i][j], 'visibility', 'none');
    }
  }
  // Parse through the data
  for (var i = 0; i < routes_list.length; i++) {
    var name = routes_list[i].name;
    var avg_grade = routes_list[i].avg_grade;
    var elev_difference = routes_list[i].elev_difference;
    var distance = routes_list[i].distance;
    var coords = []
    for (var j = 0; j < routes_list.length; j++) {
      coords.push(routes_list[j].points);
    }
    // Keep track of which route we're on
    let id = "route" + routeNum;
    let marker1 = "custom-marker" + routeNum;
    let id2 = "markers" + routeNum;
    // Keep track of start lat and long, for connecting routes
    let lat1 = coords[i][0][0];
    let long1 = coords[i][0][1];
    routeNum++;
    // Map each coordinate set
    map.addLayer({
        "id": id,
        "type": "line",
        "source": {
            "type": "geojson",
            "data": {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "LineString",
                    "coordinates": coords[i]
                }
            }
        },
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": colors[i],
            "line-width": 4
        }
    });
    eachLayer.push(id);
    // Set the opacity a bit lower
    map.setPaintProperty(id, 'line-opacity', 70 / 100);
    // If we have more than one route, connect them
    if (i != 0) {
      // Define needed data for connecting
      let len = coords[i].length - 1;
      let lenpast = coords[i-1].length - 1;
      let endlat = coords[i][len][0];
      let endlong = coords[i][len][1];
      let startlat = coords[i-1][lenpast][0];
      let startlong = coords[i-1][lenpast][1];
      let routename = 'routeconnect' + routeNum;
      // Get the connector
      var directionsRequest = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + endlat + ',' + endlong + ';' + startlat + ',' + startlong + '?geometries=geojson&access_token=' + mapboxgl.accessToken;
      // AJAX the route data from mapbox
      $.ajax({
        method: 'GET',
        url: directionsRequest,
      }).done(function(data) {
        // Display the route between each
        var route = data.routes[0].geometry;
        map.addLayer({
          id: routename,
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: route
            }
          },
          paint: {
            'line-width': 2
          }
        });
        eachLayer.push(routename);
      });
    }

    let iconid = "places" + routeNum;

    map.addLayer({
      "id": iconid,
      "type": "symbol",
      "source": {
          "type": "geojson",
          "data": {
              "type": "FeatureCollection",
              "features": [{
                  "type": "Feature",
                  "properties": {
                      "description": '<h5>' + name + '</h5><p>' +
                              'Elevation Difference: ' + elev_difference + '</p><p>' +
                              'Distance: ' + distance + '</p><p>'+
                              'Average Grade: ' + avg_grade + '</p>',
                      "icon": "marker"
                  },
                  "geometry": {
                      "type": "Point",
                      "coordinates": [lat1, long1]
                  }
              }]
          }
      },
      "layout": {
          "icon-image": "{icon}-15",
          "icon-allow-overlap": true
      }
    });
    eachLayer.push(iconid);
  map.on('click', iconid, function (e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      var description = e.features[0].properties.description;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(map);
  });

  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', iconid, function () {
      map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', iconid, function () {
      map.getCanvas().style.cursor = '';
  });
  }
layers.push(eachLayer);
}


// Mapbox setup
var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken
});
map.addControl(geocoder);


// After the map style has loaded on the page, add a source layer and default
// styling for a single point.
map.on('load', function() {
    map.addSource('single-point', {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    });
    map.addLayer({
        "id": "point",
        "source": "single-point",
        "type": "circle",
        "paint": {
            "circle-radius": 10,
            "circle-color": "#007cbf"
        }
    });
    // Listen for the `result` event from the MapboxGeocoder that is triggered when a user
    // makes a selection and add a symbol that matches the result.
    let lastGeocode = "";
    geocoder.on('result', function(ev) {
      if(ev.result.center.toString() !== lastGeocode){
        map.getSource('single-point').setData(ev.result.geometry);
        let position = ev.result.geometry.coordinates;
        drawRoute(position[1], position[0]);
      }

      lastGeocode = ev.result.center.toString();
    });
});


// Humanizes Error messages
function humanizeGeolocationErrorMsg(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
    }
}


// By default, finds routes near the user on page load, if given permission
window.onload = function displaylines() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            // Once we have the user's position
            function(position) {
                // Pass to Flask route using AJAX
                drawRoute(position.coords.latitude, position.coords.longitude);
            }, function(error) {
                handleNotifications(map, map.getCenter(), humanizeGeolocationErrorMsg(error));
            }
        )
    } else {
        handleNotifications(map, map.getCenter(), "Your browser doesn't support html5 geolocation");
    }
}

// Handles input from side button
document.getElementById('listing-group').addEventListener('change', function(e) {
    var handler = e.target.id;
    if (e.target.checked && handler === 'showRoutes') {
        console.log("huh");
    }
});
