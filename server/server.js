const http = require('http');
const socketio = require('socket.io');


server = http.createServer();
const io = socketio(server, {cors: {origin: '*'}});

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
let port = 5000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
