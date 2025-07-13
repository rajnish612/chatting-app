import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

// Clean up any invalid ObjectId references in followers/followings arrays
async function cleanUserReferences() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    const users = await User.find({});
    console.log(`Found ${users.length} users to check`);

    let fixedCount = 0;

    for (const user of users) {
      let needsUpdate = false;
      
      // Clean followers array
      const validFollowers = [];
      if (user.followers && user.followers.length > 0) {
        for (const followerId of user.followers) {
          if (mongoose.Types.ObjectId.isValid(followerId)) {
            // Check if the referenced user actually exists
            const exists = await User.findById(followerId);
            if (exists) {
              validFollowers.push(followerId);
            } else {
              console.log(`Removing non-existent follower ${followerId} from user ${user.username}`);
              needsUpdate = true;
            }
          } else {
            console.log(`Removing invalid follower ID ${followerId} from user ${user.username}`);
            needsUpdate = true;
          }
        }
      }

      // Clean followings array
      const validFollowings = [];
      if (user.followings && user.followings.length > 0) {
        for (const followingId of user.followings) {
          if (mongoose.Types.ObjectId.isValid(followingId)) {
            // Check if the referenced user actually exists
            const exists = await User.findById(followingId);
            if (exists) {
              validFollowings.push(followingId);
            } else {
              console.log(`Removing non-existent following ${followingId} from user ${user.username}`);
              needsUpdate = true;
            }
          } else {
            console.log(`Removing invalid following ID ${followingId} from user ${user.username}`);
            needsUpdate = true;
          }
        }
      }

      // Update the user if needed
      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, {
          followers: validFollowers,
          followings: validFollowings
        });
        fixedCount++;
        console.log(`Fixed user ${user.username}`);
      }
    }

    console.log(`Cleanup complete! Fixed ${fixedCount} users.`);
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the cleanup
cleanUserReferences();