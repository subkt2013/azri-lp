# 問い合わせフォームの接続（Google Apps Script）

## 現在の状態

AZRI専用の入力・確認・受付完了画面とGoogle Apps Scriptの通知処理を実装済み。会社アカウントでウェブアプリを公開し、URLを接続済みです。匿名アクセスでテスト1件の受付完了（MailApp成功）を確認しました。メールボックスでの到達確認は未実施です。

Formspreeは採用しません。既存のGoogle WorkspaceとApps Scriptを使用し、新しい有料サービスの契約は行いません。Googleの日次割当があるため、無制限ではありません。Workspaceの契約料金自体は継続します。

## 接続・更新手順

1. `node scripts/build-apps-script.mjs` で `apps-script/Form.html` と `apps-script/Deploy.gs` を生成します。
2. 会社管理のApps Scriptプロジェクト「AZRI お問い合わせ通知」のコード.gsにDeploy.gs全体を保存します。生成ファイルを直接編集せず、Code.gs・bridge.js・サイトのソースから再生成します。
3. `authorizeContactMail` を実行し、メール送信権限のみを承認します。この関数は残り割当の確認のみで、メールを送りません。必要ならプロジェクト設定でマニフェストを表示し、同梱appsscript.jsonの送信専用スコープと日本時間を設定します。
4. ウェブアプリとしてデプロイします。実行者は所有者、アクセスはログイン不要の全員。ソース編集の共有権限は変更しません。
5. 発行された `https://script.google.com/macros/s/.../exec` をcontact-config.jsのendpointへ設定します。公開URLだけを保存し、認証情報は保存しません。
6. テストと明記した問い合わせを1件送信し、受付成功とcontact@azri-corp.comへの実際の到達を別々に確認します。宛先のエイリアス・グループ受信設定は未確認です。
7. 接続確認後にGitHubと既存Sites確認用サイトへ反映します。ソース変更時はApps Scriptのデプロイも新バージョンへ更新します。

## 仕組みと制約

- 独自デザインのフォームをGoogle HtmlServiceのiframeで表示し、google.script.runで送信します。メールアプリやGoogleフォームへの遷移はありません。
- 宛先はサーバーでcontact@azri-corp.comに固定。入力メールは返信先だけに使用します。
- 名前100文字、会社150文字、メール254文字、本文5,000文字、同意、制御文字をサーバーでも検証します。
- 許可した親サイトとの接続確認が終わるまで入力できません。追加の公開ドメインが必要な場合はCode.gsのALLOWED_PARENTSを更新・再デプロイします。
- サーバー発行トークン、ロック、同一送信の重複抑止、honeypot、最短入力時間、全体5秒間隔、日次割当の10件留保を設けています。CAPTCHAはなく、全スパムを防げるわけではありません。
- キャッシュには状態・本文のハッシュだけを保存し、問い合わせ本文は保存しません。キャッシュは早期消失の可能性があり、その場合は受付を拒否します。
- 45秒で画面の待機を打ち切りますが、サーバー処理の停止は保証しません。自動再送せず、同じ画面・内容での再試行は同一トークンで受付状態を照会できます。再読み込み後の再送は重複する可能性があります。
- MailApp成功応答で受付完了を表示します。受信トレイへの到達保証ではありません。問い合わせデータはリポジトリ、ログ、ブラウザストレージへ保存しません。
- 未設定時はプレビューのみで送信できません。

## 検証

```powershell
npm install --prefix tests
node tests/contact-ui.test.mjs
node tests/contact-server.test.mjs
```

UI 11件・サーバー14件、計25件の模擬テストが通過しています。実環境のOAuth・iframe通信・メール到達の検証は別途必要です。

## Sites配信資材

既存8ファイルとcontact.css、contact-config.js、contact.js、contact-embed.jsの計12ファイルだけをoutへ配置します。apps-script、scripts、テスト、設定資料は含めません。既存project_id `appgprj_6a9ff31613008191baabee446baf9681` を再利用します。

参考: [割当](https://developers.google.com/apps-script/guides/services/quotas)、[ウェブアプリ](https://developers.google.com/apps-script/guides/web)、[HTMLとの通信](https://developers.google.com/apps-script/guides/html/communication)、[MailApp](https://developers.google.com/apps-script/reference/mail/mail-app)。

## 2026-09-10 接続確認

- Apps Scriptの有効なデプロイはバージョン2。実行者は会社アカウント所有者、アクセスは全員です。
- 匿名のブラウザで入力→確認→送信→受付完了を確認しました。テストは1件です。受信トレイへの到達は別途確認が必要です。
- Googleの複数アカウントログイン時に読み込みエラーが再現したため、credentialless iframeでCookieから分離しました。対応Chromeでフォーム接続を確認済みです。
- credentialless非対応ブラウザでは従来のiframeとして動作します。Google側の複数ログイン問題が残る可能性があり、読み込み失敗時にプライベートブラウズの案内を表示します。Safari実機は未検証です。
- テスト通知の件名は「【AZRI】Webサイトからのお問い合わせ」、本文に「動作確認テスト」と記載しています。
