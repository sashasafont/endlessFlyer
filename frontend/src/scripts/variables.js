// variables globales del juego
// van en window para que las lean el resto de scripts sin tener que importarlas

// 1. ESTADO DEL JUGADOR (PALOMA)
window.lives = 3;                      // vidas iniciales del jugador
window.points = 0;                     // contador global de panes recogidos (puntuación)
window.posY = window.innerHeight / 2;  // coordenada Y inicial
window.posX = 120;                     // coordenada X inicial

// 2. FÍSICAS Y MECÁNICAS DE MOVIMIENTO
window.speed = 35;                     // píxeles que se desplaza la paloma por cada pulsación de tecla
window.activeWindForce = 0;            // fuerza física actual de arrastre provocada por el viento (Nivel 4)

// 3. CONTROL DE FLUJO Y MUNDO
window.currentLevel = 1;               // nivel por el que arranca la partida
window.isPaused = true;                // estado de pausa

// 4. TEMPORIZADORES BASADOS EN FRAMES (SPAWNERS DE ENTIDADES)
window.breadFrameCount = 0;            // reloj de control para la frecuencia de aparición de panes
window.obstacleFrameCount = 0;         // reloj de control para la frecuencia de aparición de aviones
window.windFrameCount = 0;             // reloj de control para la frecuencia de aparición de ráfagas de viento

// 5. SISTEMA DE ANUNCIO CON RECOMPENSA
window.adsWatched = 0;                 // veces que el jugador vio anuncio en esta partida