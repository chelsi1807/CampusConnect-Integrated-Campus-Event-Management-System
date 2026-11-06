import pytest

def register_user(client, email, name, role="student"):
    res = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "Password123!",
            "full_name": name,
            "role": role
        }
    )
    return res.json()["access_token"]

def test_capacity_and_waitlist_auto_promotion(client):
    admin_token = client.post(
        "/api/auth/login",
        json={"email": "admin@campusconnect.edu", "password": "Admin@123"}
    ).json()["access_token"]

    # 1. Admin creates an event with capacity = 1 and waitlist_capacity = 2
    cat_res = client.get("/api/categories/")
    cat_id = cat_res.json()[0]["id"]

    ev_res = client.post(
        "/api/events/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "title": "Micro Workshop Test",
            "description": "Capacity testing",
            "category_id": cat_id,
            "date": "2026-12-15",
            "start_time": "10:00 AM",
            "end_time": "12:00 PM",
            "venue": "Lab 1",
            "capacity": 1,
            "waitlist_capacity": 5,
            "registration_deadline": "2026-12-14",
            "eligibility": "All"
        }
    )
    event_id = ev_res.json()["id"]

    # 2. Student A registers -> Confirmed (Seat 1/1)
    tok_a = register_user(client, "student_a@test.edu", "Student A")
    res_a = client.post(
        "/api/registrations/",
        headers={"Authorization": f"Bearer {tok_a}"},
        json={"event_id": event_id}
    )
    assert res_a.status_code == 201
    assert res_a.json()["status"] == "confirmed"
    reg_a_id = res_a.json()["id"]

    # 3. Student B registers -> Event full, automatically waitlisted (Position #1)
    tok_b = register_user(client, "student_b@test.edu", "Student B")
    res_b = client.post(
        "/api/registrations/",
        headers={"Authorization": f"Bearer {tok_b}"},
        json={"event_id": event_id}
    )
    assert res_b.status_code == 201
    assert res_b.json()["status"] == "waitlisted"
    assert res_b.json()["waitlist_position"] == 1
    reg_b_id = res_b.json()["id"]

    # 4. Student A cancels registration
    cancel_res = client.post(
        f"/api/registrations/{reg_a_id}/cancel",
        headers={"Authorization": f"Bearer {tok_a}"}
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

    # 5. Verify Student B was automatically promoted to 'confirmed'!
    my_regs_b = client.get(
        "/api/registrations/my-registrations",
        headers={"Authorization": f"Bearer {tok_b}"}
    )
    assert my_regs_b.status_code == 200
    b_records = my_regs_b.json()
    b_reg = [r for r in b_records if r["id"] == reg_b_id][0]
    assert b_reg["status"] == "confirmed"
    assert b_reg["waitlist_position"] is None
