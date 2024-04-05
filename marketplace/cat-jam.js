(async function() {
        while (!Spicetify.React || !Spicetify.ReactDOM) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        var catDjam = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // external-global-plugin:react
  var require_react = __commonJS({
    "external-global-plugin:react"(exports, module) {
      module.exports = Spicetify.React;
    }
  });

  // external-global-plugin:react-dom
  var require_react_dom = __commonJS({
    "external-global-plugin:react-dom"(exports, module) {
      module.exports = Spicetify.ReactDOM;
    }
  });

  // node_modules/spcr-settings/settingsSection.tsx
  var import_react = __toESM(require_react());
  var import_react_dom = __toESM(require_react_dom());
  var SettingsSection = class {
    constructor(name, settingsId, initialSettingsFields = {}) {
      this.name = name;
      this.settingsId = settingsId;
      this.initialSettingsFields = initialSettingsFields;
      this.settingsFields = this.initialSettingsFields;
      this.setRerender = null;
      this.pushSettings = async () => {
        Object.entries(this.settingsFields).forEach(([nameId, field]) => {
          if (field.type !== "button" && this.getFieldValue(nameId) === void 0) {
            this.setFieldValue(nameId, field.defaultValue);
          }
        });
        while (!Spicetify?.Platform?.History?.listen) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        if (this.stopHistoryListener)
          this.stopHistoryListener();
        this.stopHistoryListener = Spicetify.Platform.History.listen((e) => {
          if (e.pathname === "/preferences") {
            this.render();
          }
        });
        if (Spicetify.Platform.History.location.pathname === "/preferences") {
          await this.render();
        }
      };
      this.rerender = () => {
        if (this.setRerender) {
          this.setRerender(Math.random());
        }
      };
      this.render = async () => {
        while (!document.getElementById("desktop.settings.selectLanguage")) {
          if (Spicetify.Platform.History.location.pathname !== "/preferences")
            return;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        const allSettingsContainer = document.querySelector(
          ".main-view-container__scroll-node-child main div"
        );
        if (!allSettingsContainer)
          return console.error("[spcr-settings] settings container not found");
        let pluginSettingsContainer = Array.from(
          allSettingsContainer.children
        ).find((child) => child.id === this.settingsId);
        if (!pluginSettingsContainer) {
          pluginSettingsContainer = document.createElement("div");
          pluginSettingsContainer.id = this.settingsId;
          allSettingsContainer.appendChild(pluginSettingsContainer);
        } else {
          console.log(pluginSettingsContainer);
        }
        import_react_dom.default.render(/* @__PURE__ */ import_react.default.createElement(this.FieldsContainer, null), pluginSettingsContainer);
      };
      this.addButton = (nameId, description, value, onClick, events) => {
        this.settingsFields[nameId] = {
          type: "button",
          description,
          value,
          events: {
            onClick,
            ...events
          }
        };
      };
      this.addInput = (nameId, description, defaultValue, onChange, inputType, events) => {
        this.settingsFields[nameId] = {
          type: "input",
          description,
          defaultValue,
          inputType,
          events: {
            onChange,
            ...events
          }
        };
      };
      this.addHidden = (nameId, defaultValue) => {
        this.settingsFields[nameId] = {
          type: "hidden",
          defaultValue
        };
      };
      this.addToggle = (nameId, description, defaultValue, onChange, events) => {
        this.settingsFields[nameId] = {
          type: "toggle",
          description,
          defaultValue,
          events: {
            onChange,
            ...events
          }
        };
      };
      this.addDropDown = (nameId, description, options, defaultIndex, onSelect, events) => {
        this.settingsFields[nameId] = {
          type: "dropdown",
          description,
          defaultValue: options[defaultIndex],
          options,
          events: {
            onSelect,
            ...events
          }
        };
      };
      this.getFieldValue = (nameId) => {
        return JSON.parse(
          Spicetify.LocalStorage.get(`${this.settingsId}.${nameId}`) || "{}"
        )?.value;
      };
      this.setFieldValue = (nameId, newValue) => {
        Spicetify.LocalStorage.set(
          `${this.settingsId}.${nameId}`,
          JSON.stringify({ value: newValue })
        );
      };
      this.FieldsContainer = () => {
        const [rerender, setRerender] = (0, import_react.useState)(0);
        this.setRerender = setRerender;
        return /* @__PURE__ */ import_react.default.createElement("div", {
          className: "x-settings-section",
          key: rerender
        }, /* @__PURE__ */ import_react.default.createElement("h2", {
          className: "TypeElement-cello-textBase-type"
        }, this.name), Object.entries(this.settingsFields).map(([nameId, field]) => {
          return /* @__PURE__ */ import_react.default.createElement(this.Field, {
            nameId,
            field
          });
        }));
      };
      this.Field = (props) => {
        const id = `${this.settingsId}.${props.nameId}`;
        let defaultStateValue;
        if (props.field.type === "button") {
          defaultStateValue = props.field.value;
        } else {
          defaultStateValue = this.getFieldValue(props.nameId);
        }
        if (props.field.type === "hidden") {
          return /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null);
        }
        const [value, setValueState] = (0, import_react.useState)(defaultStateValue);
        const setValue = (newValue) => {
          if (newValue !== void 0) {
            setValueState(newValue);
            this.setFieldValue(props.nameId, newValue);
          }
        };
        return /* @__PURE__ */ import_react.default.createElement("div", {
          className: "x-settings-row"
        }, /* @__PURE__ */ import_react.default.createElement("div", {
          className: "x-settings-firstColumn"
        }, /* @__PURE__ */ import_react.default.createElement("label", {
          className: "TypeElement-viola-textSubdued-type",
          htmlFor: id
        }, props.field.description || "")), /* @__PURE__ */ import_react.default.createElement("div", {
          className: "x-settings-secondColumn"
        }, props.field.type === "input" ? /* @__PURE__ */ import_react.default.createElement("input", {
          className: "x-settings-input",
          id,
          dir: "ltr",
          value,
          type: props.field.inputType || "text",
          ...props.field.events,
          onChange: (e) => {
            setValue(e.currentTarget.value);
            const onChange = props.field.events?.onChange;
            if (onChange)
              onChange(e);
          }
        }) : props.field.type === "button" ? /* @__PURE__ */ import_react.default.createElement("span", null, /* @__PURE__ */ import_react.default.createElement("button", {
          id,
          className: "Button-sc-y0gtbx-0 Button-small-buttonSecondary-useBrowserDefaultFocusStyle x-settings-button",
          ...props.field.events,
          onClick: (e) => {
            setValue();
            const onClick = props.field.events?.onClick;
            if (onClick)
              onClick(e);
          },
          type: "button"
        }, value)) : props.field.type === "toggle" ? /* @__PURE__ */ import_react.default.createElement("label", {
          className: "x-settings-secondColumn x-toggle-wrapper"
        }, /* @__PURE__ */ import_react.default.createElement("input", {
          id,
          className: "x-toggle-input",
          type: "checkbox",
          checked: value,
          ...props.field.events,
          onClick: (e) => {
            setValue(e.currentTarget.checked);
            const onClick = props.field.events?.onClick;
            if (onClick)
              onClick(e);
          }
        }), /* @__PURE__ */ import_react.default.createElement("span", {
          className: "x-toggle-indicatorWrapper"
        }, /* @__PURE__ */ import_react.default.createElement("span", {
          className: "x-toggle-indicator"
        }))) : props.field.type === "dropdown" ? /* @__PURE__ */ import_react.default.createElement("select", {
          className: "main-dropDown-dropDown",
          id,
          ...props.field.events,
          onChange: (e) => {
            setValue(
              props.field.options[e.currentTarget.selectedIndex]
            );
            const onChange = props.field.events?.onChange;
            if (onChange)
              onChange(e);
          }
        }, props.field.options.map((option, i) => {
          return /* @__PURE__ */ import_react.default.createElement("option", {
            selected: option === value,
            value: i + 1
          }, option);
        })) : /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null)));
      };
    }
  };

  // src/app.tsx
  var settings = new SettingsSection("Cat-Jam Settings", "catjam-settings");
  var audioData;
  async function getPlaybackRate(audioData2) {
    let videoDefaultBPM = Number(settings.getFieldValue("catjam-webm-bpm"));
    console.log(videoDefaultBPM);
    if (!videoDefaultBPM) {
      videoDefaultBPM = 135.48;
    }
    if (audioData2 && audioData2.track.tempo) {
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
      let audioData2 = await Spicetify.getAudioData();
      return audioData2;
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
  async function syncTiming(startTime, progress) {
    const videoElement = document.getElementById("catjam-webm");
    if (videoElement) {
      if (Spicetify.Player.isPlaying()) {
        progress = progress / 1e3;
        if (audioData && audioData.beats) {
          const upcomingBeat = audioData.beats.find((beat) => beat.start > progress);
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
  async function createWebMVideo() {
    try {
      const targetElementSelector = ".main-nowPlayingBar-right";
      const targetElement = await waitForElement(targetElementSelector);
      const existingVideo = document.getElementById("catjam-webm");
      if (existingVideo) {
        existingVideo.remove();
      }
      let videoURL = String(settings.getFieldValue("catjam-webm-link"));
      if (!videoURL) {
        videoURL = "https://github.com/BlafKing/spicetify-cat-jam-synced/raw/main/src/resources/catjam.webm";
      }
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
  }
  async function main() {
    var _a;
    while (!((_a = Spicetify == null ? void 0 : Spicetify.Player) == null ? void 0 : _a.addEventListener) || !(Spicetify == null ? void 0 : Spicetify.getAudioData)) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log("[CAT-JAM] Extension loaded.");
    let audioData2;
    settings.addInput("catjam-webm-link", "Custom webM video URL (Link does not work if no video shows)", "");
    settings.addInput("catjam-webm-bpm", "Custom default BPM of webM video (Example: 135.48)", "");
    settings.addButton("catjam-reload", "Reload custom values", "Reload", () => {
      createWebMVideo();
    });
    settings.pushSettings();
    createWebMVideo();
    Spicetify.Player.addEventListener("onplaypause", async () => {
      const startTime = performance.now();
      let progress = Spicetify.Player.getProgress();
      lastProgress = progress;
      syncTiming(startTime, progress);
    });
    let lastProgress = 0;
    Spicetify.Player.addEventListener("onprogress", async () => {
      const currentTime = performance.now();
      let progress = Spicetify.Player.getProgress();
      if (Math.abs(progress - lastProgress) >= 500) {
        syncTiming(currentTime, progress);
      }
      lastProgress = progress;
    });
    Spicetify.Player.addEventListener("songchange", async () => {
      const startTime = performance.now();
      lastProgress = Spicetify.Player.getProgress();
      const videoElement = document.getElementById("catjam-webm");
      if (videoElement) {
        audioData2 = await fetchAudioData();
        if (audioData2 && audioData2.beats && audioData2.beats.length > 0) {
          const firstBeatStart = audioData2.beats[0].start;
          videoElement.playbackRate = await getPlaybackRate(audioData2);
          const operationTime = performance.now() - startTime;
          const delayUntilFirstBeat = Math.max(0, firstBeatStart * 1e3 - operationTime);
          setTimeout(() => {
            videoElement.currentTime = 0;
            videoElement.play();
          }, delayUntilFirstBeat);
        } else {
          videoElement.playbackRate = await getPlaybackRate(audioData2);
          videoElement.currentTime = 0;
          videoElement.play();
        }
      } else {
        console.error("[CAT-JAM] Video element not found.");
      }
    });
  }
  var app_default = main;

  // C:/Users/tomdom/AppData/Local/Temp/spicetify-creator/index.jsx
  (async () => {
    await app_default();
  })();
})();

      })();