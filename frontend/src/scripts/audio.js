// audio.js - música y efectos de sonido

// rutas apuntando a la carpeta public
const levelUpSound = new Audio('/sounds/levelupSound.wav');
levelUpSound.volume = 0.8;

const loseSound = new Audio('/sounds/loseSound.wav');
loseSound.volume = 0.8;

const hitSound = new Audio('/sounds/hitSound.wav');
hitSound.volume = 0.7;

const winSound = new Audio('/sounds/victorySound.wav');
winSound.volume = 0.8;

const collectSound = new Audio('/sounds/collectSound.wav');
collectSound.volume = 0.6;

const bgMusic = new Audio('/music/town.wav');
bgMusic.loop = true;
bgMusic.volume = 0.5;

function playMusic() {
    bgMusic.play().catch(error => {
        // el navegador bloquea el autoplay si no hubo interacción antes, lo dejamos loguear y ya
        console.log("Error al reproducir la música de fondo:", error);
    });
}

function stopMusic() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
}

function pauseMusic() {
    bgMusic.pause();
}

function levelUpSoundEffect() {
    levelUpSound.currentTime = 0;
    levelUpSound.play().catch(error => console.log(error));
}

function loseSoundEffect() {
    loseSound.currentTime = 0;
    loseSound.play().catch(error => console.log(error));
}

function hitSoundEffect() {
    hitSound.currentTime = 0;
    hitSound.play().catch(error => console.log(error));
}

function winSoundEffect() {
    winSound.currentTime = 0;
    winSound.play().catch(error => console.log(error));
}

function collectSoundEffect() {
    collectSound.currentTime = 0;
    collectSound.play().catch(error => console.log(error));
}

// ajusta el volumen de todo a la vez, a partir del valor 0-100 del slider
function updateGlobalVolume(volumeValue) {
    const fraction = volumeValue / 100;
    bgMusic.volume = fraction * 0.5;
    levelUpSound.volume = fraction * 0.8;
    loseSound.volume = fraction * 0.8;
    hitSound.volume = fraction * 0.7;
    winSound.volume = fraction * 0.8;
    collectSound.volume = fraction * 0.6;

    // icono de volumen según el nivel
    const volumeIcon = document.getElementById("volume-icon");
    if (volumeIcon) {
        if (fraction === 0) {
            volumeIcon.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';
        } else if (fraction < 0.6) {
            volumeIcon.innerHTML = '<i class="bi bi-volume-down-fill"></i>';
        } else {
            volumeIcon.innerHTML = '<i class="bi bi-volume-up-fill"></i>';
        }
    }
}

// registro global para que script.js y ads.js puedan llamar a estas funciones
window.playMusic = playMusic;
window.stopMusic = stopMusic;
window.pauseMusic = pauseMusic;
window.levelUpSoundEffect = levelUpSoundEffect;
window.loseSoundEffect = loseSoundEffect;
window.hitSoundEffect = hitSoundEffect;
window.winSoundEffect = winSoundEffect;
window.collectSoundEffect = collectSoundEffect;
window.updateGlobalVolume = updateGlobalVolume;