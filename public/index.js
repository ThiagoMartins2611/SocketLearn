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
        this.name = playerInfo.name;

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


form.addEventListener('submit', (e)=>{

    e.preventDefault()

    if(input.value != ""){
        socket.emit('chat message', {nome: playerName, mensagem: input.value});
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
 let newPos = {...pos};
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
    size: {x: arena.clientWidth, y: arena.clientHeight}
  };

  const minX = 0;
  const minY = 0;

  const maxX = arenaInfo.size.x - playerSize.x;
  const maxY = arenaInfo.size.y - playerSize.y;



   
  if (keys["w"] || keys["ArrowUp"]) newPos.top -= velocity;
  if (keys["s"] || keys["ArrowDown"]) newPos.top += velocity;
  if (keys["a"] || keys["ArrowLeft"]) newPos.left -= velocity;
  if (keys["d"] || keys["ArrowRight"]) newPos.left += velocity;



  newPos.left = Math.max(minX, Math.min(maxX, newPos.left));
  newPos.top = Math.max(minY, Math.min(maxY, newPos.top));


  pos = { ...newPos };

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
      
    playerElement.style.top = `${y}px`;
    playerElement.style.left = `${x}px`;
  
  }
});


/////////////////////////////////////////////////////////////////////////////////////////////////
//ATACK

const mira = document.getElementById('mouse');

document.addEventListener('mousemove', (event) => {

  const x = event.clientX;
  const y = event.clientY;

  mira.style.top = y+'px';
  mira.style.left = x+'px';

  console.log(`Posição do Mouse - X: ${x}, Y: ${y}`);

});

document.addEventListener('click', (event) => {
    const arena = document.getElementById("arena");
    const arenaRect = arena.getBoundingClientRect(); // Pega informações de tamanho e posição da arena

    // 1. Posição do centro do jogador
    // (A variável 'pos' já guarda a posição top/left do seu jogador)
    const playerCenterX = pos.left + (playerSize.x / 2);
    const playerCenterY = pos.top + (playerSize.y / 2);

    // 2. Posição do mouse relativa à arena
    const mouseX = event.clientX - arenaRect.left;
    const mouseY = event.clientY - arenaRect.top;

    // 3. Calcula a diferença (delta) para encontrar o ângulo
    const deltaX = mouseX - playerCenterX;
    const deltaY = mouseY - playerCenterY;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI); // Converte radianos para graus

    // 4. Cria e posiciona o laser
    const laser = document.createElement("div");
    laser.className = "laser"; // Use 'className' em vez de 'classList' para substituir todas as classes

    // Define a origem da rotação e a posição inicial
    laser.style.left = `${playerCenterX}px`;
    laser.style.top = `${playerCenterY}px`;
    laser.style.transformOrigin = '0% 50%'; // Faz o laser girar a partir do seu ponto inicial (esquerda)
    laser.style.transform = `rotate(${angle}deg)`;

    arena.appendChild(laser);

    setTimeout(() => {
        laser.remove();
    }, 100);
});

});

