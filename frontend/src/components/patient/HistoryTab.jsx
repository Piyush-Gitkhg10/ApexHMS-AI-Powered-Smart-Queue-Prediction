import React, { useState, useEffect, useCallback } from 'react';
import { History, Calendar, FileText, CheckCircle, XCircle, User, Activity } from 'lucide-react';

const HistoryTab = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/patient/history', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (error) {
            console.error("Failed to fetch medical history", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    if (loading) return <div className="text-gray-500 animate-pulse">Loading medical history...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <History className="text-teal-500" size={20} /> My Medical Timeline
            </h3>

            {history.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 text-center border border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 text-sm">You have no past medical visits on record.</p>
                </div>
            ) : (
                <div className="relative border-l-2 border-gray-100 dark:border-gray-700 ml-3 md:ml-4 space-y-8 pb-4">
                    {history.map((record) => (
                        <div key={record._id} className="relative pl-6 md:pl-8">

                            {/* Timeline Dot */}
                            <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-gray-900 ${record.status === 'Completed' ? 'bg-emerald-500' : 'bg-red-400'
                                }`}></div>

                            {/* Card Content */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">

                                {/* Header Row */}
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b border-gray-50 dark:border-gray-700/50 pb-4">
                                    <div>
                                        <h4 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-2">
                                            <Calendar size={18} className="text-teal-500" />
                                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                        </h4>
                                        <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-2">
                                            <User size={14} /> Dr. {record.doctor?.user?.name || 'Unknown'} • {record.time}
                                        </p>
                                    </div>

                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 ${record.status === 'Completed'
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {record.status === 'Completed' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        {record.status}
                                    </span>
                                </div>

                                {/* Status Specific Content */}
                                {record.status === 'Cancelled' ? (
                                    <p className="text-sm text-gray-500 italic">This appointment was cancelled and did not take place.</p>
                                ) : (
                                    <div className="space-y-4">

                                        {/* Clinical Notes (If any exist) */}
                                        {record.clinicalNotes && (
                                            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                                <h5 className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                                                    <Activity size={14} /> Doctor's Notes
                                                </h5>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                                                    {record.clinicalNotes}
                                                </p>
                                            </div>
                                        )}

                                        {/* Prescription Box */}
                                        {record.prescription ? (
                                            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                                                <h5 className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                                                    <FileText size={14} /> Prescription Given
                                                </h5>
                                                <div className="text-sm text-gray-700 dark:text-gray-300 font-mono bg-white dark:bg-gray-900 p-3 rounded-lg border border-emerald-100/50 dark:border-emerald-800/50 whitespace-pre-line">
                                                    {record.prescription}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No prescription was issued during this visit.</p>
                                        )}
                                    </div>
                                )}

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryTab;