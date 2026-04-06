import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, CheckCircle2, XCircle, Clock4, Activity } from 'lucide-react';

const AppointmentsPanel = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/appointments', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) setAppointments(await response.json());
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/appointments/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                // Update the UI instantly without reloading
                setAppointments(appointments.map(app =>
                    app._id === id ? { ...app, status: newStatus } : app
                ));
            }
        } catch (error) {
            alert("Failed to update status", error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Confirmed': return <span className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30"><CheckCircle2 size={14} /> Confirmed</span>;
            case 'Cancelled': return <span className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30"><XCircle size={14} /> Cancelled</span>;
            case 'Completed': return <span className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30"><Activity size={14} /> Completed</span>;
            default: return <span className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30"><Clock4 size={14} /> Pending</span>;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Calendar className="text-emerald-600" size={20} /> Global Appointments Masterlist
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-900/80 text-gray-500 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="p-5 font-bold">Patient</th>
                            <th className="p-5 font-bold">Assigned Doctor</th>
                            <th className="p-5 font-bold">Date & Time</th>
                            <th className="p-5 font-bold">Status</th>
                            <th className="p-5 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading Appointments...</td></tr>
                        ) : appointments.map(app => (
                            <tr key={app._id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors group">
                                <td className="p-5">
                                    <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2"><User size={16} className="text-gray-400" /> {app.patient?.user?.name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500 mt-1 font-mono">{app.patient?.user?.userId || '--'}</div>
                                </td>
                                <td className="p-5 font-medium flex items-center gap-2 mt-2"><Stethoscope size={16} className="text-emerald-500" /> {app.doctor?.user?.name || 'Unassigned'}</td>
                                <td className="p-5">
                                    <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200"><Calendar size={14} className="text-gray-400" /> {app.date || 'TBD'}</div>
                                    <div className="flex items-center gap-2 text-gray-500 text-xs mt-1"><Clock size={14} /> {app.time || 'TBD'}</div>
                                </td>
                                <td className="p-5">{getStatusBadge(app.status)}</td>
                                <td className="p-5 text-right">
                                    {/* Action Dropdown/Buttons */}
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {app.status === 'Pending' && (
                                            <button onClick={() => handleStatusUpdate(app._id, 'Confirmed')} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors">Confirm</button>
                                        )}
                                        {app.status !== 'Cancelled' && app.status !== 'Completed' && (
                                            <button onClick={() => handleStatusUpdate(app._id, 'Cancelled')} className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors">Cancel</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && appointments.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No appointments scheduled.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppointmentsPanel;