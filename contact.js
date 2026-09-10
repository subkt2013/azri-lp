'use strict';
(() => {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  const q = (selector) => document.querySelector(selector);
  const fields = ['name', 'company', 'email', 'message', 'consent'];
  let configured = typeof window.AZRI_CONTACT_SEND === 'function';
  const inputPanel = q('#contact-fields');
  const sendButton = q('#contact-send');
  const editButton = q('#contact-edit');
  const status = q('#contact-status');
  let state = 'input';
  let snapshot = null;

  function report(message = '', error = false) {
    status.textContent = message;
    status.toggleAttribute('data-error', error);
    if (error) status.focus();
  }

  function show(next) {
    state = next;
    form.hidden = next !== 'input';
    q('#contact-review').hidden = next !== 'review';
    q('#contact-success').hidden = next !== 'success';
    document.querySelectorAll('[data-contact-step]').forEach((item) => {
      if (item.dataset.contactStep === next) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    if (next === 'input') q('#contact-name').focus();
    else q(`#contact-${next}-title`).focus();
  }

  function validate(name) {
    const el = form.elements.namedItem(name);
    let error = '';
    if (name === 'consent') {
      if (!el.checked) error = '情報の取り扱いへの同意を確認してください。';
    } else {
      const value = el.value.trim();
      if (el.required && !value) error = 'この項目を入力してください。';
      else if (value.length > el.maxLength) error = `${el.maxLength.toLocaleString()}文字以内で入力してください。`;
      else if (name === 'email' && (el.validity.typeMismatch || /[\r\n]/.test(value))) error = '返信を受け取れるメールアドレスを入力してください。';
    }
    el.setAttribute('aria-invalid', error ? 'true' : 'false');
    q(`#contact-${name}-error`).textContent = error;
    return !error;
  }

  fields.forEach((name) => {
    const el = form.elements.namedItem(name);
    el.addEventListener('blur', () => validate(name));
    el.addEventListener('input', () => {
      if (el.getAttribute('aria-invalid') === 'true') validate(name);
    });
  });
  q('#contact-message').addEventListener('input', (event) => {
    q('#contact-count').textContent = `${event.target.value.length.toLocaleString()} / 5,000`;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (state !== 'input') return;
    report();
    const valid = fields.map(validate).every(Boolean);
    if (!valid) {
      report('入力内容をご確認ください。赤字の項目を修正すると次に進めます。');
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }
    snapshot = Object.fromEntries(fields.filter((name) => name !== 'consent').map((name) => [name, form.elements.namedItem(name).value.trim()]));
    snapshot.consent = '同意する';
    snapshot._gotcha = form.elements.namedItem('_gotcha').value;
    document.querySelectorAll('[data-review]').forEach((el) => {
      el.textContent = snapshot[el.dataset.review] || '未入力';
    });
    show('review');
  });

  editButton.addEventListener('click', () => {
    if (state !== 'review') return;
    snapshot = null;
    report();
    show('input');
  });

  sendButton.addEventListener('click', async () => {
    if (state !== 'review' || !snapshot || !configured) return;
    if (snapshot._gotcha) {
      report('送信できませんでした。入力内容をご確認ください。', true);
      return;
    }
    state = 'sending';
    sendButton.disabled = true;
    editButton.disabled = true;
    sendButton.textContent = '送信しています…';
    q('#contact-review').setAttribute('aria-busy', 'true');
    report('送信しています。そのままお待ちください。');
    let timer;
    try {
      const data = await Promise.race([
        window.AZRI_CONTACT_SEND(snapshot),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), 45000); }),
      ]);
      if (data?.ok !== true) {
        state = 'review';
        const messages = {
          BUSY: 'ほかの送信を処理しています。少し時間をおいて再度お試しください。入力内容は残っています。',
          LIMIT: '現在、フォームの受付上限に達しています。時間をおいてお試しください。入力内容は残っています。',
          EXPIRED: 'フォームの有効期限が切れました。入力内容をお手元に控えてからページを再読み込みしてください。',
          USED: 'このフォームはすでに送信済みです。新しいお問い合わせはページを再読み込みしてご入力ください。',
          UNKNOWN: '送信結果を確認できませんでした。重複送信を防ぐため再送を止めています。お問い合わせ先メールアドレスへご連絡ください。',
          INVALID: '入力内容を確認できませんでした。「修正する」から内容をお確かめください。',
        };
        report(messages[data?.code] || '送信を完了できませんでした。入力内容は残っています。時間をおいて再度お試しください。', true);
        return;
      }
      form.reset();
      snapshot = null;
      q('#contact-count').textContent = '0 / 5,000';
      document.querySelectorAll('[data-review]').forEach((el) => { el.textContent = ''; });
      report();
      show('success');
    } catch {
      state = 'review';
      report('通信が途切れたため、送信結果を確認できませんでした。入力内容は残っています。接続をご確認のうえ、同じ内容で再送すると受付済みか確認できます。ページを再読み込みすると重複する可能性があります。', true);
    } finally {
      clearTimeout(timer);
      q('#contact-review').removeAttribute('aria-busy');
      sendButton.disabled = state === 'success' || !configured;
      editButton.disabled = false;
      sendButton.textContent = 'この内容で送信する →';
    }
  });

  // Local previews never send. Hosted input stays locked until the AZRI parent handshake.
  function enableSending() {
    configured = typeof window.AZRI_CONTACT_SEND === 'function';
    inputPanel.disabled = !configured && !!window.AZRI_CONTACT?.hosted;
    sendButton.disabled = !configured;
    q('#contact-setup').hidden = configured || !!window.AZRI_CONTACT?.hosted;
  }
  document.addEventListener('azri-contact-connected', enableSending);
  enableSending();
})();
