// obstacles.js - generación de panes y obstáculos

// generar panes
function createBread() {
    if (isPaused) return;
    const bread = document.createElement("div");
    bread.className = "bread";
    const x = window.innerWidth + 50;
    const y = Math.random() * (window.innerHeight - 100) + 50;
    bread.style.left = x + "px";
    bread.style.top = y + "px";

    document.body.appendChild(bread);
}

// generar obstáculos (aviones) en posiciones aleatorias según el nivel
function createObstacle() {
    if (currentLevel === 1 || isPaused) return;
    const gameContainer = document.querySelector(".container") || document.body;
    const obstacle = document.createElement("div");
    obstacle.className = "obstacle";
    obstacle.innerHTML = '<i class="bi bi-airplane-fill"></i>';

    // posicionamiento dinámico aleatorio
    const x = window.innerWidth + 80;
    const y = Math.random() * (window.innerHeight - 120) + 50;
    obstacle.style.left = x + "px";
    obstacle.style.top = y + "px";

    gameContainer.appendChild(obstacle);
}

// generar ráfagas de viento visuales en posiciones Y aleatorias
function createWindGust() {
    if (isPaused) return;
    const gameContainer = document.body;

    const gust = document.createElement("div");
    gust.className = "wind-gust";

    // icono de viento de bootstrap
    gust.innerHTML = '<i class="bi bi-wind"></i>';

    // posicionamiento dinámico aleatorio
    const x = window.innerWidth + 100;
    const y = Math.random() * (window.innerHeight - 150) + 50;

    gust.style.left = x + "px";
    gust.style.top = y + "px";

    gameContainer.appendChild(gust);
}