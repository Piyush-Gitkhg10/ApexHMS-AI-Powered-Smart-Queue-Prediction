import React, { useState, useEffect } from 'react';
import { Clock, Activity, AlertCircle, CheckCircle } from 'lucide-react';

const LiveQueueTracker = () => {
    const [queueData, setQueueData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQueueStatus = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/patient/queue-status', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setQueueData(data);
                }
            } catch (error) {
                console.error("Failed to fetch queue status", error);
            }
            setLoading(false);
        };

        fetchQueueStatus();

        // Refresh queue status every 60 seconds so it updates as the doctor sees patients!
        const interval = setInterval(fetchQueueStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !queueData?.hasAppointment || queueData.appointments.length === 0) return null;

    return (
        <div className="space-y-4 mb-8 animate-in slide-in-from-top-4">
            {/* We map through EVERY pending appointment and render a tracker for it */}
            {queueData.appointments.map((data, index) => (
                <div
                    key={data._id}
                    className={`rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-teal-500/20 ${
                        // Make the first (most immediate) appointment a solid gradient, and subsequent ones slightly faded/different
                        index === 0
                            ? "bg-gradient-to-r from-teal-600 to-emerald-600"
                            : "bg-gradient-to-r from-gray-700 to-gray-600 shadow-gray-500/20"
                        }`}
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                        {/* Left Side: Appointment Info */}
                        <div>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3 inline-block">
                                {index === 0 ? "Next Appointment" : "Upcoming Appointment"}
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black mb-1">Dr. {data.doctorName}</h2>
                            <p className="text-gray-100 flex items-center gap-2">
                                <Clock size={16} /> Scheduled for {data.appointment.time} on {new Date(data.appointment.date).toLocaleDateString('en-US', {
                                    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
                                })}
                            </p>
                        </div>

                        {/* Right Side: The AI Queue Prediction */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 w-full md:w-auto min-w-[250px]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-gray-100 uppercase">Live Queue Status</span>
                                {data.queuePosition === 1 ? (
                                    <Activity className="text-emerald-300 animate-pulse" size={20} />
                                ) : (
                                    <Clock className="text-gray-200" size={20} />
                                )}
                            </div>

                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-4xl font-black">
                                    {data.queuePosition === 1 ? 'Next' : `#${data.queuePosition}`}
                                </span>
                                {data.queuePosition !== 1 && <span className="text-gray-100 font-medium">in line</span>}
                            </div>

                            <p className="text-xs text-gray-100 mt-2 flex items-center gap-1.5">
                                {data.queuePosition === 1
                                    ? <><CheckCircle size={14} className="text-emerald-300" /> Please proceed to the waiting area.</>
                                    : <><AlertCircle size={14} className="text-gray-200" /> Est. Wait: ~{data.estimatedWaitMinutes} mins</>
                                }
                            </p>
                        </div>

                    </div>
                </div>
            ))}
        </div>
    );
};

export default LiveQueueTracker;