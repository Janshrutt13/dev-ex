import mongoose, { Schema, Document } from "mongoose";

const LogSchema = new Schema({
    author : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    content : {
        type : String,
        required : true,
        trim : true,
        maxLength : 500
    },
    tags : [{
        type : String,
        trim : true,
        required : true
    }]
} , { timestamps : true });

module.exports = mongoose.model("Log", LogSchema);