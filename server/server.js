require('dotenv').config()
const express = require('express');
var cors = require('cors')
const app = express()
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const {ObjectID} = require('mongodb');
require('./mongoose');
const bcrypt = require('bcryptjs');
const multer = require('multer')
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: 'olohiremeajayi',
    api_key: '854417139435691',
    api_secret: 'E7u-Xsng8VdNGvaomxddbA8J4hs'
    });
    const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "uploads",
    allowedFormats: ["jpg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
    });
const parser = multer({ storage: storage });

const Player = require('./models/player')
const Story = require('./models/story')
const auth = require('./middleware/auth')


const port = process.env.PORT || 3000

//bodyparser middleware
app.use(bodyParser.json());

app.use(express.json())

app.use(cors())

/* ROUTES FOR PLAYERS */
// create new player
app.post('/player', async (req, res) => {
    const player = new Player(req.body)
    try {
       await player.save()
       const token = await player.generateAuthToken()
       res.status(200).send({ player, token })
    } catch(e){
        if (e.name === 'MongoError' && e.code === 11000) {
            res.send("Email already exists")
                }
            res.status(400).send(e)      
    }
})

// get player by id
app.get('/player/:id', auth, (req, res)=>{
    const id = req.params.id;
    Player.findById(id).then((story)=>
    {
        res.send(story)
    }).catch((e)=>{
        res.status(404).send(e)
    })
});

// update player profile
// a player can only edit their own profile
app.post('/player/me/edit', auth, async (req, res) => {
    const updates = Object.keys(req.body)

    try {

        updates.forEach((update) => req.player[update] = req.body[update])
        await req.player.save()

        if (!req.player) {
            return res.status(404).send()
        }

        res.send(req.player)
    } catch (e) {
        res.status(400).send(e)
    }
});


// get all stories for a specific player
app.get('/player/:id/stories', auth, (req, res)=> {
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

// login
app.post('/login', async (req, res) =>{

    try{
    const player =  await Player.findByCredentials(req.body.playerEmail, req.body.password)
    const token =  await player.generateAuthToken()
    res.send({ player, token })
    }
    catch (e) {
        console.log(e)
        res.status(400).send()
    }
});

app.post('/logout', auth, async (req, res) => {
    try {
        req.player.tokens = req.player.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.player.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// get all players
// check that passwords are not being returned
// you can delete if you don't want other users to see this list
app.get('/players', auth, (req, res)=>{
    Player.find()
        .then((player)=>
        {
            res.send(player)
        }).catch((e)=>{
        res.status(404).send(e)
    })
});

/* ROUTES FOR STORIES */
// create new story
app.post('/story', auth, async (req, res) => {
    const story = new Story({
        ...req.body,
        storyOwner: req.player._id})

   try{
        await story.save()
        res.send(story)
   } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

// get all stories
app.get('/story', auth, (req, res)=>{
  Story.find()
      .populate('storyOwner')
      .then((story)=>
  {
      res.send(story)
  }).catch((e)=>{
      res.status(404).send(e)
  })
});
// join session with invite Code
app.post('/story/join/:storyId', auth, (req, res) => {
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
app.get('/story/:id', auth, (req, res)=>{
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

// profile images for stories
app.post('/story/upload',  parser.single('upload'), async (req, res) =>  {
    // In upload method on the frontend
    //  store req.file.secure_url in your Story Model
    // On Save send the model to the backend
    res.send(req.file);
}, (error, req, res, next)=>{
    res.status(400).send({error: error.message});
});

http.listen(port, () => {
    console.log('Server is up on port ' + port)
})
