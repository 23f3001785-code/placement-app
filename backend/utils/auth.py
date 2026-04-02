from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
import json


def role_required(required_role):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = json.loads(get_jwt_identity())
            user_id = claims.get('id')
            
            from backend.models import User
            user = User.query.get(user_id)
            
            if not user or not user.is_active:
                return jsonify({'message': 'Account is deactivated'}), 403
                
            if user.role != required_role:
                return jsonify({'message': f'{required_role} access required'}), 403

            if user.role == 'company' and user.company_profile and user.company_profile.is_rejected:
                return jsonify({'message': 'Your company registration has been rejected.'}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper


def admin_required():
    return role_required('admin')


def company_required():
    return role_required('company')


def student_required():
    return role_required('student')
