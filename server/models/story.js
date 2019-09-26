var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var StorySchema = new Schema(
    {
        storyTitle: { type: String, required: true },
        storyOwner: { type: String,  required: true },
        otherPlayer: { type: String},
        content: [{ type: Object }],
        storyOwnerName: { type: String, required: true },
        otherPlayerName: {type: String}


    }
);
//Export model
module.exports = mongoose.model('Story', StorySchema);
