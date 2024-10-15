const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/SamplechatApp").then(()=>{
    console.log("mongoDB connected")
}).catch((err)=>{
    console.log("MongoDB is not connected:",err);
})
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    is_online:{
        type:String,
        default:'0'
    }
},{timestamps:true})
module.exports = mongoose.model('user',userSchema);