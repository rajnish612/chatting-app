import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function fixArrays() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const users = await User.find({});
    
    for (const user of users) {
      let needsUpdate = false;
      const updateData = {};
      
      if (!Array.isArray(user.followers)) {
        updateData.followers = [];
        needsUpdate = true;
        console.log(`Fixing followers for ${user.username}`);
      }
      
      if (!Array.isArray(user.followings)) {
        updateData.followings = [];
        needsUpdate = true;
        console.log(`Fixing followings for ${user.username}`);
      }
      
      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, updateData);
        console.log(`Updated ${user.username}`);
      }
    }

    // Check the results
    const updatedUsers = await User.find({}).select("username followers followings");
    console.log("\n=== Final Follow Relationships ===");
    updatedUsers.forEach(user => {
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

fixArrays();