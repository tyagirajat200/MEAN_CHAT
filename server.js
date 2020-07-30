const express = require("express");
const app = express();

const bodyParser = require('body-parser')
var morgan = require('morgan')
var mongoose = require('mongoose')
var cors = require('cors')
var path = require('path')

var UserRoutes = require('./backend/Routes/UserRoutes')
var chatRoutes = require('./backend/Routes/ChatRoutes')
const config = require("./backend/config/key");
const PORT = process.env.PORT || 4000



mongoose.connect(config.mongoURI,
  {
    useNewUrlParser: true, useUnifiedTopology: true,
    useCreateIndex: true, useFindAndModify: false
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));




// parse application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(morgan('dev'))

app.use(function (req, res, next) {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,Authorization"
  );
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');

  next();
});

// app.use(cors({
//     origin: [
//         "http://localhost:4200"
//     ], credentials: true
// }));



const server = require('http').Server(app);
const io = require('socket.io')(server);


var users = []


io.on('connection', (socket) => {

  const userId = socket.request._query['userId']
  //  users= users.filter(user => user.userId != userId)

  socket.join(userId)
  users.push({ socketId: socket.id, userId: userId })

  console.log('user connected = ', socket.id + " " + userId);

  io.emit('newUser', users)

  socket.on('typing', (receiver, sender) => {
    // const a = users.find(user => user.userId == receiver)
    // if (a)
    //   io.to(a.socketId).emit('typing', sender)
     socket.to(receiver).emit('typing' , sender)
  })

  socket.on('join', (data) => {
      console.log(`Requesting ${data.toID} to join request by ${data.fromID}`)
      socket.to(data.toID).emit('request', {fromID :data.fromID , toID : data.toID})
  })

  socket.on('start_call', (data) => {
    console.log(`${data.toID} acceptrd your request to join call`)
    socket.to(data.fromID).emit('start_call',data)
  })

  socket.on('webrtc_offer', (data) => {
    console.log(`webrtc_offer event to peer ${data.toID}`)
    socket.to(data.toID).emit('webrtc_offer', data)
  })
  socket.on("reject-call", data => {
    socket.to(data.fromID).emit("call-rejected", {
      fromID: data.fromID,
      toID : data.toID,
    });
  })
  socket.on('webrtc_answer', (data) => {
    console.log(`webrtc_answer event to peer ${data.fromID}`)
    socket.to(data.fromID).emit('webrtc_answer', data)
  })
  socket.on('webrtc_ice_candidate', (data) => {
    console.log(`Broadcasting webrtc_ice_candidate event to peer ${data.toID}`)
    socket.to(data.toID).emit('webrtc_ice_candidate', data)
  })

  socket.on('busy', (data)=>{
    socket.to(data.fromID).emit('busy',data)
  })

  socket.on('disconnect', () => {
    users = users.filter(user => user.socketId != socket.id)
    console.log('user disconnected = ', socket.id);
    // socket.leave(userId)
    io.emit('newUser', users)
  });


  io.clients((err, clients) => {
    console.log(clients);
  })
});

app.use((req, res, next) => {
  req.io = io;
  req.users = users
  next();
});


app.use('/api/user', UserRoutes)
app.use('/api/chat', chatRoutes)


if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist/chat')))

  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/chat', 'index.html'))
  })
}

server.listen(PORT, () => console.log(`Server started on ${PORT}`))