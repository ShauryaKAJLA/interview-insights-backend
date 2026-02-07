import express from "express";
import Company from "../models/Company.js";
import Experience from "../models/Experience.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Helper to make slug from name
const slugify = (name) =>
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

// GET /api/companies
// Get all companies (for landing page, dropdowns, etc.)
router.get("/", async (req, res) => {
    try {
        const companies = await Company.find().sort({ name: 1 });
        res.json(companies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/companies/:companyId/experiences?roundType=OT|TECHNICAL|HR
// Get experiences by company and optional round type
router.get("/:companyId/experiences", async (req, res) => {
    try {
        const { companyId } = req.params;
        const { roundType } = req.query;

        const filter = { companyId };
        if (roundType) filter.roundType = roundType;

        const experiences = await Experience.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        // Remove userId so posts stay anonymous
        const publicExperiences = experiences.map((exp) => {
            const { userId, ...rest } = exp;
            return rest;
        });

        res.json(publicExperiences);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/companies
// Add new company (used from Add Company page, with optional logo)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name, companyLogo } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        const existing = await Company.findOne({
            name: { $regex: new RegExp("^" + name + "$", "i") }
        });
        if (existing) {
            return res.status(400).json({ message: "Company already exists" });
        }

        const company = await Company.create({
            name,
            slug: slugify(name),
            companyLogo: companyLogo || null
        });

        res.status(201).json(company);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
