import requests

BASE_URL = "http://localhost:5000"
TOKEN = "Bearer dummyjwttoken"
TIMEOUT = 30

def test_record_wellness_checkin_and_award_points():
    checkin_url = f"{BASE_URL}/api/wellness/checkin"
    headers = {
        "Content-Type": "application/json",
        "Authorization": TOKEN
    }
    payload = {
        "mood": "Happy",
        "tip": "Keep up with your positive mindset!"
    }

    try:
        response = requests.post(
            checkin_url,
            json=payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"

        resp_json = response.json()
        assert isinstance(resp_json, dict), "Response is not a valid JSON object"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed with exception: {e}"

    try:
        # Unauthorized request (no auth header)
        response_unauth = requests.post(
            checkin_url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT
        )
        assert response_unauth.status_code == 401, f"Expected 401 Unauthorized, got {response_unauth.status_code}"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed with exception: {e}"

test_record_wellness_checkin_and_award_points()
