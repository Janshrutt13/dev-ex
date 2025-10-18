import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        trim : true
    },
    email : {
       type : String,
       required: true,
       unique : true,
       trim : true
    },
    password : {
        type : String,
        required : true
    },
    profileImage : {
        type : String,
        default : "/images/profilePic.png"
    },
    githubId : {
        type : String,
        unique : true,
        sparse : true
    },
    githubUsername : {
        type : String,
    },
    profileImageUrl : {
        type : String,
        validate: {
            validator: function(v 
             :    any
            ) {
                return !v || /\.(jpg|jpeg|png|gif|webp)$/i.test(v);
            },
            message: 'Invalid image format'
        }
    },
    activeChallenge : {
        type : {
            type : String,
            enum : ['75-Days' , '100-Days']
        },
        startDate : {
            type : Date
        },
        completed : {
            type : Boolean,
            default : false
        }
    },
    streak : [ { type : Date }]
}, { timestamps : true});

export default mongoose.model("User", UserSchema);