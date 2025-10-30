import requests

BASE_URL = "http://localhost:5000"
REGISTER_URL = f"{BASE_URL}/api/auth/register"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
EVENTS_URL = f"{BASE_URL}/api/events"
TIMEOUT = 30

def test_get_recommended_events_with_auth_and_filtering():
    # Test credentials
    email = "aryan@iiitn.ac.in"
    password = "aryan123"
    name = "Aryan TestUser"
    skills = ["Python", "AI"]
    interests = ["Tech", "AI", "Campus"]

    # First, login to get JWT token
    login_payload = {
        "email": email,
        "password": password
    }

    try:
        login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        if login_resp.status_code == 401:
            # User probably doesn't exist, register and then login again
            register_payload = {
                "name": name,
                "email": email,
                "password": password,
                "skills": skills,
                "interests": interests
            }
            reg_resp = requests.post(REGISTER_URL, json=register_payload, timeout=TIMEOUT)
            # Accept 201 Created or 400 User Already Exists
            assert reg_resp.status_code in (201, 400), f"User registration failed with status {reg_resp.status_code}"

            # Try login again
            login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)

        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_json = login_resp.json()
        token = login_json.get("token")
        assert token, "JWT token not found in login response"
    except requests.RequestException as e:
        assert False, f"Login/Register request failed: {e}"

    headers_auth = {
        "Authorization": f"Bearer {token}"
    }

    # 1) Test unauthorized access (no token)
    try:
        unauthorized_resp = requests.get(EVENTS_URL, timeout=TIMEOUT)
        assert unauthorized_resp.status_code == 401, \
            f"Expected 401 Unauthorized without token, got {unauthorized_resp.status_code}"
    except requests.RequestException as e:
        assert False, f"Unauthorized request failed: {e}"

    # 2) Test authorized access - get recommended events
    try:
        auth_resp = requests.get(EVENTS_URL, headers=headers_auth, timeout=TIMEOUT)
        assert auth_resp.status_code == 200, f"Expected 200 OK for authorized request, got {auth_resp.status_code}"
        events = auth_resp.json()
        assert isinstance(events, list), "Events response should be a list"

        # Check that events are filtered by user interests (at least one event should match interests)
        # We assume each event has "tags" field which is a list of strings
        for event in events:
            assert "date" in event or "datetime" in event or "time" in event, \
                "Event should have a date/time field"
            assert "tags" in event and isinstance(event["tags"], list), "Event should have tags as a list"

        # Validate events are sorted by date/time ascending
        def get_event_datetime(ev):
            for key in ("datetime", "date", "time"):
                if key in ev:
                    return ev[key]
            return None

        event_datetimes = [get_event_datetime(ev) for ev in events]
        # Filter out None values (if any event missing date/time)
        event_datetimes = [dt for dt in event_datetimes if dt is not None]
        assert event_datetimes == sorted(event_datetimes), "Events are not sorted by date/time ascending"

        # Validate filtering: each event tags intersects with user interests
        user_interests_set = set(interests)
        for ev in events:
            ev_tags = set(ev.get("tags", []))
            assert ev_tags.intersection(user_interests_set), "Event tags do not match user interests"
    except requests.RequestException as e:
        assert False, f"Authorized events request failed: {e}"

test_get_recommended_events_with_auth_and_filtering()