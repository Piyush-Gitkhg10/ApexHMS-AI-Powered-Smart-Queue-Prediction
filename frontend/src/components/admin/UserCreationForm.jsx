import React, { useState, useEffect } from 'react';
import { UserPlus, CheckCircle2, Copy, Stethoscope, Shield, Activity, Calendar } from 'lucide-react';

const UserCreationForm = ({ role }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', specialization: 'General', countryCode: '+91', phone: '', dob: '', address: '',
        bloodGroup: 'O+', weight: '', bloodPressure: '', gender: 'Male',
        assignedDoctorId: '', appointmentDate: '', appointmentTime: ''
    });
    const [doctorsList, setDoctorsList] = useState([]);
    const [status, setStatus] = useState({ loading: false, success: false, error: '' });
    const [generatedId, setGeneratedId] = useState('');

    // Fetch doctors so we can populate the dropdown
    useEffect(() => {
        if (role === 'Patient') {
            fetch('http://localhost:5000/api/admin/users/Doctor', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
                .then(res => res.json())
                .then(data => setDoctorsList(data));
        }
    }, [role])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, error: '' });

        const cleanPhone = formData.phone.replace(/\s/g, '');

        const payload = {
            ...formData,
            phone: cleanPhone,
            role: role
        };
        try {
            const response = await fetch('http://localhost:5000/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setStatus({ loading: false, success: true, error: '' });
            setGeneratedId(data.userId);
            setFormData({
                name: '', email: '', phone: '', dob: '', address: '',
                specialization: 'General', bloodGroup: 'A+', weight: '', bloodPressure: ''
            });
        } catch (err) {
            setStatus({ loading: false, success: false, error: err.message });
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedId);
        alert(`${role} ID copied to clipboard!`);
    };

    const handlePhoneChange = (e) => {
        // 1. Remove all non-digit characters (letters, symbols, spaces)
        const rawValue = e.target.value.replace(/\D/g, '');

        // 2. Limit to exactly 10 digits max
        const truncatedValue = rawValue.slice(0, 10);

        // 3. Insert a space after the first 5 digits
        let formattedValue = truncatedValue;
        if (truncatedValue.length > 5) {
            formattedValue = `${truncatedValue.slice(0, 5)} ${truncatedValue.slice(5)}`;
        }

        // 4. Update the state
        setFormData({ ...formData, phone: formattedValue });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-4xl animate-in fade-in duration-300">
            <div className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-gray-800 dark:text-white">
                    {role === 'Doctor' ? <Stethoscope className="text-emerald-600" size={28} /> :
                        role === 'Patient' ? <UserPlus className="text-emerald-600" size={28} /> :
                            <Shield className="text-emerald-600" size={28} />}
                    Provision {role} Account
                </h2>
                <p className="text-gray-500 text-sm">Fill out the mandatory details below. System ID and secure password will be auto-generated.</p>
            </div>

            {status.error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{status.error}</div>}

            {status.success && (
                <div className="mb-8 p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl animate-in zoom-in-95">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle2 className="text-emerald-600 size-6" />
                        <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400">Account Successfully Created!</h3>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl flex justify-between items-center shadow-sm">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">{role} Login ID</p>
                            <p className="text-2xl font-black text-gray-800 dark:text-white font-mono">{generatedId}</p>
                        </div>
                        <button onClick={copyToClipboard} className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-600 dark:text-gray-300">
                            <Copy size={20} />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Full Name</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none border border-transparent focus:border-emerald-500 text-gray-800 dark:text-gray-200 transition-colors" placeholder={`e.g. ${role === 'Doctor' ? 'Dr. Jane Smith' : 'John Doe'}`} />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Email Address</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none border border-transparent focus:border-emerald-500 text-gray-800 dark:text-gray-200 transition-colors" placeholder={`${role.toLowerCase()}@example.com`} />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Phone Number</label>
                        <div className="flex gap-2">

                            {/* Country Code Dropdown */}
                            <select
                                value={formData.countryCode}
                                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                                className="w-28 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border-none outline-none font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500/20"
                            >
                                <option value="+91">+91 (IN)</option>
                                <option value="+1">+1 (US)</option>
                                <option value="+44">+44 (UK)</option>
                                <option value="+61">+61 (AU)</option>
                            </select>

                            {/* Phone Number Input */}
                            <input
                                type="tel"
                                required
                                placeholder="12345 67890"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                // Pattern ensures exactly 11 characters are submitted (10 digits + 1 space)
                                pattern="[0-9]{5} [0-9]{5}"
                                title="Please enter exactly 10 digits"
                                className="flex-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder-gray-400"
                            />

                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Date of Birth</label>
                        <input type="date" required value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none border border-transparent focus:border-emerald-500 text-gray-800 dark:text-gray-200 transition-colors" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Full Address</label>
                        <input type="text" required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none border border-transparent focus:border-emerald-500 text-gray-800 dark:text-gray-200 transition-colors" placeholder="House No., City, State, ZIP" />
                    </div>
                </div>

                {role === 'Doctor' && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-2"><Stethoscope size={16} /> Department Specialization</label>
                        <select value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} className="w-full p-3.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl outline-none border border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 font-medium">
                            <option value="General">General Practice</option>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Neurology">Neurology</option>
                            <option value="Pediatrics">Pediatrics</option>
                            <option value="Orthopedics">Orthopedics</option>
                        </select>
                    </div>
                )}

                {role === 'Patient' && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><Activity size={16} /> Admission Health Metrics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                            {/* ADDED GENDER DROPDOWN */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Gender</label>
                                <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border-none outline-none">
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Blood Group</label>
                                <select value={formData.bloodGroup} onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border-none outline-none">
                                    <option value="A+">A+</option><option value="A-">A-</option>
                                    <option value="B+">B+</option><option value="B-">B-</option>
                                    <option value="O+">O+</option><option value="O-">O-</option>
                                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Weight (kg)</label>
                                <input type="number" required value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border-none outline-none" placeholder="e.g. 75" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">BP</label>
                                <input type="text" required value={formData.bloodPressure} onChange={e => setFormData({ ...formData, bloodPressure: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border-none outline-none" placeholder="120/80" />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- NEW: Appointment Scheduling (Patients Only) --- */}
                {role === 'Patient' && (
                    <div className="col-span-full mt-4 pt-6 border-t border-gray-100 dark:border-gray-700 animate-in fade-in">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-emerald-500" /> Schedule Initial Appointment (Optional)
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Assign to Doctor</label>
                                <select
                                    value={formData.assignedDoctorId}
                                    onChange={e => setFormData({ ...formData, assignedDoctorId: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm text-gray-700 dark:text-gray-200"
                                >
                                    <option value="">No Immediate Appointment</option>
                                    {doctorsList.map(doc => (
                                        <option key={doc._id} value={doc.userId}>Dr. {doc.name} ({doc.specialization || 'General'})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Only show Date & Time if a Doctor is selected */}
                            {formData.assignedDoctorId && (
                                <>
                                    <div className="space-y-1.5 animate-in zoom-in-95">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Appointment Date</label>
                                        <input
                                            type="date" required
                                            min={new Date().toISOString().split('T')[0]}
                                            value={formData.appointmentDate}
                                            onChange={e => setFormData({ ...formData, appointmentDate: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm text-gray-700 dark:text-gray-200"
                                        />
                                    </div>
                                    <div className="space-y-1.5 animate-in zoom-in-95">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Appointment Time</label>
                                        <input
                                            type="time"
                                            value={formData.appointmentTime}
                                            onChange={e => setFormData({ ...formData, appointmentTime: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm text-gray-700 dark:text-gray-200"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}



                <div className="pt-4">
                    <button type="submit" disabled={status.loading} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md shadow-emerald-200/50 dark:shadow-none flex justify-center items-center gap-2">
                        {status.loading ? 'Processing...' : `Generate ${role} Credentials`}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserCreationForm;