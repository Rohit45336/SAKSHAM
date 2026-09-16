const mongoose = require("mongoose");
require("dotenv").config();

const Opportunity = require("./models/Opportunity");

const opportunities = [
    {
        title: "Panchakarma Intern",
        organization: "Ayurveda Wellness Centre",
        discipline: "BAMS",
        requiredSkills: [
            "Panchakarma",
            "Patient Counselling",
            "Clinical Case-taking"
        ],
        description: "Internship opportunity for BAMS students interested in Panchakarma and clinical practice."
    },

    {
        title: "Ayurvedic Research Intern",
        organization: "AYUSH Research Institute",
        discipline: "BAMS",
        requiredSkills: [
            "Research & Publication",
            "Herbal Formulation",
            "Pharmacovigilance"
        ],
        description: "Research internship for students interested in Ayurveda research."
    },

    {
        title: "Homeopathy Clinical Intern",
        organization: "Homeopathy Care Centre",
        discipline: "BHMS",
        requiredSkills: [
            "Clinical Case-taking",
            "Patient Counselling",
            "Research & Publication"
        ],
        description: "Clinical internship opportunity for BHMS students."
    },

    {
        title: "Yoga & Wellness Intern",
        organization: "Wellness and Yoga Centre",
        discipline: "BNYS",
        requiredSkills: [
            "Yoga Therapy",
            "Patient Counselling",
            "Clinical Case-taking"
        ],
        description: "Wellness internship for BNYS students."
    },

    {
        title: "Unani Clinical Intern",
        organization: "Unani Healthcare Centre",
        discipline: "BUMS",
        requiredSkills: [
            "Clinical Case-taking",
            "Patient Counselling",
            "Pharmacovigilance"
        ],
        description: "Clinical internship opportunity for BUMS students."
    },

    {
        title: "Siddha Research Intern",
        organization: "Siddha Research Centre",
        discipline: "BSMS",
        requiredSkills: [
            "Research & Publication",
            "Herbal Formulation",
            "Pharmacovigilance"
        ],
        description: "Research internship opportunity for BSMS students."
    }
];

async function seedDatabase() {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully ✅");

        await Opportunity.deleteMany({});

        await Opportunity.insertMany(opportunities);

        console.log("Opportunities added successfully 🎉");

        await mongoose.connection.close();

    } catch (error) {

        console.error("Error seeding opportunities:", error);

    }
}

seedDatabase();