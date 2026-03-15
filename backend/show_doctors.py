import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_backend.settings')
django.setup()

from core.models import DoctorProfile

doctors = DoctorProfile.objects.all()
with open('doctors_list.txt', 'w') as f:
    f.write('========== CURRENT DOCTORS IN DATABASE ==========\n')
    for d in doctors:
        f.write(f"- Dr. {d.user.first_name} {d.user.last_name}\n")
        f.write(f"  Username: {d.user.username}\n")
        f.write(f"  City: {d.city}\n")
        f.write(f"  Specialization: {d.specialization}\n")
        f.write('-------------------------------------------------\n')
