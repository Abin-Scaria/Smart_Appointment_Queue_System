import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword } from './auth.js';

const dataFile = fileURLToPath(new URL('../data/store.json', import.meta.url));
const dataDirectory = path.dirname(dataFile);

function timestamp() {
  return new Date().toISOString();
}

function buildSeedStore() {
  return {
    users: [
      {
        id: 1,
        username: 'patientdemo',
        email: 'patient@careaxis.app',
        passwordHash: hashPassword('demo12345'),
        role: 'PATIENT',
        first_name: 'Aarav',
        last_name: 'Menon',
        phone_number: '+919876543210',
      },
      {
        id: 2,
        username: 'doctorvera',
        email: 'vera@careaxis.app',
        passwordHash: hashPassword('demo12345'),
        role: 'DOCTOR',
        first_name: 'Vera',
        last_name: 'Nair',
        phone_number: '+919999111222',
      },
      {
        id: 3,
        username: 'doctorarjun',
        email: 'arjun@careaxis.app',
        passwordHash: hashPassword('demo12345'),
        role: 'DOCTOR',
        first_name: 'Arjun',
        last_name: 'Rao',
        phone_number: '+919888111222',
      },
      {
        id: 4,
        username: 'doctorfathima',
        email: 'fathima@careaxis.app',
        passwordHash: hashPassword('demo12345'),
        role: 'DOCTOR',
        first_name: 'Fathima',
        last_name: 'Latheef',
        phone_number: '+919777111222',
      },
    ],
    patientProfiles: [
      {
        id: 1,
        userId: 1,
        medical_history: 'Seasonal allergies. Mild asthma noted in previous visits.',
      },
    ],
    doctorProfiles: [
      {
        id: 1,
        userId: 2,
        specialization: 'Cardiology',
        experience_years: 14,
        clinic_address: 'Lakeside Medical Chambers, Panampilly Nagar',
        city: 'Kochi',
        area: 'Panampilly Nagar',
        pincode: '682036',
        consultation_fee: 900,
        languages: 'English, Malayalam, Hindi',
        max_patients_per_day: 18,
        is_verified: true,
      },
      {
        id: 2,
        userId: 3,
        specialization: 'Paediatrics',
        experience_years: 11,
        clinic_address: 'Palm Grove Family Clinic, Indiranagar',
        city: 'Bengaluru',
        area: 'Indiranagar',
        pincode: '560038',
        consultation_fee: 750,
        languages: 'English, Kannada, Hindi',
        max_patients_per_day: 22,
        is_verified: true,
      },
      {
        id: 3,
        userId: 4,
        specialization: 'Dermatology',
        experience_years: 9,
        clinic_address: 'Harbour Skin and Wellness, Kakkanad',
        city: 'Kochi',
        area: 'Kakkanad',
        pincode: '682030',
        consultation_fee: 850,
        languages: 'English, Malayalam, Tamil',
        max_patients_per_day: 16,
        is_verified: false,
      },
    ],
    clinicTimings: [
      { id: 1, doctorId: 1, start_time: '17:30:00', end_time: '20:30:00', slot_duration_mins: 15 },
      { id: 2, doctorId: 2, start_time: '17:00:00', end_time: '20:00:00', slot_duration_mins: 15 },
      { id: 3, doctorId: 3, start_time: '18:00:00', end_time: '21:00:00', slot_duration_mins: 20 },
    ],
    appointments: [
      {
        id: 1,
        patientId: 1,
        doctorId: 1,
        date: '2026-05-30',
        slot_time: '18:00:00',
        status: 'COMPLETED',
        reason_for_visit: 'Chest discomfort during evening walks.',
        queue_number: 2,
        payment_status: true,
        razorpay_order_id: 'ORDER_SEEDED_1',
        created_at: '2026-05-28T16:10:00.000Z',
      },
      {
        id: 2,
        patientId: 1,
        doctorId: 2,
        date: '2026-06-02',
        slot_time: '17:30:00',
        status: 'CONFIRMED',
        reason_for_visit: 'Review for recurrent cold symptoms.',
        queue_number: 1,
        payment_status: true,
        razorpay_order_id: 'ORDER_SEEDED_2',
        created_at: '2026-05-29T09:20:00.000Z',
      },
    ],
    prescriptions: [
      {
        id: 1,
        appointmentId: 1,
        medicines: 'Paracetamol 500mg - 1 tablet after food for 3 days',
        notes: 'Stay hydrated and avoid strenuous activity for the next 48 hours.',
        created_at: '2026-05-30T13:00:00.000Z',
      },
    ],
    enquiries: [
      {
        id: 1,
        appointmentId: 1,
        senderId: 1,
        message: 'Can I take the medicine after dinner instead of lunch?',
        response: 'Yes, after dinner is acceptable as long as you take it after food.',
        created_at: '2026-05-30T15:30:00.000Z',
      },
      {
        id: 2,
        appointmentId: 2,
        senderId: 1,
        message: 'Do I need to bring the child vaccination book for the review?',
        response: '',
        created_at: '2026-05-30T16:00:00.000Z',
      },
    ],
    ratings: [
      {
        id: 1,
        doctorId: 1,
        patientId: 1,
        score: 5,
        review: 'Very clear explanation and a calm evening consultation experience.',
        created_at: '2026-05-30T18:30:00.000Z',
      },
      {
        id: 2,
        doctorId: 2,
        patientId: 1,
        score: 4,
        review: 'Good paediatric guidance and smooth follow-up process.',
        created_at: '2026-05-29T18:30:00.000Z',
      },
    ],
    meta: {
      createdAt: timestamp(),
      updatedAt: timestamp(),
    },
  };
}

export async function ensureStore() {
  await fs.mkdir(dataDirectory, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    const seedStore = buildSeedStore();
    await fs.writeFile(dataFile, JSON.stringify(seedStore, null, 2));
  }
}

export async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(dataFile, 'utf8');
  return JSON.parse(raw);
}

export async function writeStore(store) {
  store.meta = {
    ...store.meta,
    updatedAt: timestamp(),
  };
  await fs.writeFile(dataFile, JSON.stringify(store, null, 2));
}

export function nextId(collection) {
  return collection.reduce((maxId, entry) => Math.max(maxId, entry.id), 0) + 1;
}
