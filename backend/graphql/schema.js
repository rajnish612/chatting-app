const typeDefs = `#graphql
type User {
  _id: ID!
  email: String!
  username: String!
  followings: [User]
  followers: [User]
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
}
type Mutation {
  SeeMessages(sender: String!, receiver: String!): [Message]
  login(email: String!, password: String!): String
  register(email: String!, password: String!, username: String!): String
  follow(userId: ID!): User
  getMessages(sender: String!, receiver: String!): [Message]
}
`;

export default typeDefs;
