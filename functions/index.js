const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();

// LINE Notify APIエンドポイント
const LINE_NOTIFY_API = 'https://notify-api.line.me/api/notify';

/**
 * 毎日朝7時に実行される定期タスク
 * 各ユーザーの期限が近いタスク・宿題をLINEで通知
 */
exports.sendDailyReminders = functions
  .region('asia-northeast1')
  .pubsub.schedule('0 7 * * *') // 毎日7:00 (日本時間は+9時間でFirebase設定で調整)
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    console.log('Daily reminder check started');

    try {
      const db = admin.firestore();
      const usersSnapshot = await db.collection('users').get();

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        await checkAndNotifyUser(userId);
      }

      console.log('Daily reminder check completed');
      return null;
    } catch (error) {
      console.error('Error in daily reminder:', error);
      throw error;
    }
  });

/**
 * ユーザーごとに期限をチェックして通知
 */
async function checkAndNotifyUser(userId) {
  const db = admin.firestore();

  try {
    // ユーザーのLINE Notifyトークンを取得
    const settingsDoc = await db
      .collection('users')
      .doc(userId)
      .collection('settings')
      .doc('notifications')
      .get();

    if (!settingsDoc.exists || !settingsDoc.data().lineToken) {
      console.log(`User ${userId}: No LINE token configured`);
      return;
    }

    const lineToken = settingsDoc.data().lineToken;
    const notificationSettings = settingsDoc.data();

    // Todos取得
    const todosDoc = await db
      .collection('users')
      .doc(userId)
      .collection('data')
      .doc('todos')
      .get();

    const todos = todosDoc.exists ? todosDoc.data().items || [] : [];

    // Homework取得
    const homeworkDoc = await db
      .collection('users')
      .doc(userId)
      .collection('data')
      .doc('homework')
      .get();

    const homework = homeworkDoc.exists ? homeworkDoc.data().items || [] : [];

    // 通知が必要なアイテムをチェック
    const notifications = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Todosをチェック
    todos.forEach(todo => {
      if (todo.completed || !todo.date) return;

      const todoDate = new Date(todo.date);
      todoDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((todoDate - today) / (1000 * 60 * 60 * 24));

      if (shouldNotify(diffDays, notificationSettings)) {
        notifications.push({
          type: 'タスク',
          text: todo.text,
          date: todo.date,
          daysUntil: diffDays
        });
      }
    });

    // Homeworkをチェック
    homework.forEach(hw => {
      if (hw.completed || !hw.deadline) return;

      const hwDate = new Date(hw.deadline);
      hwDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((hwDate - today) / (1000 * 60 * 60 * 24));

      if (shouldNotify(diffDays, notificationSettings)) {
        notifications.push({
          type: '宿題',
          subject: hw.subject,
          text: hw.content,
          date: hw.deadline,
          daysUntil: diffDays
        });
      }
    });

    // 通知を送信
    if (notifications.length > 0) {
      await sendLineNotification(lineToken, notifications);
      console.log(`User ${userId}: Sent ${notifications.length} notifications`);
    } else {
      console.log(`User ${userId}: No notifications to send`);
    }

  } catch (error) {
    console.error(`Error checking user ${userId}:`, error);
  }
}

/**
 * 通知すべきかどうかを判定
 */
function shouldNotify(daysUntil, settings) {
  // デフォルト設定: 今日、明日、1週間前
  const defaultDays = [0, 1, 7];
  const notifyDays = settings?.notifyDays || defaultDays;

  return notifyDays.includes(daysUntil);
}

/**
 * LINE Notifyで通知を送信
 */
async function sendLineNotification(token, notifications) {
  let message = '\n📚 タスク・宿題リマインダー\n';

  notifications.forEach(item => {
    const dayText = getDayText(item.daysUntil);

    if (item.type === 'タスク') {
      message += `\n📝 ${item.text}\n期限: ${item.date} (${dayText})\n`;
    } else {
      message += `\n📚 ${item.subject}: ${item.text}\n期限: ${item.date} (${dayText})\n`;
    }
  });

  try {
    const response = await fetch(LINE_NOTIFY_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `message=${encodeURIComponent(message)}`,
    });

    if (!response.ok) {
      throw new Error(`LINE Notify error: ${response.statusText}`);
    }

    console.log('LINE notification sent successfully');
  } catch (error) {
    console.error('Failed to send LINE notification:', error);
    throw error;
  }
}

/**
 * 日数テキストを取得
 */
function getDayText(days) {
  if (days < 0) return '期限切れ';
  if (days === 0) return '今日!';
  if (days === 1) return '明日';
  return `あと${days}日`;
}

/**
 * 手動でリマインダーをテストするHTTP関数（開発用）
 */
exports.testReminder = functions
  .region('asia-northeast1')
  .https.onRequest(async (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
      res.status(400).send('userId parameter required');
      return;
    }

    try {
      await checkAndNotifyUser(userId);
      res.send(`Reminder sent to user: ${userId}`);
    } catch (error) {
      console.error('Test reminder error:', error);
      res.status(500).send(`Error: ${error.message}`);
    }
  });
