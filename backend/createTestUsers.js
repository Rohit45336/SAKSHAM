const mongoose = require("mongoose");
require("dotenv").config();

const Student = require("./models/Student");

const users = [
    {
        name: "SAKSHAM Demo Company",
        email: "company@saksham.demo",
        password: "Company@123",
        role: "employer"
    },
    {
        name: "SAKSHAM Demo Admin",
        email: "admin@saksham.demo",
        password: "Admin@123",
        role: "admin"
    }
];

async function createUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully ✅");

        for (const userData of users) {

            const existingUser = await Student.findOne({
                email: userData.email
            });

            if (existingUser) {
                console.log(
                    `${userData.role} already exists: ${userData.email}`
                );
                continue;
            }

            const user = new Student(userData);

            await user.save();

            console.log(
                `${userData.role} created successfully: ${userData.email} ✅`
            );
        }

        await mongoose.connection.close();

        console.log("Test users setup complete 🎉");

    } catch (error) {
        console.error("Error creating test users:", error.message);

        process.exit(1);
    }
}

createUsers();