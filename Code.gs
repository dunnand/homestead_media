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
    if (action === 'createFutureFolders') return out(createFutureWeeklyFolders());
    return out({ success: false, error: 'Unknown action: ' + action });
  } catch(err) {
    return out({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'submitAirPlan') { fileAirPlan(data); return respond({ success: true }); }
    return respond({ success: false, error: 'Unknown action: ' + data.action });
  } catch(err) {
    return respond({ success: false, error: err.toString() });
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
  // Second semester — run createFutureWeeklyFolders() to fill these in.
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

// ── Show Planner Weekly Filing (Radio) ─────────────────────────
// Every plan submitted through the Show Planner (Talk Show / Air
// Personality / Radio Show) on the website is POSTed here and filed
// automatically as a Doc into that week's folder — no separate Form,
// since the planner already collects everything in-app.
//
// ONE-TIME SETUP:
// 1. Run createAirWeeklyFolders() from the Apps Script editor. It creates
//    a subfolder per week inside the shared drive below and logs a ready
//    -to-paste AIR_WEEKLY_FOLDERS array.
// 2. Paste that array over the placeholder one below.
// 3. Deploy → Manage deployments → Edit → New version, so the live /exec
//    URL picks up doPost(). (Code changes don't apply to /exec until you
//    push a new version.)
// Must stay in sync with AIR_WEEKLY_FOLDERS in script.js if weeks change.
const AIR_WEEKLY_DRIVE_ID = '0AGI4ogJFHfYTUk9PVA'; // shared drive — not a regular folder
const AIR_WEEKLY_FOLDERS = [
  { label: 'Week 1 (Aug 5–Aug 7)', start: '2026-08-05', end: '2026-08-07', folderId: '1hebPTfmH4X3q6WCkDmWW9Ur_7hEVbHpQ' },
  { label: 'Week 2 (Aug 10–Aug 14)', start: '2026-08-10', end: '2026-08-14', folderId: '1l4A1zTOr5k48NBy2PFYOB7F_3RMNcDAg' },
  { label: 'Week 3 (Aug 17–Aug 21)', start: '2026-08-17', end: '2026-08-21', folderId: '1iodax6hAEZeKhSly3CukLGPnXUCtXx4l' },
  { label: 'Week 4 (Aug 24–Aug 28)', start: '2026-08-24', end: '2026-08-28', folderId: '1bmpftwmZt6CbE7pzorbwiuohm2oFf6a2' },
  { label: 'Week 5 (Aug 31–Sep 4)', start: '2026-08-31', end: '2026-09-04', folderId: '1bu5f7OowBRbeZ1Jz-FC7vJk3YfKFGv4T' },
  { label: 'Week 6 (Sep 7–Sep 11)', start: '2026-09-07', end: '2026-09-11', folderId: '1BPA8HvGgfhiqceQ6wql40yMj7GvsgvTT' },
  { label: 'Week 7 (Sep 14–Sep 18)', start: '2026-09-14', end: '2026-09-18', folderId: '12WhLbO_PeFmt7sdZjyUzcyjhrqpeJEkK' },
  { label: 'Week 8 (Sep 21–Sep 25)', start: '2026-09-21', end: '2026-09-25', folderId: '1JNSjTqjTC3S6FrOMQH3VH7Ly0je5kPKa' },
  { label: 'Week 9 (Sep 28–Oct 2)', start: '2026-09-28', end: '2026-10-02', folderId: '1rdeWSNJpT3llIDMIAmhn4XOtJli2fiAC' },
  { label: 'Week 10 (Oct 5–Oct 9)', start: '2026-10-05', end: '2026-10-09', folderId: '1vqnUEXuwsac3GHM6vxGc0wgL1iPDlHBY' },
  { label: 'Week 12 (Oct 19–Oct 23)', start: '2026-10-19', end: '2026-10-23', folderId: '1Ux9r9liG-fUOnZEd18k9CpViAQLN1QgH' },
  { label: 'Week 13 (Oct 26–Oct 30)', start: '2026-10-26', end: '2026-10-30', folderId: '1vKC0VRC9-Cq9axjrg-GKbXW2km8Mn-Mc' },
  { label: 'Week 14 (Nov 2–Nov 6)', start: '2026-11-02', end: '2026-11-06', folderId: '1Chy4zblseLq9mq1vTpUs99qae9eUEroY' },
  { label: 'Week 15 (Nov 9–Nov 13)', start: '2026-11-09', end: '2026-11-13', folderId: '1MkrCky-FR_d13IClV_CXK_7eEG2VKKWd' },
  { label: 'Week 16 (Nov 16–Nov 20)', start: '2026-11-16', end: '2026-11-20', folderId: '1EBh1adeQlVmPIedI7EvCg-MhMhoQ1obR' },
  { label: 'Week 17 (Nov 23–Nov 27)', start: '2026-11-23', end: '2026-11-27', folderId: '1omsCh_PBa0IrYAw82k5jYs6HUlc9XIcG' },
  { label: 'Week 18 (Nov 30–Dec 4)', start: '2026-11-30', end: '2026-12-04', folderId: '1pVHz1C2K0c1suLkgI0lWwKS4QhvvT_Uw' },
  { label: 'Week 19 (Dec 7–Dec 11)', start: '2026-12-07', end: '2026-12-11', folderId: '1tQhRtOsyNWHRZxRUxtxTmlUnL4ACzqnO' },
  { label: 'Week 20 (Dec 14–Dec 18)', start: '2026-12-14', end: '2026-12-18', folderId: '1lcTgCRWGPm7ukqH2R_RTNdhgfmdZgr-B' },
  // Second semester — run createFutureWeeklyFolders() to fill these in.
  { label: 'Week 21 (Jan 5–Jan 8)', start: '2027-01-05', end: '2027-01-08', folderId: '' },
  { label: 'Week 22 (Jan 11–Jan 15)', start: '2027-01-11', end: '2027-01-15', folderId: '' },
  { label: 'Week 23 (Jan 18–Jan 22)', start: '2027-01-18', end: '2027-01-22', folderId: '' },
  { label: 'Week 24 (Jan 25–Jan 29)', start: '2027-01-25', end: '2027-01-29', folderId: '' },
  { label: 'Week 25 (Feb 1–Feb 5)', start: '2027-02-01', end: '2027-02-05', folderId: '' },
  { label: 'Week 26 (Feb 8–Feb 12)', start: '2027-02-08', end: '2027-02-12', folderId: '' },
  { label: 'Week 27 (Feb 15–Feb 19)', start: '2027-02-15', end: '2027-02-19', folderId: '' },
  { label: 'Week 28 (Feb 22–Feb 26)', start: '2027-02-22', end: '2027-02-26', folderId: '' },
  { label: 'Week 29 (Mar 1–Mar 5)', start: '2027-03-01', end: '2027-03-05', folderId: '' },
  { label: 'Week 30 (Mar 8–Mar 12)', start: '2027-03-08', end: '2027-03-12', folderId: '' },
  { label: 'Week 31 (Mar 15–Mar 19)', start: '2027-03-15', end: '2027-03-19', folderId: '' },
  { label: 'Week 32 (Mar 22–Mar 26)', start: '2027-03-22', end: '2027-03-26', folderId: '' },
  { label: 'Week 33 (Mar 29–Apr 2)', start: '2027-03-29', end: '2027-04-02', folderId: '' },
  { label: 'Week 34 (Apr 5–Apr 9)', start: '2027-04-05', end: '2027-04-09', folderId: '' },
  { label: 'Week 35 (Apr 12–Apr 16)', start: '2027-04-12', end: '2027-04-16', folderId: '' },
  { label: 'Week 36 (Apr 19–Apr 23)', start: '2027-04-19', end: '2027-04-23', folderId: '' },
  { label: 'Week 37 (Apr 26–Apr 30)', start: '2027-04-26', end: '2027-04-30', folderId: '' },
  { label: 'Week 38 (May 3–May 7)', start: '2027-05-03', end: '2027-05-07', folderId: '' },
  { label: 'Week 39 (May 10–May 14)', start: '2027-05-10', end: '2027-05-14', folderId: '' },
  { label: 'Week 40 (May 17–May 21)', start: '2027-05-17', end: '2027-05-21', folderId: '' },
  { label: 'Week 41 (May 24–May 28)', start: '2027-05-24', end: '2027-05-28', folderId: '' },
];

// Run once from the Apps Script editor after setting/changing the weeks
// above. Creates each week's subfolder inside the shared drive and logs
// an AIR_WEEKLY_FOLDERS array (with real folderIds) to paste back in here
// and into script.js. Re-running it will create duplicate folders, so
// don't run it twice without clearing the ones it already made.
function createAirWeeklyFolders() {
  const root = DriveApp.getFolderById(AIR_WEEKLY_DRIVE_ID);
  const lines = ['const AIR_WEEKLY_FOLDERS = ['];
  AIR_WEEKLY_FOLDERS.forEach(w => {
    const folder = root.createFolder(w.label);
    lines.push(`  { label: '${w.label}', start: '${w.start}', end: '${w.end}', folderId: '${folder.getId()}' },`);
  });
  lines.push('];');
  const out = lines.join('\n');
  Logger.log(out);
  return out;
}

// One-click version of the above, callable from the Teacher Dashboard's
// "Weekly Drive Folders" section via ?action=createFutureFolders. Scans
// BOTH WEEKLY_FOLDERS (Yearbook) and AIR_WEEKLY_FOLDERS (Radio) and only
// creates a subfolder for entries that don't have a folderId yet — safe
// to click again later (e.g. next semester) as long as you've pasted the
// previous output back into Code.gs first, since already-filled entries
// are skipped.
function createFutureWeeklyFolders() {
  // Remembers created folders in Script Properties (independent of the
  // deployed source), so clicking the button again before pasting the
  // result back into Code.gs reuses the same folder instead of making a
  // duplicate — the paste-back is still needed for filing/display to
  // pick up the new weeks, just not to avoid duplicate folders.
  const props = PropertiesService.getScriptProperties();

  function fill(list, rootId, keyPrefix) {
    const root = DriveApp.getFolderById(rootId);
    let created = 0;
    list.forEach(w => {
      if (w.folderId) return;
      const propKey = keyPrefix + w.start + '_' + w.end; // dates, not label — stays unique across school years
      const existing = props.getProperty(propKey);
      if (existing) { w.folderId = existing; return; }
      w.folderId = root.createFolder(w.label).getId();
      props.setProperty(propKey, w.folderId);
      created++;
    });
    return created;
  }

  function toSource(varName, list) {
    const lines = [`const ${varName} = [`];
    list.forEach(w => lines.push(`  { label: '${w.label}', start: '${w.start}', end: '${w.end}', folderId: '${w.folderId}' },`));
    lines.push('];');
    return lines.join('\n');
  }

  const ybCreated  = fill(WEEKLY_FOLDERS, WEEKLY_ROOT_FOLDER_ID, 'yb:');
  const airCreated = fill(AIR_WEEKLY_FOLDERS, AIR_WEEKLY_DRIVE_ID, 'air:');
  const yb  = toSource('WEEKLY_FOLDERS', WEEKLY_FOLDERS);
  const air = toSource('AIR_WEEKLY_FOLDERS', AIR_WEEKLY_FOLDERS);

  Logger.log(yb);
  Logger.log(air);
  return { success: true, ybCreated, airCreated, yb, air };
}

// Same fallback logic as getCurrentAirWeek() on the website. Falls back to
// filing straight into the shared drive root if a week's folderId hasn't
// been filled in yet (e.g. before createAirWeeklyFolders() has been run).
function airWeeklyFolderForDate(dateStr) {
  const current  = AIR_WEEKLY_FOLDERS.find(w => dateStr >= w.start && dateStr <= w.end);
  const upcoming = AIR_WEEKLY_FOLDERS.find(w => w.start > dateStr);
  const pick = current || upcoming || AIR_WEEKLY_FOLDERS[AIR_WEEKLY_FOLDERS.length - 1];
  return (pick && pick.folderId) || AIR_WEEKLY_DRIVE_ID;
}

function fileAirPlan(data) {
  const tz = 'America/Indiana/Indianapolis';
  const submitted = data.submittedAt ? new Date(data.submittedAt) : new Date();
  const todayStr  = Utilities.formatDate(submitted, tz, 'yyyy-MM-dd');
  const dateLabel = Utilities.formatDate(submitted, tz, 'MMM d, yyyy');
  const folder    = DriveApp.getFolderById(airWeeklyFolderForDate(todayStr));

  const studentName = data.studentName || 'Unknown Student';
  const showName    = data.showName || '';
  const fileName = showName ? `${studentName} — ${showName} — ${dateLabel}` : `${studentName} — ${dateLabel}`;

  const doc = DocumentApp.create(fileName);
  const body = doc.getBody();
  body.appendParagraph(fileName).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  (data.planText || '').split('\n').forEach(line => body.appendParagraph(line));
  doc.saveAndClose();

  DriveApp.getFileById(doc.getId()).moveTo(folder);
}

