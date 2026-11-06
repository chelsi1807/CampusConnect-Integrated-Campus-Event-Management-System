import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from sqlalchemy.orm import Session

from app.config import settings
from app.models.notification import Notification

logger = logging.getLogger("campusconnect.email")

def send_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "info",
    link: Optional[str] = None,
    user_email: Optional[str] = None
):
    # 1. Create In-App Notification Record
    try:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            link=link
        )
        db.add(notif)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to record in-app notification: {e}")
        db.rollback()

    # 2. SMTP Delivery if configured
    if settings.SMTP_SERVER and settings.SMTP_USER and user_email:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"[CampusConnect] {title}"
            msg["From"] = settings.EMAIL_FROM
            msg["To"] = user_email
            
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #1e3a8a; margin-top: 0;">CampusConnect</h2>
                <h3 style="color: #334155;">{title}</h3>
                <p style="color: #475569; font-size: 15px; line-height: 1.5;">{message}</p>
                {f'<p><a href="{link}" style="background-color: #2563eb; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">View Details</a></p>' if link else ''}
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 25px;" />
                <p style="font-size: 12px; color: #94a3b8;">This is an automated notification from CampusConnect Event Management System.</p>
            </div>
            """
            msg.attach(MIMEText(html_content, "html"))
            
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAIL_FROM, user_email, msg.as_string())
        except Exception as e:
            logger.warning(f"SMTP delivery failed (mocking/logging instead): {e}")
    else:
        logger.info(f"[Mock Email Sent] To: {user_email or f'User #{user_id}'} | Title: {title} | Message: {message}")

