let points = 0;
let posY = window.innerHeight / 2;
let posX = 120;
const speed = 35;
let breadFrameCount = 0;
let currentLevel = 1;
let isPaused = true;

window.addEventListener('load', () => {
    //elementos del juego
    const pigeon = document.querySelector('.pigeon');
    const scoreElement = document.getElementById('score');
    const cloud1 = document.querySelector('.cloud1');
    const cloud2 = document.querySelector('.cloud2');
    const cloud3 = document.querySelector('.cloud3');

    //elementos del menu
    const gameMenu = document.getElementById('game-menu');
    const menuTitle = document.getElementById('menu-title');
    const menuText = document.getElementById('menu-text');
    const menuButton = document.getElementById('menu-button');
    const victoryMenu = document.getElementById('victory-menu');
    const restartButton = document.getElementById('restart-button');

    if (pigeon) {
        pigeon.style.left = posX + "px";
    }

    //event listener start/resume
    menuButton.addEventListener('click', () => {
        gameMenu.classList.add('hidden');  //esconder el menú con blur
        isPaused = false;                 //depausa el juego
    });

    //reset del juego
    restartButton.addEventListener('click', () => {
        victoryMenu.classList.add('hidden');
        
        //limpiar confetti al reset
        const confettiContainer = document.querySelector('.confetti-container');
        if (confettiContainer) confettiContainer.innerHTML = '';
        
        //limpiar las gotas de lluvia al reset
        const stormContainer = document.getElementById('storm-container');
        if (stormContainer) stormContainer.innerHTML = '';

        //reset de estado y marcadores
        points = 0;
        currentLevel = 1;
        document.body.className = ""; 
        if (scoreElement) scoreElement.innerText = "Panes: 0";
        
        //pájaro a su posición inicial
        posY = window.innerHeight / 2;
        posX = 120;
        if (pigeon) {
            pigeon.style.top = posY + "px";
            pigeon.style.left = posX + "px";
        }

        isPaused = false;
    });

    //animación nubes
    let x1 = 0, x2 = 0, x3 = 0;
    const speedC1 = 0.5, speedC2 = 1.2, speedC3 = 2.5;

    function animateClouds() {
        if (!isPaused) {
        x1 -= speedC1; x2 -= speedC2; x3 -= speedC3;
        if (Math.abs(x1) >= window.innerWidth) x1 = 0;
        if (Math.abs(x2) >= window.innerWidth) x2 = 0;
        if (Math.abs(x3) >= window.innerWidth) x3 = 0;

        cloud1.style.backgroundPositionX = `${x1}px`;
        cloud2.style.backgroundPositionX = `${x2}px`;
        cloud3.style.backgroundPositionX = `${x3}px`;
        }
        requestAnimationFrame(animateClouds);
    }
    animateClouds();

    //movimiento de pájaro (con switch)
    window.addEventListener('keydown', (event) => {
        if (isPaused) return;
        switch (event.key) {
            case "ArrowUp":
            case "w":
            case "W":
                posY -= speed;
                break;

            case "ArrowDown":
            case "s":
            case "S":
                posY += speed;
                break;

            case "ArrowLeft":
            case "a":
            case "A":
                posX -= speed;
                break;

            case "ArrowRight":
            case "d":
            case "D":
                posX += speed;
                break;
                
            default:
                return;
        }
        //límites verticales (Y)
        if (posY < 0) posY = 0;
        const lowerLimit = window.innerHeight - 70; 
        if (posY > lowerLimit) posY = lowerLimit;

        //límites horizontales (X)
        if (posX < 0) posX = 0; 
        const rightLimit = window.innerWidth - 70; 
        if (posX > rightLimit) posX = rightLimit;

        //ambas posiciones al elemento en pantalla
        pigeon.style.top = posY + "px";
        pigeon.style.left = posX + "px"; 
    });

    //colisiones
    function checkCollision() {
        const birdy = pigeon.getBoundingClientRect();
        const breads = document.querySelectorAll('.bread');

        breads.forEach(bread => {
            const rectBread = bread.getBoundingClientRect();
            
            if (birdy.left < rectBread.right &&
                birdy.right > rectBread.left &&
                birdy.top < rectBread.bottom &&
                birdy.bottom > rectBread.top) {
                
                bread.remove();
                points++;
                
                if (scoreElement) {
                    scoreElement.innerText = "Panes: " + points;
                }
                //checkear progreso nivel
                checkLevelUp(gameMenu, menuTitle, menuText, menuButton);
            }
        });
    }

    //bucle del juego (mover panes)
    function gameLoop() {
        if (!isPaused) {
            const breads = document.querySelectorAll('.bread');
            const moveSpeed = 5; 

            breads.forEach(bread => {
                let currentX = parseFloat(bread.style.left);
                currentX -= moveSpeed;
                bread.style.left = currentX + "px";

                if (currentX < -50) {
                    bread.remove();
                }
            });

            breadFrameCount++;
            if (breadFrameCount >= 90) {
                createBread();
                breadFrameCount = 0;
            }

            checkCollision();
        }

        requestAnimationFrame(gameLoop);
    }
    gameLoop();
    updateStormEffect();
    });
    
