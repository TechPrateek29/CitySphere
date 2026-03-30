const Bill = require('../models/Bill');

// @desc    Get user's bills
// @route   GET /api/bills/my
// @access  Private (Citizen)
const getMyBills = async (req, res) => {
  try {
    const bills = await Bill.find({ citizen: req.user._id });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Pay a bill
// @route   PUT /api/bills/:id/pay
// @access  Private (Citizen)
const payBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (bill && bill.citizen.toString() === req.user._id.toString()) {
      bill.status = 'paid';
      bill.paymentDate = Date.now();
      const updatedBill = await bill.save();
      res.json(updatedBill);
    } else {
      res.status(404).json({ message: 'Bill not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a bill (Admin)
// @route   POST /api/bills
// @access  Private (Admin)
const createBill = async (req, res) => {
  const { title, type, amount, dueDate, citizenId } = req.body;

  try {
    const bill = new Bill({
      title,
      type,
      amount,
      dueDate,
      citizen: citizenId
    });

    const createdBill = await bill.save();
    res.status(201).json(createdBill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bills (Admin)
// @route   GET /api/bills
// @access  Private (Admin)
const getBills = async (req, res) => {
  try {
    const bills = await Bill.find({}).populate('citizen', 'name email');
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyBills,
  payBill,
  createBill,
  getBills
};
