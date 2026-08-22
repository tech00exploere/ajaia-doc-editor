import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { getUserDocumentRole } from '../src/lib/permissions';

describe('Document Sharing & Revocation Access Flow', () => {
  let ownerId: string;
  let collaboratorId: string;
  let docId: string;

  beforeAll(async () => {
    const owner = await prisma.user.create({
      data: {
        id: 'test-owner-sharing',
        name: 'Sharing Owner',
        email: 'owner-sharing@test.com',
      },
    });
    ownerId = owner.id;

    const collab = await prisma.user.create({
      data: {
        id: 'test-collab-sharing',
        name: 'Sharing Collaborator',
        email: 'collab-sharing@test.com',
      },
    });
    collaboratorId = collab.id;

    const doc = await prisma.document.create({
      data: {
        title: 'Shared Test Doc',
        content: '<p>Content</p>',
        ownerId: ownerId,
      },
    });
    docId = doc.id;
  });

  afterAll(async () => {
    if (docId) {
      await prisma.documentShare.deleteMany({ where: { documentId: docId } });
      await prisma.document.deleteMany({ where: { id: docId } });
    }
    if (ownerId || collaboratorId) {
      await prisma.user.deleteMany({
        where: { id: { in: [ownerId, collaboratorId] } },
      });
    }
  });

  it('collaborator has NONE role before sharing', async () => {
    const role = await getUserDocumentRole(docId, collaboratorId);
    expect(role).toBe('NONE');
  });

  it('owner can grant VIEWER role to collaborator', async () => {
    await prisma.documentShare.create({
      data: {
        documentId: docId,
        userId: collaboratorId,
        role: 'VIEWER',
      },
    });

    const role = await getUserDocumentRole(docId, collaboratorId);
    expect(role).toBe('VIEWER');
  });

  it('owner can upgrade collaborator to EDITOR role via upsert', async () => {
    await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: docId,
          userId: collaboratorId,
        },
      },
      update: { role: 'EDITOR' },
      create: { documentId: docId, userId: collaboratorId, role: 'EDITOR' },
    });

    const role = await getUserDocumentRole(docId, collaboratorId);
    expect(role).toBe('EDITOR');
  });

  it('owner can revoke access, reverting role to NONE', async () => {
    await prisma.documentShare.deleteMany({
      where: {
        documentId: docId,
        userId: collaboratorId,
      },
    });

    const role = await getUserDocumentRole(docId, collaboratorId);
    expect(role).toBe('NONE');
  });
});
