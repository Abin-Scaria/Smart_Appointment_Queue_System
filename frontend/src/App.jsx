import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import SearchDoctors from './pages/SearchDoctors';
import DoctorProfile from './pages/DoctorProfile';
import Booking from './pages/Booking';
import Login from './pages/Login';
import DashboardRouter from './pages/DashboardRouter';
import { Stethoscope } from 'lucide-react';

function App() {
  const isLoggedIn = !!localStorage.getItem('access_token');
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2 text-[var(--color-brand-blue)] font-bold text-xl">
                <Stethoscope className="w-8 h-8" />
                <span>EveningClinic</span>
              </Link>
              <nav className="flex space-x-6 items-center">
                <Link to="/search" className="text-gray-600 hover:text-[var(--color-brand-blue)] font-medium">Find Doctors</Link>
                {isLoggedIn ? (
                  <>
                    <Link to="/dashboard" className="text-gray-600 hover:text-[var(--color-brand-blue)] font-medium">Dashboard</Link>
                    <button onClick={handleLogout} className="text-red-600 font-medium hover:text-red-800 transition cursor-pointer">Logout</button>
                  </>
                ) : (
                  <Link to="/login" className="text-[var(--color-brand-blue)] font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">Log In / Sign Up</Link>
                )}
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchDoctors />} />
            <Route path="/doctor/:id" element={<DoctorProfile />} />
            <Route path="/book/:doctorId" element={<Booking />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard/*" element={<DashboardRouter />} />
          </Routes>
        </main>

        <footer className="bg-gray-900 text-white py-8 text-center">
          <p>© 2026 EveningClinic India. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
