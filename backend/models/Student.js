const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const studentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
    type: String,
    enum: ["student", "employer", "admin"],
    default: "student"
},

        // AYUSH Discipline
        discipline: {
    type: String,
    default: ""
        },

        // Student ke selected AYUSH skills
        skills: {
        type: [String],
        default: []
        },

        // Overall skill level
        skillLevel: {
        type: String,
        default: ""
        },

        // Academic Information
    college: {
    type: String,
    default: ""
},

degree: {
    type: String,
    default: ""
},

branch: {
    type: String,
    default: ""
},

graduationYear: {
    type: String,
    default: ""
},
passportId: {
    type: String,
    unique: true,
    sparse: true
}
    },

    {
        timestamps: true
    }
);

// Password save hone se pehle hash hoga
studentSchema.pre("save", async function () {

    // Agar password change nahi hua
    // toh dobara hash nahi karna
    if (!this.isModified("password")) {
        return;
    }

    // Password ko bcrypt se hash karna
    this.password = await bcrypt.hash(this.password, 10);
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;