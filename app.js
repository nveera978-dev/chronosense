/**
 * DayFlow | Habit & Time Architecture Engine
 * Apple-grade Minimalist Luxury • Rich SFX Sound Engine • One-Handed Ergonomics
 */

// --- STORAGE KEYS & COMPATIBILITY ---
const STORAGE_KEY = 'dayflow_v1';
const SETTINGS_KEY = 'dayflow_settings_v1';

const CATEGORY_META = {
  meeting: { label: 'Teams Meeting', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)', icon: 'users' },
  investment: { label: 'Growth (Q2)', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', icon: 'trending-up' },
  maintenance: { label: 'Office Work', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', icon: 'briefcase' },
  rest: { label: 'Mindful Rest', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)', icon: 'heart' },
  leak: { label: 'Time Leak (Q4)', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)', icon: 'alert-triangle' },
  routine: { label: 'Routine / Transit', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', icon: 'coffee' },
  sleep: { label: 'Sleep & Recharge', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)', icon: 'moon' }
};

const DEFAULT_HABITS = [
  { id: 'h1', title: 'Zero movies during office work', category: 'focus', icon: '🛡️', color: '#10b981' },
  { id: 'h2', title: 'YouTube Finance automation sprint', category: 'growth', icon: '📈', color: '#06b6d4' },
  { id: 'h3', title: 'Real conversation with mother / friends', category: 'social', icon: '🗣️', color: '#8b5cf6' },
  { id: 'h4', title: 'Physical walk & tea refresh', category: 'health', icon: '☕', color: '#f59e0b' },
  { id: 'h5', title: 'Check prices & dates with eyes, not AI', category: 'discipline', icon: '👁️', color: '#ec4899' }
];

const LEVEL_TIERS = [
  { level: 1, title: 'Novice Explorer', minXp: 0 },
  { level: 2, title: 'Consistent Builder', minXp: 200 },
  { level: 3, title: 'Deep Work Knight', minXp: 500 },
  { level: 4, title: 'Master Creator', minXp: 1000 },
  { level: 5, title: 'Titan Grandmaster', minXp: 2000 }
];

// Standard Blueprints
const WORKDAY_BLUEPRINT = [
  { startHour: 7, durationMins: 120, title: 'YouTube Finance Automation & AI Engine', category: 'investment', eisenhower: 'q2', isMultitask: false },
  { startHour: 10, durationMins: 45, title: 'Teams Sync / Client Standup', category: 'meeting', eisenhower: 'q1', isMultitask: false },
  { startHour: 14, durationMins: 240, title: 'Office Work (Core Execution & Duties)', category: 'maintenance', eisenhower: 'q1', isMultitask: false },
  { startHour: 19, durationMins: 30, title: 'Work From Home (Evening Shift)', category: 'maintenance', eisenhower: 'q1', isMultitask: false },
  { startHour: 23, durationMins: 480, title: 'Night Sleep & Full Recovery', category: 'sleep', eisenhower: 'q2', isMultitask: false }
];

const WEEKEND_BLUEPRINT = [
  { startHour: 8, durationMins: 60, title: 'Morning Walk & Healthy Breakfast', category: 'rest', eisenhower: 'q2', isMultitask: false },
  { startHour: 10, durationMins: 180, title: 'Weekend Deep Project Sprint', category: 'investment', eisenhower: 'q2', isMultitask: false },
  { startHour: 16, durationMins: 120, title: 'Personal Time & Outing / Chill', category: 'rest', eisenhower: 'q2', isMultitask: false },
  { startHour: 19, durationMins: 60, title: 'Evening Tea & Family Talk', category: 'rest', eisenhower: 'q2', isMultitask: false },
  { startHour: 23, durationMins: 480, title: 'Night Sleep & Recovery', category: 'sleep', eisenhower: 'q2', isMultitask: false }
];

// Global State
let currentDateStr = getTodayDateStr();
let appData = loadAppData();
let appSettings = loadSettings();
let selectedDurationMins = 240;
let modalMode = 'plan';
let currentEditingPlanId = null;
let currentEditingHour = null;
let donutChartInstance = null;
let audioCtx = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      // Auto check for updates on app open
      reg.update().catch(() => {});
    }).catch(e => console.log('SW Note:', e));
  }

  // Populate sample day if brand new
  if (!appData[currentDateStr] || (!appData[currentDateStr].plans && !appData[currentDateStr].entries)) {
    injectSampleDayData(currentDateStr);
  }

  setupEventListeners();
  populateStartHourDropdown();
  refreshAllViews();
  if (window.lucide) lucide.createIcons();
});

// --- LUXURY SFX AUDIO SYNTHESIZER ---
function playSfx(type) {
  // Always trigger subtle haptic vibration on mobile if available
  if ('vibrate' in navigator) {
    try { navigator.vibrate(type === 'quest' ? [15, 40, 15] : 8); } catch (e) {}
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
      // Smooth organic glass pop / tick for tab navigation
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
      // Crisp subtle tactile click
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.035);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'check') {
      // Satisfying two-tone harmonic glass chime (D5 -> A5)
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
      // Luxurious 4-tone victory arpeggio (C5 - E5 - G5 - C6)
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
    } else if (type === 'swoosh') {
      // Blueprint resonant sweep
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.16);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.23);
    }
  } catch (e) {}
}

function fireConfetti() {
  if (typeof window.confetti === 'function') {
    window.confetti({ particleCount: 75, spread: 65, origin: { y: 0.65 }, colors: ['#10b981', '#06b6d4', '#6366f1', '#fbbf24'] });
  }
}

// --- GAMIFICATION / XP ---
function addXP(amount, reason = '') {
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

  // Persistent Sound Button (No Layout Bugs)
  const soundIconWrap = document.getElementById('soundIconWrapper');
  const soundStatusText = document.getElementById('soundStatusText');
  const soundBtn = document.getElementById('soundToggleBtn');

  if (soundBtn && soundIconWrap && soundStatusText) {
    if (p.soundEnabled) {
      soundIconWrap.innerHTML = '<i data-lucide="volume-2" class="w-4 h-4 text-emerald-400"></i>';
      soundStatusText.textContent = 'ON';
      soundStatusText.className = 'text-[11px] font-black text-emerald-400';
      soundBtn.className = 'btn-press flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-surface-850 border border-emerald-500/30 text-slate-300 font-bold text-xs shadow-sm';
    } else {
      soundIconWrap.innerHTML = '<i data-lucide="volume-x" class="w-4 h-4 text-slate-500"></i>';
      soundStatusText.textContent = 'OFF';
      soundStatusText.className = 'text-[11px] font-black text-slate-500';
      soundBtn.className = 'btn-press flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-surface-850 border border-surface-750 text-slate-400 font-bold text-xs';
    }
    if (window.lucide) lucide.createIcons();
  }
}

// --- DATES & FORMATTING ---
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

