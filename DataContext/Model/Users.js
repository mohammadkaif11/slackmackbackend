const mongoose=require('mongoose')

const sechma = new mongoose.Schema({
    UserId: {
        type: String,
        required: true,
    },
    Name:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true
    }
});
const Users = mongoose.model('users', sechma);
module.exports = Users;
