
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

app.get('/jogo', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'jogo.html'));
});


function generateColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';

    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;

}


const ARENA_WIDTH = 1440; 
const ARENA_HEIGHT = 720; 
const PLAYER_SIZE = 50;
const VELOCITY = 5;

io.on('connection', (socket) => {
    console.log("usuário conectado");
        const rawIp = socket.handshake.address;
        const ipUser = rawIp.replace(/f/g, "").replace(/:/g, "");
        const meuId = `player-${ipUser}-${Date.now()}`;

    // Ouça o evento 'playerInfo' enviado pelo cliente
    socket.on('playerInfo', (info) => {
        const playerName = info.name;
        
        // Aqui você pode continuar a criar o objeto do jogador
     
        const playerObj = {
            id: meuId,
            name: playerName, // Adicione o nome ao objeto do jogador
            posX: 0,
            posY: 0,
            color: generateColor(),
            ipUser
        };

        players.push(playerObj);

        socket.emit('playerSpawn', playerObj);
        socket.emit('allPlayers', players);
        socket.broadcast.emit('playerSpawn', playerObj);
    });




    socket.on('playerMovement', (keys) => {
        const player = players.find(p => p.id === meuId);

        if (player) {
            let newX = player.posX;
            let newY = player.posY;

            // Calcule a nova posição com base nas teclas pressionadas
            if (keys.w) newY -= VELOCITY;
            if (keys.s) newY += VELOCITY;
            if (keys.a) newX -= VELOCITY;
            if (keys.d) newX += VELOCITY;

            // Aplique os limites da arena no servidor
            const minX = 0;
            const minY = 0;
            const maxX = ARENA_WIDTH - PLAYER_SIZE*2;
            const maxY = ARENA_HEIGHT - PLAYER_SIZE;

            newX = Math.max(minX, Math.min(maxX, newX));
            newY = Math.max(minY, Math.min(maxY, newY));

            player.posX = newX;
            player.posY = newY;

            // Emita a posição corrigida para TODOS os jogadores (incluindo o que se moveu)
            io.emit('moveSquare', {
                id: meuId,
                x: player.posX,
                y: player.posY
            });
        }
    });

    socket.on('disconnect', () => {
        console.log("usuário desconectado");
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
        const player = players.find(p => p.id === meuId);

        if (player) {
            player.posX = pos.x;
            player.posY = pos.y;
        }

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