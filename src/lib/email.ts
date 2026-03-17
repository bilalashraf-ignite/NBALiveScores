import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@example.com",
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
        <h1 style="color: #333; margin-bottom: 20px;">Verify your email</h1>
        <p style="color: #666; line-height: 1.6;">
          Click the button below to verify your email address. This link will expire in 24 hours.
        </p>
        <a href="${verificationUrl}"
           style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email
        </a>
        <p style="color: #999; font-size: 14px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@example.com",
    to: email,
    subject: "Reset your password",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
        <h1 style="color: #333; margin-bottom: 20px;">Reset your password</h1>
        <p style="color: #666; line-height: 1.6;">
          Click the button below to reset your password. This link will expire in 1 hour.
        </p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 14px;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
