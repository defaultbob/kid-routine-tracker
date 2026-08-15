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

// ── State helpers ───────────────────────────────────────────────────────────

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

function autoReset(profile) {
  const today = todayStr();
  if (profile.lastActiveDate === today) return profile;

  const last = new Date(profile.lastActiveDate);
  const now  = new Date(today);
  const daysDiff = Math.round((now - last) / 86400000);

  // Save history for the day we're resetting away from
  profile.history[profile.lastActiveDate] = {
    beforeSchool: Object.values(profile.currentDayTasks.beforeSchool).every(Boolean),
    afterSchool:  Object.values(profile.currentDayTasks.afterSchool).every(Boolean),
    beforeBed:    Object.values(profile.currentDayTasks.beforeBed).every(Boolean)
  };

  if (daysDiff > 1) {
    profile.streak = 0; // missed a day
  }
  profile.currentDayTasks = freshTaskState();
  profile.lastActiveDate = today;

  return profile;
}

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

const PROFILE_META = {
  seth:  { name: 'Seth',  avatar: '🦖', headerClass: 'theme-seth',  checkColor: '#0ea5e9', bigText: true },
  april: { name: 'April', avatar: '🎨', headerClass: 'theme-april', checkColor: '#a855f7', bigText: false }
};

// ── View helpers ────────────────────────────────────────────────────────────

function showView(viewId) {
  document.querySelectorAll('[id^="view-"]').forEach(el => el.classList.add('hidden'));
  document.getElementById('view-' + viewId).classList.remove('hidden');
}

function showDashboard(profileKey) {
  showView('dashboard');
  renderHeader(profileKey);
  renderPhases(profileKey);
}

function renderHeader(profileKey) {
  const meta    = PROFILE_META[profileKey];
  const profile = App.state.profiles[profileKey];
  const header  = document.getElementById('dashboard-header');

  header.classList.remove('theme-seth', 'theme-april');
  header.classList.add(meta.headerClass);

  document.getElementById('header-avatar').textContent  = meta.avatar;
  document.getElementById('header-name').textContent    = meta.name + "'s Day";
  document.getElementById('header-streak').textContent  = profile.streak;
  document.getElementById('header-stars').textContent   = profile.lifetimeStars;
  document.title = meta.name + "'s Daily Blueprint ⭐";
}

function renderPhases(profileKey) {
  const container = document.getElementById('phases-container');
  container.innerHTML = '';

  for (const phaseKey of Object.keys(TASKS)) {
    const meta    = PHASE_META[phaseKey];
    const section = document.createElement('div');
    section.className = 'bg-white rounded-2xl shadow-sm overflow-hidden';
    if (phaseKey === 'beforeBed') section.classList.add('span-full');
    section.id = 'phase-' + phaseKey;

    const header = document.createElement('button');
    header.className = 'w-full flex items-center justify-between px-5 py-4 font-bold text-gray-700 text-lg';
    header.innerHTML = `<span>${meta.label}</span><span class="phase-chevron transition-transform">▾</span>`;

    const body = document.createElement('div');
    body.className = 'phase-body px-4 pb-4';
    if (phaseKey === 'beforeBed') body.classList.add('grid', 'grid-cols-1', 'ipad:grid-cols-2');
    body.id = 'phase-body-' + phaseKey;

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

    textWrap.appendChild(taskLabel);

    if (task.detail) {
      const detail = document.createElement('span');
      detail.className = 'text-xs text-gray-400';
      detail.textContent = task.detail;
      textWrap.appendChild(detail);
    }

    label.appendChild(emoji);
    label.appendChild(textWrap);

    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.id   = 'chk-' + phaseKey + '-' + task.id;
    chk.className = 'task-checkbox';
    chk.checked   = done;
    chk.style.accentColor = meta.checkColor;

    if (task.isModal) {
      chk.addEventListener('change', (e) => {
        e.preventDefault();
        chk.checked = done; // revert — modal handles actual state
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

function toggleTask(phaseKey, taskId, profileKey) {
  const profile = App.state.profiles[profileKey];
  const newVal  = !profile.currentDayTasks[phaseKey][taskId];
  profile.currentDayTasks[phaseKey][taskId] = newVal;
  saveState(App.state);

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

  renderHeader(profileKey);
}

function fireMiniConfetti() {
  confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
}

function checkPhaseComplete(phaseKey, profileKey) {
  // Full implementation in Task 6
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

// ── App namespace ───────────────────────────────────────────────────────────

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
