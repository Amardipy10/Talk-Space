const cors = require('cors');

const whitelist = [
  'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:8000',
  'http://localhost:5000',

  'http://192.168.223.89:8000',
  'http://192.168.1.9:8000',
  'http://192.168.1.9:3000',

  'https://localhost:3443',
  'https://localhost:8000',

  'https://shubh-meet.herokuapp.com'
];

const corsOptionsDelegate = (req, callback) => {
  const origin = req.header('Origin');

  let corsOptions;
  if (!origin) {
    // allow Postman / same-origin
    corsOptions = { origin: true };
  } 
  else if (whitelist.includes(origin)) {
    corsOptions = { 
      origin: true,
      credentials: true
    };
  } 
  else {
    console.error('❌ Blocked by CORS:', origin);
    corsOptions = { origin: false };
  }

  callback(null, corsOptions);
};

exports.cors = cors({ origin: true });
exports.corsWithOptions = cors(corsOptionsDelegate);