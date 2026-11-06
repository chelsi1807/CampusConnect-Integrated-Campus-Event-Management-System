from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class AdminAnalyticsResponse(BaseModel):
    total_users: int
    total_students: int
    total_organizers: int
    total_events: int
    pending_approvals: int
    approved_events: int
    completed_events: int
    total_registrations: int
    total_attendance: int
    total_certificates: int
    events_by_category: List[Dict[str, Any]]
    monthly_registrations: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]

class OrganizerAnalyticsResponse(BaseModel):
    total_events: int
    active_events: int
    completed_events: int
    total_registrations: int
    total_attendees: int
    overall_attendance_rate: float
    average_feedback_rating: float
    events_overview: List[Dict[str, Any]]

class StudentAnalyticsResponse(BaseModel):
    total_registered: int
    attended_count: int
    waitlisted_count: int
    certificates_earned: int
    upcoming_events_count: int
