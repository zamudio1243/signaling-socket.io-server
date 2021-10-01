const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);



app.get('/', (req,res) => {
  res.send('socketio...');
});

io.on('connection', (socket) => {
  console.log("nuevo socket conectado");
})

http.listen(5000, () => {
  console.log("Escuchando puerto 5000")
});


module.exports = app;