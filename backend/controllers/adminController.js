const User = require("../models/User");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const LabTest = require("../models/LabTest");
const Doctor = require("../models/Doctor");
const Medication = require("../models/Medication");

const Report = require("../models/Report");
const Settings = require("../models/Settings");
const bcrypt = require("bcryptjs");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

// Helper to generate a random 10-character password
const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
    return Array.from(
        { length: 10 },
        () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
};

// @desc    Get global statistics, trends, chart data, and predictions for Admin Dashboard
const getAdminStats = async (req, res) => {
    try {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const getChange = (thisWeek, lastWeek) => {
            if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
            return (((thisWeek - lastWeek) / lastWeek) * 100).toFixed(1);
        };

        // 1. KPI Stats
        const [totalPatients, totalDoctors, totalAppointments, totalStaff] = await Promise.all(
            [
                Patient.countDocuments(),
                Doctor.countDocuments(),
                Appointment.countDocuments(),
                User.countDocuments({ role: { $in: ["Admin", "Doctor"] } }),
            ],
        );

        const [patientsThisWeek, doctorsThisWeek, appsThisWeek] = await Promise.all([
            Patient.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
            Doctor.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
            Appointment.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
        ]);

        const [patientsLastWeek, doctorsLastWeek, appsLastWeek] = await Promise.all([
            Patient.countDocuments({ createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } }),
            Doctor.countDocuments({ createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } }),
            Appointment.countDocuments({ createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } }),
        ]);

        const admittedPatients = await Patient.countDocuments({ status: "Admitted" });
        let settings = await Settings.findOne();
        if (!settings) settings = await Settings.create({ totalBeds: 500 });
        const totalBeds = settings.totalBeds;
        const occupancyRate =
            totalBeds > 0 ? ((admittedPatients / totalBeds) * 100).toFixed(1) : 0;
        const bedTrend = (Math.random() * 5 - 2).toFixed(1);

        // 2. Chart Data Aggregation (Last 7 Days)
        const sevenDaysAgoMidnight = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
        sevenDaysAgoMidnight.setHours(0, 0, 0, 0);

        const dailyPatients = await Patient.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgoMidnight } } },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: "Asia/Kolkata",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
        ]);

        const patientChartData = [];
        let totalLast7Days = 0; // For prediction math

        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgoMidnight.getTime() + i * 24 * 60 * 60 * 1000);
            const dateStr = d.toISOString().split("T")[0];
            const displayDate = d.toLocaleDateString("en-US", { weekday: "short" });
            const found = dailyPatients.find((p) => p._id === dateStr);

            const count = found ? found.count : 0;
            totalLast7Days += count;

            patientChartData.push({
                name: displayDate,
                Patients: count,
            });
        }

        // --- NEW: Prediction Math ---
        // Average patients per day over the last 7 days
        const avgPatientsPerDay = totalLast7Days / 7;
        // Add a slight growth factor (e.g., 5%) for the forecast
        const growthFactor = 1.05;
        const predictedNextWeek = Math.round(avgPatientsPerDay * 7 * growthFactor);
        const predictedNextMonth = Math.round(avgPatientsPerDay * 30 * growthFactor);

        // --- NEW: Today's Appointments ---
        // Fetch up to 4 appointments scheduled for today
        const todayStr = now.toISOString().split("T")[0]; // Format: YYYY-MM-DD
        const todaysAppointments = await Appointment.find({ date: todayStr })
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .limit(4)
            .sort({ time: 1 })
            .lean();

        // --- NEW: Recent Reports for the Summary Card ---
        const recentReports = await Report.find().sort({ createdAt: -1 }).limit(3).lean();

        res.json({
            patients: {
                total: totalPatients,
                trend: getChange(patientsThisWeek, patientsLastWeek),
            },
            doctors: {
                total: totalDoctors,
                trend: getChange(doctorsThisWeek, doctorsLastWeek),
            },
            appointments: {
                total: totalAppointments,
                trend: getChange(appsThisWeek, appsLastWeek),
            },
            occupancy: { rate: occupancyRate, capacity: totalBeds, trend: bedTrend },
            patientChartData,
            predictions: { week: predictedNextWeek, month: predictedNextMonth }, // <-- New
            todaysAppointments, // <-- New
            recentReports,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Hospital Bed Capacity
const updateBedCapacity = async (req, res) => {
    try {
        const { totalBeds } = req.body;
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ totalBeds });
        } else {
            settings.totalBeds = totalBeds;
            await settings.save();
        }
        res.json({
            message: "Hospital capacity updated successfully!",
            totalBeds: settings.totalBeds,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new user with auto-generated ID and Password
const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            role,
            specialization,
            phone,
            dob,
            address,
            bloodGroup,
            weight,
            bloodPressure,
            gender,
        } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User email already exists" });

        // 3. Generate secure credentials (REMOVED MANUAL BCRYPT HERE)
        const autoPassword = Math.random().toString(36).slice(-8);

        // 4. Generate Unique ID
        const prefix = role === "Doctor" ? "DOC" : role === "Patient" ? "PAT" : "ADM";
        const uniqueId = `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;

        // 5. Create the Base User Account
        const user = await User.create({
            userId: uniqueId,
            name,
            email,
            password: autoPassword, // <-- Pass the RAW password, let your User.js model hash it automatically!
            plainPassword: autoPassword,
            role,
            phone,
            dob,
            address,
        });

        // 6. Create Patient-Specific Profile
        if (role === "Patient") {
            let calculatedAge = 0;
            if (dob) {
                const birthDate = new Date(dob);
                calculatedAge = new Date().getFullYear() - birthDate.getFullYear();
            }

            const patientProfile = await Patient.create({
                user: user._id,
                patientId: uniqueId,
                age: calculatedAge || 0,
                gender: gender || "Other",
                bloodGroup: bloodGroup || "O+",
                contactNumber: phone || "Not Provided",
                address: address,
                weight,
                bloodPressure,
            });

            // --- NEW: Create Initial Appointment if requested ---
            const { assignedDoctorId, appointmentDate, appointmentTime } = req.body;

            if (assignedDoctorId && appointmentDate) {
                const doctorUser = await User.findOne({ userId: assignedDoctorId });
                if (doctorUser) {
                    const doctorProfile = await Doctor.findOne({ user: doctorUser._id });
                    if (doctorProfile) {
                        await Appointment.create({
                            appointmentId: `APT-${Math.floor(10000 + Math.random() * 90000)}`, // <-- NEW: Auto-generated ID
                            type: "Initial Consultation", // <-- NEW: Required type
                            patient: patientProfile._id,
                            doctor: doctorProfile._id,
                            date: appointmentDate,
                            time: appointmentTime || "09:00 AM",
                            status: "Pending",
                        });
                    }
                }
            }
        }

        // 7. Create Doctor-Specific Profile (THIS FIXES YOUR ERROR)
        if (role === "Doctor") {
            await Doctor.create({
                user: user._id,
                doctorId: uniqueId, // Maps to your required doctorId
                department: specialization || "General", // Maps to your required department
                specialization: specialization || "General",
                contactNumber: phone || "Not Provided", // Maps to your required contactNumber
                status: "Active",
                availability: [
                    { day: "Monday", startTime: "09:00 AM", endTime: "05:00 PM" },
                    { day: "Wednesday", startTime: "09:00 AM", endTime: "05:00 PM" },
                    { day: "Friday", startTime: "09:00 AM", endTime: "05:00 PM" },
                ],
            });
        }

        res.status(201).json({
            message: `${role} created successfully!`,
            userId: user.userId,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get list of users + their specific medical/staff profiles
const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const users = await User.find({ role }).sort({ createdAt: -1 }).lean();

        const enrichedUsers = await Promise.all(
            users.map(async (user) => {
                if (role === "Doctor") {
                    const docInfo = await Doctor.findOne({ user: user._id }).lean();

                    let assignedPatients = [];
                    if (docInfo) {
                        const appointments = await Appointment.find({ doctor: docInfo._id })
                            .populate({
                                path: "patient",
                                populate: { path: "user", select: "name" },
                            })
                            .lean();

                        const patientNames = appointments
                            .map((app) => app.patient?.user?.name)
                            .filter(Boolean);
                        assignedPatients = [...new Set(patientNames)];
                    }

                    // FIX: Explicitly preserve the user._id!
                    return { ...docInfo, ...user, _id: user._id, assignedPatients };
                }

                if (role === "Patient") {
                    const patInfo = await Patient.findOne({ user: user._id }).lean();
                    // FIX: Explicitly preserve the user._id!
                    return { ...patInfo, ...user, _id: user._id };
                }

                return user;
            }),
        );

        res.json(enrichedUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete User and their associated Doctor/Patient profile
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Clean up the associated collections so we don't leave orphaned data
        if (user.role === "Doctor") await Doctor.findOneAndDelete({ user: user._id });
        if (user.role === "Patient") await Patient.findOneAndDelete({ user: user._id });

        // Delete the base user account
        await User.findByIdAndDelete(user._id);

        res.json({ message: "User removed from system completely" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all appointments across the hospital
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate({
                path: "patient",
                populate: { path: "user", select: "name userId phone" },
            })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .sort({ createdAt: -1 }); // Show newest bookings first

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new appointment for an existing patient
const createAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, date, time, type, symptoms, painLevel } = req.body;

        const patientProfile = await Patient.findOne({ patientId }).populate("user", "gender");
        const doctorUser = await User.findOne({ userId: doctorId });

        if (!patientProfile || !doctorUser) {
            return res.status(404).json({ message: "Patient or Doctor not found" });
        }

        const doctorProfile = await Doctor.findOne({ user: doctorUser._id });

        // 1. Create the base appointment
        let appointment = await Appointment.create({
            appointmentId: `APT-${Math.floor(10000 + Math.random() * 90000)}`,
            type: type || "Consultation",
            patient: patientProfile._id,
            doctor: doctorProfile._id,
            date,
            time,
            status: "Pending",
        });

        // 2. TRIGGER THE AI TRIAGE MICROSERVICE
        try {
            const aiPayload = {
                age: patientProfile.age || 30,
                gender: patientProfile.user?.gender || "Male",
                heart_rate: patientProfile.heartRate || 80,
                bp_systolic: parseInt(patientProfile.bloodPressure?.split("/")[0]) || 120,
                bp_diastolic: parseInt(patientProfile.bloodPressure?.split("/")[1]) || 80,
                temperature: patientProfile.temperature || 98.6,
                pain_level: painLevel || 0,
                symptoms: symptoms || "Routine Checkup",
            };

            // Send data to your FastAPI server
            const aiResponse = await axios.post(
                "http://localhost:8000/predict-triage",
                aiPayload,
            );

            // 3. Update the appointment with the AI's predictions
            appointment.triageLevel = aiResponse.data.triageLevel;
            appointment.triageScore = aiResponse.data.triageScore;
            await appointment.save();

            console.log(
                `🤖 AI Triage Complete: ${appointment.triageLevel} (Score: ${appointment.triageScore})`,
            );
        } catch (aiError) {
            console.error(
                "⚠️ AI Microservice unreachable, falling back to Standard triage:",
                aiError.message,
            );
            // If Python is offline, default to Standard so the booking doesn't crash
            appointment.triageLevel = "Standard";
            appointment.triageScore = 0;
            await appointment.save();
        }

        // 4. Send the final response
        res.status(201).json({ message: "Appointment scheduled successfully", appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manually update appointment status
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.appointmentId,
            { status },
            { new: true },
        );
        res.json({ message: "Status updated successfully", appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all Lab Tests across the hospital
const getAllLabTests = async (req, res) => {
    try {
        const tests = await LabTest.find()
            .populate({
                path: "patient",
                populate: { path: "user", select: "name" },
            })
            .populate({
                path: "doctor",
                populate: { path: "user", select: "name" },
            })
            .sort({ createdAt: -1 }); // Newest tests first

        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Lab Test Status (Pending -> Processing -> Completed)
const updateLabTestStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Ensure only valid statuses from your schema are accepted
        const validStatuses = ["Pending", "Processing", "Completed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status update" });
        }

        const test = await LabTest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }, // Returns the updated document
        );

        if (!test) return res.status(404).json({ message: "Lab test not found" });

        res.json({ message: `Test successfully marked as ${status}`, test });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get complete Hospital Settings
const getHospitalSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) settings = await Settings.create({});
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Hospital Details
const updateHospitalSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create(req.body);
        } else {
            Object.assign(settings, req.body);
            await settings.save();
        }
        res.json({ message: "Hospital settings updated successfully!", settings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Admin's Personal Profile
const updateAdminProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        // req.user is set by your auth middleware
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        await user.save();

        res.json({
            message: "Profile updated successfully!",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// INFRASTRUCTURE REPORTS CONTROLLERS
const getReports = async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createReport = async (req, res) => {
    try {
        const report = await Report.create(req.body);
        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateReportStatus = async (req, res) => {
    try {
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true },
        );
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get the latest appointed doctor for a specific patient
const getLatestAppointmentForPatient = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({ patient: req.params.patientId })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .sort({ createdAt: -1 }); // Gets the most recently created appointment

        if (appointment && appointment.doctor && appointment.doctor.user) {
            res.json({ doctorName: appointment.doctor.user.name });
        } else {
            res.json({ doctorName: null });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get the live queue and appointments for the logged-in doctor
const getDoctorQueue = async (req, res) => {
    try {
        // 1. Find the doctor profile and grab their name from the base User model
        const doctorProfile = await Doctor.findOne({ user: req.user._id }).populate(
            "user",
            "name",
        );

        if (!doctorProfile) {
            return res.status(404).json({ message: "Doctor profile not found." });
        }

        // 2. Fetch all appointments assigned to this specific doctor
        const appointments = await Appointment.find({ doctor: doctorProfile._id })
            .populate({
                path: "patient",
                populate: { path: "user", select: "name email phone dob gender" },
            })
            .sort({ date: 1, time: 1 });

        // --- NEW: Calculate Graph Data (Last 7 Days) ---
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const graphData = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];

            const count = await Appointment.countDocuments({
                doctor: doctorProfile._id,
                status: "Completed",
                date: dateStr,
            });

            graphData.push({ name: dayNames[d.getDay()], patients: count });
        }

        // 3. Send everything back to the frontend
        res.json({
            doctorDetails: {
                name: doctorProfile.user.name,
                staffId: doctorProfile.doctorId,
            },
            appointments: appointments,
            graphData: graphData, // <-- Send the new graph data
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update patient vitals and details from the Doctor Portal
const updatePatientDetails = async (req, res) => {
    try {
        const { weight, bloodPressure } = req.body;

        // Find and update the patient
        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.patientId,
            { weight, bloodPressure },
            { new: true },
        );

        if (!updatedPatient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.json({ message: "Patient details updated successfully", patient: updatedPatient });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// // @desc    Save prescription and complete the appointment
// const completeConsultation = async (req, res) => {
//     try {
//         const { prescription } = req.body;
//         const appointment = await Appointment.findByIdAndUpdate(
//             req.params.appointmentId,
//             { prescription, status: "Completed" },
//             { new: true },
//         );
//         res.json({ message: "Consultation completed successfully", appointment });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// @desc    Complete consultation, save notes, and extract medications
const completeConsultation = async (req, res) => {
    try {
        const { prescription } = req.body;
        const appointmentId = req.params.appointmentId;

        // 1. Mark appointment as completed & save the raw text using YOUR exact schema field ('prescription')
        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: "Completed", prescription: prescription },
            { new: true },
        );

        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        // 2. Parse the prescription text to create individual Medication objects
        if (prescription && prescription.includes("Rx:")) {
            const lines = prescription.split("\n");
            const medicationsToAdd = [];

            for (let line of lines) {
                if (line.includes("|")) {
                    const cleanLine = line.replace(/^\d+\.\s*/, "");
                    const parts = cleanLine.split("|").map((p) => p.trim());

                    if (parts.length >= 4) {
                        medicationsToAdd.push({
                            patient: appointment.patient,
                            doctor: appointment.doctor,
                            name: parts[0],
                            dosage: parts[1],
                            frequency: parts[2],
                            duration: parts[3],
                            status: "Active",
                        });
                    }
                }
            }

            // 3. Insert all the extracted medications into the database at once
            if (medicationsToAdd.length > 0) {
                await Medication.insertMany(medicationsToAdd);
            }
        }

        res.json({ message: "Consultation completed and medications saved!", appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all lab records for a specific patient
const getPatientLabs = async (req, res) => {
    try {
        const labs = await LabTest.find({ patient: req.params.patientId }).sort({
            createdAt: -1,
        });
        res.json(labs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request a new lab test with clinical notes
const requestLab = async (req, res) => {
    try {
        const doctorProfile = await Doctor.findOne({ user: req.user._id });
        const lab = await LabTest.create({
            patient: req.params.patientId,
            doctor: doctorProfile._id,
            testName: req.body.testName,
            notes: req.body.clinicalNotes,
            status: "Pending",
            date: new Date().toISOString().split("T")[0],
        });
        res.status(201).json({ message: "Lab requested successfully", lab });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get history of all completed consultations for this doctor
const getDoctorHistory = async (req, res) => {
    try {
        const doctorProfile = await Doctor.findOne({ user: req.user._id });
        const history = await Appointment.find({
            doctor: doctorProfile._id,
            status: "Completed",
        })
            .populate({
                path: "patient",
                populate: { path: "user", select: "name patientId" },
            })
            .sort({ date: -1, time: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Analyze clinical notes using Gemini AI
const analyzeSymptoms = async (req, res) => {
    try {
        const { notes, vitals, patientAge, patientGender } = req.body;

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // UPDATED: Using the latest supported Flash model
        // Note: If 2.5-flash throws a 404 in your specific region, change this to "gemini-2.0-flash"
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      You are an elite AI diagnostic assistant helping a doctor. 
      Analyze the following patient details and clinical notes. Provide a brief, professional list of potential differential diagnoses or recommended next steps (like specific lab tests). 
      Keep it concise (bullet points). Do not play doctor, just assist the professional.
      
      Patient: ${patientAge || "Unknown"} year old ${patientGender || "Unknown"}
      Vitals: Weight ${vitals?.weight || "N/A"}kg, BP ${vitals?.bloodPressure || "N/A"}
      Clinical Notes: "${notes}"
    `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({ analysis: response });
    } catch (error) {
        console.error("💥 GEMINI AI CRASHED:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAdminStats,
    createUser,
    getUsersByRole,
    deleteUser,
    updateBedCapacity,
    getAllAppointments,
    createAppointment,
    updateAppointmentStatus,
    getAllLabTests,
    updateLabTestStatus,
    getHospitalSettings,
    updateHospitalSettings,
    updateAdminProfile,
    getReports,
    createReport,
    updateReportStatus,
    getLatestAppointmentForPatient,
    getDoctorQueue,
    updatePatientDetails,
    completeConsultation,
    getPatientLabs,
    requestLab,
    getDoctorHistory,
    analyzeSymptoms,
};
