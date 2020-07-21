const express = require("./node_modules/express");
const app = express();
const session = require("./node_modules/express-session");
const MongoDBStore = require("./node_modules/connect-mongodb-session")(session);
const bodyParser = require('./node_modules/body-parser')
var morgan = require('./node_modules/morgan')
var mongoose = require('mongoose')
var cors = require('./node_modules/cors')
var path = require('path')

var UserRoutes = require('./Routes/UserRoutes')
var chatRoutes = require ('./Routes/ChatRoutes')
const config = require("./config/key");
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



// setting up connect-mongodb-session store
const mongoDBstore = new MongoDBStore({
    uri: config.mongoURI,
    collection: "mySessions"
});


mongoDBstore.on('connected', () => console.log("mongoDBstore Connected"))
mongoDBstore.on('error', () => console.log("mongoDBstore not connected"))

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



app.use(
    session({
      name: config.COOKIE_NAME,
      secret: config.SESS_SECRET,
      resave: false,
      saveUninitialized: false,
      store: mongoDBstore,
      proxy : true,              // this should be true for session to be work on heroku
      cookie: {
        maxAge: 1000 * 60 * 60 * 3, // Three hours
        sameSite: false,
        secure: config.IS_PROD,
      }
    })
  );
const server = require('http').Server(app);
const io = require('./node_modules/socket.io')(server);


var users = []


io.on('connection', (socket) => {

    const userId = socket.request._query['userId']
    
    users.push({socketId :socket.id , userId : userId})
     console.log('user connected = ',socket.id + " "+ userId);

    io.emit('newUser' , users)

    socket.on('typing', (receiver ,sender)=>{
       const a= users.find(user=>user.userId == receiver)
       if(a)
         io.to(a.socketId).emit('typing', sender)
      })

    socket.on('disconnect', () => {
        users=users.filter(user=>user.socketId!=socket.id)
      console.log('user disconnected = ',socket.id);
      io.emit('newUser' , users)
    });


    io.clients((err,clients)=>{
        console.log(clients);
    })
    console.log(users.length);

    
  });

app.use((req, res, next) =>{
    req.io = io;
    req.users = users
    next();
  });


app.use('/api/user', UserRoutes)
app.use('/api/chat', chatRoutes)

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname,"../",'dist/chat')))

    app.get('/*',(req,res)=>{
        res.sendFile(path.join(__dirname,"../",'dist/chat','index.html'))
    })
}

server.listen(PORT, () => console.log(`Server started on ${PORT}`))