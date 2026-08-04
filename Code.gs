// HHS Athletics Calendar Sync + Yearbook Event Manager — Google Apps Script
//
// SETUP (one-time):
// 1. Go to script.google.com → New project → paste this file
// 2. Deploy → New deployment → Web app
//    Execute as: Me | Who has access: Anyone with the link
// 3. Copy the web app URL into data.js → SYNC_SCRIPT_URL
// 4. Run createAnnualTrigger() once from the editor to set up auto-sync each August 1

const SOURCE_CAL_ID     = 'fd9gn9o6bq5lfvsaiqkt4gs4n1gneqc6@import.calendar.google.com';
const TARGET_CAL_ID     = '2b9bdfdee65f7330d8d5d2fd1d4877c1b709289fa0b0747427f57fd62516bed5@group.calendar.google.com';
const DROPBOX_FOLDER_ID = '0AKQDvIUms2qIUk9PVA';

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = (e.parameter && e.parameter.action) || 'sync';
  const cb = e.parameter && e.parameter.callback;
  function out(obj) {
    if (cb) return ContentService.createTextOutput(cb + '(' + JSON.stringify(obj) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
    return respond(obj);
  }
  try {
    if (action === 'sync')        return out(syncAthletics());
    if (action === 'getEvents')   return out(getUpcomingEvents());
    if (action === 'addEvent')    return out(addCalendarEvent(e.parameter));
    if (action === 'deleteEvent') return out(deleteCalendarEvent(e.parameter.calEventId));
    return out({ success: false, error: 'Unknown action: ' + action });
  } catch(err) {
    return out({ success: false, error: err.toString() });
  }
}

// ── Return upcoming events from HHS Media Events calendar ─────
function getUpcomingEvents() {
  const cal = CalendarApp.getCalendarById(TARGET_CAL_ID);
  if (!cal) return { success: false, error: 'Calendar not found.' };

  const now = new Date();
  // School year runs Aug–June. July+ is pre-season for the upcoming year.
  const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const end = new Date(startYear + 1, 7, 1); // through Aug 1 of school year end

  const events = cal.getEvents(now, end);
  return {
    success: true,
    events: events.map(ev => ({
      id: 'cal-' + ev.getId().replace(/[^a-z0-9]/gi, '').slice(0, 20),
      title: ev.getTitle(),
      date:  Utilities.formatDate(ev.getStartTime(), 'America/Indiana/Indianapolis', 'yyyy-MM-dd'),
      time:  Utilities.formatDate(ev.getStartTime(), 'America/Indiana/Indianapolis', 'h:mm a'),
    }))
  };
}

// ── Add a single event to the HHS Media Events calendar ──────
function addCalendarEvent(p) {
  const cal = CalendarApp.getCalendarById(TARGET_CAL_ID);
  if (!cal) return { success: false, error: 'Target calendar not found.' };

  const start = parseDateTime(p.date, p.time || '12:00 PM');
  const end   = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2-hour default
  const ev    = cal.createEvent(p.title, start, end);

  return { success: true, calEventId: ev.getId() };
}

// ── Delete an event from the HHS Media Events calendar ───────
function deleteCalendarEvent(calEventId) {
  if (!calEventId) return { success: false, error: 'No calEventId provided.' };
  const cal = CalendarApp.getCalendarById(TARGET_CAL_ID);
  if (!cal) return { success: false, error: 'Target calendar not found.' };
  try {
    const ev = cal.getEventById(calEventId);
    if (ev) ev.deleteEvent();
    return { success: true };
  } catch(err) {
    return { success: false, error: err.toString() };
  }
}

// ── Parse "7:30 PM" + "YYYY-MM-DD" into a Date ───────────────
function parseDateTime(dateStr, timeStr) {
  const d = new Date(dateStr + 'T12:00:00');
  if (!timeStr) return d;
  const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!m) return d;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  const ampm = m[3] ? m[3].toUpperCase() : null;
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  d.setHours(h, min, 0, 0);
  return d;
}

// ── Sync all varsity athletics events for the school year ─────
function syncAthletics() {
  const now = new Date();
  // School year starts in August
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  const start = new Date(startYear, 7, 1);     // Aug 1
  const end   = new Date(startYear + 1, 7, 1); // Aug 1 next year

  const sourceCal = CalendarApp.getCalendarById(SOURCE_CAL_ID);
  const targetCal = CalendarApp.getCalendarById(TARGET_CAL_ID);

  if (!sourceCal) return { success: false, error: 'Source calendar not found. Make sure it is shared with this Google account.' };
  if (!targetCal) return { success: false, error: 'Target (HHS Media Events) calendar not found.' };

  const allSource = sourceCal.getEvents(start, end);

  // Keep varsity-level events; drop JV-only, practices, Flag Football, Special Events
  const varsityRe = /\(V\)|\(Boys V\)|\(Girls V\)|Varsity|\(V & JV\)/;
  const excludeRe = /\(JV\)|JV Only|JV only|JV Invite|JV invite|JV invitational|Snider JV|Riley JV|West Noble.*JV|Canterbury.*JV for HHS|Penn.*JV Only|Practice|Flag Football|Special Events/i;

  const filtered = allSource.filter(ev => {
    const t = ev.getTitle();
    return varsityRe.test(t) && !excludeRe.test(t);
  });

  // Step 1: Deduplicate within the source itself (source calendar can have duplicate entries)
  const sourceKeys = new Set();
  const toAdd = filtered.filter(ev => {
    const key = ev.getTitle() + '|' + ev.getStartTime().getTime();
    if (sourceKeys.has(key)) return false;
    sourceKeys.add(key);
    return true;
  });

  // Step 2: Deduplicate against what's already in the target calendar
  const existing = targetCal.getEvents(start, end);
  const existingKeys = new Set(
    existing.map(ev => ev.getTitle() + '|' + ev.getStartTime().getTime())
  );

  let added = 0, skipped = 0;
  toAdd.forEach(ev => {
    const key = ev.getTitle() + '|' + ev.getStartTime().getTime();
    if (existingKeys.has(key)) { skipped++; return; }
    targetCal.createEvent(ev.getTitle(), ev.getStartTime(), ev.getEndTime());
    existingKeys.add(key); // prevent re-adding if script is called mid-run
    added++;
    Utilities.sleep(100); // avoid API quota bursts
  });

  const result = {
    success: true,
    schoolYear: startYear + '-' + (startYear + 1),
    scanned: allSource.length,
    varsity: toAdd.length,
    sourceDuplicatesDropped: filtered.length - toAdd.length,
    added,
    skipped
  };
  Logger.log(JSON.stringify(result));
  return result;
}

