// script.js - motor principal, gestión de físicas, colisiones y bucle de renderizado

window.addEventListener("load", () => {
    // 1. CAPTURA DE ELEMENTOS DEL DOM Y CACHÉ
    const pigeon = document.querySelector(".pigeon");
    const scoreElement = document.getElementById("score");
    const cloud1 = document.querySelector(".cloud1");
    const cloud2 = document.querySelector(".cloud2");
    const cloud3 = document.querySelector(".cloud3");

    // elementos de la interfaz de menús
    const gameMenu = document.getElementById("game-menu");
    const menuTitle = document.getElementById("menu-title");
    const menuText = document.getElementById("menu-text");
    const menuButton = document.getElementById("menu-button");
    const victoryMenu = document.getElementById("victory-menu");
    const restartButton = document.getElementById("restart-button");
    const btnEs = document.getElementById("btn-es");
    const btnCa = document.getElementById("btn-ca");

    // contenedores de efectos especiales
    const stormContainer = document.getElementById("storm-container");
    const confettiContainer = document.querySelector(".confetti-container");

    // contenedor de vidas
    let livesContainer = document.getElementById("lives-container");
    if (!livesContainer) {
        livesContainer = document.createElement("div");
        livesContainer.id = "lives-container";
        document.body.appendChild(livesContainer);
    }

    // 2. SISTEMA DE IDIOMAS Y TEXTOS
    if (btnEs && btnCa) {
        btnEs.addEventListener("click", () => {
            currentLanguage = 'es';
            btnEs.classList.add("active");
            btnCa.classList.remove("active");
            updateTextsUI();
        });

        btnCa.addEventListener("click", () => {
            currentLanguage = 'ca';
            btnCa.classList.add("active");
            btnEs.classList.remove("active");
            updateTextsUI();
        });
    }

    // refresca todos los textos de la pantalla según el idioma seleccionado
    function updateTextsUI() {
        if (scoreElement) scoreElement.innerText = translations[currentLanguage].score + points;
        updateLivesUI(); // lógica importada de player.js
        
        // traducción de las tarjetas del menú según el nivel actual
        if (isPaused && lives > 0) {
            const levelKey = currentLevel === 1 ? 'initial' : `level${currentLevel}`;
            menuTitle.innerText = translations[currentLanguage][`${levelKey}_title`];
            menuText.innerText = translations[currentLanguage][`${levelKey}_text`];
            menuButton.innerText = translations[currentLanguage][`${levelKey}_btn`];
        } else if (lives <= 0) {
            menuTitle.innerText = translations[currentLanguage].gameOver_title;
            menuText.innerText = translations[currentLanguage].gameOver_text;
            menuButton.innerText = translations[currentLanguage].gameOver_btn;
        }

        // traducción de la pantalla de victoria
        if (victoryMenu && !victoryMenu.classList.contains("hidden")) {
            const vicTitle = victoryMenu.querySelector("h1");
            const vicText = victoryMenu.querySelector("p");
            if (vicTitle) vicTitle.innerText = translations[currentLanguage].victory_title;
            if (vicText) vicText.innerText = translations[currentLanguage].victory_text;
            if (restartButton) restartButton.innerText = translations[currentLanguage].victory_btn;
        }
    }

    // inicialización de textos y volumen al arrancar
    updateLivesUI();
    updateTextsUI();

    const volumeSlider = document.getElementById("volume-slider");
    if (volumeSlider) {
        volumeSlider.addEventListener("input", (event) => {
            updateGlobalVolume(event.target.value);
        });
    }

    // coloca a la paloma en su coordenada X inicial
    if (pigeon) pigeon.style.left = posX + "px";

    // 3. CONTROL DE MENÚS Y REINICIO DE PARTIDA
    menuButton.addEventListener("click", () => {
        if (lives <= 0) {
            resetWholeGame();
        } else {
            gameMenu.classList.add("hidden");
            isPaused = false;
            playMusic();
        }
    });

    restartButton.addEventListener("click", () => {
        resetWholeGame();
    });

    // resetea el estado completo del motor para empezar una nueva partida limpia
    function resetWholeGame() {
        victoryMenu.classList.add("hidden");
        gameMenu.classList.add("hidden");

        // limpieza de partículas e hilos visuales
        if (confettiContainer) confettiContainer.innerHTML = "";
        if (stormContainer) stormContainer.innerHTML = "";

        // elimina todo de la pantalla anterior
        document.querySelectorAll(".obstacle, .bread, .wind-gust").forEach((el) => el.remove());

        // reseteo de variables de juego
        points = 0;
        currentLevel = 1;
        lives = 3;
        document.body.className = "";
        
        updateLivesUI();
        updateTextsUI();

        // reposicionamiento del jugador al centro
        posY = window.innerHeight / 2;
        posX = 120;

        isPaused = false;
        playMusic();
    }

    // 4. SISTEMA DE MOVIMIENTO Y NUBES
    let x1 = 0, x2 = 0, x3 = 0;
    const speedC1 = 0.5, speedC2 = 1.2, speedC3 = 2.5;

    function animateClouds() {
        if (!isPaused) {
            x1 -= speedC1;
            x2 -= speedC2;
            x3 -= speedC3;

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

    // captura de teclado para las físicas de movimiento de la paloma
    window.addEventListener("keydown", (event) => {
        if (isPaused) return;

        switch (event.key) {
            case "ArrowUp": case "w": case "W": posY -= speed; break;
            case "ArrowDown": case "s": case "S": posY += speed; break;
            case "ArrowLeft": case "a": case "A": posX -= speed; break;
            case "ArrowRight": case "d": case "D": posX += speed; break;
            default: return; // Ignora cualquier otra tecla
        }

        // restricciones de bordes de pantalla (límites físicos invisibles)
        if (posY < 0) posY = 0;
        const lowerLimit = window.innerHeight - 70;
        if (posY > lowerLimit) posY = lowerLimit;

        if (posX < 0) posX = 0;
        const rightLimit = window.innerWidth - 70;
        if (posX > rightLimit) posX = rightLimit;

    });

    // 5. DETECCIÓN DE COLISIONES
    function checkCollision() {
        if (!pigeon) return;
        const birdy = pigeon.getBoundingClientRect();

        // 1. colisiones con panes (puntos)
        document.querySelectorAll(".bread").forEach((bread) => {
            const rectBread = bread.getBoundingClientRect();

            if (birdy.left < rectBread.right && birdy.right > rectBread.left &&
                birdy.top < rectBread.bottom && birdy.bottom > rectBread.top) {
                
                bread.remove();
                points++;
                if (scoreElement) scoreElement.innerText = translations[currentLanguage].score + points;
                collectSoundEffect();
                
                checkLevelUp(gameMenu, menuTitle, menuText, menuButton);
            }
        });

        // 2. colisiones con aviones (obstáculos)
        document.querySelectorAll(".obstacle").forEach((obstacle) => {
            const rectObstacle = obstacle.getBoundingClientRect();

            if (birdy.left < rectObstacle.right && birdy.right > rectObstacle.left &&
                birdy.top < rectObstacle.bottom && birdy.bottom > rectObstacle.top) {
                
                obstacle.remove();
                lives--;
                updateLivesUI();
                hitSoundEffect();

                if (lives <= 0) {
                    isPaused = true;
                    stopMusic();
                    loseSoundEffect();
                    document.querySelectorAll(".bread, .obstacle, .wind-gust").forEach((el) => el.remove());
                    updateTextsUI();
                    gameMenu.classList.remove("hidden");
                }
            }
        });

        // 3. colisiones con ráfagas de viento
        document.querySelectorAll(".wind-gust").forEach((gust) => {
            const rectGust = gust.getBoundingClientRect();

            if (birdy.left < rectGust.right && birdy.right > rectGust.left &&
                birdy.top < rectGust.bottom && birdy.bottom > rectGust.top) {
                
                gust.remove();
                activeWindForce = 15; // activa la fuerza física de empuje hacia atrás
                hitSoundEffect();
            }
        });
    }

    // 6. GAME LOOP
    function gameLoop(timestamp) {
        // el bucle actualiza de forma absoluta la posición de la paloma
        if (pigeon) {
            pigeon.style.top = posY + "px";
            pigeon.style.left = posX + "px";
        }

        if (!isPaused) {
            let moveSpeed = 0, obstacleSpeed = 0, obstacleSpawnRate = 0, windSpeed = 0;

            // configuración de dificultad adaptativa por niveles
            switch (currentLevel) {
                case 1: moveSpeed = 5;   obstacleSpeed = 0;   obstacleSpawnRate = 0;   break;
                case 2: moveSpeed = 6.5; obstacleSpeed = 6.5; obstacleSpawnRate = 120; break;
                case 3: moveSpeed = 8.5; obstacleSpeed = 9;   obstacleSpawnRate = 80;  break;
                case 4: moveSpeed = 9;   obstacleSpeed = 10;  obstacleSpawnRate = 70;  windSpeed = 12; break;
            }

            // aplicación matemática del empuje del viento
            if (activeWindForce > 0) {
                posX -= activeWindForce;
                activeWindForce -= 0.5; // decaimiento progresivo de la fuerza
                if (posX < 0) posX = 0;
            }

            drawBird(timestamp); // renderizado en Canvas (player.js)

            // desplazamiento horizontal de todas las entidades activas en el mapa
            document.querySelectorAll(".bread").forEach((b) => {
                let curX = b.offsetLeft - moveSpeed; b.style.left = curX + "px";
                if (curX < -50) b.remove();
            });

            document.querySelectorAll(".obstacle").forEach((o) => {
                let curX = o.offsetLeft - obstacleSpeed; o.style.left = curX + "px";
                if (curX < -70) o.remove();
            });

            document.querySelectorAll(".wind-gust").forEach((w) => {
                let curX = w.offsetLeft - windSpeed; w.style.left = curX + "px";
                if (curX < -150) w.remove();
            });

            // temporizadores basados en fotogramas para la generación de objetos (spawners)
            breadFrameCount++;
            if (breadFrameCount >= 90) { createBread(); breadFrameCount = 0; }

            if (obstacleSpawnRate > 0) {
                obstacleFrameCount++;
                if (obstacleFrameCount >= obstacleSpawnRate) { createObstacle(); obstacleFrameCount = 0; }
            }

            if (currentLevel === 4) {
                windFrameCount++;
                if (windFrameCount >= 150) { createWindGust(); windFrameCount = 0; }
            }

            checkCollision();
        }

        requestAnimationFrame(gameLoop);
    }
    gameLoop();
    updateStormEffect();

    // 7. SISTEMA DE NIVELES, CLIMA Y RECOMPENSAS FINALES
    function checkLevelUp(gameMenu, menuTitle, menuText, menuButton) {
        let shouldPause = false;

        switch (points) {
            case 3:
                if (currentLevel === 1) { currentLevel = 2; document.body.className = "level-2"; shouldPause = true; }
                break;
            case 7:
                if (currentLevel === 2) { currentLevel = 3; document.body.className = "level-3"; shouldPause = true; }
                break;
            case 12:
                if (currentLevel === 3) { currentLevel = 4; document.body.className = "level-4"; shouldPause = true; }
                break;
            case 18:
                isPaused = true;
                document.querySelectorAll(".bread, .obstacle, .wind-gust").forEach((el) => el.remove());
                stopMusic();
                winSoundEffect();
                if (victoryMenu) {
                    victoryMenu.classList.remove("hidden");
                    updateTextsUI();
                    createConfettiParticles();
                }
                return;
        }

        if (shouldPause) {
            isPaused = true;
            updateTextsUI();
            gameMenu.classList.remove("hidden");
            document.querySelectorAll(".bread, .obstacle, .wind-gust").forEach((el) => el.remove());
            pauseMusic();
            levelUpSoundEffect();
            posY = window.innerHeight / 2; 
            posX = 120;
            if (typeof windFrameCount !== 'undefined') windFrameCount = 0;
        }
    }

    // efecto climático de tormenta eléctrica (nivel 4)
    function updateStormEffect() {
        // usa la variable de caché 'stormContainer'
        if (!document.body.classList.contains("level-4") || isPaused || !stormContainer) {
            requestAnimationFrame(updateStormEffect);
            return;
        }

        // generación de gotas de lluvia
        for (let i = 0; i < 2; i++) {
            const drop = document.createElement("div");
            drop.className = "drop";
            drop.style.left = Math.random() * window.innerWidth + "px";
            drop.style.top = Math.random() * -50 + "px";
            drop.style.animationDuration = Math.random() * 0.3 + 0.4 + "s";
            stormContainer.appendChild(drop);

            setTimeout(() => { drop.remove(); }, 600);
        }

        // probabilidad del 1% por fotograma de generar un relámpago
        if (Math.random() < 0.01) {
            const lightning = document.createElement("div");
            lightning.className = "game-lightning";
            lightning.style.left = Math.random() * 80 + 10 + "%";
            stormContainer.appendChild(lightning);

            setTimeout(() => { lightning.remove(); }, 400);
        }

        requestAnimationFrame(updateStormEffect);
    }

    // generador de partículas de confeti para la pantalla de victoria
    function createConfettiParticles() {
        if (!confettiContainer) return;
        confettiContainer.innerHTML = "";
        const colors = ["#FFD700", "#FF5733", "#33FF57", "#3357FF", "#F333FF", "#33FFF0"];

        for (let i = 0; i < 40; i++) {
            const confetti = document.createElement("div");
            confetti.className = "confetti-piece";

            confetti.style.width = Math.random() * 6 + 6 + "px";
            confetti.style.height = Math.random() * 4 + 10 + "px";
            confetti.style.left = Math.random() * 100 + "%";
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = Math.random() * 2 + 2.5 + "s";
            confetti.style.animationDelay = Math.random() * 2 + "s";

            confettiContainer.appendChild(confetti);
        }
    }
});