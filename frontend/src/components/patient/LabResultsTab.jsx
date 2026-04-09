import React, { useState, useEffect, useCallback } from 'react';
import { TestTube, Clock, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const LabResultsTab = () => {
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLabs = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/patient/labs', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLabs(data);
            }
        } catch (error) {
            console.error("Failed to fetch labs", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLabs();
    }, [fetchLabs]);

    const pendingLabs = labs.filter(lab => lab.status === 'Pending');
    const completedLabs = labs.filter(lab => lab.status === 'Completed');

    if (loading) return <div className="text-gray-500 animate-pulse">Loading lab records...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* PENDING LABS */}
            {pendingLabs.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Clock size={16} /> Tests In Progress
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingLabs.map(lab => (
                            <div key={lab._id} className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl flex items-start gap-4">
                                <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-full text-amber-600"><TestTube size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200">{lab.testName}</h4>
                                    <p className="text-xs text-gray-500 mt-1">Ordered by Dr. {lab.doctor?.user?.name || 'Unknown'} on {new Date(lab.dateOrdered).toLocaleDateString()}</p>
                                    <p className="text-xs font-bold text-amber-600 mt-2">Awaiting Analysis...</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* COMPLETED LABS */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="text-blue-500" size={20} /> Finalized Results
                </h3>

                {completedLabs.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 text-center border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 text-sm">No finalized lab results available.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {completedLabs.map(lab => (
                            <div key={lab._id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">

                                {/* Lab Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-md">{lab.category}</span>
                                        <span className="text-xs text-gray-400">{new Date(lab.dateCompleted).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="font-black text-lg text-gray-800 dark:text-white">{lab.testName}</h4>
                                    <p className="text-sm text-gray-500 mt-1">Ordered by Dr. {lab.doctor?.user?.name || 'Unknown'}</p>
                                </div>

                                {/* The Result Data */}
                                <div className={`p-4 rounded-xl min-w-[200px] border ${lab.isAbnormal
                                        ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20 text-red-700 dark:text-red-400'
                                        : 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                    }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider">Result</span>
                                        {lab.isAbnormal ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black">{lab.resultValue}</span>
                                        <span className="text-sm font-bold opacity-75">{lab.unit}</span>
                                    </div>
                                    <div className="mt-2 text-xs opacity-80">
                                        Standard Range: {lab.referenceRange} {lab.unit}
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default LabResultsTab;