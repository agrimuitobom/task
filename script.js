// データ構造
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let timetable = JSON.parse(localStorage.getItem('timetable')) || {
    '月': {},
    '火': {},
    '水': {},
    '木': {},
    '金': {}
};
let homework = JSON.parse(localStorage.getItem('homework')) || [];
let currentDay = '月';

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initTodoList();
    initTimetable();
    initHomework();
});

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
    const text = todoInput.value.trim();

    if (text === '') {
        alert('タスクを入力してください');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.push(todo);
    saveTodos();
    renderTodos();
    todoInput.value = '';
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

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `task-item ${todo.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
            <span class="task-text">${escapeHtml(todo.text)}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">削除</button>
        `;

        todoList.appendChild(li);
    });
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
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

function saveTimetable() {
    localStorage.setItem('timetable', JSON.stringify(timetable));
}

// ========== 宿題管理 ==========
function initHomework() {
    const addHomeworkBtn = document.getElementById('add-homework-btn');
    addHomeworkBtn.addEventListener('click', addHomework);
    renderHomework();
}

function addHomework() {
    const subjectInput = document.getElementById('hw-subject-input');
    const contentInput = document.getElementById('hw-content-input');
    const deadlineInput = document.getElementById('hw-deadline-input');

    const subject = subjectInput.value.trim();
    const content = contentInput.value.trim();
    const deadline = deadlineInput.value;

    if (subject === '' || content === '') {
        alert('科目名と宿題の内容を入力してください');
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

function saveHomework() {
    localStorage.setItem('homework', JSON.stringify(homework));
}

// ユーティリティ関数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
