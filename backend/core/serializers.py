from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import DoctorProfile, PatientProfile, ClinicTiming, Appointment, Prescription, Enquiry, Rating

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone_number', 'role', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Allow username to be auto-generated or optional
        password = validated_data.pop('password')
        role = validated_data.get('role', 'PATIENT')
        user = User(**validated_data)
        if not user.username:
            user.username = str(user.phone_number or user.email)
        user.set_password(password)
        user.save()

        # Handle Profile creation based on role
        if role == 'DOCTOR':
            DoctorProfile.objects.create(user=user, specialization='General Physician', city='Kochi', area='', pincode='', clinic_address='')
            # Create default timings
            ClinicTiming.objects.create(doctor=user.doctor_profile)
        elif role == 'PATIENT':
            PatientProfile.objects.create(user=user)
        
        return user

class ClinicTimingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicTiming
        fields = ('start_time', 'end_time', 'slot_duration_mins')

class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    timing = ClinicTimingSerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = '__all__'

    def get_average_rating(self, obj):
        ratings = obj.ratings.all()
        if not ratings:
            return 0
        return round(sum(r.score for r in ratings) / len(ratings), 1)

    def get_total_reviews(self, obj):
        return obj.ratings.count()

class RatingSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)

    class Meta:
        model = Rating
        fields = '__all__'
        read_only_fields = ('patient',)

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = '__all__'

class EnquirySerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_role = serializers.CharField(source='sender.role', read_only=True)

    class Meta:
        model = Enquiry
        fields = '__all__'
        read_only_fields = ('sender', 'appointment')

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_detail = DoctorProfileSerializer(source='doctor', read_only=True)
    patient_detail = UserSerializer(source='patient', read_only=True)
    prescription = PrescriptionSerializer(read_only=True)
    enquiries = EnquirySerializer(many=True, read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ('patient', 'queue_number', 'payment_status', 'razorpay_order_id', 'status')
