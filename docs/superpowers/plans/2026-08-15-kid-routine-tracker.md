# Kid Routine Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-friendly static webapp for Seth (5yo) and April (8yo) to track their daily routines with streaks, confetti rewards, and localStorage persistence.

**Architecture:** Single-page app with three views (splash, dashboard, modal) managed by vanilla JS show/hide. All state lives in a single `kidRoutineAppState` localStorage key. No build step — CDN-only dependencies.

**Tech Stack:** HTML5, ES6 JS, Tailwind CSS (CDN), canvas-confetti (CDN)

**Spec:** `Student Daily Blueprint Checklist.md`

> **Note on testing:** No test framework — verification steps are browser console checks and manual UI inspection. Each task ends with a clear browser verification step.

## Global Constraints

- Zero backend, zero npm, zero build step — must run from `file://` and deploy to GitHub Pages unchanged
- Tailwind via CDN only: `https://cdn.tailwindcss.com`
- canvas-confetti via CDN only: `https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js`
- localStorage key: `kidRoutineAppState` (exact casing)
- Seth profile key: `"seth"`, April profile key: `"april"` (lowercase, exact)
- Minimum checkbox hit-box: 48×48px
- Must work on iPad and smartphone viewports
- Date format in localStorage: `"YYYY-MM-DD"` (ISO, from `new Date().toISOString().slice(0,10)`)

---

## File Map

| File | Responsibility |
|------|---------------|
| `index.html` | All markup: splash screen, dashboard shell, phase sections, modal. No logic. |
| `styles.css` | Custom animations (confetti, star burst, cross-out), Tailwind `@apply` classes, theme CSS variables for Seth and April. |
| `app.js` | All logic: state init/load/save, auto-reset, view routing, task rendering, phase tracking, confetti, modal, streak engine. |

---

### Task 1: Project Scaffold

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `app.js`

**Interfaces:**
- Produces: `window.App` namespace with `init()` called on `DOMContentLoaded`

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Daily Blueprint ⭐</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            seth: { primary: '#0ea5e9', secondary: '#0d9488', accent: '#fbbf24' },
            april: { primary: '#a855f7', secondary: '#ec4899', accent: '#f59e0b' }
          }
        }
      }
    }
  </script>
  <link rel="stylesheet" href="styles.css" />
</head>
<body class="min-h-screen bg-gray-50 font-sans">

  <!-- SPLASH SCREEN -->
  <div id="view-splash" class="flex flex-col items-center justify-center min-h-screen p-6 gap-8">
    <h1 class="text-4xl font-extrabold text-center text-gray-800">Daily Blueprint ⭐</h1>
    <p class="text-lg text-gray-500">Who's checking in today?</p>
    <div class="flex flex-col sm:flex-row gap-6 w-full max-w-md">
      <button id="btn-seth" class="profile-card flex-1 rounded-3xl p-8 text-center shadow-lg bg-sky-100 border-4 border-sky-300 active:scale-95 transition-transform">
        <div class="text-7xl mb-3">🦖</div>
        <div class="text-2xl font-extrabold text-sky-700">Seth</div>
        <div class="text-sm text-sky-500 mt-1">Age 5</div>
      </button>
      <button id="btn-april" class="profile-card flex-1 rounded-3xl p-8 text-center shadow-lg bg-purple-100 border-4 border-purple-300 active:scale-95 transition-transform">
        <div class="text-7xl mb-3">🎨</div>
        <div class="text-2xl font-extrabold text-purple-700">April</div>
        <div class="text-sm text-purple-500 mt-1">Age 8</div>
      </button>
    </div>
  </div>

  <!-- DASHBOARD -->
  <div id="view-dashboard" class="hidden max-w-lg mx-auto p-4 pb-16">

    <!-- Header -->
    <header id="dashboard-header" class="rounded-2xl p-5 mb-6 text-white shadow-md">
      <div class="flex items-center justify-between mb-3">
        <button id="btn-switch-profile" class="text-white/80 text-sm underline">Switch</button>
        <div id="header-avatar" class="text-4xl"></div>
      </div>
      <h2 id="header-name" class="text-2xl font-extrabold"></h2>
      <div class="flex gap-4 mt-2 text-sm font-semibold">
        <span>🔥 Streak: <span id="header-streak">0</span></span>
        <span>⭐ Stars: <span id="header-stars">0</span></span>
      </div>
    </header>

    <!-- Phases -->
    <div id="phases-container" class="flex flex-col gap-4"></div>

  </div>

  <!-- PARENT QUESTION MODAL -->
  <div id="modal-question" class="hidden fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
    <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
      <div class="text-5xl mb-4">💬</div>
      <h3 class="text-xl font-bold text-gray-800 mb-3">Parent's Question</h3>
      <p id="modal-question-text" class="text-gray-600 text-lg leading-relaxed mb-6"></p>
      <button id="btn-question-complete" class="w-full py-4 rounded-2xl text-white font-bold text-lg bg-green-500 active:scale-95 transition-transform">
        ✅ Mark Complete
      </button>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `styles.css`**

