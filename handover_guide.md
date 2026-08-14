# 🔎 Finder Portal - Lost & Found Campus Project (Handover Guide)

This document is prepared as a handover guide for collaborators and AI assistants (e.g., Claude) to understand the project structure, features, current status, and development commands to resume work immediately.

---

## 🌟 1. Project Overview & Scope
**Finder Portal** is an intelligent Lost & Found application tailored for **Assumption University (AU/ABAC)**. It connects campus members, teachers, and admins to report lost/found items and verify ownership.

### Key Integrated Features:
1. **Role-Based Access Control (RBAC):** Users are logged in via a simulated **Microsoft Active Directory (AD)** Single Sign-On (SSO) screen. Pattern matching on university emails automatically sets user roles:
   - **Student:** Can browse items, report lost/found items, and file claim requests.
   - **Teacher:** Can review claim requests, verify proof of ownership, approve/reject claims, and run AI Matcher utilities.
   - **Admin:** Possesses Teacher rights, can delete listings, and manage user roles in the runtime DB via a dedicated **Permissions Directory**.
2. **Google Gemini AI Integration:**
   - **Auto-Categorizer & Tagging:** Automatically classifies found items into appropriate categories and extracts keywords on report submission.
   - **AI Matcher Engine:** Computes similarity scores (%) between active Lost reports and Found items to help Teachers find matches.
3. **Bilateral Peer API Services (SpaceReserve Integration):**
   - **Expose:** Exposes `GET /api/v1/peer/items` secured with an `x-api-key` header so the Room Booking group (SpaceReserve) can query items found in classrooms.
   - **Consume:** In the UI, teachers can query SpaceReserve's API to fetch the booking schedule for a specific room and time, revealing which student occupied the room when a item was forgotten.
4. **Interactive Settings & Custom Profile:**
   - Features a **Settings Page** allowing users to adjust display names, toggle Day/Night theme modes, review active session tokens, and randomize digital avatars or upload custom profile pictures (Base64 file uploader supporting up to **10MB** limits).

---

## 🛠️ 2. Tech Stack & Architecture
- **Frontend:** React, Vite, Vanilla CSS (Outfit & Plus Jakarta Sans typography, sleek SaaS B2B dashboard theme).
- **Backend:** Node.js (TypeScript), Express.
- **Database:** SQLite managed via **Prisma ORM** (relational schemas, relations, migrations).
- **Icons:** SVG-based modular icon components (`Icons.jsx`).

---

## 🚀 3. How to Run and Develop Locally

### Prerequisites:
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Step-by-Step Setup:

1. **Clone & Enter Folder:**
   ```bash
   git clone https://github.com/Thanadon-Ruangpakdee/finder-portal.git
   cd finder-portal
   ```

2. **Configure and Run Backend API:**
   ```bash
   cd backend
   npm install
   
   # Setup and seed local SQLite Database
   npx prisma generate
   npm run prisma:seed
   
   # Start backend development server (Runs on http://localhost:5001)
   npm run dev
   ```

3. **Configure and Run Frontend Web App:**
   Open a new terminal window at the project root:
   ```bash
   cd frontend
   npm install
   
   # Start Vite dev server (Runs on http://localhost:5173)
   npm run dev
   ```

---

## 🔑 4. Active Directory Mock Accounts
Use these simulated university accounts on the login SSO tab to test different roles (password can be any text, e.g., `password123`):

| Role | Email Address | Description / UI Features |
| :--- | :--- | :--- |
| **STUDENT** | `student.thanadon@ms.au.edu` | Can report items, claim found items with proof. |
| **TEACHER** | `staff.somchai@au.edu` | Accesses Teacher claims review panel & AI Matcher. |
| **ADMIN** | `admin.system@au.edu` | Admin Dashboard, user role editor directory, delete lists. |

---

## 📂 5. Directory Layout & Key Files
- `frontend/src/App.jsx` - Root React application (tabs, conditional view routing, state hooks).
- `frontend/src/index.css` - Custom design system tokens, Day/Night theme configurations, high-contrast badges, layout structures.
- `frontend/src/components/SettingsView.jsx` - Profile editing panel, file uploaders, session states, theme selectors.
- `frontend/src/components/AiMatcher.jsx` - AI matching interface utilizing match scores.
- `frontend/src/components/PeerApiExplorer.jsx` - Service-to-service communication explorer with SpaceReserve APIs.
- `backend/src/controllers/` - Route controllers handling OIDC credentials (`authController.ts`), lost-found inventories (`itemController.ts`), claims management (`claimController.ts`), and Peer integrations (`peerController.ts`).
- `backend/src/config/vault.ts` - Key Vault configuration module (safeguards production database credentials/API secrets with fallback variables for local development).

---

## 📝 6. Next Steps / Tasks to Continue
If you are passing this code to an AI (like Claude) to continue developing:
1. **VPS Deployment Setup:** Configure Docker Compose on a Linux server and map Nginx reverse proxies with SSL using [vps-deploy-nginx.conf](file:///Users/friendkub/Desktop/BLACKEND/Project/vps-deploy-nginx.conf).
2. **Production Azure Key Vault Connection:** Supply real client ID credentials in `backend/src/config/vault.ts` to fetch production DB strings dynamically.
3. **Database Adaptation:** Update `prisma/schema.prisma` and database URLs to switch from local SQLite `dev.db` to production PostgreSQL/MySQL when deploying.
