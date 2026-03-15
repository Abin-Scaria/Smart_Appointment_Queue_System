import os
import django
import random
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_backend.settings')
django.setup()

from core.models import User, DoctorProfile, ClinicTiming

specializations = [
    'General Physician', 'Pediatrician', 'Cardiologist', 'Dermatologist', 
    'ENT Specialist', 'Orthopedic', 'Gynecologist'
]

areas = [
    'Edappally', 'Vyttila', 'Kakkanad', 'Kaloor', 'Fort Kochi', 
    'Marine Drive', 'Aluva'
]

doctor_names = [
    ('John', 'Mathai'), ('Sita', 'Menon'), ('Arjun', 'Das'),
    ('Priya', 'Sharma'), ('Karthik', 'Nair'), ('Aisha', 'Khan'),
    ('Rahul', 'Pillai')
]

languages = ['English, Malayalam', 'English, Malayalam, Hindi']

def seed_7_doctors():
    print("Starting seeding process for 7 Doctors...")
    
    count_created = 0
    for i in range(7):
        username = f"dr_demo_{i+1}"
        
        # Check if already exists
        if not User.objects.filter(username=username).exists():
            fname, lname = doctor_names[i]
            specialty = specializations[i]
            area = areas[i]
            
            user = User.objects.create_user(
                username=username,
                password='doctor123',
                email=f"{username}@kochiclinic.com",
                first_name=fname,
                last_name=lname,
                role='DOCTOR'
            )
            
            fee = random.choice([400, 500, 600, 800])
            start_hour = random.choice([16, 17, 18])
            
            profile = DoctorProfile.objects.create(
                user=user,
                specialization=specialty,
                experience_years=random.randint(5, 20),
                clinic_address=f"{specialty} Evening Clinic, {area}, Kochi",
                city='Kochi',
                area=area,
                pincode=f"6820{random.randint(10, 99)}",
                consultation_fee=Decimal(f"{fee}.00"),
                languages=random.choice(languages),
                max_patients_per_day=random.randint(15, 30),
                is_verified=True
            )
            
            ClinicTiming.objects.create(
                doctor=profile,
                start_time=f'{start_hour}:00',
                end_time=f'{start_hour + 3}:00',
                slot_duration_mins=15
            )
            
            count_created += 1
            print(f"Created Dr. {fname} {lname} ({specialty} in {area})")
            
    print(f"\\nSeeding Complete! Added {count_created} demo doctors.")

if __name__ == '__main__':
    seed_7_doctors()
