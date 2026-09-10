# AZRI Landing Page & Interactive Demos

AZRIの会社LPと、業務の流れを操作できる3つの自主開発デモです。

## 確認用サイト

https://azri-mobile-preview.kaztate-0119.chatgpt.site

本人限定。所有者と同じChatGPTアカウントでログインすると、携帯回線からも閲覧できます。

## デモの内容

| 画面 | 体験できる操作 |
| --- | --- |
| BARBER FLOW — 予約・顧客管理 | 担当者別カレンダー、日付移動、担当者の絞り込み、予約登録・変更・キャンセル、施術時間の重複検出、当日の来店受付・施術完了、顧客検索・カルテ保存 |
| CLEAR — 経費申請・承認 | 申請一覧・検索・状態別表示、新規申請、架空の領収書確認、承認、理由必須の差戻し、操作履歴、表示中の申請をCSV出力 |
| QUOTA — 見積作成 | 見積の作成・複製、複数明細・品目追加、数量・単価・値引き・税率の変更、見積書プレビュー、発行後の編集ロック、印刷・PDF保存 |

### 操作上のルール

- すべて架空データを使う体験デモ。外部送信・DB接続・サーバー保存は行いません。
- データはページ内のメモリに保持します。デモ切替中は保持し、再読み込みまたはリセットで初期状態へ戻ります。
- 予約は登録済みの架空顧客から選びます。09:00〜19:00の営業時間と施術所要時間で重複を判定します。
- 来店受付・施術完了は当日の予約のみ。完了時に来店回数と最終来店日が更新されます。
- 経費は領収書未添付のまま承認できません。実ファイルのアップロードは行わず、選択に応じてサンプル領収書を表示します。
- 見積の消費税は値引き後の合計に対して計算し、1円未満を切り捨てます。発行はデモ内の状態変更で、顧客への送信ではありません。
- PDF保存はブラウザの印刷機能を使います。出力には架空データのサンプル表記が入ります。

## 技術構成

HTML / CSS / JavaScript ES Modules。デモは外部API不要。問い合わせフォームはGoogle Apps Scriptに接続する構成で、公開URLを接続済みです。

| ファイル | 役割 |
| --- | --- |
| `index.html` / `style.css` / `script.js` | 会社LP・デモ一覧 |
| `demos.html` / `demos.css` / `demos.js` | 3つの業務画面と操作 |
| `demo-core.mjs` | 架空データ・予約検証・状態遷移・見積計算 |
| `azri-logo.png` | 支給ロゴ |
| `tests/` | 業務ロジック16項目とDOM操作12項目のテスト |

## ローカル確認

ES Modulesを使うため、ファイルの直接表示ではなくHTTPサーバーで配信します。

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

- LP: `http://127.0.0.1:8000`
- 予約: `http://127.0.0.1:8000/demos.html?app=booking`
- 経費: `http://127.0.0.1:8000/demos.html?app=approval`
- 見積: `http://127.0.0.1:8000/demos.html?app=estimate`

## テスト

Node.js 24以降を使用します。

```powershell
npm install --prefix tests
node --test --test-force-exit tests/demo-core.test.mjs tests/demo-ui.test.mjs
```

DOM操作テストはjsdomによるシミュレーションです。実機ブラウザの描画・タッチ・印刷画面を検証したものではありません。

## 配信の更新

正本はこのリポジトリです。確認用サイトへの自動反映はありません。

- Sites project_id: `appgprj_6a9ff31613008191baabee446baf9681`
- 配信用作業領域: `C:/Users/subkt/AppData/Local/Temp/azri-mobile-preview`
- 接続確認後、既存8ファイルとcontact.css・contact-config.js・contact.js・contact-embed.jsの計12ファイルだけを作業領域の `out/` へコピーし、同じSitesプロジェクトを更新します。
- 一時領域が失われても、新しいサイトを作成せず上記project_idを再利用します。
- `.openai/hosting.json` の `static.directory` は `out`。認証情報は保存しません。

問い合わせ先は contact@azri-corp.com。専用フォームの入力・確認・受付完了画面を実装済み。Google Apps Scriptへの実送信と受付完了を確認済みです。受信トレイへの到達は未確認です。接続手順・スパム設定・検証は [CONTACT_SETUP.md](CONTACT_SETUP.md) を参照してください。

一般公開前には、会社情報・プライバシー表記を確定し、実際のPC・スマートフォンで表示を確認します。
