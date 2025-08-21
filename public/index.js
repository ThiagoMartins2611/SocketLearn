document.addEventListener('DOMContentLoaded', ()=>{
 class Player {
    constructor() {
        this.id = null;
        this.posX = 0;
        this.posY = 0;
        this.color = null
        this.ipUser = null;
    }


    Create(playerInfo) {


        const arena = document.getElementById('arena');
        const player = document.createElement('div');
        const name = document.createElement('h4');

        player.className = 'player'
        

        this.id = playerInfo.id;
        this.posX = playerInfo.posX;
        this.posY = playerInfo.posY;
        this.color = playerInfo.color;
        this.ipUser = playerInfo.ipUser;
        this.name = playerInfo.name

        player.id = `${playerInfo.id}`;

        
        name.innerText = this.name;


        player.style.backgroundColor = this.color
        player.style.left = `${this.posX}px`;
        player.style.top = `${this.posY}px`;

        player.appendChild(name)
        arena.appendChild(player)
        
        
    }
}

const socket = io();

let meuPlayerId;


const urlParams = new URLSearchParams(window.location.search);
const playerName = urlParams.get('nome');

socket.emit('playerInfo', { name: playerName });


socket.on('allPlayers', (listaDePlayers) => {

  listaDePlayers.forEach((playerInfo) => {

    if(!document.getElementById(playerInfo.id)){
      const player = new Player();
      player.Create(playerInfo);
    }
 
  });


});

socket.on('playerSpawn', playerInfo => {
  const player = new Player();
  player.Create(playerInfo);
  

  if (playerInfo.ipUser === socket.id || !meuPlayerId) {
    meuPlayerId = playerInfo.id;
    pos.left = playerInfo.posX;
    pos.top = playerInfo.posY;
  }

  console.log("eu:", playerInfo);
});


socket.on('playerDisconnect', (idDoJogador) => {
  const playerElement = document.getElementById(`${idDoJogador}`);
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


//CONTROLES



const velocity = 5;


const playerSize = {x: 50, y: 50}
let pos = {top:0, left:0};

let keys = {};


document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});


function move() {

  const arena = document.getElementById("arena");

  const arenaInfo = {
    size: {x: arena.getBoundingClientRect().width, y: arena.getBoundingClientRect().height}, 
    pos: {x: arena.getBoundingClientRect().left, y: arena.getBoundingClientRect().top}
  };

  const minX = arenaInfo.pos.x;
  const minY = arenaInfo.pos.y;


  const maxX = arenaInfo.size.x - playerSize.x;
  const maxY = arenaInfo.size.y - playerSize.y;



    let newPos = {...pos};
  if (keys["w"] || keys["ArrowUp"]) newPos.top -= velocity;
  if (keys["s"] || keys["ArrowDown"]) newPos.top += velocity;
  if (keys["a"] || keys["ArrowLeft"]) newPos.left -= velocity;
  if (keys["d"] || keys["ArrowRight"]) newPos.left += velocity;

  // Verifique e aplique os limites
  if (newPos.left >= minX && newPos.left <= maxX) {
    pos.left = newPos.left;
  }
  if (newPos.top >= minY && newPos.top <= maxY) {
    pos.top = newPos.top;
  }
  
  pos.left = Math.max(minX, Math.min(pos.left, maxX));
  pos.top = Math.max(minY, Math.min(pos.top, maxY));

const playerUser = document.getElementById(`${meuPlayerId}`);

if (playerUser) {
  playerUser.style.left = `${pos.left}px`;
  playerUser.style.top = `${pos.top}px`;
}


    socket.emit('moveSquare', { x: pos.left, y: pos.top });

    requestAnimationFrame(move); 
}

requestAnimationFrame(move)

    

socket.on('moveSquare', (data)=>{
  const { x, y, id } = data;
  const playerElement = document.getElementById(`${id}`);
  if (playerElement) {
    playerElement.style.left = `${x}px`;
    playerElement.style.top = `${y}px`;
  }
});


});

