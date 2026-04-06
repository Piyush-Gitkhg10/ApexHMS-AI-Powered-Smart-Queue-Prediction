import React, { useState, useEffect } from 'react';
import {
  Calendar, Pill, TestTube, Activity, LogOut,
  Clock, FileText, Download, PhoneCall, HeartPulse, Sun, Moon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const PatientPortal = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [patientInfo, setPatientInfo] = useState({ name: 'Loading...', email: '', _id: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [myAppointments, setMyAppointments] = useState([]);
  const [myPrescriptions, setMyPrescriptions] = useState([]);
  const [myLabs, setMyLabs] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setPatientInfo(JSON.parse(storedUser));
    } else {
      navigate('/login');
      return;
    }

    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const parsedUser = JSON.parse(storedUser);

        // Fetch all data (In a production app, the backend would filter this automatically via the JWT)
        const [aptRes, rxRes, labRes] = await Promise.all([
          fetch('http://localhost:5000/api/appointments', { headers }),
          fetch('http://localhost:5000/api/prescriptions', { headers }),
          fetch('http://localhost:5000/api/lab-tests', { headers })
        ]);

        const appointments = await aptRes.json();
        const prescriptions = await rxRes.json();
        const labs = await labRes.json();

        // Filter data to only show records belonging to the logged-in patient
        setMyAppointments(appointments.filter(a => a.patient?.user?._id === parsedUser._id));
        setMyPrescriptions(prescriptions.filter(p => p.patient?.user?._id === parsedUser._id));
        setMyLabs(labs.filter(l => l.patient?.user?._id === parsedUser._id));

      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [navigate]);

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(patientInfo.name)}&background=047857&color=fff`;

  if (loading) return <div className="min-h-screen bg-[#f5f7fa] dark:bg-gray-900 flex items-center justify-center text-emerald-600 font-bold">Loading your health records...</div>;

  return (
    <div className="min-h-screen bg-[#f5f7fa] dark:bg-gray-900 font-inter p-4 md:p-8 animate-in fade-in duration-500 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm gap-4 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <img src={avatarUrl} className="w-14 h-14 rounded-full border-4 border-emerald-50 dark:border-gray-700" alt="Patient Profile" />
            <div>
              <h1 className="text-2xl font-black text-gray-800 dark:text-white">Welcome back, {patientInfo.name.split(' ')[0]}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 mt-1">
                <Activity size={14} className="text-emerald-500" /> Patient ID: {patientInfo._id.substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
              <PhoneCall size={16} /> SOS Emergency
            </button>
            <button onClick={toggleTheme} className="p-2.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('userInfo'); navigate('/login'); }} className="p-2.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors" title="Log Out">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-2xl text-white shadow-lg shadow-emerald-200/50 dark:shadow-none relative overflow-hidden">
            <Calendar className="absolute -right-4 -bottom-4 size-32 text-white/10" />
            <div className="relative z-10">
              <p className="text-emerald-100 font-medium mb-1">Upcoming Appointments</p>
              <h3 className="text-4xl font-black">{myAppointments.filter(a => a.status === 'Pending').length}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full"><Pill className="text-blue-600 dark:text-blue-400 size-6" /></div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Prescriptions</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{myPrescriptions.length}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-full"><TestTube className="text-purple-600 dark:text-purple-400 size-6" /></div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Lab Results Available</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{myLabs.length}</h3>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 hide-scrollbar">
            {[
              { id: 'overview', label: 'My Health Overview', icon: HeartPulse },
              { id: 'prescriptions', label: 'Medications', icon: Pill },
              { id: 'labs', label: 'Lab Results', icon: TestTube }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Your Next Appointment</h3>
                {myAppointments.length > 0 ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm text-center min-w-[70px]">
                        <p className="text-xs text-emerald-600 font-bold uppercase">Date</p>
                        <p className="text-xl font-black text-gray-800 dark:text-white">
                          {new Date(myAppointments[0].date).getDate() || '--'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white text-lg">Dr. {myAppointments[0].doctor?.user?.name || 'Assigned Doctor'}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <Clock size={14} /> {myAppointments[0].time} • {myAppointments[0].type}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wide">
                      {myAppointments[0].status}
                    </span>
                  </div>
                ) : (
                  <div className="text-center p-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400">You have no upcoming appointments.</p>
                    <button className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors">Book Now</button>
                  </div>
                )}
              </div>
            )}

            {/* PRESCRIPTIONS TAB */}
            {activeTab === 'prescriptions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPrescriptions.length === 0 ? <p className="text-gray-500 col-span-2">No active medications.</p> : myPrescriptions.map((rx) => (
                  <div key={rx._id} className="border border-gray-100 dark:border-gray-700 p-5 rounded-xl bg-gray-50/50 dark:bg-gray-900/30">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white text-lg">{rx.medication}</h4>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{rx.dosage} • {rx.frequency}</p>
                      </div>
                      <Pill className="text-gray-400" size={20} />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Duration: <span className="font-semibold text-gray-800 dark:text-gray-200">{rx.duration}</span></p>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
                      <span>Prescribed by Dr. {rx.doctor?.user?.name || 'Doctor'}</span>
                      <button className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1">
                        <FileText size={14} /> Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LABS TAB */}
            {activeTab === 'labs' && (
              <div className="space-y-4">
                {myLabs.length === 0 ? <p className="text-gray-500">No lab results available.</p> : myLabs.map((lab) => (
                  <div key={lab._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg"><TestTube className="text-purple-600 dark:text-purple-400 size-6" /></div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white">{lab.testType}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Ordered by Dr. {lab.doctor?.user?.name || 'Doctor'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${lab.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {lab.status}
                      </span>
                      {lab.status === 'Completed' && (
                        <button className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Download Report">
                          <Download size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientPortal;