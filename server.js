
//https://socket.io/docs/v4/tutorial/step-4 *acessa esse site Thiago ele vai te ensinar o caminho*

import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server)


const __dirname = dirname(fileURLToPath(import.meta.url));


app.get('/', (req, res)=>{
    
    res.sendFile(join(__dirname,'public', 'index.html'));

});


io.on('connection', (socket)=>{
    console.log("usuario conectado");



    socket.on('disconnect', ()=>{
        console.log("usuario disconectado");
    });

    socket.on('chat message', (msg)=>{
        io.emit('chat message', msg);
    });

});






server.listen(7000, ()=>{
    console.log("o servidor está rodadndo na porta: 7000, http://localhost:7000")
});