function formatHour12(h) {
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${String(h12).padStart(2, '0')}:00 ${ampm}`;
}

function formatCustomSpan(startHour, durationMins) {
  const startHour12 = startHour % 12 === 0 ? 12 : startHour % 12;
  const startAmPm = startHour < 12 ? 'AM' : 'PM';

  const endTotalMins = startHour * 60 + durationMins;
  const endH = Math.floor(endTotalMins / 60) % 24;
  const endM = endTotalMins % 60;
  const endHour12 = endH % 12 === 0 ? 12 : endH % 12;
  const endAmPm = endH < 12 ? 'AM' : 'PM';

  const startFormatted = `${String(startHour12).padStart(2, '0')}:00 ${startAmPm}`;
  const endFormatted = `${String(endHour12).padStart(2, '0')}:${String(endM).padStart(2, '0')} ${endAmPm}`;

  const hoursLabel = durationMins >= 60 
    ? (durationMins % 60 === 0 ? `${durationMins / 60}h` : `${(durationMins / 60).toFixed(1)}h`) 
    : `${durationMins}m`;

  return `${startFormatted} - ${endFormatted} (${hoursLabel})`;
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
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('chronosense_v3') || localStorage.getItem('chronosense_data_v2');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveAppData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  } catch (e) {}
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY) || localStorage.getItem('chronosense_settings_v3');
    return raw ? JSON.parse(raw) : {
      player: { xp: 850, soundEnabled: true },
      habits: DEFAULT_HABITS,
      dailyGoalHours: 5.0
    };
  } catch (e) {
    return { player: { xp: 850, soundEnabled: true }, habits: DEFAULT_HABITS, dailyGoalHours: 5.0 };
  }
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
  } catch (e) {}
}

function ensureDayRecord(dateStr) {
  if (!appData[dateStr]) {
    const dateObj = parseDateStr(dateStr);
    const dayOfWeek = dateObj.getDay();
    const defaultType = (dayOfWeek === 0 || dayOfWeek === 6) ? 'weekend' : 'workday';
    appData[dateStr] = {
      dayType: defaultType,
      plans: [],
      entries: {},
      habits: (appSettings.habits || DEFAULT_HABITS).map(h => ({ id: h.id, completed: false }))
    };
  }
  if (!appData[dateStr].dayType) {
    const dayOfWeek = parseDateStr(dateStr).getDay();
    appData[dateStr].dayType = (dayOfWeek === 0 || dayOfWeek === 6) ? 'weekend' : 'workday';
  }
  if (!appData[dateStr].plans) appData[dateStr].plans = [];
  if (!appData[dateStr].entries) appData[dateStr].entries = {};
  if (!appData[dateStr].habits) appData[dateStr].habits = (appSettings.habits || DEFAULT_HABITS).map(h => ({ id: h.id, completed: false }));
  return appData[dateStr];
}

// --- SAMPLE DATA INJECTION ---
function injectSampleDayData(dateStr) {
  const day = ensureDayRecord(dateStr);
  day.dayType = 'workday';
  day.plans = [
    { id: 'p1', startHour: 7, durationMins: 120, title: 'YouTube Finance Automation & AI Engine', category: 'investment', eisenhower: 'q2', isMultitask: false, confirmed: true },
    { id: 'p2', startHour: 10, durationMins: 45, title: 'Teams Sync / Client Standup', category: 'meeting', eisenhower: 'q1', isMultitask: false, confirmed: true },
    { id: 'p3', startHour: 14, durationMins: 240, title: 'Office Work (Core Execution & Client Tasks)', category: 'maintenance', eisenhower: 'q1', isMultitask: false, confirmed: true },
    { id: 'p4', startHour: 19, durationMins: 30, title: 'Work From Home (Evening Shift)', category: 'maintenance', eisenhower: 'q1', isMultitask: false, confirmed: false },
    { id: 'p5', startHour: 23, durationMins: 480, title: 'Night Sleep & Full Recovery', category: 'sleep', eisenhower: 'q2', isMultitask: false, confirmed: false }
  ];

  day.entries = {
    7: { title: 'YouTube Finance Automation & AI Engine', category: 'investment', eisenhower: 'q2', duration: 60, isMultitask: false },
    8: { title: 'YouTube Finance Automation & AI Engine', category: 'investment', eisenhower: 'q2', duration: 60, isMultitask: false },
    10: { title: 'Teams Sync / Client Standup', category: 'meeting', eisenhower: 'q1', duration: 45, isMultitask: false },
    14: { title: 'Office Work (Core Execution & Client Tasks)', category: 'maintenance', eisenhower: 'q1', duration: 60, isMultitask: false },
    15: { title: 'Office Work (Core Execution & Client Tasks)', category: 'maintenance', eisenhower: 'q1', duration: 60, isMultitask: false },
    16: { title: 'Office Work (Core Execution & Client Tasks)', category: 'maintenance', eisenhower: 'q1', duration: 60, isMultitask: false },
    17: { title: 'Office Work (Core Execution & Client Tasks)', category: 'maintenance', eisenhower: 'q1', duration: 60, isMultitask: false }
  };

  saveAppData();
}

// --- SETUP EVENT LISTENERS WITH RICH SFX ---
function setupEventListeners() {
  // Navigation Tabs with 'tab' SFX
  const navMap = {
    navTabPlanner: 'planner',
    navTabTracker: 'tracker',
    navTabGrids: 'grids',
    navTabStats: 'stats',
    navTabSettings: 'settings'
  };
  Object.keys(navMap).forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      playSfx('tab');
      switchTab(navMap[id]);
    });
  });

  // Sound Toggle with Bug Fix
  document.getElementById('soundToggleBtn')?.addEventListener('click', () => {
    if (!appSettings.player) appSettings.player = { xp: 850, soundEnabled: true };
    appSettings.player.soundEnabled = !appSettings.player.soundEnabled;
    saveSettings();
    updatePlayerHeader();
    if (appSettings.player.soundEnabled) playSfx('tap');
  });

  // Today Quick Button
  document.getElementById('todayQuickBtn')?.addEventListener('click', () => {
    playSfx('tap');
    currentDateStr = getTodayDateStr();
    refreshAllViews();
  });

  // Week Navigation (< Previous Week | Next Week >)
  document.getElementById('prevWeekBtn')?.addEventListener('click', () => {
    playSfx('tap');
    navigateWeek(-1);
  });
  document.getElementById('nextWeekBtn')?.addEventListener('click', () => {
    playSfx('tap');
    navigateWeek(1);
  });

  // Day Type Switcher Pills (Work / Wknd / PTO / Rest)
  document.querySelectorAll('#dayTypePillGroup .day-type-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      playSfx('tap');
      const type = btn.getAttribute('data-type');
      setDayType(type);
    });
  });

  // Blueprint Action Buttons
  document.getElementById('applyTodayBlueprintBtn')?.addEventListener('click', applyTodayBlueprint);
  document.getElementById('applyWeekBlueprintBtn')?.addEventListener('click', applyWeekBlueprint);

  // Floating Plus Button & Open Plan Modal
  document.getElementById('floatingPlusBtn')?.addEventListener('click', () => {
    playSfx('tap');
    openEntryModal(new Date().getHours(), 120, 'plan');
  });
  document.getElementById('openPlanModalBtn')?.addEventListener('click', () => {
    playSfx('tap');
    openEntryModal(new Date().getHours(), 120, 'plan');
  });
  document.getElementById('closeEntryModalBtn')?.addEventListener('click', () => {
    playSfx('tap');
    closeEntryModal();
  });

  // Quick Routine & Teams Template Buttons
  document.querySelectorAll('.plan-tpl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSfx('tap');
      const tpl = btn.getAttribute('data-tpl');
      if (tpl === 'teams') addQuickPlan(new Date().getHours(), 45, 'Teams Meeting / Sync', 'meeting', 'q1');
      else if (tpl === 'office') addQuickPlan(14, 240, 'Office Work (Core Duties)', 'maintenance', 'q1');
      else if (tpl === 'yt') addQuickPlan(7, 120, 'YouTube Finance Automation', 'investment', 'q2');
      else if (tpl === 'wfh') addQuickPlan(19, 30, 'Work From Home (Evening Shift)', 'maintenance', 'q1');
      else if (tpl === 'sleep') addQuickPlan(23, 480, 'Night Sleep & Recovery', 'sleep', 'q2');
      addXP(15, 'Template Added');
    });
  });

  // Modal Mode Toggle: Plan vs Direct
  document.getElementById('modalModePlanBtn')?.addEventListener('click', () => {
    playSfx('tap');
    setModalMode('plan');
  });
  document.getElementById('modalModeDirectBtn')?.addEventListener('click', () => {
    playSfx('tap');
    setModalMode('direct');
  });

  // Duration Buttons in Modal
  document.querySelectorAll('#modalDurBtns .dur-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSfx('tap');
      const minsVal = btn.getAttribute('data-mins');
      const customRow = document.getElementById('customDurationRow');

      document.querySelectorAll('#modalDurBtns .dur-btn').forEach(b => {
        b.className = 'dur-btn btn-press py-2 rounded-xl bg-surface-800 text-slate-300 text-center font-bold border border-surface-750 transition';
      });
      btn.className = 'dur-btn btn-press py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-center font-black border border-emerald-500/40 transition';

      if (minsVal === 'custom') {
        customRow.classList.remove('hidden');
        const h = parseInt(document.getElementById('customHoursInput')?.value, 10) || 0;
        const m = parseInt(document.getElementById('customMinsInput')?.value, 10) || 0;
        selectedDurationMins = Math.max(5, h * 60 + m);
      } else {
        customRow.classList.add('hidden');
        selectedDurationMins = parseInt(minsVal, 10);
      }
      updateModalSpanSummary();
    });
  });

  function updateCustomDuration() {
    const h = parseInt(document.getElementById('customHoursInput')?.value, 10) || 0;
    const m = parseInt(document.getElementById('customMinsInput')?.value, 10) || 0;
    selectedDurationMins = Math.max(5, h * 60 + m);
    updateModalSpanSummary();
  }
  document.getElementById('customHoursInput')?.addEventListener('input', updateCustomDuration);
  document.getElementById('customMinsInput')?.addEventListener('input', updateCustomDuration);

  // Preset Tiles in Modal
  document.querySelectorAll('.preset-tile').forEach(btn => {
    btn.addEventListener('click', () => {
      playSfx('tap');
      const preset = btn.getAttribute('data-preset');
      const dur = btn.getAttribute('data-dur');
      const isMulti = btn.getAttribute('data-multi') === 'true';

      document.getElementById('modalActivityTitleInput').value = preset;
      document.getElementById('modalMultitaskCheckbox').checked = isMulti;

      if (dur) {
        selectedDurationMins = parseInt(dur, 10);
        document.querySelectorAll('#modalDurBtns .dur-btn').forEach(b => {
          b.className = 'dur-btn btn-press py-2 rounded-xl bg-surface-800 text-slate-300 text-center font-bold border border-surface-750 transition';
          if (b.getAttribute('data-mins') == dur) {
            b.className = 'dur-btn btn-press py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-center font-black border border-emerald-500/40 transition';
          }
        });
        document.getElementById('customDurationRow')?.classList.add('hidden');
        updateModalSpanSummary();
      }

      document.querySelectorAll('.preset-tile').forEach(b => b.classList.remove('ring-2', 'ring-emerald-400'));
      btn.classList.add('ring-2', 'ring-emerald-400');
    });
  });

  document.getElementById('modalStartHourSelect')?.addEventListener('change', (e) => {
    playSfx('tap');
    currentEditingHour = parseInt(e.target.value, 10);
    updateModalSpanSummary();
  });

  // Save Modal Entry
  document.getElementById('modalSaveBtn')?.addEventListener('click', saveModalEntry);

  // Delete Modal Entry
  document.getElementById('modalDeleteBtn')?.addEventListener('click', deleteCurrentEntry);

  // Confirm All Pending Plans (The 2-Minute Evening Audit!)
  document.getElementById('confirmAllPendingBtn')?.addEventListener('click', confirmAllPendingPlans);

  // Backup & Export
  document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
    playSfx('tap');
    exportCsvData();
  });
  document.getElementById('backupJsonBtn')?.addEventListener('click', () => {
    playSfx('tap');
    backupJsonData();
  });
  document.getElementById('importJsonInput')?.addEventListener('change', importJsonData);
  document.getElementById('loadSampleDataBtn')?.addEventListener('click', () => {
    playSfx('tap');
    if (confirm('Reset and load sample schedule for today?')) {
      injectSampleDayData(currentDateStr);
      refreshAllViews();
    }
  });
  document.getElementById('clearTodayBtn')?.addEventListener('click', () => {
    playSfx('tap');
    if (confirm("Clear today's schedule and audit?")) {
      const day = ensureDayRecord(currentDateStr);
      day.plans = [];
      day.entries = {};
      saveAppData();
      refreshAllViews();
    }
  });
}

function navigateWeek(deltaWeeks) {
  const d = parseDateStr(currentDateStr);
  d.setDate(d.getDate() + (deltaWeeks * 7));
  currentDateStr = formatDateStr(d);
  refreshAllViews();
}

function setDayType(newType) {
  const day = ensureDayRecord(currentDateStr);
  day.dayType = newType;
  saveAppData();
  refreshAllViews();
}

function switchTab(tabId) {
  const tabs = {
    planner: { view: 'viewPlanner', nav: 'navTabPlanner' },
    tracker: { view: 'viewTracker', nav: 'navTabTracker' },
    grids: { view: 'viewGrids', nav: 'navTabGrids' },
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

  if (tabId === 'planner') renderPlanner();
  else if (tabId === 'tracker') renderTracker();
  else if (tabId === 'grids') renderHabitGrids();
  else if (tabId === 'stats') renderStats();

  if (window.lucide) lucide.createIcons();
}

function refreshAllViews() {
  updatePlayerHeader();
  renderDayHeader();
  renderWeekCapsules();
  renderPlanner();
  renderTracker();
  renderHabitGrids();
  renderStats();
  if (window.lucide) lucide.createIcons();
}

// --- RENDER DAY HEADER & TYPE BAR ---
function renderDayHeader() {
  const day = ensureDayRecord(currentDateStr);
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

  const dayTypeBadge = document.getElementById('dayTypeBadge');
  const typeLabels = {
    workday: { text: '💼 Workday', bg: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
    weekend: { text: '🌴 Weekend', bg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
    holiday: { text: '🏖️ PTO / Holiday', bg: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' },
    rest: { text: '🎉 Rest Day', bg: 'bg-pink-500/20 text-pink-300 border border-pink-500/30' }
  };
  const activeConfig = typeLabels[day.dayType] || typeLabels.workday;
  if (dayTypeBadge) {
    dayTypeBadge.textContent = activeConfig.text;
    dayTypeBadge.className = `text-xs font-black px-2.5 py-1 rounded-xl ${activeConfig.bg}`;
  }

  // Highlight active pill
  document.querySelectorAll('#dayTypePillGroup .day-type-pill').forEach(pill => {
    const pType = pill.getAttribute('data-type');
    if (pType === day.dayType) {
      pill.className = 'day-type-pill btn-press text-xs font-black py-2 rounded-xl bg-surface-800 text-white shadow-sm border border-surface-700 transition flex items-center justify-center gap-1.5';
    } else {
      pill.className = 'day-type-pill btn-press text-xs font-black py-2 rounded-xl text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5';
    }
  });

  // Holiday / Rest Protection Banner
  const holidayBanner = document.getElementById('holidayRestBanner');
  const holidayTitle = document.getElementById('holidayRestTitle');
  const holidaySub = document.getElementById('holidayRestSubtitle');
  if (holidayBanner) {
    if (day.dayType === 'holiday') {
      holidayBanner.classList.remove('hidden');
      if (holidayTitle) holidayTitle.innerHTML = '🏖️ Holiday / PTO Mode Active';
      if (holidaySub) holidaySub.textContent = 'Enjoy your day off! Habit streaks are frozen and preserved, and the 5-Hour Focus Quest is relaxed.';
    } else if (day.dayType === 'rest') {
      holidayBanner.classList.remove('hidden');
      if (holidayTitle) holidayTitle.innerHTML = '🎉 Family Function / Rest Day Active';
      if (holidaySub) holidaySub.textContent = 'Attending a wedding or taking full rest? Zero guilt! Your streaks are protected without breaking.';
    } else {
      holidayBanner.classList.add('hidden');
    }
  }

  // Update Blueprint Title & Subtitle based on day type
  const bpTitle = document.getElementById('blueprintTitle');
  const bpSub = document.getElementById('blueprintSubtitle');
  if (day.dayType === 'weekend') {
    if (bpTitle) bpTitle.textContent = 'Weekend Rhythm (Teams Style)';
    if (bpSub) bpSub.textContent = '10 AM Deep Sprint • 4 PM Rest • 8h Sleep';
  } else {
    if (bpTitle) bpTitle.textContent = 'Workday Blueprint (Teams Style)';
    if (bpSub) bpSub.textContent = 'Office 2-6 PM • WFH 7-7:30 PM • 2h YouTube';
  }
}

// --- TOP WEEK CAPSULE BAR (Spacious & Thumb-Friendly) ---
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

    const dayData = appData[dateKey];
    let focusHours = 0;
    const dayType = dayData?.dayType || (isWeekend ? 'weekend' : 'workday');

    if (dayData && dayData.entries) {
      Object.values(dayData.entries).forEach(e => {
        if (!e.isMultitask && (e.category === 'investment' || e.category === 'maintenance' || e.category === 'meeting')) {
          focusHours += ((e.duration || 60) / 60);
        }
      });
    }
    const pct = Math.min(100, Math.round((focusHours / 5.0) * 100));

    let typeIcon = '';
    if (dayType === 'holiday') typeIcon = '🏖️';
    else if (dayType === 'rest') typeIcon = '🎉';
    else if (isWeekend) typeIcon = '🌴';

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
      <div class="flex items-center gap-0.5">
        <span class="text-[11px] font-bold ${isSelected ? 'text-emerald-400' : isWeekend ? 'text-amber-400' : 'text-slate-400'}">${dayLetters[i]}</span>
        ${typeIcon ? `<span class="text-[10px]">${typeIcon}</span>` : ''}
      </div>
      <span class="text-sm font-black my-0.5">${dateObj.getDate()}</span>
      <div class="w-5 h-1 rounded-full ${dayType === 'holiday' || dayType === 'rest' ? 'bg-indigo-400' : (pct >= 100 ? 'bg-cyan-400 shadow-glow-cyan' : (pct > 0 ? 'bg-emerald-500' : 'bg-surface-700'))}"></div>
    `;

    capsule.addEventListener('click', () => {
      playSfx('tap');
      currentDateStr = dateKey;
      refreshAllViews();
    });

    container.appendChild(capsule);
  }
}

