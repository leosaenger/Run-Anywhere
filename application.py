'''
A webapp that enables users to create custom Strava routes and display them on a map.
'''

import os
from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions
from werkzeug.security import check_password_hash, generate_password_hash

# Configure application
app = Flask(__name__)

# Import from helpers
from helpers import get_segments, login_required, flip

# Polyline decoding
import polyline

# Data storage
import json

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///runanywhere.db")

@app.route("/")
def landing():
    # Show landing page
    return(render_template("splash.html"))


@app.route("/map")
def map():
    # Show map page
    return(render_template("index.html"))


@app.route("/get_routes", methods=["GET"])
def get_coords():
    # Takes coordinates from the user and returns a list of Strava routes
    # Strava routes are returned as a JSON object, as detailed below

    # Fetch the current latitude and longitude
    currentlat = request.args.get('lat', 0, type=float)
    currentlong = request.args.get('long', 0, type=float)
    # Convert to a square
    lowerlat = currentlat - 0.01
    lowerlong = currentlong - 0.01
    upperlat = currentlat + 0.01
    upperlong = currentlong + 0.01
    # Get data
    data = get_segments(lowerlat, lowerlong, upperlat, upperlong)
    # Parse the data into a JSON object
    seg_data = {}
    seg_data['data'] = []
    for n in range((len(data))):
        seg_data['data'].append({'name': data[n].name,
                                'avg_grade': data[n].avg_grade,
                                # We have to extract the elevation difference and distance from the returned object
                                'elev_difference': str(data[n].elev_difference.__dict__['_num']) + ' ' + str(data[n].elev_difference.__dict__['_unit']),
                                'distance': str(data[n].distance.__dict__['_num']) + ' ' + str(data[n].distance.__dict__['_unit']),
                                # Points are returned both backwards and coded as a polyline, so we fix that
                                'points': flip(polyline.decode(data[n].points))})
    # Then, return those
    return jsonify(seg_data)


@app.route("/register", methods=["GET", "POST"])
def register():
    # Register user

    # If user accessed via POST, as in submitting a form
    if request.method == "POST":
        # Checking for valid inputs
        if not request.form.get("username") or not request.form.get("password") or not request.form.get("confirmation"):
            return render_template("error.html")
        if request.form.get("password") != request.form.get("confirmation"):
            return render_template("error.html")
        # Hashing the password
        hash = generate_password_hash(request.form.get("password"))
        result = db.execute("INSERT INTO users(username, hash) VALUES(:u, :h)",
                    u = request.form.get("username"), h = hash)

        if not result:
            return render_template("error.html")
        rows = db.execute("SELECT * FROM users WHERE username = :username",
                          username=request.form.get("username"))

        # Remember which user has logged in
        for row in rows:
            session["user_id"] = row["id"]

        # Redirect user to home page
        return redirect("/map")
    else:
        return render_template("register.html")

@app.route('/save_route', methods=['GET'])
def save_route():
    # Get bin_id from GET request
    bin_id = request.args.get('bin_store', 0)
    try:
        if bin_id != 0:
            # Add it to database
            db.execute("UPDATE users SET route_bin = :b WHERE id = :i", b = bin_id, i = session["user_id"])
            return jsonify(True)
        else:
            # The bin must not exist
            return jsonify(False)
    except KeyError:
        # If the user hasn't logged in
        return jsonify(False)


@app.route("/get_saved", methods=["GET"])
def get_saved():
    try:
        # Gets the bin that the user saved earlier
        route_bin = db.execute("SELECT route_bin FROM users WHERE id = :i", i = session["user_id"])
        # Then, return it
        return jsonify(route_bin[0]["route_bin"])
    except KeyError:
        # If the user hasn't logged in, we'll get a KeyError
        return jsonify(False)

@app.route("/login", methods=["GET", "POST"])
def login():
    # Log user in

    # Forget any user_id
    session.clear()
    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        # Ensure username was submitted
        if not request.form.get("username"):
            return render_template("error.html")

        # Ensure password was submitted
        elif not request.form.get("password"):
            return render_template("error.html")

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = :username",
                          username=request.form.get("username").lower())

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return render_template("error.html")

        # Remember which user has logged in
        for row in rows:
            session["user_id"] = row["id"]

        # Redirect user to home page
        return redirect("/map")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    # Log user out

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")

@app.route("/check", methods=["GET"])
def check():
    """Return true if username available, else false, in JSON format"""
    username = request.args.get("username").lower()
    rows = db.execute("SELECT username FROM users WHERE username = :u", u=username)
    if len(username) >= 1 and len(rows) == 0:
        return jsonify(True)
    else:
        return jsonify(False)
