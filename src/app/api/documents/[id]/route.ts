import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserDocumentRole, canView, canEdit, canDelete } from '@/lib/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing x-user-id header' }, { status: 401 });
    }

    const docId = params.id;
    const role = await getUserDocumentRole(docId, userId);

    if (!canView(role)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to view this document.' },
        { status: 403 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id: docId },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        shares: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...document,
      currentUserRole: role,
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
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

    if (!canEdit(role)) {
      return NextResponse.json(
        { error: 'Forbidden: You have Viewer access (read-only) and cannot modify this document.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData: { title?: string; content?: string } = {};

    if (typeof body.title === 'string') {
      updateData.title = body.title;
    }
    if (typeof body.content === 'string') {
      updateData.content = body.content;
    }

    const updatedDocument = await prisma.document.update({
      where: { id: docId },
      data: updateData,
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        shares: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });

    return NextResponse.json({
      ...updatedDocument,
      currentUserRole: role,
    });
  } catch (error) {
    console.error('Error updating document:', error);
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

    if (!canDelete(role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only the document owner can delete this document.' },
        { status: 403 }
      );
    }

    await prisma.document.delete({
      where: { id: docId },
    });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
