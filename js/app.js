// app.js
// Personal Dashboard — all modules live in this file.
// Sections: StorageManager | GreetingWidget | FocusTimer | TodoList | QuickLinks | ThemeManager | App

// ---------------------------------------------------------------------------
// StorageManager
// Wraps localStorage with JSON serialisation and silent error handling.
// ---------------------------------------------------------------------------
const StorageManager = (() => {
  const KEYS = {
    TASKS: 'pd_tasks',
    LINKS: 'pd_links',
    THEME: 'pd_theme',
    SORT_ORDER: 'pd_sort_order',
  };

  function get(key) {
    try {
      const raw = localStorage.getItem(key);
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {
      // Silently swallow errors (quota exceeded, private browsing, etc.)
    }
  }

  return { get, set, KEYS };
})();

// ---------------------------------------------------------------------------
// GreetingWidget
// Displays current time, date, and a time-of-day greeting, refreshed every minute.
// ---------------------------------------------------------------------------
const GreetingWidget = (() => {
  function getGreeting(hour) {
    if (hour >= 5 && hour <= 11) return 'Good morning';
    if (hour >= 12 && hour <= 17) return 'Good afternoon';
    if (hour >= 18 && hour <= 21) return 'Good evening';
    return 'Good night';
  }

  function formatDate(date) {
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function render() {
    const container = document.getElementById('greeting');
    if (!container) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    const dateStr = formatDate(now);
    const greetingText = getGreeting(now.getHours());

    container.innerHTML = `
      <p class="greeting-time">${timeStr}</p>
      <p class="greeting-date">${dateStr}</p>
      <p class="greeting-text">${greetingText}</p>
    `;
  }

  function init() {
    render();
    setInterval(render, 60000);
  }

  return { init, render, getGreeting, formatDate };
})();

// ---------------------------------------------------------------------------
// FocusTimer
// 25-minute countdown timer with start / stop / reset controls.
// ---------------------------------------------------------------------------
const FocusTimer = (() => {
  let totalSeconds = 1500;
  let intervalId = null;
  let running = false;

  function formatTime(seconds) {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function render() {
    const container = document.getElementById('timer');
    if (!container) return;

    // Inject HTML structure on first render if not already present
    if (!container.querySelector('.timer-display')) {
      container.innerHTML = `
        <p class="timer-display" aria-live="polite"></p>
        <div class="timer-controls">
          <button id="timer-start">Start</button>
          <button id="timer-stop">Stop</button>
          <button id="timer-reset">Reset</button>
        </div>
      `;
      document.getElementById('timer-start').addEventListener('click', () => start());
      document.getElementById('timer-stop').addEventListener('click', () => stop());
      document.getElementById('timer-reset').addEventListener('click', () => reset());
    }

    const display = container.querySelector('.timer-display');
    const startBtn = document.getElementById('timer-start');
    const stopBtn = document.getElementById('timer-stop');

    display.textContent = formatTime(totalSeconds);
    display.classList.toggle('timer-done', totalSeconds <= 0);

    if (startBtn) startBtn.disabled = running;
    if (stopBtn) stopBtn.disabled = !running;
  }

  function tick() {
    if (totalSeconds > 0) {
      totalSeconds -= 1;
    }
    render();
    if (totalSeconds <= 0) {
      stop();
    }
  }

  function start() {
    if (running) return;
    running = true;
    intervalId = setInterval(tick, 1000);
    render();
  }

  function stop() {
    clearInterval(intervalId);
    intervalId = null;
    running = false;
    render();
  }

  function reset() {
    stop();
    totalSeconds = 1500;
    render();
  }

  function init() {
    render();
  }

  return { init, start, stop, reset, tick, render, formatTime };
})();

// ---------------------------------------------------------------------------
// TodoList
// Manages an array of Task objects in memory, syncs to Local Storage on every mutation.
// ---------------------------------------------------------------------------
const TodoList = (() => {
  const { TASKS, SORT_ORDER } = StorageManager.KEYS;
  let tasks = [];
  let currentOrder = 'created';

  function persist() {
    StorageManager.set(TASKS, tasks);
  }

  function isDuplicate(text) {
    const lower = text.toLowerCase();
    return tasks.some(t => t.text.toLowerCase() === lower);
  }

  function add(text) {
    const trimmed = text.trim();
    if (!trimmed) return { ok: false, reason: 'empty' };
    if (isDuplicate(trimmed)) return { ok: false, reason: 'duplicate' };
    tasks.push({
      id: Date.now().toString(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    });
    persist();
    return { ok: true };
  }

  function edit(id, text) {
    const task = tasks.find(t => t.id === id);
    if (!task) return false;
    task.text = text.trim();
    persist();
    return true;
  }

  function toggle(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      persist();
    }
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    persist();
  }

  function setSortOrder(order) {
    currentOrder = order;
    StorageManager.set(SORT_ORDER, order);
    render();
  }

  function render() {
    const container = document.getElementById('todo');
    if (!container) return;

    // Build sorted copy — never mutate the stored array
    const sorted = [...tasks].sort((a, b) => {
      if (currentOrder === 'alpha') {
        return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
      }
      return (a.createdAt || 0) - (b.createdAt || 0);
    });

    // Full re-render of container contents
    container.innerHTML = `
      <form class="todo-add-form">
        <input type="text" class="todo-input" placeholder="Add a task…" aria-label="New task text" />
        <button type="submit">Add</button>
        <span class="todo-error" aria-live="polite"></span>
      </form>
      <div class="todo-sort-wrapper">
        <label for="todo-sort-select">Sort:</label>
        <select id="todo-sort-select" class="todo-sort">
          <option value="created">Creation order</option>
          <option value="alpha">Alphabetical</option>
        </select>
      </div>
      <ul class="todo-list"></ul>
    `;

    // Wire form
    const form = container.querySelector('.todo-add-form');
    const input = container.querySelector('.todo-input');
    const error = container.querySelector('.todo-error');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const result = add(input.value);
      if (result.ok) {
        input.value = '';
        error.textContent = '';
        render();
      } else {
        error.textContent = result.reason === 'duplicate'
          ? 'Task already exists.'
          : 'Please enter a task.';
      }
    });

    // Wire sort selector and set current value
    const sortSelect = container.querySelector('.todo-sort');
    sortSelect.value = currentOrder;
    sortSelect.addEventListener('change', () => setSortOrder(sortSelect.value));

    // Render task items
    const list = container.querySelector('.todo-list');
    sorted.forEach(task => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (task.completed ? ' completed' : '');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.setAttribute('aria-label', 'Toggle complete');
      checkbox.addEventListener('change', () => { toggle(task.id); render(); });

      const textSpan = document.createElement('span');
      textSpan.className = 'todo-text';
      textSpan.textContent = task.text;

      const editBtn = document.createElement('button');
      editBtn.className = 'todo-edit-btn';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => {
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'todo-edit-input';
        editInput.value = task.text;

        const saveBtn = document.createElement('button');
        saveBtn.className = 'todo-save-btn';
        saveBtn.textContent = 'Save';
        saveBtn.addEventListener('click', () => { edit(task.id, editInput.value); render(); });

        li.replaceChild(editInput, textSpan);
        li.replaceChild(saveBtn, editBtn);
        editInput.focus();
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'todo-delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => { deleteTask(task.id); render(); });

      li.append(checkbox, textSpan, editBtn, deleteBtn);
      list.appendChild(li);
    });
  }

  function init() {
    tasks = (StorageManager.get(TASKS) || []).map((t, i) => ({
      createdAt: i,
      ...t,
    }));
    currentOrder = StorageManager.get(SORT_ORDER) || 'created';
    render();
  }

  return { init, add, edit, toggle, delete: deleteTask, setSortOrder, render, isDuplicate, persist };
})();

// ---------------------------------------------------------------------------
// QuickLinks
// Manages an array of Link objects, syncs to Local Storage on every mutation.
// ---------------------------------------------------------------------------
const QuickLinks = (() => {
  const { LINKS } = StorageManager.KEYS;
  let links = [];

  function persist() {
    StorageManager.set(LINKS, links);
  }

  function isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  function add(label, url) {
    if (!label.trim() || !isValidUrl(url)) return false;
    links.push({ id: Date.now().toString(), label: label.trim(), url });
    persist();
    return true;
  }

  function deleteLink(id) {
    links = links.filter(l => l.id !== id);
    persist();
  }

  function render() {
    const container = document.getElementById('links');
    if (!container) return;

    let form = container.querySelector('.links-add-form');
    let list = container.querySelector('.links-list');

    if (!form) {
      form = document.createElement('form');
      form.className = 'links-add-form';
      form.innerHTML = `
        <input type="text" class="links-label-input" placeholder="Label" aria-label="Link label" />
        <input type="url" class="links-url-input" placeholder="https://example.com" aria-label="Link URL" />
        <button type="submit">Add</button>
      `;
      form.addEventListener('submit', e => {
        e.preventDefault();
        const labelInput = form.querySelector('.links-label-input');
        const urlInput = form.querySelector('.links-url-input');
        if (add(labelInput.value, urlInput.value)) {
          labelInput.value = '';
          urlInput.value = '';
          render();
        }
      });
      container.appendChild(form);
    }

    if (!list) {
      list = document.createElement('ul');
      list.className = 'links-list';
      container.appendChild(list);
    }

    list.innerHTML = '';
    links.forEach(link => {
      const li = document.createElement('li');
      li.className = 'links-item';

      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = link.label;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'links-delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('aria-label', `Delete ${link.label}`);
      deleteBtn.addEventListener('click', () => {
        deleteLink(link.id);
        render();
      });

      li.appendChild(a);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
  }

  function init() {
    links = StorageManager.get(LINKS) || [];
    render();
  }

  return { init, add, delete: deleteLink, isValidUrl, render, persist };
})();

// ---------------------------------------------------------------------------
// ThemeManager
// Handles light/dark theme detection, application, and persistence.
// ---------------------------------------------------------------------------
const ThemeManager = (() => {
  const { THEME } = StorageManager.KEYS;

  function detect() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function init() {
    const saved = StorageManager.get(THEME);
    apply(saved !== null ? saved : detect());
  }

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    apply(next);
    StorageManager.set(THEME, next);
  }

  return { detect, apply, init, toggle };
})();

// ---------------------------------------------------------------------------
// App
// Entry point — wires up all modules on DOMContentLoaded.
// ---------------------------------------------------------------------------
const App = (() => {
  function init() {
    ThemeManager.init();
    GreetingWidget.init();
    FocusTimer.init();
    TodoList.init();
    QuickLinks.init();

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => ThemeManager.toggle());
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
