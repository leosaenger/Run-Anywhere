# coding: utf-8

"""
    Strava API v3

    Strava API  # noqa: E501

    OpenAPI spec version: 3.0.0
    
    Generated by: https://github.com/swagger-api/swagger-codegen.git
"""


from __future__ import absolute_import

import re  # noqa: F401

# python 2 and python 3 compatibility library
import six

from swagger_client.api_client import ApiClient


class SegmentEffortsApi(object):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    Ref: https://github.com/swagger-api/swagger-codegen
    """

    def __init__(self, api_client=None):
        if api_client is None:
            api_client = ApiClient()
        self.api_client = api_client

    def get_efforts_by_segment_id(self, id, **kwargs):  # noqa: E501
        """List Segment Efforts  # noqa: E501

        Returns a set of the authenticated athlete's segment efforts for a given segment.  # noqa: E501
        This method makes a synchronous HTTP request by default. To make an
        asynchronous HTTP request, please pass async=True
        >>> thread = api.get_efforts_by_segment_id(id, async=True)
        >>> result = thread.get()

        :param async bool
        :param int id: The identifier of the segment. (required)
        :param int page: Page number.
        :param int per_page: Number of items per page. Defaults to 30.
        :return: list[DetailedSegmentEffort]
                 If the method is called asynchronously,
                 returns the request thread.
        """
        kwargs['_return_http_data_only'] = True
        if kwargs.get('async'):
            return self.get_efforts_by_segment_id_with_http_info(id, **kwargs)  # noqa: E501
        else:
            (data) = self.get_efforts_by_segment_id_with_http_info(id, **kwargs)  # noqa: E501
            return data

    def get_efforts_by_segment_id_with_http_info(self, id, **kwargs):  # noqa: E501
        """List Segment Efforts  # noqa: E501

        Returns a set of the authenticated athlete's segment efforts for a given segment.  # noqa: E501
        This method makes a synchronous HTTP request by default. To make an
        asynchronous HTTP request, please pass async=True
        >>> thread = api.get_efforts_by_segment_id_with_http_info(id, async=True)
        >>> result = thread.get()

        :param async bool
        :param int id: The identifier of the segment. (required)
        :param int page: Page number.
        :param int per_page: Number of items per page. Defaults to 30.
        :return: list[DetailedSegmentEffort]
                 If the method is called asynchronously,
                 returns the request thread.
        """

        all_params = ['id', 'page', 'per_page']  # noqa: E501
        all_params.append('async')
        all_params.append('_return_http_data_only')
        all_params.append('_preload_content')
        all_params.append('_request_timeout')

        params = locals()
        for key, val in six.iteritems(params['kwargs']):
            if key not in all_params:
                raise TypeError(
                    "Got an unexpected keyword argument '%s'"
                    " to method get_efforts_by_segment_id" % key
                )
            params[key] = val
        del params['kwargs']
        # verify the required parameter 'id' is set
        if ('id' not in params or
                params['id'] is None):
            raise ValueError("Missing the required parameter `id` when calling `get_efforts_by_segment_id`")  # noqa: E501

        collection_formats = {}

        path_params = {}
        if 'id' in params:
            path_params['id'] = params['id']  # noqa: E501

        query_params = []
        if 'page' in params:
            query_params.append(('page', params['page']))  # noqa: E501
        if 'per_page' in params:
            query_params.append(('per_page', params['per_page']))  # noqa: E501

        header_params = {}

        form_params = []
        local_var_files = {}

        body_params = None
        # HTTP header `Accept`
        header_params['Accept'] = self.api_client.select_header_accept(
            ['application/json'])  # noqa: E501

        # Authentication setting
        auth_settings = ['strava_oauth']  # noqa: E501

        return self.api_client.call_api(
            '/segments/{id}/all_efforts', 'GET',
            path_params,
            query_params,
            header_params,
            body=body_params,
            post_params=form_params,
            files=local_var_files,
            response_type='list[DetailedSegmentEffort]',  # noqa: E501
            auth_settings=auth_settings,
            async_=params.get('async'),
            _return_http_data_only=params.get('_return_http_data_only'),
            _preload_content=params.get('_preload_content', True),
            _request_timeout=params.get('_request_timeout'),
            collection_formats=collection_formats)

    def get_segment_effort_by_id(self, id, **kwargs):  # noqa: E501
        """Get Segment Effort  # noqa: E501

        Returns a segment effort from an activity that is owned by the authenticated athlete.  # noqa: E501
        This method makes a synchronous HTTP request by default. To make an
        asynchronous HTTP request, please pass async=True
        >>> thread = api.get_segment_effort_by_id(id, async=True)
        >>> result = thread.get()

        :param async bool
        :param int id: The identifier of the segment effort. (required)
        :return: DetailedSegmentEffort
                 If the method is called asynchronously,
                 returns the request thread.
        """
        kwargs['_return_http_data_only'] = True
        if kwargs.get('async'):
            return self.get_segment_effort_by_id_with_http_info(id, **kwargs)  # noqa: E501
        else:
            (data) = self.get_segment_effort_by_id_with_http_info(id, **kwargs)  # noqa: E501
            return data

    def get_segment_effort_by_id_with_http_info(self, id, **kwargs):  # noqa: E501
        """Get Segment Effort  # noqa: E501

        Returns a segment effort from an activity that is owned by the authenticated athlete.  # noqa: E501
        This method makes a synchronous HTTP request by default. To make an
        asynchronous HTTP request, please pass async=True
        >>> thread = api.get_segment_effort_by_id_with_http_info(id, async=True)
        >>> result = thread.get()

        :param async bool
        :param int id: The identifier of the segment effort. (required)
        :return: DetailedSegmentEffort
                 If the method is called asynchronously,
                 returns the request thread.
        """

        all_params = ['id']  # noqa: E501
        all_params.append('async')
        all_params.append('_return_http_data_only')
        all_params.append('_preload_content')
        all_params.append('_request_timeout')

        params = locals()
        for key, val in six.iteritems(params['kwargs']):
            if key not in all_params:
                raise TypeError(
                    "Got an unexpected keyword argument '%s'"
                    " to method get_segment_effort_by_id" % key
                )
            params[key] = val
        del params['kwargs']
        # verify the required parameter 'id' is set
        if ('id' not in params or
                params['id'] is None):
            raise ValueError("Missing the required parameter `id` when calling `get_segment_effort_by_id`")  # noqa: E501

        collection_formats = {}

        path_params = {}
        if 'id' in params:
            path_params['id'] = params['id']  # noqa: E501

        query_params = []

        header_params = {}

        form_params = []
        local_var_files = {}

        body_params = None
        # HTTP header `Accept`
        header_params['Accept'] = self.api_client.select_header_accept(
            ['application/json'])  # noqa: E501

        # Authentication setting
        auth_settings = ['strava_oauth']  # noqa: E501

        return self.api_client.call_api(
            '/segment_efforts/{id}', 'GET',
            path_params,
            query_params,
            header_params,
            body=body_params,
            post_params=form_params,
            files=local_var_files,
            response_type='DetailedSegmentEffort',  # noqa: E501
            auth_settings=auth_settings,
            async_=params.get('async'),
            _return_http_data_only=params.get('_return_http_data_only'),
            _preload_content=params.get('_preload_content', True),
            _request_timeout=params.get('_request_timeout'),
            collection_formats=collection_formats)