```css
/* Custom animations */
@keyframes star-pop {
  0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
  60%  { transform: scale(1.3) rotate(5deg);  opacity: 1; }
  100% { transform: scale(1) rotate(0deg);    opacity: 1; }
}

@keyframes strike-through {
  from { width: 0; }
  to   { width: 100%; }
}

.task-complete .task-label {
  position: relative;
  color: #9ca3af;
}

.task-complete .task-label::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  height: 2px;
  background: #6b7280;
  animation: strike-through 0.3s ease forwards;
}

.star-pop {
  animation: star-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
}

/* Phase completion banner */
.phase-complete-banner {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  text-align: center;
  font-weight: 800;
  color: white;
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

/* Seth theme header */
.theme-seth {
  background: linear-gradient(135deg, #0ea5e9, #0d9488);
}

/* April theme header */
.theme-april {
  background: linear-gradient(135deg, #a855f7, #ec4899);
}

/* Checkbox sizing */
.task-checkbox {
  min-width: 48px;
  min-height: 48px;
  width: 48px;
  height: 48px;
  cursor: pointer;
  accent-color: currentColor;
  border-radius: 8px;
}
```

- [ ] **Step 3: Create `app.js` scaffold**

```js
'use strict';

const STORAGE_KEY = 'kidRoutineAppState';

const PARENT_QUESTIONS = [
  "What was the funniest thing that happened today?",
  "What game did you play at recess?",
  "What did you learn today that surprised you?",
  "Who made you laugh today?",
  "What was the best part of lunch?",
  "Did anything make you feel proud today?",
  "What's one thing you wish you could do again tomorrow?",
  "Did you help anyone today? How?",
  "What was the most interesting thing your teacher said?",
  "If today was a movie, what would it be called?"
];

const TASKS = {
  beforeSchool: [
    { id: 'breakfast',   label: 'Breakfast',       emoji: '🍳' },
    { id: 'getDressed',  label: 'Get Dressed',      emoji: '👕' },
    { id: 'brushTeeth1', label: 'Brush Teeth',      emoji: '🪥' },
    { id: 'brushHair',   label: 'Brush Hair',       emoji: '🧹' },
    { id: 'packBag',     label: 'Pack Bag',         emoji: '🎒', detail: 'Lunchbox, water bottle, homework' },
    { id: 'drinkWater',  label: 'Drink Water',      emoji: '💧' }
  ],
  afterSchool: [
    { id: 'unpackBag',      label: 'Unpack Bag',         emoji: '🎒', detail: 'Water bottle, lunchbox' },
    { id: 'snack',          label: 'Snack',              emoji: '🍎' },
    { id: 'parentQuestion', label: "Parent's Question",  emoji: '💬', isModal: true },
    { id: 'homework',       label: 'Homework',           emoji: '✏️' },
    { id: 'musicPractice',  label: 'Music Practice',     emoji: '🎹' },
    { id: 'getReady',       label: 'Get Ready for Activities', emoji: '👟', detail: 'Soccer, dance, softball…' }
  ],
  beforeBed: [
    { id: 'dinner',      label: 'Have Dinner',    emoji: '🍽️' },
    { id: 'toysAway',    label: 'Put Toys Away',  emoji: '🧸' },
    { id: 'bath',        label: 'Bath',           emoji: '🛁' },
    { id: 'pyjamas',     label: 'Get in Pyjamas', emoji: '💤' },
    { id: 'brushTeeth2', label: 'Brush Teeth',    emoji: '🪥' },
    { id: 'pee',         label: 'Pee',            emoji: '🚽' },
    { id: 'storytime',   label: 'Story-time',     emoji: '📚' },
    { id: 'sleep',       label: 'Go to Sleep',    emoji: '😴' }
  ]
};

const PHASE_META = {
  beforeSchool: { label: '🌅 Before School', icon: '🌅' },
  afterSchool:  { label: '🌇 After School',  icon: '🌇' },
  beforeBed:    { label: '🌙 Before Bed',    icon: '🌙' }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  state: null,

  init() {
    this.state = loadState();
    bindSplashEvents();
    if (this.state.activeProfile) {
      showDashboard(this.state.activeProfile);
    } else {
      showView('splash');
    }
  }
};
```

