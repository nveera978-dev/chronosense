# ChronoSense | Hourly Time & Habit Audit

> **"Treat your 24 hours with the exact same discipline you treat your financial portfolio."**

ChronoSense is a 100% free, private, offline-first Mobile Progressive Web App (PWA) designed to audit where your time actually goes every single hour.

---

## 🚀 Key Capabilities Built For You

### 1. 24-Hour Visual Time Ledger
* **Every single hour accounted for** (00:00 to 23:59).
* Quick 1-tap logging taking **under 15 seconds** per hour.
* Color-coded category system:
  * 🟢 **Investment / Growth (Q2):** High-leverage skills, YouTube Finance project, coding, portfolio research.
  * 🔵 **Day Job / Office Deliverables (Q1):** 2:00 PM - 6:00 PM office shift, 7:00 PM - 7:30 PM home shift.
  * 🟣 **Mindful Rest & Real Connect:** Genuine conversations with mother/friends, walks, real recovery.
  * 🔴 **Time Leak / Unwanted (Q4):** Mindless watching, friction-avoidance AI chats, doomscrolling.
  * 🟡 **Routine Survival:** Commute, eating, chores, hygiene.
  * ⚪ **Sleep:** Tracked against your 7-hour target.

---

### 2. True Multitasking & Split-Focus Audit
* **The Dual-Focus Flag:** If you are working from home and playing a movie or YouTube on your personal PC at the same time, you can toggle **"Simultaneous Multitasking"**.
* **Split Hour Breakdown:** Easily log 30m Deep Work + 30m Background Movie, or 45m Office + 15m Tea.
* **The Multitasking Index:** The analytics engine explicitly calculates how many hours your focus was fractured, showing you the exact hidden leak in your workday.

---

### 3. Eisenhower 2x2 Matrix & Expense Variance
* **Q1 (Urgent & Important):** Crisis, day-job deadlines.
* **Q2 (Growth & Leverage):** Career advancement, YouTube automation, family health — *The Gold Zone*.
* **Q3 (Urgent, Low Value):** Minor interruptions, transactional chores.
* **Q4 (Eliminate / Waste):** Mindless background entertainment, subconscious habits.
* **Time Budget vs. Actual:** Compare your desired hours against reality, just like a monthly expense budget.

---

### 4. Daily Discipline & Habit Streaks
* Pre-configured micro-habits designed to build real-world grit:
  1. *Zero movies or personal PC streaming during office work.*
  2. *1 uninterrupted hour on YouTube Finance project.*
  3. *1 real conversation with mother/friend without phone in hand.*
  4. *Check prices and dates with eyes/storekeeper, not AI crutch.*
  5. *Complete daily time audit before 11:30 PM.*

---

### 5. 100% Free & Private Data Ownership
* **Zero paid tools, zero monthly subscriptions.**
* All data is stored privately in your device's browser database.
* **1-Click Export to Excel (CSV):** Download your complete time ledger for spreadsheet analysis.
* **Full Backup & Restore (JSON):** Never lose your records.

---

## 📱 How to Run on Your Mobile Phone

### Method 1: Instant Local Wi-Fi (Right Now)
1. On your PC, double-click `start_tracker.bat` (or run `python start_server.py`).
2. Make sure your phone is connected to the same Wi-Fi.
3. On your phone's browser (Chrome or Safari), type:
   ```
   http://192.168.1.37:8080
   ```
4. In your phone's browser menu (the 3 dots or share button), tap **"Add to Home Screen"** or **"Install App"**.
5. ChronoSense will now appear as a **real app icon** on your phone's home screen!

---

### Method 2: 100% Free Permanent Cloud Host (GitHub Pages)
If you want to access the app anywhere on mobile data (4G/5G) without keeping your PC on:
1. Create a free GitHub repository (e.g., `time-tracker`).
2. Upload the files from this `time_audit_app` folder (`index.html`, `app.js`, `manifest.json`, `sw.js`, `icon.svg`).
3. In your GitHub repo, go to **Settings -> Pages -> Source: Deploy from branch `main`**.
4. GitHub will give you a free permanent link (e.g., `https://yourusername.github.io/time-tracker/`).
5. Open that link on your phone and tap **"Add to Home Screen"**. It is free forever with zero maintenance.
