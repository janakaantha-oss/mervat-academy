const mongoose = require('mongoose');

const closedDaySchema = new mongoose.Schema({
  date:      { type: String, required: true, unique: true },
  type:      { type: String, enum: ['Holiday', 'HalfDay'], required: true },
  closeTime: { type: String },
  reason:    { type: String }
});

module.exports = mongoose.model('ClosedDay', closedDaySchema);