import mongoose from "mongoose";

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

dotenv.config({ path: envPath });

const connectDB = async () => {
  const connection = await mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("mongoDB connected"))
    .catch((error) => console.log(error.message));
};

export default connectDB;