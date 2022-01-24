const express = require('express');
// const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const api = require('./routes/api');

// INITIALIZE API EXPRESS SERVER
const app = express();

// API SERVER MIDDLEWARS
app.use(cors());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});
app.use(express.json());
// if(process.env.NODE_ENV === 'development'){
// app.use(morgan('dev'));
// }
app.use(cookieParser());

/// API ROUTE
app.use('/api', api);

const PORT = process.env.PORT || 4040;
app.listen(PORT, () => {
  console.log(`SERVER LISTENING 🔊`);
});
