import fitz, math, os, shutil

scratch = r'C:\Users\hp5cd\.gemini\antigravity\brain\f1d83353-9a31-4a1d-b62d-faef2c6d81f5'
orig_pdf = r'C:\Users\hp5cd\Downloads\CampusConnect_Experiment_7_Sequence_Collaboration_Diagrams.pdf'
workspace_pdf = r'C:\Users\hp5cd\Desktop\Event Management System\CampusConnect_Experiment_7_Sequence_Collaboration_Diagrams.pdf'
downloads_clean = r'C:\Users\hp5cd\Downloads\CampusConnect_Experiment_7_Sequence_Collaboration_Diagrams_Clean.pdf'
downloads_orig_backup = r'C:\Users\hp5cd\Downloads\CampusConnect_Experiment_7_Sequence_Collaboration_Diagrams_Original_Backup.pdf'

# Backup original if not already backed up
if not os.path.exists(downloads_orig_backup):
    shutil.copy2(orig_pdf, downloads_orig_backup)
    print(f'Created backup of original at {downloads_orig_backup}')

def draw_arrow(page, p_from, p_to, color=(0.125, 0.22, 0.392), size=3.5, width=0.75):
    dx = p_to.x - p_from.x
    dy = p_to.y - p_from.y
    length = math.hypot(dx, dy)
    if length == 0: return
    ux = dx / length
    uy = dy / length
    vx = -uy
    vy = ux
    page.draw_line(p_from, p_to, color=color, width=width)
    p_back = fitz.Point(p_to.x - ux * size, p_to.y - uy * size)
    p_left = fitz.Point(p_back.x + vx * (size * 0.4), p_back.y + vy * (size * 0.4))
    p_right = fitz.Point(p_back.x - vx * (size * 0.4), p_back.y - vy * (size * 0.4))
    page.draw_polyline([p_left, p_to, p_right], color=color, fill=color, width=0.3)

def draw_centered_text(page, rect, text, fontname, fontsize, color, y_offset):
    w = fitz.get_text_length(text, fontname=fontname, fontsize=fontsize)
    x = rect.x0 + (rect.width - w) / 2
    y = rect.y0 + y_offset
    page.insert_text(fitz.Point(x, y), text, fontname=fontname, fontsize=fontsize, color=color)

def draw_box(page, rect, title, subtitle=None):
    fill = (0.88, 0.92, 0.96)
    stroke = (0.32, 0.42, 0.54)
    page.draw_rect(rect, color=stroke, fill=fill, radius=0.15, width=0.85)
    if subtitle:
        draw_centered_text(page, rect, title, 'Helvetica-Bold', 8.2, (0.08, 0.16, 0.28), 16)
        draw_centered_text(page, rect, subtitle, 'Helvetica', 6.4, (0.32, 0.38, 0.46), 28)
    else:
        draw_centered_text(page, rect, title, 'Helvetica-Bold', 8.5, (0.08, 0.16, 0.28), (rect.height + 6)/2)

def draw_pill_label(page, text, center_pt, arrow_dir='right', fontsize=5.8):
    w_txt = fitz.get_text_length(text, fontname='Helvetica', fontsize=fontsize)
    arrow_len = 11
    total_w = w_txt + arrow_len + 10
    h = 12
    rect = fitz.Rect(center_pt.x - total_w/2, center_pt.y - h/2, center_pt.x + total_w/2, center_pt.y + h/2)
    # Crisp white background to cleanly mask any underlying link lines
    page.draw_rect(rect, color=None, fill=(1, 1, 1), radius=0.3)
    
    # Arrow always preceding text for unified visual rhythm
    if arrow_dir == 'right':
        draw_arrow(page, fitz.Point(rect.x0 + 4, center_pt.y), fitz.Point(rect.x0 + 4 + arrow_len, center_pt.y), size=3.0, width=0.6)
    elif arrow_dir == 'left':
        draw_arrow(page, fitz.Point(rect.x0 + 4 + arrow_len, center_pt.y), fitz.Point(rect.x0 + 4, center_pt.y), size=3.0, width=0.6)
    elif arrow_dir == 'down':
        draw_arrow(page, fitz.Point(rect.x0 + 8, center_pt.y - 4), fitz.Point(rect.x0 + 8, center_pt.y + 4), size=3.0, width=0.6)
    elif arrow_dir == 'up':
        draw_arrow(page, fitz.Point(rect.x0 + 8, center_pt.y + 4), fitz.Point(rect.x0 + 8, center_pt.y - 4), size=3.0, width=0.6)
    elif arrow_dir == 'diag_sw':
        draw_arrow(page, fitz.Point(rect.x0 + 13, center_pt.y - 4), fitz.Point(rect.x0 + 5, center_pt.y + 4), size=3.0, width=0.6)
    
    page.insert_text(fitz.Point(rect.x0 + arrow_len + 6, center_pt.y + 2), text, fontname='Helvetica', fontsize=fontsize, color=(0.125, 0.22, 0.392))

