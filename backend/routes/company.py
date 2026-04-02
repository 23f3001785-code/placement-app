from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity
from backend.extensions import db, cache
from backend.models import CompanyProfile, Drive, Application
from backend.utils.auth import company_required
from datetime import datetime
import json

company_bp = Blueprint('company', __name__)


@company_bp.route('/profile', methods=['GET'])
@company_required()
def get_profile():
    identity = json.loads(get_jwt_identity())
    profile = CompanyProfile.query.filter_by(user_id=identity['id']).first()
    if not profile:
        return jsonify({'message': 'Profile not found'}), 404

    drives = Drive.query.filter_by(company_profile_id=profile.id).all()
    total_drives = len(drives)
    drive_ids = [d.id for d in drives]

    total_apps = 0
    total_shortlisted = 0
    total_selected = 0

    if drive_ids:
        total_apps = Application.query.filter(Application.drive_id.in_(drive_ids)).count()
        total_shortlisted = Application.query.filter(Application.drive_id.in_(drive_ids), Application.status == 'Shortlisted').count()
        total_selected = Application.query.filter(Application.drive_id.in_(drive_ids), Application.status == 'Selected').count()

    return jsonify({
        'company_name': profile.company_name,
        'hr_contact': profile.hr_contact,
        'hr_phone': profile.hr_phone,
        'website': profile.website,
        'is_approved': profile.is_approved,
        'stats': {
            'total_drives': total_drives,
            'total_applicants': total_apps,
            'total_shortlisted': total_shortlisted,
            'total_selected': total_selected
        }
    }), 200


@company_bp.route('/drives', methods=['GET'])
@company_required()
def list_company_drives():
    identity = json.loads(get_jwt_identity())
    profile = CompanyProfile.query.filter_by(user_id=identity['id']).first()

    cache_key = f"company_drives_{profile.id}"
    cached = cache.get(cache_key)
    if cached:
        return jsonify(cached), 200

    drives = Drive.query.filter_by(company_profile_id=profile.id).all()
    res = []
    for d in drives:
        res.append({
            'id': d.id,
            'job_title': d.job_title,
            'job_description': d.job_description,
            'required_degree': d.required_degree,
            'required_branch': d.required_branch,
            'min_cgpa': d.min_cgpa,
            'deadline': d.deadline.isoformat() + 'Z',
            'status': d.status,
            'created_at': d.created_at.isoformat() + 'Z',
            'applicant_count': len(d.applications),
            'status_counts': {
                'Applied': len([a for a in d.applications if a.status == 'Applied']),
                'Shortlisted': len([a for a in d.applications if a.status == 'Shortlisted']),
                'Selected': len([a for a in d.applications if a.status == 'Selected']),
                'Rejected': len([a for a in d.applications if a.status == 'Rejected'])
            }
        })

    cache.set(cache_key, res, timeout=60)
    return jsonify(res), 200


