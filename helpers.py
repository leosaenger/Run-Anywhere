# import time
# import swagger_client
# from swagger_client.rest import ApiException
# from pprint import pprint
#
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
