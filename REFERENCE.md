# Homestead Media — Full Site Reference

Last updated: July 2026  
Live site: https://wcyt.org/media/ (formerly dunnand.github.io/homestead_media)  
Local folder: C:\Users\Andy\homestead_media\

---

## 1. What This Site Is

A single-page web app (SPA) for the Homestead High School media program. Students and the teacher use it to manage:
- Radio broadcasting schedules (The Point 91FM, 2.0)
- Homestead Live TV show crew assignments and sign-ups
- HHS In-Depth TV show 5-week rundown planning
- Yearbook event coverage sign-ups
- IASB competition entry tracking
- Talk show planning wizard
- Lessons/training content

**Tech stack:** Vanilla JS + HTML + CSS, Firebase Firestore, GitHub Pages hosting.  
No build step — edit files, commit, push, and the site updates within ~2 minutes.

---

## 2. File Structure

| File | Purpose |
|------|---------|
| `index.html` | HTML shell — loads Firebase, data.js, script.js, styles.css |
| `script.js` | All app logic (~3,600 lines) — renders every page, handles all events |
| `data.js` | All constants and configuration — edit this for yearly updates |
| `styles.css` | All styling — dark theme, cards, tables, modals |
| `Code.gs` | Google Apps Script — keep a copy here; paste into script.google.com |
| `scripts/send-reminders.js` | Node.js email reminder script (not part of the main site) |
| `REFERENCE.md` | This file |

---

## 3. How to Deploy Changes

