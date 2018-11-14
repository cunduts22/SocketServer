const express = require('express')
const app = express()

app.use("*", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Method", "GET", "POST");
  next();
});


const server = require('http').createServer(app)
const io = require('socket.io').listen(server);
let users = [],
    connections = [];

io.on('connection', (socket) => {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);
    socket.on('disconnect', (data) => {
        connections.splice(connections.indexOf(socket), 1);
        users.splice(users.indexOf(socket), 1)
        console.log('Disconnected: %s sockets connected', connections.length);
        updateSocket()
    })

    socket.on('add device', (data) => {
        users.push(data)
        updateSocket();
    })

    socket.on('select-user', (selected) => {
        socket.emit('select-user', selected)
        updateSocket()
    });

    socket.on("track", (data) => {
        let index = users.findIndex(x => x.id === data.id)
        let n = users[index]
        n.status = data.status
        users.splice(index, 1);
        users.push(n);
        updateSocket()
        // let c = users.slice(index, 1)
    })
    const updateSocket = () => {
        io.emit("all-users", users);
    }
    
});


server.listen(4000).on("listening", () => {
  console.log("listening on port 4000");
});