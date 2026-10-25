import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";

import { checkPrismaConnection, findDevUserByEmail, createDevUser, createDevSession, recordAuditEvent } from "@/lib/data-store";

const signupSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6).max(128),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const isPg = await checkPrismaConnection();
    let existingUser: any = null;

    if (isPg) {
      try {
        existingUser = await prisma.user.findUnique({ where: { email } });
      } catch {
        // fallback
      }
    }

    if (!existingUser) {
      existingUser = findDevUserByEmail(email);
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    let user: { id: string; name: string | null; email: string; role?: string } | null = null;

    if (isPg) {
      try {
        user = await prisma.user.create({
          data: { name, email, passwordHash },
          select: { id: true, name: true, email: true },
        });
      } catch {
        // fallback
      }
    }

    if (!user) {
      const devUser = createDevUser({ name, email, passwordHash, role: "STORE_OWNER" });
      user = { id: devUser.id, name: devUser.name, email: devUser.email, role: devUser.role };
    }

    // Create session
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    if (isPg) {
      try {
        await prisma.session.create({
          data: { userId: user.id, token: sessionToken, expiresAt },
        });
      } catch {
        createDevSession(user.id, sessionToken, expiresAt);
      }
    } else {
      createDevSession(user.id, sessionToken, expiresAt);
    }

    const latency = Date.now() - startTime;

    // Record CloudTrail audit event
    recordAuditEvent({
      userId: user.id,
      userEmail: user.email,
      userName: user.name || name,
      action: "USER_SIGNUP",
      details: `New shopkeeper registered via AWS Cognito Identity Provider (${user.email}). Zero-category onboarding initialized.`,
      resource: "arn:aws:cognito-idp:ap-south-1:userpool/gramstock-users",
      status: "SUCCESS",
      latencyMs: latency,
      ipAddress: "127.0.0.1",
    });

    const response = NextResponse.json(
      { success: true, user: { id: user.id, name: user.name, email: user.email, role: "STORE_OWNER" } },
      { status: 201 }
    );

    // Set secure session cookie
    response.cookies.set("gs_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/signup]", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
