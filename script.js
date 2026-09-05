'use strict';
const demos = {
  projects: {title:'案件管理システム',description:'担当者ごとに散らばりがちな案件情報を、一つの画面で確認できる構成です。',features:['案件名と進行状況を一覧で把握','進行中・完了件数を上部に集約','実際の業務に合わせて管理項目を設計']},
  documents: {title:'見積・帳票管理',description:'見積の内容と確認状況をまとめ、作成から確認までの流れを整理する構成です。',features:['見積明細を読みやすく整理','帳票番号で書類を識別','確認待ちなどのステータスを表示']}
};
const dialog = document.querySelector('#demo-dialog');
document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', () => {
  const demo = demos[button.dataset.demo];
  document.querySelector('#demo-title').textContent = demo.title;
  document.querySelector('#demo-description').textContent = demo.description;
  document.querySelector('#demo-features').replaceChildren(...demo.features.map(text => {const li = document.createElement('li');li.textContent = text;return li;}));
  dialog.showModal();
}));
document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {if(event.target === dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
document.querySelector('#year').textContent = new Date().getFullYear();
