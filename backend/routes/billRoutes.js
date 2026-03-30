const express = require('express');
const router = express.Router();
const {
  getMyBills,
  payBill,
  createBill,
  getBills
} = require('../controllers/billController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('admin'), createBill)
  .get(protect, authorize('admin'), getBills);

router.route('/my')
  .get(protect, authorize('citizen'), getMyBills);

router.route('/:id/pay')
  .put(protect, authorize('citizen'), payBill);

module.exports = router;
