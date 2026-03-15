import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'PATIENT'
    });
    const navigate = useNavigate();
    const location = useLocation();
    const warningMessage = location.state?.warning;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                const res = await api.post('/auth/login/', {
                    username: formData.username,
                    password: formData.password
                });
                localStorage.setItem('access_token', res.data.access);
                window.location.href = '/dashboard';
            } else {
                // Register User
                await api.post('/auth/register/', formData);
                alert("Registration successful! Please log in.");
                setIsLogin(true); // Switch to login form automatically
                setFormData({ username: '', email: '', password: '', first_name: '', last_name: '', role: 'PATIENT' });
            }
        } catch (err) {
            console.error(err);
            alert(isLogin ? "Invalid credentials / User not found" : "Registration failed. Username may already exist.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#4338ca] flex items-center justify-center py-12">
            <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
                {warningMessage && (
                    <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                        <p className="font-bold text-yellow-800">Action Required</p>
                        <p className="text-yellow-700">{warningMessage}</p>
                    </div>
                )}
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <>
                            <div className="flex space-x-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4338ca] outline-none transition"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4338ca] outline-none transition"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4338ca] outline-none transition"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Registering As</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-xl border border-gray-200 flex-1 hover:border-[#4338ca]">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="PATIENT"
                                            checked={formData.role === 'PATIENT'}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-[#4338ca]"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Patient</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-xl border border-gray-200 flex-1 hover:border-[#4338ca]">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="DOCTOR"
                                            checked={formData.role === 'DOCTOR'}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-[#4338ca]"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Doctor</span>
                                    </label>
                                </div>
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Username / Phone Number</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4338ca] outline-none transition"
                            placeholder={isLogin ? "+91 9999999999" : "Choose a username or enter phone"}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4338ca] outline-none transition"
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="w-full bg-[#4338ca] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#3730a3] transition shadow-lg">
                        {isLogin ? "Login" : "Register"}
                    </button>
                </form>
                <div className="mt-8 text-center text-sm text-gray-600">
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-bold text-[#4338ca] hover:underline"
                        >
                            {isLogin ? "Register" : "Log In"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
