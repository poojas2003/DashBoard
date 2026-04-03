const Imap = require('imap');
const { simpleParser } = require('mailparser');
const Transaction = require('../models/Transaction');

const imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

function openInbox(cb) {
  imap.openBox('INBOX', false, cb);
}

imap.once('ready', function () {
  console.log("IMAP connection ready ✅");

  openInbox(function (err, box) {
    if (err) throw err;

    imap.search(['ALL'], function (err, results) {
      if (err) throw err;

      const latest = results.slice(-10);

      const f = imap.fetch(latest, { bodies: '' });

      f.on('message', function (msg) {
        console.log("📩 Email received");

        msg.on('body', function (stream) {
          simpleParser(stream, async (err, parsed) => {
            
            if (err) return;

            const text = parsed.text || '';
            const lowerText = text.toLowerCase();

            console.log("📄 Email content:", text.substring(0, 200));
            console.log("👉 Checking condition...");  
            if (
              (lowerText.includes('debited') || lowerText.includes('credited')) &&
              text.includes('₹')
            ) {
               console.log("✅ Condition matched");
              const amountMatch = text.match(/₹\s?([\d,]+)/);
              const amount = amountMatch ? amountMatch[1].replace(/,/g, '') : 0;

              await Transaction.create({
                product: "Bank Transaction",
                category: "Finance",
                amount: amount,
                status: "Completed"
              });

              console.log("💾 Transaction saved");
            }
          });
        });
      });
    });
  });
});

imap.once('error', err => {
  console.log("IMAP Error ❌:", err.message);
});

imap.once('end', () => {
  console.log("IMAP connection ended");
});

module.exports = imap;