1. Edit files locally in `C:\Users\Andy\homestead_media\`
2. Open Git Bash or terminal in that folder:
   ```
   git add .
   git commit -m "describe what you changed"
   git push
   ```
3. Wait ~2 minutes, then hard refresh the live site (Ctrl+Shift+R)

GitHub repo: https://github.com/dunnand/media (renamed from homestead_media July 2026; served at wcyt.org/media because the account's user site dunnand.github.io carries the wcyt.org custom domain)

---

## 4. Firebase (Database)

**Project:** `audioaficionados-21ba0`  
**Console:** https://console.firebase.google.com/project/audioaficionados-21ba0/firestore

Firebase config lives in `index.html`. The app uses the **Compat SDK** (v8/compat style).  
`getDB()` in script.js returns the Firestore instance (lazy-loaded singleton).

### Firestore Collections

| Collection | What It Stores |
|------------|---------------|
| `hm_broadcasts` | All Homestead Live events (football, basketball, etc.) with crew roles and checklists |
| `hm_availability` | Student sign-ups for broadcasts (name, email, role preferences) |
| `hm_radio` | Radio station schedules (doc: `station_schedule`) |
| `hm_iasb_entries` | IASB competition entries per category |
| `hm_radio_plans` | Talk show planning submissions from students |
| `hm_indepth_rundown` | TV show rundown data, keyed by week (YYYY-MM-DD of Monday) |
| `hm_lesson_edits` | Teacher text overrides for built-in lessons, doc id = lesson id: `{title?, summary?, duration?, sections: {"<index>": partial}}` — merged over data.js LESSONS by `mergedLesson()`; edited via the ✏️ Edit Slide button in teacher mode; per-slide "Reset to original" removes the override |
| `hm_rundown_edits` | Edit log for the In-Depth show rundown: `{at, week, role, by, before, after}` — everyone can edit the rundown; teacher mode shows the last 40 edits via the 📝 Edit Log button. Student names come from `localStorage.hm_student_name` (prompted on first edit) |
| `hm_indepth_beats` | Beat assignments (doc ID = beat number, fields: student1, student2, met — map of advisor-name keys the pair has checked off as met) |
| `hm_beat_info` | Beat overrides (doc ID = beat number, fields: name, covers, contacts) — set by teacher Edit Beat; students can also add/edit contacts inline (merge write on contacts only) |
| `hm_yearbook_coverage` | Yearbook event sign-ups (student, event, role) |
| `hm_yearbook_events` | Custom events added by teacher via dashboard |
| `hm_config` | App config: `show_schedule` (skipped Fridays), `cal_cache` (calendar event cache) |
| `hm_icebreaker` | Live "Two Truths and a Lie" wall (🧊 Icebreaker nav link, one of two game tabs there): `{name, statements: [3 shuffled strings], createdAt}` — no field marks which statement is the lie; that's revealed face-to-face. Real-time via `onSnapshot`. Teacher's "Clear Wall" button deletes all docs between class periods |
| `hm_qa_state` | Single doc `current`: `{index, updatedAt}` — which of the hardcoded `QA_QUESTIONS` (script.js) is live for the "Get to Know You" icebreaker game. Teacher's Prev/Next buttons write this; students' and the board's onSnapshot listeners react live |
| `hm_qa_answers` | Answers for "Get to Know You": `{name, answer, questionIndex, createdAt}`. Wall/board query filters `where('questionIndex', '==', current index)`. Teacher's "Clear All Answers" wipes every question's answers between class periods |
| `hm_tot_state` | Single doc `current`: `{index, updatedAt}` — which of the hardcoded `THIS_OR_THAT_QUESTIONS` (script.js) is live for the "This or That" icebreaker game. Same Prev/Next pattern as `hm_qa_state` |
| `hm_tot_votes` | Votes for "This or That": doc ID is `{questionIndex}_{slugified name}` (via `.set()`, not `.add()`) so re-voting overwrites instead of double-counting: `{name, choice: 'a'|'b', questionIndex, createdAt}`. Live bar-chart tallies via `onSnapshot` filtered by questionIndex |
| `hm_bingo_winners` | "Human Bingo" (get-up-and-learn-names game): `{name, createdAt}`, one doc per student who completes a row/column/diagonal on their personal card. The 5x5 card (free center space, 24 prompt squares randomly drawn per device from a 40-prompt pool in `BINGO_PROMPTS`) lives only in each student's `localStorage` — never synced; only the winners list is shared live via `onSnapshot` |
| `hm_wyr_state` | Single doc `current`: `{index, updatedAt}` — which of the hardcoded `WYR_QUESTIONS` (script.js) is live for the "Would You Rather" icebreaker game. Same Prev/Next pattern as `hm_qa_state` |
| `hm_wyr_votes` | Votes for "Would You Rather": doc ID is `{questionIndex}_{slugified name}` (via `.set()`) so re-voting overwrites: `{name, choice: 'a'|'b', questionIndex, createdAt}`. Live bar-chart tallies via `onSnapshot` filtered by questionIndex |
| `hm_speed_state` | Single doc `current`: `{index, timerStartedAt, updatedAt}` for "Speed Meet" — `index` picks the live prompt from the hardcoded `SPEED_QUESTIONS` (script.js); `timerStartedAt` is a shared timestamp every device counts down from locally (no per-tick writes). Teacher's "New Question" and "Start Timer" buttons write this doc; no student input is captured |
| `hm_common_state` | Single doc `current`: `{index, updatedAt}` — which of the hardcoded `COMMON_GROUND_CATEGORIES` (script.js) is live for the "Common Ground" icebreaker game. Same Prev/Next pattern as `hm_qa_state` |
| `hm_common_answers` | Answers for "Common Ground": doc ID is `{categoryIndex}_{slugified name}` (via `.set()`): `{name, option, categoryIndex, createdAt}`. Students are grouped live by chosen option so they can find their group in person |
| `hm_story_state` | Single doc `current`: `{index, updatedAt}` — which of the hardcoded `STORY_PROMPTS` (script.js) is live for the "Story Chain" icebreaker game. Same Prev/Next pattern as `hm_qa_state` |
| `hm_story_answers` | Answers for "Story Chain": `{name, answer, promptIndex, createdAt}` (via `.add()`, mirrors `hm_qa_answers`). Wall/board query filters by promptIndex; teacher's "Clear" wipes all entries |
| `hm_rank_state` | Single doc `current`: `{index, updatedAt}` — which round of the hardcoded `RANK_ROUNDS` (script.js) is live for the "Rank It" icebreaker game. Same Prev/Next pattern as `hm_qa_state` |
| `hm_rank_answers` | Rankings for "Rank It": doc ID is `{roundIndex}_{slugified name}` (via `.set()`): `{name, ranking: [itemIndex,...], roundIndex, createdAt}` — `ranking` is the student's tap order, most-preferred first. Results tally points (`n - position`) per item across all submitted rankings and render as a live bar chart |

---

## 5. Key Constants in data.js (Update Each Year)

### Sports / Game Schedules

```javascript
// Update each August with the new season schedule
const BASKETBALL_HOME_GAMES = [ ... ]       // Boys BB home games
const GIRLS_BASKETBALL_HOME_GAMES = [ ... ] // Girls BB home games
const FOOTBALL_HOME_GAMES = [ ... ]         // Football home games
const SPECIAL_EVENTS = [ ... ]              // Homecoming Dance, Prom, Show Choir, NHS, Graduation
```

**Entry format:**
```javascript
{ id: 'bb26-1121', title: 'Boys Basketball vs. Blackford', date: '2026-11-21',
  type: 'basketball_boys', gameTime: '7:30 PM', roles: {}, checks: {}, notes: 'Spartan Arena' }
