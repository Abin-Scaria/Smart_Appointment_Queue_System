import http from 'node:http';
import { createAccessToken, hashPassword, verifyAccessToken, verifyPassword } from './src/auth.js';
import { nextId, readStore, writeStore } from './src/store.js';

const port = Number(process.env.PORT || 3001);

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json',
  });
  response.end(JSON.stringify(data));
}

function parseRequestBody(request) {
  return new Promise((resolve, reject) => {
    let rawBody = '';
    request.on('data', (chunk) => {
      rawBody += chunk;
    });
    request.on('end', () => {
      if (!rawBody) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(rawBody));
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone_number: user.phone_number,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
  };
}

function timeToMinutes(timeValue) {
  const [hours = '0', minutes = '0'] = timeValue.split(':');
  return Number(hours) * 60 + Number(minutes);
}

function minutesToTime(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}:00`;
}

function averageRatingForDoctor(doctorId, store) {
  const ratings = store.ratings.filter((entry) => entry.doctorId === doctorId);
  if (!ratings.length) {
    return 0;
  }
  return Number((ratings.reduce((sum, entry) => sum + Number(entry.score), 0) / ratings.length).toFixed(1));
}

function serializeDoctor(doctor, store, options = {}) {
  const user = store.users.find((entry) => entry.id === doctor.userId);
  const timing = store.clinicTimings.find((entry) => entry.doctorId === doctor.id);
  const payload = {
    ...doctor,
    user: sanitizeUser(user),
    timing,
    average_rating: averageRatingForDoctor(doctor.id, store),
    total_reviews: store.ratings.filter((entry) => entry.doctorId === doctor.id).length,
  };

  if (options.withAvailability) {
    const bookedTimes = new Set(
      store.appointments
        .filter((entry) => entry.doctorId === doctor.id && entry.date === options.date && entry.status !== 'CANCELLED')
        .map((entry) => entry.slot_time)
    );

    const availableSlots = [];
    const startMinutes = timeToMinutes(timing.start_time);
    const endMinutes = timeToMinutes(timing.end_time);
    const slotDuration = Number(timing.slot_duration_mins || 15);

    for (let current = startMinutes; current + slotDuration <= endMinutes; current += slotDuration) {
      const time = minutesToTime(current);
      availableSlots.push({
        time,
        available: !bookedTimes.has(time),
      });
    }

    payload.available_slots = availableSlots;
  }

  return payload;
}

function serializePrescription(appointmentId, store) {
  return store.prescriptions.find((entry) => entry.appointmentId === appointmentId) || null;
}

function serializeEnquiry(enquiry, store) {
  const sender = store.users.find((entry) => entry.id === enquiry.senderId);
  return {
    ...enquiry,
    appointment: enquiry.appointmentId,
    sender: enquiry.senderId,
    sender_name: [sender?.first_name, sender?.last_name].filter(Boolean).join(' ').trim(),
    sender_role: sender?.role,
  };
}

function serializeAppointment(appointment, store) {
  const patient = store.users.find((entry) => entry.id === appointment.patientId);
  const doctor = store.doctorProfiles.find((entry) => entry.id === appointment.doctorId);
  return {
    ...appointment,
    patient: appointment.patientId,
    doctor: appointment.doctorId,
    patient_detail: sanitizeUser(patient),
    doctor_detail: serializeDoctor(doctor, store),
    prescription: serializePrescription(appointment.id, store),
    enquiries: store.enquiries
      .filter((entry) => entry.appointmentId === appointment.id)
      .sort((left, right) => right.created_at.localeCompare(left.created_at))
      .map((entry) => serializeEnquiry(entry, store)),
  };
}

function serializeRating(rating, store) {
  const patient = store.users.find((entry) => entry.id === rating.patientId);
  return {
    ...rating,
    doctor: rating.doctorId,
    patient: rating.patientId,
    patient_name: [patient?.first_name, patient?.last_name].filter(Boolean).join(' ').trim(),
  };
}

function getAuthenticatedUser(request, store) {
  const authorizationHeader = request.headers.authorization || '';
  const token = authorizationHeader.startsWith('Bearer ') ? authorizationHeader.slice(7) : null;
  const payload = verifyAccessToken(token);
  if (!payload) {
    return null;
  }
  return store.users.find((entry) => entry.id === payload.sub) || null;
}

function getDoctorProfileForUser(user, store) {
  return store.doctorProfiles.find((entry) => entry.userId === user.id) || null;
}

function sortByLatestDate(left, right) {
  return `${right.date}T${right.slot_time}`.localeCompare(`${left.date}T${left.slot_time}`);
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    });
    response.end();
    return;
  }

  const url = new URL(request.url, 'http://localhost');
  const pathname = url.pathname;

  try {
    const store = await readStore();

    if (request.method === 'GET' && pathname === '/api/health/') {
      sendJson(response, 200, { status: 'ok' });
      return;
    }

    if (request.method === 'POST' && pathname === '/api/auth/register/') {
      const body = await parseRequestBody(request);
      if (!body.username || !body.password || !body.first_name) {
        sendJson(response, 400, { error: 'Username, password, and first name are required.' });
        return;
      }

      const normalizedUsername = body.username.trim().toLowerCase();
      const existingUser = store.users.find((entry) => entry.username.toLowerCase() === normalizedUsername);
      if (existingUser) {
        sendJson(response, 400, { error: 'That username is already in use.' });
        return;
      }

      const user = {
        id: nextId(store.users),
        username: body.username.trim(),
        email: body.email?.trim() || '',
        passwordHash: hashPassword(body.password),
        role: body.role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT',
        first_name: body.first_name.trim(),
        last_name: body.last_name?.trim() || '',
        phone_number: body.phone_number?.trim() || '',
      };

      store.users.push(user);

      if (user.role === 'DOCTOR') {
        const doctorProfile = {
          id: nextId(store.doctorProfiles),
          userId: user.id,
          specialization: 'General Medicine',
          experience_years: 0,
          clinic_address: 'Clinic address pending update',
          city: 'Kochi',
          area: '',
          pincode: '',
          consultation_fee: 600,
          languages: 'English',
          max_patients_per_day: 20,
          is_verified: false,
        };
        store.doctorProfiles.push(doctorProfile);
        store.clinicTimings.push({
          id: nextId(store.clinicTimings),
          doctorId: doctorProfile.id,
          start_time: '17:30:00',
          end_time: '20:30:00',
          slot_duration_mins: 15,
        });
      } else {
        store.patientProfiles.push({
          id: nextId(store.patientProfiles),
          userId: user.id,
          medical_history: '',
        });
      }

      await writeStore(store);
      sendJson(response, 201, { message: 'User registered successfully.' });
      return;
    }

    if (request.method === 'POST' && pathname === '/api/auth/login/') {
      const body = await parseRequestBody(request);
      const username = String(body.username || '').trim().toLowerCase();
      const user = store.users.find(
        (entry) => entry.username.toLowerCase() === username || entry.phone_number === body.username
      );

      if (!user || !verifyPassword(body.password || '', user.passwordHash)) {
        sendJson(response, 401, { error: 'Invalid username or password.' });
        return;
      }

      sendJson(response, 200, {
        access: createAccessToken(user),
        user: sanitizeUser(user),
      });
      return;
    }

    if (request.method === 'GET' && pathname === '/api/doctors/') {
      const city = url.searchParams.get('city')?.toLowerCase() || '';
      const specialization = url.searchParams.get('specialization')?.toLowerCase() || '';
      const feeMax = Number(url.searchParams.get('fee_max') || 0);

      let doctors = [...store.doctorProfiles];
      if (city) {
        doctors = doctors.filter((entry) => entry.city.toLowerCase().includes(city));
      }
      if (specialization) {
        doctors = doctors.filter((entry) => entry.specialization.toLowerCase().includes(specialization));
      }
      if (feeMax > 0) {
        doctors = doctors.filter((entry) => Number(entry.consultation_fee) <= feeMax);
      }

      sendJson(response, 200, doctors.map((entry) => serializeDoctor(entry, store)));
      return;
    }

    const doctorRatingMatch = pathname.match(/^\/api\/doctors\/(\d+)\/rating\/$/);
    if (doctorRatingMatch && request.method === 'GET') {
      const doctorId = Number(doctorRatingMatch[1]);
      const ratings = store.ratings
        .filter((entry) => entry.doctorId === doctorId)
        .sort((left, right) => right.created_at.localeCompare(left.created_at))
        .map((entry) => serializeRating(entry, store));
      sendJson(response, 200, ratings);
      return;
    }

    if (doctorRatingMatch && request.method === 'POST') {
      const user = getAuthenticatedUser(request, store);
      if (!user) {
        sendJson(response, 401, { error: 'Authentication required.' });
        return;
      }
      if (user.role !== 'PATIENT') {
        sendJson(response, 403, { error: 'Only patients can rate clinicians.' });
        return;
      }

      const doctorId = Number(doctorRatingMatch[1]);
      const doctor = store.doctorProfiles.find((entry) => entry.id === doctorId);
      if (!doctor) {
        sendJson(response, 404, { error: 'Doctor not found.' });
        return;
      }

      const body = await parseRequestBody(request);
      const score = Number(body.score);
      if (!score || score < 1 || score > 5) {
        sendJson(response, 400, { error: 'Score must be between 1 and 5.' });
        return;
      }

      const existingRating = store.ratings.find((entry) => entry.doctorId === doctorId && entry.patientId === user.id);
      if (existingRating) {
        existingRating.score = score;
        existingRating.review = body.review || '';
        existingRating.created_at = new Date().toISOString();
        await writeStore(store);
        sendJson(response, 200, serializeRating(existingRating, store));
        return;
      }

      const rating = {
        id: nextId(store.ratings),
        doctorId,
        patientId: user.id,
        score,
        review: body.review || '',
        created_at: new Date().toISOString(),
      };
      store.ratings.push(rating);
      await writeStore(store);
      sendJson(response, 201, serializeRating(rating, store));
      return;
    }

    const doctorDetailMatch = pathname.match(/^\/api\/doctors\/(\d+)\/$/);
    if (doctorDetailMatch && request.method === 'GET') {
      const doctorId = Number(doctorDetailMatch[1]);
      const doctor = store.doctorProfiles.find((entry) => entry.id === doctorId);
      if (!doctor) {
        sendJson(response, 404, { error: 'Doctor not found.' });
        return;
      }

      const targetDate = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
      sendJson(response, 200, serializeDoctor(doctor, store, { withAvailability: true, date: targetDate }));
      return;
    }

    if (request.method === 'POST' && pathname === '/api/appointments/book/') {
      const user = getAuthenticatedUser(request, store);
      if (!user) {
        sendJson(response, 401, { error: 'Authentication required.' });
        return;
      }

      const body = await parseRequestBody(request);
      const doctorId = Number(body.doctor_id);
      const doctor = store.doctorProfiles.find((entry) => entry.id === doctorId);
      if (!doctor || !body.date || !body.slot_time) {
        sendJson(response, 400, { error: 'Doctor, date, and slot time are required.' });
        return;
      }

      const conflictingAppointment = store.appointments.find(
        (entry) => entry.doctorId === doctorId && entry.date === body.date && entry.slot_time === body.slot_time && entry.status !== 'CANCELLED'
      );
      if (conflictingAppointment) {
        sendJson(response, 400, { error: 'This slot has already been reserved.' });
        return;
      }

      const queueNumber =
        store.appointments.filter((entry) => entry.doctorId === doctorId && entry.date === body.date && entry.status !== 'CANCELLED').length + 1;

      const appointment = {
        id: nextId(store.appointments),
        patientId: user.id,
        doctorId,
        date: body.date,
        slot_time: body.slot_time,
        status: 'PENDING',
        reason_for_visit: body.reason_for_visit || '',
        queue_number: queueNumber,
        payment_status: false,
        razorpay_order_id: `ORDER_${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      store.appointments.push(appointment);
      await writeStore(store);
      sendJson(response, 201, {
        ...serializeAppointment(appointment, store),
        razorpay_key_id: 'rzp_test_demo',
        amount: Number(doctor.consultation_fee) * 100,
      });
      return;
    }

    if (request.method === 'POST' && pathname === '/api/appointments/verify-payment/') {
      const user = getAuthenticatedUser(request, store);
      if (!user) {
        sendJson(response, 401, { error: 'Authentication required.' });
        return;
      }

      const body = await parseRequestBody(request);
      const appointment = store.appointments.find((entry) => entry.id === Number(body.appointment_id) && entry.patientId === user.id);
      if (!appointment) {
        sendJson(response, 404, { error: 'Appointment not found.' });
        return;
      }

      appointment.payment_status = true;
      appointment.status = 'CONFIRMED';
      await writeStore(store);
      sendJson(response, 200, { message: 'Payment verified successfully.', status: appointment.status });
      return;
    }

    if (request.method === 'GET' && pathname === '/api/dashboard/patient/') {
      const user = getAuthenticatedUser(request, store);
      if (!user) {
        sendJson(response, 401, { error: 'Authentication required.' });
        return;
      }

      const appointments = store.appointments
        .filter((entry) => entry.patientId === user.id)
        .sort(sortByLatestDate)
        .map((entry) => serializeAppointment(entry, store));
      sendJson(response, 200, appointments);
      return;
    }

    if (request.method === 'GET' && pathname === '/api/dashboard/doctor/') {
      const user = getAuthenticatedUser(request, store);
      if (!user) {
        sendJson(response, 401, { error: 'Authentication required.' });
        return;
      }

      const doctorProfile = getDoctorProfileForUser(user, store);
      if (!doctorProfile) {
        sendJson(response, 403, { error: 'Not a clinician account.' });
        return;
      }

      const targetDate = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
      const appointments = store.appointments
        .filter((entry) => entry.doctorId === doctorProfile.id && entry.date === targetDate)
        .sort((left, right) => left.slot_time.localeCompare(right.slot_time))
        .map((entry) => serializeAppointment(entry, store));
      sendJson(response, 200, appointments);
      return;
    }

    if (pathname === '/api/dashboard/doctor/profile/' && request.method === 'GET') {
      const user = getAuthenticatedUser(request, store);
      if (!user) {
        sendJson(response, 401, { error: 'Authentication required.' });
        return;
      }

      const doctorProfile = getDoctorProfileForUser(user, store);
      if (!doctorProfile) {
        sendJson(response, 403, { error: 'Not a clinician account.' });
        return;
      }

      sendJson(response, 200, serializeDoctor(doctorProfile, store));
      return;
    }

    if (pathname === '/api/dashboard/doctor/profile/' && request.method === 'PUT') {
      const user = getAuthenticatedUser(request, store);
      if (!user) {
        sendJson(response, 401, { error: 'Authentication required.' });
        return;
      }

      const doctorProfile = getDoctorProfileForUser(user, store);
      if (!doctorProfile) {
        sendJson(response, 403, { error: 'Not a clinician account.' });
        return;
      }

      const body = await parseRequestBody(request);
      doctorProfile.specialization = body.specialization ?? doctorProfile.specialization;
      doctorProfile.consultation_fee = Number(body.consultation_fee ?? doctorProfile.consultation_fee);
      doctorProfile.clinic_address = body.clinic_address ?? doctorProfile.clinic_address;
      doctorProfile.city = body.city ?? doctorProfile.city;
      doctorProfile.experience_years = Number(body.experience_years ?? doctorProfile.experience_years);
      doctorProfile.languages = body.languages ?? doctorProfile.languages;
      await writeStore(store);
      sendJson(response, 200, serializeDoctor(doctorProfile, store));
      return;
    }

    if (request.method === 'GET' && pathname === '/api/dashboard/doctor/enquiries/') {
      const user = getAuthenticatedUser(request, store);
      if (!user) {
        sendJson(response, 401, { error: 'Authentication required.' });
        return;
      }

      const doctorProfile = getDoctorProfileForUser(user, store);
      if (!doctorProfile) {
        sendJson(response, 403, { error: 'Not a clinician account.' });
        return;
      }

      const enquiries = store.enquiries
        .filter((entry) => store.appointments.some((appointment) => appointment.id === entry.appointmentId && appointment.doctorId === doctorProfile.id))
        .sort((left, right) => right.created_at.localeCompare(left.created_at))
        .map((entry) => serializeEnquiry(entry, store));
      sendJson(response, 200, enquiries);
      return;
    }

    const appointmentPrescriptionMatch = pathname.match(/^\/api\/appointments\/(\d+)\/prescription\/$/);
    if (appointmentPrescriptionMatch && request.method === 'POST') {
      const user = getAuthenticatedUser(request, store);
      if (!user) {
        sendJson(response, 401, { error: 'Authentication required.' });
        return;
      }

      const doctorProfile = getDoctorProfileForUser(user, store);
      if (!doctorProfile) {
        sendJson(response, 403, { error: 'Only clinicians can write prescriptions.' });
        return;
      }

      const appointmentId = Number(appointmentPrescriptionMatch[1]);
      const appointment = store.appointments.find((entry) => entry.id === appointmentId && entry.doctorId === doctorProfile.id);
      if (!appointment) {
        sendJson(response, 404, { error: 'Appointment not found.' });
        return;
      }

      const body = await parseRequestBody(request);
      let prescription = store.prescriptions.find((entry) => entry.appointmentId === appointmentId);
      if (prescription) {
        prescription.medicines = body.medicines || '';
        prescription.notes = body.notes || '';
      } else {
        prescription = {
          id: nextId(store.prescriptions),
          appointmentId,
          medicines: body.medicines || '',
          notes: body.notes || '',
          created_at: new Date().toISOString(),
        };
        store.prescriptions.push(prescription);
      }
      appointment.status = 'COMPLETED';
      await writeStore(store);
      sendJson(response, 200, prescription);
      return;
    }

    const appointmentEnquiryMatch = pathname.match(/^\/api\/appointments\/(\d+)\/enquiries\/$/);
    if (appointmentEnquiryMatch && request.method === 'POST') {
      const user = getAuthenticatedUser(request, store);
      if (!user) {
        sendJson(response, 401, { error: 'Authentication required.' });
        return;
      }

      const appointmentId = Number(appointmentEnquiryMatch[1]);
      const appointment = store.appointments.find((entry) => entry.id === appointmentId && entry.patientId === user.id);
      if (!appointment) {
        sendJson(response, 404, { error: 'Appointment not found.' });
        return;
      }

      const body = await parseRequestBody(request);
      if (!body.message?.trim()) {
        sendJson(response, 400, { error: 'Message cannot be empty.' });
        return;
      }

      const enquiry = {
        id: nextId(store.enquiries),
        appointmentId,
        senderId: user.id,
        message: body.message.trim(),
        response: '',
        created_at: new Date().toISOString(),
      };
      store.enquiries.push(enquiry);
      await writeStore(store);
      sendJson(response, 201, serializeEnquiry(enquiry, store));
      return;
    }

    const enquiryUpdateMatch = pathname.match(/^\/api\/enquiries\/(\d+)\/$/);
    if (enquiryUpdateMatch && request.method === 'PUT') {
      const user = getAuthenticatedUser(request, store);
      if (!user) {
        sendJson(response, 401, { error: 'Authentication required.' });
        return;
      }

      const doctorProfile = getDoctorProfileForUser(user, store);
      if (!doctorProfile) {
        sendJson(response, 403, { error: 'Only clinicians can respond to enquiries.' });
        return;
      }

      const enquiryId = Number(enquiryUpdateMatch[1]);
      const enquiry = store.enquiries.find((entry) => entry.id === enquiryId);
      const appointment = store.appointments.find((entry) => entry.id === enquiry?.appointmentId);
      if (!enquiry || !appointment || appointment.doctorId !== doctorProfile.id) {
        sendJson(response, 404, { error: 'Enquiry not found.' });
        return;
      }

      const body = await parseRequestBody(request);
      if (!body.response?.trim()) {
        sendJson(response, 400, { error: 'Response cannot be empty.' });
        return;
      }

      enquiry.response = body.response.trim();
      await writeStore(store);
      sendJson(response, 200, serializeEnquiry(enquiry, store));
      return;
    }

    const appointmentStatusMatch = pathname.match(/^\/api\/appointments\/(\d+)\/status\/$/);
    if (appointmentStatusMatch && request.method === 'PUT') {
      const user = getAuthenticatedUser(request, store);
      if (!user) {
        sendJson(response, 401, { error: 'Authentication required.' });
        return;
      }

      const doctorProfile = getDoctorProfileForUser(user, store);
      if (!doctorProfile) {
        sendJson(response, 403, { error: 'Only clinicians can update appointment status.' });
        return;
      }

      const appointment = store.appointments.find(
        (entry) => entry.id === Number(appointmentStatusMatch[1]) && entry.doctorId === doctorProfile.id
      );
      if (!appointment) {
        sendJson(response, 404, { error: 'Appointment not found.' });
        return;
      }

      const body = await parseRequestBody(request);
      appointment.status = body.status || appointment.status;
      await writeStore(store);
      sendJson(response, 200, { message: 'Status updated.', status: appointment.status });
      return;
    }

    sendJson(response, 404, { error: 'Route not found.' });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: 'Internal server error.' });
  }
});

server.listen(port, () => {
  console.log(`CareAxis backend listening on http://localhost:${port}`);
});
