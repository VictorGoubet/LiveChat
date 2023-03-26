const http = require('http');
const path = require('path');
const QRCode = require('qrcode')
const express = require('express')
const DBManager = require('./db.js')
const socketio = require('socket.io');
const speakeasy = require('speakeasy');
const { randomUUID } = require('crypto');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {cors: {origin: '*'}});
const db_manager = new DBManager('LiveChat')

db_manager.connect(['messages', 'users']).then(x=>{




      /****************
       *  API routes  *
       ****************/



      const generateGoogleAutQRCode = async (username) => {
        const secret = speakeasy.generateSecret({ length: 20 });
        const otpauthUrl = `otpauth://totp/live-chat:${username}?secret=${secret.base32}`;
        const qrCodeImage = await QRCode.toDataURL(otpauthUrl);
        return {secret: secret.base32, qrCodeImage};
      };
      
      const authenticateUserWithGoogleAuth = (userToken, secret) => {
        return speakeasy.totp.verify({
          secret: secret,
          encoding: 'base32',
          token: userToken
        });
      };
      
      app.use(express.json());
      app.post('/api/load_history', (req, res) =>{
        db_manager.get_last_k_msg(req.body.k).then(messages =>{
          res.status(200).json({data:messages})}, console.log)
      })
      
      
      app.post('/api/generateGoogleAutQRCode', async (req, res) => {
        const username = req.body.username
        const is_available = await db_manager.is_username_available(username);
        if (is_available){
          const qrCodeData = await generateGoogleAutQRCode(username);
          await db_manager.store_secret(username, qrCodeData.secret);
          res.status(200).json({qrCodeImage:qrCodeData.qrCodeImage, configKey:qrCodeData.secret});
        }
        else{
          res.status(401).json({error:'username not available anymore'});
        }
      });
      
      app.post('/api/validateUser', async (req, res) => {
        await db_manager.validate_user(req.body.username);
        res.status(200).json({success:true});;
      });

      app.post('/api/checkCookie', async (req, res) => {
        found_coookie = await db_manager.check_cookie(req.body.username, req.body.accessToken);
        if (found_coookie){
          res.status(200).json({success:true});
        }
        else{
          res.status(401).json({error:'Cookie expire or user does not exist'});;
        }
        
      });
      
      
      app.post('/api/isUsernameAvailable', async (req, res) => {
        db_manager.is_username_available(req.body.username).then(x =>{
          res.status(200).json({is_available:x})}, console.log)
      })
      
      
      app.post('/api/authenticate', async (req, res) => {
        const userToken = req.body.token;
        const username = req.body.username;
        const secret = await db_manager.get_secret(username);
        if (secret == null){
          res.status(401).json({ error: 'User does not exist' });
        }
        else{
          const isAuthenticated = authenticateUserWithGoogleAuth(userToken, secret);
          if (isAuthenticated) {
            const accessToken = randomUUID()
            const expire_in = await db_manager.store_cookie(username, accessToken)
            res.status(200).json({accessToken:accessToken, expire_in:expire_in});
          } else {
            res.status(401).json({ error: 'Invalid token'});
          }
      
        }
        
      });
      
      
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
        n_users += 1;
        io.emit('connection', n_users);
      
        // Action on message topic
        socket.on('message', (data) => {
          data = JSON.parse(data);
          
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
      



})



