import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import Company from "../models/Company.js";
import Experience from "../models/Experience.js";

const router = express.Router();

// Helper to make slug
const slugify = (name) =>
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

// Create experience
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { companyName, roundType, description, result, nextRoundDetails } =
            req.body;

        if (!companyName || !roundType || !description || !result) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        let company = await Company.findOne({
            name: { $regex: new RegExp("^" + companyName + "$", "i") }
        });

        if (!company) {
            company = await Company.create({
                name: companyName,
                slug: slugify(companyName)
            });
        }

        const experience = await Experience.create({
            userId: req.user.id,
            companyId: company._id,
            roundType,
            description,
            result,
            nextRoundDetails
        });

        const { userId, ...publicExp } = experience.toObject();
        res.status(201).json(publicExp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Edit experience
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const exp = await Experience.findById(req.params.id);
        if (!exp) return res.status(404).json({ message: "Not found" });
        if (String(exp.userId) !== req.user.id)
            return res.status(403).json({ message: "Forbidden" });

        const { description, result, nextRoundDetails, roundType } = req.body;

        if (description !== undefined) exp.description = description;
        if (result !== undefined) exp.result = result;
        if (nextRoundDetails !== undefined) exp.nextRoundDetails = nextRoundDetails;
        if (roundType !== undefined) exp.roundType = roundType;

        const saved = await exp.save();
        const { userId, ...publicExp } = saved.toObject();
        res.json(publicExp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete experience
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const exp = await Experience.findById(req.params.id);
        if (!exp) return res.status(404).json({ message: "Not found" });
        if (String(exp.userId) !== req.user.id)
            return res.status(403).json({ message: "Forbidden" });

        await exp.deleteOne();
        res.json({ message: "Deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
