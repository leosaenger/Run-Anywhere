# Strava modules
from __future__ import print_function
import time
import urllib3
from pprint import pprint
try:
    from urllib.parse import urlparse
except ImportError:
    # Python 2
    from urlparse import urlparse

# Flask session control tools
from flask import redirect, render_template, request, session
from functools import wraps

# Polyline encoding/decoding: https://pypi.org/project/polyline/
import polyline
import requests

# As per: https://pythonhosted.org/stravalib
from stravalib import Client

# Sets our key
# https://github.com/hozn/stravalib/blob/master/docs/usage/auth.rst#id5
client = Client()
token_response = client.refresh_access_token(client_id=30378,
                                      client_secret="67b60f8a8c450a837a2337fe9eb57515915d8fba",
                                      refresh_token="ed64949d3614e9a0574ecba44d5514de593c2c0b")
key = token_response['access_token']


def get_segments(lowerlat, lowerlong, upperlat, upperlong):
    '''Accepts lower and upper bounds for an area, and returns a list of polylines for nearby segments'''
    # EXAMPLE: get_segments(42.377003,-71.116661,42.387596,-71.099495)

    client = Client()
    client = Client(access_token=key)
    data = client.explore_segments([lowerlat,lowerlong,upperlat,upperlong], activity_type='running')

    # Iterates over the object returned, taking out polylines
    polylines = []
    for n in range(len(data)):
        polylines.append(data[n].points)
    return polylines


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

def flip(t):
    g = list()
    for n in t:
        r = list()
        for i in n:
            r.append(i[::-1])
        g.append(r)
    return g
