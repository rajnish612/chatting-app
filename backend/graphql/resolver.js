import Message from "../models/messages.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
const resolver = {
  Query: {
    searchUsers: async (__, { query }, { req }) => {
      try {
        const users = await User.find({
          $and: [
            {
              $or: [
                { username: { $regex: query, $options: "i" } },
                { name: { $regex: query, $options: "i" } },
              ],
            },
            { username: { $ne: req?.session?.user } },
          ],
        })
        .limit(20);
        
        // Manually populate to avoid ObjectId casting errors
        const result = [];
        for (const user of users) {
          const followersData = [];
          const followingsData = [];
          
          if (user.followers && user.followers.length > 0) {
            for (const followerId of user.followers) {
              if (mongoose.Types.ObjectId.isValid(followerId)) {
                const follower = await User.findById(followerId, "_id username email");
                if (follower) followersData.push(follower);
              }
            }
          }
          
          if (user.followings && user.followings.length > 0) {
            for (const followingId of user.followings) {
              if (mongoose.Types.ObjectId.isValid(followingId)) {
                const following = await User.findById(followingId, "_id username email");
                if (following) followingsData.push(following);
              }
            }
          }
          
          result.push({
            _id: user._id,
            email: user.email,
            username: user.username,
            followers: followersData,
            followings: followingsData
          });
        }
        
        return result;
      } catch (error) {
        console.error("Error in searchUsers:", error);
        return [];
      }
    },
    getRandomUsers: async (__, args, { req }) => {
      if (!req?.session?.user) return null;
      console.log("getRandomUsers - session user:", req?.session?.user);

      try {
        // Use find instead of aggregate for easier population
        const randomUsers = await User.find({
          username: { $ne: req?.session?.user }
        })
        .limit(10);
        
        // Manually populate to avoid ObjectId casting errors
        const result = [];
        for (const user of randomUsers) {
          const followersData = [];
          const followingsData = [];
          
          if (user.followers && user.followers.length > 0) {
            for (const followerId of user.followers) {
              if (mongoose.Types.ObjectId.isValid(followerId)) {
                const follower = await User.findById(followerId, "_id username email");
                if (follower) followersData.push(follower);
              }
            }
          }
          
          if (user.followings && user.followings.length > 0) {
            for (const followingId of user.followings) {
              if (mongoose.Types.ObjectId.isValid(followingId)) {
                const following = await User.findById(followingId, "_id username email");
                if (following) followingsData.push(following);
              }
            }
          }
          
          result.push({
            _id: user._id,
            email: user.email,
            username: user.username,
            followers: followersData,
            followings: followingsData
          });
        }
        
        // Shuffle the results to make them random
        const shuffled = result.sort(() => 0.5 - Math.random());
        
        console.log("getRandomUsers - returning", shuffled.length, "users");
        return shuffled;
      } catch (error) {
        console.error("Error in getRandomUsers:", error);
        return [];
      }
    },
    getChats: async (parent, args, { req }) => {
      let selfUsername = req?.session?.user;
      const chatUsersWithUnseen = await Message.aggregate([
        {
          $match: {
            $or: [{ sender: selfUsername }, { receiver: selfUsername }],
          },
        },
        {
          $project: {
            user: {
              $cond: [
                { $eq: ["$sender", selfUsername] },
                "$receiver", // if you are sender, other user is receiver
                "$sender", // else, other user is sender
              ],
            },
          },
        },
        {
          $group: {
            _id: "$user",
          },
        },
        {
          $lookup: {
            from: "messages", // collection name must match your MongoDB collection
            let: { otherUser: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$receiver", selfUsername] },
                      { $eq: ["$sender", "$$otherUser"] },
                      { $eq: ["$isSeen", false] },
                    ],
                  },
                },
              },
              { $count: "unseenCount" },
            ],
            as: "unseenMessages",
          },
        },
        {
          $project: {
            username: "$_id",
            unseenCount: {
              $cond: [
                { $gt: [{ $size: "$unseenMessages" }, 0] },
                { $arrayElemAt: ["$unseenMessages.unseenCount", 0] },
                0,
              ],
            },
          },
        },
      ]);
      return chatUsersWithUnseen;
    },
    self: async (parent, args, { req }) => {
      if (!req?.session?.user) return null;
      console.log("Self query - session user:", req?.session?.user, typeof req?.session?.user);
      
      try {
        let user = await User.findOne({
          username: req?.session?.user,
        });
        
        if (!user) {
          console.log("User not found for username:", req?.session?.user);
          return null;
        }

        // Manually populate to handle any data inconsistencies
        const followersData = [];
        const followingsData = [];
        
        if (user.followers && user.followers.length > 0) {
          for (const followerId of user.followers) {
            if (mongoose.Types.ObjectId.isValid(followerId)) {
              const follower = await User.findById(followerId, "_id username email");
              if (follower) followersData.push(follower);
            }
          }
        }
        
        if (user.followings && user.followings.length > 0) {
          for (const followingId of user.followings) {
            if (mongoose.Types.ObjectId.isValid(followingId)) {
              const following = await User.findById(followingId, "_id username email");
              if (following) followingsData.push(following);
            }
          }
        }
        
        const result = {
          _id: user._id,
          email: user.email,
          username: user.username,
          followers: followersData,
          followings: followingsData
        };

        console.log("Self query - returning user:", result.username, "followers:", result.followers.length, "followings:", result.followings.length);
        return result;
      } catch (error) {
        console.error("Error in self query:", error);
        return null;
      }
    },
    getAllMessages: async (parent, args, { req }) => {
      if (!req?.session?.user) return null;
      let messages = await Message.find({
        $or: [
          { sender: req.session.user },
          { receiver: req.session.user },
        ],
      });

      return messages;
    },
    getAllUsers: async (parent, args, { req }) => {
      if (!req?.session?.user) return null;
      
      try {
        const users = await User.find({
          username: { $ne: req?.session?.user },
        })
        .select("-password");
        
        if (!users || users.length === 0) return [];
        
        // Manually populate to avoid ObjectId casting errors
        const result = [];
        for (const user of users) {
          const followersData = [];
          const followingsData = [];
          
          if (user.followers && user.followers.length > 0) {
            for (const followerId of user.followers) {
              if (mongoose.Types.ObjectId.isValid(followerId)) {
                const follower = await User.findById(followerId, "_id username email");
                if (follower) followersData.push(follower);
              }
            }
          }
          
          if (user.followings && user.followings.length > 0) {
            for (const followingId of user.followings) {
              if (mongoose.Types.ObjectId.isValid(followingId)) {
                const following = await User.findById(followingId, "_id username email");
                if (following) followingsData.push(following);
              }
            }
          }
          
          result.push({
            _id: user._id,
            email: user.email,
            username: user.username,
            followers: followersData,
            followings: followingsData
          });
        }
        
        return result;
      } catch (error) {
        console.error("Error in getAllUsers:", error);
        return [];
      }
    },
  },

  Mutation: {
    SeeMessages: async (parent, args) => {
      const { sender, receiver } = args;
      const messages = await Message.updateMany(
        { sender, receiver },
        { $set: { isSeen: true } }
      );
      const updatedMessages = await Message.find({ sender, receiver });
      return updatedMessages;
    },
    getMessages: async (parent, args, { req }) => {
      if (!req?.session?.user) return null;
      const { sender, receiver } = args;
      if (!sender || !receiver) throw new Error("Messages not available");
      const messages = await Message.find({
        $or: [
          { sender: sender, receiver: receiver },
          { sender: receiver, receiver: sender },
        ],
      });
      return messages;
    },
    login: async (parent, args, { req }) => {
      const { email, password } = args;
      if (!email || !password) {
        throw new Error("All fields are required");
      }
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.findOne({ username: email });
      }
      if (!user) {
        throw new Error("Invalid credentials");
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid credentials");
      }
      req.session.user = user.username;

      return "Login successful";
    },

    register: async (parent, args) => {
      const { email, password, username } = args;
      if (!email || !password || !username) {
        throw new Error("All fields are required");
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });
      if (existingUser) {
        throw new Error("User already exists with this email or username");
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser = new User({
        email,
        username,
        password: hashedPassword,
        followings: [],
        followers: []
      });

      await newUser.save();
      return "Registration successful";
    },

    follow: async (parent, args, { req }) => {
      try {
        console.log("Follow mutation called with args:", args);
        console.log("Session user:", req?.session?.user);
        
        if (!req?.session?.user) {
          throw new Error("Unauthorized - No session found");
        }
        
        const { userId } = args;
        if (!userId) {
          throw new Error("User ID is required");
        }
        
        console.log("Looking for current user with username:", req.session.user);
        // Get current user
        let currentUser = await User.findOne({ username: req.session.user });
        if (!currentUser) {
          throw new Error("Current user not found in database");
        }
        
        console.log("Current user found:", currentUser.username, "ID:", currentUser._id);
        console.log("Target user ID:", userId);
        
        let userToFollow = await User.findById(userId);
        if (!userToFollow) {
          throw new Error("User to follow not found");
        }
        
        console.log("Target user found:", userToFollow.username, "ID:", userToFollow._id);
        console.log("Current followers of target user:", userToFollow.followers);
        console.log("Current followings of current user:", currentUser.followings);
        
        // Check if already following - convert ObjectIds to strings for comparison
        const isAlreadyFollowing = (userToFollow.followers && userToFollow.followers.length > 0) 
          ? userToFollow.followers.some(followerId => 
              followerId.toString() === currentUser._id.toString()
            )
          : false;
        console.log("Is already following?", isAlreadyFollowing);
        
        // Use a session for atomic operations
        const session = await mongoose.startSession();
        
        try {
          await session.withTransaction(async () => {
            if (isAlreadyFollowing) {
              console.log("Unfollowing user...");
              // Unfollow
              await User.findOneAndUpdate(
                { _id: currentUser._id },
                { $pull: { followings: userToFollow._id } },
                { session, new: true }
              );
              await User.findOneAndUpdate(
                { _id: userToFollow._id },
                { $pull: { followers: currentUser._id } },
                { session, new: true }
              );
              console.log("Unfollow operation completed");
            } else {
              console.log("Following user...");
              // Follow
              await User.findOneAndUpdate(
                { _id: currentUser._id },
                { $addToSet: { followings: userToFollow._id } },
                { session, new: true }
              );
              await User.findOneAndUpdate(
                { _id: userToFollow._id },
                { $addToSet: { followers: currentUser._id } },
                { session, new: true }
              );
              console.log("Follow operation completed");
            }
          });
        } finally {
          await session.endSession();
        }
        
        // Wait a moment for DB to sync and return updated current user
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const updatedUser = await User.findById(currentUser._id);
        
        
        // Manually populate to avoid any casting errors
        const followersData = [];
        const followingsData = [];
        
        if (updatedUser.followers && updatedUser.followers.length > 0) {
          for (const followerId of updatedUser.followers) {
            if (mongoose.Types.ObjectId.isValid(followerId)) {
              const follower = await User.findById(followerId, "_id username email");
              if (follower) followersData.push(follower);
            }
          }
        }
        
        if (updatedUser.followings && updatedUser.followings.length > 0) {
          for (const followingId of updatedUser.followings) {
            if (mongoose.Types.ObjectId.isValid(followingId)) {
              const following = await User.findById(followingId, "_id username email");
              if (following) followingsData.push(following);
            }
          }
        }
        
        const result = {
          _id: updatedUser._id,
          email: updatedUser.email,
          username: updatedUser.username,
          followers: followersData,
          followings: followingsData
        };
          
        console.log("Returning updated user:", {
          username: result.username,
          followersCount: result.followers.length,
          followingsCount: result.followings.length
        });
        
        return result;
      } catch (error) {
        throw new Error(error.message || error);
      }
    },
  },
};

export default resolver;
