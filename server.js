require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/api/auth', authRoutes);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let onlineUsers = [];

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', ({ room, username }) => {
    socket.join(room);

    if (!onlineUsers.find(u => u.socketId === socket.id)) {
      onlineUsers.push({ username, socketId: socket.id });
    }

    io.emit('updateOnlineUsers', onlineUsers.map(u => u.username));

    socket.on('sendMessage', (data) => {
      io.to(room).emit('receiveMessage', data);
    });

    socket.on('typing', ({ room, user }) => {
      socket.to(room).emit('typing', user);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
      io.emit('updateOnlineUsers', onlineUsers.map(u => u.username));
    });
  });
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
