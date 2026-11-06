# CampusConnect – Team Collaboration & Contributing Guide

Welcome to the **CampusConnect** project team! This guide establishes standard workflows for our 3-member development team to collaborate smoothly without merge conflicts.

---

## 1. Team Roles & Responsibilities

| Role | Primary Responsibilities | Key Directory |
|---|---|---|
| **Member 1 (Frontend Lead)** | React components, Tailwind styling, UI/UX polish, responsive design, charts | `frontend/src/` |
| **Member 2 (Backend Lead)** | FastAPI endpoints, authentication, QR attendance, ReportLab certificates | `backend/app/` |
| **Member 3 (Database & QA Lead)** | SQLAlchemy models, Alembic migrations, Pytest suites, integration verification | `backend/tests/`, `backend/alembic/` |

---

## 2. Daily Git Workflow

### Before starting any work:
Always pull the latest changes from `main`:
```bash
git checkout main
git pull origin main
```

### Create a Feature Branch
Do not commit directly to `main`. Create a descriptive branch:
```bash
# Examples:
git checkout -b feature/event-feedback-ui
git checkout -b fix/waitlist-position-reindex
git checkout -b test/attendance-edge-cases
```

### Commit Cleanly
Use conventional commit prefixes:
- `feat:` for new capabilities
- `fix:` for bug fixes
- `test:` for test additions/improvements
- `docs:` for documentation updates
- `style:` for CSS/UI polish

```bash
git add .
git commit -m "feat: add export CSV button for organizer reports"
```

### Push and Open a Pull Request
```bash
git push -u origin feature/your-feature-name
```
Open a Pull Request on GitHub. At least one teammate should review and click **Merge pull request**.

---

## 3. Running Local Tests Before Pushing

Before opening a PR, always ensure tests pass locally:
```powershell
# In backend/
.\venv\Scripts\python.exe -m pytest tests -v
.\venv\Scripts\python.exe verify_system.py

# In frontend/
npm run build
```
*(GitHub Actions CI will also automatically test every push and pull request).*
