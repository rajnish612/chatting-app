import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function checkFollows() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const users = await User.find({}).select("username followers followings");
    
    console.log("=== Current Follow Relationships ===");
    users.forEach(user => {
      console.log(`\nUser: ${user.username} (${user._id})`);
      console.log(`  Followers: ${user.followers?.length || 0}`, user.followers);
      console.log(`  Followings: ${user.followings?.length || 0}`, user.followings);
    });
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
}

checkFollows();