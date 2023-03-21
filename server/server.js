const http = require('http');
const path = require('path');
const express = require('express')
const DBManager = require('./db.js')
const socketio = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = socketio(server, {cors: {origin: '*'}});
const db_manager = new DBManager('LiveChat', 'messages')


      /****************
       *  API routes  *
       ****************/

app.use(express.json());
app.post('/api/load_history', (req, res) =>{
  db_manager.get_last_k_msg(req.body.k).then(messages =>{
    messages = {'data':messages};
    res.json(messages);
  }, console.log)
})



      /****************
       * Front routes *
       ****************/

app.use(express.static(path.resolve(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});



      /**********************
       * Socket connections *
       **********************/

let n_users = 0
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  n_users += 1;
  io.emit('connection', n_users);

  // Action on message topic
  socket.on('message', (data) => {
    console.log(`Received message from ${socket.id}`);
    data = JSON.parse(data);
    data.username = socket.id;
    data.userid = socket.id
    
    db_manager.insert_msg(data).then(x => {
      // Send the message to all connected clients except the sender
      data.type = 'received'
      socket.broadcast.emit('message', data);

      // Send the message back to the sender with a different type
      data.type = 'sent'
      socket.emit('message', data);
    })    
  });

  // Log disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    n_users -= 1;
    socket.broadcast.emit('connection', n_users);
  });
});




      /****************
       * Start server *
       ****************/

let port = process.env.PORT || 5000
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
