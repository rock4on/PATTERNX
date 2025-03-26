import json
import base64
import requests
from typing import Dict, List, Union, Optional, Any


class LimeSurveyAPI:
    """Service for interacting with the LimeSurvey Remote Control 2 API."""
    
    def __init__(self, url: str, username: str, password: str, plugin: str = 'Authdb'):
        """
        Initialize the LimeSurvey API service.
        
        Args:
            url: LimeSurvey API endpoint URL
            username: API username
            password: API password
            plugin: Authentication plugin (default: 'Authdb')
        """
        self.url = url
        self.username = username
        self.password = password
        self.plugin = plugin
        self.session_key = None
    
    def _prepare_request(self, method: str, params: List[Any]) -> Dict[str, Any]:
        """
        Prepare a JSON-RPC request.
        
        Args:
            method: The API method to call
            params: List of parameters for the method
        
        Returns:
            Prepared request dictionary
        """
        return {
            'method': method,
            'params': params,
            'id': 1,
            'jsonrpc': '2.0'
        }
    
    def get_session_key(self) -> Optional[str]:
        """
        Create and return a session key.
        
        Returns:
            Session key string or None if authentication fails
        """
        try:
            request_data = self._prepare_request('get_session_key', [
                self.username, 
                self.password, 
                self.plugin
            ])
            
            response = requests.post(self.url, json=request_data)
            response.raise_for_status()
            
            result = response.json()
            
            if 'result' in result:
                self.session_key = result['result']
                return self.session_key
            
            return None
        except Exception as e:
            print(f"Error getting session key: {e}")
            return None
    
    def release_session_key(self) -> bool:
        """
        Close the RPC session.
        
        Returns:
            True if session key successfully released, False otherwise
        """
        if not self.session_key:
            return True
        
        try:
            request_data = self._prepare_request('release_session_key', [self.session_key])
            
            response = requests.post(self.url, json=request_data)
            response.raise_for_status()
            
            result = response.json()
            
            if result.get('result') == 'OK':
                self.session_key = None
                return True
            
            return False
        except Exception as e:
            print(f"Error releasing session key: {e}")
            return False
    
    def _make_request(self, method: str, params: Optional[List[Any]] = None) -> Dict[str, Any]:
        """
        Make a request to the LimeSurvey API.
        
        Args:
            method: API method to call
            params: Optional list of parameters
        
        Returns:
            API response dictionary
        """
        # Ensure we have a valid session key
        if not self.session_key:
            session_key = self.get_session_key()
            if not session_key:
                return {'status': 'error', 'message': 'Failed to get session key'}
        
        # Prepare full parameter list with session key as first parameter
        full_params = [self.session_key] + (params or [])
        
        try:
            request_data = self._prepare_request(method, full_params)
            
            response = requests.post(self.url, json=request_data)
            response.raise_for_status()
            
            return response.json()
        except Exception as e:
            print(f"API request failed: {e}")
            return {'status': 'error', 'message': str(e)}
    

    def check_response_complete(self, survey_id: int, response_id: Union[int, str]) -> bool:
        """
        Check if a survey response is complete.
        
        Args:
            survey_id: ID of the survey
            response_id: ID of the specific response
        
        Returns:
            Boolean indicating whether the response is complete
        """
        try:
            # Export responses for the specific survey and response
            response = self._make_request('export_responses', [
                survey_id, 
                'json', 
                None, 
                'complete', 
                'code', 
                'short', 
                response_id, 
                response_id
            ])
            
            # If result exists and is base64 encoded
            if 'result' in response:
                try:
                    # Decode base64 encoded response
                    decoded = base64.b64decode(response['result']).decode('utf-8')
                    parsed_response = json.loads(decoded)
                    
                    # Check if responses exist and the specific response is present
                    if parsed_response and 'responses' in parsed_response:
                        for resp in parsed_response['responses']:
                            # Check if submitdate exists and is not empty
                            # This indicates a completed response
                            if 'submitdate' in resp and resp['submitdate']:
                                return True
                    
                    return False
                
                except Exception as e:
                    print(f"Error decoding response: {e}")
                    return False
            
            return False
        
        except Exception as e:
            print(f"Error checking response completion: {e}")
            return False



    def list_surveys(self, username: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List surveys belonging to a user.
        
        Args:
            username: Optional username to get surveys for (admin only)
        
        Returns:
            List of surveys
        """
        params = [username] if username is not None else []
        response = self._make_request('list_surveys', params)
        print(response)
        return response.get('result', [])
    
    def get_survey_properties(self, survey_id: int, settings: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Get properties of a survey.
        
        Args:
            survey_id: ID of the survey
            settings: Optional list of specific properties to retrieve
        
        Returns:
            Survey properties dictionary
        """
        params = [survey_id]
        if settings:
            params.append(settings)
        
        response = self._make_request('get_survey_properties', params)
        return response.get('result', {})
    
    def export_responses(self, 
                         survey_id: int, 
                         document_type: str = 'json', 
                         language_code: Optional[str] = 'en',
                         completion_status: str = 'all',
                         heading_type: str = 'code',
                         response_type: str = 'short') -> Union[str, Dict[str, Any]]:
        """
        Export survey responses.
        
        Args:
            survey_id: ID of the survey
            document_type: Export format (pdf, csv, xls, doc, json)
            language_code: Optional language code
            completion_status: 'complete', 'incomplete', or 'all'
            heading_type: 'code', 'full', or 'abbreviated'
            response_type: 'short' or 'long'
        
        Returns:
            Base64 encoded responses or error dictionary
        """
        params = [
            survey_id, 
            document_type, 
            language_code, 
            completion_status, 
            heading_type, 
            response_type
        ]
        
        # Remove None values
        params = [p for p in params if p is not None]
        
        response = self._make_request('export_responses', params)
        if 'result' in response:
            try:
                # Decode base64 encoded response
                decoded = base64.b64decode(response['result']).decode('utf-8')
                print(decoded)
                return json.loads(decoded)
            except Exception as e:
                print(f"Error decoding responses: {e}")
                return response
        
        return response
    
    def __del__(self):
        """
        Ensure session key is released when object is destroyed.
        """
        self.release_session_key()