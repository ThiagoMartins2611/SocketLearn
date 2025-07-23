
//https://socket.io/docs/v4/tutorial/api-overview *acessa esse site Thiago ele vai te ensinar o caminho*

import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);


const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, 'public')));

const players = [];

let idPlayer = 0;
let ipUser = "";


function generateColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';

    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;

}




io.on('connection', (socket) => {
    console.log("usuário conectado");

    const rawIp = socket.handshake.address;
    const ipUser = rawIp.replace(/f/g, "").replace(/:/g, "");
 
  const meuId = idPlayer++;
  const playerObj = {
        id: meuId,
        posX: 0,
        posY: 0,
        color: generateColor(),
        ipUser
    };
  players.push(playerObj);


 
    socket.emit('allPlayers', players);
    socket.emit('playerSpawn', playerObj);
    socket.broadcast.emit('playerSpawn', playerObj);


  
  socket.on('disconnect', () => {
    console.log("usuário desconectado");
    // Você pode também avisar os outros que este player saiu:
    socket.broadcast.emit('playerDisconnect', meuId);

    const index = players.findIndex(p => p.id === meuId);
    if (index !== -1) {
        players.splice(index, 1); 
    }
  });

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    socket.on('moveSquare', (pos) => {
        socket.broadcast.emit('moveSquare', {
            id: meuId,
            x: pos.x,
            y: pos.y
        });
    });
});






server.listen(7000, ()=>{
    console.log("o servidor está rodadndo na porta: 7000, http://localhost:7000")
});