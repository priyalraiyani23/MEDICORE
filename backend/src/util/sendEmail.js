import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "23se02cs084@ppsu.ac.in", 
                pass: "uotv pdyj kfrj xavg", 
            },
        });

        const mailOptions = {
            from: `"Medicore" <23se02cs084@ppsu.ac.in>`,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        // Returning false instead of throwing so it doesn't crash the appointment process
        // if email fails to send.
        return false; 
    }
};
