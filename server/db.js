const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

class DBManager{
    constructor(db_name, col_name){
        /** Initialize the DB Manager
         * @param {string} db_name  The name of the MongoDB database
         * @param {string} col_name The name of the MongoDB collection
         */
        this.db_name = db_name;
        this.col_name = col_name;
        this.connect();
    }
    
    
    async connect(){
        /** Connect to Mongo DB collection
         */
        let pwd = process.env.MONGO_PWD
        const uri = `mongodb+srv://master:${pwd}@livechat.uyoq1pb.mongodb.net/?retryWrites=true&w=majority`;
        this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        await this.client.connect();
        this.collection = this.client.db(this.db_name).collection(this.col_name);
    }

    async insert_msg(msg){
        /** Store a message in the database
         * @param {object} msg      The message to store in the DB
         * @returns {object}        The result of the insertion
         */
        msg.timestamp = Date.now();
        const res = await this.collection.insertOne(msg);
        return res;
    }

    async get_last_k_msg(k){
        /** Return the last k messages
         * @param {number} k    The number of message to return
         * @returns {object}    A list of messages  
         */
        const messages = await this.collection.find({}).sort({$natural:1}).limit(k).toArray();
        return messages;
    }

}

module.exports = DBManager