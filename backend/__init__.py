from flask import Flask
from .config import Config
from .extensions import db, jwt, cache
from flask_cors import CORS
from celery import Celery

celery = Celery(__name__, 
                broker='redis://127.0.0.1:6379/0',
                backend='redis://127.0.0.1:6379/0')


def init_celery(app, celery):
    celery.conf.broker_url = app.config.get('CELERY_BROKER_URL')
    celery.conf.result_backend = app.config.get('CELERY_RESULT_BACKEND')
    celery.conf.timezone = app.config.get('CELERY_TIMEZONE')
    celery.conf.enable_utc = app.config.get('CELERY_ENABLE_UTC')

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery


def create_app():
    import os
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    frontend_dir = os.path.join(base_dir, 'frontend')

    app = Flask(__name__, static_folder=frontend_dir, static_url_path='/frontend', template_folder=frontend_dir)
    app.config.from_object(Config)

    # Initialize extensions
    CORS(app)
    db.init_app(app)
    jwt.init_app(app)
    cache.init_app(app)
    init_celery(app, celery)

    from .routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from .routes.admin import admin_bp
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    with app.app_context():
        from . import models
        db.create_all()

        # Ensure default admin always exists
        from werkzeug.security import generate_password_hash
        admin = models.User.query.filter_by(role='admin').first()
        if not admin:
            admin_user = models.User(
                username='admin@instihire.com',
                password=generate_password_hash('admin123'),
                role='admin'
            )
            db.session.add(admin_user)
            db.session.commit()

    from .routes.company import company_bp
    app.register_blueprint(company_bp, url_prefix='/api/company')

    from .routes.student import student_bp
    app.register_blueprint(student_bp, url_prefix='/api/student')

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_vue_app(path):
        if path.startswith('api/'):
            from flask import jsonify
            return jsonify({'message': 'Not Found'}), 404
        from flask import render_template
        return render_template('index.html')

    return app
