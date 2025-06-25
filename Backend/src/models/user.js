const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    firstName:{
        type: String,
        required: true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20,
        required:false
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim: true,
        lowercase:true,
        immutable: true,
    },
    age:{
        type:Number,
        min:6,
        max:80,
        required:false
    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user',
        required:false
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem'
        }],
        unique:true
    },
    password:{
        type:String,
        required: true
    }
},{
    timestamps:true
});


const User = mongoose.model("user",userSchema);

module.exports = User;
