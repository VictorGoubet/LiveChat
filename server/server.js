const http = require('http');
const path = require('path');
const express = require('express')
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {cors: {origin: '*'}});



// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});


// Socket connections
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('message', (data) => {
    
    console.log(`Received message from ${socket.id}: ${data}`);
    data = JSON.parse(data);
    data.username = socket.id

    // Send the message to all connected clients except the sender
    data.type = 'received'
    socket.broadcast.emit('message', data);

    // Send the message back to the sender with a different type
    data.type = 'sent'
    socket.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start the server
let port = process.env.PORT || 5000
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
