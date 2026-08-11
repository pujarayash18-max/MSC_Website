import { deleteSession } from '@/lib/auth/jwt';
import { ok } from '@/lib/api/response';

export async function POST() {
  await deleteSession();
  return ok({ message: 'Logged out successfully.' });
}
