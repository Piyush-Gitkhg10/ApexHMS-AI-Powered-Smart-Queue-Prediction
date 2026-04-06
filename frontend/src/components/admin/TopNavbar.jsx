import React, { useState } from 'react';
import { Menu, Sun, Moon, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const TopNavbar = ({ toggleSidebar, adminName, setActiveTab }) => {
    const { isDark, toggleTheme } = useTheme();
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Helper to get up to 2 initials from the name
    const getInitials = (name) => {
        if (!name) return 'A';
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="h-20 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">

            <div className="flex items-center gap-6">
                <button onClick={toggleSidebar} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-gray-500 transition-colors">
                    <Menu size={24} />
                </button>
            </div>

            <div className="flex items-center gap-5">
                <span className="hidden lg:block text-sm font-medium text-gray-500 dark:text-gray-400">{today}</span>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

                <button onClick={toggleTheme} className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notification Bell has been removed */}

                {/* Clickable Profile Section */}
                <div className="relative">
                    <div
                        className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 font-bold tracking-wider">
                            {getInitials(adminName)}
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">{adminName || 'Admin'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Super Administrator</p>
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <>
                            {/* Invisible overlay to close dropdown when clicking outside */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowDropdown(false)}
                            ></div>

                            <div className="absolute top-14 right-0 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 z-50">
                                <button
                                    onClick={() => { setActiveTab('settings'); setShowDropdown(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <SettingsIcon size={16} /> Settings
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
};

export default TopNavbar;