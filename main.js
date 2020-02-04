var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const fs = require('fs')
const db = require('./db.json')
const path = require('path')
const {exec} = require('child_process')


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

let pathDB = path.join(__dirname,"db.json")


io.on('connection', function(socket){

  io.emit("db", db)
  exec("docker info", (err,stdout,stderr) => {
    if (err){
        console.log("an error occured")
        return;
    }

    let arr = stdout.split('\n')
    let containers = arr[4]
    let running = arr[5]
    let paused = arr[6]
    let stopped = arr[7]
    let images = arr[8]

    io.emit('docker', {containers,running,paused,stopped,images})
    
  })

  exec(`cd ../../projects && ls`, (err, stdout, stderr) => {

    if (err){
      io.emit('command_response', "an error occured")
    }
    let result = stdout
    console.log(result.split('\n'))
    io.emit("command_response", result.split('\n'))
  })
  
  socket.on('new', (new_todo) => {

    let todo = [...db.todo, new_todo]
    let newDb = {todo}
    fs.writeFileSync(pathDB, JSON.stringify(newDb, null, 2))
    io.emit("db", db)

  })

  socket.on('erase', (value) => {

        let todo = db.todo.filter(e => e != value)
        let newDb = {todo}
        fs.writeFileSync(pathDB, JSON.stringify(newDb, null, 2))
        io.emit("db", db)
  })


  socket.on('erase all', () => {

      let todo = []
      let newDb = { todo }
      fs.writeFileSync(pathDB, JSON.stringify(newDb, null, 2))
      io.emit("db", db)

  })

  socket.on('folder', (folder) => {

    exec(`cd ../../projects/${folder} && code .`, (err, stdout, stdin) => {

      if (err) {
        console.log(err)
        return 
      }
      else {
        console.log('success')
      }
    })

  })
  

});

http.listen(1312, function(){
  console.log('listening on 1312');
});
