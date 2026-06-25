const express = require('express');
const router = express.Router();
const LiveryBooking = require('../models/LiveryBooking');
const { sendEmail } = require('../utils/mailer');
const { sendWhatsApp } = require('../utils/whatsapp');
const { sendSMS } = require('../utils/sms');
const {
  buildLiveryRequestEmailHtml, buildLiveryRequestWhatsAppText,
  buildLiveryStatusEmailHtml, buildLiveryStatusWhatsAppText
} = require('../utils/messageTemplates');

const TOTAL_SLOTS = 10;

// Find the lowest-numbered free slot (1-10). A slot is "free" if no active
// (Pending or Approved, active=true) booking currently occupies it.
async function findFreeSlot() {
  const occupied = await LiveryBooking.find({
    active: true,
    approvalStatus: { $in: ['Pending', 'Approved'] }
  }).select('slotNumber');

  const taken = new Set(occupied.map(b => b.slotNumber));
  for (let i = 1; i <= TOTAL_SLOTS; i++) {
    if (!taken.has(i)) return i;
  }
  return null; // all slots full
}

function notifyLivery(booking, { statusBadge, bodyText, statusLine, ctaLabel, includeLink = true }) {
  const trackingUrl = includeLink ? `${process.env.PUBLIC_BASE_URL || ''}/livery-track.html?token=${booking.token}` : null;

  const emailRecipient = process.env.ADMIN_TEST_EMAIL || booking.email;
  sendEmail(emailRecipient, '🐴 Mervat Academy — Update on Your Livery', buildLiveryStatusEmailHtml({
    name: booking.name, horseName: booking.horseName, statusBadge, bodyText, trackingUrl, ctaLabel
  })).catch(err => console.log('⚠️ Livery email notification error:', err.message));

  const waRecipient = process.env.ADMIN_TEST_PHONE || `whatsapp:${booking.phone}`;
  sendWhatsApp(waRecipient, buildLiveryStatusWhatsAppText({
    name: booking.name, horseName: booking.horseName, statusLine, bodyText, trackingUrl
  })).catch(err => console.log('⚠️ Livery WhatsApp notification error:', err.message));

  const smsRecipient = process.env.ADMIN_TEST_PHONE_SMS || booking.phone;
  sendSMS(smsRecipient, buildLiveryStatusWhatsAppText({
    name: booking.name, horseName: booking.horseName, statusLine, bodyText, trackingUrl
  })).catch(err => console.log('⚠️ Livery SMS notification error:', err.message));
}

// ===== Customer submits a livery request =====
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, horseName } = req.body;
    if (!name || !email || !phone || !horseName) {
      return res.status(400).json({ message: '❌ Name, email, phone, and horse name are all required.' });
    }

    const slot = await findFreeSlot();
    if (slot === null) {
      return res.status(409).json({ message: '❌ Sorry, all livery slots are currently full. Please check back later or contact us directly.' });
    }

    const booking = new LiveryBooking({ name, email, phone, horseName, slotNumber: slot });
    await booking.save();

    res.status(201).json({ message: '✅ Livery request submitted! Our team will review it shortly.', token: booking.token });

    const trackingUrl = `${process.env.PUBLIC_BASE_URL || ''}/livery-track.html?token=${booking.token}`;

    const emailRecipient = process.env.ADMIN_TEST_EMAIL || booking.email;
    sendEmail(emailRecipient, '🐴 Your Mervat Academy Livery Request', buildLiveryRequestEmailHtml({
      name: booking.name, horseName: booking.horseName, trackingUrl
    })).catch(err => console.log('⚠️ Livery email error (booking still saved):', err.message));

    const waRecipient = process.env.ADMIN_TEST_PHONE || `whatsapp:${booking.phone}`;
    const waText = buildLiveryRequestWhatsAppText({ name: booking.name, horseName: booking.horseName, trackingUrl });
    sendWhatsApp(waRecipient, waText).catch(err => console.log('⚠️ Livery WhatsApp error (booking still saved):', err.message));

    const smsRecipient = process.env.ADMIN_TEST_PHONE_SMS || booking.phone;
    sendSMS(smsRecipient, waText).catch(err => console.log('⚠️ Livery SMS error (booking still saved):', err.message));
  } catch (err) {
    res.status(500).json({ message: '❌ Error submitting livery request', error: err.message });
  }
});

