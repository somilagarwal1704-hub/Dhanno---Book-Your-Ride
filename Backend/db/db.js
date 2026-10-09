import mongoose from "mongoose";

const connectToDb = async () => {
  try {
    if (!process.env.DB_CONNECT) {
      throw new Error("DB_CONNECT is not set in the environment");
    }
    await mongoose.connect(process.env.DB_CONNECT);
    console.log("DB Connected");
  } catch (error) {
    console.log("DB Error:", error.message);
  }
};

export default connectToDb;
