const User = require("../models/User");
const bcrypt = require("bcryptjs");

const seedPrimaryAdmin = async () => {
    try {
        const adminEmail = "sahilrauniyakhg10@gmail.com";

        // Generate the hashed password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("Piyush@HMS123", salt);

        // findOneAndUpdate with { upsert: true } will CREATE the user if they don't exist,
        // or OVERWRITE them with these exact credentials if they do exist.
        await User.findOneAndUpdate(
            { email: adminEmail },
            {
                userId: "ADM-MASTER",
                name: "Super Admin",
                password: hashedPassword,
                role: "Admin",
            },
            { upsert: true, new: true },
        );

        console.log("Primary Admin account seeded/updated successfully.");
    } catch (error) {
        console.error("Error seeding admin:", error);
    }
};

module.exports = seedPrimaryAdmin;
