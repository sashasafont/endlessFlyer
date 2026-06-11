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