```
- `id` must be unique — use format `typeYY-MMDD`
- `type` must match a key in `EVENT_TYPES` (football, basketball_boys, basketball_girls, etc.)
- `roles: {}` and `checks: {}` always start empty — Firestore fills them in at runtime

### IASB Settings

```javascript
const IASB_SEASON   = '2026-2027'     // Update each year
const IASB_DEADLINE = '2027-02-05'    // Update when IASB announces the date
const TEACHER_PIN   = '2027'          // Change to whatever you want
```

### Google Calendar & Apps Script

```javascript
const SYNC_SCRIPT_URL    = 'https://script.google.com/macros/s/AKfycbwH9agFB6OR5nPBGKWB7h0_xRq8HR-kdHcd5lo2xZSX5s36qcoWbjZ3UVrr0i-xnzpC/exec'
const HHS_MEDIA_CAL_ID   = '2b9bdfdee65f7330d8d5d2fd1d4877c1b709289fa0b0747427f57fd62516bed5@group.calendar.google.com'
const GOOGLE_CAL_API_KEY  = 'AIzaSyCy5ZKtIjrF1lgDojmYgDlxit2Te7SKyeU'
```

- `SYNC_SCRIPT_URL` — Apps Script web app URL. Used to add/delete custom yearbook events on the Google Calendar. If this breaks, see Section 9 for how to re-deploy.
- `HHS_MEDIA_CAL_ID` — The HHS Media Events Google Calendar. Embedded as iframe in Yearbook and In-Depth pages.
- `GOOGLE_CAL_API_KEY` — Google Cloud API key for reading the public calendar. Restricted to `dunnand.github.io` and Calendar API only. Created in Google Cloud Console.

### Other External Links

```javascript
const IASB_DROPBOX_URL = 'https://drive.google.com/drive/folders/1Kg4UYcKzOLNYYqoEOG3fo2xbwNQtZCIY'
// 36 IASB_DRIVE_FOLDERS entries (R1-R9, N1-N8, S1-S9, V1-V9, M1-M9)
// DJ Panel: https://wcyt.org/dj  (Password: Spartans — changed July 2026)
// Walsworth: https://login.walsworthyearbooks.com/login
```

---

## 6. Pages / Views

The app has one HTML file. Navigation is via `go('viewname')` which sets `S.view` and re-renders.

| View | What It Shows |
|------|---------------|
| `home` | 5 class cards (Radio, Live, Sports, Yearbook, In-Depth) |
| `radio` | Station schedules, DJ panel link, Talk Show Planner, IASB hub link |
| `planner` | 6-step talk show planning form |
| `live` | Next broadcast countdown, crew roles, mini calendar sidebar |
| `broadcast` | Single broadcast: crew assignments, student sign-ups, checklist, notes |
| `schedule` | All broadcasts in date order |
| `availability` | Students sign up for broadcasts + choose role preferences |
| `sports` | Coming soon placeholder |
| `yearbook` | Event coverage sign-ups, calendar embed, shot list tips |
| `indepth` | 5-week TV rundown table + calendar |
| `beats` | 15 In-Depth coverage beats with student assignments |
| `iasb` | IASB competition hub with all 45 categories |
| `iasb-category` | Single IASB category: requirements, entries, checklist, drive link |
| `dashboard` | Teacher-only overview (PIN required) |
| `lessons` | Lesson hub → course → unit → lesson slides |

---

## 7. State Object (S)

All app state lives in one object in script.js. Resets on page reload — Firestore reloads data on `init()`.

```javascript
const S = {
  view: 'home',
  broadcastId: null,          // Which broadcast detail page is open
  teacherMode: false,         // Unlocked with PIN
  stationSchedule: {},        // { point: [...], two: [...] } from Firestore
  broadcasts: [],             // All Homestead Live events
  plannerStep: 0,             // Talk show planner progress (0-5)
  plannerData: null,          // Current planner form values
  submissions: [],            // Talk show plan submissions
  iasbEntries: [],            // All IASB entries from Firestore
  iasbCategory: null,         // Currently viewed IASB category code (e.g. 'R1')
  availabilities: [],         // Broadcast sign-ups
  lessonCourse: null,         // 'radio', 'indepth', etc.
  lessonUnit: null,
  lessonId: null,
  lessonSlide: 0,
  yearbookCoverage: [],       // Sign-ups from hm_yearbook_coverage
  customYbEvents: [],         // Teacher-added events from hm_yearbook_events
  calendarYbEvents: [],       // Events fetched via Google Calendar API
  ybDashView: 'event',        // Dashboard yearbook tab: 'event' | 'student' | 'role'
  expandedBeat: null,         // Which beat row is open
  beatAssignments: {},        // { beatId: { student1, student2 } }
  rundownData: {},            // { weekKey: { roleKey: value } }
  rundownWeekOffset: 0,       // Week nav: 0 = current, -1 = prev week, +1 = next
  showSchedule: [],           // Skipped Friday dates (YYYY-MM-DD[])
  calMonthOffset: 0,          // Homestead Live calendar month offset
  dashSections: {},           // { sectionId: true/false } — which sections are open
};
```

---

## 8. In-Depth Rundown

### Rundown Roles

```javascript
const RUNDOWN_ROLES = [
  { key: 'anchors',    label: 'Anchors',      pair: true,                         color: '#6366f1' },
  { key: 'packages',   label: 'Packages',     structured: true,                   color: '#f59e0b' },
  { key: 'vo_vosot',   label: 'VOs / VOSOTs', structured: true, typeToggle: true, color: '#a78bfa' },
  { key: 'commercial', label: 'Commercial',                                        color: '#f97316' },
  { key: 'psa',        label: 'PSA',                                               color: '#84cc16' },
  { key: 'weather',    label: 'Weather',                                           color: '#06b6d4' },
  { key: 'sports_btc', label: 'Sports / BTC',                                     color: '#22c55e' },
];
```

- `pair: true` → 2 name fields (Anchor 1 / Anchor 2)
- `structured: true` → rows of `{ type, topic, student }` with + Add button
- `typeToggle: true` → each row also has VO / VOSOT badge toggle
- Plain (no flags) → single text area

### How Week Keys Work
- Week key = Monday's date in YYYY-MM-DD
- Stored in `hm_indepth_rundown/{weekKey}/{roleKey}`
- Friday date is displayed in column headers but Monday is the Firestore key
- `getRundownWeeks()` returns 5 Mondays starting from current + offset

---

## 9. Google Apps Script (Code.gs)

### What It Does
- Copies varsity athletics events from the HHS source calendar to the HHS Media Events calendar
- Adds custom events to the calendar when teacher uses the Yearbook Event Manager
- Runs auto-sync every July 1

### How to Re-deploy (if the URL breaks)

1. Go to https://script.google.com
2. Create a new project (or open existing)
3. Paste the full contents of `Code.gs` (replace everything)
4. Click **Deploy → New deployment**
   - Type: Web app
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy** — authorize when prompted (run `getUpcomingEvents` from editor first if needed)
6. Copy the new web app URL
7. Paste into `data.js` as `SYNC_SCRIPT_URL`
8. Run `createAnnualTrigger()` once from the editor (sets up auto-sync each July)
9. Commit and push data.js

### Important Deployment Settings
- **Execute as: Me** (not "User accessing the web app" — that forces login)
- **Who has access: Anyone** (not "Anyone with Google account" — that also forces login)

### Calendar IDs in Code.gs
```javascript
SOURCE_CAL_ID = 'fd9gn9o6bq5lfvsaiqkt4gs4n1gneqc6@import.calendar.google.com'
TARGET_CAL_ID = '2b9bdfdee65f7330d8d5d2fd1d4877c1b709289fa0b0747427f57fd62516bed5@group.calendar.google.com'
```

### Actions (called via JSONP from browser)
- `?action=sync` — Sync varsity events from source → target calendar
- `?action=addEvent&title=X&date=YYYY-MM-DD&time=X` — Add event to calendar
- `?action=deleteEvent&calEventId=X` — Delete event from calendar

> Note: Reading calendar events does NOT go through Apps Script anymore.  
> The site uses the Google Calendar API directly (see below).

---

## 10. Google Calendar API Key

**Key:** `AIzaSyCy5ZKtIjrF1lgDojmYgDlxit2Te7SKyeU` (named "API key 2" in Cloud Console, created Jul 1 2026)  
**Restrictions:** Websites → `https://dunnand.github.io/*` and `https://wcyt.org/*` | API → Google Calendar API only  
**Google account:** `thepoint91fm@gmail.com` — **not** the account used for the "Singular" or "audioaficionados-21ba0" projects. Easy to lose track of; check the account switcher (top-right avatar) in Cloud Console if the key can't be found.  
**Cloud project:** "My Project 67913" (default/unnamed auto-created project) at https://console.cloud.google.com, under the `thepoint91fm@gmail.com` account.

