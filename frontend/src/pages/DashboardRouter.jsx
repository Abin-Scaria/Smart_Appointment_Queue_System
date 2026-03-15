import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User, Calendar, Activity } from 'lucide-react';
import api from '../api';

function PatientDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [selectedAppForEnquiry, setSelectedAppForEnquiry] = useState(null);
    const [enquiryMessage, setEnquiryMessage] = useState('');

    const fetchAppointments = () => {
        api.get('/dashboard/patient/').then(res => setAppointments(res.data)).catch(err => console.log(err));
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleSendEnquiry = async () => {
        if (!enquiryMessage.trim()) return;
        try {
            await api.post(`/appointments/${selectedAppForEnquiry.id}/enquiries/`, { message: enquiryMessage });
            setEnquiryMessage('');
            setSelectedAppForEnquiry(null);
            fetchAppointments(); // Refresh to see the new enquiry
            alert("Your question has been sent to the doctor.");
        } catch (err) {
            alert("Failed to send question.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Your Appointments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appointments.map(app => (
                    <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
                        <div className={`absolute top-0 right-0 w-2 h-full ${app.status === 'COMPLETED' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                        <div className="flex items-center gap-4 border-b pb-4 mb-4">
                            <User className="text-[#0F52BA]" />
                            <div>
                                <p className="font-bold text-lg">Dr. {app.doctor_detail?.user?.first_name} {app.doctor_detail?.user?.last_name}</p>
                                <p className="text-sm text-gray-500">{app.doctor_detail?.specialization}</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6 flex-1">
                            <div className="flex justify-between items-center text-gray-700">
                                <span className="flex items-center gap-2"><Calendar size={18} /> Date</span>
                                <span className="font-semibold">{app.date}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-700">
                                <span className="flex items-center gap-2"><Activity size={18} /> Slot Time</span>
                                <span className="font-semibold text-[#0F52BA]">{app.slot_time.substring(0, 5)} PM</span>
                            </div>
                            <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                                <span className="font-semibold">Your Queue No:</span>
                                <span className="font-extrabold text-2xl text-[#0F52BA]">#{app.queue_number}</span>
                            </div>

                            {app.prescription && (
                                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                    <h4 className="font-bold text-green-800 mb-2 border-b border-green-200 pb-1">Prescription & Advice</h4>
                                    {app.prescription.medicines && (
                                        <div className="mb-2">
                                            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Medicines</p>
                                            <p className="text-sm text-green-900 whitespace-pre-wrap">{app.prescription.medicines}</p>
                                        </div>
                                    )}
                                    {app.prescription.notes && (
                                        <div>
                                            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Advice</p>
                                            <p className="text-sm text-green-900 whitespace-pre-wrap">{app.prescription.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {app.enquiries && app.enquiries.length > 0 && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-bold text-blue-800 mb-2 border-b border-blue-200 pb-1">Previous Q&A</h4>
                                    <div className="space-y-3 max-h-32 overflow-y-auto pr-2">
                                        {app.enquiries.map(enq => (
                                            <div key={enq.id} className="text-sm">
                                                <p className="text-blue-900 font-semibold mb-1">Q: {enq.message}</p>
                                                {enq.response ? (
                                                    <p className="text-gray-700 bg-white p-2 rounded border border-blue-100 italic">Dr: {enq.response}</p>
                                                ) : (
                                                    <p className="text-gray-500 text-xs italic">Waiting for doctor's response...</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-end mt-auto gap-4">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${app.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                app.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {app.status}
                            </span>

                            {app.status === 'COMPLETED' && (
                                <button
                                    onClick={() => setSelectedAppForEnquiry(app)}
                                    className="text-sm font-semibold text-[#0F52BA] hover:underline bg-blue-50 px-3 py-1.5 rounded-lg border border-[#0F52BA]/20 transition shrink-0"
                                >
                                    Ask Doctor
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {appointments.length === 0 && <p className="text-gray-500 text-lg">You have no upcoming appointments.</p>}
            </div>

            {selectedAppForEnquiry && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-2xl font-bold mb-2 text-gray-900 border-b pb-4">
                            Ask Doctor a Question
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Regarding your visit with Dr. {selectedAppForEnquiry.doctor_detail?.user?.first_name} on {selectedAppForEnquiry.date}.
                        </p>

                        <div className="mb-6">
                            <textarea
                                value={enquiryMessage}
                                onChange={e => setEnquiryMessage(e.target.value)}
                                rows="4"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F52BA] outline-none transition"
                                placeholder="Any doubts about your prescription or advice? Ask here..."
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setSelectedAppForEnquiry(null); setEnquiryMessage(''); }}
                                className="px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendEnquiry}
                                className="px-6 py-3 bg-[#0F52BA] text-white font-bold rounded-xl hover:bg-blue-800 transition shadow-lg"
                            >
                                Send Question
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DoctorDashboard() {
    const [activeTab, setActiveTab] = useState('queue');
    const [appointments, setAppointments] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [prescriptionForm, setPrescriptionForm] = useState({ medicines: '', notes: '' });
    const [selectedEnq, setSelectedEnq] = useState(null);
    const [enqResponse, setEnqResponse] = useState('');

    const [profileForm, setProfileForm] = useState({ specialization: '', consultation_fee: '', clinic_address: '', city: '', experience_years: '', languages: '' });
    const [profileStatus, setProfileStatus] = useState({ type: '', message: '' });

    const specOptions = [
        'General Physician', 'Pediatrics', 'Cardiology', 'Dermatology',
        'ENT', 'Orthopedics', 'Gynecology', 'Ophthalmology',
        'Psychiatry', 'Dentistry', 'Other'
    ];
    const [isCustomSpec, setIsCustomSpec] = useState(false);

    useEffect(() => {
        fetchAppointments();
        fetchProfile();
        fetchEnquiries();
    }, []);

    const fetchProfile = () => {
        api.get('/dashboard/doctor/profile/').then(res => {
            setProfileForm({
                specialization: res.data.specialization,
                consultation_fee: res.data.consultation_fee,
                clinic_address: res.data.clinic_address,
                city: res.data.city || '',
                experience_years: res.data.experience_years,
                languages: res.data.languages || ''
            });
            if (res.data.specialization && !specOptions.includes(res.data.specialization)) {
                setIsCustomSpec(true);
            }
        }).catch(err => console.log('Profile fetch error:', err));
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setProfileStatus({ type: '', message: '' });
        try {
            const res = await api.put('/dashboard/doctor/profile/', profileForm);
            console.log('Profile updated:', res.data);
            setProfileStatus({ type: 'success', message: '✓ Profile updated successfully! Changes are now live.' });
            fetchProfile();
            // Auto-clear after 5 seconds
            setTimeout(() => setProfileStatus({ type: '', message: '' }), 5000);
        } catch (err) {
            console.error('Profile update error:', err.response?.data || err);
            setProfileStatus({ type: 'error', message: 'Failed to update profile: ' + (err.response?.data?.error || err.message) });
        }
    };

    const fetchAppointments = () => {
        api.get('/dashboard/doctor/').then(res => setAppointments(res.data)).catch(err => console.log(err));
    };

    const fetchEnquiries = () => {
        api.get('/dashboard/doctor/enquiries/').then(res => setEnquiries(res.data)).catch(err => console.log(err));
    };

    const handlePrescribe = (app) => {
        setSelectedApp(app);
        setPrescriptionForm({
            medicines: app.prescription?.medicines || '',
            notes: app.prescription?.notes || ''
        });
    };

    const savePrescription = async () => {
        try {
            await api.post(`/appointments/${selectedApp.id}/prescription/`, prescriptionForm);
            alert("Prescription saved successfully!");
            setSelectedApp(null);
            fetchAppointments();
        } catch (err) {
            console.error(err);
            alert("Failed to save prescription. Make sure you are logged in as a doctor.");
        }
    };

    const handleReplySubmit = async () => {
        if (!enqResponse.trim()) return;
        try {
            await api.put(`/enquiries/${selectedEnq.id}/`, { response: enqResponse });
            setSelectedEnq(null);
            setEnqResponse('');
            fetchEnquiries();
            alert("Reply sent successfully.");
        } catch (err) {
            alert("Failed to send reply.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                    {activeTab === 'queue' ? 'Patient Queue (Today)' : activeTab === 'enquiries' ? 'Patient Inquiries' : 'Profile Settings'}
                </h2>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('queue')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'queue' ? 'bg-white text-[#0F52BA] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Queue
                    </button>
                    <button
                        onClick={() => setActiveTab('enquiries')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'enquiries' ? 'bg-white text-[#0F52BA] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Q&A {enquiries.filter(e => !e.response).length > 0 && <span className="bg-red-500 text-white rounded-full px-2 text-xs py-0.5 ml-1">{enquiries.filter(e => !e.response).length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'profile' ? 'bg-white text-[#0F52BA] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Settings
                    </button>
                </div>
            </div>

            {activeTab === 'queue' ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {appointments.map(app => (
                            <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
                                <div className={`absolute top-0 right-0 w-2 h-full ${app.status === 'COMPLETED' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                                <div className="flex items-center gap-4 border-b pb-4 mb-4">
                                    <User className="text-[#0F52BA]" />
                                    <div>
                                        <p className="font-bold text-lg">{app.patient_detail?.first_name} {app.patient_detail?.last_name}</p>
                                        <p className="text-sm text-gray-500">Queue #{app.queue_number}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6 flex-1">
                                    <div className="flex justify-between items-center text-gray-700">
                                        <span className="flex items-center gap-2"><Activity size={18} /> Slot Time</span>
                                        <span className="font-semibold text-[#0F52BA]">{app.slot_time.substring(0, 5)} PM</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                        <span className="font-semibold block mb-1">Reason:</span>
                                        {app.reason_for_visit || 'None specified'}
                                    </div>
                                    {app.prescription && (
                                        <div className="mt-2 text-xs font-semibold text-green-700 bg-green-50 p-2 rounded">
                                            Prescription added ✓
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handlePrescribe(app)}
                                    className={`w-full py-3 rounded-xl font-bold transition mt-auto ${app.prescription
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                        : 'bg-[#0F52BA] text-white hover:bg-blue-800 shadow-md'
                                        }`}
                                >
                                    {app.prescription ? 'Edit Prescription' : '+ Add Prescription & Advice'}
                                </button>
                            </div>
                        ))}
                        {appointments.length === 0 && <p className="text-gray-500 text-lg">No appointments today.</p>}
                    </div>

                    {selectedApp && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
                                <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">
                                    Prescribe for {selectedApp.patient_detail?.first_name}
                                </h3>

                                <div className="mb-5">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine Details (Rx)</label>
                                    <textarea
                                        value={prescriptionForm.medicines}
                                        onChange={e => setPrescriptionForm({ ...prescriptionForm, medicines: e.target.value })}
                                        rows="4"
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F52BA] outline-none transition"
                                        placeholder={"E.g. Paracetamol 500mg - 1-0-1 (after food)\nAzithromycin 500mg - 0-1-0 (after food)"}
                                    ></textarea>
                                </div>

                                <div className="mb-8">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Other Advice / Notes</label>
                                    <textarea
                                        value={prescriptionForm.notes}
                                        onChange={e => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
                                        rows="3"
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F52BA] outline-none transition"
                                        placeholder="E.g. Drink plenty of water. Rest for 2 days. Avoid cold food."
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setSelectedApp(null)}
                                        className="px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={savePrescription}
                                        className="px-6 py-3 bg-[#0F52BA] text-white font-bold rounded-xl hover:bg-blue-800 transition shadow-lg flex items-center gap-2"
                                    >
                                        Save & Complete Consultation
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : activeTab === 'enquiries' ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enquiries.map(enq => (
                            <div key={enq.id} className={`bg-white p-6 rounded-2xl shadow-sm border relative overflow-hidden flex flex-col ${!enq.response ? 'border-red-200' : 'border-gray-100'}`}>
                                {!enq.response && <div className="absolute top-0 right-0 w-2 h-full bg-red-400"></div>}
                                <div className="flex items-center gap-4 border-b pb-4 mb-4">
                                    <User className="text-[#0F52BA]" />
                                    <div>
                                        <p className="font-bold text-lg">{enq.sender_name}</p>
                                        <p className="text-sm text-gray-500">{new Date(enq.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-500 mb-1">Question:</p>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-xl text-sm italic">"{enq.message}"</p>
                                </div>

                                {enq.response ? (
                                    <div className="mt-auto">
                                        <p className="text-sm font-semibold text-green-700 mb-1">Your Response:</p>
                                        <p className="text-gray-800 bg-green-50 p-3 rounded-xl border border-green-100 text-sm">
                                            {enq.response}
                                        </p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setSelectedEnq(enq)}
                                        className="w-full py-3 mt-auto bg-red-50 text-red-600 font-bold hover:bg-red-100 hover:text-red-700 rounded-xl transition border border-red-200"
                                    >
                                        Reply to Patient
                                    </button>
                                )}
                            </div>
                        ))}
                        {enquiries.length === 0 && <p className="text-gray-500 text-lg">No patient inquiries right now.</p>}
                    </div>

                    {selectedEnq && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
                                <h3 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-4">
                                    Reply to {selectedEnq.sender_name}
                                </h3>

                                <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <p className="text-sm text-gray-500 font-semibold mb-1">Patient Asked:</p>
                                    <p className="text-gray-900 italic">"{selectedEnq.message}"</p>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Answer</label>
                                    <textarea
                                        value={enqResponse}
                                        onChange={e => setEnqResponse(e.target.value)}
                                        rows="4"
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F52BA] outline-none transition"
                                        placeholder="Type your medical advice or clarification here..."
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => { setSelectedEnq(null); setEnqResponse(''); }}
                                        className="px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleReplySubmit}
                                        className="px-6 py-3 bg-[#0F52BA] text-white font-bold rounded-xl hover:bg-blue-800 transition shadow-lg"
                                    >
                                        Send Reply
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-2xl">
                    <form onSubmit={updateProfile} className="space-y-6">
                        {profileStatus.message && (
                            <div className={`p-4 rounded-xl font-semibold text-sm flex items-center gap-2 animate-pulse ${
                                profileStatus.type === 'success'
                                    ? 'bg-green-50 text-green-800 border border-green-300'
                                    : 'bg-red-50 text-red-800 border border-red-300'
                            }`}>
                                <span className="text-lg">{profileStatus.type === 'success' ? '✅' : '❌'}</span>
                                {profileStatus.message}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                            <select
                                value={isCustomSpec ? 'Other' : profileForm.specialization || ''}
                                onChange={e => {
                                    if (e.target.value === 'Other') {
                                        setIsCustomSpec(true);
                                        setProfileForm({ ...profileForm, specialization: '' });
                                    } else {
                                        setIsCustomSpec(false);
                                        setProfileForm({ ...profileForm, specialization: e.target.value });
                                    }
                                }}
                                required={!isCustomSpec}
                                className="w-full px-4 py-3 mb-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F52BA] outline-none transition"
                            >
                                <option value="" disabled>Select specialization</option>
                                {specOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            {isCustomSpec && (
                                <input
                                    type="text"
                                    value={profileForm.specialization}
                                    onChange={e => setProfileForm({ ...profileForm, specialization: e.target.value })}
                                    required
                                    placeholder="Enter your custom specialization"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F52BA] outline-none transition mt-2"
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Fee (₹)</label>
                            <input
                                type="number"
                                value={profileForm.consultation_fee}
                                onChange={e => setProfileForm({ ...profileForm, consultation_fee: e.target.value })}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F52BA] outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                            <input
                                type="number"
                                value={profileForm.experience_years}
                                onChange={e => setProfileForm({ ...profileForm, experience_years: e.target.value })}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F52BA] outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Clinic Address</label>
                            <textarea
                                value={profileForm.clinic_address}
                                onChange={e => setProfileForm({ ...profileForm, clinic_address: e.target.value })}
                                required
                                rows="3"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F52BA] outline-none transition"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                            <input
                                type="text"
                                value={profileForm.city}
                                onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F52BA] outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Languages Spoken</label>
                            <input
                                type="text"
                                value={profileForm.languages}
                                onChange={e => setProfileForm({ ...profileForm, languages: e.target.value })}
                                placeholder="E.g., English, Hindi, Malayalam"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F52BA] outline-none transition"
                            />
                        </div>
                        <button type="submit" className={`px-8 py-3 font-bold rounded-xl transition shadow-lg flex items-center gap-2 ${
                            profileStatus.type === 'success'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-[#0F52BA] text-white hover:bg-blue-800'
                        }`}>
                            {profileStatus.type === 'success' ? '✓ Profile Updated!' : 'Update Profile'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

function DashboardIndex() {
    const navigate = useNavigate();
    useEffect(() => {
        api.get('/dashboard/doctor/')
            .then(() => navigate('/dashboard/doctor', { replace: true }))
            .catch(() => navigate('/dashboard/patient', { replace: true }));
    }, [navigate]);
    return <div className="p-8 text-center text-gray-500 font-medium">Loading dashboard...</div>;
}

export default function DashboardRouter() {
    return (
        <Routes>
            <Route path="/" element={<DashboardIndex />} />
            <Route path="patient" element={<PatientDashboard />} />
            <Route path="doctor" element={<DoctorDashboard />} />
        </Routes>
    );
}
