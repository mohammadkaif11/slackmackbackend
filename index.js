const express = require('express');
const bodyParser = require('body-parser');
const cors=require('cors')
const app = express();
const connectToMongo=require('./DataContext/Database')
const http = require('http').Server(app);
const io = require('socket.io')(http,{
  cors:"*"
});
app.use(bodyParser.json())
app.use(cors())
connectToMongo();

io.on('connection',function(socket) {
    console.log('A user connected');
 
    socket.on('disconnect', function () {
       console.log('A user disconnected');
}); });


app.get('/', (req, res) => {
  res.send('Api is Working fine');
});


app.use('/users',require('./Controller/UserController'));
app.use('/workspace',require('./Controller/WorkSpaceController'));

http.listen(5000, () => console.log('listening on port: 5000'));
