import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * ระบบสลับภาษา EN / TH
 *
 * วิธีใช้ในคอมโพเนนต์:
 *   import { useT } from '../language';
 *   const t = useT();
 *   <span>{t('Report Found')}</span>
 *
 * คีย์ของพจนานุกรม = ข้อความภาษาอังกฤษตรงๆ
 * ถ้าเลือกภาษาอังกฤษ จะคืนคีย์นั้นกลับไปเลย
 * ถ้าเลือกภาษาไทยแต่ยังไม่มีคำแปล จะ fallback เป็นภาษาอังกฤษ (ไม่พังแน่นอน)
 */

const TH = {
  // ---------- แถบเมนูซ้าย ----------
  'Main Menu': 'เมนูหลัก',
  'Categories': 'หมวดหมู่ของหาย',
  'Filters': 'ตัวกรอง',
  'Type': 'ประเภท',
  'Status': 'สถานะ',
  'Location': 'สถานที่',
  'Clear all filters': 'ล้างตัวกรองทั้งหมด',
  'Browse': 'ดูรายการ',
  'My Claims': 'คำร้องของฉัน',
  'Staff Dash': 'แผงอาจารย์',
  'Admin Dash': 'แผงผู้ดูแลระบบ',
  'AI Matcher': 'จับคู่ด้วย AI',
  'Settings': 'ตั้งค่า',
  'Staff': 'อาจารย์',
  'Admin': 'ผู้ดูแล',
  'Auto': 'อัตโนมัติ',
  'Peer': 'เชื่อมต่อ',
  'Open / close menu': 'เปิด/ปิดเมนู',
  'Track the status of your ownership verification claims': 'ติดตามสถานะคำร้องยื่นขอรับของคืนของคุณ',
  'No Claims Submitted Yet': 'ยังไม่มีรายการคำร้องที่ยื่น',
  'You have not submitted any ownership claims for found items yet.': 'คุณยังไม่ได้ยื่นหลักฐานแสดงความเป็นเจ้าของสำหรับสิ่งของที่พบ',
  'Submitted Proof of Ownership': 'หลักฐานที่ยื่นแสดงความเป็นเจ้าของ',
  'Claim Status': 'สถานะคำร้อง',
  'Pending Teacher Review': 'กำลังรออาจารย์ตรวจสอบ',
  'Approved - Contact Staff to Collect': 'อนุมัติแล้ว - ติดต่อรับของคืนได้ที่สาขา',
  'Claim Rejected': 'คำร้องถูกปฏิเสธ',
  'Claim Already Submitted': 'ยื่นคำร้องเรียบร้อยแล้ว',
  'Your Claim is Under Review': 'คำร้องของคุณอยู่ระหว่างการตรวจสอบ',
  'Claim Approved! Contact Staff to Collect': 'อนุมัติแล้ว - ติดต่อรับของคืนได้ที่สาขา',

  // ---------- หมวดหมู่ ----------
  'All': 'ทั้งหมด',
  'Electronics': 'อุปกรณ์อิเล็กทรอนิกส์',
  'Wallets & Bags': 'กระเป๋าสตางค์และกระเป๋า',
  'IDs & Cards': 'บัตรประจำตัวและบัตรต่างๆ',
  'Keys': 'กุญแจ',
  'Bottles & Tumblers': 'ขวดน้ำและแก้วน้ำ',
  'Books & Documents': 'หนังสือและเอกสาร',
  'Accessories': 'ของใช้เบ็ดเตล็ด',

  // ---------- สถานะ ----------
  'All Statuses': 'ทุกสถานะ',
  'Open (Unclaimed)': 'ยังไม่มีผู้มารับ',
  'Matched': 'จับคู่แล้ว',
  'Reunited / Claimed': 'คืนเจ้าของแล้ว',
  'Closed': 'ปิดเรื่องแล้ว',
  'OPEN': 'ยังไม่มีผู้รับ',
  'MATCHED': 'จับคู่แล้ว',
  'CLAIMED': 'คืนเจ้าของแล้ว',
  'CLOSED': 'ปิดเรื่องแล้ว',
  'Found': 'ของที่เจอ',
  'Lost': 'ของหาย',
  'FOUND': 'ของที่เจอ',
  'LOST': 'ของหาย',

  // ---------- สถานที่ ----------
  'All Locations': 'ทุกสถานที่',
  'Building / Campus Facility *': 'อาคาร / ตึกมหาวิทยาลัย *',
  'Room Number / Specific Area': 'เลขห้อง / บริเวณที่พบ (ระบุได้)',
  'e.g. Room 402, Room 4B, 3rd Floor Pod': 'เช่น Room 402, ห้อง 4B, โต๊ะอ่านหนังสือชั้น 3',
  'Cathedral of Learning (CL Building)': 'อาคาร Cathedral of Learning (CL)',
  'Engineering Building (VME Building)': 'อาคารวิศวกรรมศาสตร์ (VME Building)',
  'Martin de Tours Hall (MSME Building)': 'อาคาร Martin de Tours (MSME Building)',
  'Saint Gabriel\'s Hall': 'อาคาร Saint Gabriel',
  'Central Library Building': 'อาคารหอสมุดกลาง',
  'John Paul II Sports Center': 'ศูนย์กีฬา John Paul II',
  'AU Mall & Cafeteria': 'ศูนย์อาหาร AU Mall',
  'Other / Custom Building': 'ตึกอื่นๆ (ระบุเอง)',
  'Specify Custom Building': 'ระบุชื่อตึก/อาคาร',

  // ---------- แถบบน ----------
  'Search by keywords (e.g. MacBook, Wallet, Keys, Phone)...':
    'ค้นหาด้วยคำสำคัญ (เช่น MacBook, กระเป๋าสตางค์, กุญแจ, โทรศัพท์)...',
  'Clear search': 'ล้างคำค้นหา',
  'Report Found': 'แจ้งของที่เจอ',
  'Report Lost': 'แจ้งของหาย',
  'Switch to Light Mode': 'เปลี่ยนเป็นโหมดกลางวัน',
  'Switch to Dark Mode': 'เปลี่ยนเป็นโหมดกลางคืน',
  'Switch language': 'เปลี่ยนภาษา',
  'Student': 'นักศึกษา',
  'Teacher': 'อาจารย์',
  'User Account Session': 'เซสชันบัญชีผู้ใช้',
  'Authenticated via OIDC': 'ยืนยันตัวตนผ่าน OIDC',
  'Customize Profile': 'ปรับแต่งโปรไฟล์',
  'Change display name & avatar': 'เปลี่ยนชื่อที่แสดงและรูปโปรไฟล์',
  'Sign Out': 'ออกจากระบบ',
  'Clear session & return to SSO': 'ล้างเซสชันและกลับไปหน้าล็อกอิน',

  // ---------- หน้า Browse ----------
  'Assumption University (ABAC) • AI Lost & Found':
    'มหาวิทยาลัยอัสสัมชัญ (ABAC) • ระบบของหายด้วย AI',
  'Reuniting AU Students with their': 'พาของหายกลับคืนสู่',
  'Lost Belongings': 'เจ้าของตัวจริง',
  'Search Assumption University records, report found items with instant Gemini AI category tagging, or verify claims securely via Microsoft Active Directory.':
    'ค้นหาข้อมูลของหายในมหาวิทยาลัย แจ้งของที่เก็บได้พร้อมให้ Gemini AI ติดหมวดหมู่ให้ทันที และตรวจสอบคำร้องอย่างปลอดภัยผ่าน Microsoft Active Directory',
  'Items Found': 'ของที่เก็บได้',
  'Lost Reports': 'รายการแจ้งของหาย',
  'Reunited': 'คืนเจ้าของแล้ว',
  'Reset / Show All': 'ล้างตัวกรอง / ดูทั้งหมด',
  'All items': 'รายการทั้งหมด',
  'Showing': 'แสดง',
  'items across campus': 'รายการทั่วมหาวิทยาลัย',
  'No matching items found': 'ไม่พบรายการที่ตรงกัน',
  'Try adjusting your search keywords, clear category filters, or be the first to report this item!':
    'ลองเปลี่ยนคำค้นหา ล้างตัวกรองหมวดหมู่ หรือเป็นคนแรกที่แจ้งของชิ้นนี้ดูสิ',
  'Report Found Item': 'แจ้งของที่เจอ',
  'Report Lost Item': 'แจ้งของหาย',

  // ---------- การ์ดของหาย ----------
  'Found Item': 'ของที่เจอ',
  'Lost Report': 'แจ้งของหาย',
  '✓ Reunited': '✓ คืนเจ้าของแล้ว',
  'Claim Under Review': 'กำลังตรวจสอบคำร้อง',
  'By:': 'โดย:',
  'View Details': 'ดูรายละเอียด',
  'Recently': 'เมื่อเร็วๆ นี้',
  'User': 'ผู้ใช้',

  // ---------- หน้ารายละเอียดของ ----------
  '✓ Reunited with Owner': '✓ คืนเจ้าของเรียบร้อยแล้ว',
  'AI Automated Visual Tags (Gemini)': 'แท็กที่ AI วิเคราะห์ให้ (Gemini)',
  'Location Recorded': 'สถานที่ที่บันทึกไว้',
  'Date & Time': 'วันและเวลา',
  'Reported By': 'ผู้แจ้ง',
  'Campus Student': 'นักศึกษา',
  'Active Directory Auth': 'การยืนยันตัวตน Active Directory',
  'Verified AD Token': 'ตรวจสอบ AD Token แล้ว',
  'OIDC Claims Verified': 'ยืนยันข้อมูล OIDC แล้ว',
  'SpaceReserve Room Intelligence': 'ข้อมูลการจองห้องจาก SpaceReserve',
  'Query the room booking database to check who scheduled':
    'ค้นฐานข้อมูลการจองห้อง เพื่อดูว่าใครจอง',
  'at this time.': 'ในช่วงเวลานั้น',
  'Query SpaceReserve': 'ค้นหาใน SpaceReserve',
  'Teacher Status Management': 'อาจารย์: จัดการสถานะ',
  'CLAIMED (Reunited)': 'คืนเจ้าของแล้ว',
  'Is this your item?': 'ของชิ้นนี้ของคุณใช่ไหม?',
  'To prevent false claims, please provide proof of ownership (e.g. unique scratches, serial number, wallpaper, or item contents) before pickup at the security office.':
    'เพื่อป้องกันการแอบอ้าง กรุณาระบุหลักฐานความเป็นเจ้าของ (เช่น รอยขีดข่วนเฉพาะตัว หมายเลขเครื่อง ภาพพื้นหลัง หรือสิ่งของข้างใน) ก่อนไปรับที่ห้องรักษาความปลอดภัย',
  'Your Claim is Under Review': 'คำร้องของคุณอยู่ระหว่างตรวจสอบ',
  'Proof submitted:': 'หลักฐานที่ส่ง:',
  'Status:': 'สถานะ:',
  'Claim Request Submitted Successfully!': 'ส่งคำร้องเรียบร้อยแล้ว!',
  'Teacher has been notified. Check your student email for approval notifications.':
    'แจ้งอาจารย์เรียบร้อยแล้ว กรุณาตรวจอีเมลนักศึกษาเพื่อรอผลอนุมัติ',
  'Detailed Proof of Ownership': 'หลักฐานยืนยันความเป็นเจ้าของ',
  "Describe hidden details (e.g., 'Passcode lock has 6 digits', 'Sticker on the back', 'Serial number ends with 491')...":
    "ระบุรายละเอียดที่คนอื่นไม่รู้ (เช่น 'รหัสปลดล็อก 6 หลัก', 'มีสติกเกอร์ติดด้านหลัง', 'เลขเครื่องลงท้าย 491')...",
  'Submitting Claim...': 'กำลังส่งคำร้อง...',
  'Submit Claim to Security Desk': 'ส่งคำร้องไปยังฝ่ายรักษาความปลอดภัย',

  // ---------- หน้าแจ้งของ ----------
  'Report a Found Item': 'แจ้งของที่เก็บได้',
  'Report a Lost Item': 'แจ้งของหาย',
  'Log an item you picked up on campus so the owner can claim it.':
    'บันทึกของที่คุณเก็บได้ในมหาวิทยาลัย เพื่อให้เจ้าของมาติดต่อขอรับคืน',
  'Broadcast details about something you lost on campus.':
    'ประกาศรายละเอียดของที่คุณทำหายในมหาวิทยาลัย',
  'I Found Something': 'ฉันเก็บของได้',
  'I Lost Something': 'ฉันทำของหาย',
  'Google Gemini Auto-Categorization': 'Gemini AI จัดหมวดหมู่อัตโนมัติ',
  'Type your description, then click analyze to suggest categories and tags automatically.':
    'พิมพ์รายละเอียดของ แล้วกดวิเคราะห์ ระบบจะแนะนำหมวดหมู่และแท็กให้อัตโนมัติ',
  'Analyzing...': 'กำลังวิเคราะห์...',
  'Analyze with AI': 'วิเคราะห์ด้วย AI',
  'Item Name / Headline *': 'ชื่อของ / หัวข้อ *',
  'e.g. Apple MacBook Pro 14 inch or Leather Wallet':
    'เช่น Apple MacBook Pro 14 นิ้ว หรือ กระเป๋าสตางค์หนัง',
  'Category *': 'หมวดหมู่ *',
  'Location on Campus *': 'สถานที่ในมหาวิทยาลัย *',
  'Specify Custom Location': 'ระบุสถานที่เอง',
  'e.g. Student Union Hallway, 2nd floor': 'เช่น ทางเดินอาคารกิจกรรมนักศึกษา ชั้น 2',
  'Description & Identifying Characteristics *': 'รายละเอียดและลักษณะเฉพาะ *',
  'Provide accurate visual details: color, model, stickers, or condition...':
    'ระบุรายละเอียดที่มองเห็นได้: สี รุ่น สติกเกอร์ หรือสภาพของ...',
  'Photo Upload or Presets': 'อัปโหลดรูปหรือเลือกรูปตัวอย่าง',
  'Choose Image': 'เลือกรูปภาพ',
  'Remove Photo': 'ลบรูปออก',
  'Or Pick Preset:': 'หรือเลือกรูปตัวอย่าง:',
  'Cancel': 'ยกเลิก',
  'Publish': 'เผยแพร่',
  'Please enter a brief item name or description for Gemini AI to analyze.':
    'กรุณากรอกชื่อของหรือรายละเอียดคร่าวๆ ก่อน เพื่อให้ Gemini AI วิเคราะห์',

  // ---------- แผงอาจารย์ / ผู้ดูแล ----------
  'Teacher & Admin Operations Hub': 'ศูนย์จัดการสำหรับอาจารย์และผู้ดูแลระบบ',
  'Review ownership proofs submitted by students, update item inventory statuses, and oversee lost & found operations.':
    'ตรวจหลักฐานความเป็นเจ้าของที่นักศึกษาส่งมา อัปเดตสถานะของในคลัง และดูแลภาพรวมระบบของหาย',
  'Active Role:': 'สิทธิ์ปัจจุบัน:',
  'System Admin': 'ผู้ดูแลระบบ',
  'Total Logged Items': 'รายการทั้งหมดในระบบ',
  'Pending Claim Verifications': 'คำร้องรอตรวจสอบ',
  'Reunited Items': 'ของที่คืนเจ้าของแล้ว',
  'Reunion Resolution Rate': 'อัตราการคืนของสำเร็จ',
  'Pending Claim Requests Review Queue': 'คิวคำร้องที่รอตรวจสอบ',
  'Awaiting Verification': 'รอตรวจสอบ',
  'No claim verifications pending review right now.': 'ตอนนี้ยังไม่มีคำร้องที่รอตรวจสอบ',
  'Claim for:': 'คำร้องขอรับ:',
  'Submitted Proof:': 'หลักฐานที่ส่งมา:',
  'Approve & Return': 'อนุมัติและคืนของ',
  'Reject': 'ปฏิเสธ',
  'OIDC User Accounts & Role Permissions Directory': 'ทะเบียนบัญชีผู้ใช้ OIDC และสิทธิ์การเข้าถึง',
  'Users Registered': 'ผู้ใช้ในระบบ',
  'User Profile': 'โปรไฟล์ผู้ใช้',
  'ID / Username': 'รหัส / ชื่อผู้ใช้',
  'Active Directory Email': 'อีเมล Active Directory',
  'Assigned Role Permissions': 'สิทธิ์ที่กำหนด',
  'Full Campus Inventory Management': 'จัดการรายการของทั้งหมดในมหาวิทยาลัย',
  'Total Records': 'รายการทั้งหมด',
  'Item & Category': 'ชื่อของและหมวดหมู่',
  'Status Management': 'จัดการสถานะ',
  'Action': 'จัดการ',
  'Delete record (Admin only)': 'ลบรายการ (เฉพาะผู้ดูแล)',
  'Failed to update role: ': 'เปลี่ยนสิทธิ์ไม่สำเร็จ: ',

  // ---------- AI Matcher ----------
  'Google Gemini Semantic & Visual Matchmaker': 'Gemini AI จับคู่จากความหมายและภาพ',
  'AI Lost ⇄ Found': 'AI จับคู่ของหาย ⇄ ของเจอ',
  'Automated Match Engine': 'ระบบจับคู่อัตโนมัติ',
  'The system continuously compares embeddings, keywords, visual descriptions, and campus location timestamps to discover lost & found pairings automatically.':
    'ระบบเปรียบเทียบคำสำคัญ คำบรรยายลักษณะ และเวลาสถานที่ในมหาวิทยาลัยอย่างต่อเนื่อง เพื่อค้นหาคู่ของหาย–ของเจอโดยอัตโนมัติ',
  'No Pending Pairings Discovered': 'ยังไม่พบคู่ที่รอตรวจสอบ',
  'All current lost reports and found items have been cross-checked. As new reports are submitted, Gemini AI will automatically scan for matching pairs.':
    'ตรวจสอบรายการของหายและของที่เจอทั้งหมดแล้ว เมื่อมีการแจ้งรายการใหม่ Gemini AI จะสแกนหาคู่ที่ตรงกันให้อัตโนมัติ',
  'Match Probability': 'ความน่าจะเป็นที่ตรงกัน',
  '✓ Match Confirmed': '✓ ยืนยันการจับคู่แล้ว',
  'Needs Staff Verification': 'รออาจารย์ตรวจสอบ',
  'By': 'โดย',
  'Matching Tokens:': 'คำที่ตรงกัน:',
  'Inspect Found Item': 'ดูของที่เจอ',
  'Confirm Match & Notify Owner': 'ยืนยันการจับคู่และแจ้งเจ้าของ',
  'Matched Pair Linked': 'เชื่อมคู่เรียบร้อยแล้ว',

  // ---------- SpaceReserve Peer API ----------
  'Service-to-Service Peer API Architecture': 'สถาปัตยกรรม Peer API ระหว่างระบบ',
  'API Integration': 'การเชื่อมต่อ API',
  'Outgoing Request Configuration': 'ตั้งค่าคำขอที่ส่งออกไป',
  'Select Room to Inquire *': 'เลือกห้องที่ต้องการสอบถาม *',
  'Timestamp of Discovery': 'วันเวลาที่พบของ',
  'SpaceReserve Authentication Header:': 'Header ยืนยันตัวตนของ SpaceReserve:',
  'Executing Peer Query...': 'กำลังส่งคำขอ...',
  'Send Request to SpaceReserve': 'ส่งคำขอไปยัง SpaceReserve',
  'SpaceReserve Response Payload': 'ข้อมูลที่ SpaceReserve ตอบกลับ',
  'Owner Lead Discovered:': 'พบเบาะแสเจ้าของ:',
  'Awaiting Execution': 'รอการส่งคำขอ',
  'Exposed Endpoint Simulator': 'จำลองการเรียก API ฝั่งเรา',
  'Static API Key (Header: x-api-key) *': 'API Key (ส่งผ่าน Header: x-api-key) *',
  'Valid Key issued to SpaceReserve:': 'คีย์ที่ออกให้ SpaceReserve:',
  'Query Room Parameter (?location=) *': 'พารามิเตอร์ห้องที่ค้นหา (?location=) *',
  'Processing Request...': 'กำลังประมวลผล...',
  'Simulate SpaceReserve Request': 'จำลองคำขอจาก SpaceReserve',
  'Finder Portal JSON Output': 'ผลลัพธ์ JSON จาก Finder Portal',
  'Awaiting Incoming Request': 'รอคำขอเข้ามา',

  // ---------- ตั้งค่า / โปรไฟล์ ----------
  'System & Account Settings': 'ตั้งค่าระบบและบัญชีผู้ใช้',
  'Manage your profile identity, appearance preferences, and Active Directory session status.':
    'จัดการข้อมูลโปรไฟล์ การแสดงผล และสถานะเซสชัน Active Directory ของคุณ',
  'Profile Customization': 'ปรับแต่งโปรไฟล์',
  'Customize Profile Settings': 'ปรับแต่งการตั้งค่าโปรไฟล์',
  'Generated Avatar': 'อวตารที่ระบบสร้าง',
  'Custom Photo': 'รูปของตัวเอง',
  'Display Name': 'ชื่อที่แสดง',
  'Your full name': 'ชื่อ-นามสกุลของคุณ',
  '🎲 Randomize Generated Character': '🎲 สุ่มตัวละครใหม่',
  'Upload Custom Profile Photo': 'อัปโหลดรูปโปรไฟล์',
  '✓ Photo selected successfully': '✓ เลือกรูปแล้ว',
  'Select a photo from your local files': 'เลือกรูปจากเครื่องของคุณ',
  '✕ Clear selected photo': '✕ ล้างรูปที่เลือก',
  'Saving Profile Updates...': 'กำลังบันทึก...',
  '✓ Save Changes': '✓ บันทึกการเปลี่ยนแปลง',
  'Appearance Theme': 'ธีมการแสดงผล',
  'Switch to Day Mode': 'เปลี่ยนเป็นโหมดกลางวัน',
  'Switch to Night Mode': 'เปลี่ยนเป็นโหมดกลางคืน',
  'AD Security Session': 'เซสชันความปลอดภัย AD',
  'Email Address': 'ที่อยู่อีเมล',
  'Assigned Access Role': 'สิทธิ์การเข้าถึง',
  'Sign Out from Session': 'ออกจากระบบ',
  'Name field cannot be blank.': 'กรุณากรอกชื่อ',
  'Failed to update profile.': 'อัปเดตโปรไฟล์ไม่สำเร็จ',
  'Language': 'ภาษา',

  // ---------- หน้าล็อกอิน ----------
  'Assumption University': 'มหาวิทยาลัยอัสสัมชัญ',
  'OIDC Single Sign-On (SSO)': 'เข้าสู่ระบบด้วย OIDC (SSO)',
  'Sign In': 'เข้าสู่ระบบ',
  'Register / Sign Up': 'สมัครสมาชิก',
  'University Email Address': 'อีเมลมหาวิทยาลัย',
  'Password': 'รหัสผ่าน',
  'Full Name': 'ชื่อ-นามสกุล',
  'e.g. Thanadon Ruangpakdee': 'เช่น ธนดล เรืองภักดี',
  'Connecting to Microsoft Azure AD...': 'กำลังเชื่อมต่อ Microsoft Azure AD...',
  'Sign In with Microsoft AD': 'เข้าสู่ระบบด้วย Microsoft AD',
  'Creating OIDC Profile...': 'กำลังสร้างโปรไฟล์ OIDC...',
  'Create Account & Sign In': 'สร้างบัญชีและเข้าสู่ระบบ',
  'Customize Profile Image': 'ปรับแต่งรูปโปรไฟล์',
  'Avatar': 'อวตาร',
  'Photo': 'รูปถ่าย',
  'Avatar seed': 'รหัสสุ่มอวตาร',
  '🎲 Random': '🎲 สุ่ม',
  '✓ Photo selected': '✓ เลือกรูปแล้ว',
  'Select local photo': 'เลือกรูปจากเครื่อง',
  'Or Quick Dev-Login Presets': 'หรือเข้าสู่ระบบด่วนสำหรับทดสอบ',
  'Please fill in email and password.': 'กรุณากรอกอีเมลและรหัสผ่าน',
  'Please fill in all registration fields.': 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
  'Please use a valid Assumption University email (@au.edu or @ms.au.edu).':
    'กรุณาใช้อีเมลของมหาวิทยาลัยอัสสัมชัญ (@au.edu หรือ @ms.au.edu)',
  'SSO authentication failed.': 'เข้าสู่ระบบผ่าน SSO ไม่สำเร็จ',
  'AD SSO authentication failed.': 'เข้าสู่ระบบผ่าน AD SSO ไม่สำเร็จ',
  'Failed to create student account.': 'สร้างบัญชีนักศึกษาไม่สำเร็จ',

  // ---------- สถานะคำร้อง / สิทธิ์ ----------
  'PENDING': 'รอตรวจสอบ',
  'APPROVED': 'อนุมัติแล้ว',
  'REJECTED': 'ปฏิเสธแล้ว',
  'STUDENT': 'นักศึกษา',
  'TEACHER': 'อาจารย์',
  'ADMIN': 'ผู้ดูแลระบบ',

  // ---------- ข้อความแจ้งเตือน ----------
  'Claim approved for': 'อนุมัติคำร้องของ',
  'Item marked as Reunited.': 'เปลี่ยนสถานะเป็นคืนเจ้าของแล้ว',
  'Claim rejected for': 'ปฏิเสธคำร้องของ',
  'Notification sent.': 'ส่งการแจ้งเตือนแล้ว',
  'Role updated to': 'เปลี่ยนสิทธิ์เป็น',
  'for user': 'ให้ผู้ใช้',
  '✓ Match confirmed! Status of both items updated to MATCHED and notification sent.':
    '✓ ยืนยันการจับคู่แล้ว! เปลี่ยนสถานะของทั้งสองรายการเป็นจับคู่แล้ว และส่งการแจ้งเตือนเรียบร้อย',
  '✓ Profile updated successfully!': '✓ อัปเดตโปรไฟล์เรียบร้อยแล้ว!',
  'Avatar Preview': 'ตัวอย่างรูปโปรไฟล์',
  'Close modal': 'ปิดหน้าต่าง',
  'Preview': 'ตัวอย่าง',

  // ---------- ผู้ช่วย AI ในหน้าแจ้งของ ----------
  'Gemini AI classified this as': 'Gemini AI จัดให้อยู่ในหมวด',
  'confidence': 'ความมั่นใจ',

  // ---------- รูปตัวอย่าง ----------
  'Headphones': 'หูฟัง',
  'Leather Wallet': 'กระเป๋าสตางค์หนัง',
  'Keys Set': 'พวงกุญแจ',
  'Water Bottle': 'ขวดน้ำ',
  'Student ID': 'บัตรนักศึกษา',

  // ---------- SpaceReserve Peer API (เพิ่มเติม) ----------
  '1. Outgoing (We Call SpaceReserve)': '1. ขาออก (เราเรียก SpaceReserve)',
  '2. Incoming (SpaceReserve Calls Us)': '2. ขาเข้า (SpaceReserve เรียกเรา)',
  'Test live bilateral communication between the University Lost & Found backend and the SpaceReserve room reservation backend.':
    'ทดสอบการรับส่งข้อมูลสองทางระหว่างระบบของหายของมหาวิทยาลัยกับระบบจองห้อง SpaceReserve',
  'GET Request': 'คำขอแบบ GET',
  'When a found item is recorded, Finder Portal queries SpaceReserve to check who booked that specific room at that time.':
    'เมื่อมีการบันทึกของที่เก็บได้ ระบบจะสอบถาม SpaceReserve ว่าใครจองห้องนั้นในช่วงเวลาดังกล่าว',
  'When a student checks in to SpaceReserve, their backend queries Finder Portal to see if any items were left behind in that room.':
    'เมื่อนักศึกษาเช็กอินที่ SpaceReserve ระบบของเพื่อนจะสอบถามกลับมาว่ามีของตกหล่นในห้องนั้นหรือไม่',
  'Library Room 4B / Music Practice Lab': 'ห้องสมุด 4B / ห้องซ้อมดนตรี',
  'Unknown Hallway 101 (Non-bookable space)': 'ทางเดิน 101 (พื้นที่ที่จองไม่ได้)',
  'This room was booked by': 'ห้องนี้ถูกจองโดย',
  'for': 'สำหรับ',
  'e.g. Room 402 or Central Library': 'เช่น ห้อง 402 หรือ หอสมุดกลาง',
  'Click "Send Request" on the left to simulate calling SpaceReserve\'s REST API.':
    'กดปุ่ม "ส่งคำขอ" ทางซ้าย เพื่อจำลองการเรียก REST API ของ SpaceReserve',
  'Click "Simulate SpaceReserve Request" on the left to test the exposed API endpoint.':
    'กดปุ่ม "จำลองคำขอจาก SpaceReserve" ทางซ้าย เพื่อทดสอบ API ที่เราเปิดให้เรียก',

  // ---------- ข้อความแจ้งเตือนใน App ----------
  'Failed to sync items from server': 'ดึงข้อมูลจากเซิร์ฟเวอร์ไม่สำเร็จ',
  'Welcome to Finder Portal,': 'ยินดีต้อนรับสู่ Finder Portal,',
  'Signed out of Active Directory session.': 'ออกจากระบบ Active Directory แล้ว',
  'New found item published!': 'เผยแพร่รายการของที่เจอเรียบร้อยแล้ว!',
  'New lost report published!': 'เผยแพร่รายการแจ้งของหายเรียบร้อยแล้ว!',
  'Error:': 'เกิดข้อผิดพลาด:',
  'Claim request submitted for teacher verification.':
    'ส่งคำร้องให้อาจารย์ตรวจสอบเรียบร้อยแล้ว',
  'Claim approved! Item status set to CLAIMED.':
    'อนุมัติคำร้องแล้ว เปลี่ยนสถานะเป็นคืนเจ้าของแล้ว',
  'Claim rejected.': 'ปฏิเสธคำร้องแล้ว',
  'Item status updated to': 'เปลี่ยนสถานะรายการเป็น',
  'Listing removed successfully.': 'ลบรายการเรียบร้อยแล้ว',
  'AI Match confirmed! Both item statuses updated to MATCHED.':
    'ยืนยันการจับคู่ด้วย AI แล้ว เปลี่ยนสถานะทั้งสองรายการเป็นจับคู่แล้ว',
  'Match confirmation failed:': 'ยืนยันการจับคู่ไม่สำเร็จ:',
  'Profile settings updated!': 'อัปเดตการตั้งค่าโปรไฟล์แล้ว',
  'Are you sure you want to delete this listing? (Admin action)':
    'ยืนยันที่จะลบรายการนี้ใช่ไหม? (การกระทำของผู้ดูแลระบบ)'
};

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (text) => text
});

const STORAGE_KEY = 'finder_lang';

export function LanguageProvider({ children }) {
  // ครั้งแรกที่เปิดเว็บ = ภาษาอังกฤษ หลังจากนั้นจำภาษาที่เลือกไว้
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const setLang = (next) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* โหมดไม่ระบุตัวตนอาจเขียนไม่ได้ ไม่เป็นไร */
    }
  };

  const t = (text) => {
    if (lang !== 'th') return text;
    return Object.prototype.hasOwnProperty.call(TH, text) ? TH[text] : text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

export function useT() {
  return useContext(LanguageContext).t;
}

/** ใช้กับ toLocaleDateString ให้วันที่เปลี่ยนภาษาตามไปด้วย */
export function localeFor(lang) {
  return lang === 'th' ? 'th-TH' : 'en-US';
}
