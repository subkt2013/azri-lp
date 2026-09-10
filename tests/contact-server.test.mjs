import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=process.env.AZRI_LP_ROOT || fileURLToPath(new URL('../',import.meta.url));
const code=fs.readFileSync(path.join(root,'apps-script/Code.gs'),'utf8');
function setup(){
  let now=Date.now(), quota=100, busy=false, fail=false, released=0;
  const cache=new Map(), mails=[];
  class Clock extends Date {constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
  const ctx=vm.createContext({Date:Clock,CONTACT_FORM_HTML:'sample',
    CacheService:{getScriptCache:()=>({get:key=>cache.get(key)||null,put:(key,value)=>cache.set(key,value)})},
    LockService:{getScriptLock:()=>({tryLock:()=>!busy,releaseLock:()=>released++})},
    MailApp:{getRemainingDailyQuota:()=>quota,sendEmail:mail=>{mails.push(mail);if(fail)throw new Error('private provider error');}},
    Utilities:{getUuid:()=>crypto.randomUUID(),DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(alg,text)=>crypto.createHash(alg).update(text).digest(),base64EncodeWebSafe:buffer=>buffer.toString('base64url'),formatDate:()=> '2026-09-10 10:00:00'},
    HtmlService:{XFrameOptionsMode:{ALLOWALL:'ALLOWALL'},createHtmlOutput:text=>({text}),createTemplate:()=>({evaluate(){return {template:this,setTitle(){return this;},addMetaTag(){return this;},setXFrameOptionsMode(){return this;}};}})}
  });
  vm.runInContext(code,ctx);
  const token=ctx.createContactSession_(); now+=2000;
  const payload={name:'テスト担当',company:'',email:'sample@example.com',message:'これは模擬の問い合わせです。',consent:'同意する',_gotcha:'',token};
  return {ctx,cache,mails,payload,send:(p=payload)=>ctx.submitContact(p),advance:ms=>now+=ms,setQuota:q=>quota=q,setBusy:b=>busy=b,setFail:f=>fail=f,released:()=>released};
}
test('通知先は固定、返信先のみ入力メールを使用',()=>{const s=setup();const r=s.send({...s.payload,to:'attacker@example.com',subject:'override'});assert.equal(r.ok,true);assert.equal(s.mails.length,1);assert.equal(s.mails[0].to,'contact@azri-corp.com');assert.equal(s.mails[0].replyTo,'sample@example.com');assert.equal(s.mails[0].subject,'【AZRI】Webサイトからのお問い合わせ');assert.equal(s.mails[0].htmlBody,undefined);assert.equal(s.released(),1);});
test('同じトークン・内容の再送は受付済みを返し追加メールを送らない',()=>{const s=setup();assert.equal(s.send().ok,true);assert.equal(s.send().ok,true);assert.equal(s.mails.length,1);});
test('使用済みトークンで内容を書き換えても通知しない',()=>{const s=setup();s.send();assert.equal(s.send({...s.payload,message:'different'}).code,'USED');assert.equal(s.mails.length,1);});
test('無効な入力・同意なし・honeypotをサーバー側で拒否',()=>{for(const change of [{name:''},{company:5},{email:'bad'},{email:'x@example.com\nBcc: x@evil.com'},{message:' '},{message:'a'.repeat(5001)},{name:'a'.repeat(101)},{consent:false},{_gotcha:'bot'}]){const s=setup();assert.equal(s.send({...s.payload,...change}).code,'INVALID');assert.equal(s.mails.length,0);}});
test('本文の改行を維持し、名前やメールの制御文字を拒否',()=>{const s=setup();assert.equal(s.send({...s.payload,name:'test\nspoof'}).code,'INVALID');assert.equal(s.send({...s.payload,message:'一行目\n二行目\t補足'}).ok,true);assert.match(s.mails[0].body,/一行目\n二行目\t補足/);});
test('偽造・期限切れトークンは通知しない',()=>{const s=setup();assert.equal(s.send({...s.payload,token:'a'.repeat(64)}).code,'EXPIRED');s.cache.delete('session:'+s.payload.token);assert.equal(s.send().code,'EXPIRED');assert.equal(s.mails.length,0);});
test('ロック競合中は送信せずリトライできる',()=>{const s=setup();s.setBusy(true);assert.equal(s.send().code,'BUSY');assert.equal(s.mails.length,0);s.setBusy(false);assert.equal(s.send().ok,true);});
test('送信枠が残り10以下なら処理を止め、枠回復後は再送できる',()=>{const s=setup();s.setQuota(10);assert.equal(s.send().code,'LIMIT');assert.equal(s.mails.length,0);s.setQuota(100);assert.equal(s.send().ok,true);});
test('別トークンでも5秒以内の送信間隔を制限',()=>{const s=setup();const token=s.ctx.createContactSession_();s.advance(2000);s.send();assert.equal(s.send({...s.payload,token}).code,'BUSY');s.advance(5001);assert.equal(s.send({...s.payload,token}).ok,true);});
test('新しいページを即時送信しても受け付けない',()=>{const s=setup();const token=s.ctx.createContactSession_();assert.equal(s.send({...s.payload,token}).code,'BUSY');});
test('メール送信エラー時は結果不明を保持し、同じトークンで再送しない',()=>{const s=setup();s.setFail(true);assert.equal(s.send().code,'UNKNOWN');s.setFail(false);assert.equal(s.send().code,'UNKNOWN');assert.equal(s.mails.length,1);});
test('キャッシュにメールアドレスや問い合わせ本文を保存しない',()=>{const s=setup();s.send();const values=[...s.cache.values()].join('');assert.doesNotMatch(values,/sample@example|模擬の問い合わせ|テスト担当/);});
test('許可した親サイトだけにフォーム用セッションを発行する',()=>{const s=setup();const size=s.cache.size;const bad=s.ctx.doGet({parameter:{parentOrigin:'https://evil.example',frameId:crypto.randomUUID()}});assert.match(bad.text,/AZRI/);assert.equal(s.cache.size,size);const good=s.ctx.doGet({parameter:{parentOrigin:'https://azri-corp.com',frameId:crypto.randomUUID()}});assert.equal(good.template.parentOrigin,'https://azri-corp.com');assert.match(good.template.sessionToken,/^[a-f0-9]{64}$/);});
test('メール権限の確認だけではメールを送らない',()=>{const s=setup();assert.equal(s.ctx.authorizeContactMail(),100);assert.equal(s.mails.length,0);});
