const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Required for Windows + MongoDB Atlas SSL compatibility.
      // The default Node.js TLS stack sometimes rejects Atlas certificates
      // with "SSL alert number 80". Setting tlsInsecure bypasses strict
      // certificate checking during local development.
      //
      // IMPORTANT: In production, resolve this properly by either:
      //   1. Whitelisting the server's IP in MongoDB Atlas Network Access, OR
      //   2. Ensuring the server's CA bundle is up-to-date.
      // Do NOT leave tlsInsecure: true in a production environment.
      tls: true,
      tlsInsecure: true,
      serverSelectionTimeoutMS: 10000, // fail fast if Atlas is unreachable
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
