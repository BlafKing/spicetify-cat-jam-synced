!(async function () {
  for (; !Spicetify.React || !Spicetify.ReactDOM; )
    await new Promise((e) => setTimeout(e, 10));
  var l, o, d, c, u, m, p, e, t, a, r, i, f, n;
  (o = Object.create),
    (d = Object.defineProperty),
    (c = Object.getOwnPropertyDescriptor),
    (u = Object.getOwnPropertyNames),
    (m = Object.getPrototypeOf),
    (p = Object.prototype.hasOwnProperty),
    (a = (e = (e, t) =>
      function () {
        return (
          t || (0, e[u(e)[0]])((t = { exports: {} }).exports, t), t.exports
        );
      })({
      "external-global-plugin:react-dom"(e, t) {
        t.exports = Spicetify.ReactDOM;
      },
    })),
    (r = (t = (e, t, a) => {
      a = null != e ? o(m(e)) : {};
      var i =
          !t && e && e.__esModule
            ? a
            : d(a, "default", { value: e, enumerable: !0 }),
        n = e,
        s = void 0,
        r = void 0;
      if ((n && "object" == typeof n) || "function" == typeof n)
        for (let e of u(n))
          p.call(i, e) ||
            e === s ||
            d(i, e, {
              get: () => n[e],
              enumerable: !(r = c(n, e)) || r.enumerable,
            });
      return i;
    })(
      e({
        "external-global-plugin:react"(e, t) {
          t.exports = Spicetify.React;
        },
      })()
    )),
    (i = t(a())),
    (f = new (class {
      constructor(e, t, a = {}) {
        (this.name = e),
          (this.settingsId = t),
          (this.initialSettingsFields = a),
          (this.settingsFields = this.initialSettingsFields),
          (this.setRerender = null),
          (this.pushSettings = async () => {
            for (
              Object.entries(this.settingsFields).forEach(([e, t]) => {
                "button" !== t.type &&
                  void 0 === this.getFieldValue(e) &&
                  this.setFieldValue(e, t.defaultValue);
              });
              !Spicetify?.Platform?.History?.listen;

            )
              await new Promise((e) => setTimeout(e, 100));
            this.stopHistoryListener && this.stopHistoryListener(),
              (this.stopHistoryListener = Spicetify.Platform.History.listen(
                (e) => {
                  "/preferences" === e.pathname && this.render();
                }
              )),
              "/preferences" === Spicetify.Platform.History.location.pathname &&
                (await this.render());
          }),
          (this.rerender = () => {
            this.setRerender && this.setRerender(Math.random());
          }),
          (this.render = async () => {
            for (
              ;
              !document.getElementById("desktop.settings.selectLanguage");

            ) {
              if (
                "/preferences" !== Spicetify.Platform.History.location.pathname
              )
                return;
              await new Promise((e) => setTimeout(e, 100));
            }
            var e = document.querySelector(
              ".main-view-container__scroll-node-child main div"
            );
            if (!e)
              return console.error(
                "[spcr-settings] settings container not found"
              );
            let t = Array.from(e.children).find(
              (e) => e.id === this.settingsId
            );
            t
              ? console.log(t)
              : (((t = document.createElement("div")).id = this.settingsId),
                e.appendChild(t)),
              i.default.render(
                r.default.createElement(this.FieldsContainer, null),
                t
              );
          }),
          (this.addButton = (e, t, a, i, n) => {
            this.settingsFields[e] = {
              type: "button",
              description: t,
              value: a,
              events: { onClick: i, ...n },
            };
          }),
          (this.addInput = (e, t, a, i, n, s) => {
            this.settingsFields[e] = {
              type: "input",
              description: t,
              defaultValue: a,
              inputType: n,
              events: { onChange: i, ...s },
            };
          }),
          (this.addHidden = (e, t) => {
            this.settingsFields[e] = { type: "hidden", defaultValue: t };
          }),
          (this.addToggle = (e, t, a, i, n) => {
            this.settingsFields[e] = {
              type: "toggle",
              description: t,
              defaultValue: a,
              events: { onChange: i, ...n },
            };
          }),
          (this.addDropDown = (e, t, a, i, n, s) => {
            this.settingsFields[e] = {
              type: "dropdown",
              description: t,
              defaultValue: a[i],
              options: a,
              events: { onSelect: n, ...s },
            };
          }),
          (this.getFieldValue = (e) =>
            JSON.parse(
              Spicetify.LocalStorage.get(this.settingsId + "." + e) || "{}"
            )?.value),
          (this.setFieldValue = (e, t) => {
            Spicetify.LocalStorage.set(
              this.settingsId + "." + e,
              JSON.stringify({ value: t })
            );
          }),
          (this.FieldsContainer = () => {
            var [e, t] = (0, r.useState)(0);
            return (
              (this.setRerender = t),
              r.default.createElement(
                "div",
                { className: "x-settings-section", key: e },
                r.default.createElement(
                  "h2",
                  { className: "TypeElement-cello-textBase-type" },
                  this.name
                ),
                Object.entries(this.settingsFields).map(([e, t]) =>
                  r.default.createElement(this.Field, { nameId: e, field: t })
                )
              )
            );
          }),
          (this.Field = (a) => {
            var e = this.settingsId + "." + a.nameId;
            let t;
            if (
              ((t =
                "button" === a.field.type
                  ? a.field.value
                  : this.getFieldValue(a.nameId)),
              "hidden" === a.field.type)
            )
              return r.default.createElement(r.default.Fragment, null);
            const [i, n] = (0, r.useState)(t),
              s = (e) => {
                void 0 !== e && (n(e), this.setFieldValue(a.nameId, e));
              };
            return r.default.createElement(
              "div",
              { className: "x-settings-row" },
              r.default.createElement(
                "div",
                { className: "x-settings-firstColumn" },
                r.default.createElement(
                  "label",
                  {
                    className: "TypeElement-viola-textSubdued-type",
                    htmlFor: e,
                  },
                  a.field.description || ""
                )
              ),
              r.default.createElement(
                "div",
                { className: "x-settings-secondColumn" },
                "input" === a.field.type
                  ? r.default.createElement("input", {
                      className: "x-settings-input",
                      id: e,
                      dir: "ltr",
                      value: i,
                      type: a.field.inputType || "text",
                      ...a.field.events,
                      onChange: (e) => {
                        s(e.currentTarget.value);
                        var t = a.field.events?.onChange;
                        t && t(e);
                      },
                    })
                  : "button" === a.field.type
                  ? r.default.createElement(
                      "span",
                      null,
                      r.default.createElement(
                        "button",
                        {
                          id: e,
                          className:
                            "Button-sc-y0gtbx-0 Button-small-buttonSecondary-useBrowserDefaultFocusStyle x-settings-button",
                          ...a.field.events,
                          onClick: (e) => {
                            s();
                            var t = a.field.events?.onClick;
                            t && t(e);
                          },
                          type: "button",
                        },
                        i
                      )
                    )
                  : "toggle" === a.field.type
                  ? r.default.createElement(
                      "label",
                      { className: "x-settings-secondColumn x-toggle-wrapper" },
                      r.default.createElement("input", {
                        id: e,
                        className: "x-toggle-input",
                        type: "checkbox",
                        checked: i,
                        ...a.field.events,
                        onClick: (e) => {
                          s(e.currentTarget.checked);
                          var t = a.field.events?.onClick;
                          t && t(e);
                        },
                      }),
                      r.default.createElement(
                        "span",
                        { className: "x-toggle-indicatorWrapper" },
                        r.default.createElement("span", {
                          className: "x-toggle-indicator",
                        })
                      )
                    )
                  : "dropdown" === a.field.type
                  ? r.default.createElement(
                      "select",
                      {
                        className: "main-dropDown-dropDown",
                        id: e,
                        ...a.field.events,
                        onChange: (e) => {
                          s(a.field.options[e.currentTarget.selectedIndex]);
                          var t = a.field.events?.onChange;
                          t && t(e);
                        },
                      },
                      a.field.options.map((e, t) =>
                        r.default.createElement(
                          "option",
                          { selected: e === i, value: t + 1 },
                          e
                        )
                      )
                    )
                  : r.default.createElement(r.default.Fragment, null)
              )
            );
          });
      }
    })("Cat-Jam Settings", "catjam-settings")),
    (n = async function () {
      for (
        var e;
        null == (e = null == Spicetify ? void 0 : Spicetify.Player) ||
        !e.addEventListener ||
        null == Spicetify ||
        !Spicetify.getAudioData;

      )
        await new Promise((e) => setTimeout(e, 100));
      console.log("[CAT-JAM] Extension loaded.");
      let i,
        n =
          (f.addInput(
            "catjam-webm-link",
            "Custom webM video URL (Link does not work if no video shows)",
            ""
          ),
          f.addInput(
            "catjam-webm-bpm",
            "Custom default BPM of webM video (Example: 135.48)",
            ""
          ),
          f.addDropDown(
            "catjam-webm-position",
            "Position where webM video should be rendered",
            ["Bottom (Player)", "Left (Library)"],
            1
          ),
          f.addInput(
            "catjam-webm-position-left-size",
            "Size of webM video on the left library (Only works for left library, Default: 100)",
            ""
          ),
          f.addButton(
            "catjam-reload",
            "Reload custom values",
            "Save and reload",
            () => {
              h();
            }
          ),
          f.pushSettings(),
          h(),
          Spicetify.Player.addEventListener("onplaypause", async () => {
            var e = performance.now(),
              t = Spicetify.Player.getProgress();
            s(e, (n = t));
          }),
          0);
      Spicetify.Player.addEventListener("onprogress", async () => {
        var e = performance.now(),
          t = Spicetify.Player.getProgress();
        500 <= Math.abs(t - n) && s(e, t), (n = t);
      }),
        Spicetify.Player.addEventListener("songchange", async () => {
          var e,
            t = performance.now();
          n = Spicetify.Player.getProgress();
          const a = document.getElementById("catjam-webm");
          a
            ? (i = await g()) && i.beats && 0 < i.beats.length
              ? ((e = i.beats[0].start),
                (a.playbackRate = await y(i)),
                (t = performance.now() - t),
                (e = Math.max(0, 1e3 * e - t)),
                setTimeout(() => {
                  (a.currentTime = 0), a.play();
                }, e))
              : ((a.playbackRate = await y(i)), (a.currentTime = 0), a.play())
            : console.error("[CAT-JAM] Video element not found.");
        });
    }),
    (async () => {
      await n();
    })();
  async function y(e) {
    let t = Number(f.getFieldValue("catjam-webm-bpm"));
    var a;
    return (
      console.log(t),
      (t = t || 135.48),
      e && e.track.tempo
        ? ((a = (e = e.track.tempo) / t),
          console.log("[CAT-JAM] Track BPM:", e),
          console.log(
            "[CAT-JAM] Cat jam synchronized, playback rate set to:",
            a
          ),
          a)
        : (console.warn(
            "[CAT-JAM] BPM data not available for this track, cat will not be jamming accurately :("
          ),
          1)
    );
  }
  async function g(t = 200, a = 10) {
    try {
      return await Spicetify.getAudioData();
    } catch (e) {
      if ("object" == typeof e && null !== e && "message" in e) {
        if (e.message.includes("Cannot read properties of undefined") && 0 < a)
          return (
            console.log("[CAT-JAM] Retrying to fetch audio data..."),
            await new Promise((e) => setTimeout(e, t)),
            g(t, a - 1)
          );
      } else console.warn("[CAT-JAM] Error fetching audio data: " + e);
      return null;
    }
  }
  async function s(e, t) {
    const a = document.getElementById("catjam-webm");
    var i;
    a
      ? Spicetify.Player.isPlaying()
        ? ((t /= 1e3),
          l && l.beats
            ? ((i = l.beats.find((e) => e.start > t))
                ? ((e = performance.now() - e),
                  (i = Math.max(0, 1e3 * (i.start - t) - e)),
                  setTimeout(() => {
                    (a.currentTime = 0), a.play();
                  }, i))
                : ((a.currentTime = 0), a.play()),
              console.log("[CAT-JAM] Resynchronized to nearest beat"))
            : ((a.currentTime = 0), a.play()))
        : a.pause()
      : console.error("[CAT-JAM] Video element not found.");
  }
  async function h() {
    try {
      let e = Number(f.getFieldValue("catjam-webm-position-left-size"));
      e = e || 100;
      var a = `width: ${e}%; max-width: 300px; height: auto; max-height: 100%; position: absolute; bottom: 0; pointer-events: none; z-index: 1;`,
        i = f.getFieldValue("catjam-webm-position"),
        n = "Bottom (Player)" === i ? "width: 65px; height: 65px;" : a,
        s = await (async function (e, t = 50, a = 100) {
          let i = 0;
          for (; i < t; ) {
            var n = document.querySelector(e);
            if (n) return n;
            await new Promise((e) => setTimeout(e, a)), i++;
          }
          throw new Error(`Element ${e} not found after ${t} attempts.`);
        })(
          "Bottom (Player)" === i
            ? ".main-nowPlayingBar-right"
            : ".main-yourLibraryX-libraryItemContainer"
        ),
        r = document.getElementById("catjam-webm");
      r && r.remove();
      let t = String(f.getFieldValue("catjam-webm-link"));
      t =
        t ||
        "https://github.com/BlafKing/spicetify-cat-jam-synced/raw/main/src/resources/catjam.webm";
      var o = document.createElement("video");
      o.setAttribute("loop", "true"),
        o.setAttribute("autoplay", "true"),
        o.setAttribute("muted", "true"),
        o.setAttribute("style", n),
        (o.src = t),
        (o.id = "catjam-webm"),
        (l = await g()),
        (o.playbackRate = await y(l)),
        s.firstChild ? s.insertBefore(o, s.firstChild) : s.appendChild(o),
        Spicetify.Player.isPlaying() ? o.play() : o.pause();
    } catch (e) {
      console.error("[CAT-JAM] Could not create cat-jam video element: ", e);
    }
  }
})();
