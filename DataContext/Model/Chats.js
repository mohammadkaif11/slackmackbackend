const mongoose=require('mongoose')

const sechma = new mongoose.Schema({
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
    }
});

const Chats = mongoose.model('chats', sechma);
module.exports = Chats;
