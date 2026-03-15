import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, IndianRupee, Languages } from 'lucide-react';
import api from '../api';

export default function SearchDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ city: 'Kochi', specialization: '' });

    useEffect(() => {
        // Mock data if backend fails, normally fetch from API
        api.get('/doctors/', { params: filters }).then(res => {
            setDoctors(res.data);
            setLoading(false);
        }).catch(err => {
            console.error("API failed!! Error Details:", err.response || err);
            alert("Search Failed: " + (err.response ? JSON.stringify(err.response.data) : err.message));
            setDoctors([
                {
                    id: 1,
                    user: { first_name: "Ramesh", last_name: "Kumar" },
                    specialization: "Cardiology",
                    experience_years: 15,
                    clinic_address: "Jayanagar 4th Block",
                    city: "Bangalore",
                    consultation_fee: "400.00",
                    languages: "English, Kannada, Hindi"
                },
                {
                    id: 2,
                    user: { first_name: "Anita", last_name: "S" },
                    specialization: "Pediatrics",
                    experience_years: 12,
                    clinic_address: "Andheri West",
                    city: "Mumbai",
                    consultation_fee: "500.00",
                    languages: "English, Marathi, Hindi"
                }
            ]);
            setLoading(false);
        });
    }, [filters]);

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...filters, city: e.target.city.value, specialization: e.target.specialization.value });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <input type="text" name="city" defaultValue="Kochi" placeholder="City" className="border px-4 py-2 rounded-lg flex-1" />
                    <input type="text" name="specialization" placeholder="Specialization" className="border px-4 py-2 rounded-lg flex-1" />
                    <button type="submit" className="bg-[#0F52BA] text-white px-6 py-2 rounded-lg font-semibold">Search</button>
                </form>
            </div>

            {loading ? <p>Loading doctors...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map(doc => (
                        <div key={doc.id} className="bg-white p-6 rounded-2xl shadow-md border hover:border-blue-300 transition cursor-pointer">
                            <h3 className="text-xl font-bold mb-1">Dr. {doc.user?.first_name} {doc.user?.last_name}</h3>
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-[#0F52BA] font-medium">{doc.specialization} • {doc.experience_years} Years Exp</p>
                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
                                    <span className="text-yellow-500 font-bold">★ {doc.average_rating || 'New'}</span>
                                    {doc.total_reviews > 0 && <span className="text-xs text-gray-400 ml-1">({doc.total_reviews})</span>}
                                </div>
                            </div>

                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} /> <span>{doc.clinic_address}, {doc.city}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IndianRupee size={16} /> <span>₹{doc.consultation_fee} per visit</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Languages size={16} /> <span>{doc.languages}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-between items-center">
                                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded">Eve Clinic: 5:30-8:00 PM</span>
                                <Link to={`/doctor/${doc.id}`} className="bg-blue-50 text-[#0F52BA] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0F52BA] hover:text-white transition">
                                    Book Slot
                                </Link>
                            </div>
                        </div>
                    ))}
                    {doctors.length === 0 && <p>No doctors found in this area.</p>}
                </div>
            )}
        </div>
    );
}
