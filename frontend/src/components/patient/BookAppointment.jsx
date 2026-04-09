import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, CheckCircle } from 'lucide-react';

const BookAppointment = () => {
    const [specializations, setSpecializations] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        specialization: '',
        doctorId: '',
        date: '',
        time: '',
        type: 'Consultation'
    });

    // Fetch specializations on load
    useEffect(() => {
        fetch('http://localhost:5000/api/patient/specializations', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => setSpecializations(data));
    }, []);

    // Fetch doctors when specialization changes
    useEffect(() => {
        if (formData.specialization) {
            fetch(`http://localhost:5000/api/patient/doctors/${formData.specialization}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
                .then(res => res.json())
                .then(data => setDoctors(data));
        }
    }, [formData.specialization]);

    const handleBook = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/patient/book-appointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) setSuccess(true);
        } catch (error) {
            alert("Booking failed. Please try again.", error);
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="text-center py-12 animate-in zoom-in-95">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Appointment Requested!</h2>
                <p className="text-gray-500 mb-8">The doctor will review your request and it will appear in your history shortly.</p>
                <button onClick={() => window.location.reload()} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold">Book Another</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleBook} className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Specialization Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                        <Stethoscope size={16} /> Area of Concern
                    </label>
                    <select
                        required
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value, doctorId: '' })}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/20 font-medium"
                    >
                        <option value="">Select Specialization</option>
                        {specializations.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                    </select>
                </div>

                {/* Doctor Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                        <User size={16} /> Available Specialist
                    </label>
                    <select
                        required
                        disabled={!formData.specialization}
                        value={formData.doctorId}
                        onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/20 font-medium disabled:opacity-50"
                    >
                        <option value="">Choose a Doctor</option>
                        {doctors.map(doc => <option key={doc.doctorId} value={doc.doctorId}>{doc.user?.name}</option>)}
                    </select>
                </div>

                {/* Date Selection (Min is today) */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                        <Calendar size={16} /> Preferred Date
                    </label>
                    <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                        <Clock size={16} /> Preferred Time
                    </label>
                    <select
                        required
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/20 font-medium"
                    >
                        <option value="">Select Time</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-lg transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98] disabled:opacity-50"
            >
                {loading ? 'Processing...' : 'Confirm Appointment'}
            </button>
        </form>
    );
};

export default BookAppointment;