> **Incident (Jul 31 2026):** After the site moved from `dunnand.github.io` to `wcyt.org`, the key's website restrictions were never updated to include `https://wcyt.org/*`, so every Calendar API fetch from the live site returned `403 API_KEY_HTTP_REFERRER_BLOCKED`. The error was swallowed by a `try/catch` in `loadCalendarYbEvents()`, so `S.calendarYbEvents` silently stayed empty and the Yearbook sign-up dropdown only ever showed the hardcoded types (football, basketball boys/girls, dance, NHS, showchoir, graduation) instead of the ~300 events actually on the calendar (soccer, volleyball, golf, tennis, cross country, wrestling, swimming, gymnastics, baseball, softball, track, etc.). Fixed by adding `https://wcyt.org/*` to the key's website restrictions. If a similar "dropdown is missing types" report comes in again after a future domain/hosting change, check this key's referrer restrictions first.

Note: there's also an old, unrestricted "API key 1" (created Mar 21 2023) in the same `thepoint91fm@gmail.com` / "My Project 67913" project — unrelated to this site, left alone.

### If the Key Needs to Be Replaced
1. Go to https://console.cloud.google.com → sign in as `thepoint91fm@gmail.com` → select "My Project 67913"
2. APIs & Services → Credentials → + Create Credentials → API key
3. Restrict to: Websites → `https://dunnand.github.io/*` and `https://wcyt.org/*`; API → Google Calendar API
4. Paste new key into `data.js` → `GOOGLE_CAL_API_KEY`
5. Commit and push

