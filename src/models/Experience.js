import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
        roundType: {
            type: String,
            enum: ["OT", "TECHNICAL", "HR"],
            required: true
        },
        description: { type: String, required: true },
        result: {
            type: String,
            enum: ["QUALIFIED", "NOT_QUALIFIED"],
            required: true
        },
        nextRoundDetails: { type: String }
    },
    { timestamps: true }
);

export default mongoose.model("Experience", experienceSchema);
