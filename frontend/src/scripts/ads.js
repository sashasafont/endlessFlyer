// ads.js - sistema de anuncio recompensado
// al quedarse sin vidas, se ofrece revivir viendo un "anuncio" (una cuenta atrás de 10s, no hay proveedor real conectado)

const MAX_ADS_PER_GAME = 2;
const AD_DURATION_MS = 10000;

export function initAdsEngine() {
    const adMenu = document.getElementById("ad-menu");
    const adCountdownBadge = document.getElementById("ad-countdown-badge");
    const gameMenu = document.getElementById("game-menu");
    const menuButton = document.getElementById("menu-button");

    if (!adMenu) return;

    // se llama desde script.js cuando el jugador se queda sin vidas
    window.showAdOrGameOver = function () {
        window.isPaused = true;

        const existingBtn = document.getElementById("dynamic-ad-button");
        if (existingBtn) existingBtn.remove();

        if (window.lives <= 0 && window.adsWatched < MAX_ADS_PER_GAME && menuButton) {
            // el botón de "ver anuncio" al vuelo, con el mismo estilo que el botón del menú
            const adOptionBtn = document.createElement("button");
            adOptionBtn.id = "dynamic-ad-button";
            adOptionBtn.className = menuButton.className;
            adOptionBtn.style.margin = "10px";
            adOptionBtn.innerText = translations[window.currentLanguage].ad_btn;

            adOptionBtn.addEventListener("click", () => {
                if (gameMenu) gameMenu.classList.add("hidden");
                adOptionBtn.remove();
                startAdPlayback();
            });

            menuButton.parentNode.insertBefore(adOptionBtn, menuButton.nextSibling);
        }

        openGameOverMenu();
    };

    function startAdPlayback() {
        if (typeof window.stopMusic === "function") window.stopMusic();
        if (typeof window.pauseMusic === "function") window.pauseMusic();

        adMenu.classList.remove("hidden");

        let secondsLeft = AD_DURATION_MS / 1000;
        if (adCountdownBadge) adCountdownBadge.textContent = secondsLeft + "s";

        const intervalId = setInterval(() => {
            secondsLeft--;
            if (adCountdownBadge) adCountdownBadge.textContent = Math.max(secondsLeft, 0) + "s";
            if (secondsLeft <= 0) clearInterval(intervalId);
        }, 1000);

        setTimeout(() => {
            clearInterval(intervalId);
            finishAdAndReward();
        }, AD_DURATION_MS);
    }

    function finishAdAndReward() {
        window.adsWatched++;
        window.lives = 1; // vida de regalo por ver el anuncio completo
        window.activeWindForce = 0; // reseteo paloma

        // limpia lo que hubiera quedado en pantalla de antes de perder
        document.querySelectorAll(".bread, .obstacle, .wind-gust").forEach((el) => el.remove());

        closeAdOverlay();

        if (typeof window.updateLivesUI === "function") window.updateLivesUI();
        if (typeof window.updateTextsUI === "function") window.updateTextsUI();

        // la paloma se muestra recién cuando termina la cuenta atrás de
        // reanudación (ver startResumeCountdown en script.js), no antes
        if (typeof window.startResumeCountdown === "function") {
            window.startResumeCountdown();
        } else {
            const pigeon = document.querySelector(".pigeon");
            if (pigeon) pigeon.style.display = "block";
            window.isPaused = false;
            if (typeof window.playMusic === "function") window.playMusic();
        }
    }

    function closeAdOverlay() {
        adMenu.classList.add("hidden");
    }

    function openGameOverMenu() {
        if (adMenu && adMenu.classList.contains("hidden")) {
            if (window.lives <= 0) {
                if (typeof window.stopMusic === "function") window.stopMusic();
                if (typeof window.loseSoundEffect === "function") window.loseSoundEffect();
                document.querySelectorAll(".bread, .obstacle, .wind-gust").forEach((el) => el.remove());
            }
        }
        if (typeof window.updateTextsUI === "function") window.updateTextsUI();
        if (gameMenu) gameMenu.classList.remove("hidden");
    }
}

window.initAdsEngine = initAdsEngine;