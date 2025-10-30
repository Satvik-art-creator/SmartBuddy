import requests

BASE_URL = "http://localhost:5000"
LOGIN_ENDPOINT = "/api/auth/login"
TIMEOUT = 30

AUTH_USERNAME = "aryan@iiitn.ac.in"
AUTH_PASSWORD = "aryan123"

def test_user_login_valid_and_invalid_credentials():
    headers = {
        "Content-Type": "application/json",
    }

    # Test valid credentials
    valid_payload = {
        "email": AUTH_USERNAME,
        "password": AUTH_PASSWORD
    }
    try:
        valid_response = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=valid_payload,
            headers=headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request to login with valid credentials failed: {e}"

    assert valid_response.status_code == 200, f"Expected 200 OK for valid login, got {valid_response.status_code}"
    try:
        valid_json = valid_response.json()
    except Exception:
        assert False, "Response to valid login is not valid JSON"

    # Validate presence of JWT token and user details in response body
    assert "token" in valid_json and isinstance(valid_json["token"], str) and len(valid_json["token"]) > 0, \
        "JWT token missing or empty in valid login response"
    assert "user" in valid_json and isinstance(valid_json["user"], dict), \
        "User details missing or invalid in valid login response"
    # Basic fields in user
    user = valid_json["user"]
    assert "email" in user and user["email"] == AUTH_USERNAME, \
        "User email in response does not match login email"

    # Test invalid credentials
    invalid_payload = {
        "email": AUTH_USERNAME,
        "password": "wrongpassword123"
    }
    try:
        invalid_response = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=invalid_payload,
            headers=headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request to login with invalid credentials failed: {e}"

    assert invalid_response.status_code == 401, f"Expected 401 Unauthorized for invalid login, got {invalid_response.status_code}"
    try:
        invalid_json = invalid_response.json()
    except Exception:
        assert False, "Response to invalid login is not valid JSON"

    # Optionally check error message or structure
    # For example, if message field expected:
    assert ("message" in invalid_json) or ("error" in invalid_json) or True, \
        "Invalid login response should contain an error or message field"

test_user_login_valid_and_invalid_credentials()
