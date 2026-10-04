/**
 * DayFlow | Daily Habit & Time Flow Engine v4.3
 * Meeting / Zoom Calendar Timeline • Centered Pop-up Modal • Game-like Time Extender
 */

// --- STORAGE KEYS & CONSTANTS ---
const STORAGE_KEY = 'dayflow_v1';
const SETTINGS_KEY = 'dayflow_settings_v1';

const CATEGORY_META = {
  meeting: { label: 'Teams Meeting', color: '#818cf8', bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.4)', borderLeft: '#818cf8', icon: 'users', defaultDur: 45 },
  office: { label: 'Office', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', borderLeft: '#60a5fa', icon: 'briefcase', defaultDur: 240 },
  business: { label: 'Business', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', borderLeft: '#34d399', icon: 'trending-up', defaultDur: 120 },
  sleep: { label: 'Sleep', color: '#c084fc', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)', borderLeft: '#c084fc', icon: 'moon', defaultDur: 480 },
  workout: { label: 'Workout', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', borderLeft: '#fbbf24', icon: 'activity', defaultDur: 60 },
  personal: { label: 'Personal', color: '#22d3ee', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.4)', borderLeft: '#22d3ee', icon: 'heart', defaultDur: 60 }
};

const DEFAULT_HABITS = [
  { id: 'h_water', title: 'Drink 2L Water', category: 'health', icon: '💧', color: '#06b6d4' },
  { id: 'h_workout', title: 'Daily Workout', category: 'health', icon: '🏋️', color: '#10b981' },
  { id: 'h_reading', title: 'Reading & Learning', category: 'learning', icon: '📖', color: '#8b5cf6' }
];

const LEVEL_TIERS = [
  { level: 1, title: 'Novice Explorer', minXp: 0 },
  { level: 2, title: 'Consistent Builder', minXp: 200 },
  { level: 3, title: 'Deep Work Knight', minXp: 500 },
  { level: 4, title: 'Master Creator', minXp: 1000 },
  { level: 5, title: 'Titan Grandmaster', minXp: 2000 }
];

// Default Clean Starter Schedule (No hardcoded timing in names)
const DEFAULT_PLANS = [
  {
    id: 'p_business',
    title: 'Business',
    category: 'business',
    startMins: 420,  // 07:00 AM
    endMins: 540,    // 09:00 AM
    durationMins: 120,
    repeat: 'daily',
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    date: getTodayDateStr(),
    isMultitask: false,
    completedDates: {}
  },
  {
    id: 'p_meeting',
    title: 'Teams Meeting',
    category: 'meeting',
    startMins: 600,  // 10:00 AM
    endMins: 645,    // 10:45 AM
    durationMins: 45,
    repeat: 'weekdays',
    repeatDays: [1, 2, 3, 4, 5],
    date: getTodayDateStr(),
    isMultitask: false,
    completedDates: {}
  },
  {
    id: 'p_office',
    title: 'Office',
    category: 'office',
    startMins: 660,  // 11:00 AM
    endMins: 900,    // 03:00 PM
    durationMins: 240,
    repeat: 'weekdays',
    repeatDays: [1, 2, 3, 4, 5],
    date: getTodayDateStr(),
    isMultitask: false,
    completedDates: {}
  },
  {
    id: 'p_workout',
    title: 'Workout',
    category: 'workout',
    startMins: 1080, // 06:00 PM
    endMins: 1140,   // 07:00 PM
    durationMins: 60,
    repeat: 'custom',
    repeatDays: [1, 3, 5], // Mon, Wed, Fri
    date: getTodayDateStr(),
    isMultitask: false,
    completedDates: {}
  },
  {
    id: 'p_sleep',
    title: 'Sleep',
    category: 'sleep',
    startMins: 1380, // 11:00 PM
    endMins: 420,    // 07:00 AM
    durationMins: 480,
    repeat: 'daily',
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    date: getTodayDateStr(),
    isMultitask: false,
    completedDates: {}
  }
];

// --- GLOBAL STATE ---
let currentDateStr = getTodayDateStr();
let appData = loadAppData();
let appSettings = loadSettings();
let currentEditingPlanId = null;
let currentEditingHabitId = null;
let habitSelectedEmoji = '💧';
let modalActiveCategory = 'office';
let modalSelectedDays = [1, 3, 5];
let donutChartInstance = null;
let audioCtx = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      reg.update().catch(() => {});
    }).catch(e => console.log('SW Note:', e));
  }

  ensureInitialPlans();
  populateModalTimeDropdowns();
  setupEventListeners();
  refreshAllViews();

  if (window.lucide) lucide.createIcons();
});

// --- AUDIO SFX SYNTHESIZER ---
function playSfx(type) {
  if ('vibrate' in navigator) {
    try { navigator.vibrate(type === 'quest' ? [20, 50, 20] : 10); } catch (e) {}
  }

  if (!appSettings.player?.soundEnabled) return;

  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;

    if (type === 'tab') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.055);
    } else if (type === 'tap') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.035);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'check') {
      [587.33, 880].forEach((freq, idx) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + idx * 0.07);
        g.gain.setValueAtTime(0.18, now + idx * 0.07);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);
        o.start(now + idx * 0.07);
        o.stop(now + idx * 0.07 + 0.23);
      });
    } else if (type === 'quest' || type === 'victory') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + idx * 0.08);
        g.gain.setValueAtTime(0.22, now + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        o.start(now + idx * 0.08);
        o.stop(now + idx * 0.08 + 0.36);
      });
    }
  } catch (e) {}
}

function fireConfetti() {
  if (typeof window.confetti === 'function') {
    window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.65 }, colors: ['#10b981', '#06b6d4', '#6366f1', '#fbbf24'] });
  }
}

// --- GAMIFICATION / XP ---
function addXP(amount) {
  if (!appSettings.player) appSettings.player = { xp: 850, soundEnabled: true };
  const oldLevel = getPlayerLevel(appSettings.player.xp).level;
  appSettings.player.xp += amount;
  const newLevelObj = getPlayerLevel(appSettings.player.xp);

  saveSettings();
  playSfx('check');

  if (newLevelObj.level > oldLevel) {
    playSfx('quest');
    fireConfetti();
  }
  updatePlayerHeader();
}

function getPlayerLevel(xp) {
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_TIERS[i].minXp) return LEVEL_TIERS[i];
  }
  return LEVEL_TIERS[0];
}

