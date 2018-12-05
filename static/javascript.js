/*
Dynamically handles user input and passes it to Mapbox for processing.
Creates DataTable each time a request is made that enables user customization of
called routes.
*/

// Avoid memory leaks
'use strict';

// Remember JSON Data storage
// See: https://jsonbin.io/api-reference
let bin_id;
// Remember selected_routes
let selected_routes;

// Dict of different colors to iterate through, for aesthetics
let colors = [
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

// variable to make each ID unique
let routeNum = 0;

// Array that keeps track of the layers being added to the map so the layers can be hidden/shown
let layers = [];

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


/*
Takes in lat and long and draws nearby routes on a mapbox element using those two.
Initializes a DataTable with route data.
*/
function drawRoute(point1, point2)
{
  // Array that contains the layers being added to the map from each drawRoute calle
  // this array is then added to the "layers" array
  let eachLayer = [];

  // Whenever a user searches for routes in a new location it hides the layers that were displayed before
  for (let i = 0; i < layers.length; i++)
  {
    for (let j = 0; j < layers[i].length; j++)
    {
      map.setLayoutProperty(layers[i][j], 'visibility', 'none');
    }
  }

  // Gets nearby routes using the strava API
  $.getJSON($SCRIPT_ROOT + '/get_routes', {
    lat: point1,
    long: point2,
  }, function(data) {
    let routes_list = data;

    // Creates table
    let table = $('#routes_list').DataTable({
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
            // Places Boostrap button in null row
            "defaultContent": "<button type='button' class='btn btn-secondary'>Add to route builder</button>"
        }
      ],
      buttons: [
          // Initializes the custom route using custom_route();
          {
            text: 'Initialize Custom Route',
            action: function (e, dt, node, config) {
              custom_route();
            }
          },
          // Clears the stored bin, allowing a second initialization
          {
            text: 'Clear Route Memory',
            action: function (e, dt, node, config) {
              bin_id = undefined;
              selected_routes = undefined;
            }
          },
          // Saves Route, if user logged in
          {
            text: 'Save Route',
            action: function (e, dt, node, config) {
              // Check if stored bin_id
              if (bin_id) {
                save_route(bin_id);
              }
              // Else, the user must not have saved a route yet
              else {
                bootbox.alert({
                    message: "You must create a route first",
                    backdrop: true,
                    size: "small"
                });
              }
            }
          },
          // Load saved route, if user logged in
          {
            text: 'Load Saved Route',
            action: function (e, dt, node, config) {
              get_saved();
            }
          }
      ]
    });

    // Adds a button to the end of each row
    $('#routes_list tbody').on('click', 'button', function() {
      // Initializes the data stored
      let data = table.row($(this).parents('tr')).data();
      // Call a function to process that data
      add_to_store(data);
    });

    // Parse through the data
    for (let i = 0; i < routes_list.data.length; i++) {
      // Variables used to store data about the route
      let name = routes_list.data[i].name;
      let avg_grade = routes_list.data[i].avg_grade;
      let elev_difference = routes_list.data[i].elev_difference;
      let distance = routes_list.data[i].distance;

      // Create an array that stores all the points in a route
      let coords = []
      for (let j = 0; j < routes_list.data.length; j++) {
        coords.push(routes_list.data[j].points);
      }

      // These variables give each route/marker a unique id
      let id = "route" + routeNum;

      // Keep track of start lat and long, for connecting routes
      let lat1 = coords[i][0][0];
      let long1 = coords[i][0][1];

      // Increment routeNum to make each id unique
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

      // Adds the layer's id into eachLayer array
      eachLayer.push(id);

      // Set the opacity a bit lower
      map.setPaintProperty(id, 'line-opacity', 70 / 100);

      // Connects the end of a route to the start of the next route
      if (i != 0) {
        // Define needed data for connecting
        let lenpast = coords[i-1].length - 1;
        let endlat = coords[i][0][0];
        let endlong = coords[i][0][1];
        let startlat = coords[i-1][lenpast][0];
        let startlong = coords[i-1][lenpast][1];
        let routename = 'routeconnect' + routeNum;

        // Get the connector
        let directionsRequest = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + startlat + ',' + startlong + ';' + endlat + ',' + endlong + '?geometries=geojson&access_token=' + mapboxgl.accessToken;

        // AJAX the route data from mapbox
        $.ajax({
          method: 'GET',
          url: directionsRequest,
        }).done(function(data) {
          // Display the route between each
          let route = data.routes[0].geometry;
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

          // Adds the routename into the eachLayer array
          eachLayer.push(routename);
        });
      }

      // Gives each icon a unique id
      let iconid = "places" + routeNum;

      // Adds an icon at the start of each route
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

      // Adds the iconid into the eachLayer array
      eachLayer.push(iconid);

      // Displays information about the route when the icon is clicked
      map.on('click', iconid, function (e) {
          let coordinates = e.features[0].geometry.coordinates.slice();
          let description = e.features[0].properties.description;

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

  // Adds the eachLayer array into the overall layers array for organization
  layers.push(eachLayer);
}


/*
Assuming selected routes have already been loaded on the DataTable, renders
user input and strings together routes that have been selected.
*/
function custom_route()
{
  if (selected_routes) {
    // Variable to store the routes that have been selected
    let custom_routes = selected_routes;

    // Array to store the layers being added to hide them later
    let eachLayer = [];

    // Hides any layers that are currently being shown
    for (let i = 0; i < layers.length; i++)
    {
      for (let j = 0; j < layers[i].length; j++)
      {
        map.setLayoutProperty(layers[i][j], 'visibility', 'none');
      }
    }

    // Parse through the data
    for (let i = 0; i < custom_routes.length; i++) {
      // Variables to store data about the routes
      let name = custom_routes[i].name;
      let avg_grade = custom_routes[i].avg_grade;
      let elev_difference = custom_routes[i].elev_difference;
      let distance = custom_routes[i].distance;

      // An array that stores the points in the route
      let coords = []
      for (let j = 0; j < custom_routes.length; j++) {
        coords.push(custom_routes[j].points);
      }

      // Give each route a unique id
      let id = "route" + routeNum;

      // Keep track of start lat and long, for connecting routes
      let lat1 = coords[i][0][0];
      let long1 = coords[i][0][1];

      // increment routeNum to make each id unique
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

      // Adds the layer's id to eachLayer array
      eachLayer.push(id);

      // Set the opacity a bit lower
      map.setPaintProperty(id, 'line-opacity', 70 / 100);

      // Connects the end of a route to the start of the next route
      if (i != 0) {
        // Define needed data for connecting
        let lenpast = coords[i-1].length - 1;
        let endlat = coords[i][0][0];
        let endlong = coords[i][0][1];
        let startlat = coords[i-1][lenpast][0];
        let startlong = coords[i-1][lenpast][1];
        let routename = 'routeconnect' + routeNum;

        // Get the connector
        let directionsRequest = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + startlat + ',' + startlong + ';' + endlat + ',' + endlong + '?geometries=geojson&access_token=' + mapboxgl.accessToken;

        // AJAX the route data from mapbox
        $.ajax({
          method: 'GET',
          url: directionsRequest,
        }).done(function(data) {
          // Display the route between each
          let route = data.routes[0].geometry;
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

          // Adds routename into the eachLayer arrray
          eachLayer.push(routename);
        });
      }

      // Give each icon a unique id
      let iconid = "places" + routeNum;

      // Adds icons to the start of each route
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

      // Adds iconid into the eachLayer array
      eachLayer.push(iconid);

      // When an icon is clicked it displays a popup with information about the route
      map.on('click', iconid, function (e) {
          let coordinates = e.features[0].geometry.coordinates.slice();
          let description = e.features[0].properties.description;

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
  // Adds eachLayer to the overall layers array
  layers.push(eachLayer);
  }
  else {
    // User hasn't selected any routes
    bootbox.alert({
        message: "You must select routes you want to display first",
        backdrop: true,
        size: 'small'
    });
  }
}

/*
Saves user routes to SQL database, if logged in
*/
function save_route(bin)
{
  let bin_store;
  // Save user data in SQL database
  // Uses AJAX to make a request
  $.getJSON($SCRIPT_ROOT + '/save_route', {
    bin_store: bin,
  }, function(data) {
    // Alerts user
    if (JSON.parse(data) == true) {
      bootbox.alert({
          message: "Custom route saved!",
          backdrop: true,
          size: 'small'
      });
    }
    else {
      bootbox.alert({
          message: "Saving route failed -- are you sure you're logged in?",
          backdrop: true,
          size: 'small'
      });
    }
  });
}


/*
Get and display user route
*/
function get_saved()
{
  $.getJSON($SCRIPT_ROOT + '/get_saved', {
  }, function(data) {
    // Get bin data from get_saved
    bin_id = data;

    if (bin_id != false) {
      // Creates a JSON bin for our data, as per: https://jsonbin.io/api-reference/
      let req = new XMLHttpRequest();

      // Response handler
      req.onreadystatechange = () => {
        if (req.readyState == XMLHttpRequest.DONE) {
          // Store our selected routes, for later use
          let selected_routes = JSON.parse(req.responseText).data;
          // Alert user
          bootbox.alert({
              message: "Custom route loaded!",
              backdrop: true,
              size: 'small'
          });
          // Display custom route
          custom_route();
        }
      };

      // Send data to server
      req.open("GET", "https://api.jsonbin.io/b/" + bin_id, true);
      req.setRequestHeader("secret-key", "$2a$10$h0anNYLQyYyV5eUvvyy7.uDFHPZAM21Gjt7vodG1sp27C.76DhRq.");
      req.send();
    }
    else {
      bootbox.alert({
          message: "No data found for user. Check to make sure you're logged in and have saved a route",
          backdrop: true,
          size: "small"
      });
    }
  });
}

/*
Adds user data to a JSON bin
*/
function add_to_store(data)
{
  if (data == undefined) {
    return;
  }
  else {
        // Stringify JSON to send to server
    let data_str = JSON.stringify(data);

    // If we haven't done so, create a JSON bin
    if (!bin_id) {
      // Creates a JSON bin for our data, as per: https://jsonbin.io/api-reference/
      let req_first = new XMLHttpRequest();

      // Response handler
      req_first.onreadystatechange = () => {
        if (req_first.readyState == XMLHttpRequest.DONE) {
          let response = JSON.parse(req_first.responseText);

          // Save our bin_id for current session
          bin_id = response.id;
          // Alert the user
          bootbox.alert({
              message: "1 route stored in routebuilder",
              backdrop: true,
              size: "small"
          });
        }
      }

      // Send data to server
      req_first.open("POST", "https://api.jsonbin.io/b", true);
      req_first.setRequestHeader("Content-type", "application/json");
      req_first.setRequestHeader("secret-key", "$2a$10$h0anNYLQyYyV5eUvvyy7.uDFHPZAM21Gjt7vodG1sp27C.76DhRq.");
      req_first.setRequestHeader("private", "true");
      req_first.send(data_str);
    }

    // Else, update our bin to store our data
    else {
      // Creates a JSON bin for our data, as per: https://jsonbin.io/api-reference/
      let req = new XMLHttpRequest();

      // Response handler
      req.onreadystatechange = () => {
        if (req.readyState == XMLHttpRequest.DONE) {
          let current_data = JSON.parse(req.responseText);

          // Update our bin to have our new data too
          let req_up = new XMLHttpRequest();

          req_up.onreadystatechange = () => {
            if (req_up.readyState == XMLHttpRequest.DONE) {
              // Store our selected routes, for later use
              selected_routes = JSON.parse(req_up.responseText).data;
              // Alert user
              bootbox.alert({
                  message: selected_routes.length + " routes stored in route builder",
                  backdrop: true,
                  size: 'small'
              });
            }
          };

          // Concatonates old and new JSON objects
          let jsons = new Array();
          // If there's only one list item, concatonate into a new object like so
          if (current_data.hasOwnProperty('name')) {
            jsons.push(current_data);
            jsons.push(data);
          }
          // Else, we have to iterate through the already existing object first
          else {
            for (let n = 0; n < current_data.length; n++) {
              jsons.push(current_data[n]);
            }
            // Only after that can we add our end data
            jsons.push(data);
          }
          // Finally, make this something we can handle
          let new_str = JSON.stringify(jsons);

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
  }
}


// Sets up the search box in the map
let geocoder = new MapboxGeocoder({
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
// As per: https://gearheart.io/blog/ow-to-add-html5-geolocation-to-your-web-app/
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
