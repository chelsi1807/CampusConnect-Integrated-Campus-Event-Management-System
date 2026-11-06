from sqlalchemy.orm import Session, sessionmaker
from datetime import datetime, timedelta, timezone
import json
import uuid

from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.category import Category
from app.models.event import Event
from app.models.registration import Registration
from app.models.attendance import Attendance
from app.models.certificate import Certificate
from app.models.feedback import Feedback
from app.models.notification import Notification
from app.services.auth_service import get_password_hash
from app.services.qr_service import generate_registration_code, generate_qr_base64
from app.services.certificate_service import generate_certificate_pdf

def seed_database(target_engine=None, db_session=None):
    use_engine = target_engine or engine
    Base.metadata.create_all(bind=use_engine)
    
    close_when_done = False
    if db_session:
        db = db_session
    else:
        if target_engine:
            CustomMaker = sessionmaker(autocommit=False, autoflush=False, bind=target_engine)
            db = CustomMaker()
        else:
            db = SessionLocal()
        close_when_done = True

    # Check if already seeded
    if db.query(User).filter(User.email == "admin@campusconnect.edu").first():
        print("Database already contains seed data. Skipping.")
        db.close()
        return

    print("Seeding CampusConnect database with realistic campus data...")

    # 1. Users
    admin = User(
        email="admin@campusconnect.edu",
        hashed_password=get_password_hash("Admin@123"),
        full_name="Dr. Eleanor Vance",
        role="admin",
        department="Academic Administration",
        student_id="EMP-ADM-001",
        phone="+1 555-0199",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        is_active=True
    )
    db.add(admin)

    organizer1 = User(
        email="sarah.organizer@campusconnect.edu",
        hashed_password=get_password_hash("Organizer@123"),
        full_name="Prof. Sarah Jenkins",
        role="organizer",
        department="Computer Science & Engineering",
        student_id="FAC-CS-104",
        phone="+1 555-0142",
        avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        is_active=True
    )
    organizer2 = User(
        email="alex.organizer@campusconnect.edu",
        hashed_password=get_password_hash("Organizer@123"),
        full_name="Marcus Brody",
        role="organizer",
        department="Student Cultural Council",
        student_id="STU-CUL-502",
        phone="+1 555-0188",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        is_active=True
    )
    db.add_all([organizer1, organizer2])

    student1 = User(
        email="david.student@campusconnect.edu",
        hashed_password=get_password_hash("Student@123"),
        full_name="David Chen",
        role="student",
        department="Information Technology",
        student_id="IT2024-042",
        phone="+1 555-0211",
        avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        is_active=True
    )
    student2 = User(
        email="priya.student@campusconnect.edu",
        hashed_password=get_password_hash("Student@123"),
        full_name="Priya Sharma",
        role="student",
        department="Computer Science & Engineering",
        student_id="CS2024-089",
        phone="+1 555-0233",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        is_active=True
    )
    student3 = User(
        email="emma.student@campusconnect.edu",
        hashed_password=get_password_hash("Student@123"),
        full_name="Emma Watson",
        role="student",
        department="Electrical Engineering",
        student_id="EE2024-015",
        phone="+1 555-0245",
        avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        is_active=True
    )
    student4 = User(
        email="rahul.student@campusconnect.edu",
        hashed_password=get_password_hash("Student@123"),
        full_name="Rahul Verma",
        role="student",
        department="Mechanical Engineering",
        student_id="ME2024-067",
        phone="+1 555-0299",
        avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        is_active=True
    )
    db.add_all([student1, student2, student3, student4])
    db.commit()

    # 2. Categories
    cat_tech = Category(name="Technical & Coding", description="Coding contests, hackathons, and software engineering meetups.", icon="Code", color="blue")
    cat_hack = Category(name="Hackathons & Challenges", description="Multi-day build competitions and innovation sprints.", icon="Cpu", color="indigo")
    cat_work = Category(name="Workshops & Masterclasses", description="Hands-on technical skill building and tool deep dives.", icon="BookOpen", color="emerald")
    cat_cult = Category(name="Cultural & Arts", description="Music, drama, dance, art exhibitions, and festival nights.", icon="Sparkles", color="amber")
    cat_semi = Category(name="Seminars & Keynotes", description="Distinguished talks by industry leaders and researchers.", icon="GraduationCap", color="purple")
    cat_spor = Category(name="Sports & Athletics", description="Inter-department sports meets and esports tournaments.", icon="Trophy", color="rose")
    db.add_all([cat_tech, cat_hack, cat_work, cat_cult, cat_semi, cat_spor])
    db.commit()

    # 3. Events
    today = datetime.now()
    d_past = (today - timedelta(days=5)).strftime("%Y-%m-%d")
    d_soon = (today + timedelta(days=3)).strftime("%Y-%m-%d")
    d_next_week = (today + timedelta(days=7)).strftime("%Y-%m-%d")
    d_two_weeks = (today + timedelta(days=14)).strftime("%Y-%m-%d")
    d_month = (today + timedelta(days=25)).strftime("%Y-%m-%d")

    # Completed Event (with attended students, certificates, feedback)
    ev_completed = Event(
        title="CyberSecurity Red Team / Blue Team CTF Challenge",
        description="A rigorous campus-wide Capture-The-Flag tournament focusing on network vulnerability scanning, reverse engineering, web exploitation, and defensive hardening. Teams competed under simulated cyber-defense attack scenarios.",
        category_id=cat_tech.id,
        organizer_id=organizer1.id,
        date=d_past,
        start_time="09:00 AM",
        end_time="05:00 PM",
        venue="Turing Cyber Defense Laboratory (Room 304)",
        capacity=30,
        waitlist_capacity=10,
        registration_deadline=(today - timedelta(days=6)).strftime("%Y-%m-%d"),
        banner_url="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
        eligibility="Open to all engineering students with basic Linux & networking familiarity.",
        status="completed",
        reviewed_by_id=admin.id,
        reviewed_at=today - timedelta(days=20)
    )

    # Approved Upcoming Event 1 (Hackathon - High capacity)
    ev_hackathon = Event(
        title="HackVision 2026: 36-Hour National Campus AI Sprint",
        description="Join over 200 passionate student developers, designers, and domain thinkers for our flagship 36-hour hackathon. Tracks include Generative AI, Sustainable Smart Cities, HealthTech, and Decentralized Web. Mentorship from industry sponsors, free meals, swag, and $10,000 in prizes!",
        category_id=cat_hack.id,
        organizer_id=organizer1.id,
        date=d_soon,
        start_time="08:30 AM",
        end_time="08:30 PM",
        venue="APJ Abdul Kalam Grand Auditorium & Innovation Hub",
        capacity=100,
        waitlist_capacity=50,
        registration_deadline=d_soon,
        banner_url="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
        eligibility="Undergraduate and postgraduate students in teams of 2 to 4.",
        status="approved",
        reviewed_by_id=admin.id,
        reviewed_at=today - timedelta(days=5)
    )

    # Approved Upcoming Event 2 (Workshop with Small Capacity - Intentionally Full to demo waitlist!)
    ev_workshop_full = Event(
        title="Production React 19 & Cloud-Native Microservices Masterclass",
        description="An intensive hands-on lab setting up modern React applications with Vite, state machines, Docker containers, and automated deployment pipelines. Limited seating to ensure 1-on-1 mentorship for every participant.",
        category_id=cat_work.id,
        organizer_id=organizer1.id,
        date=d_next_week,
        start_time="02:00 PM",
        end_time="06:00 PM",
        venue="Advanced Software Engineering Lab (Lab 2)",
        capacity=2,  # Intentionally set to 2 so student1 & student2 fill it, and student3 is waitlisted!
        waitlist_capacity=10,
        registration_deadline=d_next_week,
        banner_url="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
        eligibility="Basic JavaScript and HTML knowledge required.",
        status="approved",
        reviewed_by_id=admin.id,
        reviewed_at=today - timedelta(days=2)
    )

    # Approved Cultural Event
    ev_cultural = Event(
        title="Rhythm & Roots: Annual Campus Inter-College Cultural Gala",
        description="A celebratory showcase of music bands, classical and contemporary dance ensembles, fine arts exhibitions, street plays, and celebrity guest performances under the campus amphitheater stars.",
        category_id=cat_cult.id,
        organizer_id=organizer2.id,
        date=d_two_weeks,
        start_time="05:30 PM",
        end_time="10:30 PM",
        venue="Open Air Central Amphitheater",
        capacity=250,
        waitlist_capacity=100,
        registration_deadline=d_two_weeks,
        banner_url="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
        eligibility="Open to all college students, faculty, and alumni.",
        status="approved",
        reviewed_by_id=admin.id,
        reviewed_at=today - timedelta(days=3)
    )

    # Pending Event (To showcase Admin review queue & approval/rejection modal!)
    ev_pending = Event(
        title="Quantum Computing & Photonic Hardware Exploration Symposium",
        description="A specialized faculty seminar inviting keynote speakers from IBM Quantum and NIST to introduce superconducting qubits, quantum error mitigation, and photonic quantum gates.",
        category_id=cat_semi.id,
        organizer_id=organizer1.id,
        date=d_month,
        start_time="11:00 AM",
        end_time="03:00 PM",
        venue="Senate Hall, Science Complex",
        capacity=60,
        waitlist_capacity=20,
        registration_deadline=d_month,
        banner_url="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80",
        eligibility="Pre-final and final year Physics, EE, and CS majors.",
        status="pending"
    )

    db.add_all([ev_completed, ev_hackathon, ev_workshop_full, ev_cultural, ev_pending])
    db.commit()

    # 4. Registrations for Completed CTF Event (Students attended & have certificates)
    for stu in [student1, student2]:
        reg_code = generate_registration_code(ev_completed.id, stu.id)
        qr_b64 = generate_qr_base64(json.dumps({"code": reg_code, "event_id": ev_completed.id, "user_id": stu.id}))
        reg = Registration(
            event_id=ev_completed.id,
            user_id=stu.id,
            status="attended",
            registration_code=reg_code,
            qr_code_data=qr_b64,
            created_at=today - timedelta(days=10)
        )
        db.add(reg)
        db.commit()
        db.refresh(reg)

        # Attendance Record
        att = Attendance(
            registration_id=reg.id,
            event_id=ev_completed.id,
            user_id=stu.id,
            checked_in_at=today - timedelta(days=5, hours=7),
            verified_by_id=organizer1.id,
            check_in_method="qr_scan"
        )
        db.add(att)

        # Certificate
        year = datetime.now().year
        cert_num = f"CERT-{year}-CC{ev_completed.id}{stu.id}-{uuid.uuid4().hex[:6].upper()}"
        verify_code = uuid.uuid4().hex
        pdf_path = generate_certificate_pdf(
            certificate_number=cert_num,
            verification_code=verify_code,
            student_name=stu.full_name,
            student_id=stu.student_id or "",
            event_title=ev_completed.title,
            event_date=ev_completed.date,
            event_venue=ev_completed.venue,
            organizer_name=organizer1.full_name,
            output_dir="certificates"
        )
        cert = Certificate(
            certificate_number=cert_num,
            verification_code=verify_code,
            registration_id=reg.id,
            event_id=ev_completed.id,
            user_id=stu.id,
            issued_at=today - timedelta(days=4),
            pdf_path=pdf_path
        )
        db.add(cert)

        # Feedback
        fb = Feedback(
            event_id=ev_completed.id,
            user_id=stu.id,
            rating=5 if stu.id == student1.id else 4,
            content_rating=5,
            organization_rating=5,
            venue_rating=4,
            comment="Incredible hands-on CTF! The network defense challenges were challenging and taught me practical skills that I can't wait to use in upcoming competitions."
        )
        db.add(fb)

    # 5. Registrations for Hackathon (Upcoming)
    for stu in [student1, student3, student4]:
        reg_code = generate_registration_code(ev_hackathon.id, stu.id)
        qr_b64 = generate_qr_base64(json.dumps({"code": reg_code, "event_id": ev_hackathon.id, "user_id": stu.id}))
        reg = Registration(
            event_id=ev_hackathon.id,
            user_id=stu.id,
            status="confirmed",
            registration_code=reg_code,
            qr_code_data=qr_b64,
            created_at=today - timedelta(days=1)
        )
        db.add(reg)

    # 6. Registrations for Full Workshop (Testing Capacity & Waitlist!)
    # Capacity is 2: student1 & student2 get confirmed seats
    for stu in [student1, student2]:
        reg_code = generate_registration_code(ev_workshop_full.id, stu.id)
        qr_b64 = generate_qr_base64(json.dumps({"code": reg_code, "event_id": ev_workshop_full.id, "user_id": stu.id}))
        reg = Registration(
            event_id=ev_workshop_full.id,
            user_id=stu.id,
            status="confirmed",
            registration_code=reg_code,
            qr_code_data=qr_b64,
            created_at=today - timedelta(days=2)
        )
        db.add(reg)
    
    # student3 joins the waitlist (Waitlist Position #1)
    reg_code_w = generate_registration_code(ev_workshop_full.id, student3.id)
    qr_b64_w = generate_qr_base64(json.dumps({"code": reg_code_w, "event_id": ev_workshop_full.id, "user_id": student3.id}))
    reg_waitlist = Registration(
        event_id=ev_workshop_full.id,
        user_id=student3.id,
        status="waitlisted",
        waitlist_position=1,
        registration_code=reg_code_w,
        qr_code_data=qr_b64_w,
        created_at=today - timedelta(days=1)
    )
    db.add(reg_waitlist)

    # 7. Notifications
    notif1 = Notification(
        user_id=student1.id,
        title="Registration Confirmed: HackVision 2026",
        message="Your entry pass and QR code have been generated. See you at APJ Abdul Kalam Auditorium!",
        type="success",
        link="/student/registrations"
    )
    notif2 = Notification(
        user_id=student1.id,
        title="Certificate Issued: CyberSecurity CTF",
        message="Your verified certificate of participation is now available to download.",
        type="success",
        link="/student/certificates"
    )
    notif3 = Notification(
        user_id=student3.id,
        title="Added to Waitlist: React 19 Workshop",
        message="You are currently #1 on the waiting list. We will notify you if a confirmed student cancels.",
        type="info",
        link="/student/registrations"
    )
    notif4 = Notification(
        user_id=admin.id,
        title="Event Approval Request",
        message="Organizer Prof. Sarah Jenkins submitted 'Quantum Computing Symposium' for approval.",
        type="warning",
        link="/admin/approvals"
    )
    db.add_all([notif1, notif2, notif3, notif4])

    db.commit()
    print("Database successfully seeded with realistic users, categories, events, waitlists, attendance, and certificates!")
    db.close()

if __name__ == "__main__":
    seed_database()
