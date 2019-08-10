var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PlayerSchema = new Schema(
    {
        playerName: { type: String, required: true },
        playerEmail: { type: String, required: true}
        
       
    }
);
//Export model
module.exports = mongoose.model('Player', PlayerSchema);