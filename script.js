// データ構造
let todos = [];
let timetable = {
    '月': {},
    '火': {},
    '水': {},
    '木': {},
    '金': {}
};
let homework = [];
let currentDay = '月';

// 初期化（auth.jsから呼ばれる）
function initApp() {
    loadAllData().then(() => {
        initTabs();
        initTodoList();
        initTimetable();
        initHomework();
        initCalendar();
        initSettings();
    });
}

// タブ切り替え
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // カレンダータブに切り替えた時は再描画
            if (targetTab === 'calendar') {
                renderCalendar();
            }
            // 宿題タブに切り替えた時は科目リストを更新
            if (targetTab === 'homework') {
                updateSubjectDropdown();
            }
        });
    });
}

// ========== やるべきことリスト ==========
function initTodoList() {
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo-btn');

    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    renderTodos();
}

function addTodo() {
    const todoInput = document.getElementById('todo-input');
    const todoDateInput = document.getElementById('todo-date-input');
    const text = todoInput.value.trim();
    const date = todoDateInput.value;

    if (text === '') {
        alert('タスクを入力してください');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        date: date,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.push(todo);
    saveTodos();
    renderTodos();
    todoInput.value = '';
    todoDateInput.value = '';
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    if (confirm('このタスクを削除しますか？')) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        renderTodos();
    }
}

