(function(root){
'use strict';
const values=['FOCUS','ATTITUDE','LEADERSHIP','CITIZENSHIP','ORGANIZATION','NON-VIOLENCE'];

// A scene pairs a short playable action with its exact matrix row.
function buildGames(stops) {
  const spot = (label, icon) => ({label, icon});
  const move = (category, cue, label, icon, target, decoy) =>
    ({mode:'move', category, cue, piece:spot(label, icon), spots:[target, decoy]});
  const order = (category, cue, ...spots) => ({mode:'order', category, cue, spots});
  const signal = (category, cue, ready, label, icon) =>
    ({mode:'signal', category, cue, ready, spots:[spot(label, icon)]});
  const scenes = [
    [
      signal(0, 'Listen for “Go!”', 'Go!', 'Punch ticket', '🎟️'),
      move(1, 'Cheer on your classmate.', 'You can do it!', '💬', spot('Classmate', '🐥'), spot('Empty desk', '🪑')),
      move(4, 'Put the pencil away.', 'Pencil', '✏️', spot('Pencil cup', '✏️'), spot('Floor', '⬜'))
    ],
    [
      order(0, 'Follow the line. Start at 1.', spot('1', '🐥'), spot('2', '🐥'), spot('3', '🐥')),
      move(4, 'Close the gap in line.', 'Falcon', '🐥', spot('Gap', '⬚'), spot('Beside the line', '↗️')),
      move(5, 'Keep your hands to yourself.', 'Falcon', '🐥', spot('My space', '⭕'), spot('Their space', '🐤'))
    ],
    [
      order(4, 'Flush, wash, then toss.', spot('Flush', '🚽'), spot('Wash', '🧼'), spot('Toss towel', '🗑️')),
      move(3, 'Pick up the dropped towel.', 'Towel', '🧻', spot('Trash can', '🗑️'), spot('Sink', '🚰')),
      move(2, 'Tell an adult about the spill.', 'Tell an adult', '💬', spot('Staff member', '🧑'), spot('Empty stall', '🚪'))
    ],
    [
      signal(0, 'Wait for the whistle.', 'Whistle!', 'Freeze', '✋'),
      move(1, 'Invite the new player.', 'Ball', '⚽', spot('New player', '🐥'), spot('Ball bin', '🧺')),
      move(3, 'Give the next player a turn.', 'Ball', '🏀', spot('Next player', '🐤'), spot('My spot', '⭕'))
    ],
    [
      move(3, 'Clear the lunch table.', 'Wrapper', '📦', spot('Trash can', '🗑️'), spot('Seat', '🪑')),
      order(4, 'Sort your tray. Stack it last.', spot('Scrape scraps', '🍎'), spot('Stack tray', '🍽️')),
      move(5, 'Keep your food on your tray.', 'Lunch', '🥪', spot('My tray', '🍽️'), spot('Their tray', '🍴'))
    ],
    [
      signal(0, 'Watch for the curtain.', 'Curtain up!', 'Listen', '👂'),
      signal(1, 'Clap after the show.', 'Show is over!', 'Clap', '👏'),
      move(3, 'Welcome someone new.', 'Welcome!', '💬', spot('New guest', '🐥'), spot('Empty row', '🪑'))
    ],
    [
      move(4, 'Return the book.', 'Book', '📘', spot('Book cart', '🛒'), spot('Floor', '⬜')),
      order(5, 'Carry the book gently.', spot('Hold with two hands', '🙌'), spot('Walk to the shelf', '🚶')),
      signal(1, 'Try your library voice.', 'Reader is ready.', 'Read quietly', '📖')
    ],
    [
      move(2, 'Cheer on another artist.', 'Nice work!', '💬', spot('Artist', '🧑‍🎨'), spot('Supply bin', '🧺')),
      order(4, 'Rinse, then put the brush away.', spot('Rinse brush', '💧'), spot('Put away', '🖌️')),
      move(5, 'Carry tools safely.', 'Scissors', '✂️', spot('Closed tool tray', '🧰'), spot('Edge of table', '↘️'))
    ],
    [
      signal(0, 'Wait for the coach’s signal.', 'Go!', 'Start moving', '👟'),
      move(3, 'Pass to someone left out.', 'Ball', '🏀', spot('New teammate', '🐥'), spot('Ball rack', '🧺')),
      move(4, 'Put the ball back.', 'Ball', '🏀', spot('Ball rack', '🧺'), spot('Middle of court', '⭕'))
    ],
    [
      order(1, 'The bridge broke. Try again!', spot('Check the gap', '🔍'), spot('Fit a new piece', '🛠️')),
      move(2, 'Share your idea with the team.', 'Idea', '💡', spot('Team table', '🐥'), spot('Toolbox', '🧰')),
      move(4, 'Put the tool away.', 'Wrench', '🔧', spot('Toolbox', '🧰'), spot('Floor', '⬜'))
    ],
    [
      order(0, 'Make a clip. Film, then play.', spot('Film scene', '🎥'), spot('Play clip', '▶️')),
      move(1, 'Give a partner a turn.', 'Camera', '📷', spot('Partner', '🐥'), spot('My spot', '⭕')),
      move(4, 'Save the clip in its folder.', 'Clip', '🎞️', spot('Project folder', '📁'), spot('Trash', '🗑️'))
    ],
    [
      {...move(4, 'Send “wash hands” to its stop.', 'Wash hands', '🧼', spot('Bathroom', '🚰'), spot('Classroom', '🪑')), source:2},
      {...move(0, 'Send “freeze at the whistle” to its stop.', 'Freeze', '✋', spot('Playground', '🛝'), spot('Library', '📚')), source:3},
      {...move(2, 'Send “share ideas” to its stop.', 'Share ideas', '💡', spot('STEAM', '🛠️'), spot('Cafeteria', '🍽️')), source:9}
    ]
  ];
  const games = scenes.map((rounds, i) => ({
    id: ['classroom','hallway','bathroom','playground','cafeteria','auditorium','library','vapa','pe','steam','animation','station-match'][i],
    rounds: rounds.map(round => ({
      ...round,
      value: values[round.category],
      expectation: stops[round.source ?? i].expectations[round.category]
    }))
  }));
  return {games:games.slice(0,11), match:games[11], values};
}
root.FalconGames={buildGames};
if(typeof module!=='undefined')module.exports={buildGames};
})(typeof window!=='undefined'?window:globalThis);
