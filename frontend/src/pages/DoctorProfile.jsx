import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import api from '../api';

export default function DoctorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ score: 5, text: '' });
    const isLoggedIn = !!localStorage.getItem('access');

    useEffect(() => {
        api.get(`/doctors/${id}/`, { params: { date: selectedDate } }).then(res => {
            setDoctor(res.data);
            setLoading(false);
        }).catch(err => {
            console.warn(err);
            setLoading(false);
        });

        api.get(`/doctors/${id}/rating/`).then(res => {
            setReviews(res.data);
        }).catch(err => console.warn(err));
    }, [id, selectedDate]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/doctors/${id}/rating/`, { score: newReview.score, review: newReview.text });
            alert("Review submitted successfully!");
            // Refresh reviews and doctor profile to update average
            api.get(`/doctors/${id}/rating/`).then(res => setReviews(res.data));
            api.get(`/doctors/${id}/`, { params: { date: selectedDate } }).then(res => setDoctor(res.data));
            setNewReview({ score: 5, text: '' });
        } catch (err) {
            alert(err.response?.data?.error || "Failed to submit review.");
        }
    };

    if (loading || !doctor) return <div className="p-8 text-center text-xl">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm mb-8 border border-gray-100 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <h1 className="text-3xl font-extrabold text-gray-900">Dr. {doctor.user?.first_name} {doctor.user?.last_name}</h1>
                        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200 shadow-sm">
                            <span className="text-yellow-500 font-extrabold text-lg">★ {doctor.average_rating || 'New'}</span>
                            {doctor.total_reviews > 0 && <span className="text-sm text-gray-500 ml-1">({doctor.total_reviews} reviews)</span>}
                        </div>
                    </div>
                    <p className="text-xl text-[#0F52BA] mb-4">{doctor.specialization} ({doctor.experience_years} years exp.)</p>
                    <div className="space-y-3 text-gray-700">
                        <p className="flex items-center gap-2"><MapPin size={20} className="text-gray-400" /> {doctor.clinic_address}</p>
                        <p className="flex items-center gap-2"><Clock size={20} className="text-gray-400" /> Evening Clinic: 5:30 PM - 8:00 PM</p>
                        <p className="font-semibold text-lg">Consultation Fee: ₹{doctor.consultation_fee}</p>
                    </div>
                </div>
                <div className="w-full md:w-1/3 bg-blue-50 rounded-xl p-6 text-center border border-blue-100">
                    <h3 className="font-bold text-lg mb-2 text-[#0F52BA]">Medical Safety</h3>
                    <p className="text-sm text-gray-600 mb-4">MCI Registered Practitioner. Home clinic equipped with basic diagnostics.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Book Slot</h2>
                    <div className="flex items-center gap-4">
                        <CalendarIcon className="text-gray-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border p-2 rounded-lg font-semibold text-gray-700 focus:outline-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {doctor.available_slots?.map((slot, i) => (
                        <button
                            key={i}
                            disabled={!slot.available}
                            onClick={() => navigate(`/book/${id}`, { state: { doctor, slot: slot.time, date: selectedDate } })}
                            className={`py-3 rounded-lg text-sm font-semibold border transition ${slot.available
                                    ? 'border-green-400 bg-white text-green-700 hover:bg-green-500 hover:text-white cursor-pointer'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                }`}
                        >
                            {slot.time.substring(0, 5)}
                        </button>
                    ))}
                    {(!doctor.available_slots || doctor.available_slots.length === 0) && (
                        <p className="col-span-full py-4 text-center text-gray-500">No slots available for this date.</p>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mt-8">
                <h2 className="text-2xl font-bold mb-6">Patient Reviews</h2>
                
                {reviews.length > 0 ? (
                    <div className="space-y-4 mb-8">
                        {reviews.map(r => (
                            <div key={r.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-gray-800">{r.patient_name}</span>
                                    <span className="text-yellow-500 font-bold">★ {r.score}/5</span>
                                </div>
                                <p className="text-gray-600 italic">"{r.review}"</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 mb-8 italic">No reviews yet. Be the first to rate this doctor!</p>
                )}

                {isLoggedIn && (
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="font-bold text-lg mb-4">Leave a Rating</h3>
                        <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-lg">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Score (1-5)</label>
                                <input type="number" min="1" max="5" value={newReview.score} onChange={e => setNewReview({...newReview, score: e.target.value})} className="border p-2 rounded w-24" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Review</label>
                                <textarea value={newReview.text} onChange={e => setNewReview({...newReview, text: e.target.value})} className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-[#0F52BA] outline-none" rows="3" placeholder="How was your experience?" required />
                            </div>
                            <button type="submit" className="bg-[#0F52BA] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 transition">Submit Review</button>
                        </form>
                    </div>
                )}
                {!isLoggedIn && (
                    <div className="border-t border-gray-200 pt-6 text-sm text-gray-500">
                        Please <a href="/login" className="text-[#0F52BA] font-bold underline">log in</a> to leave a review.
                    </div>
                )}
            </div>
        </div>
    );
}
