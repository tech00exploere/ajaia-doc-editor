const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with Indian user data...');

  // Clean existing data
  await prisma.documentShare.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed Indian Users
  const priyanshu = await prisma.user.create({
    data: {
      id: 'user-priyanshu',
      name: 'Priyanshu Sharma',
      email: 'priyanshu@ajaia.in',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const aarav = await prisma.user.create({
    data: {
      id: 'user-aarav',
      name: 'Aarav Patel',
      email: 'aarav@ajaia.in',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const ananya = await prisma.user.create({
    data: {
      id: 'user-ananya',
      name: 'Ananya Verma',
      email: 'ananya@ajaia.in',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  // Seed Indian Product Documents
  const doc1 = await prisma.document.create({
    data: {
      id: 'doc-india-roadmap',
      title: 'Ajaia India Q3 Tech Roadmap & Product Architecture',
      content: `
        <h1>Ajaia India Q3 Tech Roadmap & Product Architecture</h1>
        <p>Welcome to the collaborative document editor prototype built for <strong>Ajaia LLC</strong> (Bangalore Tech Centre).</p>
        <h2>Key Objectives & Deliverables</h2>
        <ul>
          <li><strong>UPI & Digital Payments Integration:</strong> Real-time checkout architecture for Indian merchants.</li>
          <li><strong>Document Creation & Editing:</strong> Rich text support (bold, italic, underline, lists, headings).</li>
          <li><strong>File Import Engine:</strong> Import <em>.txt</em>, <em>.md</em>, and <em>.docx</em> files directly into documents.</li>
          <li><strong>Server Access Control:</strong> Granular <u>Owner</u>, <u>Editor</u>, and <u>Viewer</u> server-enforced permissions.</li>
        </ul>
        <h2>Q3 Engineering Milestones</h2>
        <ol>
          <li>Server-side authorization layer with 100% Vitest test coverage.</li>
          <li>Debounced auto-saving with visual persistence feedback.</li>
          <li>Responsive touch-friendly UI for mobile and tablet users across India.</li>
        </ol>
      `,
      ownerId: priyanshu.id,
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      id: 'doc-bengaluru-specs',
      title: 'Bengaluru AI Research Lab Architecture Notes',
      content: `
        <h1>Bengaluru AI Research Lab Notes</h1>
        <p>This document is owned by <strong>Priyanshu Sharma</strong> and is private.</p>
        <p>Other users attempting to view or edit this via API will receive a <strong>403 Forbidden</strong> response.</p>
      `,
      ownerId: priyanshu.id,
    },
  });

  const doc3 = await prisma.document.create({
    data: {
      id: 'doc-upi-design',
      title: 'UPI & Merchant Portal UI Specs',
      content: `
        <h1>UPI & Merchant Portal UI Specs</h1>
        <p>Created by <strong>Aarav Patel</strong>. Shared with Priyanshu Sharma with <strong>Editor</strong> permissions.</p>
        <h2>User Feedback Highlights</h2>
        <ul>
          <li>Responsive mobile layouts are crucial for Indian tier-1 and tier-2 city users.</li>
          <li>Real-time auto-save indicator builds trust in persistence.</li>
        </ul>
      `,
      ownerId: aarav.id,
    },
  });

  // Seed Document Shares
  // doc1 (Roadmap): Shared with Aarav (Editor), Ananya (Viewer)
  await prisma.documentShare.create({
    data: {
      documentId: doc1.id,
      userId: aarav.id,
      role: 'EDITOR',
    },
  });

  await prisma.documentShare.create({
    data: {
      documentId: doc1.id,
      userId: ananya.id,
      role: 'VIEWER',
    },
  });

  // doc3 (UPI Specs): Shared with Priyanshu (Editor)
  await prisma.documentShare.create({
    data: {
      documentId: doc3.id,
      userId: priyanshu.id,
      role: 'EDITOR',
    },
  });

  console.log('Seeding completed with Indian localized data successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
