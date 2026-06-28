const forgotPasswordTemplate = ({ name, otp })=>{
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px 20px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #fafdfa;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #16a34a; margin: 0; font-size: 28px;">DesiKit</h1>
            <p style="color: #15803d; font-size: 14px; margin: 4px 0 0 0; font-weight: bold;">From Farm to Family</p>
        </div>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); border: 1px solid #e8ebd9;">
            <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Dear <strong>${name}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">We received a request to reset your password. Use the verification OTP code below to set up your new credentials:</p>
            
            <div style="text-align: center; margin: 24px 0;">
                <span style="display: inline-block; background-color: #f0fdf4; border: 2px dashed #16a34a; color: #15803d; padding: 14px 40px; font-weight: bold; border-radius: 12px; font-size: 26px; letter-spacing: 4px; font-family: monospace;">
                    ${otp}
                </span>
            </div>
            
            <p style="font-size: 13px; color: #64748b; text-align: center; margin: 0;">This OTP code is valid for <strong>1 hour</strong> only. Enter it on the verification page to proceed.</p>
        </div>
        <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #64748b;">
            <p style="margin: 0;">If you did not request this change, you can safely ignore this email.</p>
            <p style="margin: 4px 0 0 0;">© ${new Date().getFullYear()} DesiKit App. All Rights Reserved.</p>
        </div>
    </div>
    `
}

export default forgotPasswordTemplate