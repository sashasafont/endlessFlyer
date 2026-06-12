// audio.js - gestión del sistema de música y efectos de sonido

//sonido de subida de nivel
const levelUpSound = new Audio('./assets/sounds/levelupSound.wav');
levelUpSound.volume = 0.8;

// sonido de game over
const loseSound = new Audio('./assets/sounds/loseSound.wav');
loseSound.volume = 0.8;

//sonido impacto
const hitSound = new Audio('./assets/sounds/hitSound.wav');
hitSound.volume = 0.7;

//sonido victoria
const winSound = new Audio('./assets/sounds/victorySound.wav');
winSound.volume = 0.8;

//sonido de recoger objeto
const collectSound = new Audio('./assets/sounds/collectSound.wav');
collectSound.volume = 0.6;

//musica del juego
const bgMusic = new Audio('./assets/music/town.wav');
bgMusic.loop = true;
bgMusic.volume = 0.5;

function playMusic() {
    bgMusic.play().catch(error => {
        console.log("Error al reproducir la música de fondo:", error);
    });
}

function stopMusic() {
    bgMusic.pause();
    bgMusic.currentTime = 0; // reinicia la canción desde el principio
}

function pauseMusic() {
    bgMusic.pause(); // por si quiero pausarla sin reiniciar el tiempo
}

function levelUpSoundEffect () {
    levelUpSound.currentTime = 0;
    levelUpSound.play().catch(error => {
        console.log("Error al reproducir el sonido de nivel:", error);
    })
}

function loseSoundEffect () {
    loseSound.currentTime = 0;
    loseSound.play().catch(error => {
        console.log("Error al reproducir el sonido de derrota:", error);
    })
}

function hitSoundEffect () {
    hitSound.currentTime = 0;
    hitSound.play().catch(error => {
        console.log("Error al reproducir el sonido de impacto:", error);
    })
}

function winSoundEffect() {
    winSound.currentTime = 0;
    winSound.play().catch(error => {
        console.log("Error al reproducir el sonido de victoria:", error);
    });
}

function collectSoundEffect() {
    collectSound.currentTime = 0;
    collectSound.play().catch(error =>{
        console.log("Error al reproducir el sonido de colectar pan:", error);
    });
}

function updateGlobalVolume(volumeValue) {
    const fraction = volumeValue / 100;

    // aplicar volumen a la música
    bgMusic.volume = fraction * 0.5;

    // aplicar volumen a los efectos
    levelUpSound.volume = fraction * 0.8;
    loseSound.volume = fraction * 0.8;
    hitSound.volume = fraction * 0.7;
    winSound.volume = fraction * 0.8;
    collectSound.volume = fraction * 0.6;

    // el icono de Bootstrap según el volumen
    const volumeIcon = document.getElementById("volume-icon");
    if (volumeIcon) {
        if (volumeValue == 0) {
            // icono de mute
            volumeIcon.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';
        } else if (volumeValue < 40) {
            // icono de volumen bajo
            volumeIcon.innerHTML = '<i class="bi bi-volume-down-fill"></i>';
        } else {
            // icono de volumen alto
            volumeIcon.innerHTML = '<i class="bi bi-volume-up-fill"></i>';
        }
    }
}