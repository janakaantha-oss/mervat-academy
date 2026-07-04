require('dotenv').config();
const { sendEmail } = require('./mailer');
const { sendWhatsApp } = require('./whatsapp');

// Admin (your client) contact — override in Render env when handing over.
// Defaults to the developer's contact for testing.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'janakaantha@gmail.com';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '+971585953807';
// Secret guarding one-click admin action links. Change via env when handing over.
const ADMIN_ACTION_KEY = process.env.ADMIN_ACTION_KEY || 'legacy-secret-2026';
const BASE_URL = process.env.PUBLIC_BASE_URL || '';

function log(tag) { return (e) => console.log(`⚠️ ${tag}:`, e.message); }

// Build a one-click action URL guarded by the secret key
function actionUrl(path) {
  return `${BASE_URL}${path}${path.includes('?') ? '&' : '?'}key=${encodeURIComponent(ADMIN_ACTION_KEY)}`;
}

function adminActionButtons(actions) {
  if (!actions || !actions.length) return '';
  return `<div style="text-align:center; margin:6px 0 14px;">` +
    actions.map(a => `<a href="${a.url}" style="display:inline-block; margin:6px 6px; background:${a.color || '#1a1a1a'}; color:#fff; text-decoration:none; padding:12px 26px; border-radius:6px; font-size:13px; font-weight:600; letter-spacing:0.5px;">${a.label}</a>`).join('') +
    `</div>`;
}

function adminActionLines(actions) {
  if (!actions || !actions.length) return '';
  return '\n\n' + actions.map(a => `${a.label}: ${a.url}`).join('\n');
}

// Prepend a small admin banner to the customer email HTML for the admin copy
function adminWrap(name, phone, email, html) {
  const banner = `<div style="background:#2c2420;color:#f0ece0;padding:12px 18px;font-family:Helvetica,Arial,sans-serif;font-size:13px;">
    📋 <strong>ADMIN COPY</strong> — Customer: ${name || '-'} • ${phone || '-'} • ${email || '-'}
  </div>`;
  return banner + (html || '');
}

/**
 * Send an event to the CUSTOMER and an admin copy to the ADMIN,
 * on both Email and WhatsApp. Never throws (all sends are caught).
 *
 * @param {Object}  opts
 * @param {Object}  opts.customer   { name, email, phone }
 * @param {string}  opts.subject    email subject (customer)
 * @param {string}  opts.emailHtml  email HTML (customer)
 * @param {string}  opts.waText     WhatsApp text (customer)
 * @param {boolean} opts.toCustomer default true — send to the customer
 * @param {boolean} opts.toAdmin    default true — send an admin copy
 */
async function notifyAll({ customer = {}, subject, emailHtml, waText, adminActions = null, toCustomer = true, toAdmin = true }) {
  const name = customer.name || 'Customer';
  const phone = customer.phone || '';
  const email = customer.email || '';
  const jobs = [];

  if (toCustomer) {
    if (email) jobs.push(sendEmail(email, subject, emailHtml).catch(log('customer email')));
    if (phone) jobs.push(sendWhatsApp(`whatsapp:${phone}`, waText).catch(log('customer whatsapp')));
  }
  if (toAdmin) {
    const adminEmail = adminWrap(name, phone, email, adminActionButtons(adminActions) + (emailHtml || ''));
    const adminWa = `📋 *ADMIN COPY*\nCustomer: ${name} (${phone})\n\n${waText}${adminActionLines(adminActions)}`;
    if (ADMIN_EMAIL) jobs.push(sendEmail(ADMIN_EMAIL, `📋 [Admin] ${subject}`, adminEmail).catch(log('admin email')));
    if (ADMIN_PHONE) jobs.push(sendWhatsApp(`whatsapp:${ADMIN_PHONE}`, adminWa).catch(log('admin whatsapp')));
  }

  await Promise.allSettled(jobs);
}

module.exports = { notifyAll, actionUrl, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_ACTION_KEY };
