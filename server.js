const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');




const app = express();
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});



app.use(express.static(path.join(__dirname, 'public')));

const port = 7000;



io.on('connection', (socket)=>{

    console.log("Novo cliente conectado")

    socket.on('mensagem', (msg)=>{

        console.log('Mensagem recebida:', msg);
        io.emit('mensagem', msg);

    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });

});




server.listen(port, '0.0.0.0', ()=>{
    console.log("ta rodando na porta 7000")
});