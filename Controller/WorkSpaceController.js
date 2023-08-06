const express = require("express");
const router = express.Router();
const WorkSpaceSchema = require("../DataContext/Model/Workspace");
const Users = require("../DataContext/Model/Users");
const Groups = require("../DataContext/Model/Groups");
const VerfifyFetchUser = require("../Middleware/Verify");
const Chats = require("../DataContext/Model/Chats");
const OneChats = require("../DataContext/Model/OneChats");
const Channels=require("../DataContext/Model/Channels");  

//create workspace
router.post("/create", VerfifyFetchUser, async (req, res) => {
  try {
    const userId = req.userId;
    const _workspace = await WorkSpaceSchema.find({
      UserId: userId,
      workspaceName: req.body.workspaceName,
    });
    if (_workspace.length <= 0 || _workspace == []) {
      const workspacce = new WorkSpaceSchema({
        WorkspaceName: req.body.workspaceName,
        UserId: userId,
      });
      const data = await workspacce.save();
      res.send("success create successfully").status(200);
         return;
      
    } else {
      res.send("With same  name workspace already there").status(200);
    }
  } catch (error) {
    res.send("Some Error").status(500);
  }
});

//Adding the user in workspace
router.post("/addgroup", VerfifyFetchUser, async (req, res) => {
  try {
    const user = await Users.findOne({ Email: req.body.email });
    if (user) {
      const group = await Groups.findOne({
        UserId: user.UserId,
        workSpaceId: req.body.workSpaceId,
      });
      if (group) {
        return res
          .json({ Message: "User is already in workspace" })
          .status(200);
      }
      const newGroup = new Groups({
        UserId: user.UserId,
        WorkspaceId: req.body.workSpaceId,
        WorkspaceName: req.body.workSpaceName,
        UserName: user.Name,
        UserEmail: user.Email,
      });
      const data = await newGroup.save();
      return res.json({ Message: "Added successfully" }).status(200);
    } else {
      return res
        .json({ Message: "User is not signup with slackmack" })
        .status(500);
    }
  } catch (error) {
    console.log('Error add In Group :', error);
    return res.json({ Message: "Something happen in backend" }).status(500);
  }
});

//Get all user for workspace
router.get("/getuser/:id", VerfifyFetchUser, async (req, res) => {
  try {
    const userId = req.userId;
    const workspaceId = req.params["id"];
    const groups = await Groups.find({ WorkspaceId: workspaceId });
    const workspace = await WorkSpaceSchema.findById(workspaceId);
    const admin = await Users.find({ UserId: workspace.UserId });
    const profileUser = await Users.find({ UserId: userId });
    const admin_group = {
      _id: admin[0]._id,
      UserEmail: admin[0].Email,
      UserId: admin[0].UserId,
      UserName: admin[0].Name,
      workSpaceId: workspace._id,
      workSpaceName: workspace.Name,
    };
    groups.push(admin_group);
    res
      .json({
        user: profileUser,
        groups: groups,
        workspace: workspace,
        admin: admin,
        Msg: "successfull get request from get all user with workspace Id",
      })
      .status(200);
  } catch (error) {
    res.json({ Message: "Something happen in backend" }).status(500);
  }
});

//Get chat particular room
router.get("/chats/:id", VerfifyFetchUser, async (req, res) => {
  try {
    const workspaceId = req.params["id"];
    const chats = await Chats.find({ WorkspaceId: workspaceId });
    res
      .json({
        chat: chats,
        Msg: "successfull get Chats",
      })
      .status(200);
  } catch (error) {
    res.json({ Message: "Something happen in backend" }).status(500);
  }
});

//Get chat with users
router.post("/userchats/:id", VerfifyFetchUser, async (req, res) => {
  try {
    const firstUserId = req.body.firstUserId;
    const secondUserId = req.body.secondUserId;
    const room1 = firstUserId + secondUserId;
    const room2 = secondUserId + firstUserId;
    const workspaceId = req.params["id"];
    const chats = await OneChats.find({
      WorkspaceId: workspaceId,
      RoomId: { $in: [room1, room2] },
    }).sort({ Created: 1 });
    res.json({
      chat: chats,
      Msg: "successfull get Chats",
    });
  } catch (error) {
    res.json({ Message: "Something happen in backend" }).status(500);
  }
});

