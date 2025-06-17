import express from "express";
import bodyParser from "body-parser";
import connectDB from "./lib/connection.js";
import Authrouter from "./routes/auth.js";
import Homerouter from "./routes/home.js";
import { Server } from "socket.io";
import http from "http";
import session, { Cookie } from "express-session";
import dotenv from "dotenv";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import sharedsession from "express-socket.io-session";
import Message from "./models/messages.js";
import { ApolloServer } from "@apollo/server";
import typeDefs from "./graphql/schema.js";
import resolver from "./graphql/resolver.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const apolloServer = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolver,
});
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
connectDB();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
    },
  })
);

io.on("connection", (socket) => {
  socket.on("join", (id) => {
    socket.join(id);
  });
  socket.on("message", async ({ sender, receiver, content }) => {
    let newMessage = await new Message({ sender, receiver, content });
    await newMessage.save();
    io.to(receiver).emit("receive",{ sender, receiver, content });
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
await apolloServer.start();
app.use(express.json())
app.use("/graphql", expressMiddleware(apolloServer));
app.use("/api/auth", Authrouter);
app.use("/api/users", Homerouter);

server.listen(3000, () => console.log("Server running on port 3000"));
