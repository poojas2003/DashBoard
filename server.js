require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Transaction = require('./models/Transaction');
const imap = require('./services/emailReader');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Start email reading
imap.connect();

// API to fetch transactions
app.get('/api/transactions', async (req, res) => {
  const data = await Transaction.find().sort({ date: -1 });
  res.json(data);
});

app.listen(5000, () => console.log("Server running on port 5000"));