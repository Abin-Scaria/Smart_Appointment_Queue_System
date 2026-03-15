from django.contrib import admin
from .models import User, DoctorProfile, PatientProfile, ClinicTiming, Appointment, Prescription

admin.site.register(User)
admin.site.register(DoctorProfile)
admin.site.register(PatientProfile)
admin.site.register(ClinicTiming)
admin.site.register(Appointment)
admin.site.register(Prescription)
