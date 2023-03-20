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

const WorkSpaceSchema = mongoose.model('workspace', sechma);
module.exports = WorkSpaceSchema;
