import os
import uuid
from datetime import datetime
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from app.config import settings
from app.services.qr_service import save_qr_file

def draw_certificate_background(canvas_obj, doc):
    canvas_obj.saveState()
    width, height = doc.pagesize
    
    # Outer background tint
    canvas_obj.setFillColor(colors.HexColor("#F8FAFC"))
    canvas_obj.rect(0, 0, width, height, fill=1, stroke=0)
    
    # Outer Navy Border
    canvas_obj.setStrokeColor(colors.HexColor("#1E3A8A"))  # Dark Blue
    canvas_obj.setLineWidth(6)
    canvas_obj.rect(20, 20, width - 40, height - 40)
    
    # Inner Gold Border
    canvas_obj.setStrokeColor(colors.HexColor("#D97706"))  # Amber / Gold
    canvas_obj.setLineWidth(2)
    canvas_obj.rect(28, 28, width - 56, height - 56)
    
    # Corner decorative accents
    corner_size = 20
    canvas_obj.setFillColor(colors.HexColor("#1E3A8A"))
    # Top-Left
    canvas_obj.rect(28, height - 28 - corner_size, corner_size, corner_size, fill=1, stroke=0)
    # Top-Right
    canvas_obj.rect(width - 28 - corner_size, height - 28 - corner_size, corner_size, corner_size, fill=1, stroke=0)
    # Bottom-Left
    canvas_obj.rect(28, 28, corner_size, corner_size, fill=1, stroke=0)
    # Bottom-Right
    canvas_obj.rect(width - 28 - corner_size, 28, corner_size, corner_size, fill=1, stroke=0)
    
    # Watermark text in background
    canvas_obj.setFont("Helvetica-Bold", 60)
    canvas_obj.setFillColor(colors.HexColor("#E2E8F0"))
    canvas_obj.saveState()
    canvas_obj.translate(width / 2, height / 2 - 20)
    canvas_obj.rotate(30)
    canvas_obj.drawCentredString(0, 0, "CAMPUSCONNECT")
    canvas_obj.restoreState()
    
    canvas_obj.restoreState()

def generate_certificate_pdf(
    certificate_number: str,
    verification_code: str,
    student_name: str,
    student_id: str,
    event_title: str,
    event_date: str,
    event_venue: str,
    organizer_name: str,
    output_dir: str = "certificates"
) -> str:
    os.makedirs(output_dir, exist_ok=True)
    pdf_filename = f"cert_{certificate_number}.pdf"
    pdf_path = os.path.join(output_dir, pdf_filename)
    
    # Generate verification QR
    verify_url = f"{settings.BASE_URL}/verify-certificate?code={verification_code}"
    qr_filename = f"verify_qr_{verification_code[:8]}.png"
    qr_path = save_qr_file(verify_url, qr_filename, output_dir=os.path.join(output_dir, "temp_qr"))
    
    # Setup document
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=landscape(letter),
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=35
    )
    
    styles = getSampleStyleSheet()
    
    header_style = ParagraphStyle(
        'CertHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=16,
        textColor=colors.HexColor("#1E3A8A"),
        alignment=1, # Center
        spaceAfter=4
    )
    
    sub_header_style = ParagraphStyle(
        'CertSubHeader',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=12,
        textColor=colors.HexColor("#64748B"),
        alignment=1,
        spaceAfter=15
    )
    
    title_style = ParagraphStyle(
        'CertTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=32,
        textColor=colors.HexColor("#D97706"),  # Gold
        alignment=1,
        spaceAfter=15
    )
    
    presented_style = ParagraphStyle(
        'PresentedTo',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#475569"),
        alignment=1,
        spaceAfter=10
    )
    
    name_style = ParagraphStyle(
        'StudentName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#0F172A"),
        alignment=1,
        spaceAfter=12
    )
    
    body_style = ParagraphStyle(
        'CertBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=18,
        textColor=colors.HexColor("#334155"),
        alignment=1,
        spaceAfter=25
    )
    
    meta_style = ParagraphStyle(
        'CertMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#64748B"),
        alignment=0
    )
    
    sign_title_style = ParagraphStyle(
        'SignTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=colors.HexColor("#1E3A8A"),
        alignment=1
    )
    
    sign_sub_style = ParagraphStyle(
        'SignSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#64748B"),
        alignment=1
    )
    
    story = []
    
    # Institute Header
    story.append(Paragraph("CAMPUSCONNECT INTEGRATED CAMPUS SYSTEM", header_style))
    story.append(Paragraph("OFFICE OF STUDENT WELFARE & EXTRA-CURRICULAR AFFAIRS", sub_header_style))
    story.append(Spacer(1, 8))
    
    # Certificate Title
    story.append(Paragraph("CERTIFICATE OF PARTICIPATION", title_style))
    story.append(Spacer(1, 5))
    
    # Body text
    story.append(Paragraph("This is proudly presented to", presented_style))
    
    # Name with ID
    student_display = student_name
    if student_id:
        student_display += f"  <font size=12 color='#64748B'>({student_id})</font>"
    story.append(Paragraph(student_display, name_style))
    
    cert_text = (
        f"for actively attending and demonstrating enthusiastic participation in the official campus event "
        f"<b>\"{event_title}\"</b> held on <b>{event_date}</b> at <b>{event_venue}</b>."
    )
    story.append(Paragraph(cert_text, body_style))
    story.append(Spacer(1, 10))
    
    # Signatures and QR Code Table
    qr_img = Image(qr_path, width=1.1*inch, height=1.1*inch)
    
    signatures_data = [
        [
            Paragraph(f"<b>{organizer_name}</b><br/><font color='#64748B'>Event Organizer & Convener</font>", sign_title_style),
            qr_img,
            Paragraph("<b>Dr. Robert Sterling</b><br/><font color='#64748B'>Dean, Student Affairs</font>", sign_title_style)
        ],
        [
            Paragraph("____________________________", sign_title_style),
            Paragraph(f"<font size=7 color='#64748B'>Scan to Verify Authenticity</font>", ParagraphStyle('C', alignment=1)),
            Paragraph("____________________________", sign_title_style)
        ]
    ]
    
    sign_table = Table(signatures_data, colWidths=[2.6*inch, 2.0*inch, 2.6*inch])
    sign_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(sign_table)
    
    story.append(Spacer(1, 10))
    # Footer verification info
    footer_text = f"Certificate ID: <b>{certificate_number}</b> | Verification Code: <b>{verification_code}</b> | Issued on: {datetime.now().strftime('%B %d, %Y')}"
    story.append(Paragraph(footer_text, ParagraphStyle('Foot', alignment=1, fontSize=8, textColor=colors.HexColor("#94A3B8"))))
    
    doc.build(story, onFirstPage=draw_certificate_background)
    return pdf_path