// --- APPLY BLUEPRINTS (Teams Style) ---
function applyTodayBlueprint() {
  playSfx('swoosh');
  const day = ensureDayRecord(currentDateStr);
  const isWeekend = day.dayType === 'weekend';
  const blueprint = isWeekend ? WEEKEND_BLUEPRINT : WORKDAY_BLUEPRINT;

  blueprint.forEach(block => {
    const exists = day.plans.some(p => p.startHour === block.startHour && p.title === block.title);
    if (!exists) {
      day.plans.push({
        id: 'plan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        startHour: block.startHour,
        durationMins: block.durationMins,
        title: block.title,
        category: block.category,
        eisenhower: block.eisenhower,
        isMultitask: block.isMultitask,
        confirmed: false
      });
    }
  });

  saveAppData();
  addXP(30, 'Blueprint Applied');
  refreshAllViews();
}

function applyWeekBlueprint() {
  playSfx('swoosh');
  const activeDate = parseDateStr(currentDateStr);
  const currentDayOfWeek = activeDate.getDay();
  const monday = new Date(activeDate);
  const diffToMon = (currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek);
  monday.setDate(activeDate.getDate() + diffToMon);

  let appliedCount = 0;
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateKey = formatDateStr(d);
    const day = ensureDayRecord(dateKey);

    if (day.dayType === 'holiday' || day.dayType === 'rest') continue;

    day.dayType = 'workday';
    WORKDAY_BLUEPRINT.forEach(block => {
      const exists = day.plans.some(p => p.startHour === block.startHour && p.title === block.title);
      if (!exists) {
        day.plans.push({
          id: 'plan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          startHour: block.startHour,
          durationMins: block.durationMins,
          title: block.title,
          category: block.category,
          eisenhower: block.eisenhower,
          isMultitask: block.isMultitask,
          confirmed: false
        });
        appliedCount++;
      }
    });
  }

  saveAppData();
  playSfx('quest');
  fireConfetti();
  addXP(100, 'Weekly Schedule Synced');
  alert('Workday Blueprint scheduled for Monday through Friday! Your calendar is ready without any morning friction.');
  refreshAllViews();
}

