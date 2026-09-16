const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const Student = require("./models/Student");
const Application = require("./models/Application");
const Opportunity = require("./models/Opportunity");
const app = express();

const PORT = process.env.PORT || 5000;

// =====================================
// CORS
// =====================================

app.use(cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


// =====================================
// MIDDLEWARE
// =====================================

app.use(express.json());

// =====================================
// JWT AUTHENTICATION MIDDLEWARE
// =====================================

function authenticateToken(req, res, next) {

    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access denied. Authentication token required."
        });
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (error, user) => {

            if (error) {
                return res.status(403).json({
                    message: "Invalid or expired authentication token."
                });
            }

            req.user = user;

            next();
        }
    );
}

// =====================================
// ROLE AUTHORIZATION MIDDLEWARE
// =====================================

function authorizeRoles(...allowedRoles) {

    return (req, res, next) => {

        if (!req.user || !allowedRoles.includes(req.user.role)) {

            return res.status(403).json({
                message:
                    "Access denied. You do not have permission to access this resource."
            });

        }

        next();
    };
}

// =====================================
// MONGODB CONNECTION
// =====================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully! ✅");
    })
    .catch((error) => {
        console.log("MongoDB connection failed ❌");
        console.log(error.message);
    });

// =====================================
// TEST ROUTE
// =====================================

app.get("/", (req, res) => {
    res.send("SAKSHAM Backend + MongoDB is running successfully! 🚀");
});

// =====================================
// STUDENT REGISTRATION API
// =====================================

app.post("/api/students/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required."
            });
        }

        // Check if email already exists
        const existingStudent = await Student.findOne({ email });

        if (existingStudent) {
            return res.status(400).json({
                message: "Student with this email already exists."
            });
        }

        // Create student
        const student = new Student({
            name,
            email,
            password,
            role: "student"
        });

        // Save student to MongoDB
        // Password will automatically be hashed
        // by Student.js before saving
        await student.save();

        res.status(201).json({
            message: "Student registered successfully! 🎉",

            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                role: student.role
            }
        });

    } catch (error) {

        console.log("Registration error:", error.message);

        res.status(500).json({
            message: "Server error during registration."
        });
    }
});

// =====================================
// STUDENT LOGIN API
// =====================================

app.post("/api/students/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        // Find student by email
        const student = await Student.findOne({ email });

        if (!student) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Compare entered password with hashed password
        const passwordMatch = await bcrypt.compare(
            password,
            student.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: student._id,
                role: student.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Login successful
        res.status(200).json({

            message: "Login successful! 🎉",

            token: token,

            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                role: student.role
            }
        });

    } catch (error) {

        console.log(
            "Login error:",
            error.message
        );

        res.status(500).json({
            message:
                "Server error during login."
        });

    }

});

// =====================================
// ADMIN DASHBOARD STATISTICS
// =====================================

app.get(
    "/api/admin/stats",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {

        try {

            // Count all students
            const totalStudents =
                await Student.countDocuments({
                    role: "student"
                });

            // Count all companies / employers
            const totalCompanies =
                await Student.countDocuments({
                    role: "employer"
                });

            // Count all opportunities
            const totalOpportunities =
                await Opportunity.countDocuments();

            // Count all applications
            const totalApplications =
                await Application.countDocuments();

            // Send statistics
            res.status(200).json({

                totalStudents:
                    totalStudents,

                totalCompanies:
                    totalCompanies,

                totalOpportunities:
                    totalOpportunities,

                totalApplications:
                    totalApplications

            });

        } catch (error) {

            console.error(
                "Admin statistics error:",
                error
            );

            res.status(500).json({
                message:
                    "Server error while loading admin statistics."
            });

        }

    }
);

// =====================================
// ADMIN - GET ALL STUDENTS
// =====================================

app.get(
    "/api/admin/students",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {

        try {

            const students = await Student.find(
                { role: "student" }
            ).select(
                "-password"
            ).sort({
                createdAt: -1
            });


            res.status(200).json({
                students: students
            });


        } catch (error) {

            console.error(
                "Admin students error:",
                error
            );

            res.status(500).json({
                message:
                    "Server error while loading students."
            });

        }

    }
);

// =====================================
// ADMIN - GET ALL COMPANIES
// =====================================

