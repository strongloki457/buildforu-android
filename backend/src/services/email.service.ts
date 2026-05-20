import nodemailer from "nodemailer";
import { env } from "../config/env";

function createTransporter() {
  if (!env.SMTP_HOST) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
  });
}

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    process.stdout.write(
      `[email-dev] To: ${to} | Subject: ${subject}\n${html.replace(/<[^>]+>/g, "")}\n`
    );
    return;
  }

  try {
    await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
  } catch (error) {
    process.stderr.write(`[email] Failed to send "${subject}" to ${to}: ${error}\n`);
  }
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const link = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

  await sendMail(
    to,
    "Reset your BuildForU password",
    `<p>You requested a password reset for your BuildForU account.</p>
     <p>Click the link below to set a new password. This link expires in <strong>30 minutes</strong>.</p>
     <p><a href="${link}">${link}</a></p>
     <p>If you did not request this, you can safely ignore this email.</p>`
  );
}

export async function sendPasswordChangedEmail(to: string, name: string): Promise<void> {
  await sendMail(
    to,
    "Your BuildForU password was changed",
    `<p>Hi ${name},</p>
     <p>Your BuildForU password was successfully changed.</p>
     <p>If you did not make this change, contact support immediately and secure your account.</p>`
  );
}
