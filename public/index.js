document.addEventListener('DOMContentLoaded', () => {
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
      this.health = playerInfo.health !== undefined ? playerInfo.health : 3;

      player.id = `${playerInfo.id}`;

      name.dataset.name = this.name;
      name.innerText = `${this.name} (${this.health}♥)`;


      player.style.backgroundColor = this.color
      player.style.boxShadow = `0 0 15px ${this.color}`;
      player.style.left = `${this.posX}px`;
      player.style.top = `${this.posY}px`;

      player.appendChild(name)
      arena.appendChild(player)


    }
  }

  const socket = io();

  let meuPlayerId;
  let isDead = false;


  const urlParams = new URLSearchParams(window.location.search);
  const playerName = urlParams.get('nome');

  socket.emit('playerInfo', { name: playerName });


  socket.on('allPlayers', (listaDePlayers) => {

    listaDePlayers.forEach((playerInfo) => {

      if (!document.getElementById(playerInfo.id)) {
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

    // Check if I died
    if (idDoJogador === meuPlayerId) {
      isDead = true;

      // Show Game Over UI
      const gameOverScreen = document.getElementById('game-over');
      if (gameOverScreen) {
        gameOverScreen.style.display = 'flex';
      }

      // Hide mouse dot so you can click the button
      const mira = document.getElementById('mouse');
      if (mira) {
        mira.style.display = 'none';
      }

      // Return standard cursor
      document.documentElement.style.cursor = 'default';
    }
  });




  //////////////////////////////////////////////////////////





  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');


  form.addEventListener('submit', (e) => {

    e.preventDefault()

    if (input.value != "") {
      socket.emit('chat message', { nome: playerName, mensagem: input.value });
      input.value = '';
    }
  });


  socket.on('chat message', (msg) => {
    const item = document.createElement('li');
    item.textContent = `${msg.nome}: ${msg.mensagem}`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight)
  });


  ///////////////////////////////////////////////////////////////////////////


  //CONTROLES



  const velocity = 5;


  const playerSize = { x: 50, y: 50 }
  let pos = { top: 0, left: 0 };
  let newPos = { ...pos };
  let keys = {};


  document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
  });

  document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });


  function move() {
    if (isDead) return;

    const arena = document.getElementById("arena");

    const arenaInfo = {
      size: { x: arena.clientWidth, y: arena.clientHeight }
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



  socket.on('moveSquare', (data) => {
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

    mira.style.top = y + 'px';
    mira.style.left = x + 'px';

    console.log(`Posição do Mouse - X: ${x}, Y: ${y}`);

  });

  let canShoot = true;

  function checkLaserHit(startX, startY, angle) {
    const rad = angle * Math.PI / 180;
    const length = 1000;
    const endX = startX + length * Math.cos(rad);
    const endY = startY + length * Math.sin(rad);

    const playersObj = document.querySelectorAll('.player');
    playersObj.forEach(p => {
      if (p.id !== meuPlayerId) {
        const pX = parseFloat(p.style.left) + playerSize.x / 2;
        const pY = parseFloat(p.style.top) + playerSize.y / 2;

        const px = endX - startX;
        const py = endY - startY;
        const norm = px * px + py * py;
        let u = ((pX - startX) * px + (pY - startY) * py) / norm;

        if (u > 1) u = 1;
        else if (u < 0) u = 0;

        const x = startX + u * px;
        const y = startY + u * py;

        const dx = x - pX;
        const dy = y - pY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < playerSize.x / 2) {
          socket.emit('playerHit', p.id);
        }
      }
    });
  }

  document.addEventListener('click', (event) => {
    if (isDead || !canShoot) return;
    canShoot = false;

    // Animate Cooldown HUD
    const cdFill = document.getElementById('cooldown-fill');
    const cdText = document.getElementById('cooldown-text');
    if (cdFill && cdText) {
      cdFill.style.transition = 'none';
      cdFill.style.width = '0%';
      cdText.innerText = 'RECHARGING...';
      cdText.style.color = '#ff4b4b';

      // Force reflow
      void cdFill.offsetWidth;

      cdFill.style.transition = 'width 1s linear';
      cdFill.style.width = '100%';

      setTimeout(() => {
        canShoot = true;
        cdText.innerText = 'LASER READY';
        cdText.style.color = '#00f2fe';
      }, 1000);
    } else {
      setTimeout(() => { canShoot = true; }, 1000);
    }

    const arena = document.getElementById("arena");
    const arenaRect = arena.getBoundingClientRect();


    const playerCenterX = pos.left + (playerSize.x / 2);
    const playerCenterY = pos.top + (playerSize.y / 2);

    const mouseX = event.clientX - arenaRect.left;
    const mouseY = event.clientY - arenaRect.top;


    const deltaX = mouseX - playerCenterX;
    const deltaY = mouseY - playerCenterY;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);


    const laser = document.createElement("div");
    laser.className = "laser";


    laser.style.left = `${playerCenterX}px`;
    laser.style.top = `${playerCenterY}px`;
    laser.style.transformOrigin = '0% 50%';
    laser.style.transform = `rotate(${angle}deg)`;

    arena.appendChild(laser);

    const laserInfo = {
      laserX: playerCenterX,
      laserY: playerCenterY,
      Angle: angle
    }

    socket.emit("LaserBeam", laserInfo);
    checkLaserHit(playerCenterX, playerCenterY, angle);

    setTimeout(() => {
      laser.remove();
    }, 100);
  });


  socket.on('LaserPublic', (laserInfo) => {
    const arena = document.getElementById("arena");

    const laser = document.createElement("div");
    laser.className = "laser";


    laser.style.left = `${laserInfo.laserX}px`;
    laser.style.top = `${laserInfo.laserY}px`;
    laser.style.transformOrigin = '0% 50%';
    laser.style.transform = `rotate(${laserInfo.Angle}deg)`;

    arena.appendChild(laser);

    setTimeout(() => {
      laser.remove();
    }, 100);
  });

  socket.on('healthUpdate', (data) => {
    const p = document.getElementById(data.id);
    if (p) {
      const h4 = p.querySelector('h4');
      if (h4) {
        h4.innerText = `${h4.dataset.name} (${data.health}♥)`;
      }
    }
  });

});
