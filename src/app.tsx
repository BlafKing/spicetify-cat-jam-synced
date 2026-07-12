import { SettingsSection } from "spcr-settings";
const settings = new SettingsSection("Cat-Jam Settings", "catjam-settings");
let audioData;
const audioDataCacheKey = "catjam-audio-data-cache";
const deezerMisses = new Map();
let didLogAudioFeaturesFailure = false;

function withTimeout(promise, timeout = 4000) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Request timed out")), timeout);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

function normalizeForMatch(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function cleanTitle(title) {
    return String(title || "").replace(/\s*[\[(].*?[\])]/g, "").replace(/\s+(feat\.?|ft\.?|with)\s+.*/i, "").trim();
}

function getTrackId() {
    const item = Spicetify.Player.data?.item;
    return item?.id || item?.uri?.split(":").pop();
}

function getCachedAudioData(trackId) {
    try {
        return JSON.parse(localStorage.getItem(audioDataCacheKey) || "{}")[trackId] || null;
    } catch (error) {
        return null;
    }
}

function cacheAudioData(trackId, data) {
    try {
        const cache = JSON.parse(localStorage.getItem(audioDataCacheKey) || "{}");
        cache[trackId] = data;
        while (Object.keys(cache).length > 100) {
            delete cache[Object.keys(cache)[0]];
        }
        localStorage.setItem(audioDataCacheKey, JSON.stringify(cache));
    } catch (error) {
        // Ignore unavailable or full localStorage.
    }
}

async function getDeezerAudioData() {
    const item = Spicetify.Player.data?.item;
    const metadata = item?.metadata || {};
    const artist = metadata.artist_name || metadata.artist || item?.artists?.[0]?.name || "";
    const title = cleanTitle(metadata.title || item?.name || "");
    let deezerTrack;

    if (metadata.isrc) {
        try {
            const isrcTrack = await withTimeout(Spicetify.CosmosAsync.get("https://api.deezer.com/track/isrc:" + encodeURIComponent(metadata.isrc)));
            if (isrcTrack?.id) {
                deezerTrack = isrcTrack;
            }
        } catch (error) {
            // ISRC not on Deezer or lookup failed; fall through to title search.
        }
    }
    if (!deezerTrack) {
        if (!artist || !title) {
            return null;
        }
        const findTrack = (results) => results?.data?.find(track => {
            const deezerTitle = normalizeForMatch(track.title);
            const deezerArtist = normalizeForMatch(track.artist?.name);
            const cleanDeezerTitle = normalizeForMatch(cleanTitle(track.title));
            const normalizedTitle = normalizeForMatch(title);
            const normalizedArtist = normalizeForMatch(artist);
            if (!normalizedTitle || !normalizedArtist || !cleanDeezerTitle || !deezerArtist) {
                return false;
            }
            return (deezerTitle.includes(normalizedTitle) || normalizedTitle.includes(cleanDeezerTitle)) &&
                (deezerArtist.includes(normalizedArtist) || normalizedArtist.includes(deezerArtist));
        });
        const fieldedQuery = `artist:"${artist}" track:"${title}"`;
        let results = await withTimeout(Spicetify.CosmosAsync.get("https://api.deezer.com/search?q=" + encodeURIComponent(fieldedQuery)));
        deezerTrack = findTrack(results);
        if (!deezerTrack) {
            results = await withTimeout(Spicetify.CosmosAsync.get("https://api.deezer.com/search?q=" + encodeURIComponent(`${artist} ${title}`)));
            deezerTrack = findTrack(results);
        }
    }

    if (!deezerTrack?.id) {
        return null;
    }
    const details = await withTimeout(Spicetify.CosmosAsync.get("https://api.deezer.com/track/" + deezerTrack.id));
    if (!details?.bpm || details.bpm <= 0) {
        return null;
    }
    const duration = Number(details.duration) * 1000;
    return { track: { tempo: details.bpm, duration_ms: duration || item?.duration?.milliseconds, gain: details.gain } };
}

// Function to adjust the video playback rate based on the current track's BPM
async function getPlaybackRate(audioData) {
    let videoDefaultBPM = Number(settings.getFieldValue("catjam-webm-bpm"));
    console.log(videoDefaultBPM);
    if (!videoDefaultBPM) {
        videoDefaultBPM = 135.48;
    }

    if (audioData && audioData?.track) {
        let trackBPM = audioData?.track?.tempo  // BPM of the current track
        let bpmMethod = settings.getFieldValue("catjam-webm-bpm-method");
        // Deezer can report double-time for quiet, sparse tracks; use the felt pulse instead.
        if (trackBPM >= 110 && audioData?.track?.gain < -12) {
            trackBPM /= 2;
        }
        let bpmToUse = trackBPM;
        if (bpmMethod !== "Track BPM") {
            console.log("[CAT-JAM] Using danceability, energy and track BPM to calculate better BPM");
            bpmToUse = await getBetterBPM(trackBPM);
            console.log("[CAT-JAM] Better BPM:", bpmToUse)
        }
        let playbackRate = 1;
        if (bpmToUse) {
            playbackRate = bpmToUse / videoDefaultBPM;
        }
        console.log("[CAT-JAM] Track BPM:", trackBPM)
        console.log("[CAT-JAM] Cat jam synchronized, playback rate set to:", playbackRate)

        return playbackRate; // Return the calculated playback rate
    } else {
        console.warn("[CAT-JAM] BPM data not available for this track, cat will not be jamming accurately :(");
        return 1; // Return default playback rate if BPM data is not available
    }
}

// Function that fetches audio data from Spotify, then Deezer when audio analysis is unavailable
async function fetchAudioData() {
    const trackId = getTrackId();
    try {
        if (Spicetify.getAudioData) {
            const spotifyAudioData = await withTimeout(Spicetify.getAudioData());
            if (spotifyAudioData) {
                return spotifyAudioData;
            }
        }
    } catch (error) {
        // Spotify's audio-analysis endpoint is currently unavailable; try Deezer below.
    }
    if (!trackId) {
        return null;
    }
    const cachedAudioData = getCachedAudioData(trackId);
    if (cachedAudioData) {
        return cachedAudioData;
    }
    if (deezerMisses.has(trackId)) {
        return null;
    }
    try {
        const deezerAudioData = await getDeezerAudioData();
        if (deezerAudioData) {
            cacheAudioData(trackId, deezerAudioData);
            return deezerAudioData;
        }
    } catch (error) {
        console.debug("[CAT-JAM] Deezer BPM lookup failed:", error);
    }
    deezerMisses.set(trackId, true);
    return null;
}

// Function to synchronize video playback timing with the music's beats
async function syncTiming(startTime, progress) {
    const videoElement = document.getElementById('catjam-webm') as HTMLVideoElement;
    if (videoElement) {
        if (Spicetify.Player.isPlaying()) {
            progress = progress / 1000; // Convert progress from milliseconds to seconds

            if (audioData && audioData.beats) {
                // Find the nearest upcoming beat based on current progress
                const upcomingBeat = audioData.beats.find(beat => beat.start > progress);
                if (upcomingBeat) {
                    const operationTime = performance.now() - startTime; // Time taken for the operation
                    const delayUntilNextBeat = Math.max(0, (upcomingBeat.start - progress) * 1000 - operationTime); // Calculate delay until the next beat
                    
                    setTimeout(() => {
                        videoElement.currentTime = 0; // Reset video to start
                        videoElement.play(); // Play the video
                    }, delayUntilNextBeat);
                } else {
                    videoElement.currentTime = 0; // Reset video to start if no upcoming beat
                    videoElement.play();
                }
                console.log("[CAT-JAM] Resynchronized to nearest beat");
            } else {
                videoElement.currentTime = 0; // Play the video without delay if no beat information
                videoElement.play();
            }
        } else {
            videoElement.pause(); // Pause the video if Spotify is not playing
        }
    } else {
        console.error("[CAT-JAM] Video element not found.");
    }
}

// Function to wait for a specific DOM element to appear before proceeding
async function waitForElement(selector, maxAttempts = 50, interval = 100) {
    let attempts = 0;
    while (attempts < maxAttempts) {
        const element = document.querySelector(selector); // Attempt to find the element
        if (element) {
            return element; // Return the element if found
        }
        await new Promise(resolve => setTimeout(resolve, interval)); // Wait for a specified interval before trying again
        attempts++;
    }
    throw new Error(`Element ${selector} not found after ${maxAttempts} attempts.`); // Throw error if element not found within attempts
}

// Function that creates the WebM video and sets initial BPM and play state
async function createWebMVideo() {
    try {
        const bottomPlayerClass = '.main-nowPlayingBar-right' // Selector for the bottom player
        const leftLibraryClass = '.main-yourLibraryX-libraryItemContainer' // Selector for the left library
        let leftLibraryVideoSize = Number(settings.getFieldValue("catjam-webm-position-left-size")); // Get the left library video size
        if (!leftLibraryVideoSize) {
            leftLibraryVideoSize = 100; // Default size of the video on the left library
        }
        const bottomPlayerStyle = 'width: 65px; height: 65px;'; // Style for the bottom player video
        let leftLibraryStyle = `width: ${leftLibraryVideoSize}%; max-width: 300px; height: auto; max-height: 100%; position: absolute; bottom: 0; pointer-events: none; z-index: 1;` // Style for the left library video
        let selectedPosition = settings.getFieldValue("catjam-webm-position"); // Get the selected position for the video

        let targetElementSelector = selectedPosition === 'Bottom (Player)' ? bottomPlayerClass : leftLibraryClass;
        let elementStyles = selectedPosition === 'Bottom (Player)' ? bottomPlayerStyle : leftLibraryStyle;
        const targetElement = await waitForElement(targetElementSelector); // Wait until the target element is available

        // Remove any existing video element to avoid duplicates
        const existingVideo = document.getElementById('catjam-webm');
        if (existingVideo) {
            existingVideo.remove();
        }
        
        //
        let videoURL = String(settings.getFieldValue("catjam-webm-link"));
        
        if (!videoURL) {
            videoURL = "https://github.com/BlafKing/spicetify-cat-jam-synced/raw/main/src/resources/catjam.webm"
        }

        // Create a new video element to be inserted
        const videoElement = document.createElement('video');
        videoElement.setAttribute('loop', 'true'); // Video loops continuously
        videoElement.setAttribute('autoplay', 'true'); // Video starts automatically
        videoElement.setAttribute('muted', 'true'); // Video is muted
        videoElement.setAttribute('style', elementStyles);
        videoElement.src = videoURL; // Set the source of the video
        videoElement.id = 'catjam-webm'; // Assign an ID to the video element

        audioData = await fetchAudioData(); // Fetch audio data
        videoElement.playbackRate = await getPlaybackRate(audioData); // Adjust playback rate based on the song's BPM
        // Insert the video element into the target element in the DOM
        if (targetElement.firstChild) {
            targetElement.insertBefore(videoElement, targetElement.firstChild);
        } else {
            targetElement.appendChild(videoElement);
        }
        // Control video playback based on whether Spotify is currently playing music
        if (Spicetify.Player.isPlaying()) {
            videoElement.play();
        } else {
            videoElement.pause();
        }
    } catch (error) {
        console.error("[CAT-JAM] Could not create cat-jam video element: ", error);
    }
}

async function getBetterBPM(currentBPM) {
    let betterBPM = currentBPM
    try {
        const currentSongDataUri = Spicetify.Player.data?.item?.uri;
        if (!currentSongDataUri) {
            return currentBPM;
        }
        const uriFinal = currentSongDataUri.split(":")[2];
        const res = await withTimeout(Spicetify.CosmosAsync.get("https://api.spotify.com/v1/audio-features/" + uriFinal));
        const danceability = Math.round(100 * res.danceability);
        const energy = Math.round(100 * res.energy);
        betterBPM = calculateBetterBPM(danceability, energy, currentBPM)
    } catch (error) {
        if (!didLogAudioFeaturesFailure) {
            console.debug("[CAT-JAM] Could not get audio features; using track BPM:", error);
            didLogAudioFeaturesFailure = true;
        }
    } finally {
        return betterBPM;
    }
}

// Function to calculate a better BPM based on danceability and energy
function calculateBetterBPM(danceability, energy, currentBPM) {
    let danceabilityWeight = 0.9;
    let energyWeight = 0.6;
    let bpmWeight = 0.6;
    const energyTreshold = 0.5;
    let danceabilityTreshold = 0.5;
    const maxBPM = 100;
    let bpmThreshold = 0.8; // 80 bpm

    const normalizedBPM = currentBPM / 100;
    const normalizedDanceability = danceability / 100;
    const normalizedEnergy = energy / 100;

    if (normalizedDanceability < danceabilityTreshold){
        danceabilityWeight *= normalizedDanceability;
    }

    if (normalizedEnergy < energyTreshold){
        energyWeight *= normalizedEnergy;
    }
    // increase bpm weight if the song is slow
    if (normalizedBPM < bpmThreshold){
        bpmWeight = 0.9;
    }

    const weightedAverage = (normalizedDanceability * danceabilityWeight + normalizedEnergy * energyWeight + normalizedBPM * bpmWeight) / (1 - danceabilityWeight + 1 - energyWeight + bpmWeight);
    let betterBPM = weightedAverage * maxBPM;

    console.log({danceabilityWeight, energyWeight, currentBPM, weightedAverage, betterBPM, bpmWeight})

    const betterBPMForFasterSongs = settings.getFieldValue("catjam-webm-bpm-method-faster-songs") !== "Track BPM";
    if (betterBPM > currentBPM) {
        if (betterBPMForFasterSongs){
            betterBPM = (betterBPM + currentBPM) / 2;
        } else {
            betterBPM = currentBPM;
        }
    }

    if (betterBPM < currentBPM) {
        betterBPM = Math.max(betterBPM, 70);
    }

    return betterBPM;
}

// Main function to initialize and manage the Spicetify app extension
async function main() {
    // Continuously check until the Spicetify Player and audio data APIs are available
    while (!Spicetify?.Player?.addEventListener) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms before checking again
    }
    console.log("[CAT-JAM] Extension loaded.");
    // Create Settings UI
    settings.addInput("catjam-webm-link", "Custom webM video URL (Link does not work if no video shows)", "");
    settings.addInput("catjam-webm-bpm", "Custom default BPM of webM video (Example: 135.48)", "");
    settings.addDropDown("catjam-webm-position", "Position where webM video should be rendered", ['Bottom (Player)', 'Left (Library)'], 0);
    settings.addDropDown("catjam-webm-bpm-method", "Method to calculate better BPM for slower songs", ['Track BPM', 'Danceability, Energy and Track BPM'], 0);
    settings.addDropDown("catjam-webm-bpm-method-faster-songs", "Method to calculate better BPM for faster songs", ['Track BPM', 'Danceability, Energy and Track BPM'], 0);
    settings.addInput("catjam-webm-position-left-size", "Size of webM video on the left library (Only works for left library, Default: 100)", "");
    settings.addButton("catjam-reload", "Reload custom values", "Save and reload", () => {createWebMVideo();});
    settings.pushSettings();

    // Create initial WebM video
    createWebMVideo();

    Spicetify.Player.addEventListener("onplaypause", async () => {
        const startTime = performance.now();
        let progress = Spicetify.Player.getProgress();
        lastProgress = progress;
        syncTiming(startTime, progress); // Synchronize video timing with the current progress
    });
    
    let lastProgress = 0; // Initialize last known progress
    Spicetify.Player.addEventListener("onprogress", async () => {
        const currentTime = performance.now();
        let progress = Spicetify.Player.getProgress();
        
        // Check if a significant skip in progress has occurred or if a significant time has passed
        if (Math.abs(progress - lastProgress) >= 500) {
            syncTiming(currentTime, progress); // Synchronize video timing again
        }
        lastProgress = progress; // Update last known progress
    });

    Spicetify.Player.addEventListener("songchange", async () => {
        const startTime = performance.now(); // Record the start time for the operation
        lastProgress = Spicetify.Player.getProgress();
        audioData = null; // Never reuse a previous song's tempo during player-bar re-renders.

        let videoElement = document.getElementById('catjam-webm')as HTMLVideoElement;
        if (!videoElement) {
            await createWebMVideo();
            videoElement = document.getElementById('catjam-webm')as HTMLVideoElement;
        }
        if (videoElement) {
            audioData = await fetchAudioData(); // Fetch current audio data
            console.log("[CAT-JAM] Audio data fetched:", audioData);
            if (audioData && audioData.beats && audioData.beats.length > 0) {
                const firstBeatStart = audioData.beats[0].start; // Get start time of the first beat
                
                // Adjust video playback rate based on the song's BPM
                videoElement.playbackRate = await getPlaybackRate(audioData);
    
                const operationTime = performance.now() - startTime; // Calculate time taken for operations
                const delayUntilFirstBeat = Math.max(0, firstBeatStart * 1000 - operationTime); // Calculate delay until the first beat
    
                setTimeout(() => {
                    videoElement.currentTime = 0; // Ensure video starts from the beginning
                    videoElement.play(); // Play the video
                }, delayUntilFirstBeat);
            } else {
                videoElement.playbackRate = await getPlaybackRate(audioData); // Set playback rate even if no beat information
                videoElement.currentTime = 0; // Ensure video starts from the beginning
                videoElement.play(); // Play the video
            }
        } else {
            console.error("[CAT-JAM] Video element not found.");
        }
    });
}

export default main; // Export the main function for use in the application
