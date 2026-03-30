const Complaint = require('../models/Complaint');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
const createComplaint = async (req, res) => {
  const { title, description, department } = req.body;

  try {
    const complaint = new Complaint({
      title,
      description,
      citizen: req.user._id,
      department
    });

    const createdComplaint = await complaint.save();
    res.status(201).json(createdComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's complaints
// @route   GET /api/complaints/my
// @access  Private (Citizen)
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizen: req.user._id });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all complaints (for Admin) or assigned (for Field Staff)
// @route   GET /api/complaints
// @access  Private (Admin, Field Staff)
const getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'field_staff') {
      query.assignedStaff = req.user._id;
    }
    const complaints = await Complaint.find(query).populate('citizen', 'name email').populate('assignedStaff', 'name');
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Field Staff, Admin)
const updateComplaintStatus = async (req, res) => {
  const { status, updateText } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (complaint) {
      complaint.status = status || complaint.status;
      
      if (updateText) {
        complaint.updates.push({
          text: updateText,
          updatedBy: req.user._id
        });
      }

      const updatedComplaint = await complaint.save();
      res.json(updatedComplaint);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign staff to complaint
// @route   PUT /api/complaints/:id/assign
// @access  Private (Admin)
const assignComplaint = async (req, res) => {
  const { staffId } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (complaint) {
      complaint.assignedStaff = staffId;
      const updatedComplaint = await complaint.save();
      res.json(updatedComplaint);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaints,
  updateComplaintStatus,
  assignComplaint
};