app.get(
    "/api/admin/companies",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {

        try {

            const companies = await Student.find(
                { role: "employer" }
            ).select(
                "-password"
            ).sort({
                createdAt: -1
            });

            res.status(200).json({
                companies: companies
            });

        } catch (error) {

            console.error(
                "Admin companies error:",
                error
            );

            res.status(500).json({
                message:
                    "Server error while loading companies."
            });

        }

    }
);

// =====================================
// ADMIN - GET ALL OPPORTUNITIES
// =====================================

app.get(
    "/api/admin/opportunities",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {

        try {

            const opportunities =
                await Opportunity.find()
                    .sort({
                        createdAt: -1
                    });

            res.status(200).json({
                opportunities: opportunities
            });

        } catch (error) {

            console.error(
                "Admin opportunities error:",
                error
            );

            res.status(500).json({
                message:
                    "Server error while loading opportunities."
            });

        }

    }
);


// =====================================
// ADMIN - GET ALL APPLICATIONS
// =====================================

app.get(
    "/api/admin/applications",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {

        try {

            const applications =
                await Application.find()
                    .sort({
                        createdAt: -1
                    });

            const detailedApplications =
                await Promise.all(

                    applications.map(
                        async (application) => {

                            const student =
                                await Student.findById(
                                    application.studentId
                                ).select(
                                    "name email"
                                );

                            const opportunity =
                                await Opportunity.findById(
                                    application.opportunityId
                                ).select(
                                    "title companyName"
                                );

                            return {

                                _id:
                                    application._id,

                                studentName:
                                    student
                                        ? student.name
                                        : "Unknown Student",

                                studentEmail:
                                    student
                                        ? student.email
                                        : "Not available",

                                opportunityTitle:
                                    opportunity
                                        ? opportunity.title
                                        : "Unknown Opportunity",

                                companyName:
                                    opportunity
                                        ? opportunity.companyName
                                        : "Unknown Company",

                                status:
                                    application.status ||
                                    "Applied",

                                createdAt:
                                    application.createdAt

                            };

                        }
                    )

                );

            res.status(200).json({
                applications:
                    detailedApplications
            });

        } catch (error) {

            console.error(
                "Admin applications error:",
                error
            );

            res.status(500).json({
                message:
                    "Server error while loading applications."
            });

        }

    }
);

// =====================================
// START SERVER
// =====================================

// =====================================
// GET STUDENT PROFILE API
// =====================================

app.get("/api/students/:id", authenticateToken, authorizeRoles("student"), async (req, res) => {

    try {

        const student = await Student.findById(req.params.id)
            .select("-password");

        if (!student) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        res.status(200).json({
            student: student
        });

    } catch (error) {

        console.log("Profile error:", error.message);

        res.status(500).json({
            message: "Server error while loading profile."
        });
    }

});

// =====================================
// UPDATE ACADEMIC INFORMATION API
// =====================================

app.put("/api/students/:id/academic", authenticateToken, authorizeRoles("student"), async (req, res) => {

    try {

        const {
            college,
            degree,
            branch,
            graduationYear
        } = req.body;

        // Required fields check
        if (!college || !degree || !branch || !graduationYear) {

            return res.status(400).json({
                message:
                    "College, degree, branch and graduation year are required."
            });

        }

        // Update student academic information
        const student = await Student.findByIdAndUpdate(

            req.params.id,

            {
                college: college,
                degree: degree,
                branch: branch,
                graduationYear: graduationYear
            },

            {
                new: true
            }

        ).select("-password");


        // Student not found
        if (!student) {

            return res.status(404).json({
                message: "Student not found."
            });

        }


        // Success response
        res.status(200).json({

            message:
                "Academic information saved successfully! 🎓",

            student: student

        });


    } catch (error) {

        console.log(
            "Academic update error:",
            error.message
        );

        res.status(500).json({

            message:
                "Server error while saving academic information."

        });

    }

});

// =====================================
// UPDATE AYUSH SKILLS API
// =====================================

