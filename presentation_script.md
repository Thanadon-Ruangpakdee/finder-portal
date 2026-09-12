# 📽️ 10-Minute Video Presentation Script - Finder Portal (Project 01)

> **Course:** CSX4110 Business Application Development  
> **Target Video Length:** 9:30 - 10:00 Minutes  
> **Format:** Live Code Walkthrough + Screen Recording + System Demo  
> **Team:** Thanadon Ruangpakdee, Kitirat Pisithaporn, Thanakrit Kodklangdon  

---

## ⏱️ Video Timeline & Scene Breakdown

### Scene 1: Introduction & Problem Statement (0:00 - 1:30)
- **Speaker:** Student 1 (Thanadon)
- **Visual:** Title Slide & Finder Portal Live Home Screen (`https://your-domain.com/project`)
- **Script Outline:**
  > "Hello everyone and Welcome to our presentation of **Finder Portal**, a comprehensive lost and found backend system tailored for Assumption University.
  > Across campus, hundreds of personal items like laptops, student IDs, and keys are misplaced every week. Currently, students have to visit multiple security offices or check informal social media posts.
  > To solve this, we built Finder Portal—a secure, multi-role web platform that automates item reporting, leverages AI for categorization, and integrates with existing campus systems."

---

### Scene 2: Architecture & Security Overview (1:30 - 3:30)
- **Speaker:** Student 2 (Kitirat)
- **Visual:** Architecture Diagram + VS Code displaying `backend/src/config/vault.ts` & `schema.prisma`
- **Script Outline:**
  > "Let's examine our system architecture and security foundations.
  > 1. **Prisma ORM & Relational Schema:** We designed a normalized database schema in Prisma covering Users, Lost/Found Items, Claims, and AI Match pairs.
  > 2. **Azure Key Vault Integration (`vault.ts`):** In accordance with course requirements, our production backend does not rely on local `.env` files for secrets. Instead, at startup, our `initConfig()` module authenticates with Azure Key Vault using `@azure/keyvault-secrets` and dynamically fetches runtime secrets like `DATABASE_URL` and `JWT_SECRET`.
  > 3. **University Active Directory SSO:** We implement OIDC authentication where user claims map directly to Role-Based Access Control (RBAC)—granting Student, Teacher, or Admin rights based on university domain credentials."

---

### Scene 3: Live Application Walkthrough & AI Features (3:30 - 6:00)
- **Speaker:** Student 1 & Student 3 (Thanakrit)
- **Visual:** Screen recording showing Active Directory login, Item Reporting, and AI Auto-Tagging
- **Script Outline:**
  > "Now let's jump into the live system demo.
  > First, we log in using our Microsoft AD account as a Student. When we submit a new Found Item—for instance, a black leather wallet left at CL Building—our backend routes the description through the **Google Gemini AI API**.
  > Gemini automatically identifies key features, extracts tags like `wallet`, `leather`, `black`, `CL_Building`, and assigns the correct category without requiring manual input.
  > Furthermore, our background **AI Matcher Engine** calculates similarity scores between new Found items and unresolved Lost reports, immediately alerting staff when a match probability exceeds 35%."

---

### Scene 4: Peer API Service-to-Service Integration (6:00 - 8:00)
- **Speaker:** Student 3 (Thanakrit)
- **Visual:** VS Code displaying `peerController.ts` + Postman / UI Peer Explorer Tab
- **Script Outline:**
  > "One of the most powerful requirements of this project is the **Service-to-Service Peer API** with our partner team, **SpaceReserve** (the Campus Room Booking system).
  > 1. **Exposed Endpoint:** We expose `GET /api/v1/peer/items` protected via a static `x-api-key`. When SpaceReserve users check into a classroom, their backend queries our endpoint to check if any lost items were recently logged in that room.
  > 2. **Consumed Endpoint:** Conversely, when a teacher verifies a lost item claim in Finder Portal, our backend issues an authenticated GET request to SpaceReserve's API to fetch active room bookings at that exact timestamp, identifying who occupied the room when the item was lost."

---

### Scene 5: VPS Deployment, Nginx & Conclusion (8:00 - 9:50)
- **Speaker:** All Team Members
- **Visual:** Terminal showing `docker-compose up`, Nginx SSL config, and Summary Slide
- **Script Outline:**
  > "Finally, our production environment is fully automated using Docker Compose. We run a Node.js backend container, PostgreSQL database container, and Nginx reverse proxy exposed under the designated URL `/project` with Let's Encrypt SSL certificates.
  > In conclusion, Finder Portal fulfills all 11 core course requirements—delivering a secure, AI-powered, production-grade backend system for Assumption University.
  > Thank you for your time!"
