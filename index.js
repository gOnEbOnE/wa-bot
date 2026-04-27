const express = require('express');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "tokensaya123";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// ✅ Meta verify webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ Terima & balas pesan
app.post('/webhook', async (req, res) => {
  const entry = req.body?.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (message && message.type === 'text') {
    const from = message.from;
    const text = message.text.body.toUpperCase().trim();
    console.log(`Pesan dari ${from}: ${text}`);

    let balasan = '';

    if (text === 'KATALOG') {
      balasan = `📋 *Katalog Produk:*\n1. Tepung — Rp 15.000/kg\n2. Telur — Rp 3.500/btr\n3. Butter — Rp 35.000/250gr\n4. Gula — Rp 14.000/kg\n\nBalas: *PESAN [no] [jumlah]*\nContoh: PESAN 1 2`;
    } else if (text.startsWith('PESAN')) {
      balasan = `🧾 Pesanan diterima!\nKirim bukti transfer ke:\n*BCA 1234567890* a/n Toko Bunda\n\nSetelah transfer, kirim foto bukti bayar.`;
    } else {
      balasan = `Halo! 👋 Selamat datang di *Toko Bahan Kue Bunda*\nKetik *KATALOG* untuk lihat produk.`;
    }

    await sendMessage(from, balasan);
  }

  res.sendStatus(200);
});

async function sendMessage(to, text) {
  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: text }
    })
  });
}

const path = require('path');

// Serve landing page
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot jalan di port ${PORT}`));