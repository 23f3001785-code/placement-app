import os

from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-key-for-instihire-1234'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///instihire.sqlite3'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string-super-long-key-for-instihire-1234'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Celery Settings (Flask-compatible uppercase)
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL') or 'redis://127.0.0.1:6379/0'
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND') or 'redis://127.0.0.1:6379/1'
    CELERY_TIMEZONE = 'Asia/Kolkata'
    CELERY_ENABLE_UTC = True

    # Cache Settings
    CACHE_TYPE = os.environ.get('CACHE_TYPE') or 'SimpleCache'
    
    # Mail settings (MailHog)
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or '127.0.0.1'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 1025)
