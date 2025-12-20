import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_SECRET}@ahiya.ccupua1.mongodb.net/?retryWrites=true&w=majority&appName=Ahiya`;

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    console.log("MongoDB connected");
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};
export default connectDB;
