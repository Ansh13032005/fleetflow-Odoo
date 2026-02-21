import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter | null = null;
  private etherealAccount: nodemailer.TestAccount | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(private config: ConfigService) {
    this.initPromise = this.initTransporter();
  }

  private async initTransporter(): Promise<void> {
    const host = this.config.get<string>('SMTP_HOST');
    const portRaw = this.config.get<string>('SMTP_PORT');
    const port = portRaw ? parseInt(portRaw, 10) : 587;
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      return;
    }

    // Fallback: use Ethereal test account (dev only - emails viewable at preview URL)
    try {
      this.etherealAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: this.etherealAccount.smtp.host,
        port: this.etherealAccount.smtp.port,
        secure: this.etherealAccount.smtp.secure,
        auth: {
          user: this.etherealAccount.user,
          pass: this.etherealAccount.pass,
        },
      });
      console.log('[Mail] Using Ethereal (SMTP not configured). Preview URL will be logged per email.');
    } catch (e) {
      console.warn('[Mail] Ethereal fallback failed. OTP will be logged to console only.', e);
    }
  }

  async sendOtp(to: string, otp: string): Promise<{ success: boolean; previewUrl?: string }> {
    const from =
      this.config.get<string>('MAIL_FROM') ??
      this.config.get<string>('SMTP_USER') ??
      'noreply@fleetflow.com';
    const appName = this.config.get<string>('APP_NAME') ?? 'Fleetflow';

    if (!this.initPromise) {
      this.initPromise = this.initTransporter();
    }
    await this.initPromise;

    if (!this.transporter) {
      console.log(`[Mail] SMTP not configured. OTP for ${to}: ${otp}`);
      return { success: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${appName}" <${from}>`,
        to,
        subject: `Your ${appName} login code`,
        text: `Your one-time password is: ${otp}. It expires in 10 minutes. Do not share it.`,
        html: `
          <div style="font-family: sans-serif; max-width: 400px;">
            <h2 style="color: #111;">Your login code</h2>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #059669;">${otp}</p>
            <p style="color: #666;">This code expires in 10 minutes. Do not share it with anyone.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this, you can ignore this email.</p>
          </div>
        `,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Mail] OTP sent to ${to}. Preview: ${previewUrl}`);
      }
      return { success: true, previewUrl: typeof previewUrl === 'string' ? previewUrl : undefined };
    } catch (err) {
      console.error('[Mail] Failed to send OTP:', err);
      return { success: false };
    }
  }
}
