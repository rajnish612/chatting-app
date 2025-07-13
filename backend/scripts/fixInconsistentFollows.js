import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function fixInconsistentFollows() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear all follow relationships to start fresh
    console.log("Clearing all follow relationships...");
    await User.updateMany({}, {
      $set: {
        followers: [],
        followings: []
      }
    });

    // Check the results
    const users = await User.find({}).select("username followers followings");
    console.log("\n=== Cleared Follow Relationships ===");
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

fixInconsistentFollows();