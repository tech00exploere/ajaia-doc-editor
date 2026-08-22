# AI-Native Workflow & Acceleration Note

**Candidate:** Priyanshu (`priyanshu2507.rjs@gmail.com`)  
**Project:** Ajaia Collaborative Document Editor  

---

## 1. AI Tools Utilized

- **Antigravity Coding Assistant** (Powered by Gemini 3.6 Flash High)
- **Node.js & Prisma CLI** for automated schema push and database seeding
- **Vitest** for automated test execution

---

## 2. Where AI Materially Accelerated Delivery

1. **Scaffolding Repetitive Boilerplate (3x Speedup):**
   - Generated initial TypeScript interfaces for `User`, `Document`, `DocumentShare`, and `Role`.
   - Rapidly scaffolded Tailwind CSS layout components (`Navbar`, `ShareModal`, `FileUploadModal`).

2. **Prisma Schema & Relational Modeling (2x Speedup):**
   - Assisted in defining the `User`, `Document`, and `DocumentShare` models with relations and cascade deletions.

3. **Parser Integration Strategy:**
   - Suggested clean library choices (`mammoth` for DOCX buffer parsing and `marked` for Markdown rendering).

4. **Automated Test Suite Generation:**
   - Standardized Vitest test cases for server-side permission matrices and file parsing functions.

---

## 3. Critical Critique: AI Output Modified or Rejected

To maintain high engineering standards, AI suggestions were subjected to rigorous review and modified whenever they compromised security, UX, or architectural clarity:

### ❌ Rejection 1: Client-Side Only Permission Checks
- **AI Suggestion:** An initial AI proposal handled authorization by simply disabling the edit button in the React UI based on a client-side boolean state.
- **Why Rejected:** UI toggles alone do not constitute authorization. A malicious client could easily bypass UI state and issue direct `PUT` or `DELETE` HTTP calls to the backend.
- **Engineering Fix:** Refactored authorization into a centralized server-side permission module (`src/lib/permissions.ts`). All API handlers (`GET`, `PUT`, `DELETE`, `POST /share`) query database role mappings and return explicit **403 Forbidden** errors when unauthorized access is attempted.

### ❌ Rejection 2: Complex "Insert into Active Draft" Upload Flow
- **AI Suggestion:** AI suggested an inline file importer that merged uploaded `.docx` HTML directly into an existing active TipTap editor instance.
- **Why Rejected:** Merging arbitrary HTML trees into an active editor state introduced edge-case risks (unclosed tags, style leaks, undo history pollution).
- **Engineering Fix:** Simplified the file upload workflow: Upload file $\rightarrow$ Parse to normalized HTML $\rightarrow$ Create new persistent document owned by active user $\rightarrow$ Open in editor.

### ❌ Rejection 3: Incomplete Relational Schema
- **AI Suggestion:** Initial draft Prisma schema omitted unique constraints on user sharing records.
- **Why Rejected:** Allowed duplicate `DocumentShare` entries for the same user-document pair.
- **Engineering Fix:** Added explicit `@@unique([documentId, userId])` to the `DocumentShare` model and utilized Prisma's `upsert` API to safely toggle user roles.

---

## 4. Verification & Reliability Methodology

To ensure high implementation quality, all generated components were verified using a multi-tiered approach:

1. **Automated Verification:** Executed `npx vitest run` covering permission matrices, parser outputs, DB persistence, and sharing revocation.
2. **TypeScript Strictness:** Strict type checks enforced zero `any` leaks in core permission logic.
3. **Manual Session Verification:** Tested end-to-end user flows by logging in as Alice (Owner), Bob (Editor), and Charlie (Viewer) to verify read-only states, 403 API responses, and debounced auto-saves.
