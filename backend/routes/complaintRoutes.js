const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getComplaints,
  updateComplaintStatus,
  assignComplaint
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('citizen'), createComplaint)
  .get(protect, authorize('admin', 'field_staff'), getComplaints);

router.route('/my')
  .get(protect, authorize('citizen'), getMyComplaints);

router.route('/:id/status')
  .put(protect, authorize('admin', 'field_staff'), updateComplaintStatus);

router.route('/:id/assign')
  .put(protect, authorize('admin'), assignComplaint);

module.exports = router;
