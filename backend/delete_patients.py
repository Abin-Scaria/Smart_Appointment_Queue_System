import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_backend.settings')
django.setup()

from core.models import User

def delete_patients():
    patient_count, _ = User.objects.filter(role='PATIENT').delete()
    print(f"Deleted {patient_count} patient account(s) and all their associated details.")

if __name__ == '__main__':
    delete_patients()
