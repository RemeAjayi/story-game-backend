var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var StorySchema = new Schema(
    {
        storyTitle: { type: String, required: true },
        storyOwner: { type: Schema.Types.ObjectId, ref: 'Player' },
        otherPlayer: { type: Schema.Types.ObjectId, ref: 'Player' },
        category: [{type: String}],
        content: [{ type: Object }]


    }
);
//Export model
module.exports = mongoose.model('Story', StorySchema);
