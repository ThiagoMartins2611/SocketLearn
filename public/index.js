document.addEventListener('DOMContentLoaded', ()=>{
 class Player {
    constructor() {
        this.id = null;
        this.posX = 0;
        this.posY = 0;
        this.color = null
    }


    Create(playerInfo) {


        const body = document.getElementById('body');
        const player = document.createElement('div');
        player.className = 'player'
        

        this.id = playerInfo.id;
        this.posX = playerInfo.posX;
        this.posY = playerInfo.posY;
        this.color = playerInfo.color

        player.id = `player-${playerInfo.id}`;

        player.innerText = this.id;
        player.style.backgroundColor = this.color

        body.appendChild(player)
        
        
    }
}

const socket = io();


socket.on('allPlayers', (listaDePlayers) => {
  listaDePlayers.forEach((playerInfo) => {
    const player = new Player();
    player.Create(playerInfo);
  });
});

socket.on('playerSpawn', playerInfo => {
  const player = new Player();
  player.Create(playerInfo);
  console.log("eu:", playerInfo);
});


socket.on('playerDisconnect', (idDoJogador) => {
  const playerElement = document.getElementById(`player-${idDoJogador}`);
  if (playerElement) {
    playerElement.remove();
  }
});




//////////////////////////////////////////////////////////





const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const inputNome = document.getElementById('inputNome');

form.addEventListener('submit', (e)=>{

    e.preventDefault()

    if(input.value && inputNome.value){
        socket.emit('chat message', {nome: inputNome.value, mensagem: input.value});
        input.value = '';
    }
});


socket.on('chat message', (msg)=>{
    const item = document.createElement('li');
    item.textContent = `${msg.nome}: ${msg.mensagem}`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight)
});


///////////////////////////////////////////////////////////////////////////






const velocity = 5;


let pos = { top: 0, left: 0 };
let keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function move() {
    if (keys["w"]) pos.top -= velocity;
    if (keys["s"]) pos.top += velocity;
    if (keys["a"]) pos.left -= velocity;
    if (keys["d"]) pos.left += velocity;

    


    socket.emit('moveSquare', { x: pos.left, y: pos.top });

    requestAnimationFrame(move); 
}

move();
    

socket.on('moveSquare', (pos)=>{

});

});

