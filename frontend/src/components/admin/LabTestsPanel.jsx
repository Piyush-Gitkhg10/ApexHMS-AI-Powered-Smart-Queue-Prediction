import React, { useState, useEffect } from 'react';
import { TestTube, User, Stethoscope, Calendar, CheckCircle2, Clock4, RefreshCw } from 'lucide-react';

const LabTestsPanel = () => {
    const [labTests, setLabTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLabTests();
    }, []);

    const fetchLabTests = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/lab-tests', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) setLabTests(await response.json());
        } catch (error) {
            console.error("Failed to fetch lab tests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/lab-tests/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setLabTests(labTests.map(test =>
                    test._id === id ? { ...test, status: newStatus } : test
                ));
            }
        } catch (error) {
            alert("Failed to update status", error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed': return <span className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30"><CheckCircle2 size={14} /> Completed</span>;
            case 'Processing': return <span className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30"><RefreshCw size={14} /> Processing</span>;
            default: return <span className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30"><Clock4 size={14} /> Pending</span>;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <TestTube className="text-emerald-600" size={20} /> Global Laboratory Registry
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-900/80 text-gray-500 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="p-5 font-bold">Test Info</th>
                            <th className="p-5 font-bold">Patient</th>
                            <th className="p-5 font-bold">Prescribed By</th>
                            <th className="p-5 font-bold">Status</th>
                            <th className="p-5 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading Lab Tests...</td></tr>
                        ) : labTests.map(test => (
                            <tr key={test._id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors group">
                                <td className="p-5">
                                    <div className="font-bold text-gray-800 dark:text-gray-200">{test.testType}</div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <Calendar size={12} /> {new Date(test.date).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5 font-mono">ID: {test.testId}</div>
                                </td>
                                <td className="p-5">
                                    <div className="font-medium flex items-center gap-2"><User size={16} className="text-gray-400" /> {test.patient?.user?.name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500 mt-1 font-mono">{test.patient?.patientId || '--'}</div>
                                </td>
                                <td className="p-5 font-medium flex items-center gap-2 mt-3"><Stethoscope size={16} className="text-emerald-500" /> {test.doctor?.user?.name || 'Unassigned'}</td>
                                <td className="p-5">{getStatusBadge(test.status)}</td>
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Workflow: Pending -> Processing -> Completed */}
                                        {test.status === 'Pending' && (
                                            <button onClick={() => handleStatusUpdate(test._id, 'Processing')} className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-200 transition-colors">Start Processing</button>
                                        )}
                                        {test.status === 'Processing' && (
                                            <button onClick={() => handleStatusUpdate(test._id, 'Completed')} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors">Mark Complete</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && labTests.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No laboratory tests requested.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LabTestsPanel;