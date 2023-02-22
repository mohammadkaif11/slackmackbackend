const express = require("express");
const router = express.Router();
const WorkSpaceSchema = require("../DataContext/Model/Workspace");
const Users = require("../DataContext/Model/Users");
const Groups = require("../DataContext/Model/Groups");
const VerfifyFetchUser = require("../Middleware/Verify");

//create workspace
router.post("/create", VerfifyFetchUser, async (req, res) => {
  try {
    const userId = req.userId;
    const _workspace = await WorkSpaceSchema.find({
      UserId: userId,
      workspaceName: req.body.workspaceName,
    });
    if (_workspace.length<=0 || _workspace==[]) {
      const workspacce = new WorkSpaceSchema({
        WorkspaceName: req.body.workspaceName,
        UserId: userId,
      });
      const data = await workspacce.save();
      res.send("success create successfully").status(200);
    } else {
      res.send("With same  name workspace already there").status(200);
    }
  } catch (error) {
    res.send("Some Error").status(500);
  }
});

//Adding the user in group
router.post("/addgroup", VerfifyFetchUser, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await Users.findOne({ Email: req.body.email });
    if (user) {
      const group = await Groups.findOne({ UserId: user.UserId,workSpaceId:req.body.workSpaceId});
      if (group) {
        return res
          .json({ Message: "User is already in workspace" })
          .status(200);
      }
      const newGroup = new Groups({
        UserId: user.UserId,
        WorkspaceId: req.body.workSpaceId,
        WorkspaceName: req.body.workSpaceName,
        UserName:user.Name,
        UserEmail:user
      });
      const data = await newGroup.save();
      return res.json({ Message: "Added successfully" }).status(200);
    } else {
      return res
        .json({ Message: "User is not signup with slackmack" })
        .status(500);
    }
  } catch (error) {
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
    const profileUser = await Users.find({ UserId:userId});
    const admin_group={UserEmail:admin[0].Email,UserId:admin[0].UserId,UserName:admin[0].Name,workSpaceId:workspace._id,workSpaceName:workspace.Name};
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


module.exports = router;
