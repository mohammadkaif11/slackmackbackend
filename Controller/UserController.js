const express = require("express");
const router = express.Router();
const Users = require("../DataContext/Model/Users");
const WorkSpaceSchema = require("../DataContext/Model/Workspace");
const Groups = require("..//DataContext/Model/Groups");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const VerfifyFetchUser = require("../Middleware/Verify");
dotenv.config();

//login()
router.post("/login", async (req, res) => {
  try {
    const profile = JSON.parse(req.body.profile);
    const user = await Users.findOne({ UserId: profile.id });
    if (user) {
      user.picture = profile.picture;
      const JWT_SECRET = process.env.JWT_SECRET;
      let data = {
        userId: user.UserId,
      };
      const jwttoken = jwt.sign(data, JWT_SECRET);
      return res
        .json({ Msg: "Success", token: jwttoken, profile: user })
        .status(200);
    } else {
      const NewUser = new Users({
        UserId: profile.id,
        Email: profile.email,
        Name: profile.name,
      });
      const saveUser = await NewUser.save();
      if (saveUser != null) {
        saveUser.picture = profile.picture;
        const JWT_SECRET = process.env.JWT_SECRET;
        let data = {
          userId: user.UserId,
        };
        const jwttoken = jwt.sign(data, JWT_SECRET);
        return res
          .json({ Msg: "Success", token: jwttoken, profile: saveUser })
          .status(200);
      } else {
        return res
          .json({ Msg: "Serve error", token: "", profile: null })
          .status(500);
      }
    }
  } catch (error) {
    res.json({ Msg: "Serve error", token: "", profile: null }).status(500);
  }
});

//getProfile() and get all workspace and get all groups
router.get("/getprofile", VerfifyFetchUser, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await Users.find({ UserId: userId });
    const workspaces = await WorkSpaceSchema.find({ UserId: userId });
    const groups = await Groups.find({ UserId: userId });
    res
      .json({
        Msg: "Success get profile",
        workspace: workspaces,
        profile: user,
        group: groups,
      })
      .status(200);
  } catch (error) {
    console.log(error);
    res
      .json({
        Msg: "Internal server error in get profile",
        workspace: [],
        profile: {},
        group: [],
      })
      .status(500);
  }
});


//Get RoomName details 
router.get("/roomName/:id", VerfifyFetchUser, async (req, res) => {
  try {
    const url = req.params["id"];
    const split = url.split("-");
    const Userid = split[1];
    const users = await Users.find({ UserId: Userid });
    if (users.length == 0) {
      res
        .json({
          Name: Userid,
          Id:split[0],
          Msg: "successfull get Name",
        })
        .status(200);
    } else {
      res
        .json({
          Name: users[0].Name,
          Id:split[0],
          Msg: "successfull get Name",
        })
        .status(200);
    }
  } catch (error) {
    res.json({ Message: "Something happen in backend" }).status(500);
  }
});


module.exports = router;
