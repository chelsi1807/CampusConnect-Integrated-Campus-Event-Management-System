import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Polygon, Circle

def create_activity_diagram():
    # Setup Figure with ultra-crisp dimensions for PPT (16:9 ratio or wide banner)
    fig_w, fig_h = 16, 9.5
    fig, ax = plt.subplots(figsize=(fig_w, fig_h), dpi=300)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # -------------------------------------------------------------
    # 1. Title Banner
    # -------------------------------------------------------------
    title_box = FancyBboxPatch((2, 93.5), 96, 5.5, boxstyle="round,pad=0.2,rounding_size=0.8",
                               facecolor='#1E3A8A', edgecolor='#1E3A8A', lw=1.5)
    ax.add_patch(title_box)
    ax.text(50, 96.2, "CampusConnect – End-to-End System Activity Diagram (UML 2.5)", 
            color='white', fontsize=14, fontweight='bold', ha='center', va='center', fontfamily='sans-serif')

    # -------------------------------------------------------------
    # 2. Swimlanes Definition
    # -------------------------------------------------------------
    lanes = [
        ("STUDENT / PARTICIPANT", 2, 20.5, '#F8FAFC', '#1E40AF'),
        ("WEB APPLICATION (REACT)", 21.5, 39.5, '#FFFFFF', '#4338CA'),
        ("BACKEND API (FASTAPI)", 40.5, 60.5, '#F8FAFC', '#0D9488'),
        ("DATABASE (POSTGRESQL)", 61.5, 79.5, '#FFFFFF', '#0369A1'),
        ("ORGANIZER / ADMIN", 80.5, 98, '#F8FAFC', '#7C3AED')
    ]

    lane_top = 92
    lane_bottom = 2

    for title, x1, x2, bg_col, header_col in lanes:
        w = x2 - x1
        # Lane Background
        lane_bg = patches.Rectangle((x1, lane_bottom), w, lane_top - lane_bottom,
                                    facecolor=bg_col, edgecolor='#E2E8F0', lw=1, zorder=1)
        ax.add_patch(lane_bg)

        # Lane Header
        header = FancyBboxPatch((x1, lane_top - 4.5), w, 4.2, boxstyle="round,pad=0.1,rounding_size=0.4",
                                facecolor=header_col, edgecolor=header_col, lw=1, zorder=2)
        ax.add_patch(header)
        ax.text((x1 + x2)/2, lane_top - 2.4, title, color='white', fontsize=9, fontweight='bold',
                ha='center', va='center', fontfamily='sans-serif', zorder=3)

    # -------------------------------------------------------------
    # Helper Drawing Functions
    # -------------------------------------------------------------
    def draw_action(x, y, text, w=15, h=3.8, stroke='#334155', fill='#FFFFFF', text_col='#0F172A', bold=False):
        box = FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle="round,pad=0.2,rounding_size=0.6",
                             facecolor=fill, edgecolor=stroke, lw=1.6, zorder=4)
        ax.add_patch(box)
        weight = 'bold' if bold else 'normal'
        ax.text(x, y, text, color=text_col, fontsize=7.6, fontweight=weight,
                ha='center', va='center', fontfamily='sans-serif', zorder=5)

    def draw_db(x, y, text, w=14, h=3.8, stroke='#0284C7', fill='#F0F9FF', text_col='#0369A1'):
        box = FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle="round,pad=0.2,rounding_size=0.3",
                             facecolor=fill, edgecolor=stroke, lw=1.6, zorder=4)
        ax.add_patch(box)
        ax.text(x, y, text, color=text_col, fontsize=7.6, fontweight='bold',
                ha='center', va='center', fontfamily='sans-serif', zorder=5)

    def draw_decision(x, y, text, r=4.2, stroke='#DC2626', fill='#FEF2F2', text_col='#991B1B'):
        # Diamond
        diamond = Polygon([[x, y + r*0.55], [x + r, y], [x, y - r*0.55], [x - r, y]],
                          closed=True, facecolor=fill, edgecolor=stroke, lw=1.6, zorder=4)
        ax.add_patch(diamond)
        ax.text(x, y, text, color=text_col, fontsize=7.2, fontweight='bold',
                ha='center', va='center', fontfamily='sans-serif', zorder=5)

    def draw_node_initial(x, y, label=""):
        c = Circle((x, y), 1.2, facecolor='#0F172A', edgecolor='#0F172A', zorder=4)
        ax.add_patch(c)
        if label:
            ax.text(x, y + 2.0, label, fontsize=7.2, fontweight='bold', color='#0F172A', ha='center', va='bottom')

    def draw_node_final(x, y, label=""):
        c1 = Circle((x, y), 1.4, facecolor='#FFFFFF', edgecolor='#0F172A', lw=1.5, zorder=4)
        c2 = Circle((x, y), 0.9, facecolor='#0F172A', edgecolor='#0F172A', zorder=5)
        ax.add_patch(c1)
        ax.add_patch(c2)
        if label:
            ax.text(x, y - 2.0, label, fontsize=7.2, fontweight='bold', color='#0F172A', ha='center', va='top')

    def arrow(x1, y1, x2, y2, color='#475569', label=None, label_pos=0.5, label_offset=(0, 1.0), lw=1.4):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="-|>", color=color, lw=lw, mutation_scale=11), zorder=3)
        if label:
            lx = x1 + (x2 - x1) * label_pos + label_offset[0]
            ly = y1 + (y2 - y1) * label_pos + label_offset[1]
            ax.text(lx, ly, label, fontsize=7.0, fontweight='bold', color=color,
                    ha='center', va='center', bbox=dict(boxstyle="square,pad=0.15", facecolor='white', edgecolor='none'), zorder=6)

    def arrow_poly(pts, color='#475569', label=None, label_pt=None):
        for i in range(len(pts) - 1):
            if i == len(pts) - 2:
                ax.annotate('', xy=pts[i+1], xytext=pts[i],
                            arrowprops=dict(arrowstyle="-|>", color=color, lw=1.4, mutation_scale=11), zorder=3)
            else:
                ax.plot([pts[i][0], pts[i+1][0]], [pts[i][1], pts[i+1][1]], color=color, lw=1.4, zorder=3)
        if label and label_pt:
            ax.text(label_pt[0], label_pt[1], label, fontsize=7.0, fontweight='bold', color=color,
                    ha='center', va='center', bbox=dict(boxstyle="square,pad=0.15", facecolor='white', edgecolor='none'), zorder=6)

    # -------------------------------------------------------------
    # 3. ROW 1: EVENT PROPOSAL & ADMIN APPROVAL (Top Section)
    # -------------------------------------------------------------
    # Organizer initiates proposal
    draw_node_initial(89.25, 83.5, "Org Init")
    draw_action(89.25, 78.5, "Create & Submit\nEvent Proposal", w=14, h=3.8, stroke='#7C3AED', fill='#F5F3FF', text_col='#6D28D9', bold=True)
    arrow(89.25, 82.3, 89.25, 80.4, color='#7C3AED')

    # Frontend Admin Review
    draw_action(30.5, 78.5, "Admin Review Portal\n(Approve / Reject)", w=15, h=3.8, stroke='#4338CA', fill='#EEF2FF', text_col='#3730A3')
    arrow(82.25, 78.5, 38.0, 78.5, color='#7C3AED', label="Submit Proposal", label_offset=(0, 1.2))

    # Backend API: Process Approval
    draw_action(50.5, 78.5, "Validate & Set Status\n('Approved')", w=15, h=3.8, stroke='#0D9488', fill='#F0FDFA', text_col='#0F766E')
    arrow(38.0, 78.5, 43.0, 78.5, color='#4338CA', label="Approve", label_offset=(0, 1.2))

    # DB: Save Event
    draw_db(70.5, 78.5, "Save Approved\nEvent in DB", w=14, h=3.8)
    arrow(58.0, 78.5, 63.5, 78.5, color='#0D9488')

    # -------------------------------------------------------------
    # 4. ROW 2: USER AUTHENTICATION & LOGIN FLOW
    # -------------------------------------------------------------
    # Student Start
    draw_node_initial(11.25, 72.0, "Start")
    draw_action(11.25, 66.0, "Open App &\nEnter Credentials", w=14, h=3.8, stroke='#1E40AF', fill='#EFF6FF', text_col='#1E3A8A', bold=True)
    arrow(11.25, 70.8, 11.25, 67.9, color='#1E40AF')

    # UI: Submit Login
    draw_action(30.5, 66.0, "Render Login Form &\nSend Auth Request", w=15, h=3.8, stroke='#4338CA', fill='#EEF2FF', text_col='#3730A3')
    arrow(18.25, 66.0, 23.0, 66.0, color='#1E40AF')

    # Backend: Authenticate
    draw_action(50.5, 66.0, "Verify bcrypt Hash\n& Check Active", w=15, h=3.8, stroke='#0D9488', fill='#F0FDFA', text_col='#0F766E')
    arrow(38.0, 66.0, 43.0, 66.0, color='#4338CA')

    # DB: Fetch User Record
    draw_db(70.5, 66.0, "Query User Record\nby Email", w=14, h=3.8)
    arrow(58.0, 66.0, 63.5, 66.0, color='#0D9488')

    # Decision: Valid Credentials?
    draw_decision(50.5, 57.5, "Valid?", r=3.8)
    arrow(50.5, 64.1, 50.5, 60.0, color='#0D9488')

    # Error Feedback with Clean Re-try Loop!
    draw_action(30.5, 57.5, "Display Error Alert\n(Invalid Credentials)", w=15, h=3.6, stroke='#DC2626', fill='#FEF2F2', text_col='#B91C1C')
    arrow(46.7, 57.5, 38.0, 57.5, color='#DC2626', label="No", label_offset=(0, 1.1))
    
    # Loop back to Enter Credentials
    arrow_poly([(23.0, 57.5), (11.25, 57.5), (11.25, 64.1)], color='#DC2626', label="Retry", label_pt=(16.0, 58.5))

    # -------------------------------------------------------------
    # 5. ROW 3: EVENT DISCOVERY & SELECTION
    # -------------------------------------------------------------
    # Success Path -> Fetch Events
    draw_action(50.5, 49.0, "Issue JWT Token &\nFetch Approved Events", w=15, h=3.8, stroke='#0D9488', fill='#F0FDFA', text_col='#0F766E')
    arrow(50.5, 55.0, 50.5, 50.9, color='#059669', label="Yes", label_offset=(1.5, 0))

    # DB: Query Events
    draw_db(70.5, 49.0, "Query Approved\nUpcoming Events", w=14, h=3.8)
    arrow(58.0, 49.0, 63.5, 49.0, color='#0D9488')

    # UI: Render Discovery Grid
    draw_action(30.5, 49.0, "Display Discovery Grid\n(Filters, Capacity, Theme)", w=15, h=3.8, stroke='#4338CA', fill='#EEF2FF', text_col='#3730A3')
    arrow(43.0, 49.0, 38.0, 49.0, color='#0D9488')

    # Student: Browse & Select
    draw_action(11.25, 49.0, "Browse & Click\n'Register for Event'", w=14, h=3.8, stroke='#1E40AF', fill='#EFF6FF', text_col='#1E3A8A')
    arrow(23.0, 49.0, 18.25, 49.0, color='#4338CA')

    # -------------------------------------------------------------
    # 6. ROW 4: REGISTRATION & WAITLIST PROMOTION FLOW
    # -------------------------------------------------------------
    # Student submits registration
    draw_action(11.25, 39.5, "Submit Registration\nRequest", w=14, h=3.8, stroke='#1E40AF', fill='#EFF6FF', text_col='#1E3A8A', bold=True)
    arrow(11.25, 47.1, 11.25, 41.4, color='#1E40AF')

    # UI sends POST /registrations
    draw_action(30.5, 39.5, "Send Booking Request\n(POST /registrations)", w=15, h=3.8, stroke='#4338CA', fill='#EEF2FF', text_col='#3730A3')
    arrow(18.25, 39.5, 23.0, 39.5, color='#1E40AF')

    # API validates
    draw_action(50.5, 39.5, "Check Constraints &\nAcquire Row Lock", w=15, h=3.8, stroke='#0D9488', fill='#F0FDFA', text_col='#0F766E')
    arrow(38.0, 39.5, 43.0, 39.5, color='#4338CA')

    # Decision: Seats Available?
    draw_decision(50.5, 31.0, "Seats\nAvailable?", r=4.2)
    arrow(50.5, 37.6, 50.5, 33.3, color='#0D9488')

    # Branch 1: Yes -> Confirmed + QR Pass
    draw_db(70.5, 34.0, "Save Confirmed Seat\n& Generate QR Hash", w=15, h=3.8, stroke='#059669', fill='#ECFDF5', text_col='#065F46')
    arrow_poly([(54.7, 31.0), (60.0, 31.0), (60.0, 34.0), (63.0, 34.0)], color='#059669', label="Yes", label_pt=(58.0, 32.5))

    # Branch 2: No -> Waitlist FIFO
    draw_db(70.5, 27.5, "Assign Next Waitlist\nPosition (FIFO)", w=15, h=3.8, stroke='#D97706', fill='#FFFBEB', text_col='#92400E')
    arrow_poly([(50.5, 28.7), (50.5, 27.5), (63.0, 27.5)], color='#D97706', label="No", label_pt=(56.0, 26.3))

    # Return result to UI
    draw_action(30.5, 31.0, "Render Modal:\nQR Pass / Waitlist #", w=15, h=3.8, stroke='#4338CA', fill='#EEF2FF', text_col='#3730A3')
    arrow_poly([(63.0, 34.0), (61.5, 34.0), (61.5, 31.0), (38.0, 31.0)], color='#059669')

    # Student receives confirmation
    draw_action(11.25, 31.0, "Receive QR Entry Pass\n(or Waitlist Queue #)", w=14, h=3.8, stroke='#1E40AF', fill='#EFF6FF', text_col='#1E3A8A')
    arrow(23.0, 31.0, 18.25, 31.0, color='#4338CA')

    # -------------------------------------------------------------
    # 7. ROW 5: VENUE CHECK-IN & ATTENDANCE SCANNING
    # -------------------------------------------------------------
    # Student brings QR code
    draw_action(11.25, 20.0, "Present QR Entry Pass\nat Event Venue", w=14, h=3.8, stroke='#1E40AF', fill='#EFF6FF', text_col='#1E3A8A')
    arrow(11.25, 29.1, 11.25, 21.9, color='#1E40AF')

    # Organizer Camera Scanner
    draw_action(89.25, 20.0, "Scan Participant QR\n(Camera Scanner)", w=14, h=3.8, stroke='#7C3AED', fill='#F5F3FF', text_col='#6D28D9', bold=True)
    arrow(18.25, 20.0, 82.25, 20.0, color='#1E40AF', label="Scan Pass", label_offset=(0, 1.2))

    # Backend API verifies attendance
    draw_action(50.5, 20.0, "Verify Token Hash &\nReject Duplicates", w=15, h=3.8, stroke='#0D9488', fill='#F0FDFA', text_col='#0F766E')
    arrow(82.25, 20.0, 58.0, 20.0, color='#7C3AED')

    # DB marks Attended
    draw_db(70.5, 20.0, "Update Status =\n'Attended' + Time", w=14, h=3.8)
    arrow(58.0, 20.0, 63.5, 20.0, color='#0D9488')

    # -------------------------------------------------------------
    # 8. ROW 6: DIGITAL CERTIFICATE & VERIFICATION (Module 5)
    # -------------------------------------------------------------
    # API: Generate Certificate
    draw_action(50.5, 9.5, "Generate ReportLab PDF\nCertificate + Unique ID", w=15, h=3.8, stroke='#0D9488', fill='#F0FDFA', text_col='#0F766E')
    arrow(50.5, 18.1, 50.5, 11.4, color='#0D9488')

    # DB saves Certificate
    draw_db(70.5, 9.5, "Store Certificate\nRecord & Public Hash", w=14, h=3.8)
    arrow(58.0, 9.5, 63.5, 9.5, color='#0D9488')

    # UI: Certificate Ready
    draw_action(30.5, 9.5, "Serve Download Link &\nPublic Verification QR", w=15, h=3.8, stroke='#4338CA', fill='#EEF2FF', text_col='#3730A3')
    arrow(43.0, 9.5, 38.0, 9.5, color='#0D9488')

    # Student downloads PDF
    draw_action(11.25, 9.5, "Download Verified PDF\n& Submit Feedback", w=14, h=3.8, stroke='#1E40AF', fill='#EFF6FF', text_col='#1E3A8A', bold=True)
    arrow(23.0, 9.5, 18.25, 9.5, color='#4338CA')

    # End State
    draw_node_final(11.25, 3.5, "Completed")
    arrow(11.25, 7.6, 11.25, 5.0, color='#059669')

    # Organizer Reports End
    draw_action(89.25, 9.5, "View Attendance &\nFeedback Analytics", w=14, h=3.8, stroke='#7C3AED', fill='#F5F3FF', text_col='#6D28D9')
    arrow(89.25, 18.1, 89.25, 11.4, color='#7C3AED')

    draw_node_final(89.25, 3.5, "Admin Exit")
    arrow(89.25, 7.6, 89.25, 5.0, color='#7C3AED')

    # Note annotation at bottom center
    ax.text(50.5, 3.2, "✓ Full lifecycle: Proposal Approval → Auth Loop → Discovery → Waitlist Branching → QR Attendance → PDF Certificates",
            fontsize=7.2, color='#64748B', fontstyle='italic', ha='center', va='center')

    plt.tight_layout()
    output_png = "CampusConnect_Corrected_Activity_Diagram_White.png"
    output_pdf = "CampusConnect_Corrected_Activity_Diagram_White.pdf"
    plt.savefig(output_png, dpi=300, bbox_inches='tight', facecolor='#FFFFFF')
    plt.savefig(output_pdf, dpi=300, bbox_inches='tight', facecolor='#FFFFFF')
    print(f"Generated {output_png} and {output_pdf} successfully!")

if __name__ == "__main__":
    create_activity_diagram()
