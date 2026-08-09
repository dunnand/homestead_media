// ============================================================
// HOMESTEAD MEDIA — Main Application Script
// ============================================================

// ── Version / CDN cache buster ───────────────────────────────
// When this value changes, users are auto-redirected to a URL
// the CDN has never cached, forcing a fully fresh load.
const APP_VERSION = '20260803b';
(function() {
  try {
    const k = 'hm_version';
    if (localStorage.getItem(k) === APP_VERSION) return;
    const url = new URL(location.href);
    if (url.searchParams.get('_v') === APP_VERSION) {
      localStorage.setItem(k, APP_VERSION);
      return;
    }
    localStorage.setItem(k, APP_VERSION);
    url.searchParams.set('_v', APP_VERSION);
    location.replace(url.toString());
  } catch(e) { /* localStorage blocked by browser — skip version check */ }
})();

// ── Firebase ─────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyADo4bTrSIgnLwQkYXsIIbivyZSPcNHATM",
  authDomain: "audioaficionados-21ba0.firebaseapp.com",
  projectId: "audioaficionados-21ba0",
  storageBucket: "audioaficionados-21ba0.firebasestorage.app",
  messagingSenderId: "94178984100",
  appId: "1:94178984100:web:0b60930161c8c882e02631"
};

// ── Bell Ringer ───────────────────────────────────────────────
const WCYT_STREAM_URL = 'https://securestreams2.autopo.st:1069/WCYT.mp3';
const DEFAULT_BELLRINGER_QUESTIONS = [
  "What TV show have you watched this week?",
  "What movie have you watched most recently?",
  "What song or artist have you been listening to this week?",
  "What's a podcast episode you've listened to recently?",
  "What YouTube channel do you watch the most right now?",
  "What's the most recent YouTube video you watched?",
  "What have you been streaming this week (movie, show, or music)?",
  "What's a song that's been stuck in your head this week?",
  "What's your favorite thing you've watched or listened to this week?",
  "What app do you spend the most time on for media right now?",
  "What's a new artist or show you've discovered recently?",
  "What's the last thing you watched on live TV (news, sports, etc.)?",
  "What's a video game you've played or watched someone play this week?",
  "What's one song, show, or video you'd recommend to the class right now?"
];
const BELLRINGER_CLASSES = {
  radio:    { name: 'Radio Broadcasting' },
  live:     { name: 'Homestead Live' },
  yearbook: { name: 'Yearbook' },
  sports:   { name: 'Sports Broadcasting' },
  indepth:  { name: 'HHS In-Depth' },
  intro:    { name: 'Intro to Media' },
};

let _db = null;
function getDB() {
  if (_db) return _db;
  if (typeof firebase === 'undefined') return null;
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  _db = firebase.firestore();
  return _db;
}

// ── Google Form sign-up backend ──────────────────────────────
// Broadcast sign-ups now go through a Google Form; responses land in a
// Google Sheet which is published to the web as CSV and read by the site.
// No emails are collected anywhere.
//
// SETUP (one-time, ~5 minutes):
// 1. Create a Google Form with exactly these questions:
//      • "Your Name"            — Short answer, required
//      • "Broadcast"            — Short answer, required (the site prefills this — tell
//                                  students not to edit it)
//      • "Interested Positions" — Checkboxes, optional (one checkbox per crew role,
//                                  copied from the site's role list)
// 2. Get the prefill entry ID: in the Form click ⋮ → "Get pre-filled link", type
//    anything into Broadcast, click "Get link" — the URL contains entry.XXXXXXXX.
// 3. In the Responses tab click the Sheets icon to create the response sheet, then in
//    that sheet: File → Share → Publish to web → select the responses tab + CSV → Publish.
// 4. Paste the three values below.
//
const USE_GOOGLE_FORM_SIGNUP = true;
const SIGNUP_FORM = {
  formUrl: 'https://docs.google.com/forms/d/1_OeCPHDdmSJRsNBtQIMyn0JcjjiTkgm5qUwYE1V3k8g/viewform',
  entryBroadcast: 'entry.1934284818', // the "Broadcast" question
  csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS5TkBBk2P8l_Aiz3tJLQsuPING_iLizRBHsmjvXW1BuVo5YL64E_4fz1flOIyI0PYRNIJLfkvKU1M-/pub?gid=1178792521&single=true&output=csv',
};

function signupFormLink(b) {
  if (!SIGNUP_FORM.formUrl) return '';
  if (!b || !SIGNUP_FORM.entryBroadcast) return SIGNUP_FORM.formUrl;
  const val = encodeURIComponent(`${b.id} — ${b.title} (${b.date})`);
  return `${SIGNUP_FORM.formUrl}?usp=pp_url&${SIGNUP_FORM.entryBroadcast}=${val}`;
}

function parseCSV(text) {
  const rows = []; let row = [], cur = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += c;
    }
    else if (c === '"') inQ = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur.replace(/\r$/, '')); rows.push(row); row = []; cur = ''; }
    else cur += c;
  }
  if (cur !== '' || row.length) { row.push(cur.replace(/\r$/, '')); rows.push(row); }
  return rows;
}

// ── Yearbook coverage — same Google Form pattern ─────────────
// Create a second Form: "Your Name" (short answer, required), "Event" (short
// answer, required — prefilled by the site), "Role" (multiple choice, e.g.
// Photographer — optional). Publish its response sheet to web as CSV.
const USE_GOOGLE_FORM_YEARBOOK = true;
const YEARBOOK_FORM = {
  formUrl: 'https://docs.google.com/forms/d/1EVhVzfwxlXC0W7Evd70hH0pVZDcxW336zTTKcxnGopI/viewform',
  entryEvent: 'entry.124034746', // the "Event" question
  csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSUoD8dNF8YJBdy_ft9vOMU2c2ySp5reYHTdLSBeZ2mdyddpjOlbmVV6kbi6Iw5vMVtnEKhbv6qDB0u/pub?output=csv',
};

function ybFormLink(ev) {
  if (!YEARBOOK_FORM.formUrl) return '';
  if (!ev || !YEARBOOK_FORM.entryEvent) return YEARBOOK_FORM.formUrl;
  const val = encodeURIComponent(`${ev.id} — ${ev.title} (${ev.date})`);
  return `${YEARBOOK_FORM.formUrl}?usp=pp_url&${YEARBOOK_FORM.entryEvent}=${val}`;
}

async function loadYbFormSignups() {
  if (!USE_GOOGLE_FORM_YEARBOOK || !YEARBOOK_FORM.csvUrl) return;
  try {
    const res = await fetch(YEARBOOK_FORM.csvUrl, { cache: 'no-store' });
    if (!res.ok) return;
    const rows = parseCSV(await res.text());
    if (rows.length < 2) { S.yearbookCoverage = []; return; }
    const head   = rows[0].map(h => h.toLowerCase());
    const iName  = head.findIndex(h => h.includes('name'));
    const iEvent = head.findIndex(h => h.includes('event'));
    const iRole  = head.findIndex(h => h.includes('role'));
    if (iName < 0 || iEvent < 0) return;
    const events = allYbEvents();
    const seen = new Map();
    rows.slice(1).forEach((r, n) => {
      const studentName = (r[iName] || '').trim();
      const evRaw = (r[iEvent] || '').trim();
      if (!studentName || !evRaw) return;
      const evId = (evRaw.split('—')[0] || '').trim();
      const ev = events.find(e => e.id === evId)
        || events.find(e => e.title && evRaw.toLowerCase().includes(e.title.toLowerCase()) && evRaw.includes(e.date));
      if (!ev) return;
      const role = (iRole >= 0 && r[iRole] ? r[iRole] : 'photographer')
        .toLowerCase().replace(/[^a-z]/g, '') || 'photographer';
      seen.set(`${ev.id}|${studentName.toLowerCase()}`, {
        id: 'form-' + n, studentName, eventId: ev.id, eventTitle: ev.title,
        eventDate: ev.date, role, fromForm: true,
      });
    });
    S.yearbookCoverage = [...seen.values()];
  } catch (e) { /* offline or form not yet configured */ }
}

async function loadFormSignups() {
  if (!USE_GOOGLE_FORM_SIGNUP || !SIGNUP_FORM.csvUrl) return;
  try {
    const res = await fetch(SIGNUP_FORM.csvUrl, { cache: 'no-store' });
    if (!res.ok) return;
    const rows = parseCSV(await res.text());
    if (rows.length < 2) { S.availabilities = []; return; }
    const head   = rows[0].map(h => h.toLowerCase());
    const iName  = head.findIndex(h => h.includes('name'));
    const iBcast = head.findIndex(h => h.includes('broadcast'));
    const iRoles = head.findIndex(h => h.includes('position') || h.includes('role'));
    if (iName < 0 || iBcast < 0) return;
    const seen = new Map(); // latest submission per student+broadcast wins
    rows.slice(1).forEach((r, n) => {
      const studentName = (r[iName] || '').trim();
      const bcRaw = (r[iBcast] || '').trim();
      if (!studentName || !bcRaw) return;
      const bId = (bcRaw.split('—')[0] || '').trim();
      const broadcast = (S.broadcasts || []).find(b => b.id === bId)
        || (S.broadcasts || []).find(b => b.title && bcRaw.toLowerCase().includes(b.title.toLowerCase()) && bcRaw.includes(b.date));
      if (!broadcast) return;
      const interestedRoles = iRoles >= 0 && r[iRoles]
        ? r[iRoles].split(/[,;]/).map(s => s.trim()).filter(Boolean)
        : [];
      seen.set(`${broadcast.id}|${studentName.toLowerCase()}`, {
        id: 'form-' + n, broadcastId: broadcast.id, studentName,
        email: '', interestedRoles, fromForm: true,
      });
    });
    S.availabilities = [...seen.values()];
  } catch (e) { /* offline or form not yet configured — keep whatever loaded */ }
}

// ── State ─────────────────────────────────────────────────────
function emptyStationSchedule() {
  const blank = () => DAYS.map(() => ({ show: '', djs: [] }));
  return { point: blank(), two: blank() };
}

const S = {
  view: 'home',
  broadcastId: null,
  teacherMode: false,
  showTeacherPin: false,
  stationSchedule: emptyStationSchedule(),
  broadcasts: [],
  plannerStep: 0,
  plannerData: null,
  submissions: [],
  iasbEntries: [],
  iasbCategory: null,
  availabilities: [],
  lessonCourse: null,
  lessonUnit: null,
  lessonId: null,
  lessonSlide: 0,
  canvaLessons: {},
  showCanvaForm: false,
  equipment: {},
  equipmentUnsub: null,
  equipmentLive: false,
  lessonOrder: {},
  lessonIcons: {},
  hiddenLessons: new Set(),
  lessonEdits: {},
  lessonEditOpen: false,
  unitEdits: {},
  hiddenUnits: new Set(),
  customUnits: {},
  introClassInfo: {},
  editingIntroClass: null,
  expandedIntroClass: null,
  showQuickLinks: true,
  broadcastChecklist: {},
  sportTemplates: {},     // sport → rows[] (master template, shared across all games)
  rundownOverrides: {},   // broadcastId → rows[] | null (null = use sport template)
  editingRundown: false,
  editingRundownType: null,  // 'template' | 'game'
  rundownEditBackup: null,
  yearbookCoverage: [],
  customYbEvents: [],
  calendarYbEvents: [],
  calendarBroadcastEvents: [],
  ybShowAway: false,
  ybDashView: 'event',
  beatId: null,
  beatOverrides: {},
  expandedBeat: null,
  beatAssignments: {},
  storyPlans: [],
  expandedStoryPlan: null,
  storyPlanFilter: 'active',
  rundownData: {},
  rundownWeekOffset: 0,
  showSchedule: [],
  calMonthOffset: 0,
  dashSections: {},
  quickLinks: {},
  bellringerQuestionsByClass: {},
  bellringerAnswers: [],
  bellringerAnswersUnsub: null,
  bellringerBoardClass: 'radio',
  dbBrClass: 'radio',
  icebreakerEntries: [],
  icebreakerUnsub: null,
  icebreakerGame: 'menu',
  qaCurrentIndex: 0,
  qaCustomText: '',
  qaEditing: false,
  qaAnswers: [],
  qaStateUnsub: null,
  qaAnswersUnsub: null,
  totCurrentIndex: 0,
  totStage: 'poll',
  totVotes: { a: 0, b: 0 },
  totMyChoice: null,
  totMyDivChoice: null,
  totDivVotesA: { a: 0, b: 0 },
  totDivVotesB: { a: 0, b: 0 },
  totStateUnsub: null,
  totVotesUnsub: null,
  totDivVotesUnsub: null,
  bingoOrder: [],
  bingoFilled: {},
  bingoActive: null,
  bingoWon: false,
  bingoWinners: [],
  bingoWinnersUnsub: null,
  wyrCurrentIndex: 0,
  wyrVotes: { a: 0, b: 0 },
  wyrMyChoice: null,
  wyrStateUnsub: null,
  wyrVotesUnsub: null,
  speedIndex: 0,
  speedTimerStartedAt: null,
  speedStateUnsub: null,
  speedTickHandle: null,
  commonCurrentIndex: 0,
  commonAnswers: [],
  commonMyChoice: null,
  commonStateUnsub: null,
  commonAnswersUnsub: null,
  rankCurrentIndex: 0,
  rankAnswers: [],
  rankMyOrder: [],
  rankStateUnsub: null,
  rankAnswersUnsub: null,
  matchCurrentIndex: 0,
  matchStateUnsub: null,
  matchTimerStartedAt: null,
  matchTickHandle: null,
  rapidStage: 'idle',
  rapidCurrentName: '',
  rapidQuestionIndex: null,
  rapidUsedNames: [],
  rapidStateUnsub: null,
  rapidSignups: [],
  rapidSignupsUnsub: null,
};

// ── Timing Helpers ────────────────────────────────────────────
function computeTimeOffset(gameTime, offsetMins) {
  if (!gameTime) return null;
  const m = gameTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  const isPM = m[3].toUpperCase() === 'PM';
  if (isPM && h !== 12) h += 12;
  if (!isPM && h === 12) h = 0;
  let total = h * 60 + min - offsetMins;
  total = ((total % 1440) + 1440) % 1440;
  const ch = Math.floor(total / 60);
  const cm = total % 60;
  const period = ch >= 12 ? 'PM' : 'AM';
  const dh = ch > 12 ? ch - 12 : ch === 0 ? 12 : ch;
  return `${dh}:${cm.toString().padStart(2, '0')} ${period}`;
}
function computeArrival(gameTime, type) {
  return computeTimeOffset(gameTime, ARRIVAL_MINS[type] ?? ARRIVAL_DEFAULT_MINS);
}
function computeDoor33(gameTime, type) {
  return computeTimeOffset(gameTime, (ARRIVAL_MINS[type] ?? ARRIVAL_DEFAULT_MINS) + DOOR_EXTRA_MINS);
}

// ── Router ────────────────────────────────────────────────────
function unsubIcebreakerGames() {
  if (S.icebreakerUnsub) { S.icebreakerUnsub(); S.icebreakerUnsub = null; }
  if (S.qaStateUnsub)    { S.qaStateUnsub();    S.qaStateUnsub = null; }
  if (S.qaAnswersUnsub)  { S.qaAnswersUnsub();  S.qaAnswersUnsub = null; }
  if (S.totStateUnsub)   { S.totStateUnsub();   S.totStateUnsub = null; }
  if (S.totVotesUnsub)   { S.totVotesUnsub();   S.totVotesUnsub = null; }
  if (S.totDivVotesUnsub) { S.totDivVotesUnsub(); S.totDivVotesUnsub = null; }
  if (S.bingoWinnersUnsub) { S.bingoWinnersUnsub(); S.bingoWinnersUnsub = null; }
  if (S.wyrStateUnsub)   { S.wyrStateUnsub();   S.wyrStateUnsub = null; }
  if (S.wyrVotesUnsub)   { S.wyrVotesUnsub();   S.wyrVotesUnsub = null; }
  if (S.speedStateUnsub) { S.speedStateUnsub(); S.speedStateUnsub = null; }
  if (S.speedTickHandle) { clearInterval(S.speedTickHandle); S.speedTickHandle = null; }
  if (S.commonStateUnsub)   { S.commonStateUnsub();   S.commonStateUnsub = null; }
  if (S.commonAnswersUnsub) { S.commonAnswersUnsub(); S.commonAnswersUnsub = null; }
  if (S.rankStateUnsub)   { S.rankStateUnsub();   S.rankStateUnsub = null; }
  if (S.rankAnswersUnsub) { S.rankAnswersUnsub(); S.rankAnswersUnsub = null; }
  if (S.matchStateUnsub)  { S.matchStateUnsub();  S.matchStateUnsub = null; }
  if (S.matchTickHandle)  { clearInterval(S.matchTickHandle); S.matchTickHandle = null; }
  if (S.rapidStateUnsub)  { S.rapidStateUnsub();  S.rapidStateUnsub = null; }
  if (S.rapidSignupsUnsub) { S.rapidSignupsUnsub(); S.rapidSignupsUnsub = null; }
}

function loadIcebreakerGame(game) {
  if (game === 'menu') return;
  if (game === 'qa') return loadQaGame();
  if (game === 'tot') return loadTotGame();
  if (game === 'bingo') return loadBingoGame();
  if (game === 'wyr') return loadWyrGame();
  if (game === 'speed') return loadSpeedGame();
  if (game === 'common') return loadCommonGame();
  if (game === 'rank') return loadRankGame();
  if (game === 'match') return loadMatchGame();
  if (game === 'rapid') return loadRapidGame();
  return loadIcebreakerWall();
}

function go(view, extra) {
  if (S.view === 'icebreaker' && view !== 'icebreaker') unsubIcebreakerGames();
  if (S.view === 'radio' && view !== 'radio') stopPointRecentPolling();
  S.view = view;
  if (extra) Object.assign(S, extra);
  if (view === 'icebreaker' && S.icebreakerGame === 'bingo') loadBingoState();
  render();
  window.scrollTo(0, 0);
  if (view === 'radio') startPointRecentPolling();
  if (view === 'dashboard') { dashboardLoadPlans(); loadYearbookCoverage(); loadShowSchedule(); }
  if (view === 'yearbook')  loadYearbookCoverage();
  if (view === 'beats')   loadBeatAssignments();
  if (view === 'storyplans') loadStoryPlans();
  if (view === 'indepth') loadRundownData();
  if (view === 'broadcast' && S.broadcastId) { loadBroadcastChecklist(S.broadcastId); loadRundownData(S.broadcastId); }
  if (view === 'icebreaker') loadIcebreakerGame(S.icebreakerGame);
}

function switchIcebreakerGame(game) {
  if (S.icebreakerGame === game) return;
  unsubIcebreakerGames();
  S.icebreakerGame = game;
  if (game === 'bingo') loadBingoState();
  render();
  loadIcebreakerGame(game);
}

// ── Render ────────────────────────────────────────────────────
function render() {
  const app = document.getElementById('app');
  if (!app) return;
  switch (S.view) {
    case 'home':      app.innerHTML = renderHome();      break;
    case 'radio':     app.innerHTML = renderRadio();     break;
    case 'planner':   app.innerHTML = renderPlanner();   break;
    case 'live':      app.innerHTML = renderLive();      break;
    case 'broadcast': app.innerHTML = renderBroadcast(); break;
    case 'schedule':  app.innerHTML = renderSchedule();  break;
    case 'availability':  app.innerHTML = renderAvailabilityPage(); break;
    case 'yearbook':      app.innerHTML = renderYearbook();      break;
    case 'sports':        app.innerHTML = renderSports();        break;
    case 'indepth':       app.innerHTML = renderInDepth();       break;
    case 'intro':         app.innerHTML = renderIntro();         break;
    case 'beats':         app.innerHTML = renderBeats();         break;
    case 'storyplans':    app.innerHTML = renderStoryPlans();    break;
    case 'iasb':          app.innerHTML = renderIASB();          break;
    case 'iasb-category': app.innerHTML = renderIASBCategory();  break;
    case 'dashboard':     app.innerHTML = renderDashboard();     break;
    case 'lessons':       app.innerHTML = renderLessons();       break;
    case 'icebreaker':       app.innerHTML = renderIcebreaker();      break;
    case 'icebreaker-board': app.innerHTML = renderIcebreakerBoard(); break;
    case 'bellringer-board': app.innerHTML = renderBellRingerBoard(); break;
    default:              app.innerHTML = renderHome();
  }
  attachListeners();
}

// ── Nav Bar ───────────────────────────────────────────────────
function navBar(active) {
  return `
    <nav class="top-nav">
      <span class="nav-logo" data-nav="home">Homestead Media</span>
      <div class="nav-links">
        <a class="${active === 'radio'    ? 'active' : ''}" data-nav="radio">📻 Radio</a>
        <a class="${active === 'live'     ? 'active' : ''}" data-nav="live">🎬 Live</a>
        <a class="${active === 'sports'   ? 'active' : ''}" data-nav="sports">🏟️ Sports</a>
        <a class="${active === 'yearbook' ? 'active' : ''}" data-nav="yearbook">📖 Yearbook</a>
        <a class="${active === 'indepth'  ? 'active' : ''}" data-nav="indepth">📺 In-Depth</a>
        <a class="${active === 'intro'    ? 'active' : ''}" data-nav="intro">🎓 Intro</a>
        <a class="${active === 'lessons'  ? 'active' : ''}" data-nav="lessons">📚 Lessons</a>
        <a class="${active === 'icebreaker' ? 'active' : ''}" data-nav="icebreaker">🧊 Icebreaker</a>
        ${S.teacherMode ? `<a class="${active === 'dashboard' ? 'active' : ''}" data-nav="dashboard" style="color:var(--radio)">📊 Dashboard</a>` : ''}
        <button class="teacher-btn ${S.teacherMode ? 'active' : ''}" id="teacher-toggle">
          ${S.teacherMode ? '🔓 Teacher' : '🔑'}
        </button>
      </div>
    </nav>
    ${S.showTeacherPin ? `
    <div class="teacher-pin-overlay" id="teacher-pin-overlay">
      <div class="teacher-pin-box">
        <div class="teacher-pin-title">🔑 Teacher Mode</div>
        <input type="password" id="teacher-pin-input" class="form-input" placeholder="Enter PIN" autocomplete="off">
        <div class="teacher-pin-btns">
          <button class="btn-primary" id="teacher-pin-submit">Unlock</button>
          <button class="btn-secondary" id="teacher-pin-cancel">Cancel</button>
        </div>
      </div>
    </div>` : ''}`;
}

// ── ICEBREAKER (Two Truths and a Lie, shared live wall) ────────
function loadIcebreakerWall() {
  const db = getDB();
  if (!db) return;
  if (S.icebreakerUnsub) { S.icebreakerUnsub(); S.icebreakerUnsub = null; }
  S.icebreakerUnsub = db.collection('hm_icebreaker').onSnapshot(snap => {
    S.icebreakerEntries = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const wall = document.getElementById('icebreaker-wall');
    if (wall) wall.innerHTML = renderIcebreakerWallCards(S.icebreakerEntries);
    const count = document.getElementById('icebreaker-count');
    if (count) count.textContent = S.icebreakerEntries.length;
  }, err => console.error('icebreaker snapshot error', err));
}

function renderIcebreakerWallCards(entries) {
  if (!entries.length) return `<p class="dim" style="font-size:0.85rem">Nobody's added themselves yet — be the first!</p>`;
  return `<div class="ib-namelist">` + entries.map(e => {
    const open = S.icebreakerOpenId === e.id;
    return `
    <div class="ib-name-row${open ? ' open' : ''}">
      <button type="button" class="ib-name-btn" data-ib-id="${e.id}">
        <span>${esc(e.name)}</span>
        <span class="ib-name-caret">${open ? '▲' : '▼'}</span>
      </button>
      ${open ? renderIcebreakerQuiz(e) : ''}
    </div>`;
  }).join('') + `</div>`;
}

function normalizeIcebreakerStatements(statements) {
  return (statements || []).map(s => typeof s === 'string' ? { text: s, isLie: null } : s);
}

function blankIcebreakerQuiz() {
  return { revealed: false };
}

const ICEBREAKER_DIG_QUESTIONS = [
  "Ask for more detail — who, what, where, when?",
  "Ask why they picked that one to write down.",
  "Ask if anyone in class can back up their story."
];

function renderIcebreakerQuiz(e) {
  const statements = normalizeIcebreakerStatements(e.statements);
  const quiz = S.icebreakerQuiz || blankIcebreakerQuiz();
  const revealed = !!quiz.revealed;

  const rows = statements.map((s, i) => {
    let answerHtml = '';
    if (revealed) {
      if (s.isLie === true) answerHtml = `<span class="ib-quiz-answer is-lie">❌ THE LIE</span>`;
      else if (s.isLie === false) answerHtml = `<span class="ib-quiz-answer is-truth">✅ TRUE</span>`;
      else answerHtml = `<span class="ib-quiz-answer is-unknown">❓ Answer not recorded</span>`;
    }
    return `
      <div class="ib-quiz-row${revealed && s.isLie === true ? ' is-the-lie' : ''}">
        <p class="ib-quiz-progress">Statement ${i + 1} of ${statements.length}</p>
        <p class="ib-quiz-statement">${esc(s.text)}</p>
        ${answerHtml}
      </div>`;
  }).join('');

  return `<div class="ib-quiz ib-name-detail">
    ${rows}
    ${!revealed ? `
    <div class="ib-quiz-help-box">
      <p class="ib-quiz-help-title">💡 Questions to figure out the lie</p>
      <ul class="ib-quiz-help-list">
        ${ICEBREAKER_DIG_QUESTIONS.map(q => `<li>${esc(q)}</li>`).join('')}
      </ul>
    </div>
    <button type="button" class="btn-primary ib-quiz-reveal">👀 Reveal the Lie</button>` : `
    <p class="ib-quiz-done">🎉 Now have ${esc(e.name)} explain the true ones!</p>`}
    <button type="button" class="btn-secondary ib-quiz-back">← Back to List</button>
  </div>`;
}

async function submitIcebreaker() {
  const nameEl = document.getElementById('ib-name');
  const t1El   = document.getElementById('ib-truth1');
  const t2El   = document.getElementById('ib-truth2');
  const lieEl  = document.getElementById('ib-lie');
  const msg    = document.getElementById('ib-msg');
  const name = shortenName(nameEl.value.trim()), t1 = t1El.value.trim(), t2 = t2El.value.trim(), lie = lieEl.value.trim();
  if (!name || !t1 || !t2 || !lie) {
    msg.textContent = 'Fill in your name and all three statements first.';
    msg.style.color = 'var(--danger)';
    return;
  }
  const db = getDB();
  if (!db) { msg.textContent = 'Could not connect — try again.'; msg.style.color = 'var(--danger)'; return; }

  const statements = [
    { text: t1, isLie: false },
    { text: t2, isLie: false },
    { text: lie, isLie: true }
  ];
  for (let i = statements.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [statements[i], statements[j]] = [statements[j], statements[i]];
  }

  const btn = document.getElementById('ib-submit');
  btn.disabled = true; btn.textContent = 'Adding…';
  try {
    localStorage.setItem('hm_student_name', name);
    await db.collection('hm_icebreaker').add({ name, statements, createdAt: Date.now() });
    t1El.value = ''; t2El.value = ''; lieEl.value = '';
    msg.textContent = "✅ You're on the wall! Go find your match's card and guess their lie.";
    msg.style.color = 'var(--success)';
  } catch (e) {
    msg.textContent = 'Could not save: ' + e.message;
    msg.style.color = 'var(--danger)';
  } finally {
    btn.disabled = false; btn.textContent = '🧊 Add Me to the Wall';
  }
}

async function clearIcebreakerWall() {
  if (!confirm('Clear everyone currently on the wall? Do this between class periods.')) return;
  const db = getDB();
  if (!db) return;
  const snap = await db.collection('hm_icebreaker').get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

// ── ICEBREAKER: Get to Know You (teacher-driven Q&A wall) ──────
const QA_QUESTIONS = [
  "What's your favorite movie of all time?",
  "If you could have any superpower, what would it be?",
  "What's a hobby you have outside of school?",
  "What's your go-to comfort food?",
  "If you could travel anywhere right now, where would you go?",
  "What's a skill you wish you had?",
  "What's your favorite song right now?",
  "What's the best trip you've ever taken?",
  "If you could meet anyone, living or dead, who would it be?",
  "What's something you're good at that most people don't know?",
  "What's your favorite way to spend a weekend?",
  "What show are you currently binge-watching?",
  "If you could switch lives with anyone for a day, who would it be?",
  "What's the last thing that made you laugh really hard?",
  "What's a place you've always wanted to visit?",
];

function loadQaGame() {
  const db = getDB();
  if (!db) return;
  if (S.qaStateUnsub) { S.qaStateUnsub(); S.qaStateUnsub = null; }
  S.qaStateUnsub = db.collection('hm_qa_state').doc('current').onSnapshot(doc => {
    const data = doc.exists ? doc.data() : { index: 0 };
    const idx = Number.isInteger(data.index) ? data.index : 0;
    S.qaCurrentIndex = Math.max(0, Math.min(idx, QA_QUESTIONS.length - 1));
    S.qaCustomText = (data.customText || '').trim();
    if (!S.qaEditing) {
      const text = S.qaCustomText || QA_QUESTIONS[S.qaCurrentIndex];
      document.querySelectorAll('.qa-question-text').forEach(el => { el.textContent = text; });
    }
    const posEl = document.getElementById('qa-position');
    if (posEl) posEl.textContent = `${S.qaCurrentIndex + 1} / ${QA_QUESTIONS.length}`;
    loadQaAnswers();
  }, err => console.error('qa state snapshot error', err));
}

function loadQaAnswers() {
  const db = getDB();
  if (!db) return;
  if (S.qaAnswersUnsub) { S.qaAnswersUnsub(); S.qaAnswersUnsub = null; }
  S.qaAnswersUnsub = db.collection('hm_qa_answers').where('questionIndex', '==', S.qaCurrentIndex).onSnapshot(snap => {
    S.qaAnswers = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const wall = document.getElementById('qa-wall');
    if (wall) wall.innerHTML = renderQaWallCards(S.qaAnswers);
    const count = document.getElementById('qa-count');
    if (count) count.textContent = S.qaAnswers.length;
  }, err => console.error('qa answers snapshot error', err));
}

function renderQaWallCards(entries) {
  if (!entries.length) return `<p class="dim" style="font-size:0.85rem">No answers yet — be the first!</p>`;
  return `<div class="ib-wall">` + entries.map(e => `
    <div class="ib-card">
      <div class="ib-card-name">${esc(e.name)}</div>
      <div class="qa-card-answer">${esc(e.answer)}</div>
    </div>`).join('') + `</div>`;
}

async function submitQaAnswer() {
  const nameEl = document.getElementById('qa-name');
  const ansEl  = document.getElementById('qa-answer');
  const msg    = document.getElementById('qa-msg');
  const name = shortenName(nameEl.value.trim()), answer = ansEl.value.trim();
  if (!name || !answer) {
    msg.textContent = 'Fill in your name and an answer first.';
    msg.style.color = 'var(--danger)';
    return;
  }
  const db = getDB();
  if (!db) { msg.textContent = 'Could not connect — try again.'; msg.style.color = 'var(--danger)'; return; }

  const btn = document.getElementById('qa-submit');
  btn.disabled = true; btn.textContent = 'Adding…';
  try {
    localStorage.setItem('hm_student_name', name);
    await db.collection('hm_qa_answers').add({ name, answer, questionIndex: S.qaCurrentIndex, createdAt: Date.now() });
    ansEl.value = '';
    msg.textContent = '✅ Added! Go compare answers with someone near you.';
    msg.style.color = 'var(--success)';
  } catch (e) {
    msg.textContent = 'Could not save: ' + e.message;
    msg.style.color = 'var(--danger)';
  } finally {
    btn.disabled = false; btn.textContent = '🙋 Add My Answer';
  }
}

async function advanceQaQuestion(delta) {
  const db = getDB();
  if (!db) return;
  const next = Math.max(0, Math.min(S.qaCurrentIndex + delta, QA_QUESTIONS.length - 1));
  await db.collection('hm_qa_state').doc('current').set({ index: next, customText: '', updatedAt: Date.now() });
}

function openQaEdit() {
  S.qaEditing = true;
  render();
  const el = document.getElementById('qa-edit-input');
  if (el) { el.focus(); el.select(); }
}

function closeQaEdit() {
  S.qaEditing = false;
  render();
}

async function saveQaCustomQuestion() {
  const el = document.getElementById('qa-edit-input');
  const text = el ? el.value.trim() : '';
  const db = getDB();
  if (!db) return;
  await db.collection('hm_qa_state').doc('current').set({ index: S.qaCurrentIndex, customText: text, updatedAt: Date.now() });
  S.qaEditing = false;
  render();
}

async function resetQaCustomQuestion() {
  const db = getDB();
  if (!db) return;
  await db.collection('hm_qa_state').doc('current').set({ index: S.qaCurrentIndex, customText: '', updatedAt: Date.now() });
  S.qaEditing = false;
  render();
}

async function clearQaAnswers() {
  if (!confirm('Clear all Get to Know You answers (every question)? Do this between class periods.')) return;
  const db = getDB();
  if (!db) return;
  const snap = await db.collection('hm_qa_answers').get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

// ── ICEBREAKER: This or That (live poll) ────────────────────────
const THIS_OR_THAT_QUESTIONS = [
  { a: '🏖️ Beach', b: '⛰️ Mountains',
    divA: { a: '🏊 Swimming in the ocean', b: '🏰 Building sandcastles' },
    divB: { a: '🥾 Hiking to the top', b: '🔥 Camping by a fire' },
    share: { aa: 'Share a specific memory of swimming somewhere fun.', ab: "Share the coolest thing you've ever built at the beach.", ba: 'Share a story about the best hike you\'ve ever been on.', bb: 'Share your best campfire story or memory.' } },
  { a: '🌅 Morning person', b: '🌙 Night owl',
    divA: { a: '🤫 Quiet time alone', b: '✅ Getting things done early' },
    divB: { a: '👯 Hanging out with friends', b: '😌 Just relaxing alone' },
    share: { aa: 'Share what your ideal quiet morning looks like.', ab: 'Share the one thing you always get done first thing in the morning.', ba: 'Share your favorite late-night hangout memory.', bb: 'Share what you do to unwind late at night.' } },
  { a: '🍕 Pizza', b: '🌮 Tacos',
    divA: { a: '🧀 Classic cheese', b: '🍄 Loaded with toppings' },
    divB: { a: '🌯 Soft tortilla', b: '🌮 Hard shell' },
    share: { aa: 'Share your go-to cheese pizza order.', ab: 'Share your favorite wild pizza topping combo.', ba: 'Share your favorite soft taco filling.', bb: 'Share your favorite hard shell taco spot.' } },
  { a: '📺 Movies', b: '📚 Books',
    divA: { a: '🛋️ Watching alone', b: '👥 Watching with friends' },
    divB: { a: '📚 One long series', b: '📖 Lots of different standalones' },
    share: { aa: 'Share a movie you love watching solo.', ab: "Share a movie that's better with a group.", ba: 'Share your favorite book series.', bb: "Share a standalone book you couldn't put down." } },
  { a: '🐱 Cats', b: '🐶 Dogs',
    divA: { a: '😼 Independent cat', b: '🥰 Cuddly cat' },
    divB: { a: '🐕 Small dog', b: '🐕‍🦺 Big dog' },
    share: { aa: 'Share a story about an independent cat you know.', ab: 'Share a story about the cuddliest cat you know.', ba: 'Share a story about a small dog you love.', bb: 'Share a story about a big dog you love.' } },
  { a: '☕ Coffee', b: '🍵 Tea',
    divA: { a: '⚫ Black coffee', b: '🍬 Sweet & creamy coffee' },
    divB: { a: '🔥 Hot tea', b: '🧊 Iced tea' },
    share: { aa: 'Share why you like your coffee simple.', ab: 'Share your go-to sweet coffee order.', ba: 'Share your favorite hot tea to drink.', bb: 'Share your favorite iced tea order.' } },
  { a: '🎬 Netflix', b: '🎮 Video games',
    divA: { a: '🍿 Binge a whole series', b: '📅 One episode at a time' },
    divB: { a: '🎯 Playing solo', b: '👥 Playing with friends online' },
    share: { aa: "Share a show you've binged in one sitting.", ab: "Share a show you're taking your time with.", ba: 'Share your favorite solo game.', bb: 'Share your favorite game to play with friends.' } },
  { a: '❄️ Winter', b: '☀️ Summer',
    divA: { a: '⛄ Snow days', b: '🛋️ Cozy inside' },
    divB: { a: '🏊 Pool days', b: '🚗 Road trips' },
    share: { aa: 'Share your best snow day memory.', ab: 'Share what "cozy" looks like for you in winter.', ba: 'Share your best pool day memory.', bb: 'Share your favorite summer road trip memory.' } },
  { a: '🚗 Road trip', b: '✈️ Flight',
    divA: { a: '🎵 Driving with music', b: '💬 Driving with good conversation' },
    divB: { a: '🪟 Window seat', b: '🚶 Aisle seat' },
    share: { aa: "Share your ultimate road trip playlist pick.", ab: 'Share your best road trip conversation memory.', ba: 'Share why you like the window seat.', bb: 'Share why you like the aisle seat.' } },
  { a: '🎤 Karaoke', b: '💃 Dancing',
    divA: { a: '🎻 Singing a ballad', b: '🎉 Singing something upbeat' },
    divB: { a: '🕺 Freestyle', b: '💃 Choreographed' },
    share: { aa: "Share the song you'd pick for a karaoke ballad.", ab: 'Share your go-to upbeat karaoke song.', ba: 'Share your best freestyle dance move.', bb: "Share a dance you've actually learned the steps to." } },
  { a: '🍦 Ice cream', b: '🍰 Cake',
    divA: { a: '🍦 In a cone', b: '🥣 In a bowl' },
    divB: { a: '🍫 Chocolate', b: '🍦 Vanilla' },
    share: { aa: 'Share your favorite ice cream flavor in a cone.', ab: 'Share your favorite ice cream flavor in a bowl.', ba: 'Share your favorite chocolate cake memory.', bb: 'Share your favorite vanilla cake memory.' } },
  { a: '📱 Texting', b: '📞 Calling',
    divA: { a: '👍 Quick one-word replies', b: '💬 Long text conversations' },
    divB: { a: '📅 Planned calls', b: '🎲 Random spontaneous calls' },
    share: { aa: 'Share who you text the most in one-word replies.', ab: 'Share who you have the longest text threads with.', ba: 'Share who you have planned calls with.', bb: 'Share your best random phone call story.' } },
  { a: '🏙️ City', b: '🌲 Countryside',
    divA: { a: '🚶 Walking everywhere', b: '🚇 Public transit' },
    divB: { a: '🌄 Wide open space', b: '🤫 Quiet and peaceful' },
    share: { aa: "Share your favorite city you've walked around in.", ab: 'Share a fun public transit story.', ba: "Share what you'd do with wide open space.", bb: 'Share what "peaceful" looks like to you.' } },
  { a: '🎸 Concert', b: '🏟️ Sports game',
    divA: { a: '🎤 Front row energy', b: '🧺 Chill lawn seats' },
    divB: { a: '🏆 Watching your favorite team', b: '📣 Watching for the atmosphere' },
    share: { aa: 'Share your best front-row concert memory.', ab: 'Share your best lawn-seat concert memory.', ba: 'Share your favorite team memory.', bb: 'Share your favorite game-day atmosphere memory.' } },
  { a: '🧩 Puzzles', b: '🎲 Board games',
    divA: { a: '🧍 Working alone', b: '👥 Working as a team' },
    divB: { a: '♟️ Strategy games', b: '🎉 Party games' },
    share: { aa: 'Share your favorite puzzle to do solo.', ab: 'Share your favorite puzzle to do with others.', ba: 'Share your favorite strategy board game.', bb: 'Share your favorite party board game.' } },
  { a: '🍔 McDonald\'s', b: '🌯 Chipotle',
    divA: { a: '🍳 Breakfast menu', b: '🍟 Regular menu' },
    divB: { a: '🌯 Burrito', b: '🥣 Bowl' },
    share: { aa: 'Share your go-to McDonald\'s breakfast order.', ab: 'Share your go-to regular McDonald\'s order.', ba: 'Share your go-to Chipotle burrito order.', bb: 'Share your go-to Chipotle bowl order.' } },
  { a: '🍗 Chick-fil-A', b: '🍕 Domino\'s',
    divA: { a: '🥪 Original sandwich', b: '🌶️ Spicy sandwich' },
    divB: { a: '🍕 Pepperoni', b: '🍕 Something unique' },
    share: { aa: 'Share why you go with the original.', ab: 'Share why you go with the spicy.', ba: 'Share your loyalty to classic pepperoni.', bb: "Share your most unique Domino's order." } },
  { a: '🍟 Fries', b: '🧀 Mozzarella sticks',
    divA: { a: '🍟 Plain', b: '🧀 Loaded or dipped' },
    divB: { a: '🍅 Marinara', b: '🥗 Ranch' },
    share: { aa: 'Share why plain fries are all you need.', ab: 'Share your favorite way to load up fries.', ba: 'Share why marinara is the move.', bb: 'Share why ranch is the move.' } },
  { a: '📸 Instagram', b: '🎵 TikTok',
    divA: { a: '📤 Posting', b: '📲 Just scrolling' },
    divB: { a: '🎥 Making videos', b: '👀 Just watching' },
    share: { aa: 'Share the last thing you posted on Instagram.', ab: 'Share your favorite type of content to scroll.', ba: "Share an idea for a TikTok you'd make.", bb: 'Share your favorite type of TikTok to watch.' } },
  { a: '🕹️ Fortnite', b: '🧱 Minecraft',
    divA: { a: '🏗️ Building', b: '🔫 Fighting' },
    divB: { a: '🌲 Survival mode', b: '🎨 Creative mode' },
    share: { aa: 'Share your best Fortnite build.', ab: 'Share your best Fortnite win story.', ba: "Share your favorite thing you've survived in Minecraft.", bb: "Share the coolest thing you've built in Creative mode." } },
  { a: '🎮 Console gaming', b: '💻 PC gaming',
    divA: { a: '📖 Story games', b: '👥 Multiplayer games' },
    divB: { a: '🏆 Competitive games', b: '🖥️ Building your own setup' },
    share: { aa: 'Share your favorite story-driven console game.', ab: 'Share your favorite multiplayer console game.', ba: 'Share your favorite competitive PC game.', bb: 'Share something cool about your PC setup.' } },
  { a: '🍿 Movie theater', b: '🛋️ Watching at home',
    divA: { a: '💥 Big blockbuster', b: '🎭 Small indie film' },
    divB: { a: '🧍 Alone', b: '👥 With people' },
    share: { aa: "Share the best blockbuster you've seen in theaters.", ab: "Share the best indie film you've seen in theaters.", ba: 'Share your favorite movie to watch alone.', bb: 'Share your favorite movie to watch with people.' } },
  { a: '🏈 Football', b: '🏀 Basketball',
    divA: { a: '⚔️ Offense', b: '🛡️ Defense' },
    divB: { a: '🎯 Shooting', b: '🤝 Passing' },
    share: { aa: 'Share your favorite offensive play or moment.', ab: 'Share your favorite defensive play or moment.', ba: "Share your favorite shot you've hit or seen.", bb: 'Share your favorite assist or team play.' } },
  { a: '👟 Nike', b: '👟 Adidas',
    divA: { a: '👟 Shoes', b: '👕 Apparel' },
    divB: { a: '👟 Shoes', b: '👕 Apparel' },
    share: { aa: 'Share your favorite pair of Nike shoes.', ab: 'Share your favorite piece of Nike apparel.', ba: 'Share your favorite pair of Adidas shoes.', bb: 'Share your favorite piece of Adidas apparel.' } },
  { a: '📖 Physical book', b: '📱 E-book',
    divA: { a: '📚 Owning a big collection', b: '📕 Borrowing from the library' },
    divB: { a: '📱 Reading on a tablet', b: '📲 Reading on your phone' },
    share: { aa: "Share a book you're proud to own.", ab: 'Share your favorite library find.', ba: 'Share what you like about reading on a tablet.', bb: 'Share what you like about reading on your phone.' } },
  { a: '🚙 Driving yourself', b: '🚌 Getting a ride',
    divA: { a: '🔊 Blasting music', b: '🤫 Driving in silence' },
    divB: { a: '💬 Good conversation', b: '😌 Just chilling' },
    share: { aa: 'Share your go-to driving playlist.', ab: 'Share why you like driving in silence.', ba: 'Share your best car-ride conversation.', bb: 'Share who you like just chilling in the car with.' } },
  { a: '🛒 Target', b: '🛍️ Amazon',
    divA: { a: '🚶 Wandering the whole store', b: '⚡ In and out fast' },
    divB: { a: '📦 Same-day delivery', b: '💸 Waiting for a good deal' },
    share: { aa: 'Share your favorite Target section to wander.', ab: 'Share your best in-and-out Target run.', ba: "Share the fastest thing you've ever ordered.", bb: 'Share your best Amazon deal find.' } },
  { a: '🎧 Spotify', b: '🍎 Apple Music',
    divA: { a: '📋 Curated playlists', b: '✏️ Making your own' },
    divB: { a: '🔎 Discovering new artists', b: '🔁 Replaying favorites' },
    share: { aa: 'Share your favorite Spotify playlist to listen to.', ab: "Share a playlist you've made yourself.", ba: "Share a new artist you've discovered recently.", bb: 'Share the song you replay the most.' } },
  { a: '🌭 Hot dog', b: '🍔 Burger',
    divA: { a: '⚾ Ballpark style', b: '🌶️ Loaded with toppings' },
    divB: { a: '🧀 Simple cheeseburger', b: '🥓 Loaded burger' },
    share: { aa: 'Share your favorite ballpark hot dog memory.', ab: 'Share your favorite hot dog topping combo.', ba: 'Share why a simple cheeseburger wins.', bb: 'Share your favorite loaded burger order.' } },
  { a: '🛹 Skateboard', b: '🛴 Scooter',
    divA: { a: '🤸 Tricks', b: '🌅 Just cruising' },
    divB: { a: '🤸 Tricks', b: '🌅 Just cruising' },
    share: { aa: 'Share your best skateboard trick (or one you want to learn).', ab: 'Share your favorite place to cruise on a skateboard.', ba: 'Share your best scooter trick (or one you want to learn).', bb: 'Share your favorite place to cruise on a scooter.' } },
];

function slugifyName(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function loadTotGame() {
  const db = getDB();
  if (!db) return;
  if (S.totStateUnsub) { S.totStateUnsub(); S.totStateUnsub = null; }
  S.totStateUnsub = db.collection('hm_tot_state').doc('current').onSnapshot(doc => {
    const data = doc.exists ? doc.data() : { index: 0, stage: 'poll' };
    const idx = Number.isInteger(data.index) ? data.index : 0;
    const newIdx = Math.max(0, Math.min(idx, THIS_OR_THAT_QUESTIONS.length - 1));
    const newStage = ['poll', 'div', 'share'].includes(data.stage) ? data.stage : 'poll';
    const indexChanged = newIdx !== S.totCurrentIndex;
    const stageChanged = newStage !== S.totStage;
    if (indexChanged) { S.totMyChoice = null; S.totMyDivChoice = null; }
    if (stageChanged && newStage === 'poll') S.totMyDivChoice = null;
    S.totCurrentIndex = newIdx;
    S.totStage = newStage;
    if (indexChanged || stageChanged) {
      render();
      if (S.totStage === 'poll') loadTotVotes(); else loadTotDivVotes();
      return;
    }
    const q = THIS_OR_THAT_QUESTIONS[S.totCurrentIndex];
    document.querySelectorAll('.tot-question-a').forEach(el => { el.textContent = q.a; });
    document.querySelectorAll('.tot-question-b').forEach(el => { el.textContent = q.b; });
    document.querySelectorAll('.tot-choice-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.choice === S.totMyChoice));
    const posEl = document.getElementById('tot-position');
    if (posEl) posEl.textContent = `${S.totCurrentIndex + 1} / ${THIS_OR_THAT_QUESTIONS.length}`;
    if (S.totStage === 'poll') loadTotVotes(); else loadTotDivVotes();
  }, err => console.error('tot state snapshot error', err));
}

function loadTotVotes() {
  const db = getDB();
  if (!db) return;
  if (S.totVotesUnsub) { S.totVotesUnsub(); S.totVotesUnsub = null; }
  S.totVotesUnsub = db.collection('hm_tot_votes').where('questionIndex', '==', S.totCurrentIndex).onSnapshot(snap => {
    let a = 0, b = 0;
    snap.docs.forEach(d => {
      const choice = d.data().choice;
      if (choice === 'a') a++; else if (choice === 'b') b++;
    });
    S.totVotes = { a, b };
    document.querySelectorAll('.tot-poll').forEach(el => { el.innerHTML = renderTotPoll(); });
  }, err => console.error('tot votes snapshot error', err));
}

function loadTotDivVotes() {
  const db = getDB();
  if (!db) return;
  if (S.totDivVotesUnsub) { S.totDivVotesUnsub(); S.totDivVotesUnsub = null; }
  S.totDivVotesUnsub = db.collection('hm_tot_div_votes').where('questionIndex', '==', S.totCurrentIndex).onSnapshot(snap => {
    const tallyA = { a: 0, b: 0 }, tallyB = { a: 0, b: 0 };
    snap.docs.forEach(d => {
      const v = d.data();
      const t = v.team === 'B' ? tallyB : tallyA;
      if (v.choice === 'a') t.a++; else if (v.choice === 'b') t.b++;
    });
    S.totDivVotesA = tallyA;
    S.totDivVotesB = tallyB;
    document.querySelectorAll('.tot-div-poll-a').forEach(el => { el.innerHTML = renderTotDivPoll('A'); });
    document.querySelectorAll('.tot-div-poll-b').forEach(el => { el.innerHTML = renderTotDivPoll('B'); });
  }, err => console.error('tot div votes snapshot error', err));
}

function renderBarPoll(labelA, labelB, a, b) {
  const total = a + b;
  const aPct = total ? Math.round((a / total) * 100) : 0;
  const bPct = total ? 100 - aPct : 0;
  return `
    <div class="tot-bar-row">
      <div class="tot-bar-label">${esc(labelA)}</div>
      <div class="tot-bar-track"><div class="tot-bar-fill tot-bar-a" style="width:${aPct}%"></div></div>
      <div class="tot-bar-count">${a} (${aPct}%)</div>
    </div>
    <div class="tot-bar-row">
      <div class="tot-bar-label">${esc(labelB)}</div>
      <div class="tot-bar-track"><div class="tot-bar-fill tot-bar-b" style="width:${bPct}%"></div></div>
      <div class="tot-bar-count">${b} (${bPct}%)</div>
    </div>
    <p class="dim" style="font-size:0.78rem;margin-top:6px">${total} vote${total === 1 ? '' : 's'} so far</p>`;
}

function renderTotPoll() {
  const q = THIS_OR_THAT_QUESTIONS[S.totCurrentIndex];
  return renderBarPoll(q.a, q.b, S.totVotes.a, S.totVotes.b);
}

function renderTotDivPoll(team) {
  const q = THIS_OR_THAT_QUESTIONS[S.totCurrentIndex];
  const divQ = team === 'A' ? q.divA : q.divB;
  const votes = team === 'A' ? S.totDivVotesA : S.totDivVotesB;
  return renderBarPoll(divQ.a, divQ.b, votes.a, votes.b);
}

function renderTotDivStudentPanel() {
  const q = THIS_OR_THAT_QUESTIONS[S.totCurrentIndex];
  if (!S.totMyChoice) {
    return `<p class="dim" style="font-size:0.85rem;margin-top:10px">You didn't vote in the original poll, so sit tight — watch the board for your group's question.</p>`;
  }
  const team = S.totMyChoice === 'a' ? 'A' : 'B';
  const divQ = S.totMyChoice === 'a' ? q.divA : q.divB;
  const teamLabel = S.totMyChoice === 'a' ? q.a : q.b;
  return `
    <p class="dim" style="font-size:0.82rem;margin:10px 0 6px">You picked <strong>${esc(teamLabel)}</strong> — now answer this to find your final group:</p>
    <div class="tot-choices">
      <button class="tot-div-choice-btn ${S.totMyDivChoice === 'a' ? 'active' : ''}" data-choice="a">${esc(divQ.a)}</button>
      <div class="tot-vs">vs</div>
      <button class="tot-div-choice-btn ${S.totMyDivChoice === 'b' ? 'active' : ''}" data-choice="b">${esc(divQ.b)}</button>
    </div>
    <div class="tot-poll tot-div-poll-${team.toLowerCase()}" style="margin-top:10px">${renderTotDivPoll(team)}</div>`;
}

function renderTotShareStudentPanel() {
  const q = THIS_OR_THAT_QUESTIONS[S.totCurrentIndex];
  if (!S.totMyChoice || !S.totMyDivChoice) {
    return `<p class="dim" style="font-size:0.85rem;margin-top:10px">Check the board for your group's discussion question.</p>`;
  }
  const key = S.totMyChoice + S.totMyDivChoice;
  return `
    <div class="tot-share-box">
      <p class="tot-share-label">💬 Your group's discussion question:</p>
      <p class="tot-share-text">${esc(q.share[key])}</p>
    </div>`;
}

function renderTotDivBoard() {
  const q = THIS_OR_THAT_QUESTIONS[S.totCurrentIndex];
  return `
    <div class="tot-div-board">
      <div class="tot-div-board-team">
        <h3>${esc(q.a)}</h3>
        <div class="tot-poll tot-div-poll-a">${renderTotDivPoll('A')}</div>
      </div>
      <div class="tot-div-board-team">
        <h3>${esc(q.b)}</h3>
        <div class="tot-poll tot-div-poll-b">${renderTotDivPoll('B')}</div>
      </div>
    </div>`;
}

function renderTotShareBoard() {
  const q = THIS_OR_THAT_QUESTIONS[S.totCurrentIndex];
  const groups = [
    { key: 'aa', label: `${q.a} → ${q.divA.a}` },
    { key: 'ab', label: `${q.a} → ${q.divA.b}` },
    { key: 'ba', label: `${q.b} → ${q.divB.a}` },
    { key: 'bb', label: `${q.b} → ${q.divB.b}` },
  ];
  return `
    <div class="tot-share-board">
      ${groups.map((g, i) => `
        <div class="tot-share-card">
          <div class="tot-share-group-label">Group ${i + 1} · ${esc(g.label)}</div>
          <div class="tot-share-text">${esc(q.share[g.key])}</div>
        </div>`).join('')}
    </div>`;
}

async function submitTotVote(choice) {
  const nameEl = document.getElementById('tot-name');
  const msg    = document.getElementById('tot-msg');
  const name = shortenName(nameEl.value.trim());
  if (!name) {
    msg.textContent = 'Enter your name first.';
    msg.style.color = 'var(--danger)';
    return;
  }
  const db = getDB();
  if (!db) { msg.textContent = 'Could not connect — try again.'; msg.style.color = 'var(--danger)'; return; }
  try {
    localStorage.setItem('hm_student_name', name);
    const voteId = `${S.totCurrentIndex}_${slugifyName(name)}`;
    await db.collection('hm_tot_votes').doc(voteId).set({ name, choice, questionIndex: S.totCurrentIndex, createdAt: Date.now() });
    S.totMyChoice = choice;
    document.querySelectorAll('.tot-choice-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.choice === choice));
    msg.textContent = '✅ Vote counted! Change your mind? Just tap the other option.';
    msg.style.color = 'var(--success)';
  } catch (e) {
    msg.textContent = 'Could not save: ' + e.message;
    msg.style.color = 'var(--danger)';
  }
}

async function submitTotDivVote(choice) {
  const name = localStorage.getItem('hm_student_name');
  if (!name || !S.totMyChoice) return;
  const db = getDB();
  if (!db) return;
  const team = S.totMyChoice === 'b' ? 'B' : 'A';
  try {
    const voteId = `${S.totCurrentIndex}_${team}_${slugifyName(name)}`;
    await db.collection('hm_tot_div_votes').doc(voteId).set({ name, team, choice, questionIndex: S.totCurrentIndex, createdAt: Date.now() });
    S.totMyDivChoice = choice;
    document.querySelectorAll('.tot-div-choice-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.choice === choice));
  } catch (e) { console.error('tot div vote error', e); }
}

async function advanceTotQuestion(delta) {
  const db = getDB();
  if (!db) return;
  const next = Math.max(0, Math.min(S.totCurrentIndex + delta, THIS_OR_THAT_QUESTIONS.length - 1));
  await db.collection('hm_tot_state').doc('current').set({ index: next, stage: 'poll', updatedAt: Date.now() });
}

async function startTotDivision() {
  const db = getDB();
  if (!db) return;
  await db.collection('hm_tot_state').doc('current').set({ index: S.totCurrentIndex, stage: 'div', updatedAt: Date.now() });
}

async function revealTotShare() {
  const db = getDB();
  if (!db) return;
  await db.collection('hm_tot_state').doc('current').set({ index: S.totCurrentIndex, stage: 'share', updatedAt: Date.now() });
}

async function resetTotStage() {
  const db = getDB();
  if (!db) return;
  await db.collection('hm_tot_state').doc('current').set({ index: S.totCurrentIndex, stage: 'poll', updatedAt: Date.now() });
}

async function clearTotVotes() {
  if (!confirm('Clear all This or That votes (every question)? Do this between class periods.')) return;
  const db = getDB();
  if (!db) return;
  const [snap, divSnap] = await Promise.all([
    db.collection('hm_tot_votes').get(),
    db.collection('hm_tot_div_votes').get(),
  ]);
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  divSnap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

// ── ICEBREAKER: Would You Rather (live poll) ────────────────────
const WYR_QUESTIONS = [
  { a: 'Always be 10 minutes late', b: 'Always be an hour early' },
  { a: 'Have unlimited free fast food for life', b: 'Have unlimited free streaming subscriptions for life' },
  { a: 'Never use social media again', b: 'Never watch another movie or show again' },
  { a: 'Be famous but broke', b: 'Be rich but unknown' },
  { a: 'Only be able to text', b: 'Only be able to call' },
  { a: 'Have to sing everything you say', b: 'Have to talk in rhymes all day' },
  { a: 'Always know when someone is lying', b: 'Always get away with lying' },
  { a: 'Live without music', b: 'Live without your phone' },
  { a: 'Retake every test you\'ve ever failed', b: 'Redo every awkward conversation you\'ve had' },
  { a: 'Have summer be 6 months long', b: 'Have winter break be 2 months long' },
  { a: 'Be able to teleport anywhere', b: 'Be able to read minds' },
  { a: 'Never have wifi at home', b: 'Never have wifi at school' },
  { a: 'Have to wear the same outfit every day', b: 'Have to eat the same meal every day' },
  { a: 'Win the school talent show', b: 'Win a state athletic championship' },
  { a: 'Have an extra hour of sleep', b: 'Have an extra hour of free time after school' },
];

function loadWyrGame() {
  const db = getDB();
  if (!db) return;
  if (S.wyrStateUnsub) { S.wyrStateUnsub(); S.wyrStateUnsub = null; }
  S.wyrStateUnsub = db.collection('hm_wyr_state').doc('current').onSnapshot(doc => {
    const data = doc.exists ? doc.data() : { index: 0 };
    const idx = Number.isInteger(data.index) ? data.index : 0;
    const newIdx = Math.max(0, Math.min(idx, WYR_QUESTIONS.length - 1));
    const questionChanged = newIdx !== S.wyrCurrentIndex;
    if (questionChanged) S.wyrMyChoice = null;
    S.wyrCurrentIndex = newIdx;
    const q = WYR_QUESTIONS[S.wyrCurrentIndex];
    document.querySelectorAll('.wyr-question-a').forEach(el => { el.textContent = q.a; });
    document.querySelectorAll('.wyr-question-b').forEach(el => { el.textContent = q.b; });
    document.querySelectorAll('.wyr-choice-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.choice === S.wyrMyChoice));
    if (questionChanged) {
      const msgEl = document.getElementById('wyr-msg');
      if (msgEl) { msgEl.textContent = ''; msgEl.classList.remove('wyr-move-active'); msgEl.style.color = ''; }
    }
    const posEl = document.getElementById('wyr-position');
    if (posEl) posEl.textContent = `${S.wyrCurrentIndex + 1} / ${WYR_QUESTIONS.length}`;
    const boardPosEl = document.getElementById('wyr-board-position');
    if (boardPosEl) boardPosEl.textContent = `${S.wyrCurrentIndex + 1} / ${WYR_QUESTIONS.length}`;
    loadWyrVotes();
  }, err => console.error('wyr state snapshot error', err));
}

function loadWyrVotes() {
  const db = getDB();
  if (!db) return;
  if (S.wyrVotesUnsub) { S.wyrVotesUnsub(); S.wyrVotesUnsub = null; }
  S.wyrVotesUnsub = db.collection('hm_wyr_votes').where('questionIndex', '==', S.wyrCurrentIndex).onSnapshot(snap => {
    let a = 0, b = 0;
    snap.docs.forEach(d => {
      const choice = d.data().choice;
      if (choice === 'a') a++; else if (choice === 'b') b++;
    });
    S.wyrVotes = { a, b };
    document.querySelectorAll('.wyr-poll').forEach(el => { el.innerHTML = renderWyrPoll(); });
  }, err => console.error('wyr votes snapshot error', err));
}

function renderWyrPoll() {
  const q = WYR_QUESTIONS[S.wyrCurrentIndex];
  const { a, b } = S.wyrVotes;
  const total = a + b;
  const aPct = total ? Math.round((a / total) * 100) : 0;
  const bPct = total ? 100 - aPct : 0;
  return `
    <div class="wyr-bar-row">
      <div class="wyr-bar-label">${esc(q.a)}</div>
      <div class="wyr-bar-track"><div class="wyr-bar-fill wyr-bar-a" style="width:${aPct}%"></div></div>
      <div class="wyr-bar-count">${a} (${aPct}%)</div>
    </div>
    <div class="wyr-bar-row">
      <div class="wyr-bar-label">${esc(q.b)}</div>
      <div class="wyr-bar-track"><div class="wyr-bar-fill wyr-bar-b" style="width:${bPct}%"></div></div>
      <div class="wyr-bar-count">${b} (${bPct}%)</div>
    </div>
    <p class="dim" style="font-size:0.78rem;margin-top:6px">${total} vote${total === 1 ? '' : 's'} so far</p>`;
}

async function submitWyrVote(choice) {
  const nameEl = document.getElementById('wyr-name');
  const msg    = document.getElementById('wyr-msg');
  const name = shortenName(nameEl.value.trim());
  msg.classList.remove('wyr-move-active');
  if (!name) {
    msg.textContent = 'Enter your name first.';
    msg.style.color = 'var(--danger)';
    return;
  }
  const db = getDB();
  if (!db) { msg.textContent = 'Could not connect — try again.'; msg.style.color = 'var(--danger)'; return; }
  try {
    localStorage.setItem('hm_student_name', name);
    const voteId = `${S.wyrCurrentIndex}_${slugifyName(name)}`;
    await db.collection('hm_wyr_votes').doc(voteId).set({ name, choice, questionIndex: S.wyrCurrentIndex, createdAt: Date.now() });
    S.wyrMyChoice = choice;
    document.querySelectorAll('.wyr-choice-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.choice === choice));
    const q = WYR_QUESTIONS[S.wyrCurrentIndex];
    const chosenText = choice === 'a' ? q.a : q.b;
    msg.style.color = '';
    msg.innerHTML = `🚶 <strong>Get up and move!</strong> Head to the side of the room for “${esc(chosenText)},” find someone who picked the other answer, and ask them to explain why.`;
    msg.classList.add('wyr-move-active');
  } catch (e) {
    msg.textContent = 'Could not save: ' + e.message;
    msg.style.color = 'var(--danger)';
  }
}

async function advanceWyrQuestion(delta) {
  const db = getDB();
  if (!db) return;
  const next = Math.max(0, Math.min(S.wyrCurrentIndex + delta, WYR_QUESTIONS.length - 1));
  await db.collection('hm_wyr_state').doc('current').set({ index: next, updatedAt: Date.now() });
}

async function clearWyrVotes() {
  if (!confirm('Clear all Would You Rather votes (every question)? Do this between class periods.')) return;
  const db = getDB();
  if (!db) return;
  const snap = await db.collection('hm_wyr_votes').get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

// ── ICEBREAKER: Speed Meet (question roulette) ──────────────────
const SPEED_INTRO = "Introduce yourself: first name, grade, and what classes in Homestead Media you've been in.";
const SPEED_QUESTIONS = [
  "What's a video, photo, or audio project you've made (school or personal) that you're proud of?",
  "What role do you want to try for the first time this semester?",
  "What's the most nerve-wracking part of putting your creative work out for others to see?",
  "If you could team up with anyone in this room on a creative project, who would it be and why?",
  "What's one skill you want to get better at this semester?",
  "What got you interested in joining Homestead Media?",
  "What's a movie or show you think everyone should watch at least once?",
  "Who's a YouTuber, streamer, or content creator you actually look up to?",
  "What's a podcast or channel you never miss an episode of?",
  "If you could interview anyone, alive or dead, who would it be and what would you ask?",
  "What's a song that instantly puts you in a good mood?",
  "What's the last thing that made you laugh out loud?",
  "If you had your own show or channel, what would it be about?",
  "What's a piece of media — movie, show, game, or book — that changed how you see something?",
  "What's your go-to karaoke song, even if you'd never actually sing it in public?",
  "What's a talent you have that most people don't know about?",
  "If you could master any instrument overnight, what would you pick?",
  "What's a trend right now that you just don't get?",
  "What's the best photo you've ever taken, and what's the story behind it?",
  "If you were a news anchor for a day, what story would you want to cover?",
  "What's a movie or show soundtrack you could listen to on its own?",
  "What app do you spend the most time on, and what do you actually use it for?",
  "What's something you think would make a great documentary?",
  "If your life had a theme song, what would it be?",
  "What's the most useless talent you're proud of?",
  "What's a piece of technology you couldn't live without?",
  "What's a story from your own life you think would make a good short film?",
  "If you could only watch one genre of movies for the rest of your life, what would it be?",
  "What's a game — video game or otherwise — you could play for hours?",
  "What's something you've seen online recently that you can't stop thinking about?",
];
const SPEED_TIMER_SECONDS = 45;

function loadSpeedGame() {
  const db = getDB();
  if (!db) return;
  if (S.speedStateUnsub) { S.speedStateUnsub(); S.speedStateUnsub = null; }
  S.speedStateUnsub = db.collection('hm_speed_state').doc('current').onSnapshot(doc => {
    const data = doc.exists ? doc.data() : { index: 0, timerStartedAt: null };
    S.speedIndex = Number.isInteger(data.index) ? Math.max(0, Math.min(data.index, SPEED_QUESTIONS.length - 1)) : 0;
    S.speedTimerStartedAt = data.timerStartedAt || null;
    document.querySelectorAll('.speed-question-text').forEach(el => { el.textContent = SPEED_QUESTIONS[S.speedIndex]; });
    startSpeedTick();
  }, err => console.error('speed state snapshot error', err));
}

function startSpeedTick() {
  if (S.speedTickHandle) { clearInterval(S.speedTickHandle); S.speedTickHandle = null; }
  updateSpeedTimerDisplay();
  S.speedTickHandle = setInterval(updateSpeedTimerDisplay, 1000);
}

function updateSpeedTimerDisplay() {
  const els = document.querySelectorAll('.speed-timer');
  if (!els.length) return;
  let text = `⏱️ ${SPEED_TIMER_SECONDS}`;
  if (S.speedTimerStartedAt) {
    const remaining = Math.max(0, SPEED_TIMER_SECONDS - Math.floor((Date.now() - S.speedTimerStartedAt) / 1000));
    text = remaining > 0 ? `⏱️ ${remaining}` : '⏰ Time! Switch partners';
  }
  els.forEach(el => { el.textContent = text; });
}

async function newSpeedQuestion() {
  const db = getDB();
  if (!db) return;
  let next = Math.floor(Math.random() * SPEED_QUESTIONS.length);
  if (SPEED_QUESTIONS.length > 1 && next === S.speedIndex) next = (next + 1) % SPEED_QUESTIONS.length;
  await db.collection('hm_speed_state').doc('current').set({ index: next, timerStartedAt: null, updatedAt: Date.now() });
}

async function startSpeedTimer() {
  const db = getDB();
  if (!db) return;
  await db.collection('hm_speed_state').doc('current').set({ index: S.speedIndex, timerStartedAt: Date.now(), updatedAt: Date.now() });
}

// ── ICEBREAKER: Common Ground (find your group) ──────────────────
const COMMON_GROUND_CATEGORIES = [
  { q: 'Favorite Season', options: ['❄️ Winter', '🌸 Spring', '☀️ Summer', '🍂 Fall'] },
  { q: 'Go-To Fast Food', options: ['🍔 McDonald\'s', '🌮 Taco Bell', '🍗 Chick-fil-A', '🍕 Domino\'s', '🌯 Chipotle'] },
  { q: 'Favorite School Subject', options: ['🔢 Math', '🔬 Science', '📖 English', '🌍 History', '🎨 Art/Elective'] },
  { q: 'Go-To Music Genre', options: ['🎤 Pop', '🎸 Rock', '🎹 Hip-Hop', '🤠 Country', '🎧 EDM'] },
  { q: 'Ideal Weekend', options: ['🛏️ Relaxing at home', '🎉 Hanging with friends', '🏃 Being active/outdoors', '🎮 Gaming'] },
  { q: 'Favorite Streaming Service', options: ['🎬 Netflix', '🏰 Disney+', '📦 Prime Video', '📱 YouTube', '🎥 Hulu'] },
  { q: 'Type of Pet', options: ['🐶 Dog', '🐱 Cat', '🐟 Other/None', '🐾 Want one someday'] },
  { q: 'Birth Season', options: ['❄️ Winter (Dec-Feb)', '🌸 Spring (Mar-May)', '☀️ Summer (Jun-Aug)', '🍂 Fall (Sep-Nov)'] },
  { q: 'Sport You\'d Rather Watch', options: ['🏈 Football', '🏀 Basketball', '⚾ Baseball', '⚽ Soccer', '🚫 Not a sports person'] },
  { q: 'Morning or Night', options: ['🌅 Morning person', '🌙 Night owl'] },
];

function loadCommonGame() {
  const db = getDB();
  if (!db) return;
  if (S.commonStateUnsub) { S.commonStateUnsub(); S.commonStateUnsub = null; }
  S.commonStateUnsub = db.collection('hm_common_state').doc('current').onSnapshot(doc => {
    const data = doc.exists ? doc.data() : { index: 0 };
    const idx = Number.isInteger(data.index) ? data.index : 0;
    const newIdx = Math.max(0, Math.min(idx, COMMON_GROUND_CATEGORIES.length - 1));
    if (newIdx !== S.commonCurrentIndex) S.commonMyChoice = null;
    S.commonCurrentIndex = newIdx;
    const cat = COMMON_GROUND_CATEGORIES[S.commonCurrentIndex];
    document.querySelectorAll('.common-question-text').forEach(el => { el.textContent = cat.q; });
    const optsEl = document.getElementById('common-options');
    if (optsEl) optsEl.innerHTML = renderCommonOptions();
    const posEl = document.getElementById('common-position');
    if (posEl) posEl.textContent = `${S.commonCurrentIndex + 1} / ${COMMON_GROUND_CATEGORIES.length}`;
    loadCommonAnswers();
  }, err => console.error('common state snapshot error', err));
}

function loadCommonAnswers() {
  const db = getDB();
  if (!db) return;
  if (S.commonAnswersUnsub) { S.commonAnswersUnsub(); S.commonAnswersUnsub = null; }
  S.commonAnswersUnsub = db.collection('hm_common_answers').where('categoryIndex', '==', S.commonCurrentIndex).onSnapshot(snap => {
    S.commonAnswers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.querySelectorAll('.common-groups').forEach(el => { el.innerHTML = renderCommonGroups(); });
  }, err => console.error('common answers snapshot error', err));
}

function renderCommonOptions() {
  const cat = COMMON_GROUND_CATEGORIES[S.commonCurrentIndex];
  return cat.options.map(o => `<button class="common-option-btn ${S.commonMyChoice === o ? 'active' : ''}" data-option="${esc(o)}">${esc(o)}</button>`).join('');
}

function renderCommonGroups() {
  const cat = COMMON_GROUND_CATEGORIES[S.commonCurrentIndex];
  const groups = {};
  cat.options.forEach(o => { groups[o] = []; });
  S.commonAnswers.forEach(a => { if (groups[a.option]) groups[a.option].push(a.name); });
  return cat.options.map(o => `
    <div class="common-group">
      <div class="common-group-label">${esc(o)} <span class="common-group-count">(${groups[o].length})</span></div>
      <div class="common-group-names">${groups[o].length ? groups[o].map(n => `<span class="common-name-pill">${esc(n)}</span>`).join('') : '<span class="dim" style="font-size:0.78rem">Nobody yet</span>'}</div>
    </div>`).join('');
}

async function submitCommonAnswer(option) {
  const nameEl = document.getElementById('common-name');
  const msg    = document.getElementById('common-msg');
  const name = shortenName(nameEl.value.trim());
  if (!name) {
    msg.textContent = 'Enter your name first.';
    msg.style.color = 'var(--danger)';
    return;
  }
  const db = getDB();
  if (!db) { msg.textContent = 'Could not connect — try again.'; msg.style.color = 'var(--danger)'; return; }
  try {
    localStorage.setItem('hm_student_name', name);
    const docId = `${S.commonCurrentIndex}_${slugifyName(name)}`;
    await db.collection('hm_common_answers').doc(docId).set({ name, option, categoryIndex: S.commonCurrentIndex, createdAt: Date.now() });
    S.commonMyChoice = option;
    const optsEl = document.getElementById('common-options');
    if (optsEl) optsEl.innerHTML = renderCommonOptions();
    msg.textContent = '✅ Added! Go find your group.';
    msg.style.color = 'var(--success)';
  } catch (e) {
    msg.textContent = 'Could not save: ' + e.message;
    msg.style.color = 'var(--danger)';
  }
}

async function advanceCommonCategory(delta) {
  const db = getDB();
  if (!db) return;
  const next = Math.max(0, Math.min(S.commonCurrentIndex + delta, COMMON_GROUND_CATEGORIES.length - 1));
  await db.collection('hm_common_state').doc('current').set({ index: next, updatedAt: Date.now() });
}

async function clearCommonAnswers() {
  if (!confirm('Clear all Common Ground answers (every category)? Do this between class periods.')) return;
  const db = getDB();
  if (!db) return;
  const snap = await db.collection('hm_common_answers').get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

// ── ICEBREAKER: Rank It (tap-to-rank, live leaderboard) ───────────
const RANK_ROUNDS = [
  { title: '🍔 Rank the Fast Food Chains', items: ['🍔 McDonald\'s', '🌮 Taco Bell', '🍕 Domino\'s', '🍗 Chick-fil-A', '🌯 Chipotle'] },
  { title: '📺 Rank the Streaming Services', items: ['🎬 Netflix', '🏰 Disney+', '📦 Amazon Prime', '🎥 Hulu', '📱 YouTube'] },
  { title: '📚 Rank the School Subjects', items: ['🔢 Math', '🔬 Science', '📖 English', '🌍 History', '🎨 Art'] },
  { title: '🎵 Rank the Music Genres', items: ['🎤 Pop', '🎸 Rock', '🎹 Hip-Hop', '🤠 Country', '🎧 EDM'] },
  { title: '🦸 Rank the Superpowers', items: ['✈️ Flight', '👻 Invisibility', '⏱️ Time travel', '🧠 Mind reading', '💪 Super strength'] },
  { title: '❄️ Rank Ways to Spend a Snow Day', items: ['🛷 Sledding', '🎮 Video games', '🎬 Movie marathon', '😴 Sleeping in', '☕ Baking/cooking'] },
];

function loadRankGame() {
  const db = getDB();
  if (!db) return;
  if (S.rankStateUnsub) { S.rankStateUnsub(); S.rankStateUnsub = null; }
  S.rankStateUnsub = db.collection('hm_rank_state').doc('current').onSnapshot(doc => {
    const data = doc.exists ? doc.data() : { index: 0 };
    const idx = Number.isInteger(data.index) ? data.index : 0;
    const newIdx = Math.max(0, Math.min(idx, RANK_ROUNDS.length - 1));
    if (newIdx !== S.rankCurrentIndex) S.rankMyOrder = [];
    S.rankCurrentIndex = newIdx;
    const round = RANK_ROUNDS[S.rankCurrentIndex];
    document.querySelectorAll('.rank-round-title').forEach(el => { el.textContent = round.title; });
    const posEl = document.getElementById('rank-position');
    if (posEl) posEl.textContent = `${S.rankCurrentIndex + 1} / ${RANK_ROUNDS.length}`;
    const itemsEl = document.getElementById('rank-items');
    if (itemsEl) itemsEl.innerHTML = renderRankItems();
    updateRankProgress();
    loadRankAnswers();
  }, err => console.error('rank state snapshot error', err));
}

function loadRankAnswers() {
  const db = getDB();
  if (!db) return;
  if (S.rankAnswersUnsub) { S.rankAnswersUnsub(); S.rankAnswersUnsub = null; }
  S.rankAnswersUnsub = db.collection('hm_rank_answers').where('roundIndex', '==', S.rankCurrentIndex).onSnapshot(snap => {
    S.rankAnswers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.querySelectorAll('.rank-results').forEach(el => { el.innerHTML = renderRankResults(); });
  }, err => console.error('rank answers snapshot error', err));
}

function renderRankItems() {
  const round = RANK_ROUNDS[S.rankCurrentIndex];
  const medals = ['🥇', '🥈', '🥉'];
  return round.items.map((item, i) => {
    const pos = S.rankMyOrder.indexOf(i);
    const ranked = pos !== -1;
    const badge = ranked ? (medals[pos] || `#${pos + 1}`) : '';
    return `<button class="rank-item-btn ${ranked ? 'ranked' : ''}" data-item="${i}">
      ${badge ? `<span class="rank-item-badge">${badge}</span>` : ''}
      <span class="rank-item-label">${esc(item)}</span>
    </button>`;
  }).join('');
}

function renderRankResults() {
  const round = RANK_ROUNDS[S.rankCurrentIndex];
  const n = round.items.length;
  const totals = new Array(n).fill(0);
  S.rankAnswers.forEach(a => {
    (a.ranking || []).forEach((itemIdx, pos) => {
      if (itemIdx >= 0 && itemIdx < n) totals[itemIdx] += (n - pos);
    });
  });
  const maxTotal = Math.max(1, ...totals);
  const order = round.items.map((item, i) => ({ item, total: totals[i] })).sort((a, b) => b.total - a.total);
  const respondents = S.rankAnswers.length;
  return order.map(o => `
    <div class="rank-bar-row">
      <div class="rank-bar-label">${esc(o.item)}</div>
      <div class="rank-bar-track"><div class="rank-bar-fill" style="width:${Math.round((o.total / maxTotal) * 100)}%"></div></div>
      <div class="rank-bar-count">${o.total} pt${o.total === 1 ? '' : 's'}</div>
    </div>`).join('') +
    `<p class="dim" style="font-size:0.78rem;margin-top:6px">${respondents} ranking${respondents === 1 ? '' : 's'} submitted</p>`;
}

function updateRankProgress() {
  const round = RANK_ROUNDS[S.rankCurrentIndex];
  const progEl = document.getElementById('rank-progress');
  if (progEl) progEl.textContent = `${S.rankMyOrder.length} / ${round.items.length} ranked`;
  const submitBtn = document.getElementById('rank-submit');
  if (submitBtn) submitBtn.disabled = S.rankMyOrder.length !== round.items.length;
}

function tapRankItem(i) {
  const round = RANK_ROUNDS[S.rankCurrentIndex];
  const pos = S.rankMyOrder.indexOf(i);
  if (pos !== -1) S.rankMyOrder.splice(pos, 1);
  else if (S.rankMyOrder.length < round.items.length) S.rankMyOrder.push(i);
  const itemsEl = document.getElementById('rank-items');
  if (itemsEl) itemsEl.innerHTML = renderRankItems();
  updateRankProgress();
}

async function submitRankAnswer() {
  const round = RANK_ROUNDS[S.rankCurrentIndex];
  const nameEl = document.getElementById('rank-name');
  const msg    = document.getElementById('rank-msg');
  const name = shortenName(nameEl.value.trim());
  if (!name) { msg.textContent = 'Enter your name first.'; msg.style.color = 'var(--danger)'; return; }
  if (S.rankMyOrder.length !== round.items.length) { msg.textContent = 'Tap every item to rank it before submitting.'; msg.style.color = 'var(--danger)'; return; }
  const db = getDB();
  if (!db) { msg.textContent = 'Could not connect — try again.'; msg.style.color = 'var(--danger)'; return; }
  try {
    localStorage.setItem('hm_student_name', name);
    const docId = `${S.rankCurrentIndex}_${slugifyName(name)}`;
    await db.collection('hm_rank_answers').doc(docId).set({ name, ranking: S.rankMyOrder, roundIndex: S.rankCurrentIndex, createdAt: Date.now() });
    msg.textContent = '✅ Ranking submitted! Want to change it? Re-tap the items, then submit again.';
    msg.style.color = 'var(--success)';
  } catch (e) {
    msg.textContent = 'Could not save: ' + e.message;
    msg.style.color = 'var(--danger)';
  }
}

async function advanceRankRound(delta) {
  const db = getDB();
  if (!db) return;
  const next = Math.max(0, Math.min(S.rankCurrentIndex + delta, RANK_ROUNDS.length - 1));
  await db.collection('hm_rank_state').doc('current').set({ index: next, updatedAt: Date.now() });
}

async function clearRankAnswers() {
  if (!confirm('Clear all Rank It submissions (every round)? Do this between class periods.')) return;
  const db = getDB();
  if (!db) return;
  const snap = await db.collection('hm_rank_answers').get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

// ── ICEBREAKER: Human Bingo (get up and learn names) ────────────
const BINGO_PROMPTS = [
  'Has a pet at home',
  'Plays a musical instrument',
  'Speaks more than one language',
  'Has an older sibling',
  'Has traveled outside the U.S.',
  'Was born in a different state',
  'Plays a sport',
  'Has the same favorite food as you',
  'Has never broken a bone',
  'Has read a book for fun, not for school, in the last month',
  'Has met someone famous',
  'Can whistle',
  'Has been to a concert',
  'Watched the same movie as you this year',
  'Wants to visit Japan',
  'Has more than 2 siblings',
  'Has a summer birthday',
  'Is left-handed',
  'Has the same shoe size as you',
  'Has a job outside of school',
  'Can do a cartwheel',
  'Has been camping',
  'Prefers texts over calls',
  'Has curly hair',
  'Has gone viral on social media before (even just with friends)',
  'Wants to work in media or broadcasting someday',
  'Has edited a video before',
  'Can name their favorite podcast without hesitating',
  'Can do an impression of someone',
  'Has a driver’s license',
  'Has a Snapchat or texting streak going 100+ days',
  'Plays video games competitively',
  'Has the same birthday month as you',
  'Has been in a school dance',
  'Can solve a Rubik’s Cube',
  'Has had a part in a play or musical',
  'Has run a mile in under 8 minutes',
  'Has more than one job',
  'Can name their top artist from Spotify Wrapped this year',
  'Has never had a cavity',
  'Knows their order at a fast food drive-thru by heart, without looking at the menu',
  'Has worked (or currently works) a fast food job',
  'Would pick Chick-fil-A over any other fast food',
  'Has tried a fast food item that got discontinued',
  'Has binge-watched an entire show in one day',
  'Plays Fortnite, Roblox, or another online game',
  'Has a water bottle covered in stickers',
  'Uses ChatGPT or another AI tool for homework',
  'Knows their Myers-Briggs personality type or Zodiac sign by heart',
  'Has more than 10,000 photos on their phone',
];
const BINGO_SIZE = 5;
const BINGO_CENTER = Math.floor((BINGO_SIZE * BINGO_SIZE) / 2);
const BINGO_CARD_SLOTS = BINGO_SIZE * BINGO_SIZE - 1; // 24 prompt squares, center is free

function shuffledBingoOrder() {
  const order = BINGO_PROMPTS.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const picked = order.slice(0, BINGO_CARD_SLOTS);
  try { localStorage.setItem('hm_bingo_order', JSON.stringify(picked)); } catch (e) {}
  return picked;
}

function loadBingoState() {
  try {
    const order = JSON.parse(localStorage.getItem('hm_bingo_order') || 'null');
    S.bingoOrder = (Array.isArray(order) && order.length === BINGO_CARD_SLOTS) ? order : shuffledBingoOrder();
    const filled = JSON.parse(localStorage.getItem('hm_bingo_filled') || '{}');
    S.bingoFilled = (filled && typeof filled === 'object') ? filled : {};
    S.bingoWon = localStorage.getItem('hm_bingo_won') === '1';
  } catch (e) {
    S.bingoOrder = shuffledBingoOrder();
    S.bingoFilled = {};
    S.bingoWon = false;
  }
}

function loadBingoGame() {
  loadBingoState();
  loadBingoWinners();
}

function loadBingoWinners() {
  const db = getDB();
  if (!db) return;
  if (S.bingoWinnersUnsub) { S.bingoWinnersUnsub(); S.bingoWinnersUnsub = null; }
  S.bingoWinnersUnsub = db.collection('hm_bingo_winners').onSnapshot(snap => {
    S.bingoWinners = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    const wall = document.getElementById('bingo-winners-wall');
    if (wall) wall.innerHTML = renderBingoWinners();
    const count = document.getElementById('bingo-winners-count');
    if (count) count.textContent = S.bingoWinners.length;
  }, err => console.error('bingo winners snapshot error', err));
}

function renderBingoWinners() {
  if (!S.bingoWinners.length) return `<p class="dim" style="font-size:0.85rem">Nobody's gotten BINGO yet...</p>`;
  return `<div class="bingo-winners">` + S.bingoWinners.map(w => `<span class="bingo-winner-pill">🎉 ${esc(w.name)}</span>`).join('') + `</div>`;
}

function bingoPromptForPos(pos) {
  if (pos === BINGO_CENTER) return null;
  let slot = 0;
  for (let p = 0; p < pos; p++) if (p !== BINGO_CENTER) slot++;
  return BINGO_PROMPTS[S.bingoOrder[slot]];
}

function renderBingoGrid() {
  const n = BINGO_SIZE;
  let rows = '';
  for (let r = 0; r < n; r++) {
    let cells = '';
    for (let c = 0; c < n; c++) {
      const pos = r * n + c;
      if (pos === BINGO_CENTER) {
        cells += `<div class="bingo-cell bingo-free filled"><span class="bingo-cell-name">FREE</span></div>`;
        continue;
      }
      const prompt = bingoPromptForPos(pos);
      const raw = S.bingoFilled[pos];
      const entry = raw ? (typeof raw === 'string' ? { name: raw } : raw) : null;
      if (S.bingoActive === pos) {
        cells += `
          <div class="bingo-cell bingo-cell-active">
            <span class="bingo-cell-prompt">${esc(prompt)}</span>
            <input type="text" class="bingo-fill-input" id="bingo-fill-input" data-bingo-pos="${pos}" placeholder="Who matches this?" value="${esc(entry ? entry.name : '')}">
            <div class="bingo-fill-actions">
              <button type="button" class="bingo-fill-save" data-bingo-pos="${pos}">✓ Save</button>
              <button type="button" class="bingo-fill-cancel">✕</button>
            </div>
          </div>`;
        continue;
      }
      cells += `
        <button class="bingo-cell ${entry ? 'filled' : ''}" data-bingo-pos="${pos}">
          ${entry
            ? `<span class="bingo-cell-name">${esc(entry.name)}</span>`
            : `<span class="bingo-cell-prompt">${esc(prompt)}</span>`}
        </button>`;
    }
    rows += `<div class="bingo-row">${cells}</div>`;
  }
  return `<div class="bingo-grid">${rows}</div>`;
}

function checkBingoWin() {
  const n = BINGO_SIZE;
  const has = (r, c) => { const p = r * n + c; return p === BINGO_CENTER || !!S.bingoFilled[p]; };
  for (let r = 0; r < n; r++) if ([...Array(n).keys()].every(c => has(r, c))) return true;
  for (let c = 0; c < n; c++) if ([...Array(n).keys()].every(r => has(r, c))) return true;
  if ([...Array(n).keys()].every(i => has(i, i))) return true;
  if ([...Array(n).keys()].every(i => has(i, n - 1 - i))) return true;
  return false;
}

function openBingoCell(pos) {
  S.bingoActive = pos;
  render();
  const input = document.getElementById('bingo-fill-input');
  if (input) { input.focus(); input.select(); }
}

function closeBingoCell() {
  S.bingoActive = null;
  render();
}

function saveBingoCell(pos) {
  const input = document.getElementById('bingo-fill-input');
  const name = input ? input.value.trim() : '';
  if (!name) { closeBingoCell(); return; }
  S.bingoFilled[pos] = { name };
  try { localStorage.setItem('hm_bingo_filled', JSON.stringify(S.bingoFilled)); } catch (e) {}
  S.bingoActive = null;
  if (!S.bingoWon && checkBingoWin()) {
    S.bingoWon = true;
    try { localStorage.setItem('hm_bingo_won', '1'); } catch (e) {}
    submitBingoWin();
  }
  render();
}

async function submitBingoWin() {
  const db = getDB();
  if (!db) return;
  const nameEl = document.getElementById('bingo-name');
  const name = shortenName((nameEl && nameEl.value.trim()) || localStorage.getItem('hm_student_name') || 'Someone');
  try {
    localStorage.setItem('hm_student_name', name);
    await db.collection('hm_bingo_winners').add({ name, createdAt: Date.now() });
  } catch (e) { console.error('bingo winner submit error', e); }
}

function resetBingoCard() {
  if (!confirm('Start a new BINGO card? This clears your current progress.')) return;
  S.bingoOrder = shuffledBingoOrder();
  S.bingoFilled = {};
  S.bingoActive = null;
  S.bingoWon = false;
  try {
    localStorage.setItem('hm_bingo_filled', '{}');
    localStorage.removeItem('hm_bingo_won');
  } catch (e) {}
  render();
}

async function clearBingoWinners() {
  if (!confirm('Clear the BINGO winners list for the next class?')) return;
  const db = getDB();
  if (!db) return;
  const snap = await db.collection('hm_bingo_winners').get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

const MATCH_QUESTIONS = [
  "What's a hobby or activity you do outside of school?",
  "What's your comfort food — the thing you always crave?",
  "If you could travel anywhere, where would you go and why?",
  "What's a fun fact about you almost nobody knows?",
  "What's your favorite way to spend a free Saturday?",
  "What show or movie could you rewatch a hundred times?",
  "What's a skill you have that might surprise people?",
  "What's the best trip you've ever been on?",
  "What's a food you refuse to eat?",
  "If you had a whole day with no responsibilities, what would you do?",
  "What's your favorite season and why?",
  "What's a song you know all the words to?",
  "What's something you're really good at?",
  "What's a goal you're working toward right now?",
  "What pet do you have, or what pet would you want?",
  "What's your go-to order at a restaurant?",
  "What's a place you've lived or visited that stuck with you?",
  "What's something you collect, or used to collect?",
  "What's your favorite holiday and why?",
  "If you could have any superpower, what would it be?",
  "What's a game — video, board, or otherwise — you love?",
  "What's something on your bucket list?",
  "What's the last thing that made you laugh really hard?",
  "What's a talent you have that isn't obvious?",
  "What's your favorite subject in school and why?",
  "What's a movie you could quote start to finish?",
  "What's the first concert or live event you ever went to?",
  "What's a food you could eat every day and never get tired of?",
  "What's your favorite thing about the town you grew up in?",
  "What's a sport you play or love watching?",
  "What's your dream job, realistically or not?",
  "What's the last book you actually finished?",
  "What's a nickname you've had?",
  "What's your favorite app on your phone?",
  "What's a chore you actually don't mind doing?",
  "What's the weirdest food combination you actually enjoy?",
  "What's a memory from elementary school you still think about?",
  "What's your favorite thing to do with your family?",
  "What's a language you'd love to learn?",
  "What's your favorite type of music?",
  "What's something you're proud of that isn't school-related?",
  "What's a habit you're trying to build or break?",
  "If you won the lottery tomorrow, what's the first thing you'd buy?",
  "What's your favorite type of weather?",
  "What's a TV show you think everyone should watch?",
  "What's the most useless talent you have?",
  "What's your favorite thing about summer?",
  "What's a sport or activity you'd want to try if you weren't afraid to fail?",
  "What's your comfort show — the one you watch when you're stressed?",
  "What's a food from another culture you love?",
  "What's the last thing you binge-watched?",
  "What's your favorite way to relax after a long day?",
  "What's a class you wish the school offered?",
  "What's your ideal way to celebrate your birthday?",
  "What's the best gift you've ever gotten?",
  "What's a fear you have that other people find funny?",
  "What's your favorite thing about your family?",
  "What's a place in your house or room that feels most \"you\"?",
  "What's a food you loved as a little kid that you still love now?",
  "What's something you learned recently that stuck with you?",
  "What's your favorite thing to do with friends on a weekend?",
  "What's a hobby you'd want to pick up if you had more time?",
  "What's your favorite kind of movie — action, comedy, horror, something else?",
  "What's a place you've always wanted to visit but haven't?",
  "What's your go-to snack?",
  "What's something you do that always puts you in a good mood?",
  "What's the best piece of advice someone's given you?",
  "What's your favorite thing about this school?",
  "What's a sports team you root for, or one you love to hate?",
  "What's the last thing you got really excited about?",
  "What's a song that instantly puts you in a good mood?",
  "What's something you're better at than you'd expect?",
  "What's your favorite family tradition?",
  "What's a video game or app you've spent way too much time on?",
  "What's something you wish more people knew about you?",
  "What's your favorite thing to do when it's raining outside?",
  "What's the most spontaneous thing you've ever done?",
  "What's a food everyone else seems to love that you just don't get?",
  "What's your favorite way to spend time outdoors?",
  "What's something you're looking forward to this year?",
  "What's a small thing that always makes your day better?",
  "What's your favorite thing to cook or bake, if you cook at all?",
  "What's the last show or movie that made you cry, or almost?",
  "What's a job you'd never want to have?",
  "What's your favorite thing about where you live?",
  "What's a hidden talent someone in your family has?",
  "What's your favorite way to unwind after school?",
  "What's a place that feels like home to you, besides your house?",
  "What's the best advice you'd give to a freshman?",
  "What's your favorite thing to do over summer break?",
  "What's a food you'd want to eat for your last meal?",
  "What's something you've gotten better at over the last year?",
  "What's your favorite thing about weekends?",
  "What's a movie or show you and your family watch together?",
  "What's the funniest thing that's happened to you at school?",
  "What's your favorite thing to listen to on a car ride?",
  "What's a place you'd love to live someday?",
  "What's your favorite thing about the current season we're in?",
  "What's something you always have with you?",
  "What's a fun fact about your name — how you got it, or what it means?",
];

const MATCH_TIMER_SECONDS = 90;

function loadMatchGame() {
  const db = getDB();
  if (!db) return;
  if (S.matchStateUnsub) { S.matchStateUnsub(); S.matchStateUnsub = null; }
  S.matchStateUnsub = db.collection('hm_match_state').doc('current').onSnapshot(doc => {
    const data = doc.exists ? doc.data() : { index: 0, timerStartedAt: null };
    const idx = Number.isInteger(data.index) ? data.index : 0;
    S.matchCurrentIndex = Math.max(0, Math.min(idx, MATCH_QUESTIONS.length - 1));
    S.matchTimerStartedAt = data.timerStartedAt || null;
    document.querySelectorAll('.match-question-text').forEach(el => { el.textContent = MATCH_QUESTIONS[S.matchCurrentIndex]; });
    const posEl = document.getElementById('match-position');
    if (posEl) posEl.textContent = `${S.matchCurrentIndex + 1} / ${MATCH_QUESTIONS.length}`;
    startMatchTick();
  }, err => console.error('match state snapshot error', err));
}

function formatMatchTime(secs) {
  const m = Math.floor(secs / 60);
  const s = (secs % 60).toString().padStart(2, '0');
  return `⏱️ ${m}:${s}`;
}

function startMatchTick() {
  if (S.matchTickHandle) { clearInterval(S.matchTickHandle); S.matchTickHandle = null; }
  updateMatchTimerDisplay();
  S.matchTickHandle = setInterval(updateMatchTimerDisplay, 1000);
}

function updateMatchTimerDisplay() {
  const els = document.querySelectorAll('.match-timer');
  if (!els.length) return;
  let text = formatMatchTime(MATCH_TIMER_SECONDS);
  if (S.matchTimerStartedAt) {
    const remaining = Math.max(0, MATCH_TIMER_SECONDS - Math.floor((Date.now() - S.matchTimerStartedAt) / 1000));
    text = remaining > 0 ? formatMatchTime(remaining) : '⏰ Time! Switch partners';
  }
  els.forEach(el => { el.textContent = text; });
}

async function advanceMatchQuestion(delta) {
  const db = getDB();
  if (!db) return;
  const next = Math.max(0, Math.min(S.matchCurrentIndex + delta, MATCH_QUESTIONS.length - 1));
  await db.collection('hm_match_state').doc('current').set({ index: next, timerStartedAt: null, updatedAt: Date.now() });
}

async function startMatchTimer() {
  const db = getDB();
  if (!db) return;
  await db.collection('hm_match_state').doc('current').set({ index: S.matchCurrentIndex, timerStartedAt: Date.now(), updatedAt: Date.now() });
}

// ── ICEBREAKER: Rapid Fire Questions ─────────────────────────────
const RAPID_TOPICS = [
  'food','snack','dessert','ice cream flavor','candy','fast food restaurant','pizza topping','breakfast food','cereal','fruit',
  'vegetable','soda','juice flavor','milkshake flavor','donut flavor','cookie','cake flavor','pie flavor','smoothie flavor','chip flavor',
  'candy bar','gum flavor','popsicle flavor','slushie flavor','coffee drink','tea flavor','energy drink','sandwich','burger topping','taco filling',
  'soup','salad dressing','condiment','pasta dish','Mexican food','Italian food','Chinese food','Japanese food','Indian food','brunch food',
  'movie','TV show','song','artist or band','book','video game','mobile game','board game','card game','superhero',
  'superpower','Disney movie','cartoon','anime','YouTuber','podcast','app','social media platform','streaming service','video game genre',
  'movie genre','book genre','music genre','decade of music','game show','reality show','cooking show','talent show','holiday movie','Halloween costume idea',
  'meme format','emoji','GIF reaction','text abbreviation','video game character','movie villain','movie hero','cartoon from when you were little','arcade game','karaoke song',
  'school subject','elective','extracurricular activity','club','day of the week','month','season','holiday','way to spend a Saturday','way to relax',
  'hobby','class period','school lunch','class this semester','school supply','way to take notes','way to study','place to study','background noise while studying','subject to talk about',
  'sport to play','sport to watch','sports team','Olympic event','way to exercise','workout','dance style','instrument','language to learn','country to visit',
  'city to visit','vacation spot','mode of transportation','season for a birthday','holiday tradition','thing to do on a snow day','summer activity','winter activity','way to spend a rainy day','road trip snack',
  'animal','pet','farm animal','ocean animal','bird','zoo animal','dinosaur','mythical creature','flower','tree',
  'color','color combo','season for clothes','type of shoes','type of jacket','accessory','phone case color','backpack color','notebook color','pen color',
  'car','car color','gaming console','phone brand','laptop brand','word','number','letter of the alphabet','punctuation mark','day of the school week',
  'holiday scent','candle scent','ice cream topping','sundae topping','milkshake topping','pizza style','way to eat pizza','drink at a restaurant','coffee shop order','fast food side',
  'drive-thru order','movie theater snack','popcorn topping','candy at the movies','arcade prize','carnival game','fair food','amusement park ride','roller coaster','water park ride',
  'pool game','beach activity','lake activity','camping activity','hiking snack','sleepover snack','sleepover movie','comfort food','comfort show','guilty pleasure song',
  'throwback song','car ride song','alarm sound','thing to eat with peanut butter','lunch food','dinner food','midnight snack','way to wake up','way to fall asleep','sound to fall asleep to',
  'holiday for gifts','holiday for food','holiday for costumes','way to celebrate a birthday','birthday cake flavor','gift to receive','gift to give','way to spend a day off school','thing to binge-watch','thing to collect',
  'way to spend free time after school','thing to do with friends','thing to do alone','weekend breakfast','weekend activity','Friday night activity','Sunday activity','thing about fall','thing about summer','thing about winter',
  'thing about spring','way to decorate for the holidays','Thanksgiving side dish','Christmas song','Halloween candy','4th of July activity',"New Year's tradition",'Valentine\'s Day treat','spring break activity','dream summer job',
  'subject to daydream about','thing to do during a free period','way to procrastinate','hype song','song for getting ready in the morning','song to sing in the shower','thing to do on a road trip','road trip game','way to pass time on a long car ride','app notification sound',
  'way to greet someone','handshake style','way to say goodbye','nickname style','way to celebrate a win','pump-up move before a game','warm-up song','thing to yell during a game','mascot','school color',
  'thing about your room','poster you\'d hang up','sticker to put on a laptop','font to use when texting','app you\'d delete if you had to pick one','thing you always have in your bag','thing you always have in your pocket','snack for game night','drink for a hot day','drink for a cold day',
];
const RAPID_EXTRA = [
  'Say the first word that comes to mind right now.',
  'Name a song stuck in your head today.',
  "What's the last thing you searched on your phone?",
  "Say your phone's battery percentage right now.",
  "Name a food you've never tried but want to.",
  "What's the wallpaper on your phone right now?",
  "Name a show you're currently watching.",
  'Say the last thing you ate.',
  "What's a hidden talent you have?",
  'Name a place that feels like home to you.',
  'Say your lucky number, if you have one.',
  "What's your zodiac sign?",
  'Name a food combo people think is weird but you love.',
  "What's the last thing you binge-watched?",
  'Say a word you use way too much.',
  "What's your ringtone or alarm sound?",
  "Name a nickname you've had.",
  'Say your dream job in one word.',
  "What's a talent you have that's basically useless?",
  "Name a place you've never been but want to visit.",
  'Say the app you spend the most time on.',
  "What's the last thing you Googled?",
  'Name a random fact you know.',
  'Say your go-to emoji when texting.',
  "What's a song you know every word to?",
  "Name something you're weirdly good at.",
  'Say the last show or movie you rewatched.',
  "What's your comfort food when you're stressed?",
  "Name a class you'd invent if you could.",
  'Say the last concert or show you went to (or wish you did).',
  "What's a fear you have that sounds silly out loud?",
  'Name a smell that reminds you of home.',
  "Say a skill you'd want to learn instantly.",
  "What's the weirdest thing in your backpack right now?",
  'Name a food you could eat every single day.',
  'Say your go-to excuse for being late.',
  "What's a show everyone loves that you just don't get?",
  'Name your go-to karaoke song.',
  'Say the last thing that made you laugh.',
  "What's a small thing that instantly makes your day better?",
  'Name a place you go to think or relax.',
  'Say the first app you check in the morning.',
  "What's your go-to order at a coffee shop?",
  'Name something on your bucket list.',
  'Say a movie you could rewatch forever.',
  "What's the best gift you've ever gotten?",
  "Name a subject you wish you were better at.",
  'Say the last new food you tried.',
  "What's your go-to study snack?",
  'Name a song that instantly puts you in a good mood.',
];
const RAPID_QUESTIONS = RAPID_TOPICS.map(t => `What's your favorite ${t}?`).concat(RAPID_EXTRA);

function loadRapidGame() {
  const db = getDB();
  if (!db) return;
  if (S.rapidStateUnsub) { S.rapidStateUnsub(); S.rapidStateUnsub = null; }
  S.rapidStateUnsub = db.collection('hm_rapid_state').doc('current').onSnapshot(doc => {
    const data = doc.exists ? doc.data() : {};
    S.rapidStage = ['idle', 'name', 'question'].includes(data.stage) ? data.stage : 'idle';
    S.rapidCurrentName = data.currentName || '';
    S.rapidQuestionIndex = Number.isInteger(data.questionIndex) ? data.questionIndex : null;
    S.rapidUsedNames = Array.isArray(data.usedNames) ? data.usedNames : [];
    render();
  }, err => console.error('rapid state snapshot error', err));
  loadRapidSignups();
}

function loadRapidSignups() {
  const db = getDB();
  if (!db) return;
  if (S.rapidSignupsUnsub) { S.rapidSignupsUnsub(); S.rapidSignupsUnsub = null; }
  S.rapidSignupsUnsub = db.collection('hm_rapid_signups').onSnapshot(snap => {
    S.rapidSignups = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    document.querySelectorAll('.rapid-signup-count').forEach(el => { el.textContent = S.rapidSignups.length; });
    const list = document.getElementById('rapid-signup-list');
    if (list) list.innerHTML = renderRapidSignupList();
  }, err => console.error('rapid signups snapshot error', err));
}

function renderRapidSignupList() {
  if (!S.rapidSignups.length) return `<p class="dim" style="font-size:0.85rem">No one's signed up yet.</p>`;
  return `<div class="bingo-winners">` + S.rapidSignups.map(s =>
    `<span class="bingo-winner-pill ${S.rapidUsedNames.includes(s.name) ? 'rapid-pill-used' : ''}">${esc(s.name)}</span>`
  ).join('') + `</div>`;
}

async function submitRapidSignup() {
  const nameEl = document.getElementById('rapid-name');
  const msg    = document.getElementById('rapid-signup-msg');
  const name = shortenName(nameEl.value.trim());
  if (!name) { msg.textContent = 'Enter your name first.'; msg.style.color = 'var(--danger)'; return; }
  const db = getDB();
  if (!db) { msg.textContent = 'Could not connect — try again.'; msg.style.color = 'var(--danger)'; return; }
  try {
    localStorage.setItem('hm_student_name', name);
    await db.collection('hm_rapid_signups').doc(slugifyName(name)).set({ name, createdAt: Date.now() });
    msg.textContent = "✅ You're signed up! Wait for your name to come up on the board.";
    msg.style.color = 'var(--success)';
  } catch (e) {
    msg.textContent = 'Could not save: ' + e.message;
    msg.style.color = 'var(--danger)';
  }
}

async function pickRapidName() {
  const db = getDB();
  if (!db) return;
  ['rapid-msg', 'rapid-board-msg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  if (!S.rapidSignups.length) {
    ['rapid-msg', 'rapid-board-msg'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = 'No one has signed up yet — have students add their names first.'; el.style.color = 'var(--danger)'; }
    });
    return;
  }
  let remaining = S.rapidSignups.filter(s => !S.rapidUsedNames.includes(s.name));
  let usedNames = S.rapidUsedNames;
  if (!remaining.length) { remaining = S.rapidSignups; usedNames = []; }
  const picked = remaining[Math.floor(Math.random() * remaining.length)];
  await db.collection('hm_rapid_state').doc('current').set({
    stage: 'name',
    currentName: picked.name,
    questionIndex: null,
    usedNames: [...usedNames, picked.name],
    updatedAt: Date.now(),
  });
}

async function pickRapidQuestion() {
  const db = getDB();
  if (!db) return;
  const idx = Math.floor(Math.random() * RAPID_QUESTIONS.length);
  await db.collection('hm_rapid_state').doc('current').set({
    stage: 'question',
    currentName: S.rapidCurrentName,
    questionIndex: idx,
    usedNames: S.rapidUsedNames,
    updatedAt: Date.now(),
  });
}

async function resetRapidRound() {
  const db = getDB();
  if (!db) return;
  await db.collection('hm_rapid_state').doc('current').set({ stage: 'idle', currentName: '', questionIndex: null, usedNames: [], updatedAt: Date.now() });
}

async function clearRapidSignups() {
  if (!confirm('Clear the Rapid Fire sign-up list and reset the round? Do this between class periods.')) return;
  const db = getDB();
  if (!db) return;
  const snap = await db.collection('hm_rapid_signups').get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  await db.collection('hm_rapid_state').doc('current').set({ stage: 'idle', currentName: '', questionIndex: null, usedNames: [], updatedAt: Date.now() });
}

const ICEBREAKER_GAMES = [
  { key: 'truths', icon: '🧊', title: 'Two Truths and a Lie', sub: "Add yourself to the wall, then mingle and guess everyone else's lie in person." },
  { key: 'qa',     icon: '🙋', title: 'Get to Know You',      sub: "Answer today's question, then compare with classmates in person." },
  { key: 'tot',    icon: '⚖️', title: 'This or That',         sub: "Vote on today's either/or, watch the live results, then find someone on the other side." },
  { key: 'bingo',  icon: '🏃', title: 'Human Bingo',          sub: "Get up, walk around, and fill your card by learning classmates' names." },
  { key: 'wyr',    icon: '🤔', title: 'Would You Rather',     sub: "Vote on today's dilemma, watch the live results, then find someone on the other side." },
  { key: 'speed',  icon: '⏱️', title: 'Speed Meet',           sub: "Grab a nearby partner and talk it out before the timer runs out." },
  { key: 'common', icon: '🧭', title: 'Common Ground',        sub: "Answer today's category, then go find your group in person." },
  { key: 'rank',   icon: '🏅', title: 'Rank It',               sub: "Tap to rank today's list, then compare with the class results." },
  { key: 'match',  icon: '🎴', title: 'Find Your Match',      sub: "Everyone answers the board's question with a partner — then switch and find someone new." },
  { key: 'rapid',  icon: '⚡', title: 'Rapid Fire Questions', sub: "Sign up, then the board randomly picks a name and a quick question — 300 to choose from." },
];

function renderIcebreakerMenu() {
  const cards = ICEBREAKER_GAMES.map(g => `
    <button class="ib-menu-card" data-game="${g.key}">
      <div class="ib-menu-card-icon">${g.icon}</div>
      <div class="ib-menu-card-title">${esc(g.title)}</div>
      <div class="ib-menu-card-sub">${esc(g.sub)}</div>
    </button>`).join('');
  return `
    ${navBar('icebreaker')}
    <div class="class-page">
      <div class="class-header">
        <div class="class-header-icon">🧊</div>
        <div>
          <h1>Icebreakers</h1>
          <p>Pick a game to get the class talking.</p>
        </div>
      </div>
      <div class="ib-menu-grid">${cards}</div>
    </div>`;
}

function renderIcebreaker() {
  const game = S.icebreakerGame;
  if (game === 'menu') return renderIcebreakerMenu();

  const truthsSection = `
      <section class="card" style="margin-bottom:20px">
        <h2>✏️ Add Yourself to the Wall</h2>
        <p class="cal-section-sub">Write two true statements about yourself and one lie — the more specific and surprising, the better. Skip generic stuff like "I like pizza"; go for a real story with details (who, where, when) so people have to actually guess. The wall shuffles the order so the lie isn't always listed last.</p>
        <div class="form-group">
          <label>First and Last Name</label>
          <input id="ib-name" type="text" placeholder="First and last name" value="${esc(localStorage.getItem('hm_student_name') || '')}">
        </div>
        <div class="form-group">
          <label>Truth 1</label>
          <input id="ib-truth1" type="text" placeholder="e.g. I met Patrick Mahomes at an airport in Dallas">
        </div>
        <div class="form-group">
          <label>Truth 2</label>
          <input id="ib-truth2" type="text" placeholder="e.g. I broke my wrist falling off a trampoline at age 9">
        </div>
        <div class="form-group">
          <label>The Lie</label>
          <input id="ib-lie" type="text" placeholder="e.g. I once swam across a lake to win a $50 bet">
        </div>
        <button class="btn-primary" id="ib-submit">🧊 Add Me to the Wall</button>
        <p id="ib-msg" class="dim" style="font-size:0.85rem;margin-top:10px"></p>
      </section>

      <section class="card">
        ${S.teacherMode ? `
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px">
          <h2 style="margin:0">🧑‍🤝‍🧑 The Wall (<span id="icebreaker-count">${S.icebreakerEntries.length}</span>)</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a href="?board=icebreaker&game=truths" target="_blank" class="btn-secondary" style="font-size:0.78rem;padding:4px 12px;text-decoration:none">🖥️ Open Board View</a>
            <button class="btn-secondary" id="ib-clear" style="font-size:0.78rem;padding:4px 12px">🔄 Clear Wall for Next Class</button>
          </div>
        </div>
        <p class="cal-section-sub">Click a name to bring up all three statements. Reveal each one, then mark it explained once the class has heard the story. Open the board view on the classroom TV to run this from the front of the room.</p>
        <div id="icebreaker-wall">${renderIcebreakerWallCards(S.icebreakerEntries)}</div>` : `
        <h2 style="margin:0 0 4px">🔒 The Wall</h2>
        <p class="cal-section-sub" style="margin:0">Your teacher will reveal everyone's truths and lies on the board up front — no peeking here.</p>`}
      </section>`;

  const qaSection = `
      <section class="card" style="margin-bottom:20px">
        <h2>❓ Today's Question</h2>
        <p class="qa-question-text">${esc(S.qaCustomText || QA_QUESTIONS[S.qaCurrentIndex])}</p>
        ${S.teacherMode ? `
        <div style="display:flex;align-items:center;gap:10px;margin:10px 0 4px">
          <button class="btn-secondary" id="qa-prev" style="font-size:0.78rem;padding:4px 12px">← Prev</button>
          <span class="dim" id="qa-position" style="font-size:0.8rem">${S.qaCurrentIndex + 1} / ${QA_QUESTIONS.length}</span>
          <button class="btn-secondary" id="qa-next" style="font-size:0.78rem;padding:4px 12px">Next →</button>
        </div>` : ''}
        <div class="form-group">
          <label>First and Last Name</label>
          <input id="qa-name" type="text" placeholder="First and last name" value="${esc(localStorage.getItem('hm_student_name') || '')}">
        </div>
        <div class="form-group">
          <label>Your Answer</label>
          <input id="qa-answer" type="text" placeholder="Type your answer...">
        </div>
        <button class="btn-primary" id="qa-submit">🙋 Add My Answer</button>
        <p id="qa-msg" class="dim" style="font-size:0.85rem;margin-top:10px"></p>
      </section>

      <section class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px">
          <h2 style="margin:0">🙋 Answers (<span id="qa-count">${S.qaAnswers.length}</span>)</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a href="?board=icebreaker&game=qa" target="_blank" class="btn-secondary" style="font-size:0.78rem;padding:4px 12px;text-decoration:none">🖥️ Open Board View</a>
            ${S.teacherMode ? `<button class="btn-secondary" id="qa-clear" style="font-size:0.78rem;padding:4px 12px">🔄 Clear All Answers</button>` : ''}
          </div>
        </div>
        <p class="cal-section-sub">See what everyone said, then go find someone and ask them to explain their answer.</p>
        <div id="qa-wall">${renderQaWallCards(S.qaAnswers)}</div>
      </section>`;

  const totQ = THIS_OR_THAT_QUESTIONS[S.totCurrentIndex];
  const totSection = `
      <section class="card" style="margin-bottom:20px">
        <h2>⚖️ This or That</h2>
        ${S.teacherMode ? `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">
          <button class="btn-secondary" id="tot-prev" style="font-size:0.78rem;padding:4px 12px">← Prev</button>
          <span class="dim" id="tot-position" style="font-size:0.8rem">${S.totCurrentIndex + 1} / ${THIS_OR_THAT_QUESTIONS.length}</span>
          <button class="btn-secondary" id="tot-next" style="font-size:0.78rem;padding:4px 12px">Next →</button>
          ${S.totStage === 'poll' ? `<button class="btn-secondary" id="tot-start-div" style="font-size:0.78rem;padding:4px 12px">🔀 Start Division Round</button>` : ''}
          ${S.totStage === 'div' ? `<button class="btn-secondary" id="tot-reveal-share" style="font-size:0.78rem;padding:4px 12px">💬 Reveal Share Question</button><button class="btn-secondary" id="tot-back-poll" style="font-size:0.78rem;padding:4px 12px">↺ Back to Poll</button>` : ''}
          ${S.totStage === 'share' ? `<button class="btn-secondary" id="tot-back-poll" style="font-size:0.78rem;padding:4px 12px">↺ Back to Poll</button>` : ''}
        </div>` : ''}
        <div class="form-group">
          <label>First and Last Name</label>
          <input id="tot-name" type="text" placeholder="First and last name" value="${esc(localStorage.getItem('hm_student_name') || '')}">
        </div>
        ${S.totStage === 'poll' ? `
        <div class="tot-choices">
          <button class="tot-choice-btn ${S.totMyChoice === 'a' ? 'active' : ''}" data-choice="a"><span class="tot-question-a">${esc(totQ.a)}</span></button>
          <div class="tot-vs">vs</div>
          <button class="tot-choice-btn ${S.totMyChoice === 'b' ? 'active' : ''}" data-choice="b"><span class="tot-question-b">${esc(totQ.b)}</span></button>
        </div>
        <p id="tot-msg" class="dim" style="font-size:0.85rem;margin-top:10px"></p>` : ''}
        ${S.totStage === 'div' ? renderTotDivStudentPanel() : ''}
        ${S.totStage === 'share' ? renderTotShareStudentPanel() : ''}
      </section>

      <section class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px">
          <h2 style="margin:0">${S.totStage === 'poll' ? '📊 Live Results' : S.totStage === 'div' ? '🔀 Division Round' : '💬 Group Discussion'}</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a href="?board=icebreaker&game=tot" target="_blank" class="btn-secondary" style="font-size:0.78rem;padding:4px 12px;text-decoration:none">🖥️ Open Board View</a>
            ${S.teacherMode ? `<button class="btn-secondary" id="tot-clear" style="font-size:0.78rem;padding:4px 12px">🔄 Clear All Votes</button>` : ''}
          </div>
        </div>
        ${S.totStage === 'poll' ? `
        <p class="cal-section-sub">Watch the class split live, then get into two groups based on your answer.</p>
        <div class="tot-poll">${renderTotPoll()}</div>` : ''}
        ${S.totStage === 'div' ? `<p class="cal-section-sub">Each team answers its own follow-up on this page, splitting into 4 final groups. Watch the board for the live breakdown.</p>` : ''}
        ${S.totStage === 'share' ? `<p class="cal-section-sub">Find your final group of classmates and talk through your group's question together.</p>` : ''}
      </section>`;

  const bingoSection = `
      <section class="card" style="margin-bottom:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px">
          <h2 style="margin:0">🏃 Human Bingo</h2>
          <button class="btn-secondary" id="bingo-reset" style="font-size:0.78rem;padding:4px 12px">🔄 New Card</button>
        </div>
        <p class="cal-section-sub">Get up and find a classmate who matches each square, then tap it, type their name, and jot down their answer so you can share it at the end. The center is a free space — get 5 in a row (across, down, or diagonal) to win!</p>
        <div class="form-group">
          <label>First and Last Name</label>
          <input id="bingo-name" type="text" placeholder="First and last name" value="${esc(localStorage.getItem('hm_student_name') || '')}">
        </div>
        ${S.bingoWon ? `<p class="bingo-won-banner">🎉 BINGO! You're on the board below.</p>` : ''}
        ${renderBingoGrid()}
      </section>

      <section class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px">
          <h2 style="margin:0">🎉 BINGO! (<span id="bingo-winners-count">${S.bingoWinners.length}</span>)</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a href="?board=icebreaker&game=bingo" target="_blank" class="btn-secondary" style="font-size:0.78rem;padding:4px 12px;text-decoration:none">🖥️ Open Board View</a>
            ${S.teacherMode ? `<button class="btn-secondary" id="bingo-clear" style="font-size:0.78rem;padding:4px 12px">🔄 Clear Winners</button>` : ''}
          </div>
        </div>
        <p class="cal-section-sub">First names to call BINGO show up here — everyone else is still racing to fill their card.</p>
        <div id="bingo-winners-wall">${renderBingoWinners()}</div>
      </section>`;

  const wyrQ = WYR_QUESTIONS[S.wyrCurrentIndex];
  const wyrSection = `
      <section class="card" style="margin-bottom:20px">
        <h2>🤔 Would You Rather</h2>
        ${S.teacherMode ? `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <button class="btn-secondary" id="wyr-prev" style="font-size:0.78rem;padding:4px 12px">← Prev</button>
          <span class="dim" id="wyr-position" style="font-size:0.8rem">${S.wyrCurrentIndex + 1} / ${WYR_QUESTIONS.length}</span>
          <button class="btn-secondary" id="wyr-next" style="font-size:0.78rem;padding:4px 12px">Next →</button>
        </div>` : ''}
        <div class="form-group">
          <label>First and Last Name</label>
          <input id="wyr-name" type="text" placeholder="First and last name" value="${esc(localStorage.getItem('hm_student_name') || '')}">
        </div>
        <div class="wyr-choices">
          <button class="wyr-choice-btn ${S.wyrMyChoice === 'a' ? 'active' : ''}" data-choice="a"><span class="wyr-question-a">${esc(wyrQ.a)}</span></button>
          <div class="wyr-vs">or</div>
          <button class="wyr-choice-btn ${S.wyrMyChoice === 'b' ? 'active' : ''}" data-choice="b"><span class="wyr-question-b">${esc(wyrQ.b)}</span></button>
        </div>
        <p id="wyr-msg" class="wyr-msg"></p>
      </section>

      <section class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px">
          <h2 style="margin:0">📊 Live Results</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a href="?board=icebreaker&game=wyr" target="_blank" class="btn-secondary" style="font-size:0.78rem;padding:4px 12px;text-decoration:none">🖥️ Open Board View</a>
            ${S.teacherMode ? `<button class="btn-secondary" id="wyr-clear" style="font-size:0.78rem;padding:4px 12px">🔄 Clear All Votes</button>` : ''}
          </div>
        </div>
        <p class="cal-section-sub">Watch the class split live, then go find someone who picked the other side and ask them why.</p>
        <div class="wyr-poll">${renderWyrPoll()}</div>
      </section>`;

  const speedSection = `
      <section class="card">
        <h2>⏱️ Speed Meet</h2>
        <p class="cal-section-sub">Find a partner nearby. When the timer starts, talk about the prompts below until time's up — then find a new partner for the next round.</p>
        ${S.teacherMode ? `
        <div style="display:flex;align-items:center;gap:10px;margin:10px 0 4px;flex-wrap:wrap">
          <button class="btn-secondary" id="speed-new" style="font-size:0.78rem;padding:4px 12px">🔀 New Question</button>
          <button class="btn-primary" id="speed-start-timer" style="font-size:0.78rem;padding:4px 12px">▶️ Start ${SPEED_TIMER_SECONDS}s Timer</button>
        </div>` : ''}
        <p class="speed-intro-text">${esc(SPEED_INTRO)}</p>
        <p class="speed-question-text">${esc(SPEED_QUESTIONS[S.speedIndex])}</p>
        <div class="speed-timer-display"><span class="speed-timer">⏱️ ${SPEED_TIMER_SECONDS}</span></div>
      </section>`;

  const commonCat = COMMON_GROUND_CATEGORIES[S.commonCurrentIndex];
  const commonSection = `
      <section class="card" style="margin-bottom:20px">
        <h2>🧭 Common Ground</h2>
        <p class="common-question-text qa-question-text">${esc(commonCat.q)}</p>
        ${S.teacherMode ? `
        <div style="display:flex;align-items:center;gap:10px;margin:10px 0 4px">
          <button class="btn-secondary" id="common-prev" style="font-size:0.78rem;padding:4px 12px">← Prev</button>
          <span class="dim" id="common-position" style="font-size:0.8rem">${S.commonCurrentIndex + 1} / ${COMMON_GROUND_CATEGORIES.length}</span>
          <button class="btn-secondary" id="common-next" style="font-size:0.78rem;padding:4px 12px">Next →</button>
        </div>` : ''}
        <div class="form-group">
          <label>First and Last Name</label>
          <input id="common-name" type="text" placeholder="First and last name" value="${esc(localStorage.getItem('hm_student_name') || '')}">
        </div>
        <div id="common-options" class="common-options">${renderCommonOptions()}</div>
        <p id="common-msg" class="dim" style="font-size:0.85rem;margin-top:10px"></p>
      </section>

      <section class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px">
          <h2 style="margin:0">🧑‍🤝‍🧑 Find Your Group</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a href="?board=icebreaker&game=common" target="_blank" class="btn-secondary" style="font-size:0.78rem;padding:4px 12px;text-decoration:none">🖥️ Open Board View</a>
            ${S.teacherMode ? `<button class="btn-secondary" id="common-clear" style="font-size:0.78rem;padding:4px 12px">🔄 Clear All Answers</button>` : ''}
          </div>
        </div>
        <p class="cal-section-sub">Pick your answer, then find and talk to someone in your group (or a different one!).</p>
        <div class="common-groups">${renderCommonGroups()}</div>
      </section>`;

  const rankRound = RANK_ROUNDS[S.rankCurrentIndex];
  const rankSection = `
      <section class="card" style="margin-bottom:20px">
        <h2 class="rank-round-title">${esc(rankRound.title)}</h2>
        ${S.teacherMode ? `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <button class="btn-secondary" id="rank-prev" style="font-size:0.78rem;padding:4px 12px">← Prev</button>
          <span class="dim" id="rank-position" style="font-size:0.8rem">${S.rankCurrentIndex + 1} / ${RANK_ROUNDS.length}</span>
          <button class="btn-secondary" id="rank-next" style="font-size:0.78rem;padding:4px 12px">Next →</button>
        </div>` : ''}
        <p class="cal-section-sub">Tap the items in order from your favorite to least favorite.</p>
        <div class="form-group">
          <label>First and Last Name</label>
          <input id="rank-name" type="text" placeholder="First and last name" value="${esc(localStorage.getItem('hm_student_name') || '')}">
        </div>
        <div id="rank-items" class="rank-items">${renderRankItems()}</div>
        <p class="dim" id="rank-progress" style="font-size:0.8rem;margin:8px 0">${S.rankMyOrder.length} / ${rankRound.items.length} ranked</p>
        <button class="btn-primary" id="rank-submit" ${S.rankMyOrder.length !== rankRound.items.length ? 'disabled' : ''}>🏅 Submit My Ranking</button>
        <p id="rank-msg" class="dim" style="font-size:0.85rem;margin-top:10px"></p>
      </section>

      <section class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px">
          <h2 style="margin:0">📊 Class Results</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a href="?board=icebreaker&game=rank" target="_blank" class="btn-secondary" style="font-size:0.78rem;padding:4px 12px;text-decoration:none">🖥️ Open Board View</a>
            ${S.teacherMode ? `<button class="btn-secondary" id="rank-clear" style="font-size:0.78rem;padding:4px 12px">🔄 Clear All Rankings</button>` : ''}
          </div>
        </div>
        <p class="cal-section-sub">See how the class ranked things overall, then go ask someone why they picked their #1.</p>
        <div class="rank-results">${renderRankResults()}</div>
      </section>`;

  const matchSection = `
      <section class="card">
        <h2>🎴 Find Your Match</h2>
        <p class="match-question-text qa-question-text">${esc(MATCH_QUESTIONS[S.matchCurrentIndex])}</p>
        <div class="speed-timer-display"><span class="match-timer speed-timer">${formatMatchTime(MATCH_TIMER_SECONDS)}</span></div>
        ${S.teacherMode ? `
        <div style="display:flex;align-items:center;gap:10px;margin:10px 0 4px;flex-wrap:wrap">
          <button class="btn-secondary" id="match-prev" style="font-size:0.78rem;padding:4px 12px">← Prev</button>
          <span class="dim" id="match-position" style="font-size:0.8rem">${S.matchCurrentIndex + 1} / ${MATCH_QUESTIONS.length}</span>
          <button class="btn-secondary" id="match-next" style="font-size:0.78rem;padding:4px 12px">Next →</button>
          <button class="btn-primary" id="match-start-timer" style="font-size:0.78rem;padding:4px 12px">▶️ Start 1:30 Timer</button>
        </div>
        <a href="?board=icebreaker&game=match" target="_blank" class="btn-secondary" style="font-size:0.78rem;padding:4px 12px;text-decoration:none;display:inline-block;margin-bottom:4px">🖥️ Open Board View</a>` : ''}
        <div class="match-help-box">
          <p class="match-help-title">📋 How to play</p>
          <ol class="match-help-list">
            <li>Everyone finds a partner and introduces themselves.</li>
            <li>Both of you answer the question on the board — learn their name and answer.</li>
            <li>When the teacher switches to a new question, find a new partner.</li>
            <li>Repeat until everyone's been met.</li>
            <li>Group share: introduce one person you met to the class (their name and fun fact).</li>
          </ol>
          <p class="match-help-title" style="margin-top:10px">💡 Tips</p>
          <ul class="match-help-list">
            <li>Say each person's name at least twice while you talk.</li>
            <li>Try to meet as many people as possible.</li>
            <li>Have fun — it's about learning names, not memorizing answers.</li>
          </ul>
        </div>
      </section>`;

  const rapidActionLabel = S.rapidStage === 'name' ? '❓ Pick a Question' : (S.rapidStage === 'question' ? '🎲 Pick Next Name' : '🎲 Pick a Name');
  const rapidSection = `
      <section class="card" style="margin-bottom:20px">
        <h2>⚡ Rapid Fire Questions</h2>
        <p class="cal-section-sub">Sign up below, then wait for your name to come up on the board for a random quick question.</p>
        <div class="form-group">
          <label>First and Last Name</label>
          <input id="rapid-name" type="text" placeholder="First and last name" value="${esc(localStorage.getItem('hm_student_name') || '')}">
        </div>
        <button class="btn-primary" id="rapid-signup">🙋 Sign Me Up</button>
        <p id="rapid-signup-msg" class="dim" style="font-size:0.85rem;margin-top:10px"></p>
      </section>

      <section class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px">
          <h2 style="margin:0">🎤 Who's Up</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a href="?board=icebreaker&game=rapid" target="_blank" class="btn-secondary" style="font-size:0.78rem;padding:4px 12px;text-decoration:none">🖥️ Open Board View</a>
            ${S.teacherMode ? `<button class="btn-secondary" id="rapid-clear" style="font-size:0.78rem;padding:4px 12px">🔄 Clear Sign-ups</button>` : ''}
          </div>
        </div>
        ${S.teacherMode ? `
        <div style="display:flex;align-items:center;gap:10px;margin:10px 0 14px;flex-wrap:wrap">
          <button class="btn-primary" id="rapid-action" style="font-size:0.9rem;padding:8px 18px">${rapidActionLabel}</button>
          <button class="btn-secondary" id="rapid-reset" style="font-size:0.78rem;padding:4px 12px">↺ Reset Round</button>
          <span class="dim" style="font-size:0.8rem"><span class="rapid-signup-count">${S.rapidSignups.length}</span> signed up</span>
        </div>` : ''}
        <div class="rapid-reveal">
          ${S.rapidStage === 'idle' ? `<p class="dim" style="font-size:0.95rem">Waiting for the teacher to pick who's up first.</p>` : ''}
          ${S.rapidStage !== 'idle' ? `<p class="rapid-name-text">🎤 ${esc(S.rapidCurrentName)}</p>` : ''}
          ${S.rapidStage === 'question' ? `<p class="rapid-question-text qa-question-text">${esc(RAPID_QUESTIONS[S.rapidQuestionIndex])}</p>` : ''}
        </div>
        <p id="rapid-msg" class="dim" style="font-size:0.85rem"></p>
        <div id="rapid-signup-list" class="rapid-signup-list">${renderRapidSignupList()}</div>
      </section>`;

  const sections = { truths: truthsSection, qa: qaSection, tot: totSection, bingo: bingoSection, wyr: wyrSection, speed: speedSection, common: commonSection, rank: rankSection, match: matchSection, rapid: rapidSection };
  const gameMeta = ICEBREAKER_GAMES.find(g => g.key === game);

  return `
    ${navBar('icebreaker')}
    <div class="class-page">
      <div class="class-header">
        <div class="class-header-icon">${gameMeta.icon}</div>
        <div>
          <h1>Icebreaker: ${gameMeta.title}</h1>
          <p>${gameMeta.sub}</p>
        </div>
      </div>
      <a class="ib-back-link" data-game="menu">← All Icebreakers</a>
      ${sections[game]}
    </div>`;
}

function renderIcebreakerBoard() {
  if (S.icebreakerGame === 'qa') {
    const qaText = S.qaCustomText || QA_QUESTIONS[S.qaCurrentIndex];
    return `
      <div class="ib-board">
        <a href="?" class="ib-board-exit" title="Exit board view">⤺ Exit</a>
        <div class="ib-board-header">
          <h1>🙋 Get to Know You</h1>
          ${S.qaEditing ? `
          <textarea id="qa-edit-input" class="qa-edit-input" placeholder="Type a custom question...">${esc(qaText)}</textarea>
          <div class="ib-board-controls">
            <button class="btn-secondary" id="qa-edit-save">✓ Save Question</button>
            <button class="btn-secondary" id="qa-edit-cancel">✕ Cancel</button>
            ${S.qaCustomText ? `<button class="btn-secondary" id="qa-edit-reset">↺ Use Preset</button>` : ''}
          </div>` : `
          <p class="qa-question-text ib-board-question">${esc(qaText)}</p>
          <div class="ib-board-controls">
            <button class="btn-secondary" id="qa-board-prev">← Prev</button>
            <span class="dim" id="qa-position">${S.qaCurrentIndex + 1} / ${QA_QUESTIONS.length}</span>
            <button class="btn-secondary" id="qa-board-next">Next →</button>
            <button class="btn-secondary" id="qa-board-edit">✏️ Edit Question</button>
          </div>`}
        </div>
        <div id="qa-wall" class="ib-board-wall">${renderQaWallCards(S.qaAnswers)}</div>
      </div>`;
  }
  if (S.icebreakerGame === 'tot') {
    const totQ = THIS_OR_THAT_QUESTIONS[S.totCurrentIndex];
    return `
      <div class="ib-board">
        <a href="?" class="ib-board-exit" title="Exit board view">⤺ Exit</a>
        <div class="ib-board-header">
          <h1>⚖️ This or That</h1>
        </div>
        ${S.totStage === 'poll' ? `
        <div class="tot-board-choices">
          <div class="tot-board-choice"><span class="tot-question-a">${esc(totQ.a)}</span></div>
          <div class="tot-vs">vs</div>
          <div class="tot-board-choice"><span class="tot-question-b">${esc(totQ.b)}</span></div>
        </div>
        <div class="tot-poll tot-board-poll">${renderTotPoll()}</div>` : ''}
        ${S.totStage === 'div' ? renderTotDivBoard() : ''}
        ${S.totStage === 'share' ? renderTotShareBoard() : ''}
        <div class="ib-board-controls">
          <button class="btn-secondary" id="tot-board-prev">← Prev</button>
          <span class="dim" id="tot-position">${S.totCurrentIndex + 1} / ${THIS_OR_THAT_QUESTIONS.length}</span>
          <button class="btn-secondary" id="tot-board-next">Next →</button>
          ${S.totStage === 'poll' ? `<button class="btn-secondary" id="tot-board-start-div">🔀 Start Division Round</button>` : ''}
          ${S.totStage === 'div' ? `<button class="btn-secondary" id="tot-board-reveal-share">💬 Reveal Share Question</button><button class="btn-secondary" id="tot-board-back-poll">↺ Back to Poll</button>` : ''}
          ${S.totStage === 'share' ? `<button class="btn-secondary" id="tot-board-back-poll">↺ Back to Poll</button>` : ''}
        </div>
      </div>`;
  }
  if (S.icebreakerGame === 'bingo') {
    return `
      <div class="ib-board">
        <a href="?" class="ib-board-exit" title="Exit board view">⤺ Exit</a>
        <div class="ib-board-header">
          <h1>🏃 Human Bingo</h1>
          <p>Get up, find classmates matching each square, and learn their names. First to BINGO shows up here — <span id="bingo-winners-count">${S.bingoWinners.length}</span> so far.</p>
        </div>
        <div id="bingo-winners-wall" class="ib-board-winners">${renderBingoWinners()}</div>
      </div>`;
  }
  if (S.icebreakerGame === 'wyr') {
    const wyrQ = WYR_QUESTIONS[S.wyrCurrentIndex];
    return `
      <div class="ib-board">
        <a href="?" class="ib-board-exit" title="Exit board view">⤺ Exit</a>
        <div class="ib-board-header">
          <h1>🤔 Would You Rather</h1>
        </div>
        <div class="wyr-board-choices">
          <div class="wyr-board-choice"><span class="wyr-question-a">${esc(wyrQ.a)}</span></div>
          <div class="wyr-vs">or</div>
          <div class="wyr-board-choice"><span class="wyr-question-b">${esc(wyrQ.b)}</span></div>
        </div>
        <div class="wyr-poll wyr-board-poll">${renderWyrPoll()}</div>
        <div class="ib-board-controls">
          <button class="btn-secondary" id="wyr-board-prev">← Prev</button>
          <span class="dim" id="wyr-board-position">${S.wyrCurrentIndex + 1} / ${WYR_QUESTIONS.length}</span>
          <button class="btn-secondary" id="wyr-board-next">Next →</button>
        </div>
      </div>`;
  }
  if (S.icebreakerGame === 'speed') {
    return `
      <div class="ib-board">
        <a href="?" class="ib-board-exit" title="Exit board view">⤺ Exit</a>
        <div class="ib-board-header">
          <h1>⏱️ Speed Meet</h1>
        </div>
        <p class="speed-intro-text ib-board-intro">${esc(SPEED_INTRO)}</p>
        <p class="speed-question-text ib-board-question">${esc(SPEED_QUESTIONS[S.speedIndex])}</p>
        <div class="speed-timer-display speed-board-timer"><span class="speed-timer">⏱️ ${SPEED_TIMER_SECONDS}</span></div>
      </div>`;
  }
  if (S.icebreakerGame === 'common') {
    const commonCat = COMMON_GROUND_CATEGORIES[S.commonCurrentIndex];
    return `
      <div class="ib-board">
        <a href="?" class="ib-board-exit" title="Exit board view">⤺ Exit</a>
        <div class="ib-board-header">
          <h1>🧭 Common Ground</h1>
          <p class="common-question-text ib-board-question">${esc(commonCat.q)}</p>
        </div>
        <div class="common-groups common-board-groups">${renderCommonGroups()}</div>
      </div>`;
  }
  if (S.icebreakerGame === 'match') {
    return `
      <div class="ib-board">
        <a href="?" class="ib-board-exit" title="Exit board view">⤺ Exit</a>
        <div class="ib-board-header">
          <h1>🎴 Find Your Match</h1>
          <p>Find a partner, both answer the question below, then switch partners when it changes.</p>
        </div>
        <p class="match-question-text ib-board-question">${esc(MATCH_QUESTIONS[S.matchCurrentIndex])}</p>
        <div class="speed-timer-display speed-board-timer"><span class="match-timer speed-timer">${formatMatchTime(MATCH_TIMER_SECONDS)}</span></div>
        <div class="ib-board-controls">
          <button class="btn-primary" id="match-board-timer" style="font-size:1rem;padding:10px 20px">▶️ Start 1:30 Timer</button>
          <button class="btn-secondary" id="match-board-next" style="font-size:1rem;padding:10px 20px">Next Question →</button>
        </div>
      </div>`;
  }
  if (S.icebreakerGame === 'rapid') {
    const rapidActionLabel = S.rapidStage === 'name' ? '❓ Pick a Question' : (S.rapidStage === 'question' ? '🎲 Pick Next Name' : '🎲 Pick a Name');
    return `
      <div class="ib-board">
        <a href="?" class="ib-board-exit" title="Exit board view">⤺ Exit</a>
        <div class="ib-board-header">
          <h1>⚡ Rapid Fire Questions</h1>
          <p><span class="rapid-signup-count">${S.rapidSignups.length}</span> signed up</p>
        </div>
        <div class="rapid-board-reveal">
          ${S.rapidStage === 'idle' ? `<p class="dim" style="font-size:1.3rem">Tap below to pick who's up first.</p>` : ''}
          ${S.rapidStage !== 'idle' ? `<p class="rapid-name-board">🎤 ${esc(S.rapidCurrentName)}</p>` : ''}
          ${S.rapidStage === 'question' ? `<p class="rapid-question-text ib-board-question">${esc(RAPID_QUESTIONS[S.rapidQuestionIndex])}</p>` : ''}
        </div>
        <div class="ib-board-controls">
          <button class="btn-primary" id="rapid-board-action" style="font-size:1.1rem;padding:12px 28px">${rapidActionLabel}</button>
          <button class="btn-secondary" id="rapid-board-reset">↺ Reset Round</button>
        </div>
        <p id="rapid-board-msg" class="dim" style="font-size:0.9rem;text-align:center"></p>
      </div>`;
  }
  if (S.icebreakerGame === 'rank') {
    const rankRound = RANK_ROUNDS[S.rankCurrentIndex];
    return `
      <div class="ib-board">
        <a href="?" class="ib-board-exit" title="Exit board view">⤺ Exit</a>
        <div class="ib-board-header">
          <h1>🏅 Rank It</h1>
          <p class="rank-round-title ib-board-question">${esc(rankRound.title)}</p>
        </div>
        <div class="rank-results rank-board-results">${renderRankResults()}</div>
      </div>`;
  }
  return `
    <div class="ib-board">
      <a href="?" class="ib-board-exit" title="Exit board view">⤺ Exit</a>
      <div class="ib-board-header">
        <h1>🧊 Two Truths and a Lie</h1>
        <p>Find each person on the wall, guess their lie, then ask them to explain the true ones. <span id="icebreaker-count">${S.icebreakerEntries.length}</span> on the wall so far.</p>
      </div>
      <div id="icebreaker-wall" class="ib-board-wall">${renderIcebreakerWallCards(S.icebreakerEntries)}</div>
    </div>`;
}

// ── HOME ──────────────────────────────────────────────────────
function renderHome() {
  return `
    <div class="home-page">
      <div class="home-teacher-corner">
        ${S.teacherMode ? `<a class="teacher-btn" data-nav="dashboard" style="margin-right:6px">📊 Dashboard</a>` : ''}
        <button class="teacher-btn ${S.teacherMode ? 'active' : ''}" id="teacher-toggle">
          ${S.teacherMode ? '🔓 Teacher' : '🔑'}
        </button>
      </div>
      ${S.showTeacherPin ? `
      <div class="teacher-pin-overlay" id="teacher-pin-overlay">
        <div class="teacher-pin-box">
          <div class="teacher-pin-title">🔑 Teacher Mode</div>
          <input type="password" id="teacher-pin-input" class="form-input" placeholder="Enter PIN" autocomplete="off">
          <div class="teacher-pin-btns">
            <button class="btn-primary" id="teacher-pin-submit">Unlock</button>
            <button class="btn-secondary" id="teacher-pin-cancel">Cancel</button>
          </div>
        </div>
      </div>` : ''}
      <header class="home-header">
        <img src="images/logo-homestead-media.png" alt="Homestead Media" class="home-logo-img">
      </header>
      <div class="class-grid">
        <div class="class-card radio-card" data-nav="radio">
          <div class="class-icon">📻</div>
          <div class="class-name">Radio Broadcasting</div>
          <div class="class-desc">Weekly talk shows, on-air performance, and the business of broadcasting.</div>
          <div class="class-enter">Enter →</div>
        </div>
        <div class="class-card live-card" data-nav="live">
          <div class="class-icon">🎬</div>
          <div class="class-name">Homestead Live</div>
          <div class="class-desc">Live event broadcasting — football, basketball, volleyball, and more.</div>
          <div class="class-enter">Enter →</div>
        </div>
        <div class="class-card yearbook-card" data-nav="yearbook">
          <div class="class-icon">📖</div>
          <div class="class-name">Yearbook</div>
          <div class="class-desc">Documenting the year — photography, design, and storytelling.</div>
          <div class="class-enter">Enter →</div>
        </div>
        <div class="class-card sports-card" data-nav="sports">
          <div class="class-icon">🏟️</div>
          <div class="class-name">Sports Broadcasting</div>
          <div class="class-desc">Play-by-play, color commentary, and live crew for Homestead athletics.</div>
          <div class="class-enter">Enter →</div>
        </div>
        <div class="class-card indepth-card" data-nav="indepth">
          <div class="class-icon">📺</div>
          <div class="class-name">HHS In-Depth</div>
          <div class="class-desc">TV news production — anchoring, reporting, packages, and live shots.</div>
          <div class="class-enter">Enter →</div>
        </div>
        <div class="class-card intro-card" data-nav="intro">
          <div class="class-icon">🎓</div>
          <div class="class-name">Intro to Media</div>
          <div class="class-desc">First-year orientation to the Homestead Media program.</div>
          <div class="class-enter">Enter →</div>
        </div>
      </div>
      <div class="home-icebreaker-wrap">
        <div class="class-card home-icebreaker-card" data-nav="icebreaker">
          <div class="class-icon">🧊</div>
          <div class="class-name">Icebreakers</div>
          <div class="class-desc">Warm-up games and mixers to kick off class.</div>
          <div class="class-enter">Enter →</div>
        </div>
      </div>
    </div>`;
}

// ── RADIO ─────────────────────────────────────────────────────
function renderStationCard(station) {
  const slots = (S.stationSchedule[station.id] || []);
  const rows = DAYS.map((day, i) => {
    const slot = slots[i] || { show: '', djs: [] };
    const hasShow = slot.show && slot.show.trim();
    const djList = (slot.djs || []).join(', ');
    return `
      <div class="sched-row ${hasShow ? 'filled' : 'empty'}">
        <div class="sched-day">${day.slice(0,3)}</div>
        <div class="sched-info">
          <div class="sched-show">${hasShow ? esc(slot.show) : '<span class="dim">TBD</span>'}</div>
          ${djList ? `<div class="sched-djs">${esc(djList)}</div>` : ''}
        </div>
        ${S.teacherMode ? `<button class="slot-edit-btn btn-sm" data-station="${station.id}" data-day="${i}">Edit</button>` : ''}
      </div>`;
  }).join('');

  return `
    <section class="card station-card">
      <div class="station-card-header" style="border-bottom:2px solid ${station.color}">
        <div>
          <div class="station-name" style="color:${station.color}">${station.name}</div>
          <div class="station-freq">${station.freq}</div>
        </div>
      </div>
      <div class="sched-list">${rows}</div>
    </section>`;
}

function renderPointRecent() {
  const songs = S.pointRecentSongs;
  if (!songs) return `<section class="card point-recent-card"><div class="point-recent-loading">Loading recently played…</div></section>`;
  if (!songs.length) return '';
  return `
    <section class="card point-recent-card">
      <div class="point-recent-header">
        <span class="point-recent-dot"></span>
        <h3>On The Point Right Now</h3>
      </div>
      <ul class="point-recent-list">
        ${songs.map(s => `
          <li class="point-recent-item${s.live ? ' point-recent-item-live' : ''}">
            ${s.art
              ? `<img class="point-recent-art" src="${esc(s.art)}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'point-recent-art point-recent-art-fallback',textContent:'♪'}))">`
              : `<div class="point-recent-art point-recent-art-fallback">♪</div>`}
            <div class="point-recent-info">
              <div class="point-recent-title">${esc(s.title || '')}</div>
              <div class="point-recent-artist">${esc(s.artist || '')}</div>
            </div>
            ${s.live
              ? `<div class="point-recent-time point-recent-now">Now Playing</div>`
              : `<div class="point-recent-time">${esc(s.time || '')}</div>`}
          </li>`).join('')}
      </ul>
    </section>`;
}

function renderRadio() {
  const stationCards = STATIONS.map(renderStationCard).join('');

  return `
    ${navBar('radio')}
    <div class="class-page">
      <div class="class-header">
        <div class="radio-header-logos">
          <img src="images/logo-wcyt-point.png" alt="The Point 91FM" class="class-header-logo">
          <img src="images/logo-2point0.png" alt="WCYT 2.0" class="class-header-logo">
        </div>
        <div>
          <h1>Radio Broadcasting</h1>
          <p>Your show, your voice, your audience.</p>
          <a class="class-header-lessons-link" data-lesson-course="radio">📚 Go to Lessons</a>
        </div>
      </div>
      <div id="bellringer-wrap" class="bellringer-wrap">${renderBellRingerBanner('radio')}</div>
      <div class="page-grid">
        <div class="main-col">
          <div class="station-grid">${stationCards}</div>
          ${renderPointRecent()}
        </div>
        <div class="side-col">
          ${renderEquipmentCard()}
          <section class="card action-card radio-action">
            <div class="action-icon">🎙️</div>
            <h3>DJ Panel</h3>
            <p>Set your on-air status — On Air, On Break, or End Show.</p>
            ${S.teacherMode ? `<p class="action-cred">Password: <code>Spartans</code></p>` : ''}
            <a class="btn-primary" href="https://wcyt.org/dj" target="_blank" rel="noopener">Open DJ Panel ↗</a>
          </section>
          <section class="card action-card radio-action">
            <div class="action-icon">✍️</div>
            <h3>Show Planner</h3>
            <p>Plan your talk show, air personality breaks, or radio show — step by step. Submitting files your plan into this week's shared folder automatically.</p>
            <button class="btn-primary" id="start-planner">Start Planning →</button>
            <a class="btn-secondary" style="margin-top:8px;display:inline-block" href="${AIR_WEEKLY_DRIVE_URL}" target="_blank" rel="noopener">🗂️ Browse Submitted Plans ↗</a>
          </section>
          <section class="card action-card radio-action">
            <div class="action-icon">🎛️</div>
            <h3>Broadcast Planner</h3>
            <p>Build a full broadcast hour — pick songs from the station library, slot by slot, with DJ breaks.</p>
            <a class="btn-primary" href="https://wcyt.org/planner.html" target="_blank" rel="noopener">Open Broadcast Planner ↗</a>
          </section>
          <section class="card action-card radio-action">
            <div class="action-icon">🏆</div>
            <h3>IASB Competition</h3>
            <p>Track entries, checklists, and file uploads for IASB.</p>
            <button class="btn-primary" id="open-iasb">Open IASB Hub →</button>
          </section>
          ${S.teacherMode ? `
          <section class="card action-card">
            <div class="action-icon">📋</div>
            <h3>Student Submissions</h3>
            <p>Review submitted Talk Show plans.</p>
            <button class="btn-secondary" id="view-submissions">View All</button>
          </section>` : ''}
          ${renderQuickLinksCard('radio')}
        </div>
      </div>
    </div>`;
}

// ── TALK SHOW PLANNER ─────────────────────────────────────────
const PLANNER_TYPES = {
  talk:  { label: 'Talk Show',        icon: '🎙️', desc: 'A themed episode with segments, a topic, and talking points.' },
  air:   { label: 'Air Personality',  icon: '🎧', desc: 'Solo on-air breaks that connect with listeners, not just fill time.' },
  radio: { label: 'Radio Show',       icon: '🎤', desc: 'Same as Air Personality, but with a co-host.' },
};

const PLANNER_TALK_POINT_IDEAS = [
  'New Releases', "Musicians' Birthdays", 'Trending News', 'Artist Bio Deep-Dive',
  'Albums Released On This Day', 'Local Headlines', 'AccuWeather', 'This Day in Music',
  'National Holiday "Day"', 'Homestead Sports Scores/Schedule', 'Throwback Pick',
  'New Music Spotlight', 'Listener Poll / This-or-That', 'Concert/Tour Announcement',
];

const PLANNER_PURPOSES = [
  { key: 'inform',     label: 'Inform',               icon: '📚' },
  { key: 'entertain',  label: 'Entertain',             icon: '🎉' },
  { key: 'excitement', label: 'Build Excitement',      icon: '⚡' },
  { key: 'promote',    label: 'Promote Upcoming',      icon: '📣' },
  { key: 'connect',    label: 'Connect with Listeners', icon: '🤝' },
  { key: 'brand',      label: 'Reinforce Brand',       icon: '📻' },
  { key: 'interact',   label: 'Encourage Interaction', icon: '💬' },
];

const PLANNER_RELEVANCE_PROMPTS = [
  'Why is this relevant today?',
  'Why now, at this time of day?',
  'How does it connect to our HHS audience?',
  'Is it entertaining, informative, or engaging?',
];

const PLANNER_RESET_CHIPS = [
  { label: '📻 Station ID', text: "You're locked in with 91.1 The Point." },
  { label: '🕐 Time Check', text: "It's [time] here on [show name]." },
];

const PLANNER_INTERACTION_CHIPS = [
  { label: '📱 Text Line', text: 'Text us at 260-702-9118!' },
  { label: '❓ Ask a Question', text: 'Text us and let us know — [your question]?' },
  { label: '📲 Promote Social', text: 'Find us on social and tag us — we want to see it!' },
  { label: '🎉 Contest/Event', text: "Don't forget — [contest or event] is happening..." },
  { label: '🏫 School News', text: 'Big shoutout to [school news/event]...' },
];

const PLANNER_SHOW_TIMES = {
  morning:     'Morning show — listeners are just waking up or heading to class. Keep it upbeat and quick.',
  midday:      "Midday show — listeners are between classes or at lunch. Quick energy, social vibe works well.",
  afterschool: 'After-school show — listeners are winding down, at practice, or doing homework. More relaxed pacing works.',
  other:       '',
};

function plannerStepLabels(type) {
  if (type === 'talk') return ['Your Info', 'This Week', 'Break 1', 'Break 2', 'Break 3', 'Review'];
  if (type === 'air' || type === 'radio') return ['Your Info', 'Open the Show', 'Your Breaks', 'Close the Show', 'Review'];
  return ['Your Info', 'Open the Show', 'Your Breaks', 'Close the Show', 'Review'];
}

function plannerHasPurpose(p, key) {
  const inBreaks = (p.breaks || []).some(b => (b.purposes || []).includes(key));
  if (inBreaks) return true;
  if ((key === 'connect' || key === 'brand') && p.open && (p.open.welcome || p.open.reset || p.open.preview)) return true;
  if ((key === 'brand' || key === 'promote') && p.close && (p.close.recap || p.close.tease || p.close.signoff)) return true;
  return false;
}

function plannerTalkChecklist(p) {
  const theme = p.theme || {};
  const b1 = ((p.breaks || [])[0]) || {};
  const b2 = ((p.breaks || [])[1]) || {};
  const b3 = ((p.breaks || [])[2]) || {};
  return [
    { icon: '👋', label: 'Welcomed Listeners',  covered: !!theme.welcome },
    { icon: '🎯', label: 'Explained Relevance',  covered: !!(theme.description || b1.connection || b2.connection) },
    { icon: '💬', label: 'Invited Interaction',  covered: !!b2.interaction },
    { icon: '🎬', label: 'Wrapped Up / Teased',  covered: !!(b3.wrapUp || b2.tease) },
  ];
}

function renderPlannerStep0(p) {
  const type = p.showType;
  return `
    <h2>Let's Plan Your Show</h2>
    <p>What kind of show are you planning?</p>
    <div class="showtype-picker">
      ${Object.entries(PLANNER_TYPES).map(([key, t]) => `
        <button type="button" class="showtype-btn${type === key ? ' active' : ''}" data-showtype="${key}">
          <div class="showtype-icon">${t.icon}</div>
          <div class="showtype-name">${t.label}</div>
          <div class="showtype-desc">${esc(t.desc)}</div>
        </button>`).join('')}
    </div>
    ${type ? `
      <div class="form-group">
        <label>First and Last Name</label>
        <input id="p-name" type="text" value="${esc(p.studentName || '')}" placeholder="First and last name">
      </div>
      <div class="form-group">
        <label>Show Name</label>
        <input id="p-show" type="text" value="${esc(p.showName || '')}" placeholder="e.g. Morning Vibes, Sports Corner">
      </div>
      ${type !== 'talk' ? `
      <div class="form-group">
        <label>Station</label>
        <select id="p-station">
          <option value="point" ${p.station !== 'two' ? 'selected' : ''}>The Point 91FM</option>
          <option value="two" ${p.station === 'two' ? 'selected' : ''}>2.0</option>
        </select>
      </div>
      <div class="form-group">
        <label>When does your show air? <span class="hint">(helps you think about who's listening)</span></label>
        <select id="p-showtime">
          <option value="" ${!p.showTime ? 'selected' : ''}>— Select —</option>
          <option value="morning" ${p.showTime === 'morning' ? 'selected' : ''}>Morning</option>
          <option value="midday" ${p.showTime === 'midday' ? 'selected' : ''}>Midday / Lunch</option>
          <option value="afterschool" ${p.showTime === 'afterschool' ? 'selected' : ''}>After School</option>
          <option value="other" ${p.showTime === 'other' ? 'selected' : ''}>Other</option>
        </select>
      </div>` : ''}
      ${type === 'radio' ? `
      <div class="form-group">
        <label>Co-Host(s)</label>
        <input id="p-partners" type="text" value="${esc(p.partners || '')}" placeholder="Names separated by commas">
      </div>
      <div class="form-group">
        <label>Co-Host Email(s) <span class="hint">(optional — so they can get a copy too)</span></label>
        <input id="p-partner-emails" type="text" value="${esc(p.partnerEmails || '')}" placeholder="Emails separated by commas">
      </div>` : ''}
      ${type === 'talk' ? `
      <div class="form-group">
        <label>Other DJ(s) on your show <span class="hint">(optional)</span></label>
        <input id="p-partners" type="text" value="${esc(p.partners || '')}" placeholder="Names separated by commas">
      </div>
      <div class="form-group">
        <label>Co-Host Email(s) <span class="hint">(optional — so they can get a copy too)</span></label>
        <input id="p-partner-emails" type="text" value="${esc(p.partnerEmails || '')}" placeholder="Emails separated by commas">
      </div>` : ''}
    ` : ''}`;
}

function plannerChipButtonsHTML(chips, targetId, extraClass) {
  return `
    <div class="talkpoint-chips">
      ${chips.map(c => `<button type="button" class="chip${extraClass ? ' ' + extraClass : ''}" data-chip-target="${targetId}" data-chip-text="${esc(c.text)}">${c.label}</button>`).join('')}
    </div>`;
}

function plannerIdeaListHTML() {
  return `
    <div class="talkpoint-idea-bank">
      <div class="talkpoint-idea-label">💡 Need a topic? Try looking one of these up online:</div>
      <div class="talkpoint-idea-tags">
        ${PLANNER_TALK_POINT_IDEAS.map(t => `<span class="idea-tag">${esc(t)}</span>`).join('')}
      </div>
    </div>`;
}

function plannerFixedPurposeTagsHTML(keys) {
  return `
    <div class="talkpoint-idea-bank">
      <div class="talkpoint-idea-label">This part's job:</div>
      <div class="talkpoint-idea-tags">
        ${keys.map(k => PLANNER_PURPOSES.find(pu => pu.key === k)).filter(Boolean)
          .map(pu => `<span class="idea-tag purpose-fixed">${pu.icon} ${esc(pu.label)}</span>`).join('')}
      </div>
    </div>`;
}

function renderPlannerOpen(p) {
  const o = p.open || {};
  const isRadio = p.showType === 'radio';
  return `
    <h2>Open the Show</h2>
    <div class="break-purpose">Someone is always tuning in for the first time this break. Welcome them in, reset the station, and give them a reason to stick around.</div>
    <div class="form-group">
      <label>Welcome <span class="hint">(how will you welcome listeners tuning in right now?)</span></label>
      <textarea id="open-welcome" rows="2" placeholder="${isRadio ? "e.g. You're locked in with [show name] on 91.1 The Point, I'm [your name] with [co-host]..." : "e.g. You're locked in with [show name] on 91.1 The Point, I'm [your name]..."}">${esc(o.welcome || '')}</textarea>
      <div class="coach-hint">Skip "What's up" — it's overused. We're a public station, not a school PA system, so lead with the show/station, not "Homestead."${isRadio ? ' Introduce your co-host by name so listeners know who\'s on with you today.' : ''}</div>
    </div>
    <div class="form-group">
      <label>Station Reset <span class="hint">(mention your station, show name, and/or the time)</span></label>
      ${plannerChipButtonsHTML(PLANNER_RESET_CHIPS, 'open-reset', 'chip-promo')}
      <textarea id="open-reset" rows="2" placeholder="Tap a template above or write your own...">${esc(o.reset || '')}</textarea>
    </div>
    <div class="form-group">
      <label>Preview <span class="hint">(what's coming up today that'll make them want to stay tuned?)</span></label>
      <textarea id="open-preview" rows="2" placeholder="e.g. songs, features, interviews, contests, programming...">${esc(o.preview || '')}</textarea>
    </div>
    ${plannerFixedPurposeTagsHTML(['connect', 'brand'])}`;
}

function renderPlannerClose(p) {
  const c = p.close || {};
  return `
    <h2>Close the Show</h2>
    <div class="break-purpose">Give listeners a reason to come back — recap what mattered, tease what's next, and sign off like a pro.</div>
    <div class="form-group">
      <label>Recap <span class="hint">(what should listeners remember from today?)</span></label>
      <textarea id="close-recap" rows="2" placeholder="Quick recap of today's show...">${esc(c.recap || '')}</textarea>
    </div>
    <div class="form-group">
      <label>Tease Next Time <span class="hint">(what can you tease for next time, or later today?)</span></label>
      <textarea id="close-tease" rows="2" placeholder="e.g. Next week we're talking about...">${esc(c.tease || '')}</textarea>
    </div>
    <div class="form-group">
      <label>Sign-Off</label>
      <input id="close-signoff" type="text" value="${esc(c.signoff || '')}" placeholder="e.g. That's it for us — thanks for listening to...">
    </div>
    ${plannerFixedPurposeTagsHTML(['brand', 'promote'])}`;
}

function renderPlannerAirBreaks(p) {
  const breaks = p.breaks || [];
  const isRadio = p.showType === 'radio';
  const timeHint = PLANNER_SHOW_TIMES[p.showTime] || '';
  return `
    <h2>Your Breaks</h2>
    <div class="break-purpose">Every break should answer one question: <strong>why would someone listening right now care about what you're about to say?</strong></div>
    ${timeHint ? `<div class="break-purpose">🕐 ${esc(timeHint)}</div>` : ''}
    ${isRadio ? `<div class="break-purpose">🎤 With a co-host, breaks work best as a back-and-forth — trade lines, ask each other questions, and react to what your co-host says instead of both reading notes solo.</div>` : ''}
    ${Array.from({ length: 4 }, (_, i) => {
      const b = breaks[i] || {};
      const purposes = b.purposes || [];
      return `
      <div class="air-break-card">
        <div class="air-break-header">Break ${i + 1}</div>
        <div class="form-group">
          <label>What is this break for? <span class="hint">(pick 1–2)</span></label>
          <div class="purpose-picker">
            ${PLANNER_PURPOSES.map(pu => `<button type="button" class="purpose-chip${purposes.includes(pu.key) ? ' active' : ''}" data-purpose-break="${i}" data-purpose-key="${pu.key}">${pu.icon} ${esc(pu.label)}</button>`).join('')}
          </div>
        </div>
        <div class="form-group">
          <label>Why would someone listening right now care?</label>
          <textarea id="air-why-${i}" rows="2" placeholder="Explain the reason, not just the topic...">${esc(b.whyRelevant || '')}</textarea>
          <div class="coach-hint">${PLANNER_RELEVANCE_PROMPTS.map(q => esc(q)).join(' · ')}</div>
        </div>
        <div class="form-group">
          <label>Reconnect the Listener <span class="hint">(one song you just played new listeners should know about)</span></label>
          <div class="talkpoint-chips"><button type="button" class="chip chip-promo song-pick-btn" data-song-target="air-backsell-${i}">🎵 Pick from station library</button></div>
          <input id="air-backsell-${i}" type="text" value="${esc(b.backsell || '')}" placeholder="e.g. That was Taylor Swift with Anti-Hero">
        </div>
        <div class="form-group">
          <label>What You'll Say</label>
          ${plannerIdeaListHTML()}
          <textarea id="air-talkpoint-${i}" rows="2" placeholder="Write what you'll actually say on mic...">${esc(b.talkPoint || '')}</textarea>
        </div>
        ${isRadio ? `
        <div class="form-group">
          <label>Trade the Mic <span class="hint">(who says what — how will you and your co-host go back and forth?)</span></label>
          <textarea id="air-cohost-${i}" rows="2" placeholder="e.g. I'll ask [co-host] what they think about..., then they respond before we move on...">${esc(b.coHostMoment || '')}</textarea>
          <div class="coach-hint">Ask your co-host a question · React before moving on · Don't read the same info solo — hand it off</div>
        </div>` : ''}
        <div class="form-group">
          <label>Keep Them Listening <span class="hint">(what's coming up that keeps them tuned in?)</span></label>
          <div class="talkpoint-chips"><button type="button" class="chip chip-promo song-pick-btn" data-song-target="air-presell-${i}">🎵 Pick from station library</button></div>
          <input id="air-presell-${i}" type="text" value="${esc(b.presell || '')}" placeholder="e.g. Coming up next, we've got...">
        </div>
        <div class="form-group">
          <label>Invite Them In <span class="hint">(try to use one every show)</span></label>
          ${plannerChipButtonsHTML(PLANNER_INTERACTION_CHIPS, `air-interact-${i}`, 'chip-promo')}
          <textarea id="air-interact-${i}" rows="2" placeholder="How will you invite listener interaction?">${esc(b.interaction || '')}</textarea>
        </div>
      </div>`;
    }).join('')}`;
}

function renderPlannerAirReview(p) {
  const typeLabel = PLANNER_TYPES[p.showType]?.label || 'Show';
  const o = p.open || {};
  const c = p.close || {};
  const breaks = p.breaks || [];
  const coverage = PLANNER_PURPOSES.map(pu => ({ ...pu, covered: plannerHasPurpose(p, pu.key) }));

  const breakRows = breaks.map((b, i) => {
    const purposeTags = (b.purposes || []).map(k => PLANNER_PURPOSES.find(pu => pu.key === k)).filter(Boolean);
    if (!b || (!b.backsell && !b.presell && !b.talkPoint && !b.whyRelevant && !b.interaction && !b.coHostMoment && !purposeTags.length)) return '';
    return `
      <div class="review-section">
        <div class="review-label">Break ${i + 1}</div>
        <div class="review-value">
          ${purposeTags.length ? `<div class="review-purpose-tags">${purposeTags.map(pu => `<span class="idea-tag purpose-fixed">${pu.icon} ${esc(pu.label)}</span>`).join('')}</div>` : ''}
          ${b.whyRelevant ? `<em>Why:</em> ${esc(b.whyRelevant)}<br>` : ''}
          ${b.backsell ? `<em>Back-sell:</em> ${esc(b.backsell)}<br>` : ''}
          ${esc(b.talkPoint || '')}
          ${b.coHostMoment ? `<br><em>Trade Mic:</em> ${esc(b.coHostMoment)}` : ''}
          ${b.presell ? `<br><em>Pre-sell:</em> ${esc(b.presell)}` : ''}
          ${b.interaction ? `<br><em>Invite:</em> ${esc(b.interaction)}` : ''}
        </div>
      </div>`;
  }).join('');

  return `
    <h2>Pre-Air Checklist</h2>
    <p>Make sure your show has a purpose behind every break before you submit.</p>
    <div class="purpose-coverage-grid">
      ${coverage.map(pu => `
        <div class="purpose-coverage-item ${pu.covered ? 'covered' : 'uncovered'}">
          <span>${pu.covered ? '✓' : '○'}</span> ${pu.icon} ${esc(pu.label)}
        </div>`).join('')}
    </div>
    <div class="review-block">
      <div class="review-section">
        <div class="review-label">Type</div>
        <div class="review-value">${esc(typeLabel)}</div>
      </div>
      <div class="review-section">
        <div class="review-label">Show</div>
        <div class="review-value">${esc(p.showName || '—')}</div>
      </div>
      <div class="review-section">
        <div class="review-label">DJ(s)</div>
        <div class="review-value">${esc([p.studentName, p.partners].filter(Boolean).join(', ') || '—')}</div>
      </div>
      <div class="review-section">
        <div class="review-label">Station</div>
        <div class="review-value">${p.station === 'two' ? '2.0' : 'The Point 91FM'}</div>
      </div>
      <div class="review-section">
        <div class="review-label">Open</div>
        <div class="review-value">
          ${o.welcome || o.reset || o.preview ? `
            ${o.welcome ? `<em>Welcome:</em> ${esc(o.welcome)}<br>` : ''}
            ${o.reset ? `<em>Reset:</em> ${esc(o.reset)}<br>` : ''}
            ${o.preview ? `<em>Preview:</em> ${esc(o.preview)}` : ''}
          ` : '—'}
        </div>
      </div>
      ${breakRows || `
      <div class="review-section">
        <div class="review-label">Breaks</div>
        <div class="review-value">—</div>
      </div>`}
      <div class="review-section">
        <div class="review-label">Close</div>
        <div class="review-value">
          ${c.recap || c.tease || c.signoff ? `
            ${c.recap ? `<em>Recap:</em> ${esc(c.recap)}<br>` : ''}
            ${c.tease ? `<em>Tease:</em> ${esc(c.tease)}<br>` : ''}
            ${c.signoff ? `<em>Sign-off:</em> ${esc(c.signoff)}` : ''}
          ` : '—'}
        </div>
      </div>
    </div>
    <div style="margin-bottom:8px"><strong>Grading Criteria</strong></div>
    <div class="criteria-grid">
      <div class="criterion">✦ <strong>Relevance</strong> — Explained why listeners right now would care, not just what you'll say</div>
      <div class="criterion">✦ <strong>Variety</strong> — Breaks serve different purposes, not the same one every time</div>
      <div class="criterion">✦ <strong>Listener Connection</strong> — Welcome, reconnect, and interaction show up naturally</div>
      ${p.showType === 'radio'
        ? `<div class="criterion">✦ <strong>Chemistry</strong> — Co-hosts trade the mic and react to each other, not just take turns reading</div>`
        : `<div class="criterion">✦ <strong>Flow</strong> — Sounds natural on mic, not read off a form</div>`}
    </div>`;
}

function renderPlanner() {
  const p = S.plannerData || {};
  const step = S.plannerStep;
  const type = p.showType;
  const stepLabels = plannerStepLabels(type);
  const total = stepLabels.length;

  const progress = `
    <div class="planner-progress">
      ${stepLabels.map((label, i) => `
        ${i > 0 ? '<div class="progress-line"></div>' : ''}
        <div class="progress-step ${i < step ? 'done' : i === step ? 'active' : ''}">
          <div class="step-dot">${i < step ? '✓' : i + 1}</div>
          <div class="step-label">${label}</div>
        </div>`).join('')}
    </div>`;

  let content = '';
  if (step === 0) {
    content = renderPlannerStep0(p);
  } else if (type === 'talk') {
    switch (step) {
      case 1:
        content = `
          <h2>Part 1 — This Week's Episode Theme</h2>
          <p>What is this specific episode about? Pick a theme that's timely, interesting, and gives your breaks a direction.</p>
          <div class="form-group">
            <label>Episode Theme</label>
            <input id="p-theme-title" type="text" value="${esc((p.theme || {}).title || '')}" placeholder="e.g. Valentine's Day, Spring Break Plans, March Madness, Senior Week">
          </div>
          <div class="form-group">
            <label>Why this theme? <span class="hint">(2–3 sentences)</span></label>
            <textarea id="p-theme-desc" rows="4" placeholder="Why did you pick this theme for this week? What's happening right now that makes it relevant to your audience?">${esc((p.theme || {}).description || '')}</textarea>
            <div class="coach-hint">${PLANNER_RELEVANCE_PROMPTS.map(q => esc(q)).join(' · ')}</div>
          </div>
          <div class="form-group">
            <label>Welcome <span class="hint">(how will you open the show and welcome listeners in?)</span></label>
            <textarea id="p-theme-welcome" rows="2" placeholder="e.g. Welcome back to [show name] on 91.1 The Point — today we're getting into...">${esc((p.theme || {}).welcome || '')}</textarea>
            <div class="coach-hint">Skip "What's up" — it's overused. We're a public station, not a school PA system, so lead with the show/station, not "Homestead."</div>
          </div>`;
        break;
      case 2: {
        const b = ((p.breaks || [])[0]) || {};
        content = `
          <h2>Break 1 — News / Relevant Tie-In</h2>
          <div class="break-purpose">Purpose: connect your theme to something happening right now in the world or at school.</div>
          <div class="form-group">
            <label>Segment Title</label>
            <input id="b1-title" type="text" value="${esc(b.title || '')}" placeholder="e.g. This Week in School News">
          </div>
          <div class="form-group">
            <label>News or Update <span class="hint">(1–2 sentences)</span></label>
            <textarea id="b1-news" rows="3" placeholder="What's happening right now that you'll mention?">${esc(b.newsUpdate || '')}</textarea>
          </div>
          <div class="form-group">
            <label>Connection to Your Theme</label>
            <input id="b1-connection" type="text" value="${esc(b.connection || '')}" placeholder="How does this news tie into your show's theme?">
            <div class="coach-hint">Why would someone listening right now care about this?</div>
          </div>
          <div class="form-group">
            <label>Transition Line into Music or Next Segment <span class="hint">(hook them — tease your main topic!)</span></label>
            <input id="b1-transition" type="text" value="${esc(b.transition || '')}" placeholder="e.g. That's the news — but stick around, because coming up we're getting into [your main topic], and you do NOT want to miss it...">
          </div>`;
        break;
      }
      case 3: {
        const b = ((p.breaks || [])[1]) || {};
        content = `
          <h2>Break 2 — Fun Activity / Preview</h2>
          <div class="break-purpose">Purpose: engage your audience and build anticipation for your main topic.</div>
          <div class="form-group">
            <label>Segment Title</label>
            <input id="b2-title" type="text" value="${esc(b.title || '')}" placeholder="e.g. Top 5 List, This or That, Quick Poll">
          </div>
          <div class="form-group">
            <label>Activity or Hook</label>
            <textarea id="b2-activity" rows="3" placeholder="Describe the game, poll, top 5 list, or teaser you'll use.">${esc(b.activityHook || '')}</textarea>
          </div>
          <div class="form-group">
            <label>How It Connects to Your Theme</label>
            <input id="b2-connection" type="text" value="${esc(b.connection || '')}" placeholder="Why does this activity fit your show's theme?">
          </div>
          <div class="form-group">
            <label>Invite Listener Interaction <span class="hint">(try to use one every show)</span></label>
            ${plannerChipButtonsHTML(PLANNER_INTERACTION_CHIPS, 'b2-interaction', 'chip-promo')}
            <textarea id="b2-interaction" rows="2" placeholder="How will you invite listener interaction?">${esc(b.interaction || '')}</textarea>
          </div>
          <div class="form-group">
            <label>Closing / Tease into Break 3</label>
            <input id="b2-tease" type="text" value="${esc(b.tease || '')}" placeholder="e.g. We're about to get into our main topic — but first...">
          </div>`;
        break;
      }
      case 4: {
        const b = ((p.breaks || [])[2]) || {};
        const tp = b.talkingPoints || ['', '', ''];
        content = `
          <h2>Break 3 — Main Topic of the Day</h2>
          <div class="break-purpose">Purpose: deliver the big discussion or feature that ties everything together.</div>
          <div class="form-group">
            <label>Segment Title</label>
            <input id="b3-title" type="text" value="${esc(b.title || '')}" placeholder="e.g. The Big Debate, Our Main Story">
          </div>
          <div class="form-group">
            <label>Main Talking Points</label>
            <input id="b3-tp1" type="text" value="${esc(tp[0])}" placeholder="Talking point 1" class="mt8" style="margin-bottom:8px">
            <input id="b3-tp2" type="text" value="${esc(tp[1])}" placeholder="Talking point 2" style="margin-bottom:8px">
            <input id="b3-tp3" type="text" value="${esc(tp[2])}" placeholder="Talking point 3">
          </div>
          <div class="form-group">
            <label>Format</label>
            <input id="b3-format" type="text" value="${esc(b.format || '')}" placeholder="e.g. discussion, review, debate, interview">
          </div>
          <div class="form-group">
            <label>Wrap-Up Line / Call to Action</label>
            <input id="b3-wrapup" type="text" value="${esc(b.wrapUp || '')}" placeholder="e.g. Tune in next week for... or Let us know what you think!">
            <div class="coach-hint">Give listeners a reason to tune in again — tease next week, say thanks, or invite them to keep listening.</div>
          </div>`;
        break;
      }
      case 5: {
        const b1 = ((p.breaks || [])[0]) || {};
        const b2 = ((p.breaks || [])[1]) || {};
        const b3 = ((p.breaks || [])[2]) || {};
        const checklist = plannerTalkChecklist(p);
        content = `
          <h2>Review Your Show Plan</h2>
          <p>Make sure everything looks right before you submit.</p>
          <div class="purpose-coverage-grid">
            ${checklist.map(c => `
              <div class="purpose-coverage-item ${c.covered ? 'covered' : 'uncovered'}">
                <span>${c.covered ? '✓' : '○'}</span> ${c.icon} ${esc(c.label)}
              </div>`).join('')}
          </div>
          <div class="review-block">
            <div class="review-section">
              <div class="review-label">Show</div>
              <div class="review-value">${esc(p.showName || '—')}</div>
            </div>
            <div class="review-section">
              <div class="review-label">DJ(s)</div>
              <div class="review-value">${esc([p.studentName, p.partners].filter(Boolean).join(', ') || '—')}</div>
            </div>
            <div class="review-section">
              <div class="review-label">Episode Theme</div>
              <div class="review-value"><strong>${esc((p.theme || {}).title || '—')}</strong><br>${esc((p.theme || {}).description || '')}</div>
            </div>
            <div class="review-section">
              <div class="review-label">Welcome</div>
              <div class="review-value">${esc((p.theme || {}).welcome || '—')}</div>
            </div>
            <div class="review-section">
              <div class="review-label">Break 1 — ${esc(b1.title || 'News')}</div>
              <div class="review-value">${esc(b1.newsUpdate || '—')}<br><em>Connection: ${esc(b1.connection || '—')}</em></div>
            </div>
            <div class="review-section">
              <div class="review-label">Break 2 — ${esc(b2.title || 'Activity')}</div>
              <div class="review-value">
                ${esc(b2.activityHook || '—')}<br><em>Connection: ${esc(b2.connection || '—')}</em>
                ${b2.interaction ? `<br><em>Invite: ${esc(b2.interaction)}</em>` : ''}
              </div>
            </div>
            <div class="review-section">
              <div class="review-label">Break 3 — ${esc(b3.title || 'Main Topic')}</div>
              <div class="review-value">
                ${(b3.talkingPoints || []).filter(Boolean).map((t, i) => `${i + 1}. ${esc(t)}`).join('<br>') || '—'}
                <br><em>Format: ${esc(b3.format || '—')}</em>
              </div>
            </div>
          </div>
          <div style="margin-bottom:8px"><strong>Grading Criteria</strong></div>
          <div class="criteria-grid">
            <div class="criterion">✦ <strong>Creativity</strong> — Original and interesting ideas</div>
            <div class="criterion">✦ <strong>Relevance</strong> — Fits your audience and talk show style</div>
            <div class="criterion">✦ <strong>Clarity</strong> — Ideas are easy to understand</div>
            <div class="criterion">✦ <strong>Consistency</strong> — All breaks connect to your theme</div>
          </div>`;
        break;
      }
    }
  } else if (type === 'air' || type === 'radio') {
    switch (step) {
      case 1: content = renderPlannerOpen(p); break;
      case 2: content = renderPlannerAirBreaks(p); break;
      case 3: content = renderPlannerClose(p); break;
      case 4: content = renderPlannerAirReview(p); break;
    }
  }

  const isFirst = step === 0;
  const isLast  = step === total - 1;
  const headerLabel = type ? `${PLANNER_TYPES[type]?.label || 'Show'} Planner` : 'Show Planner';

  return `
    ${navBar('radio')}
    <div class="class-page">
      <div class="planner-header">
        <button class="back-btn" data-nav="radio">← Back to Radio</button>
        <h1>${esc(headerLabel)}</h1>
      </div>
      ${progress}
      <div class="planner-card card">
        ${content}
        <div class="planner-nav">
          ${!isFirst ? `<button class="btn-secondary" id="planner-back">← Back</button>` : '<div></div>'}
          ${!isLast
            ? `<button class="btn-primary" id="planner-next">Continue →</button>`
            : `<div class="planner-submit-row">
                <button class="btn-secondary" id="planner-download">⬇️ Download</button>
                <button class="btn-primary" id="planner-submit">Submit Plan ✓</button>
               </div>`}
        </div>
      </div>
    </div>`;
}

// ── HOMESTEAD LIVE ────────────────────────────────────────────
function renderLiveCalendar() {
  const now      = new Date();
  const offset   = S.calMonthOffset || 0;
  const view     = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year     = view.getFullYear();
  const month    = view.getMonth();
  const todayStr = now.toISOString().slice(0, 10);

  const byDate = {};
  (S.broadcasts || []).forEach(b => {
    (byDate[b.date] = byDate[b.date] || []).push(b);
  });

  const firstDow   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel  = view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(`<div class="lc-day lc-empty"></div>`);
  for (let d = 1; d <= daysInMonth; d++) {
    const ds  = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const bcs = byDate[ds] || [];
    const isToday = ds === todayStr;
    const isPast  = ds < todayStr;
    const dots    = bcs.map(b => {
      const et = EVENT_TYPES[b.type] || EVENT_TYPES.other;
      return `<span class="lc-dot" style="background:${et.color}" title="${esc(b.title)}"></span>`;
    }).join('');
    cells.push(`
      <div class="lc-day${isToday ? ' lc-today' : ''}${isPast ? ' lc-past' : ''}${bcs.length ? ' lc-has-event' : ''}"${bcs.length ? ` data-broadcast="${bcs[0].id}"` : ''}>
        <span class="lc-day-num">${d}</span>
        ${dots ? `<div class="lc-dots">${dots}</div>` : ''}
      </div>`);
  }

  const hasPrev = (S.broadcasts || []).some(b => b.date < `${year}-${String(month+1).padStart(2,'0')}-01`);
  const hasNext = (S.broadcasts || []).some(b => b.date >= `${year}-${String(month+1).padStart(2,'0')}-${String(daysInMonth).padStart(2,'0')}`);

  return `
    <section class="card lc-card">
      <div class="lc-header">
        <button class="lc-nav" id="lc-prev"${hasPrev ? '' : ' disabled'}>‹</button>
        <span class="lc-month-label">${monthLabel}</span>
        <button class="lc-nav" id="lc-next"${hasNext ? '' : ' disabled'}>›</button>
      </div>
      <div class="lc-grid">
        ${['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => `<div class="lc-dow">${d}</div>`).join('')}
        ${cells.join('')}
      </div>
      <div class="lc-legend">
        ${[...new Set((S.broadcasts || []).map(b => b.type))].map(type => {
          const et = EVENT_TYPES[type] || EVENT_TYPES.other;
          return `<span class="lc-legend-item"><span class="lc-dot" style="background:${et.color}"></span>${et.label}</span>`;
        }).join('')}
      </div>
    </section>`;
}

function renderLive() {
  const now = new Date();
  const upcoming = (S.broadcasts || [])
    .filter(b => new Date(b.date + 'T00:00:00') >= now)
    .sort((a, b) => a.date.localeCompare(b.date));

  const next = upcoming[0] || null;

  const crewGrid = (roles) => LIVE_ROLES.map(role => `
    <div class="broadcast-crew-role">
      <span class="bcr-label">${role}</span>
      <span class="bcr-name${roles[role] ? '' : ' empty'}">${esc(roles[role] || 'TBD')}</span>
    </div>`).join('');

  const countdownBlock = next ? (() => {
    const et = EVENT_TYPES[next.type] || EVENT_TYPES.other;
    const days = Math.ceil((new Date(next.date + 'T00:00:00') - now) / 86400000);
    return `
      <section class="card next-broadcast-card">
        <div class="next-label">Next Broadcast</div>
        <div class="next-event-type" style="color:${et.color}">${et.label}</div>
        <div class="next-event-name">${esc(next.title)}</div>
        <div class="next-date">${fmtDate(next.date, true)}</div>
        ${next.gameTime ? `
        <div class="next-times">
          <span class="next-door33">Door 33 ${computeDoor33(next.gameTime, next.type)}</span>
          <span style="color:var(--border)">·</span>
          <span class="next-arrival">${ARRIVAL_LABEL[next.type] ?? ARRIVAL_DEFAULT_LABEL} ${computeArrival(next.gameTime, next.type)}</span>
          <span style="color:var(--border)">·</span>
          <span class="next-gametime">Game ${esc(next.gameTime)}</span>
        </div>` : ''}
        <div class="countdown">${days <= 0 ? 'TODAY' : days === 1 ? '1 day away' : days + ' days away'}</div>
        <button class="btn-primary" data-broadcast="${next.id}" style="background:var(--live);color:#000">
          View Broadcast Prep →
        </button>
        <div class="next-crew-grid">
          ${crewGrid(next.roles || {})}
        </div>
      </section>`;
  })() : `
    <section class="card" style="text-align:center;padding:32px">
      <p class="dim" style="margin-bottom:16px">No upcoming broadcasts scheduled.</p>
      ${S.teacherMode ? '<button class="btn-primary" id="add-broadcast">+ Add Broadcast</button>' : ''}
    </section>`;

  const broadcastItems = upcoming.slice(0, 5).map(b => {
    const et = EVENT_TYPES[b.type] || EVENT_TYPES.other;
    return `
      <div class="broadcast-item" data-broadcast="${b.id}">
        <div class="broadcast-item-header">
          <div class="broadcast-type-dot" style="background:${et.color}"></div>
          <div class="broadcast-info">
            <div class="broadcast-title">${esc(b.title)}</div>
            <div class="broadcast-date">${fmtDate(b.date)}${b.gameTime ? ' · Game ' + esc(b.gameTime) : ''}</div>
            ${b.gameTime ? `<div class="broadcast-crewcall">Door 33 ${computeDoor33(b.gameTime, b.type)} · ${ARRIVAL_LABEL[b.type] ?? ARRIVAL_DEFAULT_LABEL} ${computeArrival(b.gameTime, b.type)}</div>` : ''}
          </div>
          <div class="broadcast-tag" style="color:${et.color}">${et.label}</div>
        </div>
        <div class="broadcast-crew">
          ${crewGrid(b.roles || {})}
        </div>
      </div>`;
  }).join('') || '<p class="dim">None scheduled yet.</p>';

  return `
    ${navBar('live')}
    <div class="class-page">
      <div class="class-header">
        <img src="images/logo-homestead-live.png" alt="Homestead Live" class="class-header-logo">
        <div>
          <h1>Homestead Live</h1>
          <p>Broadcasting Homestead sports and events live.</p>
          <a class="class-header-lessons-link" data-lesson-course="live">📚 Go to Lessons</a>
        </div>
      </div>
      <div id="bellringer-wrap" class="bellringer-wrap">${renderBellRingerBanner('live')}</div>
      <div class="page-grid">
        <div class="main-col">
          ${countdownBlock}
          ${(() => {
            const allLessons = getCourseLessonList('live')
              .filter(l => S.teacherMode || !S.hiddenLessons.has(l.id))
              .filter(l => S.teacherMode || !S.hiddenUnits.has(unitKey('live', l.unitId)));
            const unitOptions = getCourseUnits('live').map(u => `<option value="${u.id}">${esc(u.title)}</option>`).join('');
            const renderLessonCard = (l, idx) => `
              <div class="lesson-item${S.hiddenLessons.has(l.id) ? ' lesson-item-off' : ''}" data-lesson-course="live" data-lesson-unit="${l.unitId}" data-lesson-id="${l.id}">
                ${S.teacherMode ? `
                <div class="lesson-move-btns">
                  <button class="lesson-move-btn" data-move-lesson="${l.id}" data-move-course="live" data-move-dir="top" ${idx === 0 ? 'disabled' : ''} title="Move to top">⏫</button>
                  <button class="lesson-move-btn" data-move-lesson="${l.id}" data-move-course="live" data-move-dir="up" ${idx === 0 ? 'disabled' : ''} title="Move up">▲</button>
                  <button class="lesson-move-btn" data-move-lesson="${l.id}" data-move-course="live" data-move-dir="down" ${idx === allLessons.length - 1 ? 'disabled' : ''} title="Move down">▼</button>
                  <button class="lesson-move-btn" data-move-lesson="${l.id}" data-move-course="live" data-move-dir="bottom" ${idx === allLessons.length - 1 ? 'disabled' : ''} title="Move to bottom">⏬</button>
                </div>` : ''}
                <div class="lesson-item-icon${S.teacherMode ? ' lesson-item-icon-edit' : ''}" ${S.teacherMode ? `data-edit-icon="${l.id}" title="Click to change icon"` : ''}>${getLessonIcon(l, '🎬')}</div>
                <div class="lesson-item-body">
                  <div class="lesson-item-num">${esc(l.unitTitle)}</div>
                  <div class="lesson-item-title${S.teacherMode ? ' lesson-item-title-edit' : ''}" ${S.teacherMode ? `data-edit-title="${l.id}" title="Click to edit title"` : ''}>${esc(l.title)}${S.teacherMode ? ' ✏️' : ''}</div>
                  <div class="lesson-item-summary">${esc(l.summary || '')}</div>
                </div>
                <div class="lesson-item-right">
                  ${S.hiddenLessons.has(l.id) ? `<span class="lesson-hidden-chip">Hidden</span>` : ''}
                  <span class="lesson-duration-chip">${esc(l.duration || '')}</span>
                  ${S.teacherMode
                    ? `<button class="lesson-delete-btn" data-delete-lesson="${l.id}" data-delete-type="${l.isCustom ? 'canva' : 'builtin'}" title="${l.isCustom ? 'Delete' : 'Hide'} lesson">✕</button>`
                    : `<span class="lesson-item-arrow">→</span>`}
                </div>
              </div>`;
            return `
            <section class="card">
              <div class="card-header"><h2>📚 Lessons</h2></div>
              <div style="display:flex;flex-direction:column;gap:0;margin-top:4px">
                ${allLessons.map(renderLessonCard).join('')}
              </div>
              ${S.teacherMode ? (S.showCanvaForm ? `
                <div style="margin-top:12px;padding:14px;background:var(--surface2);border-radius:10px;display:flex;flex-direction:column;gap:10px">
                  <input id="canva-title" class="form-input" placeholder="Lesson title" style="font-size:0.9rem">
                  <input id="canva-duration" class="form-input" placeholder="Duration (e.g. 2 classes)" style="font-size:0.9rem">
                  <input id="canva-url" class="form-input" placeholder="Canva share link (canva.com/design/...)" style="font-size:0.9rem">
                  <select id="canva-unit" class="form-input" style="font-size:0.9rem">${unitOptions}</select>
                  <div style="display:flex;gap:8px">
                    <button class="btn-primary" id="canva-save-btn" style="font-size:0.85rem">Add Lesson</button>
                    <button class="btn-secondary" id="canva-cancel-btn" style="font-size:0.85rem">Cancel</button>
                  </div>
                </div>` : `
                <button class="btn-secondary" id="canva-add-btn" style="margin-top:10px;font-size:0.82rem;width:100%">+ Add Canva Lesson</button>`)
              : ''}
            </section>`;
          })()}
          <section class="card">
            <div class="card-header">
              <h2>Next 5 Broadcasts</h2>
              ${S.teacherMode ? `<button class="btn-primary" id="add-broadcast">+ Add</button>` : ''}
            </div>
            <div class="broadcast-list">${broadcastItems}</div>
            ${upcoming.length > 0 ? `<div style="text-align:center;margin-top:14px"><button class="btn-secondary" data-nav="schedule">View All ${upcoming.length} Broadcasts →</button></div>` : ''}
          </section>
        </div>
        <div class="side-col">
          ${renderEquipmentCard()}
          ${renderLiveCalendar()}
          ${!S.teacherMode ? `
          <section class="card action-card live-action">
            <div class="action-icon">📋</div>
            <h3>Broadcast Sign-Up</h3>
            <p>Tell your teacher which positions you're interested in for upcoming broadcasts.</p>
            <button class="btn-primary" data-nav="availability">Sign Up →</button>
          </section>` : ''}
          <section class="card">
            <h2>Crew Roles</h2>
            <div class="roles-list">
              ${LIVE_ROLES.map(r => `<div class="role-chip">${r}</div>`).join('')}
            </div>
          </section>
          <section class="card live-ref-card">
            <h2>🎨 Graphics Basics</h2>
            <div class="live-ref-grid">
              <div class="live-ref-item"><span class="live-ref-label">Size</span><span class="live-ref-val">1920 × 1080 px</span></div>
              <div class="live-ref-item"><span class="live-ref-label">DPI</span><span class="live-ref-val">300</span></div>
              <div class="live-ref-item"><span class="live-ref-label">Mode</span><span class="live-ref-val">RGB</span></div>
              <div class="live-ref-item"><span class="live-ref-label">BG</span><span class="live-ref-val">Transparent</span></div>
              <div class="live-ref-item"><span class="live-ref-label">Font</span><span class="live-ref-val">Industry</span></div>
              <div class="live-ref-item"><span class="live-ref-label">Secondary</span><span class="live-ref-val">Mundial Bold</span></div>
              <div class="live-ref-item live-ref-rule"><span class="live-ref-label">Rule #1</span><span class="live-ref-val all-caps-badge">ALL CAPS</span></div>
            </div>
            <div class="live-ref-links">
              <a href="https://drive.google.com/drive/folders/1Au4CFu82rCkzyhEPzzHPjWtA9nSX2vxk?usp=drive_link" target="_blank" class="live-ref-link">📐 Safe Area Templates ↗</a>
              <a href="https://drive.google.com/file/d/1dMTaMixqSfk8yHo9ShjAhlK6whOMa0qC/view" target="_blank" class="live-ref-link">📄 Style Guide PDF ↗</a>
            </div>
          </section>
          ${renderQuickLinksCard('live')}
        </div>
      </div>
    </div>`;
}

// ── AVAILABILITY CARD (broadcast detail sidebar) ──────────────
function renderAvailabilityCard(b) {
  if (!S.teacherMode) return renderStudentSignupCard(b);

  const avails = (S.availabilities || []).filter(a => a.broadcastId === b.id);

  const rows = avails.length
    ? avails.map(a => {
        const interests = a.interestedRoles || [];
        const assignedRole = Object.entries(b.roles || {}).find(([, n]) => n === a.studentName)?.[0];
        return `
          <div class="avail-student-card">
            <div class="avail-student-top">
              <div>
                <span class="avail-student-name">${esc(a.studentName)}</span>
              </div>
              ${a.fromForm
                ? `<span class="avail-form-badge" title="Signed up via Google Form — manage in the response Sheet">📋 Form</span>`
                : `<button class="avail-del-btn" data-avail-id="${a.id}" title="Remove from list">✕</button>`}
            </div>
            ${interests.length
              ? `<div class="avail-interests">${interests.map(r => `<span class="avail-interest-chip">${esc(r)}</span>`).join('')}</div>`
              : `<div class="avail-no-pref">No position preference</div>`}
            <select class="avail-assign-sel" data-name="${esc(a.studentName)}">
              <option value="">Assign to role…</option>
              ${LIVE_ROLES.map(r => `<option value="${r}"${assignedRole === r ? ' selected' : ''}>${r}</option>`).join('')}
            </select>
          </div>`;
      }).join('')
    : `<p class="dim" style="font-size:0.85rem;padding:4px 0">No students signed up for this broadcast yet.</p>`;

  return `
    <section class="card">
      <div class="card-header" style="margin-bottom:12px">
        <h2>Available Students</h2>
        <span class="avail-count-badge">${avails.length}</span>
      </div>
      ${USE_GOOGLE_FORM_SIGNUP && avails.some(a => a.fromForm) ? `
      <p style="font-size:0.75rem;color:var(--dim);margin-bottom:12px">📋 Sign-ups come from the Google Form — to remove one, delete its row in the response Sheet.</p>` : ''}
      <div class="avail-student-list">${rows}</div>
    </section>`;
}

// ── Student side of broadcast detail ──────────────────────────
function renderStudentSignupCard(b) {
  const avails = (S.availabilities || []).filter(a => a.broadcastId === b.id);
  const myName = localStorage.getItem('hm_student_name') || '';
  const myEntry = avails.find(a => a.studentName.toLowerCase() === myName.toLowerCase());
  const myRoles = myEntry?.interestedRoles || [];

  return `
    <section class="card">
      <h2>Your Sign-Up</h2>
      ${myEntry
        ? `<div class="avail-signed-badge" style="margin-bottom:10px">✓ You're marked available</div>
           ${myRoles.length
             ? `<div class="avail-my-roles">${myRoles.map(r => `<span class="avail-my-role-chip">${esc(r)}</span>`).join('')}</div>`
             : `<p style="font-size:0.82rem;color:var(--dim);margin-bottom:10px">No position preference set.</p>`}`
        : `<p style="font-size:0.85rem;color:var(--dim);margin-bottom:10px;line-height:1.5">You haven't signed up for this broadcast yet.</p>`}
      ${USE_GOOGLE_FORM_SIGNUP && SIGNUP_FORM.formUrl ? `
      <a class="btn-primary" href="${signupFormLink(b)}" target="_blank" rel="noopener" style="width:100%;margin-top:4px;display:block;text-align:center">
        ${myEntry ? 'Update on Google Form ↗' : 'Sign Up on Google Form ↗'}
      </a>
      <button class="btn-secondary" data-nav="availability" style="width:100%;margin-top:8px">All Broadcasts →</button>` : `
      <button class="btn-secondary" data-nav="availability" style="width:100%;margin-top:4px">
        ${myEntry ? 'Update My Sign-Up →' : 'Sign Up for Broadcasts →'}
      </button>`}
    </section>`;
}

// ── BROADCAST DETAIL ──────────────────────────────────────────
function renderBroadcast() {
  const b = (S.broadcasts || []).find(x => x.id === S.broadcastId);
  if (!b) return `${navBar('live')}<div class="class-page"><button class="back-btn" data-nav="live">← Back</button><p>Broadcast not found.</p></div>`;

  const et = EVENT_TYPES[b.type] || EVENT_TYPES.other;
  const roles = b.roles || {};
  const defaultChecklist = [
    'Test all cameras 30 min before air',
    'Confirm graphics are loaded and approved',
    'Run full audio check',
    'All crew in position 15 min before air',
    'Director and TD walkthrough complete'
  ];
  const checklist = b.checklist || defaultChecklist;

  const arrivalTime = computeArrival(b.gameTime, b.type);
  const door33Time  = computeDoor33(b.gameTime, b.type);
  const arrivalLbl  = ARRIVAL_LABEL[b.type] ?? ARRIVAL_DEFAULT_LABEL;

  return `
    ${navBar('live')}
    <div class="class-page">
      <button class="back-btn" data-nav="live">← Back to Homestead Live</button>
      <div class="broadcast-detail-header">
        <div class="broadcast-type-badge" style="background:${et.color}">${et.label}</div>
        <h1>${esc(b.title)}</h1>
        <div class="broadcast-detail-date">${fmtDate(b.date, true)}</div>
        ${arrivalTime ? `
        <div class="crew-call-banner">
          <div class="crew-call-block">
            <div class="crew-call-time-val door33-val">${door33Time}</div>
            <div class="crew-call-time-label">Door 33</div>
          </div>
          <div class="crew-call-divider"></div>
          <div class="crew-call-block">
            <div class="crew-call-time-val arrival-val">${arrivalTime}</div>
            <div class="crew-call-time-label">${arrivalLbl}</div>
          </div>
          <div class="crew-call-divider"></div>
          <div class="crew-call-block">
            <div class="crew-call-time-val">${esc(b.gameTime)}</div>
            <div class="crew-call-time-label">Game Time</div>
          </div>
          <div class="crew-call-rule">
            Enter through <strong>Door 33</strong> at ${door33Time} · Be in ${arrivalLbl} by ${arrivalTime}
          </div>
        </div>` : ''}
      </div>
      <div class="page-grid">
        <div class="main-col">
          <section class="card">
            <div class="card-header">
              <h2>Crew Assignments</h2>
              ${S.teacherMode ? `<button class="btn-primary" id="save-roles">Save Roles</button>` : ''}
            </div>
            <div class="role-grid">
              ${LIVE_ROLES.map(role => `
                <div class="role-row">
                  <div class="role-name">${role}</div>
                  ${S.teacherMode
                    ? `<input class="role-input" type="text" data-role="${role}" value="${esc(roles[role] || '')}" placeholder="Student name">`
                    : `<div class="role-assigned ${roles[role] ? '' : 'empty'}">${esc(roles[role] || 'TBD')}</div>`}
                </div>`).join('')}
            </div>
          </section>
          ${(() => {
            const gcItems = BROADCAST_CHECKLISTS[b.type];
            if (!gcItems) return '';
            const checked = S.broadcastChecklist[b.id] || new Set();
            const done = gcItems.filter(i => checked.has(i.id)).length;
            const pct = Math.round((done / gcItems.length) * 100);
            return `
            <section class="card gc-card">
              <div class="card-header">
                <h2>🎨 Graphics Checklist</h2>
                <span class="gc-progress-badge">${done}/${gcItems.length}</span>
              </div>
              <div class="gc-progress-bar-wrap"><div class="gc-progress-bar" style="width:${pct}%"></div></div>
              <div class="gc-list">
                ${gcItems.map(item => `
                  <label class="gc-item${checked.has(item.id) ? ' gc-checked' : ''}">
                    <input type="checkbox" class="gc-check" data-gc-toggle="${item.id}" data-gc-bid="${b.id}" ${checked.has(item.id) ? 'checked' : ''}>
                    <div class="gc-item-body">
                      <div class="gc-item-label">${esc(item.label)}</div>
                      ${item.sub ? `<div class="gc-item-sub">${esc(item.sub)}</div>` : ''}
                    </div>
                  </label>`).join('')}
              </div>
            </section>`;
          })()}
        </div>
        <div class="side-col">
          ${renderAvailabilityCard(b)}
          <section class="card">
            <h2>Pre-Show Checklist</h2>
            <div class="checklist">
              ${checklist.map((item, i) => `
                <label class="checklist-item">
                  <input type="checkbox" class="check-item" data-idx="${i}" ${((b.checks || {})[i]) ? 'checked' : ''}>
                  <span>${esc(item)}</span>
                </label>`).join('')}
            </div>
          </section>
          <section class="card">
            <div class="card-header" style="margin-bottom:${b.notes || S.teacherMode ? '12px' : '0'}">
              <h2>Notes</h2>
              ${S.teacherMode ? `<button class="btn-secondary" id="save-notes">Save</button>` : ''}
            </div>
            ${S.teacherMode
              ? `<textarea id="broadcast-notes" rows="4" style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);padding:10px;font-family:inherit;font-size:0.875rem;resize:vertical;outline:none" placeholder="Special instructions, location notes, etc.">${esc(b.notes || '')}</textarea>`
              : b.notes ? `<p style="font-size:0.875rem;line-height:1.6;color:var(--dim)">${esc(b.notes)}</p>` : '<p class="dim" style="font-size:0.875rem">No notes yet.</p>'}
          </section>
        </div>
      </div>
      ${renderRundownSection(b)}
    </div>`;
}

// ── FULL SCHEDULE ────────────────────────────────────────────
function renderSchedule() {
  const all = (S.broadcasts || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const now = new Date();

  const rows = all.map(b => {
    const et = EVENT_TYPES[b.type] || EVENT_TYPES.other;
    const past = new Date(b.date + 'T00:00:00') < now;
    const assigned = Object.values(b.roles || {}).filter(v => v).length;
    return `
      <div class="sched-row${past ? ' sched-past' : ''}">
        <div class="sched-badge" style="background:${et.color}">${et.label}</div>
        <div class="sched-info">
          <div class="sched-title">${esc(b.title)}</div>
          <div class="sched-meta">${fmtDate(b.date, true)}${b.notes ? ' · ' + esc(b.notes) : ''}</div>
          ${b.gameTime ? `<div class="sched-times">
            <span class="sched-door33">Door 33 ${computeDoor33(b.gameTime, b.type)}</span>
            <span class="sched-sep">·</span>
            <span class="sched-arrival">${ARRIVAL_LABEL[b.type] ?? ARRIVAL_DEFAULT_LABEL} ${computeArrival(b.gameTime, b.type)}</span>
            <span class="sched-sep">·</span>
            <span class="sched-gametime">Game ${esc(b.gameTime)}</span>
          </div>` : ''}
          <div class="sched-crew-count">${assigned} / ${LIVE_ROLES.length} crew assigned</div>
        </div>
        ${S.teacherMode ? `
          <div class="sched-actions">
            <button class="btn-secondary sched-edit" data-id="${b.id}">Edit</button>
          </div>` : ''}
      </div>`;
  }).join('') || '<p class="dim" style="padding:20px">No broadcasts scheduled.</p>';

  return `
    ${navBar('live')}
    <div class="class-page">
      <button class="back-btn" data-nav="live">← Back to Homestead Live</button>
      <div class="card-header" style="margin-bottom:20px">
        <h1>Full Schedule</h1>
        ${S.teacherMode ? '<button class="btn-primary" id="add-broadcast">+ Add Broadcast</button>' : ''}
      </div>
      <section class="card" style="padding:0;overflow:hidden">
        <div class="sched-list">${rows}</div>
      </section>
    </div>`;
}

function showEditBroadcastModal(id) {
  const b = (S.broadcasts || []).find(x => x.id === id);
  if (!b) return;
  const roles = b.roles || {};
  const m = modal(`
    <h2>Edit Broadcast</h2>
    <div class="form-group">
      <label>Event Name</label>
      <input id="m-title" type="text" value="${esc(b.title)}">
    </div>
    <div class="form-group">
      <label>Date</label>
      <input id="m-date" type="date" value="${b.date}">
    </div>
    <div class="form-group">
      <label>Type</label>
      <select id="m-type">
        ${Object.entries(EVENT_TYPES).map(([k, v]) =>
          `<option value="${k}"${b.type === k ? ' selected' : ''}>${v.label}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Game Time <span class="hint">(e.g. 7:30 PM)</span></label>
      <input id="m-gametime" type="text" value="${esc(b.gameTime || '')}" placeholder="7:30 PM">
    </div>
    <div class="form-group">
      <label>Notes</label>
      <input id="m-notes" type="text" value="${esc(b.notes || '')}" placeholder="Location, etc.">
    </div>
    <div class="form-group">
      <label>Crew</label>
      <div class="edit-crew-grid">
        ${LIVE_ROLES.map(role => `
          <div class="edit-crew-row">
            <span class="edit-crew-label">${role}</span>
            <input class="role-input" type="text" data-role="${role}" value="${esc(roles[role] || '')}" placeholder="Student name">
          </div>`).join('')}
      </div>
    </div>`, 'Delete');

  m.querySelector('#modal-save').addEventListener('click', async () => {
    const title    = val('m-title');
    const date     = val('m-date');
    const type     = val('m-type');
    const gameTime = val('m-gametime');
    const notes    = val('m-notes');
    if (!title || !date) { showToast('Title and date are required.'); return; }
    const newRoles = {};
    m.querySelectorAll('.role-input').forEach(el => { newRoles[el.dataset.role] = shortenName(el.value.trim()); });
    Object.assign(b, { title, date, type, gameTime, notes, roles: newRoles });
    const db = getDB();
    if (db) { trackUsage('writes'); await db.collection('hm_broadcasts').doc(b.id).update({ title, date, type, gameTime, notes, roles: newRoles }).catch(() => {}); }
    m.remove(); render(); showToast('Saved!');
  });

  m.querySelector('#modal-extra').addEventListener('click', async () => {
    if (!confirm(`Delete "${b.title}"?`)) return;
    const db = getDB();
    if (db) { trackUsage('writes'); await db.collection('hm_broadcasts').doc(b.id).delete().catch(() => {}); }
    S.broadcasts = S.broadcasts.filter(x => x.id !== b.id);
    m.remove(); render(); showToast('Deleted.');
  });
}

// ── SPORTS BROADCASTING ───────────────────────────────────────
function renderSports() {
  return `
    ${navBar('sports')}
    <div class="class-page">
      <div class="class-header">
        <img src="images/logo-sports-broadcasting.jpg" alt="Sports Broadcasting" class="class-header-logo">
        <div>
          <h1>Sports Broadcasting</h1>
          <p>Play-by-play, color commentary, and live crew for Homestead athletics.</p>
          <a class="class-header-lessons-link" data-lesson-course="sports">📚 Go to Lessons</a>
        </div>
      </div>
      <div id="bellringer-wrap" class="bellringer-wrap">${renderBellRingerBanner('sports')}</div>
      <div class="page-grid">
        <div class="main-col">
          <section class="card coming-soon-card">
            <div class="coming-soon-icon">🚧</div>
            <h2>Coming Soon</h2>
            <p>Sports Broadcasting content is being built out. Game schedules, crew assignments, and lessons will appear here.</p>
          </section>
        </div>
        <div class="side-col">
          ${renderEquipmentCard()}
          <section class="card action-card" style="--ac:var(--sports)">
            <div class="action-icon">📅</div>
            <h3>Broadcast Schedule</h3>
            <p>View upcoming games and who's crewing each broadcast.</p>
            <button class="btn-primary" style="background:var(--sports);color:#000" data-nav="schedule">View Schedule →</button>
          </section>
          <section class="card action-card" style="--ac:var(--sports)">
            <div class="action-icon">✋</div>
            <h3>Sign Up for a Broadcast</h3>
            <p>Add your name to an upcoming game crew.</p>
            <button class="btn-primary" style="background:var(--sports);color:#000" data-nav="availability">Sign Up →</button>
          </section>
          <section class="card action-card" style="--ac:var(--sports)">
            <div class="action-icon">🏆</div>
            <h3>IASB</h3>
            <p>Indiana Association of School Broadcasters — competition entries and resources.</p>
            <button class="btn-primary" style="background:var(--sports);color:#000" data-nav="iasb">Go to IASB →</button>
          </section>
          ${renderQuickLinksCard('sports')}
        </div>
      </div>
    </div>`;
}

// ── HHS IN-DEPTH ──────────────────────────────────────────────
const RUNDOWN_ROLES = [
  { key: 'anchors',    label: 'Anchors',      pair: true,                          color: '#6366f1' },
  { key: 'packages',   label: 'Packages',     structured: true,                    color: '#f59e0b' },
  { key: 'vo_vosot',   label: 'VOs / VOSOTs', structured: true, typeToggle: true,  color: '#a78bfa' },
  { key: 'commercial', label: 'Commercial',                                         color: '#f97316' },
  { key: 'psa',        label: 'PSA',                                                color: '#84cc16' },
  { key: 'weather',    label: 'Weather',                                            color: '#06b6d4' },
  { key: 'sports_btc', label: 'Sports / BTC',                                      color: '#22c55e' },
];

function getSchoolYearFridays() {
  const now = new Date();
  const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const start = new Date(startYear, 7, 21);
  while (start.getDay() !== 5) start.setDate(start.getDate() + 1);
  const end = new Date(startYear + 1, 4, 31);
  while (end.getDay() !== 5) end.setDate(end.getDate() - 1);
  const fridays = [];
  const d = new Date(start);
  while (d <= end) { fridays.push(new Date(d)); d.setDate(d.getDate() + 7); }
  return { fridays, startYear };
}

function mondayOf(date) {
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getRundownWeeks() {
  const monday = mondayOf(new Date());
  monday.setDate(monday.getDate() + (S.rundownWeekOffset || 0) * 7);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i * 7);
    return d;
  });
}

function weekKey(d) { return d.toISOString().slice(0, 10); }

function currentWeekKey() { return weekKey(mondayOf(new Date())); }

function fmtWeekRange(d) {
  const fri = new Date(d); fri.setDate(d.getDate() + 4);
  return fri.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function renderRundownCell(wk, role, isCurrent = false) {
  const rawVal  = (S.rundownData[wk] || {})[role.key];
  const colCls  = isCurrent ? ' rd-col-current' : '';

  if (role.pair) {
    const pair = Array.isArray(rawVal) ? rawVal : ['', ''];
    return `<td class="rd-cell${colCls}"><div class="rd-pair-edit">
      <input class="rd-pair-input" data-week="${wk}" data-role="${role.key}" data-idx="0" placeholder="Anchor 1" value="${esc(pair[0] || '')}">
      <input class="rd-pair-input" data-week="${wk}" data-role="${role.key}" data-idx="1" placeholder="Anchor 2" value="${esc(pair[1] || '')}">
    </div></td>`;
  }

  if (role.structured) {
    const defaultItem = () => ({ type: 'VO', topic: '', student: '' });
    const items = Array.isArray(rawVal) ? rawVal : (rawVal ? [{ type: 'VO', topic: rawVal, student: '' }] : []);
    const slots = items.length > 0 ? [...items] : [defaultItem(), defaultItem()];
    return `<td class="rd-cell${colCls}"><div class="rd-structured">
      ${slots.map((item, idx) => `
        <div class="rd-struct-item">
          ${role.typeToggle ? `<button class="rd-type-toggle rd-type-${(item.type||'VO').toLowerCase()}" data-week="${wk}" data-role="${role.key}" data-idx="${idx}">${item.type || 'VO'}</button>` : ''}
          <input class="rd-struct-input rd-topic-input" data-week="${wk}" data-role="${role.key}" data-idx="${idx}" data-field="topic" placeholder="Topic" value="${esc(item.topic || '')}">
          <input class="rd-struct-input rd-student-input" data-week="${wk}" data-role="${role.key}" data-idx="${idx}" data-field="student" placeholder="Student" value="${esc(item.student || '')}">
        </div>`).join('')}
      <button class="rd-add-item" data-week="${wk}" data-role="${role.key}">+ Add</button>
    </div></td>`;
  }

  const val = rawVal || '';
  return `<td class="rd-cell${colCls}"><textarea class="rd-input" data-week="${wk}" data-role="${role.key}" rows="2">${esc(val)}</textarea></td>`;
}

function renderIntro() {
  const INTRO_CLASSES = [
    { key: 'radio',    icon: '📻', name: 'Radio Broadcasting', defaultBlurb: 'Students go on the air at The Point 91FM and WCYT 2.0 — Homestead\'s two student-run radio stations. Class covers air personality, talk shows, copywriting, Adobe Audition production, and IASB competition.' },
    { key: 'live',     icon: '🎬', name: 'Homestead Live',      defaultBlurb: 'Students produce and broadcast live Homestead sports games on YouTube. Roles include graphics design in Photoshop, camera operation, play-by-play commentary, directing, and video switching.' },
    { key: 'yearbook', icon: '📖', name: 'Yearbook',            defaultBlurb: 'Students photograph and document the entire school year for the annual Homestead yearbook. Class covers DSLR photography, InDesign layout, photo editing, and meeting print deadlines.' },
    { key: 'sports',   icon: '🏟️', name: 'Sports Broadcasting', defaultBlurb: 'Students cover Homestead athletics through game writing, action photography, social media posts, and play-by-play broadcasting. Work is published to the school\'s athletics channels.' },
    { key: 'indepth',  icon: '📺', name: 'HHS In-Depth',        defaultBlurb: 'Students produce long-form TV news — anchoring, field reporting, scripted packages, and documentary segments. Work airs on the school\'s broadcast channel and YouTube.' },
  ];

  const cards = INTRO_CLASSES.map(cls => {
    const info = S.introClassInfo[cls.key] || {};
    const blurb = info.blurb || cls.defaultBlurb;
    const dropbox = info.dropbox || '';
    const color = (LESSONS[cls.key] || {}).color || '#6b7280';
    const isEditing = S.editingIntroClass === cls.key;
    const isOpen = S.expandedIntroClass === cls.key;

    if (isEditing) {
      return `
        <div class="intro-acc-card" style="border-left:4px solid ${color}">
          <div class="intro-acc-header">
            <span class="intro-class-info-icon" style="background:${color}18;color:${color}">${cls.icon}</span>
            <strong style="color:${color}">${cls.name}</strong>
          </div>
          <div class="intro-acc-body">
            <textarea id="intro-edit-blurb" class="form-input" rows="4" style="font-size:0.82rem;resize:vertical">${esc(blurb)}</textarea>
            <input id="intro-edit-dropbox" class="form-input" placeholder="Dropbox / Drive folder link" value="${esc(dropbox)}" style="font-size:0.82rem;margin-top:8px">
            <div style="display:flex;gap:8px;margin-top:10px">
              <button class="btn-primary" data-intro-save="${cls.key}" style="font-size:0.8rem">Save</button>
              <button class="btn-secondary" data-intro-cancel style="font-size:0.8rem">Cancel</button>
            </div>
          </div>
        </div>`;
    }

    return `
      <div class="intro-acc-card ${isOpen ? 'intro-acc-open' : ''}" style="border-left:4px solid ${color}">
        <button class="intro-acc-header" data-intro-expand="${cls.key}">
          <span class="intro-class-info-icon" style="background:${color}18;color:${color}">${cls.icon}</span>
          <span class="intro-acc-name" style="color:${color}">${cls.name}</span>
          <span class="intro-acc-chevron">${isOpen ? '▲' : '▼'}</span>
        </button>
        ${isOpen ? `
        <div class="intro-acc-body">
          <p class="intro-class-info-blurb">${esc(blurb)}</p>
          ${dropbox ? `<a href="${dropbox}" target="_blank" class="intro-dropbox-link">📁 Open Class Dropbox →</a>` : ''}
          ${S.teacherMode ? `<button class="btn-secondary" data-intro-edit="${cls.key}" style="font-size:0.75rem;padding:3px 10px;margin-top:8px">Edit</button>` : ''}
          ${S.teacherMode && !dropbox ? `<p style="font-size:0.72rem;color:var(--dim);margin:6px 0 0">No dropbox link yet — click Edit to add one.</p>` : ''}
        </div>` : ''}
      </div>`;
  }).join('');

  return `
    ${navBar('intro')}
    <div class="class-page">
      <div class="class-header">
        <div class="class-header-icon" style="font-size:3rem">🎓</div>
        <div>
          <h1>Intro to Media</h1>
          <p>First-year orientation to the Homestead Media program.</p>
          <a class="class-header-lessons-link" data-lesson-course="intro">📚 Go to Lessons</a>
        </div>
      </div>
      <div id="bellringer-wrap" class="bellringer-wrap">${renderBellRingerBanner('intro')}</div>
      <div class="page-grid">
        <div class="main-col">
          <section class="card coming-soon-card">
            <div class="coming-soon-icon">🎓</div>
            <h2>Welcome, First Years</h2>
            <p>This is your home base for the intro semester. Lessons, assignments, and resources will appear here.</p>
          </section>
        </div>
        <div class="side-col">
          <section class="card">
            <div class="card-header"><h2>Our Classes</h2></div>
            <div class="intro-acc-list">${cards}</div>
          </section>
          <section class="card action-card" style="--ac:#f59e0b">
            <div class="action-icon">📚</div>
            <h3>Lessons</h3>
            <p>View intro lessons and course materials.</p>
            <button class="btn-primary" style="background:#f59e0b;color:#000" data-lesson-course="intro">Go to Lessons →</button>
          </section>
          ${renderQuickLinksCard('intro')}
        </div>
      </div>
    </div>`;
}

function renderRundownLog() {
  let body;
  if (!S.rundownLog) {
    body = '<div class="rd-log-empty">Loading edit history…</div>';
  } else if (!S.rundownLog.length) {
    body = '<div class="rd-log-empty">No edits recorded yet.</div>';
  } else {
    body = S.rundownLog.map(e => {
      const role = RUNDOWN_ROLES.find(r => r.key === e.role);
      const when = new Date(e.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      const wk   = new Date(e.week + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `
        <div class="rd-log-row">
          <span class="rd-log-when">${when}</span>
          <span class="rd-log-who">${esc(e.by || 'Anonymous')}</span>
          <span class="rd-log-what">
            <span class="rd-log-role" style="color:${role?.color || 'inherit'}">${esc(role?.label || e.role)}</span>
            · week of ${wk} ·
            ${e.before ? `<s>${esc(e.before)}</s> → ` : ''}${e.after ? esc(e.after) : '<em>(cleared)</em>'}
          </span>
        </div>`;
    }).join('');
  }
  return `
    <div class="rd-log">
      <div class="rd-log-head">Recent Edits <span style="font-weight:400;color:var(--dim);font-size:0.72rem">last 40 · students are asked their name on first edit</span></div>
      ${body}
    </div>`;
}

function renderInDepth() {
  const weeks    = getRundownWeeks();
  const offset   = S.rundownWeekOffset || 0;
  const todayKey = currentWeekKey();
  const isPast   = weekKey(weeks[0]) < todayKey;

  const headerCols = weeks.map(w => {
    const wk      = weekKey(w);
    const past    = wk < todayKey;
    const current = wk === todayKey;
    return `<th class="rd-week-head${past ? ' rd-past' : ''}${current ? ' rd-current' : ''}">${fmtWeekRange(w)}${past ? '<br><span class="rd-past-tag">past</span>' : ''}${current ? '<br><span class="rd-past-tag" style="color:#6366f1">this week</span>' : ''}</th>`;
  }).join('');

  const bodyRows = RUNDOWN_ROLES.map(role =>
    `<tr style="--rd-color:${role.color}"><td class="rd-role-label" style="color:${role.color}">${role.label}</td>${weeks.map(w => {
      const wk = weekKey(w);
      const current = wk === todayKey;
      return renderRundownCell(wk, role, current);
    }).join('')}</tr>`
  ).join('');

  return `
    ${navBar('indepth')}
    <div class="class-page">
      <div class="class-header">
        <img src="images/logo-hhs-indepth.png" alt="HHS In-Depth" class="class-header-logo">
        <div>
          <h1>HHS In-Depth</h1>
          <p>TV news production — anchoring, reporting, packages, and live shots.</p>
          <a class="class-header-lessons-link" data-lesson-course="indepth">📚 Go to Lessons</a>
        </div>
      </div>

      <div id="bellringer-wrap" class="bellringer-wrap">${renderBellRingerBanner('indepth')}</div>
      <section class="card" style="margin-bottom:24px;overflow-x:auto">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
          <h2 style="font-size:1rem;font-weight:700">${isPast ? 'Past Shows' : 'Show Rundown'}</h2>
          <div style="display:flex;gap:6px;align-items:center">
            <span style="font-size:0.72rem;color:var(--dim)">saves automatically&nbsp;·&nbsp;</span>
            ${S.teacherMode ? `<button class="btn-secondary rd-nav-btn" id="rd-log-btn" style="font-size:0.75rem;padding:4px 10px">${S.showRundownLog ? 'Hide Edit Log' : '📝 Edit Log'}</button>` : ''}
            <button class="btn-secondary rd-nav-btn" id="rd-prev" style="font-size:0.75rem;padding:4px 10px">← Back</button>
            ${offset !== 0 ? `<button class="btn-secondary rd-nav-btn" id="rd-today" style="font-size:0.75rem;padding:4px 10px">Today</button>` : ''}
            <button class="btn-secondary rd-nav-btn" id="rd-next" style="font-size:0.75rem;padding:4px 10px">Forward →</button>
          </div>
        </div>
        <table class="rd-table">
          <thead><tr><th class="rd-role-head"></th>${headerCols}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
        ${S.teacherMode && S.showRundownLog ? renderRundownLog() : ''}
      </section>

      <div class="page-grid">
        <div class="main-col">
          <section class="card">
            <h2 class="cal-section-title">📅 Coverage Calendar</h2>
            <p class="cal-section-sub">Upcoming events that need to be covered by the In-Depth team.</p>
            <div class="cal-embed-wrap">
              <iframe src="https://calendar.google.com/calendar/embed?src=2b9bdfdee65f7330d8d5d2fd1d4877c1b709289fa0b0747427f57fd62516bed5%40group.calendar.google.com&ctz=America%2FIndiana%2FIndianapolis&bgcolor=%23111111&color=%230F9D58&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0" frameborder="0" scrolling="no" class="cal-embed"></iframe>
            </div>
          </section>
        </div>
        <div class="side-col">
          ${renderEquipmentCard()}
          <section class="card action-card">
            <div class="action-icon">📋</div>
            <h3>Coverage Beats</h3>
            <p>15 beats assigned in pairs — see who covers what.</p>
            <button class="btn-primary" style="background:var(--indepth)" data-nav="beats">View Beats →</button>
          </section>
          <section class="card action-card">
            <div class="action-icon">🎥</div>
            <h3>Story Planning Sheets</h3>
            <p>Plan your interviews, stand-up, and b-roll before you shoot.</p>
            <button class="btn-primary" style="background:var(--indepth)" data-nav="storyplans">Plan a Story →</button>
          </section>
          <section class="card action-card">
            <div class="action-icon">🏆</div>
            <h3>IASB Competition</h3>
            <p>Track competition entries and checklists.</p>
            <button class="btn-primary" style="background:var(--indepth)" data-nav="iasb">Open IASB Hub →</button>
          </section>
          <section class="card action-card">
            <div class="action-icon">📚</div>
            <h3>In-Depth Lessons</h3>
            <p>Anchoring, reporting, script writing, and package production.</p>
            <button class="btn-primary" style="background:var(--indepth)" data-lesson-course="indepth">Go to Lessons →</button>
          </section>
          ${renderQuickLinksCard('indepth')}
        </div>
      </div>
    </div>`;
}

const metKey = n => n.replace(/[.~*/\[\]]/g, '_');

function renderBeats() {
  const seasonEmoji = { fall: '🍂', winter: '❄️', spring: '🌸' };

  const beatRows = INDEPTH_BEATS.map(base => {
    const b      = getBeat(base.id);
    const assign = S.beatAssignments[b.id] || {};
    const pair   = [assign.student1, assign.student2].filter(Boolean).join(' & ') || '';
    const seasons = base.seasons.map(s => seasonEmoji[s]).join('');
    const open   = S.expandedBeat === b.id;
    const isEditing = _beatDraft?.id === b.id;

    const contactList = (b.contacts || []).map(c =>
      typeof c === 'string'
        ? (c.includes('@') ? { name: c, email: c } : { name: c, email: '' })
        : c);
    const met      = assign.met || {};
    const metCount = contactList.filter(c => met[metKey(c.name)]).length;
    const allMet   = contactList.length > 0 && metCount === contactList.length;

    const drafting = _contactDraft && _contactDraft.beatId === b.id;
    const contactFormHtml = `
      <div class="beat-contact-form">
        <input id="bc-name" class="form-input" placeholder="Name (e.g. Jane Smith (Chess Club))" value="${esc(_contactDraft?.name || '')}">
        <input id="bc-email" class="form-input" placeholder="email@sacs.k12.in.us (optional)" value="${esc(_contactDraft?.email || '')}">
        <button class="btn-sm" onclick="beatContactSave()">Save</button>
        <button class="btn-secondary" onclick="beatContactCancel()" style="font-size:0.78rem;padding:4px 10px">Cancel</button>
      </div>`;

    const meetRows = contactList.map((c, i) => {
      if (drafting && _contactDraft.idx === i) return contactFormHtml;
      const k    = metKey(c.name);
      const done = !!met[k];
      const nameHtml = c.email ? `<a href="mailto:${esc(c.email)}" class="beat-contact-link">${esc(c.name)}</a>` : esc(c.name);
      return `
        <div class="beat-meet-item">
          <label class="beat-meet-row ${done ? 'done' : ''}">
            <input type="checkbox" class="beat-met-check" data-beat-id="${b.id}" data-met-key="${esc(k)}" ${done ? 'checked' : ''}>
            <span>${nameHtml}</span>
          </label>
          <button class="beat-contact-editbtn" title="Edit contact" onclick="beatContactEdit(${b.id},${i})">✎</button>
        </div>`;
    }).join('');

    const editForm = isEditing ? `
      <div class="beat-edit-form">
        <div class="beat-edit-row">
          <label class="beat-edit-label">Beat Name</label>
          <input id="beat-edit-name" class="form-input" value="${esc(_beatDraft.name)}" style="font-size:0.85rem">
        </div>
        <div class="beat-edit-row">
          <label class="beat-edit-label">Covers</label>
          <div class="beat-edit-covers">
            ${_beatDraft.covers.map((cov, i) => `
              <div style="display:flex;gap:4px;align-items:center">
                <input class="beat-edit-cover-input form-input" value="${esc(cov)}" placeholder="Topic or club" style="font-size:0.8rem;flex:1">
                <button class="ql-rm-btn" onclick="beatRemoveCover(${i})">✕</button>
              </div>`).join('')}
            <button class="ql-add-link" onclick="beatAddCover()">+ Add Cover</button>
          </div>
        </div>
        <div class="beat-edit-row">
          <label class="beat-edit-label">Contacts</label>
          <div class="beat-edit-contacts">
            ${_beatDraft.contacts.map((c, i) => `
              <div class="beat-edit-contact-row" style="display:flex;gap:4px;align-items:center">
                <input class="beat-contact-name form-input" value="${esc(c.name)}" placeholder="Name" style="font-size:0.8rem;flex:1">
                <input class="beat-contact-email form-input" value="${esc(c.email)}" placeholder="email@sacs.k12.in.us" style="font-size:0.8rem;flex:1.5">
                <button class="ql-rm-btn" onclick="beatRemoveContact(${i})">✕</button>
              </div>`).join('')}
            <button class="ql-add-link" onclick="beatAddContact()">+ Add Contact</button>
          </div>
        </div>
        <div style="display:flex;gap:6px;margin-top:10px">
          <button class="btn-primary" onclick="beatSave(${b.id})" style="font-size:0.82rem;padding:5px 14px">Save</button>
          <button class="btn-secondary" onclick="beatCancelEdit()" style="font-size:0.82rem;padding:5px 14px">Cancel</button>
        </div>
      </div>` : '';

    const expandedBody = open ? `
      <div class="beat-expanded">
        ${isEditing ? editForm : `
          <div class="beat-expanded-topics">${(b.covers || []).map(esc).join('  ·  ')}</div>
          <div class="beat-meet">
            <div class="beat-meet-head">Advisor Check-Ins
              ${contactList.length ? `<span class="beat-meet-count ${allMet ? 'complete' : ''}">${allMet ? '✓ all met' : `${metCount} of ${contactList.length} met`}</span>` : ''}
            </div>
            ${contactList.length
              ? `<div class="beat-meet-list">${meetRows}</div>`
              : `<div class="beat-meet-empty">No advisors listed yet — your first job on this beat is finding out who runs each of these. Know someone? Add them below.</div>`}
            ${drafting && _contactDraft.idx === -1
              ? contactFormHtml
              : `<button class="ql-add-link" onclick="beatContactAdd(${b.id})" style="margin-top:6px;align-self:flex-start">+ Add Contact</button>`}
          </div>
          ${S.teacherMode ? `
            <div class="beat-assign-inline">
              <input class="form-input beat-s1-input" data-beat-id="${b.id}" placeholder="Student 1" value="${assign.student1 || ''}">
              <input class="form-input beat-s2-input" data-beat-id="${b.id}" placeholder="Student 2" value="${assign.student2 || ''}">
              <button class="btn-sm beat-save-btn" data-beat-id="${b.id}">Save</button>
              <button class="btn-secondary" onclick="beatStartEdit(${b.id})" style="font-size:0.78rem;padding:4px 10px">Edit Beat</button>
            </div>` : ''}
        `}
      </div>` : '';

    return `
      <div class="beat-row ${open ? 'open' : ''}" data-beat-toggle="${b.id}">
        <div class="beat-row-main">
          <span class="beat-row-num">${String(b.id).padStart(2,'0')}</span>
          <span class="beat-row-icon" style="color:${base.color}">${base.icon}</span>
          <span class="beat-row-name">${esc(b.name)}</span>
          <span class="beat-row-seasons">${seasons}</span>
          ${contactList.length ? `<span class="beat-row-met ${allMet ? 'complete' : ''}" title="Advisors met">${allMet ? '✓ all met' : `${metCount}/${contactList.length}`}</span>` : ''}
          <span class="beat-row-pair">${pair || '<span class="beat-row-empty">Unassigned</span>'}</span>
          <span class="beat-row-chevron">${open ? '▾' : '▸'}</span>
        </div>
        ${expandedBody}
      </div>`;
  }).join('');

  return `
    ${navBar('indepth')}
    <div class="class-page">
      <button class="back-btn" data-nav="indepth">← Back to In-Depth</button>
      <div class="class-header" style="margin-top:16px">
        <div>
          <h1>Coverage Beats</h1>
          <p>15 beats — each pair covers one beat all year. ${S.teacherMode ? 'Click a row to expand, assign students, and track advisor check-ins.' : 'Click a row to see what it covers and check off your advisor meetings.'}</p>
        </div>
      </div>
      <section class="card beat-howto">
        <div class="beat-howto-grid">
          <div class="beat-howto-step"><span class="beat-howto-num">1</span><div><strong>Meet every advisor.</strong> Sit down with each teacher listed on your beat, introduce yourselves as the pair covering their area, and check them off as you go. If your beat is missing an advisor — find out who it is and add them as a contact.</div></div>
          <div class="beat-howto-step"><span class="beat-howto-num">2</span><div><strong>Ask what's coming up.</strong> Events, competitions, meetings — anything this season that could turn into a story.</div></div>
          <div class="beat-howto-step"><span class="beat-howto-num">3</span><div><strong>Find a student leader.</strong> Get the name of an officer or captain in each club you can go to directly all year.</div></div>
          <div class="beat-howto-step"><span class="beat-howto-num">4</span><div><strong>Get on the email list.</strong> If a club sends updates to its members, ask to be added — and have your teacher added too.</div></div>
        </div>
      </section>
      <section class="card">
        <div class="beat-list">${beatRows}</div>
      </section>
    </div>`;
}

// ── Story Planning Sheets ────────────────────────────────────
const BROLL_ITEMS = [
  { key: 'establishing',  label: 'Establishing Shots' },
  { key: 'wide',          label: 'Wide Shots' },
  { key: 'medium',        label: 'Medium Shots' },
  { key: 'closeup',       label: 'Close-Ups' },
  { key: 'naturalSound',  label: 'Natural Sound Opportunities' },
  { key: 'action',        label: 'Action Shots' },
  { key: 'reaction',      label: 'Reaction Shots' },
  { key: 'interviewEnv',  label: 'Interview Environment' },
  { key: 'sequence',      label: 'Sequence Shots (wide, medium, close-up)' },
  { key: 'signage',       label: 'Signage / Logos / Location Identifiers' },
];

let _storyPlanDraft = null;

function blankStoryPlan() {
  return {
    id: null,
    reporter: '', title: '', whatAbout: '', whyCare: '',
    airDate: '',
    interviews: [
      { name: '', title: '', questions: '' },
      { name: '', title: '', questions: '' },
      { name: '', title: '', questions: '' },
    ],
    standupWhere: '',
    broll: {},
    brollOther: '',
    production: '',
    createdBy: '',
    approved: false,
    approvedAt: null,
    archived: false,
    suggestions: [],
  };
}

function storyPlanIsOwner(p) {
  if (!p || !p.createdBy) return true;
  const me = (localStorage.getItem('hm_student_name') || '').trim().toLowerCase();
  return !!me && me === String(p.createdBy).trim().toLowerCase();
}

function storyPlanCanEdit(p) {
  return S.teacherMode || storyPlanIsOwner(p);
}

const LIST_CACHE_MS = 5 * 60 * 1000; // reuse fetched lists for 5 min unless a save forces a refresh

async function loadStoryPlans(force = false) {
  const db = getDB();
  if (!db) return;
  if (!force && S.storyPlansLoadedAt && Date.now() - S.storyPlansLoadedAt < LIST_CACHE_MS) return;
  try {
    const snap = await db.collection('hm_story_plans').orderBy('updatedAt', 'desc').get();
    trackUsage('reads', snap.size || 1);
    S.storyPlans = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    S.storyPlansLoadedAt = Date.now();
    if (S.view === 'storyplans') render();
  } catch(e) { console.error('story plans load failed', e); }
}

function storyPlanStartNew() {
  const createdBy = rundownEditorName();
  _storyPlanDraft = { ...blankStoryPlan(), createdBy, reporter: createdBy === 'Teacher' ? '' : createdBy };
  S.expandedStoryPlan = 'new';
  render();
}

function storyPlanStartEdit(id) {
  const p = (S.storyPlans || []).find(x => x.id === id);
  if (!p) return;
  _storyPlanDraft = {
    id,
    reporter: p.reporter || '', title: p.title || '',
    whatAbout: p.whatAbout || '', whyCare: p.whyCare || '',
    airDate: p.airDate || '',
    interviews: [0, 1, 2].map(i => ({
      name:      p.interviews?.[i]?.name      || '',
      title:     p.interviews?.[i]?.title     || '',
      questions: p.interviews?.[i]?.questions || '',
    })),
    standupWhere: p.standupWhere || '',
    broll: { ...(p.broll || {}) },
    brollOther: p.brollOther || '',
    production: p.production || '',
    createdBy: p.createdBy || '',
    approved: !!p.approved,
    approvedAt: p.approvedAt || null,
    archived: !!p.archived,
    suggestions: [...(p.suggestions || [])],
  };
  S.expandedStoryPlan = id;
  render();
}

function storyPlanCancelEdit() {
  _storyPlanDraft = null;
  S.expandedStoryPlan = null;
  render();
}

function storyPlanSyncFromDom() {
  if (!_storyPlanDraft) return;
  const d = _storyPlanDraft;
  d.reporter    = shortenName(val('story-reporter'));
  d.title       = val('story-title');
  d.whatAbout   = val('story-whatabout');
  d.whyCare     = val('story-whycare');
  d.airDate     = val('story-airdate');
  d.interviews  = [0, 1, 2].map(i => ({
    name:      val(`story-iv-${i}-name`),
    title:     val(`story-iv-${i}-title`),
    questions: val(`story-iv-${i}-questions`),
  }));
  d.standupWhere = val('story-standup');
  const broll = {};
  BROLL_ITEMS.forEach(item => {
    const el = document.getElementById(`story-broll-${item.key}`);
    if (el && el.checked) broll[item.key] = true;
  });
  d.broll = broll;
  d.brollOther = val('story-broll-other');
  d.production = val('story-production');
}

async function storyPlanSave() {
  storyPlanSyncFromDom();
  const d = _storyPlanDraft;
  if (!d) return;
  if (!d.reporter || !d.title) { showToast('Please add a reporter name and story title.'); return; }
  const data = {
    reporter: d.reporter, title: d.title, whatAbout: d.whatAbout, whyCare: d.whyCare,
    airDate: d.airDate,
    interviews: d.interviews, standupWhere: d.standupWhere,
    broll: d.broll, brollOther: d.brollOther, production: d.production,
    createdBy: d.createdBy || (S.teacherMode ? 'Teacher' : rundownEditorName()),
    approved: !!d.approved, approvedAt: d.approvedAt || null,
    archived: !!d.archived,
    suggestions: d.suggestions || [],
    updatedAt: new Date().toISOString(),
  };
  const db = getDB();
  if (db) {
    try {
      if (d.id) {
        await db.collection('hm_story_plans').doc(d.id).set(data, { merge: true });
      } else {
        data.createdAt = data.updatedAt;
        await db.collection('hm_story_plans').add(data);
      }
      trackUsage('writes');
    } catch(e) { showToast('Save failed.'); console.error(e); return; }
  }
  _storyPlanDraft = null;
  S.expandedStoryPlan = null;
  showToast('Story plan saved.');
  loadStoryPlans(true);
}

async function storyPlanDelete(id) {
  if (!confirm('Delete this story plan? This cannot be undone.')) return;
  _storyPlanDraft = null;
  S.expandedStoryPlan = null;
  const db = getDB();
  if (db) {
    try { await db.collection('hm_story_plans').doc(id).delete(); trackUsage('writes'); }
    catch(e) { showToast('Delete failed.'); console.error(e); return; }
  }
  showToast('Story plan deleted.');
  loadStoryPlans(true);
}

async function storyPlanSetApproved(id, approved) {
  const p = (S.storyPlans || []).find(x => x.id === id);
  const approvedAt = approved ? new Date().toISOString() : null;
  if (p) { p.approved = approved; p.approvedAt = approvedAt; }
  if (_storyPlanDraft && _storyPlanDraft.id === id) { _storyPlanDraft.approved = approved; _storyPlanDraft.approvedAt = approvedAt; }
  const db = getDB();
  if (db) {
    try { await db.collection('hm_story_plans').doc(id).set({ approved, approvedAt }, { merge: true }); trackUsage('writes'); }
    catch(e) { showToast('Update failed.'); console.error(e); return; }
  }
  showToast(approved ? 'Story plan approved!' : 'Approval removed.');
  render();
}

async function storyPlanSetArchived(id, archived) {
  const p = (S.storyPlans || []).find(x => x.id === id);
  if (p) p.archived = archived;
  if (_storyPlanDraft && _storyPlanDraft.id === id) _storyPlanDraft.archived = archived;
  const db = getDB();
  if (db) {
    try { await db.collection('hm_story_plans').doc(id).set({ archived }, { merge: true }); trackUsage('writes'); }
    catch(e) { showToast('Update failed.'); console.error(e); return; }
  }
  showToast(archived ? 'Story plan archived.' : 'Story plan restored.');
  render();
}

async function storyPlanAddToRundown(id) {
  const p = (S.storyPlans || []).find(x => x.id === id);
  if (!p || !p.approved || !p.airDate || p.addedToRundown) return;
  const db = getDB();
  if (!db) return;
  const wk = weekKey(mondayOf(new Date(p.airDate + 'T00:00:00')));
  let existing;
  try {
    const doc = await db.collection('hm_indepth_rundown').doc(wk).get();
    existing = doc.exists ? doc.data().packages : undefined;
  } catch(e) { showToast('Could not read rundown.'); console.error(e); return; }
  const items = Array.isArray(existing) ? [...existing] : (existing ? [{ type: 'VO', topic: existing, student: '' }] : []);
  items.push({ type: 'VO', topic: p.title, student: p.reporter });
  try {
    await db.collection('hm_indepth_rundown').doc(wk).set({ packages: items }, { merge: true });
    await db.collection('hm_rundown_edits').add({
      at: new Date().toISOString(),
      week: wk,
      role: 'packages',
      by: rundownEditorName(),
      before: rundownValToStr(existing),
      after: rundownValToStr(items),
    });
    await db.collection('hm_story_plans').doc(id).set({ addedToRundown: true }, { merge: true });
    trackUsage('writes', 3);
  } catch(e) { showToast('Could not add to rundown.'); console.error(e); return; }
  S.rundownData[wk] = { ...(S.rundownData[wk] || {}), packages: items };
  p.addedToRundown = true;
  if (_storyPlanDraft && _storyPlanDraft.id === id) _storyPlanDraft.addedToRundown = true;
  showToast('Added to the show rundown!');
  render();
}

async function storyPlanAddSuggestion(id) {
  const text = val('story-suggestion-input');
  if (!text) return;
  const by = rundownEditorName();
  const p = (S.storyPlans || []).find(x => x.id === id);
  const suggestions = [...((p && p.suggestions) || []), { text, by, at: new Date().toISOString() }];
  if (p) p.suggestions = suggestions;
  if (_storyPlanDraft && _storyPlanDraft.id === id) _storyPlanDraft.suggestions = suggestions;
  const db = getDB();
  if (db) {
    try { await db.collection('hm_story_plans').doc(id).set({ suggestions }, { merge: true }); trackUsage('writes'); }
    catch(e) { showToast('Could not add suggestion.'); console.error(e); return; }
  }
  showToast('Suggestion sent.');
  render();
}

function renderStoryPlanForm(d, editable) {
  d = d || blankStoryPlan();
  const ro = editable ? '' : 'disabled';
  const interviewBlocks = d.interviews.map((iv, i) => `
    <div class="story-interview-block">
      <div class="story-interview-head">Person #${i + 1}${i === 2 ? ' <span class="hint">(only if necessary)</span>' : ''}</div>
      <div class="form-group">
        <label>Name</label>
        <input id="story-iv-${i}-name" type="text" value="${esc(iv.name)}" placeholder="Who are you interviewing?" ${ro}>
      </div>
      <div class="form-group">
        <label>Title / Role</label>
        <input id="story-iv-${i}-title" type="text" value="${esc(iv.title)}" placeholder="e.g. Principal, Team Captain, Coach" ${ro}>
      </div>
      <div class="form-group">
        <label>Questions <span class="hint">(at least 4, one per line)</span></label>
        <textarea id="story-iv-${i}-questions" rows="4" placeholder="1. ...&#10;2. ...&#10;3. ...&#10;4. ..." ${ro}>${esc(iv.questions)}</textarea>
      </div>
    </div>`).join('');

  const brollChecks = BROLL_ITEMS.map(item => `
    <label class="story-broll-item">
      <input type="checkbox" id="story-broll-${item.key}" ${d.broll?.[item.key] ? 'checked' : ''} ${ro}>
      <span>${item.label}</span>
    </label>`).join('');

  const suggestions = d.id ? `
      <h3 class="story-section-title">Suggestions ${(d.suggestions || []).length ? `<span class="hint">(${d.suggestions.length})</span>` : ''}</h3>
      <div class="story-suggestions">
        ${(d.suggestions || []).length
          ? d.suggestions.map(s => `
            <div class="story-suggestion-item">
              <div class="story-suggestion-text">${esc(s.text)}</div>
              <div class="story-suggestion-meta">— ${esc(s.by || 'Anonymous')}${s.at ? ', ' + fmtDate(s.at.slice(0, 10)) : ''}</div>
            </div>`).join('')
          : `<div class="beat-meet-empty">No suggestions yet.</div>`}
        ${!editable ? `
          <div class="story-suggestion-form">
            <textarea id="story-suggestion-input" rows="2" placeholder="Suggest a change or addition..."></textarea>
            <button class="btn-secondary" id="story-plan-suggest-btn" style="margin-top:8px">Submit Suggestion</button>
          </div>` : ''}
      </div>` : '';

  return `
    <div class="story-plan-form">
      ${!editable ? `<div class="story-readonly-notice">👀 You're viewing ${esc(d.reporter || 'this reporter')}'s story plan. Only ${esc(d.createdBy || 'the reporter')} and your teacher can change it — leave a suggestion below instead.</div>` : ''}
      <div class="form-group">
        <label>Reporter (First and Last Name)</label>
        <input id="story-reporter" type="text" value="${esc(d.reporter)}" placeholder="First and last name" ${ro}>
      </div>
      <div class="form-group">
        <label>Story Idea / Title</label>
        <input id="story-title" type="text" value="${esc(d.title)}" placeholder="What's this story called?" ${ro}>
      </div>
      <div class="form-group">
        <label>Potential Date to Be Played</label>
        <input id="story-airdate" type="date" value="${esc(d.airDate)}" ${ro}>
      </div>
      <div class="form-group">
        <label>What is this story about?</label>
        <textarea id="story-whatabout" rows="3" placeholder="Give a quick summary." ${ro}>${esc(d.whatAbout)}</textarea>
      </div>
      <div class="form-group">
        <label>Why should our viewers care? What's the impact?</label>
        <textarea id="story-whycare" rows="3" placeholder="Why does this matter to your audience?" ${ro}>${esc(d.whyCare)}</textarea>
      </div>

      <h3 class="story-section-title">Interviews <span class="hint">(at least #1–#2 — #3 only if necessary)</span></h3>
      ${interviewBlocks}

      <h3 class="story-section-title">Stand-Up</h3>
      <div class="form-group">
        <label>Where will you stand? Why is this location relevant to the story?</label>
        <textarea id="story-standup" rows="3" placeholder="Describe your stand-up location and why it fits the story." ${ro}>${esc(d.standupWhere)}</textarea>
      </div>

      <h3 class="story-section-title">I Need B-Roll Footage Of…</h3>
      <p class="hint" style="margin:-6px 0 10px;font-size:0.8rem">Complemental, not supplemental — your visuals should add information your narration can't provide.</p>
      <div class="story-broll-grid">${brollChecks}</div>
      <div class="form-group" style="margin-top:12px">
        <label>Other shots?</label>
        <input id="story-broll-other" type="text" value="${esc(d.brollOther)}" placeholder="Anything else you need to capture?" ${ro}>
      </div>

      <h3 class="story-section-title">Other Things?</h3>
      <div class="form-group">
        <label>Graphics, music, audio, lower thirds, titles, animations, or other production needs?</label>
        <textarea id="story-production" rows="3" placeholder="Any other production notes..." ${ro}>${esc(d.production)}</textarea>
      </div>

      ${suggestions}

      <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">
        ${editable ? `<button class="btn-primary" id="story-plan-save-btn" style="background:var(--indepth)">Save Plan</button>` : ''}
        <button class="btn-secondary" id="story-plan-cancel-btn">${editable ? 'Cancel' : 'Close'}</button>
        ${d.id && S.teacherMode ? `<button class="btn-danger" id="story-plan-delete-btn" style="margin-left:auto">Delete</button>` : ''}
      </div>
    </div>`;
}

function renderStoryPlans() {
  const allPlans = S.storyPlans || [];
  const creating = S.expandedStoryPlan === 'new';
  const filter = S.storyPlanFilter || 'active';
  const activeCount = allPlans.filter(p => !p.archived).length;
  const archivedCount = allPlans.filter(p => p.archived).length;
  const plans = allPlans.filter(p => filter === 'archived' ? !!p.archived : !p.archived);

  const rows = plans.map(p => {
    const editing = S.expandedStoryPlan === p.id;
    const updated = p.updatedAt ? fmtDate(p.updatedAt.slice(0, 10)) : '';
    const suggestCount = (p.suggestions || []).length;
    return `
      <div class="story-plan-row ${editing ? 'open' : ''}${p.archived ? ' story-plan-archived' : ''}">
        <div class="story-plan-row-main" data-story-toggle="${esc(p.id)}">
          <span class="story-plan-title">${esc(p.title || '(untitled story)')}</span>
          <span class="story-plan-reporter">${esc(p.reporter || 'Unknown reporter')}</span>
          ${p.airDate ? `<span class="story-plan-airdate">🗓️ ${fmtDate(p.airDate)}</span>` : ''}
          ${suggestCount ? `<span class="story-suggest-badge">💬 ${suggestCount}</span>` : ''}
          ${S.teacherMode
            ? `<button class="btn-sm story-approve-btn ${p.approved ? 'approved' : ''}" data-story-approve="${esc(p.id)}">${p.approved ? '✓ Approved' : 'Approve'}</button>`
            : (p.approved ? `<span class="story-approved-badge">✓ Approved</span>` : '')}
          ${p.approved && p.airDate
            ? (p.addedToRundown
                ? `<span class="story-approved-badge">📅 In Rundown</span>`
                : `<button class="btn-sm story-approve-btn" data-story-add-rundown="${esc(p.id)}">+ Add to Rundown</button>`)
            : ''}
          ${S.teacherMode
            ? `<button class="btn-sm story-archive-btn" data-story-archive="${esc(p.id)}" data-archive-to="${p.archived ? 'false' : 'true'}"
                 title="${p.archived ? 'Move back to the active list' : 'Move off the active list — nothing is deleted'}">${p.archived ? '↩ Restore' : '🗄 Archive'}</button>`
            : ''}
          <span class="story-plan-updated">${updated}</span>
          <span class="beat-row-chevron">${editing ? '▾' : '▸'}</span>
        </div>
        ${editing ? renderStoryPlanForm(_storyPlanDraft, storyPlanCanEdit(_storyPlanDraft)) : ''}
      </div>`;
  }).join('');

  return `
    ${navBar('indepth')}
    <div class="class-page">
      <button class="back-btn" data-nav="indepth">← Back to In-Depth</button>
      <div class="class-header" style="margin-top:16px">
        <div>
          <h1>Story Planning Sheets</h1>
          <p>Plan your interviews, stand-up, and b-roll before you shoot. Fill one out for every package.</p>
        </div>
      </div>
      <section class="card">
        ${creating
          ? `<div class="story-plan-row open">${renderStoryPlanForm(_storyPlanDraft, true)}</div>`
          : `<button class="btn-primary" id="story-plan-new-btn" style="background:var(--indepth)">+ New Story Plan</button>`}
        <div class="story-plan-tabs" style="margin-top:16px">
          <button class="story-plan-tab ${filter === 'active' ? 'active' : ''}" data-story-filter="active">Active (${activeCount})</button>
          <button class="story-plan-tab ${filter === 'archived' ? 'active' : ''}" data-story-filter="archived">🗄 Archived (${archivedCount})</button>
        </div>
        <div class="story-plan-list" style="margin-top:10px">
          ${rows || (creating ? '' : `<div class="beat-meet-empty">${filter === 'archived' ? 'No archived story plans.' : 'No active story plans. Click "+ New Story Plan" to start one.'}</div>`)}
        </div>
      </section>
    </div>`;
}

async function loadRundownData() {
  const db = getDB();
  if (!db) return;
  try {
    const weeks = getRundownWeeks().map(weekKey);
    const snaps = await Promise.all(weeks.map(w => db.collection('hm_indepth_rundown').doc(w).get()));
    const map = {};
    snaps.forEach(snap => { if (snap.exists) map[snap.id] = snap.data(); });
    S.rundownData = map;
    if (S.view === 'indepth') render();
  } catch(e) { console.error('rundown load failed', e); }
}

function rundownValToStr(val) {
  if (Array.isArray(val)) {
    if (val.length && typeof val[0] === 'object') {
      return val.filter(i => i && (i.topic || i.student))
        .map(i => [i.type, i.topic, i.student].filter(Boolean).join(' '))
        .join('; ');
    }
    return val.filter(Boolean).join(' & ');
  }
  return String(val || '');
}

function rundownEditorName() {
  if (S.teacherMode) return 'Teacher';
  let n = localStorage.getItem('hm_student_name') || '';
  while (!n) {
    n = shortenName((prompt('Your first and last name? It shows next to your edits so your teacher knows who changed what.') || '').trim());
    if (!n) alert('Please enter your first and last name to continue editing the rundown.');
  }
  localStorage.setItem('hm_student_name', n);
  return n;
}

async function saveRundownCell(weekKey, roleKey, value) {
  const db = getDB();
  if (!db) return;
  if (!S.rundownData[weekKey]) S.rundownData[weekKey] = {};
  const beforeStr = rundownValToStr(S.rundownData[weekKey][roleKey]);
  const afterStr  = rundownValToStr(value);
  S.rundownData[weekKey][roleKey] = value;
  if (beforeStr === afterStr) return;
  const by = rundownEditorName();
  try {
    await db.collection('hm_indepth_rundown').doc(weekKey).set(S.rundownData[weekKey], { merge: true });
    await db.collection('hm_rundown_edits').add({
      at: new Date().toISOString(),
      week: weekKey,
      role: roleKey,
      by,
      before: beforeStr,
      after: afterStr,
    });
  } catch(e) { console.error('rundown save failed', e); }
}

async function loadRundownLog() {
  const db = getDB();
  if (!db) return;
  try {
    const snap = await db.collection('hm_rundown_edits').orderBy('at', 'desc').limit(40).get();
    S.rundownLog = snap.docs.map(d => d.data());
    if (S.view === 'indepth') render();
  } catch(e) { console.error('rundown log load failed', e); }
}

async function loadShowSchedule() {
  const db = getDB();
  if (!db) return;
  try {
    const doc = await db.collection('hm_config').doc('show_schedule').get();
    S.showSchedule = (doc.exists && Array.isArray(doc.data().skipped)) ? doc.data().skipped : [];
    render();
  } catch(e) { console.error('show schedule load failed', e); }
}

async function toggleShowDate(dateStr) {
  const skipped = [...(S.showSchedule || [])];
  const idx = skipped.indexOf(dateStr);
  if (idx >= 0) skipped.splice(idx, 1);
  else skipped.push(dateStr);
  S.showSchedule = skipped;
  render();
  const db = getDB();
  if (db) {
    try {
      await db.collection('hm_config').doc('show_schedule').set({ skipped });
    } catch(e) { console.error('show schedule save failed', e); }
  }
}

// ── Recently Played on The Point ─────────────────────────────
// Lightweight, standalone — reuses wcyt.org's public BSI feed + curated art
// overrides directly (no Firebase, no CORS proxy, none of playlist-widget.js's
// audio/Last.fm/DJ-panel overhead). Only polls while the Radio page is open.
const POINT_RECENT_URL  = 'https://raw.githubusercontent.com/dunnand/WCYT-NowPlaying/main/point_recent.json';
const POINT_ART_URL     = '/images/art_overrides.json';
const POINT_POLL_MS     = 60 * 1000;
const POINT_BLOCKED     = ['liner', 'legal id', 'btyb', 'sponsor'];
let pointArtOverrides   = null;

function pointIsBlocked(artist, title) {
  const s = ((artist || '') + ' ' + (title || '')).toLowerCase();
  return POINT_BLOCKED.some(term => s.includes(term));
}

async function loadPointArtOverrides() {
  if (pointArtOverrides) return pointArtOverrides;
  try {
    const res = await fetch(POINT_ART_URL, { cache: 'no-cache' });
    const data = await res.json();
    pointArtOverrides = data.overrides || {};
  } catch { pointArtOverrides = {}; }
  return pointArtOverrides;
}

function pointArtFor(artist, title, album) {
  const overrides = pointArtOverrides || {};
  const songKey = (artist + '|' + title).toLowerCase();
  if (overrides[songKey]) return overrides[songKey];
  if (album) {
    const m = album.match(/^(.+?)\s*[•·]\s*\d{4}\s*$/);
    const albumKey = (artist + '|' + (m ? m[1].trim() : album)).toLowerCase();
    if (overrides[albumKey]) return overrides[albumKey];
  }
  return null;
}

async function loadPointRecentSongs() {
  try {
    await loadPointArtOverrides();
    const res = await fetch(POINT_RECENT_URL + '?t=' + Date.now(), { cache: 'no-store' });
    const data = await res.json();
    const now    = data.now || {};
    const nowKey = ((now.artist || '') + '|' + (now.title || '')).toLowerCase();

    const recent = (data.recent || [])
      .filter(s => !pointIsBlocked(s.artist, s.title))
      .filter(s => ((s.artist || '') + '|' + (s.title || '')).toLowerCase() !== nowKey)
      .slice(0, 5)
      .map(s => ({
        artist: s.artist,
        title:  s.title,
        time:   s.time,
        art:    pointArtFor(s.artist, s.title, s.album || ''),
      }));

    const nowItem = (now.title && !pointIsBlocked(now.artist, now.title))
      ? { artist: now.artist, title: now.title, live: true, art: pointArtFor(now.artist, now.title, now.album || '') }
      : null;

    S.pointRecentSongs = nowItem ? [nowItem, ...recent] : recent;
    if (S.view === 'radio') render();
  } catch(e) { console.error('recently played load failed', e); }
}

function startPointRecentPolling() {
  if (S.pointRecentTimer) return;
  loadPointRecentSongs();
  S.pointRecentTimer = setInterval(loadPointRecentSongs, POINT_POLL_MS);
}

function stopPointRecentPolling() {
  if (S.pointRecentTimer) { clearInterval(S.pointRecentTimer); S.pointRecentTimer = null; }
}

async function loadBeatAssignments(force = false) {
  const db = getDB();
  if (!db) return;
  if (!force && S.beatsLoadedAt && Date.now() - S.beatsLoadedAt < LIST_CACHE_MS) return;
  try {
    const snap = await db.collection('hm_indepth_beats').get();
    trackUsage('reads', snap.size || 1);
    const map = {};
    snap.forEach(doc => { map[parseInt(doc.id)] = doc.data(); });
    S.beatAssignments = map;
    S.beatsLoadedAt = Date.now();
    if (S.view === 'indepth' || S.view === 'beat') render();
  } catch(e) { console.error('beat load failed', e); }
}

async function saveBeatAssignment(beatId, student1, student2) {
  const db = getDB();
  if (!db) return;
  try {
    await db.collection('hm_indepth_beats').doc(String(beatId)).set({ student1: student1.trim(), student2: student2.trim() }, { merge: true });
    S.beatAssignments[beatId] = { ...(S.beatAssignments[beatId] || {}), student1: student1.trim(), student2: student2.trim() };
    showToast('Beat assignment saved.');
    render();
  } catch(e) { showToast('Save failed.'); console.error(e); }
}

async function beatToggleMet(beatId, key, checked) {
  contactDraftSyncFromDom();
  const cur = S.beatAssignments[beatId] || {};
  const met = { ...(cur.met || {}) };
  if (checked) met[key] = true; else delete met[key];
  S.beatAssignments[beatId] = { ...cur, met };
  render();
  const db = getDB();
  if (!db) return;
  try {
    await db.collection('hm_indepth_beats').doc(String(beatId)).set({ met }, { merge: true });
    trackUsage('writes', 1);
  } catch(e) { console.error('met save failed', e); }
}

async function loadBeatOverrides() {
  const db = getDB();
  if (!db) return;
  await cachedLoad('beats', async () => {
    const snap = await db.collection('hm_beat_info').get();
    trackUsage('reads', snap.size || 1);
    const map = {};
    snap.forEach(doc => { map[parseInt(doc.id)] = doc.data(); });
    return map;
  }, map => { S.beatOverrides = map; });
}

function getBeat(id) {
  const base = INDEPTH_BEATS.find(b => b.id === id) || {};
  const over = S.beatOverrides[id] || {};
  return {
    ...base,
    name:     over.name     ?? base.name,
    covers:   over.covers   ?? base.covers,
    contacts: over.contacts ?? base.contacts.map(c => typeof c === 'string'
      ? (c.includes('@') ? { name: c, email: c } : { name: c, email: '' })
      : c),
  };
}

let _beatDraft = null;
let _contactDraft = null;

function contactDraftSyncFromDom() {
  if (!_contactDraft) return;
  const n = document.getElementById('bc-name');
  const e = document.getElementById('bc-email');
  if (n) _contactDraft.name = n.value;
  if (e) _contactDraft.email = e.value;
}

function beatContactAdd(beatId) {
  contactDraftSyncFromDom();
  _contactDraft = { beatId, idx: -1, name: '', email: '' };
  render();
  setTimeout(() => document.getElementById('bc-name')?.focus(), 50);
}

function beatContactEdit(beatId, idx) {
  const c = (getBeat(beatId).contacts || [])[idx];
  if (!c) return;
  _contactDraft = {
    beatId, idx,
    name:  typeof c === 'string' ? c : (c.name || ''),
    email: typeof c === 'string' ? (c.includes('@') ? c : '') : (c.email || ''),
  };
  render();
  setTimeout(() => document.getElementById('bc-name')?.focus(), 50);
}

function beatContactCancel() { _contactDraft = null; render(); }

async function beatContactSave() {
  if (!_contactDraft) return;
  contactDraftSyncFromDom();
  const { beatId, idx } = _contactDraft;
  const name  = _contactDraft.name.trim();
  const email = _contactDraft.email.trim();
  if (!name) { showToast('Contact name required.'); return; }

  const contacts = (getBeat(beatId).contacts || []).map(c =>
    typeof c === 'string'
      ? { name: c, email: c.includes('@') ? c : '' }
      : { name: c.name || '', email: c.email || '' });
  let oldName = null;
  if (idx === -1) contacts.push({ name, email });
  else { oldName = contacts[idx].name; contacts[idx] = { name, email }; }

  S.beatOverrides[beatId] = { ...(S.beatOverrides[beatId] || {}), contacts };
  _contactDraft = null;
  render();

  const db = getDB();
  if (db) {
    try {
      await db.collection('hm_beat_info').doc(String(beatId)).set({ contacts }, { merge: true });
      trackUsage('writes', 1);
      // carry the check-in over if a checked-off contact was renamed
      const a = S.beatAssignments[beatId];
      if (oldName && oldName !== name && a?.met?.[metKey(oldName)]) {
        const met = { ...a.met };
        met[metKey(name)] = true;
        delete met[metKey(oldName)];
        S.beatAssignments[beatId] = { ...a, met };
        await db.collection('hm_indepth_beats').doc(String(beatId)).set({ met }, { merge: true });
        render();
      }
      showToast('Contact saved.');
    } catch(e) { showToast('Save failed.'); console.error(e); }
  }
}

function beatSyncFromDom() {
  if (!_beatDraft) return;
  const nameEl = document.getElementById('beat-edit-name');
  if (nameEl) _beatDraft.name = nameEl.value.trim();
  const covers = [];
  document.querySelectorAll('.beat-edit-cover-input').forEach(el => {
    const v = el.value.trim();
    if (v) covers.push(v);
  });
  _beatDraft.covers = covers;
  const contacts = [];
  document.querySelectorAll('.beat-edit-contact-row').forEach(el => {
    const name  = el.querySelector('.beat-contact-name').value.trim();
    const email = el.querySelector('.beat-contact-email').value.trim();
    if (name || email) contacts.push({ name: name || email, email });
  });
  _beatDraft.contacts = contacts;
}

function beatStartEdit(id) {
  const b = getBeat(id);
  _beatDraft = {
    id,
    name: b.name,
    covers: [...(b.covers || [])],
    contacts: (b.contacts || []).map(c =>
      typeof c === 'string'
        ? (c.includes('@') ? { name: c, email: c } : { name: c, email: '' })
        : { ...c }),
  };
  render();
}

function beatCancelEdit() { _beatDraft = null; render(); }

function beatAddCover() {
  beatSyncFromDom();
  _beatDraft.covers.push('');
  render();
  setTimeout(() => {
    const inputs = document.querySelectorAll('.beat-edit-cover-input');
    if (inputs.length) inputs[inputs.length - 1].focus();
  }, 50);
}

function beatRemoveCover(idx) {
  beatSyncFromDom();
  _beatDraft.covers.splice(idx, 1);
  render();
}

function beatAddContact() {
  beatSyncFromDom();
  _beatDraft.contacts.push({ name: '', email: '' });
  render();
  setTimeout(() => {
    const rows = document.querySelectorAll('.beat-edit-contact-row');
    if (rows.length) rows[rows.length - 1].querySelector('.beat-contact-name').focus();
  }, 50);
}

function beatRemoveContact(idx) {
  beatSyncFromDom();
  _beatDraft.contacts.splice(idx, 1);
  render();
}

async function beatSave(id) {
  beatSyncFromDom();
  if (!_beatDraft) return;
  const data = { name: _beatDraft.name, covers: _beatDraft.covers, contacts: _beatDraft.contacts };
  S.beatOverrides[id] = data;
  _beatDraft = null;
  const db = getDB();
  if (db) { await db.collection('hm_beat_info').doc(String(id)).set(data); trackUsage('writes', 1); }
  showToast('Beat updated.');
  render();
}

// ── YEARBOOK: Weekly Accomplishments (Shared Drive folders) ────
// After running createWeeklyAccomplishmentsForm() in Apps Script (Code.gs),
// paste the logged Form URL here to switch the card over to the form.
const YB_WEEKLY_FORM_URL  = 'https://docs.google.com/forms/d/e/1FAIpQLSdIGRXOtg1Id8hsmJvluoYZyOz-0N5_eBBs5RGoF1g3ahW9aA/viewform';
const YB_WEEKLY_DRIVE_URL = 'https://drive.google.com/drive/folders/11LNVkH8eykaitzbXhSTHNzVz1YkmtxoB';
const YB_WEEKLY_FOLDERS = [
  { label: 'Week 1 (Aug 5–Aug 7)',   start: '2026-08-05', end: '2026-08-07', folderId: '1TFPzjcReUZufpX1POtZkZC-yEV6PqUey' },
  { label: 'Week 2 (Aug 10–Aug 14)', start: '2026-08-10', end: '2026-08-14', folderId: '1M_RJN-LIkEIHQ9NQrwbDdc1iCYwE8PV1' },
  { label: 'Week 3 (Aug 17–Aug 21)', start: '2026-08-17', end: '2026-08-21', folderId: '1T4EcB8bmNZptz_E67Z40sxeFWZ-TM5a6' },
  { label: 'Week 4 (Aug 24–Aug 28)', start: '2026-08-24', end: '2026-08-28', folderId: '1oP6jKxlIaDjrDdnTpgQtJre7ycJqFvD-' },
  { label: 'Week 5 (Aug 31–Sep 4)',  start: '2026-08-31', end: '2026-09-04', folderId: '1CKIe2YlLq3hAbo2FAi8S3Xb9Aho9Uckg' },
  { label: 'Week 6 (Sep 7–Sep 11)',  start: '2026-09-07', end: '2026-09-11', folderId: '1C0F8-8EZ_7ALXGvZTXOVOzzh5q8S_WCA' },
  { label: 'Week 7 (Sep 14–Sep 18)', start: '2026-09-14', end: '2026-09-18', folderId: '1fKgRUkC_0fsGSXMZ3tn8WoDmotDJdOsK' },
  { label: 'Week 8 (Sep 21–Sep 25)', start: '2026-09-21', end: '2026-09-25', folderId: '1_3AWr3Cr5uFhCDAcpxXxoYH9z-UjqbJi' },
  { label: 'Week 9 (Sep 28–Oct 2)',  start: '2026-09-28', end: '2026-10-02', folderId: '1Y_7GE2ZTqDm8XbkghcJe33Bx6bWQZ0Tz' },
  { label: 'Week 10 (Oct 5–Oct 9)',  start: '2026-10-05', end: '2026-10-09', folderId: '1wEPasRKeLdHA06an_v1ExlM9wemmv2AW' },
  { label: 'Week 12 (Oct 19–Oct 23)', start: '2026-10-19', end: '2026-10-23', folderId: '16y09Qmns3c725dTFkJirmFwrXr0ruyB9' },
  { label: 'Week 13 (Oct 26–Oct 30)', start: '2026-10-26', end: '2026-10-30', folderId: '1zDYdNIjkiYIEKDZTnwcp0DU77Hovs7gx' },
  { label: 'Week 14 (Nov 2–Nov 6)',   start: '2026-11-02', end: '2026-11-06', folderId: '1LWvvryST_eyG1jfwOYpwdhjNruMcsTxH' },
  { label: 'Week 15 (Nov 9–Nov 13)',  start: '2026-11-09', end: '2026-11-13', folderId: '1MBs3AbzuIpaFb7j-IaSa2Ba2sIV7D_J4' },
  { label: 'Week 16 (Nov 16–Nov 20)', start: '2026-11-16', end: '2026-11-20', folderId: '1hCA8bSOxF8RR9_MGIvzDaJnBm3GGOhBb' },
  { label: 'Week 17 (Nov 23–Nov 27)', start: '2026-11-23', end: '2026-11-27', folderId: '1oQjI1xUxuafG0dpTXHp8z9j6ag734GvF' },
  { label: 'Week 18 (Nov 30–Dec 4)',  start: '2026-11-30', end: '2026-12-04', folderId: '1EBoCUbTzGdLNkFC9xUpnqV329AIDclcD' },
  { label: 'Week 19 (Dec 7–Dec 11)',  start: '2026-12-07', end: '2026-12-11', folderId: '1lE-hTcnTvAzFOvK5jUoMVqTDNeyqG6qj' },
  { label: 'Week 20 (Dec 14–Dec 18)', start: '2026-12-14', end: '2026-12-18', folderId: '1SYJo0oIYb3Ut-ZQ7-IStIFyhe21yzLYA' },
  // Second semester — folderId filled in via the Teacher Dashboard's
  // "Weekly Drive Folders" setup button (or createFutureWeeklyFolders()).
  { label: 'Week 21 (Jan 5–Jan 8)',   start: '2027-01-05', end: '2027-01-08', folderId: '' },
  { label: 'Week 22 (Jan 11–Jan 15)', start: '2027-01-11', end: '2027-01-15', folderId: '' },
  { label: 'Week 23 (Jan 18–Jan 22)', start: '2027-01-18', end: '2027-01-22', folderId: '' },
  { label: 'Week 24 (Jan 25–Jan 29)', start: '2027-01-25', end: '2027-01-29', folderId: '' },
  { label: 'Week 25 (Feb 1–Feb 5)',   start: '2027-02-01', end: '2027-02-05', folderId: '' },
  { label: 'Week 26 (Feb 8–Feb 12)',  start: '2027-02-08', end: '2027-02-12', folderId: '' },
  { label: 'Week 27 (Feb 15–Feb 19)', start: '2027-02-15', end: '2027-02-19', folderId: '' },
  { label: 'Week 28 (Feb 22–Feb 26)', start: '2027-02-22', end: '2027-02-26', folderId: '' },
  { label: 'Week 29 (Mar 1–Mar 5)',   start: '2027-03-01', end: '2027-03-05', folderId: '' },
  { label: 'Week 30 (Mar 8–Mar 12)',  start: '2027-03-08', end: '2027-03-12', folderId: '' },
  { label: 'Week 31 (Mar 15–Mar 19)', start: '2027-03-15', end: '2027-03-19', folderId: '' },
  { label: 'Week 32 (Mar 22–Mar 26)', start: '2027-03-22', end: '2027-03-26', folderId: '' },
  { label: 'Week 33 (Mar 29–Apr 2)',  start: '2027-03-29', end: '2027-04-02', folderId: '' },
  { label: 'Week 34 (Apr 5–Apr 9)',   start: '2027-04-05', end: '2027-04-09', folderId: '' },
  { label: 'Week 35 (Apr 12–Apr 16)', start: '2027-04-12', end: '2027-04-16', folderId: '' },
  { label: 'Week 36 (Apr 19–Apr 23)', start: '2027-04-19', end: '2027-04-23', folderId: '' },
  { label: 'Week 37 (Apr 26–Apr 30)', start: '2027-04-26', end: '2027-04-30', folderId: '' },
  { label: 'Week 38 (May 3–May 7)',   start: '2027-05-03', end: '2027-05-07', folderId: '' },
  { label: 'Week 39 (May 10–May 14)', start: '2027-05-10', end: '2027-05-14', folderId: '' },
  { label: 'Week 40 (May 17–May 21)', start: '2027-05-17', end: '2027-05-21', folderId: '' },
  { label: 'Week 41 (May 24–May 28)', start: '2027-05-24', end: '2027-05-28', folderId: '' },
];

function getCurrentYbWeek() {
  const today = new Date().toISOString().slice(0, 10);
  const current = YB_WEEKLY_FOLDERS.find(w => today >= w.start && today <= w.end);
  if (current) return { week: current, status: 'current' };
  const upcoming = YB_WEEKLY_FOLDERS.find(w => w.start > today);
  if (upcoming) return { week: upcoming, status: 'upcoming' };
  if (today < YB_WEEKLY_FOLDERS[0].start) return { week: YB_WEEKLY_FOLDERS[0], status: 'upcoming' };
  return { week: YB_WEEKLY_FOLDERS[YB_WEEKLY_FOLDERS.length - 1], status: 'past' };
}

// ── YEARBOOK ──────────────────────────────────────────────────
// Strips emoji/punctuation and normalizes "High School"/"H.S." so the same
// game re-entered on the source calendar with slightly different formatting
// collapses to one key, without merging genuinely different same-day games.
function normalizeYbTitle(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\bhigh school\b/g, 'hs')
    .replace(/\s+/g, ' ')
    .trim();
}

function allYbEvents() {
  const custom = (S.customYbEvents || []).map(e => ({ ...e, home: true, icon: YB_ICONS[e.type] || '📅' }));
  const base = [...YEARBOOK_EVENTS.map(e => ({ ...e, home: true })), ...custom];
  const covered = new Set(base.map(e => e.type + '|' + e.date));
  const seenCal = new Set();
  const fromCal = (S.calendarYbEvents || []).filter(e => {
    if (covered.has(e.type + '|' + e.date)) return false;
    const key = e.type + '|' + e.date + '|' + normalizeYbTitle(e.title);
    if (seenCal.has(key)) return false;
    seenCal.add(key);
    return true;
  });
  const all = [...base, ...fromCal];
  return S.ybShowAway ? all : all.filter(e => e.home !== false || YB_ALWAYS_SHOW.has(e.type));
}

function filterYbEvents() {
  const type  = document.getElementById('yb-type')?.value;
  const group = document.getElementById('yb-event-group');
  const sel   = document.getElementById('yb-event');
  if (!group || !sel) return;
  if (!type) { group.style.display = 'none'; return; }
  const now = new Date();
  const events = allYbEvents().filter(e => e.type === type && new Date(e.date + 'T23:59:00') >= now)
    .sort((a, b) => a.date.localeCompare(b.date));
  sel.innerHTML = events.length
    ? '<option value="">— Select an event —</option>' + events.map(e => `<option value="${e.id}">${e.icon} ${e.title} — ${fmtDate(e.date, false)}</option>`).join('')
    : '<option value="">No upcoming events of this type</option>';
  group.style.display = '';
}

function renderYearbook() {
  const myName  = localStorage.getItem('hm_yb_name')  || '';
  const now     = new Date();

  const allCoverage = S.yearbookCoverage || [];

  const mySignups = allCoverage.filter(
    s => s.studentName.toLowerCase() === myName.toLowerCase()
  );

  // Build type options — only show types that have at least one upcoming event
  const upcomingByType = {};
  allYbEvents().forEach(e => {
    if (new Date(e.date + 'T23:59:00') >= now) {
      if (!upcomingByType[e.type]) upcomingByType[e.type] = [];
      upcomingByType[e.type].push(e);
    }
  });
  const typeOrder = ['football','basketball_boys','basketball_girls','volleyball','soccer_boys','soccer_girls','golf_boys','golf_girls','baseball','softball','cross_country','swimming','tennis_boys','tennis_girls','track','wrestling','gymnastics','lacrosse_boys','lacrosse_girls','bowling_boys','bowling_girls','dance_team','cheer','showchoir','arts','fine_arts','dance','school','academic','nhs','club','graduation','other'];
  const typeLabels = { football:'🏈 Football', basketball_boys:'🏀 Boys Basketball', basketball_girls:'🏀 Girls Basketball', volleyball:'🏐 Volleyball', soccer_boys:'⚽ Boys Soccer', soccer_girls:'⚽ Girls Soccer', golf_boys:'⛳ Boys Golf', golf_girls:'⛳ Girls Golf', baseball:'⚾ Baseball', softball:'🥎 Softball', cross_country:'🏃 Cross Country', swimming:'🏊 Swimming', tennis_boys:'🎾 Boys Tennis', tennis_girls:'🎾 Girls Tennis', track:'🏃 Track & Field', wrestling:'🤼 Wrestling', gymnastics:'🤸 Gymnastics', lacrosse_boys:'🥍 Boys Lacrosse', lacrosse_girls:'🥍 Girls Lacrosse', bowling_boys:'🎳 Boys Bowling', bowling_girls:'🎳 Girls Bowling', dance_team:'💃 Dance Team', cheer:'📣 Cheer / Pom', showchoir:'🎤 Show Choir', arts:'🎭 Performing Arts', fine_arts:'🎨 Fine Arts', dance:'🪩 Dance', school:'🏫 School Event', academic:'🏆 Academic', nhs:'🎓 NHS / Honor Society', club:'🏅 Club / Org', graduation:'🎓 Graduation', other:'📸 Other' };
  const typeOptions = typeOrder.filter(t => upcomingByType[t])
    .map(t => `<option value="${t}">${typeLabels[t]} (${upcomingByType[t].length})</option>`).join('');

  const mySignupRows = mySignups.length
    ? mySignups.map(s => `
        <div class="yb-my-signup">
          <span class="yb-my-event">${esc(s.eventTitle)}</span>
          <span class="yb-my-role yb-role-${s.role}">${roleLabel(s.role)}</span>
          <button class="yb-unsign-btn" data-yb-unsign="${esc(s.id)}">✕</button>
        </div>`).join('')
    : `<p class="dim" style="font-size:0.85rem">You haven't signed up for any events yet.</p>`;

  return `
    ${navBar('yearbook')}
    <div class="class-page">
      <div class="class-header">
        <div class="class-header-icon">📖</div>
        <div>
          <h1>Yearbook</h1>
          <p>Documenting the story of Homestead.</p>
          <a class="class-header-lessons-link" data-lesson-course="yearbook">📚 Go to Lessons</a>
        </div>
      </div>
      <div id="bellringer-wrap" class="bellringer-wrap">${renderBellRingerBanner('yearbook')}</div>
      <div class="page-grid">
        <div class="main-col">

<section class="card" id="yb-weekly-card">
            <h2 class="cal-section-title">📤 Weekly Accomplishments</h2>
            <p class="cal-section-sub">${YB_WEEKLY_FORM_URL
              ? "Every week, fill out the short form below with what you accomplished — it's filed into your week's folder automatically."
              : "Every week, upload a screenshot of your work or write a short paragraph of what you accomplished into your week's folder."}</p>
            ${(() => {
              const { week, status } = getCurrentYbWeek();
              const statusNote = status === 'upcoming' ? `Opens for <strong>${esc(week.label)}</strong>` :
                status === 'past' ? `The last configured week was <strong>${esc(week.label)}</strong> — ask your teacher if you need a new one` :
                `This is <strong>${esc(week.label)}</strong>`;
              const formBtn = YB_WEEKLY_FORM_URL
                ? `<a class="btn-primary" href="${esc(YB_WEEKLY_FORM_URL)}" target="_blank" rel="noopener">📝 Fill Out This Week's Form ↗</a>`
                : '';
              const browseBtnClass = YB_WEEKLY_FORM_URL ? 'btn-secondary' : 'btn-primary';
              return `
              <p style="font-size:0.85rem;margin:0 0 10px">${statusNote}</p>
              ${formBtn}
              <a class="${browseBtnClass}" href="${YB_WEEKLY_DRIVE_URL}" target="_blank" rel="noopener" style="${YB_WEEKLY_FORM_URL ? 'margin-left:8px' : ''}">🗂️ Browse All Weeks ↗</a>`;
            })()}
          </section>

<section class="card">
            <h2 class="cal-section-title">📅 Coverage Calendar</h2>
            <p class="cal-section-sub">Upcoming events that need to be photographed or covered for Yearbook.</p>
            <div class="cal-embed-wrap">
              <iframe src="https://calendar.google.com/calendar/embed?src=2b9bdfdee65f7330d8d5d2fd1d4877c1b709289fa0b0747427f57fd62516bed5%40group.calendar.google.com&ctz=America%2FIndiana%2FIndianapolis&bgcolor=%23111111&color=%230F9D58&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0" frameborder="0" scrolling="no" class="cal-embed"></iframe>
            </div>
          </section>

          <section class="card" id="yb-signup-card">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px">
              <h2 class="cal-section-title" style="margin:0">✏️ Sign Up to Cover an Event</h2>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                <button id="yb-add-event-btn" class="btn-secondary" style="font-size:0.78rem;padding:4px 12px">+ Add New Event</button>
                <button id="yb-away-toggle" class="btn-secondary" style="font-size:0.78rem;padding:4px 12px">
                  ${S.ybShowAway ? '🏠 Home Only' : '🚌 Show Away Games'}
                </button>
              </div>
            </div>
            <p class="cal-section-sub">${USE_GOOGLE_FORM_YEARBOOK
              ? 'Pick the event, then sign up on the Google Form — it opens with that event already filled in. Your name appears below after you submit.'
              : 'Pick an event, choose your role, and submit. Your teacher will confirm assignments.'}</p>

            <div id="yb-event-form" style="display:none;padding:14px 0 18px;border-bottom:1px solid var(--border);margin-bottom:16px">
              <p class="cal-section-sub" style="margin-top:0">Don't see your event listed below? Add it here — it'll go straight onto the Coverage Calendar and appear in the list to sign up for.</p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
                <div class="form-group" style="margin:0"><label>Title</label><input id="yb-new-title" type="text" placeholder="e.g. Homecoming Dance"></div>
                <div class="form-group" style="margin:0"><label>Date</label><input id="yb-new-date" type="date"></div>
                <div class="form-group" style="margin:0"><label>Time <span class="hint">(optional)</span></label><input id="yb-new-time" type="text" placeholder="7:00 PM"></div>
                <div class="form-group" style="margin:0"><label>Type</label><select id="yb-new-type">${Object.entries(EVENT_TYPES).map(([k, v]) => `<option value="${k}">${YB_ICONS[k] || '📅'} ${v.label}</option>`).join('')}</select></div>
              </div>
              <button class="btn-primary" id="yb-save-event-btn">Save &amp; Add to Calendar</button>
              <button class="btn-secondary" id="yb-cancel-event-btn" style="margin-left:8px">Cancel</button>
            </div>

            ${USE_GOOGLE_FORM_YEARBOOK ? '' : `
            <div class="yb-name-row">
              <div class="form-group">
                <label>First and Last Name</label>
                <input id="yb-name" type="text" placeholder="First and last name" value="${esc(myName)}">
              </div>
            </div>`}

            <div class="form-group">
              <label>Sport / Event Type</label>
              <select id="yb-type" onchange="filterYbEvents()">
                <option value="">— Select a type —</option>
                ${typeOptions}
              </select>
            </div>

            <div class="form-group" id="yb-event-group" style="display:none">
              <label>Event</label>
              <select id="yb-event">
                <option value="">— Select an event —</option>
              </select>
            </div>

            ${USE_GOOGLE_FORM_YEARBOOK ? `
            ${YEARBOOK_FORM.formUrl
              ? `<button class="btn-primary" id="yb-form-btn" style="margin-top:8px">Sign Up on Google Form ↗</button>`
              : `<p class="dim" style="font-size:0.8rem;margin-top:8px">Sign-up form coming soon — check back shortly.</p>
                 ${S.teacherMode ? `<p style="font-size:0.8rem;margin-top:6px;color:var(--radio)">🔑 Teacher: create the Yearbook Google Form and fill in YEARBOOK_FORM in script.js (same steps as the broadcast form).</p>` : ''}`}
            ` : `
            <div class="form-group">
              <label>Role</label>
              <div class="yb-role-picker">
                <button class="yb-role-btn" data-role="photographer">📷 Photographer</button>
              </div>
              <input type="hidden" id="yb-role" value="">
            </div>

            <button class="btn-primary" id="yb-submit-btn" style="margin-top:8px">Submit Sign-Up →</button>`}
          </section>

          ${myName && !USE_GOOGLE_FORM_YEARBOOK ? `
          <section class="card">
            <h2 class="cal-section-title">My Sign-Ups</h2>
            <div id="yb-my-signups">${mySignupRows}</div>
          </section>` : ''}

          <section class="card">
            <h2 class="cal-section-title">📋 Upcoming Coverage</h2>
            <p class="cal-section-sub">Students signed up to cover upcoming events.</p>
            ${(() => {
              const byEvent = {};
              allCoverage.forEach(s => {
                const key = s.eventId || (s.eventDate + s.eventTitle);
                if (!byEvent[key]) byEvent[key] = { title: s.eventTitle, date: s.eventDate, signups: [] };
                byEvent[key].signups.push(s);
              });
              const rows = Object.values(byEvent)
                .filter(ev => new Date(ev.date + 'T23:59:00') >= now)
                .sort((a,b) => a.date.localeCompare(b.date));
              if (!rows.length) return `<p class="dim" style="font-size:0.875rem">No sign-ups yet — be the first!</p>`;
              return rows.map(ev => `
                <div class="yb-cov-event">
                  <div class="yb-cov-header">
                    <span class="yb-cov-title">${esc(ev.title)}</span>
                    <span class="yb-cov-date dim">${fmtDate(ev.date, false)}</span>
                  </div>
                  <div class="yb-cov-tags">
                    ${ev.signups.map(s => `
                      <span class="yb-cov-tag yb-role-${s.role}">
                        ${esc(s.studentName)} · ${roleLabel(s.role)}
                      </span>`).join('')}
                  </div>
                </div>`).join('');
            })()}
          </section>

          <section class="card">
            <h2 class="cal-section-title">📊 Season Coverage Tracker</h2>
            <p class="cal-section-sub">Total times each sport or event has been photographed this year.</p>
            ${(() => {
              if (!allCoverage.length) return `<p class="dim" style="font-size:0.875rem">No coverage recorded yet.</p>`;
              const evtTypeMap = {};
              allYbEvents().forEach(e => { evtTypeMap[e.id] = e.type; });
              const typeCounts = {};
              allCoverage.forEach(s => {
                const type = evtTypeMap[s.eventId] || inferYbType(s.eventTitle || '');
                if (type) typeCounts[type] = (typeCounts[type] || 0) + 1;
              });
              return Object.entries(typeCounts)
                .sort(([,a],[,b]) => b - a)
                .map(([type, count]) => {
                  const label = EVENT_TYPES[type]?.label || type;
                  const icon  = YB_ICONS[type] || '📅';
                  const style = count >= 3 ? 'background:#22c55e22;color:#4ade80'
                              : count === 2 ? 'background:#f59e0b22;color:#fbbf24'
                              : 'background:#6366f122;color:#a5b4fc';
                  return `
                    <div class="yb-tracker-row">
                      <span class="yb-tracker-icon">${icon}</span>
                      <span class="yb-tracker-title" style="flex:1">${esc(label)}</span>
                      <span class="yb-tracker-badge" style="${style}">${count} ${count === 1 ? 'time' : 'times'}</span>
                    </div>`;
                }).join('');
            })()}
          </section>

        </div>
        <div class="side-col">
          ${renderEquipmentCard()}

          <section class="card action-card">
            <div class="action-icon">📒</div>
            <h3>Walsworth Yearbooks</h3>
            <p>Log in to build pages, submit layouts, and manage your section.</p>
            <a class="btn-primary" href="https://login.walsworthyearbooks.com/login" target="_blank" rel="noopener">Open Walsworth ↗</a>
          </section>
          ${renderQuickLinksCard('yearbook')}

          <section class="card">
            <h3 style="font-size:1rem;font-weight:700;margin-bottom:4px">📷 Shot List Tips</h3>
            <p style="font-size:0.8rem;color:var(--dim);margin-bottom:14px">Click a category to expand. Every event needs a wide, medium, and close-up shot.</p>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${[
                { label:'🏈 Field Sports', sub:'Football · Soccer · Lacrosse · Baseball · Softball', tips:[
                  'Shoot from end zone or corner — you need depth, not flat sideline width',
                  'Watch the ball, not the player — anticipate the play before it happens',
                  'Burst mode on every action sequence; the winning frame is rarely the first',
                  'Pre-game tells a story: warm-ups, team huddles, coin toss, tunnel entrances',
                  'Bench and coaches react as strongly as the field — don\'t ignore them',
                  'Post-game handshake line, quiet locker walk, or celebration are all yearbookworthy',
                  'Include the student section — crowd energy makes sports photos feel alive',
                ]},
                { label:'🏀 Court & Indoor Sports', sub:'Basketball · Volleyball · Wrestling · Gymnastics · Bowling', tips:[
                  'Position at baseline corner — you get action AND scoreboard in one frame',
                  'Shoot at the peak: ball at the rim, spike at the net, pin on the mat',
                  'Get low for wrestling and gymnastics — shooting up makes athletes look powerful',
                  'Bench huddles and timeout circles are genuine emotional moments',
                  'Include the scoreboard in wide shots to give photos context',
                  'Bowling: look for the release and follow-through, plus reaction after a strike',
                ]},
                { label:'🏃 Cross Country, Track & Swimming', sub:'Cross Country · Track · Swimming & Diving', tips:[
                  'Cross Country: start line chaos, runners isolated in nature, finish line emotion — shoot all three',
                  'Track: capture starting blocks tension, mid-race pack, and the lean at the finish',
                  'Relay handoffs are dramatic and rarely captured — position yourself there',
                  'Swimming: the dive start is a signature shot; lean over the lane or shoot through glass',
                  'The moment right after finishing is when emotion peaks — be ready',
                ]},
                { label:'🎾 Tennis & Golf', sub:'Boys/Girls Tennis · Boys/Girls Golf', tips:[
                  'Tennis: catch the serve at the top of the toss, not the follow-through swing',
                  'Between-point moments show character — use them to tell the personality story',
                  'Doubles: look for non-verbal communication and coordination between partners',
                  'Golf: the follow-through is cleaner and easier to catch than the swing itself',
                  'Golf courses have natural backgrounds — use the landscape, not just the player',
                  'Putting green focus shots and walking the fairway give variety',
                ]},
                { label:'🎭 Arts & Performance', sub:'Show Choir · Fine Arts · Dance Team · Cheer · Dance Events', tips:[
                  'Start with a wide establishing shot of the full group on stage — give context first',
                  'Work in to faces during the most emotional or intense moments',
                  'Shoot the director watching from the house — it\'s a perspective students forget',
                  'Backstage before the show: nerves, costumes, group warmups — all yearbook content',
                  'Audience reactions (parents, teachers) tell the story from another angle',
                  'Cheer and dance: catch the peak of the stunt, not the build or the landing',
                  'Post-show curtain call, cast hugging, teacher congratulating — don\'t pack up early',
                ]},
                { label:'🏫 Campus & Daily Life', sub:'Clubs · Academics · NHS · School Life · Candids', tips:[
                  'Genuine unposed moments are worth more than any posed group photo',
                  'Lab work, hands-on projects, art studios, shop class — learning in action',
                  'Lunchroom social energy: friend groups, conversations, the full-room wide shot',
                  'Hallway between classes: lockers, social moments, the daily rhythm of school',
                  'Club meetings — catch the discussion and debate, not just the group shot at the end',
                  'Spirit week, hallway decorations, homecoming posters — school culture is visual',
                  'NHS: induction candle ceremony, pin moments, community service in action',
                  'Ask before entering a classroom — most teachers will say yes if you\'re quick',
                ]},
                { label:'🎓 Special Events', sub:'Graduation · Prom · Homecoming · Dances', tips:[
                  'Graduation cap toss: set burst mode, shoot from slightly below, catch all caps mid-air',
                  'Diploma handshake: shoot from the audience side so you see both faces clearly',
                  'Family reunions after ceremony — organic, emotional, never posed, always genuine',
                  'Prom grand march: position at the entrance so you catch the reveal moment',
                  'Inside the dance: a few crowd-on-the-floor wides, DJ booth, and decoration details',
                  'Corsages, honor cords, class rings, diplomas — details complete the story',
                  'The quiet wind-down after the event is over is almost always overlooked',
                ]},
                { label:'📐 Universal Rules', sub:'Applies to every single event you shoot', tips:[
                  'Every event needs three shots: wide (context), medium (story), close-up (emotion)',
                  'The before and after are as important as the event itself — arrive early, leave late',
                  'Candid beats posed for authentic yearbook content every time',
                  'Ask yourself: will someone who wasn\'t there understand this story from just this photo?',
                  'Shoot more than you think you need — you can always delete, never re-create',
                  'Light matters: find good window light inside, avoid harsh overhead gymnasium lights',
                  'Get names as you shoot — a great photo with no caption is half a story',
                ]},
              ].map(cat => `
                <details class="shot-cat">
                  <summary class="shot-cat-summary">
                    <span class="shot-cat-label">${cat.label}</span>
                    <span class="shot-cat-sub">${cat.sub}</span>
                  </summary>
                  <ul class="shot-cat-list">${cat.tips.map(t => `<li>${t}</li>`).join('')}</ul>
                </details>`).join('')}
            </div>
          </section>

        </div>
      </div>
    </div>`;
}

function roleLabel(role) {
  return { photographer: '📷 Photographer' }[role] || role;
}

async function loadYearbookCoverage() {
  // Sign-ups come from the Google Form (see USE_GOOGLE_FORM_YEARBOOK) once
  // configured — the Firestore path below is a dead end in that mode since
  // the in-app sign-up UI is hidden, and would otherwise wipe out the
  // Form-sourced list every time this re-runs on Dashboard/Yearbook nav.
  if (USE_GOOGLE_FORM_YEARBOOK && YEARBOOK_FORM.csvUrl) {
    await loadYbFormSignups();
    if (S.view === 'yearbook' || S.view === 'dashboard') render();
    return;
  }
  const db = getDB();
  if (!db) return;
  await cachedLoad('yb_coverage', async () => {
    const snap = await db.collection('hm_yearbook_coverage').orderBy('submittedAt', 'desc').get();
    trackUsage('reads', snap.size);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }, list => {
    S.yearbookCoverage = list;
    if (S.view === 'yearbook' || S.view === 'dashboard') render();
  });
}

function inferYbType(title) {
  const t = title.toLowerCase();
  if (t.includes('football'))                              return 'football';
  if (t.includes('basketball') && t.includes('boys'))     return 'basketball_boys';
  if (t.includes('basketball') && t.includes('girls'))    return 'basketball_girls';
  if (t.includes('basketball'))                           return 'basketball_boys';
  if (t.includes('soccer') && t.includes('boys'))         return 'soccer_boys';
  if (t.includes('soccer') && t.includes('girls'))        return 'soccer_girls';
  if (t.includes('volleyball'))                           return 'volleyball';
  if (t.includes('golf') && t.includes('boys'))           return 'golf_boys';
  if (t.includes('golf') && t.includes('girls'))          return 'golf_girls';
  if (t.includes('baseball'))                             return 'baseball';
  if (t.includes('softball'))                             return 'softball';
  if (t.includes('cross country'))                        return 'cross_country';
  if (t.includes('swim') || t.includes('diving'))         return 'swimming';
  if (t.includes('tennis') && t.includes('boys'))         return 'tennis_boys';
  if (t.includes('tennis') && t.includes('girls'))        return 'tennis_girls';
  if (t.includes('track'))                                return 'track';
  if (t.includes('wrestling'))                            return 'wrestling';
  if (t.includes('gymnastics'))                           return 'gymnastics';
  if (t.includes('lacrosse') && t.includes('boys'))       return 'lacrosse_boys';
  if (t.includes('lacrosse') && t.includes('girls'))      return 'lacrosse_girls';
  if (t.includes('bowling') && t.includes('boys'))        return 'bowling_boys';
  if (t.includes('bowling') && t.includes('girls'))       return 'bowling_girls';
  if (t.includes('cheer'))                                return 'cheer';
  if (t.includes('dance'))                                return 'dance_team';
  return 'other';
}

// Sport types that always show regardless of home/away filter
const YB_ALWAYS_SHOW = new Set(['dance', 'nhs', 'showchoir', 'graduation', 'other', 'marching_band', 'jazz_band', 'color_guard', 'indoor_percussion', 'winter_guard', 'homecoming', 'cheer', 'dance_team', 'arts', 'fine_arts', 'school', 'academic', 'club', 'orchestra', 'theater', 'elite_choir', 'speech_debate', 'robotics', 'student_gov', 'prom', 'key_club']);

// Detects home/away using three signals in priority order:
// 1. Description contains "home" or "away" keyword
// 2. Location field — if present and doesn't mention Homestead → away
// 3. Title patterns (" at ", " @ ", "(A)") as last resort
function isHomeGame(ev) {
  const title = (ev.summary     || '').toLowerCase();
  const desc  = (ev.description || '').toLowerCase();
  const loc   = (ev.location    || '').toLowerCase();

  if (/\bhome\b/.test(desc))  return true;
  if (/\baway\b/.test(desc))  return false;

  if (loc && !loc.includes('homestead')) return false;

  if (/ at /.test(title) || / @ /.test(title) || /\(a\)\s*$/.test(title) || /\(away\)/.test(title)) return false;
  if (/ vs\.? /.test(title) || /\(h\)\s*$/.test(title) || /\(home\)/.test(title)) return true;

  return true;
}

function fetchJsonp(url) {
  return new Promise((resolve, reject) => {
    const id = '_gs_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const s = document.createElement('script');
    window[id] = d => { delete window[id]; s.remove(); resolve(d); };
    s.onerror = () => { delete window[id]; s.remove(); reject(new Error('JSONP failed')); };
    s.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + id;
    document.head.appendChild(s);
  });
}

async function loadCalendarYbEvents() {
  const db = getDB();
  const TTL = 6 * 60 * 60 * 1000; // 6 hours

  // Try Firestore shared cache first
  if (db) {
    try {
      const doc = await db.collection('hm_config').doc('cal_cache').get();
      trackUsage('reads', 1);
      if (doc.exists) {
        const { ts, events } = doc.data();
        if (Date.now() - ts < TTL && events && events.length) {
          S.calendarYbEvents = events; return;
        }
      }
    } catch(e) {}
  }

  if (!GOOGLE_CAL_API_KEY) return;
  try {
    const now     = new Date();
    const syStart = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    const end     = new Date(syStart + 1, 7, 1);
    const calId   = encodeURIComponent(HHS_MEDIA_CAL_ID);
    const url     = `https://www.googleapis.com/calendar/v3/calendars/${calId}/events`
      + `?key=${GOOGLE_CAL_API_KEY}&timeMin=${now.toISOString()}&timeMax=${end.toISOString()}`
      + `&singleEvents=true&orderBy=startTime&maxResults=500`;

    const resp = await fetch(url);
    const data = await resp.json();
    if (data.items) {
      const events = data.items.map(ev => {
        const title   = ev.summary || '';
        const type    = inferYbType(title);
        const dateStr = (ev.start.dateTime || ev.start.date || '').slice(0, 10);
        const timeStr = ev.start.dateTime
          ? new Date(ev.start.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          : '';
        return {
          id:       'cal-' + ev.id.replace(/[^a-z0-9]/gi, '').slice(0, 20),
          title, date: dateStr, time: timeStr, type,
          location: ev.location || '',
          home:     YB_ALWAYS_SHOW.has(type) ? true : isHomeGame(ev),
          icon:     YB_ICONS[type] || '📅'
        };
      }).filter(e => e.date);
      S.calendarYbEvents = events;
      if (db) {
        trackUsage('writes');
        db.collection('hm_config').doc('cal_cache').set({ ts: Date.now(), events }).catch(() => {});
      }
    }
  } catch(e) {}
}

// "Homestead Live Event Calendar" (thepoint91fm@gmail.com) — teacher-curated, only broadcast-worthy
// events go on it, so unlike loadCalendarYbEvents() this takes everything with no type/home filtering.
async function loadCalendarBroadcastEvents() {
  const db = getDB();
  const TTL = 6 * 60 * 60 * 1000; // 6 hours

  if (db) {
    try {
      const doc = await db.collection('hm_config').doc('bcast_cal_cache').get();
      trackUsage('reads', 1);
      if (doc.exists) {
        const { ts, events } = doc.data();
        if (Date.now() - ts < TTL && events && events.length) {
          S.calendarBroadcastEvents = events; return;
        }
      }
    } catch(e) {}
  }

  if (!GOOGLE_CAL_API_KEY) return;
  try {
    const now     = new Date();
    const syStart = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    const end     = new Date(syStart + 1, 7, 1);
    const calId   = encodeURIComponent(HOMESTEAD_LIVE_CAL_ID);
    const url     = `https://www.googleapis.com/calendar/v3/calendars/${calId}/events`
      + `?key=${GOOGLE_CAL_API_KEY}&timeMin=${now.toISOString()}&timeMax=${end.toISOString()}`
      + `&singleEvents=true&orderBy=startTime&maxResults=500`;

    const resp = await fetch(url);
    const data = await resp.json();
    if (data.items) {
      const events = data.items.map(ev => {
        const title   = ev.summary || '';
        const type    = inferYbType(title);
        const dateStr = (ev.start.dateTime || ev.start.date || '').slice(0, 10);
        let timeStr = ev.start.dateTime
          ? new Date(ev.start.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          : '';
        // Calendar lists the JV start time, but Homestead Live broadcasts varsity,
        // which goes on ~1hr after JV — shift the stored time forward to match.
        // Postseason "Regional" matches are varsity-only (no JV game first), so skip those.
        let jvTime = '';
        if (type === 'volleyball' && timeStr && !/regional/i.test(title)) {
          jvTime = timeStr;
          timeStr = computeTimeOffset(timeStr, -60);
        }
        return {
          id:       'bc-' + ev.id.replace(/[^a-z0-9]/gi, '').slice(0, 20),
          title, date: dateStr, time: timeStr, jvTime, type,
          location: ev.location || '',
          icon:     YB_ICONS[type] || '📅'
        };
      }).filter(e => e.date);
      S.calendarBroadcastEvents = events;
      if (db) {
        trackUsage('writes');
        db.collection('hm_config').doc('bcast_cal_cache').set({ ts: Date.now(), events }).catch(() => {});
      }
    }
  } catch(e) {}
}

async function loadCustomYbEvents() {
  const db = getDB();
  if (!db) return;
  await cachedLoad('yb_events', async () => {
    const snap = await db.collection('hm_yearbook_events').orderBy('date').get();
    trackUsage('reads', snap.size);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }, list => { S.customYbEvents = list; });
}

async function saveYbEvent() {
  const title = val('yb-new-title');
  const date  = val('yb-new-date');
  const time  = val('yb-new-time');
  const type  = val('yb-new-type');
  if (!title || !date) { showToast('Title and date are required.'); return; }

  const btn = document.getElementById('yb-save-event-btn');
  if (btn) btn.textContent = 'Saving…';

  let calEventId = '';
  if (SYNC_SCRIPT_URL) {
    try {
      const url = `${SYNC_SCRIPT_URL}?action=addEvent&title=${encodeURIComponent(title)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time || '12:00 PM')}`;
      const result = await fetchJsonp(url);
      if (result.success) calEventId = result.calEventId || '';
    } catch(e) {}
  }

  const db = getDB();
  const doc = { title, date, time, type, calEventId, createdAt: new Date().toISOString() };
  if (db) {
    try {
      trackUsage('writes');
      const ref = await db.collection('hm_yearbook_events').add(doc);
      doc.id = ref.id;
    } catch(e) {}
  }
  if (!doc.id) doc.id = Date.now().toString();
  S.customYbEvents.push(doc);
  showToast(calEventId ? 'Event saved and added to calendar!' : 'Event saved. (Calendar sync unavailable — check Apps Script URL.)');
  render();
}

async function deleteYbEvent(id) {
  const ev = (S.customYbEvents || []).find(e => e.id === id);
  if (!ev || !confirm(`Delete "${ev.title}"?`)) return;

  if (ev.calEventId && SYNC_SCRIPT_URL) {
    try {
      await fetchJsonp(`${SYNC_SCRIPT_URL}?action=deleteEvent&calEventId=${encodeURIComponent(ev.calEventId)}`);
    } catch(e) {}
  }

  const db = getDB();
  if (db) { trackUsage('writes'); await db.collection('hm_yearbook_events').doc(id).delete().catch(() => {}); }
  S.customYbEvents = S.customYbEvents.filter(e => e.id !== id);
  showToast('Event deleted.');
  render();
}

async function submitYearbookSignup() {
  const name    = shortenName((document.getElementById('yb-name')?.value || '').trim());
  const eventId = document.getElementById('yb-event')?.value;
  const role    = document.getElementById('yb-role')?.value;

  if (!name)    { showToast('Please enter your name.');    return; }
  if (!eventId) { showToast('Please select an event.');    return; }
  if (!role)    { showToast('Please choose a role.');      return; }

  const event = allYbEvents().find(e => e.id === eventId);
  if (!event) return;

  const already = (S.yearbookCoverage || []).find(
    s => s.eventId === eventId && s.studentName.toLowerCase() === name.toLowerCase()
  );
  if (already) { showToast('You are already signed up for that event.'); return; }

  const db = getDB();
  if (!db) { showToast('Database unavailable.'); return; }

  localStorage.setItem('hm_yb_name', name);
  localStorage.removeItem('hm_yb_coverage');

  try {
    trackUsage('writes');
    await db.collection('hm_yearbook_coverage').add({
      studentName: name, eventId, eventTitle: event.title,
      eventDate: event.date, role, submittedAt: Date.now(),
    });
    showToast('Signed up! You\'re on the coverage list.');
    await loadYearbookCoverage();
  } catch(e) { showToast('Could not save — try again.'); }
}

async function unsignYearbook(docId) {
  if (!confirm('Remove your sign-up for this event?')) return;
  const db = getDB();
  if (!db) return;
  try {
    trackUsage('writes');
    await db.collection('hm_yearbook_coverage').doc(docId).delete();
    localStorage.removeItem('hm_yb_coverage');
    showToast('Sign-up removed.');
    await loadYearbookCoverage();
  } catch(e) { showToast('Could not remove — try again.'); }
}

// ── BROADCAST SIGN-UP (Student) ───────────────────────────────
function renderAvailabilityPage() {
  return renderFormSignupPage();
}

// Google Form version — sign-ups happen on the Form, this page lists
// each broadcast with a prefilled form link and who has signed up so far.
function renderFormSignupPage() {
  const now = new Date();
  const upcoming = (S.broadcasts || [])
    .filter(b => new Date(b.date + 'T00:00:00') >= now)
    .filter(b => b.type !== 'dance')  // dances aren't crewed broadcasts
    .sort((a, b) => a.date.localeCompare(b.date));
  const formReady = !!SIGNUP_FORM.formUrl;

  const broadcastCards = upcoming.map(b => {
    const et = EVENT_TYPES[b.type] || EVENT_TYPES.other;
    const signups = (S.availabilities || []).filter(a => a.broadcastId === b.id);
    return `
      <div class="avail-bc-card card">
        <div class="avail-bc-meta">
          <span class="avail-bc-type-badge" style="background:${et.color}">${et.label}</span>
          <span class="avail-bc-date">${fmtDate(b.date, false)}</span>
          ${signups.length > 0 ? `<span class="avail-bc-signups">${signups.length} signed up</span>` : ''}
        </div>
        <div class="avail-bc-title">${esc(b.title)}</div>
        ${b.notes ? `<div class="avail-bc-notes">${esc(b.notes)}</div>` : ''}
        ${b.gameTime ? `
        <div class="avail-bc-times">
          <span class="avail-door33-chip">🚪 Door 33 ${computeDoor33(b.gameTime, b.type)}</span>
          <span class="avail-arrival-chip">${ARRIVAL_LABEL[b.type] ?? ARRIVAL_DEFAULT_LABEL} ${computeArrival(b.gameTime, b.type)}</span>
          <span class="avail-gametime-chip">Game ${esc(b.gameTime)}</span>
        </div>` : ''}
        ${signups.length ? `
        <div class="avail-form-names">${signups.map(a => `<span class="avail-interest-chip">${esc(a.studentName)}</span>`).join('')}</div>` : ''}
        ${formReady
          ? `<a class="btn-primary avail-form-btn" href="${signupFormLink(b)}" target="_blank" rel="noopener">Sign Up on Google Form ↗</a>`
          : `<p class="dim" style="font-size:0.8rem;margin-top:10px">Sign-up form coming soon — check back shortly.</p>`}
      </div>`;
  }).join('') || `<p class="dim" style="padding:24px 0">No upcoming broadcasts scheduled.</p>`;

  return `
    ${navBar('live')}
    <div class="class-page">
      <button class="back-btn" data-nav="live">← Back to Homestead Live</button>
      <div class="avail-page-header">
        <h1>Broadcast Sign-Up</h1>
        <p>Click Sign Up on any broadcast — it opens the Google Form with that game already filled in. Your name appears on this page after you submit.</p>
      </div>
      ${S.teacherMode && !SIGNUP_FORM.csvUrl ? `
      <div class="card" style="border-left:3px solid var(--radio);padding:16px 20px;margin-bottom:16px">
        <p style="font-size:0.85rem;line-height:1.6;color:var(--text)"><strong>🔑 Teacher setup needed:</strong> the Google Form isn't connected yet. Open <code>script.js</code> and follow the SETUP steps above <code>SIGNUP_FORM</code> — create the form, publish its response sheet as CSV, and paste the three URLs.</p>
      </div>` : ''}
      <div class="avail-broadcasts">${broadcastCards}</div>
    </div>`;
}

// ── Planner Logic ─────────────────────────────────────────────
function savePlannerStep() {
  const p = S.plannerData || {};
  if (S.plannerStep === 0) {
    if (!p.showType) { showToast('Pick a show type first.'); return; }
    p.studentName    = shortenName(val('p-name'));
    p.showName       = val('p-show');
    if (p.showType !== 'talk') {
      p.station  = val('p-station');
      p.showTime = val('p-showtime');
    }
    if (p.showType === 'radio' || p.showType === 'talk') {
      p.partners      = val('p-partners').split(',').map(n => shortenName(n.trim())).filter(Boolean).join(', ');
      p.partnerEmails = val('p-partner-emails');
    }
  } else if (p.showType === 'air' || p.showType === 'radio') {
    if (S.plannerStep === 1) {
      p.open = { welcome: val('open-welcome'), reset: val('open-reset'), preview: val('open-preview') };
    } else if (S.plannerStep === 2) {
      const prevBreaks = p.breaks || [];
      p.breaks = Array.from({ length: 4 }, (_, i) => ({
        purposes:     (prevBreaks[i] || {}).purposes || [],
        whyRelevant:  val(`air-why-${i}`),
        backsell:     val(`air-backsell-${i}`),
        talkPoint:    val(`air-talkpoint-${i}`),
        coHostMoment: val(`air-cohost-${i}`),
        presell:      val(`air-presell-${i}`),
        interaction:  val(`air-interact-${i}`),
      }));
    } else if (S.plannerStep === 3) {
      p.close = { recap: val('close-recap'), tease: val('close-tease'), signoff: val('close-signoff') };
    }
  } else {
    switch (S.plannerStep) {
      case 1:
        p.theme = { title: val('p-theme-title'), description: val('p-theme-desc'), welcome: val('p-theme-welcome') };
        break;
      case 2:
        if (!p.breaks) p.breaks = [{}, {}, {}];
        p.breaks[0] = { title: val('b1-title'), newsUpdate: val('b1-news'), connection: val('b1-connection'), transition: val('b1-transition') };
        break;
      case 3:
        if (!p.breaks) p.breaks = [{}, {}, {}];
        p.breaks[1] = { title: val('b2-title'), activityHook: val('b2-activity'), connection: val('b2-connection'), interaction: val('b2-interaction'), tease: val('b2-tease') };
        break;
      case 4:
        if (!p.breaks) p.breaks = [{}, {}, {}];
        p.breaks[2] = { title: val('b3-title'), talkingPoints: [val('b3-tp1'), val('b3-tp2'), val('b3-tp3')], format: val('b3-format'), wrapUp: val('b3-wrapup') };
        break;
    }
  }
  S.plannerData = p;
  S.plannerStep++;
  render();
}

// ── SHOW PLANNER: Weekly submissions (Shared Drive) ─────────────
// Every submitted plan is filed automatically as a Doc into that week's
// folder — see fileAirPlanToDrive() below and doPost()/fileAirPlan() in
// Code.gs. Must stay in sync with AIR_WEEKLY_FOLDERS in Code.gs if weeks
// are added/changed. Folder IDs live server-side only; this list is just
// for the "this is week X" status shown to students.
const AIR_WEEKLY_DRIVE_URL = 'https://drive.google.com/drive/u/2/folders/0AGI4ogJFHfYTUk9PVA';
const AIR_WEEKLY_FOLDERS = [
  { label: 'Week 1 (Aug 5–Aug 7)',    start: '2026-08-05', end: '2026-08-07' },
  { label: 'Week 2 (Aug 10–Aug 14)',  start: '2026-08-10', end: '2026-08-14' },
  { label: 'Week 3 (Aug 17–Aug 21)',  start: '2026-08-17', end: '2026-08-21' },
  { label: 'Week 4 (Aug 24–Aug 28)',  start: '2026-08-24', end: '2026-08-28' },
  { label: 'Week 5 (Aug 31–Sep 4)',   start: '2026-08-31', end: '2026-09-04' },
  { label: 'Week 6 (Sep 7–Sep 11)',   start: '2026-09-07', end: '2026-09-11' },
  { label: 'Week 7 (Sep 14–Sep 18)',  start: '2026-09-14', end: '2026-09-18' },
  { label: 'Week 8 (Sep 21–Sep 25)',  start: '2026-09-21', end: '2026-09-25' },
  { label: 'Week 9 (Sep 28–Oct 2)',   start: '2026-09-28', end: '2026-10-02' },
  { label: 'Week 10 (Oct 5–Oct 9)',   start: '2026-10-05', end: '2026-10-09' },
  { label: 'Week 12 (Oct 19–Oct 23)', start: '2026-10-19', end: '2026-10-23' },
  { label: 'Week 13 (Oct 26–Oct 30)', start: '2026-10-26', end: '2026-10-30' },
  { label: 'Week 14 (Nov 2–Nov 6)',   start: '2026-11-02', end: '2026-11-06' },
  { label: 'Week 15 (Nov 9–Nov 13)',  start: '2026-11-09', end: '2026-11-13' },
  { label: 'Week 16 (Nov 16–Nov 20)', start: '2026-11-16', end: '2026-11-20' },
  { label: 'Week 17 (Nov 23–Nov 27)', start: '2026-11-23', end: '2026-11-27' },
  { label: 'Week 18 (Nov 30–Dec 4)',  start: '2026-11-30', end: '2026-12-04' },
  { label: 'Week 19 (Dec 7–Dec 11)',  start: '2026-12-07', end: '2026-12-11' },
  { label: 'Week 20 (Dec 14–Dec 18)', start: '2026-12-14', end: '2026-12-18' },
  // Second semester — must stay in sync with AIR_WEEKLY_FOLDERS in Code.gs.
  { label: 'Week 21 (Jan 5–Jan 8)',    start: '2027-01-05', end: '2027-01-08' },
  { label: 'Week 22 (Jan 11–Jan 15)',  start: '2027-01-11', end: '2027-01-15' },
  { label: 'Week 23 (Jan 18–Jan 22)',  start: '2027-01-18', end: '2027-01-22' },
  { label: 'Week 24 (Jan 25–Jan 29)',  start: '2027-01-25', end: '2027-01-29' },
  { label: 'Week 25 (Feb 1–Feb 5)',    start: '2027-02-01', end: '2027-02-05' },
  { label: 'Week 26 (Feb 8–Feb 12)',   start: '2027-02-08', end: '2027-02-12' },
  { label: 'Week 27 (Feb 15–Feb 19)',  start: '2027-02-15', end: '2027-02-19' },
  { label: 'Week 28 (Feb 22–Feb 26)',  start: '2027-02-22', end: '2027-02-26' },
  { label: 'Week 29 (Mar 1–Mar 5)',    start: '2027-03-01', end: '2027-03-05' },
  { label: 'Week 30 (Mar 8–Mar 12)',   start: '2027-03-08', end: '2027-03-12' },
  { label: 'Week 31 (Mar 15–Mar 19)',  start: '2027-03-15', end: '2027-03-19' },
  { label: 'Week 32 (Mar 22–Mar 26)',  start: '2027-03-22', end: '2027-03-26' },
  { label: 'Week 33 (Mar 29–Apr 2)',   start: '2027-03-29', end: '2027-04-02' },
  { label: 'Week 34 (Apr 5–Apr 9)',    start: '2027-04-05', end: '2027-04-09' },
  { label: 'Week 35 (Apr 12–Apr 16)',  start: '2027-04-12', end: '2027-04-16' },
  { label: 'Week 36 (Apr 19–Apr 23)',  start: '2027-04-19', end: '2027-04-23' },
  { label: 'Week 37 (Apr 26–Apr 30)',  start: '2027-04-26', end: '2027-04-30' },
  { label: 'Week 38 (May 3–May 7)',    start: '2027-05-03', end: '2027-05-07' },
  { label: 'Week 39 (May 10–May 14)',  start: '2027-05-10', end: '2027-05-14' },
  { label: 'Week 40 (May 17–May 21)',  start: '2027-05-17', end: '2027-05-21' },
  { label: 'Week 41 (May 24–May 28)',  start: '2027-05-24', end: '2027-05-28' },
];

function getCurrentAirWeek() {
  const today = new Date().toISOString().slice(0, 10);
  const current = AIR_WEEKLY_FOLDERS.find(w => today >= w.start && today <= w.end);
  if (current) return { week: current, status: 'current' };
  const upcoming = AIR_WEEKLY_FOLDERS.find(w => w.start > today);
  if (upcoming) return { week: upcoming, status: 'upcoming' };
  if (today < AIR_WEEKLY_FOLDERS[0].start) return { week: AIR_WEEKLY_FOLDERS[0], status: 'upcoming' };
  return { week: AIR_WEEKLY_FOLDERS[AIR_WEEKLY_FOLDERS.length - 1], status: 'past' };
}

// Fire-and-forget — files a Doc named "Student Name — Show Name — Date"
// into the current week's shared-drive folder. Same pattern as the
// Athletics Calendar sync button (no-cors POST, response not read).
function fileAirPlanToDrive(p) {
  if (!SYNC_SCRIPT_URL) return;
  fetch(SYNC_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({
      action: 'submitAirPlan',
      studentName: p.studentName || '',
      showName: p.showName || '',
      showType: p.showType || '',
      planText: buildPlanText(p),
      submittedAt: new Date().toISOString(),
    }),
  }).catch(() => {});
}

async function submitPlan() {
  const p = S.plannerData || {};
  if (!p.studentName) { showToast('Please enter your name first.'); return; }
  const submission = { ...p, submittedAt: new Date().toISOString() };
  const db = getDB();
  if (db) {
    // partnerEmails is only used for the local "email a copy" mailto link —
    // never stored server-side.
    const { partnerEmails, ...dbSubmission } = submission;
    try { trackUsage('writes'); await db.collection('hm_radio_plans').add(dbSubmission); }
    catch(e) {}
  }
  fileAirPlanToDrive(p);
  localStorage.setItem('hm_plan_' + p.studentName, JSON.stringify(submission));

  const typeLabel   = (PLANNER_TYPES[p.showType] || {}).label || 'show';
  const mailtoLink  = buildPlanMailto(p);
  const coHostNote  = (p.partnerEmails || '').trim()
    ? `It'll also be addressed to your co-host${(p.partnerEmails.split(',').filter(Boolean).length > 1) ? 's' : ''} so everyone's on the same page.`
    : 'You can also download a copy to share with your co-hosts.';
  const { week: airWeek } = getCurrentAirWeek();
  const m = modal(`
    <div style="text-align:center;padding:8px 0 4px">
      <div style="font-size:2.5rem;margin-bottom:12px">✓</div>
      <h2 style="margin-bottom:8px">Plan Submitted!</h2>
      <p style="color:var(--dim);font-size:0.875rem;line-height:1.6;margin-bottom:24px">
        Your ${esc(typeLabel)} plan for <strong>${esc(p.showName || 'your show')}</strong> has been turned in
        and filed into the <strong>${esc(airWeek.label)}</strong> folder.
        ${esc(coHostNote)}
      </p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <a href="${mailtoLink}"
           style="display:inline-block;text-decoration:none;padding:10px 20px;background:var(--radio);color:#000;border-radius:8px;font-weight:600;font-size:0.875rem">
          📧 Email a Copy
        </a>
        <button class="btn-secondary" id="planner-confirm-download" style="padding:10px 20px;font-weight:600;font-size:0.875rem">
          ⬇️ Download a Copy
        </button>
      </div>
    </div>`, null, false);

  m.querySelector('#planner-confirm-download')?.addEventListener('click', () => downloadPlanFile(p));

  const doneBtn = m.querySelector('#modal-cancel');
  doneBtn.textContent = 'Done';
  doneBtn.addEventListener('click', () => {
    m.remove();
    S.plannerData = null;
    S.plannerStep = 0;
    go('radio');
  });
}

function buildPlanSubject(p) {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const typeLabel = (PLANNER_TYPES[p.showType] || {}).label || 'Talk Show';
  return `${typeLabel} Plan — ${p.showName || 'My Show'} — ${date}`;
}

function buildPlanText(p) {
  if (p.showType === 'air' || p.showType === 'radio') return buildAirPlanText(p);

  const b1   = ((p.breaks || [])[0]) || {};
  const b2   = ((p.breaks || [])[1]) || {};
  const b3   = ((p.breaks || [])[2]) || {};
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return [
    'TALK SHOW PLAN',
    '==============',
    `Student:  ${p.studentName || ''}`,
    `Show:     ${p.showName || ''}`,
    p.partners ? `Partners: ${p.partners}` : null,
    `Date:     ${date}`,
    '',
    `EPISODE THEME: ${(p.theme || {}).title || ''}`,
    (p.theme || {}).description || '',
    '',
    (p.theme || {}).welcome ? `WELCOME: ${(p.theme || {}).welcome}` : null,
    (p.theme || {}).welcome ? '' : null,
    `-- BREAK 1: ${b1.title || 'News / Relevant Tie-In'} --`,
    `News/Update:  ${b1.newsUpdate || ''}`,
    `Connection:   ${b1.connection || ''}`,
    `Transition:   ${b1.transition || ''}`,
    '',
    `-- BREAK 2: ${b2.title || 'Fun Activity / Preview'} --`,
    `Activity:     ${b2.activityHook || ''}`,
    `Connection:   ${b2.connection || ''}`,
    b2.interaction ? `Invite:       ${b2.interaction}` : null,
    `Tease:        ${b2.tease || ''}`,
    '',
    `-- BREAK 3: ${b3.title || 'Main Topic'} --`,
    `Point 1:  ${(b3.talkingPoints || [])[0] || ''}`,
    `Point 2:  ${(b3.talkingPoints || [])[1] || ''}`,
    `Point 3:  ${(b3.talkingPoints || [])[2] || ''}`,
    `Format:   ${b3.format || ''}`,
    `Wrap-up:  ${b3.wrapUp || ''}`,
  ].filter(l => l !== null).join('\n');
}

function buildAirPlanText(p) {
  const typeLabel = (PLANNER_TYPES[p.showType] || {}).label || 'Air Personality';
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const breaks = p.breaks || [];
  const o = p.open || {};
  const c = p.close || {};
  const purposeLabel = key => (PLANNER_PURPOSES.find(pu => pu.key === key) || {}).label || key;
  const lines = [
    typeLabel.toUpperCase() + ' PLAN',
    '='.repeat(typeLabel.length + 5),
    `Student:  ${p.studentName || ''}`,
    `Show:     ${p.showName || ''}`,
    p.partners ? `Co-Host:  ${p.partners}` : null,
    `Station:  ${p.station === 'two' ? '2.0' : 'The Point 91FM'}`,
    `Date:     ${date}`,
    '',
  ].filter(l => l !== null);

  if (o.welcome || o.reset || o.preview) {
    lines.push('-- OPEN --');
    if (o.welcome) lines.push(`Welcome: ${o.welcome}`);
    if (o.reset)   lines.push(`Reset:   ${o.reset}`);
    if (o.preview) lines.push(`Preview: ${o.preview}`);
    lines.push('');
  }

  breaks.forEach((b, i) => {
    if (!b || (!b.backsell && !b.presell && !b.talkPoint && !b.whyRelevant && !b.interaction && !b.coHostMoment)) return;
    lines.push(`-- BREAK ${i + 1} ${(b.purposes || []).length ? '(' + b.purposes.map(purposeLabel).join(', ') + ')' : ''} --`);
    if (b.whyRelevant)    lines.push(`Why:        ${b.whyRelevant}`);
    if (b.backsell)       lines.push(`Back-sell:  ${b.backsell}`);
    lines.push(`Talk Point: ${b.talkPoint || ''}`);
    if (b.coHostMoment)   lines.push(`Trade Mic:  ${b.coHostMoment}`);
    if (b.presell)        lines.push(`Pre-sell:   ${b.presell}`);
    if (b.interaction)    lines.push(`Invite:     ${b.interaction}`);
    lines.push('');
  });

  if (c.recap || c.tease || c.signoff) {
    lines.push('-- CLOSE --');
    if (c.recap)   lines.push(`Recap:   ${c.recap}`);
    if (c.tease)   lines.push(`Tease:   ${c.tease}`);
    if (c.signoff) lines.push(`Sign-off: ${c.signoff}`);
    lines.push('');
  }

  return lines.join('\n');
}

function buildPlanMailto(p) {
  const to = (p.partnerEmails || '')
    .split(',').map(s => s.trim()).filter(Boolean).join(',');
  return `mailto:${encodeURIComponent(to).replace(/%2C/g, ',')}?subject=${encodeURIComponent(buildPlanSubject(p))}&body=${encodeURIComponent(buildPlanText(p))}`;
}

function downloadPlanFile(p) {
  const blob = new Blob([buildPlanText(p)], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const safeShow = (p.showName || 'talk-show-plan').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  a.href = url;
  a.download = `${safeShow}-plan.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── Song Library Picker ───────────────────────────────────────
// Pulls the same song library the Broadcast Planner (wcyt.org/planner.html)
// uses, published as planner-songs.json on the main site (same-origin on
// wcyt.org). Fetched lazily on first use, then cached for the session.
let SONG_LIB = null;

async function loadSongLibrary() {
  if (SONG_LIB) return SONG_LIB;
  const res = await fetch('https://wcyt.org/planner-songs.json');
  if (!res.ok) throw new Error('HTTP ' + res.status);
  SONG_LIB = await res.json();
  return SONG_LIB;
}

function showSongPicker(targetId) {
  const p = S.plannerData || {};
  const stationKey = p.station === 'two' ? 'pt20' : 'wcyt';
  const stationLabel = stationKey === 'pt20' ? '2.0' : 'The Point 91FM';
  const m = modal(`
    <h2>🎵 Pick a Song</h2>
    <p class="hint" style="margin-bottom:12px">From the ${stationLabel} library — tap a song to add it to your plan.</p>
    <input id="song-picker-search" type="text" placeholder="Search title or artist...">
    <div id="song-picker-list" class="song-picker-list"><div class="song-picker-status">Loading the station library…</div></div>`, null, false);

  const listEl   = m.querySelector('#song-picker-list');
  const searchEl = m.querySelector('#song-picker-search');
  let songs = [];
  let cats  = {};

  function renderList() {
    const q = (searchEl.value || '').toLowerCase().trim();
    const matches = q
      ? songs.filter(s => s.t.toLowerCase().includes(q) || s.a.toLowerCase().includes(q))
      : songs;
    const shown = matches.slice(0, 60);
    listEl.innerHTML = shown.map((s, i) => {
      const cat = cats[s.c];
      return `
      <button type="button" class="song-picker-item" data-i="${i}">
        <span class="spi-title">${esc(s.t)}</span>
        <span class="spi-sub">${cat ? `<span class="spi-cat" style="color:${cat.color}">${esc(cat.label)}</span>` : ''}${esc(s.a)}${s.y ? ' · ' + s.y : ''}${s.d ? ' · ' + s.d : ''}</span>
      </button>`;
    }).join('') + (matches.length > 60
      ? `<div class="song-picker-status">Showing 60 of ${matches.length} — keep typing to narrow it down.</div>`
      : (matches.length ? '' : '<div class="song-picker-status">No songs match your search.</div>'));
    listEl.querySelectorAll('.song-picker-item').forEach(btn =>
      btn.addEventListener('click', () => {
        const s = shown[parseInt(btn.dataset.i)];
        const target = document.getElementById(targetId);
        if (target && s) {
          const text = `${s.t} — ${s.a}`;
          target.value = target.value ? target.value.trim() + ' ' + text : text;
          target.focus();
        }
        m.remove();
      }));
  }

  searchEl.addEventListener('input', renderList);

  loadSongLibrary().then(lib => {
    const stn = lib.stations[stationKey] || lib.stations.wcyt;
    songs = stn.songs || [];
    cats  = stn.cats || {};
    renderList();
    searchEl.focus();
  }).catch(() => {
    listEl.innerHTML = `<div class="song-picker-status">Couldn't load the song library — check your connection and try again.</div>`;
  });
}

// ── Teacher: Station Schedule ──────────────────────────────────
function showEditStationSlot(stationId, dayIdx) {
  const station = STATIONS.find(s => s.id === stationId);
  const slot = (S.stationSchedule[stationId] || [])[dayIdx] || { show: '', djs: [] };
  const dayName = DAYS[dayIdx];
  const hasContent = slot.show && slot.show.trim();
  const m = modal(`
    <h2>${station ? station.name + ' — ' : ''}${dayName}</h2>
    <div class="form-group">
      <label>Show Name</label>
      <input id="m-show" type="text" value="${esc(slot.show || '')}" placeholder="e.g. Morning Vibes">
    </div>
    <div class="form-group">
      <label>DJ(s) <span class="hint">(comma separated)</span></label>
      <input id="m-djs" type="text" value="${esc((slot.djs || []).join(', '))}" placeholder="Alex, Jordan">
    </div>`, hasContent ? 'Clear' : null);

  const save = async (show, djs) => {
    if (!S.stationSchedule[stationId]) S.stationSchedule[stationId] = DAYS.map(() => ({ show: '', djs: [] }));
    S.stationSchedule[stationId][dayIdx] = { show, djs };
    const db = getDB();
    if (db) { trackUsage('writes'); await db.collection('hm_radio').doc('station_schedule').set(S.stationSchedule).catch(() => {}); }
    m.remove(); render();
  };

  m.querySelector('#modal-save').addEventListener('click', () =>
    save(val('m-show'), val('m-djs').split(',').map(s => s.trim()).filter(Boolean)));

  const clearBtn = m.querySelector('#modal-extra');
  if (clearBtn) clearBtn.addEventListener('click', () => save('', []));
}

// ── Teacher: Broadcasts ───────────────────────────────────────
function showAddBroadcastModal() {
  const m = modal(`
    <h2>Add Broadcast</h2>
    <div class="form-group">
      <label>Event Name</label>
      <input id="m-title" type="text" placeholder="e.g. Varsity Football vs. East High">
    </div>
    <div class="form-group">
      <label>Date</label>
      <input id="m-date" type="date">
    </div>
    <div class="form-group">
      <label>Game Time <span class="hint">(e.g. 7:30 PM)</span></label>
      <input id="m-gametime" type="text" placeholder="7:30 PM">
    </div>
    <div class="form-group">
      <label>Type</label>
      <select id="m-type">
        ${Object.entries(EVENT_TYPES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
      </select>
    </div>`);
  m.querySelector('#modal-save').addEventListener('click', async () => {
    const title    = val('m-title');
    const date     = val('m-date');
    const type     = val('m-type');
    const gameTime = val('m-gametime');
    if (!title || !date) { showToast('Please fill in all fields.'); return; }
    const db = getDB();
    const doc = { title, date, type, gameTime, roles: {}, checks: {} };
    if (db) {
      try { trackUsage('writes'); const ref = await db.collection('hm_broadcasts').add(doc); doc.id = ref.id; } catch(e) {}
    }
    if (!doc.id) doc.id = Date.now().toString();
    S.broadcasts.push(doc);
    m.remove(); render();
  });
}

async function saveRoleAssignments() {
  const b = (S.broadcasts || []).find(x => x.id === S.broadcastId);
  if (!b) return;
  const roles = {};
  document.querySelectorAll('.role-input').forEach(el => { roles[el.dataset.role] = shortenName(el.value.trim()); });
  b.roles = roles;
  const db = getDB();
  if (db) { trackUsage('writes'); await db.collection('hm_broadcasts').doc(b.id).update({ roles }).catch(() => {}); }
  showToast('Roles saved!');
  render();
}

async function saveBroadcastNotes() {
  const b = (S.broadcasts || []).find(x => x.id === S.broadcastId);
  if (!b) return;
  b.notes = val('broadcast-notes');
  const db = getDB();
  if (db) { trackUsage('writes'); await db.collection('hm_broadcasts').doc(b.id).update({ notes: b.notes }).catch(() => {}); }
  showToast('Notes saved!');
  render();
}

async function saveChecklist() {
  const b = (S.broadcasts || []).find(x => x.id === S.broadcastId);
  if (!b) return;
  const checks = {};
  document.querySelectorAll('.check-item').forEach((cb, i) => { checks[i] = cb.checked; });
  b.checks = checks;
  const db = getDB();
  if (db) { trackUsage('writes'); await db.collection('hm_broadcasts').doc(b.id).update({ checks }).catch(() => {}); }
}


async function removeAvailability(availId) {
  S.availabilities = (S.availabilities || []).filter(a => a.id !== availId);
  const db = getDB();
  if (db) { trackUsage('writes'); await db.collection('hm_availability').doc(availId).delete().catch(() => {}); }
  render();
}

// ── Teacher: Submissions ──────────────────────────────────────
async function showSubmissions() {
  const db = getDB();
  let subs = [];
  if (db) {
    try {
      const snap = await db.collection('hm_radio_plans').get();
      trackUsage('reads', snap.size);
      snap.forEach(doc => subs.push({ id: doc.id, ...doc.data() }));
    } catch(e) {}
  }
  if (!subs.length) { showToast('No submissions yet.'); return; }

  const m = modal(`
    <h2>Student Submissions (${subs.length})</h2>
    <div class="submission-list">
      ${subs.map(s => `
        <div class="submission-item" data-sub-id="${s.id}">
          <div class="submission-student">${esc(s.studentName || 'Unknown')}</div>
          <div class="submission-show">${esc(s.showName || '—')} <span class="hint">(${esc((PLANNER_TYPES[s.showType] || PLANNER_TYPES.talk).label)})</span></div>
          <div class="submission-date">${s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : ''}</div>
        </div>`).join('')}
    </div>`, null, false);

  m.querySelectorAll('.submission-item').forEach(el => {
    el.addEventListener('click', () => {
      const sub = subs.find(s => s.id === el.dataset.subId);
      if (!sub) return;
      showSubmissionDetail(sub, m);
    });
  });
}

function showSubmissionDetail(sub, parentModal) {
  if (parentModal) parentModal.remove();
  const showType = sub.showType || 'talk';
  const typeLabel = (PLANNER_TYPES[showType] || PLANNER_TYPES.talk).label;

  let bodyHTML;
  if (showType === 'air' || showType === 'radio') {
    const o = sub.open || {};
    const c = sub.close || {};
    const breaks = (sub.breaks || []).filter(b => b && (b.backsell || b.presell || b.talkPoint || b.whyRelevant || b.interaction || b.coHostMoment));
    const purposeLabel = key => { const pu = PLANNER_PURPOSES.find(x => x.key === key); return pu ? `${pu.icon} ${esc(pu.label)}` : esc(key); };
    bodyHTML = `
      <div class="submission-detail">
        <div class="submission-field">
          <div class="submission-field-label">Station</div>
          <div class="submission-field-value">${sub.station === 'two' ? '2.0' : 'The Point 91FM'}</div>
        </div>
        ${(o.welcome || o.reset || o.preview) ? `
        <div class="submission-field">
          <div class="submission-field-label">Open</div>
          <div class="submission-field-value">
            ${o.welcome ? `<em>Welcome:</em> ${esc(o.welcome)}<br>` : ''}
            ${o.reset ? `<em>Reset:</em> ${esc(o.reset)}<br>` : ''}
            ${o.preview ? `<em>Preview:</em> ${esc(o.preview)}` : ''}
          </div>
        </div>` : ''}
        ${breaks.length ? breaks.map((b, i) => `
        <div class="submission-field">
          <div class="submission-field-label">Break ${i + 1}</div>
          <div class="submission-field-value">
            ${(b.purposes || []).length ? `<div class="review-purpose-tags">${b.purposes.map(k => `<span class="idea-tag purpose-fixed">${purposeLabel(k)}</span>`).join('')}</div>` : ''}
            ${b.whyRelevant ? `<em>Why:</em> ${esc(b.whyRelevant)}<br>` : ''}
            ${b.backsell ? `<em>Back-sell:</em> ${esc(b.backsell)}<br>` : ''}
            ${esc(b.talkPoint || '')}
            ${b.coHostMoment ? `<br><em>Trade Mic:</em> ${esc(b.coHostMoment)}` : ''}
            ${b.presell ? `<br><em>Pre-sell:</em> ${esc(b.presell)}` : ''}
            ${b.interaction ? `<br><em>Invite:</em> ${esc(b.interaction)}` : ''}
          </div>
        </div>`).join('') : `
        <div class="submission-field">
          <div class="submission-field-label">Breaks</div>
          <div class="submission-field-value">—</div>
        </div>`}
        ${(c.recap || c.tease || c.signoff) ? `
        <div class="submission-field">
          <div class="submission-field-label">Close</div>
          <div class="submission-field-value">
            ${c.recap ? `<em>Recap:</em> ${esc(c.recap)}<br>` : ''}
            ${c.tease ? `<em>Tease:</em> ${esc(c.tease)}<br>` : ''}
            ${c.signoff ? `<em>Sign-off:</em> ${esc(c.signoff)}` : ''}
          </div>
        </div>` : ''}
      </div>`;
  } else {
    const b1 = ((sub.breaks || [])[0]) || {};
    const b2 = ((sub.breaks || [])[1]) || {};
    const b3 = ((sub.breaks || [])[2]) || {};
    bodyHTML = `
      <div class="submission-detail">
        <div class="submission-field">
          <div class="submission-field-label">Theme</div>
          <div class="submission-field-value"><strong>${esc((sub.theme || {}).title || '—')}</strong><br>${esc((sub.theme || {}).description || '')}</div>
        </div>
        ${(sub.theme || {}).welcome ? `
        <div class="submission-field">
          <div class="submission-field-label">Welcome</div>
          <div class="submission-field-value">${esc((sub.theme || {}).welcome)}</div>
        </div>` : ''}
        <div class="submission-field">
          <div class="submission-field-label">Break 1 — ${esc(b1.title || 'News')}</div>
          <div class="submission-field-value">${esc(b1.newsUpdate || '—')}<br><em>Connection: ${esc(b1.connection || '—')}</em></div>
        </div>
        <div class="submission-field">
          <div class="submission-field-label">Break 2 — ${esc(b2.title || 'Activity')}</div>
          <div class="submission-field-value">
            ${esc(b2.activityHook || '—')}<br><em>Connection: ${esc(b2.connection || '—')}</em>
            ${b2.interaction ? `<br><em>Invite: ${esc(b2.interaction)}</em>` : ''}
          </div>
        </div>
        <div class="submission-field">
          <div class="submission-field-label">Break 3 — ${esc(b3.title || 'Main Topic')}</div>
          <div class="submission-field-value">
            ${(b3.talkingPoints || []).filter(Boolean).map((t, i) => `${i + 1}. ${esc(t)}`).join('<br>') || '—'}<br>
            <em>Format: ${esc(b3.format || '—')}</em>
          </div>
        </div>
      </div>`;
  }

  const m = modal(`
    <h2>${esc(sub.studentName)} — ${esc(sub.showName || 'Untitled')} <span class="hint">(${esc(typeLabel)})</span></h2>
    <button class="btn-secondary" id="submission-download-btn" style="margin-bottom:14px">⬇️ Download</button>
    ${bodyHTML}`, null, false);
  m.querySelector('#submission-download-btn')?.addEventListener('click', () => downloadPlanFile({ ...sub, showType }));
}

// ── Firebase Usage Tracking ───────────────────────────────────
function getUsage() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const u = JSON.parse(localStorage.getItem('hm_usage') || '{}');
    if (u.date !== today) return { date: today, reads: 0, writes: 0 };
    return u;
  } catch(e) { return { date: today, reads: 0, writes: 0 }; }
}
function trackUsage(type, n = 1) {
  const u = getUsage();
  u[type] = (u[type] || 0) + n;
  try { localStorage.setItem('hm_usage', JSON.stringify(u)); } catch(e) {}
  // Any write from this browser invalidates its read cache so the writer
  // always sees their own change on next load. Other browsers refresh
  // within the cache TTL.
  if (type === 'writes') cacheClearAll();
}

// ── Read cache ────────────────────────────────────────────────
// Firestore's free-tier read quota is shared by every visitor, so each
// page load re-fetching every collection adds up fast with a full class.
// Loads go through cachedLoad: fresh cache (< TTL) skips Firestore
// entirely; a failed fetch (offline OR quota exhausted) falls back to
// the stale cache so the site degrades to slightly-old data instead of
// rendering empty.
const HM_CACHE_TTL = 10 * 60 * 1000;
function cacheGet(key) {
  try { return JSON.parse(localStorage.getItem('hm_cache_' + key) || 'null'); } catch(e) { return null; }
}
function cacheSet(key, data) {
  try { localStorage.setItem('hm_cache_' + key, JSON.stringify({ t: Date.now(), data })); } catch(e) {}
}
function cacheClearAll() {
  try {
    Object.keys(localStorage).filter(k => k.startsWith('hm_cache_')).forEach(k => localStorage.removeItem(k));
  } catch(e) {}
}
async function cachedLoad(key, fetcher, apply) {
  const c = cacheGet(key);
  if (c && Date.now() - c.t < HM_CACHE_TTL) { apply(c.data); return true; }
  try {
    const data = await fetcher();
    cacheSet(key, data);
    apply(data);
    return true;
  } catch(e) {
    if (c) { apply(c.data); return true; }
    return false;
  }
}

// ── Helpers ───────────────────────────────────────────────────
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

// Privacy: student names are stored as "First L." (first name + last initial)
// rather than full names, since Firestore data here isn't access-controlled.
function shortenName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] || '';
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0];
  return lastInitial ? `${first} ${lastInitial.toUpperCase()}.` : first;
}

function fmtDate(dateStr, long) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return long
      ? d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch(e) { return dateStr; }
}

function modal(bodyHtml, extraBtnLabel, showSave = true) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      ${bodyHtml}
      <div class="modal-actions">
        <button class="btn-secondary" id="modal-cancel">Cancel</button>
        ${extraBtnLabel ? `<button class="btn-danger" id="modal-extra">${extraBtnLabel}</button>` : ''}
        ${showSave ? `<button class="btn-primary" id="modal-save">Save</button>` : ''}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
  return overlay;
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}

// ── Event Listeners ───────────────────────────────────────────
function attachListeners() {
  document.querySelectorAll('[data-nav]').forEach(el =>
    el.addEventListener('click', () => {
      if (el.dataset.nav === 'lessons') {
        S.lessonCourse = null; S.lessonUnit = null; S.lessonId = null;
      }
      if (el.dataset.nav === 'icebreaker') {
        unsubIcebreakerGames();
        S.icebreakerGame = 'menu';
      }
      go(el.dataset.nav);
    }));

  document.querySelectorAll('[data-broadcast]').forEach(el =>
    el.addEventListener('click', () => go('broadcast', { broadcastId: el.dataset.broadcast })));

  document.querySelectorAll('.sched-edit').forEach(el =>
    el.addEventListener('click', (e) => { e.stopPropagation(); showEditBroadcastModal(el.dataset.id); }));

  const tt = document.getElementById('teacher-toggle');
  if (tt) tt.addEventListener('click', () => {
    if (S.teacherMode) {
      S.teacherMode = false;
      if (S.view === 'dashboard') go('home');
      else render();
    } else {
      S.showTeacherPin = true;
      render();
    }
  });

  const teacherPinInput  = document.getElementById('teacher-pin-input');
  const teacherPinSubmit = document.getElementById('teacher-pin-submit');
  const teacherPinCancel = document.getElementById('teacher-pin-cancel');
  const teacherPinOverlay = document.getElementById('teacher-pin-overlay');

  if (teacherPinInput) teacherPinInput.focus();

  if (teacherPinSubmit) teacherPinSubmit.addEventListener('click', () => {
    const pin = teacherPinInput?.value || '';
    if (pin === TEACHER_PIN) {
      S.teacherMode = true; S.showTeacherPin = false;
      cacheClearAll();   // teacher always starts from fresh data
      render();
    } else {
      teacherPinInput.value = '';
      teacherPinInput.placeholder = 'Incorrect PIN — try again';
      teacherPinInput.focus();
    }
  });

  if (teacherPinCancel) teacherPinCancel.addEventListener('click', () => {
    S.showTeacherPin = false; render();
  });

  if (teacherPinInput) teacherPinInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') teacherPinSubmit?.click();
    if (e.key === 'Escape') teacherPinCancel?.click();
  });

  if (teacherPinOverlay) teacherPinOverlay.addEventListener('click', e => {
    if (e.target === teacherPinOverlay) { S.showTeacherPin = false; render(); }
  });

  const sp = document.getElementById('start-planner');
  if (sp) sp.addEventListener('click', () => { S.plannerData = S.plannerData || {}; S.plannerStep = 0; go('planner'); });

  const pn = document.getElementById('planner-next');
  if (pn) pn.addEventListener('click', savePlannerStep);

  const pb = document.getElementById('planner-back');
  if (pb) pb.addEventListener('click', () => { S.plannerStep--; render(); });

  const ps = document.getElementById('planner-submit');
  if (ps) ps.addEventListener('click', submitPlan);

  const pd = document.getElementById('planner-download');
  if (pd) pd.addEventListener('click', () => downloadPlanFile(S.plannerData || {}));

  document.querySelectorAll('.showtype-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      S.plannerData = S.plannerData || {};
      S.plannerData.showType = btn.dataset.showtype;
      render();
    }));

  document.querySelectorAll('.chip').forEach(chip =>
    chip.addEventListener('click', () => {
      const target = document.getElementById(chip.dataset.chipTarget);
      if (!target) return;
      target.value = target.value ? target.value.trim() + ' ' + chip.dataset.chipText : chip.dataset.chipText;
      target.focus();
    }));

  document.querySelectorAll('.song-pick-btn').forEach(btn =>
    btn.addEventListener('click', () => showSongPicker(btn.dataset.songTarget)));

  document.querySelectorAll('.purpose-chip').forEach(chip =>
    chip.addEventListener('click', () => {
      const idx = parseInt(chip.dataset.purposeBreak);
      const key = chip.dataset.purposeKey;
      S.plannerData = S.plannerData || {};
      const p = S.plannerData;
      if (!p.breaks) p.breaks = [];
      if (!p.breaks[idx]) p.breaks[idx] = {};
      if (!p.breaks[idx].purposes) p.breaks[idx].purposes = [];
      const purposes = p.breaks[idx].purposes;
      const at = purposes.indexOf(key);
      if (at === -1) purposes.push(key); else purposes.splice(at, 1);
      chip.classList.toggle('active');
    }));

  const ab = document.getElementById('add-broadcast');
  if (ab) ab.addEventListener('click', showAddBroadcastModal);

  const sr = document.getElementById('save-roles');
  if (sr) sr.addEventListener('click', saveRoleAssignments);

  const sn = document.getElementById('save-notes');
  if (sn) sn.addEventListener('click', saveBroadcastNotes);

  const vs = document.getElementById('view-submissions');
  if (vs) vs.addEventListener('click', showSubmissions);

  document.querySelectorAll('.slot-edit-btn').forEach(btn =>
    btn.addEventListener('click', () => showEditStationSlot(btn.dataset.station, parseInt(btn.dataset.day))));

  document.querySelectorAll('.check-item').forEach(cb =>
    cb.addEventListener('change', saveChecklist));

  const oi = document.getElementById('open-iasb');
  if (oi) oi.addEventListener('click', () => go('iasb'));

  const brSubmit = document.getElementById('br-submit');
  if (brSubmit) brSubmit.addEventListener('click', submitBellRinger);

  const brManage = document.getElementById('br-manage-questions');
  if (brManage) brManage.addEventListener('click', () => brQStartEdit(brManage.dataset.brClass));

  const brClear = document.getElementById('br-clear');
  if (brClear) brClear.addEventListener('click', () => clearBellRingerWall(brClear.dataset.brClass));

  const dbBrClassSel = document.getElementById('db-br-class');
  if (dbBrClassSel) dbBrClassSel.addEventListener('change', () => { S.dbBrClass = dbBrClassSel.value; render(); });

  const dbBrManage = document.getElementById('db-br-manage');
  if (dbBrManage) dbBrManage.addEventListener('click', dbManageBellRingerQuestions);

  const dbBrClear = document.getElementById('db-br-clear');
  if (dbBrClear) dbBrClear.addEventListener('click', () => clearBellRingerWall(S.dbBrClass || 'radio'));

  const ibSubmit = document.getElementById('ib-submit');
  if (ibSubmit) ibSubmit.addEventListener('click', submitIcebreaker);

  const ibClear = document.getElementById('ib-clear');
  if (ibClear) ibClear.addEventListener('click', clearIcebreakerWall);

  const ibWall = document.getElementById('icebreaker-wall');
  if (ibWall) ibWall.addEventListener('click', e => {
    const nameBtn = e.target.closest('.ib-name-btn');
    if (nameBtn) {
      const id = nameBtn.dataset.ibId;
      S.icebreakerOpenId = S.icebreakerOpenId === id ? null : id;
      S.icebreakerQuiz = blankIcebreakerQuiz();
      ibWall.innerHTML = renderIcebreakerWallCards(S.icebreakerEntries);
      return;
    }
    if (e.target.closest('.ib-quiz-reveal')) {
      S.icebreakerQuiz.revealed = true;
      ibWall.innerHTML = renderIcebreakerWallCards(S.icebreakerEntries);
      return;
    }
    if (e.target.closest('.ib-quiz-back')) {
      S.icebreakerOpenId = null;
      S.icebreakerQuiz = blankIcebreakerQuiz();
      ibWall.innerHTML = renderIcebreakerWallCards(S.icebreakerEntries);
      return;
    }
  });

  document.querySelectorAll('.ib-menu-card').forEach(btn =>
    btn.addEventListener('click', () => switchIcebreakerGame(btn.dataset.game)));

  const ibBackLink = document.querySelector('.ib-back-link');
  if (ibBackLink) ibBackLink.addEventListener('click', () => switchIcebreakerGame('menu'));

  const qaSubmit = document.getElementById('qa-submit');
  if (qaSubmit) qaSubmit.addEventListener('click', submitQaAnswer);

  const qaClear = document.getElementById('qa-clear');
  if (qaClear) qaClear.addEventListener('click', clearQaAnswers);

  const qaPrev = document.getElementById('qa-prev');
  if (qaPrev) qaPrev.addEventListener('click', () => advanceQaQuestion(-1));

  const qaNext = document.getElementById('qa-next');
  if (qaNext) qaNext.addEventListener('click', () => advanceQaQuestion(1));

  const qaBoardPrev = document.getElementById('qa-board-prev');
  if (qaBoardPrev) qaBoardPrev.addEventListener('click', () => advanceQaQuestion(-1));

  const qaBoardNext = document.getElementById('qa-board-next');
  if (qaBoardNext) qaBoardNext.addEventListener('click', () => advanceQaQuestion(1));

  const qaBoardEdit = document.getElementById('qa-board-edit');
  if (qaBoardEdit) qaBoardEdit.addEventListener('click', openQaEdit);

  const qaEditSave = document.getElementById('qa-edit-save');
  if (qaEditSave) qaEditSave.addEventListener('click', saveQaCustomQuestion);

  const qaEditCancel = document.getElementById('qa-edit-cancel');
  if (qaEditCancel) qaEditCancel.addEventListener('click', closeQaEdit);

  const qaEditReset = document.getElementById('qa-edit-reset');
  if (qaEditReset) qaEditReset.addEventListener('click', resetQaCustomQuestion);

  const qaEditInput = document.getElementById('qa-edit-input');
  if (qaEditInput) qaEditInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveQaCustomQuestion(); }
    else if (e.key === 'Escape') closeQaEdit();
  });

  document.querySelectorAll('.tot-choice-btn').forEach(btn =>
    btn.addEventListener('click', () => submitTotVote(btn.dataset.choice)));

  document.querySelectorAll('.tot-div-choice-btn').forEach(btn =>
    btn.addEventListener('click', () => submitTotDivVote(btn.dataset.choice)));

  const totClear = document.getElementById('tot-clear');
  if (totClear) totClear.addEventListener('click', clearTotVotes);

  const totPrev = document.getElementById('tot-prev');
  if (totPrev) totPrev.addEventListener('click', () => advanceTotQuestion(-1));

  const totNext = document.getElementById('tot-next');
  if (totNext) totNext.addEventListener('click', () => advanceTotQuestion(1));

  const totStartDiv = document.getElementById('tot-start-div');
  if (totStartDiv) totStartDiv.addEventListener('click', startTotDivision);

  const totRevealShare = document.getElementById('tot-reveal-share');
  if (totRevealShare) totRevealShare.addEventListener('click', revealTotShare);

  const totBackPoll = document.getElementById('tot-back-poll');
  if (totBackPoll) totBackPoll.addEventListener('click', resetTotStage);

  const totBoardPrev = document.getElementById('tot-board-prev');
  if (totBoardPrev) totBoardPrev.addEventListener('click', () => advanceTotQuestion(-1));

  const totBoardNext = document.getElementById('tot-board-next');
  if (totBoardNext) totBoardNext.addEventListener('click', () => advanceTotQuestion(1));

  const totBoardStartDiv = document.getElementById('tot-board-start-div');
  if (totBoardStartDiv) totBoardStartDiv.addEventListener('click', startTotDivision);

  const totBoardRevealShare = document.getElementById('tot-board-reveal-share');
  if (totBoardRevealShare) totBoardRevealShare.addEventListener('click', revealTotShare);

  const totBoardBackPoll = document.getElementById('tot-board-back-poll');
  if (totBoardBackPoll) totBoardBackPoll.addEventListener('click', resetTotStage);

  document.querySelectorAll('button.bingo-cell[data-bingo-pos]').forEach(btn =>
    btn.addEventListener('click', () => openBingoCell(parseInt(btn.dataset.bingoPos))));

  document.querySelectorAll('.bingo-fill-save[data-bingo-pos]').forEach(btn =>
    btn.addEventListener('click', () => saveBingoCell(parseInt(btn.dataset.bingoPos))));

  document.querySelectorAll('.bingo-fill-cancel').forEach(btn =>
    btn.addEventListener('click', closeBingoCell));

  const bingoFillInput = document.getElementById('bingo-fill-input');
  if (bingoFillInput) bingoFillInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveBingoCell(parseInt(bingoFillInput.dataset.bingoPos));
    else if (e.key === 'Escape') closeBingoCell();
  });

  const bingoReset = document.getElementById('bingo-reset');
  if (bingoReset) bingoReset.addEventListener('click', resetBingoCard);

  const bingoClear = document.getElementById('bingo-clear');
  if (bingoClear) bingoClear.addEventListener('click', clearBingoWinners);

  const bingoName = document.getElementById('bingo-name');
  if (bingoName) bingoName.addEventListener('change', () => localStorage.setItem('hm_student_name', shortenName(bingoName.value.trim())));

  const matchPrev = document.getElementById('match-prev');
  if (matchPrev) matchPrev.addEventListener('click', () => advanceMatchQuestion(-1));

  const matchNext = document.getElementById('match-next');
  if (matchNext) matchNext.addEventListener('click', () => advanceMatchQuestion(1));

  const matchStartTimer = document.getElementById('match-start-timer');
  if (matchStartTimer) matchStartTimer.addEventListener('click', startMatchTimer);

  const matchBoardNext = document.getElementById('match-board-next');
  if (matchBoardNext) matchBoardNext.addEventListener('click', () => advanceMatchQuestion(1));

  const matchBoardTimer = document.getElementById('match-board-timer');
  if (matchBoardTimer) matchBoardTimer.addEventListener('click', startMatchTimer);

  const rapidSignup = document.getElementById('rapid-signup');
  if (rapidSignup) rapidSignup.addEventListener('click', submitRapidSignup);

  const rapidNameInput = document.getElementById('rapid-name');
  if (rapidNameInput) rapidNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitRapidSignup(); });

  const rapidAction = document.getElementById('rapid-action');
  if (rapidAction) rapidAction.addEventListener('click', () => S.rapidStage === 'name' ? pickRapidQuestion() : pickRapidName());

  const rapidReset = document.getElementById('rapid-reset');
  if (rapidReset) rapidReset.addEventListener('click', resetRapidRound);

  const rapidClear = document.getElementById('rapid-clear');
  if (rapidClear) rapidClear.addEventListener('click', clearRapidSignups);

  const rapidBoardAction = document.getElementById('rapid-board-action');
  if (rapidBoardAction) rapidBoardAction.addEventListener('click', () => S.rapidStage === 'name' ? pickRapidQuestion() : pickRapidName());

  const rapidBoardReset = document.getElementById('rapid-board-reset');
  if (rapidBoardReset) rapidBoardReset.addEventListener('click', resetRapidRound);

  document.querySelectorAll('.wyr-choice-btn').forEach(btn =>
    btn.addEventListener('click', () => submitWyrVote(btn.dataset.choice)));

  const wyrClear = document.getElementById('wyr-clear');
  if (wyrClear) wyrClear.addEventListener('click', clearWyrVotes);

  const wyrPrev = document.getElementById('wyr-prev');
  if (wyrPrev) wyrPrev.addEventListener('click', () => advanceWyrQuestion(-1));

  const wyrNext = document.getElementById('wyr-next');
  if (wyrNext) wyrNext.addEventListener('click', () => advanceWyrQuestion(1));

  const wyrBoardPrev = document.getElementById('wyr-board-prev');
  if (wyrBoardPrev) wyrBoardPrev.addEventListener('click', () => advanceWyrQuestion(-1));

  const wyrBoardNext = document.getElementById('wyr-board-next');
  if (wyrBoardNext) wyrBoardNext.addEventListener('click', () => advanceWyrQuestion(1));

  const speedNew = document.getElementById('speed-new');
  if (speedNew) speedNew.addEventListener('click', newSpeedQuestion);

  const speedStartTimer = document.getElementById('speed-start-timer');
  if (speedStartTimer) speedStartTimer.addEventListener('click', startSpeedTimer);

  const commonOptions = document.getElementById('common-options');
  if (commonOptions) commonOptions.addEventListener('click', e => {
    const btn = e.target.closest('[data-option]');
    if (btn) submitCommonAnswer(btn.dataset.option);
  });

  const commonPrev = document.getElementById('common-prev');
  if (commonPrev) commonPrev.addEventListener('click', () => advanceCommonCategory(-1));

  const commonNext = document.getElementById('common-next');
  if (commonNext) commonNext.addEventListener('click', () => advanceCommonCategory(1));

  const commonClear = document.getElementById('common-clear');
  if (commonClear) commonClear.addEventListener('click', clearCommonAnswers);

  const rankItems = document.getElementById('rank-items');
  if (rankItems) rankItems.addEventListener('click', e => {
    const btn = e.target.closest('[data-item]');
    if (btn) tapRankItem(parseInt(btn.dataset.item));
  });

  const rankSubmit = document.getElementById('rank-submit');
  if (rankSubmit) rankSubmit.addEventListener('click', submitRankAnswer);

  const rankClear = document.getElementById('rank-clear');
  if (rankClear) rankClear.addEventListener('click', clearRankAnswers);

  const rankPrev = document.getElementById('rank-prev');
  if (rankPrev) rankPrev.addEventListener('click', () => advanceRankRound(-1));

  const rankNext = document.getElementById('rank-next');
  if (rankNext) rankNext.addEventListener('click', () => advanceRankRound(1));

  document.querySelectorAll('.rd-input').forEach(ta =>
    ta.addEventListener('blur', () => saveRundownCell(ta.dataset.week, ta.dataset.role, ta.value)));

  document.querySelectorAll('.rd-pair-input').forEach(input =>
    input.addEventListener('blur', () => {
      const { week, role, idx } = input.dataset;
      const existing = (S.rundownData[week] || {})[role];
      const pair = Array.isArray(existing) ? [...existing] : ['', ''];
      while (pair.length < 2) pair.push('');
      pair[parseInt(idx)] = input.value;
      saveRundownCell(week, role, pair);
    }));

  document.querySelectorAll('.rd-struct-input').forEach(input =>
    input.addEventListener('blur', () => {
      const { week, role, idx, field } = input.dataset;
      const existing = (S.rundownData[week] || {})[role];
      const items = Array.isArray(existing) ? existing.map(i => ({ ...i })) : [];
      const i = parseInt(idx);
      while (items.length <= i) items.push({ topic: '', student: '' });
      items[i] = { ...items[i], [field]: input.value };
      saveRundownCell(week, role, items);
    }));

  document.querySelectorAll('.rd-type-toggle').forEach(btn =>
    btn.addEventListener('click', () => {
      const { week, role, idx } = btn.dataset;
      const existing = (S.rundownData[week] || {})[role];
      const items = Array.isArray(existing) ? existing.map(i => ({ ...i })) : [];
      const i = parseInt(idx);
      while (items.length <= i) items.push({ type: 'VO', topic: '', student: '' });
      items[i] = { ...items[i], type: items[i].type === 'VOSOT' ? 'VO' : 'VOSOT' };
      saveRundownCell(week, role, items);
      render();
    }));

  document.querySelectorAll('.rd-add-item').forEach(btn =>
    btn.addEventListener('click', () => {
      const { week, role } = btn.dataset;
      if (!S.rundownData[week]) S.rundownData[week] = {};
      const existing = S.rundownData[week][role];
      const items = Array.isArray(existing) ? [...existing] : (existing ? [{ type: 'VO', topic: existing, student: '' }] : []);
      items.push({ type: 'VO', topic: '', student: '' });
      S.rundownData[week][role] = items;
      saveRundownCell(week, role, items);
      render();
    }));

  document.getElementById('rd-log-btn')?.addEventListener('click', () => {
    S.showRundownLog = !S.showRundownLog;
    if (S.showRundownLog) { S.rundownLog = null; loadRundownLog(); }
    render();
  });

  document.getElementById('rd-prev')?.addEventListener('click', () => {
    S.rundownWeekOffset = (S.rundownWeekOffset || 0) - 1;
    render(); loadRundownData();
  });
  document.getElementById('rd-next')?.addEventListener('click', () => {
    S.rundownWeekOffset = (S.rundownWeekOffset || 0) + 1;
    render(); loadRundownData();
  });
  document.getElementById('rd-today')?.addEventListener('click', () => {
    S.rundownWeekOffset = 0;
    render(); loadRundownData();
  });

  document.querySelectorAll('[data-db-section]').forEach(el =>
    el.addEventListener('click', e => {
      if (e.target.closest('a, button, input, select')) return;
      const id = el.dataset.dbSection;
      S.dashSections = { ...(S.dashSections || {}), [id]: !(S.dashSections || {})[id] };
      render();
    }));

  document.getElementById('lc-prev')?.addEventListener('click', () => { S.calMonthOffset = (S.calMonthOffset || 0) - 1; render(); });
  document.getElementById('lc-next')?.addEventListener('click', () => { S.calMonthOffset = (S.calMonthOffset || 0) + 1; render(); });
  document.querySelectorAll('.lc-has-event').forEach(el =>
    el.addEventListener('click', () => {
      const id = el.dataset.broadcast;
      if (id) { S.broadcastId = id; go('broadcast'); }
    }));

  document.querySelectorAll('[data-show-date]').forEach(btn =>
    btn.addEventListener('click', () => toggleShowDate(btn.dataset.showDate)));

  document.querySelectorAll('[data-beat-toggle]').forEach(el =>
    el.addEventListener('click', e => {
      if (e.target.closest('.beat-assign-inline, .beat-edit-form, .beat-meet')) return;
      const id = parseInt(el.dataset.beatToggle);
      S.expandedBeat = S.expandedBeat === id ? null : id;
      render();
    }));

  document.querySelectorAll('.beat-met-check').forEach(cb =>
    cb.addEventListener('change', () =>
      beatToggleMet(parseInt(cb.dataset.beatId), cb.dataset.metKey, cb.checked)));

  document.querySelectorAll('.beat-save-btn').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.beatId);
      const row = btn.closest('.beat-row');
      const s1  = row.querySelector('.beat-s1-input')?.value || '';
      const s2  = row.querySelector('.beat-s2-input')?.value || '';
      saveBeatAssignment(id, s1, s2);
    }));

  document.getElementById('story-plan-new-btn')?.addEventListener('click', () => storyPlanStartNew());

  document.querySelectorAll('[data-story-toggle]').forEach(el =>
    el.addEventListener('click', () => {
      const id = el.dataset.storyToggle;
      if (S.expandedStoryPlan === id) storyPlanCancelEdit();
      else storyPlanStartEdit(id);
    }));

  document.getElementById('story-plan-save-btn')?.addEventListener('click', () => storyPlanSave());
  document.getElementById('story-plan-cancel-btn')?.addEventListener('click', () => storyPlanCancelEdit());
  document.getElementById('story-plan-delete-btn')?.addEventListener('click', () => {
    if (_storyPlanDraft?.id) storyPlanDelete(_storyPlanDraft.id);
  });
  document.getElementById('story-plan-suggest-btn')?.addEventListener('click', () => {
    if (_storyPlanDraft?.id) storyPlanAddSuggestion(_storyPlanDraft.id);
  });
  document.querySelectorAll('[data-story-approve]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.storyApprove;
      const p = (S.storyPlans || []).find(x => x.id === id);
      storyPlanSetApproved(id, !(p && p.approved));
    }));

  document.querySelectorAll('[data-story-add-rundown]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      storyPlanAddToRundown(btn.dataset.storyAddRundown);
    }));

  document.querySelectorAll('[data-story-archive]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      storyPlanSetArchived(btn.dataset.storyArchive, btn.dataset.archiveTo === 'true');
    }));

  document.querySelectorAll('[data-story-filter]').forEach(btn =>
    btn.addEventListener('click', () => {
      S.storyPlanFilter = btn.dataset.storyFilter;
      render();
    }));

  document.querySelectorAll('[data-iasb-cat]').forEach(el =>
    el.addEventListener('click', () => {
      S.iasbCategory = el.dataset.iasbCat;
      go('iasb-category');
    }));

  const ri = document.getElementById('register-iasb-entry');
  if (ri && !ri.disabled) ri.addEventListener('click', () => {
    const cat = IASB_CATEGORIES.find(c => c.code === S.iasbCategory);
    if (cat) showRegisterIASBModal(cat);
  });

  document.querySelectorAll('.iasb-entry-check').forEach(cb =>
    cb.addEventListener('change', () =>
      updateIASBCheckItem(cb.dataset.entryId, parseInt(cb.dataset.idx), cb.checked)));

  document.querySelectorAll('.iasb-mark-submitted').forEach(btn =>
    btn.addEventListener('click', () => markIASBSubmitted(btn.dataset.entryId, true)));

  document.querySelectorAll('.iasb-unmark-submitted').forEach(btn =>
    btn.addEventListener('click', () => markIASBSubmitted(btn.dataset.entryId, false)));

  document.querySelectorAll('.iasb-delete-entry').forEach(btn =>
    btn.addEventListener('click', () => {
      if (confirm('Delete this entry? This cannot be undone.')) deleteIASBEntry(btn.dataset.entryId);
    }));

  document.querySelectorAll('.avail-assign-sel').forEach(sel =>
    sel.addEventListener('change', () => {
      if (!sel.value) return;
      const input = document.querySelector(`.role-input[data-role="${sel.value}"]`);
      if (input) input.value = sel.dataset.name;
      showToast(`${sel.dataset.name} → ${sel.value}`);
      sel.value = '';
    }));

  document.querySelectorAll('.avail-del-btn').forEach(btn =>
    btn.addEventListener('click', () => removeAvailability(btn.dataset.availId)));

  const apn = document.getElementById('avail-page-name');
  if (apn) {
    apn.addEventListener('blur', () => {
      const n = shortenName(apn.value.trim());
      if (n) { localStorage.setItem('hm_student_name', n); render(); }
    });
    apn.addEventListener('keydown', e => { if (e.key === 'Enter') apn.blur(); });
  }

  // (email collection removed — sign-ups run through the Google Form)

  const dbRefresh = document.getElementById('db-refresh-plans');
  if (dbRefresh) dbRefresh.addEventListener('click', dashboardLoadPlans);

  const syncBtn = document.getElementById('sync-cal-btn');
  if (syncBtn) syncBtn.addEventListener('click', () => {
    const status = document.getElementById('sync-cal-status');
    syncBtn.disabled = true;
    syncBtn.textContent = 'Syncing…';
    if (status) status.textContent = '';
    fetch(SYNC_SCRIPT_URL, { mode: 'no-cors' })
      .then(() => {
        syncBtn.textContent = '↻ Sync Athletics Calendar Now';
        syncBtn.disabled = false;
        if (status) status.textContent = 'Sync triggered — check the HHS Media Events calendar in a minute.';
      })
      .catch(() => {
        syncBtn.textContent = '↻ Sync Athletics Calendar Now';
        syncBtn.disabled = false;
        if (status) status.textContent = 'Could not reach sync script — check the URL in data.js.';
      });
  });

  const setupFoldersBtn = document.getElementById('setup-weekly-folders-btn');
  if (setupFoldersBtn) setupFoldersBtn.addEventListener('click', async () => {
    const out = document.getElementById('weekly-folders-result');
    setupFoldersBtn.disabled = true;
    setupFoldersBtn.textContent = 'Setting up…';
    try {
      const data = await fetchJsonp(`${SYNC_SCRIPT_URL}?action=createFutureFolders`);
      if (!data.success) throw new Error(data.error || 'Unknown error');
      if (out) out.innerHTML = `
        <p style="font-size:0.85rem;color:var(--success);margin:0 0 10px">Created ${data.ybCreated} new Yearbook folder(s) and ${data.airCreated} new Radio folder(s). Paste each block below over the matching array in <code>Code.gs</code>, then redeploy (Deploy → Manage deployments → Edit → New version).</p>
        <label style="font-size:0.78rem;color:var(--dim)">Yearbook — WEEKLY_FOLDERS</label>
        <textarea readonly onclick="this.select()" style="width:100%;height:140px;font-family:monospace;font-size:0.75rem;margin:4px 0 12px">${esc(data.yb)}</textarea>
        <label style="font-size:0.78rem;color:var(--dim)">Radio — AIR_WEEKLY_FOLDERS</label>
        <textarea readonly onclick="this.select()" style="width:100%;height:140px;font-family:monospace;font-size:0.75rem;margin:4px 0">${esc(data.air)}</textarea>`;
    } catch (err) {
      if (out) out.innerHTML = `<p style="font-size:0.85rem;color:var(--error)">Could not reach the script: ${esc(err.message)}</p>`;
    }
    setupFoldersBtn.disabled = false;
    setupFoldersBtn.textContent = '＋ Set Up Any New Weekly Folders';
  });

  document.querySelectorAll('.db-view-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      S.iasbCategory = btn.dataset.iasbCat;
      go('iasb-category');
    }));

  document.querySelectorAll('.db-plan-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = (S.submissions || []).find(s => s.id === btn.dataset.subId);
      if (sub) showSubmissionDetail(sub, null);
    });
  });

  // Yearbook role picker
  document.querySelectorAll('.yb-role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.yb-role-btn').forEach(b => b.classList.remove('yb-role-active'));
      btn.classList.add('yb-role-active');
      const ri = document.getElementById('yb-role');
      if (ri) ri.value = btn.dataset.role;
    });
  });

  const ybFormBtn = document.getElementById('yb-form-btn');
  if (ybFormBtn) ybFormBtn.addEventListener('click', () => {
    const evId = document.getElementById('yb-event')?.value;
    if (!evId) { showToast('Pick a sport/event type and an event first.'); return; }
    const ev = allYbEvents().find(e => e.id === evId);
    if (!ev) { showToast('Event not found — try again.'); return; }
    window.open(ybFormLink(ev), '_blank', 'noopener');
  });

  const ybSubmit = document.getElementById('yb-submit-btn');
  if (ybSubmit) ybSubmit.addEventListener('click', submitYearbookSignup);

  document.querySelectorAll('[data-yb-unsign]').forEach(btn =>
    btn.addEventListener('click', () => unsignYearbook(btn.dataset.ybUnsign)));

  // Yearbook dashboard
  const ybDash = document.getElementById('yb-dash-refresh');
  if (ybDash) ybDash.addEventListener('click', loadYearbookCoverage);

  document.querySelectorAll('[data-yb-view]').forEach(btn =>
    btn.addEventListener('click', () => { S.ybDashView = btn.dataset.ybView; render(); }));

  const ybAddBtn = document.getElementById('yb-add-event-btn');
  if (ybAddBtn) ybAddBtn.addEventListener('click', () => {
    const form = document.getElementById('yb-event-form');
    if (form) form.style.display = form.style.display === 'none' ? '' : 'none';
  });

  const ybCancelBtn = document.getElementById('yb-cancel-event-btn');
  if (ybCancelBtn) ybCancelBtn.addEventListener('click', () => {
    const form = document.getElementById('yb-event-form');
    if (form) form.style.display = 'none';
  });

  const ybSaveBtn = document.getElementById('yb-save-event-btn');
  if (ybSaveBtn) ybSaveBtn.addEventListener('click', saveYbEvent);

  const equipScan = document.getElementById('equip-scan');
  if (equipScan) equipScan.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); handleEquipmentScan(equipScan.value); }
  });
  const equipName = document.getElementById('equip-name');
  if (equipName) equipName.addEventListener('change', () => localStorage.setItem('hm_student_name', shortenName(equipName.value.trim())));

  const equipGoLiveBtn = document.getElementById('equip-go-live-btn');
  if (equipGoLiveBtn) equipGoLiveBtn.addEventListener('click', goLiveEquipment);

  document.querySelectorAll('.equip-delete-btn').forEach(btn =>
    btn.addEventListener('click', () => deleteEquipmentItem(btn.dataset.equipId)));

  document.querySelectorAll('.yb-delete-event-btn').forEach(btn =>
    btn.addEventListener('click', () => deleteYbEvent(btn.dataset.ybEventId)));

  const ybAwayToggle = document.getElementById('yb-away-toggle');
  if (ybAwayToggle) ybAwayToggle.addEventListener('click', () => {
    S.ybShowAway = !S.ybShowAway;
    render();
  });

  const ybRefreshCalBtn = document.getElementById('yb-refresh-cal-btn');
  if (ybRefreshCalBtn) ybRefreshCalBtn.addEventListener('click', async () => {
    ybRefreshCalBtn.disabled = true;
    ybRefreshCalBtn.textContent = 'Refreshing…';
    const db = getDB();
    if (db) {
      try { await db.collection('hm_config').doc('cal_cache').delete(); } catch(e) {}
    }
    S.calendarYbEvents = [];
    await loadCalendarYbEvents();
    render();
  });

  const bcastSyncBtn = document.getElementById('bcast-sync-btn');
  if (bcastSyncBtn) bcastSyncBtn.addEventListener('click', async () => {
    bcastSyncBtn.disabled = true;
    bcastSyncBtn.textContent = 'Syncing…';
    const db = getDB();
    if (db) {
      try { await db.collection('hm_config').doc('bcast_cal_cache').delete(); } catch(e) {}
    }
    S.calendarBroadcastEvents = [];
    await loadCalendarBroadcastEvents();
    const added = await syncBroadcastsFromCalendar();
    showToast(added ? `Added ${added} new broadcast${added !== 1 ? 's' : ''}.` : 'No new broadcasts found — everything is already synced.');
    render();
  });

  document.querySelectorAll('[data-lesson-course]').forEach(el =>
    el.addEventListener('click', () => {
      S.lessonCourse = el.dataset.lessonCourse;
      S.lessonUnit   = el.dataset.lessonUnit  || null;
      S.lessonId     = el.dataset.lessonId    || null;
      S.lessonSlide  = 0;
      go('lessons');
    }));

  // ── Lessons hub: live search across all courses ─────────────
  (() => {
    const searchEl = document.getElementById('lesson-search-input');
    const resultsEl = document.getElementById('lesson-search-results');
    if (!searchEl || !resultsEl) return;

    function renderSearchResults() {
      const q = searchEl.value.trim().toLowerCase();
      S.lessonSearchQuery = searchEl.value;
      if (!q) { resultsEl.innerHTML = ''; resultsEl.classList.remove('active'); return; }

      const matches = getAllLessonsFlat().filter(l =>
        l.title.toLowerCase().includes(q) ||
        (l.summary || '').toLowerCase().includes(q) ||
        (l.keywords || []).some(k => k.toLowerCase().includes(q)));

      resultsEl.classList.add('active');
      resultsEl.innerHTML = matches.length
        ? matches.map((l, i) => `
          <button type="button" class="lesson-search-item" data-i="${i}" style="--course-color:${l.courseColor}">
            <span class="lsi-icon">${l.courseIcon}</span>
            <span class="lsi-body">
              <span class="lsi-title">${esc(l.title)}</span>
              <span class="lsi-sub">${esc(l.courseName)} · ${esc(l.unitTitle)}${l.duration ? ' · ' + esc(l.duration) : ''}</span>
            </span>
            <span class="lsi-arrow">→</span>
          </button>`).join('')
        : `<div class="lesson-search-empty">No lessons match "${esc(searchEl.value.trim())}".</div>`;

      resultsEl.querySelectorAll('.lesson-search-item').forEach(btn =>
        btn.addEventListener('click', () => {
          const l = matches[parseInt(btn.dataset.i)];
          if (!l) return;
          S.lessonCourse = l.courseKey;
          S.lessonUnit   = l.unitId;
          S.lessonId     = l.id;
          S.lessonSlide  = 0;
          go('lessons');
        }));
    }

    searchEl.addEventListener('input', renderSearchResults);
    if (S.lessonSearchQuery) renderSearchResults();
  })();

  // ── Intro class info edit handlers ──────────────────────────
  document.querySelectorAll('[data-intro-expand]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.introExpand;
      S.expandedIntroClass = S.expandedIntroClass === key ? null : key;
      render();
    });
  });

  document.querySelectorAll('[data-intro-edit]').forEach(btn => {
    btn.addEventListener('click', () => { S.editingIntroClass = btn.dataset.introEdit; render(); });
  });
  const introCancelBtn = document.querySelector('[data-intro-cancel]');
  if (introCancelBtn) introCancelBtn.addEventListener('click', () => { S.editingIntroClass = null; render(); });
  document.querySelectorAll('[data-intro-save]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key     = btn.dataset.introSave;
      const blurb   = document.getElementById('intro-edit-blurb')?.value.trim();
      const dropbox = document.getElementById('intro-edit-dropbox')?.value.trim();
      const db = getDB();
      if (!db) return;
      trackUsage('writes');
      await db.collection('hm_intro_classes').doc(key).set({ blurb, dropbox }, { merge: true });
      S.introClassInfo[key] = { ...(S.introClassInfo[key] || {}), blurb, dropbox };
      S.editingIntroClass = null;
      render();
    });
  });

  const qlToggle = document.getElementById('ql-toggle');
  if (qlToggle) qlToggle.addEventListener('click', () => { S.showQuickLinks = !S.showQuickLinks; render(); });

  // ── Broadcast graphics checklist toggles ────────────────────
  document.querySelectorAll('[data-gc-toggle]').forEach(cb => {
    cb.addEventListener('change', async () => {
      const bid  = cb.dataset.gcBid;
      const item = cb.dataset.gcToggle;
      const set  = S.broadcastChecklist[bid] || new Set();
      cb.checked ? set.add(item) : set.delete(item);
      S.broadcastChecklist[bid] = set;
      const db = getDB();
      if (db) {
        trackUsage('writes');
        await db.collection('hm_broadcast_gc').doc(bid).set({ checked: [...set] }, { merge: true });
      }
    });
  });



  // ── Rundown handlers ─────────────────────────────────────────
  const rdEditTemplateBtn = document.getElementById('rd-edit-template-btn');
  if (rdEditTemplateBtn) rdEditTemplateBtn.addEventListener('click', () => {
    const sport = rdEditTemplateBtn.dataset.rdSport;
    S.rundownEditBackup = JSON.parse(JSON.stringify(S.sportTemplates[sport] || []));
    S.editingRundown = true;
    S.editingRundownType = 'template';
    render();
  });

  const rdEditGameBtn = document.getElementById('rd-edit-game-btn');
  if (rdEditGameBtn) rdEditGameBtn.addEventListener('click', () => {
    const bid = rdEditGameBtn.dataset.rdBid;
    const b = (S.broadcasts || []).find(x => x.id === bid);
    const rows = S.rundownOverrides[bid] ?? (S.sportTemplates[b?.type] || []);
    S.rundownEditBackup = JSON.parse(JSON.stringify(rows));
    // Start game edit from a copy of current rows (template or existing override)
    S.rundownOverrides[bid] = JSON.parse(JSON.stringify(rows));
    S.editingRundown = true;
    S.editingRundownType = 'game';
    render();
  });

  const rdCancelBtn = document.getElementById('rd-cancel-btn');
  if (rdCancelBtn) rdCancelBtn.addEventListener('click', () => {
    const bid = rdCancelBtn.dataset.rdBid;
    const b = (S.broadcasts || []).find(x => x.id === bid);
    if (S.editingRundownType === 'template' && b?.type) {
      S.sportTemplates[b.type] = S.rundownEditBackup;
    } else {
      S.rundownOverrides[bid] = S.rundownEditBackup?.length ? S.rundownEditBackup : null;
    }
    S.editingRundown = false;
    S.editingRundownType = null;
    S.rundownEditBackup = null;
    render();
  });

  const rdSaveBtn = document.getElementById('rd-save-btn');
  if (rdSaveBtn) rdSaveBtn.addEventListener('click', () => saveRundown(rdSaveBtn.dataset.rdBid));

  const rdResetBtn = document.getElementById('rd-reset-btn');
  if (rdResetBtn) rdResetBtn.addEventListener('click', () => {
    if (confirm('Reset this game to the master template? Your custom edits will be removed.'))
      resetRundownToTemplate(rdResetBtn.dataset.rdBid);
  });

  const rdPrintBtn = document.getElementById('rd-print-btn');
  if (rdPrintBtn) rdPrintBtn.addEventListener('click', () => {
    const bid = rdPrintBtn.dataset.rdBid;
    const b = (S.broadcasts || []).find(x => x.id === bid);
    if (!b) return;
    const rows = S.rundownOverrides[bid] ?? (S.sportTemplates[b.type] || []);
    printRundown(b, rows);
  });

  // rd-add-row and [data-rd-del] are handled via delegation in init()

  // ── Lesson delete / hide handlers ───────────────────────────
  document.querySelectorAll('[data-delete-lesson]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const lessonId = btn.dataset.deleteLesson;
      const type     = btn.dataset.deleteType;
      const label    = type === 'canva' ? 'Delete this Canva lesson?' : 'Hide this lesson for all students?';
      if (!confirm(label)) return;
      const db = getDB();
      if (!db) return;
      trackUsage('writes');
      if (type === 'canva') {
        await db.collection('hm_canva_lessons').doc(lessonId).delete();
        delete S.canvaLessons[lessonId];
      } else {
        await db.collection('hm_hidden_lessons').doc(lessonId).set({ hidden: true });
        S.hiddenLessons.add(lessonId);
      }
      render();
    });
  });

  // ── Lesson reorder (teacher move up/down) ─────────────────────
  document.querySelectorAll('[data-move-lesson]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (btn.disabled) return;
      moveLessonItem(btn.dataset.moveCourse, btn.dataset.moveLesson, btn.dataset.moveDir);
    });
  });

  // ── Lesson visibility toggle (teacher checkmarks) ────────────
  document.querySelectorAll('[data-toggle-lesson]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const id = btn.dataset.toggleLesson;
      const db = getDB();
      if (!db) return;
      trackUsage('writes');
      if (S.hiddenLessons.has(id)) {
        await db.collection('hm_hidden_lessons').doc(id).delete();
        S.hiddenLessons.delete(id);
      } else {
        await db.collection('hm_hidden_lessons').doc(id).set({ hidden: true });
        S.hiddenLessons.add(id);
      }
      render();
    });
  });

  // ── Lesson icon editing (teacher-only) ─────────────────────────
  document.querySelectorAll('[data-edit-icon]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const id = el.dataset.editIcon;
      const newIcon = prompt('Paste an emoji to use as this lesson\'s icon (leave blank to reset to default):', S.lessonIcons[id] || '');
      if (newIcon === null) return;
      setLessonIcon(id, newIcon.trim());
    });
  });

  // ── Lesson title editing (teacher-only) ─────────────────────────
  document.querySelectorAll('[data-edit-title]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const id = el.dataset.editTitle;
      const lesson = getAllLessonsFlat().find(l => l.id === id);
      if (!lesson) return;
      const newTitle = prompt(
        lesson.isCustom ? 'Edit this lesson\'s title:' : 'Edit this lesson\'s title (leave blank to reset to the default):',
        lesson.title);
      if (newTitle === null) return;
      renameLessonTitle(lesson, newTitle.trim());
    });
  });

  // ── Unit editing (teacher-only) ─────────────────────────────────
  document.querySelectorAll('[data-edit-unit]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const unitId = el.dataset.editUnit;
      const courseKey = S.lessonCourse;
      const unit = getCourseUnits(courseKey).find(u => u.id === unitId);
      if (!unit) return;
      const newTitle = prompt('Rename this unit:', unit.title);
      if (newTitle === null) return;
      renameUnit(courseKey, unitId, newTitle.trim());
    });
  });

  document.querySelectorAll('[data-toggle-unit]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleUnitHidden(S.lessonCourse, btn.dataset.toggleUnit);
    });
  });

  document.querySelectorAll('[data-delete-unit]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (btn.disabled) return;
      const unitId = btn.dataset.deleteUnit;
      const unit = getCourseUnits(S.lessonCourse).find(u => u.id === unitId);
      if (!confirm(`Delete the unit "${unit?.title || unitId}"?`)) return;
      deleteCustomUnit(S.lessonCourse, unitId);
    });
  });

  const addUnitBtn = document.getElementById('add-unit-btn');
  if (addUnitBtn) addUnitBtn.addEventListener('click', () => {
    const name = prompt('Name for the new unit:');
    if (name === null) return;
    const title = name.trim();
    if (!title) return;
    addCustomUnit(S.lessonCourse, title);
  });

  // ── Canva lesson handlers ────────────────────────────────────
  const lsConnectCanva = document.getElementById('ls-connect-canva');
  if (lsConnectCanva) lsConnectCanva.addEventListener('click', async () => {
    const url = prompt('Paste your Canva share link:', S.canvaLessons[S.lessonId]?.url || '');
    if (url === null) return;
    if (url && !isCanvaLink(url)) { showToast('That doesn\'t look like a Canva link.'); return; }
    if (url && isCanvaShortLink(url) && !confirm('This looks like a Canva "Public view" link — Canva blocks these from embedding inline, so the lesson will show an "Open in Canva" button instead of the design itself.\n\nFor it to embed directly on the page, go to Canva → Share → Embed and paste that link instead.\n\nSave this link anyway?')) return;
    const db = getDB();
    if (!db) return;
    trackUsage('writes');
    await db.collection('hm_canva_lessons').doc(S.lessonId).set({ url }, { merge: true });
    S.canvaLessons[S.lessonId] = { ...(S.canvaLessons[S.lessonId] || {}), url };
    render();
  });

  const canvaAddBtn = document.getElementById('canva-add-btn');
  if (canvaAddBtn) canvaAddBtn.addEventListener('click', () => {
    S.showCanvaForm = true; render();
  });

  const canvaCancelBtn = document.getElementById('canva-cancel-btn');
  if (canvaCancelBtn) canvaCancelBtn.addEventListener('click', () => {
    S.showCanvaForm = false; render();
  });

  const canvaSaveBtn = document.getElementById('canva-save-btn');
  if (canvaSaveBtn) canvaSaveBtn.addEventListener('click', async () => {
    const title    = document.getElementById('canva-title')?.value.trim();
    const duration = document.getElementById('canva-duration')?.value.trim();
    const url      = document.getElementById('canva-url')?.value.trim();
    if (!title || !url) { showToast('Title and Canva link are required.'); return; }
    if (!isCanvaLink(url)) { showToast('That doesn\'t look like a Canva link.'); return; }
    if (isCanvaShortLink(url) && !confirm('This looks like a Canva "Public view" link — Canva blocks these from embedding inline, so the lesson will show an "Open in Canva" button instead of the design itself.\n\nFor it to embed directly on the page, go to Canva → Share → Embed and paste that link instead.\n\nSave this link anyway?')) return;
    const db = getDB();
    if (!db) return;
    trackUsage('writes');
    const unit = document.getElementById('canva-unit')?.value || 'u1';
    const ref  = db.collection('hm_canva_lessons').doc();
    const data = { url, title, duration, course: S.lessonCourse || 'live', unit, isCustom: true, order: Date.now() };
    await ref.set(data);
    S.canvaLessons[ref.id] = data;
    S.showCanvaForm = false;
    showToast('Canva lesson added!');
    render();
  });

  document.querySelectorAll('[data-lesson-back]').forEach(el =>
    el.addEventListener('click', () => {
      const dest = el.dataset.lessonBack;
      if (dest === 'hub')    { S.lessonCourse = null; S.lessonUnit = null; S.lessonId = null; }
      if (dest === 'course') { S.lessonUnit = null; S.lessonId = null; }
      S.lessonSlide = 0;
      S.lessonEditOpen = false;
      go('lessons');
    }));

  document.querySelectorAll('[data-lesson-slide]').forEach(el =>
    el.addEventListener('click', () => {
      const dir = el.dataset.lessonSlide;
      const course = LESSONS[S.lessonCourse];
      if (!course) return;
      const unit = course.units.find(u => u.id === S.lessonUnit);
      if (!unit) return;
      const lesson = unit.lessons.find(l => l.id === S.lessonId);
      if (!lesson) return;
      const total = (lesson.sections || []).length + 2;
      if (dir === 'next' && S.lessonSlide < total - 1) S.lessonSlide++;
      if (dir === 'prev' && S.lessonSlide > 0) S.lessonSlide--;
      S.lessonEditOpen = false;
      go('lessons');
    }));

  document.getElementById('ls-edit-slide')?.addEventListener('click', () => {
    S.lessonEditOpen = !S.lessonEditOpen;
    render();
  });
  document.getElementById('ls-edit-save')?.addEventListener('click', saveLessonSlideEdit);
  document.getElementById('ls-edit-cancel')?.addEventListener('click', () => { S.lessonEditOpen = false; render(); });
  document.getElementById('ls-edit-reset')?.addEventListener('click', resetLessonSlideEdit);
}

// ── LESSONS ───────────────────────────────────────────────────
const LESSON_ICONS = {
  welcome: '🎙️', stations: '📡', fcc: '📜', expectations: '📋',
  'ap-intro': '🎤', 'front-load': '⏩', 'first-break': '🎛️',
  'radio-pairs': '👥',
  'show-structure': '🎭',
  'destructive-editing': '✂️',
  'audition-basics': '🎚️', 'stutter': '🔊', 'double-track': '🔁',
  'remix-stretch': '🎵', 'reverb': '🌊', 'spectral-display': '🌈',
  'radio-in-depth': '📰', 'iasb-imaging': '📢', 'iasb-air-personality': '🎙️',
  'iasb-talk-show': '💬', 'iasb-copywriting': '✍️', 'iasb-spot-production': '📻',
  'iasb-drama': '🎭', 'iasb-interview': '🎤', 'iasb-podcast': '🎧',
  'fcc-issue-report': '📜', 'iasb-radio-show': '🎶', 'iasb-news-anchor': '🗞️',
  'legal-id-aircheck-final': '🏁', 'imaging-4-weeks': '🗓️', 'bhm-liners': '📣',
};

function renderLessons() {
  if (S.lessonId) return renderLessonPage();
  if (S.lessonCourse) return renderLessonCourse();
  return renderLessonsHub();
}

function renderLessonsHub() {
  const cards = Object.entries(LESSONS).map(([key, course]) => {
    const totalLessons = getCourseLessonList(key).length;
    const locked = totalLessons === 0;
    return `
      <div class="class-card lesson-hub-card ${locked ? 'lesson-locked' : ''}"
           ${locked ? '' : `data-lesson-course="${key}"`}
           style="${locked ? '' : `--course-color:${course.color};border-color:${course.color}22`}">
        <div class="lesson-hub-icon" style="${locked ? '' : `background:${course.color}18`}">${course.icon}</div>
        <div class="class-name" style="color:${locked ? 'var(--dim)' : course.color}">${course.name}</div>
        ${totalLessons > 0
          ? `<div class="lesson-hub-meta">${course.units.length > 0 ? `${course.units.length} unit${course.units.length !== 1 ? 's' : ''} &nbsp;·&nbsp; ` : ''}${totalLessons} lesson${totalLessons !== 1 ? 's' : ''}</div>`
          : `<div class="lesson-hub-meta">Coming soon</div>`}
        <div class="class-enter">${locked ? 'Coming Soon' : 'Open →'}</div>
      </div>`;
  }).join('');

  return `
    ${navBar('lessons')}
    <div class="class-page">
      <div class="class-header">
        <div class="class-header-icon">📚</div>
        <div>
          <h1>Lessons</h1>
          <p>Pick a class to see units and lessons.</p>
        </div>
      </div>
      <div class="lesson-search-wrap">
        <input id="lesson-search-input" type="text" class="form-input" placeholder="🔍 Search all lessons by title or keyword…" value="${esc(S.lessonSearchQuery || '')}">
        <div id="lesson-search-results"></div>
      </div>
      <div class="class-grid">${cards}</div>
      ${(S.quickLinks['lessons']?.length || S.teacherMode) ? `<div style="max-width:600px;margin:0 auto">${renderQuickLinksCard('lessons')}</div>` : ''}
    </div>`;
}

function renderLessonItemRow(l, idx, unitLessons, courseKey, course) {
  const icon = getLessonIcon(l, course.icon);
  const isHidden = S.hiddenLessons.has(l.id);
  return `
    <div class="lesson-item${isHidden ? ' lesson-item-off' : ''}"
         data-lesson-course="${courseKey}"
         data-lesson-unit="${l.unitId}"
         data-lesson-id="${l.id}">
      ${S.teacherMode ? `
      <div class="lesson-move-btns">
        <button class="lesson-move-btn" data-move-lesson="${l.id}" data-move-course="${courseKey}" data-move-dir="top" ${idx === 0 ? 'disabled' : ''} title="Move to top">⏫</button>
        <button class="lesson-move-btn" data-move-lesson="${l.id}" data-move-course="${courseKey}" data-move-dir="up" ${idx === 0 ? 'disabled' : ''} title="Move up">▲</button>
        <button class="lesson-move-btn" data-move-lesson="${l.id}" data-move-course="${courseKey}" data-move-dir="down" ${idx === unitLessons.length - 1 ? 'disabled' : ''} title="Move down">▼</button>
        <button class="lesson-move-btn" data-move-lesson="${l.id}" data-move-course="${courseKey}" data-move-dir="bottom" ${idx === unitLessons.length - 1 ? 'disabled' : ''} title="Move to bottom">⏬</button>
      </div>` : ''}
      <div class="lesson-item-icon${S.teacherMode ? ' lesson-item-icon-edit' : ''}" ${S.teacherMode ? `data-edit-icon="${l.id}" title="Click to change icon"` : ''}>${icon}</div>
      <div class="lesson-item-body">
        <div class="lesson-item-num">${esc(l.unitTitle)}</div>
        <div class="lesson-item-title${S.teacherMode ? ' lesson-item-title-edit' : ''}" ${S.teacherMode ? `data-edit-title="${l.id}" title="Click to edit title"` : ''}>${esc(l.title)}${S.teacherMode ? ' ✏️' : ''}</div>
        <div class="lesson-item-summary">${esc(l.summary || '')}</div>
      </div>
      <div class="lesson-item-right">
        ${isHidden ? `<span class="lesson-hidden-chip">Hidden</span>` : ''}
        <span class="lesson-duration-chip">${esc(l.duration || '')}</span>
        ${S.teacherMode
          ? (l.isCustom
              ? `<button class="lesson-delete-btn" data-delete-lesson="${l.id}" data-delete-type="canva" title="Delete lesson">✕</button>`
              : `<button class="lesson-toggle${isHidden ? '' : ' on'}" data-toggle-lesson="${l.id}"
                   title="${isHidden ? 'Hidden from students — click to show' : 'Visible to students — click to hide'}">${isHidden ? '' : '✓'}</button>`)
          : `<span class="lesson-item-arrow">→</span>`}
      </div>
    </div>`;
}

function renderLessonCourse() {
  const course = LESSONS[S.lessonCourse];
  if (!course) return renderLessonsHub();
  const courseKey = S.lessonCourse;

  const fullList = getCourseLessonList(courseKey);
  const units = getCourseUnits(courseKey);
  const visibleUnits = units.filter(u => S.teacherMode || !S.hiddenUnits.has(unitKey(courseKey, u.id)));

  const unitBlocks = visibleUnits.map(u => {
    const uKey = unitKey(courseKey, u.id);
    const unitHidden = S.hiddenUnits.has(uKey);
    const unitLessons = fullList
      .filter(l => l.unitId === u.id)
      .filter(l => S.teacherMode || !S.hiddenLessons.has(l.id));
    const items = unitLessons.map((l, idx) => renderLessonItemRow(l, idx, unitLessons, courseKey, course)).join('');

    return `
      <div class="lesson-unit-block${unitHidden ? ' lesson-unit-hidden' : ''}">
        <div class="lesson-unit-header">
          <div class="lesson-unit-title${S.teacherMode ? ' lesson-unit-title-edit' : ''}" ${S.teacherMode ? `data-edit-unit="${u.id}" title="Click to rename unit"` : ''}>${esc(u.title)}${S.teacherMode ? ' ✏️' : ''}</div>
          ${S.teacherMode ? `
            <div class="lesson-unit-actions">
              ${unitHidden ? `<span class="lesson-hidden-chip">Hidden</span>` : ''}
              <button class="lesson-toggle${unitHidden ? '' : ' on'}" data-toggle-unit="${u.id}"
                title="${unitHidden ? 'Hidden from students — click to show' : 'Visible to students — click to hide'}">${unitHidden ? '' : '✓'}</button>
              ${u.isCustom ? `<button class="lesson-delete-btn" data-delete-unit="${u.id}" title="${unitLessons.length ? 'Move or delete its lessons first' : 'Delete unit'}" ${unitLessons.length ? 'disabled' : ''}>✕</button>` : ''}
            </div>` : ''}
        </div>
        <div class="lesson-items-list">
          ${items || (S.teacherMode ? `<p class="le-hint" style="padding:6px 4px">No lessons in this unit yet.</p>` : '')}
        </div>
      </div>`;
  }).join('');

  const unitOptions = units.map(u => `<option value="${u.id}">${esc(u.title)}</option>`).join('');

  return `
    ${navBar('lessons')}
    <div class="class-page">
      <button class="back-btn" data-lesson-back="hub">← All Lessons</button>
      <div class="lesson-course-header" style="--clr:${course.color}">
        <div class="lesson-course-header-icon">${course.icon}</div>
        <div>
          <h1 style="color:${course.color}">${course.name}</h1>
          <p>${units.length} unit${units.length !== 1 ? 's' : ''} · ${fullList.length} lesson${fullList.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div class="lesson-units-list">
        ${unitBlocks}
        ${S.teacherMode ? `<button class="btn-secondary" id="add-unit-btn" style="width:100%;margin-top:4px;font-size:0.82rem">+ Add Unit</button>` : ''}
        ${S.teacherMode ? (S.showCanvaForm ? `
          <div style="margin-top:12px;padding:14px;background:var(--surface2);border-radius:10px;display:flex;flex-direction:column;gap:10px">
            <input id="canva-title" class="form-input" placeholder="Lesson title" style="font-size:0.9rem">
            <input id="canva-duration" class="form-input" placeholder="Duration (e.g. 2 classes)" style="font-size:0.9rem">
            <input id="canva-url" class="form-input" placeholder="Canva share link (canva.com/design/...)" style="font-size:0.9rem">
            <select id="canva-unit" class="form-input" style="font-size:0.9rem">${unitOptions}</select>
            <div style="display:flex;gap:8px">
              <button class="btn-primary" id="canva-save-btn" style="font-size:0.85rem">Add Lesson</button>
              <button class="btn-secondary" id="canva-cancel-btn" style="font-size:0.85rem">Cancel</button>
            </div>
          </div>` : `
          <button class="btn-secondary" id="canva-add-btn" style="margin-top:10px;font-size:0.82rem;width:100%">+ Add Canva Lesson</button>`)
        : ''}
      </div>
    </div>`;
}

// First image found in a lesson's sections — used as the title-slide backdrop
function lessonHeroImg(lesson) {
  for (const s of (lesson.sections || [])) {
    if (s.sideImg) return s.sideImg;
    if (s.images && s.images.length) return s.images[0].src;
  }
  return '';
}

function renderLessonSection(sec, courseColor) {
  let inner = '';

  switch (sec.type) {

    case 'intro':
      inner = `<p class="ls-intro-statement">${sec.content}</p>`;
      break;

    case 'callout': {
      const cls  = sec.warning ? 'lesson-callout-warn' : 'lesson-callout-tip';
      const body = sec.content
        ? `<p class="lesson-callout-text">${sec.content}</p>`
        : `<ul class="lesson-callout-list">${(sec.items || []).map(i => `<li>${i}</li>`).join('')}</ul>`;
      inner = `<div class="lesson-callout ${cls}">${body}</div>`;
      break;
    }

    case 'keyterms':
      inner = `
        <div class="lesson-keyterms">
          ${(sec.terms || []).map(t => `
            <div class="keyterm-row">
              <div class="keyterm-key">${t.term}</div>
              <div class="keyterm-val">${t.def}</div>
            </div>`).join('')}
        </div>`;
      break;

    case 'list':
      inner = `
        <ul class="lesson-list">
          ${(sec.items || []).map(i => `<li>${i}</li>`).join('')}
        </ul>`;
      break;

    case 'text':
      inner = `<p class="lesson-text-para">${sec.content}</p>`;
      break;

    case 'gallery':
      inner = `
        <div class="lesson-gallery">
          ${(sec.images || []).map(img => `
            <figure class="lesson-gallery-item">
              <img src="${img.src}" alt="${img.alt || ''}" loading="lazy">
              ${img.alt ? `<figcaption class="lesson-gallery-cap">${img.alt}</figcaption>` : ''}
            </figure>`).join('')}
        </div>`;
      break;

    case 'video': {
      const vid = sec.youtube.replace(/.*(?:youtu\.be\/|v=)([^&?]+).*/, '$1');
      inner = `
        <div class="lesson-video-wrap">
          <iframe src="https://www.youtube.com/embed/${vid}" allowfullscreen title="${sec.label || 'Video'}"></iframe>
        </div>
        ${sec.note ? `<p class="lesson-video-note">${sec.note}</p>` : ''}`;
      break;
    }

    case 'audio':
      inner = `
        ${sec.context ? `<p class="lesson-audio-context">${sec.context}</p>` : ''}
        <div class="lesson-audio-wrap">
          <audio controls preload="metadata">
            <source src="${sec.src}" type="audio/mpeg">
          </audio>
        </div>
        ${sec.note ? `<p class="lesson-video-note">${sec.note}</p>` : ''}
        ${sec.tip ? `<div class="lesson-audio-tip">${sec.tip}</div>` : ''}`;
      break;

    default: return '';
  }

  if (!inner) return '';

  if (sec.sideImg) {
    return `
      <div class="ls-panel ls-panel-split">
        <div class="ls-panel-content">${inner}</div>
        <figure class="ls-side-img">
          <img src="${sec.sideImg}" alt="${sec.sideImgAlt || ''}" loading="lazy">
          ${sec.sideImgCap ? `<figcaption class="ls-side-img-cap">${sec.sideImgCap}</figcaption>` : ''}
        </figure>
      </div>`;
  }

  return inner;
}

function renderLessonSlide(slide, lesson, lessonNum, icon, course, next, idx, total) {
  if (slide.type === '_title') {
    const hero = lessonHeroImg(lesson);
    return `
      <div class="ls-slide ls-title-slide">
        ${hero ? `<div class="ls-title-bg" style="background-image:url('${hero}')"></div>` : ''}
        <div class="ls-title-content">
          <div class="ls-title-icon">${icon}</div>
          <div class="ls-title-eyebrow">${esc(course.name)} &nbsp;·&nbsp; Lesson ${lessonNum}${lesson.duration ? ` &nbsp;·&nbsp; ${esc(lesson.duration)}` : ''}</div>
          <h1 class="ls-title-h1">${lesson.title}</h1>
          <div class="ls-title-rule"></div>
          <p class="ls-title-summary">${lesson.summary}</p>
          <div class="ls-start-hint">Press → to begin</div>
        </div>
      </div>`;
  }

  if (slide.type === '_end') {
    if (next) {
      return `
        <div class="ls-slide ls-end-slide">
          <div class="ls-end-icon">✅</div>
          <h2 class="ls-end-h2">Lesson Complete!</h2>
          <p class="ls-end-sub">Up next in ${course.name}:</p>
          <div class="lesson-next-card ls-end-next-card"
               data-lesson-course="${S.lessonCourse}"
               data-lesson-unit="${next.unitId}"
               data-lesson-id="${next.id}">
            <span class="lesson-next-icon">${getLessonIcon(next, course.icon)}</span>
            <div>
              <div class="lesson-next-title">${next.title}</div>
              <div class="lesson-next-meta">${next.duration}</div>
            </div>
            <span class="lesson-next-arrow">→</span>
          </div>
        </div>`;
    }
    return `
      <div class="ls-slide ls-end-slide">
        <div class="ls-end-icon">🎉</div>
        <h2 class="ls-end-h2">Unit Complete!</h2>
        <p class="ls-end-sub">You've finished all lessons in this unit.</p>
        <button class="btn-secondary ls-end-back" data-lesson-back="course">← Back to ${course.name}</button>
      </div>`;
  }

  const secTotal = total - 2;
  const heading  = slide.type === 'intro' ? '' : (slide.title || slide.label || '');

  return `
    <div class="ls-slide ls-section-slide${slide.sideImg ? ' ls-has-img' : ''}">
      <div class="ls-section-inner">
        <header class="ls-sec-head">
          <div class="ls-sec-kicker">
            <span class="ls-sec-count">${String(idx).padStart(2, '0')} / ${String(secTotal).padStart(2, '0')}</span>
            <span class="ls-sec-sep"></span>
            <span class="ls-sec-lesson">${lesson.title}</span>
          </div>
          ${heading ? `<h2 class="ls-sec-h2${slide.warning ? ' ls-sec-h2-warn' : ''}">${heading}</h2>` : ''}
        </header>
        ${renderLessonSection(slide, course.color)}
      </div>
    </div>`;
}

// ── Lesson text editor (teacher mode) ────────────────────────
function renderLessonSlideEditor(lesson, slides, idx) {
  const secIdx = idx - 1;               // slide 0 is the title card
  const sec = idx === 0 ? null : slides[idx];
  const hasOverride = idx === 0
    ? ['title','summary','duration','keywords'].some(k => S.lessonEdits[lesson.id]?.[k] !== undefined)
    : !!S.lessonEdits[lesson.id]?.sections?.[secIdx];

  let fields = '';
  if (idx === 0) {
    fields = `
      <label class="le-label">Lesson Title</label>
      <input id="le-title" class="form-input" value="${esc(lesson.title)}">
      <label class="le-label">Summary</label>
      <textarea id="le-summary" class="form-input le-ta" rows="3">${esc(lesson.summary || '')}</textarea>
      <label class="le-label">Duration</label>
      <input id="le-duration" class="form-input" value="${esc(lesson.duration || '')}" placeholder="e.g. 1 class">
      <label class="le-label">Keywords <span class="le-hint">(comma-separated, used for lesson search)</span></label>
      <input id="le-keywords" class="form-input" value="${esc((lesson.keywords || []).join(', '))}" placeholder="e.g. reverb, effects rack, adobe audition">`;
  } else {
    switch (sec.type) {
      case 'intro':
        fields = `
          <label class="le-label">Intro Text</label>
          <textarea id="le-content" class="form-input le-ta" rows="7">${esc(sec.content || '')}</textarea>`;
        break;
      case 'text':
        fields = `
          <label class="le-label">Heading</label>
          <input id="le-title" class="form-input" value="${esc(sec.title || '')}">
          <label class="le-label">Text <span class="le-hint">(basic HTML like &lt;strong&gt; is allowed)</span></label>
          <textarea id="le-content" class="form-input le-ta" rows="7">${esc(sec.content || '')}</textarea>`;
        break;
      case 'callout':
        fields = `
          <label class="le-label">Label</label>
          <input id="le-label-input" class="form-input" value="${esc(sec.label || '')}">
          ${sec.content !== undefined && !sec.items
            ? `<label class="le-label">Text</label>
               <textarea id="le-content" class="form-input le-ta" rows="6">${esc(sec.content || '')}</textarea>`
            : `<label class="le-label">Items <span class="le-hint">(one per line; basic HTML allowed)</span></label>
               <textarea id="le-items" class="form-input le-ta" rows="7">${esc((sec.items || []).join('\n'))}</textarea>`}`;
        break;
      case 'list':
        fields = `
          <label class="le-label">Heading</label>
          <input id="le-title" class="form-input" value="${esc(sec.title || '')}">
          <label class="le-label">Items <span class="le-hint">(one per line; basic HTML allowed)</span></label>
          <textarea id="le-items" class="form-input le-ta" rows="8">${esc((sec.items || []).join('\n'))}</textarea>`;
        break;
      case 'keyterms':
        fields = `
          <label class="le-label">Heading</label>
          <input id="le-title" class="form-input" value="${esc(sec.title || '')}">
          <label class="le-label">Terms <span class="le-hint">(one per line, format: Term | Definition)</span></label>
          <textarea id="le-terms" class="form-input le-ta" rows="8">${esc((sec.terms || []).map(t => `${t.term} | ${t.def}`).join('\n'))}</textarea>`;
        break;
      case 'video':
        fields = `
          <label class="le-label">Label</label>
          <input id="le-label-input" class="form-input" value="${esc(sec.label || '')}">
          <label class="le-label">YouTube URL</label>
          <input id="le-youtube" class="form-input" value="${esc(sec.youtube || '')}">
          <label class="le-label">Note (under the video)</label>
          <textarea id="le-note" class="form-input le-ta" rows="3">${esc(sec.note || '')}</textarea>`;
        break;
      case 'audio':
        fields = `
          <label class="le-label">Context (before the player)</label>
          <textarea id="le-context" class="form-input le-ta" rows="3">${esc(sec.context || '')}</textarea>
          <label class="le-label">Note</label>
          <textarea id="le-note" class="form-input le-ta" rows="3">${esc(sec.note || '')}</textarea>
          <label class="le-label">Tip</label>
          <textarea id="le-tip" class="form-input le-ta" rows="3">${esc(sec.tip || '')}</textarea>`;
        break;
      default:
        fields = `<p class="le-hint" style="font-size:0.9rem">This slide type (${esc(sec.type)}) can't be edited here — its images/files live in data.js. Ask Claude to change it.</p>`;
    }
  }

  return `
    <div class="ls-slide le-editor">
      <div class="le-editor-inner">
        <div class="le-editor-head">✏️ Editing ${idx === 0 ? 'Title Slide' : `Slide ${idx} — ${esc(sec.type)}`}
          ${hasOverride ? '<span class="le-edited-chip">edited</span>' : ''}
        </div>
        ${fields}
        <div class="le-editor-btns">
          <button class="btn-primary" id="ls-edit-save">Save</button>
          <button class="btn-secondary" id="ls-edit-cancel">Cancel</button>
          ${hasOverride ? `<button class="btn-secondary le-reset" id="ls-edit-reset">↩ Reset to original</button>` : ''}
        </div>
        <p class="le-hint" style="margin-top:8px">Edits save to the cloud and show for everyone. Reset restores the built-in text.</p>
      </div>
    </div>`;
}

async function saveLessonSlideEdit() {
  const id = S.lessonId;
  const secIdx = (S.lessonSlide || 0) - 1;
  const val = elId => document.getElementById(elId)?.value;

  let patch = {};
  if (secIdx < 0) {
    patch = {
      title: val('le-title') || '', summary: val('le-summary') || '', duration: val('le-duration') || '',
      keywords: (val('le-keywords') || '').split(',').map(s => s.trim()).filter(Boolean),
    };
  } else {
    if (val('le-title') !== undefined && val('le-title') !== null) patch.title = val('le-title');
    if (document.getElementById('le-label-input')) patch.label = val('le-label-input');
    if (document.getElementById('le-content')) patch.content = val('le-content');
    if (document.getElementById('le-items')) patch.items = val('le-items').split('\n').map(s => s.trim()).filter(Boolean);
    if (document.getElementById('le-terms')) patch.terms = val('le-terms').split('\n').map(s => s.trim()).filter(Boolean).map(line => {
      const p = line.indexOf('|');
      return p === -1 ? { term: line, def: '' } : { term: line.slice(0, p).trim(), def: line.slice(p + 1).trim() };
    });
    if (document.getElementById('le-youtube')) patch.youtube = val('le-youtube');
    if (document.getElementById('le-note')) patch.note = val('le-note');
    if (document.getElementById('le-context')) patch.context = val('le-context');
    if (document.getElementById('le-tip')) patch.tip = val('le-tip');
    if (!Object.keys(patch).length) { S.lessonEditOpen = false; render(); return; }
  }

  const cur = S.lessonEdits[id] || {};
  if (secIdx < 0) Object.assign(cur, patch);
  else { cur.sections = cur.sections || {}; cur.sections[secIdx] = { ...(cur.sections[secIdx] || {}), ...patch }; }
  S.lessonEdits[id] = cur;
  S.lessonEditOpen = false;
  render();

  const db = getDB();
  if (db) {
    try {
      await db.collection('hm_lesson_edits').doc(id).set(cur);
      trackUsage('writes');
    } catch(e) { console.error('lesson edit save failed', e); }
  }
}

async function resetLessonSlideEdit() {
  const id = S.lessonId;
  const secIdx = (S.lessonSlide || 0) - 1;
  const cur = S.lessonEdits[id];
  if (!cur) return;
  if (secIdx < 0) { delete cur.title; delete cur.summary; delete cur.duration; delete cur.keywords; }
  else if (cur.sections) { delete cur.sections[secIdx]; if (!Object.keys(cur.sections).length) delete cur.sections; }

  const empty = !Object.keys(cur).length;
  if (empty) delete S.lessonEdits[id];
  S.lessonEditOpen = false;
  render();

  const db = getDB();
  if (db) {
    try {
      if (empty) await db.collection('hm_lesson_edits').doc(id).delete();
      else await db.collection('hm_lesson_edits').doc(id).set(cur);
      trackUsage('writes');
    } catch(e) { console.error('lesson edit reset failed', e); }
  }
}

function renderLessonPage() {
  const course = LESSONS[S.lessonCourse];
  if (!course) return renderLessonsHub();

  // Support custom Canva-only lessons not in data.js
  const canvaData = S.canvaLessons[S.lessonId] || {};
  let unit    = course.units.find(u => u.id === S.lessonUnit);
  let lesson  = unit?.lessons.find(l => l.id === S.lessonId);

  if (!lesson && canvaData.isCustom) {
    lesson = { id: S.lessonId, title: canvaData.title || 'Untitled', duration: canvaData.duration || '', summary: canvaData.summary || '', sections: [] };
    unit   = unit || course.units[0] || { id: 'u1', title: '', lessons: [] };
  }
  if (!lesson) return renderLessonCourse();
  lesson = mergedLesson(lesson);

  const canvaUrl = canvaData.url;
  const allLessons = getCourseLessonList(S.lessonCourse);
  const lessonIdx = allLessons.findIndex(l => l.id === S.lessonId);
  const lessonNum = lessonIdx + 1;

  // ── Canva embed ──────────────────────────────────────────────
  if (canvaUrl) {
    return `
      <div class="ls-show" style="--clr:${course.color}">
        <iframe src="${esc(canvaEmbedUrl(canvaUrl))}" class="ls-canva-frame" allowfullscreen allow="fullscreen"></iframe>
        <div class="ls-controls">
          <div class="ls-ctrl-left">
            <button class="ls-back-btn" data-lesson-back="course">← ${esc(course.name)}</button>
          </div>
          <div class="ls-ctrl-center">
            <div class="ls-lesson-label">🎨 ${esc(lesson.title)}</div>
          </div>
          <div class="ls-ctrl-right">
            <a href="${esc(canvaUrl)}" target="_blank" rel="noopener" class="btn-secondary" style="font-size:0.75rem;padding:4px 10px;text-decoration:none" title="If the lesson didn't load above, some Canva share links block embedding — open it directly instead.">Open in Canva ↗</a>
            ${S.teacherMode ? `<button id="ls-connect-canva" class="btn-secondary" style="font-size:0.75rem;padding:4px 10px">✏️ Change Canva URL</button>` : ''}
          </div>
        </div>
      </div>`;
  }

  // ── Original slideshow ───────────────────────────────────────
  const icon   = getLessonIcon(lesson, course.icon);
  const next   = allLessons[lessonIdx + 1] || null;
  const slides = [{ type: '_title' }, ...(lesson.sections || []), { type: '_end' }];
  const total  = slides.length;
  const idx    = Math.max(0, Math.min(S.lessonSlide || 0, total - 1));
  const pct    = Math.round(((idx + 1) / total) * 100);

  const editing = S.teacherMode && S.lessonEditOpen && slides[idx].type !== '_end';

  return `
    <div class="ls-show" style="--clr:${course.color}">
      <div class="ls-slide-area">
        ${editing
          ? renderLessonSlideEditor(lesson, slides, idx)
          : renderLessonSlide(slides[idx], lesson, lessonNum, icon, course, next, idx, total)}
      </div>
      <div class="ls-controls">
        <div class="ls-ctrl-left">
          <button class="ls-back-btn" data-lesson-back="course">← ${esc(course.name)}</button>
        </div>
        <div class="ls-ctrl-center">
          <div class="ls-nav">
            <button class="ls-nav-btn" data-lesson-slide="prev" ${idx === 0 ? 'disabled' : ''}>&#8592;</button>
            <div class="ls-counter">${idx + 1} <span class="ls-counter-of">/ ${total}</span></div>
            <button class="ls-nav-btn" data-lesson-slide="next" ${idx === total - 1 ? 'disabled' : ''}>&#8594;</button>
          </div>
          <div class="ls-progress-wrap"><div class="ls-progress-fill" style="width:${pct}%"></div></div>
          <div class="ls-lesson-label">${icon} ${esc(lesson.title)}</div>
        </div>
        <div class="ls-ctrl-right">
          ${S.teacherMode && slides[idx].type !== '_end' ? `<button id="ls-edit-slide" class="btn-secondary" style="font-size:0.75rem;padding:4px 10px">${S.lessonEditOpen ? '✕ Close Editor' : '✏️ Edit Slide'}</button>` : ''}
          ${S.teacherMode ? `<button id="ls-connect-canva" class="btn-secondary" style="font-size:0.75rem;padding:4px 10px">🎨 Connect Canva</button>` : ''}
          <span class="ls-lesson-num">L${lessonNum}</span>
        </div>
      </div>
    </div>`;
}

// ── Firebase Load ─────────────────────────────────────────────
async function loadFromFirebase() {
  const db = getDB();
  if (!db) return;
  await cachedLoad('core', async () => {
    const [schedSnap, bcastSnap, iasbSnap, availSnap] = await Promise.all([
      db.collection('hm_radio').doc('station_schedule').get(),
      db.collection('hm_broadcasts').get(),
      db.collection('hm_iasb_entries').get(),
      db.collection('hm_availability').get()
    ]);
    trackUsage('reads', 1 + bcastSnap.size + iasbSnap.size + availSnap.size);
    let stationSchedule = null;
    if (schedSnap.exists) {
      const data = schedSnap.data() || {};
      const blank = () => DAYS.map(() => ({ show: '', djs: [] }));
      stationSchedule = {
        point: data.point || blank(),
        two:   data.two   || blank(),
      };
    }
    const broadcasts = [];
    bcastSnap.forEach(doc => broadcasts.push({ id: doc.id, ...doc.data() }));
    // One-time migration: fix old generic 'basketball' type
    const toMigrate = broadcasts.filter(b => b.type === 'basketball');
    if (toMigrate.length) {
      trackUsage('writes', toMigrate.length);
      await Promise.all(toMigrate.map(b => {
        const newType = b.id.startsWith('gb') ? 'basketball_girls' : 'basketball_boys';
        b.type = newType;
        return db.collection('hm_broadcasts').doc(b.id).update({ type: newType }).catch(() => {});
      }));
    }
    const ALL_SEED_GAMES = [...BASKETBALL_HOME_GAMES, ...FOOTBALL_HOME_GAMES, ...GIRLS_BASKETBALL_HOME_GAMES, ...SPECIAL_EVENTS]
      .filter(g => g.broadcastWorthy !== false);

    // Patch existing records missing gameTime (one-time migration)
    const needsGameTime = broadcasts.filter(b => {
      const seed = ALL_SEED_GAMES.find(g => g.id === b.id);
      return seed && seed.gameTime !== undefined && b.gameTime === undefined;
    });
    if (needsGameTime.length) {
      trackUsage('writes', needsGameTime.length);
      await Promise.all(needsGameTime.map(b => {
        const seed = ALL_SEED_GAMES.find(g => g.id === b.id);
        b.gameTime = seed.gameTime;
        b.notes    = seed.notes;
        return db.collection('hm_broadcasts').doc(b.id).update({ gameTime: seed.gameTime, notes: seed.notes }).catch(() => {});
      }));
    }

    let finalBroadcasts;
    if (broadcasts.length === 0 && ALL_SEED_GAMES.length) {
      trackUsage('writes', ALL_SEED_GAMES.length);
      await Promise.all(ALL_SEED_GAMES.map(g =>
        db.collection('hm_broadcasts').doc(g.id).set(g).catch(() => {})
      ));
      finalBroadcasts = ALL_SEED_GAMES.map(g => ({ ...g }));
    } else {
      const existingIds = new Set(broadcasts.map(b => b.id));
      const missing = ALL_SEED_GAMES.filter(g => !existingIds.has(g.id));
      if (missing.length) {
        trackUsage('writes', missing.length);
        await Promise.all(missing.map(g =>
          db.collection('hm_broadcasts').doc(g.id).set(g).catch(() => {})
        ));
        finalBroadcasts = [...broadcasts, ...missing];
      } else {
        finalBroadcasts = broadcasts;
      }
    }
    const iasbEntries = [];
    iasbSnap.forEach(doc => iasbEntries.push({ id: doc.id, ...doc.data() }));
    const availabilities = [];
    availSnap.forEach(doc => availabilities.push({ id: doc.id, ...doc.data() }));
    return { stationSchedule, broadcasts: finalBroadcasts, iasbEntries, availabilities };
  }, data => {
    if (data.stationSchedule) S.stationSchedule = data.stationSchedule;
    S.broadcasts     = data.broadcasts     || [];
    S.iasbEntries    = data.iasbEntries    || [];
    S.availabilities = data.availabilities || [];
  });
}

// Every event on the Homestead Live Event Calendar is teacher-curated and broadcast-worthy by definition,
// so unlike the Yearbook sync this takes everything — no sport-type or home/away filtering.
async function syncBroadcastsFromCalendar() {
  const db = getDB();
  if (!db) return 0;
  const existingIds  = new Set((S.broadcasts || []).map(b => b.id));
  const existingKeys = new Set((S.broadcasts || []).map(b => b.type + '|' + b.date));
  const candidates = (S.calendarBroadcastEvents || []).filter(e =>
    !existingIds.has(e.id) &&
    !existingKeys.has(e.type + '|' + e.date)
  );
  if (!candidates.length) return 0;
  const newBroadcasts = candidates.map(e => ({
    id: e.id, title: e.title, date: e.date, type: e.type,
    gameTime: e.time || '', roles: {}, checks: {},
    notes: [e.jvTime ? `JV ${e.jvTime} · Broadcast ${e.time}` : e.time, e.location].filter(Boolean).join(' · ')
  }));
  trackUsage('writes', newBroadcasts.length);
  await Promise.all(newBroadcasts.map(g => db.collection('hm_broadcasts').doc(g.id).set(g).catch(() => {})));
  S.broadcasts = [...(S.broadcasts || []), ...newBroadcasts];
  return newBroadcasts.length;
}

function isCanvaLink(url) {
  return /canva\.(com|link)/i.test(url);
}

function isCanvaShortLink(url) {
  return /canva\.link/i.test(url);
}

function canvaEmbedUrl(url) {
  if (!url) return '';
  return url.split('?')[0] + '?embed';
}

async function loadCanvaLessons() {
  const db = getDB();
  if (!db) return;
  await cachedLoad('canva', async () => {
    const snap = await db.collection('hm_canva_lessons').get();
    trackUsage('reads', snap.size || 1);
    const map = {};
    snap.forEach(doc => { map[doc.id] = doc.data(); });
    return map;
  }, map => { S.canvaLessons = map; });
}

// ── EQUIPMENT CHECK-IN / CHECK-OUT ──────────────────────────────
function loadEquipment() {
  const db = getDB();
  if (!db) return;
  if (S.equipmentUnsub) { S.equipmentUnsub(); S.equipmentUnsub = null; }
  S.equipmentUnsub = db.collection('hm_equipment').onSnapshot(snap => {
    const map = {};
    snap.forEach(d => { map[d.id] = { id: d.id, ...d.data() }; });
    S.equipment = map;
    const list = document.getElementById('equipment-checked-out-list');
    if (list) list.innerHTML = renderEquipmentCheckedOutList();
    const adminList = document.getElementById('equipment-admin-list');
    if (adminList) {
      adminList.innerHTML = renderEquipmentAdminList();
      adminList.querySelectorAll('.equip-delete-btn').forEach(btn =>
        btn.addEventListener('click', () => deleteEquipmentItem(btn.dataset.equipId)));
    }
  });
}

function renderEquipmentAdminList() {
  const items = Object.values(S.equipment || {})
    .sort((a, b) => (a.status === b.status ? 0 : a.status === 'checked_out' ? -1 : 1) || (a.name || '').localeCompare(b.name || ''));
  if (!items.length) return `<p class="dim" style="font-size:0.875rem">No items scanned yet.</p>`;
  return items.map(i => `
    <div class="db-entry-row">
      <div class="db-entry-main">
        <div class="db-entry-student">${esc(i.name)}
          ${i.status === 'checked_out'
            ? `<span style="background:var(--surface2);color:var(--dim);font-size:0.72rem;padding:2px 7px;border-radius:10px;margin-left:6px">out — ${esc(i.currentHolder || '?')}</span>`
            : `<span style="background:var(--surface2);color:var(--success);font-size:0.72rem;padding:2px 7px;border-radius:10px;margin-left:6px">available</span>`}
        </div>
        <div class="db-entry-notes">Barcode: <code>${esc(i.id)}</code></div>
      </div>
      <div class="db-entry-meta">
        <button class="btn-danger db-btn equip-delete-btn" data-equip-id="${esc(i.id)}" style="font-size:0.75rem">Delete</button>
      </div>
    </div>`).join('');
}

async function deleteEquipmentItem(id) {
  const item = S.equipment[id];
  if (!confirm(`Remove "${item ? item.name : id}" (barcode ${id}) from the equipment list?\n\nThis won't touch past check-in/check-out history — just this entry, so a mis-scanned or duplicate barcode can be cleared out.`)) return;
  const db = getDB();
  if (!db) return;
  try {
    await db.collection('hm_equipment').doc(id).delete();
    trackUsage('writes', 1);
    showToast('Removed.');
  } catch (e) {
    showToast('Could not remove that item.');
  }
}

function loadEquipmentState() {
  const db = getDB();
  if (!db) return;
  db.collection('hm_equipment_state').doc('current').onSnapshot(doc => {
    const wasLive = S.equipmentLive;
    S.equipmentLive = !!(doc.exists && doc.data().live);
    if (S.equipmentLive !== wasLive) render();
  });
}

async function goLiveEquipment() {
  if (!confirm("Make equipment check-in/out visible to everyone on the class pages now?")) return;
  const db = getDB();
  if (!db) { showToast('Offline — try again when connected.'); return; }
  await db.collection('hm_equipment_state').doc('current').set({ live: true, wentLiveAt: new Date().toISOString() }, { merge: true });
  trackUsage('writes', 1);
  showToast('📦 Equipment check-in/out is now live!');
}

function renderEquipmentCheckedOutList() {
  const items = Object.values(S.equipment || {})
    .filter(i => i.status === 'checked_out')
    .sort((a, b) => (b.checkedOutAt || '').localeCompare(a.checkedOutAt || ''));
  if (!items.length) return `<p class="dim" style="font-size:0.8rem;margin-top:10px">Nothing currently checked out.</p>`;
  return `
    <p style="font-size:0.78rem;font-weight:600;margin:12px 0 6px;color:var(--dim)">Currently Checked Out (${items.length})</p>
    ${items.map(i => `
      <div style="display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:0.82rem">
        <span>${esc(i.name)}</span>
        <span class="dim">${esc(i.currentHolder || '—')}</span>
      </div>`).join('')}`;
}

function renderEquipmentWidget() {
  return `
    <div class="form-group" style="margin-bottom:8px">
      <label>Your Name</label>
      <input id="equip-name" type="text" placeholder="First and last name" value="${esc(localStorage.getItem('hm_student_name') || '')}">
    </div>
    <div class="form-group" style="margin-bottom:4px">
      <label>Scan Barcode</label>
      <input id="equip-scan" type="text" placeholder="Click here, then scan" autocomplete="off">
    </div>
    <div id="equipment-checked-out-list">${renderEquipmentCheckedOutList()}</div>`;
}

function renderEquipmentCard(forceShow) {
  if (!S.equipmentLive && !forceShow) return '';
  return `
    <section class="card" id="equipment-card">
      <h3>📦 Equipment Check-In / Check-Out</h3>
      <p class="cal-section-sub" style="margin-top:0">Scan an item's barcode to check it out — scan the same barcode again to check it back in.</p>
      ${renderEquipmentWidget()}
    </section>`;
}

async function handleEquipmentScan(rawBarcode) {
  const barcode = (rawBarcode || '').trim();
  if (!barcode) return;
  const scanInput = document.getElementById('equip-scan');
  const name = shortenName((val('equip-name') || localStorage.getItem('hm_student_name') || '').trim());
  if (!name) {
    showToast('Enter your name first.');
    document.getElementById('equip-name')?.focus();
    return;
  }
  localStorage.setItem('hm_student_name', name);

  const db = getDB();
  if (!db) { showToast('Offline — can\'t reach the equipment list.'); return; }

  const existing = S.equipment[barcode];
  const now = new Date().toISOString();
  try {
    if (!existing) {
      const itemName = (prompt(`New item scanned (${barcode}). What is it?`) || '').trim();
      if (!itemName) return;
      await db.collection('hm_equipment').doc(barcode).set({
        name: itemName, status: 'checked_out', currentHolder: name, checkedOutAt: now,
      });
      await db.collection('hm_checkout_log').add({ barcode, itemName, studentName: name, action: 'out', timestamp: now });
      trackUsage('writes', 2);
      showToast(`✅ Checked out: ${itemName} → ${name}`);
    } else if (existing.status === 'checked_out') {
      await db.collection('hm_equipment').doc(barcode).set({ status: 'available', currentHolder: '', checkedOutAt: null }, { merge: true });
      await db.collection('hm_checkout_log').add({ barcode, itemName: existing.name, studentName: name, action: 'in', timestamp: now });
      trackUsage('writes', 2);
      showToast(`📥 Checked in: ${existing.name} (was with ${existing.currentHolder || 'someone'})`);
    } else {
      await db.collection('hm_equipment').doc(barcode).set({ status: 'checked_out', currentHolder: name, checkedOutAt: now }, { merge: true });
      await db.collection('hm_checkout_log').add({ barcode, itemName: existing.name, studentName: name, action: 'out', timestamp: now });
      trackUsage('writes', 2);
      showToast(`✅ Checked out: ${existing.name} → ${name}`);
    }
  } catch (e) {
    showToast('Something went wrong saving that scan.');
  }
  if (scanInput) { scanInput.value = ''; scanInput.focus(); }
}

async function loadLessonOrder() {
  const db = getDB();
  if (!db) return;
  await cachedLoad('lesson_order', async () => {
    const snap = await db.collection('hm_lesson_order').get();
    trackUsage('reads', snap.size || 1);
    const map = {};
    snap.forEach(doc => { map[doc.id] = doc.data().order || []; });
    return map;
  }, map => { S.lessonOrder = map; });
}

// A unit's identity is scoped to its course, since built-in unit ids (u1, u2…) repeat across courses
function unitKey(courseKey, unitId) { return `${courseKey}::${unitId}`; }

// Built-in units (with any teacher title override) + any teacher-created custom units, in display order
function getCourseUnits(courseKey) {
  const course = LESSONS[courseKey];
  if (!course) return [];
  const builtIn = (course.units || []).map(u => ({
    id: u.id, title: S.unitEdits[unitKey(courseKey, u.id)]?.title || u.title, isCustom: false,
  }));
  const custom = (S.customUnits[courseKey] || []).map(u => ({
    id: u.id, title: S.unitEdits[unitKey(courseKey, u.id)]?.title || u.title, isCustom: true,
  }));
  return [...builtIn, ...custom];
}

function unitTitleFor(courseKey, unitId) {
  return getCourseUnits(courseKey).find(u => u.id === unitId)?.title || unitId;
}

// Flat, ordered list of a course's built-in + Canva lessons (custom order override applied)
function getCourseLessonList(courseKey) {
  const course = LESSONS[courseKey];
  if (!course) return [];
  const builtIn = course.units.flatMap(u =>
    u.lessons.map(l => ({ ...mergedLesson(l), unitId: u.id, unitTitle: unitTitleFor(courseKey, u.id), isCustom: false })));
  const canva = Object.entries(S.canvaLessons)
    .filter(([, d]) => d.isCustom && d.course === courseKey)
    .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
    .map(([id, d]) => ({
      id, title: d.title || 'Untitled', duration: d.duration || '', summary: d.summary || '',
      unitId: d.unit || 'u1', unitTitle: unitTitleFor(courseKey, d.unit || 'u1'), isCustom: true, sections: [],
    }));
  const all = [...builtIn, ...canva];
  const orderIds = S.lessonOrder[courseKey];
  if (orderIds && orderIds.length) {
    const pos = new Map(orderIds.map((id, i) => [id, i]));
    all.sort((a, b) => (pos.has(a.id) ? pos.get(a.id) : Infinity) - (pos.has(b.id) ? pos.get(b.id) : Infinity));
  }
  return all;
}

// Flat list of every built-in + Canva lesson across all courses, for search
function getAllLessonsFlat() {
  return Object.keys(LESSONS).flatMap(courseKey => {
    const course = LESSONS[courseKey];
    return getCourseLessonList(courseKey).map(l => ({
      ...l, courseKey, courseName: course.name, courseColor: course.color, courseIcon: course.icon,
    }));
  });
}

async function moveLessonItem(courseKey, itemId, dir) {
  const ids = getCourseLessonList(courseKey).map(l => l.id);
  const idx = ids.indexOf(itemId);
  if (idx === -1) return;
  if (dir === 'top' || dir === 'bottom') {
    if ((dir === 'top' && idx === 0) || (dir === 'bottom' && idx === ids.length - 1)) return;
    ids.splice(idx, 1);
    dir === 'top' ? ids.unshift(itemId) : ids.push(itemId);
  } else {
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= ids.length) return;
    [ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]];
  }
  S.lessonOrder[courseKey] = ids;
  render();
  const db = getDB();
  if (!db) return;
  try {
    trackUsage('writes');
    await db.collection('hm_lesson_order').doc(courseKey).set({ order: ids });
  } catch (e) { console.error('lesson order save failed', e); }
}

async function loadLessonIcons() {
  const db = getDB();
  if (!db) return;
  await cachedLoad('lesson_icons', async () => {
    const snap = await db.collection('hm_lesson_icons').get();
    trackUsage('reads', snap.size || 1);
    const map = {};
    snap.forEach(doc => { map[doc.id] = doc.data().icon || ''; });
    return map;
  }, map => { S.lessonIcons = map; });
}

function getLessonIcon(l, fallback) {
  return S.lessonIcons[l.id] || (l.isCustom ? '🎨' : (LESSON_ICONS[l.id] || fallback));
}

async function setLessonIcon(lessonId, icon) {
  const db = getDB();
  if (!db) return;
  trackUsage('writes');
  if (icon) {
    await db.collection('hm_lesson_icons').doc(lessonId).set({ icon });
    S.lessonIcons[lessonId] = icon;
  } else {
    await db.collection('hm_lesson_icons').doc(lessonId).delete();
    delete S.lessonIcons[lessonId];
  }
  render();
}

async function renameLessonTitle(lesson, title) {
  const db = getDB();
  if (!db) return;

  // Canva lessons store their own title directly rather than through the
  // built-in-lesson override system, since they have no data.js entry to override.
  if (lesson.isCustom) {
    if (!title) { showToast('Custom lessons need a title.'); return; }
    trackUsage('writes');
    await db.collection('hm_canva_lessons').doc(lesson.id).set({ title }, { merge: true });
    S.canvaLessons[lesson.id] = { ...(S.canvaLessons[lesson.id] || {}), title };
    render();
    return;
  }

  const cur = S.lessonEdits[lesson.id] || {};
  if (title) cur.title = title; else delete cur.title;
  const empty = !Object.keys(cur).length;
  if (empty) delete S.lessonEdits[lesson.id]; else S.lessonEdits[lesson.id] = cur;
  render();

  try {
    trackUsage('writes');
    if (empty) await db.collection('hm_lesson_edits').doc(lesson.id).delete();
    else await db.collection('hm_lesson_edits').doc(lesson.id).set(cur);
  } catch(e) { console.error('lesson title save failed', e); }
}

async function loadUnitEdits() {
  const db = getDB();
  if (!db) return;
  await cachedLoad('unit_edits', async () => {
    const snap = await db.collection('hm_unit_edits').get();
    trackUsage('reads', snap.size || 1);
    const map = {};
    snap.forEach(doc => { map[doc.id] = doc.data(); });
    return map;
  }, map => { S.unitEdits = map; });
}

async function loadHiddenUnits() {
  const db = getDB();
  if (!db) return;
  await cachedLoad('hidden_units', async () => {
    const snap = await db.collection('hm_hidden_units').get();
    trackUsage('reads', snap.size || 1);
    return snap.docs.map(d => d.id);
  }, ids => { S.hiddenUnits = new Set(ids); });
}

async function loadCustomUnits() {
  const db = getDB();
  if (!db) return;
  await cachedLoad('custom_units', async () => {
    const snap = await db.collection('hm_custom_units').get();
    trackUsage('reads', snap.size || 1);
    const map = {};
    snap.forEach(doc => {
      const d = doc.data();
      (map[d.course] = map[d.course] || []).push({ id: doc.id, title: d.title, order: d.order || 0 });
    });
    Object.values(map).forEach(list => list.sort((a, b) => a.order - b.order));
    return map;
  }, map => { S.customUnits = map; });
}

async function renameUnit(courseKey, unitId, title) {
  const db = getDB();
  if (!db) return;
  const key = unitKey(courseKey, unitId);
  if (title) S.unitEdits[key] = { title }; else delete S.unitEdits[key];
  render();
  try {
    trackUsage('writes');
    if (title) await db.collection('hm_unit_edits').doc(key).set({ title });
    else await db.collection('hm_unit_edits').doc(key).delete();
  } catch (e) { console.error('unit title save failed', e); }
}

async function toggleUnitHidden(courseKey, unitId) {
  const db = getDB();
  if (!db) return;
  const key = unitKey(courseKey, unitId);
  const hiding = !S.hiddenUnits.has(key);
  if (hiding) S.hiddenUnits.add(key); else S.hiddenUnits.delete(key);
  render();
  try {
    trackUsage('writes');
    if (hiding) await db.collection('hm_hidden_units').doc(key).set({ hidden: true });
    else await db.collection('hm_hidden_units').doc(key).delete();
  } catch (e) { console.error('unit hide toggle failed', e); }
}

async function addCustomUnit(courseKey, title) {
  const db = getDB();
  if (!db) return;
  const ref = db.collection('hm_custom_units').doc();
  const data = { course: courseKey, title, order: Date.now() };
  (S.customUnits[courseKey] = S.customUnits[courseKey] || []).push({ id: ref.id, title: data.title, order: data.order });
  render();
  try {
    trackUsage('writes');
    await ref.set(data);
  } catch (e) { console.error('unit create failed', e); }
}

async function deleteCustomUnit(courseKey, unitId) {
  const db = getDB();
  if (!db) return;
  const key = unitKey(courseKey, unitId);
  S.customUnits[courseKey] = (S.customUnits[courseKey] || []).filter(u => u.id !== unitId);
  delete S.unitEdits[key];
  S.hiddenUnits.delete(key);
  render();
  try {
    trackUsage('writes');
    await db.collection('hm_custom_units').doc(unitId).delete();
    await db.collection('hm_unit_edits').doc(key).delete();
    await db.collection('hm_hidden_units').doc(key).delete();
  } catch (e) { console.error('unit delete failed', e); }
}

async function loadIntroClassInfo() {
  const db = getDB();
  if (!db) return;
  await cachedLoad('intro', async () => {
    const snap = await db.collection('hm_intro_classes').get();
    trackUsage('reads', snap.size || 1);
    const map = {};
    snap.forEach(doc => { map[doc.id] = doc.data(); });
    return map;
  }, map => { S.introClassInfo = map; });
}

async function loadHiddenLessons() {
  const db = getDB();
  if (!db) return;
  await cachedLoad('hidden', async () => {
    const snap = await db.collection('hm_hidden_lessons').get();
    trackUsage('reads', snap.size || 1);
    return snap.docs.map(d => d.id);
  }, ids => { S.hiddenLessons = new Set(ids); });
}

// Teacher text edits for built-in lessons — overrides shadow data.js LESSONS
async function loadLessonEdits() {
  const db = getDB();
  if (!db) return;
  await cachedLoad('lesson_edits', async () => {
    const snap = await db.collection('hm_lesson_edits').get();
    trackUsage('reads', snap.size || 1);
    const map = {};
    snap.forEach(doc => { map[doc.id] = doc.data(); });
    return map;
  }, map => { S.lessonEdits = map; });
}

// Apply stored overrides (title/summary/duration + per-section text) to a lesson
function mergedLesson(lesson) {
  const ov = S.lessonEdits[lesson.id];
  if (!ov) return lesson;
  const m = { ...lesson };
  ['title', 'summary', 'duration'].forEach(k => { if (ov[k] !== undefined && ov[k] !== '') m[k] = ov[k]; });
  if (ov.keywords !== undefined) m.keywords = ov.keywords;
  if (ov.sections) {
    m.sections = (lesson.sections || []).map((s, i) =>
      ov.sections[i] ? { ...s, ...ov.sections[i] } : s);
  }
  return m;
}

// ── Quick Links ───────────────────────────────────────────────
const QL_VIEWS = ['radio', 'live', 'sports', 'yearbook', 'indepth', 'intro', 'lessons'];
let _qlDraft = null;

async function loadQuickLinks() {
  const db = getDB();
  const QL_DEFAULTS = { live: LIVE_QUICK_LINKS, yearbook: YEARBOOK_QUICK_LINKS };
  if (!db) {
    QL_VIEWS.forEach(v => { S.quickLinks[v] = QL_DEFAULTS[v] || []; });
    return;
  }
  const ok = await cachedLoad('quick_links', async () => {
    const snaps = await Promise.all(QL_VIEWS.map(v => db.collection('hm_quick_links').doc(v).get()));
    trackUsage('reads', QL_VIEWS.length);
    const map = {};
    QL_VIEWS.forEach((v, i) => {
      const existingSections = snaps[i].exists ? (snaps[i].data().sections || []) : null;
      if (existingSections && existingSections.length) {
        map[v] = existingSections;
      } else if (QL_DEFAULTS[v]) {
        map[v] = QL_DEFAULTS[v];
        db.collection('hm_quick_links').doc(v).set({ sections: QL_DEFAULTS[v] });
        trackUsage('writes', 1);
      } else {
        map[v] = existingSections || [];
      }
    });
    return map;
  }, map => { QL_VIEWS.forEach(v => { S.quickLinks[v] = map[v] || []; }); });
  if (!ok) QL_VIEWS.forEach(v => { S.quickLinks[v] = QL_DEFAULTS[v] || []; });
}

function qlSyncFromDom() {
  if (!_qlDraft) return;
  const sections = [];
  document.querySelectorAll('.ql-edit-section').forEach(secEl => {
    const heading = secEl.querySelector('.ql-section-heading').value.trim() || 'Section';
    const links = [];
    secEl.querySelectorAll('.ql-link-row').forEach(row => {
      const label = row.querySelector('.ql-link-label').value.trim();
      const url   = row.querySelector('.ql-link-url').value.trim();
      links.push({ label, url });
    });
    sections.push({ heading, links });
  });
  _qlDraft.sections = sections;
}

function qlStartEdit(view) {
  _qlDraft = { view, sections: JSON.parse(JSON.stringify(S.quickLinks[view] || [])) };
  render();
}

function qlCancel() { _qlDraft = null; render(); }

function qlAddSection(view) {
  qlSyncFromDom();
  _qlDraft.sections.push({ heading: '', links: [{ label: '', url: '' }] });
  render();
}

function qlRemoveSection(idx) {
  qlSyncFromDom();
  _qlDraft.sections.splice(idx, 1);
  render();
}

function qlAddLink(sIdx) {
  qlSyncFromDom();
  _qlDraft.sections[sIdx].links.push({ label: '', url: '' });
  render();
}

function qlRemoveLink(sIdx, lIdx) {
  qlSyncFromDom();
  _qlDraft.sections[sIdx].links.splice(lIdx, 1);
  render();
}

function qlSave(view) {
  qlSyncFromDom();
  const sections = (_qlDraft?.sections || [])
    .map(s => ({ heading: s.heading, links: s.links.filter(l => l.label || l.url) }))
    .filter(s => s.heading || s.links.length);
  S.quickLinks[view] = sections;
  _qlDraft = null;
  const db = getDB();
  if (db) { db.collection('hm_quick_links').doc(view).set({ sections }); trackUsage('writes', 1); }
  render();
}

function renderQuickLinksCard(view) {
  const sections  = S.quickLinks[view] || [];
  const isEditing = _qlDraft?.view === view;
  const draft     = isEditing ? _qlDraft.sections : sections;

  if (isEditing) {
    return `
      <section class="card ql-card">
        <div class="card-header">
          <h2>🔗 Quick Links</h2>
          <div style="display:flex;gap:6px">
            <button class="btn-primary" onclick="qlSave('${view}')" style="padding:4px 12px;font-size:0.8rem">Save</button>
            <button class="btn-secondary" onclick="qlCancel()" style="padding:4px 12px;font-size:0.8rem">Cancel</button>
          </div>
        </div>
        <div class="ql-edit-body">
          ${draft.map((sec, sIdx) => `
            <div class="ql-edit-section">
              <div class="ql-section-row">
                <input class="ql-section-heading form-input" value="${esc(sec.heading)}" placeholder="Section heading" style="font-size:0.82rem;flex:1">
                <button class="ql-rm-btn" onclick="qlRemoveSection(${sIdx})" title="Remove section">✕</button>
              </div>
              ${sec.links.map((l, lIdx) => `
                <div class="ql-link-row">
                  <input class="ql-link-label form-input" value="${esc(l.label)}" placeholder="Label" style="font-size:0.8rem;flex:1">
                  <input class="ql-link-url form-input" value="${esc(l.url)}" placeholder="https://..." style="font-size:0.8rem;flex:2">
                  <button class="ql-rm-btn" onclick="qlRemoveLink(${sIdx},${lIdx})" title="Remove">✕</button>
                </div>`).join('')}
              <button class="ql-add-link" onclick="qlAddLink(${sIdx})">+ Add Link</button>
            </div>`).join('')}
          <button class="btn-secondary" onclick="qlAddSection('${view}')" style="width:100%;margin-top:6px;font-size:0.82rem">+ Add Section</button>
        </div>
      </section>`;
  }

  if (!sections.length) {
    if (!S.teacherMode) return '';
    return `
      <section class="card ql-card">
        <div class="card-header">
          <h2>🔗 Quick Links</h2>
          <button class="btn-secondary" onclick="qlStartEdit('${view}')" style="padding:4px 12px;font-size:0.8rem">Edit Links</button>
        </div>
        <p style="color:var(--dim);font-size:0.84rem;padding:4px 0 8px">No links yet — click Edit Links to add some.</p>
      </section>`;
  }

  return `
    <section class="card ql-card">
      <div class="card-header">
        <h2>🔗 Quick Links</h2>
        ${S.teacherMode ? `<button class="btn-secondary" onclick="qlStartEdit('${view}')" style="padding:4px 12px;font-size:0.8rem">Edit Links</button>` : ''}
      </div>
      <div class="live-ql-sections">
        ${sections.map(sec => `
          <div class="live-ql-section">
            <div class="live-ql-section-heading">${esc(sec.heading)}</div>
            ${sec.links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener" class="live-ql-link">${esc(l.label)} ↗</a>`).join('')}
          </div>`).join('')}
      </div>
    </section>`;
}

// ── Broadcast Rundown ─────────────────────────────────────────
function getRundownTemplate(type) {
  return (RUNDOWN_TEMPLATES[type] || RUNDOWN_TEMPLATES._default)
    .map((r, i) => ({ ...r, id: 'r' + i }));
}

// Loads both the sport master template and any per-game override
async function loadRundownData(bid) {
  S.editingRundown = false;
  S.rundownEditBackup = null;
  const b = (S.broadcasts || []).find(x => x.id === bid);
  const sport = b?.type;
  const db = getDB();
  const loads = [];

  if (sport && !(sport in S.sportTemplates)) {
    loads.push((async () => {
      try {
        const snap = await db.collection('hm_rundown_templates').doc(sport).get();
        trackUsage('reads', 1);
        S.sportTemplates[sport] = snap.exists && snap.data().rows?.length
          ? snap.data().rows
          : getRundownTemplate(sport);
      } catch(e) { S.sportTemplates[sport] = getRundownTemplate(sport); }
    })());
  }

  if (!(bid in S.rundownOverrides)) {
    loads.push((async () => {
      try {
        const snap = await db.collection('hm_rundowns').doc(bid).get();
        trackUsage('reads', 1);
        S.rundownOverrides[bid] = snap.exists && snap.data().rows?.length
          ? snap.data().rows
          : null;
      } catch(e) { S.rundownOverrides[bid] = null; }
    })());
  }

  await Promise.all(loads);
  render();
}

function readRundownRowsFromDom() {
  const rows = [];
  document.querySelectorAll('.rd-row[data-rd-id]').forEach(tr => {
    rows.push({
      id:    tr.dataset.rdId,
      slug:  tr.querySelector('[data-col="slug"]')?.value?.trim() || '',
      pbp:   tr.querySelector('[data-col="pbp"]')?.value?.trim() || '',
      color: tr.querySelector('[data-col="color"]')?.value?.trim() || '',
      gfx:   tr.querySelector('[data-col="gfx"]')?.value?.trim() || '',
      cam:   tr.querySelector('[data-col="cam"]')?.value?.trim() || '',
    });
  });
  return rows;
}

async function saveRundown(bid) {
  const b = (S.broadcasts || []).find(x => x.id === bid);
  const sport = b?.type;
  const rows = readRundownRowsFromDom();
  S.editingRundown = false;
  S.rundownEditBackup = null;
  const db = getDB();
  if (S.editingRundownType === 'template' && sport) {
    S.sportTemplates[sport] = rows;
    if (db) { trackUsage('writes'); try { await db.collection('hm_rundown_templates').doc(sport).set({ rows }); } catch(e) {} }
  } else {
    S.rundownOverrides[bid] = rows;
    if (db) { trackUsage('writes'); try { await db.collection('hm_rundowns').doc(bid).set({ rows }); } catch(e) {} }
  }
  S.editingRundownType = null;
  render();
}

async function resetRundownToTemplate(bid) {
  S.rundownOverrides[bid] = null;
  const db = getDB();
  if (db) { trackUsage('writes'); try { await db.collection('hm_rundowns').doc(bid).delete(); } catch(e) {} }
  render();
}

function printRundown(b, rows) {
  const roles = b.roles || {};
  const assignedRoles = LIVE_ROLES.filter(r => roles[r]);
  const crewHtml = assignedRoles.length
    ? `<p class="crew-line">${assignedRoles.map(r => `<strong>${esc(r)}:</strong> ${esc(roles[r])}`).join(' &nbsp;&middot;&nbsp; ')}</p>`
    : '';
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>${esc(b.title)} — Rundown</title><style>
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:10.5px;margin:1.5cm 1cm;color:#000}
    h1{font-size:15px;font-weight:800;margin:0 0 3px}
    .meta{color:#555;font-size:10px;margin-bottom:6px}
    .crew-line{font-size:9px;color:#666;margin:0 0 12px}
    table{width:100%;border-collapse:collapse;table-layout:fixed}
    th{background:#1a1a1a;color:#fff;padding:5px 6px;text-align:left;font-size:9px;letter-spacing:.05em;text-transform:uppercase;font-weight:700}
    td{padding:6px;border-bottom:1px solid #e0e0e0;vertical-align:top;word-wrap:break-word;font-size:10px;line-height:1.45}
    .cn{color:#999;width:28px;text-align:center}
    .cs{width:12%;font-weight:700}
    .cp{width:26%}
    .cc{width:17%}
    .cg{width:16%;font-family:monospace;color:#c02;font-weight:700}
    .ck{width:16%;color:#165}
    .blank{color:#ccc}
    tr:nth-child(even) td{background:#f7f7f7}
  </style></head><body>
  <h1>${esc(b.title)}</h1>
  <div class="meta">${fmtDate(b.date, true)}${b.gameTime ? ' &middot; ' + esc(b.gameTime) : ''} &middot; Broadcast Rundown</div>
  ${crewHtml}
  <table>
    <thead><tr>
      <th class="cn">#</th><th class="cs">SEGMENT</th><th class="cp">PBP SCRIPT</th>
      <th class="cc">COLOR NOTES</th><th class="cg">GFX CUE</th><th class="ck">CAMERA</th>
    </tr></thead>
    <tbody>${rows.map((r, i) => `<tr>
      <td class="cn">${i + 1}</td>
      <td class="cs">${esc(r.slug) || '<span class="blank">—</span>'}</td>
      <td class="cp">${esc(r.pbp)  || '<span class="blank">—</span>'}</td>
      <td class="cc">${esc(r.color)|| '<span class="blank">—</span>'}</td>
      <td class="cg">${esc(r.gfx)  || '<span class="blank">—</span>'}</td>
      <td class="ck">${esc(r.cam)  || '<span class="blank">—</span>'}</td>
    </tr>`).join('')}</tbody>
  </table>
  <p style="margin-top:10px;font-size:9px;color:#666"><strong>PBP</strong> = Play-by-Play script &nbsp;·&nbsp; <strong>COLOR</strong> = Color commentator notes &nbsp;·&nbsp; <strong>GFX</strong> = Graphics cue (PSD filename) &nbsp;·&nbsp; <strong>CAM</strong> = Camera shot</p>
  <p style="margin-top:3px;font-size:9px;color:#666"><strong>Camera shots:</strong> &nbsp;<strong>WIDE</strong> = wide establishing shot &nbsp;·&nbsp; <strong>CU</strong> = close-up &nbsp;·&nbsp; <strong>KICK</strong> = low-angle kick/sideline wide</p>
  <script>window.onload=function(){window.print()}<\/script></body></html>`);
  w.document.close();
}


let _rdDragId = null;

function rdDragStart(rowId) { _rdDragId = rowId; }
function rdDragOver(e)       { e.preventDefault(); }
function rdDrop(targetId, bid) {
  if (!_rdDragId || _rdDragId === targetId) { _rdDragId = null; return; }
  const b     = (S.broadcasts || []).find(x => x.id === bid);
  const sport = b?.type;
  const src   = S.editingRundownType === 'template' && sport
    ? S.sportTemplates[sport] : S.rundownOverrides[bid];
  if (!src) { _rdDragId = null; return; }
  const rows  = [...src];
  const from  = rows.findIndex(r => r.id === _rdDragId);
  const to    = rows.findIndex(r => r.id === targetId);
  if (from === -1 || to === -1) { _rdDragId = null; return; }
  const [moved] = rows.splice(from, 1);
  rows.splice(to, 0, moved);
  if (S.editingRundownType === 'template' && sport) {
    S.sportTemplates[sport] = rows;
  } else {
    S.rundownOverrides[bid] = rows;
  }
  _rdDragId = null;
  render();
}

function rdDeleteRow(rowId, bid) {
  const b = (S.broadcasts || []).find(x => x.id === bid);
  const sport = b?.type;
  if (S.editingRundownType === 'template' && sport) {
    S.sportTemplates[sport] = (S.sportTemplates[sport] || []).filter(r => r.id !== rowId);
  } else {
    S.rundownOverrides[bid] = (S.rundownOverrides[bid] || []).filter(r => r.id !== rowId);
  }
  render();
}

function rdAddRow(bid) {
  const b = (S.broadcasts || []).find(x => x.id === bid);
  const sport = b?.type;
  const newRow = { id: 'r' + Date.now(), slug: '', pbp: '', color: '', gfx: '', cam: '' };
  if (S.editingRundownType === 'template' && sport) {
    S.sportTemplates[sport] = [...(S.sportTemplates[sport] || []), newRow];
  } else {
    S.rundownOverrides[bid] = [...(S.rundownOverrides[bid] || []), newRow];
  }
  render();
}

function renderRundownSection(b) {
  if (!SHOW_BROADCAST_RUNDOWN) return '';
  const sport = b.type;
  const templateLoaded = sport in S.sportTemplates;
  const overrideLoaded = b.id in S.rundownOverrides;
  if (!templateLoaded || !overrideLoaded) return `
    <section class="card rd-card">
      <div class="card-header"><h2>📋 Broadcast Rundown</h2></div>
      <p style="font-size:.875rem;color:var(--dim);padding:4px 0">Loading rundown...</p>
    </section>`;

  const hasOverride = S.rundownOverrides[b.id] !== null;
  const rows = hasOverride ? S.rundownOverrides[b.id] : (S.sportTemplates[sport] || []);
  const editing = S.editingRundown;
  const editType = S.editingRundownType;
  const sportLabel = (EVENT_TYPES[sport] || EVENT_TYPES.other).label;

  const viewCell = (val, cls) =>
    `<td class="${cls}">${val ? esc(val) : '<span class="rd-empty">—</span>'}</td>`;
  const editInput = (val, col) =>
    `<td><input class="rd-input" type="text" data-col="${col}" value="${esc(val)}"></td>`;
  const editTA = (val, col) =>
    `<td><textarea class="rd-input rd-ta" data-col="${col}" rows="2">${esc(val)}</textarea></td>`;

  return `
    <section class="card rd-card">
      <div class="card-header">
        <h2>📋 Broadcast Rundown</h2>
        <div class="rd-actions">
          ${SHOW_PRODUCTION_SHEETS && PRODUCTION_SHEETS[sport] ? `<a class="btn-secondary" href="${PRODUCTION_SHEETS[sport]}" target="_blank" rel="noopener" title="Weekly ${sportLabel} production sheet (Google Doc)">📄 Production Sheet</a>` : ''}
          <button class="btn-secondary" id="rd-print-btn" data-rd-bid="${b.id}">🖨️ Print</button>
          ${!editing ? `
            ${S.teacherMode ? `
              <button class="btn-secondary rd-tmpl-btn" id="rd-edit-template-btn" data-rd-bid="${b.id}" data-rd-sport="${sport}"
                title="Edit master template — updates all ${sportLabel} games">✏️ Edit Template</button>` : ''}
            <button class="btn-secondary" id="rd-edit-game-btn" data-rd-bid="${b.id}"
              title="Edit this game's rundown — add your script, talking points, and key words">✎ ${S.teacherMode ? 'This Game' : 'Edit Rundown'}</button>
            ${S.teacherMode && hasOverride ? `<button class="btn-secondary rd-reset-btn" id="rd-reset-btn" data-rd-bid="${b.id}">↩ Reset to Template</button>` : ''}
          ` : ''}
          ${editing ? `
            <button class="btn-primary"   id="rd-save-btn"   data-rd-bid="${b.id}">Save</button>
            <button class="btn-secondary" id="rd-cancel-btn" data-rd-bid="${b.id}">Cancel</button>` : ''}
        </div>
      </div>
      ${editing && editType === 'template' ? `
        <div class="rd-template-banner">⚠️ Editing <strong>${sportLabel} master template</strong> — saves to all ${sportLabel} games without custom edits</div>` : ''}
      ${!editing && hasOverride ? `
        <div class="rd-override-banner">✎ This game has custom edits</div>` : ''}
      ${!editing && !hasOverride ? `
        <div class="rd-template-banner rd-template-info">📋 Using <strong>${sportLabel} master template</strong></div>` : ''}
      <div class="rd-wrap">
        <table class="rd-table">
          <thead><tr>
            <th class="rd-th-n">#</th>
            <th class="rd-th-slug" title="Segment — the name of this moment in the broadcast">SEGMENT</th>
            <th class="rd-th-pbp"  title="PBP — Play-by-Play: what the play-by-play announcer says">PBP</th>
            <th class="rd-th-col"  title="COLOR — Color commentator notes and talking points">COLOR</th>
            <th class="rd-th-gfx"  title="GFX — Graphics Cue: the Photoshop file the graphics operator loads and fires">GFX</th>
            <th class="rd-th-cam"  title="CAM — Camera shot for the director to call">CAM</th>
            ${editing ? `<th class="rd-th-act"></th>` : ''}
          </tr></thead>
          <tbody>
            ${rows.map((r, i) => `
              <tr class="rd-row${editing ? ' rd-draggable' : ''}" data-rd-id="${r.id}"
                ${editing ? `draggable="true" ondragstart="rdDragStart('${r.id}')" ondragover="rdDragOver(event)" ondrop="rdDrop('${r.id}','${b.id}')"` : ''}>
                <td class="rd-n">${i + 1}</td>
                ${editing ? `
                  ${editInput(r.slug,  'slug')}
                  ${editTA(r.pbp,   'pbp')}
                  ${editTA(r.color, 'color')}
                  ${editInput(r.gfx,  'gfx')}
                  ${editInput(r.cam,  'cam')}
                  <td class="rd-act-cell">
                    <span class="rd-drag-handle" title="Drag to reorder">⠿</span>
                    <button class="rd-del" onclick="rdDeleteRow('${r.id}','${b.id}')" title="Remove row">✕</button>
                  </td>` : `
                  ${viewCell(r.slug,  'rd-slug')}
                  ${viewCell(r.pbp,   'rd-pbp')}
                  ${viewCell(r.color, 'rd-col')}
                  ${viewCell(r.gfx,   'rd-gfx')}
                  ${viewCell(r.cam,   'rd-cam')}`}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <p class="rd-legend">
        <strong>PBP</strong> = Play-by-Play script &nbsp;·&nbsp;
        <strong>COLOR</strong> = Color commentator notes &nbsp;·&nbsp;
        <strong>GFX</strong> = Graphics cue (PSD filename) &nbsp;·&nbsp;
        <strong>CAM</strong> = Camera shot
      </p>
      ${editing ? `
        <button class="btn-secondary" onclick="rdAddRow('${b.id}')"
          style="margin-top:10px;font-size:.82rem;width:100%">+ Add Row</button>` : ''}
    </section>`;
}

async function loadBroadcastChecklist(bid) {
  if (S.broadcastChecklist[bid]) { render(); return; }
  const db = getDB();
  if (!db) return;
  try {
    const doc = await db.collection('hm_broadcast_gc').doc(bid).get();
    trackUsage('reads', 1);
    S.broadcastChecklist[bid] = new Set(doc.exists ? (doc.data().checked || []) : []);
  } catch(e) { S.broadcastChecklist[bid] = new Set(); }
  render();
}

// ── Bell Ringer ───────────────────────────────────────────────
function bellringerTodayStr() {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local time
}

function bellringerQuestion(classKey) {
  const list = (S.bellringerQuestionsByClass[classKey] || []).length
    ? S.bellringerQuestionsByClass[classKey]
    : DEFAULT_BELLRINGER_QUESTIONS;
  const d = new Date();
  const localMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.floor(localMidnight.getTime() / 86400000);
  const idx = ((days % list.length) + list.length) % list.length;
  return list[idx];
}

async function loadBellRingerQuestions() {
  const db = getDB();
  if (!db) { S.bellringerQuestionsByClass = {}; return; }
  const ok = await cachedLoad('br_questions', async () => {
    const doc = await db.collection('hm_bellringer_questions').doc('list').get();
    trackUsage('reads', 1);
    if (doc.exists && doc.data().byClass) return doc.data().byClass;
    // Migrate the old single shared question list into a per-class shape so
    // every class starts from what the teacher already had, then diverges from there.
    const legacy = (doc.exists && (doc.data().questions || []).length) ? doc.data().questions : DEFAULT_BELLRINGER_QUESTIONS;
    const byClass = {};
    Object.keys(BELLRINGER_CLASSES).forEach(k => { byClass[k] = legacy; });
    db.collection('hm_bellringer_questions').doc('list').set({ byClass });
    trackUsage('writes', 1);
    return byClass;
  }, byClass => { S.bellringerQuestionsByClass = byClass; });
  if (!ok) S.bellringerQuestionsByClass = {};
}

function renderBellRingerBanner(classKey) {
  const isEditing = _brQDraft !== null && _brQEditingClass === classKey;
  if (isEditing) return renderBellRingerQuestionsEditor(classKey);

  const question = bellringerQuestion(classKey);
  const submittedDate = localStorage.getItem('hm_bellringer_date_' + classKey);
  const alreadySubmitted = submittedDate === bellringerTodayStr();

  return `
    <section class="card bellringer-card">
      <div class="card-header">
        <h2>🔔 Bell Ringer</h2>
        ${S.teacherMode ? `
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <a href="?board=bellringer&class=${classKey}" target="_blank" class="btn-secondary" style="font-size:0.78rem;padding:4px 12px;text-decoration:none">🖥️ Open Board View</a>
            <button class="btn-secondary" id="br-manage-questions" data-br-class="${classKey}" style="font-size:0.78rem;padding:4px 12px">✏️ Manage Questions</button>
            <button class="btn-secondary" id="br-clear" data-br-class="${classKey}" style="font-size:0.78rem;padding:4px 12px">🔄 Clear Wall for Next Class</button>
          </div>` : ''}
      </div>
      <p class="br-question">${esc(question)}</p>
      ${alreadySubmitted ? `
        <p class="dim br-submitted-msg">✅ You're all set for today — see you tomorrow!</p>
      ` : `
        <div class="br-form-row">
          <input id="br-name" type="text" placeholder="First and last name" value="${esc(localStorage.getItem('hm_student_name') || '')}">
          <input id="br-answer" type="text" placeholder="Type your answer here...">
          <button class="btn-primary" id="br-submit" data-br-class="${classKey}">Submit</button>
        </div>
        <p id="br-msg" class="dim br-msg"></p>
      `}
    </section>`;
}

async function submitBellRinger() {
  const btn      = document.getElementById('br-submit');
  const classKey = btn.dataset.brClass;
  const nameEl   = document.getElementById('br-name');
  const answerEl = document.getElementById('br-answer');
  const msg      = document.getElementById('br-msg');
  const name = shortenName(nameEl.value.trim()), answer = answerEl.value.trim();
  if (!name || !answer) {
    msg.textContent = 'Fill in your name and an answer first.';
    msg.style.color = 'var(--danger)';
    return;
  }
  const db = getDB();
  if (!db) { msg.textContent = 'Could not connect — try again.'; msg.style.color = 'var(--danger)'; return; }

  btn.disabled = true; btn.textContent = 'Submitting…';
  try {
    localStorage.setItem('hm_student_name', name);
    await db.collection('hm_bellringer_answers').add({
      name, answer, question: bellringerQuestion(classKey), classKey, dateStr: bellringerTodayStr(), createdAt: Date.now()
    });
    trackUsage('writes', 1);
    localStorage.setItem('hm_bellringer_date_' + classKey, bellringerTodayStr());
    const wrap = document.getElementById('bellringer-wrap');
    if (wrap) wrap.innerHTML = renderBellRingerBanner(classKey);
  } catch(e) {
    msg.textContent = 'Something went wrong — try again.';
    msg.style.color = 'var(--danger)';
    btn.disabled = false; btn.textContent = 'Submit';
  }
}

// ── Bell Ringer: teacher question editor ────────────────────────
let _brQDraft = null;
let _brQEditingClass = null;

function dbManageBellRingerQuestions() {
  const classKey = S.dbBrClass || 'radio';
  S.view = classKey;
  brQStartEdit(classKey);
}

function brQStartEdit(classKey) {
  _brQEditingClass = classKey;
  _brQDraft = ((S.bellringerQuestionsByClass[classKey] || []).length
    ? S.bellringerQuestionsByClass[classKey]
    : DEFAULT_BELLRINGER_QUESTIONS).slice();
  render();
}

function brQCancel() { _brQDraft = null; _brQEditingClass = null; render(); }

function brQSyncFromDom() {
  if (!_brQDraft) return;
  _brQDraft = Array.from(document.querySelectorAll('.br-q-row input')).map(i => i.value);
}

function brQAdd() {
  brQSyncFromDom();
  _brQDraft.push('');
  render();
}

function brQRemove(idx) {
  brQSyncFromDom();
  _brQDraft.splice(idx, 1);
  render();
}

function brQSave() {
  brQSyncFromDom();
  const questions = _brQDraft.map(q => q.trim()).filter(Boolean);
  const classKey = _brQEditingClass;
  S.bellringerQuestionsByClass[classKey] = questions.length ? questions : DEFAULT_BELLRINGER_QUESTIONS;
  _brQDraft = null;
  _brQEditingClass = null;
  const db = getDB();
  if (db) { db.collection('hm_bellringer_questions').doc('list').set({ byClass: S.bellringerQuestionsByClass }); trackUsage('writes', 1); }
  render();
}

function renderBellRingerQuestionsEditor(classKey) {
  const label = BELLRINGER_CLASSES[classKey]?.name || classKey;
  return `
    <section class="card bellringer-card">
      <div class="card-header">
        <h2>🔔 Manage Bell Ringer Questions — ${esc(label)}</h2>
        <div style="display:flex;gap:6px">
          <button class="btn-primary" onclick="brQSave()" style="padding:4px 12px;font-size:0.8rem">Save</button>
          <button class="btn-secondary" onclick="brQCancel()" style="padding:4px 12px;font-size:0.8rem">Cancel</button>
        </div>
      </div>
      <p class="cal-section-sub">One question rotates in automatically each day, just for this class. Edit, add, or remove questions below.</p>
      ${_brQDraft.map((q, i) => `
        <div class="br-q-row">
          <input value="${esc(q)}" placeholder="Question text">
          <button class="ql-rm-btn" onclick="brQRemove(${i})" title="Remove">✕</button>
        </div>`).join('')}
      <button class="btn-secondary" onclick="brQAdd()" style="width:100%;margin-top:6px;font-size:0.82rem">+ Add Question</button>
    </section>`;
}

// ── Bell Ringer: teacher board (projector view) ─────────────────
function loadBellRingerBoard(classKey) {
  const db = getDB();
  if (!db) return;
  if (S.bellringerAnswersUnsub) { S.bellringerAnswersUnsub(); S.bellringerAnswersUnsub = null; }
  const today = bellringerTodayStr();
  S.bellringerAnswersUnsub = db.collection('hm_bellringer_answers').where('classKey', '==', classKey).onSnapshot(snap => {
    // Answers from a prior day (or missing a date, from before this field existed)
    // are stale — purge them so the wall resets automatically each day.
    const stale = snap.docs.filter(d => d.data().dateStr !== today);
    if (stale.length) {
      const batch = db.batch();
      stale.forEach(d => batch.delete(d.ref));
      batch.commit().catch(() => {});
    }
    S.bellringerAnswers = snap.docs
      .filter(d => d.data().dateStr === today)
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const wall = document.getElementById('br-answers-wall');
    if (wall) wall.innerHTML = renderBellRingerAnswers(S.bellringerAnswers);
  }, err => console.error('bellringer snapshot error', err));
}

async function clearBellRingerWall(classKey) {
  const label = BELLRINGER_CLASSES[classKey]?.name || classKey;
  if (!confirm(`Clear all Bell Ringer answers for ${label}? Do this between class periods.`)) return;
  const db = getDB();
  if (!db) return;
  const snap = await db.collection('hm_bellringer_answers').where('classKey', '==', classKey).get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

function renderBellRingerAnswers(entries) {
  if (!entries.length) return `<p class="dim" style="font-size:1rem">Waiting for answers…</p>`;
  return `<div class="br-answers-grid">` + entries.map(e => `
    <div class="br-answer-card">
      <div class="br-answer-name">${esc(e.name)}</div>
      <div class="br-answer-text">${esc(e.answer)}</div>
    </div>`).join('') + `</div>`;
}

function renderBellRingerBoard() {
  const classKey = S.bellringerBoardClass || 'radio';
  const label = BELLRINGER_CLASSES[classKey]?.name || classKey;
  return `
    <div class="ib-board">
      <a href="?" class="ib-board-exit" title="Exit board view">⤺ Exit</a>
      <div class="ib-board-header">
        <h1>🔔 Bell Ringer — ${esc(label)}</h1>
        <p class="ib-board-question">${esc(bellringerQuestion(classKey))}</p>
      </div>
      <div id="br-answers-wall">${renderBellRingerAnswers(S.bellringerAnswers)}</div>
      <div class="br-audio-bar">
        <audio id="br-audio" preload="none" src="${esc(WCYT_STREAM_URL)}"></audio>
        <button type="button" id="br-audio-toggle" class="br-audio-toggle">▶</button>
        <span class="br-audio-label">91.1 The Point — Live</span>
      </div>
    </div>`;
}

function initBellRingerAudio() {
  const audio = document.getElementById('br-audio');
  const btn = document.getElementById('br-audio-toggle');
  if (!audio || !btn) return;
  const setBtn = () => { btn.textContent = audio.paused ? '▶' : '⏸'; };
  audio.addEventListener('play', setBtn);
  audio.addEventListener('pause', setBtn);
  btn.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(() => {}); else audio.pause();
  });
  audio.play().catch(() => { setBtn(); }); // browsers may block autoplay until a user gesture
}

// ── Init ──────────────────────────────────────────────────────
async function init() {
  await Promise.all([loadFromFirebase(), loadCustomYbEvents(), loadYearbookCoverage(), loadCalendarYbEvents(), loadCanvaLessons(), loadLessonOrder(), loadLessonIcons(), loadHiddenLessons(), loadLessonEdits(), loadUnitEdits(), loadHiddenUnits(), loadCustomUnits(), loadIntroClassInfo(), loadQuickLinks(), loadBeatOverrides(), loadBellRingerQuestions()]);
  loadEquipment();
  loadEquipmentState();
  await Promise.all([loadFormSignups(), loadYbFormSignups()]);  // need broadcasts/events loaded first

  if (new URLSearchParams(location.search).get('board') === 'icebreaker') {
    S.view = 'icebreaker-board';
    const gameParam = new URLSearchParams(location.search).get('game');
    const validGames = ['qa', 'tot', 'bingo', 'wyr', 'speed', 'common', 'rank', 'match', 'rapid'];
    S.icebreakerGame = validGames.includes(gameParam) ? gameParam : 'truths';
    if (S.icebreakerGame === 'bingo') loadBingoState();
    render();
    loadIcebreakerGame(S.icebreakerGame);
    return;
  }

  if (new URLSearchParams(location.search).get('board') === 'bellringer') {
    S.view = 'bellringer-board';
    const classParam = new URLSearchParams(location.search).get('class');
    S.bellringerBoardClass = BELLRINGER_CLASSES[classParam] ? classParam : 'radio';
    render();
    loadBellRingerBoard(S.bellringerBoardClass);
    initBellRingerAudio();
    return;
  }

  render();

  document.addEventListener('keydown', e => {
    if (!S.lessonId) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const course = LESSONS[S.lessonCourse];
      const unit = course && course.units.find(u => u.id === S.lessonUnit);
      const lesson = unit && unit.lessons.find(l => l.id === S.lessonId);
      if (!lesson) return;
      const total = (lesson.sections || []).length + 2;
      if (S.lessonSlide < total - 1) { S.lessonSlide++; go('lessons'); }
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (S.lessonSlide > 0) { S.lessonSlide--; go('lessons'); }
    }
  });
}

// ── Passcode gate ─────────────────────────────────────────────
const SITE_PASSCODE = 'Spartans';
const PASSCODE_KEY  = 'hm_access';

function checkPasscode() {
  try { return localStorage.getItem(PASSCODE_KEY) === SITE_PASSCODE; } catch(e) { return false; }
}

function renderPasscodeScreen(errorMsg) {
  document.getElementById('app').innerHTML = `
    <div class="login-screen">
      <div class="login-card">
        <div class="login-logo">Homestead<br>Media</div>
        <div class="login-sub">Enter the class passcode to continue</div>
        ${errorMsg ? `<div class="login-error">${esc(errorMsg)}</div>` : ''}
        <input type="password" id="passcode-input" class="form-input" placeholder="Passcode" autocomplete="off">
        <button class="btn-primary" id="passcode-submit" style="width:100%;margin-top:4px">Enter</button>
      </div>
    </div>`;
  const input  = document.getElementById('passcode-input');
  const submit = document.getElementById('passcode-submit');
  const attempt = () => {
    if (input.value === SITE_PASSCODE) {
      try { localStorage.setItem(PASSCODE_KEY, SITE_PASSCODE); } catch(e) {}
      init();
    } else {
      renderPasscodeScreen('Incorrect passcode — try again.');
    }
  };
  submit.addEventListener('click', attempt);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });
  input.focus();
}

document.addEventListener('DOMContentLoaded', () => {
  if (checkPasscode()) { init(); return; }
  renderPasscodeScreen();
});

// ── IASB Hub ──────────────────────────────────────────────────
function renderIASB() {
  const entries = S.iasbEntries || [];
  const submitted = entries.filter(e => e.submittedToPortal).length;
  const days = iasbDeadlineDays();

  const divisions = ['Radio', 'News', 'Sports', 'Video', 'Emerging Media'];
  const byDivision = {};
  IASB_CATEGORIES.forEach(cat => {
    if (!byDivision[cat.division]) byDivision[cat.division] = [];
    byDivision[cat.division].push(cat);
  });

  const catGrids = divisions.filter(d => byDivision[d]).map(div => {
    const cats = byDivision[div];
    return `
      <div class="iasb-division-label">${div} Division</div>
      <div class="iasb-cat-grid">
        ${cats.map(cat => {
          const catCount = entries.filter(e => e.code === cat.code).length;
          return `
            <div class="iasb-cat-card" data-iasb-cat="${cat.code}" style="border-top-color:${cat.color}">
              <div class="iasb-cat-top">
                <span class="iasb-code" style="color:${cat.color}">${cat.code}</span>
                ${cat.tag ? `<span class="iasb-tag${cat.tag === 'LIVE Finals' ? ' live-tag' : ''}">${cat.tag}</span>` : ''}
              </div>
              <div class="iasb-cat-name">${cat.name}</div>
              <div class="iasb-cat-meta"><span>${cat.length}</span><span>${cat.fileFormat}</span></div>
              <div class="iasb-entry-count">${catCount} ${catCount === 1 ? 'entry' : 'entries'}</div>
            </div>`;
        }).join('')}
      </div>`;
  }).join('');

  const dropboxGrid = IASB_CATEGORIES.map(c => {
    const url = IASB_DRIVE_FOLDERS[c.code] || '#';
    return `<a href="${url}" target="_blank" class="iasb-dropbox-link" style="border-left:3px solid ${c.color}">
      <span class="iasb-dropbox-code">${c.code}</span>
      <span class="iasb-dropbox-name">${c.name}</span>
      <span class="iasb-dropbox-arrow">→</span>
    </a>`;
  }).join('');

  return `
    ${navBar('radio')}
    <div class="class-page">
      <button class="back-btn" data-nav="radio">← Back to Radio</button>
      <div class="iasb-page-header">
        <h1>IASB Competition</h1>
        <div class="iasb-season">${IASB_SEASON} Season</div>
      </div>

      <div class="iasb-banner">
        <div class="iasb-banner-deadline">
          📅 Submissions due <strong>${fmtDate(IASB_DEADLINE, false)}</strong>
          ${days > 0 ? `— <strong>${days} days away</strong>` : days === 0 ? '— <strong>TODAY</strong>' : '— <strong>Deadline passed</strong>'}
        </div>
        <div class="iasb-banner-stats">
          <span>${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} registered</span>
          <span class="iasb-stat-sep">·</span>
          <span>${submitted} submitted to portal</span>
        </div>
      </div>

      <div class="iasb-categories-section">${catGrids}</div>

      <section class="card iasb-form-card">
        <div class="card-header">
          <h2>Audio Broadcasting Dropbox 2027</h2>
          <a href="${IASB_DROPBOX_URL}" target="_blank" class="btn-sm" style="background:var(--amber);color:#000">Open in Drive →</a>
        </div>
        <p style="margin:0 0 16px;color:var(--dim);font-size:0.875rem">Click your category below to open its upload folder. Name your file: <code>YourName - EntryTitle.mp3</code></p>
        <div class="iasb-dropbox-grid">${dropboxGrid}</div>
      </section>
    </div>`;
}

function renderIASBCategory() {
  const cat = IASB_CATEGORIES.find(c => c.code === S.iasbCategory);
  if (!cat) return `${navBar('radio')}<div class="class-page"><button class="back-btn" data-nav="iasb">← Back</button><p>Category not found.</p></div>`;

  const entries = (S.iasbEntries || []).filter(e => e.code === cat.code);
  const atLimit = false;

  const entryCards = entries.length
    ? entries.map(entry => renderIASBEntryCard(cat, entry)).join('')
    : `<p class="dim" style="text-align:center;padding:24px 0">No entries registered yet for this category.</p>`;

  const catDriveUrl = IASB_DRIVE_FOLDERS[cat.code];
  const formBtn = catDriveUrl
    ? `<a href="${catDriveUrl}" target="_blank" style="display:block;text-align:center;background:${cat.color};color:#000;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:700;font-size:0.875rem;margin-bottom:12px">
        📂 Open ${cat.code} Drive Folder →
       </a>
       <p style="font-size:0.78rem;color:var(--dim);line-height:1.6;margin:0">Name your file:<br>
         <code style="background:var(--surface2);padding:2px 6px;border-radius:4px;font-size:0.75rem">YourName - Title${cat.fileFormat.split('+')[0].trim()}</code>
       </p>`
    : `<p class="dim" style="font-size:0.8rem;line-height:1.5">Drive folder not linked.</p>`;

  return `
    ${navBar('radio')}
    <div class="class-page">
      <button class="back-btn" data-nav="iasb">← Back to IASB Hub</button>

      <div class="iasb-cat-header">
        <span class="iasb-code-lg" style="color:${cat.color}">${cat.code}</span>
        <div class="iasb-cat-header-info">
          <h1>${cat.name}</h1>
          <div class="iasb-cat-header-tags">
            <span class="iasb-division-chip" style="color:${cat.color};border-color:${cat.color}40">${cat.division}</span>
            ${cat.tag ? `<span class="iasb-tag${cat.tag === 'LIVE Finals' ? ' live-tag' : ''}">${cat.tag}</span>` : ''}
            ${cat.solo ? '<span class="iasb-tag">Solo entry</span>' : ''}
            <span class="iasb-tag">Open entries</span>
          </div>
        </div>
      </div>

      <div class="page-grid">
        <div class="main-col">
          <section class="card">
            <h2 style="margin-bottom:16px">Requirements</h2>
            <div class="iasb-specs">
              <div class="iasb-spec-row"><span class="spec-label">Format</span><span>${cat.format}</span></div>
              <div class="iasb-spec-row"><span class="spec-label">Length</span><span>${cat.length}</span></div>
              <div class="iasb-spec-row"><span class="spec-label">File</span><span>${cat.fileFormat}</span></div>
            </div>
            <p class="iasb-cat-desc">${cat.description}</p>
            <div class="iasb-criteria-header">Judged On</div>
            <div class="iasb-criteria-chips">
              ${cat.criteria.map(c => `<span class="iasb-criterion-chip" style="border-color:${cat.color}30;color:${cat.color}">${c}</span>`).join('')}
            </div>
          </section>

          <section class="card">
            <div class="card-header">
              <h2>Registered Entries <span class="iasb-entry-ratio">${entries.length}</span></h2>
              <button class="btn-primary" id="register-iasb-entry"
                ${atLimit ? 'disabled' : ''}
                style="background:${atLimit ? 'var(--surface2)' : cat.color};color:${atLimit ? 'var(--dim)' : '#000'}">
                ${atLimit ? 'School limit reached' : '+ Register Entry'}
              </button>
            </div>
            <div class="iasb-entries-list">${entryCards}</div>
          </section>
        </div>

        <div class="side-col">
          <section class="card">
            <h2 style="margin-bottom:4px">Submission Checklist</h2>
            <p style="font-size:0.78rem;color:var(--dim);margin-bottom:14px">Applies to every entry in this category.</p>
            <div class="iasb-base-checklist">
              ${cat.checklist.map((item, i) => `
                <div class="iasb-base-check-item">
                  <span class="check-num">${i + 1}</span>
                  <span>${item}</span>
                </div>`).join('')}
            </div>
          </section>
          <section class="card">
            <h2 style="margin-bottom:12px">Submit Files</h2>
            ${formBtn}
          </section>
        </div>
      </div>
    </div>`;
}

function renderIASBEntryCard(cat, entry) {
  const checks = entry.checklist || {};
  const done = cat.checklist.filter((_, i) => checks[i]).length;
  const pct  = cat.checklist.length ? Math.round(done / cat.checklist.length * 100) : 0;

  return `
    <div class="iasb-entry-card" data-entry-id="${esc(entry.id)}">
      <div class="iasb-entry-header">
        <div class="iasb-entry-names">${esc(entry.studentName)}${entry.partnerNames ? ` · ${esc(entry.partnerNames)}` : ''}</div>
        <div class="iasb-progress-wrap">
          <div class="iasb-entry-progress-bar"><div class="iasb-progress-fill" style="width:${pct}%;background:${cat.color}"></div></div>
          <span class="iasb-entry-progress-text">${done}/${cat.checklist.length}</span>
        </div>
        ${entry.submittedToPortal ? '<span class="iasb-submitted-badge">✓ Submitted</span>' : ''}
      </div>
      <div class="iasb-entry-title">${esc(entry.entryTitle || 'Untitled')}</div>
      <div class="iasb-entry-checklist">
        ${cat.checklist.map((item, i) => S.teacherMode ? `
          <label class="iasb-check-item">
            <input type="checkbox" class="iasb-entry-check"
              data-entry-id="${esc(entry.id)}" data-idx="${i}"
              ${checks[i] ? 'checked' : ''}>
            <span class="${checks[i] ? 'iasb-check-done' : ''}">${item}</span>
          </label>` : `
          <div class="iasb-check-static ${checks[i] ? 'done' : ''}">
            <span class="iasb-check-icon">${checks[i] ? '✓' : '○'}</span>
            <span>${item}</span>
          </div>`).join('')}
      </div>
      ${entry.notes ? `<div class="iasb-entry-notes">${esc(entry.notes)}</div>` : ''}
      ${S.teacherMode ? `
        <div class="iasb-teacher-controls">
          ${!entry.submittedToPortal
            ? `<button class="btn-primary iasb-mark-submitted" data-entry-id="${esc(entry.id)}" style="background:var(--success);color:#000;font-size:0.8rem">✓ Mark Submitted to IASB</button>`
            : `<button class="btn-secondary iasb-unmark-submitted" data-entry-id="${esc(entry.id)}" style="font-size:0.8rem">Unmark Submitted</button>`}
          <button class="btn-danger iasb-delete-entry" data-entry-id="${esc(entry.id)}" style="font-size:0.8rem">Delete</button>
        </div>` : ''}
    </div>`;
}

function iasbDeadlineDays() {
  const d = new Date(IASB_DEADLINE + 'T00:00:00');
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.ceil((d - now) / 86400000);
}

// ── IASB Firebase ─────────────────────────────────────────────
async function saveIASBEntry(data) {
  const db = getDB();
  const entry = { ...data, createdAt: new Date().toISOString() };
  if (db) {
    try {
      trackUsage('writes');
      const ref = await db.collection('hm_iasb_entries').add(entry);
      S.iasbEntries.push({ id: ref.id, ...entry });
      showToast('Entry registered!');
    } catch(e) { showToast('Could not save. Try again.'); return; }
  } else {
    S.iasbEntries.push({ id: Date.now().toString(), ...entry });
  }
  render();
}

async function updateIASBCheckItem(entryId, idx, checked) {
  const entry = S.iasbEntries.find(e => e.id === entryId);
  if (!entry) return;
  if (!entry.checklist) entry.checklist = {};
  entry.checklist[idx] = checked;
  const db = getDB();
  if (db) {
    trackUsage('writes');
    const update = {};
    update[`checklist.${idx}`] = checked;
    await db.collection('hm_iasb_entries').doc(entryId).update(update).catch(() => {});
  }
  const cat = IASB_CATEGORIES.find(c => c.code === entry.code);
  if (cat) {
    const card = document.querySelector(`.iasb-entry-card[data-entry-id="${entryId}"]`);
    if (card) {
      const done = cat.checklist.filter((_, i) => (entry.checklist || {})[i]).length;
      const pct  = cat.checklist.length ? Math.round(done / cat.checklist.length * 100) : 0;
      const fill = card.querySelector('.iasb-progress-fill');
      const text = card.querySelector('.iasb-entry-progress-text');
      if (fill) fill.style.width = pct + '%';
      if (text) text.textContent = `${done}/${cat.checklist.length}`;
    }
  }
}

async function markIASBSubmitted(entryId, submitted) {
  const entry = S.iasbEntries.find(e => e.id === entryId);
  if (!entry) return;
  entry.submittedToPortal = submitted;
  const db = getDB();
  if (db) { trackUsage('writes'); await db.collection('hm_iasb_entries').doc(entryId).update({ submittedToPortal: submitted }).catch(() => {}); }
  showToast(submitted ? 'Marked as submitted!' : 'Submission mark removed.');
  render();
}

async function deleteIASBEntry(entryId) {
  S.iasbEntries = S.iasbEntries.filter(e => e.id !== entryId);
  const db = getDB();
  if (db) { trackUsage('writes'); await db.collection('hm_iasb_entries').doc(entryId).delete().catch(() => {}); }
  render();
}

// ── Teacher Dashboard ─────────────────────────────────────────
function dbSec(id, titleHtml, actionsHtml, bodyHtml) {
  const open = !!(S.dashSections || {})[id];
  return `
    <section class="card db-section">
      <div class="dbs-head" data-db-section="${id}">
        <div class="dbs-title">
          <span class="dbs-chev">${open ? '▾' : '▸'}</span>
          ${titleHtml}
        </div>
        ${actionsHtml ? `<div class="dbs-actions">${actionsHtml}</div>` : ''}
      </div>
      ${open ? `<div class="dbs-body">${bodyHtml}</div>` : ''}
    </section>`;
}

function renderDashboard() {
  if (!S.teacherMode) return `${navBar('dashboard')}<div class="class-page"><p class="dim">Teacher mode required.</p></div>`;

  const entries  = S.iasbEntries || [];
  const plans    = S.submissions || [];
  const submitted = entries.filter(e => e.submittedToPortal).length;

  // IASB section — group by category in IASB_CATEGORIES order
  const iasbSection = IASB_CATEGORIES.map(cat => {
    const catEntries = entries.filter(e => e.code === cat.code);
    if (!catEntries.length) return `
      <div class="db-cat-row empty">
        <span class="db-cat-code" style="color:${cat.color}">${cat.code}</span>
        <span class="db-cat-name dim">${cat.name}</span>
        <span class="dim" style="font-size:0.78rem">No entries</span>
      </div>`;

    return `
      <div class="db-cat-block">
        <div class="db-cat-label">
          <span class="db-cat-code" style="color:${cat.color}">${cat.code}</span>
          <span class="db-cat-name">${cat.name}</span>
          <span class="db-cat-count">${catEntries.length} ${catEntries.length === 1 ? 'entry' : 'entries'}</span>
        </div>
        ${catEntries.map(entry => {
          const checks = entry.checklist || {};
          const done   = cat.checklist.filter((_, i) => checks[i]).length;
          const pct    = cat.checklist.length ? Math.round(done / cat.checklist.length * 100) : 0;
          return `
            <div class="db-entry-row">
              <div class="db-entry-main">
                <div class="db-entry-student">${esc(entry.studentName)}${entry.partnerNames ? ` · ${esc(entry.partnerNames)}` : ''}</div>
                <div class="db-entry-title">${esc(entry.entryTitle || 'Untitled')}</div>
                ${entry.notes ? `<div class="db-entry-notes">${esc(entry.notes)}</div>` : ''}
              </div>
              <div class="db-entry-meta">
                <div class="db-progress-wrap">
                  <div class="db-progress-bar"><div class="db-progress-fill" style="width:${pct}%;background:${cat.color}"></div></div>
                  <span class="db-progress-text">${done}/${cat.checklist.length}</span>
                </div>
                ${entry.submittedToPortal
                  ? `<span class="db-submitted-badge">✓ Submitted</span>
                     <button class="btn-secondary db-btn iasb-unmark-submitted" data-entry-id="${esc(entry.id)}" style="font-size:0.75rem">Unmark</button>`
                  : `<button class="btn-primary db-btn iasb-mark-submitted" data-entry-id="${esc(entry.id)}" style="background:var(--success);color:#000;font-size:0.75rem">Mark Submitted</button>`}
                <button class="btn-danger db-btn iasb-delete-entry" data-entry-id="${esc(entry.id)}" style="font-size:0.75rem">Delete</button>
                <button class="btn-secondary db-btn db-view-btn" data-iasb-cat="${cat.code}" style="font-size:0.75rem">View →</button>
              </div>
            </div>`;
        }).join('')}
      </div>`;
  }).join('');

  // Talk Show plans section
  const plansSection = plans.length
    ? plans.map(s => `
        <div class="db-plan-row">
          <div class="db-plan-main">
            <div class="db-entry-student">${esc(s.studentName || 'Unknown')}</div>
            <div class="db-entry-title">${esc(s.showName || 'Untitled Show')}</div>
            <div class="db-entry-notes">Partners: ${esc(s.partners || '—')} · Theme: ${esc((s.theme || {}).title || '—')}</div>
          </div>
          <div class="db-entry-meta">
            <span class="dim" style="font-size:0.75rem">${s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : ''}</span>
            <button class="btn-secondary db-btn db-plan-detail" data-sub-id="${esc(s.id)}" style="font-size:0.75rem">View Plan →</button>
          </div>
        </div>`).join('')
    : `<p class="dim" style="padding:16px 0;font-size:0.875rem">No plans submitted yet.</p>`;

  const usage = getUsage();
  const READ_LIMIT = 50000, WRITE_LIMIT = 20000;
  const readPct  = Math.min(100, Math.round(usage.reads  / READ_LIMIT  * 100));
  const writePct = Math.min(100, Math.round(usage.writes / WRITE_LIMIT * 100));
  const barColor = pct => pct >= 80 ? 'var(--error)' : pct >= 50 ? '#f59e0b' : 'var(--success)';

  return `
    ${navBar('dashboard')}
    <div class="class-page">
      <div class="db-header">
        <h1>Teacher Dashboard</h1>
        <div class="db-stats">
          <div class="db-stat"><span class="db-stat-num">${entries.length}</span><span>IASB entries</span></div>
          <div class="db-stat"><span class="db-stat-num" style="color:var(--success)">${submitted}</span><span>submitted to portal</span></div>
          <div class="db-stat"><span class="db-stat-num" style="color:var(--radio)">${plans.length}</span><span>talk show plans</span></div>
        </div>
      </div>

      <section class="card db-section" style="padding:14px 20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <h3 style="margin:0;font-size:0.9rem">Firebase Usage <span style="font-size:0.75rem;font-weight:400;color:var(--dim)">— today, this browser</span></h3>
          <a href="https://console.firebase.google.com/project/audioaficionados-21ba0/firestore" target="_blank" style="font-size:0.78rem;color:var(--accent);text-decoration:none">Full usage ↗</a>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:4px"><span>Reads</span><span style="color:${barColor(readPct)}">${usage.reads.toLocaleString()} / ${READ_LIMIT.toLocaleString()} <span class="dim">(${readPct}%)</span></span></div>
            <div style="background:var(--surface2);border-radius:4px;height:8px;overflow:hidden"><div style="width:${readPct}%;height:100%;background:${barColor(readPct)};border-radius:4px;transition:width 0.3s"></div></div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:4px"><span>Writes</span><span style="color:${barColor(writePct)}">${usage.writes.toLocaleString()} / ${WRITE_LIMIT.toLocaleString()} <span class="dim">(${writePct}%)</span></span></div>
            <div style="background:var(--surface2);border-radius:4px;height:8px;overflow:hidden"><div style="width:${writePct}%;height:100%;background:${barColor(writePct)};border-radius:4px;transition:width 0.3s"></div></div>
          </div>
        </div>
        ${readPct >= 80 || writePct >= 80 ? `<p style="margin:10px 0 0;font-size:0.8rem;color:var(--error)">⚠️ Approaching daily limit — consider upgrading to Firebase Blaze plan.</p>` : ''}
      </section>

      ${(() => {
        const dbBrClass = S.dbBrClass || 'radio';
        const classOptions = Object.entries(BELLRINGER_CLASSES).map(([k, c]) =>
          `<option value="${k}" ${k === dbBrClass ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
        return dbSec('bellringer',
          `<h2>🔔 Bell Ringer</h2>`,
          `<select id="db-br-class" class="btn-secondary" style="font-size:0.78rem;padding:4px 8px">${classOptions}</select>
           <a href="?board=bellringer&class=${dbBrClass}" target="_blank" class="btn-secondary" style="font-size:0.78rem;padding:4px 12px;text-decoration:none">🖥️ Open Board View</a>
           <button class="btn-secondary" id="db-br-manage" style="font-size:0.78rem;padding:4px 12px">✏️ Manage Questions</button>
           <button class="btn-secondary" id="db-br-clear" style="font-size:0.78rem;padding:4px 12px">🔄 Clear Wall for Next Class</button>`,
          `<p class="dim" style="font-size:0.85rem;margin:0">Today's question for ${esc(BELLRINGER_CLASSES[dbBrClass].name)}: <strong style="color:var(--text)">${esc(bellringerQuestion(dbBrClass))}</strong></p>`
        );
      })()}

      ${(() => {
        const { fridays, startYear } = getSchoolYearFridays();
        const skipped  = S.showSchedule || [];
        const showDays = fridays.length - skipped.length;
        const today    = weekKey(new Date());
        const byMonth  = {};
        fridays.forEach(f => {
          const label = f.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          (byMonth[label] = byMonth[label] || []).push(f);
        });
        const calHtml = Object.entries(byMonth).map(([month, dates]) => `
          <div class="ss-month">
            <div class="ss-month-label">${month}</div>
            <div class="ss-chips">
              ${dates.map(d => {
                const key   = weekKey(d);
                const isSkip = skipped.includes(key);
                const isPast = key < today;
                const label  = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return `<button class="ss-chip ${isSkip ? 'ss-skipped' : 'ss-on'}${isPast ? ' ss-past' : ''}" data-show-date="${key}" title="${isSkip ? 'Click to restore show' : 'Click to skip this show'}">${label}</button>`;
              }).join('')}
            </div>
          </div>`).join('');
        return dbSec('schedule',
          `<h2>📺 In-Depth Show Schedule — ${startYear}–${startYear+1}</h2>`,
          `<span style="font-size:0.8rem;color:var(--dim)">${showDays} of ${fridays.length} Fridays</span>`,
          `<p style="font-size:0.8rem;color:var(--dim);margin:0 0 16px">All shows air on Fridays. Click any date to toggle it off (no show) or back on.</p><div class="ss-grid">${calHtml}</div>`
        );
      })()}

      ${dbSec('iasb',
        `<h2>IASB Competition Entries</h2>`,
        `<button class="btn-secondary" data-nav="iasb" style="font-size:0.8rem">Open IASB Hub</button>`,
        `<div class="db-iasb-list">${iasbSection}</div>`
      )}

      ${dbSec('plans',
        `<h2>Talk Show Plans</h2>`,
        `<button class="btn-secondary" id="db-refresh-plans" style="font-size:0.8rem">Refresh</button>`,
        `<div class="db-plans-list" id="db-plans-list">${plansSection}</div>`
      )}

      ${dbSec('weekly_folders',
        `<h2>🗂️ Weekly Drive Folders</h2>`,
        SYNC_SCRIPT_URL ? `<button class="btn-primary" id="setup-weekly-folders-btn" style="font-size:0.8rem">＋ Set Up Any New Weekly Folders</button>` : '',
        SYNC_SCRIPT_URL
          ? `<p style="font-size:0.875rem;color:var(--dim);margin:0 0 12px;line-height:1.6">Creates a Drive folder — for both Yearbook and the Show Planner — for any week listed in <code>Code.gs</code> that doesn't have one yet (e.g. right after adding next semester's weeks). Already-filled weeks are skipped, so it's safe to click again later.</p>
             <div id="weekly-folders-result"></div>`
          : `<div style="font-size:0.85rem;color:var(--dim);background:var(--surface2);border-radius:8px;padding:12px 14px">Requires the Apps Script sync URL — see the Athletics Calendar Sync setup below.</div>`
      )}

      ${dbSec('athletics',
        `<h2>📅 Athletics Calendar Sync</h2>`,
        ``,
        `<p style="font-size:0.875rem;color:var(--dim);margin-bottom:14px;line-height:1.6">Syncs all varsity events from the HHS athletics source calendar into the HHS Media Events calendar for the current school year. Runs automatically every August 1 — use this button for a manual re-sync anytime.</p>
        ${SYNC_SCRIPT_URL
          ? `<button class="btn-primary" id="sync-cal-btn" style="background:var(--success);color:#000">↻ Sync Athletics Calendar Now</button><span id="sync-cal-status" style="font-size:0.8rem;color:var(--dim);margin-left:12px"></span>`
          : `<div style="font-size:0.85rem;color:var(--dim);background:var(--surface2);border-radius:8px;padding:12px 14px;line-height:1.7"><strong style="color:var(--text)">One-time setup required:</strong><br>1. Open <code>Code.gs</code> from the project folder and paste it into <a href="https://script.google.com" target="_blank" style="color:var(--radio)">script.google.com</a><br>2. Deploy → Web app · Execute as: <em>Me</em> · Access: <em>Anyone with the link</em><br>3. Run <code>createAnnualTrigger()</code> once from the editor<br>4. Paste the web app URL into <code>data.js</code> → <code>SYNC_SCRIPT_URL</code></div>`}`
      )}

      ${dbSec('bcast_sync',
        `<h2>🎥 Homestead Live — Broadcast Calendar Sync</h2>`,
        `<button class="btn-secondary" id="bcast-sync-btn" style="font-size:0.8rem">↻ Sync New Broadcasts from Calendar</button>`,
        `<p style="font-size:0.875rem;color:var(--dim);margin:0">Pulls in anything added to the <strong>Homestead Live Event Calendar</strong> (thepoint91fm@gmail.com) as a new broadcast to crew. Add a game there whenever it's scheduled, then click this to bring it into Homestead Live. Games already added — hardcoded or previously synced — are skipped automatically.</p>`
      )}

      ${dbSec('yb_events',
        `<h2>📖 Yearbook Event Manager</h2>`,
        `<div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn-primary" id="yb-add-event-btn" style="font-size:0.8rem">+ Add Event</button>
          <button class="btn-secondary" id="yb-refresh-cal-btn" style="font-size:0.8rem">↻ Refresh Calendar Events</button>
        </div>`,
        `<div id="yb-event-form" style="display:none;padding:14px 0 18px;border-bottom:1px solid var(--border);margin-bottom:16px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
            <div class="form-group" style="margin:0"><label>Title</label><input id="yb-new-title" type="text" placeholder="e.g. Homecoming Dance"></div>
            <div class="form-group" style="margin:0"><label>Date</label><input id="yb-new-date" type="date"></div>
            <div class="form-group" style="margin:0"><label>Time <span class="hint">(optional)</span></label><input id="yb-new-time" type="text" placeholder="7:00 PM"></div>
            <div class="form-group" style="margin:0"><label>Type</label><select id="yb-new-type">${Object.entries(EVENT_TYPES).map(([k, v]) => `<option value="${k}">${YB_ICONS[k] || '📅'} ${v.label}</option>`).join('')}</select></div>
          </div>
          <button class="btn-primary" id="yb-save-event-btn">Save &amp; Add to Calendar</button>
          <button class="btn-secondary" id="yb-cancel-event-btn" style="margin-left:8px">Cancel</button>
        </div>
        ${(() => {
          const custom = S.customYbEvents || [];
          if (!custom.length) return `<p class="dim" style="font-size:0.875rem">No custom events added yet. Sports home games are managed in Homestead Live.</p>`;
          return custom.slice().sort((a,b) => a.date.localeCompare(b.date)).map(ev => `
            <div class="yb-db-event">
              <div class="yb-db-event-title">${YB_ICONS[ev.type] || '📅'} ${esc(ev.title)}<span class="dim" style="font-weight:400;font-size:0.8rem;margin-left:6px">${fmtDate(ev.date, false)}${ev.time ? ' · ' + esc(ev.time) : ''}</span><span style="background:var(--surface2);color:var(--dim);font-size:0.72rem;padding:2px 7px;border-radius:10px;margin-left:6px">${EVENT_TYPES[ev.type]?.label || ev.type}</span>${ev.calEventId ? '<span style="font-size:0.72rem;color:var(--success);margin-left:4px">✓ calendar</span>' : ''}</div>
              <div style="margin-top:6px"><button class="btn-danger db-btn yb-delete-event-btn" data-yb-event-id="${esc(ev.id)}" style="font-size:0.75rem">Delete</button></div>
            </div>`).join('');
        })()}`
      )}

      ${dbSec('yb_signups',
        `<h2>📖 Yearbook Coverage Sign-Ups</h2>`,
        `<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <button class="btn-secondary${S.ybDashView==='event'?' yb-view-active':''}" data-yb-view="event" style="font-size:0.75rem">By Event</button>
          <button class="btn-secondary${S.ybDashView==='student'?' yb-view-active':''}" data-yb-view="student" style="font-size:0.75rem">By Student</button>
          <button class="btn-secondary${S.ybDashView==='role'?' yb-view-active':''}" data-yb-view="role" style="font-size:0.75rem">By Role</button>
          <button class="btn-secondary" id="yb-dash-refresh" style="font-size:0.75rem">↻ Refresh</button>
        </div>`,
        `${(() => {
          const coverage = S.yearbookCoverage || [];
          if (!coverage.length) return `<p class="dim" style="padding:16px 0;font-size:0.875rem">No sign-ups yet.</p>`;
          const badge = n => `<span style="background:var(--surface2);color:var(--dim);font-size:0.72rem;padding:2px 7px;border-radius:10px;margin-left:6px">${n}</span>`;

          if (S.ybDashView === 'student') {
            const byStudent = {};
            coverage.forEach(s => {
              const key = s.studentName.toLowerCase();
              if (!byStudent[key]) byStudent[key] = { name: s.studentName, events: [] };
              byStudent[key].events.push(s);
            });
            return Object.values(byStudent)
              .sort((a,b) => b.events.length - a.events.length || a.name.localeCompare(b.name))
              .map(st => `
                <div class="yb-db-event">
                  <div class="yb-db-event-title">
                    ${esc(st.name)}
                    ${badge(st.events.length + ' event' + (st.events.length !== 1 ? 's' : ''))}
                  </div>
                  <div class="yb-db-signups">
                    ${st.events.slice().sort((a,b) => a.eventDate.localeCompare(b.eventDate)).map(ev => `
                      <div class="yb-db-row">
                        <span class="yb-db-name" style="font-weight:400">${esc(ev.eventTitle)}</span>
                        <span class="dim" style="font-size:0.75rem">${fmtDate(ev.eventDate, false)}</span>
                        <span class="yb-my-role yb-role-${ev.role}">${roleLabel(ev.role)}</span>
                      </div>`).join('')}
                  </div>
                </div>`).join('');
          }

          if (S.ybDashView === 'role') {
            const groups = { photographer: [] };
            coverage.forEach(s => { if (groups[s.role]) groups[s.role].push(s); });
            const labels = { photographer: '📷 Photographers' };
            return Object.entries(groups).filter(([,arr]) => arr.length).map(([role, entries]) => `
              <div class="yb-db-event">
                <div class="yb-db-event-title">
                  ${labels[role]}
                  ${badge(entries.length)}
                </div>
                <div class="yb-db-signups">
                  ${entries.slice().sort((a,b) => a.eventDate.localeCompare(b.eventDate)).map(e => `
                    <div class="yb-db-row">
                      <span class="yb-db-name">${esc(e.studentName)}</span>
                      <span class="dim" style="font-weight:400;font-size:0.8rem;flex:1">${esc(e.eventTitle)}</span>
                      <span class="dim" style="font-size:0.75rem">${fmtDate(e.eventDate, false)}</span>
                    </div>`).join('')}
                </div>
              </div>`).join('');
          }

          // Default: By Event
          const byEvent = {};
          coverage.forEach(s => {
            if (!byEvent[s.eventId]) byEvent[s.eventId] = { title: s.eventTitle, date: s.eventDate, signups: [] };
            byEvent[s.eventId].signups.push(s);
          });
          return Object.values(byEvent).sort((a,b) => a.date.localeCompare(b.date)).map(ev => `
            <div class="yb-db-event">
              <div class="yb-db-event-title">
                ${esc(ev.title)}
                <span class="dim" style="font-weight:400;font-size:0.8rem;margin-left:4px">${fmtDate(ev.date, false)}</span>
                ${badge(ev.signups.length)}
              </div>
              <div class="yb-db-signups">
                ${ev.signups.map(s => `
                  <div class="yb-db-row">
                    <span class="yb-db-name">${esc(s.studentName)}</span>
                    <span class="yb-my-role yb-role-${s.role}">${roleLabel(s.role)}</span>
                  </div>`).join('')}
              </div>
            </div>`).join('');
        })()}`
      )}

      ${dbSec('equipment',
        `<h2>📦 Equipment Check-In/Out</h2>`,
        S.equipmentLive ? '' : `<button class="btn-primary" id="equip-go-live-btn" style="font-size:0.8rem">🚀 Go Live</button>`,
        `${S.equipmentLive
            ? `<p style="font-size:0.85rem;color:var(--dim);margin:0 0 14px">🟢 Live — visible on every class page.</p>`
            : `<p style="font-size:0.85rem;color:var(--dim);margin:0 0 14px">🧪 Test mode — try scanning below. Students won't see this on their class pages until you click Go Live.</p>`}
        ${renderEquipmentWidget()}
        <h3 style="margin:22px 0 8px;font-size:0.95rem">All Registered Items</h3>
        <p style="font-size:0.8rem;color:var(--dim);margin:0 0 10px">Shows the exact barcode behind each item — use this to spot a mis-scanned or duplicate barcode and delete it.</p>
        <div id="equipment-admin-list">${renderEquipmentAdminList()}</div>`
      )}
    </div>`;
}

async function dashboardLoadPlans() {
  const db = getDB();
  if (!db) return;
  try {
    const snap = await db.collection('hm_radio_plans').get();
    const subs = [];
    snap.forEach(doc => subs.push({ id: doc.id, ...doc.data() }));
    S.submissions = subs;
    render();
  } catch(e) { showToast('Could not load plans.'); }
}

// ── IASB Register Modal ───────────────────────────────────────
function showRegisterIASBModal(cat) {
  const m = modal(`
    <h2>Register Entry — ${cat.code} ${cat.name}</h2>
    <div class="form-group">
      <label>First and Last Name <span style="color:var(--danger)">*</span></label>
      <input id="iasb-student-name" type="text" placeholder="First and last name">
    </div>
    ${!cat.solo ? `
    <div class="form-group">
      <label>Partner Name(s) <span class="hint">(optional — comma separated)</span></label>
      <input id="iasb-partner-names" type="text" placeholder="Other DJs or collaborators">
    </div>` : ''}
    <div class="form-group">
      <label>Entry Title <span style="color:var(--danger)">*</span></label>
      <input id="iasb-entry-title" type="text" placeholder="What is this entry called?">
    </div>
    <div class="form-group">
      <label>Notes <span class="hint">(optional)</span></label>
      <textarea id="iasb-entry-notes" rows="2" placeholder="Anything to note about this entry"></textarea>
    </div>`);

  m.querySelector('#modal-save').addEventListener('click', () => {
    const name  = shortenName(val('iasb-student-name'));
    const title = val('iasb-entry-title');
    if (!name || !title) { showToast('Please enter your name and an entry title.'); return; }
    const partnerNames = val('iasb-partner-names')
      .split(',').map(n => shortenName(n.trim())).filter(Boolean).join(', ');
    const data = {
      code: cat.code,
      season: IASB_SEASON,
      studentName: name,
      partnerNames,
      entryTitle: title,
      notes: val('iasb-entry-notes'),
      checklist: {},
      submittedToPortal: false,
    };
    m.remove();
    saveIASBEntry(data);
  });
}
