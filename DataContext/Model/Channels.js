const mongoose=require('mongoose')
const sechma = new mongoose.Schema({
    WorkSpaceId: {
        type: String,
        required: true,
    },
    ChannelName:{
        type:String,
        required:true
    },
    Users:{
        type:[{}],
        default:[{}]
    }
});
const Channels = mongoose.model('channels', sechma);
module.exports = Channels;