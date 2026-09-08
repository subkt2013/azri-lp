export const services = [
  {id:'cut',name:'カット',minutes:60,price:5500},
  {id:'color',name:'カット＋カラー',minutes:120,price:12500},
  {id:'care',name:'カット＋ヘッドスパ',minutes:90,price:8800}
];
export const staff = [{id:'haru',name:'HARU',role:'スタイリスト',color:'teal'},{id:'ren',name:'REN',role:'スタイリスト',color:'blue'},{id:'ao',name:'AO',role:'トップスタイリスト',color:'violet'}];
export const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const shiftDate = (date, days) => { const d=new Date(date+'T12:00:00'); d.setDate(d.getDate()+days); return localDate(d); };
export const minutes = time => Number(time.split(':')[0])*60+Number(time.split(':')[1]);
export const clock = n => `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
export const money = n => new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(n);
export function initialState(today=localDate()) {
  return {
    today,
    customers:[
      {id:'c1',name:'顧客 A01',kana:'こきゃく A01',visits:8,last:shiftDate(today,-28),note:'襟足は短め。前髪は目にかからない長さ。仕上げは軽めのワックス。',tag:'リピーター'},
      {id:'c2',name:'顧客 B02',kana:'こきゃく B02',visits:3,last:shiftDate(today,-42),note:'落ち着いたブラウンを希望。カラーの色味をカウンセリングで確認。',tag:'カラー相談'},
      {id:'c3',name:'顧客 C03',kana:'こきゃく C03',visits:12,last:shiftDate(today,-30),note:'サイドはすっきり、トップは長さを残す。',tag:'リピーター'},
      {id:'c4',name:'顧客 D04',kana:'こきゃく D04',visits:0,last:null,note:'初回来店。ご希望のスタイルを写真で確認する。',tag:'初回来店'},
      {id:'c5',name:'顧客 E05',kana:'こきゃく E05',visits:5,last:shiftDate(today,-35),note:'ヘッドスパは弱めの力加減を希望。',tag:'スパ利用'},
      {id:'c6',name:'顧客 F06',kana:'こきゃく F06',visits:2,last:shiftDate(today,-40),note:'自然なシルエット。スタイリング方法を最後にご案内。',tag:'リピーター'}
    ],
    bookings:[
      {id:'b1',customer:'c1',date:today,time:'09:30',staff:'haru',service:'cut',status:'done',source:'Web',note:''},
      {id:'b2',customer:'c2',date:today,time:'10:00',staff:'ren',service:'color',status:'arrived',source:'電話',note:'色見本を用意'},
      {id:'b3',customer:'c3',date:today,time:'11:00',staff:'haru',service:'care',status:'confirmed',source:'Web',note:''},
      {id:'b4',customer:'c4',date:today,time:'13:00',staff:'ao',service:'cut',status:'confirmed',source:'電話',note:'初回カウンセリングあり'},
      {id:'b5',customer:'c5',date:today,time:'14:00',staff:'ren',service:'care',status:'confirmed',source:'Web',note:''},
      {id:'b6',customer:'c6',date:today,time:'15:30',staff:'haru',service:'cut',status:'confirmed',source:'店頭',note:''},
      {id:'b7',customer:'c1',date:shiftDate(today,1),time:'11:00',staff:'ao',service:'care',status:'confirmed',source:'電話',note:''}
    ],
    expenses:[
      {id:'EXP-024',title:'商談用ヘッドセット',person:'デモ社員 A',dept:'営業部',category:'備品',amount:18000,date:today,status:'pending',reason:'オンライン商談用のヘッドセット2台。既存機器の音声不良による買い替え。',vendor:'デモ・オフィス用品店',receipt:true,history:[{text:'営業部から申請',at:'09:15'}]},
      {id:'EXP-023',title:'顧客訪問の交通費',person:'デモ社員 B',dept:'開発部',category:'交通費',amount:2460,date:today,status:'pending',reason:'要件定義の訪問打合せ。往復の鉄道運賃。',vendor:'デモ鉄道',receipt:true,history:[{text:'開発部から申請',at:'08:50'}]},
      {id:'EXP-022',title:'チーム研修の書籍',person:'デモ社員 C',dept:'開発部',category:'研修費',amount:13200,date:shiftDate(today,-1),status:'pending',reason:'設計レビュー勉強会で利用する書籍を3冊購入。',vendor:'デモ書店',receipt:false,history:[{text:'開発部から申請',at:'昨日 16:40'}]},
      {id:'EXP-021',title:'定例会議の会議室',person:'デモ社員 D',dept:'管理部',category:'会議費',amount:8800,date:shiftDate(today,-1),status:'approved',reason:'全体定例会議の会議室利用料。',vendor:'デモ会議室',receipt:true,history:[{text:'管理部から申請',at:'昨日 10:00'},{text:'承認済み：利用目的を確認',at:'昨日 11:20'}]},
      {id:'EXP-020',title:'外部セミナー参加費',person:'デモ社員 B',dept:'開発部',category:'研修費',amount:22000,date:shiftDate(today,-2),status:'returned',reason:'業務システム設計セミナーの参加費。',vendor:'デモ研修センター',receipt:false,history:[{text:'開発部から申請',at:'2日前'},{text:'差戻し：領収書を添付してください。',at:'昨日 14:10'}]}
    ],
    quotes:[{id:'Q-2026-008',client:'株式会社サンプル商事',title:'営業部向け業務端末の導入',date:today,valid:shiftDate(today,30),status:'draft',discount:0,tax:10,note:'納期：ご発注から約2週間\nお支払い：納品月の翌月末払い\n送料・初期設定費用を含みます。',lines:[{id:'l1',name:'業務用タブレット',quantity:3,unit:'台',price:50000},{id:'l2',name:'端末キッティング・初期設定',quantity:3,unit:'台',price:8000},{id:'l3',name:'導入トレーニング',quantity:1,unit:'式',price:30000}]},
      {id:'Q-2026-007',client:'合同会社デモデザイン',title:'制作チームの端末追加',date:shiftDate(today,-3),valid:shiftDate(today,27),status:'issued',discount:5000,tax:10,note:'納期：ご発注から約2週間',lines:[{id:'l4',name:'業務用タブレット',quantity:2,unit:'台',price:50000}]}],
    nextId:30
  };
}
export function saveBooking(state, input, id=null) {
  const service=services.find(x=>x.id===input.service);
  if(!service || !staff.some(x=>x.id===input.staff) || !state.customers.some(x=>x.id===input.customer)) throw new Error('顧客・担当者・メニューを選択してください。');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(Date.parse(input.date+'T12:00:00')) || localDate(new Date(input.date+'T12:00:00'))!==input.date || input.date<state.today) throw new Error('今日以降の有効な日付を選択してください。');
  if(!/^\d{2}:(00|30)$/.test(input.time)) throw new Error('開始時刻は30分単位で選択してください。');
  const start=minutes(input.time),end=start+service.minutes;
  if(start<540 || end>1140) throw new Error('施術が営業時間（09:00〜19:00）内に収まる時刻を選択してください。');
  const existing=id?state.bookings.find(x=>x.id===id):null;
  if(id && (!existing || existing.status!=='confirmed')) throw new Error('変更できるのは来店前の予約です。');
  if(state.bookings.some(b=>b.id!==id && b.status!=='cancelled' && b.date===input.date && b.staff===input.staff && start<minutes(b.time)+services.find(s=>s.id===b.service).minutes && end>minutes(b.time))) throw new Error('担当者の予約と施術時間が重なっています。別の時刻か担当者を選択してください。');
  const item={...input,note:String(input.note||'').slice(0,300),id:id||'b'+state.nextId++,status:existing?.status||'confirmed'};
  if(existing) Object.assign(existing,item); else state.bookings.push(item);
  return item;
}
export function transitionBooking(state,id,action) {
  const b=state.bookings.find(x=>x.id===id);
  if(!b) throw new Error('予約が見つかりません。');
  const expected={arrived:'confirmed',done:'arrived',cancelled:'confirmed'};
  if(b.status!==expected[action]) throw new Error('この状態では操作できません。');
  if(action!=='cancelled' && b.date!==state.today) throw new Error('来店受付・施術完了は今日の予約で操作できます。');
  b.status=action;
  if(action==='done') {const c=state.customers.find(c=>c.id===b.customer);c.visits++;c.last=b.date;}
  return b;
}
export function decideExpense(state,id,decision,comment='') {
  const e=state.expenses.find(x=>x.id===id);
  if(!e || e.status!=='pending' || !['approved','returned'].includes(decision)) throw new Error('承認待ちの申請を選択してください。');
  if(decision==='returned' && !comment.trim()) throw new Error('差戻し理由を入力してください。');
  if(decision==='approved' && !e.receipt) throw new Error('領収書が未添付です。理由を添えて差し戻してください。');
  e.status=decision;e.history.push({text:(decision==='approved'?'承認済み':'差戻し')+(comment.trim()?'：'+comment.trim():''),at:'たった今'});return e;
}
export function quoteTotals(q) {
  if(!q.lines.length || q.lines.length>30) throw new Error('明細は1〜30行で入力してください。');
  let subtotal=0;
  for(const l of q.lines) {
    if(!l.name.trim() || !Number.isInteger(l.quantity) || l.quantity<1 || l.quantity>10000 || !Number.isInteger(l.price) || l.price<0 || l.price>100000000) throw new Error('品名・数量・単価を確認してください。数量は1〜10,000、単価は0〜100,000,000円の整数です。');
    subtotal+=l.quantity*l.price;
  }
  if(!Number.isInteger(q.discount) || q.discount<0 || q.discount>subtotal) throw new Error('値引きは小計以下の整数で入力してください。');
  if(![0,8,10].includes(q.tax)) throw new Error('税率を選択してください。');
  const taxable=subtotal-q.discount,tax=Math.floor(taxable*q.tax/100);
  return {subtotal,discount:q.discount,taxable,tax,total:taxable+tax};
}
export function issueQuote(q) {
  if(q.status!=='draft') throw new Error('この見積は発行済みです。');
  if(!q.client.trim() || !q.title.trim() || !q.date || !q.valid || q.valid<q.date) throw new Error('宛先・件名・発行日・有効期限を確認してください。');
  quoteTotals(q);q.status='issued';return q;
}
export function csvCell(value) {const s=String(value);return '"'+(/^[=+@\-\t\r]/.test(s)?"'":'')+s.replaceAll('"','""')+'"';}
