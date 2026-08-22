import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserDocumentRole, canShare } from '@/lib/permissions';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Missing x-user-id header' }, { status: 401 });
    }

    const docId = params.id;
    const role = await getUserDocumentRole(docId, userId);

    if (!canShare(role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only the document owner can manage sharing permissions.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { targetUserId, role: shareRole } = body;

    if (!targetUserId || !['EDITOR', 'VIEWER'].includes(shareRole)) {
      return NextResponse.json(
        { error: 'Invalid request body. Requires targetUserId and role ("EDITOR" or "VIEWER")' },
        { status: 400 }
      );
    }

    // Check target user exists
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Prevent owner from sharing with self
    const doc = await prisma.document.findUnique({ where: { id: docId } });
    if (doc?.ownerId === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot share document with its owner' },
        { status: 400 }
      );
    }

    // Upsert share record with @@unique([documentId, userId])
    const share = await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: docId,
          userId: targetUserId,
        },
      },
      update: {
        role: shareRole,
      },
      create: {
        documentId: docId,
        userId: targetUserId,
        role: shareRole,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    return NextResponse.json(share);
  } catch (error) {
    console.error('Failed to share document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Missing x-user-id header' }, { status: 401 });
    }

    const docId = params.id;
    const role = await getUserDocumentRole(docId, userId);

    if (!canShare(role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only the document owner can revoke access.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 });
    }

    await prisma.documentShare.deleteMany({
      where: {
        documentId: docId,
        userId: targetUserId,
      },
    });

    return NextResponse.json({ message: 'Access revoked successfully' });
  } catch (error) {
    console.error('Failed to revoke access:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
