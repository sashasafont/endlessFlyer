// obstacles.js - panes y obstáculos

function getGameContainer() {
    // buscamos el contenedor del juego para que los objetos no floten fuera del escenario
    return document.querySelector(".container") || document.body;
}

function createBread() {
    if (window.isPaused) return;
    const container = getGameContainer();
    const bread = document.createElement("div");
    bread.className = "bread";
    const x = container.clientWidth || window.innerWidth;
    const y = Math.random() * ((container.clientHeight || window.innerHeight) - 100) + 50;
    bread.style.left = x + "px";
    bread.style.top = y + "px";
    container.appendChild(bread);
}

function createObstacle() {
    if (window.currentLevel === 1 || window.isPaused) return; // en nivel 1 no hay obstáculos, es el tutorial
    const container = getGameContainer();
    const obstacle = document.createElement("div");
    obstacle.className = "obstacle";
    obstacle.innerHTML = '<i class="bi bi-airplane-fill"></i>';

    const x = (container.clientWidth || window.innerWidth) + 30;
    const y = Math.random() * ((container.clientHeight || window.innerHeight) - 120) + 50;
    obstacle.style.left = x + "px";
    obstacle.style.top = y + "px";

    container.appendChild(obstacle);
}

function createWindGust() {
    if (window.isPaused) return;
    const container = getGameContainer();
    const gust = document.createElement("div");
    gust.className = "wind-gust";
    gust.innerHTML = '<i class="bi bi-wind"></i>';

    const x = (container.clientWidth || window.innerWidth) + 50;
    const y = Math.random() * ((container.clientHeight || window.innerHeight) - 150) + 50;
    gust.style.left = x + "px";
    gust.style.top = y + "px";

    container.appendChild(gust);
}

// registro global
window.createBread = createBread;
window.createObstacle = createObstacle;
window.createWindGust = createWindGust;