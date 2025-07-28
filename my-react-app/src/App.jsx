import React, { createContext, useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Home from "./components/Home";
import { io } from "socket.io-client";
import SocketContext from "../context/SocketContext";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from "@apollo/client";
import User from "./components/User";
import Avatar from "./components/Avatar";
const client = new ApolloClient({
  link: new HttpLink({
    uri: import.meta.env.VITE_API_URL + "/graphql",
    credentials: "include",
  }),
  cache: new InMemoryCache(),
});

const App = () => {
  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_API_URL, {
        withCredentials: true,
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      }),
    []
  );
  return (
    <SocketContext.Provider value={{ socket }}>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Register />} />
            <Route path="/register" element={<Register />} />

            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/user/:username" element={<User />} />
          </Routes>
        </BrowserRouter>
      </ApolloProvider>
    </SocketContext.Provider>
  );
};

export default App;
