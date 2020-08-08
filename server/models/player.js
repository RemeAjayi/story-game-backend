const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;

const PlayerSchema = new Schema(
    {
        playerName: {
             type: String,
              required: true },
        playerEmail: { 
            type: String, 
            required: true, 
            unique:true},
        countryCode: {
            type: String},
        phoneNo: {
            type: String },
        password: {
            type: String},
            tokens: [{
                token: {
                    type: String,
                    required: true
                }
            }]
    }
);


PlayerSchema.virtual('stories', {
    ref:'Story',
    localField: '_id',
    foreignField: 'storyOwner'
})

PlayerSchema.methods.toJSON = function (){
    const player = this
    const playerObj = player.toObject()

    delete playerObj.password
    delete playerObj.tokens

    return playerObj
}

PlayerSchema.methods.generateAuthToken = async function (){
    const player = this
    const token = jwt.sign({_id: player._id.toString()}, 'secrettoken1234')
    
    player.tokens = player.tokens.concat({ token})
    await player.save()

    return token
}

PlayerSchema.statics.findByCredentials = async (playerEmail, password) => {
    const player =  await Player.findOne({ playerEmail: playerEmail })
  
    if(!player){
        throw new Error('Player does not exist')
    }

    const isMatch =  await bcrypt.compare(password, player.password)
    console(password)
    console.log(player.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
     else{return player}
}

//hash the plain text password before saving
PlayerSchema.pre('save', async  function (next) {
        const player = this
   if(player.isModified){
           player.password = await bcrypt.hash(player.password, 8)
   }

   next();
})
//Export model

const Player = mongoose.model('Player', PlayerSchema)
module.exports = Player
