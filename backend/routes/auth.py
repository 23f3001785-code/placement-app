import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from backend.extensions import db
from backend.models import User, CompanyProfile, StudentProfile

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Username and password are required'}), 400

    user = User.query.filter_by(username=data['username']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    if not user.is_active:
        return jsonify({'message': 'Account is deactivated'}), 403

    if user.role == 'company':
        if user.company_profile and user.company_profile.is_rejected:
            return jsonify({'message': 'Your company registration has been rejected by the administrator.'}), 403

    identity_data = {'id': user.id, 'role': user.role, 'username': user.username}
    access_token = create_access_token(identity=json.dumps(identity_data))
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role
        }
    }), 200


@auth_bp.route('/register/company', methods=['POST'])
def register_company():
    data = request.get_json()
    required = ['username', 'password', 'company_name', 'hr_contact', 'hr_phone']
    if not data or not all((data.get(k) or '').strip() for k in required):
        return jsonify({'message': 'Missing required fields'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 409

    try:
        user = User(
            username=data['username'],
            password=generate_password_hash(data['password']),
            role='company',
            is_active=True
        )
        db.session.add(user)
        db.session.flush()

        hr_phone = str(data['hr_phone']).strip()
        if not hr_phone.isdigit() or len(hr_phone) != 10:
            return jsonify({'message': 'HR Phone must be exactly 10 digits'}), 400

        company = CompanyProfile(
            user_id=user.id,
            company_name=data['company_name'],
            hr_contact=data['hr_contact'],
            hr_phone=hr_phone,
            website=data.get('website'),
            is_approved=False
        )
        db.session.add(company)
        db.session.commit()

        identity_data = {'id': user.id, 'role': user.role, 'username': user.username}
        access_token = create_access_token(identity=json.dumps(identity_data))

        return jsonify({
            'message': 'Company registered successfully. Waiting for admin approval.',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@auth_bp.route('/register/student', methods=['POST'])
def register_student():
    data = request.get_json()
    required = ['username', 'password', 'full_name', 'college_name', 'degree', 'branch', 'cgpa', 'graduation_year']
    if not data or not all(str(data.get(k, '')).strip() for k in required):
        return jsonify({'message': 'Missing required fields'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 409

    try:
        user = User(
            username=data['username'],
            password=generate_password_hash(data['password']),
            role='student',
            is_active=True
        )
        db.session.add(user)
        db.session.flush()

        try:
            grad_year = int(data['graduation_year'])
            current_year = datetime.utcnow().year
            if grad_year < (current_year - 15) or grad_year > (current_year + 4):
                return jsonify({'message': f'Graduation year must be between {current_year - 15} and {current_year + 4}'}), 400
            
            cgpa = float(data['cgpa'])
            if cgpa < 0 or cgpa > 10:
                return jsonify({'message': 'CGPA must be between 0 and 10'}), 400
        except (ValueError, TypeError):
            return jsonify({'message': 'Invalid graduation year or CGPA'}), 400

        student = StudentProfile(
            user_id=user.id,
            full_name=data['full_name'],
            college_name=data['college_name'],
            degree=data['degree'],
            branch=data['branch'],
            cgpa=float(data['cgpa']),
            graduation_year=grad_year
        )
        db.session.add(student)
        db.session.commit()

        identity_data = {'id': user.id, 'role': user.role, 'username': user.username}
        access_token = create_access_token(identity=json.dumps(identity_data))

        return jsonify({
            'message': 'Student registered successfully.',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
