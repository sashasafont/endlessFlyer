// variables globales del juego

// 1. ESTADO DEL JUGADOR (PALOMA)
let lives = 3;                      // vidas iniciales del jugador
let points = 0;                     // contador global de panes recogidos (puntuación)
let posY = window.innerHeight / 2;  // coordenada Y inicial
let posX = 120;                     // coordenada X inicial

// 2. FÍSICAS Y MECÁNICAS DE MOVIMIENTO
let speed = 35;                   // píxeles que se desplaza la paloma por cada pulsación de tecla
let activeWindForce = 0;            // fuerza física actual de arrastre provocada por el viento (Nivel 4)

// 3. CONTROL DE FLUJO Y MUNDO
let currentLevel = 1;               // nivel por el que arranca la partida
let isPaused = true;                // estado de pausa

// 4. TEMPORIZADORES BASADOS EN FRAMES (SPAWNERS DE ENTIDADES)
let breadFrameCount = 0;            // reloj de control para la frecuencia de aparición de panes
let obstacleFrameCount = 0;         // reloj de control para la frecuencia de aparición de aviones
let windFrameCount = 0;             // reloj de control para la frecuencia de aparición de ráfagas de viento