import React, { useState, useEffect } from 'react';
import { User, Building, Shield, Bell, Save, Key, ShieldAlert } from 'lucide-react';

const SettingsPanel = ({ adminUser, onAddAdmin }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);

    // Form States
    const [profileForm, setProfileForm] = useState({
        name: adminUser?.name || '',
        email: adminUser?.email || '',
        phone: adminUser?.phone || ''
    });

    const [hospitalForm, setHospitalForm] = useState({
        hospitalName: '', registrationNumber: '', emergencyHelpline: '', address: ''
    });

    // Fetch Hospital Settings on load
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/admin/settings/hospital', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setHospitalForm({
                        hospitalName: data.hospitalName || '',
                        registrationNumber: data.registrationNumber || '',
                        emergencyHelpline: data.emergencyHelpline || '',
                        address: data.address || ''
                    });
                }
            } catch (error) { console.error("Failed to load hospital settings", error); }
        };
        fetchSettings();
    }, []);

    // Handle Save Button Click
    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (activeTab === 'profile') {
                const response = await fetch('http://localhost:5000/api/admin/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify(profileForm)
                });
                if (response.ok) {
                    const data = await response.json();
                    // Update local storage so the TopNavbar updates instantly
                    localStorage.setItem('userInfo', JSON.stringify(data.user));
                    alert("Profile updated successfully!");
                    window.location.reload(); // Refresh to reflect name changes globally
                }
            }
            else if (activeTab === 'hospital') {
                const response = await fetch('http://localhost:5000/api/admin/settings/hospital', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify(hospitalForm)
                });
                if (response.ok) alert("Hospital details updated successfully!");
            }
        } catch (error) {
            alert("Failed to save changes.", error);
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'hospital', label: 'Hospital Details', icon: Building },
        { id: 'security', label: 'Security & Access', icon: Shield },
        // { id: 'notifications', label: 'Notifications', icon: Bell }, // <-- Commented out
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">System Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and hospital configurations</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">

                {/* Sidebar */}
                <div className="w-full md:w-64 space-y-2 shrink-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${activeTab === tab.id
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 shadow-sm hover:shadow'
                                }`}
                        >
                            <tab.icon size={18} className={activeTab === tab.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 sm:p-8 transition-colors flex flex-col justify-between">

                    <div className="space-y-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6 animate-in fade-in">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Personal Information</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                                        <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm text-gray-700 dark:text-gray-200" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                                        <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm text-gray-700 dark:text-gray-200" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Number</label>
                                        <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm text-gray-700 dark:text-gray-200" placeholder="+1 (555) 000-0000" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Role</label>
                                        <input type="text" value={adminUser?.role || 'Administrator'} disabled className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-xl outline-none text-sm text-gray-500 cursor-not-allowed" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Hospital Details Tab */}
                        {activeTab === 'hospital' && (
                            <div className="space-y-6 animate-in fade-in">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Hospital Configuration</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hospital Name</label>
                                        <input type="text" value={hospitalForm.hospitalName} onChange={e => setHospitalForm({ ...hospitalForm, hospitalName: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm text-gray-700 dark:text-gray-200" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Registration Number</label>
                                        <input type="text" value={hospitalForm.registrationNumber} onChange={e => setHospitalForm({ ...hospitalForm, registrationNumber: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm text-gray-700 dark:text-gray-200" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Emergency Helpline</label>
                                        <input type="text" value={hospitalForm.emergencyHelpline} onChange={e => setHospitalForm({ ...hospitalForm, emergencyHelpline: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm text-gray-700 dark:text-gray-200" />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Complete Address</label>
                                        <textarea rows="3" value={hospitalForm.address} onChange={e => setHospitalForm({ ...hospitalForm, address: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm text-gray-700 dark:text-gray-200"></textarea>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-in fade-in">
                                <div className="pt-2">
                                    <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-amber-800 dark:text-amber-500"><ShieldAlert size={20} /> System Administrator Provisioning</h3>
                                        <p className="text-sm text-amber-700/80 dark:text-amber-500/80 mb-5">Creating a new administrator grants them full system control. Proceed with caution.</p>
                                        <button onClick={onAddAdmin} className="py-2.5 px-5 bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-500 font-bold rounded-xl hover:bg-amber-300 transition-colors text-sm">
                                            + Add New Administrator
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dynamic Save Button */}
                    {activeTab !== 'security' && (
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-3 text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors font-bold text-sm flex items-center gap-2"
                            >
                                <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;