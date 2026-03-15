from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('PATIENT', 'Patient'),
        ('DOCTOR', 'Doctor'),
        ('ADMIN', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='PATIENT')
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)

class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.CharField(max_length=255)
    experience_years = models.IntegerField(default=0)
    clinic_address = models.TextField()
    city = models.CharField(max_length=100)
    area = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=500.0)
    languages = models.CharField(max_length=255, help_text="Comma separated languages")
    max_patients_per_day = models.IntegerField(default=20)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"Dr. {self.user.get_full_name()} ({self.specialization})"

class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    medical_history = models.TextField(blank=True, null=True)

class ClinicTiming(models.Model):
    doctor = models.OneToOneField(DoctorProfile, on_delete=models.CASCADE, related_name='timing')
    start_time = models.TimeField(default='17:30')
    end_time = models.TimeField(default='20:00')
    slot_duration_mins = models.IntegerField(default=10)

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments_as_patient')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='appointments')
    date = models.DateField()
    slot_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    reason_for_visit = models.TextField(blank=True, null=True, help_text="e.g. Fever, cough (Primary/Secondary care)")
    queue_number = models.IntegerField(null=True, blank=True)
    payment_status = models.BooleanField(default=False)
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('doctor', 'date', 'slot_time')

class Prescription(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='prescription')
    medicines = models.TextField(blank=True, null=True, help_text="Prescribed medicines")
    notes = models.TextField(blank=True, null=True, help_text="Advice for the patient")
    pdf_file = models.FileField(upload_to='prescriptions/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Enquiry(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='enquiries')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_enquiries')
    message = models.TextField()
    response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

class Rating(models.Model):
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='ratings')
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_ratings')
    score = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('doctor', 'patient')
        ordering = ['-created_at']
