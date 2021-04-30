//Set up mongoose connection

/* include local mongoose connection later*/
const mongoose = require('mongoose');
const mongoDB = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/story-game-api';
mongoose.set('useFindAndModify', false);
mongoose
     .connect( mongoDB, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
     .then(() => console.log( 'Database Connected' ))
     .catch(err => console.log( err ));
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
