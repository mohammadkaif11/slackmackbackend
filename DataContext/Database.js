require('dotenv').config();
const mongoose = require('mongoose');
const mongoString ='mongodb+srv://QiuzApplication:QiuzApplication@cluster0.h85reco.mongodb.net/slackmack';

mongoose.set('strictQuery', false)
mongoose.connect(mongoString);


const database = mongoose.connection;

const connectToMongo = () => {
    database.on('error', (error) => {
        console.log(error)
    })
    database.once('connected', () => {
        console.log('Database Connected');
    })
}

module.exports = connectToMongo;