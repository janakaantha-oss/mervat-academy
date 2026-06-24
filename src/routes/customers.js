const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');

// Get all customers, sorted alphabetically by name
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: '❌ Error fetching customers' });
  }
});

// Get one customer + their full booking history
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    const bookings = await Booking.find({ email: customer.email }).sort({ date: -1 });
    res.json({ customer, bookings });
  } catch (err) {
    res.status(500).json({ message: '❌ Error fetching customer' });
  }
});

// Delete a customer profile (does NOT delete their past bookings)
router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: '✅ Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: '❌ Error deleting customer' });
  }
});

// Edit customer info
router.patch('/:id', async (req, res) => {
  try {
    const { name, phone, notes } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, notes },
      { new: true }
    );
    res.json({ message: '✅ Customer updated', customer });
  } catch (err) {
    res.status(500).json({ message: '❌ Error updating customer' });
  }
});

module.exports = router;