- [ ] **Step 4: Open `index.html` in a browser**

Open `index.html` directly from the filesystem (`file://` path). Expected:
- Splash screen shows two profile cards (Seth 🦖, April 🎨)
- No console errors
- Page is mobile-friendly (test by resizing to 375px width)

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css app.js
git commit -m "feat: scaffold kid routine tracker — HTML shell, CSS, JS stub"
```

---

### Task 2: State Layer — Init, Load, Save, Auto-Reset

**Files:**
- Modify: `app.js`

**Interfaces:**
- Produces:
  - `loadState() → AppState` — loads from localStorage or returns fresh default; runs auto-reset before returning
  - `saveState(state) → void` — serializes full state to `STORAGE_KEY`
  - `todayStr() → string` — returns `"YYYY-MM-DD"` for today
  - `freshTaskState() → object` — returns all-false task map matching `TASKS` keys
  - `AppState` shape: `{ activeProfile, profiles: { seth: ProfileState, april: ProfileState } }`
  - `ProfileState` shape: `{ streak, lifetimeStars, lastActiveDate, history, currentDayTasks }`

- [ ] **Step 1: Add `todayStr` and `freshTaskState` helpers to `app.js` (after the PHASE_META constant)**

```js
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function freshTaskState() {
  const out = {};
  for (const phase of Object.keys(TASKS)) {
    out[phase] = {};
    for (const task of TASKS[phase]) {
      out[phase][task.id] = false;
    }
  }
  return out;
}

