import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Clock, Star } from 'lucide-react';

export default function Home() {
    return (
        <div className="bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#c7d2fe] min-h-screen">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
                <h1 className="text-5xl font-extrabold text-white tracking-tight">
                    Book <span className="text-[#818cf8]">Evening Clinics</span> with Top Doctors
                </h1>
                <p className="mt-6 text-xl text-indigo-200 max-w-3xl">
                    Don't wait in long hospital queues during the day. Book consultations at doctors' private clinics from 5:30 PM to 8:00 PM easily.
                </p>

                {/* Quick Search */}
                <div className="mt-10 bg-white p-4 rounded-2xl shadow-xl w-full max-w-4xl flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 border border-blue-100">
                    <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3">
                        <MapPin className="text-gray-400 mr-2" />
                        <input type="text" placeholder="Location, PIN Code or City" className="bg-transparent w-full focus:outline-none" />
                    </div>
                    <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3">
                        <Search className="text-gray-400 mr-2" />
                        <input type="text" placeholder="Doctor, Specialization, Clinic" className="bg-transparent w-full focus:outline-none" />
                    </div>
                    <Link to="/search" className="bg-[#0F52BA] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition flex items-center justify-center">
                        Search
                    </Link>
                </div>
            </section>

            {/* Features Segment */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 gap-8 grid grid-cols-1 md:grid-cols-3">
                    <div className="p-6 bg-blue-50 rounded-2xl">
                        <Calendar className="w-12 h-12 text-[#0F52BA] mb-4" />
                        <h3 className="text-xl font-bold mb-2">Instant Booking</h3>
                        <p className="text-gray-600">Select available slots instantly without waiting. We confirm with the doctor automatically.</p>
                    </div>
                    <div className="p-6 bg-green-50 rounded-2xl">
                        <Clock className="w-12 h-12 text-[#4ADE80] mb-4" />
                        <h3 className="text-xl font-bold mb-2">Live Queue Tracking</h3>
                        <p className="text-gray-600">Know exactly when your turn comes. Sit back at home and arrive just in time.</p>
                    </div>
                    <div className="p-6 bg-yellow-50 rounded-2xl">
                        <Star className="w-12 h-12 text-yellow-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Verified Specialists</h3>
                        <p className="text-gray-600">Only board-certified doctors who practice in established hospitals during daytime.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
