import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.js";
import companyRoutes from "./src/routes/company.js";
import experienceRoutes from "./src/routes/experience.js";

dotenv.config();

const app = express();

// ✅ FIXED CORS - Allow your Vercel frontend + localhost
app.use(cors({
    origin: [
        "https://portfolio-shaurya-1os9.vercel.app",
        "http://localhost:5173"
    ],
    credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/experiences", experienceRoutes);

const PORT = process.env.PORT || 5000;  // Render sets PORT automatically

mongoose
    .connect(process.env.MONGO_URI)  // ← Make sure MONGO_URI is in Render env vars
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
        // Still start server even if Mongo fails
        app.listen(PORT, () => console.log(`Server running on port ${PORT} (Mongo failed)`));
    });
