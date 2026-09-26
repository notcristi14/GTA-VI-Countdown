const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

// Serve gta-vi-countdown.html for root and all region routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'gta-vi-countdown.html'));
});

app.listen(PORT, () => {
  console.log(`GTA VI Countdown running at http://localhost:${PORT}`);
});
