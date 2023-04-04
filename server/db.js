const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

class DBManager{
    constructor(db_name){
        /** Initialize the DB Manager
         * @param {string} db_name  The name of the MongoDB database
         */
        this.expire_cookie = 10;
        this.collections = {}
        this.db_name = db_name;
    }
    
    
    async connect(collections){
        /** Connect to Mongo DB collection
         * @param {object} collections A list of collection to connect to
         */
        let pwd = process.env.MONGO_PWD
        const uri = `mongodb+srv://master:${pwd}@livechat.uyoq1pb.mongodb.net/?retryWrites=true&w=majority`;
        this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        await this.client.connect();
        this.collections = Object.fromEntries(collections.map(x => [x, this.client.db(this.db_name).collection(x)]));
    }

    async insert_msg(msg){
        /** Store a message in the database
         * @param {object} msg      The message to store in the DB
         * @returns {object}        The result of the insertion
         */
        msg.timestamp = Date.now();
        const res = await this.collections.messages.insertOne(msg);
        return res;
    }

    async get_last_k_msg(k){
        /** Return the last k messages
         * @param {number} k    The number of message to return
         * @returns {object}    A list of messages  
         */
        const messages = await this.collections.messages.find({}).sort({$natural:1}).limit(k).toArray();
        return messages;
    }

    async is_username_available(username){
        /** Check if a username is available
         * @param {string} username The username to check
         * @returns {boolean}       True if it's available
         */
        // handle not allowed username
        if (['', 'none'].indexOf(username) != -1){
            return false
        };
        const user = await this.collections.users.find({'username':username}).toArray();
        const res = user.length == 0
        return res;
    }


    async store_secret(username, secret){
        /** Store the secret associated to the username
         * @param {string} username The username to store
         * @param {string} secret The secret to store
         */
        // delete all old and not validated users
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        await this.collections.users.deleteMany({validate:false, timestamp:{$lt:oneHourAgo}})

        // add the new user
        await this.collections.users.insertOne({'username':username, secret:secret, validated:false, timestamp:Date.now()})
    }


    async validate_user(username){
        /** Validate a given user
         * @param {string} username The user to validate
         */
        await this.collections.users.updateOne({'username':username}, { $set: { validated: true } })
    }


    async store_cookie(username, accessToken){
        /** Store a cookie for a given user
         * @param {string} username     The user name
         * @param {string} accessToken  The cookie value
         * @returns {number}            The number of day in which the cooikie will expire
         */
        let expire_date = new Date();
        expire_date.setDate(expire_date.getDate() + this.expire_cookie);
        await this.collections.users.updateOne({'username':username}, { $set: { cookie: accessToken, cookie_expire_on:expire_date.valueOf()}})
        return this.expire_cookie
    }

    async check_cookie(username, accessToken){
        /** Check if the cookie of a user is valid
         * @param {string} username The name of the user
         * @param {string} accessToken The cookie value
         * @returns {sting, number} The found cookie and the remaining days
         */
        let query = {username:username, cookie_expire_on:{$gt:Date.now()}}
        
        if (accessToken){
            query.cookie = accessToken
        }
        const user_data = await this.collections.users.findOne(query)
        let cookie = null
        let expire = null
        if (user_data){
            cookie = user_data.cookie
            const futureDate = new Date(user_data.cookie_expire_on);
            const now = new Date();
            const diffInTime = futureDate.getTime() - now.getTime();
            expire = Math.ceil(diffInTime / (1000 * 3600 * 24));
        }
        
        return {cookie, expire};
    }

    async get_secret(username){
        /** Get the secret of a user
         * @param {string} username The name of the user
         * @returns {string} The secret of the user
         */
        let secret = await this.collections.users.findOne({username:username, validated:true})
        if (secret){
            secret = secret.secret
        }
        return secret;
    }

}

module.exports = DBManager