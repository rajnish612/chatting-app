import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function fixUndefinedArrays() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Fix users with undefined followers or followings arrays
    const result = await User.updateMany(
      {
        $or: [
          { followers: { $exists: false } },
          { followings: { $exists: false } },
          { followers: undefined },
          { followings: undefined }
        ]
      },
      {
        $set: {
          followers: [],
          followings: []
        }
      }
    );

    console.log(`Fixed ${result.modifiedCount} users with undefined arrays`);

    // Check the results
    const users = await User.find({}).select("username followers followings");
    console.log("\n=== Updated Follow Relationships ===");
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

fixUndefinedArrays();