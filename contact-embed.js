'use strict';
(() => {
  const endpoint = window.AZRI_CONTACT?.endpoint || '';
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint)) return;
  const card = document.querySelector('.contact-card');
  if (!card) return;
  const frameId = crypto.randomUUID();
  const wrapper = document.createElement('div');
  wrapper.className = 'contact-frame-wrap';
  const frame = document.createElement('iframe');
  // Avoid Google's multi-account session routing in supporting browsers.
  frame.setAttribute('credentialless', '');
  frame.title = 'AZRI お問い合わせフォーム';
  frame.className = 'contact-frame';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  const url = new URL(endpoint);
  url.searchParams.set('parentOrigin', location.origin);
  url.searchParams.set('frameId', frameId);
  frame.src = url.href;
  const note = document.createElement('p');
  note.className = 'contact-hint';
  note.textContent = 'フォームを読み込んでいます…';
  note.setAttribute('role', 'status');
  wrapper.append(note, frame);
  let source = null;
  window.addEventListener('message', (event) => {
    const originAllowed = /^https:\/\/(?:script\.google\.com|script\.googleusercontent\.com|[a-z0-9-]+-script\.googleusercontent\.com)$/.test(event.origin);
    if (!originAllowed || event.data?.frameId !== frameId || !event.source) return;
    if (event.data.type === 'azri-contact-ready') {
      if (source && source !== event.source) return;
      source = event.source;
      source.postMessage({ type: 'azri-contact-ack', frameId }, event.origin);
      note.hidden = true;
    }
    if (event.data.type === 'azri-contact-height' && event.source === source && Number.isFinite(event.data.height)) {
      frame.style.height = Math.max(300, Math.min(2400, Math.ceil(event.data.height))) + 'px';
    }
  });
  setTimeout(() => {
    if (!source) note.textContent = 'フォームを読み込めませんでした。再読み込みしても表示されない場合は、プライベートブラウズでこのページを開いてお試しください。';
  }, 20000);
  card.replaceWith(wrapper);
})();
