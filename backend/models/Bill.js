const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // e.g. "Water Bill - March 2026"
    },
    type: {
      type: String,
      enum: ['water', 'electricity', 'tax', 'other'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'overdue'],
      default: 'unpaid',
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentDate: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Bill', billSchema);
