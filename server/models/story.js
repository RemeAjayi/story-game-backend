var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var StorySchema = new Schema(
    {
        storyTitle: { type: String, required: true },
        storyOwner: { type: String,  required: true },
        otherPlayer: { type: String},
        // inviteCode: { type: String, required: true },
        content: [{ type: Object }]
        // storyOwner: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
        // otherPlayer: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
        // inviteCode: { type: String, required: true },
        // content: { type: Schema.Types.ObjectId, ref: 'Entry', required: true }


    }
);
//Export model
module.exports = mongoose.model('Story', StorySchema);