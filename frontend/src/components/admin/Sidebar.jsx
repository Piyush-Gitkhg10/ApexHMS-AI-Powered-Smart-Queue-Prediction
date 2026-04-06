import React from 'react';
import {
    Activity, LayoutDashboard, Calendar, TestTube, Stethoscope,
    Users, Settings as SettingsIcon, LogOut, ChevronDown, ChevronRight
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, activeTab, setActiveTab, expandedMenu, toggleSubMenu }) => {
    return (
        <div className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col h-screen transition-all duration-300 z-40 shadow-sm`}>

            {/* Logo */}
            <div className="h-20 flex items-center justify-center border-b border-gray-100 dark:border-gray-700 shrink-0">
                <div className="bg-emerald-600 p-2 rounded-xl shadow-sm shadow-emerald-200 dark:shadow-none">
                    <Activity className="text-white size-6" />
                </div>
                {isSidebarOpen && <h1 className="text-2xl font-black text-gray-800 dark:text-white ml-3 whitespace-nowrap">Apex<span className="text-emerald-600">HMS</span></h1>}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar">

                {/* 1. Overview */}
                <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <LayoutDashboard size={20} className="shrink-0" /> {isSidebarOpen && 'Overview'}
                </button>

                {/* 2. Doctors Accordion */}
                <div>
                    <button onClick={() => isSidebarOpen ? toggleSubMenu('doctors') : setActiveTab('list-doctors')} className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                        <div className="flex items-center gap-3"><Stethoscope size={20} className="shrink-0" /> {isSidebarOpen && 'Doctors'}</div>
                        {isSidebarOpen && (expandedMenu === 'doctors' ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                    </button>
                    {isSidebarOpen && expandedMenu === 'doctors' && (
                        <div className="ml-10 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                            <button onClick={() => setActiveTab('list-doctors')} className={`w-full text-left py-2.5 px-4 text-sm font-bold rounded-lg ${activeTab === 'list-doctors' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>Doctor Registry</button>
                            <button onClick={() => setActiveTab('add-doctor')} className={`w-full text-left py-2.5 px-4 text-sm font-bold rounded-lg ${activeTab === 'add-doctor' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>Add Doctor</button>
                        </div>
                    )}
                </div>

                {/* 3. Patients Accordion */}
                <div>
                    <button onClick={() => isSidebarOpen ? toggleSubMenu('patients') : setActiveTab('list-patients')} className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                        <div className="flex items-center gap-3"><Users size={20} className="shrink-0" /> {isSidebarOpen && 'Patients'}</div>
                        {isSidebarOpen && (expandedMenu === 'patients' ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                    </button>
                    {isSidebarOpen && expandedMenu === 'patients' && (
                        <div className="ml-10 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                            <button onClick={() => setActiveTab('list-patients')} className={`w-full text-left py-2.5 px-4 text-sm font-bold rounded-lg ${activeTab === 'list-patients' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>Patient Registry</button>
                            <button onClick={() => setActiveTab('add-patient')} className={`w-full text-left py-2.5 px-4 text-sm font-bold rounded-lg ${activeTab === 'add-patient' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>Admit Patient</button>
                        </div>
                    )}
                </div>

                {/* 4. Appointments */}
                <button onClick={() => setActiveTab('appointments')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'appointments' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <Calendar size={20} className="shrink-0" /> {isSidebarOpen && 'Appointments'}
                </button>

                {/* 5. Lab Tests */}
                <button onClick={() => setActiveTab('labs')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'labs' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <TestTube size={20} className="shrink-0" /> {isSidebarOpen && 'Lab Tests'}
                </button>

                {/* 6. Settings */}
                <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <SettingsIcon size={20} className="shrink-0" /> {isSidebarOpen && 'Settings'}
                </button>
            </nav>

            {/* Logout Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 shrink-0">
                {/* Note: Logout is handled from TopNavbar dropdown now, but keeping this for sidebar collapse utility if you want, or you can remove it. Let's keep it consistent with the UI. */}
            </div>
        </div>
    );
};

export default Sidebar;