function freshProfile() {
  return {
    streak: 0,
    lifetimeStars: 0,
    lastActiveDate: todayStr(),
    history: {},
    currentDayTasks: freshTaskState()
  };
}
```

- [ ] **Step 2: Add `autoReset` function**

```js
function autoReset(profile) {
  const today = todayStr();
  if (profile.lastActiveDate === today) return profile;

  // Determine if yesterday was the last active day (streak continues) or older (streak breaks)
  const last = new Date(profile.lastActiveDate);
  const now  = new Date(today);
  const daysDiff = Math.round((now - last) / 86400000);

  // Save history for the day we're resetting away from
  const wasFullDay = Object.keys(TASKS).every(
    phase => Object.values(profile.currentDayTasks[phase]).every(Boolean)
  );
  profile.history[profile.lastActiveDate] = {
    beforeSchool: Object.values(profile.currentDayTasks.beforeSchool).every(Boolean),
    afterSchool:  Object.values(profile.currentDayTasks.afterSchool).every(Boolean),
    beforeBed:    Object.values(profile.currentDayTasks.beforeBed).every(Boolean)
  };

  if (daysDiff > 1) {
    profile.streak = 0; // missed a day
  }
  // If daysDiff === 1 and full day was completed, streak was already incremented when tasks completed
  // Reset tasks for the new day
  profile.currentDayTasks = freshTaskState();
  profile.lastActiveDate = today;

  return profile;
}
```

- [ ] **Step 3: Add `loadState` and `saveState`**

```js
function loadState() {
  let raw;
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (_) {
    raw = null;
  }

  const defaultState = {
    activeProfile: null,
    profiles: {
      seth:  freshProfile(),
      april: freshProfile()
    }
  };

  if (!raw || !raw.profiles) return defaultState;

  // Run auto-reset on each profile
  for (const key of ['seth', 'april']) {
    if (raw.profiles[key]) {
      raw.profiles[key] = autoReset(raw.profiles[key]);
    } else {
      raw.profiles[key] = freshProfile();
    }
  }

  return raw;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
```

- [ ] **Step 4: Verify state in browser console**

Open `index.html`. In the browser console run:

```js
localStorage.removeItem('kidRoutineAppState');
location.reload();
// After reload:
JSON.parse(localStorage.getItem('kidRoutineAppState')); // should be null (state saved on first profile select)
```

Then click Seth, run:
```js
JSON.parse(localStorage.getItem('kidRoutineAppState'));
// Expected: object with activeProfile: "seth", profiles.seth.streak: 0, etc.
```

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: add state layer — load, save, auto-reset logic"
```

---

### Task 3: Splash Screen — Profile Selection & Routing

**Files:**
- Modify: `app.js`

**Interfaces:**
- Consumes: `loadState()`, `saveState(state)`, `App.state`
- Produces:
  - `showView(viewId)` — hides all views, shows `#view-{viewId}`
  - `showDashboard(profileKey)` — sets `activeProfile`, saves state, renders dashboard
  - `bindSplashEvents()` — wires Seth/April buttons and switch-profile button

- [ ] **Step 1: Add `showView` and `bindSplashEvents` to `app.js`**

```js
function showView(viewId) {
  document.querySelectorAll('[id^="view-"]').forEach(el => el.classList.add('hidden'));
  document.getElementById('view-' + viewId).classList.remove('hidden');
}

function bindSplashEvents() {
  document.getElementById('btn-seth').addEventListener('click', () => {
    App.state.activeProfile = 'seth';
    saveState(App.state);
    showDashboard('seth');
  });
  document.getElementById('btn-april').addEventListener('click', () => {
    App.state.activeProfile = 'april';
    saveState(App.state);
    showDashboard('april');
  });
  document.getElementById('btn-switch-profile').addEventListener('click', () => {
    App.state.activeProfile = null;
    saveState(App.state);
    showView('splash');
  });
}
```

- [ ] **Step 2: Add stub `showDashboard` (full implementation in Task 4)**

```js
function showDashboard(profileKey) {
  showView('dashboard');
  renderHeader(profileKey);
  renderPhases(profileKey);
}
```

Add stubs so no errors thrown:
```js
function renderHeader(profileKey) {}
function renderPhases(profileKey) {}
```

- [ ] **Step 3: Verify in browser**

- Click Seth → view changes (no crash)
- Click "Switch" → returns to splash
- Click April → view changes
- Reload → still on April (persisted via activeProfile)

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat: splash screen routing and profile selection"
```

---

### Task 4: Dashboard Header + Phase Shell

**Files:**
- Modify: `app.js`

**Interfaces:**
- Consumes: `App.state`, `TASKS`, `PHASE_META`, profile themes
- Produces:
  - `renderHeader(profileKey)` — fills `#dashboard-header`, `#header-name`, `#header-streak`, `#header-stars`, `#header-avatar`; applies theme class
  - `renderPhases(profileKey)` — clears and rebuilds `#phases-container` with collapsible phase sections; calls `renderTaskList` per phase (stub ok here)
  - `getTheme(profileKey) → { headerClass, checkColor, seth-specific sizing flags }`

- [ ] **Step 1: Replace `renderHeader` stub with full implementation**

```js
const PROFILE_META = {
  seth: {
    name: 'Seth', avatar: '🦖', headerClass: 'theme-seth',
    checkColor: '#0ea5e9', bigText: true
  },
  april: {
    name: 'April', avatar: '🎨', headerClass: 'theme-april',
    checkColor: '#a855f7', bigText: false
  }
};

function renderHeader(profileKey) {
  const meta    = PROFILE_META[profileKey];
  const profile = App.state.profiles[profileKey];
  const header  = document.getElementById('dashboard-header');

  // Remove previous theme
  header.classList.remove('theme-seth', 'theme-april');
  header.classList.add(meta.headerClass);

  document.getElementById('header-avatar').textContent  = meta.avatar;
  document.getElementById('header-name').textContent    = meta.name + "'s Day";
  document.getElementById('header-streak').textContent  = profile.streak;
  document.getElementById('header-stars').textContent   = profile.lifetimeStars;
}
```

- [ ] **Step 2: Replace `renderPhases` stub with collapsible phase sections**

```js
function renderPhases(profileKey) {
  const container = document.getElementById('phases-container');
  container.innerHTML = '';

  for (const phaseKey of Object.keys(TASKS)) {
    const meta    = PHASE_META[phaseKey];
    const section = document.createElement('div');
    section.className = 'bg-white rounded-2xl shadow-sm overflow-hidden';
    section.id = 'phase-' + phaseKey;

    const header = document.createElement('button');
    header.className = 'w-full flex items-center justify-between px-5 py-4 font-bold text-gray-700 text-lg';
    header.innerHTML = `<span>${meta.label}</span><span class="phase-chevron transition-transform">▾</span>`;

    const body = document.createElement('div');
    body.className = 'phase-body px-4 pb-4';
    body.id = 'phase-body-' + phaseKey;

    // Collapse toggle
    header.addEventListener('click', () => {
      const isHidden = body.classList.toggle('hidden');
      header.querySelector('.phase-chevron').style.transform = isHidden ? 'rotate(-90deg)' : '';
    });

    section.appendChild(header);
    section.appendChild(body);
    container.appendChild(section);

    renderTaskList(phaseKey, profileKey);
  }
}
```

- [ ] **Step 3: Add stub `renderTaskList`**

```js
function renderTaskList(phaseKey, profileKey) {
  const body = document.getElementById('phase-body-' + phaseKey);
  body.innerHTML = '<p class="text-gray-400 text-sm py-2">Tasks coming soon…</p>';
}
```

- [ ] **Step 4: Verify in browser**

- Select Seth → header shows blue/teal gradient, "Seth's Day", streak 0, stars 0, 🦖 avatar
- Select April → header shows purple/pink gradient, "April's Day", 🎨 avatar
- Three phase sections render and collapse/expand on tap
- "Switch" returns to splash

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: dashboard header and collapsible phase sections"
```

---

### Task 5: Task List Rendering + Checkbox Toggle

**Files:**
- Modify: `app.js`, `styles.css`

**Interfaces:**
- Consumes: `TASKS`, `App.state.profiles[profileKey].currentDayTasks`, `PROFILE_META`
- Produces:
  - `renderTaskList(phaseKey, profileKey)` — full implementation rendering task rows with checkboxes
  - `toggleTask(phaseKey, taskId, profileKey)` — flips boolean in state, saves, re-renders row, fires mini confetti

- [ ] **Step 1: Replace `renderTaskList` stub with full task rendering**

```js
function renderTaskList(phaseKey, profileKey) {
  const body    = document.getElementById('phase-body-' + phaseKey);
  const tasks   = TASKS[phaseKey];
  const profile = App.state.profiles[profileKey];
  const meta    = PROFILE_META[profileKey];

  body.innerHTML = '';

  for (const task of tasks) {
    const done = profile.currentDayTasks[phaseKey][task.id];

    const row = document.createElement('div');
    row.className = 'task-row flex items-center gap-3 py-3 border-b border-gray-100 last:border-0' + (done ? ' task-complete' : '');
    row.id = 'task-row-' + phaseKey + '-' + task.id;

    const label = document.createElement('label');
    label.className = 'flex items-center gap-3 flex-1 cursor-pointer select-none';
    label.htmlFor = 'chk-' + phaseKey + '-' + task.id;

    const emoji = document.createElement('span');
    emoji.className = meta.bigText ? 'text-3xl' : 'text-2xl';
    emoji.textContent = task.emoji;

    const textWrap = document.createElement('div');
    textWrap.className = 'flex flex-col';

    const taskLabel = document.createElement('span');
    taskLabel.className = 'task-label font-semibold ' + (meta.bigText ? 'text-lg' : 'text-base') + ' text-gray-700';
    taskLabel.textContent = task.label;

    if (task.detail) {
      const detail = document.createElement('span');
      detail.className = 'text-xs text-gray-400';
      detail.textContent = task.detail;
      textWrap.appendChild(detail);
    }

    textWrap.insertBefore(taskLabel, textWrap.firstChild);
    label.appendChild(emoji);
    label.appendChild(textWrap);

    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.id   = 'chk-' + phaseKey + '-' + task.id;
    chk.className = 'task-checkbox';
    chk.checked   = done;
    chk.style.accentColor = meta.checkColor;

    if (task.isModal) {
      // Modal tasks are checked via the modal, not directly
      chk.addEventListener('change', (e) => {
        e.preventDefault();
        chk.checked = done; // revert
        openQuestionModal(phaseKey, task.id, profileKey);
      });
    } else {
      chk.addEventListener('change', () => {
        toggleTask(phaseKey, task.id, profileKey);
      });
    }

    row.appendChild(label);
    row.appendChild(chk);
    body.appendChild(row);
  }
}
```

- [ ] **Step 2: Add `toggleTask`**

```js
function toggleTask(phaseKey, taskId, profileKey) {
  const profile = App.state.profiles[profileKey];
  const newVal  = !profile.currentDayTasks[phaseKey][taskId];
  profile.currentDayTasks[phaseKey][taskId] = newVal;
  saveState(App.state);

  // Re-render the single row
  const row = document.getElementById('task-row-' + phaseKey + '-' + taskId);
  if (row) {
    if (newVal) {
      row.classList.add('task-complete');
    } else {
      row.classList.remove('task-complete');
    }
  }

  if (newVal) {
    fireMiniConfetti();
    checkPhaseComplete(phaseKey, profileKey);
  }

  renderHeader(profileKey); // refresh star/streak counts
}
```

- [ ] **Step 3: Add `fireMiniConfetti` stub (full confetti in Task 6)**

```js
function fireMiniConfetti() {
  confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
}
```

- [ ] **Step 4: Add `checkPhaseComplete` stub**

```js
function checkPhaseComplete(phaseKey, profileKey) {
  // Full implementation in Task 6
}
```

- [ ] **Step 5: Verify in browser**

- Select Seth → three phases each show task rows with emoji, label, detail (where applicable)
- Seth tasks have larger text than April tasks
- Tapping a checkbox crosses out the task label
- Confetti fires on check
- Unchecking removes the cross-out
- Parent Question checkbox does NOT check directly (modal stub ok for now — no crash)

- [ ] **Step 6: Commit**

```bash
git add app.js styles.css
git commit -m "feat: task list rendering and checkbox toggle with mini confetti"
```

---

### Task 6: Phase Completion Celebration + Streak Engine

**Files:**
- Modify: `app.js`

**Interfaces:**
- Consumes: `App.state`, `TASKS`, `saveState`
- Produces:
  - `checkPhaseComplete(phaseKey, profileKey)` — full implementation; fires star banner + big confetti when all tasks in phase done
  - `checkDayComplete(profileKey)` — called after each phase completion; increments streak + lifetimeStars if all 3 phases done

- [ ] **Step 1: Replace `checkPhaseComplete` stub**

```js
function checkPhaseComplete(phaseKey, profileKey) {
  const profile    = App.state.profiles[profileKey];
  const phaseTasks = profile.currentDayTasks[phaseKey];
  const allDone    = Object.values(phaseTasks).every(Boolean);

  if (!allDone) return;

  // Show phase complete banner
  const phaseBody = document.getElementById('phase-body-' + phaseKey);
  if (!phaseBody.querySelector('.phase-complete-banner')) {
    const banner = document.createElement('div');
    banner.className = 'phase-complete-banner star-pop';
    banner.textContent = '⭐ Phase Complete! ⭐';
    phaseBody.appendChild(banner);
  }

  // Big confetti
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.5 },
    colors: ['#fbbf24', '#f59e0b', '#0ea5e9', '#a855f7', '#ec4899']
  });

  checkDayComplete(profileKey);
}
```

- [ ] **Step 2: Add `checkDayComplete`**

```js
function checkDayComplete(profileKey) {
  const profile   = App.state.profiles[profileKey];
  const allPhases = Object.keys(TASKS).every(
    phase => Object.values(profile.currentDayTasks[phase]).every(Boolean)
  );

  if (!allPhases) return;

  // Guard: only award once per day
  if (profile.history[todayStr()]?.fullDayAwarded) return;

  profile.streak        += 1;
  profile.lifetimeStars += 1;
  profile.lastActiveDate = todayStr();

  if (!profile.history[todayStr()]) profile.history[todayStr()] = {};
  profile.history[todayStr()].fullDayAwarded = true;
  profile.history[todayStr()].beforeSchool   = true;
  profile.history[todayStr()].afterSchool    = true;
  profile.history[todayStr()].beforeBed      = true;

  saveState(App.state);
  renderHeader(profileKey);

  // Mega celebration
  const end = Date.now() + 3000;
  const frame = () => {
    confetti({ particleCount: 20, angle: 60,  spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 20, angle: 120, spread: 55, origin: { x: 1 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
```

- [ ] **Step 3: Verify in browser**

- Open console: `App.state.profiles.seth`
- Tick all 6 Before School tasks → banner appears, big confetti fires
- Tick all remaining tasks across all phases → mega side-cannon confetti fires, streak increments to 1, stars increments to 1
- Reload → streak and stars persist

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat: phase completion celebration and streak engine"
```

---

### Task 7: Parent Question Modal

**Files:**
- Modify: `app.js`

**Interfaces:**
- Consumes: `PARENT_QUESTIONS`, `toggleTask`, modal DOM elements
- Produces:
  - `openQuestionModal(phaseKey, taskId, profileKey)` — picks random question, shows modal, wires "Mark Complete"
  - `closeQuestionModal()` — hides modal

- [ ] **Step 1: Add `openQuestionModal` and `closeQuestionModal`**

```js
let _modalContext = null;

function openQuestionModal(phaseKey, taskId, profileKey) {
  _modalContext = { phaseKey, taskId, profileKey };
  const q = PARENT_QUESTIONS[Math.floor(Math.random() * PARENT_QUESTIONS.length)];
  document.getElementById('modal-question-text').textContent = q;
  document.getElementById('modal-question').classList.remove('hidden');
}

function closeQuestionModal() {
  document.getElementById('modal-question').classList.add('hidden');
  _modalContext = null;
}
```

- [ ] **Step 2: Wire modal buttons (add inside `App.init()`, after `bindSplashEvents()`)**

In `App.init()`, add:
```js
document.getElementById('btn-question-complete').addEventListener('click', () => {
  if (_modalContext) {
    const { phaseKey, taskId, profileKey } = _modalContext;
    App.state.profiles[profileKey].currentDayTasks[phaseKey][taskId] = true;
    saveState(App.state);
    closeQuestionModal();
    // Update checkbox visually
    const chk = document.getElementById('chk-' + phaseKey + '-' + taskId);
    const row = document.getElementById('task-row-' + phaseKey + '-' + taskId);
    if (chk) chk.checked = true;
    if (row) row.classList.add('task-complete');
    fireMiniConfetti();
    checkPhaseComplete(phaseKey, profileKey);
    renderHeader(profileKey);
  }
});

// Close modal on backdrop click
document.getElementById('modal-question').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeQuestionModal();
});
```

- [ ] **Step 3: Verify in browser**

- In After School phase, tap "Parent's Question" checkbox → modal opens (does NOT immediately check the task)
- Modal shows a question from the list
- Tap backdrop → modal closes, task stays unchecked
- Open modal again → question may be different (random)
- Tap "Mark Complete" → modal closes, task is checked with cross-out, mini confetti fires

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat: parent question modal with randomized prompts"
```

---

### Task 8: Auto-Reset Edge Cases + Polish

**Files:**
- Modify: `app.js`

**Interfaces:**
- Consumes: `autoReset`, `loadState`, `saveState`
- Produces: verified auto-reset behaviour; no new public interfaces

- [ ] **Step 1: Verify auto-reset via console manipulation**

In browser console with Seth selected and some tasks checked:
```js
// Simulate yesterday
const state = JSON.parse(localStorage.getItem('kidRoutineAppState'));
state.profiles.seth.lastActiveDate = '2026-08-14';
localStorage.setItem('kidRoutineAppState', JSON.stringify(state));
location.reload();
```
Expected after reload:
- All tasks reset to unchecked
- Streak unchanged (was 1 day gap, not 2)
- History has entry for `2026-08-14`

```js
// Simulate a skipped day (2 days ago)
const state = JSON.parse(localStorage.getItem('kidRoutineAppState'));
state.profiles.seth.lastActiveDate = '2026-08-13';
state.profiles.seth.streak = 5;
localStorage.setItem('kidRoutineAppState', JSON.stringify(state));
location.reload();
```
Expected after reload:
- Streak resets to 0
- lifetimeStars unchanged

- [ ] **Step 2: Add `renderTaskList` call inside phase body after initial render to ensure no stale "stub" text remains**

Confirm that after Task 5, the stub text "Tasks coming soon…" no longer appears. If it does, verify `renderPhases` calls `renderTaskList` correctly. No code change needed if Task 5 was implemented correctly.

- [ ] **Step 3: Ensure page title updates per profile**

Add to `renderHeader`:
```js
document.title = meta.name + "'s Daily Blueprint ⭐";
```

- [ ] **Step 4: Add `.nojekyll` file for GitHub Pages**

```bash
touch /Users/DavidMills/Documents/workspace/kid-routine-tracker/.nojekyll
```

- [ ] **Step 5: Verify full flow end-to-end**

1. Open splash → select Seth
2. Check all Before School tasks → phase complete banner + big confetti
3. Check all After School tasks (use modal for Parent Question) → phase complete
4. Check all Before Bed tasks → mega confetti, streak = 1, stars = 1
5. Switch to April → separate state (streak/stars unaffected)
6. Reload → Seth's state persists

- [ ] **Step 6: Commit**

```bash
git add app.js .nojekyll
git commit -m "feat: auto-reset verification, title update, GitHub Pages support"
```

---

### Task 9: GitHub Pages Deployment

**Files:**
- No code changes — deploy existing files

**Interfaces:**
- N/A

- [ ] **Step 1: Ensure repo is pushed to GitHub with a `main` branch**

```bash
git remote -v
# If no remote: gh repo create kid-routine-tracker --public --source=. --remote=origin --push
# If remote exists:
git push origin main
```

- [ ] **Step 2: Enable GitHub Pages in repo settings**

```bash
gh api -X PUT repos/{owner}/kid-routine-tracker/pages \
  --field source[branch]=main \
  --field source[path]=/
```

Or: GitHub → Settings → Pages → Source: Deploy from branch `main`, folder `/` → Save.

- [ ] **Step 3: Verify deployment**

Wait ~60 seconds, then open `https://{owner}.github.io/kid-routine-tracker/`.
Expected: splash screen loads, both profiles functional, no console errors.

---

## Self-Review Against Spec

| Spec Requirement | Covered in Task |
|-----------------|----------------|
| Seth blue/teal theme, larger tap targets | Task 1 (CSS vars), Task 5 (bigText flag) |
| April purple/pink, streak emphasis | Task 1, Task 4 |
| Splash screen with avatar cards | Task 1 (HTML), Task 3 (JS) |
| 3 collapsible phase sections | Task 4 |
| 48×48px checkbox hit-box | Task 1 (CSS), Task 5 |
| Task cross-out on complete | Task 1 (CSS animation), Task 5 |
| Mini confetti on checkbox tick | Task 5 |
| Phase complete celebration | Task 6 |
| Daily streak — increment on all 3 phases | Task 6 |
| Auto-reset on new day | Task 2 |
| Streak reset to 0 on skipped day | Task 2 |
| Preserve lifetime stars on reset | Task 2 |
| Parent question modal with random prompt | Task 7 |
| "Mark Complete" button in modal | Task 7 |
| localStorage only, zero backend | Task 2 |
| GitHub Pages compatible | Task 1 (CDN), Task 8 (.nojekyll), Task 9 |
| Mobile-first, iPad + smartphone | Task 1 (viewport, Tailwind) |
