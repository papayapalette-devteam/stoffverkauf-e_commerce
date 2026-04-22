const mongoose = require('mongoose');
const Integration = require('./Modals/Integration/integration');
const dotenv = require('dotenv');

dotenv.config();

const updatePaypal = async () => {
    try {
        await mongoose.connect(process.env.URL || "mongodb://localhost:27017/stoffverkauf");
        console.log("Connected to DB");

        const paypalData = {
            paypalClientId: "AS5TNLfVRw_-iey1Ec_pxP2PvNglAnDulJ39ep6j0jzG3qe68vk9xPdPmoAZru29r0upZIy8O1SH4bOd",
            paypalSecret: "EEPqemoygI0BuMW4e0AQRQk0x3buWYj0L-_yc4EXx96JlGLwx5FO17j9RVpkrJa8dyFFHv6_hQpntYgh",
            paypalMode: "sandbox",
            paypalUsername: "",
            paypalPassword: "",
            paypalSignature: ""
        };

        const integration = await Integration.findOneAndUpdate(
            { key: 'paypal' },
            {
                key: 'paypal',
                name: 'PayPal',
                data: paypalData,
                isActive: true
            },
            { upsert: true, new: true }
        );

        console.log("PayPal integration updated with FULL credentials and Classic API placeholders");
        process.exit(0);
    } catch (err) {
        console.error("Error updating PayPal:", err);
        process.exit(1);
    }
};

updatePaypal();
