# Cat Jam Synced

![preview](marketplace/preview.gif)

Make a cat appear next to your progress bar, jamming along with your music synchronized to the beat!

> ⚙ are located at the bottom of the regular Spotify settings.

## Credits 🐈

Maintained fork of [BlafKing/spicetify-cat-jam-synced](https://github.com/BlafKing/spicetify-cat-jam-synced) by [@BlafKing](https://github.com/BlafKing), who created the original extension and cat video. This fork modernizes the synchronization core (track-identity guards, timer lifecycle, tempo-only BPM) and keeps it compatible with current Spotify versions. MIT licensed.

# Changelog 📋

<h3>v1.3.0</h3>

- Rewritten synchronization core: a single controller owns track identity, audio analysis, beat timers and the video element.
- Fixed race where analysis of the previous song could override the current one (results are guarded by track generation).
- Pending beat timers are now cancelled on track change, pause and seek; progress events are coalesced so only real seeks resync.
- BPM sync now uses only the track's real tempo (`getAudioData`), clamped to half/double speed, with a safe fallback to normal speed when no analysis is available.
- Removed the deprecated Spotify `audio-features` endpoint and the danceability/energy based BPM methods (those two settings dropdowns are gone).
- Video autoplay/load errors are handled silently; the extension disables itself cleanly if Spotify's UI changes shape.
- Default webM asset is pinned to an immutable commit URL.

<h3>v1.2.5</h3>

- Added better BPM calculation for songs based on songs danceability and energy.
- Can be toggled from the settings.
- Fixed minor bugs.

<h3>v1.2.0</h3>

- Added ability to position and resize webM video to the left library.
- Changed "Reload" button label to a "Save and reload".

<h4>Dev changes </h4>

- Changed from npm to yarn.

<h3>v1.1</h3>

- Added ability to select custom webM link and default BPM in the spotify settings tab.

---

<h3>v1.0</h3>

- Initial release

---

## Made with Spicetify Creator

- https://github.com/spicetify/spicetify-creator
