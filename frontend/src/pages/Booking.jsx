import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import api from '../api';

export default function Booking() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { doctor, slot, date } = state || {};
    const [reason, setReason] = useState("");
    const [showMockPayment, setShowMockPayment] = useState(false);
    const [mockAppData, setMockAppData] = useState(null);

    if (!doctor) return <div className="p-10 text-center">Invalid Booking Session</div>;

    const initiateMockPayment = async () => {
        if (!reason.trim()) {
            alert("Please specify your reason for visit.");
            return;
        }
        try {
            const resp = await api.post('/appointments/book/', {
                doctor_id: doctor.id,
                date: date,
                slot_time: slot,
                reason_for_visit: reason
            });
            const appData = resp.data;
            setMockAppData(appData);
            setShowMockPayment(true); // Open our custom fake payment modal
        } catch (err) {
            if (err.response && err.response.status === 401) {
                navigate('/login', { state: { warning: "Please log in or register an account to confirm your booking." } });
            } else {
                alert(err.response?.data?.error || "Failed to book appointment. Please try again.");
            }
        }
    };

    const completeMockPayment = async () => {
        try {
            await api.post('/appointments/verify-payment/', {
                appointment_id: mockAppData.id,
                razorpay_order_id: mockAppData.razorpay_order_id || 'MOCK_ORDER_123',
                razorpay_payment_id: 'MOCK_PAY_987',
                razorpay_signature: 'MOCK_SIG'
            });
            alert(`Payment Verified! Booking Complete. Your Queue No is: ${mockAppData.queue_number}`);
            setShowMockPayment(false);
            navigate('/dashboard/patient');
        } catch (err) {
            alert("Verification failed locally. Contact support.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="text-center mb-10">
                    <ShieldCheck className="w-16 h-16 text-[#0F52BA] mx-auto mb-4" />
                    <h2 className="text-3xl font-extrabold text-gray-900">Confirm Appointment</h2>
                    <p className="text-gray-500 mt-2">Please review your booking details before paying.</p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100 space-y-4">
                    <div className="flex items-center gap-4 border-b border-blue-200 pb-4">
                        <User className="text-[#0F52BA]" />
                        <div>
                            <p className="text-sm text-gray-500 font-semibold">Doctor</p>
                            <p className="text-lg font-bold">Dr. {doctor.user?.first_name} {doctor.user?.last_name}</p>
                            <p className="text-sm text-gray-700">{doctor.specialization}</p>
                        </div>
                    </div>
                    <div className="flex gap-10 pt-2">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Date</p>
                            <p className="flex items-center gap-2 font-bold text-gray-800"><CalendarIcon size={18} /> {date}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Time Slot</p>
                            <p className="flex items-center gap-2 font-bold text-gray-800"><Clock size={18} /> {slot?.substring(0, 5)}</p>
                        </div>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-2xl p-6 mb-8">
                    <h3 className="font-bold text-lg mb-4">Patient Condition (Primary Care)</h3>
                    <p className="text-sm text-gray-500 mb-4">Please note: This clinic handles primary or secondary conditions (e.g., Fever, Cough, Cold). For critical emergencies, please visit a hospital.</p>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="E.g., Mild fever and cough since morning..."
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F52BA] outline-none"
                        rows="3"
                        required
                    />
                </div>

                <div className="border border-gray-200 rounded-2xl p-6 mb-8">
                    <h3 className="font-bold text-lg mb-4">Payment Summary</h3>
                    <div className="flex justify-between text-gray-700 mb-2">
                        <span>Consultation Fee</span>
                        <span>₹{doctor.consultation_fee}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 border-b pb-4 mb-4">
                        <span>Platform Fee (UPI/Card)</span>
                        <span>₹0.00</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-2xl text-gray-900">
                        <span>Total Payable</span>
                        <span>₹{doctor.consultation_fee}</span>
                    </div>
                </div>

                <button
                    onClick={initiateMockPayment}
                    className="w-full bg-[#0F52BA] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-blue-800 transition transform hover:-translate-y-1"
                >
                    Pay with UPI & Book
                </button>
                <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                    Demo Mode Processor
                </p>
            </div>

            {/* FAKE RAZORPAY MODAL (GITHUB DEMO) */}
            {showMockPayment && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl transform transition-all">
                        <div className="bg-[#0F52BA] p-4 text-center">
                            <h3 className="text-white font-extrabold text-xl tracking-wide">Test Payment Gateway</h3>
                            <p className="text-blue-100 text-xs mt-1">Simulating Razorpay Transaction</p>
                        </div>
                        <div className="p-8 text-center bg-gray-50 flex flex-col items-center">
                            <div className="w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center mb-6 shadow-sm overflow-hidden p-2">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=hospital@upi&pn=Dr.${doctor.user?.first_name}&am=${doctor.consultation_fee}`} alt="UPI QR Code" className="w-full h-full object-contain" />
                            </div>
                            <p className="text-lg font-bold text-gray-800 mb-1">Dr. {doctor.user?.first_name}</p>
                            <p className="text-2xl font-black text-[#0F52BA] mb-6">₹{doctor.consultation_fee}</p>

                            <button
                                onClick={completeMockPayment}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-md transition transform hover:scale-105"
                            >
                                Simulate Successful Payment ✓
                            </button>
                            <button
                                onClick={() => setShowMockPayment(false)}
                                className="mt-4 text-gray-400 text-sm font-semibold hover:text-gray-600 underline"
                            >
                                Cancel Transaction
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
