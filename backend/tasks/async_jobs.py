from celery import shared_task
from backend.models import StudentProfile
import csv
import os
from flask import current_app
from backend.tasks.scheduled import send_email


@shared_task
def export_applications_csv(student_profile_id, user_email):
    profile = StudentProfile.query.get(student_profile_id)
    if not profile:
        return "Student profile not found"

    exports_dir = os.path.join(current_app.static_folder, 'exports')
    if not os.path.exists(exports_dir):
        os.makedirs(exports_dir)

    filename = f"applications_{profile.id}.csv"
    filepath = os.path.join(exports_dir, filename)

    with open(filepath, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['Student ID', 'Application ID', 'Company Name', 'Drive Title', 'Application Status', 'Applied On'])

        for app in profile.applications:
            writer.writerow([
                profile.user_id,
                app.id,
                app.drive.company.company_name,
                app.drive.job_title,
                app.status,
                app.applied_on.isoformat() + 'Z'
            ])

    download_link = f"http://localhost:5001/frontend/exports/{filename}"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, sans-serif; background-color: #f9fafb; color: #111827;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 0; overflow: hidden; border: 1px solid #e5e7eb;">
            <div style="background-color: #000000; padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Instihire</h1>
                <p style="margin-top: 4px; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em;">Data Export Service</p>
            </div>
            <div style="padding: 40px 32px;">
                <h2 style="font-size: 20px; font-weight: 700; color: #000000; margin-bottom: 24px;">Your Export is Ready</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 32px;">
                    The application history export you requested has been generated successfully. You can download the CSV file using the button below.
                </p>
                <div style="text-align: center; margin-bottom: 32px;">
                    <a href="{download_link}" style="background-color: #000000; color: #ffffff; padding: 12px 32px; text-decoration: none; font-weight: 700; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em;">
                        Download CSV File
                    </a>
                </div>
                <p style="font-size: 12px; color: #9ca3af;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <span style="color: #4b5563;">{download_link}</span>
                </p>
            </div>
            <div style="padding: 24px; text-align: center; font-size: 11px; color: #9ca3af; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                &copy; 2026 Instihire &bull; Placement Portal
            </div>
        </div>
    </body>
    </html>
    """
    send_email(user_email, "Instihire: Your Export is Ready", html_body, is_html=True)

    return f"Exported to {filepath}"