### Two Separate Calendars — Don't Mix Them Up
| | HHS Media Events | Homestead Live Event Calendar |
|---|---|---|
| Calendar ID | `HHS_MEDIA_CAL_ID` (`2b9bdfdee6...@group.calendar.google.com`) | `HOMESTEAD_LIVE_CAL_ID` (`thepoint91fm@gmail.com`) |
| Owner | shared HHS Media Google account | `thepoint91fm@gmail.com` (also owns the API key) |
| Contains | **Everything** happening at school — auto-synced from the official athletics calendar (all varsity sports) plus dances, NHS, graduation, etc. | Only games the teacher has manually put on it — i.e. only what Homestead Live will actually broadcast |
| Feeds | Yearbook sign-up dropdown (`allYbEvents()` / `loadCalendarYbEvents()`) | Homestead Live broadcasts (`syncBroadcastsFromCalendar()` / `loadCalendarBroadcastEvents()`) |
| Filtering | Home games only by default (away games hidden unless toggled) | **None** — anything added to this calendar is treated as broadcast-worthy and synced as-is |

> **Incident (Jul 31 2026):** The first version of the broadcast sync accidentally read from HHS Media Events (the all-sports calendar), which flooded Homestead Live with 71 broadcasts for sports it doesn't crew (golf, tennis, wrestling, swimming, track, etc.). All 71 were deleted via the Firestore REST API and the sync was repointed at `HOMESTEAD_LIVE_CAL_ID`. **Lesson: new events for Homestead Live to broadcast must be added to the `thepoint91fm@gmail.com` calendar, not HHS Media Events — that one is Yearbook's source only.**