def build_final_pdf():
    doc = fitz.open(orig_pdf)
    page = doc[1]
    
    # Redact from y=192 downwards to y=815, preserving top headings exactly as original
    page.add_redact_annot(fitz.Rect(0, 192, 595.3, 815))
    page.apply_redactions()

    # Layout coordinates - Balanced 3x2 architecture
    # Left column: Actors (Student, Organizer)
    # Center column: Core services (React UI, FastAPI Backend)
    # Right column: Data & Special module (QR Attendance UI, PostgreSQL)
    r_student = fitz.Rect(46, 215, 140, 255)
    r_react = fitz.Rect(248, 215, 348, 255)
    r_qrui = fitz.Rect(456, 215, 550, 255)

    r_organizer = fitz.Rect(46, 355, 140, 395)
    r_backend = fitz.Rect(248, 355, 348, 395)
    r_postgres = fitz.Rect(456, 355, 550, 395)

    link_color = (0.55, 0.62, 0.70)
    link_w = 0.85

    # Communication Links
    # 1. Student <-> React (horizontal)
    page.draw_line(fitz.Point(r_student.x1, 235), fitz.Point(r_react.x0, 235), color=link_color, width=link_w)
    # 2. React <-> QR UI (horizontal)
    page.draw_line(fitz.Point(r_react.x1, 235), fitz.Point(r_qrui.x0, 235), color=link_color, width=link_w)
    # 3. React <-> Backend (vertical)
    page.draw_line(fitz.Point(298, r_react.y1), fitz.Point(298, r_backend.y0), color=link_color, width=link_w)
    # 4. QR UI <-> Backend (diagonal link through open quadrant)
    page.draw_line(fitz.Point(r_qrui.x0, r_qrui.y1), fitz.Point(r_backend.x1, r_backend.y0), color=link_color, width=link_w)
    # 5. Organizer <-> Backend (horizontal)
    page.draw_line(fitz.Point(r_organizer.x1, 375), fitz.Point(r_backend.x0, 375), color=link_color, width=link_w)
    # 6. Backend <-> PostgreSQL (horizontal)
    page.draw_line(fitz.Point(r_backend.x1, 375), fitz.Point(r_postgres.x0, 375), color=link_color, width=link_w)

    # Object Boxes
    draw_box(page, r_student, 'Student', 'Actor / Client')
    draw_box(page, r_react, 'React Frontend', 'Web Interface (UI)')
    draw_box(page, r_qrui, 'QR / Attendance UI', 'Scanner & View')
    draw_box(page, r_organizer, 'Organizer / Admin', 'Authorized Actor')
    draw_box(page, r_backend, 'FastAPI Backend', 'REST API & Logic')
    draw_box(page, r_postgres, 'PostgreSQL DB', 'Database')

    # Message Labels
    # Link 1: Student <-> React
    draw_pill_label(page, '1. Open / login', fitz.Point(194, 224), arrow_dir='right', fontsize=6.2)
    draw_pill_label(page, '2. Login form', fitz.Point(194, 246), arrow_dir='left', fontsize=6.2)

    # Link 2: React <-> QR UI
    draw_pill_label(page, '7. Registration request', fitz.Point(402, 235), arrow_dir='right', fontsize=6.2)

    # Link 3: React <-> Backend (midpoint y = 305)
    draw_pill_label(page, '3. Send auth request', fitz.Point(240, 290), arrow_dir='down', fontsize=6.0)
    draw_pill_label(page, '6. Return token / event data', fitz.Point(356, 290), arrow_dir='up', fontsize=6.0)

    # Link 4: QR UI -> Backend (diagonal from 456,255 to 348,355)
    # Placed comfortably to the right of diagonal line
    draw_pill_label(page, '8. Submit QR / attendance data', fitz.Point(438, 318), arrow_dir='diag_sw', fontsize=5.8)

    # Link 5: Organizer <-> Backend (y = 375)
    draw_pill_label(page, '9. Organizer action / QR validation', fitz.Point(194, 363), arrow_dir='right', fontsize=5.7)
    draw_pill_label(page, '10. Approve event / scan request', fitz.Point(194, 387), arrow_dir='left', fontsize=5.7)

    # Link 6: Backend <-> PostgreSQL (y = 375)
    draw_pill_label(page, '4. Query user / event data', fitz.Point(402, 356), arrow_dir='right', fontsize=5.7)
    draw_pill_label(page, '5. Return records', fitz.Point(402, 375), arrow_dir='left', fontsize=5.7)
    draw_pill_label(page, '11. Save registration / attendance', fitz.Point(402, 394), arrow_dir='right', fontsize=5.7)

    # Message sequence card
    y_seq = 432
    page.insert_text(fitz.Point(48.5, y_seq), 'Message Sequence', fontname='Helvetica-Bold', fontsize=10.5, color=(0.125, 0.22, 0.392))

    card_rect = fitz.Rect(46, y_seq + 8, 550, y_seq + 238)
    page.draw_rect(card_rect, color=(0.82, 0.86, 0.90), fill=(0.97, 0.98, 0.99), radius=0.03, width=0.75)

    seq_items = [
        ('1-2', 'Student opens CampusConnect and submits login credentials via the React frontend interface.'),
        ('3-5', 'Frontend dispatches auth request to FastAPI backend; backend queries PostgreSQL and returns user records.'),
        ('6', 'Backend validates credentials and returns authenticated JWT token along with user role and event data.'),
        ('7-8', 'Student selects event and submits registration request; QR code data is generated and attendance validated.'),
        ('9-10', 'Organizer/Admin performs authorized event operations and validates attendee QR scans via the backend.'),
        ('11', 'FastAPI backend stores confirmed event registration, attendee details, and attendance records in PostgreSQL.')
    ]

    item_y = y_seq + 18
    for num, desc in seq_items:
        badge_rect = fitz.Rect(56, item_y, 88, item_y + 15)
        page.draw_rect(badge_rect, color=(0.20, 0.35, 0.55), fill=(0.88, 0.92, 0.96), radius=0.2, width=0.6)
        draw_centered_text(page, badge_rect, num, 'Helvetica-Bold', 7.2, (0.125, 0.22, 0.392), 11)

        desc_rect = fitz.Rect(96, item_y, 540, item_y + 24)
        page.insert_textbox(desc_rect, desc, fontname='Helvetica', fontsize=7.5, color=(0.1, 0.1, 0.1), align=fitz.TEXT_ALIGN_LEFT)
        item_y += 34

    # Caption & notation
    y_caption = 702
    page.insert_text(fitz.Point(48.5, y_caption),
                 'Communication diagram: object links show communication paths; numbered labels show message order.',
                 fontname='Helvetica-Oblique', fontsize=7.0, color=(0.35, 0.35, 0.35))

    y_not = 724
    not_rect = fitz.Rect(46, y_not, 550, y_not + 38)
    page.draw_rect(not_rect, color=(0.85, 0.88, 0.91), fill=(0.98, 0.99, 1.0), radius=0.08, width=0.6)

    page.insert_text(fitz.Point(56, y_not + 14), 'Notation Guide:', fontname='Helvetica-Bold', fontsize=7.5, color=(0.125, 0.22, 0.392))
    page.insert_text(fitz.Point(56, y_not + 27),
                 'Rectangles represent participating objects. Connecting lines show communication links. Numbered arrows denote execution order.',
                 fontname='Helvetica', fontsize=7.0, color=(0.25, 0.25, 0.25))

    # Footer
    page.draw_line(fitz.Point(42.5, 816.4), fitz.Point(552.8, 816.4), color=(0.835, 0.867, 0.910), width=1.0)
    page.insert_text(fitz.Point(42.5, 825.0), 'CampusConnect | Integrated Campus Event Management System', fontname='Helvetica', fontsize=7.0, color=(0.35, 0.35, 0.35))
    page.insert_text(fitz.Point(530.6, 825.0), 'Page 2', fontname='Helvetica', fontsize=7.0, color=(0.35, 0.35, 0.35))

    # Save outputs
    # 1. Downloads clean version
    doc.save(downloads_clean)
    # 2. Workspace copy
    doc.save(workspace_pdf)
    # 3. Scratch copy
    scratch_pdf = os.path.join(scratch, 'CampusConnect_Experiment_7_Final.pdf')
    doc.save(scratch_pdf)
    doc.close()

    # Overwrite orig in Downloads
    shutil.copy2(downloads_clean, orig_pdf)

    # Render high-res PNG preview (200 DPI for ultra clarity)
    doc_new = fitz.open(scratch_pdf)
    for p_idx in [0, 1]:
        pix = doc_new[p_idx].get_pixmap(dpi=200)
        pix.save(os.path.join(scratch, f'final_page_{p_idx+1}.png'))
    doc_new.close()
    print('All files successfully built and rendered at 200 DPI!')

build_final_pdf()
