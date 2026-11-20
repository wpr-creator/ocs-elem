# OCS Elementary Resources

## Visit the website

**[Open OCS Elementary Resources](https://wpr-creator.github.io/ocs-elem/)**

[Open All Aboard the Expectation Station](https://wpr-creator.github.io/ocs-elem/expectation-station/)

Hosted on GitHub Pages. Public and available to students, families, and staff. No sign-in or ChatGPT account required.

Updates pushed to `main` automatically publish the files in `dist/` through `.github/workflows/pages.yml`.

A buildless, responsive elementary PBIS website. Serve `dist/` with any static host. For a local preview: `python3 -m http.server 4173 --directory dist`.

Students select one of 11 pictured destinations on a vintage railway departure board. A short train transition leads to the destination’s six exact PDF expectations. Read-aloud uses the browser speech API; availability and voices depend on the device. Reduced-motion preferences are respected, and a visible motion toggle is available.

`dist/expectation-station/data.json` contains the exact area names and expectation statements extracted from the supplied FALCON Student PBIS Matrix. The original PDF is included for reference. The site title and navigation are additional interface copy, not replacements for matrix wording.

Artwork: generated using the built-in image generation tool. Prompt: a consistent storybook Falcon student in a 4 by 3 illustration sheet, showing listening in class, hallway walking, handwashing, turn taking, lunch manners, auditorium applause, gentle library reading, art, fair PE play, cooperative STEAM building, careful computer use, and a Falcon railway conductor. Warm navy, teal and gold gouache, no text. Asset: `dist/expectation-station/assets/falcons.png`.

## Animated station

The Falcon Express pulls into the illustrated platform on arrival and when Call the train is pressed. The three-row departure board cycles through all 11 destinations and supports boarding directly. Animated train journeys include a Skip ride button. Sound is opt-in through the Sound toggle: synthesized station bells, whistle chords, steam, wheel rhythm, and split-flap clicks use Web Audio. Audio pauses when the tab is hidden. The Motion control and system reduced-motion preference disable the movement.

## Site structure

`dist/index.html` is the school homepage. The complete Expectation Station lives at `dist/expectation-station/`. Add other resources in sibling folders under `dist/` and link them from the homepage. All paths are relative so each section stays portable.

## Imported resources

- [Career Explorer](https://wpr-creator.github.io/ocs-elem/career-explorer/): `dist/career-explorer/`, imported from `wpr-creator/careerexplorer`.
- [Mission Academy](https://wpr-creator.github.io/ocs-elem/2nd/): `dist/2nd/`, imported from `wpr-creator/2nd`.

Each section includes a School home link. Source commit IDs are recorded in each section’s `SOURCE.md`. These are independent copies; changes to the original repositories do not sync automatically. The imported Mission Academy teacher panel writes section settings to `dist/2nd/config.js` in this repository. Existing browser-local student progress retains its original storage keys.
