// script.js - motor principal, gestión de físicas, colisiones y bucle de renderizado
export function startClassicEngine() {
    // ESCUDO CONTRA REACT (Evita el bug de la doble velocidad y los bloqueos) ---
    // si startClassicEngine se llama dos veces (React StrictMode en dev), cancelamos
    // lo anterior antes de arrancar de nuevo, si no se duplican bucles y listeners
    if (window.gameLoopId) cancelAnimationFrame(window.gameLoopId);
    if (window.cloudAnimId) cancelAnimationFrame(window.cloudAnimId);
    if (window.stormAnimId) cancelAnimationFrame(window.stormAnimId);
    if (window.birdKeydownHandler) window.removeEventListener("keydown", window.birdKeydownHandler);
    // ------------------------------------------------------------------------------

    if (typeof window.initAdsEngine === "function") window.initAdsEngine();

    // inicialización segura: si esto se vuelve a ejecutar, no pisamos el progreso que ya había
    window.points = window.points || 0;
    window.currentLevel = window.currentLevel || 1;
    window.lives = window.lives !== undefined ? window.lives : 3; // 0 es válido (game over), por eso no usamos "||"
    window.posX = window.posX || 120;
    window.posY = window.posY || window.innerHeight / 2;
    window.speed = window.speed || 5;
    window.activeWindForce = window.activeWindForce || 0;
    window.breadFrameCount = window.breadFrameCount || 0;
    window.obstacleFrameCount = window.obstacleFrameCount || 0;
    window.windFrameCount = window.windFrameCount || 0;
    window.isPaused = window.isPaused || false;

    // 1. CAPTURA DE ELEMENTOS DEL DOM Y CACHÉ
    const pigeon = document.querySelector(".pigeon");
    const scoreElement = document.getElementById("score");
    const cloud1 = document.querySelector(".cloud1");
    const cloud2 = document.querySelector(".cloud2");
    const cloud3 = document.querySelector(".cloud3");

    // elementos de la interfaz de menús
    const livesContainer = document.getElementById("lives-container");
    const gameMenu = document.getElementById("game-menu");
    const menuTitle = document.getElementById("menu-title");
    const menuText = document.getElementById("menu-text");
    const menuButton = document.getElementById("menu-button");
    const victoryMenu = document.getElementById("victory-menu");
    const restartButton = document.getElementById("restart-button");

    // contenedores de efectos especiales
    const stormContainer = document.getElementById("storm-container");
    const confettiContainer = document.querySelector(".confetti-container");


    // 2. SISTEMA DE IDIOMAS Y TEXTOS
    // el selector de idioma (los botones, el desplegable, marcar el activo) lo
    // maneja App.jsx directamente; acá solo dejamos el valor por defecto y la
    // función que repinta los textos, que sí sigue siendo responsabilidad del motor
    window.currentLanguage = window.currentLanguage || 'es';

    // refresca todos los textos de la pantalla según el idioma seleccionado
    // translations viene de window.translations (ver translations.js)
    function updateTextsUI() {
        // evitar que el código rompa si las traducciones no han cargado
        if (typeof translations === 'undefined' || !translations[window.currentLanguage]) {
            // fallback por si las traducciones no existen aún en el primer renderizado
            if (scoreElement) scoreElement.innerText = "Panes: " + window.points;
            return;
        }

        const lang = window.currentLanguage;

        if (scoreElement) scoreElement.innerText = translations[lang].score + window.points;
        if (typeof window.updateLivesUI === 'function') {
            window.updateLivesUI();
        }

        // traducción de las tarjetas del menú según el nivel actual
        if (window.isPaused && window.lives > 0) {
            const levelKey = window.currentLevel === 1 ? 'initial' : `level${window.currentLevel}`;
            if (menuTitle) menuTitle.innerText = translations[lang][`${levelKey}_title`];
            if (menuText) menuText.innerText = translations[lang][`${levelKey}_text`];
            if (menuButton) menuButton.innerText = translations[lang][`${levelKey}_btn`];
        } else if (window.lives <= 0) {
            if (menuTitle) menuTitle.innerText = translations[lang].gameOver_title;
            if (menuText) menuText.innerText = translations[lang].gameOver_text;
            if (menuButton) menuButton.innerText = translations[lang].gameOver_btn;
        }

        // traducción de la pantalla de victoria
        if (victoryMenu && !victoryMenu.classList.contains("hidden")) {
            const vicTitle = victoryMenu.querySelector("h1");
            const vicText = victoryMenu.querySelector("p");
            if (vicTitle) vicTitle.innerText = translations[lang].victory_title;
            if (vicText) vicText.innerText = translations[lang].victory_text;
            if (restartButton) restartButton.innerText = translations[lang].victory_btn;
        }

        const dynamicAdBtn = document.getElementById("dynamic-ad-button");
        if (dynamicAdBtn && translations[lang].ad_btn) {
            dynamicAdBtn.innerText = translations[lang].ad_btn;
        }

        const adPlaceholderText = document.getElementById("ad-placeholder-text");
        if (adPlaceholderText && translations[lang].ad_placeholder) {
            adPlaceholderText.innerText = translations[lang].ad_placeholder;
        }
    }

    window.updateTextsUI = updateTextsUI;

    // cuenta atrás despues del anuncio
    window.startResumeCountdown = function () {
        const countdownEl = document.createElement("div");
        countdownEl.style.position = "fixed";
        countdownEl.style.top = "50%";
        countdownEl.style.left = "50%";
        countdownEl.style.transform = "translate(-50%, -50%)";
        countdownEl.style.fontSize = "90px";
        countdownEl.style.fontWeight = "bold";
        countdownEl.style.color = "#FFF";
        countdownEl.style.textShadow = "1px 1px 4px rgba(0,0,0,0.4)";
        countdownEl.style.zIndex = "99999";
        countdownEl.style.fontFamily = "sans-serif";
        document.body.appendChild(countdownEl);

        let count = 3;
        countdownEl.textContent = count;

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownEl.textContent = count;
            } else {
                // al llegar a 0 se elimina el elemento y arranca el juego directamente
                clearInterval(interval);
                countdownEl.remove();

                // la paloma recién se muestra ahora, no antes: así durante la
                // cuenta atrás la pantalla queda vacía en vez de mostrarla
                if (pigeon) pigeon.style.display = "block";
                window.isPaused = false;
                if (typeof window.playMusic === "function") window.playMusic();
            }
        }, 1000);
    };

    // ejecución inicial segura
    if (typeof window.updateLivesUI === 'function') window.updateLivesUI();
    updateTextsUI();

    const volumeSlider = document.getElementById("volume-slider");
    if (volumeSlider) {
        volumeSlider.addEventListener("input", (event) => {
            if (typeof window.updateGlobalVolume === "function") window.updateGlobalVolume(event.target.value);
        });
    }

    // coloca a la paloma en su coordenada X inicial
    if (pigeon) {
        pigeon.style.left = window.posX + "px";
        pigeon.style.display = "none";
    }

    // 3. CONTROL DE MENÚS Y REINICIO DE PARTIDA
    if (menuButton) {
        menuButton.onclick = () => {
            if (window.lives <= 0) {
                resetWholeGame();
            } else {
                if (gameMenu) gameMenu.classList.add("hidden");
                if (pigeon) pigeon.style.display = "block"; // mostrar la paloma al darle al boton de iniciar/continuar
                window.isPaused = false;
                if (typeof window.playMusic === "function") window.playMusic();
            }
        };
    }

    if (restartButton) {
        restartButton.onclick = () => {
            resetWholeGame();
        };
    }

    // resetea el estado completo del motor para empezar una nueva partida limpia
    function resetWholeGame() {
        const dynamicAdBtn = document.getElementById("dynamic-ad-button");
        if (dynamicAdBtn) dynamicAdBtn.remove(); // borra botón de anuncio
        if (victoryMenu) victoryMenu.classList.add("hidden");
        if (gameMenu) gameMenu.classList.add("hidden");

        // limpieza de partículas e hilos visuales
        if (confettiContainer) confettiContainer.innerHTML = "";
        if (stormContainer) stormContainer.innerHTML = "";

        // elimina todo de la pantalla anterior
        document.querySelectorAll(".obstacle, .bread, .wind-gust").forEach((el) => el.remove());

        // reseteo de variables de juego
        window.points = 0;
        window.currentLevel = 1;
        window.lives = 3;
        window.adsWatched = 0;
        document.body.className = "";

        if (typeof window.updateLivesUI === 'function') window.updateLivesUI();
        updateTextsUI();

        // reposicionamiento del jugador al centro
        window.posY = window.innerHeight / 2;
        window.posX = 120;
        if (pigeon) pigeon.style.display = "block"; // mostrar la paloma cuando se reinicia
        window.isPaused = false;
        if (typeof window.playMusic === "function") window.playMusic();
    }

    // 4. SISTEMA DE MOVIMIENTO Y NUBES
    let x1 = 0, x2 = 0, x3 = 0;
    const speedC1 = 0.5, speedC2 = 1.2, speedC3 = 2.5; // nubes en distintas capas, distinta velocidad = parallax
    function animateClouds() {
        if (!window.isPaused) {
            // resta la velocidad de forma continua
            x1 -= speedC1;
            x2 -= speedC2;
            x3 -= speedC3;
            if (cloud1) cloud1.style.backgroundPositionX = `${x1}px`;
            if (cloud2) cloud2.style.backgroundPositionX = `${x2}px`;
            if (cloud3) cloud3.style.backgroundPositionX = `${x3}px`;
        }
        window.cloudAnimId = requestAnimationFrame(animateClouds);
    }
    window.cloudAnimId = requestAnimationFrame(animateClouds);

    // captura de teclado para las físicas de movimiento de la paloma
    // se guarda en window para que el escudo de arriba pueda quitarla si el motor se reinicia
    window.birdKeydownHandler = (event) => {
        if (window.isPaused) return;

        switch (event.key) {
            case "ArrowUp": case "w": case "W": window.posY -= window.speed; break;
            case "ArrowDown": case "s": case "S": window.posY += window.speed; break;
            case "ArrowLeft": case "a": case "A": window.posX -= window.speed; break;
            case "ArrowRight": case "d": case "D": window.posX += window.speed; break;
            default: return; // ignora cualquier otra tecla
        }

        // restricciones de bordes de pantalla (límites físicos invisibles)
        const birdWidth = pigeon ? pigeon.offsetWidth : 85;
        const birdHeight = pigeon ? pigeon.offsetHeight : 85;

        if (window.posY < 0) window.posY = 0;
        const lowerLimit = window.innerHeight - birdHeight;
        if (window.posY > lowerLimit) window.posY = lowerLimit;

        if (window.posX < 0) window.posX = 0;
        const rightLimit = window.innerWidth - birdWidth;
        if (window.posX > rightLimit) window.posX = rightLimit;
    };
    window.addEventListener("keydown", window.birdKeydownHandler);

    // 5. DETECCIÓN DE COLISIONES
    function checkCollision() {
        if (window.isPaused || window.lives <= 0) return;
        if (!pigeon) return;
        const birdy = pigeon.getBoundingClientRect();

        // 1. colisiones con aviones (obstáculos)
        document.querySelectorAll(".obstacle").forEach((obstacle) => {
            if (window.lives <= 0) return;
            const rectObstacle = obstacle.getBoundingClientRect();

            if (birdy.left < rectObstacle.right && birdy.right > rectObstacle.left &&
                birdy.top < rectObstacle.bottom && birdy.bottom > rectObstacle.top) {

                obstacle.remove();
                window.lives--;
                if (typeof window.updateLivesUI === 'function') window.updateLivesUI();
                if (typeof window.hitSoundEffect === 'function') window.hitSoundEffect();

                if (window.lives <= 0) {
                    window.isPaused = true;
                    if (pigeon) pigeon.style.display = "none"; // ocultar a la paloma en el menú game over
                    if (typeof window.showAdOrGameOver === "function") {
                        window.showAdOrGameOver();
                    } else {
                        // fallback defensivo: solo se ejecuta si ads.js no llegó a cargar
                        if (typeof window.stopMusic === "function") window.stopMusic();
                        if (typeof window.loseSoundEffect === "function") window.loseSoundEffect();
                        document.querySelectorAll(".bread, .obstacle, .wind-gust").forEach((el) => el.remove());
                        updateTextsUI();
                        if (gameMenu) gameMenu.classList.remove("hidden");
                    }
                }
            }
        });

        if (window.lives <= 0) return;

        // 2. colisiones con panes (puntos)
        document.querySelectorAll(".bread").forEach((bread) => {
            const rectBread = bread.getBoundingClientRect();

            if (birdy.left < rectBread.right && birdy.right > rectBread.left &&
                birdy.top < rectBread.bottom && birdy.bottom > rectBread.top) {

                bread.remove();
                window.points++;

                updateTextsUI();

                if (typeof window.collectSoundEffect === 'function') window.collectSoundEffect();

                checkLevelUp(gameMenu, menuTitle, menuText, menuButton);
            }
        });

        // 3. colisiones con ráfagas de viento
        document.querySelectorAll(".wind-gust").forEach((gust) => {
            const rectGust = gust.getBoundingClientRect();

            if (birdy.left < rectGust.right && birdy.right > rectGust.left &&
                birdy.top < rectGust.bottom && birdy.bottom > rectGust.top) {

                gust.remove();
                window.activeWindForce = 15; // activa la fuerza física de empuje hacia atrás
                if (typeof window.hitSoundEffect === 'function') window.hitSoundEffect();
            }
        });
    }

    // 6. GAME LOOP
    function gameLoop(timestamp) {
        // registramos el siguiente frame al principio para que el bucle nunca muera por un error visual
        window.gameLoopId = requestAnimationFrame(gameLoop);

        // el bucle actualiza de forma absoluta la posición de la paloma
        if (pigeon) {
            pigeon.style.top = window.posY + "px";
            pigeon.style.left = window.posX + "px";
        }

        if (!window.isPaused) {
            let moveSpeed = 0, obstacleSpeed = 0, obstacleSpawnRate = 0, windSpeed = 0;

            // configuración de dificultad adaptativa por niveles
            switch (window.currentLevel) {
                case 1: moveSpeed = 5; obstacleSpeed = 0; obstacleSpawnRate = 0; break;
                case 2: moveSpeed = 6.5; obstacleSpeed = 6.5; obstacleSpawnRate = 120; break;
                case 3: moveSpeed = 8.5; obstacleSpeed = 9; obstacleSpawnRate = 80; break;
                case 4: moveSpeed = 9; obstacleSpeed = 10; obstacleSpawnRate = 70; windSpeed = 12; break;
            }

            // aplicación matemática del empuje del viento
            if (window.activeWindForce > 0) {
                window.posX -= window.activeWindForce;
                window.activeWindForce -= 0.5; // decaimiento progresivo de la fuerza
                if (window.posX < 0) window.posX = 0;
            }

            if (typeof window.drawBird === "function") window.drawBird(timestamp); // renderizado en canvas (player.js)

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
            window.breadFrameCount++;
            if (window.breadFrameCount >= 90) {
                if (typeof window.createBread === "function") window.createBread();
                window.breadFrameCount = 0;
            }

            if (obstacleSpawnRate > 0) {
                window.obstacleFrameCount++;
                if (window.obstacleFrameCount >= obstacleSpawnRate) {
                    if (typeof window.createObstacle === "function") window.createObstacle();
                    window.obstacleFrameCount = 0;
                }
            }

            if (window.currentLevel === 4) {
                window.windFrameCount++;
                if (window.windFrameCount >= 150) {
                    if (typeof window.createWindGust === "function") window.createWindGust();
                    window.windFrameCount = 0;
                }
            }

            checkCollision();
        }
    }
    window.gameLoopId = requestAnimationFrame(gameLoop);

    // 7. SISTEMA DE NIVELES, CLIMA Y RECOMPENSAS FINALES
    function checkLevelUp(gameMenu, menuTitle, menuText, menuButton) {
        const dynamicAdBtn = document.getElementById("dynamic-ad-button");
        if (dynamicAdBtn) dynamicAdBtn.remove();
        if (window.lives <= 0) return;
        let shouldPause = false;

        switch (window.points) {
            case 25:
                if (window.currentLevel === 1) { window.currentLevel = 2; document.body.className = "level-2"; shouldPause = true; }
                break;
            case 50:
                if (window.currentLevel === 2) { window.currentLevel = 3; document.body.className = "level-3"; shouldPause = true; }
                break;
            case 75:
                if (window.currentLevel === 3) { window.currentLevel = 4; document.body.className = "level-4"; shouldPause = true; }
                break;
            case 100:
                // victoria
                window.isPaused = true;
                if (pigeon) pigeon.style.display = "none"; // ocultar a la paloma en pantalla final
                document.querySelectorAll(".bread, .obstacle, .wind-gust").forEach((el) => el.remove());
                if (typeof window.stopMusic === "function") window.stopMusic();
                if (typeof window.winSoundEffect === "function") window.winSoundEffect();
                if (victoryMenu) {
                    victoryMenu.classList.remove("hidden");
                    updateTextsUI();
                    createConfettiParticles();
                }
                return;
        }

        if (shouldPause) {
            window.isPaused = true;
            if (pigeon) pigeon.style.display = "none"; // oculta a la paloma
            updateTextsUI();
            if (gameMenu) gameMenu.classList.remove("hidden");
            document.querySelectorAll(".bread, .obstacle, .wind-gust").forEach((el) => el.remove());
            if (typeof window.pauseMusic === "function") window.pauseMusic();
            if (typeof window.levelUpSoundEffect === "function") window.levelUpSoundEffect();
            window.posY = window.innerHeight / 2;
            window.posX = 120;
            window.windFrameCount = 0;
        }
    }

    // efecto climático de tormenta eléctrica (nivel 4)
    function updateStormEffect() {
        if (!document.body.classList.contains("level-4") || window.isPaused || !stormContainer) {
            window.stormAnimId = requestAnimationFrame(updateStormEffect);
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

        window.stormAnimId = requestAnimationFrame(updateStormEffect);
    }
    window.stormAnimId = requestAnimationFrame(updateStormEffect);

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
}