### How Calendar Events Get Into the Yearbook Sign-Up Dropdown
1. `loadCalendarYbEvents()` runs on page load, reads `HHS_MEDIA_CAL_ID`
2. Checks Firestore `hm_config/cal_cache` — if fresh (< 6 hours), uses that
3. Otherwise calls Google Calendar API with the key above
4. Maps event titles to types using `inferYbType()` (e.g., "volleyball" → `volleyball`)
5. Saves results to Firestore cache
6. Teacher can force refresh: Dashboard → Yearbook Event Manager → ↻ Refresh Calendar Events

### How Calendar Events Get Into Homestead Live Broadcasts
1. Teacher adds a game to the **Homestead Live Event Calendar** (`thepoint91fm@gmail.com`) whenever it's scheduled — any title, any sport, no restrictions
2. Dashboard → 🎥 Homestead Live — Broadcast Calendar Sync → ↻ Sync New Broadcasts from Calendar
3. This clears the `hm_config/bcast_cal_cache` cache, re-fetches `HOMESTEAD_LIVE_CAL_ID` via `loadCalendarBroadcastEvents()`, and calls `syncBroadcastsFromCalendar()`
4. Every event on that calendar not already in `hm_broadcasts` (matched by ID or by `type|date`) gets added — no sport-type or home/away filtering, since the teacher already curated the calendar to only contain broadcast-worthy games
5. Works every year automatically — no code changes needed, just keep adding games to that calendar and clicking sync

**Volleyball JV/varsity time offset:** The calendar lists the JV start time, but Homestead Live broadcasts varsity, which goes on ~1hr after JV ends. `loadCalendarBroadcastEvents()` (script.js) shifts the stored time +60min for any event where `inferYbType()` returns `'volleyball'`, using `computeTimeOffset(timeStr, -60)` (negative offset = add time). This happens once at fetch time, so the corrected time flows through everywhere downstream — `gameTime` written to Firestore, `computeArrival()`/`computeDoor33()` call/door times, and `scripts/send-reminders.js` email reminders — with no per-display fixes needed. Added Jul 31 2026.

---

## 11. Yearbook Sign-Up

### Event Sources (combined in `allYbEvents()`)
1. **Hardcoded** in `data.js` — football, basketball, girls BB, special events
2. **Teacher-added** via Dashboard → Yearbook Event Manager → + Add Event → `hm_yearbook_events`
3. **Google Calendar** — fetched via API, cached in `hm_config/cal_cache`

### Student Sign-Up Flow
1. Enter name + email (saved to localStorage for next visit)
2. Select Sport/Event Type from dropdown (only types with upcoming events appear)
3. Select specific event from second dropdown
4. Click Submit → saved to `hm_yearbook_coverage`

### Teacher Dashboard — Yearbook Event Manager
- **+ Add Event** → form with title, date, time, type → saves to Firestore + calendar
- **↻ Refresh Calendar Events** → clears cache, re-fetches all sports from Google Calendar
- **Coverage Sign-Ups** → view by Event, Student, or Role

---

## 12. Broadcast Timing Logic

| Sport | Arrival Location | Arrive Before Game | Door 33 Opens |
|-------|-----------------|-------------------|---------------|
| Basketball (boys/girls) | Media Row | 45 min | 75 min before tip |
| Football | Press Box | 60 min | 90 min before kickoff |
| All others | Crew Call | 60 min | 90 min before |

Functions: `computeArrival(gameTime, type)` and `computeDoor33(gameTime, type)` in script.js.

---

## 13. Teacher Dashboard Sections

Access: click 🔑 in nav → enter PIN (default: `2027`)

| Section | Firestore key | What It Does |
|---------|--------------|--------------|
| In-Depth Show Schedule | `hm_config/show_schedule` | Toggle Fridays as show/no-show for the year |
| IASB Entries | `hm_iasb_entries` | View/manage all competition entries by category |
| Talk Show Plans | `hm_radio_plans` | View all student talk show plan submissions |
| Athletics Calendar Sync | (runs Code.gs) | Manually trigger athletics calendar sync |
| Yearbook Event Manager | `hm_yearbook_events` | Add/delete custom events + refresh calendar cache |
| Yearbook Coverage Sign-Ups | `hm_yearbook_coverage` | View all sign-ups by event / student / role |

- Firebase Usage is **always visible** (not collapsible) — shows daily read/write counts
- All other sections start collapsed — click header to expand/collapse

