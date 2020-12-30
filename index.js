const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const socketio = require('socket.io');

app.use(express.static(__dirname + '/public'))

app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/public/login.html');
})

app.get('/game',(req,res)=>{
    res.sendFile(__dirname + '/public/game.html');
})

const server = app.listen(port,()=>{
    console.log('listening on port ' + port);
})

const io = socketio(server);

const User = require('./classes/User/User');
const Users = require('./classes/User/Users');

const users = new Users();

io.on('connection',socket=>{
    socket.on('joining',({username})=>{
        users.addUser(new User(socket.id,username));
    })
    socket.on('disconnect',()=>{
        users.removeUser(socket.id);
    })
    socket.on('key-down',(key)=>{
        users.keyDown(socket.id,key);
    })
    socket.on('key-up',(key)=>{
        users.keyUp(socket.id,key);
    })
    socket.on('missile',({angle})=>{
        users.getUser(socket.id).launch(angle);
    })
    socket.on('reset',msg=>{
        users.getUser(socket.id).reset();
    })
})

setInterval(()=>{
    const deadUsers = users.moveUsers();
    deadUsers.forEach(user=>{
        io.to(user.id).emit('dead','You were killed by ' + user.killerName);
    })
    io.emit('gameLogic',users);
},16);