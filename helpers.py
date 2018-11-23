# Strava modules
from __future__ import print_function
import time
import urllib3
from pprint import pprint
import requests
try:
    from urllib.parse import urlparse
except ImportError:
     from urlparse import urlparse

# Flask session control tools
from flask import redirect, render_template, request, session
from functools import wraps

# GPX parser, documentation: https://github.com/tkrajina/gpxpy
import gpxpy
try:
    import gpxpy.gpx
except ImportError:
    from gpxpy import gpx

# DEBUG: Comment this back in to get detailed error documentation
# import logging
#
# # These two lines enable debugging at httplib level (requests->urllib3->http.client)
# # You will see the REQUEST, including HEADERS and DATA, and RESPONSE with HEADERS but without DATA.
# # The only thing missing will be the response.body which is not logged.
# try:
#     import http.client as http_client
# except ImportError:
#     # Python 2
#     import httplib as http_client
# http_client.HTTPConnection.debuglevel = 1
#
# # You must initialize logging, otherwise you'll not see debug output.
# logging.basicConfig()
# logging.getLogger().setLevel(logging.DEBUG)
# requests_log = logging.getLogger("requests.packages.urllib3")
# requests_log.setLevel(logging.DEBUG)
# requests_log.propagate = True

# Sets our key
headers = {'Authorization': 'Bearer be211e859f23c0f98bb7c8e3d1c4a13c27dcdbc4'}

def get_segments(lowerlat, lowerlong, upperlat, upperlong):
    '''Accepts lower and upper bounds for an area, and returns a list of polylines for nearby segments'''
    # EXAMPLE: get_segments(42.377003,-71.116661,42.387596,-71.099495)

    # Specifies a request
    payload = {'bounds': f'{lowerlat},{lowerlong},{upperlat},{upperlong}', 'activity_type': 'running'}
    r = requests.get('https://www.strava.com/api/v3/segments/explore', params=payload, headers=headers)
    # Imports our data as JSON
    data = r.json()
    # Iterates over the JSON object returned, taking out polylines
    polylines = []
    for n in data['segments']:
        polylines.append(n['points'])
    return polylines


def get_gpx(route_id):
    '''Takes a route id and returns a GPX file for that route'''

def read_gpx():
    '''Parses a GPX file and returns a list of coordinates'''

    # Opens the GPX file
    gpx_file = open(gpx_route, 'r')
    gpx = gpxpy.parse(gpx_file)

    # Parses a GPX file, as per documentation of gpxpy
    for track in gpx.tracks:
        for segment in track.segments:
            route_coords = []
            for point in segment.points:
                # Appends latitude and longitude of each point as a tuple to a list
                route_coords.append((point.latitude, point.longitude))


def login_required(f):
    """
    Decorate routes to require login.

    http://flask.pocoo.org/docs/1.0/patterns/viewdecorators/
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function
