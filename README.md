# 🔍 FinderPortal — AU Campus Lost & Found System

> **FinderPortal** คือระบบบริหารจัดการของหายและของที่เก็บได้ประจำมหาวิทยาลัยอัสสัมชัญ (Assumption University — ABAC) ที่ช่วยให้นักศึกษา อาจารย์ และเจ้าหน้าที่แจ้งของหาย/ของที่พบได้อย่างสะดวกรวดเร็ว ปลอดภัย และมีประสิทธิภาพสูง ด้วยเทคโนโลยี **Google Gemini AI** และระบบยืนยันตัวตน **Microsoft Active Directory (AD SSO)**

---

## 👥 Team Members (รายชื่อสมาชิกผู้จัดทำ)

| Student ID | Member Name | Role / Focus |
| :--- | :--- | :--- |
| **6610308** | **Thanadon Ruangpakdee** | Full-Stack Developer & UI/UX Architect |
| **6610936** | **Thanakrit Kodklangdon** | Backend Engineer & Database Systems |
| **6610387** | **Kitirat Pisithaporn** | System Integrator & DevOps |

---

## 🌟 Key Features (คุณสมบัติและฟังก์ชันหลัก)

- 🔐 **AU Microsoft Active Directory SSO & Role-Based Access Control**:
  - รองรับสิทธิ์ผู้ใช้งาน 3 สิทธิ์: **Student (นักศึกษา)**, **Teacher/Staff (อาจารย์/เจ้าหน้าที่)**, และ **Admin (ผู้ดูแลระบบ)**
  - แสดงข้อมูลผู้แจ้งและอีเมลนักศึกษาอย่างปลอดภัยเพื่อป้องกันการแอบอ้าง

- 🤖 **Gemini AI Visual Tagging & Auto-Classification**:
  - นำ **Google Gemini AI** มาช่วยวิเคราะห์รูปภาพและข้อความอธิบายของหาย/ของที่พบโดยอัตโนมัติ
  - แท็กคีย์เวิร์ด (AI Visual Tags) และคัดแยกหมวดหมู่ (Electronics, Wallets & Bags, IDs & Cards, Keys, ฯลฯ)

- 📸 **Multi-Photo Carousel & Fullscreen Lightbox Viewer**:
  - รองรับการแนบและสไลด์เลื่อนดูรูปภาพหลายรูปในประกาศเดียวกัน
  - คลิกที่รูปภาพเพื่อเปิดดูรูปขนาดใหญ่เต็มจอพร้อมเอฟเฟกต์ Glassmorphism Lightbox และปุ่มควบคุมคีย์บอร์ด (`←` / `→` / `Esc`)

- 📍 **SpaceReserve Peer API Integration**:
  - เชื่อมต่อข้อมูลกับระบบจองห้องเรียน/อาคารเพื่อตรวจสอบว่าช่วงเวลาที่ของหาย มีใครหรือคลาสไหนจองห้องนั้นอยู่

- 🛡️ **ระบบยื่นคำร้องขอรับของคืน (Proof of Ownership Claim System)**:
  - นักศึกษาที่ทำของหายสามารถยื่นหลักฐานความเป็นเจ้าของ (เช่น รหัสผ่าน, ตำหนิเฉพาะ) ผ่านระบบ
  - อาจารย์และเจ้าหน้าที่สามารถอนุมัติหรือปฏิเสธคำร้องผ่าน Staff Dashboard

- 🔔 **ระบบแจ้งเตือน "พบของชิ้นนี้แล้ว" (Did you find this lost item?)**:
  - ผู้ที่พบของในประกาศ **Lost Report** สามารถระบุตำแหน่งที่นำของไปฝากไว้ (เช่น ป้อม รปภ. ตึก CL) เพื่อส่งการแจ้งเตือนตรงถึงเจ้าของและเจ้าหน้าที่ประจำระบบ

- 📊 **การแยกหมวดหมู่สถานะที่ชัดเจน (Found, Lost, Reunited)**:
  - แยกของที่เก็บได้ (`Found Items`), ประกาศตามหาของ (`Lost Reports`), และของที่ส่งคืนเจ้าของแล้ว (`Reunited / Claimed`) ออกจากกันอย่างเป็นระบบ

---

## 📸 App Screenshots (ภาพประกอบการใช้งาน)

### 1. Main Dashboard & Filter Feed (หน้าจอหลักและระบบค้นหา)
![Browse Dashboard](docs/screenshots/browse_dashboard.png)

### 2. Item Detail Modal & Crisp Card Layout (หน้าจอรายละเอียดไอเทมและการ์ดข้อมูล)
![Item Detail Modal](docs/screenshots/item_detail_modal.png)

---

## 🛠️ Tech Stack & Architecture (เทคโนโลยีที่ใช้)

- **Frontend**: React.js (Vite), Vanilla CSS (Custom Design Tokens), Lucide Icons
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL
- **AI Integration**: Google Gemini AI API (Multimodal Vision & Text Analysis)
- **Security & Infrastructure**: Azure Key Vault, Azure Virtual Machines, Docker & Docker Compose

---

## 🚀 How to Run Locally (วิธีเปิดใช้งานในเครื่อง Local)

### Prerequisites
- **Node.js**: v18.0.0 หรือใหม่กว่า
- **npm** / **yarn**

### 1. Install Dependencies
```bash
# Clone Repository
git clone https://github.com/Thanadon-Ruangpakdee/finder-portal.git
cd finder-portal

# Install Frontend & Backend Dependencies
npm run install-all
```

### 2. Run Local Development Server
```bash
# Start Backend Server (Port 5001)
npm run dev --prefix backend

# Start Frontend Dev Server (Port 5173)
npm run dev --prefix frontend
```
เข้าใช้งานผ่านเบราว์เซอร์ได้ที่: **`http://localhost:5173/project/`**

---

## 🐳 Docker Deployment (การรันด้วย Docker)

```bash
docker compose up -d --build
```

---

© 2026 **FinderPortal Team** — Assumption University (ABAC)
