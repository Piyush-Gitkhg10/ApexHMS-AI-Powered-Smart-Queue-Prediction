const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const seedPrimaryAdmin = require("./utils/seedAdmin");

const app = express();
const server = http.createServer(app);

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");

const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const labTestRoutes = require("./routes/labTestRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");

const adminRoutes = require("./routes/adminRoutes");

const aiRoutes = require("./routes/aiRoutes");

dotenv.config();

connectDB().then(() => {
    seedPrimaryAdmin();
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);

app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use("/api/lab-tests", labTestRoutes);

app.use("/api/prescriptions", prescriptionRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/ai", aiRoutes);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_doctor_room", (doctorId) => {
        socket.join(doctorId);
        console.log(`Doctor joined room: ${doctorId}`);
    });

    socket.on("join_patient_room", (patientId) => {
        socket.join(patientId);
        console.log(`Patient joined room: ${patientId}`);
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

app.get("/", (req, res) => {
    res.send("ApexHMS API is running...");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in development mode on port ${PORT}`);
});
