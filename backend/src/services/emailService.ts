import nodemailer, { Transporter } from 'nodemailer';

// Helper to create transport lazily
let transporterPromise: Promise<Transporter> | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);

    if (user && pass) {
      console.log(`[Email Service] Configured live SMTP transport via ${host || 'smtp.office365.com'}`);
      return nodemailer.createTransport({
        host: host || 'smtp.office365.com',
        port,
        secure: port === 465,
        auth: { user, pass }
      });
    }

    // Fallback: Create test Ethereal account for development/testing
    console.log('[Email Service] Creating Ethereal SMTP test account for development preview...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch (err: any) {
      console.warn(`[Email Service Warning] Ethereal account creation failed: ${err.message}. Using JSON log transport fallback.`);
      return nodemailer.createTransport({
        jsonTransport: true
      });
    }
  })();

  return transporterPromise;
}

const EMAIL_FROM = process.env.EMAIL_FROM || '"Finder Portal (AU Lost & Found)" <no-reply@au.edu>';

/**
 * 1. Send Claim Approval Notification Email
 */
export async function sendClaimApprovalEmail(
  recipientEmail: string,
  studentName: string,
  itemTitle: string,
  location: string
) {
  if (!recipientEmail) return;

  try {
    const transporter = await getTransporter();

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; color: #f8fafc;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%); padding: 28px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Finder<span style="color: #FDE047;">Portal</span></h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #ffe4e6; font-weight: 600;">Assumption University • Lost & Found System</p>
        </div>

        <!-- Body -->
        <div style="padding: 28px 24px;">
          <div style="display: inline-block; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 13px; font-weight: 700; padding: 6px 12px; border-radius: 20px; margin-bottom: 16px;">
            ✓ คำร้องได้รับการอนุมัติเรียบร้อย (Claim Approved)
          </div>

          <h2 style="font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 0;">เรียนคุณ ${studentName},</h2>

          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            คำร้องยืนยันความเป็นเจ้าของสำหรับรายการ <strong style="color: #f43f5e;">"${itemTitle}"</strong> ที่คุณแจ้งไว้ ได้รับการตรวจสอบและ <strong style="color: #34d399;">อนุมัติโดยเจ้าหน้าที่เรียบร้อยแล้ว</strong>
          </p>

          <!-- Instructions Card -->
          <div style="background: rgba(30, 41, 59, 0.7); border-left: 4px solid #E11D48; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">ขั้นตอนการรับสิ่งของคืน (Pickup Instructions):</div>
            <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #e2e8f0; line-height: 1.6;">
              <li><strong>สถานที่รับของ:</strong> ห้องรักษาความปลอดภัย อาคาร CL ชั้น 1 (Security Desk) หรือบริเวณ ${location}</li>
              <li><strong>หลักฐานที่ต้องนำมาแสดง:</strong> บัตรนักศึกษามหาวิทยาลัยอัสสัมชัญ (AU Student ID Card)</li>
              <li><strong>เวลาทำการ:</strong> จันทร์ - ศุกร์ เวลา 08:30 น. - 16:30 น.</li>
            </ul>
          </div>

          <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
            หากมีข้อสงสัยเพิ่มเติม สามารถติดต่อฝ่ายรักษาความปลอดภัยหรือแอดมินระบบ Finder Portal ได้ทันที
          </p>

          <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />

          <div style="text-align: center; font-size: 11px; color: #64748b;">
            ข้อความนี้ส่งจากระบบอัตโนมัติ Finder Portal (Assumption University)<br />
            © 2026 Finder Portal Team • AU Campus Lost & Found Operations
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: recipientEmail,
      subject: `[Finder Portal] คำร้องขอรับคืน "${itemTitle}" ได้รับการอนุมัติแล้ว!`,
      html: htmlContent
    });

    console.log(`[Email Service] Approval email sent to: ${recipientEmail} (MsgID: ${info.messageId})`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Service] Ethereal Email Preview URL: ${previewUrl}`);
    }
  } catch (err: any) {
    console.error(`[Email Service Error] Failed to send approval email: ${err.message}`);
  }
}

/**
 * 2. Send Claim Rejection Notification Email
 */
export async function sendClaimRejectionEmail(
  recipientEmail: string,
  studentName: string,
  itemTitle: string,
  reason?: string
) {
  if (!recipientEmail) return;

  try {
    const transporter = await getTransporter();

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%); padding: 28px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Finder<span style="color: #FDE047;">Portal</span></h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #ffe4e6; font-weight: 600;">Assumption University • Lost & Found System</p>
        </div>

        <div style="padding: 28px 24px;">
          <div style="display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; font-size: 13px; font-weight: 700; padding: 6px 12px; border-radius: 20px; margin-bottom: 16px;">
            ✕ อัปเดตคำร้องขอรับคืนสิ่งของ (Claim Update)
          </div>

          <h2 style="font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 0;">เรียนคุณ ${studentName},</h2>

          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            คำร้องยืนยันความเป็นเจ้าของสำหรับรายการ <strong style="color: #f43f5e;">"${itemTitle}"</strong> ได้รับการตรวจสอบโดยเจ้าหน้าที่แล้ว และ <strong style="color: #f87171;">ยังไม่สามารถอนุมัติได้ในขณะนี้</strong> เนื่องจากหลักฐานที่ระบุยังไม่เพียงพอ หรือมีรายละเอียดที่ไม่ตรงกับลักษณะสิ่งของ
          </p>

          ${reason ? `
            <div style="background: rgba(30, 41, 59, 0.7); border-left: 4px solid #f87171; padding: 14px; border-radius: 8px; margin: 18px 0; font-size: 13px; color: #e2e8f0;">
              <strong>หมายเหตุจากเจ้าหน้าที่:</strong> ${reason}
            </div>
          ` : ''}

          <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
            หากคุณมีหลักฐานเพิ่มเติม (เช่น หมายเลขซีเรียล หรือภาพถ่ายสิ่งของ) สามารถส่งคำร้องเข้ามาใหม่ได้ทางระบบ Finder Portal
          </p>

          <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />

          <div style="text-align: center; font-size: 11px; color: #64748b;">
            ข้อความนี้ส่งจากระบบอัตโนมัติ Finder Portal (Assumption University)<br />
            © 2026 Finder Portal Team • AU Campus Lost & Found Operations
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: recipientEmail,
      subject: `[Finder Portal] อัปเดตคำร้องขอรับคืน "${itemTitle}"`,
      html: htmlContent
    });

    console.log(`[Email Service] Rejection email sent to: ${recipientEmail} (MsgID: ${info.messageId})`);
  } catch (err: any) {
    console.error(`[Email Service Error] Failed to send rejection email: ${err.message}`);
  }
}

/**
 * 3. Send Gemini AI Match Notification Email
 */
export async function sendMatchNotificationEmail(
  recipientEmail: string,
  studentName: string,
  lostItemTitle: string,
  foundItemTitle: string,
  location: string
) {
  if (!recipientEmail) return;

  try {
    const transporter = await getTransporter();

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%); padding: 28px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Finder<span style="color: #FDE047;">Portal</span></h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #ffe4e6; font-weight: 600;">Google Gemini AI Lost & Found Matchmaker</p>
        </div>

        <div style="padding: 28px 24px;">
          <div style="display: inline-block; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); color: #60a5fa; font-size: 13px; font-weight: 700; padding: 6px 12px; border-radius: 20px; margin-bottom: 16px;">
            🤖 Gemini AI พบคู่ของหายที่ตรงกัน (Match Confirmed)
          </div>

          <h2 style="font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 0;">เรียนคุณ ${studentName},</h2>

          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            ระบบ **Google Gemini AI** ได้ทำการวิเคราะห์คุณลักษณะของที่คุณแจ้งทำหาย <strong style="color: #f43f5e;">"${lostItemTitle}"</strong> และพบคู่รายการที่มีแนวโน้มตรงกันสูงมากกับรายการที่เก็บได้ <strong style="color: #38bdf8;">"${foundItemTitle}"</strong>
          </p>

          <div style="background: rgba(30, 41, 59, 0.7); border-left: 4px solid #38bdf8; padding: 14px; border-radius: 8px; margin: 18px 0; font-size: 13px; color: #e2e8f0; line-height: 1.5;">
            📍 <strong>สถานที่พบของ:</strong> ${location}<br />
            💡 <strong>สถานะปัจจุบัน:</strong> ยืนยันการจับคู่แล้ว — เจ้าหน้าที่ได้รับการแจ้งเตือนแล้ว
          </div>

          <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
            คุณสามารถเข้าสู่ระบบ Finder Portal เพื่อตรวจสอบภาพถ่ายลักษณะของ และกดส่งคำร้องยืนยันความเป็นเจ้าของได้ทันที
          </p>

          <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />

          <div style="text-align: center; font-size: 11px; color: #64748b;">
            ข้อความนี้ส่งจากระบบอัตโนมัติ Finder Portal (Assumption University)<br />
            © 2026 Finder Portal Team • AU Campus Lost & Found Operations
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: recipientEmail,
      subject: `[Finder Portal] Gemini AI พบคู่ของหายที่ตรงกับ "${lostItemTitle}"!`,
      html: htmlContent
    });

    console.log(`[Email Service] Match notification email sent to: ${recipientEmail} (MsgID: ${info.messageId})`);
  } catch (err: any) {
    console.error(`[Email Service Error] Failed to send match email: ${err.message}`);
  }
}
