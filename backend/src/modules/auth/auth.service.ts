import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from './mail.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role ?? Role.MANAGER,
      },
    });

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry },
    });

    const result = await this.mail.sendOtp(dto.email, otp);
    if (!result.success) {
      throw new UnauthorizedException(
        'Account created but we could not send the verification code. Please use "Resend code" on the verification page or try again later.',
      );
    }
    return {
      message: 'Verification code sent to your email. Please verify to continue.',
      email: dto.email,
    };
  }

  async verifyEmail(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email?.trim() } });
    if (
      !user ||
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { otp: null, otpExpiry: null },
    });
    return { message: 'Email verified successfully. You can now sign in.' };
  }

  async resendVerification(email: string) {
    const trimmed = email?.trim();
    if (!trimmed) {
      throw new UnauthorizedException('Email is required');
    }
    const user = await this.prisma.user.findUnique({ where: { email: trimmed } });
    if (!user || !user.password) {
      throw new UnauthorizedException('No pending verification found for this email.');
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry },
    });
    const result = await this.mail.sendOtp(trimmed, otp);
    if (!result.success) {
      throw new UnauthorizedException('Failed to send verification code. Please try again later.');
    }
    return { message: 'New verification code sent to your email.', email: trimmed };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user?.password) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueToken(user);
  }

  private async issueToken(user: {
    id: string;
    email: string;
    role: Role;
    firstName: string | null;
    lastName: string | null;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async requestOtp(email: string) {
    const trimmed = email?.trim();
    if (!trimmed) {
      throw new UnauthorizedException('Email is required');
    }

    let user = await this.prisma.user.findUnique({ where: { email: trimmed } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: trimmed,
          role: Role.MANAGER,
        },
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpiry,
      },
    });

    const result = await this.mail.sendOtp(trimmed, otp);
    if (!result.success) {
      throw new UnauthorizedException(
        'Failed to send OTP. Please check your email address or try again later.',
      );
    }
    return { message: 'OTP sent to your email. It expires in 10 minutes.', email: trimmed };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otp: null,
        otpExpiry: null,
      },
    });

    return this.issueToken(user);
  }
}
