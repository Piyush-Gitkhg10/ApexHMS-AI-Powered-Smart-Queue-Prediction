import React, { useState, useEffect } from 'react';
import { LogOut, Moon, Sun, Users, Clock, FileText, Activity, Calendar, History, Sparkles, Search, ChevronRight, Save, User, TestTube, Filter, Plus, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DoctorDashboard = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [queue, setQueue] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ totalToday: 0, pendingConsults: 0 });

  // --- NEW: State for Doctor Info & Dark Mode ---
  const [doctorInfo, setDoctorInfo] = useState({ name: 'Loading...', staffId: '...' });
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  const [updateForm, setUpdateForm] = useState({ weight: '', bloodPressure: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  // --- NEW: Modal State & Form States ---
  const [activeModal, setActiveModal] = useState(null); // 'prescription', 'lab', 'followup', 'history'
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [generalAdvice, setGeneralAdvice] = useState('');
  const [followupForm, setFollowupForm] = useState({ date: '', time: '' });

  const [labForm, setLabForm] = useState({ testName: '', clinicalNotes: '' });
  const [patientLabs, setPatientLabs] = useState([]);
  const [doctorHistory, setDoctorHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all', 'week', 'month'

  const [chartData, setChartData] = useState([]);

  const [clinicalNotes, setClinicalNotes] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- NEW: Timezone-safe local date string generator ---
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // --- PRESCRIPTION HELPER FUNCTIONS ---
  const handleMedicationChange = (index, field, value) => {
    const updatedMeds = [...medications];
    updatedMeds[index][field] = value;
    setMedications(updatedMeds);
  };

  const addMedicationRow = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedicationRow = (index) => {
    const updatedMeds = medications.filter((_, i) => i !== index);
    setMedications(updatedMeds);
  };

  // This compiles the dynamic fields into a perfect string for the backend!
  const compilePrescriptionString = () => {
    let rxText = "Rx:\n";
    medications.forEach((med, i) => {
      if (med.name) {
        rxText += `${i + 1}. ${med.name} | ${med.dosage} | ${med.frequency} | ${med.duration}\n`;
      }
    });
    if (generalAdvice) {
      rxText += `\nAdvice/Instructions:\n${generalAdvice}`;
    }
    return rxText;
  };

  // Fetch data dynamically when modals open
  useEffect(() => {
    if (activeModal === 'lab' && selectedPatient) {
      fetch(`http://localhost:5000/api/admin/doctor/patient/${selectedPatient.patient._id}/labs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json()).then(data => setPatientLabs(data));
    } else if (activeModal === 'history') {
      fetch('http://localhost:5000/api/admin/doctor/history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json()).then(data => setDoctorHistory(data));
    }
  }, [activeModal, selectedPatient]);

  // Helper function to filter history
  const getFilteredHistory = () => {
    const now = new Date();
    return doctorHistory.filter(app => {
      const appDate = new Date(app.date);
      if (historyFilter === 'week') return (now - appDate) / (1000 * 60 * 60 * 24) <= 7;
      if (historyFilter === 'month') return (now - appDate) / (1000 * 60 * 60 * 24) <= 30;
      return true;
    });
  };

  // Handle Theme Toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/doctor/queue', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const data = await response.json();

          setDoctorInfo(data.doctorDetails);
          setQueue(data.appointments);
          setChartData(data.graphData);

          // --- UPDATED STATS CALCULATION ---
          const todayStr = getTodayDateString();
          const todayApps = data.appointments.filter(app => app.date === todayStr);

          // Only count as pending if it is NOT Completed and NOT Cancelled
          const pending = todayApps.filter(app => app.status !== 'Completed' && app.status !== 'Cancelled').length;

          setStats({ totalToday: todayApps.length, pendingConsults: pending });
        }
      } catch (error) {
        console.error("Failed to fetch queue", error);
      }
    };

    fetchQueue();
  }, []);

  // When a new patient is selected from the queue, pre-fill their vitals in the update form
  // --- NEW: Handle selecting a patient from the queue ---
  const handleSelectPatient = (app) => {
    // 1. Set the selected patient
    setSelectedPatient(app);
    setClinicalNotes(''); // <-- Clear previous notes
    setAiAnalysis('');
    // 2. Pre-fill the form synchronously at the exact same time (No useEffect needed!)
    if (app && app.patient) {
      setUpdateForm({
        weight: app.patient.weight || '',
        bloodPressure: app.patient.bloodPressure || ''
      });
    } else {
      setUpdateForm({ weight: '', bloodPressure: '' });
    }
  };

  const handleRunAnalysis = async () => {
    if (!clinicalNotes.trim()) return alert("Please enter clinical notes first.");
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/doctor/patient/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          notes: clinicalNotes,
          vitals: updateForm,
          patientAge: selectedPatient.patient?.age,
          patientGender: selectedPatient.patient?.user?.gender
        })
      });
      const data = await response.json();
      setAiAnalysis(data.analysis);
    } catch (error) {
      alert("AI Analysis failed. Check console.", error);
    }
    setIsAnalyzing(false);
  };

  // Handle Manual Status Change 
  const handleStatusChange = async (newStatus) => {
    // Capture the current status BEFORE it changes
    const oldStatus = selectedPatient.status || 'Pending';

    try {
      const response = await fetch(`http://localhost:5000/api/admin/doctor/appointment/${selectedPatient._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // 1. Update the currently selected patient's status
        setSelectedPatient({ ...selectedPatient, status: newStatus });

        // 2. Update the queue locally
        setQueue(prevQueue => prevQueue.map(app =>
          app._id === selectedPatient._id ? { ...app, status: newStatus } : app
        ));

        // 3. Recalculate the stats SMARTLY (Only if the appointment is TODAY)
        const todayStr = getTodayDateString();

        if (selectedPatient.date === todayStr) {
          setStats(prevStats => {
            let newPendingCount = prevStats.pendingConsults;

            const wasPending = oldStatus === 'Pending';
            const isPending = newStatus === 'Pending';

            if (wasPending && !isPending) {
              newPendingCount -= 1; // It was pending, now it's done/cancelled
            } else if (!wasPending && isPending) {
              newPendingCount += 1; // It was done/cancelled, now it's back to pending
            }

            return {
              ...prevStats,
              pendingConsults: Math.max(0, newPendingCount)
            };
          });
        }
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  // Function to handle saving the updated details
  const handleUpdatePatient = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/doctor/patient/${selectedPatient.patient._id}/vitals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateForm)
      });

      if (response.ok) {
        alert("Patient details updated successfully!");
        // Refresh the queue to get the latest data
        const event = new Event('refreshQueue');
        document.dispatchEvent(event);
      }
    } catch (error) {
      alert("Failed to update patient details.", error);
    }
    setIsUpdating(false);
  };

  // QUEUE FILTERS 
  const todayStr = getTodayDateString();
  const filteredQueue = queue.filter(app => app.patient?.user?.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const todayQueue = filteredQueue.filter(app => app.date === todayStr);
  const upcomingQueue = filteredQueue.filter(app => app.date !== todayStr && new Date(app.date) >= new Date(todayStr));

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-900 p-4 md:p-6 lg:p-8 font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">

      {/* --- TOP NAVBAR --- */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-inner uppercase">
            {doctorInfo.name !== 'Loading...' ? doctorInfo.name.charAt(0) : 'D'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Dr. {doctorInfo.name}</h1>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Staff ID: {doctorInfo.staffId}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* THEME TOGGLE BUTTON */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* BELL ICON HAS BEEN REMOVED FROM HERE */}

          <button
            onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-xl font-bold transition-colors text-sm"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-blue-600"><Users size={24} /></div>
          <div>
            <p className="text-sm font-bold text-gray-400">Total Patients Today</p>
            <h3 className="text-2xl font-black text-gray-800 dark:text-white">{stats.totalToday}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl text-amber-600"><Clock size={24} /></div>
          <div>
            <p className="text-sm font-bold text-gray-400">Pending Consults</p>
            <h3 className="text-2xl font-black text-gray-800 dark:text-white">{stats.pendingConsults}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* --- LEFT COLUMN: LIVE QUEUE --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col h-[700px]">

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                <Users className="text-emerald-500" size={20} /> Patient Queue
              </h3>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Scrollable Queue Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">

              {/* TODAY'S PATIENTS */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Today ({todayQueue.length})</h4>
                <div className="space-y-2">
                  {todayQueue.length > 0 ? todayQueue.map(app => (
                    <div
                      key={app._id}
                      onClick={() => handleSelectPatient(app)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border ${selectedPatient?._id === app._id ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-white border-gray-100 hover:border-emerald-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 shadow-sm'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-gray-800 dark:text-white">{app.patient?.user?.name || 'Unknown'}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{app.patient?.patientId}</p>
                        </div>
                        <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg">{app.time}</span>
                      </div>
                      {/* Inside todayQueue mapping */}
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg">{app.time}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${app.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          app.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                          {app.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">No appointments today.</p>
                  )}
                </div>
              </div>

              {/* UPCOMING PATIENTS */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Upcoming ({upcomingQueue.length})</h4>
                <div className="space-y-2">
                  {upcomingQueue.map(app => (
                    <div
                      key={app._id}
                      onClick={() => handleSelectPatient(app)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border ${selectedPatient?._id === app._id ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-white border-gray-100 hover:border-emerald-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 shadow-sm'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-gray-800 dark:text-white">{app.patient?.user?.name || 'Unknown'}</h4>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">{new Date(app.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: MAIN WORKSPACE --- */}
        <div className="lg:col-span-3 space-y-6">

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => selectedPatient && setActiveModal('prescription')} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:-translate-y-1 transition-all group">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><FileText size={20} /></div>
              <span className="font-bold text-sm">Prescription</span>
            </button>
            <button onClick={() => selectedPatient && setActiveModal('lab')} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:-translate-y-1 transition-all group">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><Activity size={20} /></div>
              <span className="font-bold text-sm">Request Lab</span>
            </button>
            <button onClick={() => selectedPatient && setActiveModal('followup')} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:-translate-y-1 transition-all group">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><Calendar size={20} /></div>
              <span className="font-bold text-sm">Follow-up</span>
            </button>
            <button onClick={() => selectedPatient && setActiveModal('history')} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:-translate-y-1 transition-all group">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><History size={20} /></div>
              <span className="font-bold text-sm">View History</span>
            </button>
          </div>

          {/* Workspace Area (Dynamic Patient View) */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 transition-all">
            {selectedPatient ? (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                {/* Workspace Header */}
                <div className="flex justify-between items-start mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                      <User size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-1">
                        {selectedPatient.patient?.user?.name}
                      </h2>
                      <div className="flex gap-3 text-sm font-medium text-gray-500">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-md">ID: {selectedPatient.patient?.patientId}</span>
                        <span className="bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-md">{selectedPatient.patient?.user?.gender || 'Unknown'}</span>
                        <span className="bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-md">Age: {selectedPatient.patient?.age || 'N/A'}</span>
                        <span className="bg-red-50 text-red-600 dark:bg-red-900/20 px-2.5 py-1 rounded-md font-bold">Blood: {selectedPatient.patient?.bloodGroup || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  {/* <div className="text-right ">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Appointment</p>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{selectedPatient.time}</p>
                    <p className="text-sm text-gray-500 font-medium">{new Date(selectedPatient.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div> */}
                  <div className="text-right flex flex-col items-end gap-2">
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Appointment</p>
                      <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{selectedPatient.time}</p>
                      <p className="text-sm text-gray-500 font-medium">{new Date(selectedPatient.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>

                    {/* NEW: Status Changer Dropdown */}
                    <div className="flex items-center gap-2 mt-1">
                      <select
                        value={selectedPatient.status || 'Pending'}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg outline-none cursor-pointer border shadow-sm transition-colors ${selectedPatient.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          selectedPatient.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Vitals & Updates Section */}
                {/* CHANGED: Now a 3-column grid on large screens */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* Left Col: Vitals Form (Takes 1/3 of the width) */}
                  <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                      <Activity size={18} className="text-blue-500" /> Update Vitals
                    </h3>

                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Weight (kg)</label>
                        <input
                          type="number"
                          value={updateForm.weight}
                          onChange={(e) => setUpdateForm({ ...updateForm, weight: e.target.value })}
                          className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Blood Pressure</label>
                        <input
                          type="text"
                          placeholder="120/80"
                          value={updateForm.bloodPressure}
                          onChange={(e) => setUpdateForm({ ...updateForm, bloodPressure: e.target.value })}
                          className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleUpdatePatient}
                      disabled={isUpdating}
                      className="w-full mt-2 py-3.5 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Save size={18} /> {isUpdating ? 'Saving...' : 'Save Vitals'}
                    </button>
                  </div>

                  {/* Right Col: Clinical Notes & AI Assistant (Takes 2/3 of the width) */}
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Clinical Notes Card */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm flex flex-col min-h-[350px]">
                      <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                        <FileText size={16} className="text-emerald-500" /> Clinical Notes
                      </h3>
                      <textarea
                        className="w-full h-full flex-1 bg-gray-50 dark:bg-gray-900 border-none outline-none resize-none rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400"
                        placeholder="Patient complains of chest pain and shortness of breath..."
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                      ></textarea>
                    </div>

                    {/* AI Diagnostic Assistant Card */}
                    <div className="bg-[#f5f3ff] dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-5 shadow-sm flex flex-col min-h-[350px]">
                      <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-3">
                        <Sparkles size={16} className="text-indigo-500" /> AI Diagnostic Assistant
                      </h3>

                      <div className="flex-1 flex flex-col justify-center h-full">
                        {aiAnalysis ? (
                          <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl text-sm text-indigo-900 dark:text-indigo-200 overflow-y-auto h-full max-h-[220px] custom-scrollbar whitespace-pre-line border border-white/50 dark:border-indigo-500/20 shadow-inner">
                            {aiAnalysis}
                          </div>
                        ) : (
                          <p className="text-sm text-indigo-400 dark:text-indigo-500 text-center px-4 my-auto">
                            Enter clinical notes on the left, then run the analysis to get AI predictions.
                          </p>
                        )}
                      </div>

                      <button
                        onClick={handleRunAnalysis}
                        disabled={isAnalyzing}
                        className="w-full mt-4 py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl font-bold transition-colors disabled:opacity-50 shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                <Users size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium text-gray-500">Select a patient from the queue to view details.</p>
              </div>
            )}
          </div>

          {/* Weekly Consultations Graph */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-gray-800 dark:text-white">
              <Activity className="text-emerald-500" size={20} /> Weekly Consultations
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-20" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-bg-opacity, white)' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="patients" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
      {/* 1. PRESCRIPTION MODAL */}
      {activeModal === 'prescription' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">

            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><FileText className="text-emerald-500" /> Digital Prescription</h3>
                <p className="text-sm text-gray-500">Patient: <span className="font-bold text-gray-700 dark:text-gray-300">{selectedPatient?.patient?.user?.name}</span></p>
              </div>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100">{new Date().toLocaleDateString()}</span>
            </div>

            {/* Scrollable Form Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6 space-y-6">

              {/* Medications List */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex justify-between items-center">
                  Medications
                  <button onClick={addMedicationRow} className="text-xs flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 py-1 px-2 rounded-lg transition-colors">
                    <Plus size={14} /> Add Row
                  </button>
                </h4>

                <div className="space-y-3">
                  {medications.map((med, index) => (
                    <div key={index} className="flex gap-2 items-start bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                        <input type="text" placeholder="Medicine Name" value={med.name} onChange={(e) => handleMedicationChange(index, 'name', e.target.value)} className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-emerald-500 text-sm" />
                        <input type="text" placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)} className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-emerald-500 text-sm" />
                        <input type="text" placeholder="Frequency (e.g. 1-0-1)" value={med.frequency} onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)} className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-emerald-500 text-sm" />
                        <input type="text" placeholder="Duration (e.g. 5 days)" value={med.duration} onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)} className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-emerald-500 text-sm" />
                      </div>
                      {medications.length > 1 && (
                        <button onClick={() => removeMedicationRow(index)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-0.5">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* General Advice */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-2">General Advice & Instructions</h4>
                <textarea
                  rows="3"
                  placeholder="Drink plenty of water, avoid cold foods..."
                  value={generalAdvice}
                  onChange={(e) => setGeneralAdvice(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-sm resize-none"
                ></textarea>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => {
                  setActiveModal(null);
                  setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
                  setGeneralAdvice('');
                }}
                className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const finalPrescriptionText = compilePrescriptionString();
                  await fetch(`http://localhost:5000/api/admin/doctor/appointment/${selectedPatient._id}/complete`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify({ prescription: finalPrescriptionText })
                  });

                  // Reset and close
                  setActiveModal(null);
                  setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
                  setGeneralAdvice('');

                  // Update local UI
                  handleStatusChange('Completed');
                  alert("Prescription saved and consultation marked as completed!");
                }}
                className="flex-1 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30"
              >
                Sign & Complete Consult
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. FOLLOW-UP MODAL */}
      {activeModal === 'followup' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-2"><Calendar className="text-emerald-500" /> Schedule Follow-up</h3>
            <p className="text-sm text-gray-500 mb-6">Patient: <span className="font-bold text-gray-700 dark:text-gray-300">{selectedPatient?.patient?.user?.name}</span></p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Date</label>
                <input type="date" min={new Date().toISOString().split('T')[0]} value={followupForm.date} onChange={e => setFollowupForm({ ...followupForm, date: e.target.value })} className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Time</label>
                <input type="time" value={followupForm.time} onChange={e => setFollowupForm({ ...followupForm, time: e.target.value })} className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold">Cancel</button>
              <button onClick={async () => {
                await fetch('http://localhost:5000/api/admin/doctor/appointments', {
                  method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                  body: JSON.stringify({ patientId: selectedPatient.patient.patientId, doctorId: doctorInfo.staffId, date: followupForm.date, time: followupForm.time })
                });
                setActiveModal(null);
                setFollowupForm({ date: '', time: '' });
                alert("Follow-up appointment scheduled successfully!");
              }} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">Confirm Booking</button>
            </div>
          </div>
        </div>

      )}

      {/* 3. REQUEST LAB MODAL */}
      {activeModal === 'lab' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-8 h-[600px]">

            {/* Left Side: Past Lab Reports */}
            <div className="flex-1 flex flex-col h-full border-r border-gray-100 dark:border-gray-700 pr-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><History className="text-blue-500" size={20} /> Patient Lab History</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {patientLabs.length > 0 ? patientLabs.map((lab, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-800 dark:text-white">{lab.testName}</h4>
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${lab.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{lab.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{lab.notes}</p>
                    <p className="text-xs font-bold text-gray-400">{new Date(lab.createdAt).toLocaleDateString()}</p>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-8">No previous lab records found.</p>
                )}
              </div>
            </div>

            {/* Right Side: New Lab Request */}
            <div className="flex-1 flex flex-col h-full">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><TestTube className="text-emerald-500" size={20} /> New Lab Request</h3>

              <div className="space-y-4 flex-1">
                <div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Test Name / Panel</label>
                  <input type="text" placeholder="e.g. Complete Blood Count (CBC)" value={labForm.testName} onChange={e => setLabForm({ ...labForm, testName: e.target.value })} className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Clinical Notes (for Pathologist)</label>
                  <textarea rows="6" placeholder="Patient complains of..." value={labForm.clinicalNotes} onChange={e => setLabForm({ ...labForm, clinicalNotes: e.target.value })} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm resize-none"></textarea>
                </div>
              </div>

              <div className="flex gap-3 pt-4 mt-auto">
                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold">Cancel</button>
                <button onClick={async () => {
                  await fetch(`http://localhost:5000/api/admin/doctor/patient/${selectedPatient.patient._id}/labs`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify(labForm)
                  });
                  setActiveModal(null); setLabForm({ testName: '', clinicalNotes: '' });
                  alert("Lab request submitted!");
                }} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">Submit Request</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. VIEW HISTORY MODAL */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col h-[700px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><History className="text-emerald-500" /> Consultation History</h3>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                <Filter size={16} className="text-gray-400 ml-2" />
                <select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)} className="bg-transparent border-none text-sm font-bold text-gray-700 dark:text-gray-300 outline-none pr-2 cursor-pointer">
                  <option value="all">All Time</option>
                  <option value="week">Past 7 Days</option>
                  <option value="month">Past 30 Days</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {getFilteredHistory().length > 0 ? getFilteredHistory().map(app => (
                <div key={app._id} className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 flex gap-4">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 p-3 rounded-xl h-fit">
                    <Activity size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white">{app.patient?.user?.name || 'Unknown Patient'}</h4>
                        <p className="text-xs text-gray-500 font-medium">ID: {app.patient?.user?.patientId || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">{app.date}</span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 mt-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Prescription / Notes</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{app.prescription || 'No notes recorded.'}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <History size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">No history found for the selected timeframe.</p>
                </div>
              )}
            </div>

            <button onClick={() => setActiveModal(null)} className="w-full mt-6 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition-colors">Close Directory</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;