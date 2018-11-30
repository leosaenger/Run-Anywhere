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

@app.route("/")
# @login_required
def landing():
    """Show landing page"""
    return(render_template("index.html"))

@app.route("/get_routes", methods=["GET"])
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
        seg_data['segments'].append({'name': data[n].name,
                                    'avg_grade': data[n].avg_grade,
                                    # We have to extract the elevation difference and distance from the returned object
                                    'elev_difference': str(data[n].elev_difference.__dict__['_num']) + ' ' + str(data[n].elev_difference.__dict__['_unit']),
                                    'distance': str(data[n].distance.__dict__['_num']) + ' ' + str(data[n].distance.__dict__['_unit']),
                                    # Points are returned both backwards and coded as a polyline, so we fix that
                                    'points': flip(polyline.decode(data[n].points))})
    # Then, return those
    return jsonify(seg_data)