app.put("/api/students/:id/skills", authenticateToken, authorizeRoles("student"), async (req, res) => {

    try {

        const { discipline, skills, skillLevel } = req.body;

        // Check required data
        if (!discipline || !skills || skills.length === 0 || !skillLevel) {

            return res.status(400).json({
                message: "Discipline, skills and skill level are required."
            });

        }

        // Update student
        const student = await Student.findByIdAndUpdate(

            req.params.id,

            {
                discipline: discipline,
                skills: skills,
                skillLevel: skillLevel
            },

            {
                new: true
            }
        ).select("-password");


        // Student not found
        if (!student) {

            return res.status(404).json({
                message: "Student not found."
            });

        }


        // Success response
        res.status(200).json({

            message: "AYUSH skills saved successfully! 🎉",

            student: student

        });


    } catch (error) {

        console.log(
            "Skills update error:",
            error.message
        );

        res.status(500).json({
            message: "Server error while saving skills."
        });

    }

});

// =====================================
// APPLY FOR OPPORTUNITY API
// =====================================

app.post("/api/applications", authenticateToken, authorizeRoles("student"), async (req, res) => {

    try {

        const {
            studentId,
            opportunityName,
            discipline
        } = req.body;

        // Check that the logged-in student is applying for themselves
if (req.user.id !== studentId.toString()) {
    return res.status(403).json({
        message: "You are not authorized to apply for another student."
    });
}

        // Required data check
        if (!studentId || !opportunityName || !discipline) {
            return res.status(400).json({
                message:
                    "Student, opportunity and discipline are required."
            });
        }

        // Check student exists
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        // Prevent duplicate application
        const existingApplication =
            await Application.findOne({
                studentId: studentId,
                opportunityName: opportunityName
            });

        if (existingApplication) {
            return res.status(400).json({
                message:
                    "You have already applied for this opportunity."
            });
        }

        // Create application
        const application = new Application({
            studentId: studentId,
            opportunityName: opportunityName,
            discipline: discipline,
            status: "Applied"
        });

        // Save to MongoDB
        await application.save();

        res.status(201).json({
            message:
                "Application submitted successfully! 🎉",

            application: application
        });

    } catch (error) {

        console.log(
            "Application error:",
            error.message
        );

        res.status(500).json({
            message:
                "Server error while submitting application."
        });
    }
});

// =====================================
// CHECK STUDENT APPLICATION STATUS
// =====================================

app.get("/api/applications/check/:studentId/:opportunityName", authenticateToken, authorizeRoles("student"), async (req, res) => {

    try {

        const {
            studentId,
            opportunityName
        } = req.params;

        // Check that the logged-in student is checking their own application
if (req.user.id !== studentId.toString()) {
    return res.status(403).json({
        message: "You are not authorized to access another student's application."
    });
}

        const application = await Application.findOne({
            studentId: studentId,
            opportunityName: opportunityName
        });

        res.status(200).json({
            applied: !!application
        });

    } catch (error) {

        console.log(
            "Application status error:",
            error.message
        );

        res.status(500).json({
            message:
                "Server error while checking application status."
        });

    }

});
// =====================================
// GET STUDENT APPLICATIONS API
// =====================================

app.get("/api/applications/student/:studentId", authenticateToken, authorizeRoles("student"), async (req, res) => {

    try {

        const { studentId } = req.params;

        // Check that the logged-in student is viewing their own applications
if (req.user.id !== studentId.toString()) {
    return res.status(403).json({
        message: "You are not authorized to access another student's applications."
    });
}

        // Find applications of this student
        const applications = await Application.find({
            studentId: studentId
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            applications: applications
        });

    } catch (error) {

        console.log(
            "Fetch applications error:",
            error.message
        );

        res.status(500).json({
            message:
                "Server error while loading applications."
        });

    }

});


// =====================================
// CREATE OPPORTUNITY
// =====================================

app.post(
    "/api/opportunities",
    authenticateToken,
    authorizeRoles("admin", "employer"),
    async (req, res) => {

        try {

            const {
                title,
                organization,
                discipline,
                requiredSkills,
                description
            } = req.body;


            if (
                !title ||
                !organization ||
                !discipline ||
                !requiredSkills
            ) {

                return res.status(400).json({
                    message:
                        "Please provide all required opportunity details."
                });

            }


            const opportunity =
                new Opportunity({

                    title,
                    organization,
                    discipline,
                    requiredSkills,
                    description,

                    // Save company/admin who created it
                    createdBy: req.user.id

                });


            await opportunity.save();


            res.status(201).json({

                message:
                    "Opportunity created successfully! 🎉",

                opportunity

            });


        } catch (error) {

            console.error(
                "Create opportunity error:",
                error
            );


            res.status(500).json({

                message:
                    "Server error while creating opportunity."

            });

        }

    }
);



