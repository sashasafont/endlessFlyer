// responsive.js - pantallas, físicas adaptativas y controles móviles
// al ser módulo ES esto corre en modo estricto, así que las asignaciones
// a variables globales tienen que llevar "window." delante (si no, error)
function adaptGamePhysics() {
    window.speed = Math.max(25, Math.min(65, window.innerWidth * 0.045));
}
// el "escudo" de bordes de pantalla en script.js usa el tamaño real de la paloma
// aquí lo mismo en vez de un número fijo, para que ambos archivos coincidan siempre aunque cambie el CSS
function getBirdSize() {
    const pigeon = document.querySelector(".pigeon");
    return {
        width: pigeon ? pigeon.offsetWidth : 85,
        height: pigeon ? pigeon.offsetHeight : 85,
    };
}

// ejecutar al cargar la página para configurar el juego la primera vez
window.addEventListener("load", () => {
    adaptGamePhysics();
});

// si el usuario gira el móvil o cambia el tamaño de la ventana del navegador
window.addEventListener("resize", () => {
    adaptGamePhysics();
    const { width, height } = getBirdSize();

    // si el juego no está pausado, reajusta la paloma al límite
    const lowerLimit = window.innerHeight - height;
    if (window.posY > lowerLimit) window.posY = lowerLimit;

    const rightLimit = window.innerWidth - width;
    if (window.posX > rightLimit) window.posX = rightLimit;
});

// controles táctiles (pantalla dividida en 4 zonas)
window.addEventListener("touchstart", (evento) => {
    if (window.isPaused) return;

    const touchX = evento.touches[0].clientX;
    const touchY = evento.touches[0].clientY;

    const widthHalf = window.innerWidth / 2;
    const heightHalf = window.innerHeight / 2;

    const mobileSpeed = window.speed * 1.5;
    const distanceX = Math.abs(touchX - widthHalf) / window.innerWidth;
    const distanceY = Math.abs(touchY - heightHalf) / window.innerHeight;

    const { width, height } = getBirdSize();

    if (distanceX > distanceY) {
        // horizontal
        if (touchX < widthHalf) {
            window.posX -= mobileSpeed;
            if (window.posX < 0) window.posX = 0;
        } else {
            window.posX += mobileSpeed;
            const rightLimit = window.innerWidth - width;
            if (window.posX > rightLimit) window.posX = rightLimit;
        }
    } else {
        // vertical
        if (touchY < heightHalf) {
            window.posY -= mobileSpeed;
            if (window.posY < 0) window.posY = 0;
        } else {
            window.posY += mobileSpeed;
            const lowerLimit = window.innerHeight - height;
            if (window.posY > lowerLimit) window.posY = lowerLimit;
        }
    }
});