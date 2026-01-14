let currentSong = new Audio();
let songs = [];
let currFolder = "";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

async function getSongs(folder) {
    currFolder = folder;
    const res = await fetch(`${folder}/info.json`);
    songs = await res.json();

    const ul = document.querySelector(".songList ul");
    ul.innerHTML = "";

    songs.forEach(song => {
        ul.innerHTML += `
        <li>
            <img class="invert" width="34" src="img/music.svg">
            <div class="info">
                <div>${song}</div>
                <div>Priyanshu</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg">
            </div>
        </li>`;
    });

    Array.from(ul.children).forEach(li => {
        li.addEventListener("click", () => {
            playMusic(li.querySelector(".info div").innerText.trim());
        });
    });

    return songs;
}

function playMusic(track, pause = false) {
    currentSong.src = `${currFolder}/${encodeURIComponent(track)}`;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerText = track;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

async function displayAlbums() {
    const res = await fetch("songs/albums.json");
    const albums = await res.json();

    const container = document.querySelector(".cardContainer");
    container.innerHTML = "";

    albums.forEach(album => {
        container.innerHTML += `
        <div class="card" data-folder="${album.folder}">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M5 20V4L19 12L5 20Z" fill="#000"/>
                </svg>
            </div>
            <img src="songs/${album.folder}/cover.jpg">
            <h2>${album.title}</h2>
            <p>${album.description}</p>
        </div>`;
    });

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            await getSongs(`songs/${card.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs("songs/cs");
    playMusic(songs[0], true);
    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        const percent = (currentSong.currentTime / currentSong.duration) * 100 || 0;
        document.querySelector(".circle").style.left = percent + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        const rect = e.target.getBoundingClientRect();
        const percent = (e.offsetX / rect.width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        const current = decodeURIComponent(currentSong.src.split("/").pop());
        const idx = songs.indexOf(current);
        if (idx > 0) playMusic(songs[idx - 1]);
    });

    next.addEventListener("click", () => {
        const current = decodeURIComponent(currentSong.src.split("/").pop());
        const idx = songs.indexOf(current);
        if (idx < songs.length - 1) playMusic(songs[idx + 1]);
    });

    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume img").src = "img/volume.svg";
        }
    });

    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
