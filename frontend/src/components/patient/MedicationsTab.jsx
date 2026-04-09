import React, { useState, useEffect, useCallback } from 'react'; // <-- 1. Import useCallback
import { Pill, CheckCircle, Trash2, Clock, Info } from 'lucide-react';

const MedicationsTab = () => {
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);

    // 2. Wrap fetchMedications in useCallback
    const fetchMedications = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/patient/medications', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMedications(data);
            }
        } catch (error) {
            console.error("Failed to fetch meds", error);
        } finally {
            // Move setLoading(false) into a finally block so it only runs AFTER the async work is done
            setLoading(false);
        }
    }, []); // Empty dependency array means this function is created once

    // 3. Update the useEffect to safely include the function in its dependency array
    useEffect(() => {
        fetchMedications();
    }, [fetchMedications]);

    // ... rest of your handleAction and component code stays exactly the same ...
    const handleAction = async (id, action) => {
        try {
            const response = await fetch(`http://localhost:5000/api/patient/medications/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ action })
            });

            if (response.ok) {
                // Refresh the list immediately to show the change
                fetchMedications();
            }
        } catch (error) {
            console.error("Failed to update medication", error);
        }
    };

    const activeMeds = medications.filter(m => m.status === 'Active');
    const pastMeds = medications.filter(m => m.status === 'Completed');

    if (loading) return <div className="text-gray-500 animate-pulse">Loading prescriptions...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* ACTIVE MEDICATIONS */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Pill className="text-teal-500" size={20} /> Active Prescriptions
                </h3>

                {activeMeds.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 text-center border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 text-sm">You have no active medications at this time.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeMeds.map(med => (
                            <div key={med._id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-black text-lg text-gray-800 dark:text-white">{med.name}</h4>
                                        <p className="text-sm font-bold text-teal-600 dark:text-teal-400">{med.dosage}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAction(med._id, 'complete')} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Mark Completed">
                                            <CheckCircle size={18} />
                                        </button>
                                        <button onClick={() => handleAction(med._id, 'remove')} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Remove">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-500"><Clock size={14} /> {med.frequency}</div>
                                    <div className="flex items-center gap-2 text-gray-500"><Info size={14} /> {med.duration}</div>
                                </div>
                                <p className="text-xs text-gray-400 mt-3 flex justify-between">
                                    <span>Prescribed by Dr. {med.doctor?.user?.name || 'Unknown'}</span>
                                    <span>{new Date(med.datePrescribed).toLocaleDateString()}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* COMPLETED MEDICATIONS */}
            {pastMeds.length > 0 && (
                <div className="pt-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        Past Medications
                    </h3>
                    <div className="space-y-3">
                        {pastMeds.map(med => (
                            <div key={med._id} className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center opacity-75 grayscale hover:grayscale-0 transition-all">
                                <div>
                                    <h4 className="font-bold text-gray-700 dark:text-gray-300 line-through">{med.name} <span className="font-normal text-sm text-gray-500">({med.dosage})</span></h4>
                                    <p className="text-xs text-gray-500">Completed prescription from Dr. {med.doctor?.user?.name || 'Unknown'}</p>
                                </div>
                                <button onClick={() => handleAction(med._id, 'remove')} className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default MedicationsTab;