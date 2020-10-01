const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid");
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

//tell app to use static file public folder
//all the js on the front end is going to live here
app.use(express.static("public"));

//make the view engine embedded js
app.set("view engine", "ejs");

//specify to peer server what url you're going to use
app.use("/peerjs", peerServer);

//generate random uuid at the end of url
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

//allows you to pass in random roomId into room.ejs file
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  //when user visits site user joins room
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    //when user is connected we want to see message
    socket.on('message', message => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
    })

  });
});

server.listen(process.env.PORT||3030);
