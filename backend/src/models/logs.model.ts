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
    }],
    hashtags: [{
        type: String,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return v.startsWith('#');
            },
            message: 'Hashtag must start with #'
        }
    }],
    imageUrl: {
        type: String,
        validate: {
            validator: function(v : any) {
                return !v || /\.(jpg|jpeg|png|gif|webp)$/i.test(v);
            },
            message: 'Invalid image format'
        }
    },
    likes : [{
        type : Schema.Types.ObjectId,
        ref : "User"
    }],
    dayNumber: { type: Number, min: 1 },
    totalDays: { type: Number, min: 1 }
} , { timestamps : true });

module.exports = mongoose.model("Log", LogSchema);