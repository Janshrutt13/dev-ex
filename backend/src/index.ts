const dotenv = require("dotenv")
const cors = require("cors")
const express = require("express")
const http = require('http')
const {Server} = require('socket.io')
const mongoose = require("mongoose")
const Message = require('./models/message.models')
const authRoutes = require("./routes/auth.routes")
const {startReminderService} = require('./services/reminder.service');
const passport = require('passport');
require('./config/passport'); // Import passport configuration

dotenv.config()

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors : {
        origin : 'http://localhost:3001',
        methods : ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 5000;

io.on('connection' , (socket: any) => {
   console.log('A user connected' , socket.id);

   //When a user joins a specific project chat
   socket.on('join_collab_room', (collabId : any) => {
     socket.join(collabId);
     console.log(`User ${socket.id} joined room ${collabId}`);
   })

   //When a user sends a message
   socket.on('send_message' , async (data : any) => {
       try{

        await Message.create({
           collabRoom : data.collabId,
           author : data.authorId,
           username : data.username,
           message : data.message,
        });
         
        socket.to(data.collabId).emit('recieve_message' , data);

       }catch(err){
        console.log(err);
       }
   });
  
   socket.on('disconnect' , () => {
     console.log('A user disconnected', socket.id);
   })

});

//MIDDLEWARES
app.use(cors())
app.use(express.json())
app.use(passport.initialize());

const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri)
.then(() => console.log("MongoDB connected"))
.catch((err : any) => console.log(err))


//ROUTES
app.get("/" , (req : any,res : any) => {
    res.json({ message : "Welcome to Dev-Ex!"})
});

app.use("/api/auth", authRoutes);
app.use("/api/users" , require('./routes/user.routes'));
app.use("/api/logs" , require('./routes/log.routes'));
app.use("/api/collabs" , require('./routes/collab.routes').default);

startReminderService();

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});
