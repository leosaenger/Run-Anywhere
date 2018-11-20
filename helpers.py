# import time
# import swagger_client
# from swagger_client.rest import ApiException
# from pprint import pprint
import requests
import urllib.parse

from flask import redirect, render_template, request, session
from functools import wraps


# # Configure OAuth2 access token for authorization: strava_oauth
# swagger_client.configuration.access_token = 'YOUR_ACCESS_TOKEN'
#
# # create an instance of the API class
# api_instance = swagger_client.RoutesApi()
# id = 56 # Integer | The identifier of the route.
#
# try:
#     # Export Route GPX
#     api_instance.getRouteAsGPX(id)
# except ApiException as e:
#     print("Exception when calling RoutesApi->getRouteAsGPX: %s\n" % e)

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
