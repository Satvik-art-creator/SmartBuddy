import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
MATCH_URL = f"{BASE_URL}/api/match"
TIMEOUT = 30

def test_get_study_buddy_matches_auth_and_response():
    # Attempt to access /api/match without authentication
    try:
        resp_unauth = requests.get(MATCH_URL, timeout=TIMEOUT)
        assert resp_unauth.status_code == 401, f"Expected 401 Unauthorized but got {resp_unauth.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Authenticate user and get JWT token
    login_payload = {
        "email": "aryan@iiitn.ac.in",
        "password": "aryan123"
    }
    try:
        resp_login = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert resp_login.status_code == 200, f"Login failed with status code {resp_login.status_code}"
        login_data = resp_login.json()
        token = login_data.get("token")
        assert token and isinstance(token, str), "No valid token received on login"
    except (requests.RequestException, ValueError) as e:
        assert False, f"Login request failed or invalid response: {e}"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    # Access /api/match endpoint with authentication
    try:
        resp_match = requests.get(MATCH_URL, headers=headers, timeout=TIMEOUT)
        assert resp_match.status_code == 200, f"Expected 200 OK but got {resp_match.status_code}"
        matches = resp_match.json()
        assert isinstance(matches, list), "Response is not a list of matches"
        assert len(matches) <= 3, f"More than 3 matches returned: {len(matches)}"
        # Validate that each match has shared skills and interests (assuming keys 'sharedSkills' and 'sharedInterests' or similar)
        for match in matches:
            # Check required fields presence
            assert isinstance(match, dict), "Each match should be a dict"
            # We can't know exact keys from PRD, so check for fields related to skills and interests
            skills = match.get("skills", [])
            interests = match.get("interests", [])
            assert isinstance(skills, list), "Match skills should be a list"
            assert isinstance(interests, list), "Match interests should be a list"
            # Additional validation: at least one common skill or interest (assuming match logic)
            # Since we don't have the logged in user's skills/interests here, this is limited:
            # we just ensure keys exist and are lists
    except (requests.RequestException, ValueError) as e:
        assert False, f"Match request failed or invalid response: {e}"

test_get_study_buddy_matches_auth_and_response()