@company_bp.route('/drives', methods=['POST'])
@company_required()
def create_drive():
    identity = json.loads(get_jwt_identity())
    profile = CompanyProfile.query.filter_by(user_id=identity['id']).first()
    if not profile.is_approved:
        return jsonify({'message': 'Company is not approved by Admin yet'}), 403

    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    job_title = data.get('job_title', '').strip()
    job_desc = data.get('job_description', '').strip()
    deadline_str = data.get('deadline', '').strip()

    if not job_title or not job_desc or not deadline_str:
        return jsonify({'message': 'Job Title, Description, and Deadline are required'}), 400

    try:
        dt = datetime.fromisoformat(deadline_str)
        if dt.date() < datetime.now().date():
            return jsonify({'message': 'Deadline cannot be set in the past'}), 400

        min_cgpa = float(data.get('min_cgpa') or 0.0)
        if min_cgpa < 0 or min_cgpa > 10:
            return jsonify({'message': 'Minimum CGPA must be between 0 and 10'}), 400

        new_drive = Drive(
            company_profile_id=profile.id,
            job_title=job_title,
            job_description=job_desc,
            required_degree=data.get('required_degree'),
            required_branch=data.get('required_branch'),
            min_cgpa=min_cgpa,
            deadline=dt,
            interview_mode=data.get('interview_mode', 'In-Person')
        )
        db.session.add(new_drive)
        db.session.commit()
        cache.clear()  # Invalidate
        return jsonify({'message': 'Drive created successfully'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400


@company_bp.route('/drives/<int:drive_id>/applications', methods=['GET'])
@company_required()
def view_drive_applications(drive_id):
    identity = json.loads(get_jwt_identity())
    profile = CompanyProfile.query.filter_by(user_id=identity['id']).first()
    drive = Drive.query.filter_by(id=drive_id, company_profile_id=profile.id).first()
    if not drive:
        return jsonify({'message': 'Drive not found'}), 404

    cache_key = f"drive_apps_{drive_id}"
    cached = cache.get(cache_key)
    if cached:
        return jsonify(cached), 200

    res = []
    for app in drive.applications:
        res.append({
            'application_id': app.id,
            'student_name': app.student.full_name,
            'college_name': app.student.college_name,
            'branch': app.student.branch,
            'degree': app.student.degree,
            'cgpa': app.student.cgpa,
            'status': app.status,
            'applied_on': app.applied_on.isoformat() + 'Z',
            'resume_url': app.student.resume_url
        })

    cache.set(cache_key, res, timeout=60)
    return jsonify(res), 200


@company_bp.route('/applications/<int:app_id>/status', methods=['POST'])
@company_required()
def update_application_status(app_id):
    data = request.get_json()
    new_status = data.get('status')
    if new_status not in ['Shortlisted', 'Selected', 'Rejected']:
        return jsonify({'message': 'Invalid status'}), 400

    application = Application.query.get(app_id)
    if not application:
        return jsonify({'message': 'Application not found'}), 404

    identity = json.loads(get_jwt_identity())
    profile = CompanyProfile.query.filter_by(user_id=identity['id']).first()
    if application.drive.company_profile_id != profile.id:
        return jsonify({'message': 'Unauthorized'}), 403

    application.status = data.get('status')
    db.session.commit()
    
    if application.status == 'Selected':
        try:
            from backend import celery
            celery.send_task('backend.tasks.scheduled.notify_student_selection', args=[application.id])
        except Exception as e:
            print(f"Failed to trigger selection email: {e}")

    cache.clear()  # Invalidate
    return jsonify({'message': 'Status updated successfully'}), 200


@company_bp.route('/drives/<int:drive_id>/deadline', methods=['PUT'])
@company_required()
def update_drive_deadline(drive_id):
    identity = json.loads(get_jwt_identity())
    profile = CompanyProfile.query.filter_by(user_id=identity['id']).first()

    drive = Drive.query.filter_by(id=drive_id, company_profile_id=profile.id).first()
    if not drive:
        return jsonify({'message': 'Drive not found or unauthorized'}), 404

    data = request.get_json()
    if not data or not data.get('deadline'):
        return jsonify({'message': 'Deadline is required'}), 400

    try:
        dt = datetime.fromisoformat(data['deadline'])
        if dt.date() < datetime.now().date():
            return jsonify({'message': 'Deadline cannot be set in the past'}), 400

        drive.deadline = dt
        db.session.commit()
        cache.clear()
        return jsonify({'message': 'Deadline updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400


@company_bp.route('/applications/<int:app_id>', methods=['DELETE'])
@company_required()
def delete_application(app_id):
    application = Application.query.get(app_id)
    if not application:
        return jsonify({'message': 'Application not found'}), 404

    identity = json.loads(get_jwt_identity())
    profile = CompanyProfile.query.filter_by(user_id=identity['id']).first()
    if application.drive.company_profile_id != profile.id:
        return jsonify({'message': 'Unauthorized'}), 403

    db.session.delete(application)
    db.session.commit()
    cache.clear()
    return jsonify({'message': 'Application removed successfully'}), 200


@company_bp.route('/drives/<int:drive_id>', methods=['DELETE'])
@company_required()
def delete_drive(drive_id):
    identity = json.loads(get_jwt_identity())
    profile = CompanyProfile.query.filter_by(user_id=identity['id']).first()
    
    drive = Drive.query.filter_by(id=drive_id, company_profile_id=profile.id).first()
    if not drive:
        return jsonify({'message': 'Drive not found or unauthorized'}), 404

    try:
        db.session.delete(drive)
        db.session.commit()
        cache.clear()
        return jsonify({'message': 'Drive and all associated applications deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
