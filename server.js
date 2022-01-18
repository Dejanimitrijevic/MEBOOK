const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// INITIALIZE API EXPRESS SERVER
const app = express();
app.get('/', (req, res) => {
  res.status(200).json({
    msg: 'MEBOOK API',
  });
});

// API SERVER MIDDLEWARS
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

// API AUTHENTICATION ROUTE
const auth = require('./routes/auth');
app.use('/api/auth', auth);

const PORT = process.env.PORT || 4040;
app.listen(PORT, () => {
  console.log(`SERVER LISTENING 🔊`);
});
