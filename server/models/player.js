const mongoose = require('mongoose');
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
