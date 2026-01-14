# Cloud Functions デプロイ手順

このガイドでは、LINE通知機能を有効にするためのCloud Functionsデプロイ手順を説明します。

## ステップ1: Firebase Blazeプランへアップグレード ⚡

### なぜBlazeプランが必要？

Cloud FunctionsでLINE APIなどの外部ネットワークへのアクセスには、Blazeプラン（従量課金制）が必要です。

### 料金について（安心してください！）

**無料枠が非常に大きい**ため、個人利用では**実質無料**です：

| サービス | 無料枠 | あなたの使用量 | 実際の費用 |
|---------|--------|---------------|-----------|
| Cloud Functions | 月200万回 | 月30回（1日1回） | **¥0** |
| LINE Messaging API | 月1000通 | 月30通 | **¥0** |

**結論**: 両方とも無料枠内で十分使えます！

### アップグレード手順

1. 以下のURLにアクセス：
   ```
   https://console.firebase.google.com/project/task-sainou/usage/details
   ```

2. 「プランをアップグレード」または「Upgrade」ボタンをクリック

3. クレジットカード情報を入力
   - Google Cloudアカウントに紐付けられます
   - 無料枠を超えた場合のみ課金されます
   - 予算アラートを設定できます（推奨: ¥500/月）

4. 「アップグレード」を完了

5. 数分待ってから次のステップへ

---

## ステップ2: 最新コードを取得

ターミナルで以下を実行：

```bash
cd ~/task
git pull origin claude/student-task-manager-app-NXz5y
```

これで `functions/` ディレクトリが取得できます。

確認：
```bash
ls -la functions/
```

以下が表示されればOK：
- `index.js`
- `package.json`

---

## ステップ3: Cloud Functions依存関係をインストール

```bash
cd ~/task/functions
npm install
cd ..
```

これで `firebase-functions`, `firebase-admin`, `node-fetch` がインストールされます。

---

## ステップ4: LINE Channel Access Tokenを設定

### 4-1: Channel Access Tokenを取得（まだの場合）

1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス

2. 作成したMessaging APIチャネルを開く

3. 「Messaging API設定」タブを選択

4. 下にスクロールして「**Channel Access Token (長期)**」セクションを見つける

5. 「発行」ボタンをクリック

6. 生成されたトークンをコピー（**一度しか表示されません！**）
   - 形式: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...` （長い文字列）

### 4-2: Firebaseにトークンを設定

ターミナルで以下を実行（`YOUR_TOKEN_HERE`を実際のトークンに置き換え）：

```bash
firebase functions:config:set line.channel_access_token="YOUR_TOKEN_HERE"
```

成功すると：
```
✔ Functions config updated.
```

確認：
```bash
firebase functions:config:get
```

以下のように表示されればOK：
```json
{
  "line": {
    "channel_access_token": "your-token-here..."
  }
}
```

---

## ステップ5: Cloud Functionsをデプロイ 🚀

```bash
cd ~/task
firebase deploy --only functions
```

デプロイには数分かかります。以下のように表示されれば成功：

```
✔ Deploy complete!

Functions:
  sendDailyReminders(asia-northeast1)
  testReminder(asia-northeast1)
```

---

## ステップ6: LINE公式アカウントを友だち追加

1. LINE Developers Consoleの「Messaging API設定」タブを開く

2. **QRコード**セクションを見つける

3. スマートフォンのLINEアプリで QRコードをスキャン

4. 友だち追加

5. 追加したアカウントに「登録」などのメッセージを送信（何でもOK）

---

## ステップ7: LINE User IDを取得

### 方法: Webhook関数を追加（推奨）

#### 7-1: Webhook関数を追加

`functions/index.js` の**最後**に以下のコードを追加：

```javascript
/**
 * User ID取得用Webhook（開発用）
 */
exports.lineWebhook = functions
  .region('asia-northeast1')
  .https.onRequest(async (req, res) => {
    const events = req.body.events || [];

    for (const event of events) {
      if (event.type === 'message') {
        const userId = event.source.userId;
        console.log(`LINE User ID: ${userId}`);

        // User IDを自動返信
        await sendLineMessage(userId, [{
          type: 'text',
          text: `あなたのUser ID:\n${userId}\n\nこのIDをアプリの設定画面に入力してください。`
        }]);
      }
    }

    res.status(200).send('OK');
  });
