// Main function to initialize and manage the Spicetify app extension
async function main() {
    // Continuously check until the Spicetify Player and audio data APIs are available
    while (!Spicetify?.Player?.addEventListener || !Spicetify?.getAudioData) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms before checking again
    }

    console.log("[CAT-JAM] Extension loaded."); // Log successful load

    let audioData; // Initialize audio data variable

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

    try {
        const targetElementSelector = '.main-nowPlayingBar-right'; // Selector for the target element where the video will be inserted
        const targetElement = await waitForElement(targetElementSelector); // Wait until the target element is available

        // Remove any existing video element to avoid duplicates
        const existingVideo = document.getElementById('custom-video');
        if (existingVideo) {
            existingVideo.remove();
        }

        // Create a new video element to be inserted
        const videoURL = 'https://github.com/BlafKing/spicetify-cat-jam-synced/raw/main/src/resources/catjam.webm';
        const videoElement = document.createElement('video');
        videoElement.setAttribute('loop', 'true'); // Video loops continuously
        videoElement.setAttribute('autoplay', 'true'); // Video starts automatically
        videoElement.setAttribute('muted', 'true'); // Video is muted
        videoElement.setAttribute('style', 'width: 65px; height: 65px;');
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

    // Function to adjust the video playback rate based on the current track's BPM
    async function getPlaybackRate(audioData) {
        if (audioData && audioData.track.tempo) {
            const videoDefaultBPM = 135.48; // Default BPM of the video
            let trackBPM = audioData.track.tempo; // BPM of the current track
            const playbackRate = trackBPM / videoDefaultBPM; // Calculate playback rate

            console.log("[CAT-JAM] Track BPM:", trackBPM)
            console.log("[CAT-JAM] Cat jam synchronized, playback rate set to:", playbackRate)

            return playbackRate; // Return the calculated playback rate
        } else {
            console.warn("[CAT-JAM] BPM data not available for this track, cat will not be jamming accurately :(");
            return 1; // Return default playback rate if BPM data is not available
        }
    }
    
    // Function that fetches audio data from "wg://audio-attributes/v1/audio-analysis/" with retry handling
    async function fetchAudioData(retryDelay = 200, maxRetries = 10) {
        try {
            audioData = await Spicetify.getAudioData();
            return audioData;
        } catch (error) {
            if (typeof error === "object" && error !== null && 'message' in error) {
                const message = error.message;
                
                if (message.includes("Cannot read properties of undefined") && maxRetries > 0) {
                    console.log("[CAT-JAM] Retrying to fetch audio data...");
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    return fetchAudioData(retryDelay, maxRetries - 1); // Retry fetching audio data
                }
            } else {
                console.warn(`[CAT-JAM] Error fetching audio data: ${error}`);
            }
            return null; // Return default playback rate on failure
        }
    }

    // Function to synchronize video playback timing with the music's beats
    async function syncTiming(audioData, startTime, progress) {
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

    Spicetify.Player.addEventListener("onplaypause", async () => {
        const startTime = performance.now();
        let progress = Spicetify.Player.getProgress();
        lastProgress = progress;
        syncTiming(audioData, startTime, progress); // Synchronize video timing with the current progress
    });
    
    let lastProgress = 0; // Initialize last known progress
    Spicetify.Player.addEventListener("onprogress", async () => {
        const currentTime = performance.now();
        let progress = Spicetify.Player.getProgress();
        
        // Check if a significant skip in progress has occurred or if a significant time has passed
        if (Math.abs(progress - lastProgress) >= 500) {
            syncTiming(audioData, currentTime, progress); // Synchronize video timing again
        }
        lastProgress = progress; // Update last known progress
    });

    Spicetify.Player.addEventListener("songchange", async () => {
        const startTime = performance.now(); // Record the start time for the operation
        lastProgress = Spicetify.Player.getProgress();

        const videoElement = document.getElementById('catjam-webm')as HTMLVideoElement;
        if (videoElement) {
            audioData = await fetchAudioData(); // Fetch current audio data
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
