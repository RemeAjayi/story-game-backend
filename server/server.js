const express = require('express');
const app = express()
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const {ObjectID} = require('mongodb');
require('./mongoose');
const bcrypt = require('bcryptjs');
const multer = require('multer')
const upload = multer({
    dest: 'images',
    limits: {
        fileSize: '2000000'
    }
})


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
// create new player
app.post('/player', async (req, res) => {
    await Player.init()
    const player = new Player(req.body)
    player.save().then(() => {
        res.send(player)
    }).catch((e) => {
        if (e.name === 'MongoError' && e.code === 11000) {
            res.send("Email already exists")
        }
        res.status(400).send(e)
    })
})

// get player by id
app.get('/player/:id', (req, res)=>{
    const id = req.params.id;
    Player.findById(id).then((story)=>
    {
        res.send(story)
    }).catch((e)=>{
        res.status(404).send(e)
    })
});
// update player
app.post('/player/:id/edit', async (req, res) => {
    const updates = Object.keys(req.body)

    const id = req.params.id;
    if(!ObjectID.isValid(id))
    {
        return res.status(400).send();
    }

    try {
        const player = await Player.findById(req.params.id)

        updates.forEach((update) => user[update] = req.body[update])
        await player.save()

        if (!player) {
            return res.status(404).send()
        }

        res.send(player)
    } catch (e) {
        res.status(400).send(e)
    }
});
// get all stories for a specific player
app.get('/player/:id/stories', (req, res)=> {
    const id = req.params.id;
    Story
        .find({$or: [{"storyOwner": id}, {"otherPlayer" : id}]})
        .then((player)=>
        {
            res.send(player)
        }).catch((e)=>{
        res.status(404).send(e)
    })
});

// get all players
// should be a protected end point
// SECURE this endpoint before deploying
app.get('/players', (req, res)=>{
    Player.find()
        .then((player)=>
        {
            res.send(player)
        }).catch((e)=>{
        res.status(404).send(e)
    })
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
  Story.find()
      .populate('storyOwner')
      .populate('otherPlayer')
      .then((story)=>
  {
      res.send(story)
  }).catch((e)=>{
      res.status(404).send(e)
  })
});
// join session with invite Code
app.post('/story/join/:storyId', (req, res) => {
   // change req.body to send ID rather name it was sending before
   const id = req.params.storyId;
   if(!ObjectID.isValid(id))
   {
       return res.status(400).send();
   }
    console.log(req.body.otherPlayerID);

   Story.findByIdAndUpdate(id, {$set:
           {  otherPlayer: req.body.otherPlayerID,}},  {new: true}).then((story)=>{
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
    socket.on("new entry", (obj) => {
           
            const id = obj.id;
            if (!ObjectID.isValid(id)) {
                return 'error';
            }

            Story.findByIdAndUpdate(id,
                { $addToSet: { content : obj.data.message }
            }, { new: true }, (err)=>{
                if (err){
                    throw err;
                }
            });
            // this broadcasts the message to everyone on that URL
            io.emit('new entry', obj);
    });
});

// get story by id
app.get('/story/:id', (req, res)=>{
    const id = req.params.id;
    Story.findById(id)
        .populate('storyOwner')
        .populate('otherPlayer')
        .then((story)=>
    {
        res.send(story)
    }).catch((e)=>{
        res.status(404).send(e)
    })
});
// login
app.post('/login', async (req, res)=>{

    try{
        Player.findOne({playerEmail: req.body.playerEmail}, async (err, player)=>{
        if(!player){
            throw new Error('Player does not exist')
        }
        //  match email and password
         const isMatch = await bcrypt.compare(req.body.password, player.password)   
        if(!isMatch){
            throw new Error('Email and password combination does not match our records')
        }    
        res.send(player);
    });
    }
    catch (e) {
        res.status(400)
    }
});
// profile images for stories
app.post('/story/upload', upload.single('upload'), (req, res) =>  {
   res.send()
});

http.listen(port, () => {
    console.log('Server is up on port ' + port)
})
