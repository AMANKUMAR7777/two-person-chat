const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');

const PORT = 3000;
const CHAT_FILE = 'chats.json';

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Initialize chats array
let chats = [];

// Load existing chats from file
try {
  const data = fs.readFileSync(CHAT_FILE, 'utf8');
  chats = JSON.parse(data);
} catch (err) {
  console.log('No existing chat file found. Starting with empty chat.');
}

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send existing chats to the newly connected client
  socket.emit('load chats', chats);

  socket.on('chat message', (msg) => {
    const chatMessage = {
      user: socket.id,
      message: msg,
      timestamp: new Date().toISOString()
    };
    chats.push(chatMessage);
    io.emit('chat message', chatMessage);

    // Save chats to file
    fs.writeFile(CHAT_FILE, JSON.stringify(chats, null, 2), (err) => {
      if (err) console.error('Error writing chat file:', err);
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});