import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_backend.settings')
django.setup()

from core.models import DoctorProfile

def fix_cities():
    updated = DoctorProfile.objects.filter(city='').update(city='Kochi')
    print(f"Fixed {updated} doctor profiles with missing city.")

if __name__ == '__main__':
    fix_cities()
