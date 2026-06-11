export const bgMusic = new Audio('./assets/music/town.wav');
bgMusic.loop = true;
bgMusic.volume = 0.5;

export function playMusic() {
    bgMusic.play();
}

export function stopMusic() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
}