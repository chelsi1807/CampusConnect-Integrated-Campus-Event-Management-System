import sys
import os
import io

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def run_system_verification():
    print("=" * 70)
    print("CampusConnect – End-to-End System Verification Test")
    print("=" * 70)

    client = TestClient(app)

    # 1. Health check
    res = client.get("/")
    assert res.status_code == 200, "Root health check failed"
    print(" [1/9] Root health check: OK")

    # 2. Authentication: Student Login
    res = client.post("/api/auth/login", json={"email": "david.student@campusconnect.edu", "password": "Student@123"})
    assert res.status_code == 200, "Student login failed"
    student_token = res.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print(f" [2/9] Student login: OK (Welcome {res.json()['user']['full_name']})")

    # 3. Authentication: Organizer Login
    res = client.post("/api/auth/login", json={"email": "sarah.organizer@campusconnect.edu", "password": "Organizer@123"})
    assert res.status_code == 200, "Organizer login failed"
    org_token = res.json()["access_token"]
    org_headers = {"Authorization": f"Bearer {org_token}"}
    print(f" [3/9] Organizer login: OK (Welcome {res.json()['user']['full_name']})")

    # 4. Authentication: Admin Login
    res = client.post("/api/auth/login", json={"email": "admin@campusconnect.edu", "password": "Admin@123"})
    assert res.status_code == 200, "Admin login failed"
    admin_token = res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print(f" [4/9] Admin login: OK (Welcome {res.json()['user']['full_name']})")

    # 5. Event Discovery: List approved events
    res = client.get("/api/events/")
    assert res.status_code == 200
    events = res.json()["events"]
    assert len(events) >= 3, "Expected at least 3 approved/completed events"
    print(f" [5/9] Event Discovery: OK ({len(events)} public events found)")

    # 6. Event Lifecycle & Admin Approval:
    # Check pending approvals
    res = client.get("/api/events/admin/pending-approvals", headers=admin_headers)
    assert res.status_code == 200
    pending = res.json()
    if pending:
        pending_id = pending[0]["id"]
        title = pending[0]["title"]
        # Approve it
        rev_res = client.post(f"/api/events/{pending_id}/review", headers=admin_headers, json={"status": "approved"})
        assert rev_res.status_code == 200
        assert rev_res.json()["status"] == "approved"
        print(f" [6/9] Admin Review Queue: OK (Approved '{title}')")
    else:
        print(" [6/9] Admin Review Queue: OK (No pending items)")

    # 7. QR Attendance & Duplicate Check-in Prevention
    # Fetch David's registrations
    res = client.get("/api/registrations/my-registrations", headers=student_headers)
    assert res.status_code == 200
    regs = res.json()
    confirmed_reg = next((r for r in regs if r["status"] == "confirmed"), None)
    if confirmed_reg:
        code = confirmed_reg["registration_code"]
        event_id = confirmed_reg["event_id"]
        # Mark attendance with organizer credentials
        checkin_res = client.post("/api/attendance/check-in", headers=org_headers, json={
            "registration_code": code,
            "event_id": event_id,
            "check_in_method": "qr_scan"
        })
        assert checkin_res.status_code == 200, f"Check-in failed: {checkin_res.text}"
        print(f" [7/9] QR Attendance Scan: OK (Checked in {code} for event #{event_id})")

        # Try duplicate check-in (Must be rejected with 400 according to REQ-F20)
        dup_res = client.post("/api/attendance/check-in", headers=org_headers, json={
            "registration_code": code,
            "event_id": event_id
        })
        assert dup_res.status_code == 400, "Duplicate attendance was not rejected!"
        print(" [7/9b] Duplicate Attendance Prevention: OK (Properly rejected duplicate check-in)")

    # 8. Certificate Generation & Verification
    res = client.get("/api/certificates/my-certificates", headers=student_headers)
    assert res.status_code == 200
    certs = res.json()
    assert len(certs) >= 1, "Expected at least 1 certificate for David"
    cert = certs[0]
    verify_code = cert["verification_code"]
    cert_num = cert["certificate_number"]
    
    # Verify public endpoint
    v_res = client.get(f"/api/certificates/verify/{verify_code}")
    assert v_res.status_code == 200
    assert v_res.json()["is_valid"] is True
    print(f" [8/9] Certificate Verification: OK (Verified {cert_num} for {v_res.json()['issued_to']})")

    # Download PDF
    pdf_res = client.get(f"/api/certificates/download/{cert_num}")
    assert pdf_res.status_code == 200
    assert pdf_res.headers.get("content-type") == "application/pdf"
    assert len(pdf_res.content) > 1000
    print(f" [8/9b] Certificate PDF Download: OK ({len(pdf_res.content)} bytes PDF generated)")

    # 9. Analytics & Reporting Dashboard
    res = client.get("/api/analytics/admin", headers=admin_headers)
    assert res.status_code == 200
    analytics = res.json()
    assert analytics["total_users"] >= 7
    print(f" [9/9] Analytics Dashboards: OK ({analytics['total_users']} users, {analytics['total_events']} events, {analytics['total_registrations']} registrations)")

    print("=" * 70)
    print("ALL 9 CORE ARCHITECTURAL VERIFICATION CHECKS PASSED PERFECTLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_system_verification()

