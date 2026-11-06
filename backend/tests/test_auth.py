import pytest

def test_register_student(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test.student@example.edu",
            "password": "Password123!",
            "full_name": "Test Student",
            "role": "student",
            "department": "Computer Science",
            "student_id": "CS-TEST-01"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test.student@example.edu"
    assert data["user"]["role"] == "student"

def test_duplicate_registration_rejected(client):
    client.post(
        "/api/auth/register",
        json={
            "email": "dup@example.edu",
            "password": "Password123!",
            "full_name": "Duplicate User",
            "role": "student"
        }
    )
    response = client.post(
        "/api/auth/register",
        json={
            "email": "dup@example.edu",
            "password": "Password123!",
            "full_name": "Duplicate User",
            "role": "student"
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()

def test_login_success_and_failure(client):
    client.post(
        "/api/auth/register",
        json={
            "email": "login_user@example.edu",
            "password": "SecretPassword123",
            "full_name": "Login Tester",
            "role": "student"
        }
    )
    
    # Success
    res = client.post(
        "/api/auth/login",
        json={"email": "login_user@example.edu", "password": "SecretPassword123"}
    )
    assert res.status_code == 200
    assert "access_token" in res.json()

    # Wrong password
    res_fail = client.post(
        "/api/auth/login",
        json={"email": "login_user@example.edu", "password": "WrongPassword"}
    )
    assert res_fail.status_code == 401
