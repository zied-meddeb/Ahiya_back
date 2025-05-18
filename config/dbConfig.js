require('dotenv').config();
const mongoose = require("mongoose");
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_SECRET}@ahiya.ccupua1.mongodb.net/?retryWrites=true&w=majority&appName=Ahiya`;

const connectDB= async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
