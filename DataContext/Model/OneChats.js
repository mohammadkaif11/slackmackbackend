const mongoose=require('mongoose')

const sechma = new mongoose.Schema({
    Created: {type: Date, default: Date.now},
    RoomId:{
        type:String,
        required:true,
        index:true
    },
    Date: {
        type: String,
        required: true,
    },
    Time:{
        type:String,
        required:false
    },
    WorkspaceId:{
        type:String,
        required:true,
        index:true
    },
    UserName:{
        type:String,
        required:true,
    },
    UserId:{
        type:String,
        required:true
    },
    Content:{
        type:String,
        required:true
    },
    IsFile:{
        type:Boolean,
        require:false
    },
    FileExtension:{
        type:String,
        require:false
    },
    RecieverUserName:{
        type:String,
        required:true,
    },
    RecieverUserId:{
        type:String,
        required:true
    },
});

const OneChats = mongoose.model('userchats', sechma);
module.exports = OneChats;