// =====================================
// GET ALL OPPORTUNITIES
// =====================================

app.get(
    "/api/opportunities",
    authenticateToken,
    authorizeRoles("student", "admin", "employer"),
    async (req, res) => {

        try {

            const Opportunity = require("./models/Opportunity");

            const opportunities = await Opportunity.find()
                .sort({ createdAt: -1 });

            res.status(200).json({
                opportunities
            });

        } catch (error) {

            console.error("Get opportunities error:", error);

            res.status(500).json({
                message: "Server error while fetching opportunities."
            });

        }
    }
);


// =====================================
// GET MY OPPORTUNITIES - COMPANY
// =====================================

app.get(
    "/api/opportunities/my",
    authenticateToken,
    authorizeRoles("employer"),
    async (req, res) => {

        try {

            const opportunities =
                await Opportunity.find({
                    createdBy: req.user.id
                }).sort({
                    createdAt: -1
                });


            res.status(200).json({

                opportunities

            });


        } catch (error) {

            console.error(
                "Get my opportunities error:",
                error
            );


            res.status(500).json({

                message:
                    "Server error while fetching your opportunities."

            });

        }

    }
);

// =====================================
// GET APPLICANTS FOR MY OPPORTUNITY - COMPANY
// =====================================

app.get(
    "/api/applications/opportunity/:opportunityName",
    authenticateToken,
    authorizeRoles("employer"),
    async (req, res) => {

        try {

            const { opportunityName } = req.params;

            // Find the company opportunity
            const opportunity = await Opportunity.findOne({
                title: opportunityName,
                createdBy: req.user.id
            });

            // Opportunity not found or does not belong to this company
            if (!opportunity) {
                return res.status(404).json({
                    message:
                        "Opportunity not found or you are not authorized to access it."
                });
            }

            // Find all applications for this opportunity
            const applications = await Application.find({
                opportunityName: opportunityName
            })
                .populate(
                    "studentId",
                    "-password"
                )
                .sort({
                    createdAt: -1
                });

            res.status(200).json({
                opportunity: {
                    id: opportunity._id,
                    title: opportunity.title,
                    organization: opportunity.organization
                },

                applicants: applications
            });

        } catch (error) {

            console.error(
                "Get opportunity applicants error:",
                error
            );

            res.status(500).json({
                message:
                    "Server error while loading applicants."
            });
        }
    }
);

// =====================================
// UPDATE APPLICATION STATUS - COMPANY
// =====================================

app.put(
    "/api/applications/:applicationId/status",
    authenticateToken,
    authorizeRoles("employer"),
    async (req, res) => {

        try {

            const { applicationId } = req.params;
            const { status } = req.body;

            // Check valid application ID
            if (!mongoose.Types.ObjectId.isValid(applicationId)) {
                return res.status(400).json({
                    message: "Invalid application ID."
                });
            }

            // Allowed statuses
            const allowedStatuses = [
                "Applied",
                "Shortlisted",
                "Rejected"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message:
                        "Invalid status. Allowed statuses are Applied, Shortlisted and Rejected."
                });
            }

            // Find application
            const application =
                await Application.findById(applicationId);

            if (!application) {
                return res.status(404).json({
                    message: "Application not found."
                });
            }

            // Check whether this opportunity belongs to logged-in company
            const opportunity =
                await Opportunity.findOne({
                    title: application.opportunityName,
                    createdBy: req.user.id
                });

            if (!opportunity) {
                return res.status(403).json({
                    message:
                        "You are not authorized to update this application."
                });
            }

            // Update status
            application.status = status;

            await application.save();

            res.status(200).json({
                message:
                    "Application status updated successfully.",
                application: application
            });

        } catch (error) {

            console.error(
                "Update application status error:",
                error
            );

            res.status(500).json({
                message:
                    "Server error while updating application status."
            });
        }
    }
);

// =====================================
// SKILL GAP ANALYSIS
// =====================================

