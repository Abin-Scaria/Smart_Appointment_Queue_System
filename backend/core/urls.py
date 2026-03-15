from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, DoctorListView, DoctorDetailView, AppointmentBookView,
    PatientDashboardView, DoctorDashboardView, AppointmentUpdateView,
    PrescriptionCreateUpdateView, DoctorProfileUpdateView, PaymentVerifyView,
    EnquiryCreateUpdateView, DoctorEnquiriesView, DoctorRatingView
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Public Doctor Search
    path('doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('doctors/<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
    
    # Booking
    path('appointments/book/', AppointmentBookView.as_view(), name='book-appointment'),
    path('appointments/verify-payment/', PaymentVerifyView.as_view(), name='verify-payment'),
    path('appointments/<int:pk>/status/', AppointmentUpdateView.as_view(), name='update-appointment-status'),
    
    # Dashboards
    path('dashboard/patient/', PatientDashboardView.as_view(), name='patient-dashboard'),
    path('dashboard/doctor/', DoctorDashboardView.as_view(), name='doctor-dashboard'),
    path('dashboard/doctor/profile/', DoctorProfileUpdateView.as_view(), name='doctor-profile-update'),
    path('dashboard/doctor/enquiries/', DoctorEnquiriesView.as_view(), name='doctor-enquiries'),
    
    # Prescription
    path('appointments/<int:appointment_id>/prescription/', PrescriptionCreateUpdateView.as_view(), name='appointment-prescription'),

    # Enquiries
    path('appointments/<int:appointment_id>/enquiries/', EnquiryCreateUpdateView.as_view(), name='create-enquiry'),
    path('enquiries/<int:enquiry_id>/', EnquiryCreateUpdateView.as_view(), name='update-enquiry'),

    # Ratings
    path('doctors/<int:doctor_id>/rating/', DoctorRatingView.as_view(), name='doctor-rating'),
]
