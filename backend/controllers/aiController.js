// @desc    Send clinical notes to Python AI Microservice
// @route   POST /api/ai/diagnose
// @access  Private (Doctors only)
const analyzeDiagnostics = async (req, res) => {
    try {
        const { notes } = req.body;

        if (!notes) {
            return res
                .status(400)
                .json({ message: "Clinical notes are required for analysis" });
        }

        // Node.js makes an internal HTTP request to the Python Flask server
        const pythonResponse = await fetch("http://127.0.0.1:5001/predict-diagnosis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notes }),
        });

        const aiData = await pythonResponse.json();

        if (!pythonResponse.ok) {
            throw new Error(aiData.error || "AI Engine failed to process request");
        }

        res.json(aiData);
    } catch (error) {
        res.status(500).json({ message: `AI Microservice Error: ${error.message}` });
    }
};

module.exports = { analyzeDiagnostics };
