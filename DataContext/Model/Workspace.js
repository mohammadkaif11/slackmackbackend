const mongoose=require('mongoose');

const sechma = new mongoose.Schema({
    UserId: {
        type: String,
        required: true,
    },
    WorkspaceName:{
        type:String,
        required:true
    }
});

const WorkSpaceSchema = mongoose.model('workspaceSchema', sechma);
module.exports = WorkSpaceSchema;
