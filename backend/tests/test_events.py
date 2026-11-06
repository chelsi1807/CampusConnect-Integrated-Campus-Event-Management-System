import pytest

def get_auth_token(client, email, role="organizer"):
    client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "Password123!",
            "full_name": "Test Organizer",
            "role": role
        }
    )
    res = client.post(
        "/api/auth/login",
        json={"email": email, "password": "Password123!"}
    )
    return res.json()["access_token"]

def test_event_lifecycle(client):
    org_token = get_auth_token(client, "org_lifecycle@example.edu", "organizer")
    
    # 1. Fetch categories
    cat_res = client.get("/api/categories/")
    cats = cat_res.json()
    cat_id = cats[0]["id"] if cats else 1

    # 2. Organizer creates event
    create_res = client.post(
        "/api/events/",
        headers={"Authorization": f"Bearer {org_token}"},
        json={
            "title": "Cloud Architecture Summit 2026",
            "description": "Deep dive into serverless and containers.",
            "category_id": cat_id,
            "date": "2026-12-10",
            "start_time": "10:00 AM",
            "end_time": "04:00 PM",
            "venue": "Hall B",
            "capacity": 50,
            "waitlist_capacity": 20,
            "registration_deadline": "2026-12-09",
            "eligibility": "All students"
        }
    )
    assert create_res.status_code == 201
    event_data = create_res.json()
    event_id = event_data["id"]
    # Newly created event by organizer must be pending
    assert event_data["status"] == "pending"

    # 3. Check that it does not show up in student public approved list
    public_res = client.get("/api/events/")
    event_ids = [e["id"] for e in public_res.json()["events"]]
    assert event_id not in event_ids

    # 4. Admin reviews and approves event
    admin_token = client.post(
        "/api/auth/login",
        json={"email": "admin@campusconnect.edu", "password": "Admin@123"}
    ).json()["access_token"]

    review_res = client.post(
        f"/api/events/{event_id}/review",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "approved"}
    )
    assert review_res.status_code == 200
    assert review_res.json()["status"] == "approved"

    # 5. Now it should appear in public approved events
    public_res2 = client.get("/api/events/")
    event_ids2 = [e["id"] for e in public_res2.json()["events"]]
    assert event_id in event_ids2
