# Strava modules
from __future__ import print_function
import time
import urllib3
import swagger_client
from swagger_client.rest import ApiException
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

# Configure OAuth2 access token for authorization: strava_oauth
swagger_client.configuration.access_token = '019e4ad77a1ecbe0112db9b00b3a29f3d9629f8a'

def get_segments(lowerlat, lowerlong, upperlat, upperlong):
    '''Accepts lower and upper bounds for an area, and returns a list of ids for nearby segments'''

    # create an instance of the API class
    api_instance = swagger_client.SegmentsApi()
    bounds =  [lowerlat, lowerlong, upperlat, upperlong] # array[Float] | The latitude and longitude for two points describing a rectangular boundary for the search: [southwest corner latitutde, southwest corner longitude, northeast corner latitude, northeast corner longitude]
    activityType = "running" # Get running routes

    try:
        # Explore segments
        segments = api_instance.exploreSegments(bounds, activityType=activityType)
        # Gets a list of the IDs for segments returned
        segment_ids = [n["id"] for n in segments]
        print(segment_ids)
        return segment_ids
    except ApiException as e:
        print("Exception when calling SegmentsApi->exploreSegments: %s\n" % e)

get_segments(42.377003, -71.116661, 42.387596,-71.099495)

def get_gpx(route_id):
    '''Takes a route id and returns a GPX file for that route'''

    # create an instance of the API class
    api_instance = swagger_client.RoutesApi()
    id = route_id # Integer, the identifier of the route.
    try:
        # Export Route GPX
        gpx_route = api_instance.getRouteAsGPX(id)
        return gpx_route
    except ApiException as e:
        print("Exception when calling RoutesApi->getRouteAsGPX: %s\n" % e)


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
