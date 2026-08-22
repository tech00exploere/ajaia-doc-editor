# Ajaia Docs — AI-Native Collaborative Document Editor (India Workspace)

A lightweight, high-performance collaborative document editor inspired by Google Docs, localized for Indian product teams and built for the **Ajaia LLC AI-Native Full Stack Developer Assignment**.

**Candidate:** Priyanshu  
**Email:** priyanshu2507.rjs@gmail.com  
**GitHub Repository:** [https://github.com/tech00exploere/ajaia-doc-editor](https://github.com/tech00exploere/ajaia-doc-editor)  
**Local Dev URL:** [http://localhost:3000](http://localhost:3000)  

---

## 🇮🇳 Seeded Test Accounts (Indian Localization)

| Name | Email | Role in Demo |
| :--- | :--- | :--- |
| **Priyanshu Sharma** | `priyanshu@ajaia.in` | Primary document owner & engineering lead |
| **Aarav Patel** | `aarav@ajaia.in` | Product Manager / Collaborator (Editor) |
| **Ananya Verma** | `ananya@ajaia.in` | Guest Reviewer / QA (Viewer) |

Switch between these users instantly using the top navigation dropdown to test server-enforced access boundaries!

---

## 🌟 Core Product Capabilities

1. **Rich-Text Document Creation & Responsive Editing**
   - Headings (H1, H2), Bold (`Ctrl+B`), Italic (`Ctrl+I`), Underline (`Ctrl+U`), Bulleted & Numbered Lists, Undo/Redo.
   - Built on `@tiptap/react` with normalized HTML output.
   - Live debounced auto-save (1s debounce) with real-time status indicators (`All changes saved`, `Saving...`, `Unsaved changes`).
   - 100% responsive across mobile, tablet, and desktop screens with horizontal scrollable formatting bar.

2. **File Import Engine (.txt, .md, .docx)**
   - Upload plain text (`.txt`), Markdown (`.md`), or Microsoft Word (`.docx`) files.
   - Converts uploaded content into formatted HTML using `marked` (Markdown) and `mammoth` (Word DOCX).
   - Automatically creates a new editable document owned by the active user.

3. **Multi-User Sharing & RBAC Access Matrix**
   - Server-side authorization layer (`lib/permissions.ts`) enforcing **OWNER**, **EDITOR**, **VIEWER**, and **NONE** roles.
   - **Owner:** Full rights (Edit, Rename, Delete, Share, Revoke).
   - **Editor:** Read and edit document content.
   - **Viewer:** Read-only access. Toolbar disabled and server API rejects `PUT` requests with `403 Forbidden`.
   - **Unique Database Constraint:** `@@unique([documentId, userId])` prevents duplicate shares.

4. **Simulated Auth & Seeded Demo Session**
   > [!NOTE]
   > For assignment simplicity, authentication is simulated using seeded accounts and a user switcher in the navigation bar. In production, this would be replaced with a proper authentication provider/session system (e.g. NextAuth, Clerk, Supabase Auth).

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18+ or v20+ (v22.18.0 recommended)
- **npm**: v9+ or v10+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/tech00exploere/ajaia-doc-editor.git
cd ajaia-doc-editor
npm install
```

### 2. Setup SQLite Database & Seed Data
```bash
# Push Prisma schema to SQLite database (prisma/dev.db)
npx prisma db push

# Seed demo users (Priyanshu, Aarav, Ananya) and demo documents
npm run prisma:seed
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Automated Test Suite

We use **Vitest** to verify critical business logic including permissions, file import parsers, document persistence, and sharing flows:

```bash
npm test
```

### Test Suite Structure:
- `tests/permissions.test.ts`: Validates server-side RBAC matrix (OWNER, EDITOR, VIEWER, NONE).
- `tests/fileParser.test.ts`: Verifies `.txt`, `.md`, and `.docx` buffer parsing into HTML.
- `tests/persistence.test.ts`: Tests database creation, update, and retrieval persistence.
- `tests/sharing.test.ts`: Tests granting and revoking collaborator permissions.
