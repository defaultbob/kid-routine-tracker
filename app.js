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

// ── View helpers (stubs) ────────────────────────────────────────────────────

function showView(id) {
  document.getElementById('view-splash').classList.add('hidden');
  document.getElementById('view-dashboard').classList.add('hidden');
  const el = document.getElementById('view-' + id);
  if (el) el.classList.remove('hidden');
}

function showDashboard(profile) {
  // Stub: just show the dashboard shell with profile name
  const meta = {
    seth:  { name: "Seth's Day",  avatar: '🦖', theme: 'theme-seth' },
    april: { name: "April's Day", avatar: '🎨', theme: 'theme-april' }
  };
  const m = meta[profile] || meta.seth;

  document.getElementById('header-avatar').textContent = m.avatar;
  document.getElementById('header-name').textContent   = m.name;

  const header = document.getElementById('dashboard-header');
  header.className = header.className.replace(/theme-\w+/g, '').trim();
  header.classList.add('sticky', 'top-0', 'z-10', 'shadow-md', 'px-4', 'pt-4', 'pb-3', 'text-white', m.theme);

  showView('dashboard');
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
