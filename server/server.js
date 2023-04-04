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


let users = []
db_manager.connect(['messages', 'users']).then(x=>{




      /****************
       *    Utils     *
       ****************/

      const generateGoogleAutQRCode = async (username) => {
         /** Generate a secret token and qr code for a user
         * @param {string} username The name of the user foir which generate the qr code
         * @returns {object} The secret and qr code
         */
        const secret = speakeasy.generateSecret({ length: 20 });
        const otpauthUrl = `otpauth://totp/live-chat:${username}?secret=${secret.base32}`;
        const qrCodeImage = await QRCode.toDataURL(otpauthUrl);
        return {secret: secret.base32, qrCodeImage};
      };
      
      const authenticateUserWithGoogleAuth = (userToken, secret) => {
        /** Check validity of a token given a secret
         * @param {string} userToken The token to verify
         * @param {string} secret The secret of the user
         * @returns {boolean} True if verification succeeded, else false
         */
        return speakeasy.totp.verify({
          secret: secret,
          encoding: 'base32',
          token: userToken
        });
      };


      /****************
       *  API routes  *
       ****************/
      
      app.use(express.json());
      app.post('/api/load_history', (req, res) =>{
        /** Load messages history
         * @param {object} req The payload of the request
         * @param {object} res The callback function
         */

        db_manager.get_last_k_msg(req.body.k).then(messages =>{
          res.status(200).json({data:messages})}, console.log)
      })
      
      
      app.post('/api/generateGoogleAutQRCode', async (req, res) => {
        /** Generate a secret and QR code for a user
         * @param {object} req The payload of the request
         * @param {object} res The callback function
         */

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
        /** Validate the registration of a user
         * @param {object} req The payload of the request
         * @param {object} res The callback function
         */

        await db_manager.validate_user(req.body.username);
        res.status(200).json({success:true});;
      });

      app.post('/api/checkCookie', async (req, res) => {
        /** Check if a cookie link to a username is valid
         * @param {object} req The payload of the request
         * @param {object} res The callback function
         */

        let cookie_data = await db_manager.check_cookie(req.body.username, req.body.accessToken);
        if (cookie_data.cookie){
          res.status(200).json({success:true});
        }
        else{
          res.status(401).json({error:'Cookie expired or user does not exist'});;
        }
        
      });
      
      
      app.post('/api/isUsernameAvailable', async (req, res) => {
        /** Check if a given username is available
         * @param {object} req The payload of the request
         * @param {object} res The callback function
         */

        db_manager.is_username_available(req.body.username).then(x =>{
          res.status(200).json({is_available:x})}, console.log)
      })

      app.post('/api/logout', async (req, res) => {
        /** Logout a given user
         * @param {object} req The payload of the request
         * @param {object} res The callback function
         */

        const username = req.body.username;
        let idx = users.map(x=>x[0] == username && x[1] == req.ip).indexOf(true)
        if (idx != -1){
          users.splice(idx, 1);
        }
        res.status(200).json({success:true});
      })
      
      
      app.post('/api/authenticate', async (req, res) => {
        /** Authenticate a user using the provided token and username
         * @param {object} req The payload of the request
         * @param {object} res The callback function
         */
        
        const userToken = req.body.token;
        const username = req.body.username;
        const secret = await db_manager.get_secret(username);
        if (secret == null){
          res.status(401).json({ error: 'User does not exist' });
        }
        else{
          const isAuthenticated = authenticateUserWithGoogleAuth(userToken, secret);
          if (isAuthenticated) {
            const cookie_data = await db_manager.check_cookie(username, null);
            let cookie = cookie_data.cookie
            let expire_in = cookie_data.expire
            if (!cookie){
              cookie = randomUUID();
              expire_in = await db_manager.store_cookie(username, cookie);
            }
            if (!(users.map(x=>x[0] == username && x[1] == req.ip).includes(true))){
              users.push([username, req.ip])
            }
            res.status(200).json({accessToken:cookie, expire_in:expire_in});
          } else {
            res.status(401).json({ error: 'Invalid token'});
          }
        }
      });
      
      
            /****************
             * Front routes *
             ****************/
      
      app.use(express.static(path.resolve(__dirname, '../client/build')));
      app.get('*', (req, res) => {res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));});
      
      
      
            /**********************
             * Socket connections *
             **********************/
      
     
      io.on('connection', (socket) => {
        
        const n_users = new Set(users.map(x => x[0])).size
        io.emit('connection', n_users);
        
        // Action on message topic
        socket.on('message', (data) => {
          data = JSON.parse(data);
          
          db_manager.insert_msg(data).then(x => {
            // Redistribute the message to all client
            io.emit('message', data);
          })    
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



