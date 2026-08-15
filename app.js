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

// ── State helpers (stubs — full implementation in later tasks) ──────────────

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return { activeProfile: null, profiles: { seth: {}, april: {} } };
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { /* ignore */ }
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
