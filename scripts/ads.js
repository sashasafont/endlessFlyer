// ads.js - sistema de anuncio recompensado (ver anuncio = +1 vida extra)
// límite: 2 usos por partida. Se resetea junto al resto de variables en
// resetWholeGame() (script.js).

const MAX_ADS_PER_GAME = 2;   // tope de usos por partida
const AD_DURATION_MS = 10000; // duración simulada del anuncio (10 segundos)

let adTimerId = null; 

window.addEventListener("load", () => {
    const adMenu = document.getElementById("ad-menu");
    const adSkipButton = document.getElementById("ad-skip-button");
    const adCountdownBadge = document.getElementById("ad-countdown-badge");
    const adUsesLeftText = document.getElementById("ad-uses-left");
    const gameMenu = document.getElementById("game-menu");
    const menuButton = document.getElementById("menu-button");

    if (!adMenu || !adSkipButton) return; 

    function refreshSkipButtonText() {
        if (typeof translations === 'undefined' || !translations[window.currentLanguage]) return;
        adSkipButton.textContent = translations[window.currentLanguage].ad_skip_btn;
    }
    refreshSkipButtonText();

    window.showAdOrGameOver = function () {
        isPaused = true;

        // limpiar siempre el botón dinámico viejo por si acaso
        const existingBtn = document.getElementById("dynamic-ad-button");
        if (existingBtn) existingBtn.remove();

        // el botón SOLO se crea si el jugador se ha quedado SIN VIDAS
        if (lives <= 0 && adsWatched < MAX_ADS_PER_GAME && menuButton) {
            const adOptionBtn = document.createElement("button");
            adOptionBtn.id = "dynamic-ad-button";
            
            // clonación del estilo del menú según el nivel
            adOptionBtn.className = menuButton.className; 
            adOptionBtn.style.margin = "10px"; 

            adOptionBtn.innerText = translations[window.currentLanguage].ad_btn;

            // evento: Al hacer clic arranca el anuncio
            adOptionBtn.addEventListener("click", () => {
                gameMenu.classList.add("hidden");
                adOptionBtn.remove(); 
                startAdPlayback();
            });

            // lo coloca al lado del botón nativo de ese menú
            menuButton.parentNode.insertBefore(adOptionBtn, menuButton.nextSibling);
        }

        openGameOverMenu();
    };

    function startAdPlayback() {
        if (typeof stopMusic === "function") stopMusic();
        if (typeof pauseMusic === "function") pauseMusic();

        refreshSkipButtonText();

        if (adUsesLeftText && typeof translations !== 'undefined' && translations[window.currentLanguage]) {
            const usesLeft = MAX_ADS_PER_GAME - adsWatched;
            adUsesLeftText.textContent = translations[window.currentLanguage].ad_uses_left.replace("{count}", usesLeft);
        }

        adMenu.classList.remove("hidden");
        adSkipButton.disabled = false;

        let secondsLeft = AD_DURATION_MS / 1000;
        if (adCountdownBadge) adCountdownBadge.textContent = secondsLeft + "s";

        const intervalId = setInterval(() => {
            secondsLeft--;
            if (adCountdownBadge) adCountdownBadge.textContent = Math.max(secondsLeft, 0) + "s";
            if (secondsLeft <= 0) clearInterval(intervalId);
        }, 1000);

        adTimerId = setTimeout(() => {
            clearInterval(intervalId);
            finishAdAndReward();
        }, AD_DURATION_MS);

        adSkipButton.dataset.intervalId = intervalId;
    }

    function finishAdAndReward() {
        adsWatched++;
        lives = 1; 

        closeAdOverlay();

        if (typeof updateLivesUI === "function") updateLivesUI();
        if (typeof window.updateTextsUI === "function") window.updateTextsUI();

        const pigeon = document.querySelector(".pigeon");
        if (pigeon) pigeon.style.display = "block";

        if (typeof window.startResumeCountdown === "function") {
            window.startResumeCountdown();
        } else {
            isPaused = false;
            if (typeof playMusic === "function") playMusic();
        }
    }

    function closeAdOverlay() {
        adMenu.classList.add("hidden");
    }

    adSkipButton.addEventListener("click", () => {
        if (adTimerId) {
            clearTimeout(adTimerId);
            adTimerId = null;
        }
        const intervalId = adSkipButton.dataset.intervalId;
        if (intervalId) clearInterval(Number(intervalId));

        closeAdOverlay();
        openGameOverMenu();
    });

    function openGameOverMenu() {
        if (adMenu.classList.contains("hidden")) {
            // solo se limpian entidades y pone música de derrota si venimos de morir de verdad
            if (lives <= 0) {
                if (typeof stopMusic === "function") stopMusic();
                if (typeof loseSoundEffect === "function") loseSoundEffect();
                document.querySelectorAll(".bread, .obstacle, .wind-gust").forEach((el) => el.remove());
            }
        }
        
        if (typeof window.updateTextsUI === "function") window.updateTextsUI();
        if (gameMenu) gameMenu.classList.remove("hidden");
    }
});