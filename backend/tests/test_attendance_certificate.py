import pytest

def test_attendance_and_certificate_flow(client):
    # Log in as admin
    admin_token = client.post(
        "/api/auth/login",
        json={"email": "admin@campusconnect.edu", "password": "Admin@123"}
    ).json()["access_token"]

    # Create event
    cat_id = client.get("/api/categories/").json()[0]["id"]
    ev_res = client.post(
        "/api/events/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "title": "Robotics Seminar",
            "description": "Autonomous bots",
            "category_id": cat_id,
            "date": "2026-12-20",
            "start_time": "09:00 AM",
            "end_time": "01:00 PM",
            "venue": "Seminar Hall",
            "capacity": 10,
            "waitlist_capacity": 5,
            "registration_deadline": "2026-12-19"
        }
    )
    event_id = ev_res.json()["id"]

    # Register student
    client.post(
        "/api/auth/register",
        json={"email": "att_student@test.edu", "password": "Password123!", "full_name": "Attendance Student", "role": "student"}
    )
    stu_token = client.post(
        "/api/auth/login",
        json={"email": "att_student@test.edu", "password": "Password123!"}
    ).json()["access_token"]

    reg_res = client.post(
        "/api/registrations/",
        headers={"Authorization": f"Bearer {stu_token}"},
        json={"event_id": event_id}
    )
    reg_code = reg_res.json()["registration_code"]
    reg_id = reg_res.json()["id"]

    # 1. Organizer marks attendance via QR code
    checkin_res = client.post(
        "/api/attendance/check-in",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"registration_code": reg_code, "event_id": event_id, "check_in_method": "qr_scan"}
    )
    assert checkin_res.status_code == 200
    assert checkin_res.json()["registration_id"] == reg_id

    # 2. Prevent duplicate check-in
    dup_res = client.post(
        "/api/attendance/check-in",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"registration_code": reg_code, "event_id": event_id}
    )
    assert dup_res.status_code == 400
    assert "already checked in" in dup_res.json()["detail"].lower()

    # 3. Generate Certificate
    cert_res = client.post(
        f"/api/certificates/generate/{reg_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert cert_res.status_code == 200
    cert_data = cert_res.json()
    assert "certificate_number" in cert_data
    verify_code = cert_data["verification_code"]

    # 4. Public certificate verification
    verify_res = client.get(f"/api/certificates/verify/{verify_code}")
    assert verify_res.status_code == 200
    assert verify_res.json()["is_valid"] is True
    assert verify_res.json()["issued_to"] == "Attendance Student"

