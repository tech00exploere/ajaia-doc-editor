# Submission Deliverables Manifest — Ajaia Assignment

**Candidate:** Priyanshu  
**Email:** `priyanshu2507.rjs@gmail.com`  
**Assignment:** AI-Native Full Stack Developer  
**Repository:** `ajaia-doc-editor`  
**Live Local Server:** [http://localhost:3000](http://localhost:3000)  

---

## 📦 Package Contents & File Deliverables Index

| Deliverable File | Description |
| :--- | :--- |
| **`README.md`** | Local setup, seed guide, simulated auth explanation, and test execution commands. |
| **`ARCHITECTURE.md`** | Technical architecture breakdown, RBAC matrix, Prisma relational schema, and scope tradeoff notes. |
| **`AI_WORKFLOW.md`** | AI usage breakdown, rejected outputs/corrections, and verification methodology. |
| **`SUBMISSION.md`** | Complete submission manifest and walkthrough video script. |
| **`prisma/schema.prisma`** | Database schema with `User`, `Document`, `DocumentShare` (`@@unique([documentId, userId])`). |
| **`src/lib/permissions.ts`** | Central server-side authorization layer (`OWNER`, `EDITOR`, `VIEWER`, `NONE`). |
| **`src/lib/fileParser.ts`** | Plain text, Markdown (`marked`), and Word (`mammoth`) file parsing engine. |
| **`tests/`** | 4-part Vitest test suite testing RBAC rules, file import parsers, persistence, and sharing. |

---

## 🇮🇳 Test Accounts & Demo Credentials (Indian Localization)

Authentication is simulated via the **User Switcher** dropdown in the top navigation bar.

1. **Priyanshu Sharma** (`priyanshu@ajaia.in`) — Owner of demo documents (e.g. *Ajaia India Q3 Tech Roadmap*).
2. **Aarav Patel** (`aarav@ajaia.in`) — Collaborator with `EDITOR` permissions on Priyanshu's tech roadmap document.
3. **Ananya Verma** (`ananya@ajaia.in`) — Viewer with `VIEWER` (read-only) permissions.

---

## 📹 Walkthrough Video Outline (3–5 Minute Script)

- **0:00 – 0:30 (Product & Goal Overview):** Introduce Ajaia Docs, highlighting document creation, rich-text editing, file import, persistent SQLite storage, responsive UI, and server-side permission sharing.
- **0:30 – 1:15 (Document Creation & Auto-Save):** Create a new document, apply H1 headings, bold/italic text, lists. Demonstrate 1-second debounced auto-save status (`All changes saved`) and refresh persistence.
- **1:15 – 1:50 (File Import Engine):** Import `.md` or `.docx` file using the upload modal. Demonstrate instant conversion to an editable document.
- **1:50 – 2:50 (Sharing & Server-Enforced RBAC):** 
  - As **Priyanshu Sharma (Owner)**: Share tech roadmap document with **Aarav Patel (Editor)** and **Ananya Verma (Viewer)**.
  - Switch session to **Ananya Verma (Viewer)**: Show that editor is disabled in read-only mode and attempts to send `PUT /api/documents/:id` return `403 Forbidden`.
  - Switch session to **Aarav Patel (Editor)**: Show that Aarav can edit and save changes.
- **2:50 – 3:30 (Engineering Architecture & Tests):** Showcase `prisma/schema.prisma`, `lib/permissions.ts`, and run `npm test` showing 100% passing Vitest suite.
- **3:30 – 4:00 (AI Acceleration & Tradeoffs):** Summarize how AI accelerated development, highlight rejected AI outputs (e.g. replacing client-only checks with server RBAC), and explain last-write-wins concurrency tradeoff.

---

## ⚡ Deployment & Execution Summary

- **Local Execution:**
  ```bash
  npm install
  npx prisma db push
  npm run prisma:seed
  npm run dev
  ```
- **Test Suite:**
  ```bash
  npm test
  ```
