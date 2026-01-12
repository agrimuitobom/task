# LINE通知設定ガイド

このガイドでは、タスクや宿題の期限をLINEで通知する機能の設定方法を説明します。

## 概要

- **毎日朝7時**に自動的にチェック
- 期限が**今日、明日、1週間前**のタスク・宿題を通知
- 通知タイミングはカスタマイズ可能

## セットアップ手順

### 1. LINE Notifyトークンの取得

1. [LINE Notify](https://notify-bot.line.me/)にアクセス
2. 右上の「ログイン」からLINEアカウントでログイン
3. 「マイページ」をクリック
4. 「トークンを発行する」をクリック
5. トークン名を入力（例：タスク管理アプリ）
6. 通知先を選択：
   - **「1:1でLINE Notifyから通知を受け取る」**を選択（推奨）
   - または特定のグループを選択
7. 「発行する」をクリック
8. **トークンをコピー**（一度しか表示されません！）

### 2. アプリにトークンを設定

1. アプリにログイン
2. 「設定」タブを開く
3. LINE Notifyトークンの入力欄にコピーしたトークンを貼り付け
4. 「保存」ボタンをクリック

### 3. 通知タイミングの設定

デフォルトでは以下のタイミングで通知されます：
- **当日**: 期限が今日のタスク・宿題
- **前日**: 期限が明日のタスク・宿題
- **1週間前**: 期限が7日後のタスク・宿題

設定画面でチェックボックスを変更して、通知タイミングをカスタマイズできます。

### 4. テスト通知

1. 設定画面の「テスト通知を送信」ボタンをクリック
2. LINEに通知が届くことを確認

## Cloud Functionsのデプロイ

LINE通知機能を使うには、Firebase Cloud Functionsをデプロイする必要があります。

### 前提条件

- Firebase Blaze プラン（従量課金制、無料枠あり）が必要
- Firebase CLIがインストール済み

### デプロイ手順

1. **Firebase Blazeプランにアップグレード**

   [Firebase Console](https://console.firebase.google.com/project/task-sainou/usage/details)でプランをアップグレード

   **重要**: 無料枠（月200万回の関数実行）があるので、個人利用なら課金されることはほぼありません。

2. **Cloud Schedulerを有効化**

   ```bash
   gcloud scheduler jobs create pubsub daily-reminder \
       --schedule="0 7 * * *" \
       --time-zone="Asia/Tokyo" \
       --topic="firebase-schedule-sendDailyReminders" \
       --message-body="{}"
   ```

3. **Functionsをデプロイ**

   ```bash
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
   ```

4. **デプロイ完了**

   以下のようなURLが表示されます：
   ```
   Function URL (sendDailyReminders):
   https://asia-northeast1-task-sainou.cloudfunctions.net/sendDailyReminders

   Function URL (testReminder):
   https://asia-northeast1-task-sainou.cloudfunctions.net/testReminder
   ```

### スケジュール設定の確認

Firebase Consoleで確認：
1. [Functions](https://console.firebase.google.com/project/task-sainou/functions)を開く
2. `sendDailyReminders`が表示されていることを確認
3. スケジュール: 毎日 7:00 (Asia/Tokyo)

## 通知の仕組み

```
毎日 7:00 (日本時間)
   ↓
Cloud Scheduler が起動
   ↓
sendDailyReminders 関数が実行
   ↓
全ユーザーのタスク・宿題をチェック
   ↓
期限が近いものを抽出
   ↓
LINE Notify API経由で通知
   ↓
あなたのLINEに通知が届く
```

## 料金について

### Firebase Cloud Functions

- **無料枠**: 月200万回の関数実行
- **この使い方の場合**: 1日1回 × 30日 = 月30回
- **結論**: ほぼ確実に無料枠内

### LINE Notify

- **完全無料**: 通知回数に制限なし

## トラブルシューティング

### 通知が届かない

1. **トークンの確認**
   - 設定画面でトークンが「設定済み」になっているか確認
   - トークンが正しいか再確認

2. **Cloud Functionsのログ確認**
   ```bash
   firebase functions:log
   ```

3. **手動テスト**
   - 設定画面の「テスト通知を送信」で動作確認

### デプロイエラー

- **Blazeプランか確認**: Firebase Consoleで確認
- **権限エラー**: `firebase login`で再ログイン
- **依存関係エラー**: `cd functions && npm install`

## 温室管理への応用

この仕組みは温室の温度・湿度管理にも応用できます：

1. **センサーデータをFirestoreに保存**
2. **Cloud Functionで定期チェック**
3. **閾値を超えたらLINE通知**

例：
```javascript
// 温度チェック関数（参考）
exports.checkTemperature = functions
  .pubsub.schedule('every 10 minutes')
  .onRun(async (context) => {
    const temp = await getTemperature(); // センサーから取得
    if (temp > 30 || temp < 10) {
      await sendLineNotification(token, `⚠️ 温室の温度異常: ${temp}°C`);
    }
  });
```

## サポート

問題が発生した場合：
1. Firebase Consoleのログを確認
2. ブラウザの開発者ツール（F12）でエラーを確認
3. [Firebase Functions ドキュメント](https://firebase.google.com/docs/functions)を参照
