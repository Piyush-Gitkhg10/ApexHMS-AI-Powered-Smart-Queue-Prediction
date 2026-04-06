import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Calendar, Activity, Shield, HeartPulse, Stethoscope, TestTube, TrendingUp, TrendingDown, Clock, Sparkles, Flag } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import Sidebar from '../components/admin/Sidebar';
import TopNavbar from '../components/admin/TopNavbar';
import UserCreationForm from '../components/admin/UserCreationForm';
import UserRegistry from '../components/admin/UserRegistry';
import SettingsPanel from '../components/admin/SettingsPanel';
import AppointmentsPanel from '../components/admin/AppointmentsPanel';
import LabTestsPanel from '../components/admin/LabTestsPanel';
import ReportsPanel from '../components/admin/ReportsPanel';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedMenu, setExpandedMenu] = useState('');
    const [isBedModalOpen, setIsBedModalOpen] = useState(false);
    const [newBedCount, setNewBedCount] = useState('');
    const [stats, setStats] = useState({
        patients: { total: 0, trend: 0 },
        doctors: { total: 0, trend: 0 },
        appointments: { total: 0, trend: 0 },
        occupancy: { rate: 0, capacity: 0, trend: 0 },
        patientChartData: [],
        predictions: { week: 0, month: 0 },
        todaysAppointments: [],
        recentReports: [],
    });

    const [adminUser] = useState(() => {
        const savedUser = localStorage.getItem('userInfo');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        // If no user was found during initialization, boot them to login
        if (!adminUser) {
            navigate('/login');
            return;
        }

        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/admin/stats', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) setStats(await response.json());
            } catch (error) {
                console.error("Stats fetch failed"), error;
            }
        };

        fetchStats();
    }, [navigate, adminUser]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const toggleSubMenu = (menu) => {
        setExpandedMenu(expandedMenu === menu ? '' : menu);
    };

    const handleUpdateBeds = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/admin/settings/beds', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ totalBeds: Number(newBedCount) })
            });
            if (response.ok) {
                setIsBedModalOpen(false);
                // Force a re-fetch of the stats to instantly update the UI
                const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                setStats(await statsRes.json());
            }
        } catch (error) {
            alert("Failed to update bed capacity.", error);
        }
    };

    return (
        <div className="h-screen w-full bg-[#f5f7fa] dark:bg-gray-900 flex font-inter overflow-hidden">

            <Sidebar
                isSidebarOpen={isSidebarOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                expandedMenu={expandedMenu}
                toggleSubMenu={toggleSubMenu}
                handleLogout={handleLogout}
            />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">

                <TopNavbar
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    adminName={adminUser?.name}
                    setActiveTab={setActiveTab} // <-- Add this prop!
                />

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10">

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in">
                            <div className="flex justify-between items-end">
                                <h2 className="text-3xl font-black text-gray-800 dark:text-white">Hospital Overview</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                                {/* 1. Appointments Card (Solid Green like image) */}
                                <div
                                    onClick={() => setActiveTab('appointments')}
                                    className="bg-emerald-600 p-6 rounded-3xl shadow-md flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-white/20 p-3.5 rounded-2xl"><Calendar className="text-white" size={24} /></div>
                                        <span className="flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg bg-white/20 text-white">
                                            {Number(stats.appointments.trend) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {stats.appointments.trend}% from last week
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-white leading-tight">{stats.appointments.total}</h3>
                                        <p className="text-emerald-50 font-medium text-sm mt-1">Appointments</p>
                                    </div>
                                </div>

                                {/* 2. Patients Card */}
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3.5 rounded-2xl"><HeartPulse className="text-blue-600" size={24} /></div>
                                        <span className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg ${Number(stats.patients.trend) >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                                            {Number(stats.patients.trend) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {stats.patients.trend}%
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-gray-800 dark:text-white leading-tight">{stats.patients.total}</h3>
                                        <p className="text-gray-500 font-medium text-sm mt-1">Total Patients</p>
                                    </div>
                                </div>

                                {/* 3. Staff Card */}
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3.5 rounded-2xl"><Stethoscope className="text-emerald-600" size={24} /></div>
                                        <span className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg ${Number(stats.doctors.trend) >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                                            {Number(stats.doctors.trend) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {stats.doctors.trend}%
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-gray-800 dark:text-white leading-tight">{stats.doctors.total}</h3>
                                        <p className="text-gray-500 font-medium text-sm mt-1">Medical Staff</p>
                                    </div>
                                </div>

                                {/* 4. Bed Occupancy Card WITH EDIT BUTTON */}
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform relative group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3.5 rounded-2xl"><UserPlus className="text-purple-600" size={24} /></div>
                                        <span className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg ${Number(stats.occupancy.trend) >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                                            {Number(stats.occupancy.trend) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {stats.occupancy.trend}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-800 dark:text-white leading-tight">{stats.occupancy.rate}%</h3>
                                            <p className="text-gray-500 font-medium text-sm mt-1">Occupancy ({stats.occupancy.capacity || 0} Beds)</p>
                                        </div>
                                        <button
                                            onClick={() => { setNewBedCount(stats.occupancy.capacity || 500); setIsBedModalOpen(true); }}
                                            className="p-2 mb-1 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* --- Patient Statistics Chart (Matched to Reference Image) --- */}
                            <div className="mt-8 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-bottom-4">

                                {/* Header with Week/Month/Year Toggle */}
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Patient statistics</h3>
                                    <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
                                        <button className="text-gray-800 dark:text-white border-b-2 border-emerald-500 pb-1">Week</button>
                                        <button className="hover:text-gray-600 transition-colors">Month</button>
                                        <button className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <Calendar size={14} /> Year-2026
                                        </button>
                                    </div>
                                </div>

                                {/* Smooth Area Chart with Gradient */}
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats.patientChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-10" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                                                allowDecimals={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1f2937', borderRadius: '12px', border: 'none', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
                                                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                                cursor={{ stroke: '#10b981', strokeWidth: 40, strokeOpacity: 0.1 }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="Patients"
                                                stroke="#10b981"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorPatients)"
                                                activeDot={{ r: 8, strokeWidth: 3, stroke: '#fff', fill: '#047857' }}
                                                animationDuration={1500}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                            </div>
                            {/* --- NEW: Bottom Row (Predictions & Today's Schedule) --- */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 animate-in fade-in slide-in-from-bottom-6">

                                {/* AI Prediction Card */}
                                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Sparkles size={120} />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2.5 rounded-xl"><Sparkles className="text-indigo-600" size={20} /></div>
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Admission Forecast</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">AI-driven estimation based on 14-day historical patient influx data.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Next 7 Days</p>
                                            <div className="flex items-end gap-2">
                                                <h4 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.predictions?.week || 0}</h4>
                                                <span className="text-sm font-medium text-gray-500 mb-1">patients</span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Next 30 Days</p>
                                            <div className="flex items-end gap-2">
                                                <h4 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.predictions?.month || 0}</h4>
                                                <span className="text-sm font-medium text-gray-500 mb-1">patients</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Today's Appointments Timeline */}
                                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                            Today's Schedule
                                        </h3>
                                        <span className="text-sm font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 px-3 py-1 rounded-lg">
                                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {stats.todaysAppointments && stats.todaysAppointments.length > 0 ? (
                                            stats.todaysAppointments.map((app, index) => (
                                                <div key={index} className="flex gap-4 items-start p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group cursor-pointer">
                                                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                                                        <Clock size={20} className="text-gray-500 group-hover:text-emerald-600 transition-colors" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 dark:text-white text-md">{app.patient?.user?.name || 'Unknown Patient'}</h4>
                                                        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                                                            <span>{app.time}</span> •
                                                            <span className="flex items-center gap-1"><Stethoscope size={14} /> {app.doctor?.user?.name || 'Unassigned'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-40 text-center">
                                                <Calendar size={32} className="text-gray-300 mb-3" />
                                                <p className="text-gray-500 font-medium">No appointments scheduled for today.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Reports Summary Card */}
                                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col relative">
                                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Reports</h3>
                                        <button onClick={() => setActiveTab('reports')} className="text-gray-400 hover:text-gray-800 dark:hover:text-white">•••</button>
                                    </div>

                                    <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2">
                                        {stats.recentReports && stats.recentReports.length > 0 ? (
                                            stats.recentReports.map(report => (
                                                <div key={report._id} className="flex gap-3 group cursor-pointer" onClick={() => setActiveTab('reports')}>
                                                    <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2.5 rounded-xl h-fit">
                                                        <Flag size={18} className="text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 dark:text-white text-sm group-hover:text-emerald-600 transition-colors">{report.title}</h4>
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{report.description}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{report.status}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center mt-4">No active reports.</p>
                                        )}
                                    </div>

                                    <button onClick={() => setActiveTab('reports')} className="w-full mt-4 py-2.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                        View all reports →
                                    </button>
                                </div>
                            </div>
                            {/* BED CAPACITY MODAL */}
                            {isBedModalOpen && (
                                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                                    <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95">
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Update Bed Capacity</h3>
                                        <form onSubmit={handleUpdateBeds} className="space-y-5">
                                            <div>
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Total Hospital Beds</label>
                                                <input
                                                    type="number" required min="1"
                                                    value={newBedCount} onChange={(e) => setNewBedCount(e.target.value)}
                                                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-gray-800 dark:text-gray-200 transition-colors font-bold"
                                                    placeholder="e.g. 500"
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <button type="button" onClick={() => setIsBedModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                                                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-sm transition-colors">Save</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dynamic Component Rendering */}
                    {activeTab === 'add-doctor' && <UserCreationForm role="Doctor" />}
                    {activeTab === 'add-patient' && <UserCreationForm role="Patient" />}
                    {activeTab === 'list-doctors' && <UserRegistry role="Doctor" />}
                    {activeTab === 'list-patients' && <UserRegistry role="Patient" />}

                    {/* Newly Added Appointments Panel */}
                    {activeTab === 'appointments' && <AppointmentsPanel />}

                    {/* Newly Added Lab Tests Panel */}
                    {activeTab === 'labs' && <LabTestsPanel />}

                    {/* Settings Tab - Now using your beautiful custom component */}
                    {activeTab === 'settings' && (
                        <SettingsPanel
                            adminUser={adminUser}
                            onAddAdmin={() => setActiveTab('add-admin')}
                        />
                    )}

                    {/* Hidden Admin Creation Form (triggered from inside Settings) */}
                    {activeTab === 'add-admin' && <UserCreationForm role="Admin" />}

                    {activeTab === 'reports' && <ReportsPanel />}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;