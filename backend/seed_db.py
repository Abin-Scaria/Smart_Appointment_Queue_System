import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_backend.settings')
django.setup()

from core.models import User, DoctorProfile, ClinicTiming

# Create Admin
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("Superuser created")

# Create Doctor
if not User.objects.filter(username='dr_smith').exists():
    user = User.objects.create_user(
        username='dr_smith',
        password='doctor123',
        email='smith@clinic.com',
        first_name='John',
        last_name='Smith',
        role='DOCTOR'
    )
    
    profile = DoctorProfile.objects.create(
        user=user,
        specialization='Cardiologist',
        experience_years=15,
        clinic_address='Heart Center, Mumbai',
        city='Mumbai',
        area='Bandra',
        pincode='400050',
        consultation_fee=Decimal('800.00'),
        languages='English, Hindi, Marathi',
        max_patients_per_day=30,
        is_verified=True
    )
    
    ClinicTiming.objects.create(
        doctor=profile,
        start_time='16:00',
        end_time='21:00',
        slot_duration_mins=15
    )
    print("Doctor 'Dr. John Smith' created")
else:
    print("Users already generated.")
