let points = 0;
let posY = window.innerHeight / 2;
const speed = 35;

window.addEventListener('load', () => {
    //elementos
    const pigeon = document.querySelector('.pigeon');
    const scoreElement = document.getElementById('score');
    const cloud1 = document.querySelector('.cloud1');
    const cloud2 = document.querySelector('.cloud2');
    const cloud3 = document.querySelector('.cloud3');

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

    //movimiento de pájaro
    window.addEventListener('keydown', (event) => {
        if (event.key === "ArrowUp" || event.key === "w") {
            posY -= speed;
        } else if (event.key === "ArrowDown" || event.key === "s") {
            posY += speed;
        }

        //limite
        if (posY < -40) posY = -40;
        const limiteInferior = window.innerHeight - 160; 
        if (posY > limiteInferior) posY = limiteInferior;

        pigeon.style.top = posY + "px";
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
setInterval(createBread, 1500);