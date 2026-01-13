# LINE Messaging API セットアップガイド

このガイドでは、LINE Messaging APIを使ってタスク・宿題の期限をLINEで通知する機能の設定方法を説明します。

> **注意**: LINE Notifyは2025年3月31日にサービス終了のため、LINE Messaging APIを使用します。

## 概要

- **毎日朝7時**に自動的にチェック
- 期限が**今日、明日、1週間前**のタスク・宿題を通知
- 通知タイミングはカスタマイズ可能
- **無料枠**: 月1000通まで（個人利用には十分）

## 前提条件

- Firebaseプロジェクトが作成済み
- Firebase Blaze プラン（従量課金制、無料枠あり）
- LINEアカウント

---

## セットアップ手順

### ステップ1: LINE Developers Consoleでチャネル作成

1. **[LINE Developers Console](https://developers.line.biz/console/)** にアクセス

2. 「ログイン」からLINEアカウントでログイン

3. 「プロバイダー」を作成
   - 「新規プロバイダー作成」をクリック
   - プロバイダー名を入力（例：学生タスク管理アプリ）
   - 「作成」をクリック

4. 「Messaging APIチャネル」を作成
   - 作成したプロバイダーをクリック
   - 「新規チャネル作成」→「Messaging API」を選択
   - 以下を入力：
     - **チャネル名**: タスク管理通知（任意の名前）
     - **チャネル説明**: タスク・宿題の期限通知
     - **カテゴリ**: 適切なカテゴリを選択
     - **サブカテゴリ**: 適切なサブカテゴリを選択
   - 利用規約に同意して「作成」

### ステップ2: Channel Access Tokenの取得

1. 作成したチャネルを開く

2. 「Messaging API設定」タブを選択

3. **Channel Access Token（長期）** を発行
   - 「発行」ボタンをクリック
   - 生成されたトークンをコピー（**一度しか表示されません**）

### ステップ3: Firebase環境変数にトークンを設定

ローカル環境で以下のコマンドを実行：

```bash
firebase functions:config:set line.channel_access_token="YOUR_CHANNEL_ACCESS_TOKEN"
```

`YOUR_CHANNEL_ACCESS_TOKEN`を、ステップ2でコピーしたトークンに置き換えてください。

### ステップ4: Cloud Functionsをデプロイ

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### ステップ5: LINE公式アカウントを友だち追加

1. LINE Developers Consoleの「Messaging API設定」タブで**QRコード**を表示

2. LINEアプリでQRコードをスキャンして友だち追加

3. 追加したアカウントに「登録」などのメッセージを送信

### ステップ6: User IDを取得する方法

各ユーザーのLINE User IDが必要です。取得方法は2つあります：

#### 方法A: Cloud Functionsのログから確認

Webhook関数を追加して、ユーザーがメッセージを送信したときにUser IDをログに出力します。

`functions/index.js`に以下を追加：

\`\`\`javascript
// User ID取得用Webhook（開発用）
exports.lineWebhook = functions
  .region('asia-northeast1')
  .https.onRequest(async (req, res) => {
    const events = req.body.events || [];

    for (const event of events) {
      if (event.type === 'message') {
        const userId = event.source.userId;
        console.log(\`LINE User ID: \${userId}\`);

        // User IDを自動返信
        await sendLineMessage(userId, [
          \`あなたのUser ID:\n\${userId}\n\nこのIDをアプリの設定画面に入力してください。\`
        ]);
      }
    }

    res.status(200).send('OK');
  });
\`\`\`

デプロイ後：
1. デプロイされた関数のURL(`https://asia-northeast1-task-sainou.cloudfunctions.net/lineWebhook`)をLINE Developers Consoleの「Webhook URL」に設定
2. 「Webhookの利用」をON
3. ユーザーがLINE公式アカウントに「ID」などとメッセージ送信
4. 自動的にUser IDが返信される

#### 方法B: 管理者が手動で確認

1. LINE Developers Consoleで「Webhookの利用」をON
2. Webhook URLを一時的に設定
3. ユーザーがメッセージを送信
4. Firebase Functions のログ(`firebase functions:log`)でUser IDを確認

### ステップ7: アプリでUser IDを設定

1. `https://task-sainou.web.app` にアクセス
2. ログイン
3. 「設定」タブを開く
4. 取得したLINE User IDを入力
5. 「保存」をクリック
6. 「テスト通知を送信」で動作確認

---

## 通知の仕組み

\`\`\`
毎日 7:00 (日本時間)
   ↓
Cloud Scheduler が sendDailyReminders を起動
   ↓
Firestoreから各ユーザーのタスク・宿題を取得
   ↓
期限が近いものを抽出
   ↓
LINE Messaging API でプッシュメッセージ送信
   ↓
ユーザーのLINE に通知が届く 📱
\`\`\`

## 料金について

### LINE Messaging API

- **無料枠**: 月1000通のプッシュメッセージ
- **この使い方の場合**: 1日1回 × 30日 = 月30通
- **結論**: 無料枠内で十分

### Firebase Cloud Functions

- **無料枠**: 月200万回の関数実行
- **この使い方の場合**: 1日1回 × 30日 = 月30回
- **結論**: 無料枠内で十分

---

## トラブルシューティング

### 通知が届かない

1. **User IDの確認**
   - 正しい形式か確認（U + 32文字の英数字）
   - アプリの設定画面で保存されているか確認

2. **Channel Access Tokenの確認**
   \`\`\`bash
   firebase functions:config:get
   \`\`\`
   で設定されているか確認

3. **友だち追加の確認**
   - LINE公式アカウントが友だちに追加されているか確認
   - ブロックしていないか確認

4. **Cloud Functionsのログ確認**
   \`\`\`bash
   firebase functions:log
   \`\`\`

### デプロイエラー

- **Blazeプランか確認**: Firebase Consoleで確認
- **環境変数が設定されているか確認**:
  \`\`\`bash
  firebase functions:config:get
  \`\`\`
- **依存関係エラー**: `cd functions && npm install`

---

## 温室管理への応用

この仕組みは温室の温度・湿度管理にも応用できます：

\`\`\`javascript
// 温度チェック関数（例）
exports.checkTemperature = functions
  .region('asia-northeast1')
  .pubsub.schedule('every 10 minutes')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    // IoTデバイスから温度を取得
    const temp = await getTemperatureFromSensor();

    if (temp > 30) {
      // 管理者のUser IDにメッセージ送信
      await sendLineMessage(ADMIN_USER_ID, [{
        type: 'text',
        text: \`⚠️ 温室の温度が高すぎます: \${temp}°C\`
      }]);
    }

    if (temp < 10) {
      await sendLineMessage(ADMIN_USER_ID, [{
        type: 'text',
        text: \`❄️ 温室の温度が低すぎます: \${temp}°C\`
      }]);
    }
  });
\`\`\`

---

## 参考リンク

- [LINE Messaging API ドキュメント](https://developers.line.biz/ja/docs/messaging-api/)
- [LINE Messaging API リファレンス](https://developers.line.biz/ja/reference/messaging-api/)
- [Firebase Cloud Functions ドキュメント](https://firebase.google.com/docs/functions)
- [LINE Notify 終了のお知らせ](https://notify-bot.line.me/closing-announce)

---

## まとめ

LINE Messaging APIを使うことで：
- ✅ LINE Notify終了後も安心して使える
- ✅ より多機能（ボタン、画像、Flex Message等）
- ✅ 公式サポートで長期的に使える
- ✅ 無料枠で個人利用には十分
- ✅ 温室管理など他の用途にも応用可能
