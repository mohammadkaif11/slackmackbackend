const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const connectToMongo = require("./DataContext/Database");
const VerifytokenSocket = require("./Middleware/VerifytokenSocket");
const http = require("http").Server(app);
const Chats = require("./DataContext/Model/Chats");
const OneChats=require('./DataContext/Model/OneChats');
const fs = require("fs");
//AWS Sdk
const AWS = require("aws-sdk");
const ID =process.env.AWS_ID;
const SECRET = process.env.AWS_SECRET;
const BUCKET_NAME = process.env.BACKET_NAME;
connectToMongo();

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

app.use(bodyParser.json());
app.use(cors());

var GolbalObject = [];

io.on("connection", function (socket) {
  console.log("A user connected");
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
      console.log(GolbalObject);
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
      console.log(GolbalObject);
      socket.join(data.Id.id);
      socket.emit("ONLINEUSER", GolbalObject);
    }
  });

  socket.on("MSG", (data) => {
    SaveChatToDB(data);
    socket.in(data.Id).emit("GETMSG", data);
  });

  socket.on("disconnect", function () {
    console.log("disconnect users");
    const newObject = [];
    GolbalObject.forEach(function (element) {
      if (element.socketId != socket.id) {
        newObject.push(element);
      }
    });
    GolbalObject = newObject;
    console.log("A user disconnected");
    socket.emit("ONLINEUSER", GolbalObject);
  });

  socket.on("upload", (file, sendObj, callback) => {
    const params = {
      Bucket: BUCKET_NAME,
      Key: sendObj.Id +"_"+ sendObj.UserId+"_"+ sendObj.Message,
      Body: file,
    };
    SaveChatToDB(sendObj);
    sendObj.Message = params.Key;
    sendObj.Content=params.Key;
    s3.upload(params, function (err, data) {
      if (err) {
        console.log(err);
      }
      console.log(`File uploaded successfully. ${data.Location}`);
      callback({ message: err ?{Msg:"failure",ResponseObj:sendObj} : {Msg:"success",ResponseObj:sendObj}});
    });
  });
});

app.get("/", (req, res) => {
  res.send("Api is Working fine");
});


//S3 Bucket Dwonload implementation
app.get("/download/:filename", async (req, res) => {
  const filename = req.params.filename;
  let x = await s3.getObject({ Bucket: BUCKET_NAME, Key: filename }).promise();
  res.send(x.Body);
});

//Save chat to DataBase
function SaveChatToDB(obj) {  
  console.log("SaveChat Db is call");
  if(obj.withUser==false)
  {
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
      console.log("chats is save");
    })
    .catch((error) => {
      console.log(error);
    });
  }else{
    const chats = new OneChats({
      WorkspaceId: obj.Id,
      SenderUserId: obj.SenderUserId,
      SenderUserName: obj.SenderUserName,
      Content: obj.Message,
      IsFile: obj.IsFile,
      Date: obj.Date,
      Time: obj.Time,
      FileExtension: obj.FileExtension,
      RecieverUserId:obj.RecieverUserId,
      RecieverUserName:obj.RecieverUserName
    });
    chats.save().then((data)=>{
      console.log("Chat save sucessfully")
    }).catch((error)=>{
      console.log(error);
    })
  }
}

app.use("/users", require("./Controller/UserController"));
app.use("/workspace", require("./Controller/WorkSpaceController"));

http.listen(5000, () => console.log("listening on port: 5000"));
