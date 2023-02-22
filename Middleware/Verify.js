const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function VerfifyFetchUser(req,res,next){
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({error: "please authenticate using valid token" });
    }
    try {
        const verifyuser = jwt.verify(token, JWT_SECRET);
        req.userId = verifyuser.userId;
        next();
    } catch (error) {
        res.status(401).send({ error: "please authenticate using valid token" });
    }
}

module.exports = VerfifyFetchUser;