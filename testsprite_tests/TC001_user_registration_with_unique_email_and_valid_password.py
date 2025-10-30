import requests
import uuid
import base64

BASE_URL = "http://localhost:5000"
REGISTER_ENDPOINT = "/api/auth/register"

# Basic token auth header value
def get_basic_auth_header(username: str, password: str) -> str:
    token = f"{username}:{password}"
    b64_token = base64.b64encode(token.encode()).decode()
    return f"Basic {b64_token}"

HEADERS = {
    "Authorization": get_basic_auth_header("aryan@iiitn.ac.in", "aryan123"),
    "Content-Type": "application/json"
}

def test_user_registration_unique_email_valid_password():
    unique_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    user_payload = {
        "name": "Test User",
        "email": unique_email,
        "password": "StrongP@ssw0rd",
        "skills": ["Python", "Testing"],
        "interests": ["AI", "Campus Events"]
    }

    # Register user first time - expect success 201
    response = requests.post(
        f"{BASE_URL}{REGISTER_ENDPOINT}",
        json=user_payload,
        headers=HEADERS,
        timeout=30
    )
    assert response.status_code == 201, f"Expected 201, got {response.status_code}. Response: {response.text}"
    json_data = response.json()
    assert "token" in json_data, "JWT token not found in response"
    assert "user" in json_data, "User details not found in response"
    user_details = json_data["user"]
    assert user_details.get("email") == unique_email, "Returned email does not match"

    # Try registering the same email again - should fail with 400 and proper error message
    dup_response = requests.post(
        f"{BASE_URL}{REGISTER_ENDPOINT}",
        json=user_payload,
        headers=HEADERS,
        timeout=30
    )
    assert dup_response.status_code == 400, f"Expected 400 on duplicate registration, got {dup_response.status_code}. Response: {dup_response.text}"
    dup_json = dup_response.json()
    # Expect error message or indication of duplication
    error_message = dup_json.get("message") or dup_json.get("error") or ""
    assert "exists" in error_message.lower() or "duplicate" in error_message.lower() or dup_response.reason.lower() == "bad request", "Expected duplicate user error message"

test_user_registration_unique_email_valid_password()