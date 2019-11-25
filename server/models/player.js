const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

var Schema = mongoose.Schema;

var PlayerSchema = new Schema(
    {
        playerName: { type: String, required: true },
        playerEmail: { type: String, required: true, unique:true},
        phoneNo: {type: String },
        password: {type: String},
        storyImage: {type: String},
        stories : [{ type: Schema.Types.ObjectId, ref: 'Story' }]

    }
);

PlayerSchema.statics.findByCredentials = async (email, password) => {

    const player = await Player.findOne({playerEmail: email})

    if(!player){
        throw new Error('Player does not exist')
        return;
    }

     const isMatch = await bcrypt.compare(password, player.password)

    if(!isMatch){
        throw new Error('Email and password combination does not match our records')
        return;
    }

    return player
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
module.exports = mongoose.model('Player', PlayerSchema);