//generar panes
function createBread() {
    const bread = document.createElement('div');
    bread.className = 'bread';
    const x = window.innerWidth + 50;
    const y = Math.random() * (window.innerHeight - 100) + 50; 
    bread.style.left = x + "px";
    bread.style.top = y + "px";
    
    document.body.appendChild(bread);
}

function checkLevelUp(gameMenu, menuTitle, menuText, menuButton) {
    let shouldPause = false;
    
    //CAMBIAR CASES CUANDO SE ACABA CON EL DESAROLLO
    switch (points) {
        case 2:
            if (currentLevel === 1) {
                currentLevel = 2;
                document.body.className = "level-2";
                
                //cambiar texto según nivel
                menuTitle.innerText = "¡FELICIDADES!";
                menuText.innerText = "Superaste el Nivel 1. ¿Listo para el Nivel 2?";
                menuButton.innerText = "EMPEZAR NIVEL 2";
                shouldPause = true;
            }
            break;

        case 3:
            if (currentLevel === 2) {
                currentLevel = 3;
                document.body.className = "level-3";
                
                menuTitle.innerText = "¡INCREÍBLE!";
                menuText.innerText = "Superaste el Nivel 2. Cuidado, se hace de noche...";
                menuButton.innerText = "EMPEZAR NIVEL 3";
                shouldPause = true;
            }
            break;

        case 4:
            if (currentLevel === 3) {
                currentLevel = 4;
                document.body.className = "level-4";
                
                menuTitle.innerText = "NIVEL FINAL";
                menuText.innerText = "¡Último esfuerzo! Sobrevive a la tormenta.";
                menuButton.innerText = "PULSAR PARA JUGAR";
                shouldPause = true;
            }
            break;

        case 5:
            isPaused = true;
            document.querySelectorAll('.bread').forEach(bread => bread.remove());
            const vicOverlay = document.getElementById('victory-menu');
            if (vicOverlay) {
                vicOverlay.classList.remove('hidden');
                createConfettiParticles(); 
            }
            return;
    }

    //si ha subido de nivel, pausamos y eliminamos los panes viejos que queden flotando
    if (shouldPause) {
        isPaused = true;
        gameMenu.classList.remove('hidden');
        document.querySelectorAll('.bread').forEach(bread => bread.remove());
    }
}

// generador de lluvia y rayos (nivel 4)
function updateStormEffect() {
    if (!document.body.classList.contains('level-4') || isPaused) {
        requestAnimationFrame(updateStormEffect);
        return;
    }

    const container = document.getElementById('storm-container');
    if (container) {
        for (let i = 0; i < 2; i++) {
            const drop = document.createElement('div');
            drop.className = 'drop';
            drop.style.left = Math.random() * window.innerWidth + 'px';
            drop.style.top = (Math.random() * -50) + 'px';
            drop.style.animationDuration = (Math.random() * 0.3 + 0.4) + 's';
            container.appendChild(drop);
            setTimeout(() => { drop.remove(); }, 600);
        }
        // probabilidad por frame (rayo)
        if (Math.random() < 0.010) {
            const lightning = document.createElement('div');
            lightning.className = 'game-lightning';

            lightning.style.left = (Math.random() * 80 + 10) + '%'; 

            container.appendChild(lightning);

            setTimeout(() => {
                lightning.remove();
            }, 400);
        }
    }

    requestAnimationFrame(updateStormEffect);
}

    function createConfettiParticles() {
        const container = document.querySelector('.confetti-container');
        if (!container) return;
        container.innerHTML = '';
        const colors = ['#FFD700', '#FF5733', '#33FF57', '#3357FF', '#F333FF', '#33FFF0'];

        for (let i = 0; i < 40; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';

            //estilos de tamaño, color y posición aleatoria del confetti
            confetti.style.width = (Math.random() * 6 + 6) + 'px';
            confetti.style.height = (Math.random() * 4 + 10) + 'px';
            confetti.style.left = (Math.random() * 100) + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            //tiempos de animación del confetti
            confetti.style.animationDuration = (Math.random() * 2 + 2.5) + 's';
            confetti.style.animationDelay = (Math.random() * 2) + 's';

            container.appendChild(confetti);
        }
    }