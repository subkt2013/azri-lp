'use strict';

document.querySelector('#year').textContent = new Date().getFullYear();

const dialog = document.querySelector('#demo-dialog');
const body = document.querySelector('#demo-body');
const title = document.querySelector('#demo-title');
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const yen = value => new Intl.NumberFormat('ja-JP', {style:'currency', currency:'JPY'}).format(value);
document.querySelector('#demo-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', () => {
  ({booking: bookingDemo, approval: approvalDemo, estimate: estimateDemo})[button.dataset.demo]();
  dialog.showModal();
}));

function bookingDemo() {
  title.textContent = 'BARBER FLOW / 電話予約を登録';
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const reservations = [{date, time:'10:00', staff:'スタッフA', name:'サンプル顧客', arrived:false}];
  body.innerHTML = `<p>電話を受けたら日時と担当者を選んで登録。右の予定表への反映を確認してください。</p><div class="try-layout"><form class="try-form" id="booking-form"><label>お客様名（架空の名前）<input name="customer" value="デモのお客様" required maxlength="40"></label><label>予約日<input name="date" type="date" value="${date}" required></label><label>開始時刻 / カット60分<select name="time"><option>10:00</option><option selected>11:00</option><option>12:00</option><option>13:00</option></select></label><label>担当者<select name="staff"><option>スタッフA</option><option>スタッフB</option></select></label><button class="try-button">予約を登録</button><p id="booking-message" class="try-notice" role="status"></p></form><div class="try-result"><h4>登録済みの予約</h4><div id="reservations"></div></div></div>`;
  const render = () => {
    body.querySelector('#reservations').innerHTML = reservations.slice().sort((a,b) => (a.date+a.time+a.staff).localeCompare(b.date+b.time+b.staff)).map(r => `<div class="try-row"><div><strong>${escapeHTML(r.name)}</strong><small>${r.date} ${r.time} / ${r.staff}</small></div><button class="try-button secondary" data-arrival="${reservations.indexOf(r)}" ${r.arrived?'disabled':''}>${r.arrived?'来店済み':'来店受付'}</button></div>`).join('');
  };
  body.querySelector('#reservations').onclick = event => { const b = event.target.closest('[data-arrival]'); if(b) { reservations[Number(b.dataset.arrival)].arrived = true; render(); } };
  body.querySelector('#booking-form').onsubmit = event => {
    event.preventDefault(); const data = new FormData(event.target); const name = data.get('customer').trim();
    const message = body.querySelector('#booking-message');
    if(!name) { message.textContent = 'お客様名を入力してください。'; return; }
    if(reservations.some(r => r.date === data.get('date') && r.time === data.get('time') && r.staff === data.get('staff'))) { message.textContent = 'その担当者の枠は予約済みです。時刻か担当者を変更してください。'; return; }
    reservations.push({date:data.get('date'),time:data.get('time'),staff:data.get('staff'),name,arrived:false}); render(); message.textContent = '予約を登録しました。予定表から来店受付も試せます。';
  }; render();
}

function approvalDemo() {
  title.textContent = '経費申請 / 内容を確認して判断';
  body.innerHTML = `<p>あなたは承認担当者です。申請内容を確認し、判断してください。</p><div class="try-layout"><div class="try-result"><h4>備品購入申請 #EXP-024</h4><div class="try-row">申請者<strong>営業部 / デモ社員</strong></div><div class="try-row">用途<strong>商談用ヘッドセット 2台</strong></div><div class="try-row">金額<strong>¥18,000</strong></div><div class="try-row">状況<strong id="approval-status">承認待ち</strong></div></div><form class="try-form" id="approval-form"><label>判断コメント（差戻し時は必須）<textarea name="reason" rows="3" maxlength="200" placeholder="例：購入先の見積を添付してください"></textarea></label><div class="try-actions"><button class="try-button" name="decision" value="approved">承認する</button><button class="try-button secondary" name="decision" value="returned">差し戻す</button></div><p role="status" id="approval-message" class="try-notice"></p><h4>判断履歴</h4><ul class="try-log" id="approval-log"><li>営業部が申請しました。</li></ul></form></div>`;
  body.querySelector('#approval-form').onsubmit = event => {
    event.preventDefault(); const returned = event.submitter?.value === 'returned'; const reason = new FormData(event.target).get('reason').trim();
    if(returned && !reason) { body.querySelector('#approval-message').textContent = '差戻し理由を入力してください。'; return; }
    const status = returned ? '差戻し' : '承認済み'; body.querySelector('#approval-status').textContent = status;
    const li = document.createElement('li'); li.textContent = `承認担当者：${status}${reason ? ' / '+reason : ''}`; body.querySelector('#approval-log').append(li);
    event.target.querySelectorAll('button, textarea').forEach(e => e.disabled = true);
    body.querySelector('#approval-message').textContent = returned ? '申請者への差戻しを記録しました。' : '承認を記録しました。経理処理へ進められます。';
  };
}

function estimateDemo() {
  title.textContent = '見積作成 / 明細から合計まで';
  body.innerHTML = `<p>数量と単価を変えると、見積金額が更新されます。最後に見積プレビューを作成してください。</p><div class="try-layout"><form class="try-form" id="estimate-form"><label>品目<input name="item" value="業務用タブレット" required maxlength="60"></label><label>数量<input name="quantity" type="number" min="1" max="1000" step="1" value="3" required></label><label>単価（税別・円）<input name="price" type="number" min="0" max="10000000" step="1" value="50000" required></label><button class="try-button">見積プレビューを作成</button></form><div class="try-result"><h4 id="estimate-heading">金額の確認</h4><div id="estimate-summary"></div><p class="try-notice" id="estimate-message" role="status"></p></div></div>`;
  const form = body.querySelector('#estimate-form');
  const render = () => {
    body.querySelector('#estimate-heading').textContent = '金額の確認'; body.querySelector('#estimate-message').textContent = '';
    if(!form.checkValidity()) { body.querySelector('#estimate-summary').textContent = '品目・数量・単価を有効な値で入力してください。'; return; }
    const d = new FormData(form); const subtotal = Number(d.get('quantity')) * Number(d.get('price')); const tax = Math.floor(subtotal*.1);
    body.querySelector('#estimate-summary').innerHTML = `<div class="try-row">品目<strong>${escapeHTML(d.get('item'))}</strong></div><div class="try-row">数量<strong>${d.get('quantity')}</strong></div><div class="try-row">小計<strong>${yen(subtotal)}</strong></div><div class="try-row">消費税 10%<strong>${yen(tax)}</strong></div><div class="try-row">合計<strong class="try-total">${yen(subtotal+tax)}</strong></div>`;
  };
  form.oninput = render; form.onsubmit = event => { event.preventDefault(); render(); body.querySelector('#estimate-heading').textContent = '御見積書 / プレビュー'; body.querySelector('#estimate-message').textContent = 'この内容で見積を作成しました。入力を変えると再編集できます。'; }; render();
}
