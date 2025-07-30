import Message from "../models/messages.js";
import Document from "../models/documents.js";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import {
  generateOTP,
  sendOTPEmail,
  sendEmailUpdateConfirmation,
} from "../utils/emailService.js";
const resolver = {
  Query: {
    getUser: async (_, args) => {
      try {
        const { username } = args;
        if (!username) throw new Error("unable to fetch");
        const user = await User.findOne({ username: username }).populate(
          "followers followings"
        );
        if (!user) throw new Error("user not found");
        return user;
      } catch (err) {
        console.log(err);
        throw new Error("user not found");
      }
    },
    searchUsers: async (__, { query }, { req }) => {
      const username = req?.session?.user;
      const self = await User.findOne({
        username: username,
      });

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
            { _id: { $nin: self.blockedUsers } },
            { _id: { $nin: self.blockedBy } },
          ],
        }).limit(20);

        // Manually populate to avoid ObjectId casting errors
        const result = [];
        for (const user of users) {
          const followersData = [];
          const followingsData = [];

          if (user.followers && user.followers.length > 0) {
            for (const followerId of user.followers) {
              if (mongoose.Types.ObjectId.isValid(followerId)) {
                const follower = await User.findById(
                  followerId,
                  "_id username name bio"
                );
                if (follower) followersData.push(follower);
              }
            }
          }

          if (user.followings && user.followings.length > 0) {
            for (const followingId of user.followings) {
              if (mongoose.Types.ObjectId.isValid(followingId)) {
                const following = await User.findById(
                  followingId,
                  "_id username name bio"
                );
                if (following) followingsData.push(following);
              }
            }
          }

          result.push({
            _id: user._id,
            username: user.username,
            name: user.name,
            bio: user.bio,
            profilePic: {
              url: user?.profilePic?.url,
            },
            followers: followersData,
            followings: followingsData,
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
      const self = await User.findOne({
        username: req?.session?.user,
      });
      try {
        const randomUsers = await User.find({
          username: { $ne: req?.session?.user },
          _id: {
            $nin: [...(self.blockedUsers || []), ...(self.blockedBy || [])],
          },
        }).limit(10);

        const result = [];
        for (const user of randomUsers) {
          const followersData = [];
          const followingsData = [];

          if (user.followers && user.followers.length > 0) {
            for (const followerId of user.followers) {
              if (mongoose.Types.ObjectId.isValid(followerId)) {
                const follower = await User.findById(
                  followerId,
                  "_id username name bio"
                );
                if (follower) followersData.push(follower);
              }
            }
          }

          if (user.followings && user.followings.length > 0) {
            for (const followingId of user.followings) {
              if (mongoose.Types.ObjectId.isValid(followingId)) {
                const following = await User.findById(
                  followingId,
                  "_id username name bio"
                );
                if (following) followingsData.push(following);
              }
            }
          }

          result.push({
            _id: user._id,
            username: user.username,
            name: user.name,
            bio: user.bio,
            profilePic: {
              url: user?.profilePic?.url,
            },
            followers: followersData,
            followings: followingsData,
          });
        }

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
      const self = await User.findOne({ username: selfUsername });
      console.log("DEBUG - self.blockedUsers:", self.blockedUsers);
      console.log("DEBUG - self.blockedBy:", self.blockedBy);

      // Get all users from messages, documents, and audio messages
      const allChatUsers = await Promise.all([
        // From regular messages
        Message.aggregate([
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
                  "$receiver",
                  "$sender",
                ],
              },
            },
          },
          {
            $group: {
              _id: "$user",
              username: { $first: "$user" },
            },
          },
        ]),
        // From documents
        Document.aggregate([
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
                  "$receiver",
                  "$sender",
                ],
              },
            },
          },
          {
            $group: {
              _id: "$user",
              username: { $first: "$user" },
            },
          },
        ]),
      ]);

      // Combine and deduplicate users
      const uniqueUsers = new Map();
      allChatUsers.flat().forEach((user) => {
        if (user.username) {
          uniqueUsers.set(user.username, user);
        }
      });

      // Convert back to array for further processing
      const combinedUsers = Array.from(uniqueUsers.values());

      // Now get unseen message counts for each user
      const chatUsersWithUnseen = [];
      for (const user of combinedUsers) {
        // Get unseen text message count
        const unseenMessages = await Message.aggregate([
          {
            $match: {
              receiver: selfUsername,
              sender: user.username,
              isSeen: false,
            },
          },
          { $count: "unseenCount" },
        ]);

        // Get user details and check if blocked
        const userDetails = await User.findOne({ username: user.username });
        if (!userDetails) continue;

        // Check if user is blocked
        const isBlocked =
          self.blockedUsers?.some(
            (blockedId) => blockedId.toString() === userDetails._id.toString()
          ) ||
          self.blockedBy?.some(
            (blockedById) =>
              blockedById.toString() === userDetails._id.toString()
          );

        if (isBlocked) continue;

        // Get last message from all sources
        const lastMessages = await Promise.all([
          // Last text message
          Message.findOne({
            $or: [
              { sender: selfUsername, receiver: user.username },
              { sender: user.username, receiver: selfUsername },
            ],
          })
            .sort({ _id: -1 })
            .lean(),


          // Last document
          Document.findOne({
            $or: [
              { sender: selfUsername, receiver: user.username },
              { sender: user.username, receiver: selfUsername },
            ],
          })
            .sort({ timestamp: -1 })
            .lean(),
        ]);

        // Find the most recent message
        let lastMessage = null;
        let lastMessageType = null;
        let lastMessageTime = null;
        let mostRecentTime = 0;

        if (lastMessages[0]) {
          // Text message
          const time = lastMessages[0]._id.getTimestamp().getTime();
          if (time > mostRecentTime) {
            mostRecentTime = time;
            lastMessage = lastMessages[0].content;
            lastMessageType = "text";
            lastMessageTime = lastMessages[0]._id.getTimestamp().toISOString();
          }
        }


        if (lastMessages[2]) {
          // Document
          const time = new Date(lastMessages[2].timestamp).getTime();
          if (time > mostRecentTime) {
            mostRecentTime = time;
            lastMessage = `📄 ${lastMessages[2].originalName}`;
            lastMessageType = "document";
            lastMessageTime = lastMessages[2].timestamp;
          }
        }
        console.log(userDetails);

        chatUsersWithUnseen.push({
          _id: userDetails._id,
          username: user.username,
          profilePic: {
            public_id: userDetails?.profilePic?.public_id,
            url: userDetails?.profilePic?.url,
          },
          unseenCount:
            unseenMessages.length > 0 ? unseenMessages[0].unseenCount : 0,
          name: userDetails?.name,
          lastMessage,
          lastMessageType,
          lastMessageTime,
        });
      }

      // Sort by last message time (most recent first)
      chatUsersWithUnseen.sort((a, b) => {
        if (!a.lastMessageTime && !b.lastMessageTime) return 0;
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      });

      console.log(
        "DEBUG - chatUsersWithUnseen:",
        JSON.stringify(chatUsersWithUnseen, null, 2)
      );
      console.log("chatwith unseen", chatUsersWithUnseen);

      return chatUsersWithUnseen;
    },
    self: async (parent, args, { req }) => {
      if (!req?.session?.user) return null;
      console.log(
        "Self query - session user:",
        req?.session?.user,
        typeof req?.session?.user
      );

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
        const blockedUsersData = [];

        if (user.followers && user.followers.length > 0) {
          for (const followerId of user.followers) {
            if (mongoose.Types.ObjectId.isValid(followerId)) {
              const follower = await User.findById(
                followerId,
                "_id username email name bio profilePic"
              );
              if (follower) followersData.push(follower);
            }
          }
        }

        if (user.followings && user.followings.length > 0) {
          for (const followingId of user.followings) {
            if (mongoose.Types.ObjectId.isValid(followingId)) {
              const following = await User.findById(
                followingId,
                "_id username email name bio profilePic"
              );
              if (following) followingsData.push(following);
            }
          }
        }

        if (user.blockedUsers && user.blockedUsers.length > 0) {
          for (const blockedUserId of user.blockedUsers) {
            if (mongoose.Types.ObjectId.isValid(blockedUserId)) {
              const blockedUser = await User.findById(
                blockedUserId,
                "_id username email"
              );
              if (blockedUser) blockedUsersData.push(blockedUser);
            }
          }
        }

        const result = {
          _id: user._id,
          email: user.email,
          username: user.username,
          name: user.name,
          bio: user.bio,
          profilePic: {
            public_id: user?.profilePic?.public_id,
            url: user?.profilePic?.url,
          },
          followers: followersData,
          followings: followingsData,
          blockedUsers: blockedUsersData,
        };

        return result;
      } catch (error) {
        console.error("Error in self query:", error);
        return null;
      }
    },
    getAllMessages: async (parent, args, { req }) => {
      if (!req?.session?.user) return null;
      let messages = await Message.find({
        $or: [{ sender: req.session.user }, { receiver: req.session.user }],
      });

      return messages;
    },
    getAllUsers: async (parent, args, { req }) => {
      if (!req?.session?.user) return null;

      try {
        const users = await User.find({
          username: { $ne: req?.session?.user },
        }).select("-password");

        if (!users || users.length === 0) return [];

        // Manually populate to avoid ObjectId casting errors
        const result = [];
        for (const user of users) {
          const followersData = [];
          const followingsData = [];

          if (user.followers && user.followers.length > 0) {
            for (const followerId of user.followers) {
              if (mongoose.Types.ObjectId.isValid(followerId)) {
                const follower = await User.findById(
                  followerId,
                  "_id username name bio"
                );
                if (follower) followersData.push(follower);
              }
            }
          }

          if (user.followings && user.followings.length > 0) {
            for (const followingId of user.followings) {
              if (mongoose.Types.ObjectId.isValid(followingId)) {
                const following = await User.findById(
                  followingId,
                  "_id username name bio"
                );
                if (following) followingsData.push(following);
              }
            }
          }

          result.push({
            _id: user._id,
            email: user.email,
            username: user.username,
            followers: followersData,
            followings: followingsData,
          });
        }

        return result;
      } catch (error) {
        console.error("Error in getAllUsers:", error);
        return [];
      }
    },
    getBlockedUsers: async (parent, args, { req }) => {
      if (!req?.session?.user) return null;

      try {
        const user = await User.findOne({ username: req.session.user });
        if (!user || !user.blockedUsers || user.blockedUsers.length === 0) {
          return [];
        }

        const blockedUsersData = [];
        for (const blockedUserId of user.blockedUsers) {
          if (mongoose.Types.ObjectId.isValid(blockedUserId)) {
            const blockedUser = await User.findById(
              blockedUserId,
              "_id username email name bio"
            );
            if (blockedUser) blockedUsersData.push(blockedUser);
          }
        }

        return blockedUsersData;
      } catch (error) {
        console.error("Error in getBlockedUsers:", error);
        return [];
      }
    },
  },

  Mutation: {
    blockUser: async (_, args) => {
      try {
        const { selfId, username } = args;
        if ((!selfId, !username)) throw new Error("unable to block");
        const userToBlock = await User.findOneAndUpdate(
          {
            username: username,
          },
          { $addToSet: { blockedBy: new mongoose.Types.ObjectId(selfId) } },
          { $pull: { followers: selfId, followings: selfId } },
          { new: true }
        );
        if (!userToBlock) throw new Error("unable to block");
        const self = await User.findByIdAndUpdate(selfId, {
          $addToSet: {
            blockedUsers: new mongoose.Types.ObjectId(userToBlock._id),
          },
          $pull: { followers: userToBlock._id, followings: userToBlock._id },
        });

        return "done";
      } catch (err) {
        console.log(err);
        throw new Error("unable to block");
      }
    },
    unblockUser: async (_, args, { req }) => {
      if (!req?.session?.user) throw new Error("Unauthorized");

      try {
        const { userId } = args;
        if (!userId) throw new Error("User ID is required");

        const currentUser = await User.findOne({ username: req.session.user });
        if (!currentUser) throw new Error("Current user not found");

        const userToUnblock = await User.findById(userId);
        if (!userToUnblock) throw new Error("User to unblock not found");

        // Remove from blockedUsers array and blockedBy array
        await User.findByIdAndUpdate(currentUser._id, {
          $pull: { blockedUsers: userId },
        });

        await User.findByIdAndUpdate(userId, {
          $pull: { blockedBy: currentUser._id },
        });

        return "User unblocked successfully";
      } catch (err) {
        console.error("Error in unblockUser:", err);
        throw new Error(err.message || "Unable to unblock user");
      }
    },
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
      const currentUser = req.session.user;
      if (!sender || !receiver) throw new Error("Messages not available");

      const messages = await Message.find({
        $or: [
          { sender: sender, receiver: receiver },
          { sender: receiver, receiver: sender },
        ],
        // Filter out messages deleted for current user or deleted for everyone
        deletedForEveryone: { $ne: true },
        deletedFor: { $ne: currentUser },
      });
      return messages;
    },
    getDocuments: async (parent, args, { req }) => {
      if (!req?.session?.user) return null;
      const { sender, receiver } = args;
      if (!sender || !receiver) throw new Error("Documents not available");
      const documents = await Document.find({
        $or: [
          { sender: sender, receiver: receiver },
          { sender: receiver, receiver: sender },
        ],
      }).sort({ timestamp: 1 });
      return documents;
    },
    deleteMessage: async (parent, args, { req }) => {
      if (!req?.session?.user) throw new Error("Not authenticated");
      const { messageId, deleteType } = args;
      const username = req.session.user;

      console.log(
        `🗑️ Deleting message ${messageId} for ${username}, type: ${deleteType}`
      );

      const message = await Message.findById(messageId);
      if (!message) throw new Error("Message not found");

      // Check if user has permission to delete
      if (message.sender !== username && message.receiver !== username) {
        throw new Error("Not authorized to delete this message");
      }

      if (deleteType === "forMe") {
        // Add username to deletedFor array
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { deletedFor: username },
        });
        return "Message deleted for you";
      } else if (deleteType === "forEveryone") {
        // Only sender can delete for everyone and within 1 hour
        if (message.sender !== username) {
          throw new Error("Only sender can delete for everyone");
        }

        const messageAge = Date.now() - message._id.getTimestamp().getTime();
        const oneHour = 60 * 60 * 1000;
        if (messageAge > oneHour) {
          throw new Error("Can only delete for everyone within 1 hour");
        }

        await Message.findByIdAndUpdate(messageId, {
          deletedForEveryone: true,
        });
        return "Message deleted for everyone";
      }

      throw new Error("Invalid delete type");
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

    sendRegistrationOTP: async (parent, args) => {
      const { email, password, username, name, bio } = args;
      if (!email || !password || !username) {
        throw new Error("Email, password, and username are required");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        throw new Error("User already exists with this email or username");
      }

      // Hash password for storage in OTP record
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate OTP
      const otp = generateOTP();

      // Delete any existing registration OTPs for this email
      await OTP.deleteMany({ email, type: "registration" });

      // Save OTP with registration data
      await OTP.create({
        email,
        otp,
        type: "registration",
        registrationData: {
          username,
          password: hashedPassword,
          name: name || username,
          bio: bio || "",
        },
      });

      // Send OTP email
      await sendOTPEmail(email, otp, "registration");

      return "OTP sent to your email. Please verify to complete registration.";
    },

    verifyRegistrationOTP: async (parent, args) => {
      const { email, otp } = args;
      if (!email || !otp) {
        throw new Error("Email and OTP are required");
      }

      // Find OTP record
      const otpRecord = await OTP.findOne({
        email,
        otp,
        type: "registration",
      });

      if (!otpRecord) {
        throw new Error("Invalid or expired OTP");
      }

      // Check if user still doesn't exist (in case someone registered with same details)
      const existingUser = await User.findOne({
        $or: [{ email }, { username: otpRecord.registrationData.username }],
      });
      if (existingUser) {
        await OTP.deleteOne({ _id: otpRecord._id });
        throw new Error("User already exists with this email or username");
      }

      // Create new user
      const newUser = new User({
        email,
        username: otpRecord.registrationData.username,
        name: otpRecord.registrationData.name,
        bio: otpRecord.registrationData.bio,
        password: otpRecord.registrationData.password,
        followings: [],
        followers: [],
      });

      await newUser.save();

      // Delete used OTP
      await OTP.deleteOne({ _id: otpRecord._id });

      return "Registration completed successfully! Please login.";
    },

    register: async (parent, args) => {
      // Keep the old register for backward compatibility, but recommend using OTP flow
      const { email, password, username, name, bio } = args;
      if (!email || !password || !username) {
        throw new Error("Email, password, and username are required");
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
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
        name: name || username,
        bio: bio || "",
        password: hashedPassword,
        followings: [],
        followers: [],
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

        console.log(
          "Looking for current user with username:",
          req.session.user
        );
        // Get current user
        let currentUser = await User.findOne({ username: req.session.user });
        if (!currentUser) {
          throw new Error("Current user not found in database");
        }

        console.log(
          "Current user found:",
          currentUser.username,
          "ID:",
          currentUser._id
        );
        console.log("Target user ID:", userId);

        let userToFollow = await User.findById(userId);
        if (!userToFollow) {
          throw new Error("User to follow not found");
        }

        console.log(
          "Target user found:",
          userToFollow.username,
          "ID:",
          userToFollow._id
        );
        console.log(
          "Current followers of target user:",
          userToFollow.followers
        );
        console.log(
          "Current followings of current user:",
          currentUser.followings
        );

        // Check if already following - convert ObjectIds to strings for comparison
        const isAlreadyFollowing =
          userToFollow.followers && userToFollow.followers.length > 0
            ? userToFollow.followers.some(
                (followerId) =>
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
        await new Promise((resolve) => setTimeout(resolve, 100));

        const updatedUser = await User.findById(currentUser._id);

        // Manually populate to avoid any casting errors
        const followersData = [];
        const followingsData = [];

        if (updatedUser.followers && updatedUser.followers.length > 0) {
          for (const followerId of updatedUser.followers) {
            if (mongoose.Types.ObjectId.isValid(followerId)) {
              const follower = await User.findById(
                followerId,
                "_id username email name bio"
              );
              if (follower) followersData.push(follower);
            }
          }
        }

        if (updatedUser.followings && updatedUser.followings.length > 0) {
          for (const followingId of updatedUser.followings) {
            if (mongoose.Types.ObjectId.isValid(followingId)) {
              const following = await User.findById(
                followingId,
                "_id username email name bio"
              );
              if (following) followingsData.push(following);
            }
          }
        }

        const result = {
          _id: updatedUser._id,
          email: updatedUser.email,
          username: updatedUser.username,
          followers: followersData,
          followings: followingsData,
        };

        console.log("Returning updated user:", {
          username: result.username,
          followersCount: result.followers.length,
          followingsCount: result.followings.length,
        });

        return result;
      } catch (error) {
        throw new Error(error.message || error);
      }
    },
    updatePassword: async (_, args, { req }) => {
      if (!req?.session?.user) throw new Error("Unauthorized");

      try {
        const { currentPassword, newPassword } = args;
        if (!currentPassword || !newPassword) {
          throw new Error("Current password and new password are required");
        }

        if (newPassword.length < 6) {
          throw new Error("New password must be at least 6 characters long");
        }

        const user = await User.findOne({ username: req.session.user });
        if (!user) throw new Error("User not found");

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(
          currentPassword,
          user.password
        );
        if (!isCurrentPasswordValid) {
          throw new Error("Current password is incorrect");
        }

        // Hash new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await User.findByIdAndUpdate(user._id, {
          password: hashedNewPassword,
        });

        return "Password updated successfully";
      } catch (err) {
        console.error("Error in updatePassword:", err);
        throw new Error(err.message || "Unable to update password");
      }
    },
    updateProfile: async (_, args, { req }) => {
      if (!req?.session?.user) throw new Error("Unauthorized");

      try {
        const { name, bio } = args;

        const user = await User.findOne({ username: req.session.user });
        if (!user) throw new Error("User not found");

        // Prepare update object with only provided fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;

        // If no fields to update
        if (Object.keys(updateData).length === 0) {
          throw new Error("At least one field (name or bio) must be provided");
        }

        // Update user profile
        await User.findByIdAndUpdate(user._id, updateData);

        return "Profile updated successfully";
      } catch (err) {
        console.error("Error in updateProfile:", err);
        throw new Error(err.message || "Unable to update profile");
      }
    },
    sendEmailChangeOTP: async (_, args, { req }) => {
      if (!req?.session?.user) throw new Error("Unauthorized");

      try {
        const { password, newEmail } = args;
        if (!password || !newEmail) {
          throw new Error("Password and new email are required");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
          throw new Error("Invalid email format");
        }

        const user = await User.findOne({ username: req.session.user });
        if (!user) throw new Error("User not found");

        // Verify current password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Current password is incorrect");
        }

        // Check if new email is already in use
        const existingUser = await User.findOne({ email: newEmail });
        if (
          existingUser &&
          existingUser._id.toString() !== user._id.toString()
        ) {
          throw new Error("Email is already in use by another account");
        }

        // Generate OTP
        const otp = generateOTP();

        // Delete any existing OTPs for this user's email change
        await OTP.deleteMany({
          userId: user._id.toString(),
          type: "email_change",
        });

        // Save new OTP
        await OTP.create({
          email: user.email, // Current email for identification
          otp,
          type: "email_change",
          newEmail,
          userId: user._id.toString(),
        });

        // Send OTP to new email
        await sendOTPEmail(newEmail, otp, "email_change");

        return "OTP sent to your new email address. Please check your inbox.";
      } catch (err) {
        console.error("Error in sendEmailChangeOTP:", err);
        throw new Error(err.message || "Unable to send OTP");
      }
    },
    verifyEmailChangeOTP: async (_, args, { req }) => {
      if (!req?.session?.user) throw new Error("Unauthorized");

      try {
        const { otp } = args;
        if (!otp) throw new Error("OTP is required");

        const user = await User.findOne({ username: req.session.user });
        if (!user) throw new Error("User not found");

        // Find OTP record
        const otpRecord = await OTP.findOne({
          userId: user._id.toString(),
          otp,
          type: "email_change",
        });

        if (!otpRecord) {
          throw new Error("Invalid or expired OTP");
        }

        const oldEmail = user.email;
        const newEmail = otpRecord.newEmail;

        // Update user's email
        await User.findByIdAndUpdate(user._id, {
          email: newEmail,
        });

        // Delete the used OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        // Send confirmation email (non-blocking)
        try {
          await sendEmailUpdateConfirmation(oldEmail, newEmail);
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }

        return "Email updated successfully";
      } catch (err) {
        console.error("Error in verifyEmailChangeOTP:", err);
        throw new Error(err.message || "Unable to verify OTP");
      }
    },
    sendPasswordChangeOTP: async (_, args, { req }) => {
      if (!req?.session?.user) throw new Error("Unauthorized");

      try {
        const user = await User.findOne({ username: req.session.user });
        if (!user) throw new Error("User not found");

        // Generate OTP
        const otp = generateOTP();

        // Delete any existing OTPs for this user's password change
        await OTP.deleteMany({
          userId: user._id.toString(),
          type: "password_change",
        });

        // Save new OTP
        await OTP.create({
          email: user.email,
          otp,
          type: "password_change",
          userId: user._id.toString(),
        });

        // Send OTP to user's current email
        await sendOTPEmail(user.email, otp, "password_change");

        return "OTP sent to your current email address. Please check your inbox.";
      } catch (err) {
        console.error("Error in sendPasswordChangeOTP:", err);
        throw new Error(err.message || "Unable to send OTP");
      }
    },
    changePasswordWithOTP: async (_, args, { req }) => {
      if (!req?.session?.user) throw new Error("Unauthorized");

      try {
        const { otp, newPassword } = args;
        if (!otp || !newPassword) {
          throw new Error("OTP and new password are required");
        }

        if (newPassword.length < 6) {
          throw new Error("New password must be at least 6 characters long");
        }

        const user = await User.findOne({ username: req.session.user });
        if (!user) throw new Error("User not found");

        // Find and verify OTP
        const otpRecord = await OTP.findOne({
          userId: user._id.toString(),
          otp,
          type: "password_change",
        });

        if (!otpRecord) {
          throw new Error("Invalid or expired OTP");
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await User.findByIdAndUpdate(user._id, {
          password: hashedPassword,
        });

        // Delete the used OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        return "Password changed successfully";
      } catch (err) {
        console.error("Error in changePasswordWithOTP:", err);
        throw new Error(err.message || "Unable to change password");
      }
    },
    sendPasswordResetOTP: async (_, args) => {
      try {
        const { email } = args;
        if (!email) throw new Error("Email is required");

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error("Invalid email format");
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("No account found with this email address");
        }

        // Generate OTP
        const otp = generateOTP();

        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email, type: "password_reset" });

        // Save new OTP
        const otpRecord = new OTP({
          email,
          otp,
          type: "password_reset",
        });
        await otpRecord.save();

        // Send OTP email
        await sendOTPEmail(email, otp);

        return "OTP sent successfully to your email";
      } catch (err) {
        console.error("Error in sendPasswordResetOTP:", err);
        throw new Error(err.message || "Unable to send OTP");
      }
    },
    resetPasswordWithOTP: async (_, args) => {
      try {
        const { email, otp, newPassword } = args;
        if (!email || !otp || !newPassword) {
          throw new Error("Email, OTP, and new password are required");
        }

        if (newPassword.length < 6) {
          throw new Error("New password must be at least 6 characters long");
        }

        // Find and verify OTP
        const otpRecord = await OTP.findOne({
          email,
          otp,
          type: "password_reset",
        });

        if (!otpRecord) {
          throw new Error("Invalid or expired OTP");
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("User not found");
        }

        // Hash new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await User.findByIdAndUpdate(user._id, {
          password: hashedNewPassword,
        });

        // Delete used OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        return "Password reset successfully";
      } catch (err) {
        console.error("Error in resetPasswordWithOTP:", err);
        throw new Error(err.message || "Unable to reset password");
      }
    },
    deactivateAccount: async (_, args, { req }) => {
      if (!req?.session?.user) throw new Error("Unauthorized");

      try {
        const { password } = args;
        if (!password)
          throw new Error("Password is required to deactivate account");

        const user = await User.findOne({ username: req.session.user });
        if (!user) throw new Error("User not found");

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Incorrect password");
        }

        // Start a session for atomic operations
        const session = await mongoose.startSession();

        try {
          await session.withTransaction(async () => {
            // Remove user from all followers/followings
            await User.updateMany(
              { followers: user._id },
              { $pull: { followers: user._id } },
              { session }
            );

            await User.updateMany(
              { followings: user._id },
              { $pull: { followings: user._id } },
              { session }
            );

            // Remove user from blocked lists
            await User.updateMany(
              { blockedUsers: user._id },
              { $pull: { blockedUsers: user._id } },
              { session }
            );

            await User.updateMany(
              { blockedBy: user._id },
              { $pull: { blockedBy: user._id } },
              { session }
            );

            // Delete all messages involving this user
            await Message.deleteMany(
              {
                $or: [{ sender: user.username }, { receiver: user.username }],
              },
              { session }
            );

            // Delete the user account
            await User.findByIdAndDelete(user._id, { session });
          });
        } finally {
          await session.endSession();
        }

        // Clear session
        req.session.destroy();

        return "Account deactivated successfully";
      } catch (err) {
        console.error("Error in deactivateAccount:", err);
        throw new Error(err.message || "Unable to deactivate account");
      }
    },
  },
};

export default resolver;
