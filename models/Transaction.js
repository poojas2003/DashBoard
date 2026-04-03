const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  product: String,
  category: String,
  amount: Number,
  status: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);