app.get(
    "/api/skill-gap/:studentId/:opportunityId",
    authenticateToken,
    authorizeRoles("student"),
    async (req, res) => {

        try {

            const Student = require("./models/Student");
            const Opportunity = require("./models/Opportunity");

            const { studentId, opportunityId } = req.params;

            // Ownership check
            if (req.user.id !== studentId.toString()) {
                return res.status(403).json({
                    message: "You are not authorized to access another student's skill gap."
                });
            }

            const student = await Student.findById(studentId);
            const opportunity = await Opportunity.findById(opportunityId);

            if (!student) {
                return res.status(404).json({
                    message: "Student not found."
                });
            }

            if (!opportunity) {
                return res.status(404).json({
                    message: "Opportunity not found."
                });
            }

            // Check discipline
            if (
                opportunity.discipline !== "ALL" &&
                opportunity.discipline !== student.discipline
            ) {
                return res.status(400).json({
                    message: "This opportunity is not suitable for your discipline."
                });
            }

            const studentSkills = student.skills || [];
            const requiredSkills = opportunity.requiredSkills || [];

            const matchingSkills = requiredSkills.filter(skill =>
                studentSkills.some(
                    studentSkill =>
                        studentSkill.toLowerCase() === skill.toLowerCase()
                )
            );

            const missingSkills = requiredSkills.filter(skill =>
                !studentSkills.some(
                    studentSkill =>
                        studentSkill.toLowerCase() === skill.toLowerCase()
                )
            );

            const totalRequired = requiredSkills.length;

            const matchPercentage =
                totalRequired === 0
                    ? 0
                    : Math.round(
                        (matchingSkills.length / totalRequired) * 100
                    );

            res.status(200).json({
                opportunity: {
                    id: opportunity._id,
                    title: opportunity.title,
                    organization: opportunity.organization
                },

                skillAnalysis: {
                    requiredSkills,
                    matchingSkills,
                    missingSkills,
                    matchPercentage
                }
            });

        } catch (error) {

            console.error("Skill gap analysis error:", error);

            res.status(500).json({
                message: "Server error while analyzing skill gap."
            });
        }
    }
);

// =====================================
// APPLICANT SKILL MATCH - COMPANY
// =====================================

app.get(
    "/api/applications/:applicationId/skill-match",
    authenticateToken,
    authorizeRoles("employer"),
    async (req, res) => {

        try {

            const { applicationId } = req.params;

            // Check valid application ID
            if (!mongoose.Types.ObjectId.isValid(applicationId)) {
                return res.status(400).json({
                    message: "Invalid application ID."
                });
            }

            // Find application
            const application =
                await Application.findById(applicationId);

            if (!application) {
                return res.status(404).json({
                    message: "Application not found."
                });
            }

            // Find the opportunity
            const opportunity =
                await Opportunity.findOne({
                    title: application.opportunityName,
                    createdBy: req.user.id
                });

            // Check company ownership
            if (!opportunity) {
                return res.status(403).json({
                    message:
                        "You are not authorized to view this skill match."
                });
            }

            // Find student
            const student =
                await Student.findById(application.studentId);

            if (!student) {
                return res.status(404).json({
                    message: "Student not found."
                });
            }

            // Student skills
            const studentSkills =
                (student.skills || []).map(skill =>
                    typeof skill === "string"
                        ? skill.toLowerCase().trim()
                        : skill.name
                            ? skill.name.toLowerCase().trim()
                            : ""
                ).filter(Boolean);


            // Required opportunity skills
            const requiredSkills =
                (opportunity.requiredSkills || []).map(skill =>
                    typeof skill === "string"
                        ? skill.toLowerCase().trim()
                        : skill.name
                            ? skill.name.toLowerCase().trim()
                            : ""
                ).filter(Boolean);


            // Remove duplicate skills
            const uniqueStudentSkills =
                [...new Set(studentSkills)];

            const uniqueRequiredSkills =
                [...new Set(requiredSkills)];


            // Find matching skills
            const matchingSkills =
                uniqueRequiredSkills.filter(
                    skill =>
                        uniqueStudentSkills.includes(skill)
                );


            // Find missing skills
            const missingSkills =
                uniqueRequiredSkills.filter(
                    skill =>
                        !uniqueStudentSkills.includes(skill)
                );


            // Calculate match percentage
            let matchPercentage = 0;

            if (uniqueRequiredSkills.length > 0) {

                matchPercentage =
                    Math.round(
                        (matchingSkills.length /
                            uniqueRequiredSkills.length) *
                        100
                    );
            }


            // Send response
            res.status(200).json({

                applicationId:
                    application._id,

                studentId:
                    student._id,

                studentName:
                    student.name,

                opportunityName:
                    opportunity.title,

                matchPercentage:
                    matchPercentage,

                matchingSkills:
                    matchingSkills,

                missingSkills:
                    missingSkills

            });

        } catch (error) {

            console.error(
                "Applicant skill match error:",
                error
            );

            res.status(500).json({
                message:
                    "Server error while calculating skill match."
            });
        }
    }
);

