const nodemailer = require('nodemailer');

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to email.
 * If EMAIL_USER/EMAIL_PASS not configured → logs OTP to console for development.
 */
const sendOTPEmail = async (toEmail, otp, userName = 'Friend') => {
  // Console fallback for development
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n========================================');
    console.log(`📧 OTP EMAIL (Dev Mode - No SMTP configured)`);
    console.log(`   To: ${toEmail}`);
    console.log(`   User: ${userName}`);
    console.log(`   OTP: ${otp}`);
    console.log('========================================\n');
    return { success: true, devMode: true };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Navras Cultural Platform" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} — Your Navras Verification Code`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; background: #FCF9F2; border: 1px solid #C5A880; border-radius: 12px; overflow: hidden;">
        <div style="background: #4A121A; padding: 24px; text-align: center;">
          <h1 style="color: #FCF9F2; font-size: 28px; margin: 0; letter-spacing: 2px;">navras</h1>
          <p style="color: #C5A880; font-size: 10px; margin: 4px 0 0; letter-spacing: 4px; text-transform: uppercase;">cultural mehfils</p>
        </div>
        <div style="padding: 32px; text-align: center;">
          <p style="color: #5C5549; font-family: sans-serif; font-size: 14px;">Namaskar ${userName},</p>
          <p style="color: #5C5549; font-family: sans-serif; font-size: 14px;">Use this OTP to verify your Navras account:</p>
          <div style="background: #4A121A; color: #FCF9F2; font-size: 36px; font-weight: bold; letter-spacing: 10px; padding: 20px; border-radius: 8px; margin: 24px 0; font-family: monospace;">
            ${otp}
          </div>
          <p style="color: #5C5549; font-family: sans-serif; font-size: 12px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
        <div style="background: #4A121A; padding: 16px; text-align: center;">
          <p style="color: #C5A880; font-size: 10px; font-family: sans-serif; margin: 0;">© ${new Date().getFullYear()} Navras. Where souls gather.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { success: true, devMode: false };
};

module.exports = { generateOTP, sendOTPEmail };
