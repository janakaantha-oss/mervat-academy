const mongoose = require('mongoose');
const crypto = require('crypto');

// One entry per day of the livery month — admin fills this in as a daily care log.
const dailyLogEntrySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true }, // 1-30
  date:      { type: String },                 // YYYY-MM-DD, set once the month starts
  note:      { type: String, default: '' }     // what admin recorded for that day
}, { _id: false });

const liveryBookingSchema = new mongoose.Schema({
  // Slot this booking occupies — 1 through 10
  slotNumber:     { type: Number, required: true, min: 1, max: 10 },

  // Customer details (separate from Customer/PackagePurchase collections on purpose)
  name:           { type: String, required: true },
  email:          { type: String, required: true },
  phone:          { type: String, required: true },
  horseName:      { type: String, required: true },

  price:          { type: Number, default: 3000 }, // AED per month

  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },

  // Set once admin approves — defines the 1-month period
  startDate:      { type: Date },
  endDate:        { type: Date }, // startDate + 1 month

  renewalRequested: { type: Boolean, default: false },
  reminderSent:      { type: Boolean, default: false }, // 1-week-before-expiry reminder

  active:         { type: Boolean, default: true }, // false once expired/ended & slot freed by admin

  dailyLog:       { type: [dailyLogEntrySchema], default: () => [] },

  token:          { type: String, unique: true },
  createdAt:      { type: Date, default: Date.now }
});

liveryBookingSchema.pre('save', function() {
  if (!this.token) {
    this.token = crypto.randomBytes(12).toString('hex');
  }
});

module.exports = mongoose.model('LiveryBooking', liveryBookingSchema);
