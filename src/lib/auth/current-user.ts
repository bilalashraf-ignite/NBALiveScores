import { auth } from '@/lib/auth';

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
  const user = session?.user as SessionUser | undefined;

  if (!user?.id) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    status: 'active',
  };
}
