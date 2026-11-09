const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;
// truncated - will fix
app.get('/', (req,res)=>res.send('temp'));
app.listen(PORT);
