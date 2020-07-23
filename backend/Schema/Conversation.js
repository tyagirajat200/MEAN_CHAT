const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema for Users
const ConversationSchema = new Schema({
    recipients: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: {
        type: String,
        required: true
    },
    msgType:{
        type:String,
        required:true
    }
},{timestamps:true});
const Conversation =new  mongoose.model('Conversation', ConversationSchema)

module.exports = Conversation