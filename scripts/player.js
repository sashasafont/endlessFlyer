// player.js - lógica y comportamiento del jugador (Paloma)

// función para actualizar la UI de vidas
function updateLivesUI() {
    const livesContainer = document.getElementById("lives-container");
    if (!livesContainer) return;

    livesContainer.innerHTML = translations[currentLanguage].lives; //traducción 

    // sub-caja para los corazones
    const heartsWrap = document.createElement("div");

    // acumula los iconos en una variable antes de tocar el DOM
    let heartsHTML = "";
    for (let i = 0; i < lives; i++) {
        heartsHTML += '<i class="bi bi-heart-fill"></i>';
    }
    
    // inserta todos los corazones
    heartsWrap.innerHTML = heartsHTML;

    // añade la fila de corazones al marcador principal
    livesContainer.appendChild(heartsWrap);
}

//captura del canvas y su contexto 2D
const birdCanvas = document.getElementById('birdCanvas');
const birdCtx = birdCanvas.getContext('2d');

//carga la img de la paloma (spritesheet)
const birdImg = new Image();
birdImg.src = './assets/img/bird/YellowBird-Idle.png';

//parametros de la animación del sprite
const BIRD_COLS = 12; //cantidad de fotogramas horizontales en la imagen
const BIRD_ROWS = 1; // filas de la imagen
const BIRD_FRAMES = 12; // total fotogramas a reproducir
const BIRD_FPS = 12; //velocidad de animación
const BIRD_SCALE = 2; // multiplicador de tamaño

let birdFrame = 0;
let birdLastTime = 0;
let birdFrameW, birdFrameH;

// evento que se ejecuta cuando se carga la paloma
birdImg.onload = () => {
    //calcula el tamaño de fotograma
    birdFrameW = birdImg.naturalWidth / BIRD_COLS;
    birdFrameH = birdImg.naturalHeight / BIRD_ROWS;
    //ajusta el tamaño de canvas
    birdCanvas.width = birdFrameW * BIRD_SCALE;
    birdCanvas.height = birdFrameH * BIRD_SCALE;
};

function drawBird(timestamp) {
    //control de fps
    if (timestamp - birdLastTime < 1000 / BIRD_FPS) return;
    birdLastTime = timestamp; //actualiza el punto de control de tiempo

    const col = birdFrame % BIRD_COLS; //calcula que columna de spritesheet toca dibujar

    birdCtx.clearRect(0, 0, birdCanvas.width, birdCanvas.height); //limpia el fotograma anterior

    birdCtx.drawImage(
        birdImg,
        col * birdFrameW, 0, // coordenadas de recorte dentro de la imagen original
        birdFrameW, birdFrameH, // tamaño del recorte (ancho, alto)
        0, 0, // posición de destino dentro de Canvas (X, Y)
        birdFrameW * BIRD_SCALE, birdFrameH * BIRD_SCALE // ancho y alto final
    );

    birdFrame = (birdFrame + 1) % BIRD_FRAMES; // avanza al siguiente fotograma de forma infinita
}