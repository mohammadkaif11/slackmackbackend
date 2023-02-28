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
        required:true
    },
    SenderUserName:{
        type:String,
        required:true,
    },
    SenderUserId:{
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

const OneChats = mongoose.model('onechats', sechma);
module.exports = OneChats;