function updatePlayerHeader() {
  const p = appSettings.player || { xp: 850, soundEnabled: true };
  const lvl = getPlayerLevel(p.xp);
  
  const badge = document.getElementById('playerLevelBadge');
  if (badge) badge.textContent = `L${lvl.level}`;
  
  const title = document.getElementById('playerTitleText');
  if (title) title.innerHTML = `${lvl.title} • <span id="playerXpText">${p.xp} XP</span>`;

  // Persistent Sound Buttons
  const soundIconWrap = document.getElementById('soundIconWrapper');
  const soundStatusText = document.getElementById('soundStatusText');
  const soundBtn = document.getElementById('soundToggleBtn');
  const settingsSoundBtn = document.getElementById('settingsSoundBtn');

  if (soundBtn && soundIconWrap && soundStatusText) {
    if (p.soundEnabled) {
      soundIconWrap.innerHTML = '<i data-lucide="volume-2" class="w-4 h-4 text-emerald-400"></i>';
      soundStatusText.textContent = 'ON';
      soundStatusText.className = 'text-[11px] font-black text-emerald-400';
      soundBtn.className = 'btn-press flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-surface-850 border border-emerald-500/30 text-slate-300 font-bold text-xs shadow-sm';
      if (settingsSoundBtn) {
        settingsSoundBtn.textContent = 'ON';
        settingsSoundBtn.className = 'btn-press px-3 py-1 rounded-xl bg-surface-850 border border-emerald-500/30 text-emerald-400 font-black text-xs';
      }
    } else {
      soundIconWrap.innerHTML = '<i data-lucide="volume-x" class="w-4 h-4 text-slate-500"></i>';
      soundStatusText.textContent = 'OFF';
      soundStatusText.className = 'text-[11px] font-black text-slate-500';
      soundBtn.className = 'btn-press flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-surface-850 border border-surface-750 text-slate-400 font-bold text-xs';
      if (settingsSoundBtn) {
        settingsSoundBtn.textContent = 'OFF';
        settingsSoundBtn.className = 'btn-press px-3 py-1 rounded-xl bg-surface-850 border border-surface-750 text-slate-400 font-black text-xs';
      }
    }
    if (window.lucide) lucide.createIcons();
  }
}

// --- DATE HELPERS ---
function getTodayDateStr() {
  const d = new Date();
  return formatDateStr(d);
}

function formatDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateStr(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function minsToTimeStr(totalMins) {
  const mins = ((totalMins % 1440) + 1440) % 1440;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDurationMins(dur) {
  if (dur < 60) return `${dur}m`;
  const h = Math.floor(dur / 60);
  const m = dur % 60;
  if (m === 0) return `${h}h 00m`;
  return `${h}h ${m}m`;
}

function getWeekRangeText(dateStr) {
  const activeDate = parseDateStr(dateStr);
  const currentDayOfWeek = activeDate.getDay();
  const sunday = new Date(activeDate);
  sunday.setDate(activeDate.getDate() - currentDayOfWeek);
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startMonth = months[sunday.getMonth()];
  const endMonth = months[saturday.getMonth()];
  
  if (startMonth === endMonth) {
    return `${startMonth} ${String(sunday.getDate()).padStart(2, '0')} - ${String(saturday.getDate()).padStart(2, '0')}`;
  } else {
    return `${startMonth} ${String(sunday.getDate()).padStart(2, '0')} - ${endMonth} ${String(saturday.getDate()).padStart(2, '0')}`;
  }
}

// --- DATA STORAGE & MIGRATION ---
function loadAppData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('chronosense_v3');
    const data = raw ? JSON.parse(raw) : {};
    if (!data.plans) data.plans = [];
    return data;
  } catch (e) {
    return { plans: [] };
  }
}

function saveAppData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  } catch (e) {}
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const s = raw ? JSON.parse(raw) : null;
    if (s && s.habits) {
      if (s.habits.some(h => h.title && (h.title.includes('Zero distractions') || h.title.includes('mother / friends')))) {
        s.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
      }
      return s;
    }
    return {
      player: { xp: 850, soundEnabled: true },
      habits: JSON.parse(JSON.stringify(DEFAULT_HABITS)),
      dailyGoalHours: 5.0
    };
  } catch (e) {
    return { player: { xp: 850, soundEnabled: true }, habits: JSON.parse(JSON.stringify(DEFAULT_HABITS)), dailyGoalHours: 5.0 };
  }
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
  } catch (e) {}
}

function ensureInitialPlans() {
  if (!appData.plans || appData.plans.length === 0) {
    appData.plans = JSON.parse(JSON.stringify(DEFAULT_PLANS));
    saveAppData();
  } else {
    // Clean out old wrong timing templates if they were stored previously
    let hasDirty = false;
    appData.plans.forEach(p => {
      if (p.title && (p.title.includes('YouTube') || p.title.includes('2:00 to 6:00') || p.title.includes('Work From Home'))) {
        if (p.title.includes('YouTube')) { p.title = 'Business'; p.category = 'business'; }
        if (p.title.includes('Office Work')) { p.title = 'Office'; p.category = 'office'; }
        hasDirty = true;
      }
    });
    if (hasDirty) saveAppData();
  }
}

// --- MODAL TIME DROPDOWNS (15-Minute Increments) ---
function populateModalTimeDropdowns() {
  const startSelect = document.getElementById('modalStartHourSelect');
  const endSelect = document.getElementById('modalEndHourSelect');
  if (!startSelect || !endSelect) return;

  startSelect.innerHTML = '';
  endSelect.innerHTML = '';

  for (let m = 0; m < 1440; m += 15) {
    const timeStr = minsToTimeStr(m);
    
    const optStart = document.createElement('option');
    optStart.value = m;
    optStart.textContent = timeStr;
    startSelect.appendChild(optStart);

    const optEnd = document.createElement('option');
    optEnd.value = m;
    optEnd.textContent = timeStr;
    endSelect.appendChild(optEnd);
  }

  startSelect.value = 540; // 09:00 AM
  endSelect.value = 600;   // 10:00 AM
  updateModalDurationDisplay();
}

function updateModalDurationDisplay() {
  const startSelect = document.getElementById('modalStartHourSelect');
  const endSelect = document.getElementById('modalEndHourSelect');
  const badge = document.getElementById('modalDurationBadge');
  if (!startSelect || !endSelect || !badge) return;

  const startMins = parseInt(startSelect.value, 10);
  const endMins = parseInt(endSelect.value, 10);

  let diff = endMins - startMins;
  if (diff <= 0) diff += 1440;

  badge.textContent = formatDurationMins(diff);
}

