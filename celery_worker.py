from celery.schedules import crontab
from backend import create_app, celery

flask_app = create_app()


import backend.tasks.async_jobs
import backend.tasks.scheduled

@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute='*'),
        backend.tasks.scheduled.send_daily_reminders.s(),
        name='Daily reminders every minute'
    )
    sender.add_periodic_task(
        crontab(minute='*/10'),
        backend.tasks.scheduled.send_monthly_report.s(),
        name='Monthly report every 10 minutes'
    )
