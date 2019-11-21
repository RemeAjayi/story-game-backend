var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PlayerSchema = new Schema(
    {
        playerName: { type: String, required: true },
        playerEmail: { type: String, required: true},
        phoneNo: {type: String },
        password: {type: String, required: true},
        storyImage: {type: String},
        stories : [{ type: Schema.Types.ObjectId, ref: 'Story' }]

    }
);
//Export model
module.exports = mongoose.model('Player', PlayerSchema);
