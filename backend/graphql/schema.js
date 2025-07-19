const typeDefs = `#graphql
type User {
  _id: ID!
  email: String!
  username: String!
  name: String
  bio: String
  followings: [User]
  followers: [User]
  blockedUsers: [User]
}
type chatPreview {
  username: String!
  unseenCount: Int!
}
type Message {
  sender: String!
  receiver: String!
  isSeen: Boolean!
  content: String!
   }
type Query {
  getChats: [chatPreview]
  getRandomUsers: [User]
  self: User
  searchUsers(query: String!): [User]
  getAllMessages: [Message]
  getAllUsers: [User]
  getBlockedUsers: [User]
}
type Mutation {
  blockUser(selfId:ID!,username:String!):String
  unblockUser(userId: ID!): String
  updatePassword(currentPassword: String!, newPassword: String!): String
  deactivateAccount(password: String!): String
  SeeMessages(sender: String!, receiver: String!): [Message]
  login(email: String!, password: String!): String
  register(email: String!, password: String!, username: String!, name: String, bio: String): String
  follow(userId: ID!): User
  getMessages(sender: String!, receiver: String!): [Message]
}
`;

export default typeDefs;
