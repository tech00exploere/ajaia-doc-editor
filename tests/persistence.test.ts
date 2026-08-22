import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';

describe('Document Persistence', () => {
  const testUserId = 'test-user-persistence';
  const createdDocId = 'test-doc-persistence';

  beforeAll(async () => {
    // Clean up any stale records from previous runs
    await prisma.documentShare.deleteMany({ where: { documentId: createdDocId } });
    await prisma.document.deleteMany({ where: { id: createdDocId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });

    // Create temporary test user
    await prisma.user.create({
      data: {
        id: testUserId,
        name: 'Test Persistence User',
        email: 'persistence@test.com',
      },
    });
  });

  afterAll(async () => {
    await prisma.documentShare.deleteMany({ where: { documentId: createdDocId } });
    await prisma.document.deleteMany({ where: { id: createdDocId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  it('should create and retrieve a document with formatted HTML content', async () => {
    const doc = await prisma.document.create({
      data: {
        id: createdDocId,
        title: 'Persistence Test Doc',
        content: '<h1>Title</h1><p>Test content with <strong>bold</strong> text.</p>',
        ownerId: testUserId,
      },
    });

    const fetched = await prisma.document.findUnique({
      where: { id: createdDocId },
    });

    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe('Persistence Test Doc');
    expect(fetched?.content).toContain('<strong>bold</strong>');
  });

  it('should update document title and content and persist changes', async () => {
    await prisma.document.update({
      where: { id: createdDocId },
      data: {
        title: 'Updated Title',
        content: '<p>Updated content</p>',
      },
    });

    const fetched = await prisma.document.findUnique({
      where: { id: createdDocId },
    });

    expect(fetched?.title).toBe('Updated Title');
    expect(fetched?.content).toBe('<p>Updated content</p>');
  });
});
