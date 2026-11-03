/**
 * Innovgeist — Diwali Spin & Win backend (Google Apps Script web app)
 *
 * The server, not the browser, decides the prize and issues the coupon code,
 * so a forged request can never "win" a chosen prize. One spin per contact.
 *
 * Setup:
 *   1. Open the Google Sheet → Extensions → Apps Script, paste this file.
 *   2. Run `setup` once (approve the permissions it asks for).
 *   3. Deploy → New deployment → Web app
 *        Execute as: Me    ·    Who has access: Anyone
 *   4. Copy the Web app URL into SPIN_ENDPOINT in script.js.
 *   Keep the Sheet's own sharing restricted — the web app writes as you.
 */

const CONFIG = {
  SHEET_ID: '1G_ZG0E_E9BKUdJxLCxI7QNBKWE-hD4iAgMBmS5jicaw',
  SHEET_NAME: 'Diwali Spins',
  NOTIFY_EMAIL: 'replyrgupta@gmail.com',
  OFFER_END: new Date('2026-11-15T23:59:59+05:30'),
  MAX_SPINS_PER_MINUTE: 30,
  MAX_BODY_BYTES: 2000,
};

// Order and labels MUST match PRIZES in the website's script.js.
// weight = relative chance. The two jackpots are ~1 in 10,000 spins.
const PRIZES = [
  { label: 'FREE Website',        weight: 0.01 },
  { label: '₹1,000 OFF Starter',  weight: 20 },
  { label: 'FREE SEO Audit',      weight: 30 },
  { label: '₹5,000 OFF Pro',      weight: 2 },
  { label: 'FREE Extra Page',     weight: 10 },
  { label: 'FREE Hosting 3 Yrs',  weight: 0.01 },
  { label: '₹2,000 OFF Growth',   weight: 12 },
  { label: 'FREE Google Listing', weight: 8 },
  { label: 'FREE Logo',           weight: 4 },
  { label: 'FREE Hosting Yr 2',   weight: 14 },
];

const HEADERS = ['Timestamp', 'Name', 'Contact Type', 'Contact', 'Prize', 'Coupon Code', 'Consent', 'Status', 'Notes'];
const COL = { contact: 4, prize: 5, code: 6 };
const STATUSES = ['New', 'Contacted', 'Redeemed', 'Rejected'];

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]{1,59}$/u;
const PHONE_RE = /^(?:\+91[\s-]?|0)?([6-9]\d{4})[\s-]?(\d{5})$/;
const EMAIL_RE = /^(?!.*\.\.)[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function doGet() {
  return json_({ ok: true, service: 'diwali-spin' });
}

function doPost(e) {
  try {
    const raw = (e && e.postData && e.postData.contents) || '';
    if (!raw || raw.length > CONFIG.MAX_BODY_BYTES) return fail_('bad_request');

    let d;
    try { d = JSON.parse(raw); } catch (err) { return fail_('bad_request'); }
    if (!d || typeof d !== 'object' || Array.isArray(d)) return fail_('bad_request');

    // Honeypot: real visitors never fill this hidden field.
    if (d.website) return fail_('bad_request');
    if (new Date() > CONFIG.OFFER_END) return fail_('offer_ended');

    const name = cleanName_(d.name);
    if (!name) return fail_('invalid_name');
    const contact = parseContact_(d.contact);
    if (!contact) return fail_('invalid_contact');
    if (d.consent !== true) return fail_('consent_required');

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) return fail_('busy');
    let result;
    try {
      if (!withinRateLimit_()) return fail_('busy');
      const sheet = getSheet_();
      const existing = findByContact_(sheet, contact.value);
      if (existing) {
        return json_({ ok: true, repeat: true, index: existing.index, label: PRIZES[existing.index].label, code: existing.code });
      }
      const index = pickIndex_();
      const code = uniqueCode_(sheet);
      const now = new Date();
      const row = [
        now,
        name,
        contact.type,
        contact.value,
        PRIZES[index].label,
        code,
        'Agreed to Terms & Privacy Notice at ' + Utilities.formatDate(now, 'Asia/Kolkata', 'dd MMM yyyy, hh:mm:ss a') + ' IST',
        'New',
        '',
      ];
      sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row.map(safeCell_)]);
      SpreadsheetApp.flush();
      result = { ok: true, index: index, label: PRIZES[index].label, code: code };
    } finally {
      lock.releaseLock();
    }

    notify_(name, contact, result);
    return json_(result);
  } catch (err) {
    console.error('doPost failed: ' + (err && err.stack ? err.stack : err));
    return fail_('server_error');
  }
}

