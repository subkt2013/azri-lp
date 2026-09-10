// AZRI contact notifications. This file contains no account credentials.
const CONTACT_TO = 'contact@azri-corp.com';
const SESSION_SECONDS = 21600;
const ALLOWED_PARENTS = [
  'https://azri-corp.com',
  'https://www.azri-corp.com',
  'https://subkt2013.github.io',
  'https://azri-mobile-preview.kaztate-0119.chatgpt.site',
  'http://127.0.0.1:8012'
];

function doGet(e) {
  const parentOrigin = String(e && e.parameter && e.parameter.parentOrigin || '');
  const frameId = String(e && e.parameter && e.parameter.frameId || '');
  if (ALLOWED_PARENTS.indexOf(parentOrigin) < 0 || !/^[a-f0-9-]{36}$/.test(frameId)) {
    return HtmlService.createHtmlOutput('AZRIのサイトにあるお問い合わせフォームからご利用ください。');
  }
  const template = HtmlService.createTemplate(CONTACT_FORM_HTML);
  template.sessionToken = createContactSession_();
  template.parentOrigin = parentOrigin;
  template.frameId = frameId;
  return template.evaluate()
    .setTitle('AZRI お問い合わせ')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function createContactSession_() {
  const token = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  CacheService.getScriptCache().put('session:' + token, JSON.stringify({ state: 'new', created: Date.now() }), SESSION_SECONDS);
  return token;
}

function validateContact_(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const limits = { name: 100, company: 150, email: 254, message: 5000 };
  const clean = {};
  for (const key of Object.keys(limits)) {
    if (typeof data[key] !== 'string') return null;
    clean[key] = data[key].trim();
    if (clean[key].length > limits[key] || (key !== 'company' && !clean[key])) return null;
    if (key !== 'message' && /[\x00-\x1f\x7f]/.test(clean[key])) return null;
    if (key === 'message' && /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(clean[key])) return null;
  }
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(clean.email)) return null;
  if (data.consent !== '同意する' || data._gotcha !== '') return null;
  return clean;
}

function submitContact(data) {
  const clean = validateContact_(data);
  if (!clean || typeof data.token !== 'string' || !/^[a-f0-9]{64}$/.test(data.token)) {
    return { ok: false, code: 'INVALID' };
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(2000)) return { ok: false, code: 'BUSY' };
  try {
    const cache = CacheService.getScriptCache();
    const key = 'session:' + data.token;
    const raw = cache.get(key);
    if (!raw) return { ok: false, code: 'EXPIRED' };
    const session = JSON.parse(raw);
    const digest = Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, JSON.stringify(clean), Utilities.Charset.UTF_8));
    if (session.state === 'sent') {
      return session.digest === digest ? { ok: true } : { ok: false, code: 'USED' };
    }
    if (session.state !== 'new') return { ok: false, code: 'UNKNOWN' };
    if (Date.now() - session.created < 1500) return { ok: false, code: 'BUSY' };
    const lastSend = Number(cache.get('last-send') || 0);
    if (Date.now() - lastSend < 5000) return { ok: false, code: 'BUSY' };
    if (MailApp.getRemainingDailyQuota() <= 10) return { ok: false, code: 'LIMIT' };

    // Reserve before sending. An uncertain result must never trigger an automatic duplicate.
    cache.put(key, JSON.stringify({ state: 'pending', digest: digest }), SESSION_SECONDS);
    cache.put('last-send', String(Date.now()), 60);
    try {
      MailApp.sendEmail({
        to: CONTACT_TO,
        replyTo: clean.email,
        name: 'AZRI お問い合わせ',
        subject: '【AZRI】Webサイトからのお問い合わせ',
        body: [
          'AZRIのWebサイトからお問い合わせが届きました。',
          '',
          'お名前: ' + clean.name,
          '会社名: ' + (clean.company || '未入力'),
          '返信先: ' + clean.email,
          '',
          'ご相談内容:',
          clean.message,
          '',
          '情報の取り扱いへの同意: あり',
          '受付日時: ' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss'),
          '',
          'このメールに返信すると、お問い合わせ者のアドレスが返信先になります。'
        ].join('\n')
      });
    } catch (error) {
      // Do not log mail addresses, message content, or the provider's raw exception.
      cache.put(key, JSON.stringify({ state: 'unknown', digest: digest }), SESSION_SECONDS);
      return { ok: false, code: 'UNKNOWN' };
    }
    cache.put(key, JSON.stringify({ state: 'sent', digest: digest }), SESSION_SECONDS);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

// Run once from the editor to authorize mail sending, without sending any email.
function authorizeContactMail() {
  return MailApp.getRemainingDailyQuota();
}
