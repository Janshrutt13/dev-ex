import { time, timeStamp } from "console";

export{};

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    collabRoom : {
        type : Schema.Types.ObjectId,
        ref : 'CollabProject',
        required : true
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    username : {
        type : String,
        required : true
    },
    message : {
        type : String,
        required : true,
        trim : true,
        maxLength : 500
    }
} , { timestamps : true })

module.exports = mongoose.model('Message' , MessageSchema);