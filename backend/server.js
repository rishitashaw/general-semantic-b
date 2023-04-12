const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const { createServer } = require("http");
const { Server } = require("socket.io");
const parser = require("socket.io-msgpack-parser")
// const app = createServer();

dotenv.config();
connectDB();
const app = express();

app.use(express.json()); // to accept json data

app.use(helmet.frameguard({ action: "SAMEORIGIN" }));

app.use(cors({
  origin: 'https://www.generalsemantic.com',
}))

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   next();
// });

app.get("/", (req, res) => {
  res.send("API Running!");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/frontend/build")));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
//   );
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running..");
//   });
// }

// --------------------------deployment------------------------------

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;

// const server = app.listen(
//   PORT,
//   console.log(`Server running on PORT ${ PORT }...`.yellow.bold)
// );

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${ PORT }...`.yellow.bold)
);


const io = new Server(server, {
  wsEngine: require("ws").Server,
  perMessageDeflate: {
    threshold: 32768
  },
  cors: {
    origin: "https://www.generalsemantic.com",
    // origin: "http://localhost:3000/",
    // credentials: true,
  },
  parser,
  serveClient: false,
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 10000,
  maxHttpBufferSize: 100000000,
  allowUpgrades: true,
  transports: "websocket",
  allowEIO3: true,
  cookie: {
    name: "my-cookie",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 86400
  }
});

// const io = require("socket.io")(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: "https://www.generalsemantic.com",
//     // origin: "http://localhost:3000/",
//     // credentials: true,
//   },
// });

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
    if (onlineUsers.includes(userData._id) === false) {
      onlineUsers.push(userData._id)
      console.log(onlineUsers)
    };
  });

  socket.emit("onlineUsers", onlineUsers);

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    socket.leave(userData._id);
    io.emit("onlineUsers", onlineUsers);
  });
});

