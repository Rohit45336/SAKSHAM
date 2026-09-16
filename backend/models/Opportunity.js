const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        organization: {
            type: String,
            required: true
        },

        discipline: {
            type: String,
            required: true
        },

        requiredSkills: {
            type: [String],
            default: []
        },

        description: {
            type: String,
            default: ""
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Opportunity", opportunitySchema);