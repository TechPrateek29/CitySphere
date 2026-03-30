const express = require('express');
const router = express.Router();
const { getUsers, getAnalytics } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/analytics')
  .get(protect, authorize('admin'), getAnalytics);

module.exports = router;