//Delete User with id
router.get("/deleteuser/:id", VerfifyFetchUser, async (req, res) => {
  try {
    const userId = req.params["id"];
    const Group=await Groups.findByIdAndDelete(userId);
    if(Group){
      res
      .json({
        Message: "Successfully delete",
      })
    }else{
      res
      .json({
        Message: "Admin can't delete itself",
      })
    }
  } catch (error) {
    console.log('Error delete user by userid:', error);
    res.json({ Message: "Something happen in backend" }).status(500);
  }
});

//Create Channel
router.post('/createchannel',VerfifyFetchUser, async (req, res) => {  
  try {
   if(req.body.workSpaceId=="" || req.body.channelName==""){
    res.json({ Message: "WorkspaceId or channelName cant empty" }).status(200);
    return;
   }
  const channel=new Channels({WorkSpaceId: req.body.workSpaceId, ChannelName: req.body.channelName, Users:[]});
  const data=await channel.save();
  res.json({Message:"Sucess Create Channel"}).status(200);
  } catch (error) {
    res.json({ Message: "Something happen in backend" }).status(500);
  }
})

//get Channels
router.post('/getchannels',async (req, res)=>{
  try {
    if(req.body.workSpaceId==""){
     res.json({ Message: "WorkspaceId or channelName cant empty" }).status(200);
     return;
    }
   const channel=await Channels.find({WorkSpaceId:req.body.workSpaceId});
   res.json({Message:"Sucess Get Channels",Channels:channel}).status(200); 
   } catch (error) {
    console.log('Error get channels:', error);
     res.json({ Message: "Something happen in backend" }).status(500);
   }
})

//get workspacedetails
router.get("/getWorkspacedetails/:id", VerfifyFetchUser, async (req, res) => {
  try {
    const id = req.params["id"];
    const workspace=await WorkSpaceSchema.findById(id);
    res.json({ Message: "Sucess get workspace details",Workspace:workspace }).status(200);
  } catch (error) {
    console.log('Error get workspacedetails:', error);
    res.json({ Message: "Something happen in backend" }).status(500);
  }
});

//add Channels
router.post("/addchannel", VerfifyFetchUser, async (req, res) => {
  try {
    const user = await Users.findOne({ Email: req.body.email });
    if (user) {
      const group=await Groups.findOne({ WorkspaceId: req.body.workSpaceId,UserId:user.UserId,UserEmail:req.body.email });
      if (group) {
        const channel=await Channels.findById(req.body.channelId);
        if(channel){
          var ExistUser=channel.Users.find(function(element){
            if(element==user.UserId){
              return element;
            }
          })
          if(ExistUser){
            return res.json({ Message: "UserAlready Exist with channel" }).status(200);
          }
          let Temp=[];
          Temp=channel.Users;
          Temp.push(user.UserId);
          channel.Users=Temp;
          const updateChannel=await Channels.findByIdAndUpdate(req.body.channelId,channel);
          return res.json({ Message: "Successfully add User in Channel" }).status(200);
        }
      }else{
        return res.json({ Message: "User Does not Exits in workspace" }).status(200);
      }
    } else {
      return res
        .json({ Message: "User is not signup with slackmack" })
        .status(500);
    }
  } catch (error) {
    console.log('Error add user in channel :', error);
    return res.json({ Message: "Something happen in backend" }).status(500);
  }
});

//Get Channels by workspaceId and UserId
router.get('/getChannels/:id',VerfifyFetchUser, async (req, res) => {
 try {
    const userId = req.userId;
    const id = req.params["id"];
    let ChannelArray=[];
    const channels=await Channels.find({WorkSpaceId:id});

    channels.forEach(element => {
      let UserExist=element.Users.find((element) =>{return element==userId});
      if(UserExist){
        ChannelArray.push(element);
      }
    });

    return res.json({ Message: "Success Get Channels",Channel:ChannelArray}).status(500);

  } catch (error) {
    console.log('Error get channels by id:', error);
    return res.json({ Message: "Something happen in backend" }).status(500);
  }
})


module.exports = router;
