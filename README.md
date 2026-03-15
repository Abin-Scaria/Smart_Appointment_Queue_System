# 🏥 EveningClinic - Smart Doctor Appointment & Queue System

A highly modern, full-stack web application designed to solve the real-world problem of evening clinic bookings and walk-in queue management in India.

![EveningClinic Promo](https://via.placeholder.com/1200x600.png?text=EveningClinic+-+React+%2B+Django)

## 🌟 Key Features

### 👨‍⚕️ For Doctors
*   **Dynamic Profile Management:** Doctors can update their specialization, consultation fees, clinic address, and experience directly from their dashboard.
*   **Live Patient Queue:** See exactly who is waiting outside the clinic, their queue number, and their reported primary symptoms.
*   **Digital Prescriptions:** Write secure medical prescriptions and advice directly attached to the patient's appointment record.
*   **Direct Q&A Portal:** A built-in messaging system answering follow-up queries from consulted patients directly from the dashboard.

### 🤒 For Patients
*   **Intelligent Search:** Filter specialized doctors by city, area, or specific medical needs.
*   **Real-Time Booking & Queue:** Book an exact time slot and instantly receive a live **Queue Number** (e.g., #4) so you know exactly when to arrive.
*   **Medical History Access:** View all past appointments, download written prescriptions, and review doctor's advice.
*   **Post-Consultation Support:** Ask the doctor questions regarding your prescribed medicines up to 7 days after your visit.

### 💳 Secure Checkout Engine
*   **Razorpay Integration:** Full end-to-end payment gateway setup.
*   **Cryptographic Verification:** The backend securely verifies Razorpay signature hashes before mathematically confirming any slot in the database.
*   *(Note: This repository currently uses a "Graceful Fallback Mock Mode" so anyone can test the payment UI without needing real Razorpay developer keys!)*

---

## 🛠️ Technology Stack

**Frontend (Client)**
*   React 19
*   React Router DOM (Role-Based Dynamic Routing)
*   Tailwind CSS (Highly Custom Styling & Micro-animations)
*   Vite (Lightning fast build tool)
*   Axios (HTTP requests with JWT Interceptors)
*   Lucide React (Beautiful modern iconography)

**Backend (API & Database)**
*   Python 3.13
*   Django 6.0
*   Django REST Framework (DRF)
*   SimpleJWT (JSON Web Token Authentication - 30 Day Sessions)
*   SQLite (Development) / PostgreSQL (Production Ready)
*   Razorpay Python SDK

---

## 🚀 Setup & Installation (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/evening-clinic.git
cd evening-clinic
```

### 2. Backend Setup (Django)
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations to build the database schema
python manage.py makemigrations core
python manage.py migrate

# (Optional) Seed the database with demo doctors in Kochi
python seed_kochi_doctors_7.py

# Start the API server
python manage.py runserver
```
*The backend API will now be running on `http://localhost:8000`*

### 3. Frontend Setup (React)
Open a **new** terminal window:
```bash
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
*The React app will now be running on `http://localhost:5173`*

---

## 🔐 Authentication & Roles
This app uses a highly unified `User` model with strict role constraints `['PATIENT', 'DOCTOR', 'ADMIN']`.
*   If you register normally via the web interface, you are assigned a role based on your selection.
*   The `<DashboardRouter />` component intelligently reads your JWT payload. Doctors are physically blocked from viewing patient data, and patients are blocked from accessing the doctor queue.

### To Demo Both Sides:
1.  **Register as a Doctor:** Fill out your medical profile, set a fee, and navigate to the dashboard to wait for patients.
2.  **Register as a Patient (Incognito Window):** Search for the doctor you just created, book a slot, and process the mock payment. 
3.  Watch the queue number generate instantly on both screens!

---

## 📜 Future Roadmap
- [ ] Automated SMS Reminders using Twilio.
- [ ] PDF Generation for official prescription downloads (`ReportLab`).
- [ ] Google Maps API integration to calculate distance from Patient to Clinic.
- [ ] WebSockets (`Django Channels`) for live moving queue numbers without refreshing.

---

*Designed and developed by [Abin Scaria]. Feel free to fork, contribute, or reach out with any questions!*