// --- MODAL CONTROLLER ---
function openPlanModal(planId = null, defaultStartHour = null) {
  playSfx('tap');
  currentEditingPlanId = planId;

  const modal = document.getElementById('entryModal');
  const titleInput = document.getElementById('modalActivityTitleInput');
  const modalTitle = document.getElementById('modalTitle');
  const startSelect = document.getElementById('modalStartHourSelect');
  const endSelect = document.getElementById('modalEndHourSelect');
  const repeatSelect = document.getElementById('modalRepeatSelect');
  const multiCheck = document.getElementById('modalMultitaskCheckbox');
  const deleteBtn = document.getElementById('modalDeleteBtn');
  const customDaysRow = document.getElementById('modalCustomDaysRow');

  if (planId) {
    const plan = appData.plans.find(p => p.id === planId);
    if (!plan) return;

    modalTitle.textContent = 'Edit Plan';
    titleInput.value = plan.title;
    modalActiveCategory = plan.category || 'office';
    startSelect.value = plan.startMins;
    endSelect.value = plan.endMins;
    repeatSelect.value = plan.repeat || 'today';
    multiCheck.checked = Boolean(plan.isMultitask);
    modalSelectedDays = plan.repeatDays && plan.repeatDays.length ? [...plan.repeatDays] : [1, 3, 5];

    deleteBtn.classList.remove('hidden');
  } else {
    modalTitle.textContent = 'Schedule Plan';
    modalActiveCategory = 'office';
    titleInput.value = 'Office';

    let sMins = 540; // 9:00 AM default
    if (defaultStartHour !== null) {
      sMins = defaultStartHour * 60;
    }
    startSelect.value = sMins;
    endSelect.value = (sMins + 240) % 1440; // +4h default for office

    repeatSelect.value = 'today';
    multiCheck.checked = false;
    modalSelectedDays = [1, 3, 5];

    deleteBtn.classList.add('hidden');
  }

  // Update preset chip highlights
  document.querySelectorAll('#modalPresetChips .modal-preset-chip').forEach(btn => {
    if (btn.getAttribute('data-cat') === modalActiveCategory) {
      btn.classList.add('border-emerald-500', 'bg-emerald-500/20');
    } else {
      btn.classList.remove('border-emerald-500', 'bg-emerald-500/20');
    }
  });

  // Custom days visibility
  if (repeatSelect.value === 'custom') {
    customDaysRow.classList.remove('hidden');
  } else {
    customDaysRow.classList.add('hidden');
  }
  updateCustomDayPills();
  updateModalDurationDisplay();

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closePlanModal() {
  playSfx('tap');
  const modal = document.getElementById('entryModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  currentEditingPlanId = null;
}

function updateCustomDayPills() {
  document.querySelectorAll('#modalDayPillGroup .day-select-pill').forEach(pill => {
    const day = parseInt(pill.getAttribute('data-day'), 10);
    if (modalSelectedDays.includes(day)) {
      pill.className = 'day-select-pill btn-press py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-black text-center shadow-sm';
    } else {
      pill.className = 'day-select-pill btn-press py-1.5 rounded-xl bg-surface-800 border border-surface-700 text-slate-400 text-xs font-black text-center';
    }
  });
}

function saveModalPlan() {
  const titleInput = document.getElementById('modalActivityTitleInput');
  const startSelect = document.getElementById('modalStartHourSelect');
  const endSelect = document.getElementById('modalEndHourSelect');
  const repeatSelect = document.getElementById('modalRepeatSelect');
  const multiCheck = document.getElementById('modalMultitaskCheckbox');

  const title = titleInput.value.trim() || 'Focus Session';
  const startMins = parseInt(startSelect.value, 10);
  const endMins = parseInt(endSelect.value, 10);
  const repeat = repeatSelect.value;
  const isMultitask = multiCheck.checked;

  let durationMins = endMins - startMins;
  if (durationMins <= 0) durationMins += 1440;

  if (currentEditingPlanId) {
    const plan = appData.plans.find(p => p.id === currentEditingPlanId);
    if (plan) {
      plan.title = title;
      plan.category = modalActiveCategory;
      plan.startMins = startMins;
      plan.endMins = endMins;
      plan.durationMins = durationMins;
      plan.repeat = repeat;
      plan.repeatDays = repeat === 'custom' ? [...modalSelectedDays] : [];
      plan.isMultitask = isMultitask;
    }
  } else {
    const newPlan = {
      id: 'plan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: title,
      category: modalActiveCategory,
      startMins: startMins,
      endMins: endMins,
      durationMins: durationMins,
      repeat: repeat,
      repeatDays: repeat === 'custom' ? [...modalSelectedDays] : [],
      date: currentDateStr,
      isMultitask: isMultitask,
      completedDates: {}
    };
    appData.plans.push(newPlan);
  }

  saveAppData();
  playSfx('check');
  closePlanModal();
  refreshAllViews();
}

function deleteModalPlan() {
  if (!currentEditingPlanId) return;
  if (confirm('Delete this plan?')) {
    appData.plans = appData.plans.filter(p => p.id !== currentEditingPlanId);
    saveAppData();
    playSfx('tap');
    closePlanModal();
    refreshAllViews();
  }
}

// --- HABIT MODAL CONTROLLER ---
function openHabitModal(habitId = null) {
  playSfx('tap');
  currentEditingHabitId = habitId;

  const modal = document.getElementById('habitModal');
  const modalTitle = document.getElementById('habitModalTitle');
  const titleInput = document.getElementById('habitTitleInput');
  const catSelect = document.getElementById('habitCategorySelect');
  const deleteBtn = document.getElementById('habitDeleteBtn');
  const preview = document.getElementById('habitSelectedEmojiPreview');

  if (habitId) {
    const habit = (appSettings.habits || []).find(h => h.id === habitId);
    if (!habit) return;

    modalTitle.textContent = 'Edit Habit';
    titleInput.value = habit.title;
    catSelect.value = habit.category || 'health';
    habitSelectedEmoji = habit.icon || '💧';
    deleteBtn.classList.remove('hidden');
  } else {
    modalTitle.textContent = 'New Habit';
    titleInput.value = '';
    catSelect.value = 'health';
    habitSelectedEmoji = '💧';
    deleteBtn.classList.add('hidden');
  }

  if (preview) preview.textContent = habitSelectedEmoji;

  // Highlight selected emoji in grid
  document.querySelectorAll('#habitEmojiGrid .habit-emoji-btn').forEach(btn => {
    if (btn.getAttribute('data-emoji') === habitSelectedEmoji) {
      btn.classList.add('border-emerald-500', 'bg-emerald-500/20');
    } else {
      btn.classList.remove('border-emerald-500', 'bg-emerald-500/20');
    }
  });

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeHabitModal() {
  playSfx('tap');
  const modal = document.getElementById('habitModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  currentEditingHabitId = null;
}

function saveHabitModal() {
  const titleInput = document.getElementById('habitTitleInput');
  const catSelect = document.getElementById('habitCategorySelect');

  const title = titleInput.value.trim() || 'Daily Habit';
  const category = catSelect.value || 'health';

  if (!appSettings.habits) appSettings.habits = [];

  if (currentEditingHabitId) {
    const habit = appSettings.habits.find(h => h.id === currentEditingHabitId);
    if (habit) {
      habit.title = title;
      habit.icon = habitSelectedEmoji;
      habit.category = category;
    }
  } else {
    const newHabit = {
      id: 'h_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: title,
      icon: habitSelectedEmoji,
      category: category,
      color: '#10b981'
    };
    appSettings.habits.push(newHabit);
  }

  saveSettings();
  playSfx('check');
  closeHabitModal();
  renderHabitGrids();
}

function deleteHabit(habitId) {
  if (confirm('Delete this habit?')) {
    appSettings.habits = (appSettings.habits || []).filter(h => h.id !== habitId);
    saveSettings();
    playSfx('tap');
    closeHabitModal();
    renderHabitGrids();
  }
}

// --- 60-SECOND EVENING AUDIT & TOMORROW PRIMING ---
function openEveningAuditModal() {
  playSfx('tap');
  const modal = document.getElementById('eveningAuditModal');
  const checklistContainer = document.getElementById('eveningAuditChecklist');
  const habitsContainer = document.getElementById('eveningAuditHabitsList');

  if (!modal || !checklistContainer) return;
  checklistContainer.innerHTML = '';
  if (habitsContainer) habitsContainer.innerHTML = '';

  const plansForToday = getPlansForDate(currentDateStr);

  if (plansForToday.length === 0) {
    checklistContainer.innerHTML = `
      <div class="text-center py-4 text-slate-400 text-xs bg-surface-850 rounded-2xl p-4">
        No scheduled blocks found for today.
      </div>
    `;
  } else {
    plansForToday.forEach(plan => {
      const isDone = Boolean(plan.completedDates && plan.completedDates[currentDateStr]);
      const meta = CATEGORY_META[plan.category] || CATEGORY_META.office;
      const startStr = minsToTimeStr(plan.startMins);
      const endStr = minsToTimeStr(plan.endMins);
      const durStr = formatDurationMins(plan.durationMins);

      const row = document.createElement('div');
      row.className = 'flex items-center justify-between p-2.5 rounded-2xl bg-surface-850 border border-surface-800 transition';
      row.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${meta.color}"></span>
          <div>
            <h4 class="text-xs font-bold text-white">${plan.title}</h4>
            <span class="text-[10px] text-slate-400">${startStr} - ${endStr} (${durStr})</span>
          </div>
        </div>
        <button type="button" data-plan-id="${plan.id}" class="audit-plan-toggle btn-press px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition ${
          isDone !== false 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
            : 'bg-surface-800 text-slate-500 border border-surface-750'
        }">
          <i data-lucide="${isDone !== false ? 'check-circle' : 'circle'}" class="w-3.5 h-3.5"></i>
          <span>${isDone !== false ? 'Done' : 'Skipped'}</span>
        </button>
      `;

      const btn = row.querySelector('.audit-plan-toggle');
      btn.addEventListener('click', () => {
        playSfx('tap');
        const checked = btn.classList.contains('text-emerald-400');
        if (checked) {
          btn.className = 'audit-plan-toggle btn-press px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition bg-surface-800 text-slate-500 border border-surface-750';
          btn.innerHTML = '<i data-lucide="circle" class="w-3.5 h-3.5"></i><span>Skipped</span>';
        } else {
          btn.className = 'audit-plan-toggle btn-press px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
          btn.innerHTML = '<i data-lucide="check-circle" class="w-3.5 h-3.5"></i><span>Done</span>';
        }
        if (window.lucide) lucide.createIcons();
      });

      checklistContainer.appendChild(row);
    });
  }

  // Habits List
  const habits = appSettings.habits || [];
  if (habitsContainer && habits.length > 0) {
    if (!appData[currentDateStr]) appData[currentDateStr] = { habits: [] };
    const todayHabits = appData[currentDateStr].habits || [];

    habits.forEach(habit => {
      const isDone = Boolean(todayHabits.find(h => h.id === habit.id)?.completed);

      const hRow = document.createElement('div');
      hRow.className = 'flex items-center justify-between p-2 rounded-xl bg-surface-850/80 border border-surface-800 text-xs';
      hRow.innerHTML = `
        <div class="flex items-center gap-2">
          <span>${habit.icon || '💧'}</span>
          <span class="font-bold text-slate-200 text-xs">${habit.title}</span>
        </div>
        <button type="button" data-habit-id="${habit.id}" class="audit-habit-toggle btn-press px-2 py-0.5 rounded-lg text-xs font-black flex items-center gap-1 transition ${
          isDone 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
            : 'bg-surface-800 text-slate-500 border border-surface-750'
        }">
          <i data-lucide="${isDone ? 'check-circle' : 'circle'}" class="w-3.5 h-3.5"></i>
          <span>${isDone ? 'Done' : 'Missed'}</span>
        </button>
      `;

      const hBtn = hRow.querySelector('.audit-habit-toggle');
      hBtn.addEventListener('click', () => {
        playSfx('tap');
        const checked = hBtn.classList.contains('text-emerald-400');
        if (checked) {
          hBtn.className = 'audit-habit-toggle btn-press px-2 py-0.5 rounded-lg text-xs font-black flex items-center gap-1 transition bg-surface-800 text-slate-500 border border-surface-750';
          hBtn.innerHTML = '<i data-lucide="circle" class="w-3.5 h-3.5"></i><span>Missed</span>';
        } else {
          hBtn.className = 'audit-habit-toggle btn-press px-2 py-0.5 rounded-lg text-xs font-black flex items-center gap-1 transition bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
          hBtn.innerHTML = '<i data-lucide="check-circle" class="w-3.5 h-3.5"></i><span>Done</span>';
        }
        if (window.lucide) lucide.createIcons();
      });

      habitsContainer.appendChild(hRow);
    });
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (window.lucide) lucide.createIcons();
}

function closeEveningAuditModal() {
  playSfx('tap');
  const modal = document.getElementById('eveningAuditModal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
}

function auditSelectAll() {
  playSfx('tap');
  document.querySelectorAll('.audit-plan-toggle').forEach(btn => {
    btn.className = 'audit-plan-toggle btn-press px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
    btn.innerHTML = '<i data-lucide="check-circle" class="w-3.5 h-3.5"></i><span>Done</span>';
  });
  document.querySelectorAll('.audit-habit-toggle').forEach(hBtn => {
    hBtn.className = 'audit-habit-toggle btn-press px-2 py-0.5 rounded-lg text-xs font-black flex items-center gap-1 transition bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
    hBtn.innerHTML = '<i data-lucide="check-circle" class="w-3.5 h-3.5"></i><span>Done</span>';
  });
  if (window.lucide) lucide.createIcons();
}

function confirmEveningAudit() {
  // Save all plan completions
  document.querySelectorAll('.audit-plan-toggle').forEach(btn => {
    const planId = btn.getAttribute('data-plan-id');
    const isDone = btn.classList.contains('text-emerald-400');
    const plan = appData.plans.find(p => p.id === planId);
    if (plan) {
      if (!plan.completedDates) plan.completedDates = {};
      plan.completedDates[currentDateStr] = isDone;
    }
  });

  // Save all habit completions
  if (!appData[currentDateStr]) appData[currentDateStr] = { habits: [] };
  const todayHabits = appData[currentDateStr].habits || [];

  document.querySelectorAll('.audit-habit-toggle').forEach(hBtn => {
    const habitId = hBtn.getAttribute('data-habit-id');
    const isDone = hBtn.classList.contains('text-emerald-400');
    let hRecord = todayHabits.find(h => h.id === habitId);
    if (hRecord) {
      hRecord.completed = isDone;
    } else {
      todayHabits.push({ id: habitId, completed: isDone });
    }
  });

  saveAppData();
  playSfx('quest');
  fireConfetti();
  addXP(60);

  closeEveningAuditModal();
  refreshAllViews();
}

function previewTomorrow() {
  playSfx('tab');
  navigateDay(1);
}

// --- SETUP EVENT LISTENERS ---
function setupEventListeners() {
  // Navigation Tabs
  const navMap = {
    navTabToday: 'today',
    navTabHabits: 'habits',
    navTabStats: 'stats',
    navTabSettings: 'settings'
  };
  Object.keys(navMap).forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      playSfx('tab');
      switchTab(navMap[id]);
    });
  });

  // Sound Buttons
  const soundBtn = document.getElementById('soundToggleBtn');
  const settingsSoundBtn = document.getElementById('settingsSoundBtn');
  const toggleSound = () => {
    if (!appSettings.player) appSettings.player = { xp: 850, soundEnabled: true };
    appSettings.player.soundEnabled = !appSettings.player.soundEnabled;
    saveSettings();
    playSfx('tap');
    updatePlayerHeader();
  };
  soundBtn?.addEventListener('click', toggleSound);
  settingsSoundBtn?.addEventListener('click', toggleSound);

  // Week & Day Navigation
  document.getElementById('prevWeekBtn')?.addEventListener('click', () => {
    playSfx('tap');
    navigateWeek(-1);
  });
  document.getElementById('nextWeekBtn')?.addEventListener('click', () => {
    playSfx('tap');
    navigateWeek(1);
  });
  document.getElementById('prevDayBtn')?.addEventListener('click', () => {
    playSfx('tap');
    navigateDay(-1);
  });
  document.getElementById('nextDayBtn')?.addEventListener('click', () => {
    playSfx('tap');
    navigateDay(1);
  });
  document.getElementById('todayJumpBtn')?.addEventListener('click', () => {
    playSfx('tap');
    currentDateStr = getTodayDateStr();
    refreshAllViews();
  });

  // Floating Plus & Open Plan Modal
  document.getElementById('floatingPlusBtn')?.addEventListener('click', () => {
    openPlanModal(null, new Date().getHours());
  });
  document.getElementById('openPlanModalBtn')?.addEventListener('click', () => {
    openPlanModal(null, new Date().getHours());
  });
  document.getElementById('closeEntryModalBtn')?.addEventListener('click', closePlanModal);

  // Quick Chips on Top of Today View
  document.querySelectorAll('.quick-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.getAttribute('data-activity');
      const cat = btn.getAttribute('data-cat');
      openPlanModal(null, new Date().getHours());
      
      const titleInput = document.getElementById('modalActivityTitleInput');
      if (titleInput) titleInput.value = act;
      modalActiveCategory = cat;

      const durMeta = CATEGORY_META[cat];
      if (durMeta) {
        const startSelect = document.getElementById('modalStartHourSelect');
        const endSelect = document.getElementById('modalEndHourSelect');
        const sMins = parseInt(startSelect.value, 10);
        endSelect.value = (sMins + durMeta.defaultDur) % 1440;
        updateModalDurationDisplay();
      }

      document.querySelectorAll('#modalPresetChips .modal-preset-chip').forEach(b => {
        if (b.getAttribute('data-cat') === cat) {
          b.classList.add('border-emerald-500', 'bg-emerald-500/20');
        } else {
          b.classList.remove('border-emerald-500', 'bg-emerald-500/20');
        }
      });
    });
  });

  // Modal Preset Chips
  document.querySelectorAll('#modalPresetChips .modal-preset-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      playSfx('tap');
      const name = btn.getAttribute('data-name');
      const cat = btn.getAttribute('data-cat');
      modalActiveCategory = cat;

      const titleInput = document.getElementById('modalActivityTitleInput');
      if (titleInput) titleInput.value = name;

      const meta = CATEGORY_META[cat];
      if (meta) {
        const startSelect = document.getElementById('modalStartHourSelect');
        const endSelect = document.getElementById('modalEndHourSelect');
        const sMins = parseInt(startSelect.value, 10);
        endSelect.value = (sMins + meta.defaultDur) % 1440;
        updateModalDurationDisplay();
      }

      document.querySelectorAll('#modalPresetChips .modal-preset-chip').forEach(b => {
        b.classList.remove('border-emerald-500', 'bg-emerald-500/20');
      });
      btn.classList.add('border-emerald-500', 'bg-emerald-500/20');
    });
  });

  // Time Selects change
  document.getElementById('modalStartHourSelect')?.addEventListener('change', updateModalDurationDisplay);
  document.getElementById('modalEndHourSelect')?.addEventListener('change', updateModalDurationDisplay);

  // Tactile Game-like Extend Buttons
  document.querySelectorAll('#modalExtendBtnsGroup .extend-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSfx('tap');
      const delta = parseInt(btn.getAttribute('data-delta'), 10);
      const endSelect = document.getElementById('modalEndHourSelect');
      if (!endSelect) return;

      let cur = parseInt(endSelect.value, 10);
      cur = ((cur + delta) % 1440 + 1440) % 1440;
      endSelect.value = cur;
      updateModalDurationDisplay();
    });
  });

  // Repeat Selector Change
  document.getElementById('modalRepeatSelect')?.addEventListener('change', (e) => {
    playSfx('tap');
    const customDaysRow = document.getElementById('modalCustomDaysRow');
    if (e.target.value === 'custom') {
      customDaysRow?.classList.remove('hidden');
    } else {
      customDaysRow?.classList.add('hidden');
    }
  });

  // Custom Day Toggle Pills
  document.querySelectorAll('#modalDayPillGroup .day-select-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      playSfx('tap');
      const day = parseInt(pill.getAttribute('data-day'), 10);
      if (modalSelectedDays.includes(day)) {
        modalSelectedDays = modalSelectedDays.filter(d => d !== day);
      } else {
        modalSelectedDays.push(day);
      }
      updateCustomDayPills();
    });
  });

  // Modal Save & Delete
  document.getElementById('modalSaveBtn')?.addEventListener('click', saveModalPlan);
  document.getElementById('modalDeleteBtn')?.addEventListener('click', deleteModalPlan);

  // Habit Modal Listeners
  document.getElementById('addNewHabitBtn')?.addEventListener('click', () => openHabitModal(null));
  document.getElementById('closeHabitModalBtn')?.addEventListener('click', closeHabitModal);
  document.getElementById('habitSaveBtn')?.addEventListener('click', saveHabitModal);
  document.getElementById('habitDeleteBtn')?.addEventListener('click', () => {
    if (currentEditingHabitId) deleteHabit(currentEditingHabitId);
  });

  document.querySelectorAll('#habitEmojiGrid .habit-emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSfx('tap');
      habitSelectedEmoji = btn.getAttribute('data-emoji') || '💧';
      const preview = document.getElementById('habitSelectedEmojiPreview');
      if (preview) preview.textContent = habitSelectedEmoji;

      document.querySelectorAll('#habitEmojiGrid .habit-emoji-btn').forEach(b => {
        b.classList.remove('border-emerald-500', 'bg-emerald-500/20');
      });
      btn.classList.add('border-emerald-500', 'bg-emerald-500/20');
    });
  });

  // Evening Audit & Tomorrow Priming Listeners
  document.getElementById('openEveningAuditBtn')?.addEventListener('click', openEveningAuditModal);
  document.getElementById('closeEveningAuditBtn')?.addEventListener('click', closeEveningAuditModal);
  document.getElementById('auditSelectAllBtn')?.addEventListener('click', auditSelectAll);
  document.getElementById('eveningAuditConfirmBtn')?.addEventListener('click', confirmEveningAudit);
  document.getElementById('previewTomorrowBtn')?.addEventListener('click', previewTomorrow);
  document.getElementById('auditGoToTomorrowBtn')?.addEventListener('click', () => {
    closeEveningAuditModal();
    previewTomorrow();
  });

  // Backup & Reset in Settings
  document.getElementById('exportCsvBtn')?.addEventListener('click', exportCsvData);
  document.getElementById('backupJsonBtn')?.addEventListener('click', backupJsonData);
  document.getElementById('importJsonInput')?.addEventListener('change', importJsonData);
  document.getElementById('loadSampleDataBtn')?.addEventListener('click', () => {
    playSfx('tap');
    if (confirm('Reset to standard clean schedule?')) {
      appData.plans = JSON.parse(JSON.stringify(DEFAULT_PLANS));
      saveAppData();
      refreshAllViews();
    }
  });
  document.getElementById('clearTodayBtn')?.addEventListener('click', () => {
    playSfx('tap');
    if (confirm("Clear all plans for today?")) {
      appData.plans = appData.plans.filter(p => p.repeat !== 'today' || p.date !== currentDateStr);
      saveAppData();
      refreshAllViews();
    }
  });

  // Settings Goal Slider
  document.getElementById('settingsGoalInput')?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('settingsGoalDisplay').textContent = `${val.toFixed(1)} hrs`;
    appSettings.dailyGoalHours = val;
    saveSettings();
    renderTodayTimeline();
  });
}

// --- NAVIGATION & DATE SWITCHING ---
function navigateDay(delta) {
  const d = parseDateStr(currentDateStr);
  d.setDate(d.getDate() + delta);
  currentDateStr = formatDateStr(d);
  refreshAllViews();
}

function navigateWeek(deltaWeeks) {
  const d = parseDateStr(currentDateStr);
  d.setDate(d.getDate() + (deltaWeeks * 7));
  currentDateStr = formatDateStr(d);
  refreshAllViews();
}

function switchTab(tabId) {
  const tabs = {
    today: { view: 'viewToday', nav: 'navTabToday' },
    habits: { view: 'viewHabits', nav: 'navTabHabits' },
    stats: { view: 'viewStats', nav: 'navTabStats' },
    settings: { view: 'viewSettings', nav: 'navTabSettings' }
  };

  Object.keys(tabs).forEach(k => {
    const v = document.getElementById(tabs[k].view);
    const n = document.getElementById(tabs[k].nav);
    if (k === tabId) {
      v?.classList.remove('hidden');
      n?.classList.remove('text-slate-400');
      n?.classList.add('text-emerald-400', 'font-black');
    } else {
      v?.classList.add('hidden');
      n?.classList.remove('text-emerald-400', 'font-black');
      n?.classList.add('text-slate-400');
    }
  });

  if (tabId === 'today') renderTodayTimeline();
  else if (tabId === 'habits') renderHabitGrids();
  else if (tabId === 'stats') renderStats();

  if (window.lucide) lucide.createIcons();
}

function refreshAllViews() {
  updatePlayerHeader();
  renderDayHeader();
  renderWeekCapsules();
  renderTodayTimeline();
  renderHabitGrids();
  renderStats();
  if (window.lucide) lucide.createIcons();
}

// --- RENDER DAY HEADER ---
function renderDayHeader() {
  const activeDate = parseDateStr(currentDateStr);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = daysOfWeek[activeDate.getDay()];
  const monthName = months[activeDate.getMonth()];
  const dayNum = activeDate.getDate();

  const titleEl = document.getElementById('selectedDayTitle');
  if (titleEl) titleEl.textContent = `${dayName}, ${monthName} ${dayNum}`;

  const todayBadge = document.getElementById('isTodayBadge');
  if (todayBadge) {
    if (currentDateStr === getTodayDateStr()) {
      todayBadge.classList.remove('hidden');
    } else {
      todayBadge.classList.add('hidden');
    }
  }

  const rangeLabel = document.getElementById('weekRangeLabel');
  if (rangeLabel) rangeLabel.textContent = getWeekRangeText(currentDateStr);
}

// --- TOP WEEK CAPSULE BAR ---
function renderWeekCapsules() {
  const container = document.getElementById('weekCapsuleBar');
  if (!container) return;
  container.innerHTML = '';

  const activeDate = parseDateStr(currentDateStr);
  const currentDayOfWeek = activeDate.getDay();
  const sunday = new Date(activeDate);
  sunday.setDate(activeDate.getDate() - currentDayOfWeek);

  const dayLetters = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 7; i++) {
    const dateObj = new Date(sunday);
    dateObj.setDate(sunday.getDate() + i);
    const dateKey = formatDateStr(dateObj);
    const isSelected = dateKey === currentDateStr;
    const isWeekend = (i === 0 || i === 6);

    // Calculate completed hours for that day
    let compHours = 0;
    const plansForDate = getPlansForDate(dateKey);
    plansForDate.forEach(p => {
      if (p.completedDates && p.completedDates[dateKey]) {
        if (!p.isMultitask && (p.category === 'business' || p.category === 'office' || p.category === 'meeting' || p.category === 'workout')) {
          compHours += (p.durationMins / 60);
        }
      }
    });
    const pct = Math.min(100, Math.round((compHours / (appSettings.dailyGoalHours || 5.0)) * 100));

    const capsule = document.createElement('button');
    capsule.type = 'button';
    capsule.className = `btn-press flex flex-col items-center py-2 px-2.5 rounded-2xl border transition-all cursor-pointer select-none min-w-[46px] ${
      isSelected 
        ? 'bg-emerald-500/20 border-emerald-500/70 text-white shadow-glow-emerald' 
        : isWeekend
          ? 'bg-surface-850/90 border-surface-700/60 text-amber-200/90 hover:border-amber-500/40'
          : 'bg-surface-850/60 border-surface-800/80 text-slate-400 hover:border-surface-700'
    }`;

    capsule.innerHTML = `
      <span class="text-[11px] font-bold ${isSelected ? 'text-emerald-400' : isWeekend ? 'text-amber-400' : 'text-slate-400'}">${dayLetters[i]}</span>
      <span class="text-sm font-black my-0.5">${dateObj.getDate()}</span>
      <div class="w-5 h-1 rounded-full ${pct >= 100 ? 'bg-cyan-400 shadow-glow-cyan' : (pct > 0 ? 'bg-emerald-500' : 'bg-surface-700')}"></div>
    `;

    capsule.addEventListener('click', () => {
      playSfx('tap');
      currentDateStr = dateKey;
      refreshAllViews();
    });

    container.appendChild(capsule);
  }
}

// --- FILTER PLANS FOR A SPECIFIC DATE ---
function getPlansForDate(dateStr) {
  const d = parseDateStr(dateStr);
  const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

  return (appData.plans || []).filter(plan => {
    if (plan.repeat === 'today') return plan.date === dateStr;
    if (plan.repeat === 'daily') return true;
    if (plan.repeat === 'weekdays') return !isWeekend;
    if (plan.repeat === 'weekends') return isWeekend;
    if (plan.repeat === 'custom') return (plan.repeatDays || []).includes(dayOfWeek);
    return false;
  });
}

// --- RENDER CALENDAR MEETING TIMELINE (ZOOM / TEAMS STYLE) ---
function renderTodayTimeline() {
  const container = document.getElementById('plannerTimelineContainer');
  if (!container) return;
  container.innerHTML = '';

  const plansForToday = getPlansForDate(currentDateStr);
  plansForToday.sort((a, b) => a.startMins - b.startMins);

  // 1. Calculate focused hours
  let focusedHours = 0;
  let totalLoggedHours = 0;

  plansForToday.forEach(plan => {
    const isDone = Boolean(plan.completedDates && plan.completedDates[currentDateStr]);
    const durHours = plan.durationMins / 60;
    if (isDone) {
      totalLoggedHours += durHours;
      if (!plan.isMultitask && (plan.category === 'business' || plan.category === 'office' || plan.category === 'meeting' || plan.category === 'workout')) {
        focusedHours += durHours;
      }
    }
  });

  const goal = appSettings.dailyGoalHours || 5.0;
  const pct = Math.min(100, Math.round((focusedHours / goal) * 100));

  // Focus Quest Ring & Stats Update
  document.getElementById('trackerFocusedHoursNumber').textContent = focusedHours.toFixed(1);
  const denom = document.getElementById('trackerGoalDenominatorText');
  if (denom) denom.textContent = `/ ${goal.toFixed(1)}h Goal`;
  document.getElementById('trackerPercentageText').textContent = `${pct}%`;
  document.getElementById('trackerRingArc').setAttribute('stroke-dasharray', `${pct}, 100`);

  const questSub = document.getElementById('trackerQuestRemainingText');
  if (focusedHours >= goal) {
    questSub.innerHTML = '<span class="text-cyan-400 font-bold">🏆 5-Hour Focus Quest Complete! Dopamine unlocked!</span>';
  } else {
    questSub.textContent = `Hit ${(goal - focusedHours).toFixed(1)} more focused hours to unlock today's Quest!`;
  }

  const planHoursBadge = document.getElementById('planTotalHoursBadge');
  if (planHoursBadge) {
    planHoursBadge.textContent = `${totalLoggedHours.toFixed(1)}h logged`;
  }

  // 2. Build Hourly Time Slots (06:00 AM to 11:00 PM)
  const coveredHours = new Set();
  plansForToday.forEach(p => {
    const startH = Math.floor(p.startMins / 60);
    const endH = Math.ceil((p.startMins + p.durationMins) / 60);
    for (let h = startH + 1; h < endH; h++) {
      coveredHours.add(h % 24);
    }
  });

  for (let h = 6; h <= 23; h++) {
    // Check if any plan starts in this hour
    const plansStartingInHour = plansForToday.filter(p => Math.floor(p.startMins / 60) === h);

    if (plansStartingInHour.length > 0) {
      plansStartingInHour.forEach(plan => {
        const isDone = Boolean(plan.completedDates && plan.completedDates[currentDateStr]);
        const meta = CATEGORY_META[plan.category] || CATEGORY_META.office;

        const row = document.createElement('div');
        row.className = 'flex items-start gap-2.5 group';

        const startTimeFormatted = minsToTimeStr(plan.startMins);
        const endTimeFormatted = minsToTimeStr(plan.endMins);
        const durFormatted = formatDurationMins(plan.durationMins);

        let repeatBadgeText = '';
        if (plan.repeat === 'daily') repeatBadgeText = '🔁 Daily';
        else if (plan.repeat === 'weekdays') repeatBadgeText = '💼 Mon-Fri';
        else if (plan.repeat === 'weekends') repeatBadgeText = '🌴 Weekend';
        else if (plan.repeat === 'custom') repeatBadgeText = '🗓️ Custom';

        row.innerHTML = `
          <!-- Hour Label -->
          <div class="w-16 shrink-0 text-right pt-2">
            <span class="text-xs font-black text-slate-400 font-mono tracking-tighter">${startTimeFormatted}</span>
          </div>

          <!-- Meeting Style Card -->
          <div class="flex-1 p-3.5 rounded-2xl border transition-all ${
            isDone 
              ? 'bg-surface-900/80 border-emerald-500/40 shadow-sm' 
              : 'bg-surface-900 border-surface-800 hover:border-surface-700 shadow-sm'
          }" style="border-left: 4px solid ${meta.borderLeft};">
            
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[10px] font-black px-2 py-0.5 rounded-lg" style="background-color: ${meta.bg}; color: ${meta.color}">
                  ${meta.label}
                </span>
                <span class="text-[11px] font-bold text-slate-400">
                  ${startTimeFormatted} - ${endTimeFormatted} (${durFormatted})
                </span>
                ${repeatBadgeText ? `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-surface-800 text-slate-400">${repeatBadgeText}</span>` : ''}
              </div>

              <!-- Action Controls -->
              <div class="flex items-center gap-1 shrink-0">
                <button type="button" class="plan-edit-btn btn-press p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-800 transition" title="Edit">
                  <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>

            <!-- Title & Checkmark Row -->
            <div class="flex items-center justify-between mt-2 pt-1 border-t border-surface-800/60">
              <div class="flex items-center gap-2">
                <h4 class="text-xs font-black ${isDone ? 'line-through text-slate-500' : 'text-white'}">${plan.title}</h4>
                ${plan.isMultitask ? '<span class="text-[10px] font-bold text-amber-400">⚠️ Multitask</span>' : ''}
              </div>

              <!-- 1-Tap Completion Checkmark -->
              <button type="button" class="plan-toggle-btn btn-press px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
                isDone 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-glow-emerald' 
                  : 'bg-surface-850 text-slate-400 border border-surface-750 hover:border-emerald-400 hover:text-emerald-300'
              }">
                <i data-lucide="${isDone ? 'check-circle' : 'circle'}" class="w-3.5 h-3.5 ${isDone ? 'stroke-[2.5]' : ''}"></i>
                <span>${isDone ? 'Completed' : 'Mark Done'}</span>
              </button>
            </div>

          </div>
        `;

        // Checkmark toggle
        row.querySelector('.plan-toggle-btn').addEventListener('click', () => {
          togglePlanCompletion(plan.id);
        });

        // Edit button
        row.querySelector('.plan-edit-btn').addEventListener('click', () => {
          openPlanModal(plan.id);
        });

        container.appendChild(row);
      });
    } else if (!coveredHours.has(h)) {
      // Unscheduled Free Time Slot
      const hourStr = minsToTimeStr(h * 60);
      const freeRow = document.createElement('div');
      freeRow.className = 'flex items-center gap-2.5 py-1';

      freeRow.innerHTML = `
        <div class="w-16 shrink-0 text-right">
          <span class="text-xs font-bold text-slate-500 font-mono tracking-tighter">${hourStr}</span>
        </div>
        <button type="button" class="flex-1 py-2 px-3 rounded-2xl border border-dashed border-surface-800 hover:border-surface-700 bg-surface-950/40 hover:bg-surface-850/60 text-slate-500 hover:text-slate-300 text-xs font-bold flex items-center justify-between transition btn-press">
          <span class="flex items-center gap-1.5">
            <span class="text-slate-600">•</span> Free Time
          </span>
          <span class="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <i data-lucide="plus" class="w-3 h-3"></i> Schedule
          </span>
        </button>
      `;

      freeRow.querySelector('button').addEventListener('click', () => {
        openPlanModal(null, h);
      });

      container.appendChild(freeRow);
    }
  }

  if (window.lucide) lucide.createIcons();
}

function togglePlanCompletion(planId) {
  const plan = appData.plans.find(p => p.id === planId);
  if (!plan) return;

  if (!plan.completedDates) plan.completedDates = {};
  const currentStatus = Boolean(plan.completedDates[currentDateStr]);
  plan.completedDates[currentDateStr] = !currentStatus;

  saveAppData();

  if (!currentStatus) {
    playSfx('check');
    addXP(25);
    
    // Check if quest completed
    const plansForToday = getPlansForDate(currentDateStr);
    let fHours = 0;
    plansForToday.forEach(p => {
      if (p.completedDates && p.completedDates[currentDateStr]) {
        if (!p.isMultitask && (p.category === 'business' || p.category === 'office' || p.category === 'meeting' || p.category === 'workout')) {
          fHours += (p.durationMins / 60);
        }
      }
    });
    if (fHours >= (appSettings.dailyGoalHours || 5.0)) {
      playSfx('quest');
      fireConfetti();
    }
  } else {
    playSfx('tap');
  }

  renderTodayTimeline();
}

// --- VIEW 2: HABITS VIEW ---
function renderHabitGrids() {
  const container = document.getElementById('habitGridCardsContainer');
  const counter = document.getElementById('habitsCompletedCounter');
  if (!container) return;
  container.innerHTML = '';

  const habits = appSettings.habits || [];
  if (!appData[currentDateStr]) appData[currentDateStr] = { habits: [] };
  if (!appData[currentDateStr].habits) appData[currentDateStr].habits = habits.map(h => ({ id: h.id, completed: false }));

  const todayHabits = appData[currentDateStr].habits;
  let doneCount = habits.filter(h => todayHabits.find(th => th.id === h.id)?.completed).length;

  if (counter) counter.textContent = `${doneCount} / ${habits.length} Today`;

  if (habits.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 text-slate-400 text-xs bg-surface-900 rounded-3xl border border-dashed border-surface-800 p-6 space-y-2">
        <span class="text-3xl">✨</span>
        <p class="font-bold text-white text-sm">No custom habits yet.</p>
        <p class="text-xs text-slate-400">Tap "+ New Habit" above to create habits that match your real daily life!</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  habits.forEach(habit => {
    const isDoneToday = Boolean(todayHabits.find(h => h.id === habit.id)?.completed);

    // Compute 28-day matrix
    const matrixDots = [];
    let streak = 0;
    const today = parseDateStr(currentDateStr);

    for (let i = 27; i >= 0; i--) {
      const pastD = new Date(today);
      pastD.setDate(today.getDate() - i);
      const pastKey = formatDateStr(pastD);

      const pastDayRecord = appData[pastKey];
      const done = Boolean(pastDayRecord?.habits?.find(h => h.id === habit.id)?.completed);
      matrixDots.push({ date: pastKey, done });
      if (done) streak++;
      else if (i < 7) streak = 0; // reset streak if missed recently
    }

    const card = document.createElement('div');
    card.className = `p-4 rounded-3xl border transition-all ${
      isDoneToday 
        ? 'bg-surface-900 border-emerald-500/40 shadow-sm' 
        : 'bg-surface-900 border-surface-800 shadow-sm'
    }`;

    let gridHtml = '<div class="grid grid-cols-7 gap-1.5 my-3">';
    matrixDots.forEach(dot => {
      gridHtml += `
        <div class="h-3.5 rounded-md ${dot.done ? 'bg-emerald-400 shadow-glow-emerald' : 'bg-surface-800'}" title="${dot.date}"></div>
      `;
    });
    gridHtml += '</div>';

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">${habit.icon || '💧'}</span>
          <div>
            <h4 class="text-xs font-bold text-white">${habit.title}</h4>
            <span class="text-[11px] text-slate-400">🔥 ${streak} day momentum</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" class="habit-edit-btn btn-press p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-800 transition" title="Edit Habit">
            <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
          </button>
          <button type="button" class="habit-delete-btn btn-press p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-surface-800 transition" title="Delete Habit">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
          <button type="button" class="habit-check-btn btn-press w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${
            isDoneToday 
              ? 'bg-emerald-500 border-emerald-500 text-surface-950 shadow-glow-emerald' 
              : 'border-slate-600 bg-surface-850 hover:border-emerald-400 text-transparent'
          }">
            <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
          </button>
        </div>
      </div>
      ${gridHtml}
    `;

    // 1-Tap Toggle completion
    card.querySelector('.habit-check-btn').addEventListener('click', () => {
      let hRecord = todayHabits.find(h => h.id === habit.id);
      if (hRecord) {
        hRecord.completed = !hRecord.completed;
      } else {
        hRecord = { id: habit.id, completed: true };
        todayHabits.push(hRecord);
      }
      saveAppData();
      if (hRecord.completed) {
        playSfx('check');
        addXP(15);
      } else {
        playSfx('tap');
      }
      renderHabitGrids();
    });

    // Edit button
    card.querySelector('.habit-edit-btn').addEventListener('click', () => {
      openHabitModal(habit.id);
    });

    // Delete button
    card.querySelector('.habit-delete-btn').addEventListener('click', () => {
      deleteHabit(habit.id);
    });

    container.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

// --- VIEW 3: STATS VIEW ---
function renderStats() {
  const plansForToday = getPlansForDate(currentDateStr);
  const catSums = { meeting: 0, office: 0, business: 0, sleep: 0, workout: 0, personal: 0 };
  let deepFocusMins = 0;
  let multiMins = 0;
  let totalMins = 0;

  plansForToday.forEach(plan => {
    if (plan.completedDates && plan.completedDates[currentDateStr]) {
      const dur = plan.durationMins || 60;
      totalMins += dur;
      if (catSums[plan.category] !== undefined) {
        catSums[plan.category] += dur;
      }
      if (plan.isMultitask) {
        multiMins += dur;
      } else if (plan.category === 'business' || plan.category === 'office' || plan.category === 'meeting') {
        deepFocusMins += dur;
      }
    }
  });

  // Gauge values
  const deepPct = totalMins ? Math.round((deepFocusMins / totalMins) * 100) : 0;
  const multiPct = totalMins ? Math.round((multiMins / totalMins) * 100) : 0;

  const deepVal = document.getElementById('gaugeDeepFocusVal');
  const deepBar = document.getElementById('gaugeDeepFocusBar');
  if (deepVal) deepVal.textContent = `${(deepFocusMins / 60).toFixed(1)}h (${deepPct}%)`;
  if (deepBar) deepBar.style.width = `${deepPct}%`;

  const multiVal = document.getElementById('gaugeMultitaskVal');
  const multiBar = document.getElementById('gaugeMultitaskBar');
  if (multiVal) multiVal.textContent = `${(multiMins / 60).toFixed(1)}h (${multiPct}%)`;
  if (multiBar) multiBar.style.width = `${multiPct}%`;

  // Render Donut Chart
  const chartCanvas = document.getElementById('categoryDonutChart');
  if (chartCanvas && typeof Chart !== 'undefined') {
    if (donutChartInstance) donutChartInstance.destroy();

    const labels = ['Teams', 'Office', 'Business', 'Sleep', 'Workout', 'Personal'];
    const dataVals = [
      catSums.meeting / 60,
      catSums.office / 60,
      catSums.business / 60,
      catSums.sleep / 60,
      catSums.workout / 60,
      catSums.personal / 60
    ];

    donutChartInstance = new Chart(chartCanvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataVals.every(v => v === 0) ? [1, 1, 1, 1, 1, 1] : dataVals,
          backgroundColor: ['#818cf8', '#60a5fa', '#34d399', '#c084fc', '#fbbf24', '#22d3ee'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, color: '#94a3b8', font: { size: 10, weight: 'bold' } }
          }
        },
        cutout: '70%'
      }
    });
  }
}

// --- BACKUP & EXPORT ---
function exportCsvData() {
  const rows = [['Date', 'Title', 'Category', 'Start', 'End', 'Duration (mins)', 'Completed', 'Multitask']];
  (appData.plans || []).forEach(p => {
    rows.push([
      p.date || '',
      `"${p.title.replace(/"/g, '""')}"`,
      p.category,
      minsToTimeStr(p.startMins),
      minsToTimeStr(p.endMins),
      p.durationMins,
      Boolean(p.completedDates && p.completedDates[currentDateStr]),
      Boolean(p.isMultitask)
    ]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `dayflow_export_${currentDateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function backupJsonData() {
  const payload = {
    version: '4.3',
    exportDate: new Date().toISOString(),
    data: appData,
    settings: appSettings
  };
  const jsonBlob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(jsonBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dayflow_backup_${currentDateStr}.json`;
  a.click();
  URL.revokeObjectURL(a);
}

function importJsonData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (parsed.data) {
        appData = parsed.data;
        if (parsed.settings) appSettings = parsed.settings;
        saveAppData();
        saveSettings();
        refreshAllViews();
        alert('Backup successfully restored!');
      } else {
        alert('Invalid backup file structure.');
      }
    } catch (err) {
      alert('Error parsing JSON backup file.');
    }
  };
  reader.readAsText(file);
}
