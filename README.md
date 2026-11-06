# CampusConnect – Integrated Campus Event Management System
**Version 1.0** | Enterprise-Grade Full-Stack University Web Application

---

## 1. Project Overview

**CampusConnect** is a comprehensive, production-ready, full-stack campus event management application designed to eliminate fragmented WhatsApp groups, paper sign-ups, and manual spreadsheets in university environments.

It provides centralized discovery and registration, automated capacity control and waitlist handling, dynamic cryptographic QR entry passes, camera-based attendance scanning, tamper-proof ReportLab digital PDF certificates, participant feedback loops, and institutional analytics dashboards.

### System Sequence Diagram Flow
```
+-------------------------------------------------------------------------------------------------------+
|  Student (Participant)        Frontend (React)         Backend (FastAPI)       Database (PostgreSQL)  |
|          |                            |                        |                         |            |
|          |-- 1. Register/Login ------>|-- 2. /api/auth/login ->|-- 3. Validate creds --->|            |
|          |<-- 4. JWT Token + User ----|<-- 5. 200 OK + Token --|<-- 6. User Record ------|            |
|          |                            |                        |                         |            |
|          |-- 7. Browse Events ------->|-- 8. /api/events/ ---->|-- 9. Fetch approved --->|            |
|          |<-- 10. Display Cards ------|<-- 11. Event Data -----|<-- 12. Records ---------|            |
|          |                            |                        |                         |            |
|          |-- 13. Register ----------->|-- 14. /registrations ->|-- 15. Check capacity -->|            |
|          |                            |                        |  [Capacity Available]   |            |
|          |<-- 16. Confirmed + QR -----|<-- 17. Return Pass ----|-- 18. Save Reg record ->|            |
|          |                            |                        |  [Capacity Full]        |            |
|          |<-- 19. Waitlist #Pos ------|<-- 20. Return Queue ---|-- 21. Queue Waitlist ---|            |
|          |                            |                        |                         |            |
|  [At Event: Show QR]                  |                        |                         |            |
|          |-- 22. Present QR Pass ----------------------------->|-- 23. /attendance ------|            |
|          |                            |                        |-- 24. Verify & Record ->|            |
|          |<-- 25. Check-in Success ----------------------------|-- 26. Attendance OK ----|            |
|          |                            |                        |                         |            |
|  [Post-Event: Certificate]            |                        |                         |            |
|          |-- 27. Download Cert ------>|-- 28. /certificates -->|-- 29. ReportLab PDF --->|            |
|          |<-- 30. Verified PDF -------|<-- 31. PDF Stream -----|<-- 32. Verification Code|            |
+-------------------------------------------------------------------------------------------------------+
```

---

## 2. Technology Stack

### Frontend
- **React.js 19**: Component-based modern frontend.
- **Vite 8**: Next-generation lightning-fast build tooling and HMR.
- **Tailwind CSS 4**: Modern utility-first styling with `@tailwindcss/vite`.
- **React Router 7**: Client-side single-page routing with protected route guards.
- **Axios**: HTTP client with request/response JWT interceptors.
- **Recharts 3**: Interactive SVG data visualizations (Area charts, Pie charts, Bar charts).
- **Lucide React**: Clean, modern iconography.
- **html5-qrcode**: Browser-native camera QR code scanning engine.
- **canvas-confetti**: Celebration animations for confirmed registrations and certificates.

### Backend
- **Python 3.11+ / FastAPI**: Modern, high-performance async REST framework.
- **Uvicorn**: High-performance ASGI production web server.
- **SQLAlchemy 2.0**: Enterprise ORM with relationship mapping and constraints.
- **Pydantic v2**: Type validation, data parsing, and JSON serialization.
- **Alembic**: Database schema migrations (`alembic upgrade head`).
- **PostgreSQL / SQLite**: Dual-mode database compatibility (defaults to local SQLite for zero-config testing; set `DATABASE_URL` for PostgreSQL).
- **bcrypt & python-jose**: Military-grade password hashing and JWT authentication tokens.
- **qrcode (PIL)**: Dynamic generation of high-contrast base64 QR codes.
- **ReportLab**: High-resolution landscape PDF certificate generation with academic seal, signatures, watermark, and embedded verification QR.

---

## 3. Seed Demo Accounts

The database comes pre-seeded with realistic university data. Use these accounts for testing or use the **Demo Switcher** pill in the top navigation bar:

| Role | Name | Email Address | Password |
|---|---|---|---|
| **Administrator** | Dr. Eleanor Vance | `admin@campusconnect.edu` | `Admin@123` |
| **Event Organizer** | Prof. Sarah Jenkins | `sarah.organizer@campusconnect.edu` | `Organizer@123` |
| **Event Organizer** | Marcus Brody | `alex.organizer@campusconnect.edu` | `Organizer@123` |
| **Student** | David Chen | `david.student@campusconnect.edu` | `Student@123` |
| **Student** | Priya Sharma | `priya.student@campusconnect.edu` | `Student@123` |
| **Student** | Emma Watson | `emma.student@campusconnect.edu` | `Student@123` |
| **Student** | Rahul Verma | `rahul.student@campusconnect.edu` | `Student@123` |

