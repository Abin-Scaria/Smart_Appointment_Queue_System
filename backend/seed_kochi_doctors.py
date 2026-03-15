import os
import django
import random
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_backend.settings')
django.setup()

from core.models import User, DoctorProfile, ClinicTiming

specializations = [
    'General Physician', 'Pediatrician', 'Cardiologist', 'Dermatologist', 
    'ENT Specialist', 'Orthopedic', 'Gynecologist', 'Ophthalmologist', 
    'Psychiatrist', 'Dentist'
]

areas = [
    'Edappally', 'Vyttila', 'Kakkanad', 'Kaloor', 'Fort Kochi', 
    'Marine Drive', 'Aluva', 'Palarivattom', 'Panampilly Nagar', 'Kadavanthra'
]

first_names = [
    'Arjun', 'Rahul', 'Anjali', 'Meera', 'Vivek', 'Sneha', 'Deepak', 'Kavya', 
    'Nitin', 'Priya', 'Sanjay', 'Riya', 'Karthik', 'Divya', 'Ravi', 'Aswathy',
    'Mohan', 'Lakshmi', 'Thomas', 'Anu', 'Ajay', 'Sara', 'Varun', 'Nisha'
]

last_names = [
    'Nair', 'Menon', 'Kumar', 'Pillai', 'Varghese', 'Iyer', 'Kurian', 'Rao', 
    'Panicker', 'Sharma', 'Dev', 'Mathew', 'Joseph', 'George', 'Babu', 'Nambiar'
]

languages = ['English, Malayalam', 'English, Malayalam, Hindi', 'Malayalam, Tamil', 'English, Hindi', 'Malayalam']

def seed_kochi_doctors():
    print("Starting seeding process for Kochi Doctors...")
    
    # We aim to create 30 doctors
    count_created = 0
    for i in range(1, 31):
        username = f"dr_kochi_{i}"
        
        # Check if already exists
        if not User.objects.filter(username=username).exists():
            fname = random.choice(first_names)
            lname = random.choice(last_names)
            specialty = random.choice(specializations)
            area = random.choice(areas)
            
            user = User.objects.create_user(
                username=username,
                password='doctor123',
                email=f"{username}@kochiclinic.com",
                first_name=fname,
                last_name=lname,
                role='DOCTOR'
            )
            
            fee = random.choice([300, 400, 500, 600, 800])
            start_hour = random.choice([16, 17, 18])
            
            profile = DoctorProfile.objects.create(
                user=user,
                specialization=specialty,
                experience_years=random.randint(2, 25),
                clinic_address=f"Evening Clinic, {area}, Kochi",
                city='Kochi',
                area=area,
                pincode=f"6820{random.randint(10, 99)}",
                consultation_fee=Decimal(f"{fee}.00"),
                languages=random.choice(languages),
                max_patients_per_day=random.randint(15, 40),
                is_verified=True
            )
            
            ClinicTiming.objects.create(
                doctor=profile,
                start_time=f'{start_hour}:00',
                end_time=f'{start_hour + 4}:00',
                slot_duration_mins=random.choice([10, 15, 20])
            )
            
            count_created += 1
            print(f"Created Dr. {fname} {lname} ({specialty} in {area}, Kochi)")
            
    print(f"\\nSeeding Complete! Added {count_created} logic doctors in Kochi.")

if __name__ == '__main__':
    seed_kochi_doctors()
