import React from 'react';
import { Heart, Activity, Droplets, Calendar, Scale } from 'lucide-react';

const HealthOverview = ({ metrics }) => {
    if (!metrics) return <div className="p-8 text-center text-gray-500">Loading health metrics...</div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Heart className="text-teal-500" size={20} /> My Health Overview
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-full text-red-500 mb-3"><Droplets size={24} /></div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Blood Group</p>
                    <p className="text-xl font-black text-gray-800 dark:text-white mt-1">{metrics.bloodGroup || 'N/A'}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full text-blue-500 mb-3"><Scale size={24} /></div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Weight</p>
                    <p className="text-xl font-black text-gray-800 dark:text-white mt-1">{metrics.weight ? `${metrics.weight} kg` : 'N/A'}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-full text-emerald-500 mb-3"><Activity size={24} /></div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Blood Pressure</p>
                    <p className="text-xl font-black text-gray-800 dark:text-white mt-1">{metrics.bloodPressure || 'N/A'}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-full text-purple-500 mb-3"><Calendar size={24} /></div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Age</p>
                    <p className="text-xl font-black text-gray-800 dark:text-white mt-1">{metrics.age || 'N/A'} yrs</p>
                </div>
            </div>
        </div>
    );
};

export default HealthOverview;