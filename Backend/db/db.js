import mongoose from "mongoose";

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECT);
    console.log("DB Connected");
  } catch (error) {
    console.log("DB Error:", error);
  }
};

export default connectToDb;