(async function() {
        while (!Spicetify.React || !Spicetify.ReactDOM) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        var catDjam = (() => {
  // src/app.tsx
  async function main() {
    var _a;
    while (!((_a = Spicetify == null ? void 0 : Spicetify.Player) == null ? void 0 : _a.addEventListener) || !(Spicetify == null ? void 0 : Spicetify.getAudioData)) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log("[CAT-JAM] Extension loaded.");
    let audioData;
    async function waitForElement(selector, maxAttempts = 50, interval = 100) {
      let attempts = 0;
      while (attempts < maxAttempts) {
        const element = document.querySelector(selector);
        if (element) {
          return element;
        }
        await new Promise((resolve) => setTimeout(resolve, interval));
        attempts++;
      }
      throw new Error(`Element ${selector} not found after ${maxAttempts} attempts.`);
    }
    try {
      const targetElementSelector = ".main-nowPlayingBar-right";
      const targetElement = await waitForElement(targetElementSelector);
      const existingVideo = document.getElementById("custom-video");
      if (existingVideo) {
        existingVideo.remove();
      }
      const videoURL = "https://github.com/BlafKing/spicetify-cat-jam-synced/raw/main/src/resources/catjam.webm";
      const videoElement = document.createElement("video");
      videoElement.setAttribute("loop", "true");
      videoElement.setAttribute("autoplay", "true");
      videoElement.setAttribute("muted", "true");
      videoElement.setAttribute("style", "width: 65px; height: 65px;");
      videoElement.src = videoURL;
      videoElement.id = "catjam-webm";
      audioData = await fetchAudioData();
      videoElement.playbackRate = await getPlaybackRate(audioData);
      if (targetElement.firstChild) {
        targetElement.insertBefore(videoElement, targetElement.firstChild);
      } else {
        targetElement.appendChild(videoElement);
      }
      if (Spicetify.Player.isPlaying()) {
        videoElement.play();
      } else {
        videoElement.pause();
      }
    } catch (error) {
      console.error("[CAT-JAM] Could not create cat-jam video element: ", error);
    }
    async function getPlaybackRate(audioData2) {
      if (audioData2 && audioData2.track.tempo) {
        const videoDefaultBPM = 135.48;
        let trackBPM = audioData2.track.tempo;
        const playbackRate = trackBPM / videoDefaultBPM;
        console.log("[CAT-JAM] Track BPM:", trackBPM);
        console.log("[CAT-JAM] Cat jam synchronized, playback rate set to:", playbackRate);
        return playbackRate;
      } else {
        console.warn("[CAT-JAM] BPM data not available for this track, cat will not be jamming accurately :(");
        return 1;
      }
    }
    async function fetchAudioData(retryDelay = 200, maxRetries = 10) {
      try {
        audioData = await Spicetify.getAudioData();
        console.log(audioData);
        return audioData;
      } catch (error) {
        if (typeof error === "object" && error !== null && "message" in error) {
          const message = error.message;
          if (message.includes("Cannot read properties of undefined") && maxRetries > 0) {
            console.log("[CAT-JAM] Retrying to fetch audio data...");
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            return fetchAudioData(retryDelay, maxRetries - 1);
          }
        } else {
          console.warn(`[CAT-JAM] Error fetching audio data: ${error}`);
        }
        return null;
      }
    }
    async function syncTiming(audioData2, startTime, progress) {
      const videoElement = document.getElementById("catjam-webm");
      if (videoElement) {
        if (Spicetify.Player.isPlaying()) {
          progress = progress / 1e3;
          if (audioData2 && audioData2.beats) {
            const upcomingBeat = audioData2.beats.find((beat) => beat.start > progress);
            if (upcomingBeat) {
              const operationTime = performance.now() - startTime;
              const delayUntilNextBeat = Math.max(0, (upcomingBeat.start - progress) * 1e3 - operationTime);
              setTimeout(() => {
                videoElement.currentTime = 0;
                videoElement.play();
              }, delayUntilNextBeat);
            } else {
              videoElement.currentTime = 0;
              videoElement.play();
            }
            console.log("[CAT-JAM] Resynchronized to nearest beat");
          } else {
            videoElement.currentTime = 0;
            videoElement.play();
          }
        } else {
          videoElement.pause();
        }
      } else {
        console.error("[CAT-JAM] Video element not found.");
      }
    }
    Spicetify.Player.addEventListener("onplaypause", async () => {
      const startTime = performance.now();
      let progress = Spicetify.Player.getProgress();
      lastProgress = progress;
      syncTiming(audioData, startTime, progress);
    });
    let lastProgress = 0;
    Spicetify.Player.addEventListener("onprogress", async () => {
      const currentTime = performance.now();
      let progress = Spicetify.Player.getProgress();
      if (Math.abs(progress - lastProgress) >= 500) {
        syncTiming(audioData, currentTime, progress);
      }
      lastProgress = progress;
    });
    Spicetify.Player.addEventListener("songchange", async () => {
      const startTime = performance.now();
      lastProgress = Spicetify.Player.getProgress();
      const videoElement = document.getElementById("catjam-webm");
      if (videoElement) {
        audioData = await fetchAudioData();
        if (audioData && audioData.beats && audioData.beats.length > 0) {
          const firstBeatStart = audioData.beats[0].start;
          videoElement.playbackRate = await getPlaybackRate(audioData);
          const operationTime = performance.now() - startTime;
          const delayUntilFirstBeat = Math.max(0, firstBeatStart * 1e3 - operationTime);
          setTimeout(() => {
            videoElement.currentTime = 0;
            videoElement.play();
          }, delayUntilFirstBeat);
        } else {
          videoElement.playbackRate = await getPlaybackRate(audioData);
          videoElement.currentTime = 0;
          videoElement.play();
        }
      } else {
        console.error("[CAT-JAM] Video element not found.");
      }
    });
  }
  var app_default = main;

  // ../AppData/Local/Temp/spicetify-creator/index.jsx
  (async () => {
    await app_default();
  })();
})();

      })();