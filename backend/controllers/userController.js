const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Bill = require('../models/Bill');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system analytics
// @route   GET /api/users/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const complaintCount = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const billCount = await Bill.countDocuments();
    const unpaidBills = await Bill.countDocuments({ status: 'unpaid' });

    res.json({
      users: userCount,
      complaints: {
        total: complaintCount,
        pending: pendingComplaints,
      },
      bills: {
        total: billCount,
        unpaid: unpaidBills,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getAnalytics
};