/** Run from the editor to test a spin end to end. Writes one test row — delete it afterwards. */
function testSpin() {
  const out = doPost({ postData: { contents: JSON.stringify({ name: 'Test User', contact: 'test@example.com', consent: true }) } });
  console.log(out.getContent());
}

/** Run once from the editor to create and format the sheet. */
function setup() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  ss.setSpreadsheetTimeZone('Asia/Kolkata');
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAME);

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.getRange('A2:A').setNumberFormat('dd mmm yyyy, hh:mm am/pm');
  sheet.getRange('B2:I').setNumberFormat('@');
  sheet.getRange('H2:H').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(false).build()
  );
  sheet.autoResizeColumns(1, HEADERS.length);
}

/* ── helpers ── */

function getSheet_() {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) throw new Error('Sheet "' + CONFIG.SHEET_NAME + '" missing — run setup()');
  return sheet;
}

function cleanName_(v) {
  if (typeof v !== 'string') return null;
  const s = v.normalize('NFC').replace(/\s+/g, ' ').trim();
  return NAME_RE.test(s) ? s : null;
}

function parseContact_(v) {
  if (typeof v !== 'string' || v.length > 254) return null;
  const s = v.trim();
  const m = s.match(PHONE_RE);
  if (m) return { type: 'Phone', value: m[1] + m[2] };
  if (EMAIL_RE.test(s)) return { type: 'Email', value: s.toLowerCase() };
  return null;
}

// Blocks spreadsheet formula injection (=, +, -, @ …) and strips control characters.
function safeCell_(v) {
  if (typeof v !== 'string') return v;
  const s = v.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 300);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function withinRateLimit_() {
  const cache = CacheService.getScriptCache();
  const key = 'rl:' + Math.floor(Date.now() / 60000);
  const n = Number(cache.get(key) || 0);
  if (n >= CONFIG.MAX_SPINS_PER_MINUTE) return false;
  cache.put(key, String(n + 1), 120);
  return true;
}

function contactKey_(v) {
  const s = String(v == null ? '' : v).replace(/^'/, '').trim().toLowerCase();
  if (s.indexOf('@') !== -1) return s;
  const digits = s.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : s;
}

function findByContact_(sheet, contact) {
  const last = sheet.getLastRow();
  if (last < 2) return null;
  const key = contactKey_(contact);
  const rows = sheet.getRange(2, COL.contact, last - 1, 3).getValues();
  for (let i = 0; i < rows.length; i++) {
    if (contactKey_(rows[i][0]) !== key) continue;
    const label = String(rows[i][1]).replace(/^'/, '').trim();
    const index = PRIZES.findIndex(function (p) { return p.label === label; });
    const code = String(rows[i][2]).trim();
    if (index >= 0 && /^DIWALI-[A-Z2-9]{6}$/.test(code)) return { index: index, code: code };
  }
  return null;
}

function pickIndex_() {
  const total = PRIZES.reduce(function (s, p) { return s + p.weight; }, 0);
  let r = Math.random() * total;
  for (let i = 0; i < PRIZES.length; i++) {
    r -= PRIZES[i].weight;
    if (r < 0) return i;
  }
  return 2;
}

function uniqueCode_(sheet) {
  const last = sheet.getLastRow();
  const used = new Set(last < 2 ? [] : sheet.getRange(2, COL.code, last - 1, 1).getDisplayValues().map(function (r) { return r[0]; }));
  for (let attempt = 0; attempt < 20; attempt++) {
    const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid());
    let code = 'DIWALI-';
    for (let i = 0; i < 6; i++) code += CODE_CHARS[(bytes[i] + 256) % CODE_CHARS.length];
    if (!used.has(code)) return code;
  }
  throw new Error('Could not generate a unique code');
}

function notify_(name, contact, result) {
  if (!CONFIG.NOTIFY_EMAIL) return;
  try {
    MailApp.sendEmail({
      to: CONFIG.NOTIFY_EMAIL,
      subject: 'Diwali Spin lead — ' + result.label + ' (' + result.code + ')',
      body: 'Name: ' + name + '\n' + contact.type + ': ' + contact.value + '\nPrize: ' + result.label + '\nCoupon code: ' + result.code,
    });
  } catch (err) {
    console.error('notify failed', err);
  }
}

function fail_(code) {
  return json_({ ok: false, error: code });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
