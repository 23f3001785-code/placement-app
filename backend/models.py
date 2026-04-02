from .extensions import db
from datetime import datetime


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin', 'company', 'student'
    is_active = db.Column(db.Boolean, default=True)

    # Relationships
    company_profile = db.relationship('CompanyProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    student_profile = db.relationship('StudentProfile', backref='user', uselist=False, cascade="all, delete-orphan")


class CompanyProfile(db.Model):
    __tablename__ = 'company_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    company_name = db.Column(db.String(120), nullable=False)
    hr_contact = db.Column(db.String(120), nullable=False)
    hr_phone = db.Column(db.String(20), nullable=True)
    website = db.Column(db.String(120), nullable=True)
    is_approved = db.Column(db.Boolean, default=False)
    is_rejected = db.Column(db.Boolean, default=False)
    drives = db.relationship('Drive', backref='company', lazy=True, cascade="all, delete-orphan")


class StudentProfile(db.Model):
    __tablename__ = 'student_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    degree = db.Column(db.String(80), nullable=False, default='B.Tech')
    branch = db.Column(db.String(50), nullable=False)
    college_name = db.Column(db.String(150), nullable=True)
    cgpa = db.Column(db.Float, nullable=False)
    graduation_year = db.Column(db.Integer, nullable=False)
    resume_url = db.Column(db.String(255), nullable=True)
    applications = db.relationship('Application', backref='student', lazy=True, cascade="all, delete-orphan")


class Drive(db.Model):
    __tablename__ = 'drives'
    id = db.Column(db.Integer, primary_key=True)
    company_profile_id = db.Column(db.Integer, db.ForeignKey('company_profiles.id'), nullable=False)
    job_title = db.Column(db.String(120), nullable=False)
    job_description = db.Column(db.Text, nullable=False)
    required_degree = db.Column(db.String(80), nullable=True)
    required_branch = db.Column(db.String(50), nullable=True)
    min_cgpa = db.Column(db.Float, nullable=False)
    deadline = db.Column(db.DateTime, nullable=False)
    interview_mode = db.Column(db.String(50), default='In-Person')  # In-Person, Remote, Hybrid
    status = db.Column(db.String(20), default='Pending')  # Pending, Approved, Closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    applications = db.relationship('Application', backref='drive', lazy=True, cascade="all, delete-orphan")


class Application(db.Model):
    __tablename__ = 'applications'
    id = db.Column(db.Integer, primary_key=True)
    student_profile_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id'), nullable=False)
    drive_id = db.Column(db.Integer, db.ForeignKey('drives.id'), nullable=False)
    status = db.Column(db.String(20), default='Applied')  # Applied, Shortlisted, Selected, Rejected
    applied_on = db.Column(db.DateTime, default=datetime.utcnow)
