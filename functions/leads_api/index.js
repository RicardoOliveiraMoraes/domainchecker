'use strict';

const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.post('/', async (req, res) => {
  const { name, email, phone, company_name, sector, keywords, audience, domain_style } = req.body;

  if (!name || !email) {
    return res.status(400).json({ status: 'error', message: 'name and email are required' });
  }

  try {
    const catalystApp = catalyst.initialize(req);
    const table = catalystApp.datastore().table('leads');

    const row = await table.insertRow({
      name,
      email,
      phone: phone || '',
      company_name: company_name || '',
      sector: sector || '',
      keywords: Array.isArray(keywords) ? keywords.join(', ') : (keywords || ''),
      audience: audience || '',
      domain_style: domain_style || '',
    });

    res.status(200).json({ status: 'success', rowId: row.ROWID });
  } catch (err) {
    console.error('DataStore error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = app;
