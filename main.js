let points = 0;
let posY = window.innerHeight / 2;
let posX = 120;
const speed = 35;
let breadFrameCount = 0;

window.addEventListener('load', () => {
    //elementos
    const pigeon = document.querySelector('.pigeon');
    const scoreElement = document.getElementById('score');
    const cloud1 = document.querySelector('.cloud1');
    const cloud2 = document.querySelector('.cloud2');
    const cloud3 = document.querySelector('.cloud3');

    if (pigeon) {
        pigeon.style.left = posX + "px";
    }
    
    //animación nubes
    let x1 = 0, x2 = 0, x3 = 0;
    const speedC1 = 0.5, speedC2 = 1.2, speedC3 = 2.5;

    function animateClouds() {
        x1 -= speedC1; x2 -= speedC2; x3 -= speedC3;
        if (Math.abs(x1) >= window.innerWidth) x1 = 0;
        if (Math.abs(x2) >= window.innerWidth) x2 = 0;
        if (Math.abs(x3) >= window.innerWidth) x3 = 0;

        cloud1.style.backgroundPositionX = `${x1}px`;
        cloud2.style.backgroundPositionX = `${x2}px`;
        cloud3.style.backgroundPositionX = `${x3}px`;
        requestAnimationFrame(animateClouds);
    }
    animateClouds();

    //movimiento de pájaro (con switch)
    window.addEventListener('keydown', (event) => {
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
        
        checkCollision(); 
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
                console.log("¡Pan recogido! Puntos:", points);
            }
        });
    }

    //bucle del juego (mover panes)
    function gameLoop() {
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
        requestAnimationFrame(gameLoop);
    }
    gameLoop();
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