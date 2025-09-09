const cors = require('cors');
const dotenv = require ("dotenv");

dotenv.config();

const corsOptions = {
  origin: process.env.CLIENT_PATH || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Add the HTTP methods you need
  allowedHeaders: ["Content-Type", "Authorization", 'Cache-Control', 'Pragma'], // Add the headers you want to allow
  credentials: true,
};

const CorsMiddleware = cors(corsOptions);

module.exports = {
  CorsMiddleware,
  corsOptions,
};