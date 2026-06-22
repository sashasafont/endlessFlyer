// responsive.js - gestión de pantallas, físicas adaptativas y controles móviles

// calcular las físicas según el tamaño de la pantalla
function adaptGamePhysics() {
    speed = Math.max(25, Math.min(65, window.innerWidth * 0.045));
}

// ejecutar al cargar la página para configurar el juego la primera vez
window.addEventListener("load", () => {
    adaptGamePhysics();
});

// si el usuario gira el móvil o cambia el tamaño de la ventana del navegador
window.addEventListener("resize", () => {
    adaptGamePhysics();
    
    // si el juego no está pausado, reajusta la paloma al límite
    const lowerLimit = window.innerHeight - 70;
    if (posY > lowerLimit) posY = lowerLimit;
    
    const rightLimit = window.innerWidth - 70;
    if (posX > rightLimit) posX = rightLimit;
});

// CONTROLES TÁCTILES PARA MÓVILES (PANTALLA DIVIDIDA EN 4 ZONAS)
window.addEventListener("touchstart", (evento) => {
    // si el juego está pausado (menús abiertos), no hace nada
    if (isPaused) return;

    // captura las coordenadas X e Y del toque del usuario
    const touchX = evento.touches[0].clientX;
    const touchY = evento.touches[0].clientY;

    const widthHalf = window.innerWidth / 2;
    const heightHalf = window.innerHeight / 2;

    // se multiplica la velocidad en móvil para que el tap sea más rápido
    const mobileSpeed = speed * 1.5; 
    // calcula la distancia respecto al centro de la pantalla
    const distanceX = Math.abs(touchX - widthHalf) / window.innerWidth;
    const distanceY = Math.abs(touchY - heightHalf) / window.innerHeight;

    if (distanceX > distanceY) {
        // HORIZONTAL
        if (touchX < widthHalf) {
            // Toco la mitad izquierda - ATRÁS
            posX -= mobileSpeed;
            if (posX < 0) posX = 0;
        } else {
            // Toco la mitad derecha - ADELANTE
            posX += mobileSpeed;
            const rightLimit = window.innerWidth - 70;
            if (posX > rightLimit) posX = rightLimit;
        }
    } else {
        // VERTICAL
        if (touchY < heightHalf) {
            // Toco la mitad superior - ARRIBA
            posY -= mobileSpeed;
            if (posY < 0) posY = 0;
        } else {
            // Toco la mitad inferior - ABAJO
            posY += mobileSpeed;
            const lowerLimit = window.innerHeight - 70;
            if (posY > lowerLimit) posY = lowerLimit;
        }
    }
});