// =====================================
// DELETE MY OPPORTUNITY - COMPANY
// =====================================

app.delete(
    "/api/opportunities/:id",
    authenticateToken,
    authorizeRoles("employer"),
    async (req, res) => {

        try {

            const opportunity = await Opportunity.findById(
                req.params.id
            );

            if (!opportunity) {
                return res.status(404).json({
                    message: "Opportunity not found."
                });
            }

            // Security check:
            // Company can delete only its own opportunity
            if (
                opportunity.createdBy &&
                opportunity.createdBy.toString() !== req.user.id
            ) {
                return res.status(403).json({
                    message:
                        "You can delete only your own opportunities."
                });
            }

            await Opportunity.findByIdAndDelete(
                req.params.id
            );

            res.status(200).json({
                message:
                    "Opportunity deleted successfully! 🗑️"
            });

        } catch (error) {

            console.error(
                "Delete opportunity error:",
                error
            );

            res.status(500).json({
                message:
                    "Server error while deleting opportunity."
            });
        }
    }
);

// =====================================
// TEMPORARY ADMIN ACCOUNT CREATION
// =====================================

app.post("/api/create-admin", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        const existingAdmin = await Student.findOne({ email });

        if (existingAdmin) {
            return res.status(400).json({
                message: "Account with this email already exists."
            });
        }

        // IMPORTANT:
        // Student model automatically hashes the password.
        // So we pass the plain password here.
        const admin = new Student({
            name: name,
            email: email,
            password: password,
            role: "admin"
        });

        await admin.save();

        res.status(201).json({
            message: "Admin account created successfully."
        });

    } catch (error) {

        console.error("Admin creation error:", error);

        res.status(500).json({
            message: "Failed to create admin account."
        });

    }

});

// =====================================
// GENERATE PASSPORT ID FOR STUDENT
// =====================================

app.post(
    "/api/student/passport/generate",
    authenticateToken,
    authorizeRoles("student"),
    async (req, res) => {

        try {

            const student =
                await Student.findById(req.user.id);

            if (!student) {

                return res.status(404).json({
                    message: "Student not found."
                });

            }

            // If Passport ID already exists,
            // return the existing one.
            if (student.passportId) {

                return res.status(200).json({
                    message:
                        "Passport ID already exists.",
                    passportId:
                        student.passportId
                });

            }

            // Generate unique Passport ID
            const randomPart =
                Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase();

            const passportId =
                "SAK-" + randomPart;

            student.passportId =
                passportId;

            await student.save();

            res.status(201).json({

                message:
                    "Digital Skill Passport ID generated successfully.",

                passportId:
                    passportId

            });

        } catch (error) {

            console.error(
                "Passport ID generation error:",
                error
            );

            res.status(500).json({
                message:
                    "Server error while generating Passport ID."
            });

        }

    }
);

// =====================================
// VERIFY DIGITAL SKILL PASSPORT
// =====================================

app.get(
    "/api/student/passport/verify/:passportId",
    async (req, res) => {

        try {

            const passportId =
                req.params.passportId;

            const student =
                await Student.findOne({
                    passportId: passportId,
                    role: "student"
                }).select(
                    "name college degree branch discipline skillLevel graduationYear passportId"
                );

            if (!student) {

                return res.status(404).json({
                    verified: false,
                    message:
                        "Digital Skill Passport not found."
                });

            }

            res.status(200).json({

                verified: true,

                passport: {
                    name: student.name,
                    college: student.college,
                    degree: student.degree,
                    branch: student.branch,
                    discipline: student.discipline,
                    skillLevel: student.skillLevel,
                    graduationYear:
                        student.graduationYear,
                    passportId: student.passportId
                }

            });

        } catch (error) {

            console.error(
                "Passport verification error:",
                error
            );

            res.status(500).json({
                verified: false,
                message:
                    "Server error while verifying passport."
            });

        }

    }
);

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `SAKSHAM server running on port ${PORT}`
    );

});