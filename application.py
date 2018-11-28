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
    # Iterates over the object returned, taking out polylines
    polylines = []
    for n in range(len(data)):
        polylines.append(data[n].points)
    # Convert those to a list of coordinates
    coordinates = [polyline.decode(n) for n in polylines]
    # Then, return those
    return jsonify(flip(coordinates))

@app.route("/get_routes", methods=["GET"])
def get_routes():
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
    # Return that list of dictionaries
    return jsonify(data)
