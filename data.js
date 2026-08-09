const RADIO_SLOTS = 10;

const LIVE_ROLES = [
  'Play-by-Play', 'Color Analyst', 'Sideline Reporter',
  'Producer', 'Technical Director', 'Director', 'Main Camera',
  'Camera 2', 'Camera 3', 'Roam 1', 'Roam 2',
  'Jumbotron'
];

const EVENT_TYPES = {
  // Sports
  football:        { label: 'Football',          color: '#f59e0b' },
  basketball_boys: { label: 'Boys Basketball',   color: '#ef4444' },
  basketball_girls:{ label: 'Girls Basketball',  color: '#3b82f6' },
  volleyball:      { label: 'Volleyball',        color: '#8b5cf6' },
  soccer_boys:     { label: 'Boys Soccer',       color: '#10b981' },
  soccer_girls:    { label: 'Girls Soccer',      color: '#34d399' },
  golf_boys:       { label: 'Boys Golf',         color: '#84cc16' },
  golf_girls:      { label: 'Girls Golf',        color: '#a3e635' },
  baseball:        { label: 'Baseball',          color: '#f97316' },
  softball:        { label: 'Softball',          color: '#fb923c' },
  cross_country:   { label: 'Cross Country',     color: '#06b6d4' },
  swimming:        { label: 'Swimming',          color: '#0ea5e9' },
  tennis_boys:     { label: 'Boys Tennis',       color: '#a855f7' },
  tennis_girls:    { label: 'Girls Tennis',      color: '#c084fc' },
  track:           { label: 'Track & Field',     color: '#ec4899' },
  wrestling:       { label: 'Wrestling',         color: '#f43f5e' },
  gymnastics:      { label: 'Gymnastics',        color: '#e879f9' },
  lacrosse_boys:   { label: 'Boys Lacrosse',     color: '#4ade80' },
  lacrosse_girls:  { label: 'Girls Lacrosse',    color: '#86efac' },
  bowling_boys:    { label: 'Boys Bowling',      color: '#fbbf24' },
  bowling_girls:   { label: 'Girls Bowling',     color: '#fcd34d' },
  dance_team:      { label: 'Dance Team',        color: '#f472b6' },
  cheer:           { label: 'Cheer / Pom',       color: '#fb7185' },
  // Non-sports
  showchoir:       { label: 'Show Choir',        color: '#10b981' },
  arts:            { label: 'Performing Arts',   color: '#a855f7' },
  dance:           { label: 'Dance',             color: '#ec4899' },
  school:          { label: 'School Event',      color: '#06b6d4' },
  academic:        { label: 'Academic',          color: '#84cc16' },
  club:            { label: 'Club / Org',        color: '#f97316' },
  fine_arts:       { label: 'Fine Arts',         color: '#c084fc' },
  nhs:             { label: 'NHS / Honor Society', color: '#60a5fa' },
  graduation:      { label: 'Graduation',        color: '#f59e0b' },
  other:           { label: 'Other',             color: '#6b7280' }
};

// Broadcast Rundown card (segment/PBP/color/GFX/cam table) on each broadcast's page
const SHOW_BROADCAST_RUNDOWN = false; // set true to show the Broadcast Rundown card again

// Weekly-updated production sheets (Google Docs), linked from each sport's broadcast rundown
const SHOW_PRODUCTION_SHEETS = true; // set false to hide the "Production Sheet" link
const PRODUCTION_SHEETS = {
  football:         'https://docs.google.com/document/d/1Bp_Yg7c97YroLEQ264LyM2G7qDAuBgrFn27TrM0Ont8/edit?tab=t.0',
  volleyball:       'https://docs.google.com/document/d/1fkT8ySHm13vNjJWUsjT0vj6lf1_vEt4XxH0c7t7ceCY/edit',
  basketball_boys:  'https://docs.google.com/document/d/1vGGuJxumEk0B6Br0VR4iZt4GV3A6LAm0Ebg-uZ67IBQ/edit?tab=t.0',
  basketball_girls: 'https://docs.google.com/document/d/1lp7vD4rdBB18dNg9VU99TwFGxw4y8dz5bsM0wVtIxjQ/edit?tab=t.0',
};


// ── Radio Stations & Schedule ────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const STATIONS = [
  { id: 'point', name: 'The Point', freq: '91fm',                   color: '#f59e0b' },
  { id: 'two',   name: '2.0',       freq: 'The Next Level of Radio', color: '#ef4444' },
];

// ── Timing Policy ────────────────────────────────────────────
// Basketball: Media Row 45 min before tip-off · Door 33 unlocks 30 min earlier (75 min before)
// Football:   Press Box 60 min before kickoff · Door 33 unlocks 30 min earlier (90 min before)
const ARRIVAL_MINS          = { basketball_boys: 45, basketball_girls: 45, football: 60 };
const ARRIVAL_DEFAULT_MINS  = 60;
const DOOR_EXTRA_MINS       = 30;
const ARRIVAL_LABEL         = { basketball_boys: 'Media Row', basketball_girls: 'Media Row', football: 'Press Box' };
const ARRIVAL_DEFAULT_LABEL = 'Crew Call';

