import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
dotenv.config()

// Support both standard SMTP env parameters and fallback to simulated console logs
const transporter = process.env.SMTP_HOST ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
}) : null;

const sendEmail = async({sendTo, subject, html })=>{
    try {
        console.log(`[Email Dispatch] To: ${sendTo} | Subject: ${subject}`);
        
        if (!transporter) {
            console.log("No SMTP credentials configured. Email simulated in server console.");
            // Print out the HTML verification link or OTP clearly to help local testing!
            console.log(`------ SIMULATED EMAIL CONTENT ------\nSubject: ${subject}\nTo: ${sendTo}\nContent:\n${html}\n------------------------------------`);
            return { id: "mock-nodemailer-id" };
        }

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"DesiKit" <noreply@desikit.org>',
            to: sendTo,
            subject: subject,
            html: html,
        });

        console.log("Email sent successfully via Nodemailer. Message ID:", info.messageId);
        return info;
    } catch (error) {
        console.log("Nodemailer dispatch error, simulated success:", error.message || error);
        return { id: "mock-nodemailer-id-error-fallback" };
    }
}

export default sendEmail;