// ── Annual trigger setup — call once from the editor ─────────
function createAnnualTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'maybeSync')
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('maybeSync')
    .timeBased()
    .onMonthDay(1)
    .atHour(8)
    .create();

  Logger.log('Annual trigger set: runs on the 1st of each month at 8am, syncs only in July.');
}

// Wrapper called by the monthly trigger — only syncs in July
function maybeSync() {
  if (new Date().getMonth() === 6) {
    syncAthletics();
  }
}

// ── Create per-sport subfolders in the Photo Dropbox ─────────
// Run this once from the Apps Script editor (not via web app).
// After it runs, copy the logged output into data.js → YB_DROPBOX_FOLDERS.
function createDropboxFolders() {
  const SPORT_LABELS = {
    football:        'Football',
    basketball_boys: 'Boys Basketball',
    basketball_girls:'Girls Basketball',
    volleyball:      'Volleyball',
    soccer_boys:     'Boys Soccer',
    soccer_girls:    'Girls Soccer',
    cross_country:   'Cross Country',
    tennis_boys:     'Boys Tennis',
    tennis_girls:    'Girls Tennis',
    golf_boys:       'Boys Golf',
    golf_girls:      'Girls Golf',
    wrestling:       'Wrestling',
    swimming:        'Swimming',
    gymnastics:      'Gymnastics',
    track:           'Track & Field',
    baseball:        'Baseball',
    softball:        'Softball',
    dance:           'Dance',
    showchoir:       'Show Choir',
    nhs:             'NHS / Honor Society',
    graduation:      'Graduation'
  };

  const parent = DriveApp.getFolderById(DROPBOX_FOLDER_ID);

  const existing = {};
  const iter = parent.getFolders();
  while (iter.hasNext()) {
    const f = iter.next();
    existing[f.getName()] = f.getId();
  }

  const result = {};
  Object.entries(SPORT_LABELS).forEach(([key, label]) => {
    result[key] = existing[label] || parent.createFolder(label).getId();
  });

  Logger.log('Paste this into data.js as YB_DROPBOX_FOLDERS:');
  Logger.log(JSON.stringify(result));
  return result;
}

// ── Build a master shortcut index of every folder in the Shared Drive ──
// Run this once from the Apps Script editor (not via web app).
// REQUIRES: Services (left sidebar) → + → add "Drive API" (advanced service) first.
// Safe to re-run — it skips folders that already have a shortcut in the index.
const FOLDER_INDEX_ID = '16tMS2QUG4hSoN8aRE-r1c84vivFxI4pT'; // "📁 Folder Index (All Folders)"

function buildFolderIndex() {
  const existingTargets = {};
  let pageToken = null;
  do {
    const resp = Drive.Files.list({
      q: `'${FOLDER_INDEX_ID}' in parents and mimeType = 'application/vnd.google-apps.shortcut' and trashed = false`,
      fields: 'nextPageToken, files(id, shortcutDetails)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageToken
    });
    (resp.files || []).forEach(f => {
      if (f.shortcutDetails) existingTargets[f.shortcutDetails.targetId] = true;
    });
    pageToken = resp.nextPageToken;
  } while (pageToken);

  const folders = [];
  collectFoldersRecursive(DROPBOX_FOLDER_ID, '', folders);

  let created = 0, skipped = 0;
  folders.forEach(f => {
    if (f.id === FOLDER_INDEX_ID || existingTargets[f.id]) { skipped++; return; }
    Drive.Files.create(
      { name: f.path, mimeType: 'application/vnd.google-apps.shortcut', parents: [FOLDER_INDEX_ID], shortcutDetails: { targetId: f.id } },
      null,
      { supportsAllDrives: true }
    );
    created++;
  });

  Logger.log(`Found ${folders.length} folders total. Created ${created} new shortcuts, skipped ${skipped} (already indexed or is the index itself).`);
}

function collectFoldersRecursive(parentId, pathPrefix, out) {
  let pageToken = null;
  do {
    const resp = Drive.Files.list({
      q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'nextPageToken, files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      corpora: 'drive',
      driveId: DROPBOX_FOLDER_ID,
      pageToken
    });
    (resp.files || []).forEach(f => {
      if (f.id === FOLDER_INDEX_ID) return;
      const path = pathPrefix ? `${pathPrefix} / ${f.name}` : f.name;
      out.push({ id: f.id, name: f.name, path });
      collectFoldersRecursive(f.id, path, out);
    });
    pageToken = resp.nextPageToken;
  } while (pageToken);
}
