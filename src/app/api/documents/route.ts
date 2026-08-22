import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing x-user-id header or userId param' }, { status: 400 });
    }

    // Owned documents
    const owned = await prisma.document.findMany({
      where: { ownerId: userId },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        shares: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Shared documents
    const shares = await prisma.documentShare.findMany({
      where: { userId },
      include: {
        document: {
          include: {
            owner: { select: { id: true, name: true, email: true, avatar: true } },
            shares: {
              include: {
                user: { select: { id: true, name: true, email: true, avatar: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const shared = shares.map((s) => ({
      ...s.document,
      currentUserRole: s.role as 'EDITOR' | 'VIEWER',
    }));

    const ownedWithRole = owned.map((doc) => ({
      ...doc,
      currentUserRole: 'OWNER' as const,
    }));

    return NextResponse.json({
      owned: ownedWithRole,
      shared,
    });
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Missing x-user-id header' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const title = body.title || 'Untitled Document';
    const content = body.content || '<p>Start typing your document content here...</p>';

    const newDoc = await prisma.document.create({
      data: {
        title,
        content,
        ownerId: userId,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        shares: true,
      },
    });

    return NextResponse.json({
      ...newDoc,
      currentUserRole: 'OWNER',
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
