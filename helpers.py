'''
Helper functions for the webapp.
'''

# Enables working with URLs
# Documentation: https://docs.python.org/3/library/urllib.html
import urllib3
try:
    from urllib.parse import urlparse
except ImportError:
    # Python 2
    from urlparse import urlparse

# Flask session control tools
from flask import redirect, render_template, request, session
from functools import wraps

# Enables easy request of Strava route data, and returns data using methods
# Documentation: https://pythonhosted.org/stravalib
from stravalib import Client


def get_segments(lowerlat, lowerlong, upperlat, upperlong):
    # Accepts lower and upper bounds for a given coordinate area
    # Returns an object with route data, as parsed in application.py

    # Sets our key
    # As per: https://github.com/hozn/stravalib/blob/master/docs/usage/auth.rst#id5
    client = Client()
    token_response = client.refresh_access_token(client_id=30378,
                                          client_secret="67b60f8a8c450a837a2337fe9eb57515915d8fba",
                                          refresh_token="ed64949d3614e9a0574ecba44d5514de593c2c0b")
    key = token_response['access_token']

    # Sets the client and registers the token
    client = Client()
    client = Client(access_token=key)

    # Calls user data for the given range for running routes
    data = client.explore_segments([lowerlat,lowerlong,upperlat,upperlong], activity_type='running')

    # Returns the object
    return data

def login_required(f):
    # Decorate routes to require login.
    # As per: http://flask.pocoo.org/docs/1.0/patterns/viewdecorators/

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function


def flip(t):
    # Switches order of tuples in an array of tuples

    # Initializes a blank list
    r = list()
    for n in t:
        # Reverses tuple order for each tuple within list
        r.append(n[::-1])
    return r
