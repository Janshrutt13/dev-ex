import  mongoose , {Schema} from "mongoose"

const CollabProjectSchema = new Schema({
    author : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    title : {
        type : String,
        required : true,
        trim : true
    },
    description : {
        type : String,
        required : true,
    },
    requiredSkills : [{
      type : String
    }],
    status : {
        type : String,
        enum : ['open' , 'closed' , 'in progress'],
        default : 'open'
    },
    collaborators : [{
        type : Schema.Types.ObjectId,
        ref : "User"
    }]
} , { timestamps : true });

module.exports = mongoose.model("CollabProject", CollabProjectSchema);