# Student activity audit — November 2026

Career Explorer now shares one controller, scoring module, and versioned question banks. The 12/18/24-question forms contain 2/3/4 questions for each RIASEC area. Answers score 3/2/1/0, giving each area a maximum of 6/9/12 points. Results are recalculated from current answers, including edits; unfinished answers cannot produce final results. Ranking uses exact normalized scores, retains ties at the third-area cutoff, and does not invent a favorite for all-zero responses. Percent bars represent activity points, not career-match probabilities.

These custom elementary questions are classroom interest exploration, not a validated O*NET assessment or career prediction. O*NET's six-area framework and scoring guidance are documented at https://www.onetcenter.org/IP.html. Existing occupation source metadata remains in career-data.js; this audit did not independently reverify every salary or training entry. Adult-oriented extras are omitted from student profiles.

The rounded lavender, peach, and teal interface uses local fonts, native keyboard-operable answers, read-aloud, session-only quiz recovery, useful focus management, and responsive layouts. Removed old duplicate controllers, development shortcuts, teacher notes, grade-switch controls inside activities, and extra navigation. The catalog stays within the selected grade and clears stale profiles when filtering.

AVID keeps its original five organization checks and steps. Selection uses unbiased cryptographic sampling; the wheel lands on the selected wedge with upright labels. A student can finish a spin early without changing its selected result. Added short sounds, confetti, read-aloud, and automatic system reduced-motion support. No sound or motion buttons are shown.

Expectation Station retains the exact matrix data and all 11 station games. Removed the student PDF link, resource-hub navigation, and sound/motion switches. Sound starts after browser-permitted interaction and pauses in a hidden tab.

Verification: Node tests cover all grade banks and answer values, exact ranking and ties, answer edits, incomplete and zero responses, career references, local assets, unbiased spinner selection and landing geometry, and station game content. Manual browser checks cover quiz completion and recovery, keyboard navigation, job search and profiles, and spinner completion.

Run: `node --test dist/career-explorer/tests/site.test.js tests/avid-spinner.test.cjs tests/station-games.test.cjs`.

## Live resource and Expectation Station follow-up

- Career Explorer: completed the 12-, 18-, and 24-question activities in Chromium, including recovering a selected answer after reload, opening a result profile, and filtering the job catalog to zero matches. The existing scoring and content tests cover ties, incomplete answers, all-zero answers, and job references.
- AVID Organization Spinner: verified repeated spins with reduced motion and the Show result control during an animated spin. Darkened the kicker text after an automated contrast check flagged it.
- Expectation Station: opened all 11 stops, checked that each displays six expectations, and started every station game. Opened Station Dispatcher separately. The existing automated game tests exercise the game controls and verify that each dispatcher prompt has one matching station in the matrix.
- The rotating departures now hold while a row has keyboard focus. The train ride opens a modal and focuses Skip ride. Escape skips the animation as well. Navigation during a ride clears the ride timers and sounds so the old destination cannot override the new route. Stop, destination list, and game headings receive focus when reached.
- Improved text contrast on the train, destination cards, passport, and stop and game labels. The matrix JSON and its source PDF were retained.
- Removed the unused Falcon artwork sheet and retired Homebase stylesheet. The WebP station scenes, font licenses, imported classroom resources, source records, and validation files were retained.
