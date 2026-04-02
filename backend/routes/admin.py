from flask import Blueprint, jsonify
from backend.extensions import db, cache
from backend.models import User, CompanyProfile, StudentProfile, Drive, Application
from backend.utils.auth import admin_required

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/stats', methods=['GET'])
@admin_required()
def get_stats():
    total_students = StudentProfile.query.count()
    total_companies = CompanyProfile.query.filter_by(is_rejected=False).count()
    total_drives = Drive.query.count()
    return jsonify({
        'total_students': total_students,
        'total_companies': total_companies,
        'total_drives': total_drives
    }), 200


@admin_bp.route('/companies', methods=['GET'])
@admin_required()
def list_all_companies():
    companies = CompanyProfile.query.all()
    res = [{
        'id': c.id,
        'user_id': c.user_id,
        'company_name': c.company_name,
        'hr_contact': c.hr_contact,
        'hr_phone': c.hr_phone,
        'website': c.website,
        'is_approved': c.is_approved,
        'is_rejected': getattr(c, 'is_rejected', False),
        'is_active': c.user.is_active
    } for c in companies]
    return jsonify(res), 200


@admin_bp.route('/companies/<int:company_id>/approve', methods=['POST'])
@admin_required()
def approve_company(company_id):
    company = CompanyProfile.query.get(company_id)
    if not company:
        return jsonify({'message': 'Company not found'}), 404
    company.is_approved = True
    company.is_rejected = False
    db.session.commit()
    cache.clear()  # Invalidate
    return jsonify({'message': 'Company approved'}), 200


@admin_bp.route('/companies/<int:company_id>/reject', methods=['POST'])
@admin_required()
def reject_company(company_id):
    company = CompanyProfile.query.get(company_id)
    if not company:
        return jsonify({'message': 'Company not found'}), 404
    company.is_approved = False
    company.is_rejected = True
    db.session.commit()
    cache.clear()
    return jsonify({'message': 'Company rejected'}), 200


@admin_bp.route('/users/<int:user_id>/blacklist', methods=['POST'])
@admin_required()
def blacklist_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    user.is_active = not user.is_active
    db.session.commit()
    cache.clear()  # Ensure global lists are updated
    status = 'blacklisted/deactivated' if not user.is_active else 'activated'
    return jsonify({'message': f'User {status}'}), 200


@admin_bp.route('/drives', methods=['GET'])
@admin_required()
def list_all_drives():
    drives = Drive.query.all()
    res = [{
        'id': d.id,
        'job_title': d.job_title,
        'job_description': d.job_description,
        'company_name': d.company.company_name,
        'required_degree': d.required_degree,
        'required_branch': d.required_branch,
        'min_cgpa': d.min_cgpa,
        'deadline': (d.deadline.isoformat() + 'Z') if d.deadline else None,
        'status': d.status
    } for d in drives]
    return jsonify(res), 200


@admin_bp.route('/drives/<int:drive_id>/<status>', methods=['POST'])
@admin_required()
def update_drive_status(drive_id, status):
    if status not in ['Approved', 'Rejected']:
        return jsonify({'message': 'Invalid status'}), 400
    drive = Drive.query.get(drive_id)
    if not drive:
        return jsonify({'message': 'Drive not found'}), 404
    drive.status = status
    if status == 'Approved':
        # Trigger instant notification task using explicit celery instance
        try:
            from backend import celery
            celery.send_task('backend.tasks.scheduled.notify_students_new_drive', args=[drive.id])
        except Exception as e:
            print(f" [BACKEND ERROR] Failed to queue notification task: {e}")
            # We don't return 500 here because the DB update (status change) was successful
            # Fail gracefully so the admin can still approve the drive
    
    db.session.commit()
    cache.clear()
    return jsonify({'message': f'Drive {status.lower()}'}), 200


@admin_bp.route('/companies/<int:company_id>', methods=['DELETE'])
@admin_required()
def delete_company(company_id):
    company = CompanyProfile.query.get(company_id)
    if not company:
        return jsonify({'message': 'Company not found'}), 404
    db.session.delete(company.user)  # Cascades to profile
    db.session.commit()
    cache.clear()
    return jsonify({'message': 'Company and associated user deleted'}), 200


@admin_bp.route('/students/<int:student_id>', methods=['DELETE'])
@admin_required()
def delete_student(student_id):
    student = StudentProfile.query.get(student_id)
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    db.session.delete(student.user)  # Cascades to profile
    db.session.commit()
    cache.clear()
    return jsonify({'message': 'Student and associated user deleted'}), 200


@admin_bp.route('/drives/<int:drive_id>', methods=['DELETE'])
@admin_required()
def delete_drive(drive_id):
    drive = Drive.query.get(drive_id)
    if not drive:
        return jsonify({'message': 'Drive not found'}), 404
    db.session.delete(drive)
    db.session.commit()
    cache.clear()
    return jsonify({'message': 'Placement drive deleted'}), 200


@admin_bp.route('/applications/<int:app_id>', methods=['DELETE'])
@admin_required()
def delete_application(app_id):
    application = Application.query.get(app_id)
    if not application:
        return jsonify({'message': 'Application not found'}), 404
    db.session.delete(application)
    db.session.commit()
    cache.clear()
    return jsonify({'message': 'Application deleted'}), 200


@admin_bp.route('/students', methods=['GET'])
@admin_required()
def list_students():
    students = StudentProfile.query.all()
    res = [{
        'id': s.id,
        'full_name': s.full_name,
        'college_name': s.college_name,
        'degree': s.degree,
        'branch': s.branch,
        'cgpa': s.cgpa,
        'graduation_year': s.graduation_year,
        'resume_url': s.resume_url,
        'is_active': s.user.is_active,
        'user_id': s.user.id
    } for s in students]
    return jsonify(res), 200


@admin_bp.route('/applications', methods=['GET'])
@admin_required()
def list_all_applications():
    applications = Application.query.all()
    res = [{
        'id': a.id,
        'student_name': a.student.full_name if a.student else "Deleted Student",
        'college_name': a.student.college_name if a.student else "N/A",
        'company_name': a.drive.company.company_name if a.drive and a.drive.company else "Deleted Company",
        'job_title': a.drive.job_title if a.drive else "Deleted Drive",
        'resume_url': a.student.resume_url if a.student else None,
        'status': a.status,
        'applied_on': a.applied_on.isoformat() + 'Z'
    } for a in applications]
    return jsonify(res), 200
