const typeDefs = `#graphql
type User {
  _id: ID!
  email: String!
  username: String!
  followings: [String]
  followers: [String]
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
  getChats:[chatPreview]

  self: User
  getAllMessages: [Message]
  getAllUsers: [User]
   }
type Mutation {
     SeeMessages(sender:String!,receiver:String!):[Message]
    login(email: String!, password: String!): String
    follow(username:String!): User
     getMessages(sender:String!,receiver:String!):[Message]
    }
`;

export default typeDefs;
