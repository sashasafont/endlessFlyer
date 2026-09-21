// player.js - lógica y comportamiento del jugador (paloma)

// pinta los corazones de vidas
function updateLivesUI() {
    const livesContainer = document.getElementById("lives-container");
    if (!livesContainer) return;

    const lang = window.currentLanguage || 'es';
    if (typeof translations === 'undefined' || !translations[lang]) return;

    livesContainer.innerHTML = translations[lang].score ? translations[lang].lives : "Vidas: ";

    const heartsWrap = document.createElement("div");

    // armamos el html de los corazones antes de tocar el DOM
    let heartsHTML = "";
    for (let i = 0; i < (window.lives || 3); i++) {
        heartsHTML += '<i class="bi bi-heart-fill" style="color: red; margin-left: 5px;"></i>';
    }

    heartsWrap.innerHTML = heartsHTML;
    heartsWrap.style.display = "inline-block";

    livesContainer.appendChild(heartsWrap);
}

// spritesheet de la paloma
const birdImg = new Image();
birdImg.src = '/img/bird/YellowBird-Idle.png';

// parámetros de la animación
const BIRD_COLS = 12;
const BIRD_ROWS = 1;
const BIRD_FRAMES = 12;
const BIRD_FPS = 12;
const BIRD_SCALE = 2;

let birdFrame = 0;
let birdLastTime = 0;
let birdFrameW = 0, birdFrameH = 0;

birdImg.onload = () => {
    birdFrameW = birdImg.naturalWidth / BIRD_COLS;
    birdFrameH = birdImg.naturalHeight / BIRD_ROWS;
};

// se llama una vez por frame desde el gameLoop de script.js
function drawBird(timestamp) {
    const birdCanvas = document.getElementById('birdCanvas');
    if (!birdCanvas) return; // por si se llama justo antes de que React lo haya montado
    const birdCtx = birdCanvas.getContext('2d');

    if (birdCanvas.width !== birdFrameW * BIRD_SCALE && birdFrameW > 0) {
        birdCanvas.width = birdFrameW * BIRD_SCALE;
        birdCanvas.height = birdFrameH * BIRD_SCALE;
    }

    // limita los FPS de la animación (independiente de los FPS del juego)
    if (timestamp - birdLastTime < 1000 / BIRD_FPS) return;
    birdLastTime = timestamp;

    const col = birdFrame % BIRD_COLS;

    birdCtx.clearRect(0, 0, birdCanvas.width, birdCanvas.height);

    if (birdFrameW > 0) {
        birdCtx.drawImage(
            birdImg,
            col * birdFrameW, 0,
            birdFrameW, birdFrameH,
            0, 0,
            birdFrameW * BIRD_SCALE, birdFrameH * BIRD_SCALE
        );
    }

    birdFrame = (birdFrame + 1) % BIRD_FRAMES;
}

// registro global para que script.js pueda usarlas
window.updateLivesUI = updateLivesUI;
window.drawBird = drawBird;