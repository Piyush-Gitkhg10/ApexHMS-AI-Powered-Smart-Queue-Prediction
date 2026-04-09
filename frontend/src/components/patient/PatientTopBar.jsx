import React from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';

const PatientTopBar = ({ patientData, isDarkMode, setIsDarkMode }) => {
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    // Get initials for the avatar
    const initials = patientData?.name ? patientData.name.substring(0, 2).toUpperCase() : 'PT';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center mb-6 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                    {initials}
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">Welcome back, {patientData?.name || 'Loading...'}</h1>
                    <p className="text-sm text-teal-600 dark:text-teal-400 flex items-center gap-1">
                        <Activity className="w-4 h-4" /> Patient ID: {patientData?.patientId || '...'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                    onClick={handleLogout}
                    className="p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-colors"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    );
};

// Quick mock of the Activity icon since it's used inline above
const Activity = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
);

export default PatientTopBar;