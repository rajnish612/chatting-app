const typeDefs = `#graphql
type ProfilePic {
  public_id: String
  url: String
}
type User {
  _id: ID!
  email: String!
  username: String!
  name: String
  bio: String
  profilePic:ProfilePic
  followings: [User]
  followers: [User]
  blockedUsers: [User]
}
type chatPreview {
  username: String!
  profilePic:ProfilePic
  unseenCount: Int!
  lastMessage: String
  lastMessageType: String
  lastMessageTime: String
}
type Message {
  _id: ID!
  sender: String!
  receiver: String!
  isSeen: Boolean!
  content: String!
  timestamp: String!
  deletedFor: [String]
  deletedForEveryone: Boolean
}

type Document {
  _id: ID!
  sender: String!
  receiver: String!
  fileName: String!
  originalName: String!
  fileSize: Int!
  fileType: String!
  filePath: String!
  fileUrl: String!
  description: String
  timestamp: String!
  isSeen: Boolean!
}

type AudioMessage {
  _id: ID!
  sender: String!
  receiver: String!
  audioData: String!
  duration: Int!
  fileType: String!
  fileSize: Int
  timestamp: String!
  isSeen: Boolean!
  isPlayed: Boolean!
  deletedFor: [String]
  deletedForEveryone: Boolean
}
type Query {
  getChats: [chatPreview]
  getRandomUsers: [User]
  self: User
  getUser(username: String!): User
  searchUsers(query: String!): [User]
  getAllMessages: [Message]
  getAllUsers: [User]
  getBlockedUsers: [User]
}
type Mutation {
  blockUser(selfId:ID!,username:String!):String
  unblockUser(userId: ID!): String
  updatePassword(currentPassword: String!, newPassword: String!): String
  updateProfile(name: String, bio: String): String
  sendEmailChangeOTP(password: String!, newEmail: String!): String
  verifyEmailChangeOTP(otp: String!): String
  sendPasswordResetOTP(email: String!): String
  sendPasswordChangeOTP: String
  resetPasswordWithOTP(email: String!, otp: String!, newPassword: String!): String
  changePasswordWithOTP(otp: String!, newPassword: String!): String
  deactivateAccount(password: String!): String
  SeeMessages(sender: String!, receiver: String!): [Message]
  login(email: String!, password: String!): String
  sendRegistrationOTP(email: String!, password: String!, username: String!, name: String, bio: String): String
  verifyRegistrationOTP(email: String!, otp: String!): String
  register(email: String!, password: String!, username: String!, name: String, bio: String): String
  follow(userId: ID!): User
  getMessages(sender: String!, receiver: String!): [Message]
  getDocuments(sender: String!, receiver: String!): [Document]
  getAudioMessages(sender: String!, receiver: String!, limit: Int, skip: Int): [AudioMessage]
  getAudioData(messageId: ID!): AudioMessage
  seeAudioMessages(sender: String!, receiver: String!): [AudioMessage]
  deleteMessage(messageId: ID!, deleteType: String!): String
  deleteAudioMessage(messageId: ID!, deleteType: String!): String
}
`;

export default typeDefs;
