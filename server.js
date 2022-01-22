const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const auth = require('./routes/auth');

// INITIALIZE API EXPRESS SERVER
const app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
  next();
});

// API SERVER MIDDLEWARS
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

// API AUTHENTICATION ROUTE
app.all('/', (req, res) => {
  res.send({ msg: 'WELCOME MEBOOK !' });
});
app.all('/api', (req, res) => {
  res.send({ msg: 'WELCOME MEBOOK API!' });
});
app.use('/api/auth', auth);

const PORT = process.env.PORT || 4040;
app.listen(PORT, () => {
  console.log(`SERVER LISTENING 🔊`);
});
