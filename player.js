// player.js - lógica y comportamiento del jugador (Paloma)

// función para actualizar la UI de vidas
function updateLivesUI() {
    const livesContainer = document.getElementById("lives-container");
    if (!livesContainer) return;

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

const birdCanvas = document.getElementById('birdCanvas');
const birdCtx = birdCanvas.getContext('2d');
const birdImg = new Image();
birdImg.src = './assets/img/bird/YellowBird-Idle.png';

const BIRD_COLS = 12;
const BIRD_ROWS = 1;
const BIRD_FRAMES = 12;
const BIRD_FPS = 12;
const BIRD_SCALE = 2;

let birdFrame = 0;
let birdLastTime = 0;
let birdFrameW, birdFrameH;

birdImg.onload = () => {
    birdFrameW = birdImg.naturalWidth / BIRD_COLS;
    birdFrameH = birdImg.naturalHeight / BIRD_ROWS;
    birdCanvas.width = birdFrameW * BIRD_SCALE;
    birdCanvas.height = birdFrameH * BIRD_SCALE;
};

function drawBird(timestamp) {
    if (timestamp - birdLastTime < 1000 / BIRD_FPS) return;
    birdLastTime = timestamp;

    const col = birdFrame % BIRD_COLS;

    birdCtx.clearRect(0, 0, birdCanvas.width, birdCanvas.height);

    birdCtx.save();

    birdCtx.drawImage(
        birdImg,
        col * birdFrameW, 0,
        birdFrameW, birdFrameH,
        0, 0,
        birdFrameW * BIRD_SCALE, birdFrameH * BIRD_SCALE
    );

    birdCtx.restore();

    birdFrame = (birdFrame + 1) % BIRD_FRAMES;
}