import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseFileToHtml } from '@/lib/fileParser';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Missing x-user-id header' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { title, html } = await parseFileToHtml(buffer, file.name);

    const document = await prisma.document.create({
      data: {
        title,
        content: html,
        ownerId: userId,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        shares: true,
      },
    });

    return NextResponse.json({
      ...document,
      currentUserRole: 'OWNER',
    }, { status: 201 });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process file upload' },
      { status: 400 }
    );
  }
}
