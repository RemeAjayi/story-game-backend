var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var EntrySchema = new Schema(
    {
        author: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, required: true }
       


    }
);
//Export model
module.exports = mongoose.model('Entry', EntrySchema);