import React, { useState } from "react";
import {
  Activity,
  User,
  Shield,
  ArrowLeft,
  Mail,
  Lock,
  LogIn,
  HeartPulse,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Login = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Sending 'identifier' which matches the updated backend
        body: JSON.stringify({ identifier, password, role: selectedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data));

      if (selectedRole === "Admin") navigate("/admin-dashboard");
      if (selectedRole === "Doctor") navigate("/doctor-dashboard");
      if (selectedRole === "Patient") navigate("/patient-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loginCards = [
    {
      role: "Patient",
      icon: User,
      title: "Patient Login",
      desc: "Login with your Patient ID and Password to access your medical records, test results, and manage your upcoming appointments securely.",
    },
    {
      role: "Doctor",
      icon: HeartPulse,
      title: "Doctor Login",
      desc: "Login using your Staff ID and Password to access patient queues, manage your shift schedule, and update clinical records.",
    },
    {
      role: "Admin",
      icon: Shield,
      title: "Admin Login",
      desc: "For Hospital Administrators only. Use your Admin Credentials to access the global dashboard, manage staff, and monitor system metrics.",
    },
  ];

  return (
    <div className="min-h-screen bg-emerald-600 dark:bg-emerald-950 font-inter flex flex-col relative animate-in fade-in duration-500 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-[50vh] md:h-[45%] bg-[#f5f7fa] dark:bg-gray-900 z-0 transition-colors duration-300"></div>

      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-2.5 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300"
      >
        {isDark ? <Sun size={22} /> : <Moon size={22} />}
      </button>

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex flex-col items-center justify-center pt-16 pb-8">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-3 rounded-xl shadow-lg shadow-emerald-200/50 dark:shadow-none">
              <Activity className="text-white size-10" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-800 dark:text-white tracking-tight leading-none">
                Apex
                <span className="text-emerald-600 dark:text-emerald-500">
                  HMS
                </span>
              </h1>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mt-1">
                Information Management System
              </p>
            </div>
          </div>
        </div>

        {!selectedRole && (
          <>
            <div className="max-w-6xl mx-auto px-6 w-full flex-1 flex flex-col justify-center pb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {loginCards.map((card) => (
                  <div
                    key={card.role}
                    className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl shadow-emerald-900/10 dark:shadow-none p-10 flex flex-col h-full transform transition-all hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-emerald-900/20 border border-transparent dark:border-gray-700"
                  >
                    <div className="mb-6">
                      <card.icon
                        size={48}
                        className="text-gray-800 dark:text-white"
                        strokeWidth={1.5}
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                      {card.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8 flex-1">
                      {card.desc}
                    </p>
                    <button
                      onClick={() => setSelectedRole(card.role)}
                      className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200 dark:shadow-none"
                    >
                      Login Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto px-8 md:px-16 py-6 flex flex-col md:flex-row justify-between items-center text-white border-t border-emerald-500/30 dark:border-emerald-800/50">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <h4 className="font-black text-xl tracking-wide uppercase leading-tight">
                  Emergency
                  <br />
                  Response
                </h4>
              </div>
              <div className="flex gap-8 md:gap-16 text-sm">
                <div className="text-center">
                  <p className="font-bold text-2xl tracking-tight">100</p>
                  <p className="text-emerald-200 dark:text-emerald-400 font-medium">
                    Ambulance
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-2xl tracking-tight">
                    1-800-1256
                  </p>
                  <p className="text-emerald-200 dark:text-emerald-400 font-medium">
                    Helpdesk
                  </p>
                </div>
                <div className="text-center hidden md:block">
                  <p className="font-bold text-2xl tracking-tight">Active</p>
                  <p className="text-emerald-200 dark:text-emerald-400 font-medium">
                    Server Status
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedRole && (
          <div className="flex-1 flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <button
                onClick={() => {
                  setSelectedRole(null);
                  setError("");
                }}
                className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mb-8"
              >
                <ArrowLeft size={16} /> Back to portal selection
              </button>

              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
                  {selectedRole} Sign In
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Enter your credentials to access your dashboard.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Login ID or Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-emerald-600/20 outline-none text-sm text-gray-800 dark:text-gray-200 transition-all"
                      placeholder={selectedRole === 'Admin' ? 'Admin Email or ID' : `e.g. ${selectedRole === 'Doctor' ? 'DOC' : 'PAT'}-12345`}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-emerald-600/20 outline-none text-sm text-gray-800 dark:text-gray-200 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-200 dark:shadow-none transition-all flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? (
                    "Authenticating..."
                  ) : (
                    <>
                      <LogIn size={18} /> Secure Login
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;