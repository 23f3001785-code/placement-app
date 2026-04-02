from celery import shared_task
from backend.models import User, Drive, Application
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from flask import current_app


def send_email(to_email, subject, body, is_html=False):
    msg = MIMEText(body, 'html' if is_html else 'plain')
    msg['Subject'] = subject
    msg['From'] = 'noreply@instihire.local'
    msg['To'] = to_email

    try:
        server = smtplib.SMTP(current_app.config['MAIL_SERVER'], current_app.config['MAIL_PORT'])
        # Use sendmail for explicit envelope control
        server.sendmail('noreply@instihire.local', [to_email], msg.as_string())
        server.quit()
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")


def is_student_eligible(drive, profile):
    """Unified eligibility check for Degree, Branch, and CGPA."""
    # Degree check (match or Any/None)
    degree_match = not drive.required_degree or drive.required_degree.lower() == 'any' or drive.required_degree == profile.degree
    
    # Branch check (match or Any/None)
    branch_match = not drive.required_branch or drive.required_branch.lower() == 'any' or drive.required_branch == profile.branch
    
    # CGPA check
    cgpa_match = profile.cgpa >= drive.min_cgpa
    
    return degree_match and branch_match and cgpa_match



@shared_task
def send_daily_reminders():
    print("\n" + "="*50)
    print(" [BACKEND JOB] EXECUTING: send_daily_reminders")
    print("="*50 + "\n")

    tomorrow = datetime.utcnow() + timedelta(days=1)
    # For demo visibility, we will also include all approved drives as a "Digest"
    # if no strict deadlines are found in the next 24h.
    upcoming_drives = Drive.query.filter(
        Drive.deadline >= datetime.utcnow(),
        Drive.deadline <= tomorrow,
        Drive.status == 'Approved'
    ).all()

    all_active_drives = Drive.query.filter(
        Drive.deadline >= datetime.utcnow(),
        Drive.status == 'Approved'
    ).all()

    if not all_active_drives:
        print(" [BACKEND JOB] Skipping: No active drives found.")
        return "No active drives"

    students = User.query.filter_by(role='student', is_active=True).all()
    target_drives = upcoming_drives if upcoming_drives else all_active_drives
    print(f" [BACKEND JOB] Found {len(students)} active students and {len(target_drives)} candidate drives.")

    for student in students:
        email = student.username if '@' in student.username else f"{student.username}@student.instihire.local"
        
        # Get student profile for eligibility check
        profile = student.student_profile
        if not profile:
            continue

        # Get list of drive IDs the student has already applied to
        applied_drive_ids = [a.drive_id for a in profile.applications]

        # Filter target drives for this specific student
        student_drives = []
        for d in target_drives:
            if d.id in applied_drive_ids:
                continue
            
            if is_student_eligible(d, profile):
                student_drives.append(d)

        # Skip sending if there's absolutely nothing (No urgent deadlines AND no general digest)
        if not student_drives:
            print(f" [BACKEND JOB] No eligible drives for {email}, skipping digest.")
            continue

        drive_items = ""
        for d in student_drives:
            drive_items += f"""
                <div style="background: #ffffff; border: 1px solid #e5e7eb; border-left: 4px solid #000000; margin-bottom: 12px; padding: 16px; border-radius: 4px;">
                    <h3 style="margin: 0; color: #000000; font-size: 18px; font-weight: 700;">{d.job_title}</h3>
                    <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">{d.company.company_name}</p>
                    <p style="margin: 8px 0 0; color: #000000; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                        Apply by: {d.deadline.strftime('%b %d, %Y')}
                    </p>
                </div>
                """

        subject = "Instihire: Upcoming Deadlines Alert" if upcoming_drives and student_drives else "Instihire: Daily Placement Digest"
        
        if student_drives:
            main_message = 'This is an urgent reminder for upcoming deadlines.' if upcoming_drives else 'Here is your daily summary of active placement drives you are eligible for.'
            content_html = drive_items
        else:
            main_message = "There are currently no new active placement drives matching your profile that you haven't applied to yet."
            content_html = '<div style="background: #fdf2f2; border: 1px solid #fecaca; color: #991b1b; padding: 16px; border-radius: 4px; text-align: center; font-size: 14px;">Check back tomorrow for more opportunities!</div>'

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, sans-serif; background-color: #f9fafb; color: #111827;">
            <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 0; overflow: hidden; border: 1px solid #e5e7eb;">
                <div style="background-color: #000000; padding: 32px 24px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Instihire</h1>
                    <p style="margin-top: 4px; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em;">Placement Portal</p>
                </div>
                <div style="padding: 40px 32px;">
                    <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 32px;">
                        Hello {profile.full_name}, <br><br>
                        {main_message}
                    </p>
                    
                    {content_html}
                    
                    <p style="margin-top: 40px; font-size: 14px; color: #6b7280; border-top: 1px solid #f3f4f6; padding-top: 24px;">
                        Keep your profile updated to receive the most relevant opportunities.
                    </p>
                </div>
                <div style="padding: 24px; text-align: center; font-size: 11px; color: #9ca3af; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-transform: uppercase; letter-spacing: 0.1em;">
                    &copy; 2026 Instihire &bull; Campus Recruitment System
                </div>
            </div>
        </body>
        </html>
        """
        send_email(email, subject, html_body, is_html=True)
        print(f" [BACKEND JOB] Sent personalize reminder to: {email}")

        pass

    return "Daily reminders sent"


@shared_task
def send_monthly_report():
    admin = User.query.filter_by(role='admin').first()
    if not admin:
        return "No admin found"

    import calendar
    now = datetime.utcnow()
    last_day_of_month = calendar.monthrange(now.year, now.month)[1]

    first_day = datetime(now.year, now.month, 1)
    drives_count = Drive.query.filter(Drive.status == 'Approved', Drive.created_at >= first_day).count()
    apps_count = Application.query.filter(Application.applied_on >= first_day).count()
    selected_count = Application.query.filter(Application.status == 'Selected', Application.applied_on >= first_day).count()
    
    report_type = "Full Monthly Report" if now.day == last_day_of_month else "Month-to-Date Activity"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, sans-serif; background-color: #f9fafb; color: #111827;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 0; overflow: hidden; border: 1px solid #e5e7eb;">
            <div style="background-color: #000000; padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Instihire</h1>
                <p style="margin-top: 4px; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em;">{report_type}</p>
            </div>
            <div style="padding: 40px 32px;">
                <h2 style="font-size: 20px; font-weight: 700; color: #000000; margin-bottom: 24px; border-bottom: 2px solid #f3f4f6; padding-bottom: 12px;">Performance Summary</h2>
                
                <div style="display: grid; gap: 20px; margin-bottom: 32px;">
                    <div style="background: #f8fafc; padding: 20px; border: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em;">Drives Conducted</p>
                        <p style="margin: 5px 0 0; font-size: 32px; font-weight: 800; color: #000000;">{drives_count}</p>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; border: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em;">Applications Received</p>
                        <p style="margin: 5px 0 0; font-size: 32px; font-weight: 800; color: #000000;">{apps_count}</p>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; border: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em;">Students Selected</p>
                        <p style="margin: 5px 0 0; font-size: 32px; font-weight: 800; color: #000000;">{selected_count}</p>
                    </div>
                </div>
                
                <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                    This report was automatically generated on {datetime.now().strftime('%B %d, %Y')}. For full details, please access the Administration Dashboard.
                </p>
            </div>
            <div style="padding: 24px; text-align: center; font-size: 11px; color: #9ca3af; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-transform: uppercase; letter-spacing: 0.1em;">
                &copy; 2026 Instihire &bull; Administrative Services
            </div>
        </div>
    </body>
    </html>
    """

    admin_email = admin.username if '@' in admin.username else f"{admin.username}@admin.instihire.local"
    send_email(admin_email, f"Instihire: {report_type}", html_content, is_html=True)
    print(f" [BACKEND JOB] Sent report to: {admin_email}")
    return "Monthly report sent"


@shared_task
def notify_students_new_drive(drive_id):
    drive = Drive.query.get(drive_id)
    if not drive:
        return "Drive not found"

    students = User.query.filter_by(role='student', is_active=True).all()
    print(f" [BACKEND JOB] Notifying {len(students)} students about new drive: {drive.job_title}")

    for student in students:
        # Eligibility check
        profile = student.student_profile
        if not profile:
            continue
            
        if not is_student_eligible(drive, profile):
            continue

        email = student.username if '@' in student.username else f"{student.username}@student.instihire.local"
        
        subject = f"New Job Drive: {drive.job_title} at {drive.company.company_name}"
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, sans-serif; background-color: #f9fafb; color: #111827;">
            <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 0; overflow: hidden; border: 1px solid #e5e7eb;">
                <div style="background-color: #000000; padding: 32px 24px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Instihire</h1>
                    <p style="margin-top: 4px; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em;">New Opportunity</p>
                </div>
                <div style="padding: 40px 32px;">
                    <h2 style="font-size: 20px; font-weight: 700; color: #000000; margin-bottom: 24px;">{drive.job_title}</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
                        A new placement drive matching your profile has just been approved!
                    </p>
                    
                    <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-left: 4px solid #000000; padding: 20px; margin-bottom: 32px;">
                        <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Company</p>
                        <p style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #000000;">{drive.company.company_name}</p>
                        
                        <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Eligibility</p>
                        <p style="margin: 0 0 16px; font-size: 16px; color: #000000;">{drive.required_degree} ({drive.required_branch})<br>Min CGPA: {drive.min_cgpa}</p>
                        
                        <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Interview Mode</p>
                        <p style="margin: 0 0 16px; font-size: 16px; color: #000000;">{drive.interview_mode}</p>

                        <p style="margin: 16px 0 0; color: #000000; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                            Apply by: {drive.deadline.strftime('%b %d, %Y')}
                        </p>
                    </div>

                </div>
                <div style="padding: 24px; text-align: center; font-size: 11px; color: #9ca3af; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                    &copy; 2026 Instihire &bull; Campus Recruitment System
                </div>
            </div>
        </body>
        </html>
        """
        send_email(email, subject, html_body, is_html=True)
        print(f" [BACKEND JOB] Notification sent to: {email}")


@shared_task
def notify_student_selection(app_id):
    application = Application.query.get(app_id)
    if not application or application.status != 'Selected':
        return "Invalid application or not selected"

    student = application.student
    drive = application.drive
    email = student.user.username if '@' in student.user.username else f"{student.user.username}@student.instihire.local"

    subject = f"Congratulations! You've been selected by {drive.company.company_name}"
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, sans-serif; background-color: #f9fafb; color: #111827;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 0; overflow: hidden; border: 1px solid #e5e7eb; border-top: 4px solid #10b981;">
            <div style="background-color: #f0fdf4; padding: 48px 32px; text-align: center;">
                <div style="width: 64px; height: 64px; background: #10b981; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;">
                    🎉
                </div>
                <h1 style="margin: 0; color: #166534; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Congratulations!</h1>
                <p style="margin-top: 8px; color: #15803d; font-size: 14px; font-weight: 600;">Offer Confirmation</p>
            </div>
            <div style="padding: 40px 32px;">
                <p style="font-size: 18px; line-height: 1.6; color: #111827; margin-bottom: 24px; font-weight: 600;">
                    Hello {student.full_name},
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 32px;">
                    We are thrilled to inform you that you have been successfully **SELECTED** for the position of **{drive.job_title}** at **{drive.company.company_name}**!
                </p>
                
                <div style="background: #f8fafc; border: 1px solid #e5e7eb; padding: 24px; margin-bottom: 32px; border-radius: 8px;">
                    <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Selection Details</p>
                    <div style="display: grid; gap: 12px;">
                        <p style="margin: 0; font-size: 16px; color: #111827;"><strong>Job Title:</strong> {drive.job_title}</p>
                        <p style="margin: 0; font-size: 16px; color: #111827;"><strong>Company:</strong> {drive.company.company_name}</p>
                        <p style="margin: 0; font-size: 16px; color: #111827;"><strong>Status:</strong> <span style="color: #10b981; font-weight: 700;">OFFERED</span></p>
                    </div>
                </div>

                <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                    The company will contact you shortly with the next steps regarding your onboarding and documentation.
                </p>
            </div>
            <div style="padding: 24px; text-align: center; font-size: 11px; color: #9ca3af; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                &copy; 2026 Instihire &bull; Your Career Partner
            </div>
        </div>
    </body>
    </html>
    """
    send_email(email, subject, html_body, is_html=True)
    print(f" [BACKEND JOB] Sent selection congratulations to: {email}")
    return "Selection notification sent"
