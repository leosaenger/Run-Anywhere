import os

from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions
from werkzeug.security import check_password_hash, generate_password_hash
from pymsgbox import *

# Configure application
app = Flask(__name__)

# Import from helpers
from helpers import get_segments, login_required, flip

# Polyline decoding
import polyline

# Data storage
import json
from units import LeafUnit

def leafunit_reduce(self):
    return LeafUnit, (self.specifier, self.is_si())

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///runanywhere.db")

saver = 0

@app.route("/")
# @login_required
def landing():
    """Show landing page"""
    return(render_template("index.html"))

@app.route("/get_coords", methods=["GET"])
def get_coords():
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
    seg_data['segments'] = []
    for n in range((len(data))):
        seg_data['segments'].append({'name': data[n].name, 'avg_grade': data[n].avg_grade,
                                    'elev_difference': str(data[n].elev_difference.__dict__['_num']) + str(data[n].elev_difference.__dict__['_unit']),
                                    'distance': str(data[n].distance.__dict__['_num']) + str(data[n].distance.__dict__['_unit'])})
    # Save data
    with open('./routes-data.json', 'w') as file:
        json.dump(seg_data, file)
        file.close()
    # Iterates over the original object returned, taking out polylines
    polylines = []
    for n in range(len(data)):
        polylines.append(data[n].points)
    # Convert those to a list of coordinates
    coordinates = [polyline.decode(n) for n in polylines]
    # Then, return those
    return jsonify(flip(coordinates))

# This function is a work in progress
@app.route("/save_route", methods=["GET", "POST"])
def save_route():
    """Register user"""
    rows = db.execute("INSERT INTO routes(route, user_id) users WHERE id = :i", i=session['user_id'])
            cash = int(rows[0]["cash"])

        # Remember which user has logged in
        for row in rows:
            session["user_id"] = row["id"]


@app.route("/get_routes", methods=["GET"])
def get_routes():
    print("called get_routes")
    # Fetch data from earlier call
    with open('./routes-data.json', 'r') as file:
        data = json.load(file)
        file.close()
        return jsonify(data)

@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""
    if request.method == "POST":
        # Checking for valid inputs
        if not request.form.get("username") or not request.form.get("password") or not request.form.get("confirmation"):
            return apology("Please enter a valid username!")
        if request.form.get("password") != request.form.get("confirmation"):
            return apology("Different passwords!")
        # Hashing the password
        hash = generate_password_hash(request.form.get("password"))
        result = db.execute("INSERT INTO users(username, hash) VALUES(:route, :i)",
                    route = TODO, i = session['user_id'])

        # Redirect user to home page
        return redirect("/")
    else:
        return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            alert("must provide username", title='', button='OK')
            return 1

        # Ensure password was submitted
        elif not request.form.get("password"):
            alert("must provide password", title='', button='OK')
            return 1

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = :username",
                          username=request.form.get("username").lower())

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")

@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")
