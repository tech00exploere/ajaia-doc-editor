import { prisma } from './prisma';
import { Role } from '@/types';

export async function getUserDocumentRole(
  documentId: string,
  userId: string
): Promise<Role> {
  if (!documentId || !userId) return 'NONE';

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      ownerId: true,
      shares: {
        where: { userId },
        select: { role: true },
      },
    },
  });

  if (!doc) return 'NONE';

  if (doc.ownerId === userId) {
    return 'OWNER';
  }

  if (doc.shares.length > 0) {
    const shareRole = doc.shares[0].role;
    if (shareRole === 'EDITOR') return 'EDITOR';
    if (shareRole === 'VIEWER') return 'VIEWER';
  }

  return 'NONE';
}

export function canView(role: Role): boolean {
  return role === 'OWNER' || role === 'EDITOR' || role === 'VIEWER';
}

export function canEdit(role: Role): boolean {
  return role === 'OWNER' || role === 'EDITOR';
}

export function canDelete(role: Role): boolean {
  return role === 'OWNER';
}

export function canShare(role: Role): boolean {
  return role === 'OWNER';
}
