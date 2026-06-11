// script.js - motor principal, detección de colisiones y bucle de juego

window.addEventListener("load", () => {
    // elementos del juego
    const pigeon = document.querySelector(".pigeon");
    const scoreElement = document.getElementById("score");
    const cloud1 = document.querySelector(".cloud1");
    const cloud2 = document.querySelector(".cloud2");
    const cloud3 = document.querySelector(".cloud3");

    // elementos del menu
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

    updateLivesUI(); // inicializar las vidas al cargar la partida

    // posición inicial de la paloma
    if (pigeon) {
        pigeon.style.left = posX + "px";
    }

    // menu y game reset
    menuButton.addEventListener("click", () => {
        if (lives <= 0) {
            resetWholeGame(); // reset si pierdes
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

        // eliminar panes, aviones y viento de la pantalla anterior
        document
            .querySelectorAll(".obstacle, .bread, .wind-gust")
            .forEach((el) => el.remove());

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

    // animación nubes
    let x1 = 0,
        x2 = 0,
        x3 = 0;
    const speedC1 = 0.5,
        speedC2 = 1.2,
        speedC3 = 2.5;

    function animateClouds() {
        if (!isPaused) {
            x1 -= speedC1;
            x2 -= speedC2;
            x3 -= speedC3;
            // si la nube sale del marco de la pantalla, vuelve a empezar
            if (Math.abs(x1) >= window.innerWidth) x1 = 0;
            if (Math.abs(x2) >= window.innerWidth) x2 = 0;
            if (Math.abs(x3) >= window.innerWidth) x3 = 0;

            if (cloud1) cloud1.style.backgroundPositionX = `${x1}px`;
            if (cloud2) cloud2.style.backgroundPositionX = `${x2}px`;
            if (cloud3) cloud3.style.backgroundPositionX = `${x3}px`;
        }
        requestAnimationFrame(animateClouds);
    }
    animateClouds();

    // movimiento de pájaro (con switch)
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
        // límites verticales (Y)
        if (posY < 0) posY = 0;
        const lowerLimit = window.innerHeight - 70;
        if (posY > lowerLimit) posY = lowerLimit;

        // límites horizontales (X)
        if (posX < 0) posX = 0;
        const rightLimit = window.innerWidth - 70;
        if (posX > rightLimit) posX = rightLimit;

        // ambas posiciones al elemento en pantalla
        if (pigeon) {
            pigeon.style.top = posY + "px";
            pigeon.style.left = posX + "px";
        }
    });

    // colisiones
    function checkCollision() {
        if (!pigeon) return;
        const birdy = pigeon.getBoundingClientRect();
        const breads = document.querySelectorAll(".bread");

        breads.forEach((bread) => {
            const rectBread = bread.getBoundingClientRect();

            if (
                birdy.left < rectBread.right &&
                birdy.right > rectBread.left &&
                birdy.top < rectBread.bottom &&
                birdy.bottom > rectBread.top
            ) {
                bread.remove();
                points++;
                if (scoreElement) scoreElement.innerText = "Panes: " + points;
                checkLevelUp(gameMenu, menuTitle, menuText, menuButton);
            }
        });

        // colision aviones
        const obstacles = document.querySelectorAll(".obstacle");
        obstacles.forEach((obstacle) => {
            const rectObstacle = obstacle.getBoundingClientRect();

            if (
                birdy.left < rectObstacle.right &&
                birdy.right > rectObstacle.left &&
                birdy.top < rectObstacle.bottom &&
                birdy.bottom > rectObstacle.top
            ) {
                obstacle.remove();
                lives--;
                updateLivesUI(); // borra y actualiza los iconos 2D

                // lógica de game over
                if (lives <= 0) {
                    isPaused = true;

                    // limpieza de objetos en juego
                    document
                        .querySelectorAll(".bread, .obstacle, .wind-gust")
                        .forEach((el) => el.remove());

                    // textos del menú para avisar que se acabó el juego
                    menuTitle.innerText = "¡SE ACABÓ!";
                    menuText.innerText = "¿Volver a intentarlo?";
                    menuButton.innerText = "REINTENTAR DESDE NIVEL 1";

                    // mostrar menú de game over
                    gameMenu.classList.remove("hidden");
                }
            }
        });

        // colision ráfagas de viento
        const gusts = document.querySelectorAll(".wind-gust");
        gusts.forEach((gust) => {
            const rectGust = gust.getBoundingClientRect();

            if (
                birdy.left < rectGust.right &&
                birdy.right > rectGust.left &&
                birdy.top < rectGust.bottom &&
                birdy.bottom > rectGust.top
            ) {
                gust.remove();
                activeWindForce = 15;
            }
        });
    }

    // bucle del juego
    function gameLoop() {
        if (!isPaused) {
            let moveSpeed,
                obstacleSpeed,
                obstacleSpawnRate,
                windSpeed = 0;

            switch (currentLevel) {
                case 1:
                    moveSpeed = 5;
                    obstacleSpeed = 0;
                    obstacleSpawnRate = 0;
                    break;

                case 2:
                    moveSpeed = 6.5;
                    obstacleSpeed = 6.5;
                    obstacleSpawnRate = 120;
                    break;

                case 3:
                    moveSpeed = 8.5;
                    obstacleSpeed = 9;
                    obstacleSpawnRate = 80;
                    break;

                case 4:
                    moveSpeed = 9;
                    obstacleSpeed = 10;
                    obstacleSpawnRate = 70;
                    windSpeed = 12;
                    break;
            }

            // aplica el efecto de empujón del viento a la paloma
            if (activeWindForce > 0) {
                posX -= activeWindForce;
                activeWindForce -= 0.5;

                if (posX < 0) posX = 0;
                if (pigeon) pigeon.style.left = posX + "px";
            }

            // mover panes
            const breads = document.querySelectorAll(".bread");
            breads.forEach((bread) => {
                let currentX = bread.offsetLeft - moveSpeed;
                bread.style.left = currentX + "px";
                if (currentX < -50) bread.remove();
            });

            // mover obstáculos (aviones)
            const obstacles = document.querySelectorAll(".obstacle");
            obstacles.forEach((obstacle) => {
                let currentX = obstacle.offsetLeft - obstacleSpeed;
                obstacle.style.left = currentX + "px";
                if (currentX < -70) obstacle.remove();
            });

            // mover ráfagas de viento
            const gusts = document.querySelectorAll(".wind-gust");
            gusts.forEach((gust) => {
                let currentX = gust.offsetLeft - windSpeed;
                gust.style.left = currentX + "px";
                if (currentX < -150) gust.remove();
            });

            // generador panes
            breadFrameCount++;
            if (breadFrameCount >= 90) {
                createBread();
                breadFrameCount = 0;
            }

            // generador obstáculos
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

// función para chequear progreso nivel
function checkLevelUp(gameMenu, menuTitle, menuText, menuButton) {
    let shouldPause = false;

    switch (points) {
        case 2:
            if (currentLevel === 1) {
                currentLevel = 2;
                document.body.className = "level-2";
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
                menuText.innerText =
                    "Superaste el Nivel 2. Cuidado, se hace de noche...";
                menuButton.innerText = "EMPEZAR NIVEL 3";
                shouldPause = true;
            }
            break;

        case 4:
            if (currentLevel === 3) {
                currentLevel = 4;
                document.body.className = "level-4";
                menuTitle.innerText = "NIVEL FINAL";
                menuText.innerText =
                    "¡Último esfuerzo! Sobrevive a la tormenta y vigila los vientos.";
                menuButton.innerText = "PULSAR PARA JUGAR";
                shouldPause = true;
            }
            break;

        case 5:
            isPaused = true;
            document
                .querySelectorAll(".bread, .obstacle, .wind-gust")
                .forEach((el) => el.remove());
            const vicOverlay = document.getElementById("victory-menu");
            if (vicOverlay) {
                vicOverlay.classList.remove("hidden");
                createConfettiParticles();
            }
            return;
    }

    if (shouldPause) {
        isPaused = true;
        gameMenu.classList.remove("hidden");
        document
            .querySelectorAll(".bread, .obstacle, .wind-gust")
            .forEach((el) => el.remove());
    }
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

            setTimeout(() => {
                drop.remove();
            }, 600);
        }
        if (Math.random() < 0.01) {
            const lightning = document.createElement("div");
            lightning.className = "game-lightning";
            lightning.style.left = Math.random() * 80 + 10 + "%";
            container.appendChild(lightning);

            setTimeout(() => {
                lightning.remove();
            }, 400);
        }
    }

    requestAnimationFrame(updateStormEffect);
}

// función para generar confetti
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

        confetti.style.width = Math.random() * 6 + 6 + "px";
        confetti.style.height = Math.random() * 4 + 10 + "px";
        confetti.style.left = Math.random() * 100 + "%";
        confetti.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];

        confetti.style.animationDuration = Math.random() * 2 + 2.5 + "s";
        confetti.style.animationDelay = Math.random() * 2 + "s";

        container.appendChild(confetti);
    }
}