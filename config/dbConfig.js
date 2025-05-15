
const mongoose = require("mongoose");
const uri = "mongodb+srv://AhiyaDB:gUM0UoXXmYFjpTIn@ahiya.ccupua1.mongodb.net/?retryWrites=true&w=majority&appName=Ahiya";

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
