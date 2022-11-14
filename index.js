const express = require('express');
const app = express();

app.get('/', function(req, res) {
  res.send('Home page');
});

const port = process.env.PORT || 3000;
app.listen(port , () => console.log('App listening on port ' + port));