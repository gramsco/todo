var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const fs = require('fs')
const db = require('./db.json')

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  io.emit("db", db)
  socket.on('new', (new_todo) => {

    let todo = [...db.todo, new_todo]
    let newDb = {todo}
    fs.writeFileSync('./db.json', JSON.stringify(newDb, null, 2))
    io.emit("db", db)

  })

  socket.on('erase', (value) => {

        let todo = db.todo.filter(e => e != value)
        let newDb = {todo}
        fs.writeFileSync('./db.json', JSON.stringify(newDb, null, 2))
        io.emit("db", db)

  })

  socket.on('erase all', () => {

      let todo = []
      let newDb = { todo }
      fs.writeFileSync('./db.json', JSON.stringify(newDb, null, 2))
      io.emit("db", db)

  })
  

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});