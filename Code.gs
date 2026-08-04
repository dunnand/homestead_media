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

// ── Weekly Accomplishments Form + auto-filing ─────────────────
// Run createWeeklyAccomplishmentsForm() ONCE from the Apps Script editor.
// It creates the Form, wires up the submit trigger, and logs the live
// Form URL — paste that into script.js as YB_WEEKLY_FORM_URL.
// Must stay in sync with YB_WEEKLY_FOLDERS in script.js if weeks are added/changed.
const WEEKLY_ROOT_FOLDER_ID = '11LNVkH8eykaitzbXhSTHNzVz1YkmtxoB'; // "Weekly Accomplishments"
const WEEKLY_FOLDERS = [
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
];

// Same fallback logic as getCurrentYbWeek() on the website, so a submission
// always lands in whichever week the site is currently showing the student.
function weeklyFolderForDate(dateStr) {
  const current = WEEKLY_FOLDERS.find(w => dateStr >= w.start && dateStr <= w.end);
  if (current) return current.folderId;
  const upcoming = WEEKLY_FOLDERS.find(w => w.start > dateStr);
  if (upcoming) return upcoming.folderId;
  if (dateStr < WEEKLY_FOLDERS[0].start) return WEEKLY_FOLDERS[0].folderId;
  return WEEKLY_FOLDERS[WEEKLY_FOLDERS.length - 1].folderId;
}

function createWeeklyAccomplishmentsForm() {
  const form = FormApp.create('Weekly Accomplishments — Homestead Yearbook');
  form.setDescription("Tell us what you worked on this week. Your response is filed automatically — no need to upload anything yourself.");
  form.addTextItem().setTitle('First and Last Name').setRequired(true);
  form.addParagraphTextItem().setTitle('What did you accomplish this week?').setRequired(true);
  form.addTextItem().setTitle('Link to photos or work (optional)').setRequired(false);

  ScriptApp.newTrigger('onWeeklyFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();

  Logger.log('Form created. Paste this into script.js as YB_WEEKLY_FORM_URL: ' + form.getPublishedUrl());
  Logger.log('Edit URL (for the teacher, not students): ' + form.getEditUrl());
  return form.getPublishedUrl();
}

function onWeeklyFormSubmit(e) {
  const answers = {};
  e.response.getItemResponses().forEach(item => {
    answers[item.getItem().getTitle()] = item.getResponse();
  });

  const name = answers['First and Last Name'] || 'Unknown Student';
  const work = answers['What did you accomplish this week?'] || '';
  const link = answers['Link to photos or work (optional)'] || '';

  const tz = 'America/Indiana/Indianapolis';
  const todayStr   = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const dateLabel  = Utilities.formatDate(new Date(), tz, 'MMM d, yyyy');
  const folder     = DriveApp.getFolderById(weeklyFolderForDate(todayStr));

  const doc = DocumentApp.create(`${name} — ${dateLabel}`);
  const body = doc.getBody();
  body.appendParagraph(`${name} — ${dateLabel}`).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph('What I accomplished this week:');
  body.appendParagraph(work);
  if (link) body.appendParagraph('Link: ' + link);
  doc.saveAndClose();

  DriveApp.getFileById(doc.getId()).moveTo(folder);
}

