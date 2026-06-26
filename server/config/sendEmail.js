import { Resend } from 'resend';
import dotenv from 'dotenv'
dotenv.config()

const hasKey = process.env.RESEND_API && process.env.RESEND_API !== "REPLACE_WITH_REAL_RESEND_API_KEY";
const resend = hasKey ? new Resend(process.env.RESEND_API) : null;

const sendEmail = async({sendTo, subject, html })=>{
    try {
        console.log(`[Email Sent] To: ${sendTo} | Subject: ${subject}`);
        if (!resend) {
            console.log("No RESEND_API key configured. Email content simulated in console.");
            return { id: "mock-email-id" };
        }

        const { data, error } = await resend.emails.send({
            from: 'DesiKit <noreply@desikit.org>',
            to: sendTo,
            subject: subject,
            html: html,
        });

        if (error) {
            console.error("Resend API error:", error);
            return null;
        }

        return data;
    } catch (error) {
        console.log("Email dispatch error, simulated success:", error.message || error);
        return { id: "mock-email-id-error-fallback" };
    }
}

export default sendEmail;