// ===== Customer tracking page data =====
router.get('/track/:token', async (req, res) => {
  try {
    const booking = await LiveryBooking.findOne({ token: req.params.token });
    if (!booking) return res.status(404).json({ message: 'Livery booking not found' });

    let daysRemaining = null;
    if (booking.approvalStatus === 'Approved' && booking.endDate) {
      const msRemaining = new Date(booking.endDate) - new Date();
      daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
    }

    res.json({ ...booking.toObject(), daysRemaining });
  } catch (err) {
    res.status(500).json({ message: '❌ Error fetching livery booking' });
  }
});

// ===== Customer requests renewal =====
router.post('/:id/request-renewal', async (req, res) => {
  try {
    const booking = await LiveryBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Livery booking not found' });
    booking.renewalRequested = true;
    await booking.save();
    res.json({ message: '✅ Renewal request submitted. Our team will follow up shortly.' });
  } catch (err) {
    res.status(500).json({ message: '❌ Error requesting renewal' });
  }
});

// ===== Admin: list all livery bookings (for the 10-slot dashboard) =====
router.get('/', async (req, res) => {
  try {
    const bookings = await LiveryBooking.find().sort({ slotNumber: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: '❌ Error fetching livery bookings' });
  }
});

// ===== Admin: approve / reject / end a livery booking =====
router.patch('/:id', async (req, res) => {
  try {
    const before = await LiveryBooking.findById(req.params.id);
    if (!before) return res.status(404).json({ message: 'Livery booking not found' });

    // If approving for the first time, set the 1-month period now.
    if (req.body.approvalStatus === 'Approved' && before.approvalStatus !== 'Approved') {
      const start = new Date();
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      req.body.startDate = start;
      req.body.endDate = end;
      req.body.dailyLog = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return { dayNumber: i + 1, date: d.toISOString().slice(0, 10), note: '' };
      });
    }

    const booking = await LiveryBooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: '✅ Livery booking updated', booking });

    if (req.body.approvalStatus === 'Approved' && before.approvalStatus !== 'Approved') {
      notifyLivery(booking, {
        statusBadge: { bg: '#d4edda', color: '#1e7e34', text: '✅ Livery Approved' },
        bodyText: `Great news! Your <strong>Full Livery</strong> request for <strong>${booking.horseName}</strong> has been approved. Your 1-month livery period has started today.`,
        statusLine: 'Your livery has been approved! ✅',
        ctaLabel: 'Track My Livery'
      });
    }

    if (req.body.approvalStatus === 'Rejected' && before.approvalStatus !== 'Rejected') {
      notifyLivery(booking, {
        statusBadge: { bg: '#f8d7da', color: '#a71d2a', text: '❌ Request Not Approved' },
        bodyText: `We're sorry, but we're unable to approve your livery request for <strong>${booking.horseName}</strong> at this time. Please contact us directly so we can assist you further.`,
        statusLine: 'Your livery request was not approved.',
        includeLink: false
      });
    }
  } catch (err) {
    res.status(500).json({ message: '❌ Error updating livery booking', error: err.message });
  }
});

// ===== Admin: free up a slot (end booking, mark inactive) =====
router.post('/:id/end', async (req, res) => {
  try {
    const booking = await LiveryBooking.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!booking) return res.status(404).json({ message: 'Livery booking not found' });
    res.json({ message: '✅ Livery booking ended, slot freed up', booking });
  } catch (err) {
    res.status(500).json({ message: '❌ Error ending livery booking' });
  }
});

// ===== Admin: update a single day's care log note =====
router.patch('/:id/log/:dayNumber', async (req, res) => {
  try {
    const { note } = req.body;
    const booking = await LiveryBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Livery booking not found' });

    const dayNum = parseInt(req.params.dayNumber, 10);
    const entry = booking.dailyLog.find(d => d.dayNumber === dayNum);
    if (!entry) return res.status(404).json({ message: 'Day not found in log' });

    entry.note = note;
    if (booking.startDate) {
      const entryDate = new Date(booking.startDate);
      entryDate.setDate(entryDate.getDate() + (dayNum - 1));
      entry.date = entryDate.toISOString().slice(0, 10);
    }

    await booking.save();
    res.json({ message: '✅ Daily log updated', booking });
  } catch (err) {
    res.status(500).json({ message: '❌ Error updating daily log', error: err.message });
  }
});

module.exports = router;