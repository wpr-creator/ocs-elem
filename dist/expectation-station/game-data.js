(function(root){
'use strict';
const values=['FOCUS','ATTITUDE','LEADERSHIP','CITIZENSHIP','ORGANIZATION','NON-VIOLENCE'];

function buildGames(stops) {
  const prop = (label, icon) => ({label, icon});
  const route = (category, cue, ...spots) => ({mode:'order', category, cue, spots});
  const load = (category, cue, spots, ...items) => ({
    mode:'move', category, cue,
    spots:spots.map(([label,icon])=>prop(label,icon)),
    cargo:items.map(([label,icon,to])=>({...prop(label,icon),to}))
  });
  const signals = (category, cue, spots, ...steps) => ({
    mode:'signal', category, cue, spots:spots.map(([label,icon])=>prop(label,icon)),
    signals:steps.map(([label,to])=>({label,to}))
  });
  const scenes = [
    [
  {
    map:['.+++.','.+.+.','+++++','+...+','+++++'],
    mode:'yard',category:0,start:10, finish:14, cue:'Collect the supplies in order.',
    cargo:[{name:'Book',icon:'📘',at:2},{name:'Pencil',icon:'✏️',at:22}]
  },
  {
    map:['+++++','+.+.+','+++++','..+.+','+++++'],
    mode:'yard',category:0,start:20, finish:4, cue:'Follow all three directions.',
    cargo:[{name:'Ruler',icon:'📏',at:0},{name:'Folder',icon:'📁',at:12},{name:'Crayons',icon:'🖍️',at:24}]
  },
  {
    map:['+++++','+.+.+','+++++','+.+.+','+++++'],
    mode:'yard',category:4,sorting:true,start:12, finish:22, cue:'Pick up and put away each supply.',
    cargo:[
      {name:'Book',icon:'📘',at:10, dock:0, place:'Bookshelf', mark:'📚'},
      {name:'Pencil',icon:'✏️',at:2, dock:24, place:'Pencil cup', mark:'🫙'},
      {name:'Crayons',icon:'🖍️',at:14, dock:20, place:'Art bin', mark:'🎨'}
    ]
  }
],
    [
      route(0,'Remember who goes first.',prop('Falcon','🐦'),prop('Owl','🦉'),prop('Duck','🦆')),
      load(4,'Fill the gaps in line.',[['A line','Ⓐ'],['B line','Ⓑ'],['C line','Ⓒ']],
        ['Duck · B','🦆',1],['Falcon · A','🐦',0],['Owl · C','🦉',2]),
      signals(5,'Keep space as the line moves.',[['Step','👟'],['Hold','✋']],
        ['Line stopped',1],['Space ahead',0],['Space ahead',0],['Line stopped',1])
    ],
    [
      route(4,'Remember the bathroom routine.',prop('Flush','🚽'),prop('Wash','🧼'),prop('Dry','🧻'),prop('Toss towel','🗑️')),
      load(3,'Leave the bathroom clean.',[['Trash','🗑️'],['Sink','🚰'],['Hook','🪝']],
        ['Used towel','🧻',0],['Soapy hands','🫧',1],['Backpack','🎒',2]),
      load(2,'Which problems need an adult?', [['Tell staff','🧑'],['Tidy it myself','🧽']],
        ['Water flooding the floor','💦',0],['My towel fell','🧻',1],['Broken sink','🚰',0])
    ],
    [
      signals(0,'Play until the whistle.',[['Play','⚽'],['Freeze','✋']],
        ['No whistle',0],['Whistle!',1],['Play again',0],['Whistle!',1]),
      load(1,'Give everyone a turn.',[['Falcon · played','🐦'],['Duck · waiting','🦆'],['Owl · waiting','🦉']],
        ['Soccer ball','⚽',[1,2]],['Basketball','🏀',[1,2]]),
      route(3,'Remember the turn order.',prop('Duck','🦆'),prop('Owl','🦉'),prop('Falcon','🐦'))
    ],
    [
      load(3,'Clear the lunch table.',[['Scraps','🍎'],['Trash','🗑️'],['Tray stack','🍽️']],
        ['Banana peel','🍌',0],['Wrapper','📦',1],['Empty tray','🍽️',2],['Apple core','🍏',0]),
      route(4,'Remember the lunch cleanup.',prop('Scrape scraps','🍎'),prop('Stack tray','🍽️'),prop('Wipe spot','🧽')),
      load(5,'Match each lunch to its owner.',[['Falcon tray','🐦'],['Duck tray','🦆'],['Owl tray','🦉']],
        ['Owl’s sandwich','🥪',2],['Falcon’s apple','🍎',0],['Duck’s carrots','🥕',1])
    ],
    [
      signals(0,'Watch what’s happening on stage.',[['Listen','👂'],['Applaud','👏']],
        ['Speaker is talking',0],['Song is playing',0],['Show ends',1]),
      signals(1,'Clap at the right time.',[['Wait','✋'],['Clap','👏']],
        ['Dancer starts',0],['Music pauses',0],['Dancer takes a bow',1]),
      load(3,'Find the guests their seats.',[['Row A','Ⓐ'],['Row B','Ⓑ'],['Row C','Ⓒ']],
        ['Duck · B','🦆',1],['Owl · C','🦉',2],['Falcon · A','🐦',0])
    ],
    [
      load(4,'Sort the library returns.',[['Animal books','🐾'],['Space books','🪐'],['Art books','🎨']],
        ['Dinosaur book','🦕',0],['Moon book','🌙',1],['Painting book','🖼️',2],['Bird book','🐦',0]),
      route(5,'Remember how to carry a book.',prop('Use both hands','🙌'),prop('Walk to shelf','🚶'),prop('Set it down gently','📘')),
      signals(1,'Choose when to use your voice.',[['Quiet voice','💬'],['Read quietly','📖']],
        ['Reading alone',1],['Ask the librarian',0],['Friends are reading',1])
    ],
    [
      load(2,'Help each artist keep going.',[['Painter','🖌️'],['Drawer','✏️'],['Sculptor','🏺']],
        ['Paper','📄',1],['Paint','🎨',0],['Clay','🟤',2]),
      route(4,'Remember brush cleanup.',prop('Wipe paint','🎨'),prop('Rinse brush','💧'),prop('Put away','🖌️')),
      load(5,'Put tools in safe spots.',[['Closed tool tray','🧰'],['Drying rack','🗄️'],['Craft bin','🧺']],
        ['Scissors','✂️',0],['Wet painting','🖼️',1],['Yarn','🧶',2])
    ],
    [
      signals(0,'Follow the coach’s calls.',[['Move','👟'],['Stop','✋']],
        ['Go!',0],['Stop!',1],['Go!',0],['Stop!',1]),
      load(3,'Pass to everyone who hasn’t played.',[['Falcon · played','🐦'],['Duck · waiting','🦆'],['Owl · waiting','🦉']],
        ['Basketball','🏀',[1,2]],['Soccer ball','⚽',[1,2]]),
      load(4,'Return the equipment.',[['Ball rack','🧺'],['Cone stack','🚧'],['Rope hooks','🪝']],
        ['Jump rope','🪢',2],['Basketball','🏀',0],['Cone','🔶',1])
    ],
    [
      {mode:'track',category:1,cue:'Turn the tracks to fix the bridge.',spots:[],track:[
        null, {ports:[1,2],turn:2}, {ports:[1,3],turn:1},
        {ports:[1,3],turn:1}, {ports:[0,3],turn:1}, null
      ]},
      load(2,'Find a teammate for each job.',[['Builder','🔧'],['Designer','📐'],['Tester','🔍']],
        ['Draw a track plan','🗺️',1],['Build the bridge','🌉',0],['Check the train fits','🚂',2]),
      load(4,'Reset the workshop.',[['Toolbox','🧰'],['Parts bin','🧺'],['Plans folder','📁']],
        ['Wrench','🔧',0],['Track pieces','🛤️',1],['Sketch','📐',2])
    ],
    [
      route(0,'Remember the filming plan.',prop('Set the scene','🎭'),prop('Take pictures','📷'),prop('Play the clip','▶️')),
      signals(1,'Share camera time.',[['Film','🎥'],['Hand over','🤝']],
        ['Your turn',0],['Partner is ready',1],['Your turn again',0]),
      load(4,'File the movie parts.',[['Pictures','🖼️'],['Sounds','🎵'],['Finished clips','🎞️']],
        ['Photo','📷',0],['Train whistle audio','🔊',1],['Final movie','🎬',2])
    ],
    [
      {...load(4,'Dispatch the school tickets.',[['Bathroom','🚰'],['Cafeteria','🍽️'],['Library','📚']],
        ['Wash hands','🧼',0],['Stack a lunch tray','🍽️',1],['Shelve a book','📘',2]),source:2},
      {...load(0,'Dispatch another train.',[['Playground','🛝'],['Classroom','🪑'],['Auditorium','🎭']],
        ['Freeze at the whistle','✋',0],['Follow teacher directions','👂',1],['Listen to the performance','🎵',2]),source:3},
      {...load(2,'Send the last three tickets.',[['STEAM','🛠️'],['PE','🏀'],['VAPA','🎨']],
        ['Share a bridge idea','💡',0],['Cheer on a teammate','📣',1],['Encourage an artist','🖌️',2]),source:9}
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
