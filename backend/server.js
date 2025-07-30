import express from "express";
import bodyParser from "body-parser";
import connectDB from "./lib/connection.js";
import Authrouter from "./routes/auth.js";
import Homerouter from "./routes/home.js";
import Documentsrouter from "./routes/documents.js";
import { Server } from "socket.io";
import http from "http";
import session, { Cookie } from "express-session";
import dotenv from "dotenv";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import fileUpload from "express-fileupload";
import sharedsession from "express-socket.io-session";
import Message from "./models/messages.js";
import Document from "./models/documents.js";
import { ApolloServer } from "@apollo/server";
import typeDefs from "./graphql/schema.js";
import resolver from "./graphql/resolver.js";
import { upload } from "./lib/Uploader.js";
import UploadRouter from "./routes/Upload.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();
const server = http.createServer(app);
const apolloServer = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolver,
});
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL,
      "http://192.168.1.6:5173",
      "http://192.168.1.6:5174",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
connectDB();
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      "http://192.168.1.6:5173",
      "http://192.168.1.6:5174",
    ],
    credentials: true,
  })
);
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
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
    try {
      // Validate required fields
      if (!sender || !receiver || !content) {
        console.error("Message validation failed: missing required fields", {
          sender,
          receiver,
          content: content ? "provided" : "missing",
        });
        return;
      }

      let newMessage = new Message({
        sender,
        receiver,
        content,
        isSeen: false,
      });
      await newMessage.save();
      io.to(receiver).emit("receive", { sender, receiver, content });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });
  socket.on("messageSeenByReceiver", async ({ sender, receiver }) => {
    io.to(sender).emit("messageSeen", { receiver });
  });

  socket.on("deleteMessage", ({ from, to, _id }) => {
    console.log("deleteMessage", from, to, _id);
  });
  socket.on("call-user", ({ from, to, offer, type }) => {
    console.log(from, to, type);

    io.to(to).emit("receive-call", {
      from: from,
      offer: offer,
      type: type,
    });
  });

  socket.on("answer-call", ({ to, from, answer }) => {
    io.to(to).emit("call-answered", {
      from: from,
      answer,
    });
  });

  socket.on("ice-candidate", ({ to, from, candidate }) => {
    io.to(to).emit("ice-candidate", {
      from: from,
      candidate,
    });
  });
  socket.on("call-ended", ({ to, from }) => {
    io.to(to).emit("call-ended", {
      from: from,
    });
  });

  socket.on("sendDocument", async ({ sender, receiver, document }) => {
    try {
      io.to(receiver).emit("receiveDocument", { sender, receiver, document });
    } catch (error) {
      console.error("Error sending document:", error);
    }
  });

  socket.on("documentSeenByReceiver", async ({ sender, receiver }) => {
    io.to(sender).emit("documentSeen", { receiver });
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
  });
});
await apolloServer.start();

app.use(
  "/graphql",
  expressMiddleware(apolloServer, {
    context: async ({ req, res }) => {
      return { req, res };
    },
  })
);
app.use("/api/auth", Authrouter);
app.use("/api/users", Homerouter);
app.use("/api/documents", Documentsrouter);
app.use("/api/upload", UploadRouter);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

server.listen(3000, () => console.log("Server running on port 3000"));
