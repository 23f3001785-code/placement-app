from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import get_jwt_identity
from backend.extensions import db, cache
from backend.models import Drive, Application, StudentProfile
from backend.utils.auth import student_required
from datetime import datetime
import json
import os

student_bp = Blueprint('student', __name__)


@student_bp.route('/profile', methods=['GET', 'POST', 'PUT'])
@student_required()
def manage_profile():
    identity = json.loads(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=identity['id']).first()

    if request.method == 'GET':
        return jsonify({
            'full_name': profile.full_name,
            'college_name': profile.college_name,
            'degree': profile.degree,
            'branch': profile.branch,
            'cgpa': profile.cgpa,
            'graduation_year': profile.graduation_year,
            'resume_url': profile.resume_url
        }), 200

    if request.is_json:
        data = request.get_json()
    else:
        data = request.form

    full_name = data.get('full_name', profile.full_name)
    degree = data.get('degree', profile.degree)
    branch = data.get('branch', profile.branch)

    if not full_name or not str(full_name).strip():
        return jsonify({'message': 'Full name cannot be empty'}), 400
    if not degree or not str(degree).strip():
        return jsonify({'message': 'Degree cannot be empty'}), 400
    if not branch or not str(branch).strip():
        return jsonify({'message': 'Branch cannot be empty'}), 400

    profile.full_name = full_name
    profile.college_name = data.get('college_name', profile.college_name)
    profile.degree = degree
    profile.branch = branch
    
    if 'cgpa' in data:
        try:
            cgpa_val = float(data['cgpa'])
            if cgpa_val < 0 or cgpa_val > 10:
                return jsonify({'message': 'CGPA must be between 0 and 10'}), 400
            profile.cgpa = cgpa_val
        except ValueError:
            return jsonify({'message': 'Invalid CGPA'}), 400
            
    if 'graduation_year' in data:
        try:
            grad_year = int(data['graduation_year'])
            if grad_year < 1900 or grad_year > 2100:
                return jsonify({'message': 'Graduation year must be between 1900 and 2100'}), 400
            profile.graduation_year = grad_year
        except (ValueError, TypeError):
            return jsonify({'message': 'Invalid Graduation Year'}), 400

    if not request.is_json and 'resume' in request.files:
        file = request.files['resume']
        if file.filename:
            import time
            timestamp = int(time.time())
            filename = f"student_{profile.user_id}_resume_{timestamp}.pdf"
            filepath = os.path.join(current_app.static_folder, 'uploads', 'resumes')
            os.makedirs(filepath, exist_ok=True)
            
            # Delete old resume physically if it exists
            if profile.resume_url:
                old_filename = profile.resume_url.split('/')[-1].split('?')[0] # remove query params if any
                old_filepath = os.path.join(filepath, old_filename)
                if os.path.exists(old_filepath):
                    try:
                        os.remove(old_filepath)
                    except Exception:
                        pass

            file.save(os.path.join(filepath, filename))
            profile.resume_url = f"/frontend/uploads/resumes/{filename}"

    db.session.commit()
    cache.clear()
    return jsonify({'message': 'Profile updated'}), 200


@student_bp.route('/drives', methods=['GET'])
@student_required()
@cache.cached(timeout=60, key_prefix='student_drives')
def list_approved_drives():
    # Only show approved drives that haven't passed their deadline
    drives = Drive.query.filter(
        Drive.status == 'Approved',
        Drive.deadline >= datetime.utcnow()
    ).all()
    res = []
    for d in drives:
        res.append({
            'id': d.id,
            'job_title': d.job_title,
            'job_description': d.job_description,
            'company_name': d.company.company_name,
            'required_degree': d.required_degree,
            'required_branch': d.required_branch,
            'min_cgpa': d.min_cgpa,
            'deadline': d.deadline.isoformat() + 'Z'
        })
    return jsonify(res), 200


@student_bp.route('/drives/<int:drive_id>/apply', methods=['POST'])
@student_required()
def apply_to_drive(drive_id):
    identity = json.loads(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=identity['id']).first()

    drive = Drive.query.get(drive_id)
    if not drive or drive.status != 'Approved':
        return jsonify({'message': 'Drive not available'}), 404

    if not profile.resume_url:
        return jsonify({'message': 'Please upload your resume in your profile before applying.'}), 403

    if profile.cgpa < drive.min_cgpa:
        return jsonify({'message': 'You do not meet the minimum CGPA requirement'}), 403
    # Check eligibility
    if drive.required_degree and drive.required_degree != 'Any' and drive.required_degree != profile.degree:
        return jsonify({'message': f'Required degree: {drive.required_degree}'}), 403

    if drive.required_branch and drive.required_branch != 'Any' and drive.required_branch != profile.branch:
        return jsonify({'message': f'Required branch: {drive.required_branch}'}), 403

    if datetime.utcnow() > drive.deadline:
        return jsonify({'message': 'Deadline has passed'}), 403

    existing_app = Application.query.filter_by(student_profile_id=profile.id, drive_id=drive_id).first()
    if existing_app:
        return jsonify({'message': 'You have already applied to this drive'}), 400

    new_app = Application(
        student_profile_id=profile.id,
        drive_id=drive_id,
        status='Applied'
    )
    db.session.add(new_app)
    db.session.commit()
    cache.clear()  # Invalidate cache on new application
    return jsonify({'message': 'Applied successfully'}), 201


@student_bp.route('/applications', methods=['GET'])
@student_required()
def list_applications():
    identity = json.loads(get_jwt_identity())
    user_id = identity['id']

    # User-specific cache key
    cache_key = f"student_apps_{user_id}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return jsonify(cached_data), 200

    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    res = []
    for app in profile.applications:
        res.append({
            'application_id': app.id,
            'drive_id': app.drive_id,
            'job_title': app.drive.job_title,
            'company_name': app.drive.company.company_name,
            'status': app.status,
            'applied_on': app.applied_on.isoformat() + 'Z'
        })

    cache.set(cache_key, res, timeout=60)
    return jsonify(res), 200


@student_bp.route('/export', methods=['GET', 'POST'])
@student_required()
def export_csv():
    identity = json.loads(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=identity['id']).first()
    if not profile:
        return jsonify({'message': 'Profile not found'}), 404

    # CSV Header
    csv_content = "Student ID,Company Name,Position,Application Status,Applied On\n"

    def clean(text):
        return str(text).replace(',', ';').replace('\n', ' ')

    for appt in profile.applications:
        company_name = appt.drive.company.company_name
        job_title = appt.drive.job_title
        status = appt.status
        date_str = appt.applied_on.strftime('%Y-%m-%d')
        
        line = f"{profile.user_id},{clean(company_name)},{clean(job_title)},{clean(status)},{date_str}\n"
        csv_content += line

    from flask import Response
    return Response(
        csv_content,
        mimetype="text/csv",
        headers={"Content-disposition": f"attachment; filename=applications_{profile.id}.csv"}
    )
