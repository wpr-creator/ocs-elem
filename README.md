# OCS Elementary Resources

## Visit the website

**[Open OCS Elementary Resources](https://wpr-creator.github.io/ocs-elem/)**

[Open All Aboard the Expectation Station](https://wpr-creator.github.io/ocs-elem/expectation-station/)

Hosted on GitHub Pages. Public and available to students, families, and staff. No sign-in or ChatGPT account required.

Updates pushed to `main` automatically publish the files in `dist/` through `.github/workflows/pages.yml`.

A buildless, responsive elementary PBIS website. Serve `dist/` with any static host. For a local preview: `python3 -m http.server 4173 --directory dist`.

Students select one of 11 pictured destinations on a vintage railway departure board. A short train transition leads to the destination’s six exact PDF expectations. Read-aloud uses the browser speech API; availability and voices depend on the device. System reduced-motion preferences are respected automatically.

`dist/expectation-station/data.json` contains the exact area names and expectation statements extracted from the supplied FALCON Student PBIS Matrix. The original PDF is included for reference. The site title and navigation are additional interface copy, not replacements for matrix wording.

Artwork: generated using the built-in image generation tool. Prompt: a consistent storybook Falcon student in a 4 by 3 illustration sheet, showing listening in class, hallway walking, handwashing, turn taking, lunch manners, auditorium applause, gentle library reading, art, fair PE play, cooperative STEAM building, careful computer use, and a Falcon railway conductor. Warm navy, teal and gold gouache, no text. The individual scene and conductor WebP files are in `dist/expectation-station/assets/`.

## Animated station

The Falcon Express pulls into the illustrated platform on arrival and when Call the train is pressed. The three-row departure board cycles through all 11 destinations and supports boarding directly. Animated train journeys include a Skip ride button. Sound is enabled by default and begins on the first browser interaction: synthesized station bells, whistle chords, steam, wheel rhythm, and split-flap clicks use Web Audio. Audio pauses when the tab is hidden. The system reduced-motion preference disables the movement.

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

The 11 stations each have a themed activity, plus the school-wide Match the Station matching game. Game sentences are read from the unchanged PDF matrix in `dist/expectation-station/data.json`. New instructions and questions are interface copy; expectation statements stay verbatim. Completed games earn one of 12 passport stamps, stored only in this browser without student names. Games use buttons and support keyboard input, read-aloud, retrying, replay, and reduced motion.

Station sound defaults to on. Browser audio unlocks on the first click, tap, or keyboard interaction; students can mute their device. Audio pauses with a hidden tab and quiets during read-aloud. No audio files, AI calls, accounts, or services are needed.

Run `node --test tests/station-games.test.cjs` to check the game content and unambiguous station matching.

## Homepage visibility

The homepage currently shows Expectation Station, Career Explorer, and the AVID Organization Spinner. Mission Academy (`dist/2nd/`) and Purple Door (`dist/purpledoor/`) remain in the repository and keep their existing URLs, but are omitted from homepage navigation.

## Activity refinement audit

See [AUDIT.md](AUDIT.md) for scoring, interaction, and verification details. Student activity pages omit grade switching, teacher notes, PDF links, printing controls, and sound/motion toggles. Grade selection is available at the Career Explorer entry page.

Library Book Pairs now uses 12 shuffled face-down cards, two-card reveals, automatic mismatch resets, and retained matching pairs. Bathroom Bubble Pop presents six FALCON-category rounds with three targets and three distractors per round, sampled from the exact school matrix. Correct pops stay collected; incorrect bubbles remain available. Both support keyboard use and read-aloud without timers or lost lives.

## Falcon Central concourse and railway games

The station uses a celestial green concourse, brass clock, limestone colors, arched boards, and local Barlow Condensed lettering rather than editorial serif headlines. All 11 stops and the school-wide dispatcher use the same railway design. The PDF matrix data is unchanged.

| Stop | Railway interaction |
| --- | --- |
| Classroom | Select and punch a conductor’s ticket |
| Hallway | Match tickets to three cars, then send the train |
| Bathroom | Pop matching steam clouds above the locomotive |
| Playground | Watch the green/red signal and stop the train |
| Cafeteria | Load expectation suitcases onto the correct luggage cart |
| Auditorium | Open carriage windows and ring the matching arrival bell |
| Library | Recover six pairs of face-down lost-and-found tickets |
| VAPA | Match paint tins to panels and uncover a railway mural |
| PE | Connect two track switches and dispatch the team train |
| STEAM | Fit expectation track pieces into a railway bridge |
| Animation | Assemble six FALCON film frames and play the picture show |
| All stations | Dispatch expectation tickets to the correct platform |

Placement games support dragging, selecting with a tap, and keyboard buttons. No timed scoring or lost lives. System reduced motion is respected automatically. Railway-specific behavior tests: `node --test tests/railway-games.test.cjs`.
