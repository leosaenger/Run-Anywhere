# Overview

Much of the front end of our project was implemented using Mapbox’s API. To use any of Mapbox’s features, we had to get an access token, which had to be given in all of the javascript functions relating to Mapbox. While some features use Mapbox templates manipulated for our specific use - such as `geocontrol` which allows users to search for a location - the `drawRoute` and `custom_route` functions were the most complex functions written almost entirely in original JavaScript.

## drawRoute

The `drawRoute` function handles displaying nearby routes, marking the start of each route with an icon that can be clicked to display a popup with relevant information about the route, and connecting the end of a route with the beginning of the next route to show users how to get from one route to another.

First, `drawRoute` sets the “visibility” of all other layers to “none” by iterating through the global array “layers”. An array is initialized at the start of the function which contains ids for all layers. At the end of each `drawRoute` call, the function’s array is added to a global array which contains all layers. This design decision allows later changes to the visibility of layers after display. Making the global array an array of arrays allows neater organization since each inner array represents the layers that are displayed after a user searches for a location.

`drawRoute` takes in a latitude and a longitude. These are used in a getJSON which calls `/get_routes` in application.py. That function, with the help of `get_segments` in helpers.py returns an JSON object, `data`. `/get_routes` parses through the raw data returned by `get_segments` (particularly, since Strava stores the coordinates of routes as [encoded polylines](https://developers.google.com/maps/documentation/javascript/examples/polyline-complex), `get_routes` decodes and returns data as an array of coordinates for Mapbox display purposes). `data` is a JSON dict of segments, where each segment contains various properties (such as distance, elevation, and an array of coordinates). `data` is inserted into a variable called `routes_list`.

### DataTables

After receiving the JSON dict containing routes data, a DataTable is initialized with the data. At the end of each row, a button to add the route to a custom route is displayed, and a few custom buttons are also added to the top of the DataTable.

#### Storing Custom Routes

Each time “Add to Route Builder” is clicked, the function `add_to_store` is passed the data within the DataTable for that row. This data includes pieces of information that aren’t currently displayed, for example, the list of coordinates in each row since the DataTable was initialized using the entire JSON object holding all route information which we retrieved at the start.

`add_to_store` uses jsonbin.io, a lightweight JSON storage service, to store segment data. This method enables us to minimize the number of server-side calls necessary, since instead of making a server-side call to, say, a SQL database each time the user wants to add a route to a custom route, the server only needs to make a request to jsonbin.io with the user’s unique bin identifier (`bin_id`), which is reset each time the page is reloaded.

This also enables users to create routes without logging in, since the bin identifier is stored client-side on each page load and doesn’t require association with static user data. This design decision thus optimizes both performance and user experience.

Why not cache all user data locally instead? There are a few reasons we chose not to do so.
* Caching all data locally would take up a fairly large amount of storage client-side and potentially impact performance.
* Caching locally would prevent more than one person from using the website on the same computer and saving routes, since route data would only be stored in the browser rather than in an external database that can handle multiple users logging in and out on one browser. That is, if both you and a friend wanted to build and save a route, we would need to use a database to properly associate one user’s session with one `bin_id` and the other user’s session with another `bin_id`. Else, your friend using the app would automatically overwrite your saved data.
* Using permanent storage enables us to examine and analyze user data, which can help us understand what kinds of routes users want to make and thus make useful improvements to the app.

Directly after each `bin_id` call, the data within the associated JSON bin is stored in the global variable `selected_routes`.

#### Associating Routes with User Data

This methodology makes associating routes with user data trivial, since our SQL database only needs to contain a `bin_id` for the user’s saved route. The “Save Route” and “Load Saved Route” functions insert the current `bin_id` into the user’s row in the SQL database and retrieve it.

#### Loading JSON bins

Once the user has set and filled a `bin_id` and `selected_routes` object, “Initialize Custom Route” and `custom_route` uses that data to render the unique route.

### Rendering Routes on Mapbox

After the table is drawn, `drawRoute` iterates through each of the routes in routes_list, initializing variables with the properties of each array, including an array `coords` that contains all the points of each route. Also initialized is a global counter `routeNum`. Since Mapbox requires each layer have a unique id, each time `drawRoute` and `custom_route` is called, routeNum is incremented by one. When layer ids are required, they’re set to `“routes” + routeNum`. This design decision is the easiest way to give each layer a unique id.

After incrementing `routeNum`, this id is used to create a new map layer through the `map.addlayer` function which takes information in the form of a geoJSON object and passes it to Mapbox, which displays the information in the form of a route in the map. The opacity and color of these routes are altered for aesthetic effect.

### Connecting Routes

After the routes are drawn, these routes are then connected. The way we implemented this was by storing the current route’s last point’s latitude and longitude, and also storing the previous route’s information as well into variables. We first check if `i != 0`, since this process is only relevant when the current route in the for loop is not the first one.

A call is made to Mapbox’s API, using the latitude and longitude of the last point of the previous route, followed by the latitude and longitude of the first point in the current route.

Then an AJAX request is made with what is returned from the API, therefore adding another layer which contains this connecting route.

### Adding Icons

Icons are added after the connecting routes. This is done by again feeding a geoJSON to Mapbox, allowing them to add an icon layer. This geoJSON contains information about the specific route in its “properties”.

After the layer is added, some mouse functionality is implemented so that when the icon is clicked, a popup appears which will display the information that was provided in the “properties” of the icon. There are two other functions which make it so that the appearance of the mouse makes it apparent that the icon can me clicked - just like a mouse changes when hovering over a link.

## Custom Route Construction

Much of `custom_route` is detailed above, but in essence it parses through the `selected_routes` object refreshed after each jsonbin.io call and uses it to display and link selected routes on the Mapbox map, similar to the implementation of that same function within `drawRoutes`.

## Helper Functions

### `get_segments`

`get_segments` uses [stravalib](https://pythonhosted.org/stravalib), a python library, to interact with Strava’s API. Stravalib is relatively easy to use and returns “strongly-typed” model objects, which are much easier to handle and parse through than Strava’s native API, which often returns irregular data. Strava’s native API is also poorly documented, which caused a lot of frustration when working with it that was avoided by using stravalib (for example, Strava’s API documentation defines many functions as written in CamelCase, but in actuality has them defined as underscored_functions).

### Flip

One helper function that was implemented was `flip`. This function takes in an array of tuples and switches the order of each tuple in the array. This was necessary since the order of the coordinates coming from Strava is actually opposite from the order of the coordinates that Mapbox uses, so this function just made it easy to flip the coordinates whenever this was needed.

# Deployment

The app is currently deployed on [Heroku](https://www.heroku.com/). [Gunicorn](https://gunicorn.org/) is used as an HTTP server. We did this to simplify deployment, and avoid paying a hosting fee (our Heroku app uses no paid dynos).