function renderTodos() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';

    if (todos.length === 0) {
        todoList.innerHTML = '<li style="padding: 20px; text-align: center; color: #999;">やるべきことはありません</li>';
        return;
    }

    // 日付順にソート（完了したものは後ろへ）
    const sortedTodos = [...todos].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        if (a.date && b.date) {
            return new Date(a.date) - new Date(b.date);
        }
        if (a.date && !b.date) return -1;
        if (!a.date && b.date) return 1;
        return 0;
    });

    sortedTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `task-item ${todo.completed ? 'completed' : ''}`;

        let dateText = '';
        if (todo.date) {
            const todoDate = new Date(todo.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffTime = todoDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                dateText = `<span class="task-date overdue">${todo.date} (期限切れ)</span>`;
            } else if (diffDays === 0) {
                dateText = `<span class="task-date today">${todo.date} (今日!)</span>`;
            } else if (diffDays === 1) {
                dateText = `<span class="task-date tomorrow">${todo.date} (明日)</span>`;
            } else {
                dateText = `<span class="task-date">${todo.date} (あと${diffDays}日)</span>`;
            }
        }

        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
            <div class="task-content">
                <span class="task-text">${escapeHtml(todo.text)}</span>
                ${dateText}
            </div>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">削除</button>
        `;

        todoList.appendChild(li);
    });
}

// ========== 時間割 ==========
function initTimetable() {
    const dayBtns = document.querySelectorAll('.day-btn');
    const addSubjectBtn = document.getElementById('add-subject-btn');

    dayBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dayBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDay = btn.getAttribute('data-day');
            renderTimetable();
        });
    });

    addSubjectBtn.addEventListener('click', addSubject);
    renderTimetable();
}

function addSubject() {
    const periodSelect = document.getElementById('period-select');
    const subjectInput = document.getElementById('subject-input');

    const period = periodSelect.value;
    const subject = subjectInput.value.trim();

    if (subject === '') {
        alert('科目名を入力してください');
        return;
    }

    if (!timetable[currentDay]) {
        timetable[currentDay] = {};
    }

    timetable[currentDay][period] = subject;
    saveTimetable();
    renderTimetable();
    subjectInput.value = '';
}

function deleteSubject(day, period) {
    if (confirm('この授業を削除しますか？')) {
        delete timetable[day][period];
        saveTimetable();
        renderTimetable();
    }
}

function renderTimetable() {
    const timetableDisplay = document.getElementById('timetable-display');
    const daySchedule = timetable[currentDay] || {};

    timetableDisplay.innerHTML = `<h3>${currentDay}曜日の時間割</h3>`;

    const periods = Object.keys(daySchedule).sort((a, b) => a - b);

    if (periods.length === 0) {
        timetableDisplay.innerHTML += '<p style="text-align: center; color: #999; padding: 20px;">時間割が登録されていません</p>';
        return;
    }

    periods.forEach(period => {
        const div = document.createElement('div');
        div.className = 'period-item';
        div.innerHTML = `
            <span class="period-number">${period}時間目</span>
            <span class="subject-name">${escapeHtml(daySchedule[period])}</span>
            <button class="delete-btn" onclick="deleteSubject('${currentDay}', '${period}')">削除</button>
        `;
        timetableDisplay.appendChild(div);
    });
}

// 時間割から科目リストを取得
function getAllSubjects() {
    const subjects = new Set();
    Object.values(timetable).forEach(daySchedule => {
        Object.values(daySchedule).forEach(subject => {
            subjects.add(subject);
        });
    });
    return Array.from(subjects).sort();
}

// 宿題の科目プルダウンを更新
function updateSubjectDropdown() {
    const subjectSelect = document.getElementById('hw-subject-input');
    const currentValue = subjectSelect.value;
    const subjects = getAllSubjects();

    subjectSelect.innerHTML = '<option value="">科目を選択...</option>';

    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });

    // 以前選択していた値があれば復元
    if (currentValue && subjects.includes(currentValue)) {
        subjectSelect.value = currentValue;
    }
}

// ========== 宿題管理 ==========
function initHomework() {
    const addHomeworkBtn = document.getElementById('add-homework-btn');
    addHomeworkBtn.addEventListener('click', addHomework);
    updateSubjectDropdown(); // 初期化時に科目リストを読み込む
    renderHomework();
}

function addHomework() {
    const subjectInput = document.getElementById('hw-subject-input');
    const contentInput = document.getElementById('hw-content-input');
    const deadlineInput = document.getElementById('hw-deadline-input');

    const subject = subjectInput.value;
    const content = contentInput.value.trim();
    const deadline = deadlineInput.value;

    if (subject === '' || content === '') {
        alert('科目と宿題の内容を入力してください');
        return;
    }

    const hw = {
        id: Date.now(),
        subject: subject,
        content: content,
        deadline: deadline,
        completed: false,
        createdAt: new Date().toISOString()
    };

    homework.push(hw);
    saveHomework();
    renderHomework();

    subjectInput.value = '';
    contentInput.value = '';
    deadlineInput.value = '';
}

function toggleHomework(id) {
    const hw = homework.find(h => h.id === id);
    if (hw) {
        hw.completed = !hw.completed;
        saveHomework();
        renderHomework();
    }
}

function deleteHomework(id) {
    if (confirm('この宿題を削除しますか？')) {
        homework = homework.filter(h => h.id !== id);
        saveHomework();
        renderHomework();
    }
}

function renderHomework() {
    const homeworkList = document.getElementById('homework-list');
    homeworkList.innerHTML = '';

    if (homework.length === 0) {
        homeworkList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">宿題が登録されていません</p>';
        return;
    }

    // 期限順にソート（完了したものは後ろへ）
    const sortedHomework = [...homework].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        if (a.deadline && b.deadline) {
            return new Date(a.deadline) - new Date(b.deadline);
        }
        return 0;
    });

    sortedHomework.forEach(hw => {
        const div = document.createElement('div');
        div.className = `homework-item ${hw.completed ? 'completed' : ''}`;

        let deadlineText = '';
        if (hw.deadline) {
            const deadlineDate = new Date(hw.deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffTime = deadlineDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                deadlineText = `期限: ${hw.deadline} (期限切れ)`;
            } else if (diffDays === 0) {
                deadlineText = `期限: ${hw.deadline} (今日まで!)`;
            } else if (diffDays === 1) {
                deadlineText = `期限: ${hw.deadline} (明日まで)`;
            } else {
                deadlineText = `期限: ${hw.deadline} (あと${diffDays}日)`;
            }
        }

        div.innerHTML = `
            <div class="homework-subject">${escapeHtml(hw.subject)}</div>
            <div class="homework-content">${escapeHtml(hw.content)}</div>
            ${deadlineText ? `<div class="homework-deadline">${deadlineText}</div>` : ''}
            <div class="homework-actions">
                <button class="complete-btn" onclick="toggleHomework(${hw.id})">
                    ${hw.completed ? '未完了に戻す' : '完了'}
                </button>
                <button class="delete-btn" onclick="deleteHomework(${hw.id})">削除</button>
            </div>
        `;

        homeworkList.appendChild(div);
    });
}

// ========== カレンダー ==========
function initCalendar() {
    renderCalendar();
}

function renderCalendar() {
    const calendarView = document.getElementById('calendar-view');
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // カレンダーヘッダー
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    let html = `
        <div class="calendar-header">
            <button class="calendar-nav-btn" onclick="changeMonth(-1)">◀</button>
            <h3>${year}年 ${monthNames[month]}</h3>
            <button class="calendar-nav-btn" onclick="changeMonth(1)">▶</button>
        </div>
    `;

    // 曜日ヘッダー
    html += '<div class="calendar-grid">';
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    dayNames.forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });

    // カレンダー日付
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 空のセル
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-cell empty"></div>';
    }

    // 日付セル
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateStr === today.toISOString().split('T')[0];

        // この日のタスクと宿題を取得
        const dayTodos = todos.filter(t => t.date === dateStr && !t.completed);
        const dayHomework = homework.filter(h => h.deadline === dateStr && !h.completed);

        let cellClass = 'calendar-cell';
        if (isToday) cellClass += ' today';
        if (dayTodos.length > 0 || dayHomework.length > 0) cellClass += ' has-tasks';

        html += `<div class="${cellClass}">
            <div class="calendar-date">${day}</div>`;

        if (dayTodos.length > 0) {
            html += `<div class="calendar-task-count">📝 ${dayTodos.length}</div>`;
        }
        if (dayHomework.length > 0) {
            html += `<div class="calendar-hw-count">📚 ${dayHomework.length}</div>`;
        }

        html += '</div>';
    }

    html += '</div>';

    // タスク・宿題一覧（今日から7日間）
    html += '<div class="upcoming-section"><h3>今後の予定</h3>';

    const upcomingDays = 7;
    let hasUpcoming = false;

    for (let i = 0; i < upcomingDays; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        const dayTodos = todos.filter(t => t.date === dateStr && !t.completed);
        const dayHomework = homework.filter(h => h.deadline === dateStr && !h.completed);

        if (dayTodos.length > 0 || dayHomework.length > 0) {
            hasUpcoming = true;
            const dayLabel = i === 0 ? '今日' : i === 1 ? '明日' : `${i}日後`;
            html += `<div class="upcoming-day">
                <h4>${dateStr} (${dayLabel})</h4>`;

            dayTodos.forEach(todo => {
                html += `<div class="upcoming-item todo-item">📝 ${escapeHtml(todo.text)}</div>`;
            });

            dayHomework.forEach(hw => {
                html += `<div class="upcoming-item hw-item">📚 ${escapeHtml(hw.subject)}: ${escapeHtml(hw.content)}</div>`;
            });

            html += '</div>';
        }
    }

    if (!hasUpcoming) {
        html += '<p style="text-align: center; color: #999; padding: 20px;">今後の予定はありません</p>';
    }

    html += '</div>';

    calendarView.innerHTML = html;
}

let currentCalendarDate = new Date();

function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    renderCalendarForDate(currentCalendarDate);
}

function renderCalendarForDate(date) {
    const calendarView = document.getElementById('calendar-view');
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // カレンダーヘッダー
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    let html = `
        <div class="calendar-header">
            <button class="calendar-nav-btn" onclick="changeMonth(-1)">◀</button>
            <h3>${year}年 ${monthNames[month]}</h3>
            <button class="calendar-nav-btn" onclick="changeMonth(1)">▶</button>
        </div>
    `;

    // 曜日ヘッダー
    html += '<div class="calendar-grid">';
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    dayNames.forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });

    // カレンダー日付
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 空のセル
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-cell empty"></div>';
    }

    // 日付セル
    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(year, month, day);
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = cellDate.getTime() === today.getTime();

        // この日のタスクと宿題を取得
        const dayTodos = todos.filter(t => t.date === dateStr && !t.completed);
        const dayHomework = homework.filter(h => h.deadline === dateStr && !h.completed);

        let cellClass = 'calendar-cell';
        if (isToday) cellClass += ' today';
        if (dayTodos.length > 0 || dayHomework.length > 0) cellClass += ' has-tasks';

        html += `<div class="${cellClass}">
            <div class="calendar-date">${day}</div>`;

        if (dayTodos.length > 0) {
            html += `<div class="calendar-task-count">📝 ${dayTodos.length}</div>`;
        }
        if (dayHomework.length > 0) {
            html += `<div class="calendar-hw-count">📚 ${dayHomework.length}</div>`;
        }

        html += '</div>';
    }

    html += '</div>';
    calendarView.innerHTML = html;
}

// ========== Firestore データ管理 ==========

// すべてのデータを読み込む
async function loadAllData() {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
        // Todosを読み込む
        const todosDoc = await db.collection('users').doc(userId).collection('data').doc('todos').get();
        if (todosDoc.exists) {
            todos = todosDoc.data().items || [];
        }

        // Timetableを読み込む
        const timetableDoc = await db.collection('users').doc(userId).collection('data').doc('timetable').get();
        if (timetableDoc.exists) {
            timetable = timetableDoc.data().schedule || {
                '月': {},
                '火': {},
                '水': {},
                '木': {},
                '金': {}
            };
        }

        // Homeworkを読み込む
        const homeworkDoc = await db.collection('users').doc(userId).collection('data').doc('homework').get();
        if (homeworkDoc.exists) {
            homework = homeworkDoc.data().items || [];
        }

        console.log('データ読み込み完了');
    } catch (error) {
        console.error('データ読み込みエラー:', error);
    }
}

// Todosを保存
async function saveTodos() {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
        await db.collection('users').doc(userId).collection('data').doc('todos').set({
            items: todos,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Todos保存エラー:', error);
    }
}

// Timetableを保存
async function saveTimetable() {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
        await db.collection('users').doc(userId).collection('data').doc('timetable').set({
            schedule: timetable,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        updateSubjectDropdown();
    } catch (error) {
        console.error('Timetable保存エラー:', error);
    }
}

// Homeworkを保存
async function saveHomework() {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
        await db.collection('users').doc(userId).collection('data').doc('homework').set({
            items: homework,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Homework保存エラー:', error);
    }
}

// ========== 設定 ==========
function initSettings() {
    loadNotificationSettings();

    // LINE User ID保存
    document.getElementById('save-line-userid-btn').addEventListener('click', saveLineUserId);

    // 通知設定保存
    document.getElementById('save-notify-settings-btn').addEventListener('click', saveNotifySettings);

    // テスト通知
    document.getElementById('test-notification-btn').addEventListener('click', sendTestNotification);
}

// 通知設定を読み込む
async function loadNotificationSettings() {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
        const settingsDoc = await db
            .collection('users')
            .doc(userId)
            .collection('settings')
            .doc('notifications')
            .get();

        if (settingsDoc.exists) {
            const settings = settingsDoc.data();

            // User IDを表示
            if (settings.lineUserId) {
                document.getElementById('line-userid-input').value = settings.lineUserId;
            }

            // 通知タイミング
            const notifyDays = settings.notifyDays || [0, 1, 7];
            document.getElementById('notify-today').checked = notifyDays.includes(0);
            document.getElementById('notify-tomorrow').checked = notifyDays.includes(1);
            document.getElementById('notify-week').checked = notifyDays.includes(7);
        }
    } catch (error) {
        console.error('設定読み込みエラー:', error);
    }
}

// LINE User IDを保存
async function saveLineUserId() {
    const userId = getCurrentUserId();
    if (!userId) return;

    const lineUserId = document.getElementById('line-userid-input').value.trim();

    if (!lineUserId) {
        alert('LINE User IDを入力してください');
        return;
    }

    // User ID形式チェック（U + 32文字の英数字）
    if (!lineUserId.match(/^U[0-9a-f]{32}$/i)) {
        alert('LINE User IDの形式が正しくありません。\n正しい形式: Uxxxxxxxxxx...（33文字）');
        return;
    }

    try {
        await db
            .collection('users')
            .doc(userId)
            .collection('settings')
            .doc('notifications')
            .set(
                {
                    lineUserId: lineUserId,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                },
                { merge: true }
            );

        alert('LINE User IDを保存しました！');
    } catch (error) {
        console.error('User ID保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    }
}

// 通知設定を保存
async function saveNotifySettings() {
    const userId = getCurrentUserId();
    if (!userId) return;

    const notifyDays = [];
    if (document.getElementById('notify-today').checked) notifyDays.push(0);
    if (document.getElementById('notify-tomorrow').checked) notifyDays.push(1);
    if (document.getElementById('notify-week').checked) notifyDays.push(7);

    try {
        await db
            .collection('users')
            .doc(userId)
            .collection('settings')
            .doc('notifications')
            .set(
                {
                    notifyDays: notifyDays,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                },
                { merge: true }
            );

        alert('通知設定を保存しました！');
    } catch (error) {
        console.error('設定保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    }
}

// テスト通知を送信
async function sendTestNotification() {
    const userId = getCurrentUserId();
    if (!userId) return;

    if (!confirm('テスト通知を送信しますか？')) return;

    try {
        // Cloud Functionのテストエンドポイントを呼び出す
        const functionUrl = `https://asia-northeast1-task-sainou.cloudfunctions.net/testReminder?userId=${userId}`;

        const response = await fetch(functionUrl);

        if (response.ok) {
            alert('テスト通知を送信しました！LINEを確認してください。');
        } else {
            throw new Error('通知送信に失敗しました');
        }
    } catch (error) {
        console.error('テスト通知エラー:', error);
        alert('テスト通知の送信に失敗しました: ' + error.message);
    }
}

// ユーティリティ関数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
