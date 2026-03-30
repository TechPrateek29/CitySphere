const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

let transporter = null;

const initEthereal = async () => {
    if (!transporter) {
        // Create a test account just for development
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
        console.log("Ethereal Email transporter initialized");
    }
    return transporter;
};

router.post('/send', async (req, res) => {
    try {
        const { to, subject, html } = req.body;
        
        let t = await initEthereal();

        let info = await t.sendMail({
            from: '"CitySphere Administration" <admin@citysphere.gov>',
            to: to,
            subject: subject,
            html: html,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", previewUrl);

        res.json({ success: true, previewUrl });
    } catch (err) {
        console.error("Error sending email", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
