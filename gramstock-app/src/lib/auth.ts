/**
 * GramStock Cloud — Auth Utilities
 * Server-side session validation. Used in API routes and server components.
 */
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { checkPrismaConnection, getDevSession } from "@/lib/data-store";

export interface AuthSession {
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role?: string;
  };
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("gs_session")?.value;
    if (!token) return null;

    const isPg = await checkPrismaConnection();
    if (isPg) {
      try {
        const session = await prisma.session.findUnique({
          where: { token },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        });

        if (session) {
          if (session.expiresAt < new Date()) {
            await prisma.session.delete({ where: { token } }).catch(() => {});
            return null;
          }

          return {
            userId: session.userId,
            user: session.user,
          };
        }
      } catch {
        // fallback
      }
    }

    // Fallback to local dev session store
    const devSess = getDevSession(token);
    if (devSess) {
      return {
        userId: devSess.userId,
        user: devSess.user,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Verify that the given businessId belongs to the authenticated user.
 * Always call this before any business-scoped database operation.
 */
export async function requireBusinessAccess(
  userId: string,
  businessId: string
): Promise<boolean> {
  const business = await prisma.business.findFirst({
    where: { id: businessId, ownerId: userId },
    select: { id: true },
  });
  return business !== null;
}

/**
 * Get session from request headers (for API routes using NextRequest).
 */
export async function getSessionFromToken(token: string | undefined): Promise<AuthSession | null> {
  if (!token) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) return null;

    return {
      userId: session.userId,
      user: session.user,
    };
  } catch {
    return null;
  }
}