// --- VIEW 1: PLANNER (Morning: Clean Schedule Cards) ---
function renderPlanner() {
  const container = document.getElementById('plannerListContainer');
  if (!container) return;
  container.innerHTML = '';
  const day = ensureDayRecord(currentDateStr);
  const plans = day.plans || [];

  let totalPlannedMins = 0;
  plans.forEach(p => totalPlannedMins += (p.durationMins || 60));
  const planHoursBadge = document.getElementById('planTotalHoursBadge');
  if (planHoursBadge) {
    planHoursBadge.textContent = `${(totalPlannedMins / 60).toFixed(1)}h planned`;
  }

  if (plans.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-slate-400 text-xs bg-surface-900/60 rounded-3xl border border-dashed border-surface-800 p-8 space-y-2">
        <span class="text-3xl">📅</span>
        <p class="font-bold text-white text-sm">No plans set for today.</p>
        <p class="text-xs text-slate-400">Tap "Apply Today" above or tap any template chip to plan your day in seconds.</p>
      </div>
    `;
    return;
  }

  plans.sort((a, b) => a.startHour - b.startHour);

  plans.forEach(plan => {
    const meta = CATEGORY_META[plan.category] || CATEGORY_META.maintenance;
    const card = document.createElement('div');
    const isDone = plan.confirmed;

    card.className = `p-4 rounded-3xl border transition-all ${
      isDone 
        ? 'bg-surface-900/70 border-emerald-500/30' 
        : 'bg-surface-900 border-surface-800 hover:border-surface-700 shadow-sm'
    }`;

    const spanText = formatCustomSpan(plan.startHour, plan.durationMins);

    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <button type="button" class="plan-toggle-btn btn-press w-7 h-7 rounded-xl border flex items-center justify-center mt-0.5 transition-all ${
            isDone ? 'bg-emerald-500 border-emerald-500 text-surface-950 font-black shadow-glow-emerald' : 'border-slate-600 bg-surface-850 hover:border-emerald-400'
          }">
            ${isDone ? '<i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>' : ''}
          </button>
          <div>
            <span class="text-xs font-bold text-slate-400">${spanText}</span>
            <h4 class="text-sm font-bold ${isDone ? 'line-through text-slate-500' : 'text-white'} leading-snug mt-0.5">${plan.title}</h4>
            <div class="flex items-center gap-2 mt-2 flex-wrap">
              <span class="text-[10px] font-black px-2 py-0.5 rounded-lg uppercase" style="background-color: ${meta.bg}; color: ${meta.color}">
                ${meta.label}
              </span>
              ${plan.isMultitask ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">⚠️ Multitask</span>' : ''}
              ${isDone ? '<span class="text-[10px] font-black text-emerald-400 flex items-center gap-1"><i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Verified</span>' : '<span class="text-[10px] font-semibold text-slate-500">Pending Review</span>'}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <button type="button" class="plan-edit-btn btn-press p-2 text-slate-400 hover:text-white rounded-xl hover:bg-surface-800 transition" title="Edit Block">
            <i data-lucide="edit-2" class="w-4 h-4"></i>
          </button>
          <button type="button" class="plan-del-btn btn-press p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-surface-800 transition" title="Delete">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;

    card.querySelector('.plan-toggle-btn').addEventListener('click', () => {
      togglePlanConfirmation(plan.id);
    });

    card.querySelector('.plan-edit-btn').addEventListener('click', () => {
      playSfx('tap');
      currentEditingPlanId = plan.id;
      openEntryModal(plan.startHour, plan.durationMins, 'plan');
      document.getElementById('modalActivityTitleInput').value = plan.title;
      document.getElementById('modalMultitaskCheckbox').checked = !!plan.isMultitask;
    });

    card.querySelector('.plan-del-btn').addEventListener('click', () => {
      playSfx('tap');
      deletePlan(plan.id);
    });

    container.appendChild(card);
  });
}

function addQuickPlan(startHour, durationMins, title, category, eisenhower) {
  const day = ensureDayRecord(currentDateStr);
  day.plans.push({
    id: 'plan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    startHour: startHour,
    durationMins: durationMins,
    title: title,
    category: category,
    eisenhower: eisenhower,
    isMultitask: false,
    confirmed: false
  });
  saveAppData();
  renderPlanner();
  renderTracker();
}

function togglePlanConfirmation(planId) {
  const day = ensureDayRecord(currentDateStr);
  const plan = day.plans.find(p => p.id === planId);
  if (!plan) return;

  plan.confirmed = !plan.confirmed;

  if (plan.confirmed) {
    pushPlanToVerifiedEntries(plan, currentDateStr);
    playSfx('check');
    fireConfetti();
    addXP(25, 'Block Completed');
  } else {
    removePlanFromVerifiedEntries(plan, currentDateStr);
    playSfx('tap');
  }

  saveAppData();
  refreshAllViews();
}

function confirmAllPendingPlans() {
  const day = ensureDayRecord(currentDateStr);
  let confirmedCount = 0;
  day.plans.forEach(plan => {
    if (!plan.confirmed) {
      plan.confirmed = true;
      pushPlanToVerifiedEntries(plan, currentDateStr);
      confirmedCount++;
    }
  });

  if (confirmedCount > 0) {
    saveAppData();
    playSfx('quest');
    fireConfetti();
    addXP(confirmedCount * 25, 'All Plans Verified');
    refreshAllViews();
  }
}

function pushPlanToVerifiedEntries(plan, dateStr) {
  const day = ensureDayRecord(dateStr);
  const hoursSpan = Math.max(1, Math.round(plan.durationMins / 60));

  for (let offset = 0; offset < hoursSpan; offset++) {
    const rawH = plan.startHour + offset;
    if (rawH < 24) {
      day.entries[rawH] = {
        title: plan.title,
        category: plan.category,
        eisenhower: plan.eisenhower,
        isMultitask: plan.isMultitask,
        duration: 60,
        planId: plan.id
      };
    } else {
      const d = parseDateStr(dateStr);
      d.setDate(d.getDate() + 1);
      const nextDateStr = formatDateStr(d);
      const nextDay = ensureDayRecord(nextDateStr);
      const nextH = rawH - 24;
      if (nextH < 24) {
        nextDay.entries[nextH] = {
          title: plan.title,
          category: plan.category,
          eisenhower: plan.eisenhower,
          isMultitask: plan.isMultitask,
          duration: 60,
          planId: plan.id
        };
      }
    }
  }
}

function removePlanFromVerifiedEntries(plan, dateStr) {
  const day = ensureDayRecord(dateStr);
  const hoursSpan = Math.max(1, Math.round(plan.durationMins / 60));
  for (let offset = 0; offset < hoursSpan; offset++) {
    const rawH = plan.startHour + offset;
    if (rawH < 24) {
      if (day.entries[rawH]?.planId === plan.id) delete day.entries[rawH];
    } else {
      const d = parseDateStr(dateStr);
      d.setDate(d.getDate() + 1);
      const nextDateStr = formatDateStr(d);
      if (appData[nextDateStr]?.entries[rawH - 24]?.planId === plan.id) {
        delete appData[nextDateStr].entries[rawH - 24];
      }
    }
  }
}

function deletePlan(planId) {
  const day = ensureDayRecord(currentDateStr);
  const p = day.plans.find(x => x.id === planId);
  if (p) {
    if (p.confirmed) removePlanFromVerifiedEntries(p, currentDateStr);
    day.plans = day.plans.filter(x => x.id !== planId);
    saveAppData();
    refreshAllViews();
  }
}

// --- VIEW 2: TRACKER (Evening 2-Minute Audit) ---
function renderTracker() {
  const day = ensureDayRecord(currentDateStr);
  const entries = day.entries || {};
  const isHolidayOrRest = day.dayType === 'holiday' || day.dayType === 'rest';

  let focusHours = 0;
  let totalLoggedHours = 0;

  Object.values(entries).forEach(e => {
    const dur = (e.duration || 60) / 60;
    totalLoggedHours += dur;
    if (!e.isMultitask && (e.category === 'investment' || e.category === 'maintenance' || e.category === 'meeting')) {
      focusHours += dur;
    }
  });

  const goal = isHolidayOrRest ? 2.0 : 5.0;
  const pct = Math.min(100, Math.round((focusHours / goal) * 100));

  document.getElementById('trackerFocusedHoursNumber').textContent = focusHours.toFixed(1);
  const denom = document.getElementById('trackerGoalDenominatorText');
  if (denom) denom.textContent = `/ ${goal.toFixed(1)}h Goal`;
  document.getElementById('trackerPercentageText').textContent = `${pct}%`;
  document.getElementById('trackerRingArc').setAttribute('stroke-dasharray', `${pct}, 100`);

  const questSub = document.getElementById('trackerQuestRemainingText');
  if (isHolidayOrRest) {
    questSub.textContent = '🎉 Rest & Recovery Mode: Quest is relaxed for today!';
  } else if (focusHours >= goal) {
    questSub.innerHTML = '<span class="text-cyan-400 font-bold">🏆 5-Hour Focus Quest Complete! Full dopamine unlocked!</span>';
  } else {
    questSub.textContent = `Hit ${(goal - focusHours).toFixed(1)} more focused hours to unlock today's Trophy!`;
  }

  document.getElementById('statVerifiedTotalHours').textContent = `${totalLoggedHours.toFixed(1)}h logged`;

  // Pending Plans Review Banner
  const pending = (day.plans || []).filter(p => !p.confirmed);
  const banner = document.getElementById('pendingReviewBanner');
  const countText = document.getElementById('pendingReviewCountText');
  const cardsList = document.getElementById('pendingReviewCardsList');

  if (pending.length > 0) {
    banner.classList.remove('hidden');
    countText.textContent = `${pending.length} Planned Block${pending.length > 1 ? 's' : ''} to Verify`;
    cardsList.innerHTML = '';

    pending.forEach(p => {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between bg-surface-900/90 p-3 rounded-2xl border border-surface-800 text-xs';
      row.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-xl">${p.category === 'meeting' ? '👥' : p.category === 'investment' ? '📈' : p.category === 'sleep' ? '😴' : '💼'}</span>
          <div>
            <p class="font-bold text-white text-xs">${p.title}</p>
            <p class="text-xs text-slate-400 mt-0.5">${formatCustomSpan(p.startHour, p.durationMins)}</p>
          </div>
        </div>
        <button type="button" class="verify-btn btn-press px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-surface-950 font-black rounded-xl text-xs shadow transition">
          ✓ Done
        </button>
      `;
      row.querySelector('.verify-btn').addEventListener('click', () => {
        togglePlanConfirmation(p.id);
      });
      cardsList.appendChild(row);
    });
  } else {
    banner.classList.add('hidden');
  }

  renderVerifiedTimeline(entries);
}

function renderVerifiedTimeline(entries) {
  const container = document.getElementById('verifiedTimelineContainer');
  if (!container) return;
  container.innerHTML = '';
  const day = ensureDayRecord(currentDateStr);

  const startHour = 0;
  const endHour = 23;
  let foundAny = false;

  let h = startHour;
  while (h <= endHour) {
    const entry = entries[h];
    if (!entry) {
      h++;
      continue;
    }
    foundAny = true;

    let blockEnd = h;
    while (
      blockEnd + 1 <= endHour &&
      entries[blockEnd + 1] &&
      entries[blockEnd + 1].title === entry.title &&
      entries[blockEnd + 1].category === entry.category &&
      entries[blockEnd + 1].isMultitask === entry.isMultitask
    ) {
      blockEnd++;
    }

    const totalBlockHours = blockEnd - h + 1;
    const meta = CATEGORY_META[entry.category] || CATEGORY_META.maintenance;

    const card = document.createElement('div');
    card.className = 'p-3.5 rounded-3xl bg-surface-900 border shadow-sm flex items-center justify-between transition';
    card.style.borderColor = entry.isMultitask ? '#f59e0b55' : meta.border;

    const spanText = totalBlockHours > 1 
      ? formatCustomSpan(h, totalBlockHours * 60) 
      : `${formatHour12(h)} (${entry.duration || 60}m)`;

    card.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0" style="background-color: ${meta.bg}; color: ${meta.color}">
          <i data-lucide="${meta.icon}" class="w-5 h-5"></i>
        </div>
        <div>
          <span class="text-xs font-bold text-slate-400">${spanText}</span>
          <h4 class="text-xs font-black text-white leading-tight mt-0.5">${entry.title}</h4>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md" style="background-color: ${meta.bg}; color: ${meta.color}">${meta.label}</span>
            ${entry.isMultitask ? '<span class="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 rounded">⚠️ Multitask</span>' : ''}
          </div>
        </div>
      </div>
      <button type="button" class="del-verified-btn btn-press p-2.5 text-slate-500 hover:text-rose-400 rounded-xl transition" title="Delete Entry">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    `;

    const startH = h;
    const countH = totalBlockHours;
    card.querySelector('.del-verified-btn').addEventListener('click', () => {
      playSfx('tap');
      for (let i = startH; i < startH + countH; i++) {
        delete day.entries[i];
      }
      saveAppData();
      refreshAllViews();
    });

    container.appendChild(card);
    h = blockEnd + 1;
  }

  if (!foundAny) {
    container.innerHTML = `
      <div class="text-center py-12 text-slate-400 text-xs bg-surface-900/60 rounded-3xl border border-surface-800 p-8 space-y-2">
        <p class="font-bold text-white text-sm">No verified blocks logged yet today.</p>
        <p class="text-xs text-slate-400">Confirm your plans above or tap the (+) button to log directly.</p>
      </div>
    `;
  }
}

// --- VIEW 3: BEAUTIFUL GRIDS & HABITS (Protected Streaks) ---
function renderHabitGrids() {
  const container = document.getElementById('habitGridCardsContainer');
  if (!container) return;
  container.innerHTML = '';
  const day = ensureDayRecord(currentDateStr);
  const habitsConfig = appSettings.habits || DEFAULT_HABITS;

  let completedToday = 0;

  habitsConfig.forEach(cfg => {
    const rec = (day.habits || []).find(h => h.id === cfg.id);
    const isDone = rec ? rec.completed : false;
    if (isDone) completedToday++;

    const streak = calculateHabitStreak(cfg.id);

    let gridDotsHtml = '';
    const d = parseDateStr(currentDateStr);
    for (let dayOffset = 27; dayOffset >= 0; dayOffset--) {
      const checkDate = new Date(d);
      checkDate.setDate(d.getDate() - dayOffset);
      const checkKey = formatDateStr(checkDate);
      const checkDayRec = appData[checkKey];
      const isProtected = checkDayRec && (checkDayRec.dayType === 'holiday' || checkDayRec.dayType === 'rest');
      const wasDone = checkDayRec?.habits?.find(h => h.id === cfg.id)?.completed;

      let dotColor = '#1e293b';
      if (wasDone) dotColor = cfg.color;
      else if (isProtected) dotColor = '#6366f166';

      gridDotsHtml += `
        <div class="grid-dot" style="background-color: ${dotColor}" title="${checkKey}${isProtected ? ' (Holiday/Rest - Protected)' : ''}"></div>
      `;
    }

    const card = document.createElement('div');
    card.className = 'p-4 rounded-3xl bg-surface-900 border border-surface-800/80 shadow-sm space-y-3';
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0" style="background-color: ${cfg.color}22">
            ${cfg.icon}
          </div>
          <div>
            <h4 class="text-sm font-bold text-white leading-tight">${cfg.title}</h4>
            <p class="text-xs text-amber-400 font-black flex items-center gap-1 mt-1">
              <span>🔥</span> Streak: ${streak} days
            </p>
          </div>
        </div>

        <button type="button" class="habit-check-btn btn-press w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
          isDone ? 'text-surface-950 font-black shadow-glow-emerald' : 'bg-surface-850 border border-slate-700 text-slate-500 hover:border-slate-500'
        }" style="${isDone ? `background-color: ${cfg.color}` : ''}">
          <i data-lucide="check" class="w-6 h-6 stroke-[3]"></i>
        </button>
      </div>

      <div class="pt-2 border-t border-surface-800 flex items-center justify-between">
        <span class="text-[10px] font-bold text-slate-400 uppercase">28-Day Consistency Matrix</span>
        <div class="grid grid-flow-col grid-rows-4 gap-1.5">
          ${gridDotsHtml}
        </div>
      </div>
    `;

    card.querySelector('.habit-check-btn').addEventListener('click', () => {
      let r = day.habits.find(h => h.id === cfg.id);
      if (!r) {
        r = { id: cfg.id, completed: true };
        day.habits.push(r);
      } else {
        r.completed = !r.completed;
      }
      saveAppData();
      if (r.completed) {
        playSfx('check');
        fireConfetti();
        addXP(20, 'Habit Maintained');
      } else {
        playSfx('tap');
      }
      renderHabitGrids();
    });

    container.appendChild(card);
  });

  document.getElementById('habitsCompletedCounter').textContent = `${completedToday} / ${habitsConfig.length} Today`;
}

function calculateHabitStreak(habitId) {
  let streak = 0;
  const d = parseDateStr(currentDateStr);
  for (let i = 0; i < 45; i++) {
    const checkDate = new Date(d);
    checkDate.setDate(d.getDate() - i);
    const key = formatDateStr(checkDate);
    const dayData = appData[key];

    const isHolidayOrRest = dayData && (dayData.dayType === 'holiday' || dayData.dayType === 'rest');
    if (isHolidayOrRest) {
      continue;
    }

    const rec = dayData?.habits?.find(h => h.id === habitId);
    if (rec && rec.completed) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

// --- VIEW 4: STATS & EXPENSE AUDIT ---
function renderStats() {
  const day = ensureDayRecord(currentDateStr);
  const entries = day.entries || {};

  let totalMins = 0;
  let deepSingleMins = 0;
  let multitaskMins = 0;
  let leakMins = 0;
  let catMins = { meeting: 0, investment: 0, maintenance: 0, rest: 0, leak: 0, routine: 0, sleep: 0 };
  let eisMins = { q1: 0, q2: 0, q3: 0, q4: 0 };

  Object.values(entries).forEach(e => {
    const dur = e.duration || 60;
    totalMins += dur;
    const cat = e.category || 'maintenance';
    const eis = (e.eisenhower || 'q1').toLowerCase();

    if (catMins[cat] !== undefined) catMins[cat] += dur;
    if (eisMins[eis] !== undefined) eisMins[eis] += dur;

    if (e.isMultitask) multitaskMins += dur;
    else if (cat !== 'leak' && cat !== 'sleep') deepSingleMins += dur;

    if (cat === 'leak') leakMins += dur;
  });

  document.getElementById('eisenhowerQ1Val').textContent = `${(eisMins.q1 / 60).toFixed(1)}h`;
  document.getElementById('eisenhowerQ2Val').textContent = `${(eisMins.q2 / 60).toFixed(1)}h`;
  document.getElementById('eisenhowerQ3Val').textContent = `${(eisMins.q3 / 60).toFixed(1)}h`;
  document.getElementById('eisenhowerQ4Val').textContent = `${(eisMins.q4 / 60).toFixed(1)}h`;

  const waking = Math.max(1, totalMins - catMins.sleep);
  const deepPct = Math.min(100, Math.round((deepSingleMins / waking) * 100));
  const multiPct = Math.min(100, Math.round((multitaskMins / waking) * 100));
  const leakPct = Math.min(100, Math.round((leakMins / waking) * 100));

  document.getElementById('gaugeDeepFocusVal').textContent = `${(deepSingleMins / 60).toFixed(1)}h (${deepPct}%)`;
  document.getElementById('gaugeDeepFocusBar').style.width = `${deepPct}%`;

  document.getElementById('gaugeMultitaskVal').textContent = `${(multitaskMins / 60).toFixed(1)}h (${multiPct}%)`;
  document.getElementById('gaugeMultitaskBar').style.width = `${multiPct}%`;

  document.getElementById('gaugeLeakVal').textContent = `${(leakMins / 60).toFixed(1)}h (${leakPct}%)`;
  document.getElementById('gaugeLeakBar').style.width = `${leakPct}%`;

  const ctx = document.getElementById('categoryDonutChart');
  if (ctx) {
    if (donutChartInstance) donutChartInstance.destroy();
    donutChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Growth', 'Office', 'Teams Meeting', 'Rest', 'Leaks', 'Routine', 'Sleep'],
        datasets: [{
          data: totalMins === 0 ? [1] : [
            (catMins.investment / 60).toFixed(1),
            (catMins.maintenance / 60).toFixed(1),
            (catMins.meeting / 60).toFixed(1),
            (catMins.rest / 60).toFixed(1),
            (catMins.leak / 60).toFixed(1),
            (catMins.routine / 60).toFixed(1),
            (catMins.sleep / 60).toFixed(1)
          ],
          backgroundColor: totalMins === 0 ? ['#334155'] : ['#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#f43f5e', '#f59e0b', '#475569'],
          borderWidth: 2,
          borderColor: '#070b14'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10, weight: 'bold' }, color: '#94a3b8' } }
        },
        cutout: '70%'
      }
    });
  }
}

// --- POPUP MODAL ENGINE ---
function openEntryModal(startHour, durationMins = 120, mode = 'plan') {
  currentEditingHour = startHour;
  selectedDurationMins = durationMins;
  setModalMode(mode);

  document.getElementById('modalStartHourSelect').value = startHour;

  let matched = false;
  document.querySelectorAll('#modalDurBtns .dur-btn').forEach(b => {
    b.className = 'dur-btn btn-press py-2 rounded-xl bg-surface-800 text-slate-300 text-center font-bold border border-surface-750 transition';
    if (b.getAttribute('data-mins') == durationMins) {
      b.className = 'dur-btn btn-press py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-center font-black border border-emerald-500/40 transition';
      matched = true;
    }
  });

  const customRow = document.getElementById('customDurationRow');
  if (!matched) {
    const customBtn = document.querySelector('#modalDurBtns .dur-btn[data-mins="custom"]');
    if (customBtn) customBtn.className = 'dur-btn btn-press py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-center font-black border border-emerald-500/40 transition';
    customRow?.classList.remove('hidden');
    if (document.getElementById('customHoursInput')) document.getElementById('customHoursInput').value = Math.floor(durationMins / 60);
    if (document.getElementById('customMinsInput')) document.getElementById('customMinsInput').value = durationMins % 60;
  } else {
    customRow?.classList.add('hidden');
  }

  updateModalSpanSummary();

  const modal = document.getElementById('entryModal');
  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
  if (window.lucide) lucide.createIcons();
}

function closeEntryModal() {
  const modal = document.getElementById('entryModal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
  currentEditingPlanId = null;
}

function setModalMode(mode) {
  modalMode = mode;
  const planBtn = document.getElementById('modalModePlanBtn');
  const directBtn = document.getElementById('modalModeDirectBtn');
  if (mode === 'plan') {
    planBtn.className = 'btn-press py-2 text-xs font-black rounded-xl bg-surface-800 text-emerald-400 shadow transition';
    directBtn.className = 'btn-press py-2 text-xs font-black rounded-xl text-slate-400 hover:text-white transition';
    document.getElementById('modalSaveBtn').textContent = currentEditingPlanId ? 'Update Schedule Block' : 'Save to Daily Plan';
  } else {
    directBtn.className = 'btn-press py-2 text-xs font-black rounded-xl bg-surface-800 text-emerald-400 shadow transition';
    planBtn.className = 'btn-press py-2 text-xs font-black rounded-xl text-slate-400 hover:text-white transition';
    document.getElementById('modalSaveBtn').textContent = 'Log Directly into Tracker';
  }
}

function populateStartHourDropdown() {
  const sel = document.getElementById('modalStartHourSelect');
  if (!sel) return;
  sel.innerHTML = '';
  for (let i = 0; i < 24; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = formatHour12(i);
    sel.appendChild(opt);
  }
}

function updateModalSpanSummary() {
  const startHour = parseInt(document.getElementById('modalStartHourSelect').value, 10);
  const summary = formatCustomSpan(startHour, selectedDurationMins);
  document.getElementById('modalSpanSummary').textContent = summary;
}

function saveModalEntry() {
  playSfx('check');
  const day = ensureDayRecord(currentDateStr);
  const startHour = parseInt(document.getElementById('modalStartHourSelect').value, 10);
  const title = document.getElementById('modalActivityTitleInput').value.trim() || 'Scheduled Block';
  const isMulti = document.getElementById('modalMultitaskCheckbox').checked;

  let cat = 'maintenance';
  let eis = 'q1';
  const lower = title.toLowerCase();
  if (lower.includes('teams') || lower.includes('meeting') || lower.includes('sync') || lower.includes('standup') || lower.includes('call')) {
    cat = 'meeting'; eis = 'q1';
  } else if (lower.includes('youtube') || lower.includes('ai') || lower.includes('growth') || lower.includes('study')) {
    cat = 'investment'; eis = 'q2';
  } else if (lower.includes('sleep') || lower.includes('rest') || lower.includes('function')) {
    cat = lower.includes('sleep') ? 'sleep' : 'rest'; eis = 'q2';
  } else if (lower.includes('tea') || lower.includes('meal') || lower.includes('transit') || lower.includes('commute')) {
    cat = 'routine'; eis = 'q3';
  } else if (lower.includes('leak') || lower.includes('movie') || lower.includes('scroll')) {
    cat = 'leak'; eis = 'q4';
  }

  if (modalMode === 'plan') {
    if (currentEditingPlanId) {
      const p = day.plans.find(x => x.id === currentEditingPlanId);
      if (p) {
        p.startHour = startHour;
        p.durationMins = selectedDurationMins;
        p.title = title;
        p.isMultitask = isMulti;
        p.category = cat;
        p.eisenhower = eis;
        if (p.confirmed) pushPlanToVerifiedEntries(p, currentDateStr);
      }
    } else {
      day.plans.push({
        id: 'plan_' + Date.now(),
        startHour: startHour,
        durationMins: selectedDurationMins,
        title: title,
        category: cat,
        eisenhower: eis,
        isMultitask: isMulti,
        confirmed: false
      });
    }
    addXP(15, 'Plan Saved');
  } else {
    const directPlan = {
      id: 'direct_' + Date.now(),
      startHour: startHour,
      durationMins: selectedDurationMins,
      title: title,
      category: cat,
      eisenhower: eis,
      isMultitask: isMulti,
      confirmed: true
    };
    pushPlanToVerifiedEntries(directPlan, currentDateStr);
    addXP(25, 'Block Verified');
  }

  saveAppData();
  closeEntryModal();
  refreshAllViews();
}

function deleteCurrentEntry() {
  playSfx('tap');
  if (currentEditingPlanId) {
    deletePlan(currentEditingPlanId);
  }
  closeEntryModal();
  refreshAllViews();
}

// --- EXPORT & BACKUP ---
function exportCsvData() {
  let csv = 'Date,DayType,Hour,Title,Category,Quadrant,Multitask,Duration_Min\n';
  Object.keys(appData).sort().forEach(date => {
    const day = appData[date];
    const entries = day?.entries || {};
    const dType = day?.dayType || 'workday';
    Object.keys(entries).sort((a, b) => a - b).forEach(h => {
      const e = entries[h];
      csv += `${date},${dType},"${formatHour12(parseInt(h, 10))}",${e.title},${e.category},${e.eisenhower},${e.isMultitask ? 'YES' : 'NO'},${e.duration || 60}\n`;
    });
  });
  downloadFile(csv, `DayFlow_${currentDateStr}.csv`, 'text/csv');
}

function backupJsonData() {
  const payload = { version: '4.0', exportDate: new Date().toISOString(), settings: appSettings, data: appData };
  downloadFile(JSON.stringify(payload, null, 2), `DayFlow_Backup_${currentDateStr}.json`, 'application/json');
}

function importJsonData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.data) appData = { ...appData, ...parsed.data };
      if (parsed.settings) appSettings = parsed.settings;
      saveAppData();
      saveSettings();
      playSfx('check');
      alert('Data restored successfully!');
      refreshAllViews();
    } catch (err) {
      alert('Invalid backup: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
