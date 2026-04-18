const nodemailer = require('nodemailer');
const NodeCache = require('node-cache');

// Cache OTP for 10 minutes
const otpCache = new NodeCache({ stdTTL: 600 });
let transporter = null;

const initEthereal = async () => {
    if (!transporter) {
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, 
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log("Ethereal Email transporter initialized for OTPs");
    }
    return transporter;
};

// @desc    Send OTP to a given email
// @route   POST /api/auth/send-otp
const sendOtp = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save OTP in node-cache against the email
        otpCache.set(email.toLowerCase(), otp);

        const t = await initEthereal();

        const info = await t.sendMail({
            from: '"CitySphere Auth" <no-reply@citysphere.gov>',
            to: email,
            subject: 'Your CitySphere Verification Code',
            html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>CitySphere Registration</h2>
                    <p>Your one-time verification code is:</p>
                    <h1 style="color: #0d9488; letter-spacing: 5px;">${otp}</h1>
                    <p>This code will expire in 10 minutes. Do not share this with anyone.</p>
                   </div>`,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("====================================");
        console.log(`[DEV OTP] for ${email}: ${otp}`);
        console.log(`[Preview URL]: ${previewUrl}`);
        console.log("====================================");

        res.json({ 
            success: true, 
            message: 'OTP sent successfully. Check console/Ethereal for dev.',
            previewUrl // helpful so dev can click it directly from frontend console if needed
        });
    } catch (err) {
        console.error("Error sending OTP", err);
        res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }
};

// @desc    Verify the OTP for an email
// @route   POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const storedOtp = otpCache.get(email.toLowerCase());

    if (!storedOtp) {
        return res.status(400).json({ message: 'OTP has expired or was not sent' });
    }

    if (storedOtp === otp) {
        // Clear OTP after successful verification
        otpCache.del(email.toLowerCase());
        return res.json({ success: true, message: 'OTP verified successfully' });
    } else {
        return res.status(400).json({ message: 'Invalid OTP' });
    }
};

module.exports = {
    sendOtp,
    verifyOtp
};
