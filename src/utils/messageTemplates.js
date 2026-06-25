require('dotenv').config();

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// ======= LIVERY REQUEST CONFIRMATION =======
function buildLiveryRequestEmailHtml({ name, horseName, trackingUrl }) {
  const greeting = getTimeGreeting();
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 540px; margin: 0 auto; background: #fdf8f3; border-radius: 16px; overflow: hidden; border: 1px solid #e8e0d5;">
      <div style="background: linear-gradient(135deg, #2c1a0e, #4a2e14); padding: 28px 30px; text-align: center;">
        <h1 style="color: #c8a96e; margin: 0; font-size: 22px;">🐴 Mervat Horse Riding Academy</h1>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #2c1a0e;">${greeting}, ${name},</p>
        <p style="font-size: 15px; color: #444; line-height: 1.6;">
          Thank you for requesting <strong>Full Livery</strong> for <strong>${horseName}</strong>. Your request is now with our team for review.
        </p>
        <div style="background: #fef3e2; border-left: 4px solid #c8a96e; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
          <p style="margin: 4px 0; color: #2c1a0e;"><strong>Package:</strong> Full Livery</p>
          <p style="margin: 4px 0; color: #2c1a0e;"><strong>Horse:</strong> ${horseName}</p>
          <p style="margin: 4px 0; color: #2c1a0e;"><strong>Monthly Rate:</strong> AED 3,000</p>
        </div>
        <p style="font-size: 15px; color: #444;">Once approved, your 1-month livery period begins and you'll be able to track your horse's daily care log using the link below.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${trackingUrl}" style="background: linear-gradient(135deg, #c8a96e, #a07840); color: #fff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block;">Track My Livery Request</a>
        </div>
      </div>
      <div style="background: #1a0a00; padding: 16px; text-align: center;">
        <p style="color: #888; font-size: 12px; margin: 0;">© 2026 Mervat Horse Riding Academy • ${process.env.ACADEMY_PHONE} • ${process.env.ACADEMY_EMAIL}</p>
      </div>
    </div>
  `;
}

function buildLiveryRequestWhatsAppText({ name, horseName, trackingUrl }) {
  const greeting = getTimeGreeting();
  return `Hi ${name} 👋

${greeting}! Thank you for requesting *Full Livery* for *${horseName}* at Mervat Academy.

🐴 Package: Full Livery
💰 Monthly Rate: AED 3,000

Your request is now with our team for review. Once approved, your 1-month livery period will begin.

Track your request: ${trackingUrl}`;
}

// ======= LIVERY STATUS UPDATE (approved / rejected / renewal reminder) =======
function buildLiveryStatusEmailHtml({ name, horseName, statusBadge, bodyText, trackingUrl, ctaLabel }) {
  const greeting = getTimeGreeting();
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 540px; margin: 0 auto; background: #fdf8f3; border-radius: 16px; overflow: hidden; border: 1px solid #e8e0d5;">
      <div style="background: linear-gradient(135deg, #2c1a0e, #4a2e14); padding: 28px 30px; text-align: center;">
        <h1 style="color: #c8a96e; margin: 0; font-size: 22px;">🐴 Mervat Horse Riding Academy</h1>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #2c1a0e;">${greeting}, ${name},</p>
        <div style="display:inline-block; background:${statusBadge.bg}; color:${statusBadge.color}; padding:6px 14px; border-radius:20px; font-size:13px; font-weight:600; margin-bottom:14px;">${statusBadge.text}</div>
        <p style="font-size: 15px; color: #444; line-height: 1.6;">${bodyText}</p>
        ${trackingUrl ? `
        <div style="text-align: center; margin: 28px 0;">
          <a href="${trackingUrl}" style="background: linear-gradient(135deg, #c8a96e, #a07840); color: #fff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block;">${ctaLabel || 'View My Livery'}</a>
        </div>` : ''}
      </div>
      <div style="background: #1a0a00; padding: 16px; text-align: center;">
        <p style="color: #888; font-size: 12px; margin: 0;">© 2026 Mervat Horse Riding Academy • ${process.env.ACADEMY_PHONE} • ${process.env.ACADEMY_EMAIL}</p>
      </div>
    </div>
  `;
}

function buildLiveryStatusWhatsAppText({ name, horseName, statusLine, bodyText, trackingUrl }) {
  return `Hi ${name} 👋

${statusLine}

${bodyText.replace(/<[^>]+>/g, '')}

${trackingUrl ? trackingUrl : ''}`;
}


function buildPackageEmailHtml({ title, name, packageType, tierLabel, price, trackingUrl }) {
  const greeting = getTimeGreeting();
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 540px; margin: 0 auto; background: #fdf8f3; border-radius: 16px; overflow: hidden; border: 1px solid #e8e0d5;">
      <div style="background: linear-gradient(135deg, #2c1a0e, #4a2e14); padding: 28px 30px; text-align: center;">
        <h1 style="color: #c8a96e; margin: 0; font-size: 22px;">🐴 Mervat Horse Riding Academy</h1>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #2c1a0e;">${greeting}, ${title ? title + ' ' : ''}${name},</p>
        <p style="font-size: 15px; color: #444; line-height: 1.6;">
          Thank you for choosing <strong>Mervat Horse Riding Academy</strong> — we're delighted to welcome you and look forward to making your riding journey unforgettable. 🐎
        </p>
        <div style="background: #fef3e2; border-left: 4px solid #c8a96e; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
          <p style="margin: 4px 0; color: #2c1a0e;"><strong>Package:</strong> ${packageType}</p>
          <p style="margin: 4px 0; color: #2c1a0e;"><strong>Tier:</strong> ${tierLabel}</p>
          <p style="margin: 4px 0; color: #2c1a0e;"><strong>Price:</strong> AED ${price}</p>
        </div>
        <p style="font-size: 15px; color: #444;">Your request is now with our team for approval. Once approved, you can book your sessions directly using the link below.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${trackingUrl}" style="background: linear-gradient(135deg, #c8a96e, #a07840); color: #fff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block;">Track My Package</a>
        </div>
        <p style="font-size: 13px; color: #888; background: #fdf3e2; padding: 12px 16px; border-radius: 8px;">
          📌 Please note: sessions must be cancelled at least <strong>24 hours in advance</strong>.
        </p>
      </div>
      <div style="background: #1a0a00; padding: 16px; text-align: center;">
        <p style="color: #888; font-size: 12px; margin: 0;">© 2026 Mervat Horse Riding Academy • ${process.env.ACADEMY_PHONE} • ${process.env.ACADEMY_EMAIL}</p>
      </div>
    </div>
  `;
}

function buildPackageWhatsAppText({ title, name, packageType, tierLabel, price, trackingUrl }) {
  const greeting = getTimeGreeting();
  return `Hi ${title ? title + ' ' : ''}${name} 👋

${greeting}! Thank you for choosing *Mervat Horse Riding Academy* 🐴

Your package request has been received:
📦 ${packageType} — ${tierLabel}
💰 AED ${price}

Track your sessions & progress here:
${trackingUrl}

📌 Please note: sessions must be cancelled at least *24 hours* in advance.

See you soon! 🐎`;
}

// ======= 24-HOUR SESSION REMINDER =======
function buildReminderEmailHtml(booking) {
  const greeting = getTimeGreeting();
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 540px; margin: 0 auto; background: #fdf8f3; border-radius: 16px; overflow: hidden; border: 1px solid #e8e0d5;">
      <div style="background: linear-gradient(135deg, #2c1a0e, #4a2e14); padding: 28px 30px; text-align: center;">
        <h1 style="color: #c8a96e; margin: 0; font-size: 22px;">🐴 Mervat Horse Riding Academy</h1>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #2c1a0e;">${greeting}, ${booking.name},</p>
        <p style="font-size: 15px; color: #444; line-height: 1.6;">
          This is a friendly reminder that your session is coming up <strong>tomorrow</strong>! We can't wait to see you. 🐎
        </p>
        <div style="background: #fef3e2; border-left: 4px solid #c8a96e; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
          <p style="margin: 4px 0; color: #2c1a0e;"><strong>Service:</strong> ${booking.category}</p>
          ${booking.subPackage ? `<p style="margin: 4px 0; color: #2c1a0e;"><strong>Package:</strong> ${booking.subPackage}</p>` : ''}
          <p style="margin: 4px 0; color: #2c1a0e;"><strong>Date:</strong> ${booking.date}</p>
          <p style="margin: 4px 0; color: #2c1a0e;"><strong>Time:</strong> ${booking.startTime}</p>
        </div>
        <p style="font-size: 13px; color: #888; background: #fdf3e2; padding: 12px 16px; border-radius: 8px;">
          📌 Need to cancel? Please let us know at least <strong>24 hours in advance</strong>.
        </p>
      </div>
      <div style="background: #1a0a00; padding: 16px; text-align: center;">
        <p style="color: #888; font-size: 12px; margin: 0;">© 2026 Mervat Horse Riding Academy • ${process.env.ACADEMY_PHONE} • ${process.env.ACADEMY_EMAIL}</p>
      </div>
    </div>
  `;
}

function buildReminderWhatsAppText(booking) {
  const greeting = getTimeGreeting();
  return `Hi ${booking.name} 👋

${greeting}! ⏰ Reminder: your session at *Mervat Horse Riding Academy* is coming up tomorrow!

📅 Date: ${booking.date}
🕐 Time: ${booking.startTime}
🏇 Service: ${booking.category}
${booking.subPackage ? `📦 ${booking.subPackage}` : ''}

📌 Need to cancel? Please let us know at least *24 hours* in advance.

See you soon! 🐎`;
}

function buildStatusUpdateEmailHtml({ name, title, statusBadge, bodyText, detailsHtml, trackingUrl, ctaLabel }) {
  const greeting = getTimeGreeting();
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 540px; margin: 0 auto; background: #fdf8f3; border-radius: 16px; overflow: hidden; border: 1px solid #e8e0d5;">
      <div style="background: linear-gradient(135deg, #2c1a0e, #4a2e14); padding: 28px 30px; text-align: center;">
        <h1 style="color: #c8a96e; margin: 0; font-size: 22px;">🐴 Mervat Horse Riding Academy</h1>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #2c1a0e;">${greeting}, ${title ? title + ' ' : ''}${name},</p>
        ${statusBadge ? `<div style="display:inline-block; background:${statusBadge.bg}; color:${statusBadge.color}; padding:8px 18px; border-radius:50px; font-weight:bold; font-size:14px; margin-bottom:16px;">${statusBadge.text}</div>` : ''}
        <p style="font-size: 15px; color: #444; line-height: 1.6;">${bodyText}</p>
        ${detailsHtml || ''}
        ${trackingUrl ? `
        <div style="text-align: center; margin: 28px 0;">
          <a href="${trackingUrl}" style="background: linear-gradient(135deg, #c8a96e, #a07840); color: #fff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block;">${ctaLabel || 'View My Package'}</a>
        </div>` : ''}
        <p style="font-size: 13px; color: #888; background: #fdf3e2; padding: 12px 16px; border-radius: 8px;">
          📌 Sessions can be cancelled at least <strong>24 hours in advance</strong>. Questions? We're here to help.
        </p>
      </div>
      <div style="background: #1a0a00; padding: 16px; text-align: center;">
        <p style="color: #888; font-size: 12px; margin: 0;">© 2026 Mervat Horse Riding Academy • ${process.env.ACADEMY_PHONE} • ${process.env.ACADEMY_EMAIL}</p>
      </div>
    </div>
  `;
}

function buildStatusUpdateWhatsAppText({ name, title, statusLine, bodyText, trackingUrl }) {
  const greeting = getTimeGreeting();
  return `Hi ${title ? title + ' ' : ''}${name} 👋

${greeting}! ${statusLine}

${bodyText}
${trackingUrl ? `\n🔗 ${trackingUrl}` : ''}

— Mervat Horse Riding Academy 🐴`;
}

module.exports = {
  getTimeGreeting,
  buildPackageEmailHtml,
  buildPackageWhatsAppText,
  buildReminderEmailHtml,
  buildReminderWhatsAppText,
  buildStatusUpdateEmailHtml,
  buildStatusUpdateWhatsAppText,
  buildLiveryRequestEmailHtml,
  buildLiveryRequestWhatsAppText,
  buildLiveryStatusEmailHtml,
  buildLiveryStatusWhatsAppText
};
