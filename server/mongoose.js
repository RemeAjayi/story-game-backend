//Set up mongoose connection

// const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:uQ4kMp4CVTpipiH3@cluster0.qnwcp.mongodb.net/story-game-api?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
/*client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});*/

/* include local mongoose connection later*/
const mongoose = require('mongoose');
// const mongoDB = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/story-game-api';
const mongoDB = uri || 'mongodb://127.0.0.1:27017/story-game-api';
mongoose.set('useFindAndModify', false);
mongoose.connect(mongoDB,  {
    useCreateIndex: true,
    useNewUrlParser: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
