import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_backend.settings')
django.setup()

from core.models import User

def delete_demo_users():
    # Delete the single demo doctor 'dr_smith'
    smith_count, _ = User.objects.filter(username='dr_smith').delete()
    print(f"Deleted {smith_count} user(s) with username 'dr_smith'.")
    
    # Delete all generated Kochi doctors
    kochi_count, _ = User.objects.filter(username__startswith='dr_kochi_').delete()
    print(f"Deleted {kochi_count} kochi doctor(s).")

if __name__ == '__main__':
    delete_demo_users()
