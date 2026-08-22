# Architecture Note — Ajaia Docs

**Candidate:** Priyanshu (`priyanshu2507.rjs@gmail.com`)  
**Project:** Lightweight Collaborative Document Editor  

---

## 1. System Architecture & High-Level Flow

The application follows a clean, layered architecture separating API transport, authorization enforcement, core domain services, and database persistence.

```
                    +--------------------------------+
                    |    Next.js Client (React 18)   |
                    | (User Switcher, TipTap Editor) |
                    +---------------+----------------+
                                    | HTTP / JSON
                                    v
                    +--------------------------------+
                    |     Next.js API Layer (App)    |
                    | (/api/documents, /api/upload)  |
                    +---------------+----------------+
                                    |
                                    v
                    +--------------------------------+
                    |    Permission Engine Layer     |
                    |     (lib/permissions.ts)       |
                    +-------+----------------+-------+
                            |                |
             +--------------+                +--------------+
             |                                              |
             v                                              v
+------------------------+                     +-------------------------+
|    Document Service    |                     |     Sharing Service     |
+------------+-----------+                     +------------+------------+
             |                                              |
             +--------------+-------------------------------+
                            |
                            v
                    +--------------------------------+
                    |      Prisma ORM (SQLite)       |
                    +--------------------------------+
```

---

## 2. Server-Side Authorization Layer (RBAC)

A core engineering priority for this assignment is ensuring permissions are enforced **on the server/API layer**, rather than relying solely on client-side UI toggles.

### Role Hierarchy & Capabilities:
| Role | View Doc | Edit Content | Delete Doc | Manage Shares |
| :--- | :---: | :---: | :---: | :---: |
| **OWNER** | ✅ | ✅ | ✅ | ✅ |
| **EDITOR** | ✅ | ✅ | ❌ | ❌ |
| **VIEWER** | ✅ | ❌ (403) | ❌ (403) | ❌ (403) |
| **NONE** | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |

### API Protection Pattern (`src/app/api/documents/[id]/route.ts`):
```typescript
const role = await getUserDocumentRole(docId, userId);

if (!canEdit(role)) {
  return NextResponse.json(
    { error: 'Forbidden: You have Viewer access (read-only) and cannot modify this document.' },
    { status: 403 }
  );
}
```
If a user with **VIEWER** permissions manually sends a `PUT /api/documents/:id` HTTP request, the server evaluates their computed role and returns a **403 Forbidden** status immediately.

---

## 3. Database Design & Relational Integrity

The persistence model uses SQLite via Prisma ORM (`prisma/schema.prisma`).

```
  +--------------+         owns        +------------------+
  |     User     | ------------------->|     Document     |
  +--------------+ 1                *  +------------------+
         |                                      |
         | 1                                    | 1
         v                                      v
  +-------------------------------------------------------+
  |                    DocumentShare                      |
  |     (documentId, userId, role: "EDITOR" | "VIEWER")   |
  +-------------------------------------------------------+
  |    @@unique([documentId, userId])                      |
  +-------------------------------------------------------+
```

### Key Schema Features:
1. **Cascade Deletions:** Deleting a document automatically cleans up all associated `DocumentShare` records.
2. **Unique Share Constraint:** `@@unique([documentId, userId])` prevents the database from storing duplicate access entries for the same user-document pair. Upserts dynamically update roles between `EDITOR` and `VIEWER`.

---

## 4. File Upload & Import Pipeline

File import is implemented as a single-step, clean pipeline:

```
[ Upload File (.txt, .md, .docx) ]
                |
                v
[ File Parser (lib/fileParser.ts) ]
    ├─ .txt  ──> Wrap paragraphs in <p> tags
    ├─ .md   ──> Parse via 'marked' into HTML
    └─ .docx ──> Parse via 'mammoth' XML buffer
                |
                v
[ Normalized Clean HTML ]
                |
                v
[ DB Persisted Document ] ──> [ TipTap Rich Editor ]
```

---

## 5. Architectural Tradeoffs & Scope Decisions

### Concurrency & Conflict Resolution:
- **Decision:** Implemented **last-write-wins persistence** with 1-second debounced auto-saves.
- **Rationale:** Operational Transformation (OT) or CRDTs (e.g. Yjs / WebSockets) add significant infrastructure complexity. Documented last-write-wins provides reliable persistence within time constraints.

### Dashboard Scope Trimming:
- **Decision:** Focused strictly on core workflows (Create, Import, My Docs, Shared Docs, Delete, User Switcher).
- **Rationale:** Prioritized depth in server-side authorization, test coverage, and file handling over non-essential UI features like version history or advanced filters.

### Simulated Auth vs OAuth:
- **Decision:** Seeded 3 test accounts (Alice, Bob, Charlie) accessible via top navbar dropdown.
- **Rationale:** Simplifies reviewer testing of multi-user permission sharing without login friction.
