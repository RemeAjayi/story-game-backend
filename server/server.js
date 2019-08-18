const express = require('express');
const app = express()
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const {ObjectID} = require('mongodb');
require('./mongoose');


const Player = require('./models/player')
const Story = require('./models/story')

const port = process.env.PORT || 3000

//bodyparser middleware
app.use(bodyParser.json());

app.use(express.json())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// create new story
app.post('/story', (req, res) => {
    const story = new Story(req.body)

    story.save().then(() => {
        res.send(story)
    }).catch((e) => {
        res.status(400).send(e)
    })
})
// get all stories
app.get('/story', (req, res)=>{
  Story.find().then((story)=>
  {
      res.send(story)
  }).catch((e)=>{
      res.status(404).send(e)
  })
});
// join session with invite Code
app.post('/story/join/:id', (req, res) => {
   const id = req.params.id;
    // const id = '5d4ee11d86fa5c1f640824a6';
   if(!ObjectID.isValid(id))
   {
       return res.status(400).send();
   }

   Story.findByIdAndUpdate(id, {$set: 
    {otherPlayer: req.body.storyOwner}},  {new: true}).then((story)=>{
       if(!story)
       {   console.log('no story')
           res.status(404).send()

       }
       res.send(story)
        }).catch((e)=>
        {
            res.status(400).send()
        })
});

io.on("connection", (socket) => {
    // add new paragraph
    socket.on("new entry", (message) => {
           
            console.log(message);
            // const id = msg.id;
            // // const id = '5d4ee11d86fa5c1f640824a6';
            // if (!ObjectID.isValid(id)) {
            //     return 'error';
            // }

            // Story.findByIdAndUpdate(id, 
            //     { $addToSet: { content : msg.data.entry }
            // }, { new: true }, (err)=>{
            //     if (err){
            //         throw err;
            //     }
            // });
             socket.emit(message);
    });
});

// get story

// save story

// view story

http.listen(port, () => {
    console.log('Server is up on port ' + port)
})