# OCS Elementary Resources

## Visit the website

**[Open OCS Elementary Resources](https://wpr-creator.github.io/ocs-elem/)**

[Open All Aboard the Expectation Station](https://wpr-creator.github.io/ocs-elem/expectation-station/)

Hosted on GitHub Pages. Public and available to students, families, and staff. No sign-in or ChatGPT account required.

Updates pushed to `main` automatically publish the files in `dist/` through `.github/workflows/pages.yml`.

A buildless, responsive elementary PBIS website. Serve `dist/` with any static host. For a local preview: `python3 -m http.server 4173 --directory dist`.

Students select one of 11 school stops on the departure timetable. A short train transition leads to the destination’s six exact PDF expectations. Read-aloud uses the browser speech API; availability and voices depend on the device. System reduced-motion preferences are respected automatically.

`dist/expectation-station/data.json` contains the exact area names and expectation statements extracted from the supplied FALCON Student PBIS Matrix. The original PDF is included for reference. The site title and navigation are additional interface copy, not replacements for matrix wording.

Artwork: generated using the built-in image generation tool. Prompt: a consistent storybook Falcon student in a 4 by 3 illustration sheet, showing listening in class, hallway walking, handwashing, turn taking, lunch manners, auditorium applause, gentle library reading, art, fair PE play, cooperative STEAM building, careful computer use, and a Falcon railway conductor. Warm navy, teal and gold gouache, no text. The individual scene and conductor WebP files are in `dist/expectation-station/assets/`.

## Animated station

The Falcon Express pulls into the platform at the top of the station home. The departure timetable immediately below it shows all 11 school stops and links to the games. Animated train journeys include a Skip ride button. Sound is enabled by default and begins on the first browser interaction: synthesized station bells, whistle chords, steam, wheel rhythm, and split-flap clicks use Web Audio. Audio pauses when the tab is hidden. The system reduced-motion preference disables the movement.

## Site structure

`dist/index.html` is the school homepage. The complete Expectation Station lives at `dist/expectation-station/`. Add other resources in sibling folders under `dist/` and link them from the homepage. All paths are relative so each section stays portable.

## Imported resources

- [Career Explorer](https://wpr-creator.github.io/ocs-elem/career-explorer/): `dist/career-explorer/`, imported from `wpr-creator/careerexplorer`.
- [Mission Academy](https://wpr-creator.github.io/ocs-elem/2nd/): `dist/2nd/`, imported from `wpr-creator/2nd`.

Student activities omit resource-hub navigation. Source commit IDs are recorded in each section’s `SOURCE.md`. These are independent copies; changes to the original repositories do not sync automatically. The imported Mission Academy teacher panel writes section settings to `dist/2nd/config.js` in this repository. Existing browser-local student progress retains its original storage keys.

## Purple Door

[Purple Door Portals](https://wpr-creator.github.io/ocs-elem/purpledoor/) lives in `dist/purpledoor/`. The `wpr-creator/purpledoor` site source was copied with only the referenced artwork and its license files. Unused asset packs and development galleries were excluded. The imported landing page has an OCS Resources return link. This is an independent copy; original missing portal pages and dependencies are left for future refinement. See `dist/purpledoor/SOURCE.md` for the imported commit.

## Elementary AVID Organization Spinner

[AVID Organization Spinner](https://wpr-creator.github.io/ocs-elem/avid-spinner/) lives in `dist/avid-spinner/`. Copied from Homebase’s `ocs-elementary-organization/` page with localized asset paths. The spinner uses the shared OCS activity styles and its own stylesheet. The original five organization checks are preserved. See `dist/avid-spinner/SOURCE.md` for source revision.

## Expectation Station games

Open [Station Games](https://wpr-creator.github.io/ocs-elem/expectation-station/#games) from the resource homepage or Expectation Station. Pick a school game or Station Dispatcher to start playing immediately. Signal Express combines Playground and PE into one driving game. Cleanup Express combines Bathroom and Cafeteria into a game where students clear two train cars. Both shared games award a passport stamp for each stop. Each game has its own illustrated railway scene, sound, and completion effect. The Grand Central-inspired game platforms keep the school setting and FALCON value visible during three short behavior challenges. In Classroom Express, students listen for the teacher’s changing activity, load supplies, and route the train to the right station. In Signal Express, students drive and brake before the red signal. The other games use sorting, changing signals, remembered directions, or a track repair puzzle. Each completed action advances automatically. Game sentences are read from the unchanged PDF matrix in `dist/expectation-station/data.json`. New instructions and questions are interface copy; expectation statements stay verbatim. Completed games earn one of 12 passport stamps, stored only in this browser without student names. Games use buttons and support keyboard input, read-aloud, retrying, replay, and reduced motion.

Station sound defaults to on. Browser audio unlocks on the first click, tap, or keyboard interaction; the Sound button on game platforms toggles station audio. Audio pauses with a hidden tab and quiets during read-aloud. No audio files, AI calls, accounts, or services are needed.

Run `node --test tests/station-games.test.cjs tests/railway-games.test.cjs` to check game content, station matching, and automatic round progression.

## Homepage visibility

The homepage currently shows Expectation Station, Career Explorer, and the AVID Organization Spinner. Mission Academy (`dist/2nd/`) and Purple Door (`dist/purpledoor/`) remain in the repository and keep their existing URLs, but are omitted from homepage navigation.

## Activity refinement audit

See [AUDIT.md](AUDIT.md) for scoring, interaction, and verification details. Student activity pages omit grade switching, teacher notes, PDF links, printing controls, and sound/motion toggles. Grade selection is available at the Career Explorer entry page.
