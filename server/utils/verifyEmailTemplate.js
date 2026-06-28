const verifyEmailTemplate = ({name,url})=>{
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px 20px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #fafdfa;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #16a34a; margin: 0; font-size: 28px;">DesiKit</h1>
            <p style="color: #15803d; font-size: 14px; margin: 4px 0 0 0; font-weight: bold;">From Farm to Family</p>
        </div>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); border: 1px solid #e8ebd9;">
            <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Dear <strong>${name}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">Thank you for signing up with DesiKit! We are thrilled to welcome you to our farm-fresh family marketplace. To get started and secure your account, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 28px 0;">
                <a href="${url}" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 12px 32px; font-weight: bold; border-radius: 8px; text-decoration: none; font-size: 15px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.2);">
                    Verify Email Address
                </a>
            </div>
            
            <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;">If the button above does not work, copy and paste this URL into your browser:<br/>
            <a href="${url}" style="color: #16a34a; word-break: break-all;">${url}</a></p>
        </div>
        <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #64748b;">
            <p style="margin: 0;">Connect with local dairy farms and growers directly.</p>
            <p style="margin: 4px 0 0 0;">© ${new Date().getFullYear()} DesiKit App. All Rights Reserved.</p>
        </div>
    </div>
    `
}

export default verifyEmailTemplate