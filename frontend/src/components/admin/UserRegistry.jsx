import React, { useState, useEffect } from 'react';
import {
    ClipboardList, Eye, EyeOff, X, Stethoscope, UserPlus,
    Phone, Mail, MapPin, Clock, Calendar, Activity, Droplets, Weight, Users, Search, MoreVertical, Trash2, Shield, CalendarPlus
} from 'lucide-react';

const UserRegistry = ({ role }) => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);

    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [selectedPatientForSchedule, setSelectedPatientForSchedule] = useState(null);
    const [doctorsList, setDoctorsList] = useState([]);
    const [scheduleForm, setScheduleForm] = useState({ doctorId: '', date: '', time: '' });

    const [assignedDoctor, setAssignedDoctor] = useState(null);

    // Fetch doctors when the component loads so they are ready for the dropdown
    useEffect(() => {
        if (role === 'Patient') {
            fetch('http://localhost:5000/api/admin/users/Doctor', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
                .then(res => res.json())
                .then(data => setDoctorsList(data));
        }
    }, [role]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/admin/users/${role}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) setUsers(await response.json());
            } catch (err) {
                console.error("Fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [role]);

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/admin/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    patientId: selectedPatientForSchedule.userId,
                    ...scheduleForm
                })
            });

            if (response.ok) {
                setIsScheduleModalOpen(false);
                setScheduleForm({ doctorId: '', date: '', time: '' });
                alert("Appointment scheduled successfully!");
            }
        } catch (error) {
            alert("Failed to schedule appointment", error);
        }
    };

    const handleDelete = async (e, id, name) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to permanently remove ${name}?`)) {
            try {
                const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) {
                    setUsers(users.filter(user => user._id !== id));
                    if (selectedUser && selectedUser._id === id) setSelectedUser(null);
                }
            } catch (err) { alert("Failed to delete user.", err); }
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <ClipboardList className="text-emerald-600" size={20} /> {role} Directory
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                        <thead className="bg-gray-50 dark:bg-gray-900/80 text-gray-500 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-5 font-bold">System ID</th>
                                <th className="p-5 font-bold">Name</th>
                                <th className="p-5 font-bold">Contact</th>
                                <th className="p-5 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading Directory...</td></tr>
                            ) : users.map(user => (
                                <tr key={user._id} onClick={() => {
                                    setSelectedUser(user);
                                    setShowPassword(false);
                                    setAssignedDoctor(null);
                                    if (role === 'Patient') {
                                        fetch(`http://localhost:5000/api/admin/appointments/latest/${user._id}`, {
                                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                        })
                                            .then(res => res.json())
                                            .then(data => setAssignedDoctor(data.doctorName))
                                            .catch(() => setAssignedDoctor(null));
                                    }
                                }} className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer transition-colors group">
                                    <td className="p-5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{user.userId}</td>
                                    <td className="p-5 font-medium text-gray-800 dark:text-gray-200">{user.name}</td>
                                    <td className="p-5">{user.phone || user.contactNumber || user.email}</td>

                                    <td className="p-5 text-right flex justify-end gap-2">

                                        {/* --- NEW SCHEDULE BUTTON (Only for Patients) --- */}
                                        {role === 'Patient' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Stops the row from opening the View Profile modal
                                                    setSelectedPatientForSchedule(user);
                                                    setIsScheduleModalOpen(true);
                                                }}
                                                className="text-blue-600 font-bold text-xs bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                                            >
                                                Schedule
                                            </button>
                                        )}

                                        <span className="text-emerald-600 font-bold text-xs bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-800 transition-colors">
                                            View Profile
                                        </span>

                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(e, user._id, user.name); }} className="text-red-600 font-bold text-xs bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors">
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && users.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500">No records found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* RICH DETAIL MODAL */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex gap-5 items-center">
                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-200 dark:border-emerald-800 shrink-0">
                                    {role === 'Doctor' ? <Stethoscope size={32} /> : <UserPlus size={32} />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800 dark:text-white leading-tight">{selectedUser.name}</h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded text-sm">{selectedUser.userId}</span>
                                        <span className="text-sm font-medium text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">{selectedUser.status || 'Active'}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm"><X size={20} /></button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-8">

                            {/* Contact & Security Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Details</h3>
                                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300"><Mail size={18} className="text-gray-400" /> {selectedUser.email}</div>
                                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300"><Phone size={18} className="text-gray-400" /> {selectedUser.phone || selectedUser.contactNumber || 'Not provided'}</div>
                                    <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300"><MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" /> {selectedUser.address || 'Not provided'}</div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Security Access</h3>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 mb-1">Generated Password</p>
                                        <div className="flex justify-between items-center">
                                            <p className="font-mono font-bold text-gray-800 dark:text-white tracking-widest text-lg">{showPassword ? selectedUser.plainPassword : '••••••••••'}</p>
                                            <button onClick={() => setShowPassword(!showPassword)} className="text-emerald-600 p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors">
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Doctor Specific Info */}
                            {role === 'Doctor' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Professional Profile</h3>
                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                                            <p className="text-emerald-800 dark:text-emerald-400 font-bold flex items-center gap-2 mb-2"><Stethoscope size={18} /> {selectedUser.specialization}</p>
                                            <p className="text-sm text-emerald-600 dark:text-emerald-500">{selectedUser.department || 'General Medicine'} Department</p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2"><Clock size={16} className="text-gray-400" /> Schedule & Timings</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                                {selectedUser.timings || '09:00 AM - 05:00 PM'} <br />
                                                <span className="text-xs mt-1 block">{(selectedUser.workDays || []).join(', ') || 'Mon, Tue, Wed, Thu, Fri'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Patients</h3>
                                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 h-full">
                                            {selectedUser.assignedPatients && selectedUser.assignedPatients.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {selectedUser.assignedPatients.map((pName, idx) => (
                                                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium"><Users size={14} className="text-emerald-600" /> {pName}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-500 flex items-center gap-2 h-full justify-center"><Calendar size={16} /> No active appointments</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Patient Specific Info */}
                            {role === 'Patient' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Health Metrics</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30 text-center">
                                                <Droplets size={20} className="text-red-500 mx-auto mb-1" />
                                                <p className="text-xs text-red-600/70 font-bold uppercase">Blood</p>
                                                <p className="text-lg font-black text-red-700 dark:text-red-400">{selectedUser.bloodGroup || '--'}</p>
                                            </div>
                                            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 text-center">
                                                <Weight size={20} className="text-blue-500 mx-auto mb-1" />
                                                <p className="text-xs text-blue-600/70 font-bold uppercase">Weight</p>
                                                <p className="text-lg font-black text-blue-700 dark:text-blue-400">{selectedUser.weight ? `${selectedUser.weight}kg` : '--'}</p>
                                            </div>
                                            <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-900/30 text-center">
                                                <Activity size={20} className="text-purple-500 mx-auto mb-1" />
                                                <p className="text-xs text-purple-600/70 font-bold uppercase">BP</p>
                                                <p className="text-lg font-black text-purple-700 dark:text-purple-400">{selectedUser.bloodPressure || '--'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Demographics</h3>
                                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3">
                                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                                <span className="text-sm text-gray-500">Gender</span>
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedUser.gender || 'Not specified'}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                                <span className="text-sm text-gray-500">Age</span>
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedUser.age || 'N/A'} yrs</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Date of Birth</span>
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedUser.dob || 'Not specified'}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                                <span className="text-sm text-gray-500">Date of Birth</span>
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedUser.dob || 'Not specified'}</span>
                                            </div>

                                            {/* --- NEW: APPOINTED DOCTOR ROW --- */}
                                            <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/10 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 mt-2">
                                                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-500">Appointed Doctor</span>
                                                <span className="font-bold text-gray-800 dark:text-gray-200 text-right text-sm">
                                                    {assignedDoctor ? `Dr. ${assignedDoctor}` : 'No doctor selected'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {isScheduleModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Schedule Appointment</h3>
                        <p className="text-sm text-gray-500 mb-6">Booking for: <span className="font-bold">{selectedPatientForSchedule?.name}</span> ({selectedPatientForSchedule?.userId})</p>

                        <form onSubmit={handleScheduleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Select Specialist</label>
                                <select
                                    required
                                    value={scheduleForm.doctorId}
                                    onChange={e => setScheduleForm({ ...scheduleForm, doctorId: e.target.value })}
                                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-gray-800 dark:text-gray-200"
                                >
                                    <option value="">-- Choose a Doctor --</option>
                                    {doctorsList.map(doc => (
                                        <option key={doc._id} value={doc.userId}>Dr. {doc.name} ({doc.specialization || 'General'})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Date</label>
                                    <input
                                        type="date" required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={scheduleForm.date}
                                        onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                                        className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-800 dark:text-gray-200"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Time</label>
                                    <input
                                        type="time" required
                                        value={scheduleForm.time}
                                        onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                                        className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-800 dark:text-gray-200"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">Confirm Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserRegistry;