// variables globales del juego
let points = 0; //contador de panes recogidos
let posY = window.innerHeight / 2; //posición Y inicial de la paloma
let posX = 120; //posición X inicial de la paloma
const speed = 35; //pixeles que se mueve la paloma por tecla pulsada
let breadFrameCount = 0; //control de generación de panes
let lives = 3; //vidas iniciales del jugador
let obstacleFrameCount = 0; //control de generación de obstáculos
let currentLevel = 1; //nivel actual por donde empieza
let isPaused = true; //el juego arranca pausado (para el menú de inicio)
let windFrameCount = 0; // control de tiempo para las ráfagas
let activeWindForce = 0; // fuerza de empuje actual del viento

window.addEventListener("load", () => {
    //elementos del juego
    const pigeon = document.querySelector(".pigeon");
    const scoreElement = document.getElementById("score");
    const cloud1 = document.querySelector(".cloud1");
    const cloud2 = document.querySelector(".cloud2");
    const cloud3 = document.querySelector(".cloud3");

    //elementos del menu
    const gameMenu = document.getElementById("game-menu");
    const menuTitle = document.getElementById("menu-title");
    const menuText = document.getElementById("menu-text");
    const menuButton = document.getElementById("menu-button");
    const victoryMenu = document.getElementById("victory-menu");
    const restartButton = document.getElementById("restart-button");

    // contenedor de las vidas
    const livesContainer = document.createElement("div");
    livesContainer.id = "lives-container";
    document.body.appendChild(livesContainer);

    // función para actualizar la UI de vidas
    function updateLivesUI() {
        livesContainer.innerHTML = "Vidas: ";

        // sub-caja para los corazones
        const heartsWrap = document.createElement("div");

        // bucle que genera los corazones según las vidas que quedan
        for (let i = 0; i < lives; i++) {
            heartsWrap.innerHTML += '<i class="bi bi-heart-fill"></i>';
        }

        // fila de corazones
        livesContainer.appendChild(heartsWrap);
    }
    updateLivesUI(); // inicializar las vidas al cargar la partida

    // posición inicial de la paloma
    if (pigeon) {
        pigeon.style.left = posX + "px";
    }

    // menu y game reset
    menuButton.addEventListener("click", () => {
        if (lives <= 0) {
            resetWholeGame(); //reset si pierdes
        } else {
            gameMenu.classList.add("hidden"); // ocultar menú para seguir jugando
            isPaused = false;
        }
    });

    // botón de victoria para reiniciar el juego desde el menú de victoria
    restartButton.addEventListener("click", () => {
        resetWholeGame();
    });

    // función para evitar el bug de los eventos duplicados
    function resetWholeGame() {
        victoryMenu.classList.add("hidden");
        gameMenu.classList.add("hidden");

        // limpiar contenedores de efectos visuales
        const confettiContainer = document.querySelector(".confetti-container");
        if (confettiContainer) confettiContainer.innerHTML = "";

        const stormContainer = document.getElementById("storm-container");
        if (stormContainer) stormContainer.innerHTML = "";

        // eliminar panes y aviones de la pantalla anterior
        document.querySelectorAll(".obstacle, .bread, .wind-gust").forEach(el => el.remove());

        // reset de variables y UI
        points = 0;
        currentLevel = 1;
        lives = 3; // devolver las vidas a 3
        updateLivesUI(); // redibujar corazones

        document.body.className = "";
        if (scoreElement) scoreElement.innerText = "Panes: 0";

        // devolver paloma a la posición inicial
        posY = window.innerHeight / 2;
        posX = 120;
        if (pigeon) {
            pigeon.style.top = posY + "px";
            pigeon.style.left = posX + "px";
        }

        isPaused = false; // reanudar el juego
    }

    //animación nubes
    let x1 = 0, x2 = 0, x3 = 0;
    const speedC1 = 0.5, speedC2 = 1.2, speedC3 = 2.5;

    function animateClouds() {
        if (!isPaused) {
            x1 -= speedC1; x2 -= speedC2; x3 -= speedC3;
            // si la nube sale del marco de la pantalla, vuelve a empezar
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
    window.addEventListener("keydown", (event) => {
        if (isPaused) return; // si el juego está pausado no responderá a las teclas
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
        //colision panes
        const birdy = pigeon.getBoundingClientRect();
        const breads = document.querySelectorAll(".bread");

        breads.forEach((bread) => {
            const rectBread = bread.getBoundingClientRect();

            if (
                birdy.left < rectBread.right && birdy.right > rectBread.left &&
                birdy.top < rectBread.bottom && birdy.bottom > rectBread.top
            ) {
                bread.remove();
                points++;
                //si las cajas de colision se tocan: sumar puntos, eliminar el pan
                if (scoreElement) scoreElement.innerText = "Panes: " + points;
                //checkear progreso nivel
                checkLevelUp(gameMenu, menuTitle, menuText, menuButton);
            }
        });
        // colision aviones
        const obstacles = document.querySelectorAll(".obstacle");
        obstacles.forEach((obstacle) => {
            const rectObstacle = obstacle.getBoundingClientRect();

            if (
                birdy.left < rectObstacle.right && birdy.right > rectObstacle.left &&
                birdy.top < rectObstacle.bottom && birdy.bottom > rectObstacle.top
            ) {
                obstacle.remove();
                lives--;
                updateLivesUI(); // borra y actualiza los iconos 2D

                // lógica de game over
                if (lives <= 0) {
                    isPaused = true;

                    // limpieza de objetos en juego
                    document.querySelectorAll(".bread, .obstacle, .wind-gust").forEach(el => el.remove());

                    // textos del menú para avisar que se acabó el juego
                    menuTitle.innerText = "¡SE ACABÓ!";
                    menuText.innerText = "¿Volver a intentarlo?";
                    menuButton.innerText = "REINTENTAR DESDE NIVEL 1";

                    // mostrar menú de game over
                    gameMenu.classList.remove("hidden");
                }
            }
        });

        // colision ráfagas de viento (obstáculo mecánico de nivel 4, no quita vida)
        const gusts = document.querySelectorAll(".wind-gust");
        gusts.forEach((gust) => {
            const rectGust = gust.getBoundingClientRect();

            if (
                birdy.left < rectGust.right && birdy.right > rectGust.left &&
                birdy.top < rectGust.bottom && birdy.bottom > rectGust.top
            ) {
                gust.remove();
                // activa un empujón hacia atrás
                activeWindForce = 15;
            }
        });
    }

    //bucle del juego
    function gameLoop() {
        if (!isPaused) {
            // control de dificultad por nivel (switch)
            let moveSpeed, obstacleSpeed, obstacleSpawnRate, windSpeed = 0;

            switch (currentLevel) {
                case 1:
                    moveSpeed = 5;
                    obstacleSpeed = 0;
                    obstacleSpawnRate = 0;
                    break;

                case 2:
                    moveSpeed = 6.5; // juego un poco más rápido
                    obstacleSpeed = 6.5; // aviones a velocidad moderada
                    obstacleSpawnRate = 120; // aparecen aviones (2 segundos aprox)
                    break;

                case 3:
                    moveSpeed = 8.5; // el juego empieza a ir aún más rápido en nivel 2
                    obstacleSpeed = 9; // aviones a velocidad alta
                    obstacleSpawnRate = 80; // aparecen más seguido (1.3 segs aprox)
                    break;

                case 4:
                    moveSpeed = 9; // el juego a la velocidad máxima
                    obstacleSpeed = 10; // velocidad máxima
                    obstacleSpawnRate = 70; // ritmo frenético de tormenta
                    windSpeed = 12; //velocidad de las ráfagas de viento
                    break;

                default:
                    break;
            }

            // aplica el efecto de empujón del viento a la paloma
            if (activeWindForce > 0) {
                posX -= activeWindForce;
                // efecto de frenado
                activeWindForce -= 0.5;

                // límite de pantalla para no salir volando
                if (posX < 0) posX = 0;

                pigeon.style.left = posX + "px";
            }

            //mover panes
            const breads = document.querySelectorAll(".bread");
            breads.forEach((bread) => {
                let currentX = bread.offsetLeft;
                currentX -= moveSpeed;
                bread.style.left = currentX + "px";
                if (currentX < -50) bread.remove();
            });

            // mover obstáculos (aviones)
            const obstacles = document.querySelectorAll(".obstacle");
            obstacles.forEach((obstacle) => {
                let currentX = obstacle.offsetLeft;
                currentX -= obstacleSpeed;
                obstacle.style.left = currentX + "px";
                if (currentX < -70) obstacle.remove();
            });

            // mover ráfagas de viento
            const gusts = document.querySelectorAll(".wind-gust");
            gusts.forEach((gust) => {
                let currentX = gust.offsetLeft;
                currentX -= windSpeed;
                gust.style.left = currentX + "px";
                if (currentX < -150) gust.remove(); // son más largas, elimina al salir
            });

            //generador panes
            breadFrameCount++;
            if (breadFrameCount >= 90) {
                createBread();
                breadFrameCount = 0;
            }

            //generador obstáculos
            if (obstacleSpawnRate > 0) {
                obstacleFrameCount++;
                if (obstacleFrameCount >= obstacleSpawnRate) {
                    createObstacle();
                    obstacleFrameCount = 0;
                }
            }

            // generador de ráfagas de viento (solo en nivel 4)
            if (currentLevel === 4) {
                windFrameCount++;
                // aparece una ráfaga aprox cada 2.5 segundos
                if (windFrameCount >= 150) {
                    createWindGust();
                    windFrameCount = 0;
                }
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
    const bread = document.createElement("div");
    bread.className = "bread";
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
                menuText.innerText = "¡Último esfuerzo! Sobrevive a la tormenta y vigila los vientos.";
                menuButton.innerText = "PULSAR PARA JUGAR";
                shouldPause = true;
            }
            break;

        case 5:
            isPaused = true;
            // limpiamos los panes y aviones
            document.querySelectorAll(".bread, .obstacle, .wind-gust").forEach(el => el.remove());
            const vicOverlay = document.getElementById("victory-menu");
            if (vicOverlay) {
                vicOverlay.classList.remove("hidden");
                createConfettiParticles();
            }
            return;
    }

    //si ha subido de nivel, pausamos y eliminamos los panes viejos que queden flotando
    if (shouldPause) {
        isPaused = true;
        gameMenu.classList.remove("hidden");
        document.querySelectorAll(".bread, .obstacle").forEach(el => el.remove());
    }
}

// generar obstáculos (aviones) en posiciones aleatorias según el nivel
function createObstacle() {
    if (currentLevel === 1) return;
    const gameContainer = document.querySelector(".container") || document.body;
    const obstacle = document.createElement("div");
    obstacle.className = "obstacle";
    obstacle.innerHTML = '<i class="bi bi-airplane-fill"></i>';

    // posicionamiento dinámico aleatorio
    const x = window.innerWidth + 80;
    const y = Math.random() * (window.innerHeight - 120) + 50;
    obstacle.style.left = x + "px";
    obstacle.style.top = y + "px";

    gameContainer.appendChild(obstacle);
}

// generar ráfagas de viento visuales en posiciones Y aleatorias
function createWindGust() {
    if (isPaused) return;
    const gameContainer = document.body;

    const gust = document.createElement("div");
    gust.className = "wind-gust";

    // icono de viento de bootstrap
    gust.innerHTML = '<i class="bi bi-wind"></i>';

    // posicionamiento dinámico aleatorio
    const x = window.innerWidth + 100;
    const y = Math.random() * (window.innerHeight - 150) + 50;

    gust.style.left = x + "px";
    gust.style.top = y + "px";

    gameContainer.appendChild(gust);
}

// generador de lluvia y rayos (nivel 4)
function updateStormEffect() {
    if (!document.body.classList.contains("level-4") || isPaused) {
        requestAnimationFrame(updateStormEffect);
        return;
    }

    const container = document.getElementById("storm-container");
    if (container) {
        for (let i = 0; i < 2; i++) {
            const drop = document.createElement("div");
            drop.className = "drop";
            drop.style.left = Math.random() * window.innerWidth + "px";
            drop.style.top = Math.random() * -50 + "px";
            drop.style.animationDuration = Math.random() * 0.3 + 0.4 + "s";
            container.appendChild(drop);

            //eliminar gotas después de su anim
            setTimeout(() => { drop.remove(); }, 600);
        }
        // probabilidad por frame (rayo)
        if (Math.random() < 0.01) {
            const lightning = document.createElement("div");
            lightning.className = "game-lightning";
            lightning.style.left = Math.random() * 80 + 10 + "%";
            container.appendChild(lightning);

            //eliminar rayo después de su anim
            setTimeout(() => { lightning.remove(); }, 400);
        }
    }

    requestAnimationFrame(updateStormEffect);
}

//función para generar confetti
function createConfettiParticles() {
    const container = document.querySelector(".confetti-container");
    if (!container) return;
    container.innerHTML = "";
    const colors = [
        "#FFD700",
        "#FF5733",
        "#33FF57",
        "#3357FF",
        "#F333FF",
        "#33FFF0",
    ];

    for (let i = 0; i < 40; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti-piece";

        //estilos de tamaño, color y posición aleatoria del confetti
        confetti.style.width = Math.random() * 6 + 6 + "px";
        confetti.style.height = Math.random() * 4 + 10 + "px";
        confetti.style.left = Math.random() * 100 + "%";
        confetti.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];

        //tiempos de animación del confetti
        confetti.style.animationDuration = Math.random() * 2 + 2.5 + "s";
        confetti.style.animationDelay = Math.random() * 2 + "s";

        container.appendChild(confetti);
    }
}