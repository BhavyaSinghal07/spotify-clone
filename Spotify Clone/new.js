let currentSong = new Audio(); // Global variable to hold the currently playing song
let songs = []; // Array to hold the list of songs
let currfolder; // Variable to keep track of the current folder

// Function to convert seconds to minutes:seconds format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Function to fetch songs from a folder
async function getSongs(folder) {
    currfolder = folder;
    const response = await fetch(`http://127.0.0.1:5500/${folder}/`);
    const html = await response.text();
    const div = document.createElement("div");
    div.innerHTML = html;
    const as = div.getElementsByTagName("a");
    
    songs = Array.from(as)
        .filter(element => element.href.endsWith(".mp3"))
        .map(element => element.href.split(`/${folder}/`)[1].replaceAll("%20", " "));

    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = songs.map(song => `
        <li>
            <img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${song}</div>
                <div>Bhavya</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="">
            </div>
        </li>`).join("");

    // Attach event listener to each song
    songUL.querySelectorAll("li").forEach((li, index) => {
        li.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });

    return songs;
}

// Function to play a selected music track
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentSong.play();
       play.src = "Spotify Clone/songs/pause.svg";

    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// Function to display albums on the page
async function displayAlbums() {
    const response = await fetch("http://127.0.0.1:5500/songs/");
    const html = await response.text();
    const div = document.createElement("div");
    div.innerHTML = html;
    const anchors = Array.from(div.getElementsByTagName("a"));

    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = anchors
        .filter(anchor => anchor.href.includes("/songs") && !anchor.href.includes(".htaccess"))
        .map(async (anchor) => {
            const folder = anchor.href.split("/").slice(-2)[0];
            const infoResponse = await fetch(`http://127.0.0.1:5500./songs/${folder}/info.json`);
            const info = await infoResponse.json();
            return `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 100 100"
                            xmlns:xlink="http://www.w3.org/1999/xlink" role="img"
                            style="background-color: #00ff00; border-radius: 50%; padding: 6px;">
                            <svg xmlns="http://www.w3.org/2000/svg" x="15%" y="14%" width="80" height="80"
                                viewBox="0 0 24 24" fill="none" class="injected-svg"
                                data-src="/icons/play-stroke-sharp.svg" color="#000000"
                                style="transform: translate(-50%, -50%);">
                                <path d="M5 20V4L19 12L5 20Z" fill="#000000" stroke="#000000" stroke-width="1.5"
                                    stroke-linejoin="round"></path>
                            </svg>
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>`;
        }).join("");

    // Load playlist when card is clicked
    cardContainer.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            const folder = card.getAttribute("data-folder");
            songs = await getSongs(`songs/${folder}`);
            playMusic(songs[0]);
        });
    });
}

// Main function to initialize the application
async function main() {
    await getSongs("songs/dwf");
    playMusic(songs[0], true);
    await displayAlbums();

    // Add event listeners
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
           play.src = "Spotify Clone/songs/pause.svg";

        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        currentSong.pause();
        const index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        const index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });
}

main().catch(console.error);
