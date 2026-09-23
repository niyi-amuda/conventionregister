// Vercel Serverless Function: /api/send-confirmation-email
// Sends the convention registration confirmation email through Brevo.
//
// SET THESE IN VERCEL:
//   Project → Settings → Environment Variables
//     BREVO_API_KEY          your Brevo API key (Brevo → Settings → SMTP & API)
//     BREVO_SENDER_EMAIL     a sender/domain verified in your Brevo account
//     BREVO_SENDER_NAME      e.g. Excellent Youth Fellowship
//     WHATSAPP_LINK          e.g. https://chat.whatsapp.com/FbnVN9KiLxrBkd75ZzaBgD
// Then redeploy so the new variables take effect.

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function buildEmailHtml({ firstName, fullName, registrationNo, branch, whatsappLink, qrCodeUrl, logoUrl }) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#ffffff;">
    <div style="background:linear-gradient(135deg,#003B63,#004F82);padding:26px 20px;text-align:center;">
      ${logoUrl ? `<img src="${logoUrl}" alt="Excellent Youth Fellowship" style="height:70px;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;">` : ""}
      <h1 style="color:#ffffff;margin:0;font-size:21px;">🎉 You're Registered!</h1>
      <p style="color:#00B8E5;margin:8px 0 0;font-weight:bold;">Welcome to the 2026 National Youth Convention</p>
    </div>
    <div style="padding:26px 22px;color:#0d2233;line-height:1.7;font-size:15px;">
      <p>Dear ${escapeHtml(firstName)},</p>
      <p><strong>🎉 Congratulations! Your registration is confirmed!</strong></p>
      <p>We are excited to welcome you to the 2026 National Youth Convention of the <strong>Excellent Youth Fellowship</strong>.</p>
      <h2 style="color:#003B63;font-size:18px;">🔥 HIGHER REALMS &amp; REALITIES</h2>
      <p>Get ready for a powerful time of fellowship, worship, teaching, prayer and unforgettable encounters with God.</p>
      <h3 style="color:#003B63;font-size:16px;">Your Registration Details</h3>
      <p style="background:#f2f8fb;padding:14px 16px;border-radius:10px;">
        Name: ${escapeHtml(fullName)}<br>
        Registration Number: <strong>${escapeHtml(registrationNo)}</strong><br>
        Branch: ${escapeHtml(branch)}
      </p>
      <h3 style="color:#003B63;font-size:16px;">📅 Convention Schedule</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
        <tr style="background:#003B63;color:#ffffff;">
          <th style="padding:10px 12px;text-align:left;">Day</th>
          <th style="padding:10px 12px;text-align:left;">Date</th>
          <th style="padding:10px 12px;text-align:left;">Time</th>
        </tr>
        <tr style="background:#f2f8fb;">
          <td style="padding:9px 12px;">Day 1</td>
          <td style="padding:9px 12px;">Thursday, October 8, 2026</td>
          <td style="padding:9px 12px;">4:00 PM</td>
        </tr>
        <tr>
          <td style="padding:9px 12px;">Day 2</td>
          <td style="padding:9px 12px;">Friday, October 9, 2026 <span style="font-size:12px;color:#5c6b76;">(All Night Programme)</span></td>
          <td style="padding:9px 12px;">9:00 PM</td>
        </tr>
        <tr style="background:#f2f8fb;">
          <td style="padding:9px 12px;">Day 3</td>
          <td style="padding:9px 12px;">Saturday, October 10, 2026 <span style="font-size:12px;color:#5c6b76;">(Evangelism)</span></td>
          <td style="padding:9px 12px;">3:00 PM</td>
        </tr>
        <tr>
          <td style="padding:9px 12px;">Day 4</td>
          <td style="padding:9px 12px;">Sunday, October 11, 2026</td>
          <td style="padding:9px 12px;">7:00 AM</td>
        </tr>
      </table>
      <p>📍 The Living Truth Church, 13, Maduku Street, Okumagba Layout, Warri</p>
      <h3 style="color:#003B63;font-size:16px;">Join the Convention WhatsApp Group</h3>
      <p>All important announcements, updates, schedules and convention information will be shared through our official WhatsApp group.</p>
      <p style="text-align:center;margin:22px 0;">
        <a href="${whatsappLink}" style="background:#00B8E5;color:#ffffff;padding:13px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">JOIN THE CONVENTION WHATSAPP GROUP</a>
      </p>
      <p>Please join the group as soon as possible so you don't miss any important information.</p>
      <h3 style="color:#003B63;font-size:16px;">Your QR Code</h3>
      <p>Save the QR code below to your phone. When you arrive for each day of the convention, present it at the registration desk and the admin team will scan it to record your attendance for that day.</p>
      <p style="text-align:center;margin:20px 0;">
        <img src="${qrCodeUrl}" width="220" height="220" alt="QR code for registration ${escapeHtml(registrationNo)}" style="display:inline-block;border:8px solid #f2f8fb;border-radius:12px;">
      </p>
      <p style="text-align:center;color:#5c6b76;font-size:13px;">If the code above doesn't load, your registration number below still works at the desk.</p>
      <p>Your registration number: <strong>${escapeHtml(registrationNo)}</strong></p>
      <p>We can't wait to welcome you!</p>
      <p>Come expectant. Come prepared. Come ready for MORE! 🔥</p>
      <p style="margin-top:26px;font-weight:bold;color:#003B63;">
        EXCELLENT YOUTH FELLOWSHIP<br>
        2026 National Youth Convention<br>
        HIGHER REALMS &amp; REALITIES
      </p>
      <p style="font-style:italic;color:#5c6b76;">"Enlarge the place of thy tent…" — Isaiah 54:2, KJV</p>
      <p>See you at the convention! ❤️</p>
    </div>
  </div>`;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  try {
    const { full_name, email, registration_no, branch } = req.body || {};

    if (!email) {
      res.status(400).json({ error: "Missing recipient email" });
      return;
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "info@eyfltc.org";
    const SENDER_NAME = process.env.BREVO_SENDER_NAME || "Excellent Youth Fellowship";
    const WHATSAPP_LINK = process.env.WHATSAPP_LINK || "https://chat.whatsapp.com/FbnVN9KiLxrBkd75ZzaBgD";

    if (!BREVO_API_KEY) {
      res.status(500).json({ error: "BREVO_API_KEY environment variable is not set in Vercel" });
      return;
    }

    const firstName = String(full_name || "").trim().split(" ")[0] || "there";
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&color=003B63&bgcolor=FFFFFF&data=${encodeURIComponent(registration_no || "")}`;
    const logoUrl = `https://conventionregistration-5f5dz8nzj-enag-15.vercel.app/assets/logo.png`;
    const html = buildEmailHtml({
      firstName, fullName: full_name || "", registrationNo: registration_no || "",
      branch: branch || "", whatsappLink: WHATSAPP_LINK, qrCodeUrl, logoUrl,
    });

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email, name: full_name || undefined }],
        subject: "🎉 You're Registered! Welcome to the 2026 National Youth Convention",
        htmlContent: html,
      }),
    });

    const result = await brevoRes.json();
    if (!brevoRes.ok) {
      res.status(500).json({ error: result });
      return;
    }

    res.status(200).json({ ok: true, result });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
