const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

// Explicit favicon route — must come BEFORE the catch-all below.
// Without this, mobile Chrome's request for /favicon.ico falls through
// to the catch-all and gets HTML back instead of an image, so it can't
// render an icon and shows a generic fallback instead.
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'logo.png'));
});

// Serve gta-vi-countdown.html for root and all region routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'gta-vi-countdown.html'));
});

app.listen(PORT, () => {
  console.log(`GTA VI Countdown running at http://localhost:${PORT}`);
});
