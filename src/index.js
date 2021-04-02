const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const {generateMessage,generateLocationMessage} = require("./utils/messages");
const {addUser,getUser,getUsersInRoom,removeUser} = require("./utils/users")
var Filter = require('bad-words');


// ---- //
const publicDirectory = path.join(__dirname, "../public");

// ---- //
app.use(express.static(publicDirectory));
const server = http.createServer(app);
const io = socketio(server);

let count = 0;

io.on("connection", (socket) => {
  console.log("a user connected");

  // join
  socket.on('join',({username,room},callback)=>{
     const {error,user} = addUser({id:socket.id,username,room})

    //  
     if(error){
      return callback(error);
     }

    //  
     socket.join(user.room);
     socket.emit('message',generateMessage('Admin','Welcome !'));
     socket.broadcast.to(user.room).emit("message",generateMessage('Admin',`${user.username} has joined !`));
    
    //  
    io.to(user.room).emit('roomData',({
      room: user.room,
      users: getUsersInRoom(user.room)
    }))
     callback();
  })

  // sendMessage
  socket.on('sendMessage',(message,callback) =>{
    const filter = new Filter();
    if(filter.isProfane(message)){
      return callback('Profanity is not allowed')
    }

    // 
    const user = getUser(socket.id);
    console.log(user);
    // 
    io.to(user.room).emit('message',generateMessage(user.username,message));
    callback('Delivered !');
  });

  //sendLocation 
  socket.on('sendLocation',(location,callback)=>{
    const user = getUser(socket.id);
    console.log(location);
    io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`));

    callback();
  })

  // disconnect
  socket.on('disconnect',()=>{
    const user = removeUser(socket.id);

    // 
    if(user){
      io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left the room`));
      io.to(user.room).emit('roomData',({
        room: user.room,
        users: getUsersInRoom(user.room)
      }))
    }
    
  })
});

// ------- //
server.listen(port, () => {
  console.log("listening on port: " + port);
});
