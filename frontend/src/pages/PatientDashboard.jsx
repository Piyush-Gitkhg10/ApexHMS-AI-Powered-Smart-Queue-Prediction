import React, { useState, useEffect } from 'react';
import PatientTopBar from '../components/patient/PatientTopBar';
import HealthOverview from '../components/patient/HealthOverview';
import BookAppointment from '../components/patient/BookAppointment';
import LiveQueueTracker from '../components/patient/LiveQueueTracker';
import MedicationsTab from '../components/patient/MedicationsTab';
import LabResultsTab from '../components/patient/LabResultsTab';
import HistoryTab from '../components/patient/HistoryTab';
// We will import the other components here as we build them!

const PatientDashboard = () => {
  const [patientData, setPatientData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, appointment, medications, labs, history
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  // Handle Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Fetch Patient Data
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/patient/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPatientData(data);
        }
      } catch (error) {
        console.error("Failed to fetch patient data", error);
      }
    };
    fetchPatientData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7f6] dark:bg-gray-900 p-4 md:p-6 lg:p-8 font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Bar Module */}
        <PatientTopBar patientData={patientData} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-2 overflow-x-auto custom-scrollbar">
          {['overview', 'appointment', 'medications', 'labs', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-bold text-sm capitalize whitespace-nowrap transition-all ${activeTab === tab
                ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {tab === 'overview' ? 'My Health Overview' : tab === 'appointment' ? 'Book Appointment' : tab}
            </button>
          ))}
        </div>

        {/* Main Content Area based on Active Tab */}
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px]">

          {activeTab === 'overview' && (
            <>
              {/* NEW: The Live AI Queue Tracker */}
              <LiveQueueTracker />

              <HealthOverview metrics={patientData} />
            </>
          )}

          {activeTab === 'appointment' && <BookAppointment />}
          {activeTab === 'medications' && <MedicationsTab />}
          {activeTab === 'labs' && <LabResultsTab />}
          {activeTab === 'history' && <HistoryTab />}
        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;