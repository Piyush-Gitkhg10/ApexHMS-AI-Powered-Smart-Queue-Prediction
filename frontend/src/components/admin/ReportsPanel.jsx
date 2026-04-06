import React, { useState, useEffect } from 'react';
import { Flag, AlertTriangle, Plus } from 'lucide-react';

const ReportsPanel = () => {
    const [reports, setReports] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newReport, setNewReport] = useState({ title: '', description: '', roomOrArea: '' });

    // 1. The Trigger State
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // 2. The perfectly safe useEffect
    useEffect(() => {
        let isMounted = true; // Prevents memory leaks if the user clicks away before data loads

        const loadReports = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/admin/reports', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    // Only update state if the component is still on the screen
                    if (isMounted) setReports(data);
                }
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            }
        };

        loadReports();

        // Cleanup function
        return () => { isMounted = false; };
    }, [refreshTrigger]); // <-- Runs on mount, AND whenever this trigger changes

    // 3. Update handlers to trigger a refresh instead of calling a fetch function
    const handleCreateReport = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/admin/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(newReport)
            });
            if (response.ok) {
                setIsModalOpen(false);
                setNewReport({ title: '', description: '', roomOrArea: '' });
                setRefreshTrigger(prev => prev + 1); // Trigger the useEffect to reload data
            }
        } catch (error) {
            alert("Failed to create report.", error);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/reports/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ status })
            });
            if (response.ok) {
                setRefreshTrigger(prev => prev + 1); // Trigger the useEffect to reload data
            }
        } catch (error) {
            alert("Failed to update status.", error);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Flag className="text-emerald-600" size={20} /> Infrastructure Reports
                </h2>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 flex items-center gap-2">
                    <Plus size={16} /> New Report
                </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.length > 0 ? reports.map(report => (
                    <div key={report._id} className="p-5 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-gray-800 dark:text-white">{report.title}</h3>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${report.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : report.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                {report.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{report.description}</p>
                        <div className="flex justify-between items-center text-xs text-gray-400">
                            <span className="flex items-center gap-1 font-medium"><AlertTriangle size={14} /> {report.roomOrArea}</span>
                            <div className="flex gap-3 font-bold">
                                {report.status !== 'Resolved' && <button onClick={() => handleStatusUpdate(report._id, 'Resolved')} className="text-emerald-600 hover:text-emerald-700">Mark Resolved</button>}
                                {report.status === 'Open' && <button onClick={() => handleStatusUpdate(report._id, 'In Progress')} className="text-blue-600 hover:text-blue-700">Mark In Progress</button>}
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="text-gray-500 col-span-full text-center py-8">No infrastructure reports filed.</p>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95">
                        <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">File New Report</h3>
                        <form onSubmit={handleCreateReport} className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Issue Title</label>
                                <input type="text" placeholder="e.g. Broken AC" required value={newReport.title} onChange={e => setNewReport({ ...newReport, title: e.target.value })} className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-gray-800 dark:text-gray-200 transition-colors" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Location</label>
                                <input type="text" placeholder="e.g. Ward 3, Room 102" required value={newReport.roomOrArea} onChange={e => setNewReport({ ...newReport, roomOrArea: e.target.value })} className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-gray-800 dark:text-gray-200 transition-colors" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Description</label>
                                <textarea placeholder="Describe the issue..." required rows="3" value={newReport.description} onChange={e => setNewReport({ ...newReport, description: e.target.value })} className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-gray-800 dark:text-gray-200 transition-colors"></textarea>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-sm transition-colors">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPanel;