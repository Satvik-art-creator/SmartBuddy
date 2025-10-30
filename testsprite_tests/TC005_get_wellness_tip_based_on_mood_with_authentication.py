import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30
LOGIN_ENDPOINT = "/api/auth/login"
WELLNESS_ENDPOINT = "/api/wellness"

USERNAME = "aryan@iiitn.ac.in"
PASSWORD = "aryan123"

def get_jwt_token(email, password):
    resp = requests.post(
        f"{BASE_URL}{LOGIN_ENDPOINT}",
        json={"email": email, "password": password},
        timeout=TIMEOUT
    )
    assert resp.status_code == 200, f"Login failed with status {resp.status_code}"
    json_data = resp.json()
    token = json_data.get("token")
    assert token, "JWT token missing in login response"
    return token

def test_get_wellness_tip_based_on_mood_with_authentication():
    moods = ["Happy", "Neutral", "Stressed"]

    # Test unauthorized access (no auth header)
    for mood in moods:
        resp = requests.get(
            f"{BASE_URL}{WELLNESS_ENDPOINT}",
            params={"mood": mood},
            timeout=TIMEOUT
        )
        assert resp.status_code == 401, f"Expected 401 Unauthorized for mood '{mood}' without auth, got {resp.status_code}"

    # Obtain JWT token for authorization
    token = get_jwt_token(USERNAME, PASSWORD)
    headers = {"Authorization": f"Bearer {token}"}

    # Test authorized access with valid moods
    for mood in moods:
        resp = requests.get(
            f"{BASE_URL}{WELLNESS_ENDPOINT}",
            params={"mood": mood},
            headers=headers,
            timeout=TIMEOUT
        )
        assert resp.status_code == 200, f"Expected 200 OK for mood '{mood}' with auth, got {resp.status_code}"
        json_data = resp.json()
        assert isinstance(json_data, dict), f"Response is not a JSON object for mood '{mood}'"
        assert any(key in json_data for key in ("tip", "wellnessTip", "message")), f"Missing wellness tip info in response for mood '{mood}'"

    # Test authorized access with invalid mood parameter
    invalid_moods = ["Excited", "Sad", "Angry", "", "123"]
    for mood in invalid_moods:
        resp = requests.get(
            f"{BASE_URL}{WELLNESS_ENDPOINT}",
            params={"mood": mood},
            headers=headers,
            timeout=TIMEOUT
        )
        assert resp.status_code != 401, f"Unexpected 401 for invalid mood '{mood}'"
        assert resp.status_code != 500, f"Server error 500 for invalid mood '{mood}'"
        if resp.status_code == 200:
            try:
                json_data = resp.json()
                assert isinstance(json_data, dict)
            except Exception:
                assert False, f"Invalid JSON response for invalid mood '{mood}'"


test_get_wellness_tip_based_on_mood_with_authentication()
