import { UserStatus } from '@prisma/client';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export type CurrentUser = {
  id: string;
  email?: string | null;
  status: 'active' | 'disabled';
};

type SessionUser = {
  id?: string;
  email?: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const sessionUser = session?.user as SessionUser | undefined;

  if (!sessionUser?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, email: true, status: true },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    status: user.status === UserStatus.DISABLED ? 'disabled' : 'active',
  };
}
