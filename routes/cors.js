const cors = require('cors');

const whitelist = ['http://localhost:3009', 'https://localhost:3452'];
const corsOptionsDelegate = (req, callback) => {
 let corsOptions;
 if (whitelist.indexOf(req.header('Origin')) !== -1) {
  corsOptions = { origin: true };
 } else {
  corsOptions = { origin: false };
 }
 callback(null, corsOptions);
};

exports.cors = cors();//middleware sets "Allow-Access-Control-Origin" to wildcard
exports.corsWithOptions = cors(corsOptionsDelegate);//middleware checks request for whitlisted origins