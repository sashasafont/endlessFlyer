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