```

#### 7-2: 再デプロイ

```bash
firebase deploy --only functions
```

#### 7-3: Webhook URLを設定

1. デプロイ完了後、関数のURLを確認：
   ```
   https://asia-northeast1-task-sainou.cloudfunctions.net/lineWebhook
   ```

2. LINE Developers Consoleで「Messaging API設定」タブを開く

3. **Webhook URL**セクションに上記URLを入力

4. 「検証」をクリック（成功と表示されればOK）

5. **「Webhookの利用」をONにする**

6. **「応答メッセージ」をOFFにする**（重要！）

#### 7-4: User IDを取得

1. LINEアプリで、友だち追加したアカウントに「ID」などのメッセージを送信

2. 数秒後、Bot からあなたのUser IDが返信されます
   ```
   あなたのUser ID:
   Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

   このIDをアプリの設定画面に入力してください。
   ```

3. このUser IDをコピー

---

## ステップ8: アプリでUser IDを設定

1. ブラウザで `https://task-sainou.web.app` にアクセス

2. Googleアカウントでログイン

3. 「設定」タブを開く

4. 「LINE User ID」欄にコピーしたUser IDを入力

5. 「保存」をクリック

6. 「テスト通知を送信」をクリック

7. LINEに通知が届けば成功！🎉

---

## ステップ9: 動作確認

### テスト通知を送信

ブラウザで以下のURLにアクセス（`YOUR_FIREBASE_USER_ID`を実際のFirebase User IDに置き換え）：

```
https://asia-northeast1-task-sainou.cloudfunctions.net/testReminder?userId=YOUR_FIREBASE_USER_ID
```

**Firebase User IDの確認方法**:
- ブラウザの開発者ツール（F12）→ Consoleタブで確認できます
- または Firestore Consoleの `users` コレクションで確認

### 自動リマインダーのスケジュール確認

Firebase Consoleで確認：
1. [Firebase Console](https://console.firebase.google.com/project/task-sainou/functions) にアクセス
2. Cloud Schedulerセクションで `sendDailyReminders` が有効か確認
3. スケジュール: 毎日 7:00 AM（日本時間）

---

## トラブルシューティング

### Q: 通知が届かない

**A: 以下を確認**
1. User IDが正しいか（U + 32文字）
2. Channel Access Tokenが設定されているか（`firebase functions:config:get`）
3. LINE公式アカウントを友だち追加しているか
4. ブロックしていないか
5. Cloud Functionsのログを確認（`firebase functions:log`）

### Q: デプロイエラーが出る

**A: 以下を試す**
1. Blazeプランにアップグレード済みか確認
2. `cd functions && npm install` を再実行
3. `firebase login` でログイン状態を確認
4. `firebase use task-sainou` でプロジェクトを確認

### Q: Webhook URLの検証が失敗する

**A: 以下を確認**
1. 関数が正しくデプロイされているか（`firebase functions:list`）
2. URLが正しいか（https://asia-northeast1-task-sainou.cloudfunctions.net/lineWebhook）
3. 数分待ってから再試行

---

## 完了チェックリスト

- [ ] Firebase Blazeプランにアップグレード
- [ ] `git pull` で最新コードを取得
- [ ] `npm install` で依存関係をインストール
- [ ] Channel Access Tokenを設定
- [ ] Cloud Functionsをデプロイ
- [ ] LINE公式アカウントを友だち追加
- [ ] User IDを取得
- [ ] アプリでUser IDを設定
- [ ] テスト通知が届くことを確認

---

## 次のステップ

設定が完了したら：
1. タスクや宿題を登録
2. 期限を設定（今日、明日、1週間後など）
3. 毎朝7時に自動でLINE通知が届きます！

将来的には温室の温度・湿度管理にも同じ仕組みを応用できます。

---

## 参考情報

- [LINE Messaging API ドキュメント](https://developers.line.biz/ja/docs/messaging-api/)
- [Firebase Cloud Functions ドキュメント](https://firebase.google.com/docs/functions)
- [Firebase料金](https://firebase.google.com/pricing)