// ── Basketball Home Games 2026–2027 ──────────────────────────
const BASKETBALL_HOME_GAMES = [
  { id: 'bb26-1121', title: 'Boys Basketball Scrimmage vs. Blackford',       date: '2026-11-21', type: 'basketball_boys', gameTime: '11:00 AM', roles: {}, checks: {}, notes: 'Scrimmage — Spartan Arena' },
  { id: 'bb26-1125', title: 'Boys Basketball vs. Huntington North',           date: '2026-11-25', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb26-1201', title: 'Boys Basketball vs. Leo High School',            date: '2026-12-01', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb26-1204', title: 'Boys Basketball vs. Warsaw High School',         date: '2026-12-04', type: 'basketball_boys', gameTime: '7:45 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb26-1211', title: 'Boys Basketball vs. Bishop Dwenger',             date: '2026-12-11', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb26-1229', title: 'Boys Basketball — Homestead Holiday Tournament', date: '2026-12-29', type: 'basketball_boys', gameTime: '5:30 PM',  roles: {}, checks: {}, notes: 'Homestead Holiday Tournament — Spartan Arena & Victory Gym — Games: 5:30 PM & 7:00 PM' },
  { id: 'bb26-1230', title: 'Boys Basketball — Homestead Holiday Tournament', date: '2026-12-30', type: 'basketball_boys', gameTime: '10:00 AM', roles: {}, checks: {}, notes: 'Homestead Holiday Tournament — Spartan Arena & Victory Gym — Games: 10:00 AM, 11:30 AM, 4:00 PM & 5:30 PM' },
  { id: 'bb27-0108', title: 'Boys Basketball vs. South Side',                 date: '2027-01-08', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb27-0112', title: 'Boys Basketball vs. Blackhawk Christian',        date: '2027-01-12', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb27-0122', title: 'Boys Basketball vs. North Side',                 date: '2027-01-22', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb27-0126', title: 'Boys Basketball vs. New Haven',                  date: '2027-01-26', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb27-0206', title: 'Boys Basketball vs. Oak Hill High School',       date: '2027-02-06', type: 'basketball_boys', gameTime: '1:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb27-0209', title: 'Boys Basketball vs. Wayne High School',          date: '2027-02-09', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb27-0212', title: 'Boys Basketball vs. Concordia High School',      date: '2027-02-12', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
];

// ── Football Home Games 2026 ──────────────────────────────────
const FOOTBALL_HOME_GAMES = [
  { id: 'fb26-0814', title: 'Football Scrimmage vs. Snider',        date: '2026-08-14', type: 'football', gameTime: '7:00 PM', roles: {}, checks: {}, notes: 'Scrimmage — Spartan Stadium' },
  { id: 'fb26-0821', title: 'Football vs. Westfield High School',   date: '2026-08-21', type: 'football', gameTime: '7:30 PM', roles: {}, checks: {}, notes: 'Spartan Stadium' },
  { id: 'fb26-0828', title: 'Football vs. Noblesville',             date: '2026-08-28', type: 'football', gameTime: '7:30 PM', roles: {}, checks: {}, notes: 'Spartan Stadium' },
  { id: 'fb26-0904', title: 'Football vs. South Side',              date: '2026-09-04', type: 'football', gameTime: '7:00 PM', roles: {}, checks: {}, notes: 'Spartan Stadium' },
  { id: 'fb26-0918', title: 'Football vs. Bishop Dwenger',          date: '2026-09-18', type: 'football', gameTime: '7:00 PM', roles: {}, checks: {}, notes: 'Spartan Stadium' },
  { id: 'fb26-1002', title: 'Football vs. Carroll High School',     date: '2026-10-02', type: 'football', gameTime: '7:00 PM', roles: {}, checks: {}, notes: 'Spartan Stadium' },
];

// ── Yearbook Coverage Events (derived from all home game arrays) ─

// ── Girls Varsity Basketball Home Games 2026–2027 ─────────────
const GIRLS_BASKETBALL_HOME_GAMES = [
  { id: 'gb26-1028', title: 'Girls Basketball Scrimmage vs. Penn',        date: '2026-10-28', type: 'basketball_girls', gameTime: '6:00 PM', roles: {}, checks: {}, notes: 'Scrimmage — Spartan Arena' },
  { id: 'gb26-1117', title: 'Girls Basketball vs. Norwell',               date: '2026-11-17', type: 'basketball_girls', gameTime: '7:30 PM', roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'gb26-1127', title: 'Girls Basketball vs. Bellmont',              date: '2026-11-27', type: 'basketball_girls', gameTime: '7:30 PM', roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'gb26-1211', title: 'Girls Basketball vs. Bishop Dwenger',        date: '2026-12-11', type: 'basketball_girls', gameTime: '6:00 PM', roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'gb26-1219', title: 'Girls Basketball vs. Hamilton Southeastern', date: '2026-12-19', type: 'basketball_girls', gameTime: '3:30 PM', roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'gb27-0102', title: 'Girls Basketball vs. North Central HS',      date: '2027-01-02', type: 'basketball_girls', gameTime: '2:30 PM', roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'gb27-0108', title: 'Girls Basketball vs. Whitko',                date: '2027-01-08', type: 'basketball_girls', gameTime: '6:00 PM', roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'gb27-0113', title: 'Girls Basketball vs. Oak Hill High School',  date: '2027-01-13', type: 'basketball_girls', gameTime: '7:30 PM', roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'gb27-0119', title: 'Girls Basketball vs. Warsaw High School',    date: '2027-01-19', type: 'basketball_girls', gameTime: '7:30 PM', roles: {}, checks: {}, notes: 'Spartan Arena' },
];

// ── Special Events ────────────────────────────────────────────
// Dates marked TBD are estimates — update when school publishes the official calendar
const SPECIAL_EVENTS = [
  // Fall
  // broadcastWorthy: false — Yearbook still covers these for photos, but Homestead Live doesn't broadcast them.
  { id: 'hc26-1003d',  title: 'Homecoming Dance',      date: '2026-10-03', type: 'dance',      gameTime: '7:00 PM',  roles: {}, checks: {}, notes: 'Date TBD — update when confirmed', broadcastWorthy: false },
  { id: 'nhs26-1015',  title: 'NHS Induction',         date: '2026-10-15', type: 'nhs',        gameTime: '',         roles: {}, checks: {}, notes: 'Date TBD — update when confirmed', broadcastWorthy: false },
  // Spring
  { id: 'prom27-0501', title: 'Prom',                  date: '2027-05-01', type: 'dance',      gameTime: '7:00 PM',  roles: {}, checks: {}, notes: 'Date TBD — update when confirmed', broadcastWorthy: false },
  { id: 'sc27-0219',   title: 'Show Choir Showcase',   date: '2027-02-19', type: 'showchoir',  gameTime: '',         roles: {}, checks: {}, notes: 'TBD — time to be announced' },
  { id: 'sc27-0220',   title: 'Show Choir Showcase',   date: '2027-02-20', type: 'showchoir',  gameTime: '',         roles: {}, checks: {}, notes: 'TBD — time to be announced' },
  { id: 'grad27-0607', title: 'Graduation',             date: '2027-06-07', type: 'graduation', gameTime: '',         roles: {}, checks: {}, notes: 'TBD — time to be announced' },
];

const YB_ICONS = { football: '🏈', basketball_boys: '🏀', basketball_girls: '🏀', volleyball: '🏐', volleyball_boys: '🏐', soccer_boys: '⚽', soccer_girls: '⚽', golf_boys: '⛳', golf_girls: '⛳', baseball: '⚾', softball: '🥎', cross_country: '🏃', swimming: '🏊', tennis_boys: '🎾', tennis_girls: '🎾', track: '🏃', wrestling: '🤼', gymnastics: '🤸', lacrosse_boys: '🥍', lacrosse_girls: '🥍', bowling_boys: '🎳', bowling_girls: '🎳', dance_team: '💃', cheer: '📣', showchoir: '🎤', arts: '🎭', fine_arts: '🎨', nhs: '🎓', dance: '🪩', school: '🏫', academic: '🏆', club: '🏅', graduation: '🎓', other: '📸', marching_band: '🥁', jazz_band: '🎺', color_guard: '🎨', indoor_percussion: '🥁', winter_guard: '🎀', homecoming: '🎊', orchestra: '🎻', theater: '🎭', elite_choir: '🎵', speech_debate: '🗣️', robotics: '🤖', student_gov: '🏛️', prom: '🎩', key_club: '🔑' };
const YEARBOOK_EVENTS = [
  ...FOOTBALL_HOME_GAMES,
  ...BASKETBALL_HOME_GAMES,
  ...GIRLS_BASKETBALL_HOME_GAMES,
  ...SPECIAL_EVENTS,
].map(e => ({ ...e, icon: YB_ICONS[e.type] || '📅' }));

// ── IASB Competition ──────────────────────────────────────────
const IASB_SEASON   = '2026–2027';
const IASB_DEADLINE = '2027-02-05'; // update if IASB announces a different date

// Change this to whatever PIN you want — students should not know it
const TEACHER_PIN = '2027';

// Paste the deployed Apps Script web app URL here (see Code.gs for setup instructions)
const SYNC_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwH9agFB6OR5nPBGKWB7h0_xRq8HR-kdHcd5lo2xZSX5s36qcoWbjZ3UVrr0i-xnzpC/exec';

// Google Calendar API — reads calendars directly (no Apps Script needed)
// HHS Media Events = everything happening at school (Yearbook coverage candidates)
const HHS_MEDIA_CAL_ID  = '2b9bdfdee65f7330d8d5d2fd1d4877c1b709289fa0b0747427f57fd62516bed5@group.calendar.google.com';
// "Homestead Live Event Calendar" = only the games/events Homestead Live will actually broadcast
const HOMESTEAD_LIVE_CAL_ID = 'thepoint91fm@gmail.com';
const GOOGLE_CAL_API_KEY = 'AIzaSyCy5ZKtIjrF1lgDojmYgDlxit2Te7SKyeU';

// ── Homestead Live — Broadcast Rundown Templates ─────────────
const RUNDOWN_TEMPLATES = {
  football: [
    { slug: 'PRE-SHOW',          pbp: '', color: '', gfx: 'GFX: WAITING-SCREEN',  cam: 'Wide field establishing' },
    { slug: 'SPONSOR OPEN',      pbp: '', color: '', gfx: 'GFX: SPONSOR-OPEN',    cam: '' },
    { slug: 'OPEN / WELCOME',    pbp: '', color: '', gfx: 'LOGO BUG ON',           cam: 'Broadcast desk 2-shot' },
    { slug: 'WEATHER',           pbp: '', color: '', gfx: 'GFX: WEATHER',          cam: '' },
    { slug: 'STARTING LINEUP',   pbp: '', color: '', gfx: 'GFX: STARTING-LINEUP', cam: 'CU head coach' },
    { slug: 'COIN TOSS',         pbp: '', color: '', gfx: '',                      cam: 'Wide field — coin toss' },
    { slug: 'KICKOFF',           pbp: '', color: '', gfx: 'SCOREBUG ON',           cam: 'Wide kick' },
    { slug: 'TO BREAK 1',        pbp: '', color: '', gfx: 'GFX: TO-BREAK',         cam: 'CU PBP' },
    { slug: 'OUT OF BREAK 1',    pbp: '', color: '', gfx: 'SCOREBUG ON',           cam: 'Wide field' },
    { slug: 'TO BREAK 2',        pbp: '', color: '', gfx: 'GFX: TO-BREAK',         cam: 'CU PBP' },
    { slug: 'HALFTIME OPEN',     pbp: '', color: '', gfx: 'GFX: HALFTIME',         cam: 'Wide field' },
    { slug: 'HALFTIME STATS',    pbp: '', color: '', gfx: 'GFX: HALFTIME-STATS',   cam: '2-shot desk' },
    { slug: 'SAC MATCHUPS',      pbp: '', color: '', gfx: 'GFX: SAC-MATCHUPS',     cam: '' },
    { slug: 'SECOND HALF KICK',  pbp: '', color: '', gfx: 'SCOREBUG ON',           cam: 'Wide kick' },
    { slug: 'TO BREAK 3',        pbp: '', color: '', gfx: 'GFX: TO-BREAK',         cam: 'CU PBP' },
    { slug: 'OUT OF BREAK 3',    pbp: '', color: '', gfx: 'SCOREBUG ON',           cam: 'Wide field' },
    { slug: 'TO BREAK 4',        pbp: '', color: '', gfx: 'GFX: TO-BREAK',         cam: 'CU PBP' },
    { slug: 'FINAL',             pbp: '', color: '', gfx: 'GFX: FINAL-SCORE',      cam: 'Wide field celebration' },
    { slug: 'NEXT BROADCAST',    pbp: '', color: '', gfx: 'GFX: NEXT-BROADCAST',   cam: '' },
  ],
  basketball_boys: [
    { slug: 'PRE-SHOW',          pbp: '', color: '', gfx: 'GFX: WAITING-SCREEN',  cam: 'Wide arena establishing' },
    { slug: 'SPONSOR OPEN',      pbp: '', color: '', gfx: 'GFX: SPONSOR-OPEN',    cam: '' },
    { slug: 'OPEN / WELCOME',    pbp: '', color: '', gfx: 'LOGO BUG ON',           cam: 'Broadcast desk 2-shot' },
    { slug: 'STARTING LINEUP',   pbp: '', color: '', gfx: 'GFX: STARTING-LINEUP', cam: 'CU head coach' },
    { slug: 'KEYS TO THE GAME',  pbp: '', color: '', gfx: '',                      cam: 'CU color' },
    { slug: 'TIP-OFF',           pbp: '', color: '', gfx: 'SCOREBUG ON',           cam: 'Wide court' },
    { slug: 'TO BREAK 1',        pbp: '', color: '', gfx: 'GFX: TO-BREAK',         cam: 'CU PBP' },
    { slug: 'OUT OF BREAK 1',    pbp: '', color: '', gfx: 'SCOREBUG ON',           cam: 'Wide court' },
    { slug: 'TO BREAK 2',        pbp: '', color: '', gfx: 'GFX: TO-BREAK',         cam: 'CU PBP' },
    { slug: 'HALFTIME OPEN',     pbp: '', color: '', gfx: 'GFX: HALFTIME',         cam: 'Wide court' },
    { slug: 'HALFTIME STATS',    pbp: '', color: '', gfx: 'GFX: HALFTIME-STATS',   cam: '2-shot desk' },
    { slug: 'SECOND HALF TIP',   pbp: '', color: '', gfx: 'SCOREBUG ON',           cam: 'Wide court' },
    { slug: 'TO BREAK 3',        pbp: '', color: '', gfx: 'GFX: TO-BREAK',         cam: 'CU PBP' },
    { slug: 'OUT OF BREAK 3',    pbp: '', color: '', gfx: 'SCOREBUG ON',           cam: 'Wide court' },
    { slug: 'TO BREAK 4',        pbp: '', color: '', gfx: 'GFX: TO-BREAK',         cam: 'CU PBP' },
    { slug: 'FINAL',             pbp: '', color: '', gfx: 'GFX: FINAL-SCORE',      cam: 'Wide celebration' },
    { slug: 'NEXT BROADCAST',    pbp: '', color: '', gfx: 'GFX: NEXT-BROADCAST',   cam: '' },
  ],
  volleyball: [
    { slug: 'PRE-SHOW',           pbp: '', color: '', gfx: 'GFX: WAITING-SCREEN',  cam: 'Wide gym establishing' },
    { slug: 'OPEN / WELCOME',     pbp: '', color: '', gfx: 'LOGO BUG ON',           cam: 'Broadcast desk 2-shot' },
    { slug: 'STARTING LINEUP',    pbp: '', color: '', gfx: 'GFX: STARTING-LINEUP', cam: 'CU head coach' },
    { slug: 'KEYS TO THE MATCH',  pbp: '', color: '', gfx: '',                      cam: 'CU color' },
    { slug: 'SET 1 BEGIN',        pbp: '', color: '', gfx: 'SCOREBUG ON',           cam: 'Wide court' },
    { slug: 'BETWEEN SETS 1–2',   pbp: '', color: '', gfx: 'GFX: SET-SCORE',        cam: '2-shot desk' },
    { slug: 'SET 2 BEGIN',        pbp: '', color: '', gfx: 'SCOREBUG ON',           cam: 'Wide court' },
    { slug: 'BETWEEN SETS 2–3',   pbp: '', color: '', gfx: 'GFX: SET-SCORE',        cam: '2-shot desk' },
    { slug: 'SET 3 BEGIN',        pbp: '', color: '', gfx: 'SCOREBUG ON',           cam: 'Wide court' },
    { slug: 'MATCH FINAL',        pbp: '', color: '', gfx: 'GFX: FINAL-SCORE',      cam: 'Wide celebration' },
    { slug: 'NEXT BROADCAST',     pbp: '', color: '', gfx: 'GFX: NEXT-BROADCAST',   cam: '' },
  ],
  _default: [
    { slug: 'PRE-SHOW',       pbp: '', color: '', gfx: 'GFX: WAITING-SCREEN', cam: 'Wide establishing' },
    { slug: 'OPEN / WELCOME', pbp: '', color: '', gfx: 'LOGO BUG ON',         cam: 'Broadcast desk 2-shot' },
    { slug: 'START',          pbp: '', color: '', gfx: 'SCOREBUG ON',          cam: 'Wide' },
    { slug: 'TO BREAK',       pbp: '', color: '', gfx: 'GFX: TO-BREAK',        cam: 'CU PBP' },
    { slug: 'FINAL',          pbp: '', color: '', gfx: 'GFX: FINAL-SCORE',     cam: '' },
    { slug: 'NEXT BROADCAST', pbp: '', color: '', gfx: 'GFX: NEXT-BROADCAST',  cam: '' },
  ],
};
RUNDOWN_TEMPLATES.basketball_girls = RUNDOWN_TEMPLATES.basketball_boys;

// ── Homestead Live — Quick Links ──────────────────────────────
const LIVE_QUICK_LINKS = [
  { heading: '📅 Calendar', links: [
    { label: 'Add to Google Calendar', url: 'https://calendar.google.com/calendar/embed?src=thepoint91fm%40gmail.com&ctz=America%2FIndiana%2FIndianapolis' },
    { label: 'iCal / Apple Calendar', url: 'https://calendar.google.com/calendar/ical/thepoint91fm%40gmail.com/public/basic.ics' },
  ]},
  { heading: '📋 Production Sheets', links: [
    { label: 'Boys Basketball', url: 'https://docs.google.com/document/d/1vGGuJxumEk0B6Br0VR4iZt4GV3A6LAm0Ebg-uZ67IBQ/edit?usp=drive_link' },
    { label: 'Girls Basketball', url: 'https://docs.google.com/document/d/1lp7vD4rdBB18dNg9VU99TwFGxw4y8dz5bsM0wVtIxjQ/edit?usp=drive_link' },
    { label: 'Football', url: 'https://docs.google.com/document/d/1Bp_Yg7c97YroLEQ264LyM2G7qDAuBgrFn27TrM0Ont8/edit?usp=drive_link' },
    { label: 'Volleyball', url: 'https://docs.google.com/document/d/1fkT8ySHm13vNjJWUsjT0vj6lf1_vEt4XxH0c7t7ceCY/edit?usp=drive_link' },
  ]},
  { heading: '📊 Spot Charts', links: [
    { label: 'Football', url: 'https://docs.google.com/spreadsheets/d/1zEtSXB_eoldnErFlL8IY62f8iVDAeGkcbYhANM8bfF8/edit?gid=1232846000#gid=1232846000' },
    { label: 'Boys Basketball', url: 'https://docs.google.com/spreadsheets/d/1TAqanNcbNq-_2LSBR8WbrLKku5SYIuXB3KLQ3bee5vg/edit#gid=684224407' },
    { label: 'Girls Basketball', url: 'https://docs.google.com/spreadsheets/d/10wpNX-SLpU4jtjBTXlI7W2CZcXNeu0c6eYnd-2SR3KA/edit?gid=1847088814' },
    { label: 'Volleyball', url: 'https://docs.google.com/spreadsheets/d/1xooug44OmFHuxMvN44Y0bpYwH6HB13h1f8_m1dGURok/edit?gid=1847088814' },
  ]},
  { heading: '📁 Google Drive', links: [
    { label: 'Assets (Logos, Stock, Stats)', url: 'https://drive.google.com/drive/u/0/folders/0AKKODezhtTg2Uk9PVA' },
    { label: 'Homestead Live CLASS', url: 'https://drive.google.com/drive/u/0/folders/0AJfm1_t6EpJjUk9PVA' },
    { label: 'Livestream Computer (Completed Graphics)', url: 'https://drive.google.com/drive/u/0/folders/0AMt6Hze2xzJPUk9PVA' },
    { label: 'Graphic Checklist & Schedule', url: 'https://docs.google.com/spreadsheets/d/1erBfJz-t7TNa8LV4mhjJUrVf7WWKnaXcTkRqpFqFNKQ/edit?gid=740781133' },
    { label: 'Safe Area Templates', url: 'https://drive.google.com/drive/folders/1Au4CFu82rCkzyhEPzzHPjWtA9nSX2vxk?usp=drive_link' },
    { label: 'Style Guide PDF', url: 'https://drive.google.com/file/d/1dMTaMixqSfk8yHo9ShjAhlK6whOMa0qC/view' },
  ]},
  { heading: '📈 Stats & Scores', links: [
    { label: 'MaxPreps — All Sports', url: 'https://www.maxpreps.com/in/fort-wayne/homestead-spartans/' },
    { label: 'Football Rankings & Standings', url: 'https://scoreboard.homestead.com/football/teams.htm' },
    { label: 'Boys Basketball Rankings', url: 'http://www.johnharrell.net/boys.html' },
    { label: 'Girls Basketball Rankings', url: 'https://indianagirlsbasketball.homestead.com/' },
    { label: 'Area Scores Spreadsheet', url: 'https://docs.google.com/spreadsheets/d/1WuJgWJoVVqDaPKLueE71wMRttiowiHx8j46Rcl3Dkmw/edit?gid=508178785' },
    { label: 'W/L History (Basketball & Football)', url: 'https://docs.google.com/spreadsheets/d/1BPFhuh1XOj04DvI6R4uMMxHZ1gnSjvu0goEudoaVnuI/copy' },
  ]},
  { heading: '🎨 Style Resources', links: [
    { label: 'Transparent Textures', url: 'https://www.transparenttextures.com/' },
    { label: 'Poly Haven Textures', url: 'https://polyhaven.com/textures' },
  ]},
  { heading: '📺 YouTube', links: [
    { label: 'Homestead High School Media', url: 'https://www.youtube.com/c/homesteadhighschoolmedia' },
  ]},
];

// ── Yearbook — Shared Drive top-level folders ─────────────────
const YEARBOOK_QUICK_LINKS = [
  { heading: '🎤 Interviews', links: [
    { label: 'Fall Interviews',   url: 'https://drive.google.com/drive/folders/1Ilk2PNF2UflI3FVszqaoW5KP6b8vhyRN' },
    { label: 'Winter Interviews', url: 'https://drive.google.com/drive/folders/1X0q5E58VSsvoJmrg7teOgIdkHX-j2NQ4' },
    { label: 'Spring Interviews', url: 'https://drive.google.com/drive/folders/1io_wUtcBCwurUq4oHY60BO7bt4nXwIpq' },
    { label: 'Summer Interviews', url: 'https://drive.google.com/drive/folders/1ZBCRNJnNXldptwonhy9g6ex4yLQOp2Ej' },
  ]},
  { heading: '🏆 Sports', links: [
    { label: 'Fall Sports',   url: 'https://drive.google.com/drive/folders/1X9RKMsRk3SGH1_HOn1wnWbkVrNpDObxM' },
    { label: 'Winter Sports', url: 'https://drive.google.com/drive/folders/166T7cilJyZURsyYHDkI4SppHiYghO4vj' },
    { label: 'Spring Sports', url: 'https://drive.google.com/drive/folders/1v6b9bZdGjL1tAuTG_gAJwwDsvLwT3Zhe' },
    { label: 'Summer Sports', url: 'https://drive.google.com/drive/folders/1FJF2intrWzNNnaKp9GUXDrajMNQ3oDCD' },
  ]},
  { heading: '🎓 Academics & Arts', links: [
    { label: 'Academics',        url: 'https://drive.google.com/drive/folders/1QdUwW5NxSqfCtJB7F2vaTgfl4BtH2Ohu' },
    { label: 'Performing Arts',  url: 'https://drive.google.com/drive/folders/1EsV-KCPO8xGnz7bqej5I4HHv1uYH53RS' },
  ]},
  { heading: '👥 People & Groups', links: [
    { label: 'Student Life / People', url: 'https://drive.google.com/drive/folders/1OtZ_Y-AJafX8wosuqwLym35RUWo7O14i' },
    { label: 'Clubs & Orgs',          url: 'https://drive.google.com/drive/folders/12YmVmvUf7FHA-GP-VLbcbmJ72GH9fmo2' },
    { label: 'Portrait IDs',          url: 'https://drive.google.com/drive/folders/1QJ2woiPecyO6A1XTIy332bqvM_Gpd5CW' },
    { label: 'Groups Photos and IDs', url: 'https://drive.google.com/drive/folders/1mxbUaMb_0o9v0TlayPuTWip5f17onF3Y' },
  ]},
  { heading: '📅 Events & Extras', links: [
    { label: 'Events and Schedules',  url: 'https://drive.google.com/drive/folders/1oP5zIUpuGviRDNfF0EneBCHSE9-8LjRz' },
    { label: 'Sports Scoreboards',    url: 'https://drive.google.com/drive/folders/1AzJwxquTuLgCH0iljXGKESJ5MLsTIniC' },
    { label: 'Additional Resources',  url: 'https://drive.google.com/drive/folders/1nfO7mLO7iNgRBuxKe70tmhWZGklIDWIe' },
    { label: 'Socials',               url: 'https://drive.google.com/drive/folders/1nFCUCkvSGPTzYKwkiUNPbXYZjYH1i7dL' },
    { label: 'Miscellaneous',         url: 'https://drive.google.com/drive/folders/1RSh2YvHNKrkeiYloKUCqOe-fidjBT1Ba' },
  ]},
];

// ── Homestead Live — Graphics Checklists per sport ────────────
const BROADCAST_CHECKLISTS = {
  football: [
    { id: 'fb-scoreboard',  label: 'Main Scoreboard',        sub: 'Record Overall · Conference · State Standing' },
    { id: 'fb-schedule',    label: 'Home & Away Schedule',   sub: 'Scores + W/L for each played game' },
    { id: 'fb-establishing',label: 'Establishing Graphic',   sub: 'Record Overall · State Standing' },
    { id: 'fb-lastgame',    label: 'Home & Away Last Game',  sub: 'Score · Star Player Highlight Stat' },
    { id: 'fb-coach',       label: 'Home & Away Coach',      sub: 'Overall record' },
    { id: 'fb-player',      label: 'Player Lower 3rd',       sub: 'Name · Position · Grade · Number · Stats' },
    { id: 'fb-broadcast',   label: 'Broadcast Team',         sub: 'All talent names' },
    { id: 'fb-sac',         label: 'SAC Standings',          sub: 'Both divisions · Conference + Overall record' },
    { id: 'fb-waiting',     label: 'Waiting Screen',         sub: 'Updated footage from this season' },
    { id: 'fb-thumbnail',   label: 'YouTube Thumbnail',      sub: '' },
    { id: 'fb-matchups',    label: 'SAC Matchups',           sub: '' },
    { id: 'fb-nextgame',    label: 'Next Broadcast',         sub: '' },
    { id: 'fb-tobreak',     label: 'To Break Scoreboard',    sub: '' },
    { id: 'fb-stats',       label: 'Stats Graphic',          sub: '' },
    { id: 'fb-weather',     label: 'Weather',                sub: '' },
    { id: 'fb-touchdown',   label: 'Touchdown Graphic',      sub: '' },
    { id: 'fb-areascores',  label: 'Area Scores',            sub: '' },
  ],
  basketball_boys: [
    { id: 'bb-scoreboard',  label: 'Main Scoreboard',        sub: 'Record Overall · Conference · State Standing' },
    { id: 'bb-last5',       label: 'Home & Away Last 5',     sub: 'Scores + W/L' },
    { id: 'bb-sac',         label: 'SAC Standings',          sub: '' },
    { id: 'bb-lastgames',   label: 'Home & Away Last Games', sub: '' },
    { id: 'bb-establishing',label: 'Establishing Graphic',   sub: '' },
    { id: 'bb-nextgame',    label: 'Next Game',              sub: '' },
    { id: 'bb-coach',       label: 'Home & Away Coach',      sub: '' },
    { id: 'bb-lineup',      label: 'Starting Lineup',        sub: '' },
    { id: 'bb-broadcast',   label: 'Broadcasters',           sub: 'All talent names' },
    { id: 'bb-tobreak',     label: 'To Break Scoreboard',    sub: '' },
    { id: 'bb-stats',       label: 'Game Stats',             sub: '' },
    { id: 'bb-thumbnail',   label: 'YouTube Thumbnail',      sub: '' },
    { id: 'bb-aroundsac',   label: 'Around SAC',             sub: '' },
    { id: 'bb-freethrow',   label: 'Free Throw Graphic',     sub: 'Home & Away' },
    { id: 'bb-areascores',  label: 'Area Scores',            sub: '' },
  ],
  basketball_girls: [
    { id: 'bg-scoreboard',  label: 'Main Scoreboard',        sub: 'Record Overall · Conference · State Standing' },
    { id: 'bg-last5',       label: 'Home & Away Last 5',     sub: 'Scores + W/L' },
    { id: 'bg-sac',         label: 'SAC Standings',          sub: '' },
    { id: 'bg-lastgames',   label: 'Home & Away Last Games', sub: '' },
    { id: 'bg-establishing',label: 'Establishing Graphic',   sub: '' },
    { id: 'bg-nextgame',    label: 'Next Game',              sub: '' },
    { id: 'bg-coach',       label: 'Home & Away Coach',      sub: '' },
    { id: 'bg-lineup',      label: 'Starting Lineup',        sub: '' },
    { id: 'bg-broadcast',   label: 'Broadcasters',           sub: 'All talent names' },
    { id: 'bg-tobreak',     label: 'To Break Scoreboard',    sub: '' },
    { id: 'bg-stats',       label: 'Game Stats',             sub: '' },
    { id: 'bg-thumbnail',   label: 'YouTube Thumbnail',      sub: '' },
    { id: 'bg-aroundsac',   label: 'Around SAC',             sub: '' },
    { id: 'bg-freethrow',   label: 'Free Throw Graphic',     sub: 'Home & Away' },
    { id: 'bg-areascores',  label: 'Area Scores',            sub: '' },
  ],
  volleyball: [
    { id: 'vb-scoreboard',  label: 'Main Scoreboard',        sub: 'Record Overall' },
    { id: 'vb-last5',       label: 'Home & Away Last 5',     sub: 'Scores + W/L' },
    { id: 'vb-establishing',label: 'Establishing Graphic',   sub: 'Record Overall' },
    { id: 'vb-coach',       label: 'Home & Away Coach',      sub: 'Name · Overall record' },
    { id: 'vb-starplayer',  label: 'Home & Away Star Player',sub: 'Name · Year · Position' },
    { id: 'vb-lineup',      label: 'Starting Lineup',        sub: 'Name · Number · Position · Grade' },
    { id: 'vb-broadcast',   label: 'Broadcasters',           sub: 'All talent names' },
    { id: 'vb-previous',    label: 'Previous Match Results', sub: 'Teams · Date · Scores' },
    { id: 'vb-tobreak',     label: 'Current Match — To Break', sub: '' },
    { id: 'vb-nextgame',    label: 'Next Game',              sub: '' },
    { id: 'vb-thumbnail',   label: 'YouTube Thumbnail',      sub: '' },
  ],
};

// Google Drive folder links — Dropbox 2027 in Audio Broadcasting shared drive
const IASB_DROPBOX_URL = 'https://drive.google.com/drive/folders/1Kg4UYcKzOLNYYqoEOG3fo2xbwNQtZCIY';

const IASB_DRIVE_FOLDERS = {
  // Radio
  R1: 'https://drive.google.com/drive/folders/1hbQe5g66WZdA8yGVZLv4UsU319rKsU0_',
  R2: 'https://drive.google.com/drive/folders/1lfZdA9ZWW4B-Dh9rymSHmATpVG-xS3i1',
  R3: 'https://drive.google.com/drive/folders/1Chda-yLZFyUwd6h7ftyeRFfl7wlaTIdR',
  R4: 'https://drive.google.com/drive/folders/1D95DC1TEN8ycisRi-tSigcnODfnQBNso',
  R5: 'https://drive.google.com/drive/folders/1UXqCTtVaujtEFYzC57f7BClBCQ6S4chR',
  R6: 'https://drive.google.com/drive/folders/1-lkafPeyTOayCpgUdzef_GWzXv7k1iaL',
  R7: 'https://drive.google.com/drive/folders/1MBicWR2Y-UulSdkIqttdqB_EkTwl2Xpm',
  R8: 'https://drive.google.com/drive/folders/1fR3WoNs5VfiY6jBorian4eORBbyGBwcW',
  R9: 'https://drive.google.com/drive/folders/1TbYun0vlO3-E1-ZKGVbqO8woy419RRM_',
  // News
  N1: 'https://drive.google.com/drive/folders/1I99LTA5bs-1ziPLSnlYYWzUA4VsoXXrJ',
  N2: 'https://drive.google.com/drive/folders/1xR9lcWruFXP55vzsIMDGrS4mz2pFLRWR',
  N3: 'https://drive.google.com/drive/folders/1Qhbbp4u3FTUD3HOGiQU7KaA2MininOrl',
  N4: 'https://drive.google.com/drive/folders/18rOtbPAC75tauOKJH9nQyyUsftFxUUC9',
  N5: 'https://drive.google.com/drive/folders/1U2Fx9YXrxNNDjjN0v4F4UA2o8bbTkQVr',
  N6: 'https://drive.google.com/drive/folders/1cSHJiZMvX1o5PmMownlHBrE5Q1-Pna7c',
  N7: 'https://drive.google.com/drive/folders/1J7_LsMHZPWTbVRjj6nAM64lkB2i1SzM2',
  N8: 'https://drive.google.com/drive/folders/1OXer9j04zzv1SN5CKS1-Q5pCfEUKQBLt',
  // Sports
  S1: 'https://drive.google.com/drive/folders/1fW1Dg0n6v2m2KFBs28s-LSsHeY8eRYAd',
  S2: 'https://drive.google.com/drive/folders/1Kww8NYoTAcwapQYo96EoZO8fjS3WPOca',
  S3: 'https://drive.google.com/drive/folders/1p-Ec5m8U1w2Z0yVCVjr3yniYZ9M8NLhI',
  S4: 'https://drive.google.com/drive/folders/1sY7FyennEVlFXotKaWCK7-nqmWDHUXr0',
  S5: 'https://drive.google.com/drive/folders/1WuwAps6tIXegvs2ixSi5kZQH_3amEORI',
  S6: 'https://drive.google.com/drive/folders/1sfVup-YAOtHYkm48WfOjI5Q7NxREFM-O',
  S7: 'https://drive.google.com/drive/folders/1RzEPnl7Ew35qF1PHHor66JT8hMno_JB9',
  S8: 'https://drive.google.com/drive/folders/1tFVweCwJ_CBbvzdk6AgPteDvJekacsDs',
  S9: 'https://drive.google.com/drive/folders/14kc_uRpNZbbu96Su6cuQPx68hhTakHby',
  // Video
  V1: 'https://drive.google.com/drive/folders/1V4xPfsejx5HNJrLnFCVbQVfUD_NVby0w',
  V2: 'https://drive.google.com/drive/folders/13fp8Sts3hfiaLJR4QzfYReiQlscKoHTH',
  V3: 'https://drive.google.com/drive/folders/1YnuSnprA0kAJkwuEOu88ZBIlrteDiOT8',
  V4: 'https://drive.google.com/drive/folders/1-F3n-pmzySpyDY3eB2GiTxZfNero6v4G',
  V5: 'https://drive.google.com/drive/folders/1IUR-p16lYRxJc7Ie9VoJ0l0_37IUgVq4',
  V6: 'https://drive.google.com/drive/folders/1iy8fewFAzOe-Zag7xv_nwyvVA9ZLNBxF',
  V7: 'https://drive.google.com/drive/folders/1wXIKhiDh49fcxR13RJM03ECW2sDPudCq',
  V8: 'https://drive.google.com/drive/folders/1phxJAxJGqv2dg-SzavV1Go6b3pVzQQVz',
  V9: 'https://drive.google.com/drive/folders/19nFKUgqKxwXm8TccSGBfIfaxM7bl3ENI',
  // Emerging Media
  M1: 'https://drive.google.com/drive/folders/1494gueNc4L0l7yIQlvPE0qkIFwXjsO78',
  M2: 'https://drive.google.com/drive/folders/15EAddetFwuyODzHRRkSO4JGa5souZhAQ',
  M3: 'https://drive.google.com/drive/folders/1K20xhwUEAmbCdIodrYRdcfUIROey1GOZ',
  M4: 'https://drive.google.com/drive/folders/17jzYthFMtSxo92bm0eUmRUVsTzRwMFGv',
  M5: 'https://drive.google.com/drive/folders/1dx5UHAXtGct7DYwk0OIqoPc17EyXg7Tq',
  M6: 'https://drive.google.com/drive/folders/1MD2v5hBFikJCgZe3fgRuMJ5TQMf_iny_',
  M7: 'https://drive.google.com/drive/folders/1ggz6IV_RzRH-kV7cbllWN9ER-4wRPifw',
  M8: 'https://drive.google.com/drive/folders/1Al7h9YX9onmhCZoIx-aenWejf9BrcOax',
  M9: 'https://drive.google.com/drive/folders/1jddduuMlCr2fLm6_RDVxf45KDgaXG8Kx',
};

const IASB_CATEGORIES = [
  // ── Radio ────────────────────────────────────────────────────
  {
    code: 'R1', division: 'Radio', color: '#f59e0b',
    name: 'Air Personality', tag: 'LIVE Finals',
    perSchool: 99, solo: true,
    format: 'Scoped aircheck — music removed', length: '2–3 min', fileFormat: '.mp3',
    description: 'Solo DJ performance. Showcase your voice, personality, content, and on-air delivery. The top 6 entries compete live at the state finals on 88.7 FM WICR.',
    criteria: ['Voice quality', 'Ad-libbing', 'Content', 'Energy & pacing', 'Branding', 'Audience connection'],
    checklist: [
      'Solo performance only — team shows enter R3 Radio Show instead',
      'Remove all music from your aircheck (scoped)',
      'Final length: 2 to 3 minutes — not shorter, not longer',
      'Shows consecutive air break(s) — no jump cuts between unrelated breaks',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'R2', division: 'Radio', color: '#f59e0b',
    name: 'Talk Show', tag: null,
    perSchool: 99, solo: false,
    format: 'Scoped aircheck', length: '5–7 min', fileFormat: '.mp3',
    description: 'Spoken-word, non-music program — opinions, reviews, interviews, or discussion. Sports-themed talk shows must enter S2 Sports Talk Show instead.',
    criteria: ['Knowledge & content', 'Ad-libbing', 'Intro of topic/guest', 'Energy & interaction', 'Delivery', 'Production elements', 'Branding'],
    checklist: [
      'Spoken-word only — no music-format shows (those enter R3 Radio Show)',
      'Scope your aircheck — remove any music beds',
      'Length: 5 to 7 minutes',
      'Features a variety of elements: opinion, interviews, or audience interaction',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'R3', division: 'Radio', color: '#f59e0b',
    name: 'Radio Show', tag: null,
    perSchool: 99, solo: false,
    format: 'Scoped aircheck — music removed', length: '5–7 min', fileFormat: '.mp3',
    description: 'Team entertainment program in music format. Solo performers must enter R1 Air Personality. Opinion or review programs must enter R2 Talk Show.',
    criteria: ['Content', 'Announcer interaction', 'Delivery', 'Audience connection', 'Production elements', 'Branding', 'Overall impression'],
    checklist: [
      'Team performance (2+ DJs) — solo DJ enters R1 Air Personality instead',
      'Entertainment / music-format show — opinion shows enter R2 Talk Show',
      'Remove all music from your aircheck (scoped)',
      'Length: 5 to 7 minutes',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'R4', division: 'Radio', color: '#f59e0b',
    name: 'Spot Production', tag: null,
    perSchool: 99, solo: true,
    format: 'Commercial, PSA, or station promo', length: ':30 or :60', fileFormat: '.mp3',
    description: 'Write and produce an original commercial, public service announcement, or station promotional spot. Exactly 30 or 60 seconds — timing is judged.',
    criteria: ['Concept', 'Production value', 'Opening hook', 'Voice & delivery', 'Script quality', 'Use of sound', 'Creativity', 'Timing'],
    checklist: [
      'Original content — commercial, PSA, or station promo',
      'Choose one length: :30 (:29.0–:30.0) OR :60 (:59.0–:60.0)',
      'All voice and production work done by students',
      'Verify exact timing before exporting',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'R5', division: 'Radio', color: '#f59e0b',
    name: 'Imaging', tag: 'School-Wide',
    perSchool: 99, solo: false,
    format: 'Collage of sweepers, drop-ins, promos, jingles', length: 'Max 2 min total', fileFormat: '.mp3',
    description: 'One entry per school. A collage of the station\'s imaging elements. Students must perform all voice work. Include multiple productions in a single file.',
    criteria: ['Branding consistency', 'Execution', 'Use of sound', 'Variety', 'Creativity', 'Production value', 'Voice performance', 'Pacing'],
    checklist: [
      'One entry per school — this is a collective station submission',
      'Students must perform all voice work',
      'Include multiple productions: sweepers, drop-ins, promos, and/or jingles',
      'Total combined length: 2 minutes or less',
      'Export as a single .mp3 collage file and upload',
    ]
  },
  {
    code: 'R6', division: 'Radio', color: '#f59e0b',
    name: 'Copywriting', tag: null,
    perSchool: 99, solo: true,
    format: 'Written script ONLY — no audio', length: 'Per client specs', fileFormat: '.pdf',
    description: 'Write a commercial script based on the IASB client fact sheet at IASBOnline.org. Submit a word-processed script only — no recorded audio.',
    criteria: ['Strong lead', 'Holding audience attention', 'Interest & desire', 'Delivering client\'s message', 'Call to action', 'Creativity', 'Timing'],
    checklist: [
      'Download the client fact sheet from IASBOnline.org',
      'Write script at the length specified by the client',
      'Script must list: talent roles, music & SFX notes, and production directions',
      'Complete and attach the IASB competition agreement form',
      'Submit word-processed script ONLY — no audio recording',
      'Export as .pdf and upload',
    ]
  },
  {
    code: 'R7', division: 'Radio', color: '#f59e0b',
    name: 'Interview', tag: null,
    perSchool: 99, solo: true,
    format: 'Audio interview', length: '2+ min', fileFormat: '.mp3',
    description: 'Conduct and record a real interview with a real person. No fictional characters. Audio from this entry cannot be re-entered as a Podcast (M3).',
    criteria: ['Introduction', 'Question order', 'Question quality & depth', 'Delivery & style', 'Conclusion'],
    checklist: [
      'Real interview — no fictional characters or dramatizations',
      'Cannot be submitted as a Podcast (M3) — those are separate entries',
      'Minimum length: 2 minutes',
      'Include a clear introduction that sets up the interview subject',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'R8', division: 'Radio', color: '#f59e0b',
    name: 'Adapted Drama', tag: null,
    perSchool: 99, solo: false,
    format: 'Audio drama from existing script', length: '5–15 min', fileFormat: '.mp3',
    description: 'Produce an audio drama based on an existing, non-student-written script. Two entries in this category must use two different scripts.',
    criteria: ['Opening', 'Delivery', 'Scene transitions', 'Vocal performance', 'Music & sound effects', 'Conclusion'],
    checklist: [
      'Must use an existing, non-student-written script',
      'Two entries must use two different scripts',
      'Length: 5 to 15 minutes',
      'Use music and/or sound effects to support the drama',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'R9', division: 'Radio', color: '#f59e0b',
    name: 'Original Drama', tag: null,
    perSchool: 99, solo: false,
    format: 'Audio drama from student-written script', length: '5–15 min', fileFormat: '.mp3',
    description: 'Write and produce an original audio drama. Students must write the script. Two entries must use two different original scripts.',
    criteria: ['Script quality', 'Opening', 'Delivery', 'Scene transitions', 'Vocal performance', 'Music & sound effects', 'Conclusion'],
    checklist: [
      'Script must be written by students — not from an existing work',
      'Two entries must use two different original scripts',
      'Length: 5 to 15 minutes',
      'Use music and/or sound effects to support the drama',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'N2', division: 'News', color: '#ef4444',
    name: 'Radio In-Depth', tag: null,
    perSchool: 99, solo: true,
    format: 'Audio news or feature story', length: '2+ min', fileFormat: '.mp3',
    description: 'In-depth audio coverage of a single news or feature topic. This is NOT a podcast — podcast entries must use M3. No fictional content.',
    criteria: ['Opening', 'Content', 'Delivery', 'Audio quality', 'Creativity', 'Credibility', 'Writing', 'Pacing', 'Closing'],
    checklist: [
      'Single-topic news or feature story — not a podcast format',
      'Cannot be re-entered as a Podcast (M3)',
      'Minimum length: 2 minutes',
      'Strong opening that establishes the story and its importance',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'M3', division: 'Emerging Media', color: '#8b5cf6',
    name: 'Podcast', tag: null,
    perSchool: 99, solo: false,
    format: 'Single episode from a series', length: '5–15 min', fileFormat: '.mp3 + .jpg',
    description: 'Submit one episode from an ongoing podcast series. Must also upload the show\'s cover art as a .jpg. Audio cannot be reused from a Vodcast (M4) entry.',
    criteria: ['Pre-planning', 'Opening', 'Storytelling', 'Creativity & originality', 'Production quality', 'Vocal performance', 'Closing'],
    checklist: [
      'Episode must come from an ongoing podcast series',
      'Audio cannot be reused from a Vodcast (M4) entry',
      'Length: 5 to 15 minutes',
      'Prepare show thumbnail / cover art as a .jpg file (required)',
      'Export audio as .mp3',
      'Upload BOTH the .mp3 audio AND the .jpg cover art',
    ]
  },

  // ── News ─────────────────────────────────────────────────────
  {
    code: 'N1', division: 'News', color: '#ef4444',
    name: 'Radio News Anchor', tag: 'LIVE Finals',
    perSchool: 99, solo: true,
    format: 'Scoped radio newscast', length: '2–3 min', fileFormat: '.mp3',
    description: 'Solo on-air anchor delivering a radio newscast. Showcase your delivery, credibility, and news judgment. Top entries compete live at the state finals.',
    criteria: ['Delivery & pacing', 'Writing quality', 'News judgment', 'Credibility', 'Broadcast style', 'Professionalism'],
    checklist: [
      'Solo performance only',
      'Real news content — no fictional stories',
      'Scope your aircheck — remove music beds',
      'Length: 2 to 3 minutes',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'N2', division: 'News', color: '#ef4444',
    name: 'Radio In-Depth', tag: null,
    perSchool: 99, solo: true,
    format: 'Audio news or feature story', length: '2+ min', fileFormat: '.mp3',
    description: 'In-depth audio coverage of a single news or feature topic. This is NOT a podcast — podcast entries must use M3. No fictional content.',
    criteria: ['Opening', 'Content', 'Delivery', 'Audio quality', 'Creativity', 'Credibility', 'Writing', 'Pacing', 'Closing'],
    checklist: [
      'Single-topic news or feature story — not a podcast format',
      'Cannot be re-entered as a Podcast (M3)',
      'Minimum length: 2 minutes',
      'Strong opening that establishes the story and its importance',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'N3', division: 'News', color: '#ef4444',
    name: 'TV News Anchor', tag: 'LIVE Finals',
    perSchool: 99, solo: true,
    format: 'Video newscast performance', length: '2–3 min', fileFormat: '.mp4',
    description: 'Solo on-camera anchor delivering a television newscast. Top entries compete live at the state finals. Showcase delivery, presence, and professionalism.',
    criteria: ['Delivery & presence', 'Writing quality', 'News judgment', 'On-camera appearance', 'Credibility', 'Eye contact & teleprompter use'],
    checklist: [
      'Solo anchor performance only',
      'Real news content — no fictional stories',
      'Clean, professional on-camera setup',
      'Length: 2 to 3 minutes',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'N4', division: 'News', color: '#ef4444',
    name: 'School Video Newscast', tag: null,
    perSchool: 99, solo: false,
    format: 'Full school video newscast', length: '5–15 min', fileFormat: '.mp4',
    description: 'A complete school video newscast produced and performed by students. Must include multiple news segments with anchors, reporters, and production elements.',
    criteria: ['Opening', 'News judgment', 'Anchor delivery', 'Technical quality', 'Production value', 'Story variety', 'Closing'],
    checklist: [
      'Multiple anchors or reporters involved',
      'Complete newscast format with intro, stories, and close',
      'At least 3 different news stories covered',
      'Length: 5 to 15 minutes',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'N5', division: 'News', color: '#ef4444',
    name: 'Video News Package', tag: null,
    perSchool: 99, solo: true,
    format: 'Edited video news story', length: '1:30–3 min', fileFormat: '.mp4',
    description: 'A self-contained video news story with reporter stand-up, interviews, and natural sound. Covers a single topic with strong journalistic structure.',
    criteria: ['News judgment', 'Stand-up delivery', 'Interview quality', 'Story structure', 'Writing & narration', 'Editing', 'Audio quality'],
    checklist: [
      'Single focused news topic',
      'Includes at least one stand-up',
      'At least one on-camera interview',
      'Natural/ambient sound present',
      'Length: 1:30 to 3 minutes',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'N6', division: 'News', color: '#ef4444',
    name: 'Video In-Depth', tag: null,
    perSchool: 99, solo: false,
    format: 'Long-form video news or feature', length: '3–10 min', fileFormat: '.mp4',
    description: 'In-depth video coverage of a single topic — investigative report or feature story. More comprehensive than a news package, with multiple sources and perspectives.',
    criteria: ['Research depth', 'Story importance', 'Interview quality', 'Editing', 'Narration', 'Production value', 'Multiple viewpoints'],
    checklist: [
      'Single in-depth topic — more thorough than a standard package',
      'Multiple sources or interviews required',
      'Strong narration and story structure',
      'Length: 3 to 10 minutes',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'N7', division: 'News', color: '#ef4444',
    name: 'Photojournalism', tag: null,
    perSchool: 99, solo: true,
    format: 'Single photo + 25-word caption', length: '1 image', fileFormat: '.jpg + .pdf',
    description: 'A single photojournalism image with a factual caption. Must be shot by the student. Judges on news value, composition, and the story the image tells.',
    criteria: ['News value', 'Composition', 'Technical quality', 'Caption accuracy & clarity', 'Story told in a single image'],
    checklist: [
      'Photo must be taken by the student',
      'No digital manipulation beyond basic exposure and cropping',
      'Write a factual 25-word caption identifying who, what, when, where',
      'Submit .jpg image AND .pdf caption document',
      'Upload BOTH files',
    ]
  },
  {
    code: 'N8', division: 'News', color: '#ef4444',
    name: 'Video Field Reporter', tag: null,
    perSchool: 99, solo: true,
    format: 'On-location reporter package', length: '1:30–3 min', fileFormat: '.mp4',
    description: 'On-location reporting with stand-up, interviews, and natural sound from the field. Focuses on the reporter\'s presence and storytelling ability on location.',
    criteria: ['Reporter presence', 'Stand-up quality', 'Interview depth', 'Natural sound use', 'Story structure', 'Editing'],
    checklist: [
      'Must be shot on location — not in a studio',
      'Includes at least one stand-up on location',
      'Natural/ambient sound present throughout',
      'At least one interview',
      'Length: 1:30 to 3 minutes',
      'Export and upload as .mp4',
    ]
  },

  // ── Sports ───────────────────────────────────────────────────
  {
    code: 'S1', division: 'Sports', color: '#10b981',
    name: 'Radio Sports Update', tag: null,
    perSchool: 99, solo: true,
    format: 'Short radio sports report', length: ':30–1:30', fileFormat: '.mp3',
    description: 'A concise radio sports update delivering scores, highlights, and sports news. Tight, factual, and well-delivered — like a real sportscast break.',
    criteria: ['Delivery', 'Content accuracy', 'Pacing', 'Organization', 'Credibility', 'Broadcast style'],
    checklist: [
      'Factual sports content — scores, highlights, upcoming events',
      'Concise and tightly written',
      'Length: :30 to 1:30',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'S2', division: 'Sports', color: '#10b981',
    name: 'Sports Talk Radio Show', tag: null,
    perSchool: 99, solo: false,
    format: 'Scoped sports talk aircheck', length: '5–7 min', fileFormat: '.mp3',
    description: 'A sports-themed talk show featuring analysis, opinion, discussion, or debate. Sports-focused content only — general talk shows enter R2 Talk Show.',
    criteria: ['Knowledge of subject', 'Delivery', 'Discussion quality', 'Production elements', 'Energy & interaction', 'Branding'],
    checklist: [
      'Sports-specific content only',
      'Scope your aircheck — remove music beds',
      'Length: 5 to 7 minutes',
      'Demonstrates knowledge of the sport or topic discussed',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'S3', division: 'Sports', color: '#10b981',
    name: 'Basketball Play-By-Play', tag: null,
    perSchool: 99, solo: false,
    format: 'Live audio broadcast excerpt', length: '5–10 min', fileFormat: '.mp3',
    description: 'Audio play-by-play and color commentary from a live basketball game. Judged on accuracy, energy, stat use, and the chemistry between partners.',
    criteria: ['Play-by-play accuracy', 'Color commentary', 'Energy & pace', 'Stat & context use', 'Flow between partners', 'Knowledge of game'],
    checklist: [
      'Must be from a real, live basketball game',
      'Continuous unedited excerpt — no jump cuts',
      'Includes both play-by-play and color commentary',
      'Length: 5 to 10 minutes',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'S4', division: 'Sports', color: '#10b981',
    name: 'Football Play-By-Play', tag: null,
    perSchool: 99, solo: false,
    format: 'Live audio broadcast excerpt', length: '5–10 min', fileFormat: '.mp3',
    description: 'Audio play-by-play and color commentary from a live football game. Judged on accuracy, energy, stat use, and the chemistry between partners.',
    criteria: ['Play-by-play accuracy', 'Color commentary', 'Energy & pace', 'Stat & context use', 'Flow between partners', 'Knowledge of game'],
    checklist: [
      'Must be from a real, live football game',
      'Continuous unedited excerpt — no jump cuts',
      'Includes both play-by-play and color commentary',
      'Length: 5 to 10 minutes',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'S5', division: 'Sports', color: '#10b981',
    name: 'Sporting Event Broadcast', tag: null,
    perSchool: 99, solo: false,
    format: 'Live audio broadcast excerpt', length: '5–10 min', fileFormat: '.mp3',
    description: 'Audio play-by-play and commentary from any sport other than football or basketball. Those sports enter S4 and S3 respectively.',
    criteria: ['Play-by-play accuracy', 'Knowledge of sport', 'Energy & pace', 'Stat & context use', 'Commentary quality'],
    checklist: [
      'Any sport except football (S4) or basketball (S3)',
      'Must be from a real, live sporting event',
      'Continuous unedited excerpt — no jump cuts',
      'Length: 5 to 10 minutes',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'S6', division: 'Sports', color: '#10b981',
    name: 'Video Live Sports — Football & Basketball', tag: null,
    perSchool: 99, solo: false,
    format: 'Edited video from live game broadcast', length: '5–15 min', fileFormat: '.mp4',
    description: 'Edited video broadcast from a live football or basketball game. Multi-camera coverage encouraged. For all other sports, enter S7.',
    criteria: ['Camera work', 'Production value', 'Commentary', 'Graphics & lower thirds', 'Editing', 'Audio quality', 'Multi-camera use'],
    checklist: [
      'Football or basketball only — other sports enter S7',
      'Must be from a real, live game',
      'Multi-camera angles strongly encouraged',
      'Length: 5 to 15 minutes',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'S7', division: 'Sports', color: '#10b981',
    name: 'Video Live Sports — All Other Sports', tag: null,
    perSchool: 99, solo: false,
    format: 'Edited video from live game broadcast', length: '5–15 min', fileFormat: '.mp4',
    description: 'Edited video broadcast from any live sport except football or basketball. Those sports enter S6. Multi-camera coverage encouraged.',
    criteria: ['Camera work', 'Production value', 'Commentary', 'Graphics & lower thirds', 'Editing', 'Audio quality', 'Multi-camera use'],
    checklist: [
      'Any sport except football or basketball (those enter S6)',
      'Must be from a real, live sporting event',
      'Multi-camera angles strongly encouraged',
      'Length: 5 to 15 minutes',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'S8', division: 'Sports', color: '#10b981',
    name: 'Video Sports Program', tag: null,
    perSchool: 99, solo: false,
    format: 'Studio sports program', length: '5–15 min', fileFormat: '.mp4',
    description: 'A produced studio sports program — not a live game broadcast. May include highlights, analysis, scores, and athlete interviews.',
    criteria: ['Production value', 'Anchor delivery', 'Content & sports knowledge', 'Graphics', 'Editing', 'Variety of elements'],
    checklist: [
      'Studio or produced format — not a live broadcast (those enter S6/S7)',
      'Multiple segments or elements required',
      'Can include highlights, interviews, and analysis',
      'Length: 5 to 15 minutes',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'S9', division: 'Sports', color: '#10b981',
    name: 'Video Sports Package', tag: null,
    perSchool: 99, solo: true,
    format: 'Edited sports feature story', length: '1:30–3 min', fileFormat: '.mp4',
    description: 'A focused video feature story on a sports topic — athlete profile, game recap, or sports news story. Strong reporter presence and storytelling required.',
    criteria: ['Story structure', 'Interview quality', 'Editing', 'Natural sound', 'Reporter presence', 'Production value'],
    checklist: [
      'Single focused sports story',
      'Includes at least one interview',
      'Natural/game sound present',
      'Length: 1:30 to 3 minutes',
      'Export and upload as .mp4',
    ]
  },

  // ── Video ────────────────────────────────────────────────────
  {
    code: 'V1', division: 'Video', color: '#3b82f6',
    name: 'Video Spot Production', tag: null,
    perSchool: 99, solo: true,
    format: 'Video commercial, PSA, or promo', length: ':30 or :60', fileFormat: '.mp4',
    description: 'Write and produce an original video commercial, PSA, or station promo. Exactly 30 or 60 seconds — timing is judged. Strong concept and production required.',
    criteria: ['Concept', 'Production value', 'Opening hook', 'Visual delivery', 'Script quality', 'Creativity', 'Timing'],
    checklist: [
      'Original commercial, PSA, or station promo',
      'Choose one length exactly: :30 (:29.0–:30.0) OR :60 (:59.0–:60.0)',
      'All talent and production done by students',
      'Verify exact timing before exporting',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'V2', division: 'Video', color: '#3b82f6',
    name: 'Music Video', tag: null,
    perSchool: 99, solo: false,
    format: 'Original music video', length: 'Full song length', fileFormat: '.mp4',
    description: 'Produce a music video for a song. Student-produced music is preferred but not required. Creative vision, editing, and production quality are the focus.',
    criteria: ['Concept & vision', 'Camera work', 'Editing rhythm & music sync', 'Performance', 'Production value', 'Creativity & originality'],
    checklist: [
      'Must have proper music rights or use original student-produced music',
      'Cannot be re-entered in another video category',
      'Strong creative concept required — not just a live performance recording',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'V3', division: 'Video', color: '#3b82f6',
    name: 'Video Magazine', tag: null,
    perSchool: 99, solo: false,
    format: 'Multi-segment video magazine show', length: '5–15 min', fileFormat: '.mp4',
    description: 'A magazine-style video program covering multiple topics — lifestyle, entertainment, school features, and reviews. Not a newscast.',
    criteria: ['Variety of content', 'Production value', 'Host presence', 'Transitions', 'Editing', 'Segment quality', 'Overall flow'],
    checklist: [
      'At least 3 different segments on different topics',
      'Magazine/feature format — not a news program (those enter N4)',
      'Length: 5 to 15 minutes',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'V4', division: 'Video', color: '#3b82f6',
    name: 'Corporate Video', tag: null,
    perSchool: 99, solo: false,
    format: 'Promotional or informational video', length: '2–5 min', fileFormat: '.mp4',
    description: 'A professionally produced video for a real client — school organization, business, or community group. Must serve an actual communication purpose for the client.',
    criteria: ['Client message clarity', 'Production value', 'Script quality', 'Visual storytelling', 'Graphics', 'Call to action'],
    checklist: [
      'Must be produced for a real client with a real communication goal',
      'Clearly delivers the client\'s message',
      'Professional tone and production quality required',
      'Length: 2 to 5 minutes',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'V5', division: 'Video', color: '#3b82f6',
    name: 'Cinematography', tag: null,
    perSchool: 99, solo: true,
    format: 'Visually driven cinematic piece', length: '2–5 min', fileFormat: '.mp4',
    description: 'A visually driven piece focused on camera work, lighting, and composition. Minimal or no dialogue. Judged primarily on visual storytelling and technical mastery.',
    criteria: ['Shot composition', 'Lighting', 'Camera movement', 'Visual storytelling', 'Editing', 'Originality'],
    checklist: [
      'Primarily visual — minimal or no dialogue required',
      'Demonstrates a range of shot types and lighting setups',
      'Movement and composition are the story',
      'Length: 2 to 5 minutes',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'V6', division: 'Video', color: '#3b82f6',
    name: 'Short Film', tag: null,
    perSchool: 99, solo: false,
    format: 'Original narrative fiction film', length: '3–10 min', fileFormat: '.mp4',
    description: 'An original fictional narrative with a clear beginning, middle, and end. Script must be written by students. Acting, directing, and production all judged.',
    criteria: ['Script quality', 'Acting', 'Directing', 'Editing', 'Audio quality', 'Production value', 'Story arc'],
    checklist: [
      'Original fictional narrative — not a documentary',
      'Student-written script required',
      'Clear three-act structure: setup, conflict, resolution',
      'Length: 3 to 10 minutes',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'V7', division: 'Video', color: '#3b82f6',
    name: 'Video Copywriting', tag: null,
    perSchool: 99, solo: true,
    format: 'Written script ONLY — no video', length: 'Per client specs', fileFormat: '.pdf',
    description: 'Write a video commercial script based on the IASB client fact sheet at IASBOnline.org. Script only — no video production required.',
    criteria: ['Strong lead', 'Client message delivery', 'Visual direction notes', 'Call to action', 'Creativity', 'Timing'],
    checklist: [
      'Download the client fact sheet from IASBOnline.org',
      'Write at the client-specified length',
      'Include shot descriptions and audio/music notes',
      'Submit script ONLY — no video production',
      'Export as .pdf and upload',
    ]
  },
  {
    code: 'V8', division: 'Video', color: '#3b82f6',
    name: 'Live Event', tag: null,
    perSchool: 99, solo: false,
    format: 'Edited video from a live produced event', length: '5–15 min', fileFormat: '.mp4',
    description: 'Multi-camera video coverage of a live event — concert, ceremony, school production, or broadcast. Judged on live production decisions and technical execution.',
    criteria: ['Multi-camera switching', 'Production flow', 'Graphics & lower thirds', 'Audio mix', 'Directing decisions', 'Overall execution'],
    checklist: [
      'Must be from a real, live event',
      'Multi-camera coverage required',
      'Can include pre/post-event segments',
      'Length: 5 to 15 minutes',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'V9', division: 'Video', color: '#3b82f6',
    name: 'Video Show Open', tag: null,
    perSchool: 99, solo: false,
    format: 'Produced opening title sequence', length: ':15–:60', fileFormat: '.mp4',
    description: 'A produced opening animation or title sequence for a real school show or production. Must include music and motion graphics. Judged on creativity and production quality.',
    criteria: ['Visual creativity', 'Music sync', 'Motion design', 'Branding clarity', 'Production value', 'Length appropriateness'],
    checklist: [
      'Must function as an actual show open for a real school production',
      'Includes music and motion graphics — not just a still title card',
      'Length: :15 to :60 seconds',
      'Export and upload as .mp4',
    ]
  },

  // ── Emerging Media ───────────────────────────────────────────
  {
    code: 'M1', division: 'Emerging Media', color: '#8b5cf6',
    name: 'Student Media Website', tag: 'School-Wide',
    perSchool: 99, solo: false,
    format: 'Live website URL + screenshots', length: 'N/A', fileFormat: 'URL + .pdf',
    description: 'The school\'s student media website. Judged on design, content quality, navigation, and overall media presence. One entry per school program.',
    criteria: ['Design & layout', 'Content quality & depth', 'Navigation', 'Multimedia use', 'Frequency of updates', 'Overall impression'],
    checklist: [
      'Live, publicly accessible website URL required',
      'Submit screenshots of key pages as a .pdf',
      'Must represent the school\'s student media program',
      'Include evidence of regular content updates',
      'Submit URL and .pdf screenshots',
    ]
  },
  {
    code: 'M2', division: 'Emerging Media', color: '#8b5cf6',
    name: 'Social Media Presence', tag: 'School-Wide',
    perSchool: 99, solo: false,
    format: 'Screenshots across platforms', length: 'N/A', fileFormat: '.pdf',
    description: 'The school media program\'s social media presence across platforms. Judged on branding consistency, content quality, posting frequency, and audience engagement.',
    criteria: ['Branding consistency', 'Content variety', 'Posting frequency', 'Visual quality', 'Engagement strategy', 'Multi-platform use'],
    checklist: [
      'Submit handles for all active platforms',
      'Include screenshots of recent posts showing variety',
      'Show evidence of consistent posting schedule',
      'Demonstrate cross-platform branding',
      'Export screenshots as .pdf and upload',
    ]
  },
  {
    code: 'M4', division: 'Emerging Media', color: '#8b5cf6',
    name: 'Vodcast', tag: null,
    perSchool: 99, solo: false,
    format: 'Single video podcast episode', length: '5–15 min', fileFormat: '.mp4',
    description: 'A video podcast episode from an ongoing series. Video cannot reuse audio from a Podcast (M3) entry. Judged on content, production quality, and host performance.',
    criteria: ['Pre-planning', 'Opening', 'Storytelling', 'Production quality', 'Host chemistry', 'Visual elements', 'Closing'],
    checklist: [
      'Episode must come from an ongoing vodcast series',
      'Cannot reuse audio from an M3 Podcast entry',
      'Length: 5 to 15 minutes',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'M5', division: 'Emerging Media', color: '#8b5cf6',
    name: 'Video Comedy', tag: null,
    perSchool: 99, solo: false,
    format: 'Original comedy or parody video', length: '2–5 min', fileFormat: '.mp4',
    description: 'An original comedy or parody video — sketch, mockumentary, parody ad, or other comedic format. Content must be school-appropriate.',
    criteria: ['Humor & wit', 'Concept originality', 'Editing', 'Performance', 'Production value', 'Script quality'],
    checklist: [
      'Original comedy concept — parody of real people requires consent',
      'School-appropriate content required',
      'Length: 2 to 5 minutes',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'M6', division: 'Emerging Media', color: '#8b5cf6',
    name: 'Sound Design', tag: null,
    perSchool: 99, solo: true,
    format: 'Original audio design piece', length: '1–3 min', fileFormat: '.mp3',
    description: 'An original piece showcasing creative sound design — not a song, not a news story. The focus is on crafting a sonic experience through layers, effects, and editing.',
    criteria: ['Creativity', 'Technical execution', 'Originality', 'Listener experience', 'Complexity', 'Use of sound elements'],
    checklist: [
      'Original audio composition — not a song, podcast, or news report',
      'Demonstrates layering and creative use of sound effects and audio',
      'Length: 1 to 3 minutes',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'M7', division: 'Emerging Media', color: '#8b5cf6',
    name: 'Animated Story', tag: null,
    perSchool: 99, solo: false,
    format: 'Original animated video', length: '1–5 min', fileFormat: '.mp4',
    description: 'An original animation in any style — stop motion, digital, hand-drawn, or mixed media. Must tell a story or convey a concept. Audio or music required.',
    criteria: ['Animation quality', 'Story or concept', 'Creativity', 'Audio quality', 'Technical skill', 'Originality'],
    checklist: [
      'Entirely student-produced animation',
      'Any animation style accepted: stop motion, digital, hand-drawn, etc.',
      'Must include audio, narration, or music',
      'Length: 1 to 5 minutes',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'M8', division: 'Emerging Media', color: '#8b5cf6',
    name: 'Motion Graphics', tag: null,
    perSchool: 99, solo: false,
    format: 'Original motion graphics piece', length: ':30–2 min', fileFormat: '.mp4',
    description: 'An original piece primarily using motion graphics, kinetic typography, or animated infographics. Focus is on graphic design in motion — not an animated story.',
    criteria: ['Design quality', 'Animation smoothness', 'Concept clarity', 'Typography use', 'Music sync', 'Originality'],
    checklist: [
      'Primarily motion graphics — not an animated story (that is M7)',
      'Includes kinetic typography, animated infographics, or motion design',
      'Length: :30 to 2 minutes',
      'Export and upload as .mp4',
    ]
  },
  {
    code: 'M9', division: 'Emerging Media', color: '#8b5cf6',
    name: 'Branded Hype Video', tag: null,
    perSchool: 99, solo: false,
    format: 'High-energy promotional video', length: ':30–2 min', fileFormat: '.mp4',
    description: 'A high-energy promotional video for a real school program, team, club, or event. Combines footage, music, and graphics for maximum visual impact.',
    criteria: ['Energy & impact', 'Editing rhythm', 'Music sync', 'Visual quality', 'Branding effectiveness', 'Creativity'],
    checklist: [
      'Must promote a real school entity — team, club, program, or event',
      'High-energy editing and music required',
      'Combines footage, graphics, and music',
      'Length: :30 to 2 minutes',
      'Export and upload as .mp4',
    ]
  },
];

// ── HHS In-Depth Beats ────────────────────────────────────────
const INDEPTH_BEATS = [
  {
    id: 1, name: 'Academic Admin & Counseling', icon: '🎓', color: '#6366f1',
    seasons: ['fall','winter','spring'],
    covers: ['AP Programs','Dual Credit','Graduation','NHS','Academic Awards','Counseling','Student Services','Spartan Ambassadors','Student Learning Alliance','Academic Teams (Spell Bowl, Quiz Bowl, Super Bowl)'],
    contacts: ['Emily Ford (NHS)','Alyssa Braman (Spartan Ambassadors)','Steve Pickett (Student Learning Alliance)','Raymond Colglazier (Academic Teams)','Rob Dillman (Academic Teams)','Tom Maher (Academic Teams)','Junior Stailey (Academic Teams)','Dominick Manco (Academic Teams)','Tara Olivero (Academic Teams)'],
  },
  {
    id: 2, name: 'Student Government & Spirit', icon: '🏛️', color: '#0ea5e9',
    seasons: ['fall','winter','spring'],
    covers: ['Student Government','Spartan Army','Homecoming & Dances','Spirit Store','Class Sponsors','S.A.L.T.','Spartan Girls Flag Football'],
    contacts: ['Justin Peeper (Student Government)','Chuck Werth (Spartan Army)','Kris Teusch (S.A.L.T.)','Robert Irwin (Athletics Director)','Jamie Arnold (Athletic Office)','TJ DeHerrera (Class Sponsor)','Jacob Dunn (Class Sponsor)','Tracy Schill (Class Sponsor)','Nick Byall (Class Sponsor)','Kent Mitchell (Class Sponsor)'],
  },
  {
    id: 3, name: 'Band, Orchestra, Guard, Dance & Cheer', icon: '🎺', color: '#d97706',
    seasons: ['fall','winter','spring'],
    covers: ['Marching Band','Jazz Ensemble','Indoor Percussion','Color Guard','Winter Guard','Orchestra','Dance Team','Cheer'],
    contacts: ['Jordan Cain (Band / Orchestra / Guard)','Jason Witzigreuter (Band / Jazz)','Alexander Shilling (Band / Jazz)','Nick Hardy (Guard)','Britney Lombardo (Dance Team)'],
  },
  {
    id: 4, name: 'Theater, Show Choir & Choir', icon: '🎭', color: '#ec4899',
    seasons: ['fall','winter','spring'],
    covers: ['Theater & Drama','Show Choir','Choral Music','Class Royale','Anonymous Blue','Songwriting Club'],
    contacts: ['Curtis Shaw (Theater / Show Choir / Choral)','Andrew Sherman (Show Choir)','Karen Hirschy (Class Royale)','Brian Nicholson (Songwriting Club)'],
  },
  {
    id: 5, name: 'Visual Arts & Film', icon: '🎨', color: '#c026d3',
    seasons: ['fall','winter','spring'],
    covers: ['Art Department','Art Club','Architecture Club','Fashion Club','Film Club','Spartana','Photojournalism Club','Basket Weaving Club'],
    contacts: ['Sarah Jones (Art Club)','Dawn Todor (Architecture Club)','Ashley Hennessey (Fashion Club)','Alex Leavell (Film Club)','Lisa Baltes (Spartana)','Dominick Manco (Photojournalism / Yearbook)','Samantha Lamont (Basket Weaving)'],
  },
  {
    id: 6, name: 'English, Speech & Creative Writing', icon: '📝', color: '#2563eb',
    seasons: ['fall','winter','spring'],
    covers: ['English Department','Speech & Debate','Poetry Out Loud','Creative Writing Club','Book Club'],
    contacts: ['Marcus Trice (Speech & Debate)','Sally Rauber (Poetry Out Loud)','Tara Olivero (Creative Writing)'],
  },
  {
    id: 7, name: 'History, Civics & Social Issues', icon: '⚖️', color: '#7c3aed',
    seasons: ['fall','winter','spring'],
    covers: ['History Department','Mock Trial','Model United Nations','We The People','Law Club','Young Progressives','Young Americans for Freedom','Students for Choice','Students for Life','Philosophy Club'],
    contacts: ['David James (Mock Trial / We The People)','Marcus Trice (Model UN)','Tara Olivero (Young Progressives)','Nick Byall (Young Americans for Freedom)','Lisa Hoffer (Students for Life)'],
  },
  {
    id: 8, name: 'Languages, Culture & Global Identity', icon: '🌍', color: '#0d9488',
    seasons: ['fall','winter','spring'],
    covers: ['Spanish (Dept, Club, Honors, Charlemos, Latinos Unidos)','Latin Club (JCL)','French Club (Francofanas)','German Club','ASL Club','Asian Alliance','K-Pop Club','Knowledge of the Nations','Taste of Homestead'],
    contacts: ['Joanne Perez (Spanish Club)','Cristal Galicia (Spanish Honors)','Elise Chadwick (Charlemos)','Angela Bailey (Latinos Unidos)','Megan Beckman (Latin Club / Taste of Homestead)','Brigitte Martin (French Club)','Ashley Kas (ASL Club)','Baylee Stonger (Asian Alliance)','Sally Rauber (K-Pop Club)','Erin Tembras (Knowledge of the Nations)','Justin Peeper (Taste of Homestead)'],
  },
  {
    id: 9, name: 'Science & Environment', icon: '🔬', color: '#16a34a',
    seasons: ['fall','winter','spring'],
    covers: ['Science Department','Environmental Club','Biomedical Science Club','MED Club','Science Olympiad','Horticulture Club','Hearts for Paws'],
    contacts: ['Stephanie Merkling (Environmental Club)','Daniel Jaeger (Environmental Club)','Tammy Behrens (Biomedical Science)','Nathan Arata (MED Club / Science Olympiad)','Yolanda Fortune (Horticulture)','Jessica Holtzclaw (Horticulture)','Lisa Neuenschwander (Horticulture)','Marcy Blundall (Hearts for Paws)'],
  },
  {
    id: 10, name: 'Math, Technology & Innovation', icon: '🤖', color: '#0891b2',
    seasons: ['fall','winter','spring'],
    covers: ['Math Department','Mu Alpha Theta','Technology Department','Robotics Team','EKart Club','Rube Goldberg','Rocketry Team','Aviation Club','AI for Good','Girls Who Code','Women in STEM','Esports','STEM Club'],
    contacts: ['Matt Elder (Robotics)','Kim Brown (Mu Alpha Theta / STEM Club)','Don Lines (EKart)','Brady Koehlinger (Rube Goldberg)','Camille Bartel (Aviation Club)','Jill Grote (AI for Good)','Karen Hirschy (Girls Who Code)','Lisa O\'Dell (Women in STEM)','Kimberly Taylor (Women in STEM)','Jonathan DeVries (Esports)'],
  },
  {
    id: 11, name: 'Career, Business & Culinary', icon: '💼', color: '#ea580c',
    seasons: ['fall','winter','spring'],
    covers: ['Business Department','Business Club','DECA','FBLA','FCCLA','Culinary','Family & Consumer Science','Driver\'s Education','Internship Program'],
    contacts: ['Rachel Loveless (Business Club / FBLA)','Jacob Dunn (DECA)','Stephanie Wiley (FCCLA)','Melanie Busch (Family & Consumer Science)'],
  },
  {
    id: 12, name: 'Service & Community', icon: '🤝', color: '#65a30d',
    seasons: ['fall','winter','spring'],
    covers: ['Key Club','Interact Club','Habitat for Humanity','Hero Club','Generations United','Riley Dance Marathon','Mindful Youth Club'],
    contacts: ['Stephanie Wiley (Key Club)','Lyla Dean (Interact Club)','Baylee Stonger (Habitat for Humanity)','Brianna Lisak (Hero Club)','Gretchen Carrel (Generations United)','Nicole Vickrey (Riley Dance Marathon)','Melanie Busch (Mindful Youth Club)'],
  },
  {
    id: 13, name: 'Health, Wellness & Inclusion', icon: '💛', color: '#db2777',
    seasons: ['fall','winter','spring'],
    covers: ['P.E. Department','HOSA','NOW','SODA','GSA','Minority Student Union','Brothers of Unity','Best Buddies','Unified Teams','Special Education','Psychology Club','Pickleball Club'],
    contacts: ['Dawn Todor (HOSA)','Erin Whitt (NOW)','Camille Bartel (SODA)','Scott Hill (GSA)','Ellen Robinson (Minority Student Union)','Chuck Werth (Brothers of Unity)','Lisa Hoffer (Best Buddies)','Tim Decker (Psychology Club)'],
  },
  {
    id: 14, name: 'Student Clubs & Identity', icon: '🎮', color: '#8b5cf6',
    seasons: ['fall','winter','spring'],
    covers: ['Anime Club','Dungeons & Dragons','Tabletop Club','Chess Club','Ping Pong Club','Euchre Club','Plush Club','Ski Club','Equestrian Club','Fright Club','UFC Club','Chicken Nugget Club','Get A Hobby Club','SADD','Travel Club','FCA','Bible Club','New & Emerging Clubs'],
    contacts: ['Holly Lyne (Anime Club)','Kevin Cogdell (Tabletop Club)','Nathan Arata (Chess / Euchre / Plush)','Logan Tuckey (Ping Pong)','Josh Eme (Ski Club)','Rachel Swing (Ski Club)','Jamie Smith (Equestrian)','Ellen Robinson (Fright Club)','Jill Grote (Get A Hobby)','Baylee Stonger (SADD)','Melanie Busch (Travel Club)','Kim Brown (Travel Club)','Greg Davis (FCA)','Jackson Zvers (Bible Club)'],
  },
  {
    id: 15, name: 'Library, Tech & Campus Operations', icon: '🏫', color: '#475569',
    seasons: ['fall','winter','spring'],
    covers: ['Library','Computer Technology Classes','SETS Program','Cafeteria & Food Services','Custodians & Maintenance','Transportation & Bus Drivers','Front Office & Attendance','School Nurses','School Resource Officer','Safety Drills & Procedures'],
    contacts: [],
  },
];

// ── Lessons ───────────────────────────────────────────────────
const LESSONS = {
  intro: {
    name: 'Intro to Media',
    color: '#f59e0b',
    icon: '🎓',
    units: [
      {
        id: 'u1',
        title: 'Unit 1 — Welcome',
        lessons: [
          {
            id: 'intro-welcome',
            title: 'Welcome to Homestead Media',
            duration: '1 class',
            summary: 'The program at a glance — who we are, what we make, and what to expect.',
            sections: [
              { type: 'intro', content: 'Homestead Media is one of the most award-winning high school media programs in Indiana. You are joining a team that runs two real radio stations, produces live sports broadcasts, publishes a yearbook, and creates original journalism — all in this building, all during school.' },
              { type: 'callout', label: 'What We Do', items: [
                '📻 <strong>Radio</strong> — Live DJ breaks and talk shows on The Point 91FM and WCYT 2.0',
                '🎬 <strong>Live</strong> — Produce and broadcast Homestead sports games on YouTube',
                '📖 <strong>Yearbook</strong> — Photograph and document the entire school year',
                '🏟️ <strong>Sports</strong> — Write, shoot, and post about Homestead athletics',
                '📺 <strong>In-Depth</strong> — Documentary and investigative journalism',
              ]},
              { type: 'text', title: '🏆 The Standard', content: 'Homestead Audio Broadcasting has won <strong>IASB Radio School of the Year</strong> in 2026, 2024, 2023, 2021, 2019, 2018, and 2017. The yearbook and broadcast programs carry the same standard. The work you do here is real — real audience, real deadlines, real results.' },
              { type: 'callout', label: 'How Class Works', items: [
                'Every day has a purpose — there is no sitting around waiting for something to do',
                'You will be assigned to a class (Radio, Live, Yearbook, Sports, or In-Depth) after this intro period',
                'You may rotate between classes in future semesters based on your interests and skills',
                'Seniors and returning students mentor newcomers — lean on them',
              ]},
            ]
          },
          {
            id: 'intro-routine',
            title: 'The Daily Routine',
            duration: '1 class',
            summary: 'How a media class day runs — roles, check-ins, and getting to work.',
            sections: [
              { type: 'intro', content: 'Media class does not look like a typical class. There is no lecture to sit through. From the moment the bell rings, people are working. Understanding the daily rhythm is how you start contributing fast.' },
              { type: 'list', title: 'A Typical Day', items: [
                '<strong>Bell rings</strong> — Drop your stuff and check your assignment or station post',
                '<strong>First 5 minutes</strong> — Quick check-in with your teacher or team lead',
                '<strong>Work period</strong> — On air, editing, shooting, writing, or producing',
                '<strong>End of class</strong> — File your work, log your progress, tidy your station',
              ]},
              { type: 'callout', label: 'The Golden Rule', items: [
                'Dead air is the enemy. In radio, silence kills a show. In broadcast, a frozen graphic kills a game. In yearbook, a missed photo never comes back. Always be doing something that moves the work forward.' ],
              },
              { type: 'keyterms', title: 'Key Terms to Know', terms: [
                { term: 'Air Shift', def: 'A scheduled block of time you are on the radio — live, in the studio, on mic.' },
                { term: 'Broadcast', def: 'A live video production going out over YouTube or cable.' },
                { term: 'Deadline', def: 'Non-negotiable. Missing a deadline affects every person on the team.' },
                { term: 'Rundown', def: 'The ordered list of everything that happens during a show or broadcast.' },
                { term: 'B-Roll', def: 'Supporting footage shot to accompany narration or interviews in video work.' },
              ]},
            ]
          },
        ]
      },
      {
        id: 'u2',
        title: 'Unit 2 — Studio & Gear',
        lessons: [
          {
            id: 'intro-studio',
            title: 'Your Studio Tour',
            duration: '1 class',
            summary: 'Walk through the audio, video, and broadcast facilities you will be using.',
            sections: [
              { type: 'intro', content: 'The Homestead Media suite has professional-grade gear — the same type of equipment used in commercial radio stations, local TV news operations, and production companies. Learning where everything is and what it does is your first job.' },
              { type: 'list', title: 'Spaces in the Suite', items: [
                '<strong>Radio Studio A</strong> — Live broadcast studio for The Point 91FM',
                '<strong>Radio Studio B</strong> — WCYT 2.0 and podcast production',
                '<strong>Production Lab</strong> — Adobe workstations for editing audio, video, and graphics',
                '<strong>Yearbook Lab</strong> — Layout stations and camera checkout',
                '<strong>Broadcast Control Room</strong> — Video switching and live streaming for Homestead Live',
              ]},
              { type: 'callout', label: 'Studio Rules', items: [
                'Never touch a control or fader that is not yours to run — ask first',
                'Log all camera and equipment checkouts with your teacher',
                'If you broke it, say so immediately — hiding damage makes it worse',
                'Headphones on means someone is working — do not interrupt on air',
              ]},
              { type: 'keyterms', title: 'Gear You Will Use', terms: [
                { term: 'Condenser Mic', def: 'The main on-air microphone in both radio studios. Sensitive — stay on axis, do not pop your Ps.' },
                { term: 'Audio Board / Console', def: 'The mixing board that controls levels for every mic, phone, and source going to air.' },
                { term: 'DSLR / Mirrorless Camera', def: 'Used for yearbook, sports, and video work. Handle with two hands and always return with the lens cap on.' },
                { term: 'Video Switcher', def: 'The device in the control room that cuts between camera feeds during a live broadcast.' },
                { term: 'Adobe Creative Cloud', def: 'Audition (audio), Premiere (video), Photoshop (graphics), InDesign (yearbook layout) — the full suite.' },
              ]},
            ]
          },
          {
            id: 'intro-software',
            title: 'Essential Software',
            duration: '1–2 classes',
            summary: 'A first look at Adobe Audition, Premiere, Photoshop, and InDesign.',
            sections: [
              { type: 'intro', content: 'Every class in Homestead Media uses Adobe Creative Cloud. You will specialize in one or two apps based on your class, but knowing your way around all of them makes you more valuable across the whole program.' },
              { type: 'keyterms', title: 'The Four Core Apps', terms: [
                { term: 'Adobe Audition', def: 'Audio recording and editing. Used in Radio for imaging, spot production, and editing air breaks. Think of it as Photoshop for sound.' },
                { term: 'Adobe Premiere Pro', def: 'Video editing. Used in Homestead Live and In-Depth for packaging, highlight reels, and documentary segments.' },
                { term: 'Adobe Photoshop', def: 'Image editing and graphic design. Used in Homestead Live for broadcast graphics (scoreboards, lower thirds) and in Yearbook for photo editing.' },
                { term: 'Adobe InDesign', def: 'Page layout and publishing. Used in Yearbook to build the actual book pages — text, photos, and design all together.' },
              ]},
              { type: 'callout', label: 'Where to Start', items: [
                'Your teacher will assign the app that matches your class focus',
                'LinkedIn Learning (free through school) has full beginner courses for every Adobe app',
                'The best way to learn is to open a project and break things — just on a copy, not the original',
              ]},
            ]
          },
        ]
      },
    ]
  },
  radio: {
    name: 'Radio Broadcasting',
    color: '#a78bfa',
    icon: '📻',
    desc: 'Go on the air at The Point 91FM and WCYT 2.0. Air personality, talk shows, production, and IASB competition.',
    units: [
      {
        id: 'u1',
        title: 'Unit 1 — Introduction',
        lessons: [
          {
            id: 'welcome',
            title: 'Welcome to Audio Broadcasting',
            duration: '1 class',
            summary: 'What you\'ll do this semester, the daily routine, and program overview.',
            sections: [
              { type: 'intro', content: 'This class is about doing real radio. From day one you\'ll be on the air at one of two actual stations — The Point 91FM and WCYT 2.0. You\'ll produce real content, work with professional equipment, and build skills that carry into any broadcast career.',
                sideImg: 'images/iasb-group.png', sideImgCap: 'The Homestead Audio Broadcasting team at IASB — this could be you.' },
              { type: 'callout', label: 'Semester Roadmap', items: [
                'Air Personality — Solo DJ breaks on The Point and 2.0',
                'Talk Shows — Weekly group radio shows with your crew',
                'Projects — Issue Report, Copywriting, IASB Competition entries',
                'Production — Adobe Audition, imaging, spot production',
              ]},
              { type: 'callout', label: 'After School', items: [
                'The Point and 2.0 run live shows Monday through Friday after school',
                'Audio Aficionados — full album listening club (day TBD)',
              ], sideImg: 'images/mic-cartoon.png', sideImgCap: 'Homestead Audio Broadcasting — student-run, community-heard.' },
            ]
          },
          {
            id: 'stations',
            title: 'Our Stations',
            duration: '1 class',
            summary: 'WCYT The Point 91FM and 2.0 — history, genre, power, and identity.',
            sections: [
              { type: 'intro', content: 'Homestead Audio Broadcasting operates two real radio stations — both student-run, broadcasting to real audiences. The current wcyt.org has Live Playlist, Podcasts, Sports, Awards, and social media on Instagram, YouTube, X, Facebook, Spotify, and TikTok.',
                sideImg: 'images/logo-wcyt-point.png', sideImgCap: 'WCYT — The Point 91FM' },
              { type: 'keyterms', title: 'WCYT — The Point 91FM', terms: [
                { term: 'On Air Since', def: '1993' },
                { term: 'Genre', def: 'Independent Music' },
                { term: 'Frequency', def: '91.1 FM' },
                { term: 'Power', def: '1 Kilowatt (upgraded from 125W in 2024)' },
                { term: 'Taglines', def: '"Where Music is the Point" · "Your Alternative to Commercial Radio" · "The Independent Music Source"' },
                { term: 'Website', def: 'WCYT.org' },
              ], sideImg: 'images/coverage-map.png', sideImgCap: 'The Point 91FM\'s broadcast coverage across Fort Wayne and surrounding communities.' },
              { type: 'keyterms', title: 'WCYT 2.0', terms: [
                { term: 'On Air Since', def: '2023' },
                { term: 'Genre', def: 'All music types' },
                { term: 'Platform', def: 'Online only — WCYT.org' },
                { term: 'Tagline', def: '"The Next Level of Radio"' },
              ], sideImg: 'images/logo-2point0.png', sideImgCap: 'WCYT 2.0 — The Next Level of Radio' },
              { type: 'callout', label: 'Studio Facilities', items: [
                'Recording Studios — multitrack production sessions',
                'Podcast Studios — close-mic interview and podcast setup',
                'Radio Stations — live broadcast environments',
              ], sideImg: 'images/wcyt-homepage.png', sideImgCap: 'The current WCYT.org — Live Playlist, Podcasts, Sports, Awards, and 6 social platforms.' },
              { type: 'text', title: '🏆 IASB Radio School of the Year', content: 'The program has won IASB Radio School of the Year in <strong>2026</strong>, 2024, 2023, 2021, 2019, 2018, and 2017. That reputation is built one air shift at a time — by students like you.',
                sideImg: 'images/iasb-finalists.png', sideImgCap: 'IASB finalists list — Homestead students highlighted in yellow.' },
            ]
          },
          {
            id: 'fcc',
            title: 'FCC Rules & On-Air Standards',
            duration: '2 classes',
            summary: 'Federal regulations every broadcaster must know — obscenity, indecency, underwriting.',
            sections: [
              { type: 'intro', content: 'Every broadcaster in America is regulated by the FCC — the Federal Communications Commission. As a student broadcaster on a licensed station, you are held to the exact same legal standards as any professional. "I didn\'t know I was on the air" is not a defense the FCC accepts.',
                sideImg: 'images/coverage-map.png', sideImgCap: 'The Point 91FM broadcasts to real communities — which means real FCC accountability.' },
              { type: 'callout', label: '⚠️ Non-Negotiable', warning: true, content: 'Any profanity or unprofessional language — whether you think the mic is live or not — will get you pulled from air immediately. Treat every microphone as live at all times.' },
              { type: 'keyterms', title: 'The Three Content Categories', terms: [
                { term: 'Obscene', def: 'No First Amendment protection. Must meet the Supreme Court\'s 3-part test. Prohibited at ALL hours, 24/7.' },
                { term: 'Indecent', def: 'Sexual or excretory content that is patently offensive but doesn\'t meet the obscenity test. Banned 6 AM–10 PM when children may be listening.' },
                { term: 'Profane', def: '"Grossly offensive" language considered a public nuisance. Also banned 6 AM–10 PM.' },
              ]},
              { type: 'text', title: 'Enforcement & Consequences', content: 'Violations begin with listener complaints reviewed by FCC staff. Penalties range from a formal warning to a fine to revoking the station\'s broadcast license. In 2020, one university paid a $76,000 fine for underwriting violations alone. These consequences are real — for a licensed station and for you personally.' },
              { type: 'text', title: 'Our Standard Goes Further', content: 'At Homestead we go beyond the legal minimum. Speak on air as if the whole school is listening — G-rated only. No speaking negatively about students, teachers, or anyone else. The FCC also prohibits broadcasting false information about crimes or catastrophes if it would cause public harm.' },
              { type: 'keyterms', title: 'Sponsors & Underwriting', terms: [
                { term: 'Why underwriting?', def: 'Noncommercial FM stations cannot run traditional advertisements. Sponsors are instead acknowledged with scripted underwriting announcements.' },
                { term: 'Our sponsors', def: 'Marcos Pizza · Casa Italian Restaurants' },
                { term: 'What\'s not allowed', def: 'Comparative or qualitative descriptions, price information, sales, calls to action, inducements to buy, or detailed "menu listings"' },
                { term: 'The rule', def: 'If you\'re unsure whether you can say it about a sponsor — don\'t say it.' },
              ]},
            ]
          },
          {
            id: 'expectations',
            title: 'Classroom Expectations & Grading',
            duration: '1 class',
            summary: 'Room rules, how grades work, project submission, and the final project.',
            sections: [
              { type: 'intro', content: 'Your grade is built on <strong>participation and effort</strong>, combined with project grades. Show up prepared, engage with the work, and push yourself on air. The final project counts for a significant portion of your overall grade.',
                sideImg: 'images/iasb-group.png', sideImgCap: 'What you build here can take you to stages like this.' },
              { type: 'list', title: 'Room Rules', items: [
                'No food in editing studios or radio stations. Drinks with lids at desks only.',
                'Phones out of sight unless pre-approved by the teacher.',
                'One person in the hallway at a time. No passes in the first or last 10 minutes of class.',
                'If you\'re scheduled on-air, use the restroom before class — missing your air shift affects your participation grade.',
                'Leave all spaces clean. Repeated messes = no food privileges for everyone.',
              ]},
              { type: 'callout', label: 'What Counts for Your Grade', items: [
                'Participation and effort during on-air shifts and class activities',
                'Project grades — Issue Report, Copywriting, IASB entries, and more',
                '<strong>Final Project — counts for a significant portion of your overall grade</strong>',
                'Staying on task (no games, no email chatting)',
                'Engagement during discussions, prep, and group planning',
              ]},
              { type: 'text', title: 'Project Submission', content: 'All projects go into the Google Shared Drive Dropbox with your name and the project title in the correct folder for the year. Late work must be emailed to adunn@sacs.k12.in.us with the assignment name and file location — it can help your grade but won\'t replace the participation points you missed that week.' },
              { type: 'text', title: 'Different Skill Levels Are a Feature', content: 'Grades are individual — you are not compared to anyone else. There are many different experience levels in this room, and that\'s a strength. Work with students who are more advanced, ask questions, and use the people around you as a resource.' },
            ]
          },
        ]
      },
      {
        id: 'u2',
        title: 'Unit 2 — Air Personality',
        lessons: [
          {
            id: 'ap-intro',
            title: 'What is Air Personality?',
            duration: '1 class',
            summary: 'Goals for your air shifts, the 5-break structure, and what makes a great DJ break.',
            sections: [
              { type: 'intro', content: 'Air personality is the art of connecting with listeners between songs. Great radio isn\'t just music — it\'s about making people feel like someone real is there with them. Your job is to be that presence.',
                sideImg: 'images/mic-cartoon.png', sideImgCap: 'Every break is your moment — make it count.' },
              { type: 'callout', label: 'Your Air Shift Goals', items: [
                'Goal of 5 DJ breaks per class period — before and after songs only',
                'Always skip ID Shouts and move Top of Hour breaks',
                'Introduce yourself in every break',
                'Give the listener artist and song information with a personal touch',
                'Final break: sign off, thank listeners, announce who\'s on next',
              ]},
              { type: 'keyterms', title: 'Pre-Sell and Back-Sell', terms: [
                { term: 'Back-Sell', def: 'Identifying what song just played — artist, title, album. Done immediately after a song ends, before you say anything else.' },
                { term: 'Pre-Sell', def: 'Teasing what\'s coming up next. Creates anticipation and gives listeners a reason to stay.' },
              ]},
              { type: 'text', title: 'Personality on Air', content: 'Every break should include a window into your actual personality — your hobbies, a dream destination, music that matters to you, something you found interesting. Genuine interest is audible. Listeners hear the difference between real and forced.',
                sideImg: 'images/npr-tips.png', sideImgCap: 'NPR\'s guide to sounding your best — read every line before your next shift.' },
            ]
          },
          {
            id: 'front-load',
            title: 'Front Loading Content',
            duration: '1 class',
            summary: 'Lead with the most important info first. Artist, song, album, year — never filler phrases.',
            sections: [
              { type: 'intro', content: 'Front loading means delivering the most important information first. Listeners don\'t wait around — if your break opens with a filler phrase, you\'ve already lost them before you\'ve said anything meaningful.',
                sideImg: 'images/mic-cartoon.png', sideImgCap: 'Your first word is your first impression.' },
              { type: 'callout', label: '🚫 Never Open a Break With These', warning: true, items: [
                '"That was…"',
                '"You just heard…"',
                '"What was just played was…"',
              ]},
              { type: 'list', title: 'Back-Sell Formula — Always Lead With This', items: [
                'Artist Name',
                'Song Title',
                'Album Title',
                'Release Year',
              ]},
              { type: 'text', title: 'Example Back-Sell', content: '"It\'s The Point 91FM — The XX, \'I Dare You\' from <em>I See You</em>, 2017. I\'m [Your Name]…"<br><br>Notice: the artist name comes before anything else. The listener hears what they need immediately, not after you warm up.' },
              { type: 'callout', label: 'Every Break Should End With', items: [
                'Your name or show name',
                'A WCYT tagline (e.g. "Where Music is the Point" or "Your Alternative to Commercial Radio")',
                'A tease for the next song or segment',
              ]},
            ]
          },
          {
            id: 'first-break',
            title: 'Your First DJ Break',
            duration: '1–2 classes',
            summary: 'Listen to a real student break, learn the 5-element formula, and go on air.',
            sections: [
              { type: 'intro', content: 'Today you go on air. Before you sit down at the board, you need to know exactly what you\'re going to say — and why every word matters.' },
              { type: 'audio',
                src: 'audio/carter-dj-break.mp3',
                label: 'Listen First — Carter\'s DJ Break',
                context: 'Before we break down the formula, hear what a complete break sounds like from a real WCYT DJ. Listen for how he opens, where his personality shows up, and how he ends.',
                note: '<strong>What to listen for:</strong> He opens with the artist and title — not "that was." He gives a real opinion on something happening right now. He invites the listener into a conversation. He teases what\'s next.',
                tip: '⭐ <strong>Advanced move — notice this:</strong> At the end, Carter talks over the instrumental intro of the next song and lands his last word exactly as the lyrics begin. This is called <strong>hitting the post</strong>. You\'ll learn this technique later in the semester. For now, just notice it happens.' },
              { type: 'list', title: 'Every DJ Break Has 5 Elements', items: [
                '<strong>Back-Sell</strong> — Tell them what just played',
                '<strong>Introduction</strong> — Tell them who you are <em>(every break)</em>',
                '<strong>Promotion</strong> — One line for WCYT',
                '<strong>Fun Fact</strong> — Something genuine you actually care about',
                '<strong>Pre-Sell</strong> — Tell them what\'s coming next',
              ]},
              { type: 'keyterms', title: 'Element 1 — Back-Sell', terms: [
                { term: 'Required', def: 'Artist name and song title — both, every time' },
                { term: 'Flexible', def: 'Album, year, and order — use whatever sounds natural to you' },
                { term: 'Multiple songs', def: 'If several songs played back-to-back, back-sell all of them' },
                { term: 'Example', def: '"From the 1998 album Mutations, it\'s Beck\'s \'Cold Brains\'" — artist and title, front-loaded, sounds natural' },
              ]},
              { type: 'list', title: '3 Ways to Open Without "That Was"', items: [
                '<strong>Artist/Song First</strong> — "Beck\'s \'Cold Brains\' from Mutations, 1998..."',
                '<strong>Station + Name First</strong> — "It\'s The Point 91FM, I\'m [name], and we just heard [artist/title]..."',
                '<strong>Name + Tagline First</strong> — "[Name] on Your Alternative to Commercial Radio — [artist/title]..."',
              ]},
              { type: 'text', title: 'Element 2 — Introduction', content: 'Introduce yourself <strong>every break</strong>. Your name, the station, and one real thing about yourself — a hobby, an opinion, something honest. Keep it fresh each time — don\'t repeat the same line. Carter\'s intro came <em>after</em> he hooked the listener with a topic — he earned it by being interesting first.' },
              { type: 'text', title: 'Element 3 — Promotion', content: 'One line. A special show, an upcoming event, social media, or the station website. Keep it brief — the promotion should feel like something you actually want listeners to know, not a commercial crammed into your break.' },
              { type: 'text', title: 'Element 4 — Fun Fact', content: 'This is where your personality lives. Pick something you actually find interesting — music news, a current event, something at school, a personal take. Carter\'s AI commercials take worked because it was <em>specific</em>: "Coke did it better, not gonna lie." Specific opinions are always better than vague ones. Listeners can tell the difference.' },
              { type: 'text', title: 'Element 5 — Pre-Sell', content: 'Go into Simian and pick your next song <em>before</em> your break starts. Then tease it with the artist, title, and a reason to stay tuned. <em>"Coming up — Vampire Weekend\'s \'Hannah Hunt\' — do not touch that dial."</em><br><br>The pre-sell gives listeners a reason to stay through the music. No pre-sell, no reason to stay.' },
              { type: 'text', title: 'The DJ Panel — wcyt.org/dj', content: 'Every shift starts and ends here. Log in at <strong>wcyt.org/dj</strong> (password: <strong>Spartans</strong>). Enter your Show/DJ name, select your station, and set status to <strong>On Air</strong> when you go live. Hit <strong>End Show</strong> when you\'re done. The Now Playing Override lets you manually enter what\'s on air when the system can\'t auto-detect it.',
                sideImg: 'images/dj-panel.png', sideImgCap: 'Set On Air when you start. End Show when you\'re done. Every single shift.' },
              { type: 'callout', label: '✍️ Write Your Break Before You Sit Down', items: [
                '<strong>Opening + Back-Sell:</strong> Choose a song in Simian. Write your opening line with artist and title using one of the 3 patterns.',
                '<strong>Introduction:</strong> Your name, the station, one honest thing about yourself.',
                '<strong>Promotion:</strong> One line for WCYT — show, event, social media, or website.',
                '<strong>Fun Fact:</strong> Something specific you actually find interesting.',
                '<strong>Pre-Sell:</strong> Choose your next Simian song. Artist, title, reason to stay.',
              ]},
              { type: 'callout', label: 'Every Shift — No Exceptions', items: [
                'Head directly to your studio at the start of air time',
                'Log in to wcyt.org/dj — set status to On Air',
                'Both DJs participate in every break — no one sits out',
                'Write your break before you sit down — do not wing it',
                'Final break: sign off, thank listeners, announce who\'s on next, hit End Show',
                'Headphones on mic stands — wipe them down before you leave',
              ], sideImg: 'images/on-air-checklist.png', sideImgCap: 'On Air Checklist — red items are required every single break.' },
            ]
          },
        ]
      },
      {
        id: 'u2b',
        title: 'Unit 2 — Radio Show Pairs',
        lessons: [
          {
            id: 'radio-pairs',
            title: 'Radio Show Pairs',
            duration: '1 class',
            summary: 'How pairs work — every other song, both stations, what you say in each break.',
            sections: [
              { type: 'intro', content: 'Radio Show Pairs puts two DJs on air together on every other song. Half the class runs The Point, half runs 2.0. You\'re still doing everything from Unit 2 — just with a partner and a faster rotation.',
                sideImg: 'images/pairs-schedule.png', sideImgCap: 'The weekly pairs schedule — The Point 91FM and 2.0 side by side.' },
              { type: 'callout', label: 'How Pairs Work', items: [
                'Half the class is on WCYT The Point — half is on 2.0',
                'Pairs go on air every other song — not every song',
                'Both DJs are on mic for every break — no sitting out',
                'RECORD your shifts — airchecks are required',
              ]},
              { type: 'list', title: 'What Goes In Every Break', items: [
                '<strong>Pre-Sell & Back-Sell</strong> — Artist, title, what just played and what\'s next',
                '<strong>Coming Up in the Hour</strong> — Tease something interesting ahead',
                '<strong>Quick Music News</strong> — One current story from the music world',
                '<strong>Quick Artist Info</strong> — A fact about the artist you just played',
                '<strong>Fun Topic</strong> — Something genuine, your opinion, your personality',
                '<strong>Pre-Sell</strong> — Tease the next song with a reason to stay',
              ]},
              { type: 'callout', label: 'Pick Your Own Playlist', items: [
                'You choose your songs from the Simian catalog — not auto-scheduled',
                'Be creative — don\'t just play the first songs you find',
                'Your playlist should reflect your taste and fit the station\'s vibe',
                'Pre-sell every song before it plays so listeners know what\'s coming',
              ]},
              { type: 'callout', label: '⚠️ Record Every Shift', warning: true, content: 'You must record your airshift every time. Airchecks are how you self-assess, how your teacher grades, and how you build your IASB portfolio. If you don\'t record, that shift didn\'t happen.' },
            ]
          },
        ]
      },
      {
        id: 'u3',
        title: 'Unit 3 — Radio Talk Shows',
        lessons: [
          {
            id: 'show-structure',
            title: 'Talk Show Structure',
            duration: '2 classes',
            summary: 'How a show is structured — three breaks, recurring segments, group formation, and planning.',
            sections: [
              { type: 'intro', content: 'Talk shows run the full class period with two or more hosts. Three 8–10 minute breaks cover News, Celebrities, Entertainment, Social Media, Teens, and Lifestyle. No sports — there\'s a separate class for that.' },
              { type: 'keyterms', title: 'Three-Break Format', terms: [
                { term: 'Break 1', def: 'Introduction — overview of the episode\'s topics + News of the Week. Use Google News, Reddit, or X for a current relevant story.' },
                { term: 'Break 2', def: 'Recurring Segment — your show\'s weekly feature with an engaging hook and station promotion.' },
                { term: 'Break 3', def: 'Main Topic — the signature deep-dive of the episode. Can also be a second news story.' },
              ]},
              { type: 'list', title: 'Topic Categories', items: [
                'Celebrity', 'Video Games', 'Movies', 'Technology',
                'Super Heroes', 'School Life', 'Music', 'Pop Culture', 'Advice',
              ]},
              { type: 'callout', label: '📅 Show Planning — The Day Before', items: [
                'Your group plans the full show the day before it airs — not the morning of',
                'Give Mr. Dunn a rundown before your show: how you\'ll promote each break, and how you\'ll open each break',
                'Each break needs a clear opening line and a promotion plan going in',
                'Unplanned shows sound unplanned — listeners notice and so does the teacher',
              ]},
              { type: 'callout', label: 'Building Your Show Identity', items: [
                'Choose a show name',
                'Write a tagline — one sentence describing what the show is about',
                'Design a recurring segment that gives listeners something consistent to come back for',
                'Use your tagline at the start of every show and in promotional mentions',
              ]},
              { type: 'text', title: 'Finding Your Group', content: 'Groups are 3–4 students. When forming, think about what topic you\'d all genuinely research and talk about every week for a full semester. Shared real interest makes far better radio than just picking your friends.' },
              { type: 'text', title: 'Your Show Thumbnail', content: 'Every show needs a thumbnail that appears on WCYT.org and the DJ panel. Create yours in Canva or Photoshop at <strong>500px × 500px</strong>, JPG or PNG. Email the finished file to adunn@sacs.k12.in.us to get it added. Your thumbnail is the first thing listeners see — make it represent your show.',
                sideImg: 'images/wcyt-homepage.png', sideImgCap: 'Your show thumbnail appears right here on WCYT.org when you\'re on air.' },
              { type: 'gallery', label: 'Student Show Thumbnail Examples', images: [
                { src: 'images/show-thumb-theories.png', alt: 'Off The Theories' },
                { src: 'images/show-thumb-reeltalk.png', alt: 'Reel Talk' },
                { src: 'images/show-thumb-gg.png', alt: 'GG Radio' },
                { src: 'images/show-thumb-davon.png', alt: 'The Davon & Vaughn Show' },
              ]},
              { type: 'video', youtube: 'wQ04EZV9z3M', label: 'How to Make a Successful Radio Show', note: 'Watch this before you plan your first talk show — the structure tips apply directly to your three-break format.' },
            ]
          },
        ]
      },
      {
        id: 'u4',
        title: 'Unit 4 — Production',
        lessons: [
          {
            id: 'destructive-editing',
            title: 'Destructive vs Non-Destructive Editing',
            duration: '1 class',
            summary: 'Why there are two editors in Audition — and which one you should almost always use.',
            sections: [
              { type: 'intro', content: 'Audition has two completely different workspaces: the Waveform Editor and the Multitrack Editor. Most students don\'t understand why both exist. The difference comes down to one question: do your edits permanently change the file, or not?' },
              { type: 'keyterms', title: 'The Two Editors', terms: [
                { term: 'Waveform Editor', def: 'Destructive — every change is stamped permanently onto the audio file. Opens automatically when you double-click a clip.' },
                { term: 'Multitrack Editor', def: 'Non-destructive — changes happen inside the session file. Your original audio clips are never touched.' },
              ], sideImg: 'images/waveform-editor.png', sideImgCap: 'The Waveform Editor shows raw audio at the sample level — every change is permanent.' },
              { type: 'text', title: 'Destructive Editing — The Waveform Editor', content: 'The Waveform Editor opens immediately when you drag in an audio file. It\'s quick and feels obvious, which is why beginners default to it. The problem: every cut, filter, or effect you apply is baked into the file permanently. It\'s like applying an Instagram filter and saving it over your original photo — that first-take audio is gone for good once you hit Save.',
                sideImg: 'images/waveform-editor.png', sideImgCap: 'Waveform Editor — great for trimming dead air at the end of a clip. Bad for anything you might want to undo later.' },
              { type: 'text', title: 'Non-Destructive Editing — The Multitrack', content: 'In the Multitrack Editor, cuts, fades, and effects happen inside the session file — not the source audio. Your original clips are always safe. You can close Audition, come back a week later, and pick up exactly where you left off. This is the right tool for almost every project.',
                sideImg: 'images/multitrack-editor.png', sideImgCap: 'Multitrack Editor — edits live in the session file. The original audio is always preserved.' },
              { type: 'callout', label: '⚠️ Auto-Save Only Works in Multitrack', warning: true, content: '"My computer crashed and I lost everything" — this only happens in the Waveform Editor. The Multitrack has built-in auto-save. Find it under Edit → Preferences → Auto Save. Always work in Multitrack so your project is protected.' },
              { type: 'list', title: 'When to Use Each', items: [
                '<strong>Waveform Editor:</strong> Trimming dead air off the end of a file — a quick fix you\'ll never need to undo',
                '<strong>Waveform Editor:</strong> Noise reduction processing (this effect requires destructive editing)',
                '<strong>Multitrack:</strong> Everything else — DJ breaks, imaging spots, music beds, show recordings',
                'If there\'s even a 5% chance you might want to undo it, use Multitrack',
              ]},
            ]
          },
          {
            id: 'audition-basics',
            title: 'Adobe Audition Basics',
            duration: '2–3 classes',
            summary: 'Destructive vs. non-destructive editing, normalize, hard limit, and audio cleanup tools.',
            sections: [
              { type: 'intro', content: 'Adobe Audition is your main production tool. You\'ll use it to edit airchecks, build show opens, produce promos, master competition entries, and clean up voice recordings.',
                sideImg: 'images/audition-levels.png', sideImgCap: 'Good levels = great audio. This is the first thing you learn.' },
              { type: 'keyterms', title: 'Two Modes of Editing', terms: [
                { term: 'Destructive Edit', def: 'Permanently changes the source audio file. Cannot be undone after saving. Use only when you\'re completely sure.' },
                { term: 'Non-Destructive Edit', def: 'Works with clips and effects on a multitrack timeline. Original file is untouched. This is the default method for most production work.' },
              ]},
              { type: 'video', youtube: 'b0hFYjNQTkI', label: 'Adobe Audition Multitrack Editor — The One Trick That Changes Everything', note: 'This covers exactly the non-destructive workflow you\'ll use for show production.' },
              { type: 'list', title: 'Mastering Your Audio — The 2-Step', items: [
                'Normalize to −0.1 dB (or −6 dB for multitrack mixes)',
                'Apply Hard Limit to prevent clipping and control peak levels',
              ], sideImg: 'images/clipping.png', sideImgCap: 'Clipping = audio hitting the ceiling and distorting. Normalize + Hard Limit prevents this.' },
              { type: 'callout', label: 'Save As .WAV — Always', content: 'Export your final file as .WAV (Wave PCM) for full quality. Never submit an .mp3 for competition or graded projects.',
                sideImg: 'images/save-as-wav.png', sideImgCap: 'Use "Save As" in Audition → Wave PCM. This is your final export step every time.' },
              { type: 'callout', label: 'Quick Cleanup Tool', content: 'Adobe Podcast Enhance (podcast.adobe.com/enhance) dramatically cleans up voice recordings — removes room noise, improves mic quality. Run your audio through it before you master.' },
              { type: 'video', youtube: 'xI0USfUwJRs', label: 'How to Edit Keyframes in Adobe Audition', note: 'Keyframes let you automate volume, panning, and effects over time — essential for building polished promos and show opens.' },
            ]
          },
          {
            id: 'stutter',
            title: 'Stutter Effect',
            duration: '1–2 classes',
            summary: 'Build a stutter effect in Audition using copy/paste, crossfades, and pitch shifting on envelopes.',
            sections: [
              { type: 'intro', content: 'The stutter effect is one of the most recognizable sounds in radio imaging. You\'ll build it by cutting a single word into repeated pieces, crossfading them, then automating a pitch shift over time using envelopes.' },
              { type: 'list', title: 'Step 1 — Record and Set Up', items: [
                'Record: "The Point 91FM — Louder, Clearer, Better"',
                'Record two complete versions',
                'Place your recording into a multitrack session',
              ]},
              { type: 'list', title: 'Step 2 — Build the Stutter', items: [
                'Use the Razor tool to cut after "The Point 91FM, Louder, Clearer"',
                'Move "Better" to the right to create space',
                'Highlight just the "Buh" sound from "Better"',
                'Copy and paste that "Buh" sound 4 times in a row',
                'Make sure all 4 clips are crossfaded into each other',
              ]},
              { type: 'list', title: 'Step 3 — Add Pitch Shift', items: [
                'Open the Effects Rack for your stutter track',
                'Add Time and Pitch → Pitch Shifter',
                'Close the effect popup',
                'Click the > arrow next to the Read menu on your stutter track',
                'Select Show Envelopes → Pitch Shifter',
                'Draw keyframes on the timeline to shift pitch across the stutter',
              ], sideImg: 'images/pitch-shifter-envelope.png', sideImgCap: 'Show Envelopes → Pitch Shifter lets you draw pitch changes over time directly on the track.' },
              { type: 'video', youtube: 'PtJ6bZzFUW8', label: 'How to Get a Stutter Effect on Vocals (Adobe Audition Multitrack)', note: 'This covers the exact stutter workflow you\'ll use — watch before you start.' },
            ]
          },
          {
            id: 'double-track',
            title: 'Double Track',
            duration: '1 class',
            summary: 'Use Automatic Speech Alignment to layer two voice recordings and create a thicker, doubled sound.',
            sections: [
              { type: 'intro', content: 'Double tracking takes two recordings of the same line and aligns them perfectly using Adobe Audition\'s Automatic Speech Alignment tool. The result is a thicker, more powerful vocal sound used in radio imaging and production.' },
              { type: 'list', title: 'How to Double Track', items: [
                'Select your two different "Clearer" audio parts from your recordings',
                'Copy one and paste it to the track directly below the other',
                'Hold <strong>Ctrl + Left Click</strong> to select both clips at once',
                'Right-click one of the clips → <strong>Automatic Speech Alignment</strong>',
                'Audition will align the second clip to match the first perfectly',
              ], sideImg: 'images/audition-remix-align.png', sideImgCap: 'Right-click menu showing Automatic Speech Alignment — this is what locks two vocal tracks together.' },
              { type: 'callout', label: 'Why It Works', items: [
                'Even two perfect takes are slightly different in timing and tone',
                'Speech Alignment corrects those differences automatically',
                'The result sounds thicker and more professional than a single track',
                'Used on station IDs, imaging elements, and show opens',
              ]},
              { type: 'video', youtube: 'Zuxzl8pl-Jg', label: 'Double Up Your Voice in Adobe Audition', note: 'Watch this to see the full double tracking workflow in action.' },
            ]
          },
          {
            id: 'remix-stretch',
            title: 'Remix & Stretch',
            duration: '1–2 classes',
            summary: 'Use Remix to fit a music bed to any length, and Stretch to manually resize audio clips on the timeline.',
            sections: [
              { type: 'intro', content: 'Remix and Stretch are two ways to make audio fit a specific duration. Remix intelligently rearranges a music bed to hit an exact length. Stretch lets you manually drag a clip longer or shorter. Together they\'re essential for production work.' },
              { type: 'list', title: 'Getting Your Files', items: [
                'Log into Benztown: User <strong>wcytfm</strong> / Password <strong>WCYT91.1homestead</strong>',
                'Download 1 music bed and 1 alien/imaging FX clip',
                'Place both into your multitrack session',
              ]},
              { type: 'list', title: 'Enable Remix on Your Music Bed', items: [
                'Right-click your music bed clip on the timeline',
                'Go to <strong>Remix → Enable Remix</strong>',
                'A blue Remix bar will appear on the clip',
              ], sideImg: 'images/audition-remix-align.png', sideImgCap: 'Right-click → Remix → Enable Remix to activate intelligent duration matching.' },
              { type: 'list', title: 'Set Your Target Duration', items: [
                'Click the <strong>Properties</strong> tab in the panel on the right',
                'Change the <strong>Target Duration</strong> to your desired length',
                'Audition will intelligently rearrange the music to fit',
                'Use <strong>Edit Length</strong> slider (Short → Long) to control how much it edits',
                'Use <strong>Features</strong> slider (Timbre → Harmonic) to control what it matches',
              ], sideImg: 'images/remix-properties.png', sideImgCap: 'Remix Properties — set Target Duration and adjust Edit Length and Features sliders.' },
              { type: 'list', title: 'Using Stretch', items: [
                'Select the Stretch icon in the toolbar (time-stretch cursor)',
                'Drag the edge of any clip to make it longer or shorter',
                'Use on your FX sound clip to fit it into your imaging piece',
              ]},
              { type: 'video', youtube: '8xopxZ_zvUU', label: 'Adobe Audition Stretch in the Multitrack', note: 'Covers the Stretch tool — watch before using it on your FX clip.' },
              { type: 'list', title: 'Advanced Remix — Edit Length', items: [
                '<strong>Short</strong> — Creates shorter segments with more edit transitions. Best for songs with a lot of dynamic changes.',
                '<strong>Long</strong> — Finds the longest possible passages with the fewest transitions. Results in smoother, more seamless loops.',
                'Look for the wavy lines on the audio clip — those are the edit points Remix created.',
              ], sideImg: 'images/remix-edit-length.png', sideImgCap: 'Edit Length controls how aggressively Remix cuts the music. Short = more cuts, Long = fewer cuts.' },
              { type: 'keyterms', title: 'Advanced Remix — Features', terms: [
                { term: 'Timbre', def: 'Remix focuses on matching the beats and rhythm of the song. Use this for high-energy, tempo-driven music.' },
                { term: 'Harmonic', def: 'Remix focuses on melody and harmony to find the smoothest edit points. Use this for melodic or slower songs.' },
              ], sideImg: 'images/remix-advanced-panel.png', sideImgCap: 'The Remix properties panel — Features slider moves between Timbre (rhythm) and Harmonic (melody).' },
              { type: 'keyterms', title: 'Advanced Remix — Loop Settings', terms: [
                { term: 'Minimum Loop', def: 'The shortest segment Audition will use, in beats. Segments won\'t be cut shorter than this.' },
                { term: 'Maximum Slack', def: 'Wiggle room around your target duration. Set to 5 seconds with a 30-second target and the output could be anywhere from 25–35 seconds — Audition picks the cleanest edit point in that range.' },
              ]},
            ]
          },
          {
            id: 'reverb',
            title: 'Effects Rack — Reverb',
            duration: '1–2 classes',
            summary: 'Add Studio Reverb via the Effects Rack, then use envelopes to automate the wet/dry mix over time.',
            sections: [
              { type: 'intro', content: 'Reverb adds space and depth to audio — it makes sound feel like it\'s in a room, a hall, or an enormous space. In radio production, you\'ll use it to make station IDs and imaging elements feel bigger. The key skill is automating the reverb with envelopes so it builds over time.' },
              { type: 'list', title: 'Add Reverb via the Effects Rack', items: [
                'Open the Effects Rack panel for your track',
                'Click an empty slot → <strong>Reverb → Studio Reverb</strong>',
                'A Studio Reverb settings window will open',
                'Adjust Room Size, Decay, and Wet/Dry mix to taste',
              ], sideImg: 'images/reverb-menu.png', sideImgCap: 'Effects Rack → Reverb → Studio Reverb. Start here to add reverb to any track.' },
              { type: 'keyterms', title: 'Studio Reverb Settings', terms: [
                { term: 'Room Size', def: 'How large the simulated space is — bigger = more reverb spread' },
                { term: 'Decay', def: 'How long the reverb tail lasts after the sound ends' },
                { term: 'Early Reflections', def: 'The first bounces off walls — affects how natural it sounds' },
                { term: 'Dry', def: 'The original, unaffected signal level' },
                { term: 'Wet', def: 'How much reverb effect is applied — higher = more reverb' },
              ], sideImg: 'images/studio-reverb.png', sideImgCap: 'Studio Reverb settings — start with default and adjust Decay and Wet to hear the difference.' },
              { type: 'list', title: 'Automate Reverb with Envelopes', items: [
                'Click the > arrow next to the Read menu on your reverb track',
                'Select <strong>Show Envelopes → Studio Reverb → Wet Output Level</strong>',
                'An orange envelope line appears on your clip',
                'Add keyframes to make the reverb build up over time',
                'Start dry at the beginning — bring the wet level up toward "Louder"',
              ], sideImg: 'images/reverb-envelope.png', sideImgCap: 'Show Envelopes → Studio Reverb → Wet Output Level — draw keyframes to automate reverb over time.' },
              { type: 'list', title: 'Match Clip Loudness — Final Step', items: [
                'Select all clips in your multitrack',
                'Right-click → <strong>Match Clip Loudness</strong>',
                'This balances all your clips to the same volume before mixdown',
                'Always do this before your final export',
              ], sideImg: 'images/match-clip-loudness.png', sideImgCap: 'Right-click → Match Clip Loudness. Run this on all clips before your final mixdown.' },
            ]
          },
          {
            id: 'spectral-display',
            title: 'Spectral Frequency Display',
            duration: '1 class',
            summary: 'Use the spectral view to visually identify and remove problem sounds — beeps, hisses, and artifacts.',
            sections: [
              { type: 'intro', content: 'The Spectral Frequency Display shows your audio as a heat map — frequency over time, with color representing loudness. It\'s the fastest way to spot and fix problem sounds like beeps, mic hisses, and audio artifacts that are hard to find in a normal waveform view.' },
              { type: 'text', title: 'How to Open It', content: 'The Spectral Display is <strong>not open by default</strong>. Find it in the toolbar at the top of Audition and click to toggle it on. It opens inside the Waveform Editor below your regular waveform view.',
                sideImg: 'images/spectral-display.png', sideImgCap: 'The Spectral Frequency Display — frequency runs along the vertical axis, time runs left to right.' },
              { type: 'keyterms', title: 'Reading the Colors', terms: [
                { term: 'Dark Blue', def: 'Low amplitude — quiet sounds in that frequency range' },
                { term: 'Purple / Red', def: 'Medium amplitude — present but not dominant' },
                { term: 'Orange / Yellow', def: 'High amplitude — the loudest sounds in the display. Bright yellow = maximum intensity.' },
                { term: 'Frequency (vertical)', def: 'Low frequencies at the bottom, high frequencies at the top' },
                { term: 'Time (horizontal)', def: 'The display moves left to right, just like the waveform' },
              ], sideImg: 'images/spectral-display-labeled.png', sideImgCap: 'Bright yellow = loud. Dark blue = quiet. A loud beep shows as a sudden bright vertical stripe.' },
              { type: 'list', title: 'What to Look For', items: [
                '<strong>Beep or tone:</strong> A bright vertical stripe at one frequency — select it with the lasso tool and delete',
                '<strong>Mic hiss:</strong> A consistent band of color across the high frequencies — use Noise Reduction instead',
                '<strong>Click or pop:</strong> A sudden bright flash across all frequencies — zoom in and delete',
                '<strong>Room rumble:</strong> A persistent glow at the very bottom — use a high-pass filter to cut it',
              ]},
              { type: 'callout', label: 'Spectral + Noise Reduction', items: [
                'The Spectral Display helps you SEE problems — Noise Reduction removes them',
                'Effects → Noise Reduction / Restoration → Noise Reduction',
                'Capture a noise print from a section of silence, then apply to the full clip',
                'This is a destructive effect — do it in the Waveform Editor, on a copy of your file',
              ]},
            ]
          },
        ]
      },
      {
        id: 'u5',
        title: 'Unit 5 — IASB Projects',
        lessons: [
          {
            id: 'radio-in-depth',
            title: 'Radio In-Depth (IASB)',
            duration: '1–2 classes',
            summary: 'The IASB long-form storytelling project — what judges score, the required outline, and how to build a 1st-place piece.',
            sections: [
              { type: 'intro', content: 'This is IASB\'s long-form storytelling category. You\'ll create a news or feature story — <strong>2:00 or longer</strong> — focused on a <strong>single topic</strong>. You are not just reporting facts. You are crafting a compelling audio experience that informs, engages, and leaves impact. Final piece due <strong>May 1</strong>.',
                sideImg: 'images/iasb-group.png', sideImgCap: 'The Homestead Audio Broadcasting team at IASB — In-Depth is one of our strongest categories.' },
              { type: 'keyterms', title: 'How IASB Judges Score You', terms: [
                { term: 'Opening', def: 'Does the first 20 seconds hook the listener and set the tone?' },
                { term: 'Content', def: 'Is there real substance — research, facts, and voices that matter?' },
                { term: 'Delivery', def: 'Confident, natural narration that sounds like storytelling, not reading.' },
                { term: 'Audio Quality', def: 'Clean recordings, balanced mix, no clipping or noise.' },
                { term: 'Creativity', def: 'An angle and approach the judges haven\'t heard before.' },
                { term: 'Credibility', def: 'Real voices with real expertise or lived experience.' },
                { term: 'Writing', def: 'Tight, purposeful scripting — every line earns its place.' },
                { term: 'Pacing', def: 'The story keeps moving. No dead spots, no rushing.' },
                { term: 'Closing', def: 'An ending that lands — not a story that just stops.' },
                { term: 'Overall Impact', def: 'Does the listener walk away changed? Everything matters.' },
              ]},
              { type: 'keyterms', title: 'The Six Ingredients of a Strong In-Depth', terms: [
                { term: '1 · Thorough Research', def: 'Go beyond surface-level information. Use interviews, data, and background context.' },
                { term: '2 · Multiple Perspectives', def: 'Include voices outside your immediate circle — IASB requires interviews outside the Homestead bubble.' },
                { term: '3 · Narrative Structure', def: 'Clear beginning → middle → end. Tell a story, don\'t just stack interviews.' },
                { term: '4 · Expert or Direct Experience', def: 'Interview people with lived experience or real expertise on your topic.' },
                { term: '5 · Sound Design', def: 'Ambient sound, natural sound, music beds, sound bites — but don\'t overproduce.' },
                { term: '6 · Context', def: 'Help the listener understand why this topic matters.' },
              ]},
              { type: 'callout', label: '⚠️ Non-Negotiable IASB Guidelines', warning: true, items: [
                'Interview <strong>multiple people from outside the Homestead bubble</strong> — each person needs a specific reason to be part of your story',
                'Your script and interview questions must be turned in',
                '<strong>All full interview audio</strong> must be turned in to the Dropbox — not just the clips you used',
              ]},
              { type: 'list', title: 'Project Timeline', items: [
                '<strong>Topic Proposal — March 3.</strong> One paragraph: your topic, your angle, and who you plan to interview.',
                '<strong>Interview Questions — March 16.</strong> Written questions for every planned interview.',
                '<strong>Full Script — March 27.</strong> Include your planned sound elements, not just narration.',
                '<strong>Final Combined .wav File (2:00+) — May 1.</strong> Mixed, mastered, exported at −6 dB.',
                '<strong>All Full Interview Audio — May 1.</strong> Complete, unedited interviews in the Dropbox.',
              ]},
              { type: 'keyterms', title: 'The Required Story Outline', terms: [
                { term: 'Opening (0:00–0:20)', def: 'Grab attention: a hook, a sound element, and a first line of narration that pulls the listener in.' },
                { term: 'Topic Introduction (0:20–0:45)', def: 'What is the issue or story? Who is involved, and why does it matter?' },
                { term: 'Interview Segment 1', def: 'Your first voice. Why are they credible? What key soundbite are you using?' },
                { term: 'Context / Background', def: 'Historical or statistical info and supporting research that frames the story.' },
                { term: 'Interview Segment 2', def: 'A different perspective — someone who sees the topic from another side.' },
                { term: 'Development / Turning Point', def: 'What new understanding does the listener gain here?' },
                { term: 'Closing', def: 'Reflection, call to action, emotional takeaway, or music fade — end it on purpose.' },
              ], sideImg: 'images/indepth-story-arc.svg', sideImgCap: 'The 2:00 story arc — the turning point is where 1st-place pieces separate themselves.' },
              { type: 'text', title: '🏆 Weak Opening vs. 1st-Place Opening', content: '<em>Weak:</em> "School spirit has changed over the years at Homestead High School."<br><br><em>1st place:</em> (Pep rally crowd building) — Alumni voice: <strong>"I\'ve never heard this gym louder than in 1998."</strong> (Cut to current game ambience) — Current student: <strong>"It\'s different now — but it\'s still ours."</strong> Then narration: "For decades, Homestead spirit has defined what it means to be a Spartan — but what that spirit looks like has changed."<br><br>Hook ✔ Natural sound ✔ Contrast ✔ Emotional tone ✔' },
              { type: 'list', title: 'Interviews at a Winning Level', items: [
                '<strong>Alumni</strong> — specific stories, memories, and examples. Nostalgia is powerful audio.',
                '<strong>Current student</strong> — honest opinions on turnout, not defensive.',
                '<strong>Faculty (20+ years at HHS)</strong> — context and observations on how students have evolved.',
                '<strong>Athletic Director</strong> — numbers, facts, and a statewide perspective.',
                'Every clip: <strong>5–12 seconds</strong>, condensed, emotional or insightful — no filler words.',
              ]},
              { type: 'list', title: 'Sound Design That Wins', items: [
                'Layer real ambience: pep rally, student section, basketball crowd, hallway noise, marching band, PA announcements',
                'Music supports the emotion — it never competes with the voices',
                'Levels balanced, transitions clean',
                '<strong>Final export at −6 dB</strong> — this is on the rubric',
              ], sideImg: 'images/audition-levels.png', sideImgCap: 'Good levels = great audio. The winning mix is clean, balanced, and exported at −6 dB.' },
              { type: 'text', title: '🎙️ Example Topic — The Evolution of Homestead Spirit', content: 'Explore how school spirit has changed over time: alumni interviews, current student voices, historical context, personal stories, ambient school sounds, and a clear narrative arc. The turning point is not <em>"spirit isn\'t the same anymore"</em> — it\'s <strong>"spirit looks different, and that difference reflects who students are now."</strong> If your story doesn\'t clearly say something, it won\'t win.' },
              { type: 'callout', label: 'Listen Like a Judge — Professional Examples', items: [
                '<a href="https://drive.google.com/file/d/1g6orsjugL2-ejbwt9JowPUkZVPuKJ5Y-/view" target="_blank" rel="noopener">Radiolab ↗</a> — narrative science storytelling with layered sound design',
                '<a href="https://drive.google.com/file/d/10pQTugNcsMgxjn2XqTM0TW6o81jZHkD1/view" target="_blank" rel="noopener">99% Invisible ↗</a> — making an overlooked topic fascinating in minutes',
                '<a href="https://drive.google.com/file/d/17QW88cG-4Jrk0MiOuovWXPL6skAL0cB6/view" target="_blank" rel="noopener">Twenty Thousand Hertz ↗</a> — sound itself as the story',
                'Stuck on a topic? <a href="https://training.npr.org/2016/10/17/3-simple-ways-to-find-story-ideas/" target="_blank" rel="noopener">NPR Training: Simple ways to find story ideas ↗</a>',
              ]},
              { type: 'keyterms', title: 'Homestead\'s In-Depth Record', terms: [
                { term: '🥇 1st Place · 2025', def: '<a href="https://drive.google.com/file/d/1-wp1hEedkyQ0ebsVGMCIQIpbV_fgdd4Q/view" target="_blank" rel="noopener">Leah Steup — listen to the winning piece ↗</a>' },
                { term: '🥇 1st Place · 2024', def: '<a href="https://drive.google.com/file/d/18-w0axryIDxPWA6EtBkx5NxP970W0bnc/view" target="_blank" rel="noopener">Carly Swymeler — listen to the winning piece ↗</a>' },
                { term: '🥈 2nd Place', def: '<a href="https://drive.google.com/file/d/1C_lazViWRb8vnBd-O4ADeRg-W2as8zBL/view" target="_blank" rel="noopener">Ashton Hackman (2020) ↗</a> · <a href="https://drive.google.com/file/d/1kPSC-EW0MIzUXyFEyR3PpU0BoznKReBB/view" target="_blank" rel="noopener">Abigail Boylan (2018) ↗</a> · <a href="https://drive.google.com/file/d/1EFX1yd5_8ii4eryQQ9kW8RNaiMf5SAbu/view" target="_blank" rel="noopener">Madison McConahay (2015) ↗</a>' },
                { term: '🥉 3rd Place', def: '<a href="https://drive.google.com/file/d/1OyEvKTFrMh3yUWuYzqJd-PiE5KsCyhtn/view" target="_blank" rel="noopener">Sydney Scholl (2018) ↗</a> · <a href="https://drive.google.com/file/d/1Va3nKwTP--HyK_Y35Ql_hhNNbZpG1zDG/view" target="_blank" rel="noopener">Abigail Boylan (2017) ↗</a> · <a href="https://drive.google.com/file/d/1V_UfEr9ThAox9uQB9UBM7_Bml_19DRXB/view" target="_blank" rel="noopener">Gabe Smith (2016) ↗</a>' },
                { term: 'Your Entry · 2027', def: 'Homestead won this category in 2024 and 2025 — then the 2026 title went to another school. The next two slides are those winning pieces. Study them, then go take it back.' },
              ]},
              { type: 'audio',
                src: 'audio/carly-swymeler-in-depth-2024.mp3',
                label: '🥇 Listen: Carly Swymeler — 2024 State Champion',
                context: 'This piece won 1st in the state in 2024. Listen once straight through as a listener. Then listen again as a judge — score it against the ten criteria from the start of this lesson.',
                note: '<strong>Track the outline as you listen:</strong> Where does the opening hook end and the topic introduction begin? When does the first outside voice enter? Can you point to the turning point — the moment you understood something new?' },
              { type: 'audio',
                src: 'audio/leah-steup-in-depth-2025.mp3',
                label: '🥇 Listen: Leah Steup — 2025 State Champion',
                context: 'Back-to-back: this one took 1st in 2025. This time, focus on the sound design — what is underneath the narration at every moment, and when does it change?',
                tip: '⭐ <strong>Steal like a broadcaster:</strong> Pick one specific technique from either winning piece — a transition, a soundbite placement, an ambience choice — and decide where it fits in your own story before you write your topic proposal.' },
            ]
          },
          {
            id: 'iasb-imaging',
            title: 'Imaging (IASB)',
            duration: '1–2 classes',
            summary: 'Station imaging — sweepers, promos, and jingles. Build 10+ pieces, brand them consistently, and cut a 2:00 collage.',
            sections: [
              { type: 'intro', content: 'Imaging is the sound of the station itself — the sweepers, drop-ins, promos, and jingles between the music. For IASB you\'ll submit a <strong>collage of multiple productions, no longer than 2:00 total</strong>. Judges score consistency of branding, execution, use of sound, creativity, production value, voices, pacing, and overall effect. Due <strong>October 31</strong>.' },
              { type: 'keyterms', title: 'What Counts as Imaging', terms: [
                { term: 'Sweeper', def: 'A short produced piece that bridges two songs or segments while stamping the station\'s identity.' },
                { term: 'Drop-in', def: 'A quick branded element dropped into a show — a tagline, a voice hit, an effect.' },
                { term: 'Promo', def: 'A produced spot promoting something the station does — a show, an event, streaming on WCYT.O-R-G.' },
                { term: 'Jingle', def: 'A sung or musical station identifier. The stickiest form of branding there is.' },
              ]},
              { type: 'callout', label: '⚠️ Non-Negotiable IASB Guidelines', warning: true, items: [
                '<strong>10–15 different script concepts</strong> written out and turned in',
                'Final project: a collage of station imaging <strong>close to 2 minutes</strong>',
                'Branding must be consistent — say <strong>"2 Point Oh, The Next Level of Radio"</strong> the exact same way, with the same effects, every single time',
                'Multiple layers, a well-written script, and a real mix of sounds',
              ]},
              { type: 'list', title: 'The Build Process', items: [
                'Write your 10–15 concepts first — promote taglines, streaming on WCYT.O-R-G, radio shows, styles, and more',
                'Build a <strong>separate multitrack session for each production</strong>, and mix each one down',
                'Combine all the mixdowns into one final multitrack, then mix down once more into the collage',
                'Concept pieces are good — but not always necessary. Branding consistency wins over cleverness.',
              ]},
              { type: 'list', title: 'Your Dropbox Must Include', items: [
                'One scripting page with all 10–15 concepts',
                'A separate folder for each production — every media file plus the multitrack session file',
                'The final project file: the collage, just under 2:00',
              ]},
              { type: 'list', title: 'What "Excellent" Sounds Like (Straight From the Rubric)', items: [
                'Script peer/teacher reviewed, clear message, fun concept',
                'Multiple voices that hold the listener\'s complete attention',
                'Clean vocals, balanced music and effects — <strong>final .wav at −6 dB</strong>',
                'One tagline, one focused branding technique, across every piece',
                'Total runtime <strong>1:30–2:00</strong>',
              ]},
              { type: 'keyterms', title: 'Homestead\'s Imaging Record', terms: [
                { term: '🥇 1st Place × 5', def: '<a href="https://drive.google.com/file/d/1TesZ46RaKjOIsGWy8RFzKXRA0s0qYIzN/view" target="_blank" rel="noopener">Julian Shine (2007) ↗</a> · <a href="https://drive.google.com/file/d/14SzpdmE6xpow9Kc_uUfTTlKsKvUg33Uh/view" target="_blank" rel="noopener">Casey Stanley (2015) ↗</a> · <a href="https://drive.google.com/file/d/1gih4PXdiWj5TkIdx19GfLnpKrYgUUGAv/view" target="_blank" rel="noopener">Kolin Davis (2017) ↗</a> · <a href="https://drive.google.com/file/d/18luED9W7i5XUolXUGCAfBGXbFzzq15ig/view" target="_blank" rel="noopener">Drew Persinger (2021) ↗</a> · <a href="https://drive.google.com/file/d/157g_Vra0mp8tvG5XepObzDehRC-HZ_s8/view" target="_blank" rel="noopener">Devyn Brown (2023) ↗</a>' },
                { term: '🥈 2nd Place', def: '<a href="https://drive.google.com/file/d/1c9hfC77N6XeASOZGEyP5sHpXl-sqBrAf/view" target="_blank" rel="noopener">Casey Stanley (2014) ↗</a> · <a href="https://drive.google.com/file/d/1BZ1RPvX9WotpPZ0qLPOdYLqUChc-7Oj1/view" target="_blank" rel="noopener">Drew Persinger (2019) ↗</a> · <a href="https://drive.google.com/file/d/1CSMC_DTvgNRleip08PBpQAdk3XPkn6Cr/view" target="_blank" rel="noopener">Ian Fraser (2024) ↗</a>' },
                { term: '🥉 3rd Place', def: '<a href="https://drive.google.com/file/d/1xqAFKaYl06ULc-k_XPKP6A8ABgsHDPlt/view" target="_blank" rel="noopener">Andy Dunn & Julian Shine (2006) ↗</a> · Tyler Marshall (2009)' },
                { term: '🎧 Study the Winners', def: 'Imaging is Homestead\'s strongest category — five state titles. <a href="https://drive.google.com/drive/folders/1DBtR70gzQkJUCWdzIWWPO5yggVM8m-S-" target="_blank" rel="noopener">Browse the 2025 IASB Imaging winners folder ↗</a> before you write a single concept.' },
              ]},
            ]
          },
          {
            id: 'imaging-4-weeks',
            title: '4 Weeks of Imaging',
            duration: '4 weeks',
            summary: 'The week-by-week build for the Imaging entry — Rule of 3, sound collage, multiple voices, and production tricks. Two pieces a week, 25 points each.',
            sections: [
              { type: 'intro', content: 'This is how the Imaging entry actually gets built: <strong>four weeks, one style per week, two pieces per week at 25 points each</strong>, plus 5 points per script. Every script runs 10–30 seconds toward a 2:00 maximum collage. Start by listening to <a href="https://drive.google.com/file/d/11bARZtYJX72TrIE_pmMtszl5n-rGa698/view" target="_blank" rel="noopener">Twenty Thousand Hertz — the history of radio jingles ↗</a>.' },
              { type: 'keyterms', title: 'The Four Weeks', terms: [
                { term: 'Week 1 · Rule of 3', def: 'Two Rule-of-3 liners — <a href="https://www.youtube.com/watch?v=ub3oqHPUJy8" target="_blank" rel="noopener">watch the technique ↗</a>. One uses the provided script: "The Point 91FM has expanded its signal!… The Point 91FM: Louder, Clearer, Better."' },
                { term: 'Week 2 · Sound Collage', def: 'Two liners built from <strong>6–10 different found sounds</strong>, using "Louder, Clearer, Better" & "Where Music is the Point." <a href="https://drive.google.com/file/d/1devJTbS_5WbufHVmOh2AUgn_hedm0QYL/view" target="_blank" rel="noopener">Example ↗</a>' },
                { term: 'Week 3 · Multiple Voices', def: 'Two liners layering multiple voices, using "Louder, Clearer, Better" & "Your Alternative to Commercial Radio." <a href="https://drive.google.com/file/d/1e43h4ykZfRSr0h4_e5tsSniWfR4mCEgc/view" target="_blank" rel="noopener">Example ↗</a>' },
                { term: 'Week 4 · Production Tricks', def: 'Two liners using <strong>3–5 production tricks</strong>, with "Louder, Clearer, Better" & "The Independent Music Source." <a href="https://drive.google.com/file/d/1Csrrf7V1ws-6xBqtrtWaXN7_eqaYYZZ4/view" target="_blank" rel="noopener">Example ↗</a>' },
              ]},
              { type: 'list', title: 'The Production Tricks Toolbox (Week 4)', items: [
                '<strong>Stuttering</strong> — <a href="https://youtu.be/PtJ6bZzFUW8" target="_blank" rel="noopener">stutter effect in Audition Multitrack ↗</a> — "WCYT, 2.0 The Next Level Of Radio…"',
                '<strong>Double vocal layering</strong> — <a href="https://www.youtube.com/watch?v=Zuxzl8pl-Jg" target="_blank" rel="noopener">double up your voice ↗</a> — "New WCYT Text line — 260-702-9118"',
                '<strong>Time stretch</strong> — <a href="https://www.youtube.com/watch?v=8xopxZ_zvUU" target="_blank" rel="noopener">stretch in the Multitrack ↗</a> — "best of, best of, best of…"',
                '<strong>Reverse reverb</strong> — <a href="https://youtu.be/kx62MjMvBsw?t=530" target="_blank" rel="noopener">reverse vocal effect (from 9:00) ↗</a> — *BUILD UP* "IIIIIITTTTTTTTS the point 91fm…"',
              ]},
              { type: 'list', title: 'Steps to Success (Every Piece, Every Week)', items: [
                '<strong>Script it</strong> — 10 to 30 seconds each, tracked in your Imaging Tracker with all 8 scripts',
                '<strong>Define your sound</strong> — Benztown branding with layers for voice, drones, music, and effects (Benztown voice samples and AI voices are fair game, so is recording a clip from YouTube)',
                '<strong>Mix</strong> — every layer leveled so the voice is clear and audible, mixed down to <strong>−6 dB</strong>',
                'Incorporate the week\'s style into <strong>all</strong> your pieces — extra points for going beyond the bare minimum',
              ]},
              { type: 'callout', label: '🎧 The Benchmark', content: 'The rubric\'s example for a sound collage is <a href="https://drive.google.com/file/d/157g_Vra0mp8tvG5XepObzDehRC-HZ_s8/view" target="_blank" rel="noopener">Devyn Brown\'s 1st-place 2023 Imaging entry ↗</a>. That\'s what eight weeks of pieces distilled to 2:00 sounds like — study it before Week 1.' },
            ]
          },
          {
            id: 'bhm-liners',
            title: 'Black History Month Liners',
            duration: '1 week',
            summary: 'Two station liners for WCYT\'s Black History Month programming — exact scripts, music bed, clean FM mix. Airs all month.',
            sections: [
              { type: 'intro', content: 'This week we <strong>pause the 4 Weeks of Imaging project</strong> to produce two Black History Month station liners for The Point. These aren\'t practice — <strong>they air on WCYT all month long</strong>, promoting the nightly 7 p.m. Black History Month celebration.' },
              { type: 'keyterms', title: 'The Two Required Scripts (Do NOT Change the Wording)', terms: [
                { term: 'Liner 1 · The Promo', def: '"It\'s Black History Month. Tune in every night at 7 p.m. to celebrate Black musicians with your host, John. Black History Month on The Point 91 FM and WCYT dot org." — Save as <strong>BlackHistCom-YourName.wav</strong>' },
                { term: 'Liner 2 · The Bumper', def: '"You\'re listening to the Black History Month celebration, all month long with John on The Point 91 FM and streaming at WCYT dot org." — Save as <strong>BlackHistSpot-YourName.wav</strong>' },
              ]},
              { type: 'list', title: 'Production Requirements', items: [
                'Two separate recordings — one per script',
                'A <strong>music bed under each liner</strong> that supports, never overpowers, the voice',
                'Voice clear and <strong>front-mixed</strong> — no sound effects beyond the bed',
                'No advanced effects required — keep it clean and professional for FM broadcast',
                'Clear, confident delivery',
              ]},
              { type: 'callout', label: '⚠️ Submission', warning: true, items: [
                'Both files to the assigned <a href="https://drive.google.com/drive/u/0/folders/1QlPmUI02g_WAymFKXgV_Xje6m8MT4B49" target="_blank" rel="noopener">Dropbox folder ↗</a>',
                'Files must be named <strong>exactly</strong> as specified to receive full credit',
                'When you\'re done, you return to the 4 Weeks of Imaging project',
              ]},
            ]
          },
          {
            id: 'iasb-air-personality',
            title: 'Air Personality (IASB)',
            duration: '1–2 classes',
            summary: 'The solo DJ category — 5 recorded shifts on 2.0, then a 2–3 minute scoped aircheck of your best breaks. Top 6 compete live in Indianapolis.',
            sections: [
              { type: 'intro', content: 'Air Personality is IASB\'s solo radio show category — and one of the big ones: the <strong>top 6 entries compete live in Indianapolis</strong>. Judges score voice quality, ad-libbing, content, appropriate energy, pacing, phrasing, getting in and out of breaks, overall delivery, and connecting with the audience.' },
              { type: 'callout', label: 'Who Can Pick This Project', warning: true, items: [
                'Only students who have <strong>excelled at air personality this year</strong> and have recorded class versions can enter',
                '<strong>5 different shifts</strong> recorded and turned in — all recorded on the <strong>2.0 station</strong>',
                'Scripts must be turned in',
                'Final project: a <strong>scoped aircheck (music removed), 2:00–3:00</strong>, of your best breaks',
              ]},
              { type: 'keyterms', title: 'Terms That Win This Category', terms: [
                { term: 'Hit the Post', def: 'Talking up to the exact moment the lyrics begin — without stepping on the vocals. Also: riding the instrumental ramp of a song\'s intro.' },
                { term: 'Scoped Aircheck', def: 'Your shift with the music cut out — just your breaks, back to back. This is what the judges hear.' },
                { term: 'Backsell', def: 'Identifying the songs that just played. "That was…" and "you just heard…" are too basic — find a different way every break.' },
              ]},
              { type: 'list', title: 'Every Break Must Include', items: [
                'Your name',
                'Pre- and post-song titles <strong>and</strong> artists',
                'The tagline or station identity — <strong>2 Point Oh, "The Next Level of Radio"</strong>',
                'A hook — keep listeners invested in what\'s coming up',
                'Homestead Media promotions, a couple of times per shift',
                'Different in/out transitions every single break — condensed, informative, entertaining',
              ]},
              { type: 'list', title: 'Your Dropbox Must Include (25 Points Per File)', items: [
                'One script page — bullet-pointed or written out',
                'A folder with your full shifts from the semester',
                'The final project file: 2–3 minutes of your best breaks, scoped',
              ]},
              { type: 'callout', label: '🎧 Train Your Ear — Professional Air Personalities', items: [
                '<a href="https://drive.google.com/file/d/1Y7FgJGUEYUJOjARL9ICvn6Fg2J46dQnn/view" target="_blank" rel="noopener">Cheryl Waters — KEXP ↗</a> and <a href="https://drive.google.com/file/d/1yJjB4CxVQDsu93m-XEVeloB0-13h04bW/view" target="_blank" rel="noopener">Mike — WXPN ↗</a>',
                'Stream on your own: <a href="https://www.kexp.org/archive/" target="_blank" rel="noopener">KEXP Archive ↗</a> · <a href="https://xpn.org/" target="_blank" rel="noopener">WXPN ↗</a> · <a href="https://kutx.org/streams/" target="_blank" rel="noopener">KUTX ↗</a> · <a href="https://kxt.org/listen/" target="_blank" rel="noopener">KXT 91.7 ↗</a> · <a href="https://wfmu.org/" target="_blank" rel="noopener">WFMU 91.1 ↗</a>',
                'Build a playlist of 20 songs from the <a href="https://docs.google.com/spreadsheets/d/1sUeWFHL2m0YepzHGDUWnLJUXRBWlFZfy78POqIDWfpQ/edit" target="_blank" rel="noopener">WCYT & 2.0 Music Catalog ↗</a>',
              ]},
              { type: 'keyterms', title: 'Homestead\'s Air Personality Record', terms: [
                { term: '🥇 1st Place', def: '<a href="https://drive.google.com/file/d/1fqkrbw2qNmTYL5OgSv7rKc65mZbZa5oR/view" target="_blank" rel="noopener">Macy Gray (2024) ↗</a> — the rubric\'s own example for delivery. Strong presence, confidence, professional.' },
                { term: '🥈 2nd Place', def: '<a href="https://drive.google.com/file/d/19Q8RomuXYlOZgX0XZthRRZd1S5w2BVaP/view" target="_blank" rel="noopener">Kolin Davis (2017) ↗</a> · <a href="https://drive.google.com/file/d/1B2QyVEoZsP93R8qKld74VosaI_epe_GK/view" target="_blank" rel="noopener">Macy Gray (2023) ↗</a> · <a href="https://drive.google.com/file/d/1E-UbMPKhTUnqkLJpD7oH9ieIrLvRkmpi/view" target="_blank" rel="noopener">Carter Schwartz (2025) ↗</a>' },
                { term: '🎤 Live Finals', def: 'Make the top 6 and you\'re on stage in Indianapolis doing it live. Macy went from 2nd in 2023 to 1st in 2024 — the tape you make this semester is the audition.' },
              ]},
            ]
          },
          {
            id: 'iasb-talk-show',
            title: 'Talk Show (IASB)',
            duration: '1–2 classes',
            summary: 'A 5–7 minute scoped aircheck of your best talk show episode — opinion, interviews, and interaction. Homestead has won it two years running.',
            sections: [
              { type: 'intro', content: 'Submit a <strong>scoped aircheck of 5–7 minutes</strong> that best represents a talk show as presented to the audience — featuring a variety of elements: opinion, interviews, and interaction. Judges score knowledge, content, ad-libbing, introduction of topic/guest, appropriate energy, interaction, delivery, production elements, and overall impression.' },
              { type: 'callout', label: '⚠️ Before You Go On Air', warning: true, content: 'Every talk show needs a <strong>well-written script before any time on the air</strong> — and it must be approved by Mr. Dunn. Record every show on Adobe Audition.' },
              { type: 'list', title: 'The Craft — What Separates Good Shows', items: [
                'One host introduces themselves <strong>and their co-host</strong> every break',
                'The first break gets a <strong>rundown of topics</strong>',
                'Use the Textline, and build social media interaction — polls and questions on today\'s topic',
                'Take breaks — don\'t go 20 minutes straight. Exit with a hook: <em>"Stay tuned — the X segment is coming up, and X is joining us to tell us all about it."</em>',
                'Build segments up from the start of the show so listeners stay excited to reach them',
                'Pre-planning is crucial — every winning entry in this category was planned, not improvised',
              ]},
              { type: 'list', title: 'What "Excellent" Looks Like (Straight From the Rubric)', items: [
                'Hosts <strong>play well off each other and give each other space</strong> — and clearly know the topic',
                'Topics and guests get a real introduction, with background and relatable context',
                'Strong presence, confidence, professional delivery',
                'Two production elements: a <strong>professional show intro</strong> and a <strong>show liner</strong>',
                'Scoped runtime <strong>5:00–7:00</strong> — significantly under or over costs you',
              ]},
              { type: 'callout', label: '🎧 Listen First', items: [
                '<a href="https://drive.google.com/file/d/1-9xkyZBMqcl_TzLCRGV5TI7cjiU1A5Yg/view" target="_blank" rel="noopener">The Bobby Bones Show ↗</a> — the professional benchmark for host chemistry and segment flow',
                '<a href="https://drive.google.com/file/d/19O3Ks8Zj1QXxyCgOHFAkJ5mOGrma8DUa/view" target="_blank" rel="noopener">Dickmeyer, Burns & Baker (1st, 2024) ↗</a> and <a href="https://drive.google.com/file/d/1je5NdP7BG6msiam4bAQvfRymeGYY8fg7/view" target="_blank" rel="noopener">their 2025 repeat ↗</a> — the current champs, twice over',
              ]},
              { type: 'keyterms', title: 'Homestead\'s Talk Show Record', terms: [
                { term: '🥇 1st Place × 3', def: '<a href="https://drive.google.com/file/d/1u8ciy6CEsiQ_J5i4B7z5EXJof3yCQCEy/view" target="_blank" rel="noopener">Jenna Lane & Karlie Flanagan (2021) ↗</a> · <a href="https://drive.google.com/file/d/19O3Ks8Zj1QXxyCgOHFAkJ5mOGrma8DUa/view" target="_blank" rel="noopener">Grace Dickmeyer, Caroline Burns & Alayna Baker (2024) ↗</a> · <a href="https://drive.google.com/file/d/1je5NdP7BG6msiam4bAQvfRymeGYY8fg7/view" target="_blank" rel="noopener">same trio (2025) ↗</a>' },
                { term: '🥈 2nd Place', def: '<a href="https://drive.google.com/file/d/1ybq0LZv8s-IOO_izLm7R8K3EfWtHRdE1/view" target="_blank" rel="noopener">Kolin Davis, Hallie Nowak & Colby Shoup (2015) ↗</a> · <a href="https://drive.google.com/file/d/1K46fwYxncRbo01DLKr1Hhhry4KsfqQe_/view" target="_blank" rel="noopener">Jessica Walter & Ellie Davis (2018) ↗</a> · <a href="https://drive.google.com/file/d/1Gjslao0D93H72qtJIEm_nWPT3PgGYSkY/view" target="_blank" rel="noopener">Walter & Davis again (2019) ↗</a>' },
                { term: '🥉 3rd Place', def: '<a href="https://drive.google.com/file/d/1bwoebh9FHAIijbSdq-RlvJ6E-MQvbyhz/view" target="_blank" rel="noopener">Brayden Carroll (2021)* ↗</a> · <a href="https://drive.google.com/file/d/1i-16U7wU3IzUhAPiNyd_OP5bPiemoRDJ/view" target="_blank" rel="noopener">Jenna Lane & Karlie Flanagan (2022) ↗</a> · <a href="https://drive.google.com/file/d/1zrBxJdJxZlyHQmjVZ8xtIbKRDdspEcc_/view" target="_blank" rel="noopener">Austin Render & Connor Fitzharris (2015)* ↗</a> — *would now fall under Sports Talk Show' },
                { term: '🔁 The Streak', def: 'The same trio won 1st in 2024 and 2025 — and they built both wins on pre-planning, chemistry, and segment structure. That formula is on this slide deck.' },
              ]},
            ]
          },
          {
            id: 'iasb-copywriting',
            title: 'Copywriting (IASB)',
            duration: '1 class',
            summary: 'Write one 60-second spot from the client\'s copy points — talent roles, music, sound effects, and production directions all on the page.',
            sections: [
              { type: 'intro', content: 'Copywriting is the one category where <strong>the script IS the entry</strong> — nothing gets produced. You write one <strong>60-second spot</strong> from the client\'s copy points, noting talent roles, music, sound effects, and specific production directions. Judges score the lead, holding attention, creation of interest and desire, delivering the client\'s message, call to action, creativity, and timing. <strong>One written script due January 31.</strong>' },
              { type: 'keyterms', title: 'This Year\'s Client Brief', terms: [
                { term: 'Client', def: 'IHSAA Champions Network — 70+ terrestrial radio stations plus 150+ video affiliates on IHSAAtv.org, blanketing the state with high school sports coverage.' },
                { term: 'Target Audience', def: 'Student-athletes, coaches, administrators, fans, and parents.' },
                { term: 'Required Call to Action', def: '"Watch and listen on IHSAAtv.org (O-R-G) — spread the word."' },
                { term: 'Required Closing Line', def: '"This promotional spot is for the IHSAA Champions Network promoting the coverage of high school athletics."' },
              ]},
              { type: 'list', title: 'Your Script Must Include', items: [
                '<strong>Sounds</strong> — sound effects, background music, and ambience, listed at their exact location in the script',
                '<strong>All copy points</strong> — the client\'s message, the call to action, and the required closing line',
                '<strong>60 seconds</strong> — when you finish the script, read it out loud and time yourself',
                'Script formatting — page divided up so each voice and segment is clearly stated',
              ]},
              { type: 'list', title: 'What "Excellent" Looks Like (Straight From the Rubric)', items: [
                'A lead that is informed <strong>and grabs the listener from the first line</strong>',
                'Interesting, original material with multiple voices',
                'The right amount of copy points — enough to deliver the message, not a data dump — with a great call to action',
                'Timed exactly when read aloud',
                'Music and sound effects written at the exact spot they fire',
              ]},
              { type: 'callout', label: '📖 Study These Before You Write', items: [
                '<a href="https://docs.google.com/document/d/1Wk7_RwhSZTeLjBM-95eDApfv2YhjsFf6Hh0s30INYu0/" target="_blank" rel="noopener">The perfect example script — Nisha Lalria\'s 1st-place entry (2022) ↗</a>',
                '<a href="https://drive.google.com/file/d/1Z3je43oYq5vf0sSPUqqaPZ9h8GWGyI7x/view" target="_blank" rel="noopener">Listen to a produced spot ↗</a> — and picture how you would write it out on the page',
              ]},
              { type: 'keyterms', title: 'Homestead\'s Copywriting Record', terms: [
                { term: '🥇 1st Place', def: '<a href="https://docs.google.com/document/u/0/d/1Wk7_RwhSZTeLjBM-95eDApfv2YhjsFf6Hh0s30INYu0/edit" target="_blank" rel="noopener">Nisha Lalria (2022) ↗</a> — her script is the "perfect example" linked above. Read it twice.' },
                { term: '🥈 2nd Place', def: '<a href="https://drive.google.com/file/d/16azWz9FHzTgr7KVbpbhfjqPe2PrlppUF/view" target="_blank" rel="noopener">Kolin Davis (2016) ↗</a>' },
                { term: '🥉 3rd Place', def: '<a href="https://drive.google.com/file/d/1WWu2BpwH0ecVPJ60AzB9f-uI1TWowMAR/view" target="_blank" rel="noopener">Tyler Veit (2021) ↗</a> · <a href="https://docs.google.com/document/d/165uobWWRez-jC1GKmzt4mOyXMI8V-kG6/edit" target="_blank" rel="noopener">Ian Fraser (2024) ↗</a>' },
              ]},
            ]
          },
          {
            id: 'iasb-spot-production',
            title: 'Spot Production (IASB)',
            duration: '1–2 classes',
            summary: 'An original commercial, PSA, or station promo — exactly 30 or 60 seconds. Homestead\'s second-strongest category with six state titles.',
            sections: [
              { type: 'intro', content: 'Submit an <strong>original commercial, public service announcement, or station promo</strong> — 30 or 60 seconds long. Judges score concept, production value, opening, voices, delivery, script, use of sound, creativity, closing, and timing. And timing is brutal: <strong>:29.0–:30.0 or :59.0–:60.0</strong>. Not "about" thirty seconds. Thirty seconds.' },
              { type: 'list', title: 'What Could Your Spot Promote?', items: [
                'Station taglines — <strong>2.0, "The Next Level of Radio"</strong>',
                'Streaming on WCYT.O-R-G',
                'Radio shows and the style of music',
                'Sports broadcasts and Homestead Media',
                'Or go public service — a PSA counts',
                'Concept pieces are good, but not always necessary',
              ]},
              { type: 'callout', label: '⚠️ Non-Negotiable IASB Guidelines', warning: true, items: [
                '<strong>3 different script concepts</strong> written out and turned in',
                'The final script must be written in full <strong>IASB Copywriting format</strong>, sound effects listed — <a href="https://docs.google.com/document/d/1Wk7_RwhSZTeLjBM-95eDApfv2YhjsFf6Hh0s30INYu0/edit" target="_blank" rel="noopener">see the example ↗</a>',
                'Final project: a commercial or promo for our media program, <strong>30 or 60 seconds EXACTLY</strong>',
                'Multiple layers, a well-written script, and a real mix of sounds',
              ]},
              { type: 'list', title: 'Your Dropbox Must Include', items: [
                'One scripting page with 3 concepts plus one full Copywriting version of the final spot',
                'A folder with every media file you used, plus the multitrack session file',
                'The final project file — 30 or 60 seconds long',
              ]},
              { type: 'list', title: 'What "Excellent" Sounds Like (Straight From the Rubric)', items: [
                'Script peer/teacher reviewed, clear message, fun concept',
                'Multiple voices with interesting, original material',
                'Vocal effects, sound effects, and music bed all present and balanced — <strong>final .wav at −6 dB</strong>',
                'A strong broadcasting voice that knows when to change style and range',
                'Dead-on <strong>:30.0 or :60.0</strong>',
              ]},
              { type: 'keyterms', title: 'Homestead\'s Spot Production Record', terms: [
                { term: '🥇 1st Place × 6', def: '<a href="https://drive.google.com/file/d/1fSJVWs_akdwRIaKy1I3U1BifJQpwhz81/view" target="_blank" rel="noopener">Mike Dutton (2005) ↗</a> · <a href="https://drive.google.com/file/d/1lfl7vuSaJE_9mS7qJrwqOGT8nMfdJYAF/view" target="_blank" rel="noopener">Andrew Sims & Kaitlyn Rauch (2009) ↗</a> · <a href="https://drive.google.com/file/d/1rs1HdcEqv4QQ7GjkPfdJay3VtDLP-lEq/view" target="_blank" rel="noopener">Christina Kruger (2019) ↗</a> · <a href="https://drive.google.com/file/d/1_TJ6FJX1HDZ198x5r5HTN9oXf_KaNkxb/view" target="_blank" rel="noopener">Christina Kruger (2020) ↗</a> · <a href="https://drive.google.com/file/d/1hT951ofiqGCH97MDKyI7igoUh4Gn6DCF/view" target="_blank" rel="noopener">Easton Hensley (2021) ↗</a> · <a href="https://drive.google.com/file/d/19cwCTfsi99BEHxxZMLO8uoCQwMxocWaS/view" target="_blank" rel="noopener">Chris Bay (2023) ↗</a>' },
                { term: '🥈 2nd Place × 5', def: 'Andrew Sims & Kaitlyn Rauch (2008) · <a href="https://drive.google.com/file/d/1wn0KD5CeLxMMBJUha4JmuSZuSwRRjP8K/view" target="_blank" rel="noopener">Matt Hamilton (2014) ↗</a> · <a href="https://drive.google.com/file/d/1A5T7gqgxeutg6XyUgNKn-T2lss-mKWxF/view" target="_blank" rel="noopener">Joe Swymeler, Cameron Kruger & Evan Cole (2018) ↗</a> · <a href="https://drive.google.com/file/d/1JU2qyQquOHcnELXinObbAnPKQmCq6shf/view" target="_blank" rel="noopener">John Lane (2019) ↗</a> · <a href="https://drive.google.com/file/d/1YTBRkcliroLvZl4m6XrCLJCz4SGu-mXD/view" target="_blank" rel="noopener">Christina Kruger (2021) ↗</a>' },
                { term: '🥉 3rd Place × 3', def: 'Julian Shine (2007) · Dan Vandergriff & Kaitlyn Rauch (2011) · <a href="https://drive.google.com/file/d/1nhZhB_TFc3VbskO0DsneTgV-014DU_0D/view" target="_blank" rel="noopener">Kolin Davis (2015) ↗</a>' },
                { term: '👑 The Kruger Standard', def: 'Christina Kruger placed four straight years — 1st, 1st, 2nd — and her 2019 and 2020 spots are the rubric\'s own examples for production value and script. Start there.' },
              ]},
            ]
          },
          {
            id: 'iasb-drama',
            title: 'Adapted & Original Drama (IASB)',
            duration: '1–2 classes',
            summary: 'A 5–15 minute audio drama — existing or original script, multiple voice actors, and a world built entirely out of sound. Due October 31.',
            sections: [
              { type: 'intro', content: 'Submit an audio drama — produced from an <strong>existing script (Adapted)</strong> or an <strong>original script</strong> — at least 5 minutes, no longer than 15. Judges listen to excerpts at their discretion and score the opening, delivery, scene transitions, acting, music and sound effects, and conclusion. Due <strong>October 31</strong>.' },
              { type: 'list', title: 'The Full-Credit Formula', items: [
                'Find a script — or use an excerpt from a longer one. <a href="https://drive.google.com/drive/folders/1Nw0Ov18k1p--ymxuhxI3-fvPbzAhB4Dd" target="_blank" rel="noopener">Script ideas folder ↗</a>',
                'Record with <strong>multiple voice actors</strong> — they don\'t have to be from the media classes',
                'Build the world with sound effects and music, then act — don\'t read',
                'Turn in the script as a PDF along with the mixed-down audio file',
              ]},
              { type: 'list', title: 'Set the Stage With Sound', items: [
                'Once you have the script, make the listener <strong>envision the world</strong> — sound effects and world noise carry the scene',
                'Free libraries: <a href="https://freesound.org/" target="_blank" rel="noopener">Freesound ↗</a> and <a href="https://pixabay.com/sound-effects/" target="_blank" rel="noopener">Pixabay (90,000+ effects) ↗</a>',
                'Open with the script\'s title and writer over a music bed — it instantly sounds professional',
                'Get someone else to listen to your voice — is it convincing for the plot?',
                'Don\'t be afraid to re-record. If a line doesn\'t match, redo it. Energy must match the script.',
              ]},
              { type: 'callout', label: '⚠️ Your Dropbox Must Include', warning: true, items: [
                'The script — written or pasted into the project page',
                'A mixed-down .wav, <strong>5:00–15:00</strong>',
                'A separate folder for every audio piece you used, plus the multitrack session file',
                'Save everything — multitrack file, voices, effects — in one folder as you work',
              ]},
              { type: 'callout', label: '🎧 Professional Examples — The Truth Podcast (Original Scripts)', items: [
                '<a href="https://drive.google.com/file/d/1Racab7jZZruVpp7AzF6RkGnHOt4krSAv/view" target="_blank" rel="noopener">Heat Meet ↗</a> · <a href="https://drive.google.com/file/d/1gPRs7ahkJVZDRK4kQmkqWQ-GTEgSp3YV/view" target="_blank" rel="noopener">Keep Running ↗</a> · <a href="https://drive.google.com/file/d/1vaq4e9LKZ0WevkQPwQL0Ny6wv0Zcpu5Z/view" target="_blank" rel="noopener">About the Pond ↗</a> · <a href="https://drive.google.com/file/d/14DyFFqp2el7Zm3pU4R6u0viIVennJjHY/view" target="_blank" rel="noopener">The Grand Finale ↗</a> · <a href="https://drive.google.com/file/d/1dBwOekANZ4NxtChXINqeeHY-_evfeHCu/view" target="_blank" rel="noopener">Phonebank Kismet ↗</a>',
                'Listen for how every scene establishes its space in the first two seconds of sound',
              ]},
              { type: 'keyterms', title: 'Homestead\'s Drama Record', terms: [
                { term: '🥇 Original Drama — 1st × 4', def: '<a href="https://drive.google.com/file/d/15L7wbv0C6rFguscABuYWSVC0rgTmiITe/view" target="_blank" rel="noopener">Andy Dunn & Julian Shine (2006) ↗</a> · <a href="https://drive.google.com/file/d/1Gb3vg6EG-VNg8BdqZpliPFyoYEygcxyP/view" target="_blank" rel="noopener">Madi & PJ Yoquelet (2018) ↗</a> · <a href="https://drive.google.com/file/d/1-GqvF1r-ksXEhzd7wo81zOwYZQJedUph/view" target="_blank" rel="noopener">Devyn Brown (2023) ↗</a> · <a href="https://drive.google.com/file/d/1UHKEQuNgD8jeGq5rW9kekbzqG8Wml1S6/view" target="_blank" rel="noopener">Dax Thakker (2024) ↗</a>' },
                { term: '🥉 Original Drama — 3rd', def: '<a href="https://drive.google.com/file/d/1RkdbftWO5dz_EiHtvKAy10slwM-q1_o-/view" target="_blank" rel="noopener">Kolin Davis (2017) ↗</a>' },
                { term: '🥈 Adapted Drama — 2nd', def: '<a href="https://drive.google.com/file/d/10DDg6qiFv86Oe-4tyd0IptAaE5cwg-3Z/view" target="_blank" rel="noopener">Thomas Lazar (2022) ↗</a> — Adapted Drama\'s 1st place is still unclaimed by Homestead.' },
                { term: '🎬 Production Benchmark', def: '<a href="https://drive.google.com/file/d/1jO4tpbGLgc1DipzSkUQ9s8lPCcLkHJD9/view" target="_blank" rel="noopener">Ian Fraser\'s Dune drama ↗</a> is the rubric\'s own example for a clean, balanced −6 dB mix.' },
              ]},
            ]
          },
          {
            id: 'iasb-interview',
            title: 'Interview (IASB)',
            duration: '2 classes',
            summary: 'A 5+ minute interview with someone outside the Homestead bubble — built on pre-interview research, open-ended questions, and a real promotion.',
            sections: [
              { type: 'intro', content: 'Submit an interview of <strong>5 minutes or longer</strong> — no characterizations, no fictional characters. Judges score the introduction, question order, quality and depth of questions, delivery, style, and conclusion. Pick a topic that genuinely interests you: any topic qualifies, but the interview must focus on <strong>a specific topic or event associated with the guest</strong>.' },
              { type: 'callout', label: '⚠️ Who You Can Interview', warning: true, items: [
                'Someone <strong>outside the Homestead Media program and your immediate family</strong>',
                'The person needs a specific topic to be interviewed about, plus an event or project to promote',
                'Interviewing someone <strong>not currently in high school</strong> earns extra points',
              ]},
              { type: 'list', title: 'The Process (This Is Most of the Grade)', items: [
                '<strong>Three interview options (10 pts)</strong> — who, what topic, and what you could promote for them',
                '<strong>Pre-interview (20 pts)</strong> — 10 closed-ended questions answered by email, text, or call. The pre-interview turns "Where did you write your song?" into "Your song was written during COVID in the South — how did southern living shape your writing?"',
                '<strong>Outline (20 pts)</strong> — introduction, 10 open-ended questions, and a written close',
                '<strong>The finished interview (100 pts)</strong> — played on air and uploaded to WCYT\'s Spotify for all podcast apps',
              ]},
              { type: 'keyterms', title: 'The Anatomy of a Great Interview', terms: [
                { term: 'Introduction', def: 'Introduce yourself first. Give the guest\'s background — tell their story for them — and do their promotion up front.' },
                { term: 'Questions', def: 'Open-ended How and Why questions with a purpose. You already got the Who, What, and When in the pre-interview.' },
                { term: 'The Research Rule', def: 'If it\'s on their website or social media, don\'t ask it. "When is your event?" is never a question. Provide answers to researchable facts yourself.' },
                { term: 'Open vs. Closed', def: '"Are you scared this will happen again?" gets a Yes/No. "What factors will stop this from happening again?" gets a story.' },
                { term: 'The Close', def: 'Reword the promotion, thank the guest, ask if there\'s anything else they\'d like to share — then sign off strong: <strong>"For WCYT, I\'m [your name]."</strong>' },
                { term: 'Personality', def: 'Lead with poise, follow up on answers, and give the guest room — no "yeah," no "uh huh," no talking over.' },
              ]},
              { type: 'callout', label: '🎧 Listen Before You Book Anyone', items: [
                '<a href="https://drive.google.com/drive/folders/14RUfbFQUV080wYjfM8VGMInaGb6sXsqI" target="_blank" rel="noopener">Jesse Thorn examples ↗</a> — a master of the research-driven interview',
                'Past student work: <a href="https://drive.google.com/file/d/1p5Aawcjxc3NXDWDXL9q2aIqPZKpe895U/view" target="_blank" rel="noopener">Example 1 ↗</a> · <a href="https://drive.google.com/file/d/19loO2ZQ0BemxIqXfphl4_6zyPRtrhFlh/view" target="_blank" rel="noopener">2 ↗</a> · <a href="https://drive.google.com/file/d/1G10pdXnFAJQyGGJzKGdVm6Y-I9CDQW_C/view" target="_blank" rel="noopener">3 ↗</a> · <a href="https://drive.google.com/file/d/1JrtY-b_UxTIDFr-2k-0XQ3fOoPagmFdA/view" target="_blank" rel="noopener">4 ↗</a> · <a href="https://drive.google.com/file/d/1Ze1QTjaiRnkMfpmsYokz2yXBmyaWxq05/view" target="_blank" rel="noopener">5 ↗</a>',
                'Dropbox needs: the interview page linked, plus a .wav — <strong>5:00 minimum, 15:00 max, aim to stay under 10</strong>',
              ]},
              { type: 'keyterms', title: 'Homestead\'s Interview Record', terms: [
                { term: '🥇 1st Place', def: 'Jake Lemon (2007)' },
                { term: '🥈 2nd Place × 3', def: '<a href="https://drive.google.com/file/d/1ZKFxokTuEHxeNBfmOumK-7KicFfXk0gh/view" target="_blank" rel="noopener">Christina Kruger (2019) ↗</a> · <a href="https://drive.google.com/file/d/18Sugif51YeiRixLfDiWOR2Bm53bID7NN/view" target="_blank" rel="noopener">Austin Render (2016) ↗</a> · Evan Roberts (2008)' },
                { term: '🥉 3rd Place × 4', def: '<a href="https://drive.google.com/file/d/1H7o2LMzYD4HcCfePgKyW4LhTexzvikVc/view" target="_blank" rel="noopener">Donnie Harmon (2020) ↗</a> · Chris Jorgensen (2007) · Jake Lemon (2006) · Joe Pasquali (2005)' },
                { term: '🎯 The Gap', def: 'Eight placements but only one title — and none since 2007. This category is wide open for someone who does the pre-interview work.' },
              ]},
            ]
          },
          {
            id: 'iasb-podcast',
            title: 'Podcasting (IASB)',
            duration: '2 classes',
            summary: 'A four-episode podcast series with a partner — theme, tagline, intro music, commercial, and episodes on WCYT\'s Spotify feed.',
            sections: [
              { type: 'intro', content: 'You and a partner will create a <strong>professional-grade podcast series of four episodes</strong> — aired live on WCYT The Point 91FM and published to <a href="https://open.spotify.com/show/7g9PiMxCO93XMKJzLkLu7D" target="_blank" rel="noopener">WCYT\'s Spotify feed ↗</a>. The IASB entry is one episode, <strong>5–15 minutes</strong>, using music and production elements to create a compelling audio experience. Judges score pre-planning, opening, effective and efficient storytelling, creativity, originality, production quality, vocal performance, and closing. <strong>Open, commercial, and Episode 1 outline due January 21.</strong>' },
              { type: 'keyterms', title: 'Pick Your Style', terms: [
                { term: 'Narrative', def: 'Find a story and tell it with interlaced interviews. The best style for IASB and the NPR contest — think 99% Invisible, Twenty Thousand Hertz, This American Life.' },
                { term: 'Interview', def: 'The most popular podcast style — the focus can be anything, not just the guest. Think How I Built This, Song Exploder, TED Interview.' },
                { term: 'Roundtable', def: 'A crew talking through topics with structure — think 1A, This Week in Tech, No Dunks.' },
                { term: 'Other', def: 'Fiction and format-breakers like Welcome to Night Vale. Harder to score, unforgettable when it works.' },
              ]},
              { type: 'list', title: 'Part 1 — Concept Development (10 pts)', items: [
                '<strong>Theme</strong> — one overarching idea for the series (example: students\' trials and tribulations)',
                '<strong>4–5 episode topics</strong> filled out on your assignment sheet',
                '<strong>Tagline</strong> — one line that opens every episode: <em>"Exploring the voices and stories of tomorrow\'s leaders."</em>',
                '<strong>Intro music</strong> that matches the show\'s tone — choose it or make it',
                '<strong>A 30-second commercial</strong> played during another group\'s show — hosts, premise, and the required line: <em>"Listen to us live on Fridays on WCYT.org or on your favorite podcast platform"</em>',
              ]},
              { type: 'list', title: 'Parts 2–4 — Plan, Produce, Submit', items: [
                '<strong>Episode planning (15 pts/episode)</strong> — outline every episode: Break 1 and Break 2, 7 minutes max each',
                'Structure each episode: <strong>beginning</strong> (chit-chat intro of the topic) → <strong>middle</strong> (the meat) → <strong>end</strong> (a game, question of the week, or listener mail to change the pace)',
                '<strong>Recording & production (50 pts)</strong> — record every show, remove the music, drop in another group\'s commercial',
                '<strong>Final submission (25 pts/episode)</strong> — Dropbox gets: 4 scripts, 4 complete recordings, and the open + commercial audio files',
              ]},
              { type: 'callout', label: '🎧 Learn From the Best', items: [
                'NPR guides: <a href="https://www.npr.org/2021/06/22/1009098800/how-to-start-a-podcast-npr-advice" target="_blank" rel="noopener">How to Start a Podcast ↗</a> · <a href="https://www.npr.org/2018/11/15/662070097/starting-your-podcast-a-guide-for-students" target="_blank" rel="noopener">A Guide for Students ↗</a>',
                'Narrative: <a href="https://drive.google.com/file/d/1LAp6qHAeg11roQiNQxJwIf_--LLbZfBU/view" target="_blank" rel="noopener">Life Kit ↗</a> · <a href="https://drive.google.com/file/d/1LudisAlDF81jGJHBVp6sNrot6Vsf2_6q/view" target="_blank" rel="noopener">Moo Deng & the viral zoo animal ↗</a> · <a href="https://drive.google.com/file/d/1GbvzcC0M9AtLVjt16J1NCOh5tHhar0Y5/view" target="_blank" rel="noopener">Radiolab ↗</a>',
                'Roundtable: <a href="https://drive.google.com/file/d/1BH4lw1fxpLaCmU69tY9qn2zn6sSWi9Sb/view" target="_blank" rel="noopener">Vergecast ↗</a> · <a href="https://drive.google.com/file/d/10PCAqfx9nQ3J8qPCIBAqhVOIYD-UvkFT/view" target="_blank" rel="noopener">Pop Culture Happy Hour ↗</a> — Interview: <a href="https://drive.google.com/file/d/1SmXglSlcjNPbhl8FKwT694C7TmjfLpvY/view" target="_blank" rel="noopener">David Letterman ↗</a> · <a href="https://drive.google.com/file/d/1OpqOU_4mW1GyKlX89cXut_4NIMDtDon8/view" target="_blank" rel="noopener">Fresh Air ↗</a>',
                '<a href="https://drive.google.com/file/d/1GlmNtIQzmQkzoDJfBIChNRWrFD2hBx2C/view" target="_blank" rel="noopener">NPR Podcast Challenge winner ↗</a> and <a href="https://drive.google.com/file/d/1xMot9Gq2KXHw525qNA8mtnluWdY2RUrm/view" target="_blank" rel="noopener">How To Win The Competition.mp3 ↗</a>',
              ]},
              { type: 'list', title: 'What "Excellent" Sounds Like (Straight From the Rubric)', items: [
                'Well-organized segments that are easy to follow — the organization sheet was actually used',
                'A strong opening that explains the show, introduces the hosts, and previews the topic',
                'Purposeful, open-ended questions built on real knowledge',
                'Clear vocals, balanced music and effects — <strong>final .wav at −6 dB</strong>',
                'Confident hosting: follow-ups, no interruptions, no "yeah / uh huh"',
                '<strong>5:00 minimum, aim to stay under 15:00</strong>',
              ]},
            ]
          },
          {
            id: 'fcc-issue-report',
            title: 'FCC Issue Report',
            duration: '2 classes',
            summary: 'Real FCC compliance: research a community issue, record four 3-minute breaks, and file the report in WCYT\'s public FCC file.',
            sections: [
              { type: 'intro', content: 'This one is not a competition — it\'s <strong>the law</strong>. Every quarter, WCYT must air programming responsive to significant community needs, issues, and concerns, and document it. Your write-up gets uploaded to <a href="https://publicfiles.fcc.gov/fm-profile/wcyt/Issues%20and%20Programs%20Lists/25bf308f-db7a-d953-a897-24394dd5fb00" target="_blank" rel="noopener">WCYT\'s FCC Public Inspection File ↗</a> — where <strong>anyone in the world can read it</strong>.' },
              { type: 'text', title: 'Why This Exists', content: '"The FCC requires each broadcast station to air a reasonable amount of programming responsive to significant community needs, issues, and problems as determined by the station," per FCC counsel Scott Flick. The station must keep a list with a narrative describing each issue treated — including the <strong>time, date, duration, and title</strong> of each program. The burden is on the broadcaster to prove it. You are the broadcaster.' },
              { type: 'list', title: 'The Project — 100 Points in 4 Parts', items: [
                '<strong>Part 1 (15 pts):</strong> Three possible topics — who at Homestead to get a quote from, why the FCC would approve it, and 3+ sources',
                '<strong>Part 2 (15 pts):</strong> Outline all four breaks — rundown, development, and conclusion',
                '<strong>Part 3 (20 pts):</strong> The FCC template — issue, description (full paragraph), air date/time, length, hosts',
                '<strong>Part 4 (50 pts):</strong> Record <strong>four breaks, 3+ minutes each</strong>, exported at −6 dB, into your personalized Dropbox folder with this document linked',
              ]},
              { type: 'callout', label: '⚠️ On Air, DO NOT', warning: true, items: [
                'Mention "Issue Report" — listeners don\'t need to know this',
                'Give <strong>any</strong> of your own opinions on the topic',
                'Forget to include resources for listeners to look into',
                'Stray from the topic',
              ]},
              { type: 'list', title: 'The Research Standard', items: [
                'Topics must be backed by <strong>.edu, .org, and .gov</strong> sources only — facts, no opinions',
                'Cite your sources on air — it builds credibility with listeners',
                'Get a quote from Homestead staff — your counselor, teachers, SRO, or administration can also help you find a topic',
                'Everyone shares their Issue Report with the class before anyone goes on air',
              ]},
              { type: 'callout', label: '🎧 Study a Full Example', items: [
                '<a href="https://docs.google.com/document/d/1rzXguYomACzoAMiKqYj1KKJf93cddliPUTG8XStcaig/edit" target="_blank" rel="noopener">Water Pollution Issue Report — the model write-up ↗</a>',
                'All four breaks: <a href="https://drive.google.com/file/d/18hgLQfUSXGUYVhRJtBf2bBeD45MogJOu/view" target="_blank" rel="noopener">Break 1 ↗</a> · <a href="https://drive.google.com/file/d/1lWPFabkqTtPB3TVyfVoosTa4cwpcMy6Z/view" target="_blank" rel="noopener">Break 2 ↗</a> · <a href="https://drive.google.com/file/d/1R2hL8OMiu4Jis6aiaGnDZ7LqHpNz_Kj5/view" target="_blank" rel="noopener">Break 3 ↗</a> · <a href="https://drive.google.com/file/d/190qTZ8RMOD3PoU1XoDp1XMtoBo_yMMmU/view" target="_blank" rel="noopener">Break 4 ↗</a>',
                'More filed examples: <a href="https://publicfiles.fcc.gov/fm-profile/wicr/more-public-files/" target="_blank" rel="noopener">WICR\'s public file (UIndy) ↗</a>',
              ]},
            ]
          },
          {
            id: 'iasb-radio-show',
            title: 'Radio Show (IASB)',
            duration: '1–2 classes',
            summary: 'Team air personality — a 5–7 minute scoped aircheck of a music radio show with a co-host. Can\'t be done alone.',
            sections: [
              { type: 'intro', content: 'Submit a <strong>scoped aircheck of 5–7 minutes (music removed)</strong> of a radio show as presented to the audience. Judges score content, announcer interaction, delivery, connecting with the audience, production elements, and overall impression. Think of this as <strong>team air personality — you can\'t do this project alone</strong>.' },
              { type: 'list', title: 'The Craft — Running a Show With a Co-Host', items: [
                'One host introduces themselves <strong>and their co-host</strong> every break',
                'First break: a rundown of topics <strong>and the artists</strong> playing during the show',
                'Use the Textline — ask for requests and mention them on air',
                'Build social media interaction: polls on what song should end your set, questions on today\'s topic',
                'Transitions: talk over the music beds of song intros (<strong>hit the post</strong>), and hook listeners before every break — <em>"Stay tuned, when we come back it\'s our weekly segment…"</em>',
                'Build segments up from the start of the show, and use the <a href="https://docs.google.com/spreadsheets/d/1P2UQZK1fbMvvOhtO9h-h1o2B_i7PcpA4SNrVI2tqNqY/edit" target="_blank" rel="noopener">On Air Checklist ↗</a> every time',
              ]},
              { type: 'callout', label: '⚠️ Non-Negotiable IASB Guidelines', warning: true, items: [
                'Shows recorded <strong>after school on 2.0 or WCYT, on Tuesdays</strong>',
                '<strong>3 different shows</strong> recorded and turned in, with <strong>3 scripts</strong>',
                'Final project: a scoped aircheck of 5–7 minutes that best represents a radio show',
                'Build a playlist of 20 songs from the <a href="https://docs.google.com/spreadsheets/d/1sUeWFHL2m0YepzHGDUWnLJUXRBWlFZfy78POqIDWfpQ/edit" target="_blank" rel="noopener">2.0 / WCYT Music Catalog ↗</a> — song suggestions welcome (clean only) to adunn@sacs.k12.in.us',
              ]},
              { type: 'list', title: 'What "Excellent" Sounds Like (Straight From the Rubric)', items: [
                'Top-notch music information, fun facts, and short topics — organized and developed',
                'Hosts play well off each other and <strong>give each other space</strong>',
                'Strong presence, confidence, professional delivery',
                'Social media and Textline woven in — <strong>talk to listeners like they\'re your friend</strong>',
                'A professional show intro and a show liner',
                'Scoped runtime <strong>5:00–7:00</strong>',
              ]},
              { type: 'callout', label: '🎧 Listen First', items: [
                'Pro examples: <a href="https://drive.google.com/file/d/1x2MkA5s1s-1QiYWFMnc93F89mJHDIjzo/view" target="_blank" rel="noopener">NPR 1 ↗</a> · <a href="https://drive.google.com/file/d/12yC2Hrp26zNjTL-SPbyhUPDa_AWtEXA4/view" target="_blank" rel="noopener">NPR 2 ↗</a> · <a href="https://drive.google.com/file/d/1V3DCnUgdvnoGmxBhzvgcdrD73LOTGaX2/view" target="_blank" rel="noopener">NPR 3 ↗</a> — plus <a href="https://www.soundopinions.org/episodes" target="_blank" rel="noopener">Sound Opinions ↗</a> and <a href="https://www.npr.org/sections/allsongs/" target="_blank" rel="noopener">All Songs Considered ↗</a>',
                '<a href="https://drive.google.com/file/d/1NaQwwOxlzK_YAq44YQSB0Ke8nOBY9Iwj/view" target="_blank" rel="noopener">Macy Gray & Lily Frost (2nd, 2024) ↗</a> — the most recent Homestead placement in this category',
              ]},
              { type: 'keyterms', title: 'Homestead\'s Radio Show Record', terms: [
                { term: '🥇 1st Place × 2', def: '<a href="https://drive.google.com/file/d/1diB73er6OpefxFiAUuiMNk5oTRwsYm2N/view" target="_blank" rel="noopener">Cora Shaw & Karlie Flanagan (2020)* ↗</a> · <a href="https://drive.google.com/file/d/1Ddla4WCAOwKk33zjPPA_pPmYjAbO07Ia/view" target="_blank" rel="noopener">Shaw & Flanagan again (2021)* ↗</a>' },
                { term: '🥈 2nd Place × 3', def: '<a href="https://drive.google.com/file/d/11L0wWiZD03gukcFbpGflc36Bs2krKKDz/view" target="_blank" rel="noopener">Karlie Flanagan & Nisha Lalria (2022)* ↗</a> · <a href="https://drive.google.com/file/d/1jWEId0sef1gNHBQV2rtjkozJ6eToRaM1/view" target="_blank" rel="noopener">Nada Dahouk & Michelle Obioma (2023) ↗</a> · <a href="https://drive.google.com/file/d/1NaQwwOxlzK_YAq44YQSB0Ke8nOBY9Iwj/view" target="_blank" rel="noopener">Macy Gray & Lily Frost (2024) ↗</a>' },
                { term: '🥉 3rd Place × 2', def: '<a href="https://drive.google.com/file/d/1r-mlnEoi_7mc2RvfiFbgO9KQ-DUwIpCr/view" target="_blank" rel="noopener">Easton Hensley & Tyler Veit (2019) ↗</a> · <a href="https://drive.google.com/file/d/10_R50wJf6KQF_IbEn3MVGOsKOk86BND6/view" target="_blank" rel="noopener">Nada Dahouk & Michelle Obioma (2022)* ↗</a> — *entries that would now fall under Talk Show' },
              ]},
            ]
          },
          {
            id: 'iasb-news-anchor',
            title: 'News Anchor (IASB)',
            duration: '1–2 classes',
            summary: 'A 3–5 minute newscast — global to local story order, scripted word for word, delivered like a professional. Due October 31.',
            sections: [
              { type: 'intro', content: 'Submit a single newscast — <strong>3 to 5 minutes</strong> — which may include sounders, sound bites, theme music, and jingles. One student acts as the DJ for the day and introduces the news anchor at the end of their air personality shift. Judges score story order, delivery, energy, articulation, pronunciation, pacing, transitions, and credibility. Due <strong>October 31</strong>.' },
              { type: 'keyterms', title: 'The Story Order (Every Newscast)', terms: [
                { term: '1 · Global', def: 'The world story your listeners need first.' },
                { term: '2 · National', def: 'The biggest story in the country.' },
                { term: '3 · State of Indiana', def: 'What matters at the state level.' },
                { term: '4 · Local', def: 'Fort Wayne and the Homestead community.' },
                { term: '5 · Fluff', def: 'Sports, weather, or something uplifting — end with a smile.' },
              ]},
              { type: 'list', title: 'The Delivery Standard', items: [
                'Open with <strong>"For your WCYT news report, I\'m ___"</strong> and close with <strong>"That was your WCYT news report, I\'m ___"</strong>',
                'Script <strong>everything</strong> you\'re going to say — 3 main stories plus the fluff piece',
                'Learn pronunciations before going on — <strong>names, cities, and businesses</strong> (find video examples to confirm)',
                'Conversational style — skip the jargon people don\'t actually use',
                'Understand the stories: get background before you go live, and pace yourself',
              ]},
              { type: 'callout', label: '⚠️ Non-Negotiable IASB Guidelines', warning: true, items: [
                '<strong>5 different newscasts</strong> recorded and turned in — all on the <strong>2.0 station</strong>',
                'Scripts turned in — one script page with your written-out news scripts',
                'The next day, find your report in the skimmer and put it in the news anchor Dropbox',
                'Final project: your best newscast, 3:00–5:00',
              ]},
              { type: 'callout', label: '🎧 Sound Like the Pros', items: [
                '<a href="https://drive.google.com/file/d/1oZ5uKO3jJtmoK865EuCVon2OU-32EUcD/view" target="_blank" rel="noopener">NPR News example 1 ↗</a> · <a href="https://drive.google.com/file/d/1QE-3G4boX6DJkwuFcBj9bdrPzMwse0IS/view" target="_blank" rel="noopener">NPR News example 2 ↗</a>',
                'More on your own: <a href="https://www.npr.org/podcasts-and-shows/" target="_blank" rel="noopener">NPR Podcasts & Shows ↗</a> — select Hourly News in the top header',
              ]},
              { type: 'keyterms', title: 'Homestead\'s News Anchor Record', terms: [
                { term: '🥇 1st Place × 3', def: '<a href="https://drive.google.com/file/d/1ZQL54PQFgDyLBCs3kwLlsoeM4pWZ4B_R/view" target="_blank" rel="noopener">Kolin Davis (2017) ↗</a> · <a href="https://drive.google.com/file/d/1gd8fQsPnKTPdTcO4Thj-dxccQPOmFYe2/view" target="_blank" rel="noopener">Cory Balkenbusch (2018) ↗</a> · <a href="https://drive.google.com/file/d/153xXm3XH_jrYDNUSpzWn5MY-xLHsF6AG/view" target="_blank" rel="noopener">Easton Hensley (2021) ↗</a>' },
                { term: '🥈 2nd Place × 4', def: '<a href="https://drive.google.com/file/d/1uJmRtz2mx9l3ShpR-yQG0ycdxtpSlNDG/view" target="_blank" rel="noopener">Cory Balkenbusch (2017) ↗</a> · <a href="https://drive.google.com/file/d/112RspfES46yyHXYhwL446yGzVSDsyxV6/view" target="_blank" rel="noopener">Sydney Scholl (2018) ↗</a> · <a href="https://drive.google.com/file/d/11l_wOmgDUUb1zIsOMn_MqM5IOzxwjuuX/view" target="_blank" rel="noopener">Cory Balkenbusch (2019) ↗</a> · <a href="https://drive.google.com/file/d/1oX8mn0JTww5Y_b_q9qFpMoz80tt40l7b/view" target="_blank" rel="noopener">Cora Shaw (2022) ↗</a>' },
                { term: '🥉 3rd Place', def: '<a href="https://drive.google.com/file/d/1LPUhLnbqAQXV3OOf7HsLJ03PRUCF2pCs/view" target="_blank" rel="noopener">Carson Clymer (2020) ↗</a> — eight total placements makes this one of Homestead\'s most consistent categories.' },
              ]},
            ]
          },
          {
            id: 'legal-id-aircheck-final',
            title: 'Legal ID & Aircheck — Semester Final',
            duration: '1–2 classes',
            summary: 'The final project: a dry sponsor read, the WCYT legal ID over a subtle bed, and your best five breaks in one polished mixdown. Due December 18.',
            sections: [
              { type: 'intro', content: 'The semester final: <strong>plan, voice, record, and deliver broadcast-ready content</strong> — professional on-air announcements plus a polished air personality mixdown, applying vocal performance, station branding, file naming conventions, and technical audio standards. Due <strong>December 18</strong>, into the Audio Broadcasting Final Dropbox in a folder with your name.' },
              { type: 'keyterms', title: 'The Three Deliverables', terms: [
                { term: '1 · Brought To You By', def: 'Dry voice only, no music. "This hour on The Point 91 FM is brought to you by…" — natural sponsor read, smile in the voice, clean breaths. Save as <strong>BTYB-YourName.wav</strong>' },
                { term: '2 · Legal ID', def: '15–20 seconds over a subtle bed: "The Point is… WCYT 91.1, Lafayette Township, Fort Wayne — a broadcast service of Homestead High School — presented by Homestead Media — online at WCYT dot org — The Point 91 FM, where music is the point." Save as <strong>LegalID-YourName.wav</strong>' },
                { term: '3 · Aircheck Mixdown', def: 'Your best five breaks from this semester\'s air personality shifts or radio shows — songs removed, assembled into one continuous mixdown with show fades on scoped segments. Save as <strong>AirPerson-YourName.wav</strong>' },
              ]},
              { type: 'callout', label: '⚠️ Pronunciation Check', warning: true, content: 'In the Legal ID, "Lafayette" is pronounced <strong>lah-fy-ETT</strong>. Get it right before you press record — this ID airs on a licensed station.' },
              { type: 'list', title: 'Technical Specs & Quality Control', items: [
                'File format: <strong>.wav</strong>, peaks around <strong>−6 dBFS</strong>, no clipping, consistent level across all files',
                'Music beds tasteful and <strong>under</strong> the voice — on everything except the BTYB',
                'Trim leading and trailing dead air; clean edits and breaths',
                'File names exactly as specified — replace "YourName" and nothing else',
                'Don\'t just read — <strong>perform</strong>. Pace yourself, and re-record weak takes.',
              ]},
              { type: 'list', title: 'Final Checklist Before You Submit', items: [
                'BTYB-YourName.wav — dry VO',
                'LegalID-YourName.wav — 15–20s, subtle bed',
                'AirPerson-YourName.wav — best five breaks',
                'All files peak −6 dBFS with no clipping',
                'Everything in your named folder in the Dropbox',
              ]},
            ]
          },
        ]
      },
    ]
  },
  live: {
    name: 'Homestead Live',
    color: '#06b6d4',
    icon: '🎬',
    desc: 'Produce and broadcast live Homestead sports — graphics, play-by-play, camera operation, and directing.',
    units: [
      {
        id: 'u1',
        title: 'Unit 1 — Broadcast Graphics',
        lessons: [
          {
            id: 'graphics-basics',
            title: 'Graphics Basics',
            duration: '1–2 classes',
            summary: 'Photoshop setup, font rules, safe area standards, and the full-game graphic requirements for every Homestead Live broadcast.',
            sections: [
              { type: 'intro', content: 'Every graphic you make for Homestead Live follows the same set of standards. Learn these once and they apply to Football, Basketball, Volleyball — every sport. This lesson covers Photoshop setup, the Industry font family, safe area rules, and what scoreboards need to pull every game.' },
              { type: 'callout', label: '🔤 The #1 Rule', items: [
                '<strong>CAPITALIZE EVERYTHING.</strong> All team names, player names, locations, and labels must be in ALL CAPS on every graphic. No exceptions.',
              ]},
              { type: 'keyterms', title: 'Photoshop Document Setup', terms: [
                { term: 'Resolution', def: '1920 × 1080 px — standard HD broadcast resolution. Never smaller.' },
                { term: 'DPI', def: '300 DPI for print-quality sharpness, even for video graphics.' },
                { term: 'Color Mode', def: 'RGB — not CMYK. Video displays use RGB color.' },
                { term: 'Background', def: 'Transparent — not white or black. Transparency lets graphics layer over video in the switcher.' },
              ]},
              { type: 'keyterms', title: 'Font Family', terms: [
                { term: 'Industry', def: 'The official Homestead Live font family. Used for all scoreboard numbers, team names, labels, and lower thirds. Download from the Assets drive, or <a href="https://fonts.adobe.com/fonts/industry" target="_blank">activate on Adobe Fonts ↗</a>.' },
                { term: 'Industry Bold', def: 'Use for scores, records, key stats — anything that needs to punch at a distance.' },
                { term: 'Industry Book', def: 'Use for secondary labels, sub-headings, and supporting text.' },
                { term: 'Mundial Bold', def: 'Secondary font family for graphics. Main titles are always Industry — use Mundial Bold elsewhere. <a href="https://fonts.adobe.com/fonts/mundial" target="_blank">Activate on Adobe Fonts ↗</a>.' },
              ]},
              { type: 'text', title: '📐 Safe Area', content: 'The <strong>safe title area</strong> is the rectangle inside the frame where all critical text and logos must stay. Anything outside it risks being cut off on older TVs or broadcast monitors. Use the <a href="https://drive.google.com/drive/folders/1Au4CFu82rCkzyhEPzzHPjWtA9nSX2vxk?usp=drive_link" target="_blank">Safe Area Templates in the CLASS Drive ↗</a> as your starting layer for every graphic.' },
              { type: 'list', title: '📊 Scoreboard Essentials — What to Pull Every Game', items: [
                '<strong>Scores</strong> — live, always accurate',
                '<strong>Game Clock</strong> — quarter/period/set remaining',
                '<strong>Quarter / Period / Set indicator</strong>',
                '<strong>Fouls</strong> (basketball) — include Bonus indicator',
                '<strong>Timeouts remaining</strong> — 5 per team (basketball)',
                '<strong>Possession Arrow</strong> (basketball)',
                '<strong>Record</strong> — Overall W/L for both teams',
                '<strong>Conference Record</strong> — separate from overall',
                '<strong>State Rankings</strong> — pull from sport-specific poll before each game',
                '<strong>Area Scoreboard</strong> — other SAC games happening the same night',
              ]},
              { type: 'list', title: '🔍 Pre-Game Updates (pull before every broadcast)', items: [
                'Overall record (both teams) — MaxPreps or spot chart',
                'Conference record (both teams)',
                'State rankings — check the correct class (1A–4A) and the correct poll (football, boys/girls basketball)',
                'Area scoreboard — get game times for other SAC matchups to list in area scores graphic',
              ]},
              { type: 'keyterms', title: '📏 SAC (Summit Athletic Conference) Teams', terms: [
                { term: 'Large Schools', def: 'Homestead · Carroll · Concordia · Snider · Wayne · North Side · South Side · Northrop' },
                { term: 'Small Schools', def: 'Bishop Luers · Bishop Dwenger · Canterbury · Churubusco · East Noble · Elmhurst · Huntington · Norwell · Leo · Woodlan · East Allen County · New Haven · Heritage · Adams Central · Bellmont · Bluffton' },
              ]},
              { type: 'callout', label: '📁 Key Resources', items: [
                '<a href="https://drive.google.com/drive/u/0/folders/0AKKODezhtTg2Uk9PVA" target="_blank">Assets Drive — Logos, Stock Footage, Templates ↗</a>',
                '<a href="https://drive.google.com/drive/u/0/folders/0AJfm1_t6EpJjUk9PVA" target="_blank">Homestead Live CLASS Drive — Assignments & Templates ↗</a>',
                '<a href="https://drive.google.com/drive/u/0/folders/0AMt6Hze2xzJPUk9PVA" target="_blank">Livestream Computer Drive — Completed Graphics ↗</a>',
                '<a href="https://drive.google.com/drive/folders/1Au4CFu82rCkzyhEPzzHPjWtA9nSX2vxk?usp=drive_link" target="_blank">Safe Area Templates ↗</a>',
                '<a href="https://drive.google.com/file/d/1dMTaMixqSfk8yHo9ShjAhlK6whOMa0qC/view" target="_blank">Style Guide PDF ↗</a>',
              ]},
            ]
          },
          {
            id: 'basketball-scoreboard',
            title: 'Basketball Main Scoreboard',
            duration: '2–3 classes',
            summary: 'Design the on-screen scoreboard for Homestead Live basketball broadcasts using Photoshop and the safe title area template.',
            sections: [
              { type: 'intro', content: 'The main scoreboard is the most-watched graphic on every basketball broadcast. It stays on screen for the entire game and communicates score, time, fouls, timeouts, and team identity to every viewer. Your job is to design one from scratch using the HHS Media template — professional, clean, and broadcast-ready.' },
              { type: 'callout', label: '📋 Assignment', items: [
                'Start with: <strong>Homestead vs Northridge</strong> — Homestead on the left',
                'Download and open the <a href="https://drive.google.com/file/d/1_zO0X9xnj1UcvoSZksVEOd4PKhiq9S6C/view?usp=drive_link" target="_blank">Homestead Media Graphics Template (.psdt) ↗</a>',
                'First Draft Due: <strong>Monday, September 29</strong>',
                'Submit finished file to the <a href="https://drive.google.com/drive/folders/1HP0GQvtbRI1kq2QUi8H3qOzfV-6QYw6y?usp=drive_link" target="_blank">Dropbox folder ↗</a>',
              ]},
              { type: 'text', title: '📐 What Is the Safe Title Area?', content: 'The <strong>safe title area</strong> is a designated rectangular zone within a video frame where text and graphics are guaranteed to be visible on all screens, regardless of display type or manufacturer. It sits far enough from the edges so nothing gets cut off or distorted. <strong>Every critical element on your scoreboard must live inside this zone.</strong> This is a professional broadcast standard — not optional.' },
              { type: 'list', title: '✅ Required Scoreboard Elements', items: [
                'FOULS — with space to indicate "Bonus"',
                'SCORE BOX',
                'GAME CLOCK',
                'QUARTER INDICATOR',
                'Possession Arrow',
                '<a href="https://drive.google.com/drive/folders/1i2t01gZpjHKMT3PlgOBptH-7rtV1XPH5?usp=drive_link" target="_blank">OPS Logo ↗</a>',
                '<a href="https://drive.google.com/drive/folders/1i2t01gZpjHKMT3PlgOBptH-7rtV1XPH5?usp=drive_link" target="_blank">FWO Logo ↗</a>',
                'Remaining Timeouts — 5 per team',
                'HOME: Logo & Colors · Ranking · Full School Name · Overall Record · Conference Record',
                'AWAY: Logo & Colors · Ranking · Full School Name · Overall Record · Conference Record',
              ]},
              { type: 'keyterms', title: 'Team Names, Logos & Colors', terms: [
                { term: 'Team Names', def: 'ALL CAPITAL LETTERS. Check the <a href="https://docs.google.com/spreadsheets/d/1erBfJz-t7TNa8LV4mhjJUrVf7WWKnaXcTkRqpFqFNKQ/edit#gid=0" target="_blank">Broadcast Templates spreadsheet ↗</a> for correct spellings. Plan for long names — "HUNTINGTON NORTH" needs to fit.' },
                { term: 'Team Logos', def: 'All logos are in <a href="https://drive.google.com/drive/folders/14_ckEoSLMSD0wuQvDYS5BY7d-aptIo-x?usp=drive_link" target="_blank">Shared Drive → Livestream Computer → ~All Logos ↗</a>.' },
                { term: 'SAC Team Colors', def: 'Use <a href="https://drive.google.com/file/d/1A5c2LmeUksu2NEtgESuBl9-npelhClF_/view?usp=drive_link" target="_blank">~SAC Color Palette.psd ↗</a> and <a href="https://drive.google.com/file/d/16GG0QOolatHRjuIq0efGHyWTFCAgMAwu/view?usp=drive_link" target="_blank">~SAC Secondary Palette.psd ↗</a>.' },
                { term: 'Out-of-Conference Colors', def: 'Use the Photoshop Eyedropper tool to sample colors directly from the team logo.' },
              ]},
              { type: 'keyterms', title: '🏆 Finding Team Rankings', terms: [
                { term: 'Step 1', def: 'Find what class (1A–4A) the opponent is in — rankings are class-specific. Search the team name to determine their classification.' },
                { term: 'Football', def: '<a href="https://scoreboard.homestead.com/football/teams.htm" target="_blank">scoreboard.homestead.com/football ↗</a>' },
                { term: 'Boys Basketball (AP Poll)', def: '<a href="http://scoreboard.homestead.com/boys/top10x4A.htm" target="_blank">4A</a> · <a href="http://scoreboard.homestead.com/boys/top10x3A.htm" target="_blank">3A</a> · <a href="http://scoreboard.homestead.com/boys/top10x2A.htm" target="_blank">2A</a> · <a href="http://scoreboard.homestead.com/boys/top10x1A.htm" target="_blank">1A</a>' },
                { term: 'Girls Basketball (ICGSA)', def: '<a href="http://scoreboard.homestead.com/girls/top104A.htm" target="_blank">4A</a> · <a href="http://scoreboard.homestead.com/girls/top103A.htm" target="_blank">3A</a> · <a href="http://scoreboard.homestead.com/girls/top102A.htm" target="_blank">2A</a> · <a href="http://scoreboard.homestead.com/girls/top101A.htm" target="_blank">1A</a>' },
              ]},
              { type: 'keyterms', title: '📊 Team Records', terms: [
                { term: 'Format', def: 'Show Overall record first, then Conference record. Placement on the graphic matters — be consistent with every team.' },
                { term: 'Boys Basketball', def: '<a href="https://www.maxpreps.com/in/fort-wayne/homestead-spartans/basketball/" target="_blank">Homestead Boys Varsity — MaxPreps ↗</a>' },
                { term: 'Girls Basketball', def: '<a href="https://www.maxpreps.com/in/fort-wayne/homestead-spartans/basketball/girls/" target="_blank">Homestead Girls Varsity — MaxPreps ↗</a>' },
              ]},
              { type: 'callout', label: '🎨 Design Considerations', items: [
                '<strong>Lower thirds:</strong> Think about how other graphics interact with your scoreboard — they should complement, not clash.',
                '<strong>Position & size:</strong> Less screen space is better, but long names like "HUNTINGTON NORTH" must still be readable.',
                '<strong>Contrast:</strong> The scoreboard needs to be readable at a glance on any TV — test your color choices.',
                '<strong>Study the pros:</strong> Look at ESPN, Fox Sports, and local TV news scoreboards for layout inspiration.',
              ]},
            ]
          },
        ]
      },
    ]
  },
  yearbook: {
    name: 'Yearbook',
    color: '#34d399',
    icon: '📖',
    desc: 'Photograph and document the entire school year. Portraits, sports, events, and final book layout in InDesign.',
    units: []
  },
  sports: {
    name: 'Sports Broadcasting',
    color: '#f97316',
    icon: '🏟️',
    desc: 'Cover Homestead athletics through game writing, action photography, and social media content creation.',
    units: []
  },
  indepth: {
    name: 'HHS In-Depth',
    color: '#3b82f6',
    icon: '📺',
    desc: 'Long-form documentary and investigative journalism — reporting, interviewing, scripting, and editing.',
    units: []
  }
};

const LESSON_KEYWORDS = {
  'intro-welcome': ['orientation', 'program overview', 'welcome'],
  'intro-routine': ['daily routine', 'air shift', 'broadcast', 'deadline', 'rundown', 'b-roll'],
  'intro-studio': ['studio tour', 'condenser mic', 'audio board', 'console', 'camera', 'video switcher', 'adobe creative cloud', 'equipment'],
  'intro-software': ['adobe audition', 'adobe premiere', 'adobe photoshop', 'adobe indesign', 'software'],
  'welcome': ['orientation', 'audio broadcasting', 'program overview', 'daily routine'],
  'stations': ['wcyt', 'the point', '91fm', 'station history', 'genre', 'frequency', 'power', 'tagline', 'call letters'],
  'fcc': ['fcc rules', 'on-air standards', 'obscenity', 'indecency', 'profanity', 'underwriting', 'sponsors', 'regulations', 'compliance'],
  'expectations': ['classroom expectations', 'grading', 'room rules', 'final project', 'submission'],
  'ap-intro': ['air personality', 'dj break', '5-break structure', 'back-sell', 'pre-sell'],
  'front-load': ['front loading', 'artist song album year', 'talk content', 'filler phrases'],
  'first-break': ['dj break', '5-element formula', 'on air', 'student example'],
  'radio-pairs': ['radio show pairs', 'co-host', 'partner breaks', 'stations'],
  'show-structure': ['talk show structure', 'break 1', 'break 2', 'break 3', 'recurring segments', 'group formation'],
  'destructive-editing': ['destructive editing', 'non-destructive editing', 'waveform editor', 'multitrack editor', 'adobe audition'],
  'audition-basics': ['adobe audition', 'normalize', 'hard limit', 'audio cleanup', 'destructive edit', 'non-destructive edit'],
  'stutter': ['stutter effect', 'copy paste', 'crossfade', 'pitch shift', 'envelopes', 'adobe audition'],
  'double-track': ['double track', 'automatic speech alignment', 'doubling', 'vocal layering'],
  'remix-stretch': ['remix', 'stretch', 'music bed', 'timbre', 'harmonic', 'minimum loop', 'maximum slack', 'timeline'],
  'reverb': ['reverb', 'effects rack', 'studio reverb', 'wet dry mix', 'envelopes', 'room size', 'decay', 'early reflections'],
  'spectral-display': ['spectral frequency display', 'spectral view', 'noise removal', 'beeps hisses artifacts', 'frequency', 'adobe audition'],
  'radio-in-depth': ['iasb', 'radio in-depth', 'long-form storytelling', 'narrative structure', 'interview', 'judging criteria', 'outline'],
  'iasb-imaging': ['iasb', 'imaging', 'sweeper', 'drop-in', 'promo', 'jingle', 'station branding', 'collage'],
  'imaging-4-weeks': ['iasb imaging', 'rule of 3', 'sound collage', 'multiple voices', 'production tricks'],
  'bhm-liners': ['black history month', 'station liners', 'promo', 'bumper', 'script', 'music bed'],
  'iasb-air-personality': ['iasb', 'air personality', 'solo dj', 'aircheck', 'backsell', 'scoped aircheck', 'indianapolis finals'],
  'iasb-talk-show': ['iasb', 'talk show', 'aircheck', 'opinion', 'interviews', 'interaction'],
  'iasb-copywriting': ['iasb', 'copywriting', '60-second spot', 'client copy points', 'call to action', 'target audience'],
  'iasb-spot-production': ['iasb', 'spot production', 'commercial', 'psa', 'station promo', '30 or 60 seconds'],
  'iasb-drama': ['iasb', 'audio drama', 'adapted drama', 'original drama', 'voice actors', 'sound design'],
  'iasb-interview': ['iasb', 'interview', 'pre-interview research', 'open-ended questions', 'promotion'],
  'iasb-podcast': ['iasb', 'podcasting', 'podcast series', 'theme', 'tagline', 'intro music', 'spotify'],
  'fcc-issue-report': ['fcc compliance', 'public fcc file', 'community issue', '3-minute breaks'],
  'iasb-radio-show': ['iasb', 'radio show', 'team air personality', 'co-host', 'scoped aircheck'],
  'iasb-news-anchor': ['iasb', 'news anchor', 'newscast', 'global to local', 'scripted news', 'delivery'],
  'legal-id-aircheck-final': ['semester final', 'legal id', 'aircheck mixdown', 'sponsor read', 'final project'],
  'graphics-basics': ['photoshop', 'graphics basics', 'safe area', 'font rules', 'industry font', 'resolution', 'dpi', 'color mode', 'broadcast graphics', 'sac'],
  'basketball-scoreboard': ['basketball scoreboard', 'photoshop', 'safe title area', 'team names', 'team logos', 'team colors', 'rankings', 'records', 'broadcast graphics'],
};

for (const course of Object.values(LESSONS)) {
  for (const unit of (course.units || [])) {
    for (const lesson of (unit.lessons || [])) {
      lesson.keywords = LESSON_KEYWORDS[lesson.id] || [];
    }
  }
}
