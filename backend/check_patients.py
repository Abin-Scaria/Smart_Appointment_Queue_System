import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_backend.settings')
django.setup()

from core.models import User, Appointment

def check_patients():
    total_users = User.objects.count()
    patient_count = User.objects.filter(role='PATIENT').count()
    patients = User.objects.filter(role='PATIENT').values('id', 'username', 'email')
    appointment_count = Appointment.objects.count()
    
    print(f"Total Users in DB: {total_users}")
    print(f"Patients in DB: {patient_count}")
    print(f"Appointments in DB: {appointment_count}")
    
    if patient_count > 0:
        print("\nPatient Details:")
        for p in patients:
            print(p)
    else:
        print("\nVerified: No patient details exist in the database.")

if __name__ == '__main__':
    check_patients()
