import requests

BASE_URL = "http://localhost:5000"
AUTH_EMAIL = "aryan@iiitn.ac.in"
AUTH_PASSWORD = "aryan123"
TIMEOUT = 30


def get_jwt_token(email, password):
    login_data = {"email": email, "password": password}
    headers = {"Content-Type": "application/json"}
    response = requests.post(f"{BASE_URL}/api/auth/login", headers=headers, json=login_data, timeout=TIMEOUT)
    assert response.status_code == 200, f"Login failed with status {response.status_code}"
    response_json = response.json()
    token = response_json.get("token")
    assert token is not None, "JWT token not found in login response"
    return token


def test_create_event_with_admin_authorization_and_valid_data():
    token = get_jwt_token(AUTH_EMAIL, AUTH_PASSWORD)
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}

    event_data = {
        "title": "AI Workshop",
        "date": "2025-11-15",
        "time": "14:00",
        "location": "Room 101, IIIT Nagpur",
        "tags": ["AI", "Workshop", "Campus"],
        "description": "A workshop on AI technologies and applications."
    }

    # Create event with correct admin token
    response = requests.post(
        f"{BASE_URL}/api/events",
        headers=headers,
        json=event_data,
        timeout=TIMEOUT
    )

    try:
        # Check successful creation with status 201
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"

        response_json = response.json()
        assert isinstance(response_json, dict), "Response is not a JSON object."

        # Validate returned event contains required fields
        for key in ["title", "date", "time", "location", "tags"]:
            assert key in response_json, f"Response JSON missing key: {key}"
            assert response_json[key] == event_data[key], f"Mismatch in field {key}"

    finally:
        # Clean up: Delete the created event if creation was successful
        if response.status_code == 201:
            event_id = response_json.get("id") or response_json.get("_id") or response_json.get("eventId")
            if event_id:
                try:
                    del_response = requests.delete(
                        f"{BASE_URL}/api/events/{event_id}",
                        headers=headers,
                        timeout=TIMEOUT
                    )
                    if del_response.status_code not in (200, 204):
                        print(f"Warning: Failed to delete event {event_id}, status code {del_response.status_code}")
                except Exception as ex:
                    print(f"Warning: Exception during cleanup delete request: {ex}")

    # Now test unauthorized creation (invalid token)
    bad_headers = {"Content-Type": "application/json", "Authorization": "Bearer invalidtoken"}
    bad_response = requests.post(
        f"{BASE_URL}/api/events",
        headers=bad_headers,
        json=event_data,
        timeout=TIMEOUT
    )
    assert bad_response.status_code in (401, 403), f"Expected unauthorized status, got {bad_response.status_code}"

    # Test missing required fields - missing title
    invalid_event_data = {
        "date": "2025-11-15",
        "time": "14:00",
        "location": "Room 101, IIIT Nagpur",
        "tags": ["AI", "Workshop"]
    }
    invalid_response = requests.post(
        f"{BASE_URL}/api/events",
        headers=headers,
        json=invalid_event_data,
        timeout=TIMEOUT
    )
    assert invalid_response.status_code in (400, 422), f"Expected client error for invalid input, got {invalid_response.status_code}"


test_create_event_with_admin_authorization_and_valid_data()
