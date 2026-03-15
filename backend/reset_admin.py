import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

try:
    user = User.objects.get(username='admin')
    user.set_password('admin123')
    user.is_superuser = True
    user.is_staff = True
    user.save()
    print("SUCCESS: Admin credentials reset. Username: 'admin', Password: 'admin123'")
except User.DoesNotExist:
    user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("SUCCESS: Admin user created. Username: 'admin', Password: 'admin123'")
