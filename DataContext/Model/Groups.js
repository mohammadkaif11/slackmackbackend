const mongoose=require('mongoose');

const sechma = new mongoose.Schema({
    UserId: {
        type: String,
        required: true,
    },
    UserName:{
        type:String,
        required:true
    },
    UserEmail:{
        type:String,
        required:true
    },
    WorkspaceName:{
        type:String,
        required:true
    },
    WorkspaceId:{
        type:String,
        required:true
    }
});

const Groups = mongoose.model('groups', sechma);
module.exports = Groups;
