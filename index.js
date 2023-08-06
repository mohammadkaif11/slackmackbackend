const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const connectToMongo = require("./DataContext/Database");
const VerifytokenSocket = require("./Middleware/VerifytokenSocket");
const http = require("http").Server(app);
const Chats = require("./DataContext/Model/Chats");
const OneChats = require("./DataContext/Model/OneChats");
var uniqid = require("uniqid");

//AWS Sdk
const AWS = require("aws-sdk");
const ID = process.env.AWS_ID;
const SECRET = process.env.AWS_SECRET;
const BUCKET_NAME = process.env.BACKET_NAME;
connectToMongo();
app.use(bodyParser.json());
app.use(cors());

//S3 Bucket
const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});

const params = {
  Bucket: BUCKET_NAME,
  CreateBucketConfiguration: {
    // Set your region here
    LocationConstraint: "ap-south-1",
  },
};

const io = require("socket.io")(http, {
  cors: "*",
});

var GolbalObject = [];
var UserStore = [];

io.on("connection", function (socket) {
  //SaveRoomDetails
  socket.on("SAVEROOMD", async (data) => {
    const User = await VerifytokenSocket(data.token);
    if (data.isUser == false) {
      const newObject = [];
      GolbalObject.forEach(function (element) {
        if (element.UserId != User.Id) {
          newObject.push(element);
        }
      });
      data.UserId = User.Id;

      socket.emit("USERID", User.Id);
      data.socketId = socket.id;
      data.Name = User.Name;
      socket.emit("GETUSERNAME", User.Name);

      newObject.push(data);
      GolbalObject = newObject;
      console.log(`-------------------workspace joinroom ---Id is ${data.Id.id}------------`);
      socket.join(data.Id.id);
      socket.emit("ONLINEUSER", GolbalObject);
    } else {
      const newObject = [];
      GolbalObject.forEach(function (element) {
        if (element.UserId != User.Id) {
          newObject.push(element);
        }
      });
      data.UserId = User.Id;
      socket.emit("USERID", User.Id);
      data.socketId = socket.id;
      data.Name = User.Name;
      socket.emit("GETUSERNAME", User.Name);
      newObject.push(data);
      GolbalObject = newObject;
      console.log(`-------------------user connect to other user ---join  room Id is ${data.Id}--------------`);
      socket.join(data.Id);
      socket.emit("ONLINEUSER", GolbalObject);
    }
  });

  //Send Msg
  socket.on("MSG", (data) => {
    socket.broadcast.to(data.Id).emit("GETMSG", data);
    // socket.in(data.Id)
    SaveChatToDB(data);
  });

  //unsribe the room
  socket.on("UnscribeRoom", (data) => {
    socket.leave(data);
    console.log("------User Leave room-----------------", data);
  });

  //disconnect
  socket.on("disconnect", function () {
    const newObject = [];
    GolbalObject.forEach(function (element) {
      if (element.socketId != socket.id) {
        newObject.push(element);
      }
    });
    GolbalObject = newObject;
    socket.emit("ONLINEUSER", GolbalObject);
  });

  //upload message
  socket.on("upload", (file, sendObj, callback) => {
    const params = {
      Bucket: BUCKET_NAME,
      Key: sendObj.Message,
      Body: file,
    };
    SaveChatToDB(sendObj);
    sendObj.Message = params.Key;
    sendObj.Content = params.Key;
    s3.upload(params, function (err, data) {
      if (err) {
        console.log('Error uploading file: ',err.message);
      }
      console.log(`File uploaded successfully. ${data.Location}`);
      callback({
        message: err
          ? { Msg: "failure", ResponseObj: sendObj }
          : { Msg: "success", ResponseObj: sendObj },
      });
      //emit Object in room
      socket.in(sendObj.Id).emit("GETMSG", sendObj);
    });
    
  });

  //Create room
  socket.on("createRoom2", (data) => {
    console.log("-------User Create Room data---------", data);
    var room = UserStore.find(function (element) {
      if (
        (data.workspaceId == element.workspaceId &&
          element.from == data.to &&
          element.to == data.from) ||
        (element.from == data.from && element.to == data.to)
      ) {
        return element;
      }
    });
    if (room != undefined || room != null) {
      console.log("------room Exists on Server--------",room);
      console.log("------User Store databse----------", UserStore);
      socket.emit("SENDROOMID", room.RoomId);
    } else {
      var RoomId = data.from + data.to;
      data.RoomId = RoomId;
      UserStore.push(data);
      console.log("------room does not Exists on Server--------",data);
      console.log("------User Store database----------", UserStore);
      socket.emit("SENDROOMID", RoomId);
    }
  });

  //Send Online User to Room
  socket.emit("ONLINEUSER", GolbalObject);
});

app.get("/", (req, res) => {
  res.send("Api is Working fine");
});

//S3 Bucket Dwonload implementation ..... ........
app.get("/download/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    let x = await s3
      .getObject({ Bucket: BUCKET_NAME, Key: filename })
      .promise();
    res.send(x.Body);
  } catch (error) {
    console.log('Error downloading: ',error.message);
    res.send(error.message);
  }
});

//Save chat to DataBase ............
function SaveChatToDB(obj) {
  if (obj.withUser == false) {
    const chats = new Chats({
      WorkspaceId: obj.Id,
      UserId: obj.UserId,
      UserName: obj.UserName,
      Content: obj.Message,
      IsFile: obj.IsFile,
      Date: obj.Date,
      Time: obj.Time,
      FileExtension: obj.FileExtension,
    });
    chats
      .save()
      .then((data) => {
        console.log('--------------- Chats is saved in database--------------------------------');
      })
      .catch((error) => {
        console.log('when chat is saved in db: ' + error.message);
      });
  } else {
    const chats = new OneChats({
      WorkspaceId: obj.workspaceId,
      RoomId: obj.Id,
      UserId: obj.UserId,
      UserName: obj.UserName,
      Content: obj.Message,
      IsFile: obj.IsFile,
      Date: obj.Date,
      Time: obj.Time,
      FileExtension: obj.FileExtension,
      RecieverUserId: obj.SecondUserId,
      RecieverUserName: obj.SecondUserName,
    });
    chats
      .save()
      .then((data) => {
        console.log('--------------- Chats is saved in database--------------------------------');
      })
      .catch((error) => {
        console.log('when chat is saved in db: ' + error.message);
      });
  }
}

app.use("/users", require("./Controller/UserController"));
app.use("/workspace", require("./Controller/WorkSpaceController"));

http.listen(5000, () => console.log("listening on port: 5000"));
