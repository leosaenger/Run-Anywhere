# Run Anywhere

Run Anywhere is a web application that uses [Strava’s API](http://developers.strava.com/docs/reference/) to let users see nearby popular segments and create custom running routes by stringing together nearby segments.

This is the git repo for Run Anywhere. **You can find a live version of the project [here](https://run-anywhere.herokuapp.com).** *Note: due to some web browser’s security requirements and difficulty with obtaining a SSL certificate, the site may not work on your default web browser. Try Microsoft Edge or Firefox.*

## Installation

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install necessary dependencies.

From the project folder:

```bash
pip install -r requirements.txt
```

Then, use [Flask](http://flask.pocoo.org) to locally run the application:

On Mac/Linux:

```bash
export FLASK_APP=application.py
export FLASK_ENV=development
flask run
```

For Windows cmd, use set instead of export:


```bash
set FLASK_APP=application.py
set FLASK_ENV=development
flask run
```

For Windows PowerShell, use $env: instead of export:

```bash
$env:FLASK_APP = "application.py"
$env:FLASK_ENV = "development"
flask run
```

You’ll see output similar to this:


```bash
* Serving Flask app "application.py"
* Environment: development
* Debug mode: on
* Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
* Restarting with stat
* Debugger is active!
* Debugger PIN: 855-212-761
```

Visit http://127.0.0.1:5000/ in a browser and you should see the app.

## Usage

### Overview

Run Anywhere is a web-based application that lets users design running routes based on the most popular running segments (short portions of runs usually between 100 meters and one mile) in their area. The application uses data from Strava, a service with which users can log their runs, to construct these routes.

The application uses [jsonbin.io](https://jsonbin.io/) to store user routes. **jsonbin.io is prone to infrequent short periods of downtime.** It’s possible that one of those short downtimes might happen while grading this project, if so, please wait a short while for the site to come back online.

### Getting Started and Creating Custom Routes

After clicking “enter” on the splash page, users will see a map that displays the top Strava segments near their current location. The initial map also shows a route connecting all of the segments.

Once he or she sees the map, the user can design a custom route near his or her current location using any number of the top nearby segments. To do so, first browse the routes in the table on the right side of the screen. Pertinent information about the route is included in the table, and users may click on the markers on the map for information about the segments. To add segments to the new custom route, simply click the “Add to route builder” button next to each segment that one would desire to run through. A popup box will appear to confirm that the user successfully added the segment. Once the user adds as many segments as he or she desires, he or she can click the “Initialize Custom Route” button at the top of the screen to create a custom route on the map that includes all of the chosen segments.

### Going to New Places

Run Anywhere allows users to create custom routes in locations different to their current ones, provided that those locations have ample Strava data to find top segments. To do so, simply enter a location nearby which you would like to generate a route. Provided that Strava has enough data, a user should see a new map with different segments displaying different segments. Then, a user can create routes with the method described in the previous section.

### Registration and Saving Routes

To register with a new Run Anywhere account, simply click on the “Register” button at the top right of the screen on which the map is displayed. On the registration screen, enter a username and password then confirm that password to create an account. If redirected to an error page, a user should go back in his or her browser and enter his or her credentials again. After registering, the user will automatically be logged in. To log out, click on the “Logout” button at the top right of the screen.

For returning users, click on the “Log In” button at the top right of the screen (next to the “Register” button and enter login credentials.

## Contributing

Pull requests are welcome.

## Authors

* Leo Saenger
* Jaylen Wang
* Nihal Raman

## License

[MIT](https://choosealicense.com/licenses/mit/)