---

## 14. IASB Competition

**45 categories** across 5 divisions: Radio (R1-R9), News (N1-N8), Sports (S1-S9), Video (V1-V9), Emerging Media (M1-M9)

Key settings to update each year:
```javascript
const IASB_SEASON   = '2027-2028'     // Update in data.js
const IASB_DEADLINE = '2028-02-05'    // Update in data.js
```

Drive submission folders are in `IASB_DRIVE_FOLDERS` in data.js (36 Google Drive links).  
Main dropbox: https://drive.google.com/drive/folders/1Kg4UYcKzOLNYYqoEOG3fo2xbwNQtZCIY

---

## 15. Annual Start-of-Year Checklist

Do this each August before school starts:

- [ ] Update `BASKETBALL_HOME_GAMES` in data.js with new boys BB schedule
- [ ] Update `GIRLS_BASKETBALL_HOME_GAMES` in data.js with new girls BB schedule
- [ ] Update `FOOTBALL_HOME_GAMES` in data.js with new football schedule
- [ ] Update `SPECIAL_EVENTS` — confirm Homecoming Dance, Prom, Show Choir, NHS, Graduation dates
- [ ] Update `IASB_SEASON` and `IASB_DEADLINE`
- [ ] Change `TEACHER_PIN` if desired
- [ ] Commit and push all data.js changes
- [ ] In teacher dashboard → Athletics Calendar Sync → run sync to pull all other sports
- [ ] In teacher dashboard → Yearbook Event Manager → ↻ Refresh Calendar Events
- [ ] Review show schedule (all Fridays) and mark any that won't have a broadcast

---

## 16. School Year Date Logic

The app calculates the current school year with:
```javascript
const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
```
- July (month 6) or later → current year is the START of the upcoming school year
- e.g., July 2026 → school year 2026-2027 (startYear = 2026)

Show schedule spans: first Friday on or after Aug 21 → last Friday on or before May 28.

---

## 17. Common Code Patterns

### Adding a new view/page
1. Add a render function: `function renderMyPage() { return \`...\`; }`
2. Add a case in `render()`: `case 'mypage': app.innerHTML = renderMyPage(); break;`
3. Add event handlers in `attachListeners()`
4. Add nav link or `go('mypage')` call somewhere

### Saving to Firestore
```javascript
const db = getDB();
trackUsage('writes');
await db.collection('hm_mycollection').doc(id).set({ field: value });
```

### Reading from Firestore
```javascript
const db = getDB();
const snap = await db.collection('hm_mycollection').get();
trackUsage('reads', snap.size);
snap.docs.forEach(doc => { /* doc.id, doc.data() */ });
```

### Creating a modal
```javascript
const m = modal(`<h2>Title</h2><div class="form-group"><label>X</label><input id="my-input"></div>`, 'Delete', true);
m.querySelector('#modal-save').addEventListener('click', async () => {
  const v = val('my-input');
  // ... save ...
  m.remove();
  render();
});
```

---

## 18. Known Notes & Quirks

- **No build step** — plain HTML/CSS/JS. Edit files and push.
- **Dark mode only** — CSS is written for dark theme; no light mode toggle.
- **No user authentication** — teacher access is PIN-only. Student names are self-reported.
- **Apps Script CORS** — The Apps Script URL cannot be called with `fetch()` from the browser (CORS block). The site uses JSONP for Apps Script calls (`fetchJsonp()` helper in script.js). Reading calendar events bypasses Apps Script entirely and uses the Google Calendar API directly.
- **GitHub Pages deploy time** — ~2 minutes after `git push`. Hard refresh (Ctrl+Shift+R) after waiting.
- **Rundown week keys** — Stored as Monday's date (YYYY-MM-DD), not Friday's. Friday date is only for display.
- **Firestore cal_cache TTL** — 6 hours. If calendar events look stale in the yearbook dropdown, teacher hits ↻ Refresh in dashboard.
- **YEARBOOK_EVENTS de-duplication** — `allYbEvents()` de-dupes calendar events against hardcoded + custom events using `type|date` as the key.
- **inferYbType()** — Maps calendar event titles to type keys by checking for keywords (e.g., title includes "volleyball" → `volleyball`). If a sport isn't being categorized correctly, add a rule in this function in script.js.
