import Message from "../models/messages.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
const resolver = {
  Query: {
    searchUsers: async (__, { query }, { req }) => {
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
      }).limit(20);
      return users;
    },
    getRandomUsers: async (__, args, { req }) => {
      if (!req?.session?.user) return null;
      console.log(req?.session?.user);

      const randomUsers = await User.aggregate([
        { $match: { username: { $ne: req?.session?.user } } },
        { $sample: { size: 10 } },
      ]);
      return randomUsers;
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
      let user = await User.findOne({
        username: req?.session?.user,
      });

      return user;
    },
    getAllMessages: async (parent, args, { req }) => {
      if (!req?.session?.user) return null;
      let messages = await Message.find({
        $or: [
          { sender: req.session.user.username },
          { receiver: req.session.user.username },
        ],
      });

      return messages;
    },
    getAllUsers: async (parent, args, { req }) => {
      if (!req?.session?.user) return null;
      const users = await User.find({
        username: { $ne: req?.session?.user?.username },
      }).select("-password");
      if (!users) throw new error("No users found");
      return users;
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
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid credentials");
      }
      req.session.user = user;

      return "Login successful";
    },

    follow: async (parent, args, { req }) => {
      try {
        const { user } = req.session;

        if (user) {
          let followUsername = args.username;
          if (!followUsername) {
            throw new Error("usename is required");
          }
          let userToFollow = await User.findOne({ username: followUsername });
          if (!userToFollow) {
            throw new Error("user not found");
          }
          let self = await User.findOne({ username: user.username });
          if (userToFollow.followers.includes(user.username)) {
            await User.findOneAndUpdate(
              { username: user.username },
              { $pull: { followings: userToFollow.username } }
            );
            await User.findOneAndUpdate(
              { username: userToFollow.username },
              { $pull: { followers: user.username } }
            );
            return user;
          }

          if (!userToFollow) {
            throw new Error("user not found");
          }
          await User.findOneAndUpdate(
            { username: user.username },
            { $addToSet: { followings: userToFollow.username } }
          );

          await User.findOneAndUpdate(
            { username: userToFollow.username },
            { $addToSet: { followers: user.username } }
          );
          return user;
        }
        throw new Error("Unauthorized");
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

export default resolver;