---

## 4. Quick Start & Execution

### Option A: Using the Windows Batch Scripts
1. **Start Backend**: Double-click `start_backend.bat` (runs at `http://127.0.0.1:8000`)
2. **Start Frontend**: Double-click `start_frontend.bat` (runs at `http://localhost:5173`)
3. Open `http://localhost:5173` in your browser.

### Option B: Manual Execution

#### 1. Backend Setup
```bash
cd backend
# Create virtual environment (if not already present)
python -m venv venv
venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run migrations (Optional - app automatically migrates & seeds on startup)
alembic upgrade head

# Run backend server
python run.py
```
*API interactive documentation will be available at: `http://127.0.0.1:8000/docs`*

#### 2. Run Backend Pytest Suite
```bash
venv\Scripts\python.exe -m pytest tests -v
```

#### 3. Run Full End-to-End System Verification
```bash
venv\Scripts\python.exe verify_system.py
```

#### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 5. Architectural & Feature Highlights

### 1. Automatic Waitlist Promotion
When an event reaches full capacity, additional students are assigned to an ordered waiting list (e.g. `Waitlist Position #1`). When any confirmed participant cancels their registration:
- Their seat is relinquished.
- The system automatically promotes the first waitlisted student to `confirmed` status.
- All subsequent waitlisted positions are re-indexed (`position = position - 1`).
- An automated in-app and email notification is dispatched to the promoted student.

### 2. QR-Based Attendance Tracking (REQ-F17 - REQ-F21)
- Each confirmed registration generates a unique cryptographic registration identifier and base64 QR code.
- Organizers open the interactive **QR Attendance Scanner** on their phone or laptop.
- The camera detects the code in `< 2 seconds`, validates the event match, records check-in timestamp, and updates attendance statistics in real time.
- Duplicate attendance scans are rejected with an informative error message.
- A manual code input fallback is provided if a student's phone has a cracked screen or dead battery.

### 3. Digital PDF Certificates with Public Verification (REQ-F22 - REQ-F26)
- Students who attended receive official **ReportLab** participation certificates.
- Features: double gold/navy border, academic seal, student full name, roll number, event title, date, venue, and organizing chair signatures.
- Includes a unique **Certificate ID** and an embedded **verification QR code**.
- Anyone can verify authenticity at `/verify-certificate?code=...` or by scanning the certificate's QR code.

### 4. Event Approval Governance Workflow (REQ-F6 - REQ-F10)
- Organizers submit event proposals with capacity limits, deadlines, and requirements.
- Events start in `Pending` review status and are invisible to students.
- Administrators review submissions in the **Event Approvals Queue**, where they can approve them to publish or reject them with a mandatory explanatory reason.

### 5. Participant Feedback & Star Ratings (REQ-F27 - REQ-F30)
- Attended students can submit 1 to 5 star ratings across: Overall Experience, Content Quality, Organization, and Venue Setup, plus written commentary.
- Organizers and administrators receive an aggregated distribution breakdown and satisfaction scores.

---

## 6. Directory Structure

```
Event Management System/
├── backend/
│   ├── alembic/                 # Alembic database migrations
│   ├── app/
│   │   ├── models/              # SQLAlchemy ORM models (User, Event, Registration, etc.)
│   │   ├── schemas/             # Pydantic v2 schemas
│   │   ├── routers/             # FastAPI REST endpoints
│   │   ├── services/            # Auth, QR generation, ReportLab certificates, Email
│   │   ├── config.py            # Settings & environment variables
│   │   ├── database.py          # Database session & engine
│   │   ├── seed_data.py         # Seed dataset script
│   │   └── main.py              # Application entry point & CORS
│   ├── tests/                   # Pytest test suites (6/6 passing)
│   ├── verify_system.py         # Complete end-to-end integration test
│   ├── requirements.txt         # Python dependencies
│   └── run.py                   # Server starter
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios client with JWT interceptors
│   │   ├── context/             # AuthContext, NotificationContext
│   │   ├── components/          # Navbar, Footer, EventCard, StatusBadge, QRPassModal, FeedbackModal
│   │   ├── pages/               # Home, Discovery, EventDetails, VerifyCertificate, Profile, Login, Register
│   │   │   ├── student/         # StudentDashboard, MyRegistrations, MyCertificates
│   │   │   ├── organizer/       # OrganizerDashboard, CreateEvent, ManageEvents, EventAttendees, QRAttendanceScanner
│   │   │   └── admin/           # AdminDashboard, EventApprovals, ManageUsers, ManageCategories
│   │   ├── App.jsx              # React Router configuration
│   │   └── index.css            # Tailwind CSS styling with modern dialog containment
│   ├── package.json
│   └── vite.config.js
├── start_backend.bat            # 1-Click backend launcher
├── start_frontend.bat           # 1-Click frontend launcher
└── README.md                    # Project documentation
```
