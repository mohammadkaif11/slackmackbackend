const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Users=require('../DataContext/Model/Users')
dotenv.config();

async function VerifytokenSocket(token){
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!token) {
    return null;
    }
    const verifyuser = jwt.verify(token, JWT_SECRET);
    const data=await Users.find({UserId:verifyuser.userId});
    const obj={
        "Id":verifyuser.userId,
        "Name":data[0].Name
    }
    return obj;
}

module.exports = VerifytokenSocket;